# 📖 MODO DE USO - FINANÇAS UP

---

## 🎯 PRIMEIROS PASSOS

### 1. Criar Conta

1. Acesse http://localhost:3000
2. Clique em **"Cadastrar"**
3. Preencha:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
4. Clique em **"Criar conta"**

### 2. Fazer Login

1. Acesse http://localhost:3000/login
2. Digite email e senha
3. Clique em **"Entrar"**

### 3. Acessar Dashboard

Após login, você será redirecionado para `/dashboard`

---

## 💳 CONTAS BANCÁRIAS

### Criar Conta

1. **Dashboard** → **Contas** → **Nova Conta**
2. Preencha:
   - Nome (ex: "Nubank")
   - Instituição (ex: "Nu Pagamentos")
   - Tipo (Corrente, Poupança, Carteira)
   - Saldo inicial
   - Cor (opcional)
3. Clique em **"Salvar"**

### Editar Conta

1. **Contas** → Clique na conta
2. Clique em **"Editar"**
3. Altere os dados
4. Clique em **"Salvar"**

### Desativar Conta

1. **Contas** → Clique na conta
2. Clique em **"Desativar"**

---

## 💳 CARTÕES DE CRÉDITO

### Criar Cartão

1. **Dashboard** → **Cartões** → **Novo Cartão**
2. Preencha:
   - Nome (ex: "Nubank Mastercard")
   - Bandeira (Visa, Mastercard, etc.)
   - Limite de crédito
   - Dia de fechamento (1-31)
   - Dia de vencimento (1-31)
3. Clique em **"Salvar"**

### Ver Fatura

1. **Cartões** → Clique no cartão
2. Veja fatura atual e histórico

### Pagar Fatura

1. **Cartões** → Clique no cartão
2. Clique em **"Pagar Fatura"**
3. Selecione conta de origem
4. Clique em **"Confirmar"**

---

## 💰 TRANSAÇÕES

### Criar Receita

1. **Dashboard** → **Financeiro** → **Nova Receita**
2. Preencha:
   - Descrição
   - Valor
   - Categoria
   - Conta de destino
   - Data
3. Clique em **"Salvar"**

### Criar Despesa

1. **Dashboard** → **Financeiro** → **Nova Despesa**
2. Preencha:
   - Descrição
   - Valor
   - Categoria
   - Conta/Cartão
   - Data
   - Parcelamento (opcional)
3. Clique em **"Salvar"**

### Editar Transação

1. **Financeiro** → Clique na transação
2. Clique em **"Editar"**
3. Altere os dados
4. Clique em **"Salvar"**

### Excluir Transação

1. **Financeiro** → Clique na transação
2. Clique em **"Excluir"**
3. Confirme

---

## 📊 CATEGORIAS

### Categorias Padrão

- **Receitas:** Salário, Freelance, Investimentos
- **Despesas:** Alimentação, Transporte, Moradia, Saúde, Lazer

### Criar Categoria

1. **Configurações** → **Categorias** → **Nova**
2. Preencha:
   - Nome
   - Tipo (Receita/Despesa)
   - Ícone
   - Cor
3. Clique em **"Salvar"**

---

## 📈 ORÇAMENTOS

### Criar Orçamento

1. **Dashboard** → **Orçamentos** → **Novo**
2. Preencha:
   - Categoria
   - Valor planejado
   - Mês/Ano
3. Clique em **"Salvar"**

### Acompanhar Orçamento

1. **Orçamentos** → Veja progresso
2. Verde: Dentro do orçamento
3. Amarelo: Próximo do limite
4. Vermelho: Estourou o orçamento

---

## 🎯 METAS FINANCEIRAS

### Criar Meta

1. **Dashboard** → **Metas** → **Nova Meta**
2. Preencha:
   - Nome (ex: "Viagem")
   - Valor objetivo
   - Prazo
3. Clique em **"Salvar"**

### Adicionar Aporte

