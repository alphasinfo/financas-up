# 📦 Pasta de Backups

Esta pasta contém backups de arquivos importantes do projeto.

## 📁 Estrutura

```
bkp/
├── README.md                    # Este arquivo
├── .env.local.bkp              # Backup do .env local
├── .env.supabase.bkp           # Backup do .env com Supabase
└── sql-old/                    # SQLs antigos arquivados
    ├── add-email-report-fields.sql
    ├── atualizar-banco-supabase.sql
    └── banco-completo-corrigido.sql
```

---

## 📄 Arquivos

### **.env.local.bkp**
**Para que serve:**
- Backup da configuração local de desenvolvimento
- Contém DATABASE_URL para SQLite local

**Quando usar:**
- Restaurar configuração local
- Referência para configuração de desenvolvimento
- Após reinstalação do projeto

**Como usar:**
```bash
# Restaurar .env local
cp bkp/.env.local.bkp .env
```

---

### **.env.supabase.bkp**
**Para que serve:**
- Backup da configuração com Supabase
- Contém DATABASE_URL para PostgreSQL (Supabase)

**Quando usar:**
- Restaurar configuração de produção
- Migrar para Supabase
- Referência para variáveis de ambiente

**Como usar:**
```bash
# Restaurar .env com Supabase
cp bkp/.env.supabase.bkp .env

# Editar e adicionar suas credenciais
nano .env
```

---

### **sql-old/**
**Para que serve:**
- Arquiva versões antigas de scripts SQL
- Mantém histórico de mudanças no schema
- Referência para migrações antigas

**Arquivos:**

#### `add-email-report-fields.sql`
- Adiciona campos de email e relatórios
- Usado em versão anterior do sistema
- **Não usar** - schema atual já inclui esses campos

#### `atualizar-banco-supabase.sql`
- Script de atualização para Supabase
- Versão antiga do schema
- **Não usar** - usar Prisma migrations

#### `banco-completo-corrigido.sql`
- Schema completo de versão anterior
- Mantido apenas como referência
- **Não usar** - usar `database-schema.sql` na raiz

**Quando usar:**
- ❌ **NÃO USAR** em produção
- ✅ Apenas para referência histórica
- ✅ Comparar mudanças entre versões

---

## 🔄 Como Criar Novos Backups

### Backup do .env
```bash
# Backup manual
cp .env bkp/.env.backup-$(date +%Y%m%d).bkp

# Ou usar script
npm run backup:env
```

### Backup do Banco de Dados
```bash
# PostgreSQL/Supabase
pg_dump -U usuario -d database > bkp/database-$(date +%Y%m%d).sql

# SQLite
cp prisma/dev.db bkp/dev-$(date +%Y%m%d).db
```

---

## ⚠️ Avisos Importantes

1. **Nunca commitar .env**
   - Arquivos .env contêm credenciais sensíveis
   - Sempre adicionar ao .gitignore
   - Usar .env.example como template

2. **SQLs antigos**
   - Não usar em produção
   - Apenas para referência
   - Usar Prisma migrations para mudanças

3. **Restauração**
   - Sempre verificar compatibilidade
   - Testar em ambiente local primeiro
   - Fazer backup antes de restaurar

---

## 📚 Links Úteis

- [Documentação Principal](../docs/README.md)
- [Banco de Dados](../docs/DATABASE.md)
- [Scripts](../docs/SCRIPTS.md)

---

**Última atualização:** 19/01/2025
