(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal on scroll
  const nodes = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach((n) => io.observe(n));
  }

  // Count-up meters
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = Number(el.getAttribute("data-count") || "0");
    if (reduceMotion) {
      el.textContent = target.toLocaleString("en-US");
      return;
    }
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  // Copy install commands on click
  document.querySelectorAll(".pkg__code").forEach((block) => {
    block.addEventListener("click", async () => {
      const text = block.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        block.dataset.copied = "1";
        const prev = block.querySelector("code");
        if (prev) {
          const original = prev.textContent;
          prev.textContent = "copied to clipboard";
          setTimeout(() => {
            prev.textContent = original;
            delete block.dataset.copied;
          }, 1200);
        }
      } catch {
        /* ignore */
      }
    });
    block.title = "Click to copy";
    block.style.cursor = "copy";
  });

  // Contour / signal field
  const canvas = document.getElementById("field");
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let points = [];
  let raf = 0;
  let mouse = { x: 0.72, y: 0.22 };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.ceil(w / 56);
    const rows = Math.ceil(h / 56);
    points = [];
    for (let y = 0; y <= rows; y += 1) {
      for (let x = 0; x <= cols; x += 1) {
        points.push({
          x: (x / cols) * w,
          y: (y / rows) * h,
          o: Math.random() * Math.PI * 2,
        });
      }
    }
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);
    const mx = mouse.x * w;
    const my = mouse.y * h;

    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const wave = Math.sin(dist * 0.012 - t * 0.0018 + p.o);
      const lift = wave * 10;
      const alpha = Math.max(0.05, 0.28 - dist / (w * 1.35));
      const size = 1.1 + (wave + 1) * 0.9;

      ctx.beginPath();
      ctx.fillStyle = `rgba(168, 255, 62, ${alpha})`;
      ctx.arc(p.x, p.y + lift, size, 0, Math.PI * 2);
      ctx.fill();

      if (i % 7 === 0 && dist < 280) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(168, 255, 62, ${alpha * 0.35})`;
        ctx.lineWidth = 0.6;
        ctx.moveTo(p.x, p.y + lift);
        ctx.lineTo(mx, my);
        ctx.stroke();
      }
    }

    raf = requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      mouse.x = e.clientX / Math.max(w, 1);
      mouse.y = e.clientY / Math.max(h, 1);
    },
    { passive: true }
  );

  resize();
  raf = requestAnimationFrame(draw);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }
  });
})();
