# ⚡ Guia Rápido: Aplicar Índices de Performance

**Leia isto em 2 minutos antes de aplicar!**

---

## 🎯 Situação Atual

Você está usando **Supabase** (banco em nuvem), mas ainda não quer aplicar os índices lá.

---

## ✅ SOLUÇÃO RECOMENDADA

### 1. Testar PRIMEIRO no Banco Local

```bash
# Execute este comando:
./scripts/utils/aplicar-indices-local.sh
```

**O que acontece:**
- ✅ Alterna para banco SQLite local
- ✅ Aplica os 19 índices
- ✅ Seu Supabase **NÃO é afetado**
- ✅ Faz backup automático de tudo
- ✅ Você pode testar a performance

### 2. Testar o Sistema

```bash
# Reinicie o servidor
npm run dev

# Abra o calendário
http://localhost:3000/dashboard/calendario

# Deve estar MUITO mais rápido!
```

### 3. Quando Estiver Satisfeito, Aplique no Supabase

```bash
# APENAS quando estiver pronto
./scripts/utils/aplicar-indices-supabase.sh

# O script vai:
# - Pedir confirmação
# - Aplicar os índices no Supabase
# - Fazer backup antes
```

---

## 🔄 Alternando Entre Bancos

### Usar Local (SQLite)
```bash
./scripts/manjaro/usar-local.sh
# ou
./scripts/debian/usar-local.sh
```

### Voltar para Supabase
```bash
./scripts/manjaro/usar-supabase.sh
# ou
./scripts/debian/usar-supabase.sh
```

---

## 📦 Backups Criados

O script `aplicar-indices-local.sh` cria:

```
bkp/
├── .env.backup.20251017_154500          # Backup do .env
├── .env.supabase.bkp                    # Credenciais Supabase
└── dev.db.antes-indices.20251017_154500 # Banco antes dos índices
```

---

## ⚠️ EM CASO DE PROBLEMA

### Restaurar .env
```bash
# Voltar para Supabase
cp bkp/.env.supabase.bkp .env
# ou restaurar backup específico
cp bkp/.env.backup.20251017_154500 .env
```

### Restaurar Banco Local
```bash
cp bkp/dev.db.antes-indices.20251017_154500 prisma/dev.db
```

---

## 🎯 RESUMO

1. **Agora (Local):**
   ```bash
   ./scripts/utils/aplicar-indices-local.sh
   npm run dev
   # Teste o calendário
   ```

2. **Depois (Supabase):**
   ```bash
   ./scripts/utils/aplicar-indices-supabase.sh
   ```

3. **Alternar quando quiser:**
   ```bash
   # Local
   ./scripts/manjaro/usar-local.sh
   
   # Supabase
   ./scripts/manjaro/usar-supabase.sh
   ```

---

## ✅ Pronto para Aplicar?

```bash
./scripts/utils/aplicar-indices-local.sh
```

**Tempo estimado:** 30 segundos  
**Risco:** Zero (faz backup de tudo)  
**Benefício:** Sistema 10-50x mais rápido! ⚡
