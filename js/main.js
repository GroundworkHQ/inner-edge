/* ============================================================
   Inner Edge Scalping — sales page
   Vanilla, no deps. Ambient candlestick canvas + UI wiring.
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. Ambient chart — "Inner Edge TWS Advanced" look
     Mirrors the real indicator: a shaded envelope band around
     price, a fast/slow moving-average pair that crosses, and a
     long slow trendline. Candles are neon so the whole thing
     reads bright against the near-black page.
     --------------------------------------------------------- */
  var canvas = document.getElementById("chartCanvas");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var PITCH = 13;    // distance between candles
    var BODY = 7;      // candle body width
    var SPEED = 0.30;  // px per frame
    var WARM = 180;    // warm-up bars so the 50-period band and long EMA settle

    // EMA smoothing factors
    var KF = 2 / (9 + 1);    // fast MA  (red)
    var KS = 2 / (26 + 1);   // slow MA  (blue)
    var KL = 2 / (140 + 1);  // long MA  (grey)
    var KB = 2 / (5 + 1);    // light smoothing only, so true 2σ width survives
    var BAND_W = 50;         // Bollinger period
    var BB_MULT = 2;         // standard deviations

    // Display price mapping (mirrors a CADCHF-style quote)
    var BASE = 0.5780, RANGE = 0.0085;

    var candles = [];
    var offset = 0;
    var w = 0, h = 0, cols = 0;

    var price = 0.5;
    var cross = { on: false, x: 0, y: 0 };

    /* Market regimes.
       A flat random walk reads as noise. Real charts move in phases:
       a range, then a directional leg, then a capitulation, then a
       new range. Cycling through those is what gives the background
       its trending shape instead of an even wander. */
    var regLeft = 0, regDrift = 0, regVol = 1;
    var flatCool = 0;   // bars to let a forced trend run before re-checking

    function nextRegime() {
      var r = Math.random();
      var dir = Math.random() < 0.5 ? -1 : 1;

      if (r < 0.50) {            // sustained trend leg
        regLeft = 70 + Math.floor(Math.random() * 100);
        regDrift = dir * (0.0024 + Math.random() * 0.0042);
        regVol = 0.9 + Math.random() * 0.5;
      } else if (r < 0.74) {     // sharp impulse / capitulation
        regLeft = 8 + Math.floor(Math.random() * 15);
        regDrift = dir * (0.009 + Math.random() * 0.013);
        regVol = 1.7 + Math.random() * 1.0;
      } else {                   // consolidation: shorter and livelier, so a
                                 // quiet stretch never fills the whole screen
        regLeft = 20 + Math.floor(Math.random() * 30);
        regDrift = (Math.random() - 0.5) * 0.0018;
        regVol = 0.64 + Math.random() * 0.38;
      }
    }
    nextRegime();

    function makeRaw() {
      if (--regLeft <= 0) nextRegime();

      // Turn the trend around near the edges so it never pins to a rail
      if (price > 0.85 && regDrift > 0) regDrift = -Math.abs(regDrift);
      if (price < 0.15 && regDrift < 0) regDrift = Math.abs(regDrift);

      var shock = (Math.random() - 0.5) * 0.034 * regVol;
      var open = price;
      price = Math.max(0.07, Math.min(0.93, price + shock + regDrift));
      var close = price;

      // wicks scale with the regime, so impulse bars get long tails
      var wick = (Math.random() * 0.013 + 0.002) * regVol;
      return {
        o: open, c: close,
        h: Math.max(open, close) + wick,
        l: Math.min(open, close) - wick
      };
    }

    // Append one candle and compute every derived series on it
    function pushCandle() {
      var c = makeRaw();
      var prev = candles[candles.length - 1];
      candles.push(c);

      if (!prev) {
        c.ef = c.es = c.el = c.c;
        c.bm = c.c; c.bt = c.h; c.bb = c.l;
        return;
      }
      c.ef = prev.ef + KF * (c.c - prev.ef);
      c.es = prev.es + KS * (c.c - prev.es);
      c.el = prev.el + KL * (c.c - prev.el);

      // Bollinger bands: SMA(20) of closes ± 2 standard deviations.
      // Width now genuinely tracks volatility, so it squeezes in chop and
      // flares open on the impulse candles.
      var n = candles.length;
      var from = Math.max(0, n - BAND_W);
      var cnt = n - from;
      var i, sum = 0;
      for (i = from; i < n; i++) sum += candles[i].c;
      var mean = sum / cnt;

      var varsum = 0;
      for (i = from; i < n; i++) {
        var d = candles[i].c - mean;
        varsum += d * d;
      }
      var sd = Math.sqrt(varsum / cnt);

      c.bm = mean;
      c.bt = prev.bt + KB * (mean + BB_MULT * sd - prev.bt);
      c.bb = prev.bb + KB * (mean - BB_MULT * sd - prev.bb);
    }

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(w / PITCH) + 3;

      if (!candles.length) buildSeries();
      else {
        while (candles.length < cols) pushCandle();
        while (candles.length > cols) candles.shift();
      }
    }

    // Vertical spread of the visible closes, in 0..1 price space
    function spread() {
      var mn = Infinity, mx = -Infinity;
      for (var i = 0; i < candles.length; i++) {
        if (candles[i].c < mn) mn = candles[i].c;
        if (candles[i].c > mx) mx = candles[i].c;
      }
      return mx - mn;
    }

    // Regimes are random, so a given seed can land entirely inside a
    // flat consolidation. Reroll until the opening frame actually shows
    // a chart with range in it.
    function buildSeries() {
      var attempts = 0;
      do {
        candles.length = 0;
        price = 0.5;
        nextRegime();
        for (var i = 0; i < cols + WARM; i++) pushCandle();
        while (candles.length > cols) candles.shift();
        attempts++;
      } while (attempts < 16 && spread() < 0.45);
    }

    function y(v) {
      var top = h * 0.14, bottom = h * 0.90;
      return bottom - v * (bottom - top);
    }
    function px(v) { return (BASE + (v - 0.5) * RANGE).toFixed(5); }

    // Trace a series across every visible candle
    function path(key) {
      ctx.beginPath();
      for (var i = 0; i < candles.length; i++) {
        var x = i * PITCH - offset;
        if (i === 0) ctx.moveTo(x, y(candles[i][key]));
        else ctx.lineTo(x, y(candles[i][key]));
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var i, x, c;

      /* ---- grid + right-edge price scale ---- */
      ctx.font = "10px ui-monospace, monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (var g = 1; g <= 7; g++) {
        var v = g / 8;
        var gy = Math.round(y(v)) + 0.5;
        ctx.strokeStyle = "rgba(130,180,240,0.055)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w - 62, gy); ctx.stroke();
        ctx.fillStyle = "rgba(150,190,235,0.22)";
        ctx.fillText(px(v), w - 12, gy);
      }

      /* ---- envelope band (the signature TWS cloud) ---- */
      ctx.beginPath();
      for (i = 0; i < candles.length; i++) {
        x = i * PITCH - offset;
        if (i === 0) ctx.moveTo(x, y(candles[i].bt));
        else ctx.lineTo(x, y(candles[i].bt));
      }
      for (i = candles.length - 1; i >= 0; i--) {
        x = i * PITCH - offset;
        ctx.lineTo(x, y(candles[i].bb));
      }
      ctx.closePath();
      var bandGrad = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.95);
      bandGrad.addColorStop(0, "rgba(130,185,255,0.24)");
      bandGrad.addColorStop(1, "rgba(70,130,230,0.14)");
      ctx.fillStyle = bandGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(160,205,255,0.26)";
      ctx.lineWidth = 1;
      ctx.stroke();

      /* ---- candles ----
         Batched into two passes (up, then down) so we only touch
         fillStyle/strokeStyle twice per frame instead of ~150x.
         Uses "lighter" compositing for the neon bloom rather than
         per-candle shadowBlur, which is far too expensive here. */
      ctx.globalCompositeOperation = "lighter";
      for (var pass = 0; pass < 2; pass++) {
        var wantUp = pass === 0;
        var col = wantUp ? "34,255,170" : "255,61,113";

        // wicks
        ctx.strokeStyle = "rgba(" + col + ",0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (i = 0; i < candles.length; i++) {
          c = candles[i];
          if ((c.c >= c.o) !== wantUp) continue;
          x = i * PITCH - offset;
          if (x < -PITCH || x > w + PITCH) continue;
          ctx.moveTo(x, y(c.h));
          ctx.lineTo(x, y(c.l));
        }
        ctx.stroke();

        // bodies
        ctx.fillStyle = "rgba(" + col + ",0.72)";
        for (i = 0; i < candles.length; i++) {
          c = candles[i];
          if ((c.c >= c.o) !== wantUp) continue;
          x = i * PITCH - offset;
          if (x < -PITCH || x > w + PITCH) continue;
          var yo = y(c.o), yc = y(c.c);
          var top = Math.min(yo, yc);
          var hgt = Math.max(Math.abs(yc - yo), 1.2);
          ctx.fillRect(x - BODY / 2, top, BODY, hgt);
        }
      }
      ctx.globalCompositeOperation = "source-over";

      /* ---- long slow trendline (grey) ---- */
      path("el");
      ctx.strokeStyle = "rgba(205,220,240,0.30)";
      ctx.lineWidth = 2;
      ctx.stroke();

      /* ---- slow MA (blue) ---- */
      path("es");
      ctx.strokeStyle = "rgba(96,150,255,0.85)";
      ctx.lineWidth = 1.7;
      ctx.shadowColor = "rgba(96,150,255,0.7)";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* ---- fast MA (red) ---- */
      path("ef");
      ctx.strokeStyle = "rgba(255,110,135,0.9)";
      ctx.lineWidth = 1.7;
      ctx.shadowColor = "rgba(255,110,135,0.7)";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* ---- current price marker ---- */
      var last = candles[candles.length - 1];
      var ly = y(last.c);
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = "rgba(79,227,245,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(w - 62, ly); ctx.stroke();
      ctx.setLineDash([]);

      // price tag on the right rail
      var tag = px(last.c);
      ctx.font = "bold 10px ui-monospace, monospace";
      var tw = ctx.measureText(tag).width + 14;
      ctx.fillStyle = "rgba(79,227,245,0.92)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(w - tw - 8, ly - 9, tw, 18, 3);
      else ctx.rect(w - tw - 8, ly - 9, tw, 18);
      ctx.fill();
      ctx.fillStyle = "#04060c";
      ctx.textAlign = "center";
      ctx.fillText(tag, w - tw / 2 - 8, ly + 0.5);

    }

    /* Dashed crosshair with price + time readouts, on its own overlay
       canvas above the veil. Painted on pointer move rather than in the
       chart's rAF loop, so it tracks the cursor 1:1. */
    var xc = document.getElementById("crossCanvas");
    var xctx = xc ? xc.getContext("2d") : null;

    function sizeCross() {
      if (!xc) return;
      xc.width = Math.floor(w * dpr);
      xc.height = Math.floor(h * dpr);
      xctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function clearCross() { if (xctx) xctx.clearRect(0, 0, w, h); }

    function tag(g, text, cxp, cyp) {
      var tw = g.measureText(text).width + 14;
      g.fillStyle = "rgba(232,243,255,0.96)";
      g.beginPath();
      if (g.roundRect) g.roundRect(cxp - tw / 2, cyp - 9, tw, 18, 3);
      else g.rect(cxp - tw / 2, cyp - 9, tw, 18);
      g.fill();
      g.fillStyle = "#04060c";
      g.textAlign = "center";
      g.fillText(text, cxp, cyp + 0.5);
    }

    function drawCrosshair() {
      if (!xctx) return;
      clearCross();
      if (!cross.on) return;

      var cx = Math.round(cross.x) + 0.5;
      var cy = Math.round(cross.y) + 0.5;
      var rail = w - 62;
      if (cx > rail) return;

      xctx.setLineDash([3, 4]);
      xctx.strokeStyle = "rgba(215,232,255,0.55)";
      xctx.lineWidth = 1;
      xctx.beginPath();
      xctx.moveTo(0, cy); xctx.lineTo(rail, cy);
      xctx.moveTo(cx, 0); xctx.lineTo(cx, h);
      xctx.stroke();
      xctx.setLineDash([]);

      xctx.font = "bold 10px ui-monospace, monospace";
      xctx.textBaseline = "middle";

      // price readout, pinned to the right rail
      var top = h * 0.14, bottom = h * 0.90;
      var v = (bottom - cross.y) / (bottom - top);
      var label = px(Math.max(0, Math.min(1, v)));
      var lw = xctx.measureText(label).width + 14;
      tag(xctx, label, w - lw / 2 - 8, cy);

      // time readout along the bottom, 5m per candle back from now
      var idx = Math.round((cross.x + offset) / PITCH);
      var barsBack = (candles.length - 1) - idx;
      var t = new Date(Date.now() - barsBack * 5 * 60000);
      var hhmm = ("0" + t.getHours()).slice(-2) + ":" +
                 ("0" + (Math.floor(t.getMinutes() / 5) * 5)).slice(-2);
      tag(xctx, hhmm, cx, h - 16);
    }

    function tick() {
      offset += SPEED;
      if (offset >= PITCH) {
        offset -= PITCH;
        pushCandle();
        candles.shift();

        /* Regimes are random, so a run of quiet ones can leave the whole
           visible window flat. Rather than hope, measure: if the on-screen
           range collapses, force a trend leg pointed back toward the middle.
           The cooldown matters: without it this re-fires every bar and keeps
           flipping direction, which pins price in a tight oscillation and
           produces exactly the flatness it was meant to prevent. */
        if (flatCool > 0) flatCool--;
        else if (spread() < 0.34) {
          regLeft = 90 + Math.floor(Math.random() * 70);
          regDrift = (price > 0.5 ? -1 : 1) * (0.0045 + Math.random() * 0.0035);
          regVol = 1.0 + Math.random() * 0.5;
          flatCool = regLeft;
        }
      }
      draw();
      requestAnimationFrame(tick);
    }

    resize();
    sizeCross();
    window.addEventListener("resize", function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      resize();
      sizeCross();
      drawCrosshair();
      if (reduce) draw();
    });

    /* Crosshair, hero only. Skipped on touch devices, where there is
       no hover and it would just stick wherever you last tapped. */
    var heroEl = document.querySelector(".hero");
    if (heroEl && window.matchMedia("(hover: hover)").matches) {
      heroEl.addEventListener("mousemove", function (e) {
        cross.on = true;
        cross.x = e.clientX;
        cross.y = e.clientY;
        drawCrosshair();
      });
      heroEl.addEventListener("mouseleave", function () {
        cross.on = false;
        drawCrosshair();
      });
      // the crosshair is anchored to the viewport, so drop it on scroll
      window.addEventListener("scroll", function () {
        if (cross.on) { cross.on = false; drawCrosshair(); }
      }, { passive: true });
    }

    if (reduce) draw();
    else requestAnimationFrame(tick);
  }
  /* ---------------------------------------------------------
     2. Market sessions
     Open/closed is derived from each exchange's OWN local clock
     via Intl, so daylight saving is handled for us instead of
     hardcoding UTC windows that drift twice a year. FX is 24/5,
     so weekends read as closed rather than showing a bogus
     "opens in" countdown.
     --------------------------------------------------------- */
  var sesList = document.getElementById("sessionsList");
  var sesUtc = document.getElementById("sessionsUtc");

  if (sesList) {
    var SESSIONS = [
      { name: "Sydney",   tz: "Australia/Sydney",   open: 8,   close: 17 },
      { name: "Tokyo",    tz: "Asia/Tokyo",         open: 9,   close: 18 },
      { name: "London",   tz: "Europe/London",      open: 8,   close: 16.5 },
      { name: "New York", tz: "America/New_York",   open: 8,   close: 17 }
    ];

    // Local weekday + decimal hour inside a given timezone
    function localNow(tz, d) {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz, weekday: "short",
        hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(d);

      var o = {};
      for (var i = 0; i < parts.length; i++) o[parts[i].type] = parts[i].value;
      var hr = parseInt(o.hour, 10);
      if (hr === 24) hr = 0;               // some engines emit 24 for midnight
      return {
        wd: o.weekday,
        t: hr + parseInt(o.minute, 10) / 60
      };
    }

    function fmtGap(hoursDecimal) {
      var mins = Math.max(0, Math.round(hoursDecimal * 60));
      var hh = Math.floor(mins / 60);
      var mm = mins % 60;
      return hh > 0 ? hh + "h " + mm + "m" : mm + "m";
    }

    function render() {
      var now = new Date();

      if (sesUtc) {
        sesUtc.textContent = new Intl.DateTimeFormat("en-GB", {
          timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false
        }).format(now) + " UTC";
      }

      var html = "";
      for (var i = 0; i < SESSIONS.length; i++) {
        var s = SESSIONS[i];
        var L = localNow(s.tz, now);
        var weekend = L.wd === "Sat" || L.wd === "Sun";
        var isOpen = !weekend && L.t >= s.open && L.t < s.close;

        var note;
        if (isOpen) {
          note = "closes in " + fmtGap(s.close - L.t);
        } else if (weekend || L.wd === "Fri" && L.t >= s.close) {
          note = "opens Monday";
        } else {
          var gap = s.open - L.t;
          if (gap <= 0) gap += 24;         // already past today's open
          note = "opens in " + fmtGap(gap);
        }

        html += '<li class="ses' + (isOpen ? " is-open" : "") + '">' +
                  '<span class="ses__dot"></span>' +
                  '<span class="ses__name">' + s.name + "</span>" +
                  '<span class="ses__time">' + note + "</span>" +
                "</li>";
      }
      sesList.innerHTML = html;
    }

    render();
    setInterval(render, 30000);
  }

  /* ---------------------------------------------------------
     3. Discord recreation: clickable channels
     Team/admin channels show announcement-style posts. Channels
     whose value is member conversation show a members-only state
     instead, because inventing member chatter would be fabricated
     social proof.
     --------------------------------------------------------- */
  var dcFeed = document.getElementById("dcFeed");
  if (dcFeed) {
    var dcName = document.getElementById("dcName");
    var dcTopic = document.getElementById("dcTopic");

    function post(text) { return { text: text }; }
    var VOICE = "voice";

    var CHANNELS = {
      "rules-and-info": {
        topic: "How the server works and what is expected of members.",
        msgs: [
          post("Welcome in. Read this channel first, then head to <ref>#announcements</ref> for what is happening this week."),
          post("Keep discussion in the right channels so nothing gets buried. Charts go in <ref>#charts-and-chat</ref>, platform issues in <ref>#tech-talk</ref>.")
        ]
      },
      "announcements": {
        topic: "Official updates and community announcements from the team.",
        msgs: [
          post("Zoom session starts in 1 hour. Drop your questions in <ref>#tuesday-tune-up</ref> before we get started."),
          post("Group coaching is happening Wednesday at 1:00pm UK time. Recording goes into <ref>#zoom-recordings</ref> straight after."),
          post("Today's news and levels are posted in <ref>#daily-news</ref>. Check them before the London open.")
        ]
      },
      "charts-and-chat": {
        topic: "Celebrate your trading wins, funded accounts, consistency milestones, and personal achievements. Positive vibes only!",
        msgs: [
          post("Passed a challenge, hit a consistency milestone, or just had a clean week? Post it here."),
          post("Wins get celebrated in here, big or small. Bring the chart with it so everyone can see how it was taken.")
        ]
      },
      "daily-news": {
        topic: "What moves price today, filtered for scalpers.",
        msgs: [
          post("Today's releases and the levels that matter are up. Read before you take anything."),
          post("Quiet morning on the calendar. London open is the focus, US session has the risk.")
        ]
      },
      "breaking-news": {
        topic: "Market-moving headlines as they land.",
        msgs: [
          post("Heads up, unscheduled headline just hit. Spreads are wide, sit on your hands until it settles.")
        ]
      },
      "general-chat": {
        topic: "Everything else. The room outside the charts.",
        msgs: [
          post("Anything off topic lives here so the trading channels stay clean."),
          post("New in? Say hello. Most people here started exactly where you are.")
        ]
      },
      "tech-talk": {
        topic: "Platform, indicator and setup help.",
        msgs: [
          post("Stuck on MT5, TradingView, TradeLocker or the IES Indicator? Ask here rather than fighting it alone."),
          post("Screenshot the actual error or the settings panel. It gets solved far quicker than a description.")
        ]
      },
      "tuesday-tune-up": {
        topic: "Questions for the weekly live call.",
        msgs: [
          post("Post your questions here before the call and we will work through them live."),
          post("Bring the chart with you. Screenshots get better answers than descriptions.")
        ]
      },
      "tools-and-resources": {
        topic: "The tools, templates and links you need.",
        msgs: [
          post("The Inner Edge Trading Journal template is pinned here. Make your own copy before you start logging."),
          post("Trade Assist and the InvestSoft Trade Manager walkthroughs are both in the course under Trading Tools and Setup.")
        ]
      },
      "zoom-recordings": {
        topic: "Every past session, recorded.",
        msgs: [
          post("This week's session is uploaded. The full back catalogue is available from the day you join."),
          post("Monthly journal reviews are archived here too.")
        ]
      },
      "feedback-and-suggestions": {
        topic: "Tell us what would make this better.",
        msgs: [
          post("Missing a lesson, a tool or a session time that would suit you better? Say so here."),
          post("A lot of what is in the course now started as a request in this channel.")
        ]
      },
      "server-support": {
        topic: "Access problems and account help.",
        msgs: [
          post("Trouble getting into a channel or the course? Post here and we will get you sorted.")
        ]
      },
      "traders-lounge": {
        topic: "Voice room.",
        state: VOICE,
        blurb: "Members drop into voice and trade the session together, live."
      },
      "traders-stage": {
        topic: "Live streams and screen shares.",
        state: VOICE,
        blurb: "Live sessions are streamed here, screens shared, trades called as they happen."
      }
    };

    function esc(t) {
      return t.replace(/<ref>(.*?)<\/ref>/g, '<span class="dc__ref">$1</span>');
    }

    function render(name) {
      var c = CHANNELS[name];
      if (!c) return;

      dcName.textContent = name;
      dcTopic.textContent = c.topic;

      var html = "";
      if (c.state === VOICE) {
        var icon = '<path fill="currentColor" d="M12 3a7 7 0 0 0-7 7v4a3 3 0 0 0 3 3h1v-8H7v-1a5 5 0 0 1 10 0v1h-2v8h1a3 3 0 0 0 3-3v-4a7 7 0 0 0-7-7z"/>';
        html =
          '<div class="dc__state">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true">' + icon + "</svg>" +
            "<p><b>Voice channel</b></p>" +
            "<p>" + c.blurb + "</p>" +
          "</div>";
      } else {
        for (var i = 0; i < c.msgs.length; i++) {
          html +=
            '<div class="dc__msg">' +
              '<img class="dc__av" src="assets/wl-avatar.png" alt="" width="36" height="36" />' +
              "<div>" +
                '<p class="dc__meta"><b>Team Inner Edge</b><span class="dc__badge">APP</span></p>' +
                '<p class="dc__text">' + esc(c.msgs[i].text) + "</p>" +
              "</div>" +
            "</div>";
        }
      }
      dcFeed.innerHTML = html;
    }

    var btns = document.querySelectorAll(".dc__side [data-ch]");
    function select(btn) {
      for (var i = 0; i < btns.length; i++) btns[i].classList.remove("is-active");
      btn.classList.add("is-active");
      render(btn.getAttribute("data-ch"));
    }

    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.addEventListener("click", function () { select(b); });
      })(btns[i]);
      if (btns[i].getAttribute("data-ch") === "announcements") select(btns[i]);
    }
  }

  /* ---------------------------------------------------------
     4. Nav: stuck state + mobile toggle
     --------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  function onScroll() {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* The whole header stays out of the way over the hero and drops in once
     the hero logo has scrolled up behind it, so the two logos are never on
     screen together and the opening view stays clean. */
  var heroLogo = document.querySelector(".hero__logo");
  if (nav && heroLogo && "IntersectionObserver" in window) {
    var navIO = new IntersectionObserver(function (entries) {
      nav.classList.toggle("is-visible", !entries[0].isIntersecting);
    }, { rootMargin: "-64px 0px 0px 0px", threshold: 0 });
    navIO.observe(heroLogo);
  } else if (nav) {
    nav.classList.add("is-visible");
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------------------------------------------------
     5. Scroll reveals
     --------------------------------------------------------- */
  var targets = document.querySelectorAll("[data-reveal]");
  if (targets.length && "IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // stagger cards within a grid for a nicer cascade
        var delay = el.classList.contains("card") ? (idx % 6) * 70 : 0;
        setTimeout(function () { el.classList.add("is-in"); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add("is-in"); });
  }

  /* ---------------------------------------------------------
     6. Footer year
     --------------------------------------------------------- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     7. Wins wall (social proof)

     ⚠️ Every entry in WINS must be a message a real member actually
     posted, copied word for word from the Discord, including typos.
     Do not tidy the wording, do not merge two messages into one, and
     do not write a new one. Fabricated social proof is the single
     thing this page has consistently refused to do, and a trading
     audience is the one audience that would spot it.

     Before an entry goes in, it needs Wendy or Lee to have the
     member's permission to republish it. `name` should be whatever
     that permission covers, which is usually a first name or a
     Discord handle rather than a full legal name.

     Fields:
       name      display name to show
       when      rough date, e.g. "Jul 2026". Kept vague on purpose.
       text      the message, verbatim. \n for line breaks.
       avatar    optional, path under assets/wins/. Omit to fall back
                 to an initial disc, which avoids republishing a
                 member's profile photo.
       proof     optional, path to an attached image such as a chart
                 or a pass certificate. Crop it before it goes in:
                 no account numbers, balances, broker logins, KYC or
                 onboarding links, and no third party's signature.
                 Must be the original upload, not a re-screenshot of
                 the Discord post, or it renders as mush.
       proofAlt  required if proof is set. Describes the image.
       reactions optional, [{ emoji: "🔥", n: 7 }]

     The section stays hidden while this array is empty, so a stub
     never ships to a live page.
     --------------------------------------------------------- */
  var WINS = [
    {
      /* Full name used with permission. Lee B. is abbreviated because he
         specifically asked for it, so the two are inconsistent on purpose. */
      name: "Matty Kettle",
      when: "Jul 2026",
      text: "I know it’s a drop in the ocean\nAnd not the account I wanted to pass\nBut I’m so stoked\nThat I am heading in the direction I want to be",
      badge: "Prop firm evaluation passed",
      reactions: [{ emoji: "❤️", n: 18 }, { emoji: "🔥", n: 7 }]
    }
  ];

  /* Proof we hold but with no message attached to it. Phrased as our
     statement of what happened, never as words from the member. */
  var MILESTONES = [
    {
      who: "Lee B.",
      what: "Passed stage two of a prop firm evaluation",
      when: "Aug 2026"
    }
  ];

  var winsGrid = document.getElementById("winsGrid");
  var winsSection = document.getElementById("wins");

  if (winsGrid && winsSection && WINS.length) {
    function escHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    var winsHtml = "";
    for (var w = 0; w < WINS.length; w++) {
      var win = WINS[w];

      var av = win.avatar
        ? '<img class="win__av" src="' + escHtml(win.avatar) + '" alt="" width="36" height="36" />'
        : '<span class="win__av win__av--letter" aria-hidden="true">' +
            escHtml(win.name.trim().charAt(0).toUpperCase()) +
          "</span>";

      var proof = "";
      if (win.proof) {
        proof =
          '<figure class="win__proof">' +
            '<img src="' + escHtml(win.proof) + '" alt="' + escHtml(win.proofAlt || "") + '" loading="lazy" />' +
          "</figure>";
      }

      var reacts = "";
      if (win.reactions && win.reactions.length) {
        reacts = '<div class="win__reacts">';
        for (var r = 0; r < win.reactions.length; r++) {
          reacts +=
            '<span class="win__react">' +
              escHtml(win.reactions[r].emoji) +
              "<b>" + escHtml(win.reactions[r].n) + "</b>" +
            "</span>";
        }
        reacts += "</div>";
      }

      var badge = win.badge
        ? '<span class="win__badge">' + escHtml(win.badge) + "</span>"
        : "";

      winsHtml +=
        '<figure class="win">' +
          '<figcaption class="win__head">' +
            av +
            '<span class="win__who">' +
              '<span class="win__name">' + escHtml(win.name) + "</span>" +
              '<span class="win__when">' + escHtml(win.when || "") + "</span>" +
            "</span>" +
          "</figcaption>" +
          '<blockquote class="win__text">' + escHtml(win.text) + "</blockquote>" +
          proof +
          badge +
          reacts +
        "</figure>";
    }

    winsGrid.innerHTML = winsHtml;
    winsSection.removeAttribute("hidden");

    var milesWrap = document.getElementById("winsMiles");
    var milesList = document.getElementById("winsMilesList");
    if (milesWrap && milesList && MILESTONES.length) {
      var milesHtml = "";
      for (var m = 0; m < MILESTONES.length; m++) {
        milesHtml +=
          "<li>" +
            '<span class="miles__who">' + escHtml(MILESTONES[m].who) + "</span>" +
            "<span>" + escHtml(MILESTONES[m].what) + "</span>" +
            '<span class="miles__when">' + escHtml(MILESTONES[m].when) + "</span>" +
          "</li>";
      }
      milesList.innerHTML = milesHtml;
      milesWrap.removeAttribute("hidden");
    }
  }
})();
