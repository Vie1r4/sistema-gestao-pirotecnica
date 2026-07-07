import { describe, expect, it } from "vitest";
import { parseClientesCsvText, CLIENTE_CSV_TEMPLATE } from "@/app/lib/clienteCsvImport";

describe("clienteCsvImport", () => {
  it("parseia modelo CSV simples com duas linhas de dados", () => {
    const { rows, erro } = parseClientesCsvText(CLIENTE_CSV_TEMPLATE);
    expect(erro).toBeUndefined();
    expect(rows).toHaveLength(2);
    expect(rows[0].nome).toBe("Empresa XYZ Lda");
    expect(rows[0].nif).toBe("123456789");
  });

  it("parseia exportação ERP com cabeçalho extenso", () => {
    const erp = `"CÓDIGO","NOME","NOME COMERCIAL","MORADA","CÓD. POSTAL","LOCALIDADE","PAÍS","NIF","INACTIVO?","RGPD?","TELEFONES","RECUSA SMS?","EMAIL"
"25","FREGUESIA DE LOMAR E ARCOS","","RUA DR. TESTE - BAIRRO","4890-613","BRAGA","PT","512346364","Não","","912345678","","contacto@teste.pt"
"26","INACTIVO SA","COMERCIAL","","","","","987654321","Sim","","","",""
`;
    const { rows, erro } = parseClientesCsvText(erp);
    expect(erro).toBeUndefined();
    expect(rows).toHaveLength(1);
    expect(rows[0].nome).toBe("FREGUESIA DE LOMAR E ARCOS");
    expect(rows[0].nif).toBe("512346364");
    expect(rows[0].codigoPostal).toBe("4890-613");
    expect(rows[0].telefone).toBe("912345678");
  });

  it("suporta morada multilinha entre aspas", () => {
    const csv = `"NOME","MORADA","NIF"
"Cliente X","Rua A
Linha 2",123456789`;
    const { rows, erro } = parseClientesCsvText(csv);
    expect(erro).toBeUndefined();
    expect(rows[0].morada).toContain("Rua A");
    expect(rows[0].morada).toContain("Linha 2");
  });

  it("deteta cabeçalho mesmo com linhas anteriores inválidas", () => {
    const csv = `"lixo","dados"
"CÓDIGO","NOME","NIF"
"1","Teste Lda","111222333"`;
    const { rows, erro } = parseClientesCsvText(csv);
    expect(erro).toBeUndefined();
    expect(rows[0].nome).toBe("Teste Lda");
  });

  it("parseia exportação ERP com separador ; e decimais 0,00", () => {
    const erp = `"CÓDIGO";"NOME";"NIF";"INACTIVO?";"DESCONTO %"
"1";"Empresa Teste Lda";"123456789";"Não";"0,00"
"2";"Inactivo SA";"987654321";"Sim";"0,00"`;
    const { rows, erro } = parseClientesCsvText(erp);
    expect(erro).toBeUndefined();
    expect(rows).toHaveLength(1);
    expect(rows[0].nome).toBe("Empresa Teste Lda");
  });

  it("ignora linha parcial antes do cabeçalho ERP (exportação real)", () => {
    const csv = `"25","FREGUESIA DE LOMAR E ARCOS","","RUA DR. JXXXXX - XXXXX - ANGOLA

"CÓDIGO","NOME","NOME COMERCIAL","MORADA","CÓD. POSTAL","LOCALIDADE","PAÍS","NIF","INACTIVO?","RGPD?","TELEFONES","RECUSA SMS?","EMAIL","RECUSA EMAIL?","CONTACTO","WEB","DESCONTO %","RETENÇÃO %","COND. PAGAMENTO","NOME da CONDIÇÃO de PAGAMENTO","FORMA PAGAMENTO","NOME da FORMA de PAGAMENTO","PREÇO VENDA","VENDEDOR","NOME do VENDEDOR","MOEDA","DATA do PRIMEIRO","DATA do ÚLTIMO"
"25","FREGUESIA DE LOMAR E ARCOS","","RUA DR. TESTE - BAIRRO","4890-613","ANGOLA","PT","512346364","Não","0","","Não","","Não","","","0,00","0,00","1","PRONTO PAGAMENTO","8","CHEQUE","Preço de Venda 1","","","EUR","2013-01-20 11:21:28","2020-01-20 11:21:28"`;
    const { rows, erro } = parseClientesCsvText(csv);
    expect(erro).toBeUndefined();
    expect(rows).toHaveLength(1);
    expect(rows[0].nome).toBe("FREGUESIA DE LOMAR E ARCOS");
    expect(rows[0].nif).toBe("512346364");
    expect(rows[0].localidade).toBe("ANGOLA");
    expect(rows[0].codigoPostal).toBe("4890-613");
  });
});
