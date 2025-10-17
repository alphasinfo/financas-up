# 🚀 Início Rápido - Finanças UP

**Ambiente configurado e pronto para uso!**

---

## ✅ O Que Foi Feito

### 1. Script de Configuração Melhorado
- ✅ `linux/setup-biglinux.sh` otimizado para BigLinux/Manjaro
- ✅ Suporte para pamac, yay e pacman
- ✅ Criação automática do `.env`
- ✅ Geração automática de `NEXTAUTH_SECRET`

### 2. Ambiente Configurado
- ✅ Dependências do Node.js instaladas
- ✅ Prisma Client gerado
- ✅ Banco de dados SQLite criado
- ✅ Arquivo `.env` configurado para desenvolvimento local

### 3. Servidor Iniciado
- ✅ Servidor Next.js rodando em `http://localhost:3000`
- ✅ Preview disponível para testes

---

## 🎯 Acesso Rápido

### Aplicação Web
```
http://localhost:3000
```

### Prisma Studio (Interface do Banco)
```bash
npx prisma studio
```
Acesse: `http://localhost:5555`

---

## 📋 Comandos Principais

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm run start

# Verificar código
npm run lint
```

### Banco de Dados
```bash
# Visualizar banco de dados
npx prisma studio

# Gerar Prisma Client
npx prisma generate

# Aplicar mudanças no schema
npx prisma db push

# Popular com dados de teste
npm run seed
```

### Scripts Utilitários
```bash
# Verificar usuários
npm run verificar-usuarios

# Diagnóstico de saldos
npm run diagnostico

# Limpar banco de dados
npm run limpar-banco

# Resetar banco completo
npm run resetar-banco
```

### Alternar Banco de Dados
```bash
# Usar SQLite local
npm run db:local

# Usar Supabase (produção)
npm run db:supabase
```

---

## 🔐 Primeiro Acesso

### 1. Criar Conta
1. Acesse `http://localhost:3000`
2. Clique em **"Cadastrar"**
3. Preencha seus dados
4. Faça login

### 2. Configurar Categorias
- O sistema já vem com categorias padrão
- Você pode adicionar mais em **Dashboard → Categorias**

### 3. Adicionar Conta Bancária
1. Vá em **Dashboard → Contas**
2. Clique em **"Nova Conta"**
3. Preencha os dados
4. Defina o saldo inicial

### 4. Adicionar Cartão de Crédito
1. Vá em **Dashboard → Cartões**
2. Clique em **"Novo Cartão"**
3. Configure:
   - Nome do cartão
   - Limite total
   - Dia de fechamento (ex: 5)
   - Dia de vencimento (ex: 15)

---

## 🐛 Bugs Conhecidos

Conforme documentado em `BUGS-CRITICOS.md`:

### Alta Prioridade
1. **Cartão de Crédito - Lógica de Fechamento**
   - Status: Em análise
   - Lógica do código parece correta
   - Pode ser problema de timezone ou cache

2. **Limite do Cartão - Cálculo Incorreto**
   - Status: Requer teste
   - Verificar se está somando parcelas futuras

3. **Exclusão de Parcelas - Inconsistências**
   - Status: Requer teste
   - Verificar se atualiza fatura e limite

### Média Prioridade
4. Dashboard não atualiza após criar despesa
5. Relatórios sem informação de cartão
6. Detalhes do cartão - parcelas dispersas

### Baixa Prioridade
7. Calendário - impressão corta dias
8. Calendário - empréstimos não aparecem
9. Empréstimo - cálculo de juros

---

## 📊 Estrutura do Projeto

```
financas-up/
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   ├── cartoes/      # Cartões de crédito
│   │   │   ├── faturas/      # Faturas
│   │   │   ├── transacoes/   # Transações
│   │   │   └── ...
│   │   ├── dashboard/        # Páginas do dashboard
│   │   ├── login/            # Login
│   │   └── cadastro/         # Cadastro
│   ├── components/           # Componentes React
│   ├── lib/                  # Utilitários
│   │   ├── formatters.ts     # Formatação e cálculos
│   │   ├── auth.ts           # Autenticação
│   │   └── prisma.ts         # Cliente Prisma
│   └── types/                # Tipos TypeScript
├── prisma/
│   ├── schema.prisma         # Schema do banco
│   └── dev.db                # Banco SQLite local
├── linux/
│   └── setup-biglinux.sh     # Script de configuração
└── .env                      # Variáveis de ambiente
```

