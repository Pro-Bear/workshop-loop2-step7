// "Zamonaviy kasblar" tanlovi — tuman (shahar) bosqichi ma'lumotlari.
// Manba: tuman bayonnomalari (PDF) va Qoraqalpog'iston g'oliblar jadvali (XLSX).
// Faqat raqamlar saqlanadi: F.I.O, telefon, pasport ma'lumotlari kiritilmagan.
//
// Tuman maydonlari:
//   date         — tanlov sanasi (YYYY-MM-DD), noma'lum bo'lsa yo'q
//   participated — "N nafar yoshlar ishtirok etdi"
//   absent       — "uzrli sabablarga ko'ra ishtirok eta olmadi"
//   web/gd/mob   — yo'nalish bo'yicha 1-, 2-, 3-o'rin ballari (100 balldan).
//                  null — o'rin egallangan, lekin ball yozilmagan; massiv uzunligi = to'ldirilgan o'rinlar
//   ages         — faqat g'oliblar jadvalida: yo'nalish bo'yicha 1-o'rin g'olibining yoshi
//   note         — bayonnomadagi e'tiborga molik holat

window.TOURNAMENT = {
  title: "Zamonaviy kasblar tanlovi",
  subtitle: "Besh tashabbus olimpiadasi · tuman (shahar) bosqichi",
  asOf: "2026-10-14",
  majors: [
    { key: "web", name: "Eng yaxshi veb-sayt", short: "Veb-sayt" },
    { key: "gd",  name: "Eng yaxshi grafik dizayn", short: "Grafik dizayn" },
    { key: "mob", name: "Eng yaxshi mobilografiya ishi", short: "Mobilografiya" }
  ],
  regions: [
    { name: "Andijon viloyati" },
    { name: "Buxoro viloyati" },
    { name: "Farg'ona viloyati" },
    {
      name: "Jizzax viloyati",
      districts: [
        { name: "Arnasoy tumani",         date: "2026-10-09", participated: 15,  absent: 4,  web: [70, 50],       gd: [70, 50, 45], mob: [65, 60, 55] },
        { name: "Baxmal tumani",          date: "2026-10-10", participated: 30,  absent: 5,  web: [null, null, null], gd: [null, null, null], mob: [null, null, null], note: "Bayonnomada ballar ko'rsatilmagan" },
        { name: "Do'stlik tumani",        date: "2026-10-10", participated: 42,  absent: 12, web: [70, 60, 50],   gd: [50, 40, 30], mob: [60, 40, 30] },
        { name: "Forish tumani" },
        { name: "G'allaorol tumani",      date: "2026-10-07", participated: 85,  absent: 11, web: [90, 80, 70],   gd: [80, 70, 60], mob: [80, 70, 60] },
        { name: "Jizzax shahri",          date: "2026-10-10", participated: 40,  absent: 3,  web: [80, 60, 50],   gd: [90, 60, 40], mob: [80, 50, 40] },
        { name: "Mirzacho'l tumani",      date: "2026-10-09", participated: 79,  absent: 19, web: [60, 50, 30],   gd: [80, 60, 50], mob: [40, 30, 20] },
        { name: "Paxtakor tumani",        date: "2026-10-08", participated: 32,  absent: 6,  web: [null, null, null], gd: [null, null, null], mob: [null, null, null], note: "Bayonnomada ball o'rniga faqat o'rinlar yozilgan" },
        { name: "Sharof Rashidov tumani", date: "2026-10-07", participated: 383, absent: 42, web: [87, 66, 48],   gd: [88, 73, 38], mob: [81, 75, 56] },
        { name: "Yangiobod tumani",       date: "2026-10-10", participated: 55,  absent: 12, web: [65, 40, 30],   gd: [85, 55, 40], mob: [65, 40, 35] },
        { name: "Zafarobod tumani",       date: "2026-10-07", participated: 75,  absent: 14, web: [70, 40, 30],   gd: [80, 60, 40], mob: [80, 60, 50] },
        { name: "Zarbdor tumani",         date: "2026-10-10", web: [100, 80, 70], gd: [80, 70, 60], mob: [100, 90, 80], note: "Bayonnomada ishtirokchilar soni yozilmagan" },
        { name: "Zomin tumani",           date: "2026-10-12", participated: 62,  absent: 60, web: [60],           gd: [60, 50, 40], mob: [60, 50, 40] }
      ]
    },
    { name: "Xorazm viloyati" },
    { name: "Namangan viloyati" },
    { name: "Navoiy viloyati" },
    { name: "Qashqadaryo viloyati" },
    {
      name: "Qoraqalpog'iston Respublikasi",
      // Faqat g'oliblar jadvali kelgan: har yo'nalishda 1-o'rin g'olibi va uning yoshi
      districts: [
        { name: "Amudaryo tumani",    ages: { web: 22, gd: 17, mob: 22 } },
        { name: "Beruniy tumani",     ages: { mob: 17 } },
        { name: "Bo'zatov tumani",    ages: {} },
        { name: "Chimboy tumani",     ages: { web: 21, gd: 16, mob: 20 } },
        { name: "Ellikqal'a tumani",  ages: {} },
        { name: "Kegeyli tumani",     ages: { web: 24, gd: 18, mob: 20 } },
        { name: "Mo'ynoq tumani",     ages: {} },
        { name: "Nukus shahri",       ages: {} },
        { name: "Nukus tumani",       ages: { web: 22, gd: 20, mob: 19 } },
        { name: "Qo'ng'irot tumani",  ages: { web: 15, gd: 28, mob: 21 } },
        { name: "Qonliko'l tumani",   ages: {} },
        { name: "Qorao'zak tumani",   ages: { web: 25, gd: 26, mob: 17 } },
        { name: "Shumanay tumani",    ages: { web: 21, gd: 16, mob: 18 } },
        { name: "Taxiatosh tumani",   ages: {} },
        { name: "Taxtako'pir tumani", ages: { web: 17, gd: 14, mob: 16 } },
        { name: "To'rtko'l tumani",   ages: {} },
        { name: "Xo'jayli tumani",    ages: { web: 23, gd: 19, mob: 25 } }
      ]
    },
    { name: "Samarqand viloyati" },
    {
      name: "Sirdaryo viloyati",
      districts: [
        { name: "Boyovut tumani" },
        { name: "Guliston shahri" },
        { name: "Guliston tumani" },
        { name: "Mirzaobod tumani" },
        { name: "Oqoltin tumani" },
        { name: "Sardoba tumani" },
        { name: "Sayxunobod tumani" },
        { name: "Shirin shahri",   date: "2026-10-07", participated: 7,  absent: 2, web: [85, 84, 80], gd: [84, 80], mob: [85, 82] },
        { name: "Sirdaryo tumani" },
        { name: "Xovos tumani" },
        { name: "Yangiyer shahri", date: "2026-10-07", participated: 12, absent: 3, web: [70], gd: [], mob: [70, 60, 50], note: "\"Grafik dizayn\" yo'nalishi bayonnomada yo'q" }
      ]
    },
    { name: "Surxondaryo viloyati" },
    { name: "Toshkent viloyati" },
    { name: "Toshkent shahri" }
  ]
};
