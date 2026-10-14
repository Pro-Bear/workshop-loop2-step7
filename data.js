// "Zamonaviy kasblar" tanlovi — monitoring ma'lumotlari.
// Manba: tuman bayonnomalari/dalolatnomalari (PDF), g'oliblar jadvali (XLSX),
// Xo'jayli ma'lumotnomasi va "Endi o'tkaziladiganlar" jadvali (DOCX).
// Faqat raqamlar saqlanadi: F.I.O, telefon, pasport ma'lumotlari kiritilmagan.
//
// Tuman maydonlari:
//   name         — "<nom> tumani" yoki "<nom> shahri" (tarjima shu ko'rinishdan olinadi)
//   date         — tanlov o'tkazilgan sana (YYYY-MM-DD)
//   held         — sana yo'q, lekin tanlov o'tkazilgani ma'lum
//   scheduled    — rejalashtirilgan sana ("tbd" — sana belgilanmagan), venue — o'tkazilish joyi
//   participated — ishtirok etganlar, absent — uzrli sabab bilan kelmaganlar
//   web/gd/mob   — 1-, 2-, 3-o'rin ballari; null — ball yozilmagan; [] — yo'nalish bayonnomada yo'q
//   scale        — ball shkalasi (standart 100), statistikada 100 ga keltiriladi
//   firsts       — faqat g'oliblar jadvali: qaysi yo'nalishda 1-o'rin g'olibi bor
//   byMajor      — yo'nalishlar bo'yicha ishtirokchilar soni
//   notes        — qo'shimcha izoh kalitlari (i18n.js da tarjima qilingan)
//   photos       — { src, cap } — cap: i18n.js dagi izoh kaliti

