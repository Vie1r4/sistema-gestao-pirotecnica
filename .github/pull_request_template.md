## Objetivo

Descreva em 2-4 linhas o problema e o resultado esperado desta PR.

## Alterações principais

- 
- 
- 

## Checklist de qualidade

### Funcional

- [ ] Fluxo principal testado manualmente de ponta a ponta
- [ ] Estados de erro/empty/loading validados
- [ ] Não introduz regressão visível noutras páginas relacionadas

### API e arquitetura

- [ ] Frontend usa API do backend como fonte de verdade (sem localStorage de dados de negócio)
- [ ] Não há duplicação de endpoint repetido; se repetido, foi extraído para `app/lib/*Api.ts`
- [ ] Contrato de API mantido/alinhado (ou documentação atualizada se mudou)

### Permissões e segurança

- [ ] Permissões/roles revistas (`Admin`, `Gestor`, etc.) e comportamento de acesso validado
- [ ] Sem segredos/credenciais em ficheiros commitados

### Código e qualidade técnica

- [ ] Mudança pequena e coesa por ficheiro (sem mistura de responsabilidades)
- [ ] Sem warnings/lints novos relevantes
- [ ] Nomes de funções/ficheiros claros e consistentes

### Testes

- [ ] `npm run typecheck` passou
- [ ] `npm run lint` passou
- [ ] `npm run test` passou
- [ ] Foram adicionados/atualizados testes para o comportamento alterado

### Documentação

- [ ] README(s)/Docs afetados foram atualizados no mesmo trabalho
- [ ] Links novos de documentação funcionam

## Evidência de validação

Cole aqui os resultados dos comandos e/ou notas de teste manual.

```bash
npm run typecheck
npm run lint
npm run test
```

## Impacto e risco

- Risco esperado: baixo / médio / alto
- Rollback simples: sim / não
- Notas adicionais de impacto:

## Capturas (opcional)

Se houver alteração visual, adicione imagens/gifs.
