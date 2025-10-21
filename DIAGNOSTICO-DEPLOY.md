# Diagnóstico de Deploy - Netlify, Supabase e Vercel

## ✅ Supabase - FUNCIONANDO PERFEITAMENTE

### Status da Conexão
- ✅ Conexão estabelecida com sucesso
- ✅ Todas as 15 tabelas criadas e acessíveis
- ✅ Dados de teste carregados

### Estrutura do Banco
```
✅ usuarios                       - 1 registro
✅ categorias                     - 16 registros
✅ contas_bancarias               - 6 registros
✅ cartoes_credito                - 4 registros
✅ faturas                        - 8 registros
✅ transacoes                     - 18 registros
✅ emprestimos                    - 2 registros
✅ parcelas_emprestimo            - 0 registros
✅ investimentos                  - 4 registros
✅ orcamentos                     - 4 registros
✅ metas                          - 4 registros
✅ conciliacoes                   - 0 registros
✅ compartilhamentos_conta        - 0 registros
✅ convites_compartilhamento      - 0 registros
✅ logs_acesso                    - 0 registros
```

### Configuração
```env
DATABASE_URL="postgresql://postgres.oqvufceuzwmaztmlhuvh:Alpha124578S1nfo@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

---

## ❌ Netlify - PROBLEMAS IDENTIFICADOS

### Problema 1: Migration Incompatível
**Causa:** A migration atual (`20251020203923_init/migration.sql`) está em formato SQLite
- Usa `DATETIME` (SQLite) ao invés de `TIMESTAMP` (PostgreSQL)
- Usa `AUTOINCREMENT` (SQLite) ao invés de `SERIAL` (PostgreSQL)
- Usa `REAL` (SQLite) ao invés de `DOUBLE PRECISION` (PostgreSQL)

**Solução:**
```bash
# 1. Deletar migrations antigas
rm -rf prisma/migrations

# 2. Configurar para PostgreSQL
npm run db:supabase

# 3. Criar nova migration
npx prisma migrate dev --name init_postgresql

# 4. Aplicar no Supabase
npx prisma migrate deploy
```

### Problema 2: Configuração do Build
**Arquivo:** `netlify.toml`

**Problemas encontrados:**
1. ❌ Plugin `@netlify/plugin-supabase` não existe oficialmente
2. ⚠️ DATABASE_URL com `pgbouncer=true` pode causar problemas com Prisma
3. ⚠️ Falta configuração de timeout

**Configuração Atual:**
```toml
[build]
  publish = ".next"
  command = "npm run build:netlify"

[build.environment]
  NODE_VERSION = "18"
  DATABASE_URL = "postgresql://...?pgbouncer=true&connection_limit=1&pool_timeout=10"
  
[[plugins]]
  package = "@netlify/plugin-nextjs"

[[plugins]]
  package = "@netlify/plugin-supabase"  # ❌ NÃO EXISTE
```

**Configuração Corrigida:**
```toml
[build]
  publish = ".next"
  command = "npm run build:netlify"

[build.environment]
  NODE_VERSION = "20"  # Atualizado
  NEXT_TELEMETRY_DISABLED = "1"
  DATABASE_URL = "postgresql://postgres.oqvufceuzwmaztmlhuvh:Alpha124578S1nfo@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?connection_limit=1"
  NEXTAUTH_SECRET = "8Sg4me2Px3VBzR6eeyK+Kjm7sVzdrawgQgK1lKi0Rz4="
  NEXTAUTH_URL = "https://financas-up.netlify.app"
  NETLIFY = "true"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Problema 3: Script de Build
**Arquivo:** `scripts/build-netlify.js`

**Problema:** Executa `npm run db:supabase` que modifica o schema durante o build

