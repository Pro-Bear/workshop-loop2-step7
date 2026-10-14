// "Zamonaviy kasblar" tanlovi — tuman/shahar bosqichi ma'lumotlari.
// Manba: tuman bayonnomalari (PDF) va Qoraqalpog'iston g'oliblar jadvali (XLSX).
// Faqat raqamlar saqlanadi, shaxsiy ma'lumotlar (F.I.O, telefon, pasport) kiritilmagan.
//
// Maydonlar:
//   date         — tanlov o'tkazilgan sana (YYYY-MM-DD), noma'lum bo'lsa null
//   participated — bayonnomadagi "N nafar yoshlar ishtirok etdi"
//   absent       — "uzrli sabablarga ko'ra ishtirok eta olmadi"
//   winners      — to'ldirilgan g'olib o'rinlari soni
//   slots        — jami g'olib o'rinlari (bayonnomada 3 yo'nalish x 3 o'rin = 9)
//   ages         — g'oliblarning yoshi (14.10.2026 holatiga), faqat XLSX'da mavjud
//   note         — bayonnomadagi e'tiborga molik holat

window.TOURNAMENT = {
  title: "Zamonaviy kasblar tanlovi",
  subtitle: "Besh tashabbus olimpiadasi · tuman (shahar) bosqichi",
  asOf: "2026-10-14",
  regions: [
    {
      name: "Jizzax viloyati",
      districts: [
        { name: "Arnasoy tumani",        date: "2026-10-09", participated: 15,  absent: 4,  winners: 8, slots: 9 },
        { name: "Baxmal tumani",         date: "2026-10-10", participated: 30,  absent: 5,  winners: 9, slots: 9, note: "Bayonnomada ballar ko'rsatilmagan" },
        { name: "Do'stlik tumani",       date: "2026-10-10", participated: 42,  absent: 12, winners: 9, slots: 9 },
        { name: "Forish tumani",         date: null },
        { name: "G'allaorol tumani",     date: "2026-10-07", participated: 85,  absent: 11, winners: 9, slots: 9 },
        { name: "Jizzax shahri",         date: "2026-10-10", participated: 40,  absent: 3,  winners: 9, slots: 9 },
        { name: "Mirzacho'l tumani",     date: "2026-10-09", participated: 79,  absent: 19, winners: 9, slots: 9 },
        { name: "Paxtakor tumani",       date: "2026-10-08", participated: 32,  absent: 6,  winners: 9, slots: 9 },
        { name: "Sharof Rashidov tumani", date: "2026-10-07", participated: 383, absent: 42, winners: 9, slots: 9 },
        { name: "Yangiobod tumani",      date: "2026-10-10", participated: 55,  absent: 12, winners: 9, slots: 9 },
        { name: "Zafarobod tumani",      date: "2026-10-07", participated: 75,  absent: 14, winners: 9, slots: 9 },
        { name: "Zarbdor tumani",        date: "2026-10-10", participated: null, absent: null, winners: 9, slots: 9, note: "Bayonnomada ishtirokchilar soni yozilmagan" },
        { name: "Zomin tumani",          date: "2026-10-12", participated: 62,  absent: 60, winners: 7, slots: 9 }
      ]
    },
    {
      name: "Sirdaryo viloyati",
      districts: [
        { name: "Boyovut tumani",    date: null },
        { name: "Guliston shahri",   date: null },
        { name: "Guliston tumani",   date: null },
        { name: "Mirzaobod tumani",  date: null },
        { name: "Oqoltin tumani",    date: null },
        { name: "Sardoba tumani",    date: null },
        { name: "Sayxunobod tumani", date: null },
        { name: "Shirin shahri",     date: "2026-10-07", participated: 7,  absent: 2, winners: 7, slots: 9 },
        { name: "Sirdaryo tumani",   date: null },
        { name: "Xovos tumani",      date: null },
        { name: "Yangiyer shahri",   date: "2026-10-07", participated: 12, absent: 3, winners: 4, slots: 9, note: "\"Grafik dizayn\" yo'nalishi bayonnomada yo'q" }
      ]
    },
    {
      name: "Qoraqalpog'iston Respublikasi",
      // Faqat g'oliblar jadvali kelgan: 3 yo'nalish x 1 g'olib, sana va ishtirokchilar soni yo'q
      districts: [
        { name: "Amudaryo tumani",    listOnly: true, winners: 3, slots: 3, ages: [22, 22, 17] },
        { name: "Beruniy tumani",     listOnly: true, winners: 1, slots: 3, ages: [17] },
        { name: "Bo'zatov tumani",    listOnly: true, winners: 0, slots: 3, ages: [] },
        { name: "Chimboy tumani",     listOnly: true, winners: 3, slots: 3, ages: [20, 21, 16] },
        { name: "Ellikqal'a tumani",  listOnly: true, winners: 0, slots: 3, ages: [] },
        { name: "Kegeyli tumani",     listOnly: true, winners: 3, slots: 3, ages: [20, 24, 18] },
        { name: "Mo'ynoq tumani",     listOnly: true, winners: 0, slots: 3, ages: [] },
        { name: "Nukus shahri",       listOnly: true, winners: 0, slots: 3, ages: [] },
        { name: "Nukus tumani",       listOnly: true, winners: 3, slots: 3, ages: [19, 22, 20] },
        { name: "Qo'ng'irot tumani",  listOnly: true, winners: 3, slots: 3, ages: [21, 15, 28] },
        { name: "Qonliko'l tumani",   listOnly: true, winners: 0, slots: 3, ages: [] },
        { name: "Qorao'zak tumani",   listOnly: true, winners: 3, slots: 3, ages: [17, 25, 26] },
        { name: "Shumanay tumani",    listOnly: true, winners: 3, slots: 3, ages: [18, 21, 16] },
        { name: "Taxiatosh tumani",   listOnly: true, winners: 0, slots: 3, ages: [] },
        { name: "Taxtako'pir tumani", listOnly: true, winners: 3, slots: 3, ages: [16, 17, 14] },
        { name: "To'rtko'l tumani",   listOnly: true, winners: 0, slots: 3, ages: [] },
        { name: "Xo'jayli tumani",    listOnly: true, winners: 3, slots: 3, ages: [25, 23, 19] }
      ]
    }
  ]
};
