import { repository } from './repository';

async function seed() {
  console.log('🌱 Memulai proses seeding database CardioWork...');
  const workers = await repository.getAllWorkers();
  console.log(`✅ Berhasil memuat ${workers.length} pekerja.`);

  for (const w of workers) {
    const mcus = await repository.getMcuRecordsByWorkerId(w.id);
    const dcus = await repository.getDcuRecordsByWorkerId(w.id, 5);
    console.log(`- Pekerja ${w.pseudonymId} (${w.nameSynthetic}): ${mcus.length} rekam MCU, ${dcus.length} sampel DCU.`);
  }

  console.log('✅ Seeding database selesai. Sistem siap digunakan untuk evaluasi klinis!');
}

seed().catch((err) => {
  console.error('❌ Gagal melakukan seeding database:', err);
  process.exit(1);
});
