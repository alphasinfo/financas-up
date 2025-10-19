# 📡 API Reference - Finanças UP

Documentação completa de todas as APIs do sistema.

## 🔐 Autenticação

Todas as APIs (exceto `/api/auth/*` e `/api/usuarios/cadastro`) requerem autenticação via NextAuth.

```typescript
// Headers necessários
{
  "Cookie": "next-auth.session-token=..."
}
```

---

## 📊 Endpoints

### **Autenticação**

#### `POST /api/auth/signin`
Login de usuário

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

#### `POST /api/usuarios/cadastro`
Cadastro de novo usuário

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

---

### **Transações**

#### `GET /api/transacoes`
Listar transações

**Query Params:**
- `page` (number): Página (default: 1)
- `limit` (number): Itens por página (default: 20)
- `tipo` (string): RECEITA | DESPESA
- `status` (string): PENDENTE | PAGO | RECEBIDO
- `dataInicio` (string): Data início (ISO)
- `dataFim` (string): Data fim (ISO)

**Response:**
```json
{
  "transacoes": [...],
  "total": 100,
  "pagina": 1,
  "totalPaginas": 5
}
```

#### `POST /api/transacoes`
Criar transação

**Body:**
```json
{
  "descricao": "Salário",
  "valor": 5000,
  "tipo": "RECEITA",
  "categoriaId": "cat-123",
  "contaBancariaId": "conta-456",
  "dataCompetencia": "2025-01-15"
}
```

#### `PUT /api/transacoes/[id]`
Atualizar transação

#### `DELETE /api/transacoes/[id]`
Deletar transação

---

### **Cartões de Crédito**

#### `GET /api/cartoes`
Listar cartões

#### `POST /api/cartoes`
Criar cartão

**Body:**
```json
{
  "nome": "Nubank",
  "bandeira": "Mastercard",
  "limite": 5000,
  "diaFechamento": 10,
  "diaVencimento": 17
}
```

#### `GET /api/cartoes/[id]/fatura-atual`
Obter fatura atual do cartão

---

### **Contas Bancárias**

#### `GET /api/contas`
Listar contas

#### `POST /api/contas`
Criar conta

**Body:**
```json
{
  "nome": "Nubank",
  "tipo": "CORRENTE",
  "saldoInicial": 1000,
  "banco": "Nubank",
  "agencia": "0001",
  "conta": "12345-6"
}
```

---

### **Categorias**

#### `GET /api/categorias`
Listar categorias

#### `POST /api/categorias`
Criar categoria

**Body:**
```json
{
  "nome": "Alimentação",
  "tipo": "DESPESA",
  "cor": "#FF5733",
  "icone": "🍔"
}
```

---

### **Metas**

#### `GET /api/metas`
Listar metas

#### `POST /api/metas`
Criar meta

**Body:**
```json
{
  "nome": "Viagem",
  "valorAlvo": 10000,
  "dataAlvo": "2025-12-31"
}
```

#### `POST /api/metas/[id]/adicionar`
Adicionar valor à meta

**Body:**
```json
{
  "valor": 500
}
```

---

### **Orçamentos**

#### `GET /api/orcamentos`
Listar orçamentos

#### `POST /api/orcamentos`
Criar orçamento

**Body:**
```json
{
  "categoriaId": "cat-123",
  "valor": 1000,
  "mes": 1,
  "ano": 2025
}
```

---

### **Relatórios**

#### `GET /api/relatorios`
Obter relatórios

**Query Params:**
- `tipo`: resumo | categoria | evolucao
- `dataInicio`: Data início
- `dataFim`: Data fim

---

### **Relatórios Avançados** 🆕

#### `GET /api/relatorios-avancados`
Relatórios avançados

**Query Params:**
- `tipo`: comparacao | previsoes | insights | patrimonial
- `meses`: Número de meses (para comparação/previsões)

**Response (comparacao):**
```json
{
  "comparacoes": [
    {
      "mes": "2025-01",
      "receitas": 5000,
      "despesas": 3000,
      "saldo": 2000,
      "variacao": 15.5
    }
  ]
}
```

---

### **Backup** 🆕

#### `GET /api/backup`
Listar backups

#### `POST /api/backup`
Criar backup

**Response:**
```json
{
  "backup": {
    "id": "backup-123",
    "data": "2025-01-19T00:00:00Z",
    "tamanho": 1024000,
    "transacoes": 150,
    "categorias": 20
  }
}
```

---