window.TOURNAMENT = {
  asOf: "2026-10-14",
  stages: {
    district: { from: "2026-10-07", to: "2026-10-15" },
    region:   { from: "2026-10-20", to: "2026-10-25" },
    republic: { month: "2026-11" }
  },
  majors: ["web", "gd", "mob"],
  regions: [
    { key: "andijon" },
    {
      key: "buxoro",
      districts: [
        { name: "Buxoro shahri", scheduled: "2026-10-15", venue: "Buxoro shahar 1-son texnikumi" }
      ]
    },
    {
      key: "fargona",
      districts: [
        { name: "Bag'dod tumani",     scheduled: "2026-10-15", venue: "Bag'dod tumani 2-son texnikumi" },
        { name: "Buvayda tumani",     scheduled: "2026-10-15", venue: "Buvayda tumani 2-texnikum" },
        { name: "Farg'ona shahri",    scheduled: "2026-10-15", venue: "Farg'ona shahar Yoshlar markazi" },
        { name: "Farg'ona tumani",    scheduled: "tbd",        venue: "Farg'ona tumani IT-markaz" },
        { name: "Furqat tumani",      scheduled: "2026-10-15", venue: "Tuman politexnikumi" },
        { name: "Oltiariq tumani",    scheduled: "2026-10-15", venue: "Oltiariq tumani Yoshlar markazi" },
        { name: "Qo'shtepa tumani",   scheduled: "2026-10-15", venue: "Shaxartepa MFY, 2-son texnikum" },
        { name: "Quva tumani",        scheduled: "2026-10-15", venue: "Quva tumani 1-son politexnikumi" },
        { name: "Rishton tumani",     scheduled: "2026-10-15", venue: "IT markazi" },
        { name: "So'x tumani",        scheduled: "2026-10-15", venue: "So'x texnikumi" },
        { name: "Uchko'prik tumani",  scheduled: "2026-10-15", venue: "Begobod MFY 2-son texnikumi" },
        { name: "Yozyovon tumani",    scheduled: "2026-10-15", venue: "2-sonli kasb-hunar texnikumi" }
      ]
    },
    {
      key: "jizzax",
      districts: [
        { name: "Arnasoy tumani",         date: "2026-10-09", participated: 15,  absent: 4,  web: [70, 50],       gd: [70, 50, 45], mob: [65, 60, 55] },
        { name: "Baxmal tumani",          date: "2026-10-10", participated: 30,  absent: 5,  web: [null, null, null], gd: [null, null, null], mob: [null, null, null] },
        { name: "Do'stlik tumani",        date: "2026-10-10", participated: 42,  absent: 12, web: [70, 60, 50],   gd: [50, 40, 30], mob: [60, 40, 30] },
        { name: "Forish tumani" },
        { name: "G'allaorol tumani",      date: "2026-10-07", participated: 85,  absent: 11, web: [90, 80, 70],   gd: [80, 70, 60], mob: [80, 70, 60] },
        { name: "Jizzax shahri",          date: "2026-10-10", participated: 40,  absent: 3,  web: [80, 60, 50],   gd: [90, 60, 40], mob: [80, 50, 40] },
        { name: "Mirzacho'l tumani",      date: "2026-10-09", participated: 79,  absent: 19, web: [60, 50, 30],   gd: [80, 60, 50], mob: [40, 30, 20] },
        { name: "Paxtakor tumani",        date: "2026-10-08", participated: 32,  absent: 6,  web: [null, null, null], gd: [null, null, null], mob: [null, null, null], notes: ["placesOnly"] },
        { name: "Sharof Rashidov tumani", date: "2026-10-07", participated: 383, absent: 42, web: [87, 66, 48],   gd: [88, 73, 38], mob: [81, 75, 56] },
        { name: "Yangiobod tumani",       date: "2026-10-10", participated: 55,  absent: 12, web: [65, 40, 30],   gd: [85, 55, 40], mob: [65, 40, 35] },
        { name: "Zafarobod tumani",       date: "2026-10-07", participated: 75,  absent: 14, web: [70, 40, 30],   gd: [80, 60, 40], mob: [80, 60, 50] },
        { name: "Zarbdor tumani",         date: "2026-10-10", web: [100, 80, 70], gd: [80, 70, 60], mob: [100, 90, 80] },
        { name: "Zomin tumani",           date: "2026-10-12", participated: 62,  absent: 60, web: [60],           gd: [60, 50, 40], mob: [60, 50, 40] }
      ]
    },
    {
      key: "xorazm",
      districts: [
        { name: "Bog'ot tumani",       scheduled: "2026-10-15", venue: "IT PARK" },
        { name: "Gurlan tumani",       scheduled: "2026-10-15", venue: "IT PARK" },
        { name: "Qo'shko'pir tumani",  scheduled: "2026-10-15", venue: "Tuman IT markazi" },
        { name: "Shovot tumani",       scheduled: "2026-10-15", venue: "Yoshlar markazi" },
        { name: "Tuproqqal'a tumani",  scheduled: "2026-10-15", venue: "IT PARK" },
        { name: "Urganch shahri",      scheduled: "2026-10-15", venue: "DATA union o'quv markazi" },
        { name: "Urganch tumani",      scheduled: "2026-10-15", venue: "IT PARK" },
        { name: "Xiva shahri",         scheduled: "2026-10-15", venue: "IT PARK" },
        { name: "Xiva tumani",         scheduled: "2026-10-15", venue: "IT PARK" },
        { name: "Xonqa tumani",        scheduled: "2026-10-15", venue: "IT PARK" },
        { name: "Yangiariq tumani",    scheduled: "2026-10-15", venue: "IT PARK" },
        { name: "Yangibozor tumani",   scheduled: "2026-10-15", venue: "Tuman IT markazi" }
      ]
    },
    {
      key: "namangan",
      districts: [
        { name: "Chortoq tumani",    scheduled: "2026-10-15", venue: "1-sonli texnikum" },
        { name: "Mingbuloq tumani",  scheduled: "2026-10-15", venue: "1-sonli texnikum" },
        { name: "Namangan shahri",   scheduled: "2026-10-15", venue: "Kelajak markazi" },
        { name: "Namangan tumani",   scheduled: "2026-10-15", venue: "3-sonli texnikum" },
        { name: "Norin tumani",      scheduled: "2026-10-15", venue: "1-sonli texnikum" },
        { name: "Pop tumani",        scheduled: "2026-10-15", venue: "2-sonli texnikum" }
      ]
    },
    { key: "navoiy" },
    {
      key: "qashqadaryo",
      regionStage: { date: "2026-10-15", venue: "Mono markaz binosi" },
      districts: [
        { name: "Chiroqchi tumani",   scheduled: "2026-10-15", venue: "Tuman IT markazi binosi" },
        { name: "Kasbi tumani",       scheduled: "2026-10-15", venue: "Tuman Yoshlar markazi" },
        { name: "Mirishkor tumani",   scheduled: "2026-10-15", venue: "Tuman Kelajak markazi binosi" },
        { name: "Muborak tumani",     scheduled: "2026-10-15", venue: "Tuman 34-maktab" },
        { name: "Qarshi tumani",      scheduled: "2026-10-15", venue: "Tuman Yoshlar markazi" },
        { name: "Shahrisabz shahri",  scheduled: "2026-10-15", venue: "Yoshlar markazi binosi" },
        { name: "Shahrisabz tumani",  scheduled: "2026-10-15", venue: "Tuman 1-sonli texnikum" }
      ]
    },
    {
      key: "qoraqalpogiston",
      // Faqat g'oliblar jadvali: har yo'nalishda 1-o'rin g'olibi bor-yo'qligi
      districts: [
        { name: "Amudaryo tumani",    firsts: ["web", "gd", "mob"] },
        { name: "Beruniy tumani",     firsts: ["mob"] },
        { name: "Bo'zatov tumani" },
        { name: "Chimboy tumani",     firsts: ["web", "gd", "mob"] },
        { name: "Ellikqal'a tumani" },
        { name: "Kegeyli tumani",     firsts: ["web", "gd", "mob"] },
        { name: "Mo'ynoq tumani" },
        { name: "Nukus shahri" },
        { name: "Nukus tumani",       firsts: ["web", "gd", "mob"] },
        { name: "Qo'ng'irot tumani",  firsts: ["web", "gd", "mob"] },
        { name: "Qonliko'l tumani" },
        { name: "Qorao'zak tumani",   firsts: ["web", "gd", "mob"] },
        { name: "Shumanay tumani",    firsts: ["web", "gd", "mob"] },
        { name: "Taxiatosh tumani" },
        { name: "Taxtako'pir tumani", firsts: ["web", "gd", "mob"] },
        { name: "To'rtko'l tumani" },
        {
          name: "Xo'jayli tumani", held: true, firsts: ["web", "gd", "mob"],
          participated: 25, byMajor: { web: 6, gd: 5, mob: 14 },
          photos: [
            { src: "img/xojayli/1.jpg", cap: "opening" },
            { src: "img/xojayli/2.jpg", cap: "team" },
            { src: "img/xojayli/3.jpg", cap: "prizes" },
            { src: "img/xojayli/4.jpg", cap: "registration" },
            { src: "img/xojayli/5.jpg", cap: "mobTask" }
          ],
          links: ["https://t.me/jaslar_xojeli/12576", "https://t.me/jaslar_xojeli/12578", "https://t.me/jaslar_xojeli/12589"]
        }
      ]
    },
    { key: "samarqand" },
    {
      key: "sirdaryo",
      districts: [
        {
          name: "Boyovut tumani", date: "2026-10-07",
          web: [null, null, null], gd: [null, null, null], mob: [null, null, null],
          photos: [
            { src: "img/boyovut/1.jpg", cap: "award" },
            { src: "img/boyovut/2.jpg", cap: "award" },
            { src: "img/boyovut/3.jpg", cap: "winners" }
          ]
        },
        { name: "Guliston shahri", date: "2026-10-07", participated: 21, absent: 0, web: [85, 84, 82], gd: [86, 82, 80], mob: [89, 85, 84] },
        {
          name: "Guliston tumani", date: "2026-10-07", participated: 25, absent: 5,
          web: [95, 85, 80], gd: [75, 70, 65], mob: [85, 80, 75],
          photos: [{ src: "img/guliston-tumani/1.jpg", cap: "collage" }]
        },
        {
          name: "Mirzaobod tumani", date: "2026-10-07", participated: 34, absent: 5, scale: 15,
          web: [15, 14, 13], gd: [15, 14, 13], mob: [15, 12, 11],
          byMajor: { web: 9, gd: 11, mob: 11 }, notes: ["sheetCount"],
          photos: [
            { src: "img/mirzaobod/1.jpg", cap: "doingTask" },
            { src: "img/mirzaobod/2.jpg", cap: "prizes" },
            { src: "img/mirzaobod/3.jpg", cap: "doingTask" },
            { src: "img/mirzaobod/4.jpg", cap: "compRoom" },
            { src: "img/mirzaobod/5.jpg", cap: "award" },
            { src: "img/mirzaobod/6.jpg", cap: "winners" }
          ]
        },
        { name: "Oqoltin tumani",    date: "2026-10-07", participated: 56, absent: 12, web: [90, 82, 70], gd: [], mob: [88, 84, 76] },
        { name: "Sardoba tumani",    date: "2026-10-07", participated: 12, absent: 0,  web: [], gd: [70, 50, 45], mob: [65, 60, 60] },
        { name: "Sayxunobod tumani", date: "2026-10-07", participated: 50, absent: 12, web: [83, 61, 52], gd: [85, 81, 72], mob: [90, 86, 67] },
        { name: "Shirin shahri",     date: "2026-10-07", participated: 7,  absent: 2,  web: [85, 84, 80], gd: [84, 80], mob: [85, 82] },
        { name: "Sirdaryo tumani",   date: "2026-10-10", participated: 30, absent: 5,  scale: 10, web: [9, 4, 3], gd: [10, 6, 4], mob: [10, 3, 2] },
        { name: "Xovos tumani",      date: "2026-10-07", participated: 13, absent: 7,  web: [80, 75, 60], gd: [75, 70, 55], mob: [90, 80, 65] },
        { name: "Yangiyer shahri",   date: "2026-10-07", participated: 12, absent: 3,  web: [70], gd: [], mob: [70, 60, 50] }
      ]
    },
    { key: "surxondaryo" },
    { key: "toshkentv" },
    { key: "toshkents" }
  ]
};
