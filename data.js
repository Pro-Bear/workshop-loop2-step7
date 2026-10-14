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
//   scale        — ball shkalasi (standart 100); boshqa shkala bo'lsa, statistikada 100 ga keltiriladi
//   byMajor      — yo'nalishlar bo'yicha ishtirokchilar soni (agar hisobotda bo'lsa)
//   winnerAges   — dalolatnomadagi tug'ilgan sanalardan hisoblangan g'oliblar yoshi
//   ages         — faqat g'oliblar jadvalida: yo'nalish bo'yicha 1-o'rin g'olibining yoshi
//   photos/links — tadbir suratlari va yoritilish havolalari
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
        {
          name: "Xo'jayli tumani", ages: { web: 23, gd: 19, mob: 25 },
          participated: 25, byMajor: { web: 6, gd: 5, mob: 14 },
          note: "Ma'lumotnomada tanlov sanasi ko'rsatilmagan",
          photos: [
            { src: "img/xojayli/1.jpg", caption: "Tanlov ochilishi" },
            { src: "img/xojayli/2.jpg", caption: "Ishtirokchilar va ekspertlar guruhi" },
            { src: "img/xojayli/3.jpg", caption: "G'oliblar uchun sovg'alar va diplomlar" },
            { src: "img/xojayli/4.jpg", caption: "Ishtirokchilarni ro'yxatga olish" },
            { src: "img/xojayli/5.jpg", caption: "Mobilografiya yo'nalishi: amaliy vazifa" }
          ],
          links: ["https://t.me/jaslar_xojeli/12576", "https://t.me/jaslar_xojeli/12578", "https://t.me/jaslar_xojeli/12589"]
        }
      ]
    },
    { name: "Samarqand viloyati" },
    {
      name: "Sirdaryo viloyati",
      districts: [
        {
          name: "Boyovut tumani", date: "2026-10-07",
          web: [null, null, null], gd: [null, null, null], mob: [null, null, null],
          winnerAges: [17, 15, 28, 17, 27, 29, 16, 23, 21],
          note: "Dalolatnomada ishtirokchilar soni va ballar ko'rsatilmagan",
          photos: [
            { src: "img/boyovut/1.jpg", caption: "G'olibni taqdirlash" },
            { src: "img/boyovut/2.jpg", caption: "G'olibni taqdirlash" },
            { src: "img/boyovut/3.jpg", caption: "Tanlov g'oliblari va tashkilotchilar" }
          ]
        },
        { name: "Guliston shahri", date: "2026-10-07", participated: 21, absent: 0, web: [85, 84, 82], gd: [86, 82, 80], mob: [89, 85, 84] },
        {
          name: "Guliston tumani", date: "2026-10-07", participated: 25, absent: 5,
          web: [95, 85, 80], gd: [75, 70, 65], mob: [85, 80, 75],
          photos: [{ src: "img/guliston-tumani/1.jpg", caption: "Tanlovdan foto lavhalar" }]
        },
        {
          name: "Mirzaobod tumani", date: "2026-10-07", participated: 34, absent: 5, scale: 15,
          web: [15, 14, 13], gd: [15, 14, 13], mob: [15, 12, 11],
          byMajor: { web: 9, gd: 11, mob: 11 },
          note: "Ballar 15 ballik shkalada; baholash varaqalarida 31 nafar, bayonnomada 34 nafar",
          photos: [
            { src: "img/mirzaobod/1.jpg", caption: "Ishtirokchilar amaliy vazifani bajarmoqda" },
            { src: "img/mirzaobod/2.jpg", caption: "G'oliblar uchun sovg'alar" },
            { src: "img/mirzaobod/3.jpg", caption: "Amaliy vazifa jarayoni" },
            { src: "img/mirzaobod/4.jpg", caption: "Ishtirokchilar kompyuter xonasida" },
            { src: "img/mirzaobod/5.jpg", caption: "G'olibni taqdirlash" },
            { src: "img/mirzaobod/6.jpg", caption: "Tanlov g'oliblari" }
          ]
        },
        { name: "Oqoltin tumani", date: "2026-10-07", participated: 56, absent: 12, web: [90, 82, 70], gd: [], mob: [88, 84, 76], note: "\"Grafik dizayn\" yo'nalishi bayonnomada yo'q" },
        { name: "Sardoba tumani", date: "2026-10-07", participated: 12, absent: 0, web: [], gd: [70, 50, 45], mob: [65, 60, 60], note: "\"Veb-sayt\" yo'nalishi bayonnomada yo'q" },
        { name: "Sayxunobod tumani", date: "2026-10-07", participated: 50, absent: 12, web: [83, 61, 52], gd: [85, 81, 72], mob: [90, 86, 67] },
        { name: "Shirin shahri",   date: "2026-10-07", participated: 7,  absent: 2, web: [85, 84, 80], gd: [84, 80], mob: [85, 82] },
        { name: "Sirdaryo tumani", date: "2026-10-10", participated: 30, absent: 5, scale: 10, web: [9, 4, 3], gd: [10, 6, 4], mob: [10, 3, 2], note: "Ballar 10 ballik shkalada yozilgan" },
        { name: "Xovos tumani", date: "2026-10-07", participated: 13, absent: 7, web: [80, 75, 60], gd: [75, 70, 55], mob: [90, 80, 65] },
        { name: "Yangiyer shahri", date: "2026-10-07", participated: 12, absent: 3, web: [70], gd: [], mob: [70, 60, 50], note: "\"Grafik dizayn\" yo'nalishi bayonnomada yo'q" }
      ]
    },
    { name: "Surxondaryo viloyati" },
    { name: "Toshkent viloyati" },
    { name: "Toshkent shahri" }
  ]
};
