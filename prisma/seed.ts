import { PrismaClient, Stage, AgeGroup } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample teams with ageGroupTeamCounts
  const teams = [
    {
      teamName: "Galatasaray Futbol Akademisi",
      coachName: "Ahmet Yılmaz",
      phoneNumber: "+90 555 123 4567",
      stage: Stage.STAGE_1,
      ageGroups: [AgeGroup.Y2012, AgeGroup.Y2013, AgeGroup.Y2014],
      ageGroupTeamCounts: {
        "Y2012": 2,
        "Y2013": 3,
        "Y2014": 1
      },
      athletePrice: 0,
      parentPrice: 0,
      description: "Galatasaray'ın genç yeteneklerini yetiştiren akademi takımı"
    },
    {
      teamName: "Fenerbahçe Spor Kulübü",
      coachName: "Mehmet Demir",
      phoneNumber: "+90 555 987 6543",
      stage: Stage.STAGE_2,
      ageGroups: [AgeGroup.Y2015, AgeGroup.Y2016, AgeGroup.Y2017],
      ageGroupTeamCounts: {
        "Y2015": 4,
        "Y2016": 2,
        "Y2017": 3
      },
      athletePrice: 0,
      parentPrice: 0,
      description: "Fenerbahçe'nin gelecek vadeden futbolcularını yetiştiren takım"
    },
    {
      teamName: "Beşiktaş Jimnastik Kulübü",
      coachName: "Ali Kaya",
      phoneNumber: "+90 555 456 7890",
      stage: Stage.STAGE_1,
      ageGroups: [AgeGroup.Y2018, AgeGroup.Y2019, AgeGroup.Y2020],
      ageGroupTeamCounts: {
        "Y2018": 1,
        "Y2019": 2,
        "Y2020": 1
      },
      athletePrice: 0,
      parentPrice: 0,
      description: "Beşiktaş'ın küçük yaş kategorilerindeki yetenekli oyuncuları"
    },
    {
      teamName: "Trabzonspor Kulübü",
      coachName: "Hasan Özkan",
      phoneNumber: "+90 555 321 0987",
      stage: Stage.FINAL,
      ageGroups: [AgeGroup.Y2012, AgeGroup.Y2013, AgeGroup.Y2015, AgeGroup.Y2016],
      ageGroupTeamCounts: {
        "Y2012": 3,
        "Y2013": 2,
        "Y2015": 1,
        "Y2016": 2
      },
      athletePrice: 0,
      parentPrice: 0,
      description: "Trabzonspor'un çok kategorili güçlü takımı"
    },
    {
      teamName: "Başakşehir FK",
      coachName: "Emre Belözoğlu",
      phoneNumber: "+90 555 654 3210",
      stage: Stage.STAGE_3,
      ageGroups: [AgeGroup.Y2021, AgeGroup.Y2022],
      ageGroupTeamCounts: {
        "Y2021": 5,
        "Y2022": 3
      },
      athletePrice: 0,
      parentPrice: 0,
      description: "Başakşehir'in en küçük yaş kategorilerindeki takımı"
    }
  ]

  console.log('Örnek takım verileri ekleniyor...')

  for (const team of teams) {
    await prisma.team.create({
      data: team
    })
    console.log(`✓ ${team.teamName} eklendi`)
  }

  console.log('Seed işlemi tamamlandı!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
