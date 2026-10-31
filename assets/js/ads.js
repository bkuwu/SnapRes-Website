(function () {
  "use strict";

  var CFG = window.SNAPRES_CONFIG || {};
  var client = CFG.ADSENSE_CLIENT || "";
  if (!/^ca-pub-\d{10,}$/.test(client)) return;

  var meta = document.createElement("meta");
  meta.name = "google-adsense-account";
  meta.content = client;
  document.head.appendChild(meta);

  var s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(client);
  document.head.appendChild(s);

  var slots = CFG.ADSENSE_SLOTS || {};
  var boxes = document.querySelectorAll("[data-ad-slot]");
  Array.prototype.forEach.call(boxes, function (box) {
    var id = slots[box.getAttribute("data-ad-slot")];
    if (!id || !/^\d+$/.test(id)) return;
    var ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", client);
    ins.setAttribute("data-ad-slot", id);
    ins.setAttribute("data-ad-format", "auto");
    ins.setAttribute("data-full-width-responsive", "true");
    box.appendChild(ins);
    box.hidden = false;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  });
})();
