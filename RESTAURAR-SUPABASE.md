# 🔄 Como Restaurar Configuração do Supabase

Se você não tem o backup automático, siga estes passos:

## ✅ Opção 1: Configurar Manualmente (Mais Simples)

Abra o arquivo `.env` e adicione sua URL do Supabase:

```env
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@[SEU-PROJETO].supabase.co:5432/postgres"
```

**Onde encontrar a URL:**
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: Settings → Database
4. Copie a "Connection string" (formato URI)

## ✅ Opção 2: Criar Backup do Supabase

Se você já tem o `.env` configurado com Supabase:

```bash
# Criar backup para uso futuro
mkdir -p bkp
cp .env bkp/.env.supabase.bkp
echo "✅ Backup criado!"
```

Agora o script `usar-supabase.sh` vai funcionar.

## 🚀 Executar Após Configurar

```bash
./scripts/manjaro/usar-supabase.sh
```

Ou simplesmente mantenha a URL no `.env` e execute:

```bash
npx prisma db push
npx prisma generate
npm run dev
```

## 📋 Formato Correto da URL

```
postgresql://postgres:SUA_SENHA@db.projeto.supabase.co:5432/postgres
```

**Componentes:**
- `postgresql://` - Protocolo
- `postgres` - Usuário
- `SUA_SENHA` - Senha do projeto
- `db.projeto.supabase.co` - Host do projeto
- `5432` - Porta
- `postgres` - Nome do banco

## ⚠️ Importante

- NÃO compartilhe o .env com a senha
- A URL completa está no painel do Supabase
- Se errar a senha, o sistema não conecta

---

**Depois de configurar, execute:** `./scripts/utils/aplicar-indices-supabase.sh`
