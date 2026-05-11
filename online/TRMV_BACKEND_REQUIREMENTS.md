# Endpoints necessarios para TRMV

## GET /credits?email=X
- Retornar campo adicional: `trmvCredits` (number)
- Exemplo de resposta: `{ credits: 5, baeCredits: 3, trmvCredits: 10 }`

## POST /use-credit
- Body: `{ email, tipo: 'trmv' }`
- Debita 1 credito TRMV do usuario
- Retorna: `{ sessionId, credits: trmvCreditsRestantes }`
- Se nao tiver creditos: `{ error: 'Sem creditos TRMV' }`

## POST /save-result
- Body: `{ sessionId, email, tipo: 'trmv', data: {...resultados...} }`
- Estrutura do campo `data` quando o teste e concluido:
```json
{
  "formData": {
    "sessionId": "trmv-xxx",
    "patientName": "Nome",
    "birthDate": "2000-01-01",
    "cpf": "XXX.XXX.XXX-XX",
    "sex": "Masculino",
    "laterality": "Destro",
    "education": "Superior Completo",
    "evaluator": "Avaliador",
    "crp": "XX/XXXXX-X",
    "email": "user@email.com"
  },
  "status": "completo",
  "date": "2025-01-01T12:00:00.000Z",
  "numEstimulos": 10,
  "reconhecimento1": {
    "acertos": 8,
    "alarmesFalsos": 1,
    "omissoes": 2,
    "tempoResposta": 15000
  },
  "reconhecimento2": {
    "acertos": 7,
    "alarmesFalsos": 0,
    "omissoes": 3,
    "tempoResposta": 12000
  },
  "indiceRetencao": 87.5
}
```

## GET /get-results?email=X&tipo=trmv
- Retorna resultados TRMV do usuario
- Resposta: `{ results: [{ sessionId, data: {...} }, ...] }`

## POST /delete-result
- Body: `{ sessionId, email }`
- Ja existe, funciona para qualquer tipo (tecfe, bae, trmv)

## POST /create-payment
- Body: `{ email, quantidade, tipo: 'trmv' }`
- Precos TRMV:
  - 1 aplicacao = R$5
  - 10 aplicacoes = R$40 (R$4 cada)
  - 50 aplicacoes = R$150 (R$3 cada)
- Retorna: `{ url: 'https://...' }` (link de pagamento)

## Notas de implementacao

- O campo `tipo: 'trmv'` diferencia os creditos e resultados TRMV dos demais (tecfe, bae)
- O admin `setmonte@gmail.com` nao consome creditos (gera sessionId localmente)
- O DynamoDB precisa de um campo `trmvCredits` na tabela de usuarios
- O webhook de pagamento (Stripe/MercadoPago) deve incrementar `trmvCredits` quando `tipo === 'trmv'`
