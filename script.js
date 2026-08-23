(() => {
  "use strict";
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const loader = $("#loader");
  window.setTimeout(() => {
    loader.classList.add("done");
    setTimeout(() => loader.remove(), 850);
    ["opening1","opening2","opening3","opening4","openSurprise"].forEach((id, i) => {
      setTimeout(() => $("#" + id)?.classList.add("show"), 450 + i * 650);
    });
  }, reduced ? 350 : 1450);

  // Lightweight ambient particles.
  const canvas = $("#particles");
  const ctx = canvas.getContext("2d");
  let particles = [];
  function resize() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    particles = Array.from({length: reduced ? 18 : 42}, () => ({
      x: Math.random()*innerWidth, y: Math.random()*innerHeight,
      r: Math.random()*1.6+.4, a: Math.random()*.45+.1,
      s: Math.random()*.22+.04
    }));
  }
  resize();
  addEventListener("resize", resize, {passive:true});
  function draw() {
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for (const p of particles) {
      p.y -= p.s;
      if (p.y < -5) { p.y = innerHeight + 5; p.x = Math.random()*innerWidth; }
      ctx.globalAlpha = p.a;
      ctx.fillStyle = "#f3c9ff";
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(draw);
  }
  draw();

  function burst() {
    if (reduced) return;
    const layer = $("#burst-layer");
    for (let i=0;i<28;i++) {
      const h = document.createElement("span");
      h.className = "burst-heart";
      h.textContent = i%3 === 0 ? "✦" : "♥";
      h.style.left = (innerWidth/2 + (Math.random()-.5)*60) + "px";
      h.style.top = (innerHeight/2 + (Math.random()-.5)*30) + "px";
      h.style.setProperty("--x", ((Math.random()-.5)*innerWidth*.9) + "px");
      h.style.setProperty("--y", ((Math.random()-.5)*innerHeight*.75) + "px");
      h.style.setProperty("--r", ((Math.random()-.5)*100) + "deg");
      layer.appendChild(h);
      setTimeout(() => h.remove(), 1600);
    }
  }

  $("#openSurprise").addEventListener("click", () => {
    burst();
    document.body.classList.add("opened");
    setTimeout(() => $("#hero").scrollIntoView({behavior: reduced ? "auto" : "smooth"}), reduced ? 50 : 450);
  });

  $$(".scroll-next").forEach(btn => btn.addEventListener("click", () => {
    $("#gallery").scrollIntoView({behavior: reduced ? "auto" : "smooth"});
  }));

  // Scroll reveal.
  const reveals = $$(".reveal");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  reveals.forEach(el => observer.observe(el));

  // Gallery.
  const data = window.GALLERY_DATA || [];
  let current = 0;
  const img = $("#galleryImage"), caption = $("#galleryCaption"), count = $("#galleryCount");
  const frame = $(".gallery-frame");
  const thumbs = $$(".thumb");

  function setPhoto(index) {
    current = (index + data.length) % data.length;
    frame.classList.add("changing");
    setTimeout(() => {
      const [src, text] = data[current];
      img.src = "assets/images/" + src;
      img.alt = text;
      caption.textContent = text;
      count.textContent = String(current+1).padStart(2,"0") + " / " + String(data.length).padStart(2,"0");
      thumbs.forEach((t,i) => t.classList.toggle("active", i===current));
      frame.classList.remove("changing");
    }, reduced ? 0 : 130);
  }
  $(".prev").addEventListener("click", () => setPhoto(current-1));
  $(".next").addEventListener("click", () => setPhoto(current+1));
  thumbs.forEach((t,i) => t.addEventListener("click", () => setPhoto(i)));

  // Swipe on the main image.
  let touchX = null;
  img.addEventListener("touchstart", e => touchX = e.changedTouches[0].clientX, {passive:true});
  img.addEventListener("touchend", e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) setPhoto(current + (dx < 0 ? 1 : -1));
    touchX = null;
  }, {passive:true});

  // Subtle tilt only for pointer devices.
  if (!reduced && matchMedia("(pointer:fine)").matches) {
    $$(".gallery-frame,.hero-photo-card,.glass-card").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5;
        card.style.transform = `perspective(900px) rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*2.2).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener("pointerleave", () => card.style.transform = "");
    });
  }

  // Shayari carousel.
  const shCards = $$(".shayari-card"), shDots = $$(".shayari-dot");
  let shIndex = 0;
  function showShayari(i) {
    shIndex = (i + shCards.length) % shCards.length;
    shCards.forEach((c,j)=>c.classList.toggle("active",j===shIndex));
    shDots.forEach((d,j)=>d.classList.toggle("active",j===shIndex));
  }
  shDots.forEach((d,i)=>d.addEventListener("click",()=>showShayari(i)));
  if (!reduced) setInterval(()=>showShayari(shIndex+1), 5200);

  // Final wish.
  $("#wishBtn").addEventListener("click", () => {
    $("#wishMessage").classList.add("visible");
    burst();
    $("#wishBtn").textContent = "Wish Sent Into The Stars ✨";
  });
})();