(function () {
  "use strict";

  var el = document.getElementById("downloadCounter");
  var numEl = document.getElementById("downloadCountNum");
  if (!el || !numEl) return;

  var CFG = window.SNAPRES_CONFIG || {};
  var owner = CFG.GITHUB_OWNER;
  var repo = CFG.GITHUB_REPO;
  if (!owner || !repo) return;

  function animateCount(target) {
    var start = 0;
    var duration = 1400;
    var startTime = null;
    function frame(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      // ease-out
      var eased = 1 - Math.pow(1 - progress, 3);
      numEl.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  fetch("https://api.github.com/repos/" + owner + "/" + repo + "/releases")
    .then(function (r) { return r.json(); })
    .then(function (releases) {
      if (!Array.isArray(releases)) return;
      var total = 0;
      releases.forEach(function (release) {
        (release.assets || []).forEach(function (asset) {
          if (/\.exe$/i.test(asset.name)) {
            total += asset.download_count || 0;
          }
        });
      });
      if (total <= 0) return; // nothing to show yet
      el.style.display = "block";
      animateCount(total);
    })
    .catch(function () {
      // GitHub API unreachable or rate-limited, just stay hidden
    });
})();