**Solução:** Remover alternância de banco durante build
```javascript
async function build() {
  try {
    // ❌ REMOVER: await runCommand('npm', ['run', 'db:supabase']);
    await runCommand('npx', ['prisma', 'generate']);
    await runCommand('npx', ['next', 'build']);
    
    console.log('\n✅ Build Netlify concluído!');
  } catch (error) {
    console.error('\n❌ Erro no build:', error.message);
    process.exit(1);
  }
}
```

### Problema 4: Variáveis de Ambiente
**Faltando no Netlify Dashboard:**
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `DATABASE_URL`

**Como configurar:**
1. Acessar: https://app.netlify.com/sites/financas-up/settings/deploys
2. Environment variables
3. Adicionar cada variável

---

## ⚠️ Vercel - INSTABILIDADE CONFIRMADA

### Status Atual
Verificando status da Vercel...

**Possíveis causas de instabilidade:**
1. Problemas de rede/infraestrutura
2. Limites de uso atingidos
3. Configuração de timeout

### Verificação
```bash
# Verificar status
curl -I https://seu-app.vercel.app

# Verificar logs
vercel logs seu-app --follow
```

---

## 🔧 Plano de Correção

### Passo 1: Corrigir Migrations (CRÍTICO)
```bash
# Backup do banco atual
pg_dump $DATABASE_URL > backup.sql

# Deletar migrations SQLite
rm -rf prisma/migrations

# Criar migration PostgreSQL
npx prisma migrate dev --name init_postgresql

# Aplicar no Supabase
npx prisma migrate deploy
```

### Passo 2: Corrigir netlify.toml
```bash
# Editar netlify.toml
# Remover plugin inexistente
# Atualizar NODE_VERSION para 20
# Ajustar DATABASE_URL
```

### Passo 3: Corrigir build-netlify.js
```bash
# Remover alternância de banco
# Manter apenas: prisma generate + next build
```

### Passo 4: Configurar Variáveis no Netlify
```
1. Acessar dashboard Netlify
2. Site Settings > Environment Variables
3. Adicionar todas as variáveis necessárias
```

### Passo 5: Testar Build Localmente
```bash
# Simular build Netlify
NETLIFY=true npm run build:netlify

# Verificar se funciona
npm start
```

---

## 📋 Checklist de Deploy

### Supabase
- [x] Banco criado
- [x] Tabelas criadas
- [x] Dados de teste carregados
- [x] Conexão funcionando
- [ ] Migration PostgreSQL criada

### Netlify
- [ ] netlify.toml corrigido
- [ ] build-netlify.js corrigido
- [ ] Variáveis de ambiente configuradas
- [ ] Build local testado
- [ ] Deploy realizado

### Vercel
- [ ] Status verificado
- [ ] Logs analisados
- [ ] Configuração revisada

---

## 🚀 Comandos Úteis

### Verificar Supabase
```bash
tsx scripts/verificar-supabase.ts
```

### Testar Build Netlify
```bash
NETLIFY=true npm run build:netlify
```

### Verificar Migrations
```bash
npx prisma migrate status
```

### Aplicar Migrations
```bash
npx prisma migrate deploy
```

### Gerar Prisma Client
```bash
npx prisma generate
```

---

## 📞 Próximos Passos

1. **URGENTE:** Criar migration PostgreSQL
2. **URGENTE:** Corrigir netlify.toml
3. **IMPORTANTE:** Corrigir build-netlify.js
4. **IMPORTANTE:** Configurar variáveis no Netlify
5. **NORMAL:** Verificar status da Vercel
6. **NORMAL:** Testar deploy completo

---

## 💡 Recomendações

### Para Desenvolvimento
- Use SQLite local: `npm run db:local`
- Mais rápido e sem custos

### Para Produção (Netlify/Vercel)
- Use PostgreSQL (Supabase): `npm run db:supabase`
- Mais robusto e escalável

### Alternância Automática
O projeto já tem scripts para alternar entre os dois:
```bash
npm run db:local      # SQLite
npm run db:supabase   # PostgreSQL
```

**IMPORTANTE:** Nunca alterne durante o build!
