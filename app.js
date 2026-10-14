(function () {
  var T = window.TOURNAMENT;
  var MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul",
    "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

  var STAGES = [
    "Tanlov o'tkazildi",
    "Bayonnoma topshirildi",
    "Ishtirokchilar soni kiritildi",
    "G'oliblar aniqlandi"
  ];

  // ---------- hisob-kitob ----------

  function status(d) {
    if (d.date) return "done";
    if (d.listOnly && d.winners > 0) return "partial";
    return "none";
  }

  function stages(d) {
    var held = !!d.date || (d.listOnly && d.winners > 0);
    return [
      held ? 1 : 0,
      d.date ? 1 : 0,
      d.participated != null ? 1 : 0,
      d.slots ? (d.winners || 0) / d.slots : 0
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
    var a = { participated: 0, absent: 0, reported: 0, ages: [], held: 0,
      levels: [], dates: [], total: districts.length };
    districts.forEach(function (d) {
      if (d.participated != null) {
        a.participated += d.participated;
        a.absent += d.absent || 0;
        a.reported++;
      }
      if (d.ages) a.ages = a.ages.concat(d.ages);
      if (status(d) !== "none") a.held++;
      if (d.date) a.dates.push(d.date);
      a.levels.push(level(d));
    });
    a.dates.sort();
    a.level = Math.round(avg(a.levels));
    return a;
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
    if (pa[0] === pb[0] && pa[1] === pb[1]) {
      return +pa[2] + "–" + +pb[2] + "-" + MONTHS[+pa[1] - 1] + " " + pa[0];
    }
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

  var $ = function (id) { return document.getElementById(id); };

  // ---------- sidebar ----------

  var selected = { type: "all" };

  function allDistricts() {
    var out = [];
    T.regions.forEach(function (r) { out = out.concat(r.districts); });
    return out;
  }

  function renderSidebar() {
    var q = $("search").value.trim().toLowerCase();
    var html = '<button class="item item--all' + (selected.type === "all" ? " is-active" : "") +
      '" data-type="all"><span>Barcha hududlar</span><b>' + allDistricts().length + "</b></button>";

    T.regions.forEach(function (r, ri) {
      var list = r.districts.filter(function (d) { return !q || d.name.toLowerCase().indexOf(q) !== -1; });
      if (q && !list.length) return;
      var agg = aggregate(r.districts);
      var active = selected.type === "region" && selected.r === ri;
      html += '<div class="group">' +
        '<button class="item item--region' + (active ? " is-active" : "") + '" data-type="region" data-r="' + ri + '">' +
        "<span>" + esc(r.name) + "</span><b>" + agg.held + "/" + agg.total + "</b></button>";
      list.forEach(function (d) {
        var di = r.districts.indexOf(d);
        var on = selected.type === "district" && selected.r === ri && selected.d === di;
        html += '<button class="item item--district' + (on ? " is-active" : "") + '" data-type="district" data-r="' +
          ri + '" data-d="' + di + '"><i class="dot dot--' + status(d) + '"></i><span>' + esc(d.name) + "</span></button>";
      });
      html += "</div>";
    });
    $("regions").innerHTML = html;
  }

  $("regions").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    selected = { type: b.dataset.type, r: +b.dataset.r, d: +b.dataset.d };
    render();
    if (window.innerWidth < 860) $("title").scrollIntoView({ behavior: "smooth" });
  });
  $("search").addEventListener("input", renderSidebar);

  // ---------- asosiy panel ----------

  function card(label, value, hint, accent) {
    return '<div class="card' + (accent ? " card--" + accent : "") + '"><div class="card__label">' + label +
      '</div><div class="card__value">' + value + '</div><div class="card__hint">' + (hint || "&nbsp;") + "</div></div>";
  }

  function ring(pct) {
    var r = 46, c = 2 * Math.PI * r;
    return '<svg class="ring" viewBox="0 0 110 110" aria-hidden="true">' +
      '<circle cx="55" cy="55" r="' + r + '" class="ring__bg"/>' +
      '<circle cx="55" cy="55" r="' + r + '" class="ring__fg" stroke-dasharray="' + c + '" stroke-dashoffset="' +
      (c * (1 - pct / 100)) + '"/>' +
      '<text x="55" y="61" text-anchor="middle" class="ring__text">' + pct + "%</text></svg>";
  }

  function renderDistrict(region, d) {
    var st = status(d);
    $("crumb").textContent = region.name;
    $("title").textContent = d.name;
    $("date").textContent = d.date ? fmtDate(d.date) : "Ma'lumot yo'q";
    $("date").className = "datebox__value" + (d.date ? "" : " is-muted");

    var statusText = {
      done: "Tanlov o'tkazilgan, bayonnoma topshirilgan",
      partial: "Faqat g'oliblar ro'yxati kelgan — bayonnoma, sana va ishtirokchilar soni yo'q",
      none: "Tanlov bo'yicha ma'lumot kelmagan"
    }[st];
    $("status").innerHTML = '<div class="badge badge--' + st + '"><i class="dot dot--' + st + '"></i>' + statusText + "</div>" +
      (d.note ? '<div class="note">' + esc(d.note) + "</div>" : "");

    var registered = d.participated != null ? d.participated + (d.absent || 0) : null;
    var rate = registered ? Math.round(d.participated / registered * 100) : null;
    var age = d.ages && d.ages.length ? avg(d.ages).toFixed(1) : null;

    $("cards").innerHTML =
      card("Jami yoshlar", num(registered), "ro'yxatdan o'tgan", "blue") +
      card("Ishtirok etdi", num(d.participated), rate != null ? rate + "% qatnashuv" : "", "green") +
      card("Ishtirok eta olmadi", num(d.absent), "uzrli sabablarga ko'ra", "orange") +
      card("O'rtacha yosh", age ? age + " yosh" : "—", age ? "g'oliblar bo'yicha" : "bayonnomada yosh yo'q", "violet");

    var s = stages(d);
    var steps = STAGES.map(function (label, i) {
      var v = s[i];
      var cls = v >= 1 ? "done" : v > 0 ? "partial" : "todo";
      var extra = i === 3 && d.slots ? " <small>" + (d.winners || 0) + "/" + d.slots + " o'rin</small>" : "";
      return '<li class="step step--' + cls + '"><span class="step__mark"></span><span>' + label + extra + "</span></li>";
    }).join("");
    $("progress").innerHTML = '<h2 class="panel__title">Jarayon darajasi</h2><div class="progress">' + ring(level(d)) +
      '<ol class="steps">' + steps + "</ol></div>";

    $("breakdown").innerHTML = "";
    $("breakdown").hidden = true;
  }

  function renderGroup(name, crumb, districts, showRegion) {
    var a = aggregate(districts);
    $("crumb").textContent = crumb;
    $("title").textContent = name;
    var range = fmtRange(a.dates);
    $("date").textContent = range || "Ma'lumot yo'q";
    $("date").className = "datebox__value" + (range ? "" : " is-muted");

    var none = a.total - a.held;
    $("status").innerHTML = '<div class="badge badge--done"><i class="dot dot--done"></i>' + a.held + " / " + a.total +
      " hududda tanlov o'tkazilgan</div>" +
      (none ? '<div class="badge badge--none"><i class="dot dot--none"></i>' + none + " ta hududdan ma'lumot yo'q</div>" : "");

    var registered = a.participated + a.absent;
    var rate = registered ? Math.round(a.participated / registered * 100) : null;
    var age = a.ages.length ? avg(a.ages).toFixed(1) : null;

    $("cards").innerHTML =
      card("Jami yoshlar", num(registered || null), a.reported + " ta hudud ma'lumoti", "blue") +
      card("Ishtirok etdi", num(a.reported ? a.participated : null), rate != null ? rate + "% qatnashuv" : "", "green") +
      card("Ishtirok eta olmadi", num(a.reported ? a.absent : null), "uzrli sabablarga ko'ra", "orange") +
      card("O'rtacha yosh", age ? age + " yosh" : "—", age ? a.ages.length + " g'olib bo'yicha" : "bayonnomada yosh yo'q", "violet");

    $("progress").innerHTML = '<h2 class="panel__title">Jarayon darajasi</h2><div class="progress">' + ring(a.level) +
      '<div class="progress__text"><b>' + a.held + "</b> ta hududda o'tkazildi<br><b>" + none +
      "</b> ta hududdan ma'lumot kutilmoqda<br><span class=\"muted\">Hududlar jarayon darajasining o'rtachasi</span></div></div>";

    var rows = districts.map(function (d) {
      return { d: d, lvl: level(d) };
    }).sort(function (x, y) { return y.lvl - x.lvl || (y.d.participated || 0) - (x.d.participated || 0); });
    var max = Math.max.apply(null, districts.map(function (d) { return d.participated || 0; })) || 1;

    var body = rows.map(function (row) {
      var d = row.d;
      var w = d.participated ? Math.max(2, d.participated / max * 100) : 0;
      return '<tr><td><i class="dot dot--' + status(d) + '"></i>' + esc(d.name) + "</td>" +
        "<td>" + (d.date ? fmtDate(d.date).replace(/ \d{4}$/, "") : "—") + "</td>" +
        '<td class="bar"><span style="width:' + w + '%"></span><em>' + num(d.participated) + "</em></td>" +
        '<td class="num">' + row.lvl + "%</td></tr>";
    }).join("");
    $("breakdown").hidden = false;
    $("breakdown").innerHTML = '<h2 class="panel__title">Hududlar kesimida</h2><div class="table-wrap"><table class="table">' +
      "<thead><tr><th>Hudud</th><th>Sana</th><th>Ishtirokchilar</th><th class=\"num\">Daraja</th></tr></thead><tbody>" +
      body + "</tbody></table></div>";
  }

  function render() {
    if (selected.type === "district") {
      var r = T.regions[selected.r];
      renderDistrict(r, r.districts[selected.d]);
    } else if (selected.type === "region") {
      var reg = T.regions[selected.r];
      renderGroup(reg.name, "Viloyat bo'yicha jami", reg.districts);
    } else {
      renderGroup("Barcha hududlar", T.subtitle, allDistricts());
    }
    renderSidebar();
    $("foot").textContent = "Ma'lumotlar " + fmtDate(T.asOf) + " holatiga. Manba: tuman bosqichi bayonnomalari va g'oliblar jadvali.";
  }

  render();
})();
