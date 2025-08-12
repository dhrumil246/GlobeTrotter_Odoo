"use client";

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  trail: { x: number; y: number; alpha: number }[];
}

export default function ShootingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize stars
    const stars: Star[] = [];
    const numStars = 12; // Reduced for better performance

    const createStar = (): Star => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 6 + 2, // Reduced velocity for smoother movement
      vy: Math.random() * 2 + 2, // Reduced velocity for smoother movement
      size: Math.random() * 2.5 + 1, // Smaller stars for better performance
      trail: []
    });

    // Create initial stars
    for (let i = 0; i < numStars; i++) {
      stars.push(createStar());
    }

    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      // Throttle to 60 FPS for smoother animation
      if (currentTime - lastTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      // Clear canvas with minimal fade for better performance
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw each star
      stars.forEach((star, index) => {
        // Update position
        star.x += star.vx;
        star.y += star.vy;

        // Add current position to trail
        star.trail.push({ x: star.x, y: star.y, alpha: 1 });

        // Limit trail length for performance
        if (star.trail.length > 15) {
          star.trail.shift();
        }

        // Fade trail
        star.trail.forEach((point, i) => {
          point.alpha = i / star.trail.length;
        });

        // Draw trail (neon red) - optimized rendering
        if (star.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(star.trail[0].x, star.trail[0].y);
          
          for (let i = 1; i < star.trail.length; i++) {
            const point = star.trail[i];
            const alpha = point.alpha;
            
            ctx.strokeStyle = `rgba(255, 0, 0, ${alpha * 0.7})`;
            ctx.lineWidth = star.size * alpha * 1.5;
            ctx.lineCap = 'round';
            
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            
            // Add glow effect
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 8 * alpha;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        // Draw star (neon white) - simplified for performance
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 2
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        ctx.fill();

        // Add glow effect to star
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Reset star if it goes off screen
        if (star.x < -50 || star.x > canvas.width + 50 || star.y > canvas.height + 50) {
          stars[index] = createStar();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
}
