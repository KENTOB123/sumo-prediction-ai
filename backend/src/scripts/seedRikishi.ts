import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rikishiData = [
  {
    id: "hoshoryu_1999",
    shikona: "豊昇龍",
    rank: "Y",
    stable: "立浪",
    age: 26,
    height_cm: 187,
    weight_kg: 151,
    preferred_kimarite: ["寄り切り", "掬い投げ"],
    career_record: { wins: 358, losses: 211, draws: 0 },
    yusho: 4,
    special_prizes: { gino: 7, kanto: 3, shukun: 2 },
    kinboshi: 0,
    last_3_basho: [
      { basho: "2025.05", wins: 12, losses: 3 },
      { basho: "2025.03", wins: 11, losses: 4 },
      { basho: "2025.01", wins: 13, losses: 2 }
    ],
    current_streak: { type: "W", value: 5 },
    elo: 1940,
    head2head_vs_next: { wins: 6, losses: 2 },
    injury_status: "healthy"
  },
  {
    id: "onosato_2000",
    shikona: "王鵬",
    rank: "O",
    stable: "二所ノ関",
    age: 25,
    height_cm: 191,
    weight_kg: 167,
    preferred_kimarite: ["押し出し", "突き出し"],
    career_record: { wins: 276, losses: 152, draws: 0 },
    yusho: 2,
    special_prizes: { gino: 1, kanto: 4, shukun: 1 },
    kinboshi: 3,
    last_3_basho: [
      { basho: "2025.05", wins: 10, losses: 5 },
      { basho: "2025.03", wins: 12, losses: 3 },
      { basho: "2025.01", wins: 13, losses: 2 }
    ],
    current_streak: { type: "L", value: 1 },
    elo: 1875,
    head2head_vs_next: { wins: 4, losses: 4 },
    injury_status: "healthy"
  },
  {
    id: "kotozakura_2001",
    shikona: "琴桜",
    rank: "O",
    stable: "佐渡ヶ嶽",
    age: 24,
    height_cm: 193,
    weight_kg: 158,
    preferred_kimarite: ["寄り切り"],
    career_record: { wins: 265, losses: 160, draws: 0 },
    yusho: 1,
    special_prizes: { gino: 2, kanto: 2, shukun: 1 },
    kinboshi: 2,
    last_3_basho: [
      { basho: "2025.05", wins: 11, losses: 4 },
      { basho: "2025.03", wins: 9, losses: 6 },
      { basho: "2025.01", wins: 12, losses: 3 }
    ],
    current_streak: { type: "W", value: 2 },
    elo: 1850,
    head2head_vs_next: { wins: 5, losses: 3 },
    injury_status: "healthy"
  },
  {
    id: "daieisho_1993",
    shikona: "大栄翔",
    rank: "S",
    stable: "追手風",
    age: 32,
    height_cm: 182,
    weight_kg: 160,
    preferred_kimarite: ["突き押し"],
    career_record: { wins: 540, losses: 463, draws: 0 },
    yusho: 1,
    special_prizes: { gino: 0, kanto: 3, shukun: 7 },
    kinboshi: 8,
    last_3_basho: [
      { basho: "2025.05", wins: 8, losses: 7 },
      { basho: "2025.03", wins: 9, losses: 6 },
      { basho: "2025.01", wins: 9, losses: 6 }
    ],
    current_streak: { type: "W", value: 1 },
    elo: 1780,
    head2head_vs_next: { wins: 3, losses: 6 },
    injury_status: "healthy"
  },
  {
    id: "kirishima_1996",
    shikona: "霧島",
    rank: "S",
    stable: "宮城野",
    age: 29,
    height_cm: 186,
    weight_kg: 154,
    preferred_kimarite: ["寄り切り", "上手投げ"],
    career_record: { wins: 421, losses: 303, draws: 0 },
    yusho: 0,
    special_prizes: { gino: 4, kanto: 4, shukun: 1 },
    kinboshi: 4,
    last_3_basho: [
      { basho: "2025.05", wins: 9, losses: 6 },
      { basho: "2025.03", wins: 10, losses: 5 },
      { basho: "2025.01", wins: 8, losses: 7 }
    ],
    current_streak: { type: "L", value: 2 },
    elo: 1765,
    head2head_vs_next: { wins: 5, losses: 5 },
    injury_status: "healthy"
  },
  {
    id: "takayasu_1990",
    shikona: "高安",
    rank: "K",
    stable: "田子ノ浦",
    age: 34,
    height_cm: 187,
    weight_kg: 174,
    preferred_kimarite: ["寄り切り"],
    career_record: { wins: 749, losses: 537, draws: 0 },
    yusho: 0,
    special_prizes: { gino: 3, kanto: 7, shukun: 2 },
    kinboshi: 10,
    last_3_basho: [
      { basho: "2025.05", wins: 10, losses: 5 },
      { basho: "2025.03", wins: 9, losses: 6 },
      { basho: "2025.01", wins: 8, losses: 7 }
    ],
    current_streak: { type: "W", value: 3 },
    elo: 1750,
    head2head_vs_next: { wins: 7, losses: 2 },
    injury_status: "healthy"
  }
];

async function main() {
  console.log('🌱 力士データのシードを開始します...');

  for (const rikishi of rikishiData) {
    await prisma.rikishi.upsert({
      where: { id: rikishi.id },
      update: rikishi,
      create: rikishi,
    });
    console.log(`✅ ${rikishi.shikona} を追加/更新しました`);
  }

  console.log('🎉 力士データのシードが完了しました！');
}

main()
  .catch((e) => {
    console.error('❌ シードエラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 