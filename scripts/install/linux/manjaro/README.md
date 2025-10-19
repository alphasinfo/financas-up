# Instalação no Linux Manjaro - Finanças UP

## Pré-requisitos

- **Sistema Operacional:** Manjaro Linux (baseado em Arch)
- **Usuário:** Conta de usuário com privilégios `sudo`
- **Espaço em Disco:** Pelo menos 1GB livre
- **Conexão:** Internet ativa para downloads
- **Kernel:** Linux com suporte a pacotes AUR

## Como Usar o Script

1. **Dar Permissões de Execução:**
   ```bash
   chmod +x scripts/install/linux/manjaro/install.sh
   ```

2. **Executar o Script:**
   ```bash
   ./scripts/install/linux/manjaro/install.sh
   ```

3. **O Script Fará:**
   - Atualizar o sistema
   - Instalar `yay` (AUR helper) se necessário
   - Instalar Node.js, npm, Git e PostgreSQL
   - Configurar PostgreSQL com usuário padrão

## O que é Instalado

| Programa | Versão | Método | Tamanho Aprox. |
|----------|--------|--------|----------------|
| **Node.js** | 18+ LTS | yay (AUR) | ~100MB |
| **npm** | Latest | yay (AUR) | Incluído |
| **Git** | Latest | pacman | ~20MB |
| **PostgreSQL** | 15+ | yay (AUR) | ~200MB |

## Métodos de Instalação

### yay (Recomendado)
- Helper para Arch User Repository (AUR)
- Instalado automaticamente se necessário
- Acesso a pacotes comunitários

### pacman
- Gerenciador oficial do Arch/Manjaro
- Para pacotes nos repositórios oficiais

## Quando Usar

### ✅ Cenários Recomendados
- **Desenvolvimento local** em Manjaro
- **Estações de trabalho** de desenvolvedores
- **Ambientes de teste** ou homologação
- **Máquinas virtuais** com Manjaro

### ❌ Não Recomendado Para
- **Servidores de produção:** Use Docker ou instalação manual controlada
- **Ambientes corporativos** com restrições de AUR
- **Sistemas críticos** onde estabilidade é prioridade

## Solução de Problemas

### Erro: "yay não encontrado"
- O script instala yay automaticamente
- Se falhar, instale manualmente:
  ```bash
  sudo pacman -S base-devel git
  git clone https://aur.archlinux.org/yay.git
  cd yay && makepkg -si
  ```

### Erro: "Permissões sudo"
```bash
# Configure sudo para seu usuário
sudo visudo
# Adicione: seu_usuario ALL=(ALL) ALL
```

### Erro: "Sem espaço em disco"
```bash
# Limpe cache
yay -Sc --noconfirm
sudo pacman -Sc --noconfirm
```

### Erro: "Conflito de versões"
```bash
# Para versões específicas
yay -S nodejs-lts
```

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
   - Para PostgreSQL, configure senha se necessário
   - Use `npx prisma studio` para interface gráfica

## Suporte

- **Issues:** Abra em https://github.com/alphasinfo/financas-up/issues
- **Logs:** O script mostra progresso detalhado
- **Versão:** 1.0.0 - Compatível com Manjaro estável

---

**Nota:** Manjaro é rolling release, então versões podem variar. O script visa versões estáveis recomendadas.
