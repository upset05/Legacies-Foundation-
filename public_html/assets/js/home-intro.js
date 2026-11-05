const intro = document.getElementById("brandIntro");
const skipButton = document.getElementById("brandIntroSkip");
const cursor = document.getElementById("brandIntroCursor");
const canvas = document.getElementById("brandIntroCanvas");
const context = canvas?.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const shouldShow = intro && document.documentElement.classList.contains("home-intro-enabled");
let animationFrame = 0;
let dismissTimer;

function dismissIntro() {
  if (!shouldShow || intro.classList.contains("is-dismissed")) return;
  intro.classList.add("is-dismissed");
  window.clearTimeout(dismissTimer);
  window.cancelAnimationFrame(animationFrame);
}

if (shouldShow) {
  skipButton?.addEventListener("click", dismissIntro);
  intro.addEventListener("click", dismissIntro);
  intro.addEventListener("touchstart", dismissIntro, { once: true, passive: true });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") dismissIntro();
  });

  if (reducedMotion) {
    dismissTimer = window.setTimeout(dismissIntro, 150);
  } else {
    dismissTimer = window.setTimeout(dismissIntro, 4000);
  }
}

if (shouldShow && canvas && context && !reducedMotion) {
  const mouseRadius = 140;
  const points = Array.from({ length: 110 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    velocityX: (Math.random() - 0.5) * 0.4,
    velocityY: (Math.random() - 0.5) * 0.4,
    radius: 0.8 + Math.random() * 1.5,
    brightness: 0.35 + Math.random() * 0.65,
    phase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.012 + Math.random() * 0.025,
  }));
  const nebulae = [
    { x: 0.24, y: 0.3, radius: 0.36, color: "rgba(89, 78, 162, 0.2)" },
    { x: 0.76, y: 0.66, radius: 0.32, color: "rgba(133, 87, 112, 0.16)" },
    { x: 0.52, y: 0.18, radius: 0.24, color: "rgba(190, 163, 113, 0.11)" },
  ];
  let pointerX = -1000;
  let pointerY = -1000;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  intro.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursor.style.left = `${pointerX}px`;
    cursor.style.top = `${pointerY}px`;
    cursor.classList.add("is-visible");
  });
  intro.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();

  function drawParticles() {
    if (intro.classList.contains("is-dismissed")) return;
    context.clearRect(0, 0, width, height);

    nebulae.forEach(nebula => {
      const glow = context.createRadialGradient(
        nebula.x * width,
        nebula.y * height,
        0,
        nebula.x * width,
        nebula.y * height,
        nebula.radius * Math.max(width, height),
      );
      glow.addColorStop(0, nebula.color);
      glow.addColorStop(1, "rgba(8, 8, 8, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    });

    points.forEach(point => {
      const dx = point.x - pointerX;
      const dy = point.y - pointerY;
      const distance = Math.hypot(dx, dy);
      if (distance < mouseRadius && distance > 0) {
        const force = (1 - distance / mouseRadius) * 2.5;
        point.velocityX += (dx / distance) * force * 0.15;
        point.velocityY += (dy / distance) * force * 0.15;
      }

      point.velocityX *= 0.985;
      point.velocityY *= 0.985;
      point.x += point.velocityX;
      point.y += point.velocityY;
      if (point.x < -10) point.x = width + 10;
      if (point.x > width + 10) point.x = -10;
      if (point.y < -10) point.y = height + 10;
      if (point.y > height + 10) point.y = -10;

      point.phase += point.twinkleSpeed;
      const opacity = distance < mouseRadius
        ? 0.6 + (1 - distance / mouseRadius) * 0.4
        : 0.25 * point.brightness * (0.7 + Math.sin(point.phase) * 0.3);
      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      context.fill();
    });

    for (let index = 0; index < points.length; index += 2) {
      const point = points[index];
      for (let nextIndex = index + 1; nextIndex < points.length; nextIndex += 1) {
        const next = points[nextIndex];
        const midpointX = (point.x + next.x) / 2;
        const midpointY = (point.y + next.y) / 2;
        if (Math.hypot(midpointX - pointerX, midpointY - pointerY) >= mouseRadius * 1.5) continue;

        const distance = Math.hypot(point.x - next.x, point.y - next.y);
        if (distance >= 100) continue;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(next.x, next.y);
        context.strokeStyle = `rgba(255, 255, 255, ${0.12 * (1 - distance / 100)})`;
        context.lineWidth = 0.5;
        context.stroke();
      }
    }

    animationFrame = window.requestAnimationFrame(drawParticles);
  }

  drawParticles();
}