1. **Metas** → Clique na meta
2. Clique em **"Adicionar Aporte"**
3. Digite valor
4. Clique em **"Confirmar"**

---

## 💼 EMPRÉSTIMOS

### Criar Empréstimo

1. **Dashboard** → **Empréstimos** → **Novo**
2. Preencha:
   - Descrição
   - Valor total
   - Taxa de juros (%)
   - Número de parcelas
   - Data primeira parcela
3. Clique em **"Salvar"**

### Pagar Parcela

1. **Empréstimos** → Clique no empréstimo
2. Clique em **"Pagar Parcela"**
3. Selecione conta
4. Clique em **"Confirmar"**

---

## 📈 INVESTIMENTOS

### Criar Investimento

1. **Dashboard** → **Investimentos** → **Novo**
2. Preencha:
   - Tipo (CDB, LCI, Ações, etc.)
   - Valor investido
   - Rentabilidade (% a.a.)
   - Data aplicação
   - Data vencimento
3. Clique em **"Salvar"**

---

## 📊 RELATÓRIOS

### Dashboard

- **Saldo Total:** Soma de todas as contas
- **Receitas vs Despesas:** Gráfico mensal
- **Gastos por Categoria:** Gráfico pizza
- **Últimas Transações:** Lista recente

### Relatórios Básicos

1. **Dashboard** → **Relatórios**
2. Selecione período
3. Veja gráficos e tabelas
4. Exporte (PDF/CSV/Excel)

### Relatórios Avançados

1. **Dashboard** → **Relatórios Avançados**
2. Funcionalidades:
   - **Comparação:** Mês atual vs anterior
   - **Insights:** Análises automáticas
   - **Previsões:** Próximos 3 meses

---

## 🔄 CONCILIAÇÃO BANCÁRIA

### Importar Extrato

1. **Dashboard** → **Conciliação**
2. Clique em **"Importar Extrato"**
3. Selecione arquivo (CSV, OFX, XML, CNAB)
4. Clique em **"Enviar"**

### Revisar Transações

1. Veja transações importadas
2. Confirme ou edite categorias
3. Clique em **"Confirmar Todas"**

---

## 👥 COMPARTILHAMENTO FAMILIAR

### Convidar Membro

1. **Dashboard** → **Compartilhamento**
2. Clique em **"Convidar"**
3. Digite email
4. Selecione permissão:
   - **Visualizar:** Apenas ver
   - **Editar:** Ver e editar
   - **Admin:** Controle total
5. Clique em **"Enviar Convite"**

### Aceitar Convite

1. Abra email recebido
2. Clique no link
3. Faça login
4. Clique em **"Aceitar"**

---

## 🔔 NOTIFICAÇÕES

### Tipos

- Vencimento de contas
- Limite de orçamento
- Metas alcançadas
- Faturas de cartão

### Configurar

1. **Configurações** → **Notificações**
2. Ative/desative por tipo
3. Escolha canal (App, Email, Push)

---

## 💾 BACKUP

### Fazer Backup

1. **Configurações** → **Backup**
2. Clique em **"Fazer Backup"**
3. Arquivo JSON será baixado

### Restaurar Backup

1. **Configurações** → **Backup**
2. Clique em **"Restaurar"**
3. Selecione arquivo
4. Clique em **"Confirmar"**

---

## ⚙️ CONFIGURAÇÕES

### Perfil

- Editar nome
- Alterar foto
- Mudar senha

### Preferências

- Moeda padrão (BRL, USD, EUR)
- Tema (Claro/Escuro)
- Formato de data

### Email

- Configurar SMTP
- Relatórios automáticos
- Frequência

---

## 🆘 PROBLEMAS COMUNS

### Saldo não atualiza

**Solução:** Recarregue a página (F5)

### Transação não aparece

**Solução:** Verifique filtros e período

### Não consigo fazer login

**Solução:** Verifique email/senha ou recupere senha

---

**📖 Guia de Uso Completo!**
