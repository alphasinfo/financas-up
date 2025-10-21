import { execSync } from 'child_process';

console.log('♻️ Resetando banco de dados...');
execSync('npx prisma migrate reset --force', { stdio: 'inherit' });

console.log('🌱 Populando dados...');
execSync('npm run seed', { stdio: 'inherit' });

console.log('✅ Banco pronto para uso!');