---

## 🔍 Arquivos Importantes

### Configuração
- `.env` - Variáveis de ambiente (local)
- `.env.example` - Exemplo de configuração
- `prisma/schema.prisma` - Schema do banco de dados

### Documentação
- `README.md` - Informações gerais
- `CONFIGURACAO.md` - Guia completo de configuração
- `BUGS-CRITICOS.md` - Lista de bugs conhecidos
- `COMO_USAR.md` - Como usar o sistema
- `STATUS-CONFIGURACAO.md` - Status da configuração atual
- `ANALISE-BUGS.md` - Análise técnica dos bugs
- `INICIO-RAPIDO.md` - Este arquivo

### Scripts
- `linux/setup-biglinux.sh` - Configuração automática
- `scripts/` - Scripts utilitários diversos

---

## 🧪 Testes Sugeridos

### 1. Teste de Fatura do Cartão
```
1. Criar cartão com fechamento dia 5
2. Criar compra no dia 4 → deve ir para fatura do mês atual
3. Criar compra no dia 6 → deve ir para fatura do próximo mês
4. Verificar se as faturas estão corretas
```

### 2. Teste de Limite do Cartão
```
1. Criar cartão com limite R$ 1.000,00
2. Criar despesa de R$ 100,00
3. Verificar se limite disponível = R$ 900,00
4. Criar mais despesas e verificar cálculo
```

### 3. Teste de Parcelas
```
1. Criar compra parcelada em 3x de R$ 300,00
2. Verificar se criou 3 transações de R$ 100,00
3. Verificar se cada parcela está na fatura correta
4. Excluir uma parcela e verificar se atualiza
```

### 4. Teste de Dashboard
```
1. Abrir dashboard
2. Criar nova despesa
3. Verificar se card do cartão atualiza
4. Verificar se gráficos atualizam
```

---

## ⚠️ Avisos de Segurança

### Credenciais Expostas
- ⚠️ **CRÍTICO**: Arquivo `.env.supabase` contém credenciais expostas
- 🔒 **AÇÃO NECESSÁRIA**: 
  1. Rotacionar senha do Supabase
  2. Remover `.env.supabase` do repositório
  3. Adicionar ao `.gitignore`

### Boas Práticas
- ✅ Arquivo `.env` já está no `.gitignore`
- ✅ Usando SQLite para desenvolvimento local
- ⚠️ Não commitar arquivos `.env*` com credenciais reais

---

## 📚 Documentação Adicional

### Next.js 14
- [Documentação oficial](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### Prisma
- [Documentação oficial](https://www.prisma.io/docs)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Prisma Studio](https://www.prisma.io/docs/concepts/components/prisma-studio)

### React
- [Documentação oficial](https://react.dev/)
- [Hooks](https://react.dev/reference/react)

---

## 🆘 Suporte

### Problemas Comuns

**Servidor não inicia:**
```bash
# Verificar se a porta 3000 está livre
lsof -i :3000

# Matar processo se necessário
kill -9 $(lsof -t -i:3000)

# Tentar novamente
npm run dev
```

**Erro no banco de dados:**
```bash
# Recriar banco
rm prisma/dev.db
npx prisma db push --accept-data-loss
npm run seed
```

**Erro de dependências:**
```bash
# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

**Erro do Prisma:**
```bash
# Regenerar client
npx prisma generate
```

---

## ✅ Checklist de Configuração

- [x] Node.js instalado
- [x] Dependências instaladas
- [x] Arquivo `.env` criado
- [x] Banco de dados criado
- [x] Prisma Client gerado
- [x] Servidor iniciado
- [ ] Primeiro usuário criado
- [ ] Conta bancária adicionada
- [ ] Cartão de crédito adicionado
- [ ] Primeira transação criada

---

## 🎉 Próximos Passos

1. **Testar a aplicação**
   - Criar usuário
   - Adicionar contas e cartões
   - Criar transações

2. **Verificar bugs**
   - Testar lógica de fatura
   - Testar cálculo de limite
   - Testar exclusão de parcelas

3. **Corrigir bugs encontrados**
   - Implementar correções
   - Testar novamente
   - Documentar mudanças

4. **Popular com dados reais**
   - Importar transações
   - Configurar categorias personalizadas
   - Ajustar orçamentos

---

**Status:** ✅ Ambiente pronto para uso!  
**Servidor:** 🟢 Rodando em http://localhost:3000  
**Banco:** 🟢 SQLite configurado e pronto
