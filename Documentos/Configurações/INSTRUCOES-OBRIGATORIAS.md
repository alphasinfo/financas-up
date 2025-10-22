# 📋 INSTRUÇÕES OBRIGATÓRIAS - FINANÇAS UP

**Última atualização:** 22/10/2025
**Versão:** 1.0.0
**Status:** OBRIGATÓRIO PARA TODOS OS DESENVOLVEDORES

---

## ⚠️ IMPORTANTE

Este documento contém **REGRAS OBRIGATÓRIAS** que devem ser seguidas por todos os desenvolvedores do projeto Financas-Up. O não cumprimento destas regras pode comprometer a qualidade, organização e manutenção do projeto.

---

## 📁 ORGANIZAÇÃO DA DOCUMENTAÇÃO

### 📂 Estrutura Obrigatória

#### Pasta de Documentação
```bash
❌ NÃO UTILIZAR: documentos/
✅ OBRIGATÓRIO: Documentos/ (com D maiúsculo)
```

**Motivo:** Padronização e consistência na nomenclatura.

#### 🛑 RESSALVA IMPORTANTE - ORGANIZAÇÃO ESTRITA DE ARQUIVOS

**TODOS os arquivos devem ser criados em suas pastas distintas específicas, mantendo organização rigorosa:**

### 📚 Documentação
- ✅ **TODOS os arquivos de documentação** → `Documentos/` em suas **sub-pastas corretas**
- ✅ **Guias de uso** → `Documentos/Modo-de-usar/`
- ✅ **Configurações** → `Documentos/Configurações/`
- ✅ **Arquitetura/Técnico** → `Documentos/DocumentosTecnicos/`
- ✅ **Qualidade/Testes** → `Documentos/Auditoria/`
- ✅ **Relatórios** → `Documentos/relatorios/`
- ❌ **NUNCA** criar documentação na raiz ou outras pastas

### 🔧 Scripts
- ✅ **TODOS os scripts** → `scripts/` em suas **pastas temáticas corretas**
- ✅ **Build/Otimização** → `scripts/build/`
- ✅ **Banco de dados** → `scripts/database/`
- ✅ **Setup/Configuração** → `scripts/setup/`
- ✅ **Autenticação** → `scripts/auth/`
- ✅ **Dados/Seeds** → `scripts/data/`
- ✅ **Qualidade/Testes** → `scripts/quality/`
- ✅ **Instalação** → `scripts/install/`
- ✅ **Utilitários** → `scripts/utils/`
- ✅ **Criar novas pastas** se necessário para melhor organização

### 🧪 Testes
- ✅ **TODOS os testes** → `teste/` organizados por **tipo e categoria**
- ✅ **Testes unitários** → `teste/__tests__/`
- ✅ **Testes específicos** → `teste/testes/`
- ✅ **Documentação de testes** → `teste/DOCUMENTACAO-TESTES.md`
- ✅ **Criar pastas separadas** por tipo de teste para melhor organização
- ✅ **Criar sub-pastas** necessárias para organizar melhor

### 💾 Backups
- ✅ **TODOS os backups** → `bkp/` com **pastas separadas**
- ✅ **Organizar por data/tipo** em sub-pastas dentro de `bkp/`
- ✅ **Criar estrutura** de pastas para melhor organização

### 🏠 Pasta Raiz (STRICT)
- ✅ **APENAS arquivos essenciais do projeto**
- ✅ **Código fonte** → `src/`
- ✅ **Configurações do projeto** → `package.json`, `jest.config.js`, etc.
- ✅ **Dependências** → `node_modules/`, `prisma/`
- ❌ **NENHUM arquivo de documentação** pode ficar na raiz
- ❌ **NENHUM script** pode ficar na raiz
- ❌ **NENHUM backup** pode ficar na raiz
- ❌ **NENHUM arquivo temporário** pode poluir a raiz

**VIOLAÇÃO: Qualquer arquivo fora de sua pasta correta será considerado desorganização crítica e deve ser corrigido imediatamente.**

#### Conteúdo da Pasta Documentos/
```
Documentos/
├── Modo-de-usar/           # 📖 Guias de uso e manuais
├── Configurações/          # ⚙️ Instalação e configuração
├── DocumentosTecnicos/     # 🏗️ Arquitetura e desenvolvimento
├── Auditoria/              # 🔍 Qualidade e testes
└── relatorios/             # 📊 Relatórios do projeto
```

