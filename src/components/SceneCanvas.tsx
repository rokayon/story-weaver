import { useRef, useEffect, useCallback } from "react";

export interface SceneData {
  text?: string;
  weather?: string;
  timeOfDay?: string;
  environment?: string;
  [key: string]: any;
}

interface Props {
  scene: SceneData;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  length?: number;
  size?: number;
  opacity?: number;
  drift?: number;
}

const SceneCanvas = ({ scene, className = "" }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  const getColors = useCallback(() => {
    const time = scene.timeOfDay || "day";
    switch (time) {
      case "night":
        return { sky: ["#0a0a1a", "#1a1a3e", "#0d0d2b"], ground: "#0a1a0a", ambient: "rgba(100,120,255,0.05)" };
      case "evening":
        return { sky: ["#1a0a2e", "#4a1a3e", "#c44e2e"], ground: "#1a1a0a", ambient: "rgba(255,120,80,0.08)" };
      case "morning":
        return { sky: ["#2a1a3e", "#6a3a5e", "#e8a060"], ground: "#1a2a1a", ambient: "rgba(255,200,100,0.06)" };
      default:
        return { sky: ["#4a8ac4", "#6ab4e8", "#87ceeb"], ground: "#2a5a2a", ambient: "rgba(255,255,200,0.04)" };
    }
  }, [scene.timeOfDay]);

  const initParticles = useCallback((w: number, h: number) => {
    const weather = scene.weather || "clear";
    const particles: Particle[] = [];
    if (weather === "rain") {
      for (let i = 0; i < 120; i++) {
        particles.push({ x: Math.random() * w, y: Math.random() * h, speed: 4 + Math.random() * 6, length: 10 + Math.random() * 15 });
      }
    } else if (weather === "snow") {
      for (let i = 0; i < 80; i++) {
        particles.push({ x: Math.random() * w, y: Math.random() * h, speed: 0.5 + Math.random() * 1.5, size: 2 + Math.random() * 4, drift: Math.random() * 2 - 1 });
      }
    } else if (weather === "storm") {
      for (let i = 0; i < 200; i++) {
        particles.push({ x: Math.random() * w, y: Math.random() * h, speed: 8 + Math.random() * 8, length: 15 + Math.random() * 20 });
      }
    }
    // Fireflies for night
    if ((scene.timeOfDay === "night") && weather !== "storm") {
      for (let i = 0; i < 15; i++) {
        particles.push({ x: Math.random() * w, y: h * 0.4 + Math.random() * h * 0.5, speed: 0.3 + Math.random() * 0.5, size: 2 + Math.random() * 2, opacity: Math.random(), drift: Math.random() * Math.PI * 2 });
      }
    }
    particlesRef.current = particles;
  }, [scene.weather, scene.timeOfDay]);

  const drawEnvironment = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    const env = scene.environment || "field";
    const colors = getColors();

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    colors.sky.forEach((c, i) => skyGrad.addColorStop(i / (colors.sky.length - 1), c));
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars for night
    if (scene.timeOfDay === "night") {
      for (let i = 0; i < 60; i++) {
        const sx = (i * 137.5) % w;
        const sy = (i * 97.3) % (h * 0.5);
        const flicker = 0.5 + 0.5 * Math.sin(t * 0.002 + i);
        ctx.fillStyle = `rgba(255,255,255,${0.3 + flicker * 0.7})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.5 + flicker, 0, Math.PI * 2);
        ctx.fill();
      }
      // Moon
      ctx.fillStyle = "rgba(255,250,230,0.9)";
      ctx.beginPath();
      ctx.arc(w * 0.8, h * 0.12, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${parseInt(colors.sky[0].slice(1,3),16)},${parseInt(colors.sky[0].slice(3,5),16)},${parseInt(colors.sky[0].slice(5,7),16)},1)`;
      ctx.beginPath();
      ctx.arc(w * 0.8 + 8, h * 0.12 - 3, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sun for day
    if (scene.timeOfDay === "day" || scene.timeOfDay === "morning") {
      const sunX = scene.timeOfDay === "morning" ? w * 0.2 : w * 0.7;
      const sunY = scene.timeOfDay === "morning" ? h * 0.2 : h * 0.1;
      const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60);
      glow.addColorStop(0, "rgba(255,240,180,0.9)");
      glow.addColorStop(0.5, "rgba(255,200,100,0.2)");
      glow.addColorStop(1, "rgba(255,200,100,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(sunX - 60, sunY - 60, 120, 120);
    }

    const groundY = h * 0.65;

    switch (env) {
      case "forest": {
        // Ground
        ctx.fillStyle = "#1a3a1a";
        ctx.fillRect(0, groundY, w, h - groundY);
        // Trees
        for (let i = 0; i < 12; i++) {
          const tx = (i / 12) * w + Math.sin(i * 3) * 20;
          const th = 60 + Math.sin(i * 7) * 30;
          const sway = Math.sin(t * 0.001 + i) * 3;
          ctx.fillStyle = "#2a1a0a";
          ctx.fillRect(tx - 4, groundY - th * 0.4, 8, th * 0.4);
          ctx.fillStyle = `hsl(${120 + i * 5}, 40%, ${18 + i * 2}%)`;
          ctx.beginPath();
          ctx.moveTo(tx - 25 + sway, groundY - th * 0.3);
          ctx.lineTo(tx + sway, groundY - th);
          ctx.lineTo(tx + 25 + sway, groundY - th * 0.3);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(tx - 20 + sway, groundY - th * 0.5);
          ctx.lineTo(tx + sway, groundY - th - 15);
          ctx.lineTo(tx + 20 + sway, groundY - th * 0.5);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }
      case "ocean": {
        // Water
        for (let y = groundY; y < h; y += 3) {
          const wave = Math.sin(t * 0.002 + y * 0.02) * 5;
          ctx.fillStyle = `hsl(210, 60%, ${20 + (y - groundY) * 0.1}%)`;
          ctx.fillRect(0, y + wave, w, 3);
        }
        break;
      }
      case "city": {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, groundY, w, h - groundY);
        for (let i = 0; i < 10; i++) {
          const bx = i * (w / 10);
          const bh = 40 + Math.sin(i * 5) * 50;
          ctx.fillStyle = `hsl(220, 10%, ${15 + i * 2}%)`;
          ctx.fillRect(bx + 5, groundY - bh, w / 10 - 10, bh);
          // Windows
          for (let wy = groundY - bh + 8; wy < groundY - 8; wy += 12) {
            for (let wx = bx + 10; wx < bx + w / 10 - 10; wx += 10) {
              const lit = Math.sin(wx + wy + t * 0.001) > 0;
              ctx.fillStyle = lit ? "rgba(255,230,150,0.8)" : "rgba(50,50,80,0.5)";
              ctx.fillRect(wx, wy, 5, 7);
            }
          }
        }
        break;
      }
      case "mountain": {
        ctx.fillStyle = "#2a3a2a";
        ctx.fillRect(0, groundY, w, h - groundY);
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = `hsl(210, 15%, ${30 - i * 5}%)`;
          ctx.beginPath();
          ctx.moveTo(i * w * 0.3 - 50, groundY);
          ctx.lineTo(i * w * 0.3 + 80, groundY - 120 - i * 20);
          ctx.lineTo(i * w * 0.3 + 210, groundY);
          ctx.closePath();
          ctx.fill();
          // Snow cap
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.beginPath();
          ctx.moveTo(i * w * 0.3 + 60, groundY - 100 - i * 20);
          ctx.lineTo(i * w * 0.3 + 80, groundY - 120 - i * 20);
          ctx.lineTo(i * w * 0.3 + 100, groundY - 100 - i * 20);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }
      case "interior": {
        ctx.fillStyle = "#1a1510";
        ctx.fillRect(0, 0, w, h);
        // Floor
        ctx.fillStyle = "#2a2015";
        ctx.fillRect(0, groundY, w, h - groundY);
        // Wall panels
        for (let i = 0; i < 5; i++) {
          ctx.strokeStyle = "rgba(255,200,100,0.1)";
          ctx.lineWidth = 1;
          ctx.strokeRect(i * (w / 5) + 10, 20, w / 5 - 20, groundY - 30);
        }
        // Candle glow
        const cx = w * 0.5;
        const cy = groundY - 20;
        const flicker = Math.sin(t * 0.01) * 5 + Math.sin(t * 0.023) * 3;
        const candleGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 + flicker);
        candleGlow.addColorStop(0, "rgba(255,200,80,0.3)");
        candleGlow.addColorStop(1, "rgba(255,200,80,0)");
        ctx.fillStyle = candleGlow;
        ctx.fillRect(cx - 100, cy - 100, 200, 200);
        break;
      }
      default: {
        // Field / grass
        ctx.fillStyle = "#2a4a2a";
        ctx.fillRect(0, groundY, w, h - groundY);
        // Grass blades
        for (let i = 0; i < 40; i++) {
          const gx = (i / 40) * w;
          const sway = Math.sin(t * 0.002 + i * 0.5) * 4;
          ctx.strokeStyle = `hsl(${100 + i % 20}, 40%, ${25 + i % 10}%)`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(gx, groundY + 5);
          ctx.quadraticCurveTo(gx + sway, groundY - 10, gx + sway * 1.5, groundY - 18);
          ctx.stroke();
        }
      }
    }
  }, [scene.environment, scene.timeOfDay, getColors]);

  const drawWeather = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const weather = scene.weather || "clear";
    const particles = particlesRef.current;

    if (weather === "rain" || weather === "storm") {
      ctx.strokeStyle = weather === "storm" ? "rgba(180,200,255,0.5)" : "rgba(180,200,255,0.3)";
      ctx.lineWidth = 1;
      particles.forEach(p => {
        if (p.length) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 1, p.y + p.length);
          ctx.stroke();
          p.y += p.speed;
          p.x -= 0.5;
          if (p.y > h) { p.y = -p.length; p.x = Math.random() * w; }
        }
      });
      // Lightning for storm
      if (weather === "storm" && Math.random() < 0.005) {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(0, 0, w, h);
      }
    } else if (weather === "snow") {
      particles.forEach(p => {
        if (p.size && p.drift !== undefined) {
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.speed;
          p.x += p.drift;
          if (p.y > h) { p.y = -p.size; p.x = Math.random() * w; }
          if (p.x > w) p.x = 0;
          if (p.x < 0) p.x = w;
        }
      });
    }

    // Fireflies
    if (scene.timeOfDay === "night" && weather !== "storm") {
      particles.forEach(p => {
        if (p.opacity !== undefined && p.drift !== undefined && !p.length) {
          p.drift += 0.01;
          p.opacity = 0.3 + 0.7 * Math.abs(Math.sin(p.drift));
          p.x += Math.sin(p.drift) * 0.5;
          p.y += Math.cos(p.drift * 0.7) * 0.3;
          ctx.fillStyle = `rgba(200,255,100,${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size || 2, 0, Math.PI * 2);
          ctx.fill();
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
          glow.addColorStop(0, `rgba(200,255,100,${p.opacity * 0.3})`);
          glow.addColorStop(1, "rgba(200,255,100,0)");
          ctx.fillStyle = glow;
          ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
        }
      });
    }
  }, [scene.weather, scene.timeOfDay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initParticles(canvas.offsetWidth, canvas.offsetHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      timeRef.current += 16;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      drawEnvironment(ctx, w, h, timeRef.current);
      drawWeather(ctx, w, h);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [drawEnvironment, drawWeather, initParticles]);

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
};

export default SceneCanvas;
