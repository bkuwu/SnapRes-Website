(function () {
  "use strict";

  var el = document.getElementById("downloadCounter");
  var numEl = document.getElementById("downloadCountNum");
  var badgeEl = document.getElementById("downloadCounterBadge");
  if (!el || !numEl) return;

  var CFG = window.SNAPRES_CONFIG || {};
  var ENDPOINT = CFG.STATS_API || "";
  if (!ENDPOINT) return;

  var POLL_MS = 20000;
  var current = null;
  var shown = false;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateTo(target) {
    var from = current === null ? 0 : current;
    if (from === target) { numEl.textContent = target.toLocaleString(); return; }
    var duration = current === null ? 1400 : 900;
    var startTime = null;
    function frame(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = easeOutCubic(progress);
      numEl.textContent = Math.round(from + (target - from) * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    if (current !== null && target !== current && badgeEl) {
      badgeEl.classList.remove("is-flashing");
      void badgeEl.offsetWidth;
      badgeEl.classList.add("is-flashing");
    }
    current = target;
  }

  function poll() {
    fetch(ENDPOINT + "/api/public-stats")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var total = Number(data.downloads) || 0;
        if (!shown) {
          shown = true;
          el.style.display = "block";
        }
        animateTo(total);
      })
      .catch(function () {});
  }

  poll();
  setInterval(poll, POLL_MS);
})();
