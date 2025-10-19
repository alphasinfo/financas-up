# Instalação no Windows - Finanças UP

## Pré-requisitos

- **Sistema Operacional:** Windows 10 ou 11 (64-bit)
- **Permissões:** Execute o PowerShell como **Administrador**
- **Espaço em Disco:** Pelo menos 2GB livre
- **Conexão:** Internet ativa para downloads

## Como Usar o Script

1. **Baixe o Script:**
   - Navegue até `scripts/install/windows/`
   - Clique com o botão direito em `install.ps1` e selecione "Executar com PowerShell"

2. **Execução:**
   ```powershell
   # Como administrador
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\install.ps1
   ```

3. **Opções Avançadas:**
   ```powershell
   .\install.ps1 -Force    # Força reinstalação
   .\install.ps1 -Help     # Mostra ajuda
   ```

## O que é Instalado

| Programa | Versão | Método | Tamanho Aprox. |
|----------|--------|--------|----------------|
| **Node.js** | 18+ LTS | Winget/Chocolatey | ~100MB |
| **Git** | Latest | Winget/Chocolatey | ~50MB |
| **PostgreSQL** | 15+ | Winget/Chocolatey | ~300MB |

## Métodos de Instalação

### Winget (Recomendado)
- Instalador oficial da Microsoft
- Vem pré-instalado no Windows 11
- Para Windows 10: https://docs.microsoft.com/pt-br/windows/package-manager/winget/

### Chocolatey (Fallback)
- Gerenciador de pacotes para Windows
- Instalado automaticamente se necessário
- Mais antigo, mas compatível

## Quando Usar

### ✅ Cenários Recomendados
- **Primeira instalação** em um novo ambiente
- **Configuração de desenvolvedor** iniciando no projeto
- **Ambiente de desenvolvimento** local
- **Máquinas virtuais** ou containers Windows

### ❌ Não Recomendado Para
- **Servidores de produção:** Use Docker ou instalação manual
- **Ambientes corporativos** com políticas restritivas
- **Sistemas legados** (Windows 7/8)

## Solução de Problemas

### Erro: "winget não encontrado"
```powershell
# Para Windows 10, instale o App Installer
# https://www.microsoft.com/store/productId/9NBLGGH4NNS1
```

### Erro: "Execution Policy"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "Permissões insuficientes"
- Certifique-se de executar como Administrador
- Clique com o botão direito no PowerShell → "Executar como administrador"

### Erro: "Sem espaço em disco"
- Libere pelo menos 2GB
- Use limpeza de disco: `cleanmgr`

## Pós-Instalação

Após executar o script:

1. **Verifique as instalações:**
   ```powershell
   node --version
   npm --version
   git --version
   ```

2. **Siga o Início Rápido:**
   - Consulte `docs/01-INICIO-RAPIDO.md`

3. **Configuração Adicional:**
   - Configure variáveis de ambiente se necessário
   - Para PostgreSQL, defina senha padrão ou use Supabase

## Suporte

- **Issues:** Abra em https://github.com/alphasinfo/financas-up/issues
- **Logs:** O script mostra progresso e erros no console
- **Versão:** 1.0.0 - Compatível com documentação v2.0.0

---

**Nota:** Este script automatiza a instalação, mas você é responsável por backups e configurações específicas do seu ambiente.
