import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('データベースのシードを開始します...')

  // 力士データの作成
  const rikishiData = [
    {
      name: '照ノ富士春雄',
      shikona: '照ノ富士',
      rank: '横綱',
      stable: '伊勢ヶ濱部屋',
      height: 188,
      weight: 175,
      birthDate: new Date('1991-11-26'),
      debutDate: new Date('2007-03-01'),
    },
    {
      name: '貴景勝光信',
      shikona: '貴景勝',
      rank: '大関',
      stable: '佐渡ヶ嶽部屋',
      height: 185,
      weight: 170,
      birthDate: new Date('1996-07-14'),
      debutDate: new Date('2012-03-01'),
    },
    {
      name: '正代直也',
      shikona: '正代',
      rank: '大関',
      stable: '高砂部屋',
      height: 183,
      weight: 165,
      birthDate: new Date('1991-08-19'),
      debutDate: new Date('2007-03-01'),
    },
    {
      name: '若元春朝和',
      shikona: '若元春',
      rank: '関脇',
      stable: '若松部屋',
      height: 185,
      weight: 160,
      birthDate: new Date('1994-03-25'),
      debutDate: new Date('2009-03-01'),
    },
    {
      name: '大栄翔勇人',
      shikona: '大栄翔',
      rank: '小結',
      stable: '追手風部屋',
      height: 182,
      weight: 155,
      birthDate: new Date('1992-05-25'),
      debutDate: new Date('2008-03-01'),
    },
  ]

  // 力士の作成
  const rikishi = []
  for (const data of rikishiData) {
    const created = await prisma.rikishi.upsert({
      where: { name: data.name },
      update: {},
      create: data,
    })
    rikishi.push(created)
    console.log(`力士を作成: ${created.name}`)
  }

  // 対戦結果の作成
  const matchResults = [
    {
      winnerId: rikishi[0].id, // 照ノ富士
      loserId: rikishi[1].id,  // 貴景勝
      tournament: '2024年1月場所',
      day: 1,
      technique: '寄り切り',
      duration: 45,
    },
    {
      winnerId: rikishi[1].id, // 貴景勝
      loserId: rikishi[2].id,  // 正代
      tournament: '2024年1月場所',
      day: 2,
      technique: '押し出し',
      duration: 30,
    },
    {
      winnerId: rikishi[2].id, // 正代
      loserId: rikishi[3].id,  // 若元春
      tournament: '2024年1月場所',
      day: 3,
      technique: '寄り切り',
      duration: 60,
    },
    {
      winnerId: rikishi[3].id, // 若元春
      loserId: rikishi[4].id,  // 大栄翔
      tournament: '2024年1月場所',
      day: 4,
      technique: '押し出し',
      duration: 25,
    },
    {
      winnerId: rikishi[4].id, // 大栄翔
      loserId: rikishi[0].id,  // 照ノ富士
      tournament: '2024年1月場所',
      day: 5,
      technique: '寄り切り',
      duration: 55,
    },
  ]

  for (const data of matchResults) {
    await prisma.matchResult.create({
      data,
    })
    console.log(`対戦結果を作成: ${data.tournament} ${data.day}日目`)
  }

  // 統計情報の作成
  for (const rikishiData of rikishi) {
    const wins = await prisma.matchResult.count({
      where: { winnerId: rikishiData.id }
    })
    
    const losses = await prisma.matchResult.count({
      where: { loserId: rikishiData.id }
    })

    const totalMatches = wins + losses
    const winRate = totalMatches > 0 ? wins / totalMatches : 0

    await prisma.rikishiStats.upsert({
      where: { rikishiId: rikishiData.id },
      update: {
        totalWins: wins,
        totalLosses: losses,
        winRate,
        currentStreak: wins > 0 ? 1 : -1,
        bestStreak: wins > 0 ? 1 : 0,
        lastUpdated: new Date(),
      },
      create: {
        rikishiId: rikishiData.id,
        totalWins: wins,
        totalLosses: losses,
        winRate,
        currentStreak: wins > 0 ? 1 : -1,
        bestStreak: wins > 0 ? 1 : 0,
      },
    })
    console.log(`統計情報を作成: ${rikishiData.name}`)
  }

  console.log('データベースのシードが完了しました！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 