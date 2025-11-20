import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearReservations() {
  try {
    console.log('🗑️  Limpando todas as reservas...');

    // Deletar todos os vouchers primeiro (relacionamento)
    const deletedVouchers = await prisma.voucher.deleteMany({});
    console.log(`✅ ${deletedVouchers.count} vouchers deletados`);

    // Deletar todas as reservas
    const deletedReservations = await prisma.reservation.deleteMany({});
    console.log(`✅ ${deletedReservations.count} reservas deletadas`);

    console.log('\n✨ Banco de dados limpo com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar reservas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearReservations();
