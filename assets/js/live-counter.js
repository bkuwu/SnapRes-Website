(function () {
  "use strict";

  var numEl = document.getElementById("liveUsersNum");
  if (!numEl) return;

  var CFG = window.SNAPRES_CONFIG || {};
  var ENDPOINT = CFG.STATS_API || "";
  var card = numEl.closest(".live-counter-card");
  if (!ENDPOINT) {
    if (card) card.style.display = "none";
    return;
  }

  var POLL_MS = 20000;
  var current = null;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateTo(target) {
    var from = current === null ? 0 : current;
    if (from === target) {
      numEl.textContent = target.toLocaleString();
      current = target;
      return;
    }
    var duration = current === null ? 1600 : 1100;
    var startTime = null;
    function frame(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = easeOutCubic(progress);
      numEl.textContent = Math.round(from + (target - from) * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    current = target;
  }

  function poll() {
    fetch(ENDPOINT + "/api/public-stats")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var n = Number(data.downloads);
        if (!isFinite(n) || n < 0) n = 0;
        animateTo(n);
      })
      .catch(function () {});
  }

  poll();
  setInterval(poll, POLL_MS);
})();
