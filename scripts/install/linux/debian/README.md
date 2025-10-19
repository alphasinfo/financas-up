# Instalação no Linux Debian/Ubuntu - Finanças UP

## Pré-requisitos

- **Sistema Operacional:** Debian 10+ ou Ubuntu 20.04+ (64-bit)
- **Usuário:** Conta com privilégios `sudo` (ou root)
- **Espaço em Disco:** Pelo menos 1GB livre
- **Conexão:** Internet ativa para downloads
- **Arquitetura:** amd64 (recomendado)

## Como Usar o Script

1. **Dar Permissões de Execução:**
   ```bash
   chmod +x scripts/install/linux/debian/install.sh
   ```

2. **Executar como Usuário Normal (com sudo):**
   ```bash
   ./scripts/install/linux/debian/install.sh
   ```

3. **Ou como Root:**
   ```bash
   sudo ./scripts/install/linux/debian/install.sh
   ```

## O que é Instalado

| Programa | Versão | Método | Tamanho Aprox. |
|----------|--------|--------|----------------|
| **Node.js** | 18+ LTS | NodeSource | ~100MB |
| **npm** | Latest | NodeSource | Incluído |
| **Git** | Latest | apt | ~20MB |
| **PostgreSQL** | 15+ | apt | ~200MB |

## Métodos de Instalação

### apt (Oficial)
- Gerenciador de pacotes oficial do Debian/Ubuntu
- Para pacotes nos repositórios oficiais e PPAs

### NodeSource (Para Node.js)
- Repositório externo para versões recentes do Node.js
- Adicionado automaticamente pelo script

## Quando Usar

### ✅ Cenários Recomendados
- **Servidores Debian/Ubuntu** em produção ou desenvolvimento
- **Estações de trabalho** com Ubuntu/Debian
- **Containers Docker** baseados em Debian
- **Ambientes de CI/CD** com Debian

### ❌ Não Recomendado Para
- **Sistemas críticos** onde versões específicas são obrigatórias
- **Ambientes air-gapped** (sem internet)
- **Distribuições não-Debian** (use o script apropriado)

## Solução de Problemas

### Erro: "apt update falhou"
```bash
# Verifique conexão com internet
ping -c 3 google.com

# Limpe cache se necessário
sudo apt clean && sudo apt update
```

### Erro: "Permissões sudo"
```bash
# Configure sudo para seu usuário
su -c 'usermod -aG sudo seu_usuario'
```

### Erro: "Sem espaço em disco"
```bash
# Limpe cache
sudo apt autoremove --purge
sudo apt autoclean
```

### Erro: "Node.js versão antiga"
- O script instala Node.js 18+ via NodeSource
- Para versões específicas, edite o script

## Pós-Instalação

1. **Verifique as instalações:**
   ```bash
   node --version    # Deve mostrar v18+
   npm --version     # Latest
   git --version     # Latest
   psql --version    # PostgreSQL version
   ```

2. **Siga o Início Rápido:**
   - Consulte `docs/01-INICIO-RAPIDO.md`

3. **Configuração Adicional:**
   - Para produção, configure PostgreSQL com senha segura
   - Use `npx prisma migrate deploy` para migrações

## Suporte

- **Issues:** Abra em https://github.com/alphasinfo/financas-up/issues
- **Logs:** O script mostra progresso detalhado
- **Versão:** 1.0.0 - Compatível com Debian 10+/Ubuntu 20.04+

---

**Nota:** Debian/Ubuntu são distribuições estáveis. O script instala versões LTS recomendadas para compatibilidade.
