# Observabilidade HTTP: correlation id e latência

**Última revisão:** maio de 2026.

## O que está implementado

1. **`RequestDiagnosticsMiddleware`** (`Middleware/RequestDiagnosticsMiddleware.cs`)
   - Lê o header **`X-Correlation-Id`** se existir e for seguro (ASCII alfanumérico, `-`, `_`, até 128 caracteres); caso contrário gera um GUID sem hífens.
   - Guarda o valor em **`HttpContext.Items["CorrelationId"]`** e repete-o na **resposta** no mesmo header.
   - Abre um **scope** de logging com `CorrelationId` e `TraceId` (`HttpContext.TraceIdentifier`) para que qualquer `ILogger` no mesmo pedido inclua estes campos (com **`IncludeScopes: true`** no console).
   - No fim do pedido regista um log **estruturado**:
     - Sucesso: `LogInformation` com `HttpMethod`, `RequestPath`, `StatusCode`, `ElapsedMilliseconds`.
     - Exceção não tratada (fora do bloco que devolve JSON para `/api/*`): `LogError` com a mesma latência.
   - **Ignora** pedidos `OPTIONS` (preflight CORS) para reduzir ruído.

2. **Respostas 500 em `/api/*`**
   - O corpo JSON inclui **`correlationId`** (quando o middleware já correu), para suporte e cruzamento com logs.
   - No **`finally`** desse middleware (`Program.cs`, logger `Finalproj.Http.ApiErrorHandling`): **`LogError`** se a 500 veio de uma exceção tratada aqui; **`LogWarning`** se o status 500 foi definido sem exceção propagada (ex.: ação devolve 500), para o nível refletir a gravidade nos agregadores.

3. **CORS**
   - **`Access-Control-Expose-Headers: X-Correlation-Id`** para o browser poder ler o header na resposta (JavaScript).

4. **Logging no console**
   - **`appsettings.json`**: formatter **`json`** + `IncludeScopes` (adequado a agregadores / produção).
   - **`appsettings.Development.json`**: formatter **`simple`** + `IncludeScopes` (leitura humana).

## Uso no código

```csharp
var id = HttpContext.GetCorrelationId(); // extensão em Middleware/HttpContextCorrelationExtensions.cs
```

## Cliente (Next.js)

- Opcional: enviar **`X-Correlation-Id`** no pedido (ex.: `crypto.randomUUID()`); o servidor aceita ou substitui se inválido.
- Após `fetch`, ler `response.headers.get("X-Correlation-Id")` para mostrar ao utilizador ou anexar a relatórios de erro.
- Constante sugerida: `API_CORRELATION_ID_HEADER` em `apps/web/app/lib/apiConfig.ts`.

## Evoluções possíveis

- OpenTelemetry (traces + métricas de histograma por rota).
- Reduzir nível do log de pedidos com sucesso para **Debug** em ambientes muito ruidosos.
- Filtros por caminho (ex.: não logar ficheiros estáticos) — hoje só se ignoram alguns prefixos internos e `OPTIONS`.
