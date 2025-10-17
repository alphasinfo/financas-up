#!/bin/bash

# Script de Reset Completo - Finanças UP
# Use quando houver problemas de cache ou Prisma Client

echo "🔄 Iniciando reset completo..."
echo ""

# 1. Limpar cache do Next.js
echo "🗑️  Limpando cache do Next.js..."
rm -rf .next
rm -rf node_modules/.cache

# 2. Limpar Prisma Client
echo "🗑️  Limpando Prisma Client..."
rm -rf node_modules/@prisma
rm -rf node_modules/.prisma

# 3. Limpar banco de dados
echo "🗑️  Limpando banco de dados..."
rm -f prisma/dev.db
rm -f prisma/dev.db-journal

# 4. Reinstalar Prisma Client
echo "📦 Reinstalando Prisma Client..."
npm install @prisma/client

# 5. Recriar banco de dados
echo "🗄️  Recriando banco de dados..."
npx prisma db push

# 6. Gerar Prisma Client
echo "⚙️  Gerando Prisma Client..."
npx prisma generate

# 7. Popular banco
echo "🌱 Populando banco de dados..."
npm run seed

echo ""
echo "✅ Reset completo concluído!"
echo ""
echo "Agora execute:"
echo "  npm run dev"
echo ""
