// ---------- Refinement layer: graphics and motion ----------
(function(){
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Aurora behind the opening and the index of rooms
  ["section.hero","section.index"].forEach(function(sel){
    var host=document.querySelector(sel);if(!host||host.querySelector(".aurora"))return;
    var a=document.createElement("div");a.className="aurora";a.setAttribute("aria-hidden","true");a.innerHTML="<i></i><i></i><i></i>";
    host.insertBefore(a,host.firstChild);
  });

  // Paper grain over everything, and a hairline reading-progress under the safe area
  var g=document.createElement("div");g.className="grain";g.setAttribute("aria-hidden","true");document.body.appendChild(g);
  var p=document.createElement("div");p.className="progress";p.setAttribute("aria-hidden","true");document.body.appendChild(p);
  var ticking=false;
  function progress(){ticking=false;var h=document.documentElement;var max=h.scrollHeight-h.clientHeight;p.style.transform="scaleX("+(max>0?Math.min(1,h.scrollTop/max):0)+")"}
  window.addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(progress)}},{passive:true});
  window.addEventListener("resize",progress);progress();

  // Reveals: headings, cards and photos enter once, when they first come into view
  var heads=document.querySelectorAll(".pane .h2, .pane .lede, .pane .label, .ws, .loc, .phil, .amen li, .story figure, .hq, .meaning div");
  var pics=document.querySelectorAll(".ws .ph, .story figure, .bk-photos, .strip figure, .handled .pics, .spaces figure, .next-room .ph");
  if(!reduce&&"IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){
      var el=e.target,sib=el.parentElement?[].slice.call(el.parentElement.children).filter(function(c){return c.classList.contains("rv")||c.classList.contains("rv-img")}):[];
      var i=Math.max(0,sib.indexOf(el));el.style.transitionDelay=Math.min(i,6)*70+"ms";el.classList.add("in");io.unobserve(el)}})},{rootMargin:"0px 0px -8% 0px",threshold:.08});
    [].forEach.call(heads,function(el){if(el.closest(".hero"))return;el.classList.add("rv");io.observe(el)});
    [].forEach.call(pics,function(el){el.classList.add("rv-img");io.observe(el)});
  }

  // (stat count-up is handled by the site's own script)

  // Pointer-follow highlight on the primary button (subtle, desktop only)
  if(window.matchMedia("(hover:hover) and (pointer:fine)").matches){
    [].forEach.call(document.querySelectorAll(".btn.primary"),function(b){
      b.addEventListener("pointermove",function(e){var r=b.getBoundingClientRect();b.style.setProperty("--mx",((e.clientX-r.left)/r.width*100)+"%");b.style.setProperty("--my",((e.clientY-r.top)/r.height*100)+"%")});
    });
    var st=document.createElement("style");st.textContent=".btn.primary{background-image:radial-gradient(120px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.28),transparent 60%)}.btn.primary:hover{background-image:radial-gradient(120px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.14),transparent 60%)}";
    document.head.appendChild(st);
  }
})();
