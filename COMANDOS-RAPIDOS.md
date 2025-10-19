# ⚡ Comandos Rápidos - Implementação de Otimizações

## 🚀 Deploy Rápido (5 comandos)

```bash
# 1. Aplicar índices no banco de dados
npx prisma migrate dev --name add_performance_indexes

# 2. Instalar dependências (se necessário)
npm install

# 3. Build de produção
npm run build

# 4. Testar localmente
npm start

# 5. Deploy (Vercel)
vercel --prod
```

---

## 🧪 Testes de Performance

### Lighthouse Audit
```bash
# 1. Build e start
npm run build && npm start

# 2. Abrir Chrome em modo incógnito
# 3. Pressionar F12 (DevTools)
# 4. Aba "Lighthouse"
# 5. Selecionar todas as categorias
# 6. Clicar "Analyze page load"
```

### Testar Tempo de Resposta das APIs
```powershell
# Windows PowerShell
Measure-Command {
  Invoke-WebRequest -Uri "http://localhost:3000/api/dashboard" -UseBasicParsing
}
```

```bash
# Git Bash / Linux / Mac
time curl http://localhost:3000/api/dashboard
```

### Verificar Bundle Size
```bash
# Instalar analyzer
npm install --save-dev @next/bundle-analyzer

# Analisar bundle
$env:ANALYZE="true"; npm run build  # PowerShell
# ou
ANALYZE=true npm run build  # Bash
```

---

## 🔍 Verificar Índices no Banco

### PostgreSQL
```sql
-- Ver todos os índices da tabela transacoes
SELECT * FROM pg_indexes WHERE tablename = 'transacoes';

-- Verificar uso de índice em uma query
EXPLAIN ANALYZE 
SELECT * FROM transacoes 
WHERE "usuarioId" = 'seu-id' 
  AND status = 'PENDENTE' 
  AND "dataCompetencia" >= NOW();
```

### SQLite (Desenvolvimento)
```sql
-- Ver índices
SELECT * FROM sqlite_master WHERE type = 'index';

-- Verificar query plan
EXPLAIN QUERY PLAN 
SELECT * FROM transacoes 
WHERE usuarioId = 'seu-id' 
  AND status = 'PENDENTE';
```

---

## 🧹 Limpeza e Manutenção

### Limpar Cache do Next.js
```bash
# Remover .next e node_modules
rm -rf .next node_modules

# Reinstalar
npm install
```

### Limpar Cache do Prisma
```bash
# Regenerar Prisma Client
npx prisma generate

# Resetar banco (CUIDADO: apaga dados!)
npx prisma migrate reset
```

### Limpar Cache do Service Worker
```javascript
// Console do navegador
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
  console.log('Cache limpo!');
});

// Recarregar página
location.reload();
```

---

## 📊 Monitoramento em Produção

### Instalar Analytics
```bash
npm install @vercel/analytics @vercel/speed-insights
```

### Adicionar no Layout
```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 🐛 Troubleshooting

### Erro: Prisma Client não encontrado
```bash
npx prisma generate
```

### Erro: Porta 3000 em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Erro: Build falha por falta de memória
```bash
# Aumentar memória do Node.js
$env:NODE_OPTIONS="--max-old-space-size=4096"; npm run build  # PowerShell
# ou
NODE_OPTIONS="--max-old-space-size=4096" npm run build  # Bash
```

### Erro: Service Worker não atualiza
```javascript
// Console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  console.log('Service Workers removidos!');
  location.reload();
});
```

---

## 📝 Scripts Úteis para package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "analyze": "ANALYZE=true next build",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "test:lighthouse": "lighthouse http://localhost:3000 --view",
    "test:api": "node scripts/test-api-performance.js"
  }
}
```

---

## 🔧 Configurações Recomendadas

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Git Ignore Adicional
```gitignore
# Performance
.next/analyze
bundle-analyzer-report.html

# Cache
.cache/
*.log
```

---

## 📚 Links Úteis

- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **Web Vitals:** https://web.dev/vitals/
- **Next.js Performance:** https://nextjs.org/docs/app/building-your-application/optimizing
- **Prisma Performance:** https://www.prisma.io/docs/guides/performance-and-optimization
- **Bundle Analyzer:** https://www.npmjs.com/package/@next/bundle-analyzer

---

## ✅ Checklist Rápido

```bash
# Implementação
[ ] npx prisma migrate dev --name add_performance_indexes
[ ] Substituir getDashboardData por getDashboardDataOptimized
[ ] Adicionar invalidateUserCache nas APIs
[ ] npm run build
[ ] npm start

# Testes
[ ] Lighthouse audit (Performance, Accessibility, Best Practices, SEO)
[ ] Testar API Dashboard (tempo de resposta)
[ ] Verificar bundle size
[ ] Testar em dispositivos móveis

# Deploy
[ ] Commit e push
[ ] Deploy em produção
[ ] Verificar métricas em produção
[ ] Monitorar erros
```

---

**Última Atualização:** 2025-01-19  
**Tempo Estimado:** 2 horas para implementação completa
