# 📜 Scripts - Finanças UP

Guia rápido de todos os scripts disponíveis.

---

## 📋 Scripts Disponíveis

1. [Instalação](#instalação)
2. [Backup](#backup)
3. [Banco de Dados](#banco-de-dados)
4. [Utilidades](#utilidades)

---

## 🚀 Instalação

### Windows
```powershell
.\scripts\windows\install.ps1
```

### Manjaro/Arch
```bash
./scripts/manjaro/install.sh
```

### Debian/Ubuntu
```bash
./scripts/debian/install.sh
```

**Todos fazem backup automático do .env antes de instalar!**

---

## 💾 Backup

### Windows
```powershell
.\scripts\windows\backup.ps1
```

### Linux (qualquer distro)
```bash
./scripts/[manjaro|debian]/backup.sh
# ou
./scripts/utils/backup-completo.sh
```

**Salva em:** `bkp/backup_[DATA]/`

---

## 🗄️ Banco de Dados

### Alternar para Banco Local (SQLite)

**Windows:**
```powershell
.\scripts\windows\usar-local.ps1
```

**Linux:**
```bash
./scripts/[manjaro|debian]/usar-local.sh
```

### Alternar para Supabase (PostgreSQL)

**Windows:**
```powershell
.\scripts\windows\usar-supabase.ps1
```

**Linux:**
```bash
./scripts/[manjaro|debian]/usar-supabase.sh
```

**Ambos fazem backup automático do .env!**

---

## 🛠️ Utilidades

### Alternar DB (JavaScript)
```bash
node scripts/utils/alternar-db.js [local|supabase]
```

### Reset Completo
```bash
./scripts/utils/reset-completo.sh
```
⚠️ **CUIDADO:** Reseta todo o banco de dados!

---

## ⚡ Performance (Novos)

### Aplicar Índices no Banco LOCAL
```bash
./scripts/utils/aplicar-indices-local.sh
```
**O que faz:**
- Aplica índices APENAS no banco local (SQLite)
- NÃO afeta seu Supabase
- Faz backup automático antes
- Melhora performance em 10-50x

**Recomendado:** Execute primeiro para testar!

### Aplicar Índices no SUPABASE
```bash
./scripts/utils/aplicar-indices-supabase.sh
```
**O que faz:**
- Aplica índices no banco Supabase (produção)
- Pede confirmação antes de executar
- Faz backup do .env antes
- Melhora performance em 10-50x

⚠️ **Use apenas quando estiver pronto para produção!**

### Remover Console.log (Opcional)
```bash
./scripts/utils/remover-console-log.sh
```
**O que faz:**
- Remove console.log de produção
- Mantém console.error em desenvolvimento
- Faz backup completo do código antes
- Deixa console limpo

**Opcional:** Melhora performance e segurança

---

## 📁 Estrutura

```
scripts/
├── windows/              # PowerShell (.ps1)
│   ├── install.ps1      # Instalação
│   ├── backup.ps1       # Backup
│   ├── usar-local.ps1   # Banco local
│   └── usar-supabase.ps1 # Banco Supabase
│
├── manjaro/             # Arch-based (.sh)
│   ├── install.sh       # Instalação
│   ├── backup.sh        # Backup
│   ├── usar-local.sh    # Banco local
│   └── usar-supabase.sh # Banco Supabase
│
├── debian/              # Debian-based (.sh)
│   ├── install.sh       # Instalação
│   ├── backup.sh        # Backup
│   ├── usar-local.sh    # Banco local
│   └── usar-supabase.sh # Banco Supabase
│
└── utils/               # Universais
    ├── alternar-db.js   # Alternar banco (JS)
    ├── backup-completo.sh # Backup completo
    ├── reset-completo.sh # Reset banco
    ├── aplicar-indices-local.sh      # Índices local ⚡
    ├── aplicar-indices-supabase.sh   # Índices Supabase ⚡
    └── remover-console-log.sh        # Limpar console ⚡
```

---

## ⚠️ Importante

**Todos os scripts fazem backup automático do .env antes de modificar!**

Backups salvos em: `bkp/.env.backup.[TIMESTAMP]`

### Restaurar Backup
```bash
cp bkp/.env.backup.20251017_143000 .env
```

---

**Ver também:** [Instalação](../sistema/INSTALACAO.md) | [Configuração](../sistema/CONFIGURACAO.md)
