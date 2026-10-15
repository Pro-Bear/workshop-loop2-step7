(function () {
  var T = window.TOURNAMENT, L = window.I18N;
  var MAJORS = T.majors;
  var GAL_DELAY = 3000;
  var FB_VER = "10.12.2";

  // ---------- ma'lumotlar qatlami: asl ma'lumot + admin o'zgarishlari ----------

  var BASE = JSON.parse(JSON.stringify(T.regions));
  var store = { mode: "local", overrides: {}, db: null, auth: null, user: null };

  function docId(regionKey, name) {
    return regionKey + "__" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function applyOverrides() {
    var regions = JSON.parse(JSON.stringify(BASE));
    Object.keys(store.overrides).forEach(function (id) {
      var o = store.overrides[id];
      var r = regions.filter(function (x) { return x.key === o.region; })[0];
      if (!r || !o.name) return;
      r.districts = r.districts || [];
      var d = r.districts.filter(function (x) { return x.name === o.name; })[0];
      if (!d) { d = { name: o.name }; r.districts.push(d); }
      var baseVenue = d.venue;
      ["date", "held", "scheduled", "venue", "participated", "absent", "firsts", "byMajor", "scale", "web", "gd", "mob", "notes"]
        .forEach(function (k) { delete d[k]; });
      if (o.status === "scheduled") {
        d.scheduled = o.date || "tbd";
        d.venue = o.venue || baseVenue;
      } else {
        if (o.date) d.date = o.date; else d.held = true;
        if (o.participated != null) d.participated = o.participated;
        if (o.absent != null) d.absent = o.absent;
        var by = {};
        MAJORS.forEach(function (k) {
          var m = (o.majors || {})[k] || {};
          var w = Math.max(0, Math.min(3, m.winners || 0));
          var sc = (m.scores || []).slice(0, w);
          while (sc.length < w) sc.push(null);
          d[k] = sc;
          if (m.people != null) by[k] = m.people;
        });
        if (Object.keys(by).length) d.byMajor = by;
      }
      d.edited = true;
    });
    T.regions = regions;
  }

  function loadLocal() {
    try { store.overrides = JSON.parse(localStorage.getItem("zk-overrides") || "{}") || {}; } catch (e) { store.overrides = {}; }
  }
  function saveLocal() {
    try { localStorage.setItem("zk-overrides", JSON.stringify(store.overrides)); } catch (e) {}
  }

  function fbConfigured() {
    var c = window.FIREBASE_CONFIG;
    return !!(c && c.apiKey && c.projectId);
  }

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var el = document.createElement("script");
      el.src = src; el.onload = res; el.onerror = rej;
      document.head.appendChild(el);
    });
  }

  function setOverridesFromSnap(snap) {
    var o = {};
    snap.forEach(function (doc) { o[doc.id] = doc.data(); });
    store.overrides = o;
  }

  function initFirebase() {
    if (!fbConfigured()) return;
    var base = "https://www.gstatic.com/firebasejs/" + FB_VER + "/";
    loadScript(base + "firebase-app-compat.js")
      .then(function () { return Promise.all([loadScript(base + "firebase-auth-compat.js"), loadScript(base + "firebase-firestore-compat.js")]); })
      .then(function () {
        firebase.initializeApp(window.FIREBASE_CONFIG);
        store.mode = "firebase";
        store.db = firebase.firestore();
        store.auth = firebase.auth();
        store.auth.onAuthStateChanged(function (u) { store.user = u; if (!$("admin").hidden) renderAdmin(); });
        store.db.collection("districts").onSnapshot(function (snap) {
          setOverridesFromSnap(snap);
          applyOverrides();
          render(false);
        }, function (err) { console.warn("Firestore:", err); });
        renderTools();
      })
      .catch(function (e) { console.warn("Firebase:", e); store.mode = "local"; });
  }

  function fetchData() {
    if (store.mode === "firebase") return store.db.collection("districts").get().then(setOverridesFromSnap);
    loadLocal();
    return Promise.resolve();
  }

  function saveOverride(id, doc) {
    if (store.mode === "firebase") {
      doc.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      doc.updatedBy = store.user ? store.user.email : null;
      return store.db.collection("districts").doc(id).set(doc);
    }
    doc.updatedAt = new Date().toISOString();
    store.overrides[id] = doc;
    saveLocal();
    return Promise.resolve();
  }

  function removeOverride(id) {
    if (store.mode === "firebase") return store.db.collection("districts").doc(id).delete();
    delete store.overrides[id];
    saveLocal();
    return Promise.resolve();
  }

  // ---------- kunduzgi / tungi rejim ----------

  var theme = null;
  try { theme = localStorage.getItem("zk-theme"); } catch (e) {}
  function isDark() {
    if (theme) return theme === "dark";
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
  function applyTheme() {
    if (theme) document.documentElement.setAttribute("data-theme", theme);
    else document.documentElement.removeAttribute("data-theme");
  }
  applyTheme();

  var $ = function (id) { return document.getElementById(id); };

  // ---------- til ----------

  var lang = "uz";
  try { var saved = localStorage.getItem("zk-lang"); if (L.langs.indexOf(saved) !== -1) lang = saved; } catch (e) {}

  function t(key, a, b) {
    var s = (L.t[lang] && L.t[lang][key]) || L.t.uz[key] || key;
    return s.replace("{a}", a).replace("{b}", b);
  }

  function regionName(r) { return L.regions[r.key][lang]; }

  function dName(name) {
    if (lang === "uz") return name;
    var m = name.match(/^(.*) (tumani|shahri)$/);
    var base = m ? m[1] : name, city = m && m[2] === "shahri";
    if (lang === "ru") {
      var ru = L.ruNames[base] || base;
      return city ? "г. " + ru : ru + " р-н";
    }
    return base + (city ? " city" : " district");
  }

  // ---------- formatlash ----------

  function num(n) { return n == null ? "—" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function parts(iso) { var p = iso.split("-"); return { y: p[0], m: +p[1] - 1, d: +p[2] }; }

  function fmtDate(iso, noYear) {
    var p = parts(iso), mo = L.months[lang][p.m], y = noYear ? "" : " " + p.y;
    if (lang === "uz") return p.d + "-" + mo + y;
    return p.d + " " + mo + y;
  }

  function fmtRange(a, b) {
    if (!a) return null;
    if (!b || a === b) return fmtDate(a);
    var pa = parts(a), pb = parts(b);
    if (pa.m === pb.m && pa.y === pb.y) {
      var mo = L.months[lang][pa.m];
      return lang === "uz" ? pa.d + "–" + pb.d + "-" + mo + " " + pa.y : pa.d + "–" + pb.d + " " + mo + " " + pa.y;
    }
    return fmtDate(a) + " – " + fmtDate(b);
  }

  function fmtMonth(ym) {
    var p = ym.split("-");
    return L.monthsNom[lang][+p[1] - 1] + " " + p[0];
  }

  // ---------- hisob-kitob ----------

  function status(d) {
    if (d.date || d.held || d.participated != null || (d.firsts && d.firsts.length)) return "done";
    if (d.scheduled) return "scheduled";
    return "none";
  }

  function slotsPerMajor(d) { return d.firsts ? 1 : 3; }

  function places(d, key) {
    if (d.firsts) return d.firsts.indexOf(key) !== -1 ? [{ first: true }] : [];
    var scale = d.scale || 100;
    return (d[key] || []).map(function (s) { return { s: s, scale: scale, pct: s == null ? null : s / scale * 100 }; });
  }

  function filled(d) {
    var n = 0;
    MAJORS.forEach(function (k) { n += places(d, k).length; });
    return n;
  }

  function firstsCount(d) {
    var n = 0;
    if (status(d) !== "done") return 0;
    MAJORS.forEach(function (k) { if (places(d, k).length) n++; });
    return n;
  }

  function stages(d) {
    return [
      status(d) === "done" ? 1 : 0,
      d.date ? 1 : 0,
      d.participated != null ? 1 : 0,
      filled(d) / (slotsPerMajor(d) * MAJORS.length)
    ];
  }

  function level(d) {
    var s = stages(d);
    return Math.round((s[0] + s[1] + s[2] + s[3]) / 4 * 100);
  }

  function notes(d) {
    var out = [];
    (d.notes || []).forEach(function (k) { out.push(t("n_" + k)); });
    if (d.scale && d.scale !== 100) out.push(t("n_scale", d.scale));
    if (!d.firsts && status(d) === "done") {
      var all = [];
      MAJORS.forEach(function (k) { all = all.concat(places(d, k)); });
      if (all.length && all.every(function (x) { return x.s == null; }) && (d.notes || []).indexOf("placesOnly") === -1) out.push(t("n_noScores"));
      MAJORS.forEach(function (k) { if (Array.isArray(d[k]) && !d[k].length) out.push(t("n_missing", t("ms_" + k))); });
    }
    if (d.date && d.participated == null) out.push(t("n_noCount"));
    if (d.held && !d.date) out.push(t("n_noDate"));
    if (d.edited) out.push(t("a_edited"));
    return out;
  }

  function aggregate(list) {
    var a = { total: list.length, done: 0, scheduled: 0, none: 0, participated: 0, absent: 0, reported: 0,
      toRegion: 0, dates: [], sched: [] };
    list.forEach(function (d) {
      var st = status(d);
      a[st]++;
      if (d.participated != null) { a.participated += d.participated; a.absent += d.absent || 0; a.reported++; }
      a.toRegion += firstsCount(d);
      if (d.date) a.dates.push(d.date);
      if (d.scheduled && d.scheduled !== "tbd") a.sched.push(d.scheduled);
    });
    a.dates.sort(); a.sched.sort();
    return a;
  }

  function majorStats(list, key) {
    var scores = [], winners = 0, firsts = 0, people = 0, reporting = 0;
    list.forEach(function (d) {
      if (status(d) !== "done") return;
      var p = places(d, key);
      winners += p.length;
      if (p.length) firsts++;
      p.forEach(function (x) { if (x.pct != null) scores.push(x.pct); });
      if (d.byMajor && d.byMajor[key] != null) { people += d.byMajor[key]; reporting++; }
    });
    var sum = 0;
    scores.forEach(function (x) { sum += x; });
    return {
      winners: winners, firsts: firsts, people: people, reporting: reporting,
      avg: scores.length ? Math.round(sum / scores.length) : null,
      max: scores.length ? Math.round(Math.max.apply(null, scores)) : null
    };
  }

  function regionStatus(r) {
    if (!r.districts) return "none";
    var a = aggregate(r.districts);
    return a.done ? "done" : a.scheduled ? "scheduled" : "none";
  }

  function allDistricts() {
    var out = [];
    T.regions.forEach(function (r) { if (r.districts) out = out.concat(r.districts); });
    return out;
  }

  // ---------- belgilar ----------

  var ICON = {
    web: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M10 8.5 8 10.5l2 2M14 8.5l2 2-2 2"/></svg>',
    gd: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1a1.5 1.5 0 0 1 1.1-2.6H16a5 5 0 0 0 5-5C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="10.5" r="1.2"/><circle cx="11" cy="7" r="1.2"/><circle cx="15.5" cy="8.5" r="1.2"/></svg>',
    mob: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10.5 9.5v5l4-2.5z"/><path d="M11 18.5h2"/></svg>',
    done: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    scheduled: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    none: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 12h10"/></svg>',
    users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 4.8"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    away: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="8" r="3.5"/><path d="M3.5 20a6.5 6.5 0 0 1 11-4.7M16 16l5 5M21 16l-5 5"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8.5 20h7M10 17h4v3h-4z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.5-4.6L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.6L20 16M20 20v-4h-4"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>'
  };

  // ---------- holat va hodisalar ----------

  var view = { type: "all" };

  function go(v, scrollTo) {
    view = v;
    render(true);
    var target = scrollTo && $(scrollTo);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    else if (window.innerWidth < 860) $("title").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]");
    if (b) {
      var p = b.dataset.go.split(":");
      if (p[0] === "all") go({ type: "all" });
      else if (p[0] === "region") go({ type: "region", r: +p[1], d: null });
      else if (p[0] === "district") go({ type: "region", r: +p[1], d: +p[2] }, window.innerWidth < 1100 ? "detail" : null);
      return;
    }
    var l = e.target.closest("[data-lang]");
    if (l) {
      lang = l.dataset.lang;
      try { localStorage.setItem("zk-lang", lang); } catch (err) {}
      render(false);
      if (!$("admin").hidden) renderAdmin();
      return;
    }
    var act = e.target.closest("[data-act]");
    if (!act) return;
    if (act.dataset.act === "theme") {
      theme = isDark() ? "light" : "dark";
      try { localStorage.setItem("zk-theme", theme); } catch (err) {}
      applyTheme();
      renderTools();
    } else if (act.dataset.act === "refresh") {
      act.classList.add("is-spinning");
      fetchData().then(function () {
        applyOverrides();
        render(true);
        toast(t("refreshed"));
      }).catch(function (err) { toast(String(err && err.message || err), true); })
        .then(function () { setTimeout(function () { var b = document.querySelector("[data-act=refresh]"); if (b) b.classList.remove("is-spinning"); }, 600); });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.matches("[data-go]:not(button)")) e.target.click();
  });

  // tooltip
  var tip = $("tip");
  var tipEl = null;
  document.addEventListener("mouseover", function (e) {
    var el = e.target.closest("[data-tip]");
    if (el === tipEl) return;
    tipEl = el;
    if (!el) { tip.hidden = true; return; }
    tip.innerHTML = el.dataset.tip;
    tip.hidden = false;
  });
  var tipPos = null, tipFrame = 0;
  document.addEventListener("mousemove", function (e) {
    if (tip.hidden) return;
    tipPos = { x: e.clientX, y: e.clientY };
    if (tipFrame) return;
    tipFrame = requestAnimationFrame(function () {
      tipFrame = 0;
      var x = tipPos.x + 14, y = tipPos.y + 14, w = tip.offsetWidth, h = tip.offsetHeight;
      if (x + w > window.innerWidth - 8) x = tipPos.x - w - 14;
      if (y + h > window.innerHeight - 8) y = tipPos.y - h - 14;
      tip.style.transform = "translate(" + x + "px," + y + "px)";
    });
  }, { passive: true });

  // ---------- umumiy bo'laklar ----------

  function card(icon, label, value, hint, tone) {
    return '<div class="card card--' + tone + '"><div class="card__icon">' + ICON[icon] + '</div><div class="card__body">' +
      '<div class="card__label">' + label + '</div><div class="card__value">' + value + "</div>" +
      '<div class="card__hint">' + (hint || "&nbsp;") + "</div></div></div>";
  }

  function pill(st) {
    return '<span class="pill pill--' + st + '">' + ICON[st] + t("st_" + st) + "</span>";
  }

  function ring(pct) {
    var r = 46, c = 2 * Math.PI * r;
    return '<svg class="ring" viewBox="0 0 110 110" aria-hidden="true"><circle cx="55" cy="55" r="' + r + '" class="ring__bg"/>' +
      '<circle cx="55" cy="55" r="' + r + '" class="ring__fg" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' +
      (c * (1 - pct / 100)).toFixed(1) + '"/><text x="55" y="61" text-anchor="middle" class="ring__text">' + pct + "%</text></svg>";
  }

  function donut(a) {
    var segs = [["done", a.done], ["scheduled", a.scheduled], ["none", a.none]];
    var total = a.total || 1, r = 52, c = 2 * Math.PI * r, off = 0, gap = segs.filter(function (s) { return s[1]; }).length > 1 ? 3 : 0;
    var arcs = segs.map(function (s) {
      if (!s[1]) return "";
      var len = s[1] / total * c;
      var el = '<circle cx="70" cy="70" r="' + r + '" class="donut__seg donut__seg--' + s[0] + '" stroke-dasharray="' +
        Math.max(len - gap, 0.5).toFixed(2) + " " + c.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" data-tip="<b>' +
        esc(t("st_" + s[0])) + "</b>: " + s[1] + " (" + Math.round(s[1] / total * 100) + '%)"/>';
      off += len;
      return el;
    }).join("");
    var legend = segs.map(function (s) {
      return '<li><i class="sw sw--' + s[0] + '"></i><span>' + t("st_" + s[0]) + "</span><b>" + s[1] + "</b></li>";
    }).join("");
    return '<div class="donut"><svg viewBox="0 0 140 140" class="donut__svg" role="img" aria-label="' + esc(t("ch_status")) + '">' +
      '<circle cx="70" cy="70" r="' + r + '" class="donut__track"/><g transform="rotate(-90 70 70)">' + arcs + "</g>" +
      '<text x="70" y="68" text-anchor="middle" class="donut__num">' + a.done + "/" + a.total + "</text>" +
      '<text x="70" y="88" text-anchor="middle" class="donut__lbl">' + esc(t("st_done")) + "</text></svg>" +
      '<ul class="legend-list">' + legend + "</ul></div>";
  }

  function header(crumb, title, date, back) {
    $("back").innerHTML = back ? '<button class="btn3d btn3d--ghost" data-go="' + back.go + '">← ' + esc(back.label) + "</button>" : "";
    $("crumb").textContent = crumb;
    $("title").textContent = title;
    $("date").textContent = date || t("noData");
    $("date").classList.toggle("is-muted", !date);
  }

  function timeline(regionStage) {
    var now = T.asOf;
    var st = T.stages;
    var items = [
      { label: t("stDistrict"), when: fmtRange(st.district.from, st.district.to), from: st.district.from, to: st.district.to },
      { label: t("stRegion"), when: regionStage ? fmtDate(regionStage.date) : fmtRange(st.region.from, st.region.to),
        from: regionStage ? regionStage.date : st.region.from, to: regionStage ? regionStage.date : st.region.to },
      { label: t("stRepublic"), when: fmtMonth(st.republic.month), from: st.republic.month + "-01", to: st.republic.month + "-30" }
    ];
    var html = items.map(function (it, i) {
      var state = now > it.to ? "done" : now >= it.from ? "now" : "next";
      return '<li class="stage stage--' + state + '"><span class="stage__dot">' + (state === "done" ? ICON.done : i + 1) + "</span>" +
        '<div class="stage__text"><div class="stage__label">' + it.label + '</div><div class="stage__when">' + ICON.cal + esc(it.when) +
        '</div><span class="stage__state">' + t("s_" + state) + "</span></div></li>";
    }).join("");
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">' + t("timeline") + '</h2><span class="muted">' +
      t("today") + ": " + fmtDate(now) + '</span></div><ol class="stages">' + html + "</ol></section>";
  }

  function majorsPanel(list) {
    var cards = MAJORS.map(function (k) {
      var s = majorStats(list, k);
      var who = s.reporting ? '<div class="major__sub">' + t("ms_people", num(s.people)) + " · " + t("ms_peopleFrom", "", s.reporting) + "</div>" : "";
      return '<div class="major major--' + k + '"><div class="major__head"><span class="major__icon">' + ICON[k] + "</span>" +
        '<div class="major__name">' + t("m_" + k) + "</div></div>" + who +
        '<dl class="major__stats">' +
        "<div><dt>" + t("ms_winners") + "</dt><dd>" + num(s.winners) + "</dd></div>" +
        "<div><dt>" + t("ms_toRegion") + "</dt><dd>" + num(s.firsts) + "</dd></div>" +
        "</dl>" +
        '<div class="meter"><div class="meter__row"><span>' + t("ms_avg") + "</span><b>" + (s.avg != null ? s.avg : "—") + "</b></div>" +
        '<div class="meter__track" data-tip="' + esc(t("ms_avg")) + ": <b>" + (s.avg != null ? s.avg : "—") + "</b><br>" + esc(t("ms_max")) + ": <b>" +
        (s.max != null ? s.max : "—") + '</b>"><span class="meter__fill" style="width:' + (s.avg || 0) + '%"></span>' +
        (s.max != null ? '<span class="meter__max" style="left:' + s.max + '%"></span>' : "") + "</div>" +
        '<div class="meter__row meter__row--sub"><span>' + t("ms_max") + "</span><b>" + (s.max != null ? s.max : "—") + "</b></div></div></div>";
    }).join("");
    return '<section class="panel"><h2 class="panel__title">' + t("majorsTitle") + '</h2><div class="majors">' + cards + "</div></section>";
  }

  function attendanceBars(rows, title) {
    // rows: { label, a (ishtirok), b (kelmadi), go }
    rows = rows.filter(function (r) { return r.a != null; }).sort(function (x, y) { return (y.a + y.b) - (x.a + x.b); });
    if (!rows.length) return "";
    var max = Math.max.apply(null, rows.map(function (r) { return r.a + r.b; })) || 1;
    var body = rows.map(function (r) {
      var tipTxt = "<b>" + esc(r.label) + "</b><br>" + esc(t("ch_attended")) + ": " + num(r.a) + "<br>" + esc(t("ch_absent")) + ": " + num(r.b);
      return '<div class="hbar"' + (r.go ? ' data-go="' + r.go + '" tabindex="0" role="button"' : "") + ' data-tip="' + tipTxt + '">' +
        '<span class="hbar__label">' + esc(r.label) + '</span><span class="hbar__track">' +
        '<span class="hbar__seg hbar__seg--a' + (r.b ? " is-joined" : "") + '" style="width:' + (r.a / max * 100) + '%"></span>' +
        (r.b ? '<span class="hbar__seg hbar__seg--b" style="width:' + (r.b / max * 100) + '%"></span>' : "") +
        '</span><span class="hbar__val">' + num(r.a) + "</span></div>";
    }).join("");
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">' + title + '</h2><ul class="keys">' +
      '<li><i class="sw sw--a"></i>' + t("ch_attended") + '</li><li><i class="sw sw--b"></i>' + t("ch_absent") + "</li></ul></div>" +
      '<div class="hbars">' + body + "</div></section>";
  }

  // ---------- suratlar galereyasi ----------

  var gal = { timer: null, i: 0, n: 0, paused: false };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function photosOf(r, list) {
    var out = [];
    list.forEach(function (d) {
      (d.photos || []).forEach(function (ph) { out.push({ src: ph.src, cap: ph.cap, region: r, d: d }); });
    });
    return out;
  }

  function allPhotos() {
    var out = [];
    T.regions.forEach(function (r) { if (r.districts) out = out.concat(photosOf(r, r.districts)); });
    return out;
  }

  function gallery(photos, links) {
    if (!photos.length) return "";
    var many = photos.length > 1;
    var where = [];
    photos.forEach(function (p) { var n = dName(p.d.name); if (where.indexOf(n) === -1) where.push(n); });
    var slides = photos.map(function (p, i) {
      var place = regionName(p.region) + " · " + dName(p.d.name);
      return '<figure class="gallery__slide">' +
        '<span class="gallery__backdrop" style="background-image:url(\'' + esc(p.src) + '\')"></span>' +
        '<img src="' + esc(p.src) + '" alt="' + esc(place + ": " + t("c_" + p.cap)) + '"' + (i > 1 ? ' loading="lazy"' : "") + ' decoding="async"' +
        ' onload="this.parentNode.classList.toggle(\'is-portrait\', this.naturalHeight > this.naturalWidth * 0.8)">' +
        '<div class="gallery__top"><span class="gallery__place">' + ICON.map + esc(place) + "</span></div>" +
        "<figcaption>" + esc(t("c_" + p.cap)) + "</figcaption></figure>";
    }).join("");
    var dots = many ? photos.map(function (p, i) {
      return '<button class="gallery__dot" data-gal="' + i + '" aria-label="' + (i + 1) + '"></button>';
    }).join("") : "";
    var linkHtml = links && links.length ? '<div class="gallery__links"><span class="muted">' + t("links") + "</span>" +
      links.map(function (l) { return '<a href="' + esc(l) + '" target="_blank" rel="noopener">' + esc(l.replace(/^https?:\/\//, "")) + "</a>"; }).join("") +
      "</div>" : "";
    return '<section class="panel"><div class="panel__head"><h2 class="panel__title">' + t("photos") + "</h2>" +
      '<span class="muted">' + esc(where.join(", ")) + " · " + t("photosCount", photos.length) + "</span></div>" +
      '<div class="gallery" id="gallery" tabindex="0" aria-roledescription="carousel">' +
      '<div class="gallery__viewport"><div class="gallery__track" id="gal-track">' + slides + "</div></div>" +
      (many ? '<button class="btn3d gallery__nav gallery__nav--prev" data-gal="prev" aria-label="' + esc(t("prev")) + '">&#8249;</button>' +
        '<button class="btn3d gallery__nav gallery__nav--next" data-gal="next" aria-label="' + esc(t("next")) + '">&#8250;</button>' : "") +
      '<div class="gallery__count" id="gal-count"></div><div class="gallery__progress"><span id="gal-bar"></span></div></div>' +
      (many ? '<div class="gallery__dots">' + dots + "</div>" : "") + linkHtml + "</section>";
  }

  function showSlide(i) {
    var track = $("gal-track");
    if (!track || !gal.n) return;
    gal.i = (i + gal.n) % gal.n;
    track.style.transform = "translateX(" + (-gal.i * 100) + "%)";
    $("gal-count").textContent = (gal.i + 1) + " / " + gal.n;
    document.querySelectorAll(".gallery__dot").forEach(function (d, k) { d.classList.toggle("is-active", k === gal.i); });
    var bar = $("gal-bar");
    bar.classList.remove("is-running");
    void bar.offsetWidth;
    var run = !gal.paused && !reduceMotion && gal.n > 1 && galVisible && !document.hidden;
    if (run) bar.classList.add("is-running");
    clearTimeout(gal.timer);
    if (run) gal.timer = setTimeout(function () { showSlide(gal.i + 1); }, GAL_DELAY);
  }

  var galObserver = null, galVisible = true;

  function startGallery() {
    var g = $("gallery");
    clearTimeout(gal.timer);
    gal.n = 0;
    if (galObserver) { galObserver.disconnect(); galObserver = null; }
    if (!g) return;
    if ("IntersectionObserver" in window) {
      galVisible = false;
      galObserver = new IntersectionObserver(function (entries) {
        var v = entries[0].isIntersecting;
        if (v === galVisible) return;
        galVisible = v;
        if (v && !gal.paused) showSlide(gal.i); else clearTimeout(gal.timer);
      });
      galObserver.observe(g);
    }
    gal.n = g.querySelectorAll(".gallery__slide").length;
    gal.paused = false;
    showSlide(0);
    g.addEventListener("mouseenter", function () { gal.paused = true; g.classList.add("is-paused"); clearTimeout(gal.timer); });
    g.addEventListener("mouseleave", function () { gal.paused = false; g.classList.remove("is-paused"); showSlide(gal.i); });
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

  // ---------- sidebar ----------

  function renderSidebar() {
    var html = '<button class="btn3d nav' + (view.type === "all" ? " is-active" : "") + '" data-go="all">' +
      '<span class="nav__name">' + t("republic") + "</span><b>" + T.regions.length + "</b></button>";
    var rank = { done: 0, scheduled: 1, none: 2 };
    var order = T.regions.map(function (r, ri) { return ri; }).sort(function (x, y) {
      return rank[regionStatus(T.regions[x])] - rank[regionStatus(T.regions[y])] || x - y;
    });
    order.forEach(function (ri) {
      var r = T.regions[ri];
      var active = view.type === "region" && view.r === ri;
      var st = regionStatus(r);
      var info = r.districts ? aggregate(r.districts).done + "/" + r.districts.length : "—";
      html += '<button class="btn3d nav' + (active ? " is-active" : "") + '" data-go="region:' + ri + '">' +
        '<i class="dot dot--' + st + '"></i><span class="nav__name">' + esc(regionName(r)) + "</span><b>" + info + "</b></button>";
    });
    $("regions").innerHTML = html;
    $("legend").innerHTML = ["done", "scheduled", "none"].map(function (s) {
      return '<span><i class="dot dot--' + s + '"></i>' + t("st_" + s) + "</span>";
    }).join("");
    $("brand-title").textContent = t("brandTitle");
    $("brand-sub").textContent = t("brandSub");
    $("date-label").textContent = t("dateLabel");
    renderTools();
    document.documentElement.lang = lang;
  }

  // ---------- ko'rinishlar ----------

  function renderAll() {
    var all = allDistricts();
    var a = aggregate(all);
    header(t("subtitle"), t("republic"), fmtRange(a.dates[0], a.sched.length ? a.sched[a.sched.length - 1] : a.dates[a.dates.length - 1]));

    var rs = { done: 0, scheduled: 0, none: 0 };
    T.regions.forEach(function (r) { rs[regionStatus(r)]++; });
    $("status").innerHTML =
      '<span class="badge badge--done">' + ICON.done + t("regionsHeld", rs.done, T.regions.length) + "</span>" +
      (rs.scheduled ? '<span class="badge badge--scheduled">' + ICON.scheduled + t("regionsSched", rs.scheduled) + "</span>" : "") +
      (rs.none ? '<span class="badge badge--none">' + ICON.none + t("regionsNone", rs.none) + "</span>" : "");

    var registered = a.participated + a.absent;
    $("cards").innerHTML =
      card("map", t("k_districts"), num(a.done) + "<small>/" + num(a.total) + "</small>", t("k_districtsHint", "", num(a.total)), "green") +
      card("users", t("k_participants"), num(a.participated), t("k_registered", num(registered)), "blue") +
      card("away", t("k_absent"), num(a.absent), t("k_absentHint"), "orange") +
      card("trophy", t("k_toRegion"), num(a.toRegion), t("k_toRegionHint"), "violet");

    var regionRows = T.regions.map(function (r, ri) {
      var g = r.districts ? aggregate(r.districts) : null;
      var total = g ? g.total : 0, done = g ? g.done : 0;
      var state = done === 0 ? "none" : done === total ? "full" : "partial";
      var pct = total ? Math.round(done / total * 100) : 0;
      var tipTxt = "<b>" + esc(regionName(r)) + "</b><br>" + esc(t("rs_" + state)) +
        (g ? "<br>" + esc(t("st_done")) + ": " + done + " / " + total + (g.scheduled ? "<br>" + esc(t("st_scheduled")) + ": " + g.scheduled : "") : "");
      return '<div class="sbar sbar--' + state + '" data-go="region:' + ri + '" tabindex="0" role="button" data-tip="' + tipTxt + '">' +
        '<span class="sbar__label">' + esc(regionName(r)) + '</span><span class="sbar__track">' +
        '<span class="sbar__fill" style="width:' + (state === "none" ? 100 : pct) + '%">' + (state === "none" ? "" : pct + "%") + "</span></span>" +
        '<span class="sbar__val">' + (g ? done + "/" + total : "0") + "</span></div>";
    }).join("");

    var attendance = attendanceBars(T.regions.filter(function (r) { return r.districts; }).map(function (r) {
      var g = aggregate(r.districts);
      return { label: regionName(r), a: g.reported ? g.participated : null, b: g.absent, go: "region:" + T.regions.indexOf(r) };
    }), t("ch_participants"));

    $("main-body").innerHTML =
      timeline() +
      '<div class="grid-2"><section class="panel"><div class="panel__head"><h2 class="panel__title">' + t("ch_status") +
      '</h2><span class="muted">' + t("ch_statusNote", a.total) + "</span></div>" + donut(a) + "</section>" + attendance + "</div>" +
      '<section class="panel"><div class="panel__head"><h2 class="panel__title">' + t("ch_byRegion") + '</h2><ul class="keys">' +
      ["full", "partial", "none"].map(function (k) { return '<li><i class="sw sw--rs-' + k + '"></i>' + t("rs_" + k) + "</li>"; }).join("") +
      '</ul></div><div class="sbars">' + regionRows + "</div></section>" +
      majorsPanel(all) +
      upcomingPanel(T.regions) +
      gallery(allPhotos());
  }

  function upcomingPanel(regions) {
    var rows = [], count = 0;
    regions.forEach(function (r) {
      if (!r.districts) return;
      var list = r.districts.filter(function (d) { return status(d) === "scheduled"; });
      if (!list.length && !r.regionStage) return;
      var ri = T.regions.indexOf(r);
      count += list.length;
      rows.push('<div class="up-group"><div class="up-group__head" data-go="region:' + ri + '" tabindex="0" role="button">' + esc(regionName(r)) +
        "<b>" + list.length + "</b></div>" +
        (r.regionStage ? '<div class="up-row up-row--stage">' + ICON.trophy + "<span>" + t("regionStageAt", fmtDate(r.regionStage.date)) +
          '</span><span class="muted">' + esc(r.regionStage.venue) + "</span></div>" : "") +
        list.map(function (d) {
          return '<div class="up-row" data-go="district:' + ri + ":" + r.districts.indexOf(d) + '" tabindex="0" role="button">' + ICON.scheduled +
            '<span class="up-row__name">' + esc(dName(d.name)) + '</span><span class="up-row__date">' +
            (d.scheduled === "tbd" ? t("tbd") : fmtDate(d.scheduled, true)) + '</span><span class="up-row__venue muted">' + esc(d.venue || "") + "</span></div>";
        }).join("") + "</div>");
    });
    if (!rows.length) return "";
    return '<section class="panel panel--upcoming"><div class="panel__head"><h2 class="panel__title"><span class="title-icon">' + ICON.scheduled +
      "</span>" + t("upcoming") + '</h2><span class="muted">' + t("upcomingHint", count) + '</span></div><div class="up-groups">' + rows.join("") + "</div></section>";
  }

  function renderRegion(ri, di) {
    var r = T.regions[ri];
    var back = { go: "all", label: t("republicShort") };
    if (!r.districts) {
      header(t("regionTotal"), regionName(r), null, back);
      $("status").innerHTML = '<span class="badge badge--none">' + ICON.none + t("st_none") + "</span>";
      $("cards").innerHTML = "";
      $("main-body").innerHTML = timeline() + '<section class="panel empty"><p>' + t("emptyRegion") + "</p></section>";
      return;
    }

    var a = aggregate(r.districts);
    var last = a.sched.length ? a.sched[a.sched.length - 1] : a.dates[a.dates.length - 1];
    header(t("regionTotal"), regionName(r), fmtRange(a.dates[0] || a.sched[0], last), back);

    $("status").innerHTML = '<span class="badge badge--done">' + ICON.done + t("distHeld", a.done, a.total) + "</span>" +
      (a.scheduled ? '<span class="badge badge--scheduled">' + ICON.scheduled + t("distSched", a.scheduled) + "</span>" : "") +
      (a.none ? '<span class="badge badge--none">' + ICON.none + t("distNone", a.none) + "</span>" : "");

    var registered = a.participated + a.absent;
    var rate = registered ? Math.round(a.participated / registered * 100) : null;
    $("cards").innerHTML =
      card("map", t("k_districts"), num(a.done) + "<small>/" + num(a.total) + "</small>", t("k_districtsHint", "", num(a.total)), "green") +
      card("users", t("k_participants"), a.reported ? num(a.participated) : "—",
        a.reported ? t("k_registered", num(registered)) + (rate != null ? " · " + t("k_attendance", rate) : "") : "", "blue") +
      card("away", t("k_absent"), a.reported ? num(a.absent) : "—", t("k_absentHint"), "orange") +
      card("trophy", t("k_toRegion"), num(a.toRegion), t("k_toRegionHint"), "violet");

    var attendance = attendanceBars(r.districts.map(function (d, i) {
      return { label: dName(d.name), a: d.participated, b: d.absent || 0, go: "district:" + ri + ":" + i };
    }), t("ch_participantsD"));

    var maxP = Math.max.apply(null, r.districts.map(function (d) { return d.participated || 0; })) || 1;
    var order = r.districts.map(function (d, i) { return i; }).sort(function (x, y) {
      var rank = { done: 0, scheduled: 1, none: 2 };
      var dx = r.districts[x], dy = r.districts[y];
      return rank[status(dx)] - rank[status(dy)] || (dy.participated || 0) - (dx.participated || 0) || dName(dx.name).localeCompare(dName(dy.name));
    });
    var rows = order.map(function (i) {
      var d = r.districts[i], st = status(d);
      var date = d.date ? fmtDate(d.date, true) : d.scheduled ? (d.scheduled === "tbd" ? t("tbd") : fmtDate(d.scheduled, true)) : "—";
      return '<div class="drow' + (di === i ? " is-active" : "") + '" data-go="district:' + ri + ":" + i + '" tabindex="0" role="button">' +
        '<span class="drow__name"><i class="dot dot--' + st + '"></i><span>' + esc(dName(d.name)) + "</span>" +
        (d.photos ? '<span class="photo-badge">' + t("photoBadge", d.photos.length) + "</span>" : "") + "</span>" +
        '<span class="drow__date">' + date + "</span>" +
        '<span class="drow__people"><span class="mini"><span style="width:' + ((d.participated || 0) / maxP * 100) + '%"></span></span>' +
        "<b>" + (d.participated != null ? num(d.participated) : "—") + "</b></span>" +
        '<span class="drow__status">' + pill(st) + "</span></div>";
    }).join("");

    var detail = di != null ? districtDetail(r, ri, r.districts[di]) : "";
    var photos = di != null ? [] : photosOf(r, r.districts);

    $("main-body").innerHTML =
      timeline(r.regionStage) +
      '<div class="grid-2"><section class="panel"><div class="panel__head"><h2 class="panel__title">' + t("ch_status") +
      '</h2><span class="muted">' + t("ch_statusNote", a.total) + "</span></div>" + donut(a) + "</section>" +
      (attendance || majorsMini(r.districts)) + "</div>" +
      (attendance ? majorsPanel(r.districts) : "") +
      '<section class="panel" id="districts"><div class="panel__head"><h2 class="panel__title">' + t("districtsTitle") +
      '</h2><span class="muted">' + t("districtsHint") + "</span></div>" +
      '<div class="split' + (detail ? " has-detail" : "") + '"><div class="dlist" role="list">' +
      '<div class="dlist__head"><span>' + t("col_name") + "</span><span>" + t("col_date") + "</span><span>" + t("col_people") +
      "</span><span>" + t("col_status") + "</span></div>" + rows + "</div>" +
      (detail ? '<aside class="detail" id="detail">' + detail + "</aside>" : "") + "</div></section>" +
      (a.scheduled || r.regionStage ? upcomingPanel([r]) : "") +
      gallery(photos);
  }

  function majorsMini(list) {
    return majorsPanel(list);
  }

  function districtDetail(r, ri, d) {
    var st = status(d);
    var head = '<div class="detail__head"><div><div class="detail__crumb">' + esc(regionName(r)) + '</div><h3 class="detail__title">' +
      esc(dName(d.name)) + '</h3></div><button class="btn3d detail__close" data-go="region:' + ri + '" aria-label="' + esc(t("close")) + '">' +
      ICON.close + "</button></div>";
    var date = d.date ? fmtDate(d.date) : d.scheduled ? (d.scheduled === "tbd" ? t("tbd") : fmtDate(d.scheduled)) : st === "done" ? t("notGiven") : t("noData");
    var meta = '<div class="detail__meta">' + pill(st) + '<span class="detail__date">' + ICON.cal + esc(date) + "</span></div>" +
      notes(d).map(function (n) { return '<div class="note">' + esc(n) + "</div>"; }).join("");

    if (st === "scheduled") {
      return head + meta + '<div class="detail__venue"><span class="muted">' + t("venue") + "</span><b>" + esc(d.venue || "—") + "</b></div>";
    }
    if (st === "none") return head + meta + '<p class="muted">' + t("emptyRegion") + "</p>";

    var registered = d.participated != null ? d.participated + (d.absent || 0) : null;
    var rate = registered ? Math.round(d.participated / registered * 100) : null;
    var minis = '<div class="minis">' +
      '<div class="mini-card"><span>' + t("k_registeredOnly") + "</span><b>" + num(registered) + "</b></div>" +
      '<div class="mini-card mini-card--blue"><span>' + t("ch_attended") + "</span><b>" + num(d.participated) + "</b>" +
      (rate != null ? "<small>" + t("k_attendance", rate) + "</small>" : "") + "</div>" +
      '<div class="mini-card mini-card--orange"><span>' + t("ch_absent") + "</span><b>" + num(d.absent) + "</b></div></div>";

    var slots = slotsPerMajor(d);
    var majors = MAJORS.map(function (k) {
      var p = places(d, k), rowsHtml = "";
      if (d.firsts) {
        rowsHtml = '<div class="first-only">' + (p.length ? ICON.done + t("firstsOnly") : t("winnerNo")) + "</div>";
      } else {
        for (var i = 0; i < slots; i++) {
          var x = p[i], val, bar = 0;
          if (!x) val = t("empty");
          else if (x.s != null) { val = x.s + "<small>/" + x.scale + "</small>"; bar = x.pct; }
          else val = t("noScore");
          rowsHtml += '<li class="place place--' + (i + 1) + (x ? "" : " is-empty") + '"><span class="medal">' + (i + 1) +
            '</span><span class="place__bar"><span style="width:' + bar + '%"></span></span><span class="place__val">' + val + "</span></li>";
        }
        rowsHtml = '<ol class="places">' + rowsHtml + "</ol>";
      }
      var who = d.byMajor && d.byMajor[k] != null ? '<span class="major__people">' + t("people", d.byMajor[k]) + "</span>" : "";
      return '<div class="major major--' + k + ' major--compact"><div class="major__head"><span class="major__icon">' + ICON[k] + "</span>" +
        '<div class="major__name">' + t("m_" + k) + "</div>" + who + "</div>" + rowsHtml +
        '<span class="chip' + (p.length ? " chip--ok" : "") + '">' + (p.length ? t("winnerYes") : t("winnerNo")) + "</span></div>";
    }).join("");

    var s = stages(d);
    var steps = ["p_held", "p_report", "p_count", "p_winners"].map(function (key, i) {
      var cls = s[i] >= 1 ? "done" : s[i] > 0 ? "partial" : "todo";
      var extra = i === 3 ? " <small>" + t("p_slots", filled(d), slots * MAJORS.length) + "</small>" : "";
      return '<li class="step step--' + cls + '"><span class="step__mark"></span><span>' + t(key) + extra + "</span></li>";
    }).join("");

    return head + meta + minis +
      '<h4 class="detail__h">' + t("results") + ' <span class="muted">— ' + (d.firsts ? t("firstsOnly") : t("resultsHint")) + "</span></h4>" +
      '<div class="majors majors--stack">' + majors + "</div>" +
      '<h4 class="detail__h">' + t("progress") + '</h4><div class="progress">' + ring(level(d)) + '<ol class="steps">' + steps + "</ol></div>" +
      gallery(photosOf(r, [d]), d.links).replace('<section class="panel">', '<section class="detail__gallery">');
  }

  function render(animate) {
    if (view.type === "region" && T.regions[view.r].districts && view.d != null && !T.regions[view.r].districts[view.d]) view.d = null;
    if (view.type === "region") renderRegion(view.r, view.d);
    else renderAll();
    renderSidebar();
    $("mbar-title").textContent = $("title").textContent;
    $("foot").textContent = t("foot", fmtDate(T.asOf));
    startGallery();
    if (animate) playEntrance();
  }

  // ---------- jonli effektlar ----------

  function playEntrance() {
    if (reduceMotion) return;
    var main = document.querySelector(".main");
    main.classList.remove("is-entering");
    void main.offsetWidth;
    var parts = [main.querySelector(".status"), main.querySelector(".cards")].concat([].slice.call(main.querySelectorAll(".main-body > *")));
    parts.forEach(function (el, i) { if (el) el.style.setProperty("--i", Math.min(i, 6)); });
    clearTimeout(playEntrance.t);
    playEntrance.t = setTimeout(function () { main.classList.remove("is-entering"); }, 900);
    main.classList.add("is-entering");
    countUp(main);
  }

  function countUp(root) {
    root.querySelectorAll(".card__value").forEach(function (el) {
      var node = el.firstChild;
      if (!node || node.nodeType !== 3) return;
      var raw = node.nodeValue.trim();
      var m = raw.match(/^([\d,]+)(.*)$/);
      if (!m) return;
      var target = +m[1].replace(/,/g, ""), rest = m[2];
      if (!target) return;
      var start = performance.now(), dur = 600;
      (function tick(now) {
        var k = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - k, 3);
        node.nodeValue = num(Math.round(target * e)) + rest;
        if (k < 1) requestAnimationFrame(tick);
      })(start);
    });
  }

  function toast(msg, isError) {
    var el = $("toast");
    el.textContent = msg;
    el.classList.toggle("is-error", !!isError);
    el.hidden = false;
    el.classList.remove("is-shown");
    void el.offsetWidth;
    el.classList.add("is-shown");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.classList.remove("is-shown"); setTimeout(function () { el.hidden = true; }, 300); }, 2600);
  }

  function lastUpdateDate() {
    var best = null;
    Object.keys(store.overrides).forEach(function (id) {
      var u = store.overrides[id].updatedAt, d = null;
      if (!u) return;
      if (typeof u.toDate === "function") d = u.toDate();
      else if (typeof u === "string") d = new Date(u);
      else if (u.seconds) d = new Date(u.seconds * 1000);
      if (d && !isNaN(d) && (!best || d > best)) best = d;
    });
    return best;
  }

  function fmtDateTime(d) {
    var iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    return fmtDate(iso) + ", " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  function renderTools() {
    var dark = isDark();
    var last = lastUpdateDate();
    var when = last ? fmtDateTime(last) : fmtDate(T.asOf);
    $("tools").innerHTML =
      '<span class="updated" title="' + esc(t("lastUpdate") + ": " + when) + '">' + ICON.scheduled +
      '<span class="updated__label">' + t("lastUpdate") + ':</span> <b>' + esc(when) + "</b></span>" +
      '<button class="btn3d tool" data-act="refresh" title="' + esc(t("refresh")) + '">' + ICON.refresh + "<span>" + t("refresh") + "</span></button>" +
      '<button class="btn3d tool" data-act="theme" aria-pressed="' + dark + '" title="' + esc(dark ? t("themeDay") : t("themeNight")) + '">' +
      (dark ? ICON.sun : ICON.moon) + "<span>" + (dark ? t("themeDay") : t("themeNight")) + "</span></button>";
    $("langs").innerHTML = L.langs.map(function (l) {
      return '<button class="btn3d lang' + (l === lang ? " is-active" : "") + '" data-lang="' + l + '" aria-pressed="' + (l === lang) + '">' +
        l.toUpperCase() + "</button>";
    }).join("");
  }

  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", function () { if (!theme) renderTools(); });
  }

  // ---------- logotip: 5 marta bosilsa admin panel ----------

  var taps = [];
  document.querySelectorAll("[data-logo]").forEach(function (logo) {
    logo.addEventListener("click", function () {
      var now = Date.now();
      taps = taps.filter(function (x) { return now - x < 2500; });
      taps.push(now);
      logo.classList.remove("is-tapped");
      void logo.offsetWidth;
      logo.classList.add("is-tapped");
      if (taps.length >= 5) { taps = []; setDrawer(false); openAdmin(); }
    });
  });

  // ---------- mobil yon menyu ----------

  function setDrawer(open) {
    document.body.classList.toggle("drawer-open", open);
    $("menu-btn").setAttribute("aria-expanded", String(open));
  }
  $("menu-btn").addEventListener("click", function () { setDrawer(!document.body.classList.contains("drawer-open")); });
  $("scrim").addEventListener("click", function () { setDrawer(false); });
  $("drawer-close").addEventListener("click", function () { setDrawer(false); });
  $("regions").addEventListener("click", function (e) { if (e.target.closest("[data-go]")) setDrawer(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setDrawer(false); });
  var sx = null;
  $("sidebar").addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  $("sidebar").addEventListener("touchend", function (e) {
    if (sx != null && e.changedTouches[0].clientX - sx < -60) setDrawer(false);
    sx = null;
  });

  // ---------- admin panel ----------

  var adm = { r: null, d: null };

  function openAdmin() {
    if (adm.r == null) {
      adm.r = view.type === "region" ? view.r : T.regions.map(function (r) { return !!r.districts; }).indexOf(true);
      adm.d = view.type === "region" && view.d != null ? view.d : null;
    }
    $("admin").hidden = false;
    document.body.classList.add("modal-open");
    renderAdmin();
  }

  function closeAdmin() {
    $("admin").hidden = true;
    document.body.classList.remove("modal-open");
  }

  $("admin").addEventListener("click", function (e) {
    if (e.target === $("admin") || e.target.closest("[data-adm=close]")) closeAdmin();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("admin").hidden) closeAdmin(); });

  function field(id, label, input, hint) {
    return '<label class="fld" for="' + id + '"><span class="fld__label">' + label + (hint ? ' <em>' + hint + "</em>" : "") + "</span>" + input + "</label>";
  }

  function numInput(id, val, max) {
    return '<input class="inp" id="' + id + '" type="number" inputmode="numeric" min="0"' + (max ? ' max="' + max + '"' : "") +
      ' step="1" value="' + (val == null ? "" : val) + '">';
  }

  function renderAdmin() {
    var head = '<div class="adm__head"><div class="adm__brand"><span class="adm__lock">' + ICON.lock + '</span><h2 id="admin-title">' + t("a_title") +
      '</h2></div><button class="btn3d detail__close" data-adm="close" aria-label="' + esc(t("a_cancel")) + '">' + ICON.close + "</button></div>";

    if (store.mode === "firebase" && !store.user) {
      $("admin-body").innerHTML = head + '<form class="adm__login" id="adm-login"><p class="muted">' + t("a_loginHint") + "</p>" +
        field("adm-email", t("a_email"), '<input class="inp" id="adm-email" type="email" autocomplete="username" required>') +
        field("adm-pass", t("a_password"), '<input class="inp" id="adm-pass" type="password" autocomplete="current-password" required>') +
        '<p class="adm__err" id="adm-err" hidden></p><button class="btn3d btn-primary" type="submit">' + t("a_login") + "</button></form>";
      $("adm-login").addEventListener("submit", function (e) {
        e.preventDefault();
        store.auth.signInWithEmailAndPassword($("adm-email").value.trim(), $("adm-pass").value).catch(function () {
          $("adm-err").textContent = t("a_loginFail");
          $("adm-err").hidden = false;
        });
      });
      $("adm-email").focus();
      return;
    }

    var info = store.mode === "firebase" ?
      '<div class="adm__info adm__info--ok"><span>' + t("a_connected", esc(store.user.email)) + '</span><button class="btn3d btn-small" type="button" data-adm="logout">' +
        t("a_logout") + "</button></div>" :
      '<div class="adm__info">' + t("a_local") + "</div>";

    var r = T.regions[adm.r];
    var list = r.districts || [];
    var regionOpts = T.regions.map(function (x, i) {
      return '<option value="' + i + '"' + (i === adm.r ? " selected" : "") + ">" + esc(regionName(x)) + "</option>";
    }).join("");
    var distOpts = list.map(function (d, i) {
      return '<option value="' + i + '"' + (i === adm.d ? " selected" : "") + ">" + esc(dName(d.name)) + "</option>";
    }).join("") + '<option value="new"' + (adm.d === "new" || !list.length ? " selected" : "") + ">" + esc(t("a_newDistrict")) + "</option>";
    if (!list.length) adm.d = "new";
    if (adm.d == null) adm.d = list.length ? 0 : "new";

    var d = adm.d === "new" ? { name: "" } : list[adm.d];
    var st = adm.d === "new" ? "done" : status(d) === "scheduled" ? "scheduled" : "done";
    var dateVal = d.date || (d.scheduled && d.scheduled !== "tbd" ? d.scheduled : "");

    var majors = MAJORS.map(function (k) {
      var p = adm.d === "new" ? [] : places(d, k);
      var w = p.length;
      var scores = [0, 1, 2].map(function (i) {
        var v = p[i] && p[i].pct != null ? Math.round(p[i].pct) : "";
        return '<label class="fld" id="adm-' + k + "-l" + i + '"' + (i >= w ? " hidden" : "") + '><span class="fld__label">' + esc(t("a_score", i + 1)) +
          '</span><input class="inp inp--score" id="adm-' + k + "-s" + i + '" type="number" min="0" max="100" step="1" value="' + v + '" placeholder="0–100"></label>';
      }).join("");
      var people = d.byMajor && d.byMajor[k] != null ? d.byMajor[k] : "";
      return '<fieldset class="adm__major major--' + k + '"><legend><span class="major__icon">' + ICON[k] + "</span>" + t("m_" + k) + "</legend>" +
        '<div class="adm__row">' + field("adm-" + k + "-people", t("a_people"), numInput("adm-" + k + "-people", people), t("a_optional")) +
        field("adm-" + k + "-w", t("a_winners"), '<select class="inp" id="adm-' + k + '-w" data-major="' + k + '">' +
          [0, 1, 2, 3].map(function (n) { return '<option value="' + n + '"' + (n === w ? " selected" : "") + ">" + n + "</option>"; }).join("") + "</select>") +
        "</div>" + '<div class="adm__scores">' + scores + "</div></fieldset>";
    }).join("");

    var hasOverride = adm.d !== "new" && store.overrides[docId(r.key, d.name)];

    $("admin-body").innerHTML = head + info +
      '<form class="adm__form" id="adm-form" novalidate>' +
      '<div class="adm__row">' + field("adm-region", t("a_region"), '<select class="inp" id="adm-region">' + regionOpts + "</select>") +
      field("adm-district", t("a_district"), '<select class="inp" id="adm-district">' + distOpts + "</select>") + "</div>" +
      (adm.d === "new" ? field("adm-name", t("a_newName"), '<input class="inp" id="adm-name" type="text" placeholder="' + esc(t("a_newNamePh")) + '">') : "") +
      '<div class="adm__row">' + field("adm-status", t("a_status"), '<select class="inp" id="adm-status"><option value="done"' + (st === "done" ? " selected" : "") + ">" +
        t("st_done") + '</option><option value="scheduled"' + (st === "scheduled" ? " selected" : "") + ">" + t("st_scheduled") + "</option></select>") +
      field("adm-date", t("a_date"), '<input class="inp" id="adm-date" type="date" value="' + dateVal + '">') + "</div>" +
      '<div class="adm__sched"' + (st === "scheduled" ? "" : " hidden") + ">" +
        field("adm-venue", t("a_venue"), '<input class="inp" id="adm-venue" type="text" value="' + esc(d.venue || "") + '">') + "</div>" +
      '<div class="adm__done"' + (st === "done" ? "" : " hidden") + ">" +
        '<div class="adm__row">' + field("adm-part", t("a_participated"), numInput("adm-part", d.participated)) +
        field("adm-abs", t("a_absent"), numInput("adm-abs", d.absent)) + "</div>" + majors + "</div>" +
      '<p class="adm__err" id="adm-err" hidden></p>' +
      '<div class="adm__actions">' + (hasOverride ? '<button class="btn3d btn-small" type="button" data-adm="reset">' + t("a_reset") + "</button>" : "<span></span>") +
      '<div class="adm__actions-right"><button class="btn3d btn-small" type="button" data-adm="close">' + t("a_cancel") + "</button>" +
      '<button class="btn3d btn-primary" type="submit">' + t("a_save") + "</button></div></div></form>";

    $("adm-region").addEventListener("change", function () { adm.r = +this.value; adm.d = null; renderAdmin(); });
    $("adm-district").addEventListener("change", function () { adm.d = this.value === "new" ? "new" : +this.value; renderAdmin(); });
    $("adm-status").addEventListener("change", function () {
      document.querySelector(".adm__sched").hidden = this.value !== "scheduled";
      document.querySelector(".adm__done").hidden = this.value !== "done";
    });
    document.querySelectorAll("[data-major]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        for (var i = 0; i < 3; i++) $("adm-" + sel.dataset.major + "-l" + i).hidden = i >= +sel.value;
      });
    });
    $("adm-form").addEventListener("submit", submitAdmin);
    var lo = document.querySelector("[data-adm=logout]");
    if (lo) lo.addEventListener("click", function () { store.auth.signOut(); });
    var rs = document.querySelector("[data-adm=reset]");
    if (rs) rs.addEventListener("click", function () {
      var name = d.name;
      removeOverride(docId(r.key, name)).then(function () {
        if (store.mode === "local") { applyOverrides(); render(true); }
        toast(t("a_resetDone", dName(name)));
        adm.d = null;
        renderAdmin();
      }).catch(function (err) { showErr(t("a_saveFail", err.message || err)); });
    });
  }

  function showErr(msg) {
    $("adm-err").textContent = msg;
    $("adm-err").hidden = false;
  }

  function readInt(id, max) {
    var v = $(id).value.trim();
    if (v === "") return null;
    var n = Number(v);
    if (!Number.isInteger(n) || n < 0 || (max != null && n > max)) throw new Error("bad");
    return n;
  }

  function submitAdmin(e) {
    e.preventDefault();
    var r = T.regions[adm.r];
    var name = adm.d === "new" ? $("adm-name").value.trim().replace(/\s+/g, " ") : r.districts[adm.d].name;
    if (!name) return showErr(t("a_needName"));
    var doc = { region: r.key, name: name, status: $("adm-status").value, date: $("adm-date").value || null };
    try {
      if (doc.status === "scheduled") {
        doc.venue = $("adm-venue").value.trim() || null;
      } else {
        doc.participated = readInt("adm-part");
        doc.absent = readInt("adm-abs");
        doc.majors = {};
        MAJORS.forEach(function (k) {
          var w = +$("adm-" + k + "-w").value;
          var scores = [];
          for (var i = 0; i < w; i++) scores.push(readInt("adm-" + k + "-s" + i, 100));
          doc.majors[k] = { people: readInt("adm-" + k + "-people"), winners: w, scores: scores };
        });
      }
    } catch (err) {
      return showErr(t("a_badNumber"));
    }
    var btn = e.submitter || document.querySelector("#adm-form [type=submit]");
    btn.disabled = true;
    saveOverride(docId(r.key, name), doc).then(function () {
      if (store.mode === "local") applyOverrides();
      var di = T.regions[adm.r].districts.map(function (x) { return x.name; }).indexOf(name);
      adm.d = di;
      toast(t("a_saved", dName(name)));
      closeAdmin();
      go({ type: "region", r: adm.r, d: di });
    }).catch(function (err) {
      btn.disabled = false;
      showErr(t("a_saveFail", err && err.message || err));
    });
  }

  // ---------- ishga tushirish ----------

  if (!fbConfigured()) loadLocal();
  applyOverrides();
  render(true);
  initFirebase();
})();
