(function () {
  var T = window.TOURNAMENT;
  var MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul",
    "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  var STAGES = ["Tanlov o'tkazildi", "Bayonnoma topshirildi", "Ishtirokchilar soni kiritildi", "G'oliblar aniqlandi"];

  var $ = function (id) { return document.getElementById(id); };

  // ---------- hisob-kitob ----------

  function places(d, key) {
    if (d.ages) return d.ages[key] != null ? [{ s: null, a: d.ages[key] }] : [];
    return (d[key] || []).map(function (s) { return { s: s }; });
  }

  function slotsPerMajor(d) { return d.ages ? 1 : 3; }

  function filled(d) {
    var n = 0;
    T.majors.forEach(function (m) { n += places(d, m.key).length; });
    return n;
  }

  function status(d) {
    if (d.date) return "done";
    if (d.ages && filled(d) > 0) return "partial";
    return "none";
  }

  function stages(d) {
    return [
      status(d) !== "none" ? 1 : 0,
      d.date ? 1 : 0,
      d.participated != null ? 1 : 0,
      filled(d) / (slotsPerMajor(d) * T.majors.length)
    ];
  }

  function level(d) {
    var s = stages(d);
    return Math.round((s[0] + s[1] + s[2] + s[3]) / 4 * 100);
  }

  function avg(list) {
    if (!list.length) return null;
    var sum = 0;
    list.forEach(function (x) { sum += x; });
    return sum / list.length;
  }

  function aggregate(districts) {
    var a = { total: districts.length, held: 0, participated: 0, absent: 0, reported: 0,
      ages: [], dates: [], levels: [] };
    districts.forEach(function (d) {
      if (status(d) !== "none") a.held++;
      if (d.participated != null) {
        a.participated += d.participated;
        a.absent += d.absent || 0;
        a.reported++;
      }
      if (d.ages) Object.keys(d.ages).forEach(function (k) { a.ages.push(d.ages[k]); });
      if (d.date) a.dates.push(d.date);
      a.levels.push(level(d));
    });
    a.dates.sort();
    a.level = a.levels.length ? Math.round(avg(a.levels)) : 0;
    return a;
  }

  function majorStats(districts, key) {
    var scores = [], winners = 0, firsts = 0;
    districts.forEach(function (d) {
      var p = places(d, key);
      winners += p.length;
      if (p.length) firsts++;
      p.forEach(function (x) { if (x.s != null) scores.push(x.s); });
    });
    return {
      winners: winners,
      firsts: firsts,
      avg: scores.length ? Math.round(avg(scores)) : null,
      max: scores.length ? Math.max.apply(null, scores) : null
    };
  }

  // ---------- formatlash ----------

  function fmtDate(iso) {
    var p = iso.split("-");
    return +p[2] + "-" + MONTHS[+p[1] - 1] + " " + p[0];
  }

  function fmtRange(dates) {
    if (!dates.length) return null;
    var a = dates[0], b = dates[dates.length - 1];
    if (a === b) return fmtDate(a);
    var pa = a.split("-"), pb = b.split("-");
    if (pa[0] === pb[0] && pa[1] === pb[1]) return +pa[2] + "–" + +pb[2] + "-" + MONTHS[+pa[1] - 1] + " " + pa[0];
    return fmtDate(a) + " – " + fmtDate(b);
  }

  function num(n) {
    return n == null ? "—" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- holat ----------

  var view = { type: "all" };

  function go(v) {
    view = v;
    render();
    if (window.innerWidth < 860) $("title").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]");
    if (!b) return;
    var p = b.dataset.go.split(":");
    if (p[0] === "all") go({ type: "all" });
    else if (p[0] === "region") go({ type: "region", r: +p[1] });
    else go({ type: "district", r: +p[1], d: +p[2] });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.matches("tr[data-go]")) e.target.click();
  });

  // ---------- bo'laklar ----------

  function card(label, value, hint, tone) {
    return '<div class="card card--' + tone + '"><div class="card__label">' + label + '</div><div class="card__value">' +
      value + '</div><div class="card__hint">' + (hint || "&nbsp;") + "</div></div>";
  }

  function ring(pct) {
    var r = 46, c = 2 * Math.PI * r;
    return '<svg class="ring" viewBox="0 0 110 110" aria-hidden="true">' +
      '<circle cx="55" cy="55" r="' + r + '" class="ring__bg"/>' +
      '<circle cx="55" cy="55" r="' + r + '" class="ring__fg" stroke-dasharray="' + c.toFixed(1) +
      '" stroke-dashoffset="' + (c * (1 - pct / 100)).toFixed(1) + '"/>' +
      '<text x="55" y="61" text-anchor="middle" class="ring__text">' + pct + "%</text></svg>";
  }

  function header(crumb, title, date, back) {
    $("back").innerHTML = back ? '<button class="btn3d btn3d--ghost" data-go="' + back.go + '">← ' + esc(back.label) + "</button>" : "";
    $("crumb").textContent = crumb;
    $("title").textContent = title;
    $("date").textContent = date || "Ma'lumot yo'q";
    $("date").classList.toggle("is-muted", !date);
  }

  function regionStatus(r) {
    if (!r.districts) return "none";
    var a = aggregate(r.districts);
    return a.held ? (a.dates.length ? "done" : "partial") : "none";
  }

  function renderSidebar() {
    var html = '<button class="btn3d nav' + (view.type === "all" ? " is-active" : "") + '" data-go="all">' +
      '<span class="nav__name">Respublika bo\'yicha</span><b>' + T.regions.length + "</b></button>";
    T.regions.forEach(function (r, ri) {
      var active = view.type !== "all" && view.r === ri;
      var info = r.districts ? aggregate(r.districts).held + "/" + r.districts.length : "—";
      html += '<button class="btn3d nav' + (active ? " is-active" : "") + '" data-go="region:' + ri + '">' +
        '<i class="dot dot--' + regionStatus(r) + '"></i><span class="nav__name">' + esc(r.name) + "</span><b>" + info + "</b></button>";
    });
    $("regions").innerHTML = html;
  }

  // ---------- ko'rinishlar ----------

  function renderAll() {
    var all = [];
    T.regions.forEach(function (r) { if (r.districts) all = all.concat(r.districts); });
    var a = aggregate(all);
    var withData = T.regions.filter(function (r) { return regionStatus(r) !== "none"; }).length;
    header(T.subtitle, "Respublika bo'yicha", fmtRange(a.dates));

    $("status").innerHTML = '<span class="badge badge--done"><i class="dot dot--done"></i>' + withData + " / " +
      T.regions.length + " hududdan ma'lumot kelgan</span>";

    var registered = a.participated + a.absent;
    var age = a.ages.length ? avg(a.ages).toFixed(1) : null;
    $("cards").innerHTML =
      card("Tumanlar (shaharlar)", a.held + "<small>/" + a.total + "</small>", "tanlov o'tkazilgan", "blue") +
      card("Ishtirok etgan yoshlar", num(a.participated), "ro'yxatdan o'tgan: " + num(registered), "green") +
      card("Ishtirok eta olmadi", num(a.absent), "uzrli sabablarga ko'ra", "orange") +
      card("O'rtacha yosh", age ? age : "—", age ? a.ages.length + " g'olib bo'yicha" : "", "violet");

    var rows = T.regions.map(function (r, ri) {
      if (!r.districts) {
        return '<tr data-go="region:' + ri + '" tabindex="0"><td><i class="dot dot--none"></i>' + esc(r.name) +
          '</td><td class="num muted">—</td><td class="num muted">—</td><td class="num muted">—</td></tr>';
      }
      var g = aggregate(r.districts);
      return '<tr data-go="region:' + ri + '" tabindex="0"><td><i class="dot dot--' + regionStatus(r) + '"></i>' + esc(r.name) +
        '</td><td class="num">' + g.held + "/" + g.total + '</td><td class="num">' + (g.reported ? num(g.participated) : "—") +
        '</td><td class="num">' + g.level + "%</td></tr>";
    }).join("");
    $("main-body").innerHTML = '<section class="panel"><h2 class="panel__title">Hududlar kesimida</h2><div class="table-wrap">' +
      '<table class="table"><thead><tr><th>Hudud</th><th class="num">O\'tkazildi</th><th class="num">Ishtirokchilar</th>' +
      '<th class="num">Jarayon</th></tr></thead><tbody>' + rows + "</tbody></table></div></section>";
  }

  function renderRegion(ri) {
    var r = T.regions[ri];
    if (!r.districts) {
      header("Viloyat", r.name, null, { go: "all", label: "Respublika" });
      $("status").innerHTML = '<span class="badge badge--none"><i class="dot dot--none"></i>Tuman bosqichi bayonnomalari hali kelmagan</span>';
      $("cards").innerHTML = "";
      $("main-body").innerHTML = '<section class="panel empty"><p>Bu hududdan bayonnoma yoki g\'oliblar ro\'yxati kelgach, ' +
        "tumanlar soni, ishtirokchilar va yo'nalishlar bo'yicha natijalar shu yerda ko'rinadi.</p></section>";
      return;
    }

    var a = aggregate(r.districts);
    header("Viloyat bo'yicha jami", r.name, fmtRange(a.dates), { go: "all", label: "Respublika" });

    var none = a.total - a.held;
    $("status").innerHTML = '<span class="badge badge--done"><i class="dot dot--done"></i>' + a.held + " / " + a.total +
      " tumanda o'tkazilgan</span>" +
      (none ? '<span class="badge badge--none"><i class="dot dot--none"></i>' + none + " ta tumandan ma'lumot yo'q</span>" : "");

    var registered = a.participated + a.absent;
    var rate = registered ? Math.round(a.participated / registered * 100) : null;
    var age = a.ages.length ? avg(a.ages).toFixed(1) : null;
    $("cards").innerHTML =
      card("Tumanlar (shaharlar)", a.held + "<small>/" + a.total + "</small>", "tanlov o'tkazilgan", "blue") +
      card("Ishtirok etgan yoshlar", num(a.reported ? a.participated : null),
        a.reported ? "ro'yxatdan o'tgan: " + num(registered) + (rate != null ? " · " + rate + "%" : "") : "bayonnomada son yo'q", "green") +
      card("Ishtirok eta olmadi", num(a.reported ? a.absent : null), "uzrli sabablarga ko'ra", "orange") +
      card("O'rtacha yosh", age || "—", age ? a.ages.length + " g'olib bo'yicha" : "bayonnomalarda yosh yo'q", "violet");

    var majors = T.majors.map(function (m) {
      var s = majorStats(r.districts, m.key);
      return '<div class="major major--' + m.key + '"><div class="major__name">' + m.short + "</div>" +
        '<dl class="major__stats">' +
        "<div><dt>G'oliblar</dt><dd>" + s.winners + "</dd></div>" +
        "<div><dt>Hududiy bosqichga</dt><dd>" + s.firsts + "</dd></div>" +
        "<div><dt>O'rtacha ball</dt><dd>" + (s.avg != null ? s.avg : "—") + "</dd></div>" +
        "<div><dt>Eng yuqori</dt><dd>" + (s.max != null ? s.max : "—") + "</dd></div>" +
        "</dl></div>";
    }).join("");

    var tiles = r.districts.map(function (d, di) {
      var st = status(d);
      var meta = d.date ? fmtDate(d.date).replace(/ \d{4}$/, "") : st === "partial" ? "g'oliblar ro'yxati" : "ma'lumot yo'q";
      return '<button class="btn3d tile tile--' + st + '" data-go="district:' + ri + ":" + di + '">' +
        '<span class="tile__top"><i class="dot dot--' + st + '"></i><span class="tile__name">' + esc(d.name) + "</span></span>" +
        '<span class="tile__meta"><span>' + meta + "</span><b>" + (d.participated != null ? num(d.participated) + " nafar" : "") +
        "</b></span></button>";
    }).join("");

    $("main-body").innerHTML =
      '<section class="panel"><h2 class="panel__title">Jarayon darajasi</h2><div class="progress">' + ring(a.level) +
      '<div class="progress__text"><b>' + a.held + "</b> ta tumanda o'tkazildi<br><b>" + none +
      '</b> ta tumandan ma\'lumot kutilmoqda<br><span class="muted">Tumanlar jarayon darajasining o\'rtachasi</span></div></div></section>' +
      '<section class="panel"><h2 class="panel__title">Yo\'nalishlar kesimida</h2><div class="majors">' + majors + "</div></section>" +
      '<section class="panel"><h2 class="panel__title">Tumanlar (shaharlar)<span class="muted"> — batafsil ko\'rish uchun bosing</span></h2>' +
      '<div class="tiles">' + tiles + "</div></section>";
  }

  function renderDistrict(ri, di) {
    var r = T.regions[ri], d = r.districts[di];
    var st = status(d);
    header(r.name, d.name, d.date ? fmtDate(d.date) : null, { go: "region:" + ri, label: r.name });

    var text = {
      done: "Tanlov o'tkazilgan, bayonnoma topshirilgan",
      partial: "Faqat g'oliblar ro'yxati kelgan: sana va ishtirokchilar soni yo'q",
      none: "Tanlov bo'yicha ma'lumot kelmagan"
    }[st];
    $("status").innerHTML = '<span class="badge badge--' + st + '"><i class="dot dot--' + st + '"></i>' + text + "</span>" +
      (d.note ? '<span class="badge badge--note">' + esc(d.note) + "</span>" : "");

    var registered = d.participated != null ? d.participated + (d.absent || 0) : null;
    var rate = registered ? Math.round(d.participated / registered * 100) : null;
    var ages = d.ages ? Object.keys(d.ages).map(function (k) { return d.ages[k]; }) : [];
    var age = ages.length ? avg(ages).toFixed(1) : null;
    $("cards").innerHTML =
      card("Ro'yxatdan o'tgan", num(registered), "Ustoz AI sertifikati bilan", "blue") +
      card("Ishtirok etdi", num(d.participated), rate != null ? rate + "% qatnashuv" : "", "green") +
      card("Ishtirok eta olmadi", num(d.absent), "uzrli sabablarga ko'ra", "orange") +
      card("O'rtacha yosh", age || "—", age ? "g'oliblar bo'yicha" : "bayonnomada yosh yo'q", "violet");

    var slots = slotsPerMajor(d);
    var majors = T.majors.map(function (m) {
      var p = places(d, m.key);
      var rows = "";
      for (var i = 0; i < slots; i++) {
        var x = p[i];
        var cls = "place place--" + (i + 1) + (x ? "" : " is-empty");
        var val, bar = 0;
        if (!x) val = "bo'sh";
        else if (x.s != null) { val = x.s + "<small>/100</small>"; bar = x.s; }
        else if (x.a != null) { val = x.a + " yosh"; }
        else val = "ball yo'q";
        rows += '<li class="' + cls + '"><span class="medal">' + (i + 1) + '</span><span class="place__bar"><span style="width:' +
          bar + '%"></span></span><span class="place__val">' + val + "</span></li>";
      }
      var sent = p.length ? '<span class="chip chip--ok">1-o\'rin hududiy bosqichga</span>' : '<span class="chip">G\'olib yo\'q</span>';
      return '<div class="major major--' + m.key + '"><div class="major__head"><div class="major__name">' + m.name +
        '</div><div class="major__count">' + p.length + "/" + slots + "</div></div>" +
        '<ol class="places">' + rows + "</ol>" + sent + "</div>";
    }).join("");

    var s = stages(d);
    var steps = STAGES.map(function (label, i) {
      var cls = s[i] >= 1 ? "done" : s[i] > 0 ? "partial" : "todo";
      var extra = i === 3 ? " <small>" + filled(d) + "/" + slots * T.majors.length + " o'rin</small>" : "";
      return '<li class="step step--' + cls + '"><span class="step__mark"></span><span>' + label + extra + "</span></li>";
    }).join("");

    $("main-body").innerHTML =
      '<section class="panel"><h2 class="panel__title">3 yo\'nalish bo\'yicha natijalar' +
      (d.ages ? '<span class="muted"> — 1-o\'rin g\'olibining yoshi</span>' : '<span class="muted"> — 1-, 2-, 3-o\'rin ballari</span>') +
      '</h2><div class="majors">' + majors + "</div></section>" +
      '<section class="panel"><h2 class="panel__title">Jarayon darajasi</h2><div class="progress">' + ring(level(d)) +
      '<ol class="steps">' + steps + "</ol></div></section>";
  }

  function render() {
    if (view.type === "district") renderDistrict(view.r, view.d);
    else if (view.type === "region") renderRegion(view.r);
    else renderAll();
    renderSidebar();
  }

  $("foot").textContent = "Ma'lumotlar " + fmtDate(T.asOf) + " holatiga. Nizom bo'yicha: 14–30 yosh, har yo'nalishda 100 ballik baholash, " +
    "tuman bosqichida 1-o'rin hududiy bosqichga yo'llanma oladi.";
  render();
})();
