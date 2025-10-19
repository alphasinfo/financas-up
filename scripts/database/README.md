# 🗄️ Scripts de Banco de Dados

Scripts SQL e ferramentas para gerenciamento do banco de dados.

## 📁 Arquivos

### **database-schema.sql**
**Para que serve:**
- Schema completo do banco de dados em SQL puro
- Estrutura de todas as tabelas, índices e constraints
- Versão exportada do Prisma schema

**Quando usar:**
- Criar banco de dados manualmente (sem Prisma)
- Referência para estrutura do banco
- Documentação do schema
- Importar em ferramentas de modelagem

**Como usar:**
```bash
# PostgreSQL
psql -U usuario -d financas_up < scripts/database/database-schema.sql

# MySQL
mysql -u usuario -p financas_up < scripts/database/database-schema.sql
```

**⚠️ ATENÇÃO:**
- Este arquivo é gerado automaticamente
- Não editar manualmente
- Usar Prisma migrations para mudanças
- Apenas para referência e documentação

---

## 🔧 Comandos Úteis

### **Gerar Schema SQL Atualizado**
```bash
# Gerar SQL a partir do Prisma
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > scripts/database/database-schema.sql
```

### **Criar Banco de Dados**
```bash
# Usando Prisma (recomendado)
npx prisma db push

# Ou criar migrations
npx prisma migrate dev --name init
```

### **Backup do Banco**
```bash
# PostgreSQL
pg_dump -U usuario -d financas_up > scripts/database/backup-$(date +%Y%m%d).sql

# Restore
psql -U usuario -d financas_up < scripts/database/backup-20250119.sql
```

### **Reset do Banco**
```bash
# ATENÇÃO: Apaga todos os dados!
npx prisma migrate reset
```

---

## 📊 Estrutura do Banco

### **Tabelas Principais**

| Tabela | Descrição | Registros Típicos |
|--------|-----------|-------------------|
| `Usuario` | Usuários do sistema | 1-1000 |
| `Transacao` | Transações financeiras | 1000-100000 |
| `Categoria` | Categorias de transações | 10-50 |
| `ContaBancaria` | Contas bancárias | 1-10 |
| `CartaoCredito` | Cartões de crédito | 1-5 |
| `Fatura` | Faturas de cartões | 12-60 |
| `Meta` | Metas financeiras | 1-20 |
| `Orcamento` | Orçamentos mensais | 12-120 |
| `Investimento` | Investimentos | 1-50 |
| `Emprestimo` | Empréstimos | 1-20 |
| `Notificacao` | Notificações | 100-10000 |
| `Compartilhamento` | Compartilhamentos | 1-50 |
| `LogAcesso` | Logs de acesso | 1000-100000 |

### **Relacionamentos**

```
Usuario (1) ──< (N) Transacao
Usuario (1) ──< (N) Categoria
Usuario (1) ──< (N) ContaBancaria
Usuario (1) ──< (N) CartaoCredito
Usuario (1) ──< (N) Meta
Usuario (1) ──< (N) Orcamento
Usuario (1) ──< (N) Investimento
Usuario (1) ──< (N) Emprestimo

CartaoCredito (1) ──< (N) Fatura
CartaoCredito (1) ──< (N) Transacao
Categoria (1) ──< (N) Transacao
ContaBancaria (1) ──< (N) Transacao
Meta (1) ──< (N) ContribuicaoMeta
```

---

## 🔍 Queries Úteis

### **Verificar Tamanho do Banco**
```sql
-- PostgreSQL
SELECT 
  pg_size_pretty(pg_database_size('financas_up')) as tamanho;

-- Tamanho por tabela
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **Estatísticas de Uso**
```sql
-- Total de usuários
SELECT COUNT(*) as total_usuarios FROM "Usuario";

-- Total de transações por usuário
SELECT 
  u.nome,
  COUNT(t.id) as total_transacoes,
  SUM(CASE WHEN t.tipo = 'RECEITA' THEN t.valor ELSE 0 END) as total_receitas,
  SUM(CASE WHEN t.tipo = 'DESPESA' THEN t.valor ELSE 0 END) as total_despesas
FROM "Usuario" u
LEFT JOIN "Transacao" t ON u.id = t."usuarioId"
GROUP BY u.id, u.nome;

-- Transações por mês
SELECT 
  DATE_TRUNC('month', "dataCompetencia") as mes,
  COUNT(*) as total,
  SUM(valor) as valor_total
FROM "Transacao"
GROUP BY mes
ORDER BY mes DESC;
```

### **Limpeza de Dados**
```sql
-- Deletar notificações antigas (mais de 30 dias)
DELETE FROM "Notificacao" 
WHERE "createdAt" < NOW() - INTERVAL '30 days';

-- Deletar logs antigos (mais de 90 dias)
DELETE FROM "LogAcesso" 
WHERE "createdAt" < NOW() - INTERVAL '90 days';
```

---

## 🛠️ Manutenção

### **Otimização**
```sql
-- Analisar tabelas
ANALYZE;

-- Reindexar
REINDEX DATABASE financas_up;

-- Vacuum (limpar espaço)
VACUUM ANALYZE;
```

### **Verificar Integridade**
```sql
-- Verificar constraints
SELECT 
  conname as constraint_name,
  conrelid::regclass as table_name,
  contype as constraint_type
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace;

-- Verificar índices
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 📚 Documentação Relacionada

- [Documentação do Banco](../../docs/DATABASE.md)
- [Prisma Schema](../../prisma/schema.prisma)
- [Migrations](../../prisma/migrations/)

---

## ⚠️ Boas Práticas

1. **Sempre usar Prisma para mudanças**
   - Criar migrations: `npx prisma migrate dev`
   - Não editar SQL diretamente em produção

2. **Fazer backup antes de mudanças**
   ```bash
   pg_dump -U usuario -d financas_up > backup-antes-mudanca.sql
   ```

3. **Testar em desenvolvimento primeiro**
   - Nunca testar em produção
   - Usar banco local ou staging

4. **Monitorar performance**
   - Verificar queries lentas
   - Adicionar índices quando necessário
   - Limpar dados antigos regularmente

---

**Última atualização:** 19/01/2025
