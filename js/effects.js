// js/effects.js
// Canvas-based Particle and Celebration Effects
// Manages floating background petals, drifting hearts, and high-fidelity gift explosion confetti.

class CelebrationFX {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.active = false;
    this.ambientCount = 35; // Default number of background petals/hearts
    
    this.colors = [
      '#FFB6D9', // Light Pink
      '#AEEFFF', // Light Cyan
      '#FF6FB5', // Hot Pink
      '#5EDCFF', // Sky Blue
      '#E5D5FF', // Lavender
      '#FFF4B8', // Soft Yellow
      '#FFD6B8'  // Pastel Peach
    ];
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    
    window.addEventListener('resize', () => this.resize());
    
    // Start ambient animation
    this.active = true;
    this.createAmbientParticles();
    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Draw a cute heart shape on canvas
  drawHeart(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.quadraticCurveTo(x, y, x + size / 2, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + size / 3);
    ctx.quadraticCurveTo(x + size, y + size * 2 / 3, x + size / 2, y + size);
    ctx.quadraticCurveTo(x, y + size * 2 / 3, x, y + size / 3);
    ctx.quadraticCurveTo(x, y, x, y + size / 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draw a cute petal shape on canvas
  drawPetal(ctx, x, y, size, angle, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    // A cute cherry blossom petal curve
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size, -size / 2, -size, -size * 1.5, 0, -size * 2);
    ctx.bezierCurveTo(size, -size * 1.5, size, -size / 2, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draw a 5-point sparkle star on canvas
  drawSparkle(ctx, x, y, radius, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * radius + x,
                 Math.sin((18 + i * 72) * Math.PI / 180) * radius + y);
      ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (radius / 2.5) + x,
                 Math.sin((54 + i * 72) * Math.PI / 180) * (radius / 2.5) + y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  createAmbientParticles() {
    this.particles = [];
    for (let i = 0; i < this.ambientCount; i++) {
      this.particles.push(this.makeAmbientParticle(true));
    }
  }

  makeAmbientParticle(randomY = false) {
    const types = ['petal', 'heart', 'sparkle'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      type: type,
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : -20,
      size: Math.random() * 8 + 6,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      speedX: (Math.random() * 1.2 - 0.6) * 1.5,
      speedY: (Math.random() * 0.8 + 0.4) * 1.5,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() * 0.02 - 0.01) * 3,
      alpha: Math.random() * 0.5 + 0.3,
      gravity: 0,
      decay: 0,
      isAmbient: true
    };
  }

  // Trigger burst explosion from the gift box center
  triggerExplosion(x, y) {
    // Generate 80-100 high-speed burst particles
    const burstCount = 90;
    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      const size = Math.random() * 6 + 6;
      
      const types = ['confetti', 'sparkle', 'heart', 'petal'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      this.particles.push({
        type: type,
        x: x,
        y: y,
        size: size,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 2.5, // Initial vertical boost
        angle: Math.random() * Math.PI * 2,
        spin: Math.random() * 0.3 - 0.15,
        alpha: 1.0,
        gravity: 0.18, // Confetti falls down
        decay: Math.random() * 0.008 + 0.006, // Slowly fade out
        isAmbient: false
      });
    }
  }

  update() {
    if (!this.canvas) return;
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update position
      p.speedY += p.gravity;
      p.x += p.speedX;
      p.y += p.speedY;
      p.angle += p.spin;
      
      // Update alpha for non-ambient particles
      if (!p.isAmbient) {
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
      } else {
        // Ambient particles wrap around edges
        if (p.y > this.canvas.height + 20) {
          this.particles[i] = this.makeAmbientParticle(false);
        }
        if (p.x < -20) p.x = this.canvas.width + 10;
        if (p.x > this.canvas.width + 20) p.x = -10;
      }
    }
    
    // Maintain minimum ambient count if we fall below it (excluding burst particles)
    const currentAmbient = this.particles.filter(p => p.isAmbient).length;
    if (currentAmbient < this.ambientCount) {
      this.particles.push(this.makeAmbientParticle(false));
    }
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw all particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      if (p.type === 'heart') {
        this.drawHeart(this.ctx, p.x, p.y, p.size, p.color, p.alpha);
      } else if (p.type === 'petal') {
        this.drawPetal(this.ctx, p.x, p.y, p.size, p.angle, p.color, p.alpha);
      } else if (p.type === 'sparkle') {
        this.drawSparkle(this.ctx, p.x, p.y, p.size, p.color, p.alpha);
      } else {
        // Standard confetti rectangle / ribbon
        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.angle);
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        this.ctx.restore();
      }
    }
  }

  animate() {
    if (!this.active) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  stop() {
    this.active = false;
  }
}

// Global instance
const celebrationFX = new CelebrationFX();
window.celebrationFX = celebrationFX;