#### Scripts e Testes
```bash
✅ OBRIGATÓRIO: scripts/ e suas subpastas corretas
✅ OBRIGATÓRIO: teste/ para todos os testes

scripts/
├── build/           # Compilação e otimização
├── database/        # Banco de dados
├── setup/           # Configuração inicial
├── auth/            # Autenticação
├── data/            # Dados e seeds
├── quality/         # Qualidade e testes
├── install/         # Instalação
└── utils/           # Utilitários

teste/
├── __tests__/       # Testes principais
├── testes/          # Testes específicos
└── DOCUMENTACAO-TESTES.md
```

#### Pasta Raiz do Projeto
**REGRA:** Manter organização - somente arquivos essenciais do projeto
```
✅ PROJETO (src/, prisma/, public/, etc.)
✅ CONFIGURAÇÃO (.env*, package.json, etc.)
❌ ARQUIVOS PESSOAIS
❌ TEMPORÁRIOS
❌ BACKUPS DESNECESSÁRIOS
```

---

## 📝 MANUTENÇÃO DA DOCUMENTAÇÃO

### 📖 Leitura Obrigatória

#### Antes de Qualquer Alteração
```bash
✅ OBRIGATÓRIO: Ler documentação existente
✅ OBRIGATÓRIO: Verificar se alteração já foi documentada
✅ OBRIGATÓRIO: Consultar arquivos relacionados
```

**Arquivos obrigatórios para consulta:**
- `Documentos/Modo-de-usar/INDICE-DOCUMENTACAO.md`
- `Documentos/DocumentosTecnicos/ESTRUTURA-PROJETO.md`
- `teste/DOCUMENTACAO-TESTES.md`
- `Documentos/Configurações/09-SCRIPTS-COMANDOS.md`
- `Documentos/Configurações/INSTRUCOES-OBRIGATORIAS-LEIA-PRIMEIRO.md`

#### Após Alterações no Projeto
```bash
✅ OBRIGATÓRIO: Atualizar documentação imediatamente
✅ OBRIGATÓRIO: Catalogar todas as mudanças
✅ OBRIGATÓRIO: Manter histórico de alterações
```

### 📝 Padrões de Documentação

#### Formato Obrigatório
```markdown
# Título da Funcionalidade

## Descrição
[Descrição clara e objetiva]

## Como Usar
[Instruções passo-a-passo]

## Exemplo
[Exemplo prático]

## Observações
[Informações importantes]
```

#### Atualização de Versão
```bash
✅ OBRIGATÓRIO: Atualizar data e versão em todos os arquivos alterados
✅ OBRIGATÓRIO: Documentar mudanças no changelog
```

---

## 🧪 TESTES E QUALIDADE

### ✅ Verificação Obrigatória

#### Antes de Qualquer Commit
```bash
✅ OBRIGATÓRIO: npm test (todos os testes)
✅ OBRIGATÓRIO: npm run test:integration (teste completo)
✅ OBRIGATÓRIO: npm run build (verificar build)
✅ OBRIGATÓRIO: npm run lint (verificar código)
```

#### Durante Desenvolvimento
```bash
✅ OBRIGATÓRIO: Executar testes relacionados às alterações
✅ OBRIGATÓRIO: Verificar se novas funcionalidades têm testes
✅ OBRIGATÓRIO: Validar performance não regrediu
```

### 🔧 Correção de Testes

#### Quando um Teste Falha
```
1. ✅ PRIMEIRO: Verificar se o arquivo/código está CORRETO
2. ✅ SE código correto: Corrigir o teste
3. ✅ SE código errado: Corrigir o código E o teste
4. ❌ NUNCA: Ignorar ou desabilitar testes
5. ❌ NUNCA: Alterar testes sem validar código
```

#### Motivos de Falha de Teste
- **Arquivo correto, teste errado:** Atualizar teste para refletir comportamento correto
- **Arquivo errado, teste correto:** Corrigir implementação
- **Ambos errados:** Corrigir ambos e documentar decisão

### 📊 Métricas de Qualidade

#### Cobertura Mínima Obrigatória
- **Statements:** 80%
- **Branches:** 75%
- **Functions:** 85%
- **Lines:** 80%

#### Performance
- **Testes unitários:** < 100ms cada
- **Testes de integração:** < 30s total
- **Build:** < 5min

---

## 🔄 FLUXO DE TRABALHO OBRIGATÓRIO

### 📋 Checklist de Desenvolvimento

#### 1. Planejamento
```bash
✅ Ler documentação existente sobre funcionalidade
✅ Verificar se já existe implementação similar
✅ Consultar issues/tarefas relacionadas
✅ Planejar abordagem (não começar a codificar imediatamente)
```

