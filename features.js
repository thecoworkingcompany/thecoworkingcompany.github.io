/* ---------- Features layer (Oct 2026): pricing, day passes, tour slots, events, reviews, walkthrough,
   branch pages, languages and privacy-friendly visit stats. Everything here adds to the page;
   if a request fails, the page still works as before. ---------- */
(function(){
  var SB="https://kedmkbgizyepxwftahmk.supabase.co",KEY="sb_publishable_SAeCe3CFJGoPIVGhqoTHEA_dPAEMIOV";
  var WA="918087050221";
  function api(path,opts){opts=opts||{};var h={apikey:KEY,Authorization:"Bearer "+KEY};if(opts.body)h["Content-Type"]="application/json";
    return fetch(SB+path,{method:opts.method||(opts.body?"POST":"GET"),headers:h,body:opts.body?JSON.stringify(opts.body):undefined,keepalive:!!opts.keepalive})
      .then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok)throw new Error(j.error||j.message||("Error "+r.status));return j})})}
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
  function rs(p){return "₹"+(Number(p)/100).toLocaleString("en-IN",{maximumFractionDigits:0})}
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}
  function el(html){var d=document.createElement("div");d.innerHTML=html.trim();return d.firstChild}
  function istToday(){return new Date(Date.now()+5.5*3600e3).toISOString().slice(0,10)}
  function niceDate(d){return new Date(d+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
  var BRANCHES=[[1,"Dharampeth","C Square 241, Mata Mandir Road, Khare Town, Dharampeth, Nagpur 440010"],[2,"Dev Nagar","JK Heights, Ajni Square, Deo Nagar, Nagpur 440015"],[3,"Orange City Mall 1 · 4th floor","Orange City Mall 1, Jai Prakash Nagar, Somalwada, Nagpur 440025"],[4,"Orange City Mall 1 · 6th floor","Orange City Mall 1, Jai Prakash Nagar, Somalwada, Nagpur 440025"],[5,"Orange City Mall 1 · 8th floor","Orange City Mall 1, Jai Prakash Nagar, Somalwada, Nagpur 440025"]];
  function branchName(id){var b=BRANCHES.filter(function(x){return x[0]==id})[0];return b?b[1]:""}
  function branchAddr(id){var b=BRANCHES.filter(function(x){return x[0]==id})[0];return b?b[2]:""}

  // ---------------- Visit stats: no cookies, no names, a random id kept in this browser ----------------
  var vid=store("tcc-vid");if(!vid){vid=Math.random().toString(36).slice(2,12)+Date.now().toString(36);store("tcc-vid",vid)}
  var dev=/Mobi|Android|iPhone/i.test(navigator.userAgent)?"mobile":"desktop";
  var ref="";try{ref=document.referrer?new URL(document.referrer).hostname:"";if(ref===location.hostname)ref=""}catch(e){}
  var utm=(location.search.match(/[?&]utm_source=([^&]+)/)||[])[1];if(utm)ref="utm:"+decodeURIComponent(utm).slice(0,40);
  var lastPath="";
  function track(ev,label){
    var path=location.pathname+(location.hash||"");
    if(ev==="view"){if(path===lastPath)return;lastPath=path}
    if(navigator.doNotTrack==="1")return;
    api("/rest/v1/rpc/log_site_event",{body:{p_path:path,p_event:ev,p_label:label||null,p_ref:ev==="view"?(ref||null):null,p_device:dev,p_lang:document.documentElement.lang||"en",p_visitor:vid},keepalive:true}).catch(function(){});
  }
  window.tccTrack=track;
  setTimeout(function(){track("view")},400);
  window.addEventListener("hashchange",function(){setTimeout(function(){track("view")},50)});
  window.addEventListener("popstate",function(){setTimeout(function(){track("view")},50)});
  document.addEventListener("click",function(e){
    var a=e.target.closest("a,button");if(!a)return;
    var h=a.getAttribute("href")||"";
    if(/wa\.me/.test(h))track("whatsapp",a.className.indexOf("wa-fab")>-1?"floating":"link");
    else if(/^tel:/.test(h))track("call",h.slice(4));
    else if(/\/app\/#\/register/.test(h))track("register",a.textContent.trim().slice(0,40));
    else if(/\/app\//.test(h)||/play\.google|apps\.apple/.test(h))track("app",a.textContent.trim().slice(0,40));
    else if(a.matches(".btn,.tour-cta,[data-track]"))track("cta",(a.dataset.track||a.textContent).trim().slice(0,60));
  },true);

  // ---------------- Settings (prices and switches) ----------------
  var S={price_guide:{enabled:true,per_seat_min_paise:700000,per_seat_max_paise:800000},day_pass:{enabled:true,price_paise:69900,includes:"One combo meal at BREAK",branches:[1,2,3,4,5]}};
  var ready=api("/rest/v1/site_settings?select=key,value").then(function(rows){(rows||[]).forEach(function(r){S[r.key]=r.value})}).catch(function(){});

  // ---------------- Price guide ----------------
  function seatRange(n){var g=S.price_guide;return [n*g.per_seat_min_paise,n*g.per_seat_max_paise]}
  function rangeTxt(a){return a[0]===a[1]?rs(a[0]):rs(a[0])+"–"+rs(a[1]).replace("₹","")}
  ready.then(function(){
    if(!S.price_guide||!S.price_guide.enabled)return;
    var g=S.price_guide,per=rangeTxt([g.per_seat_min_paise,g.per_seat_max_paise]);
    var grid=document.querySelector("#workspaces .ws-grid");
    if(grid&&!document.getElementById("priceBand")){
      grid.parentNode.insertBefore(el('<div class="fx-price frame" id="priceBand"><div><p class="label">Price guide</p><p class="fx-big">'+per+'<small> per seat, per month</small></p><p class="fx-sub">Electricity, leased-line internet, power backup, parking, and tea and coffee are included. Final pricing depends on branch, layout and term.</p></div><div class="fx-calc"><label>Seats<input type="range" min="1" max="50" value="8" id="fxSeats" aria-label="Number of seats"></label><p><b id="fxSeatN">8 seats</b><span id="fxSeatAmt"></span><small>a month, before GST</small></p><a class="btn primary" href="#tour" data-track="Price guide: book a tour">Get an exact quote</a></div><span class="fx-dot" aria-hidden="true"></span></div>'),grid.nextSibling);
      var r=document.getElementById("fxSeats"),upd=function(){var n=+r.value;document.getElementById("fxSeatN").textContent=n+(n>1?" seats":" seat");document.getElementById("fxSeatAmt").textContent=rangeTxt(seatRange(n))};
      r.addEventListener("input",upd);upd();
    }
    // FAQ: answer the first question people ask
    var faq=document.querySelector("#faq .faq");
    if(faq&&!document.getElementById("faqPrice")){
      var d=el('<details id="faqPrice"><summary>How much does a seat cost?</summary><p>Most seats are '+per+' per seat, per month, with electricity, internet, power backup, parking, and tea and coffee included. A day pass is '+(S.day_pass&&S.day_pass.price_paise?rs(S.day_pass.price_paise):"available")+(S.day_pass&&S.day_pass.includes?" and includes "+esc(S.day_pass.includes.charAt(0).toLowerCase()+S.day_pass.includes.slice(1)):"")+'. Book a tour for an exact quote for your team.</p></details>');
      faq.insertBefore(d,faq.firstChild);
    }
    // Find your fit: estimate for the recommended size
    var where=document.getElementById("recWhere");
    if(where&&!document.getElementById("recPrice")){
      var p=el('<p class="fx-est" id="recPrice"></p>');where.parentNode.insertBefore(p,where.nextSibling);
      var SIZE={"1":[1,1],"2-6":[2,6],"7-10":[7,10],"11-25":[11,25],"26+":[26,26]};
      var fit=function(){var c=document.querySelector('.q[data-q="size"] .chip[aria-pressed="true"]');var s=SIZE[c?c.dataset.v:"7-10"]||[7,10];
        var lo=s[0]*g.per_seat_min_paise,hi=s[1]*g.per_seat_max_paise;p.innerHTML="Estimated <b>"+rs(lo)+(s[1]===26?"+":"–"+rs(hi).replace("₹",""))+"</b> a month for "+(s[0]===s[1]?s[0]+(s[0]>1?" seats":" seat"):s[0]+"–"+s[1]+" seats")+", before GST"};
      document.getElementById("fitQs").addEventListener("click",function(){setTimeout(fit,0)});fit();
    }
    // Design your office: estimate from workstations
    var ps=document.getElementById("plSeats");
    if(ps&&!document.getElementById("plPrice")){
      var pp=el('<p class="fx-est" id="plPrice"></p>');var why=document.getElementById("plWhy");why.parentNode.insertBefore(pp,why.nextSibling);
      var plu=function(){var n=parseInt(ps.textContent,10)||0;pp.innerHTML=n?"About <b>"+rangeTxt(seatRange(n))+"</b> a month for "+n+(n>1?" workstations":" workstation"):""};
      new MutationObserver(plu).observe(ps,{childList:true,characterData:true,subtree:true});plu();
    }
  });

  // ---------------- Day pass ----------------
  var QR_SRC="/vendor/qrcode-2.0.4.js",qrP=null;
  function qrLib(){if(window.qrcode)return Promise.resolve(window.qrcode);if(qrP)return qrP;qrP=new Promise(function(ok,no){var s=document.createElement("script");s.src=QR_SRC;s.onload=function(){ok(window.qrcode)};s.onerror=no;document.head.appendChild(s)});return qrP}
  function qrSvg(text,node){qrLib().then(function(q){var c=q(0,"M");c.addData(text);c.make();node.innerHTML=c.createSvgTag({cellSize:5,margin:2,scalable:true})}).catch(function(){node.innerHTML='<span class="fx-code">'+esc(text)+'</span>'})}
  function ics(title,date,start,end,loc,desc){
    var d=date.replace(/-/g,""),stamp=new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
    var body=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//The Coworking Company//EN","BEGIN:VEVENT","UID:"+Math.random().toString(36).slice(2)+"@thecoworkingcompany.in","DTSTAMP:"+stamp,
      start?"DTSTART;TZID=Asia/Kolkata:"+d+"T"+start.replace(":","")+"00":"DTSTART;VALUE=DATE:"+d,
      start?"DTEND;TZID=Asia/Kolkata:"+d+"T"+end.replace(":","")+"00":"DTEND;VALUE=DATE:"+d,
      "SUMMARY:"+title,"LOCATION:"+loc.replace(/,/g,"\\,"),"DESCRIPTION:"+desc.replace(/\n/g,"\\n").replace(/,/g,"\\,"),"END:VEVENT","END:VCALENDAR"].join("\r\n");
    return URL.createObjectURL(new Blob([body],{type:"text/calendar"}));
  }
  function passCard(b,token){
    var paid=b.status==="paid"||b.status==="confirmed"||b.status==="used",pending=b.status==="pending_payment",cancelled=b.status==="cancelled";
    var head=cancelled?"This pass was cancelled":pending?"Payment not finished":paid?"You're booked":"Pass reserved";
    var sub=cancelled?"Call +91 80870 50221 if this is a mistake.":pending?"Your seat is held for a few minutes. Finish paying, or choose to pay at the desk.":paid?"Paid. Show this code at reception.":"Pay "+rs(b.amount_paise)+" at reception when you arrive. Show this code.";
    var card=el('<div class="fx-pass frame" id="fxPass" tabindex="-1"><div class="fx-pass-l"><p class="label">Day pass · '+esc(head)+'</p><h3>'+esc(niceDate(b.day))+'</h3><p class="fx-sub">'+esc(b.branch||branchName(b.branch_id))+' · '+b.people+(b.people>1?" people":" person")+' · '+rs(b.amount_paise)+'</p><p class="fx-sub">'+esc(sub)+'</p>'+
      (S.day_pass&&S.day_pass.includes?'<p class="fx-inc">Includes '+esc(S.day_pass.includes.charAt(0).toLowerCase()+S.day_pass.includes.slice(1))+(b.people>1?" each":"")+'</p>':'')+
      '<div class="fx-row">'+(pending&&token?'<a class="btn primary" href="'+SB+'/functions/v1/public-book/pay?t='+esc(token)+'">Pay '+rs(b.amount_paise)+'</a>':'')+
      (!cancelled&&!pending?'<a class="btn" id="fxIcs" download="tcc-day-pass.ics">Add to calendar</a>':'')+
      '<a class="btn" target="_blank" rel="noopener" href="https://wa.me/'+WA+'?text='+encodeURIComponent("Hi TCC, about my day pass on "+niceDate(b.day)+(b.pass_code?" (code "+b.pass_code+")":"")+".")+'">WhatsApp us</a>'+
      '<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(branchAddr(b.branch_id))+'">Directions</a></div></div>'+
      (b.pass_code?'<div class="fx-pass-r"><div class="fx-qr" id="fxQr" aria-label="Pass QR code"></div><span class="fx-code">'+esc(b.pass_code)+'</span></div>':'')+'<span class="fx-dot" aria-hidden="true"></span></div>');
    if(b.pass_code)qrSvg("TCC:"+b.pass_code,card.querySelector("#fxQr"));
    var ic=card.querySelector("#fxIcs");if(ic)ic.href=ics("Day pass · The Coworking Company",b.day,"","",branchAddr(b.branch_id),"Show code "+(b.pass_code||"")+" at reception.\nThe Coworking Company · +91 80870 50221");
    return card;
  }
  ready.then(function(){
    var dp=S.day_pass;if(!dp||!dp.enabled||!dp.price_paise)return;
    var host=document.getElementById("priceBand")||document.querySelector("#workspaces .ws-grid");if(!host||document.getElementById("daypass"))return;
    var opts=(dp.branches||[1,2,3,4,5]).map(function(id){return '<option value="'+id+'"'+(id===3?" selected":"")+'>'+esc(branchName(id))+'</option>'}).join("");
    var today=istToday(),max=new Date(Date.now()+5.5*3600e3+60*864e5).toISOString().slice(0,10);
    var sec=el('<div class="fx-dp" id="daypass"><div class="fx-dp-l"><p class="label">Day pass</p><h3 class="h2 fx-h">Try a day<span class="fx-tomato">.</span></h3><p class="fx-big">'+rs(dp.price_paise)+'<small> a day</small></p><p class="fx-sub">A full working day at a TCC branch: a desk, fast internet, power backup, tea and coffee'+(dp.includes?', and '+esc(dp.includes.charAt(0).toLowerCase()+dp.includes.slice(1)):'')+'.</p><ul class="fx-ticks"><li>Book in a minute, no account needed</li><li>A QR pass for reception</li><li>Directions and a calendar reminder in one tap</li></ul></div>'+
      '<form class="tour frame fx-dp-form" id="dpForm" novalidate><label>Branch<select name="branch_id">'+opts+'</select></label><label>Date<input type="date" name="day" min="'+today+'" max="'+max+'" value="'+today+'" required></label>'+
      '<label>People<select name="people"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label><label>Your name<input name="name" autocomplete="name" required placeholder="Aarav Deshmukh"></label>'+
      '<label>Mobile<input name="phone" type="tel" autocomplete="tel" required placeholder="+91 98765 43210"></label><label><span>Email <span class="fx-opt">· optional</span></span><input name="email" type="email" autocomplete="email" placeholder="you@company.in"></label>'+
      '<div class="full fx-pay" id="dpPay"></div><div class="full fx-row"><button class="btn primary" type="submit" id="dpBtn">Book day pass · <span id="dpAmt">'+rs(dp.price_paise)+'</span></button><span class="err" id="dpErr" hidden></span></div></form></div>');
    host.parentNode.insertBefore(sec,host.nextSibling);
    var f=document.getElementById("dpForm"),amt=document.getElementById("dpAmt"),err=document.getElementById("dpErr"),btn=document.getElementById("dpBtn");
    f.people.addEventListener("change",function(){amt.textContent=rs(dp.price_paise*+f.people.value)});
    // online payment shows only if PayU is switched on at the server
    var payBox=document.getElementById("dpPay");payBox.innerHTML='<p class="fx-sub" style="margin:0">Pay at reception when you arrive.</p>';
    api("/functions/v1/public-book/config").then(function(c){if(c&&c.online)payBox.innerHTML='<label class="fx-radio"><input type="radio" name="pay" value="online" checked> Pay online now · UPI, cards, netbanking</label><label class="fx-radio"><input type="radio" name="pay" value="desk"> Pay at reception</label>'}).catch(function(){});
    f.addEventListener("submit",function(e){
      e.preventDefault();err.hidden=true;
      var pay=(f.querySelector('input[name="pay"]:checked')||{}).value||"desk";
      btn.disabled=true;var old=btn.innerHTML;btn.textContent="Booking…";
      api("/functions/v1/public-book",{body:{kind:"day_pass",branch_id:+f.branch_id.value,day:f.day.value,people:+f.people.value,name:f.name.value,phone:f.phone.value,email:f.email.value,pay:pay}})
        .then(function(b){
          track("booking","day pass");store("tcc-daypass",b.token);
          if(b.pay_url){location.href=b.pay_url;return}
          showPass(b,b.token,true);f.reset();f.day.value=istToday();amt.textContent=rs(dp.price_paise);
        })
        .catch(function(x){err.textContent=x.message;err.hidden=false})
        .then(function(){btn.disabled=false;btn.innerHTML=old});
    });
    function showPass(b,token,scroll){var old=document.getElementById("fxPass");if(old)old.remove();var c=passCard(b,token);sec.parentNode.insertBefore(c,sec);if(scroll){c.scrollIntoView({behavior:"smooth",block:"center"});c.focus({preventScroll:true})}}
    var t=(location.search.match(/[?&]daypass=([0-9a-f-]{36})/i)||[])[1]||null,fromPayU=!!t;t=t||store("tcc-daypass");
    if(t)api("/functions/v1/public-book/status?t="+t).then(function(b){
      if(!fromPayU&&b.day<istToday()){store("tcc-daypass",null);return}
      showPass(b,t,fromPayU);
      if(fromPayU&&history.replaceState)history.replaceState(null,"",location.pathname+location.hash);
    }).catch(function(){store("tcc-daypass",null)});
    // a quick button in the hero area for walk-ins
    var mbar=document.querySelector(".mbar");if(mbar&&!mbar.querySelector('[href="#daypass"]')){var a=el('<a class="btn" href="#daypass" data-track="Day pass (bar)">Day pass</a>');mbar.insertBefore(a,mbar.firstChild)}
  });

  // ---------------- Tour: pick a time, then add it to your calendar ----------------
  (function(){
    var date=document.getElementById("f-date");if(!date||document.getElementById("f-slot"))return;
    date.min=istToday();
    var lab=date.closest("label");lab.classList.remove("full");
    var slots=[];for(var m=10*60;m<=18*60+30;m+=30){var h=Math.floor(m/60),mm=m%60;slots.push((h<10?"0":"")+h+":"+(mm?"30":"00"))}
    function lbl(s){var h=+s.slice(0,2),ap=h>=12?"PM":"AM",hh=h>12?h-12:h;return hh+":"+s.slice(3)+" "+ap}
    var sl=el('<label>Preferred time<select id="f-slot" name="slot"><option value="">Any time</option>'+slots.map(function(s){return '<option value="'+lbl(s)+'" data-t="'+s+'">'+lbl(s)+'</option>'}).join("")+'</select></label>');
    lab.parentNode.insertBefore(sl,lab.nextSibling);
    var f=document.getElementById("tourForm"),out=document.getElementById("out");
    f.addEventListener("submit",function(){
      track("tour",(document.getElementById("f-ws")||{}).value);
      setTimeout(function(){
        var s=document.getElementById("f-slot"),msg=document.getElementById("msg"),wa=document.getElementById("wa");
        if(s.value&&msg.textContent.indexOf("Preferred time")<0){msg.textContent=msg.textContent.replace(/(Preferred date: [^\n]*)/,"$1\nPreferred time: "+s.value);if(msg.textContent.indexOf("Preferred time")<0)msg.textContent+="\nPreferred time: "+s.value;wa.href="https://wa.me/"+WA+"?text="+encodeURIComponent(msg.textContent)}
        var row=out.querySelector(".row"),old=document.getElementById("tourIcs");if(old)old.remove();
        if(date.value){var t=s.selectedOptions[0]&&s.selectedOptions[0].dataset.t,end=t?(function(){var m=+t.slice(0,2)*60+ +t.slice(3)+45;return (m<600?"0":"")+Math.floor(m/60)+":"+(m%60<10?"0":"")+m%60})():"";
          var br=document.getElementById("f-br").value,addr=/Dharampeth/.test(br)?BRANCHES[0][2]:/Dev Nagar/.test(br)?BRANCHES[1][2]:/Orange/.test(br)?BRANCHES[2][2]:"The Coworking Company, Nagpur";
          var a=el('<a class="btn" id="tourIcs" download="tcc-tour.ics">Add to calendar</a>');a.href=ics("Tour · The Coworking Company",date.value,t||"",end,addr,"Tour of The Coworking Company. We'll call to confirm.\n+91 80870 50221");row.appendChild(a)}
      },60);
    });
  })();

  // ---------------- Events from the community calendar ----------------
  api("/rest/v1/rpc/event_board",{body:{p_days:45}}).then(function(evs){
    if(!evs||!evs.length)return;
    var html='<div class="fx-events"><p class="label">What\'s on</p><div class="fx-ev-list">'+evs.slice(0,6).map(function(e){var d=new Date(e.starts_at);
      return '<article class="fx-ev frame"><time datetime="'+e.starts_at+'"><b>'+d.toLocaleDateString("en-IN",{day:"numeric"})+'</b>'+d.toLocaleDateString("en-IN",{month:"short"})+'</time><div><h4>'+esc(e.title)+'</h4><p>'+d.toLocaleString("en-IN",{weekday:"short",hour:"numeric",minute:"2-digit"})+(e.branch_id?" · "+esc(branchName(e.branch_id)):"")+'</p>'+(e.details?'<p>'+esc(e.details)+'</p>':'')+'<p class="fx-sub">'+(e.going?e.going+" going · ":"")+'Members RSVP in the app</p></div></article>'}).join("")+'</div></div>';
    var brk=document.querySelector("#break .wrap");if(brk)brk.appendChild(el(html));
  }).catch(function(){});

  // ---------------- Reviews, walkthrough, branch pages, languages ----------------
  var MAPS="https://www.google.com/maps/place/?q=place_id:ChIJYxLZkUHB1DsRxbcopyXWBf4",WRITE="https://search.google.com/local/writereview?placeid=ChIJYxLZkUHB1DsRxbcopyXWBf4";
  var story=document.querySelector("#room-about .wrap");
  if(story&&!document.getElementById("fxReviews")){
    story.appendChild(el('<div class="fx-reviews frame" id="fxReviews"><div><p class="label">In their words</p><h3 class="fx-h3">Read what members say on Google.</h3><p class="fx-sub">Real reviews from teams who work at TCC, unedited. Worked with us? A review helps other teams find a good place to work.</p></div><div class="fx-row"><a class="btn primary" href="'+MAPS+'" target="_blank" rel="noopener" data-track="Google reviews">Read reviews ↗</a><a class="btn" href="'+WRITE+'" target="_blank" rel="noopener" data-track="Write a review">Write a review ↗</a></div><span class="fx-dot" aria-hidden="true"></span></div>'));
  }
  var SLUG={1:"dharampeth",2:"dev-nagar",3:"orange-city-mall"};
  [].forEach.call(document.querySelectorAll("#locations .loc"),function(card,i){
    if(card.querySelector(".fx-branch"))return;var s=SLUG[i+1];if(!s)return;
    var a=el('<a class="map fx-branch" href="/branches/'+s+'.html">Branch page, photos &amp; directions →</a>');card.appendChild(a);
  });
  var locWrap=document.querySelector("#locations .wrap");
  if(locWrap&&!document.getElementById("fxWalk")){
    locWrap.appendChild(el('<a class="fx-walk frame" id="fxWalk" href="/walkthrough.html" data-track="Walkthrough"><img src="assets/hd-reception.jpg" alt="" loading="lazy"><span class="fx-walk-t"><small>Virtual walkthrough</small><b>Walk through TCC before you visit</b><span>Look around reception, the floors, a cabin, a meeting room and BREAK. Drag to look around.</span></span><span class="fx-walk-go" aria-hidden="true">360°</span></a>'));
  }
  var meta=document.querySelector("footer .meta");
  if(meta&&!document.getElementById("fxLang")){
    meta.appendChild(el('<span id="fxLang" class="fx-lang"><a href="/hi/" lang="hi" hreflang="hi">हिन्दी</a> · <a href="/mr/" lang="mr" hreflang="mr">मराठी</a></span>'));
    meta.appendChild(el('<a href="/walkthrough.html">Virtual walkthrough</a>'));
  }
})();
