# Scripts de Instalação - Finanças UP

Esta pasta contém scripts para instalar as dependências necessárias para executar o projeto **Finanças UP** nos sistemas operacionais suportados.

## Estrutura dos Scripts

```
scripts/install/
├── README.md                          # Este arquivo
├── windows/
│   ├── install.ps1                    # Script de instalação para Windows
│   └── README.md                      # Documentação específica para Windows
├── linux/
│   ├── manjaro/
│   │   ├── install.sh                 # Script de instalação para Manjaro
│   │   └── README.md                  # Documentação específica para Manjaro
│   └── debian/
│       ├── install.sh                 # Script de instalação para Debian
│       └── README.md                  # Documentação específica para Debian
```

## Sistemas Operacionais Suportados

### Windows
- **Script:** `windows/install.ps1`
- **Pré-requisitos:** Windows 10/11 com PowerShell 5.1+
- **Ferramentas:** Usa `winget` (recomendado) ou `chocolatey` como fallback
- **Instala:** Node.js 18+, Git, PostgreSQL

### Linux - Manjaro
- **Script:** `linux/manjaro/install.sh`
- **Pré-requisitos:** Manjaro (Arch-based) com `yay` instalado (AUR helper)
- **Ferramentas:** `yay` e `pacman`
- **Instala:** Node.js 18+, npm, Git, PostgreSQL

### Linux - Debian
- **Script:** `linux/debian/install.sh`
- **Pré-requisitos:** Debian/Ubuntu com `sudo` configurado
- **Ferramentas:** `apt`
- **Instala:** Node.js 18+, npm, Git, PostgreSQL

## Quando Usar

### Cenários de Uso
- **Desenvolvimento Local:** Execute o script do seu SO antes de clonar o projeto
- **Ambiente de Produção:** Para servidores Linux, use os scripts de deploy existentes
- **CI/CD:** Os scripts podem ser adaptados para pipelines automatizados
- **Novos Desenvolvedores:** Execute no seu ambiente para preparar as dependências

### Ordem de Execução
1. Escolha o script correto para seu SO
2. Execute como administrador/usuário com privilégios
3. Após a instalação, siga os passos do [Início Rápido](../../01-INICIO-RAPIDO.md)
4. Clone o repositório e execute `npm install`

## Avisos Importantes

- **Backup:** Os scripts podem alterar configurações do sistema. Faça backup se necessário
- **Permissões:** Execute com privilégios adequados (sudo/admin)
- **Dependências:** Certifique-se de que seu sistema atende aos pré-requisitos
- **Atualizações:** Os scripts instalam versões específicas. Para versões mais recentes, ajuste os scripts
- **Problemas:** Consulte a documentação específica de cada SO em caso de erros

## Suporte

Em caso de problemas:
- Verifique os logs de instalação
- Consulte a documentação específica do SO
- Abra uma issue no GitHub: https://github.com/alphasinfo/financas-up/issues

---

**Versão:** 1.0.0
**Última atualização:** 19/10/2025
