import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4];

    if (!email || !password || !name) {
      console.error('❌ Uso: npx tsx scripts/create-admin.ts <email> <senha> <nome>');
      console.error('   Exemplo: npx tsx scripts/create-admin.ts admin@exemplo.com senha123 "Nome Admin"');
      process.exit(1);
    }

    console.log('🔐 Criando usuário admin...');
    console.log(`   Email: ${email}`);
    console.log(`   Nome: ${name}`);

    // Verificar se já existe
    const existing = await prisma.admin.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('⚠️  Usuário já existe! Atualizando senha...');

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.admin.update({
        where: { email },
        data: {
          password: hashedPassword,
          name,
        }
      });

      console.log('✅ Senha atualizada com sucesso!');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          name,
        }
      });

      console.log('✅ Admin criado com sucesso!');
      console.log(`   ID: ${admin.id}`);
    }

    console.log('\n📋 CREDENCIAIS DE ACESSO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANTE: Guarde essas credenciais em local seguro!');

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