#### 2. Verificação de Ambiente
```bash
✅ Verificar erros conhecidos do PowerShell
✅ Confirmar dependências instaladas
✅ Validar configuração do ambiente
✅ Testar comandos básicos (npm test, npm run build)
```

#### 3. Implementação
```bash
✅ Seguir padrões estabelecidos no projeto
✅ Manter consistência com código existente
✅ Adicionar comentários quando necessário
✅ Evitar código duplicado
```

#### 4. Validação
```bash
✅ Executar testes relacionados
✅ Verificar se build passa
✅ Testar funcionalidade manualmente
✅ Validar performance não regrediu
```

#### 5. Documentação
```bash
✅ Atualizar documentação técnica se necessário
✅ Adicionar exemplos se nova funcionalidade
✅ Documentar decisões importantes tomadas
✅ Atualizar guias de uso se interface mudou
```

#### 6. Commit
```bash
✅ Mensagem clara e descritiva
✅ Referenciar issue/tarefa se aplicável
✅ Não commitar código quebrado
✅ Verificar se CI passa antes de push
```

### 🚨 Tratamento de Erros

#### Novos Erros Encontrados
```bash
✅ OBRIGATÓRIO: Documentar o erro encontrado
✅ OBRIGATÓRIO: Descrever contexto e como reproduzir
✅ OBRIGATÓRIO: Registrar solução implementada
✅ OBRIGATÓRIO: Atualizar documentação de troubleshooting
```

#### Erros Conhecidos
```bash
✅ Verificar se erro já foi documentado
✅ Seguir solução conhecida se existir
✅ Reportar se solução não funciona mais
✅ Atualizar documentação se solução mudou
```

### 🔀 Branches e Merge

#### Convenções de Branch
```bash
✅ feature/nome-da-funcionalidade
✅ bugfix/descricao-do-bug
✅ hotfix/correcao-critica
✅ refactor/melhoria-de-codigo
```

#### Pull Request
```bash
✅ Descrição clara das mudanças
✅ Referências a issues resolvidas
✅ Testes passando
✅ Code review aprovado
✅ Documentação atualizada
```

---

## ⚡ COMANDOS ESSENCIAIS

### Desenvolvimento Diário
```bash
# Verificar estado do projeto
npm test && npm run build

# Desenvolvimento com hot reload
npm run dev

# Testes rápidos
npm run test:integration

# Verificar qualidade
npm run lint && npm run test:coverage
```

### Manutenção
```bash
# Limpeza geral
npm run diagnostico
npm run reset-db

# Verificação completa
node scripts/quality/pre-commit.js
node scripts/build/test-build.js
```

---

## 🚫 PROIBIDO

### ❌ Ações Proibidas
- Modificar estrutura de pastas sem documentar
- Commitar sem executar testes
- Alterar documentação sem atualizar versão/data
- Ignorar falhas de build ou lint
- Usar nomes de pastas incorretos (documentos vs Documentos)
- Deixar código não documentado
- Push forçado sem code review
- Desabilitar testes sem justificativa

### ❌ Anti-padrões
- Código sem testes
- Documentação desatualizada
- Commits grandes demais
- Branches sem propósito claro
- Falta de comunicação em mudanças críticas

---

## 📞 SUPORTE E CONTATO

### 📧 Canais de Comunicação
- **Issues no GitHub:** Para bugs e melhorias
- **Documentação:** Para dúvidas sobre implementação
- **Code Review:** Para validação de mudanças

### 🆘 Emergências
- **Build quebrado:** Verificar scripts de diagnóstico
- **Testes falhando:** Seguir fluxo de correção de testes
- **Deploy com problema:** Verificar documentação de deploy

---

## 📈 MELHORIAS CONTÍNUAS

### Revisão Periódica
```bash
✅ MENSAL: Revisar documentação por atualidade
✅ SEMANAL: Verificar saúde dos testes
✅ DIÁRIO: Validar build e lint
```

### Atualização deste Documento
```bash
✅ Sempre que novas regras forem estabelecidas
✅ Quando processos são melhorados
✅ Após feedback da equipe
```

---

**🎯 COMPROMISSO DA EQUIPE**

Todos os desenvolvedores se comprometem a seguir estas instruções obrigatórias para manter a qualidade, organização e eficiência do projeto Financas-Up.

**Violação destas regras pode resultar em:**
- Reversão de commits
- Suspensão de acesso ao repositório
- Retrabalho forçado
- Danos à produtividade da equipe

---

**✅ Documento Aprovado pela Equipe de Desenvolvimento**
