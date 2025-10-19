# 🔌 APIS E ENDPOINTS - FINANÇAS UP

---

## 📋 ÍNDICE DE APIS

### Autenticação
- POST `/api/auth/[...nextauth]` - NextAuth endpoints
- POST `/api/usuarios/cadastro` - Cadastrar usuário

### Usuário
- GET/PUT `/api/usuario/perfil` - Perfil
- PUT `/api/usuario/senha` - Alterar senha
- GET/PUT `/api/usuario/preferencias` - Preferências

### Contas Bancárias
- GET/POST `/api/contas` - Listar/Criar
- GET/PUT/DELETE `/api/contas/[id]` - Obter/Atualizar/Excluir

### Cartões de Crédito
- GET/POST `/api/cartoes` - Listar/Criar
- GET/PUT/DELETE `/api/cartoes/[id]` - Obter/Atualizar/Excluir
- GET `/api/cartoes/[id]/fatura-atual` - Fatura atual

### Transações
- GET/POST `/api/transacoes` - Listar/Criar
- GET/PUT/DELETE `/api/transacoes/[id]` - Obter/Atualizar/Excluir

### Categorias
- GET/POST `/api/categorias` - Listar/Criar
- GET/PUT/DELETE `/api/categorias/[id]` - Obter/Atualizar/Excluir

### Empréstimos
- GET/POST `/api/emprestimos` - Listar/Criar
- GET/PUT/DELETE `/api/emprestimos/[id]` - Obter/Atualizar/Excluir
- POST `/api/emprestimos/[id]/pagar` - Pagar parcela

### Investimentos
- GET/POST `/api/investimentos` - Listar/Criar
- GET/PUT/DELETE `/api/investimentos/[id]` - Obter/Atualizar/Excluir

### Orçamentos
- GET/POST `/api/orcamentos` - Listar/Criar
- GET/PUT/DELETE `/api/orcamentos/[id]` - Obter/Atualizar/Excluir

### Metas
- GET/POST `/api/metas` - Listar/Criar
- GET/PUT/DELETE `/api/metas/[id]` - Obter/Atualizar/Excluir
- POST `/api/metas/[id]/adicionar` - Adicionar aporte

### Relatórios
- GET `/api/relatorios` - Relatórios básicos
- GET `/api/relatorios-avancados/comparacao` - Comparação mensal
- GET `/api/relatorios-avancados/insights` - Insights automáticos
- GET `/api/relatorios-avancados/previsoes` - Previsões

### Conciliação
- GET/POST `/api/conciliacao` - Listar/Importar
- POST `/api/conciliacao/importar` - Importar extrato

### Compartilhamento
- GET/POST `/api/compartilhamento` - Listar/Criar
- POST `/api/compartilhamento/aceitar` - Aceitar convite

### Notificações
- GET `/api/notificacoes` - Listar
- PUT `/api/notificacoes/[id]` - Marcar como lida
- PUT `/api/notificacoes/marcar-todas` - Marcar todas

### Backup
- POST `/api/backup` - Fazer backup
- POST `/api/usuario/exportar` - Exportar dados
- POST `/api/usuario/importar` - Importar dados

---

## 📝 EXEMPLOS DE USO

### Cadastrar Usuário

```http
POST /api/usuarios/cadastro
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "id": "user-id",
  "nome": "João Silva",
  "email": "joao@email.com"
}
```

### Criar Conta Bancária

```http
POST /api/contas
Content-Type: application/json
Authorization: Bearer {token}

{
  "nome": "Nubank",
  "instituicao": "Nu Pagamentos",
  "tipo": "CORRENTE",
  "saldoInicial": 1000.00
}
```

**Resposta:**
```json
{
  "id": "conta-id",
  "nome": "Nubank",
  "saldoAtual": 1000.00
}
```

### Criar Transação

```http
POST /api/transacoes
Content-Type: application/json
Authorization: Bearer {token}

{
  "descricao": "Salário",
  "valor": 5000.00,
  "tipo": "RECEITA",
  "categoriaId": "cat-id",
  "contaId": "conta-id",
  "dataCompetencia": "2025-01-19"
}
```

### Listar Transações

```http
GET /api/transacoes?mes=1&ano=2025
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "trans-id",
    "descricao": "Salário",
    "valor": 5000.00,
    "tipo": "RECEITA",
    "categoria": {
      "nome": "Salário"
    },
    "conta": {
      "nome": "Nubank"
    }
  }
]
```

---

## 🔐 AUTENTICAÇÃO

### Headers

```http
Authorization: Bearer {jwt-token}
```

### Erros

- **401:** Não autorizado
- **403:** Sem permissão
- **404:** Não encontrado
- **500:** Erro interno

---

## 📊 FILTROS E PAGINAÇÃO

### Query Parameters

```http
GET /api/transacoes?
  mes=1&
  ano=2025&
  tipo=DESPESA&
  categoriaId=cat-id&
  page=1&
  limit=20
```

---

**🔌 APIs Documentadas!**
