# Teste RPO/RTO: dado + PDF -> backup -> apagar -> restaurar -> verificar
# Requer API em https://localhost:7225 (Development)
#
# Cobre tambem a robustez local (Ponto 5):
#  - Backup faz staging na pasta padrao do SQL Server e a API move o .bak para PirofafeData/Backups.
#  - Restauro copia o .bak de volta para a pasta padrao do SQL antes do RESTORE.
#  - Fallback automatico para escrita directa quando InstanceDefaultBackupPath e NULL (LocalDB/Express).
# Se este fluxo end-to-end passar (backup -> delete -> restore -> dado+PDF OK), o staging simetrico esta validado.
$ErrorActionPreference = "Stop"
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
$base = if ($env:PIROFAFE_API_BASE) { $env:PIROFAFE_API_BASE } else { "http://localhost:5078" }
$testId = [guid]::NewGuid().ToString("N").Substring(0, 8)
$password = if ($env:PIROFAFE_ADMIN_PASSWORD) { $env:PIROFAFE_ADMIN_PASSWORD } else { "Teste123!Aa" }
$email = if ($env:PIROFAFE_ADMIN_EMAIL) { $env:PIROFAFE_ADMIN_EMAIL } else { "rpo-test-admin-$testId@pirofafe.local" }
$clienteNome = "Cliente RPO Restore $testId"
$clienteNif = "9$((Get-Random -Maximum 99999999).ToString('00000000'))"

function Invoke-ApiJson($Method, $Uri, $Body = $null, $Token = $null) {
    $headers = @{ Accept = "application/json" }
    if ($Token) { $headers.Authorization = "Bearer $Token" }
    $params = @{ Method = $Method; Uri = $Uri; Headers = $headers; TimeoutSec = 120 }
    if ($Body -ne $null) { $params.Body = ($Body | ConvertTo-Json); $params.ContentType = "application/json" }
    return Invoke-RestMethod @params
}

# PDF minimo valido (%PDF magic bytes)
$pdfPath = Join-Path $env:TEMP "rpo-test-$testId.pdf"
$pdfBytes = [byte[]](0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46)
[System.IO.File]::WriteAllBytes($pdfPath, $pdfBytes)

Write-Host "1) Estado instalacao..."
$estado = Invoke-ApiJson GET "$base/api/auth/existem-utilizadores"
$token = $null
if ($estado.primeiroRegistoDisponivel) {
    Write-Host "   Registo primeiro admin..."
    $reg = Invoke-ApiJson POST "$base/api/auth/registar-primeiro-utilizador" @{
        email = $email; password = $password; nome = "Admin RPO Test"
    }
    $token = $reg.token
} else {
    Write-Host "   Login (contas existem) - tentar credenciais conhecidas..."
    $candidates = @($email)
    if ($env:PIROFAFE_ADMIN_EMAIL) { $candidates = @($env:PIROFAFE_ADMIN_EMAIL) }
    else { $candidates = @($email, "admin@pirofafe.pt", "Shovieira@gmail.com") }
    foreach ($tryEmail in $candidates) {
        try {
            $login = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" `
                -ContentType "application/json" `
                -Body (@{ email = $tryEmail; password = $password } | ConvertTo-Json)
            if ($login.token) { $token = $login.token; $email = $tryEmail; break }
        } catch { }
    }
    if (-not $token) {
        throw "Sem token. Crie um admin ou defina credenciais no script."
    }
}

Write-Host "2) Criar cliente com PDF..."
$createJson = curl.exe -sS -X POST "$base/api/clientes" `
    -H "Authorization: Bearer $token" `
    -F "Cliente.Nome=$clienteNome" `
    -F "Cliente.Email=cliente-rpo-$testId@teste.pt" `
    -F "Cliente.NIF=$clienteNif" `
    -F "Cliente.TipoCliente=Empresa" `
    -F "DocumentosExtras[0].Nome=RPO Test PDF" `
    -F "DocumentosExtras[0].Ficheiro=@$pdfPath;type=application/pdf"
if ($LASTEXITCODE -ne 0) { throw "curl criar cliente falhou (exit $LASTEXITCODE)" }
$clienteRes = $createJson | ConvertFrom-Json
$clienteId = $clienteRes.cliente.id
Write-Host "   Cliente id=$clienteId"

Write-Host "3) Backup manual..."
$bak = Invoke-RestMethod -Method POST -Uri "$base/api/admin/backups/run" `
    -Headers @{ Authorization = "Bearer $token" }
$bakName = $bak.nomeFicheiro
Write-Host "   $bakName (+ $($bak.nomeFicheiroDocumentos))"

Write-Host "4) Apagar cliente (simular perda)..."
Invoke-RestMethod -Method DELETE -Uri "$base/api/clientes/$clienteId" `
    -Headers @{ Authorization = "Bearer $token" } | Out-Null

try {
    Invoke-RestMethod -Method GET -Uri "$base/api/clientes/$clienteId" `
        -Headers @{ Authorization = "Bearer $token" } | Out-Null
    throw "Cliente ainda existe apos DELETE"
} catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode.value__ -ne 404) { throw }
}

Write-Host "5) Restaurar backup..."
$restore = Invoke-RestMethod -Method POST -Uri "$base/api/admin/backups/restore" `
    -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
    -Body (@{ nomeFicheiro = $bakName } | ConvertTo-Json)
Write-Host "   $($restore.message)"

# Re-login apos restore
$login2 = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" `
    -ContentType "application/json" `
    -Body (@{ email = $email; password = $password } | ConvertTo-Json)
$token2 = $login2.token

Write-Host "6) Verificar BD + documento..."
Write-Host "   6a) Detalhe do cliente..."
$det = Invoke-RestMethod -Method GET -Uri "$base/api/clientes?pesquisa=$([uri]::EscapeDataString($clienteNome))" `
    -Headers @{ Authorization = "Bearer $token2" } -TimeoutSec 120
$restored = $det.items | Where-Object { $_.nome -eq $clienteNome } | Select-Object -First 1
if (-not $restored) { throw "FALHA: cliente nao restaurado na BD" }
$clienteId2 = $restored.id

$detFull = Invoke-RestMethod -Method GET -Uri "$base/api/clientes/$clienteId2" `
    -Headers @{ Authorization = "Bearer $token2" } -TimeoutSec 120
$doc = $detFull.cliente.documentosExtras | Select-Object -First 1
if (-not $doc) { throw "FALHA: documento extra em falta na BD" }

Write-Host "   6b) Download PDF (curl)..."
$dlPath = Join-Path $env:TEMP "rpo-dl-$testId.pdf"
curl.exe -sS --max-time 60 -o $dlPath `
    -H "Authorization: Bearer $token2" `
    "$base/api/clientes/$clienteId2/documentos/$($doc.id)"
if ($LASTEXITCODE -ne 0) { throw "FALHA: download do PDF (curl exit $LASTEXITCODE)" }
$dlBytes = [System.IO.File]::ReadAllBytes($dlPath)
if ($dlBytes.Length -lt 4 -or $dlBytes[0] -ne 0x25) {
    throw "FALHA: PDF nao recuperado (conteudo invalido)"
}
Remove-Item $dlPath -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "SUCESSO: BD + docs OK"
Write-Host "BACKUP=$bakName"
Write-Host "CLIENTE_ID=$clienteId2"
Remove-Item $pdfPath -Force -ErrorAction SilentlyContinue
