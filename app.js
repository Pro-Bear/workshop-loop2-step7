(function () {
  var T = window.TOURNAMENT;
  var MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul",
    "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  var STAGES = ["Tanlov o'tkazildi", "Bayonnoma topshirildi", "Ishtirokchilar soni kiritildi", "G'oliblar aniqlandi"];

  var $ = function (id) { return document.getElementById(id); };

  // ---------- hisob-kitob ----------

  function places(d, key) {
    if (d.ages) return d.ages[key] != null ? [{ s: null, a: d.ages[key] }] : [];
    var scale = d.scale || 100;
    return (d[key] || []).map(function (s) {
      return { s: s, scale: scale, pct: s == null ? null : s / scale * 100 };
    });
  }

  function slotsPerMajor(d) { return d.ages ? 1 : 3; }

  function filled(d) {
    var n = 0;
    T.majors.forEach(function (m) { n += places(d, m.key).length; });
    return n;
  }

  function status(d) {
    if (d.date || d.participated != null) return "done";
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

  function winnerAges(d) {
    if (d.winnerAges) return d.winnerAges;
    return d.ages ? Object.keys(d.ages).map(function (k) { return d.ages[k]; }) : [];
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
      a.ages = a.ages.concat(winnerAges(d));
      if (d.date) a.dates.push(d.date);
      a.levels.push(level(d));
    });
    a.dates.sort();
    a.level = a.levels.length ? Math.round(avg(a.levels)) : 0;
    return a;
  }

  function majorStats(districts, key) {
    var scores = [], winners = 0, firsts = 0, people = 0, reporting = 0;
    districts.forEach(function (d) {
      var p = places(d, key);
      winners += p.length;
      if (p.length) firsts++;
      p.forEach(function (x) { if (x.pct != null) scores.push(Math.round(x.pct)); });
      if (d.byMajor && d.byMajor[key] != null) { people += d.byMajor[key]; reporting++; }
    });
    return {
      winners: winners,
      firsts: firsts,
      people: people,
      reporting: reporting,
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
    if (!a.held) return "none";
    return r.districts.some(function (d) { return status(d) === "done"; }) ? "done" : "partial";
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

  // ---------- suratlar galereyasi ----------

  var gal = { timer: null, i: 0, n: 0, paused: false };
  var GAL_DELAY = 5000;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function regionPhotos(r) {
    var out = [];
    r.districts.forEach(function (d) {
      (d.photos || []).forEach(function (ph) { out.push({ src: ph.src, caption: ph.caption, place: d.name }); });
    });
    return out;
  }

  function gallery(photos, links) {
    if (!photos.length) return "";
    var places = [];
    photos.forEach(function (p) { if (places.indexOf(p.place) === -1) places.push(p.place); });
    var slides = photos.map(function (p, i) {
      return '<figure class="gallery__slide" aria-roledescription="slayd" aria-label="' + (i + 1) + " / " + photos.length + '">' +
        '<span class="gallery__backdrop" style="background-image:url(\'' + esc(p.src) + '\')"></span>' +
        '<img src="' + esc(p.src) + '" alt="' + esc(p.place + ": " + p.caption) + '" onload="this.parentNode.classList.toggle(\'is-portrait\', this.naturalHeight > this.naturalWidth * 0.8)">' +
        '<figcaption><span class="gallery__place">' + esc(p.place) + "</span>" + esc(p.caption) + "</figcaption></figure>";
    }).join("");
    var many = photos.length > 1;
    var dots = !many ? "" : photos.map(function (p, i) {
      return '<button class="gallery__dot" data-gal="' + i + '" aria-label="' + (i + 1) + '-surat"></button>';
    }).join("");
    var linkHtml = links && links.length ? '<div class="gallery__links"><span class="muted">Tadbir yoritilishi:</span>' +
      links.map(function (l) { return '<a href="' + esc(l) + '" target="_blank" rel="noopener">' + esc(l.replace(/^https?:\/\//, "")) + "</a>"; }).join("") +
      "</div>" : "";
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">Tadbirdan lavhalar</h2>' +
      '<span class="muted">' + esc(places.join(", ")) + " · " + photos.length + " ta surat</span></div>" +
      '<div class="gallery" id="gallery" aria-roledescription="karusel" tabindex="0">' +
      '<div class="gallery__viewport"><div class="gallery__track" id="gal-track">' + slides + "</div></div>" +
      (many ? '<button class="btn3d gallery__nav gallery__nav--prev" data-gal="prev" aria-label="Oldingi surat">&#8249;</button>' +
      '<button class="btn3d gallery__nav gallery__nav--next" data-gal="next" aria-label="Keyingi surat">&#8250;</button>' : "") +
      '<div class="gallery__count" id="gal-count"></div>' +
      '<div class="gallery__progress"><span id="gal-bar"></span></div>' +
      "</div>" + '<div class="gallery__dots">' + dots + "</div>" + linkHtml + "</section>";
  }

  function showSlide(i) {
    var track = $("gal-track");
    if (!track) return;
    gal.i = (i + gal.n) % gal.n;
    track.style.transform = "translateX(" + (-gal.i * 100) + "%)";
    $("gal-count").textContent = (gal.i + 1) + " / " + gal.n;
    document.querySelectorAll(".gallery__dot").forEach(function (d, k) {
      d.classList.toggle("is-active", k === gal.i);
      d.setAttribute("aria-current", k === gal.i ? "true" : "false");
    });
    var bar = $("gal-bar");
    bar.classList.remove("is-running");
    void bar.offsetWidth;
    if (!gal.paused && !reduceMotion && gal.n > 1) bar.classList.add("is-running");
    schedule();
  }

  function schedule() {
    clearTimeout(gal.timer);
    if (gal.paused || reduceMotion || gal.n < 2) return;
    gal.timer = setTimeout(function () { showSlide(gal.i + 1); }, GAL_DELAY);
  }

  function setPaused(p) {
    gal.paused = p;
    var g = $("gallery");
    if (g) g.classList.toggle("is-paused", p);
    if (p) clearTimeout(gal.timer);
    else showSlide(gal.i);
  }

  function startGallery() {
    var g = $("gallery");
    if (!g) return;
    gal.n = g.querySelectorAll(".gallery__slide").length;
    gal.paused = false;
    showSlide(0);
    g.addEventListener("mouseenter", function () { setPaused(true); });
    g.addEventListener("mouseleave", function () { setPaused(false); });
    g.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") showSlide(gal.i - 1);
      if (e.key === "ArrowRight") showSlide(gal.i + 1);
    });
    var x0 = null;
    g.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    g.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) showSlide(gal.i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  function stopGallery() {
    clearTimeout(gal.timer);
    gal.n = 0;
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-gal]");
    if (!b) return;
    var v = b.dataset.gal;
    showSlide(v === "prev" ? gal.i - 1 : v === "next" ? gal.i + 1 : +v);
  });

  document.addEventListener("visibilitychange", function () {
    if (!gal.n) return;
    if (document.hidden) clearTimeout(gal.timer);
    else if (!gal.paused) showSlide(gal.i);
  });

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
      '<th class="num">Jarayon</th></tr></thead><tbody>' + rows + "</tbody></table></div></section>" +
      gallery([].concat.apply([], T.regions.filter(function (r) { return r.districts; }).map(regionPhotos)));
    startGallery();
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
      var who = s.reporting ? '<div class="major__sub">Ishtirokchilar: <b>' + s.people + " nafar</b> (" + s.reporting + " tuman ma'lumoti)</div>" : "";
      return '<div class="major major--' + m.key + '"><div class="major__name">' + m.short + "</div>" + who +
        '<dl class="major__stats">' +
        "<div><dt>G'oliblar</dt><dd>" + s.winners + "</dd></div>" +
        "<div><dt>Hududiy bosqichga</dt><dd>" + s.firsts + "</dd></div>" +
        "<div><dt>O'rtacha ball</dt><dd>" + (s.avg != null ? s.avg : "—") + "</dd></div>" +
        "<div><dt>Eng yuqori</dt><dd>" + (s.max != null ? s.max : "—") + "</dd></div>" +
        "</dl></div>";
    }).join("");

    var tiles = r.districts.map(function (d, di) {
      var st = status(d);
      var meta = d.date ? fmtDate(d.date).replace(/ \d{4}$/, "") : st === "partial" ? "g'oliblar ro'yxati" : st === "done" ? "o'tkazilgan" : "ma'lumot yo'q";
      return '<button class="btn3d tile tile--' + st + '" data-go="district:' + ri + ":" + di + '">' +
        '<span class="tile__top"><i class="dot dot--' + st + '"></i><span class="tile__name">' + esc(d.name) + "</span>" +
        (d.photos ? '<span class="tile__photo" title="Suratlar bor">' + d.photos.length + " surat</span>" : "") + "</span>" +
        '<span class="tile__meta"><span>' + meta + "</span><b>" + (d.participated != null ? num(d.participated) + " nafar" : "") +
        "</b></span></button>";
    }).join("");

    $("main-body").innerHTML =
      '<section class="panel"><h2 class="panel__title">Jarayon darajasi</h2><div class="progress">' + ring(a.level) +
      '<div class="progress__text"><b>' + a.held + "</b> ta tumanda o'tkazildi<br><b>" + none +
      '</b> ta tumandan ma\'lumot kutilmoqda<br><span class="muted">Tumanlar jarayon darajasining o\'rtachasi</span></div></div></section>' +
      '<section class="panel"><h2 class="panel__title">Yo\'nalishlar kesimida</h2><div class="majors">' + majors + "</div></section>" +
      '<section class="panel"><h2 class="panel__title">Tumanlar (shaharlar)<span class="muted"> — batafsil ko\'rish uchun bosing</span></h2>' +
      '<div class="tiles">' + tiles + "</div></section>" + gallery(regionPhotos(r));
    startGallery();
  }

  function renderDistrict(ri, di) {
    var r = T.regions[ri], d = r.districts[di];
    var st = status(d);
    header(r.name, d.name, d.date ? fmtDate(d.date) : null, { go: "region:" + ri, label: r.name });
    if (!d.date && st === "done") $("date").textContent = "Ko'rsatilmagan";

    var text = {
      done: "Tanlov o'tkazilgan, bayonnoma topshirilgan",
      partial: "Faqat g'oliblar ro'yxati kelgan: sana va ishtirokchilar soni yo'q",
      report: "Tanlov o'tkazilgan, ma'lumotnoma topshirilgan",
      none: "Tanlov bo'yicha ma'lumot kelmagan"
    }[st === "done" && !d.date ? "report" : st];
    $("status").innerHTML = '<span class="badge badge--' + st + '"><i class="dot dot--' + st + '"></i>' + text + "</span>" +
      (d.note ? '<span class="badge badge--note">' + esc(d.note) + "</span>" : "");

    var registered = d.participated != null ? d.participated + (d.absent || 0) : null;
    var rate = registered ? Math.round(d.participated / registered * 100) : null;
    var ages = winnerAges(d);
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
        else if (x.s != null) { val = x.s + "<small>/" + x.scale + "</small>"; bar = x.pct; }
        else if (x.a != null) { val = x.a + " yosh"; }
        else val = "ball yo'q";
        rows += '<li class="' + cls + '"><span class="medal">' + (i + 1) + '</span><span class="place__bar"><span style="width:' +
          bar + '%"></span></span><span class="place__val">' + val + "</span></li>";
      }
      var sent = p.length ? '<span class="chip chip--ok">1-o\'rin hududiy bosqichga</span>' : '<span class="chip">G\'olib yo\'q</span>';
      var who = d.byMajor && d.byMajor[m.key] != null ?
        '<div class="major__sub">Ishtirokchilar: <b>' + d.byMajor[m.key] + " nafar</b></div>" : "";
      return '<div class="major major--' + m.key + '"><div class="major__head"><div class="major__name">' + m.name +
        '</div><div class="major__count">' + p.length + "/" + slots + "</div></div>" + who +
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
      '<ol class="steps">' + steps + "</ol></div></section>" +
      gallery((d.photos || []).map(function (ph) { return { src: ph.src, caption: ph.caption, place: d.name }; }), d.links);
    startGallery();
  }

  function render() {
    stopGallery();
    if (view.type === "district") renderDistrict(view.r, view.d);
    else if (view.type === "region") renderRegion(view.r);
    else renderAll();
    renderSidebar();
  }

  $("foot").textContent = "Ma'lumotlar " + fmtDate(T.asOf) + " holatiga. Nizom bo'yicha: 14–30 yosh, har yo'nalishda 100 ballik baholash, " +
    "tuman bosqichida 1-o'rin hududiy bosqichga yo'llanma oladi.";
  render();
})();
