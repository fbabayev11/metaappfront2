import React, { useEffect, useRef } from "react";

export default function NeuralBackground({
  color = "#6c63ff",
  trailOpacity = 0.04,
  particleCount = 300,
  speed = 0.4,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let animId;
    let mouse = { x: -9999, y: -9999 };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.age = Math.random() * 300;
        this.life = 300 + Math.random() * 200;
        this.size = Math.random() * 1.5 + 0.5;
      }

      update() {
        // Flow field
        const angle = (Math.cos(this.x * 0.004) + Math.sin(this.y * 0.004)) * Math.PI * 2;
        this.vx += Math.cos(angle) * 0.15 * speed;
        this.vy += Math.sin(angle) * 0.15 * speed;

        // Mouse interaction — güclü itələmə
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 120;
        if (dist < radius && dist > 0) {
          const force = (radius - dist) / radius;
          this.vx += (dx / dist) * force * 2.5;
          this.vy += (dy / dist) * force * 2.5;
        }

        this.vx *= 0.92;
        this.vy *= 0.92;
        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        if (this.age > this.life || this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10) {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
          this.age = 0;
          this.life = 300 + Math.random() * 200;
        }
      }

      draw() {
        const alpha = Math.sin((this.age / this.life) * Math.PI) * 0.7;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    };

    resize();
    const particles = Array.from({ length: particleCount }, () => new Particle());

    const animate = () => {
      // Tamamilə təmizlə — kölgə yoxdur
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => { resize(); };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
    };
  }, [color, particleCount, speed]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
