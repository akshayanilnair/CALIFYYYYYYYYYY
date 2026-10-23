/**
 * Calmify Kinetic Fluid Waves Canvas
 * 60fps continuous generative organic fluid motion
 * Reacts dynamically to mood palette and respiratory pacing
 */

import React, { useEffect, useRef } from 'react';

interface KineticCanvasProps {
  moodTheme: 'indigo' | 'sage' | 'amber' | 'slate' | 'teal';
  intensity: number; // 0.5 to 1.5
  breathingScale: number; // 0.8 to 1.3
}

export const KineticCanvas: React.FC<KineticCanvasProps> = ({
  moodTheme,
  intensity,
  breathingScale
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palettes for different mood states
    const palettes = {
      indigo: {
        bg1: '#0f172a',
        bg2: '#1e1b4b',
        wave1: 'rgba(99, 102, 241, 0.15)',
        wave2: 'rgba(139, 92, 246, 0.12)',
        wave3: 'rgba(192, 132, 252, 0.08)',
        glow: 'rgba(129, 140, 248, 0.25)'
      },
      sage: {
        bg1: '#062c24',
        bg2: '#0f3d32',
        wave1: 'rgba(52, 211, 153, 0.15)',
        wave2: 'rgba(16, 185, 129, 0.12)',
        wave3: 'rgba(110, 231, 183, 0.08)',
        glow: 'rgba(52, 211, 153, 0.25)'
      },
      amber: {
        bg1: '#1c1917',
        bg2: '#451a03',
        wave1: 'rgba(245, 158, 11, 0.15)',
        wave2: 'rgba(217, 119, 6, 0.12)',
        wave3: 'rgba(251, 191, 36, 0.08)',
        glow: 'rgba(245, 158, 11, 0.25)'
      },
      slate: {
        bg1: '#020617',
        bg2: '#0f172a',
        wave1: 'rgba(148, 163, 184, 0.14)',
        wave2: 'rgba(100, 116, 139, 0.10)',
        wave3: 'rgba(71, 85, 105, 0.08)',
        glow: 'rgba(203, 213, 225, 0.2)'
      },
      teal: {
        bg1: '#042f2e',
        bg2: '#0f3d3e',
        wave1: 'rgba(45, 212, 191, 0.15)',
        wave2: 'rgba(20, 184, 166, 0.12)',
        wave3: 'rgba(94, 234, 212, 0.08)',
        glow: 'rgba(45, 212, 191, 0.25)'
      }
    };

    let step = 0;

    const render = () => {
      step += 0.015 * intensity;
      const palette = palettes[moodTheme] || palettes.indigo;

      // Deep atmospheric background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, palette.bg1);
      bgGrad.addColorStop(1, palette.bg2);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Central ambient breathing glow
      const cx = width / 2;
      const cy = height * 0.45;
      const glowRadius = Math.max(width, height) * 0.35 * breathingScale;

      const radialGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, glowRadius);
      radialGrad.addColorStop(0, palette.glow);
      radialGrad.addColorStop(0.5, palette.glow.replace(/[\d\.]+\)$/, '0.08)'));
      radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Fluid Wave Layers
      drawFluidWave(ctx, width, height, step, 0.003, 60, height * 0.65, palette.wave1);
      drawFluidWave(ctx, width, height, step + 2, 0.002, 85, height * 0.72, palette.wave2);
      drawFluidWave(ctx, width, height, step + 4, 0.0015, 110, height * 0.80, palette.wave3);

      animationId = requestAnimationFrame(render);
    };

    const drawFluidWave = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      freq: number,
      amp: number,
      baseY: number,
      color: string
    ) => {
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, h);

      for (let x = 0; x <= w; x += 15) {
        const y =
          baseY +
          Math.sin(x * freq + t) * amp +
          Math.sin(x * freq * 0.5 - t * 0.8) * (amp * 0.5);
        c.lineTo(x, y);
      }

      c.lineTo(w, h);
      c.closePath();
      c.fill();
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [moodTheme, intensity, breathingScale]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};