### **Notificações Push** 🆕

#### `GET /api/notificacoes-push`
Obter notificações pendentes

#### `POST /api/notificacoes-push`
Enviar notificação

**Body:**
```json
{
  "titulo": "Conta a vencer",
  "mensagem": "Fatura do cartão vence amanhã",
  "tipo": "alerta"
}
```

---

### **Multi-moeda** 🆕

#### `GET /api/multi-moeda`
Operações multi-moeda

**Query Params:**
- `acao`: cotacao | converter | listar
- `de`: Moeda origem (para conversão)
- `para`: Moeda destino (para conversão)
- `valor`: Valor a converter

**Response (cotacao):**
```json
{
  "de": "USD",
  "para": "BRL",
  "taxa": 5.25,
  "data": "2025-01-19T00:00:00Z"
}
```

---

### **Sincronização Offline** 🆕

#### `GET /api/sync`
Obter dados para sincronização

#### `POST /api/sync`
Enviar dados offline

**Body:**
```json
{
  "dados": [
    {
      "tipo": "transacao",
      "acao": "criar",
      "dados": {...},
      "timestamp": 1234567890
    }
  ]
}
```

---

### **Integração Bancária** 🆕

#### `POST /api/integracao-bancaria`
Importar extrato bancário

**Body:**
```json
{
  "conteudo": "...",
  "formato": "ofx" | "csv",
  "contaId": "conta-123",
  "autoImportar": true
}
```

**Response:**
```json
{
  "resultado": {
    "total": 50,
    "conciliadas": 30,
    "naoEncontradas": 15,
    "duplicadas": 5
  },
  "importados": 15
}
```

---

### **Orçamento Familiar** 🆕

#### `GET /api/orcamento-familiar`
Obter orçamento familiar

**Query Params:**
- `acao`: relatorio | mensagens
- `orcamentoId`: ID do orçamento
- `membros`: IDs dos membros (separados por vírgula)

#### `POST /api/orcamento-familiar`
Criar orçamento ou enviar mensagem

**Body (criar-orcamento):**
```json
{
  "acao": "criar-orcamento",
  "nome": "Família Silva",
  "orcamentoTotal": 10000
}
```

**Body (adicionar-membro):**
```json
{
  "acao": "adicionar-membro",
  "orcamentoId": "orc-123",
  "email": "membro@email.com",
  "papel": "editor"
}
```

**Body (enviar-mensagem):**
```json
{
  "acao": "enviar-mensagem",
  "destinatarioId": "user-456",
  "mensagem": "Olá!"
}
```

---

## 🔒 Rate Limiting

| Tipo de Rota | Limite |
|--------------|--------|
| `/api/auth/*` | Sem limite (NextAuth gerencia) |
| `/api/usuarios/cadastro` | 3 req/hora |
| APIs de escrita (POST/PUT/DELETE) | 30 req/min |
| APIs de leitura (GET) | 100 req/min |
| Rotas públicas | 10 req/15min |

**Headers de Rate Limit:**
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1234567890
```

---

## ❌ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 429 | Muitas requisições |
| 500 | Erro interno |

**Formato de Erro:**
```json
{
  "erro": "Mensagem de erro",
  "codigo": "ERRO_CODIGO",
  "detalhes": {...}
}
```

---

## 📝 Exemplos

### **Criar Transação Completa**

```typescript
const response = await fetch('/api/transacoes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    descricao: 'Supermercado',
    valor: 250.50,
    tipo: 'DESPESA',
    categoriaId: 'cat-alimentacao',
    contaBancariaId: 'conta-nubank',
    dataCompetencia: '2025-01-19',
    observacoes: 'Compras do mês',
    anexos: ['comprovante.pdf']
  })
});

const data = await response.json();
```

### **Obter Relatório Mensal**

```typescript
const response = await fetch(
  '/api/relatorios?tipo=resumo&dataInicio=2025-01-01&dataFim=2025-01-31'
);
const relatorio = await response.json();
```

### **Importar Extrato Bancário**

```typescript
const response = await fetch('/api/integracao-bancaria', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    conteudo: conteudoOFX,
    formato: 'ofx',
    contaId: 'conta-123',
    autoImportar: true
  })
});

const resultado = await response.json();
```

---

## 🔗 Links Úteis

- [Documentação Principal](./README.md)
- [Guia do Desenvolvedor](./GUIA-DESENVOLVEDOR.md)
- [Testes](./TESTES.md)

---

**Última atualização:** 19/01/2025
