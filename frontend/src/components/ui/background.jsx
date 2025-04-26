// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef } from 'react';
import { useTheme } from './ThemeContext';

const EnhancedBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastFrameTime = 0;

    const isMobile = window.innerWidth < 768; // Define a breakpoint for mobile
    const frameInterval = isMobile ? 1000 / 15 : 1000 / 30; // Slower FPS for mobile
    const particleCount = isMobile ? 50 : 100; // Fewer particles on mobile

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];

    // Define colors based on theme
    const lightColors = ['#614c2f', '#614c2f', '#614c2f'];
    const darkColors = ['#d4ab71', '#d4ab71', '#d4ab71'];
    const colors = theme === 'dark' ? darkColors : lightColors;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * (isMobile ? 1 : 1.5); // Slower speed on mobile
        this.speedY = (Math.random() - 0.5) * (isMobile ? 1 : 1.5); // Slower speed on mobile
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.size > 0.2) this.size -= 0.02;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const createParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animateParticles = (currentTime) => {
      if (currentTime - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(animateParticles);
        return;
      }
      lastFrameTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < (isMobile ? 10 : 30)) { // Shorter connection range on mobile
            ctx.beginPath();
            ctx.strokeStyle = particles[i].color;
            ctx.lineWidth = 0.2;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.closePath();
          }
        }

        if (particles[i].size <= 0.2) {
          particles.splice(i, 1);
          i--;
        }
      }

      while (particles.length < particleCount) {
        particles.push(new Particle());
      }

      animationFrameId = requestAnimationFrame(animateParticles);
    };

    createParticles();
    animationFrameId = requestAnimationFrame(animateParticles);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]); // Re-run effect when theme changes

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full transition-colors duration-300 dark:bg-black bg-white"
    />
  );
};

export default EnhancedBackground;
