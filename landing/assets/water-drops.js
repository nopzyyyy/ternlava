/**
 * Clean Photorealistic Droplets & Liquid Condensation System
 * Features:
 * - Subtle ambient condensation beads clustered naturally near typography & margins
 * - Tactile hover wobble and micro-splash on click
 * - Zero floating embers or button clutter
 */

(function () {
  'use strict';

  function initDroplets() {
    const container = document.createElement('div');
    container.className = 'water-droplets-container';
    container.id = 'water-droplets-root';
    document.body.appendChild(container);

    const shapes = ['shape-organic-1', 'shape-organic-2', 'shape-organic-3', 'shape-elongated', 'shape-bead'];

    function createDrop(x, y, sizeClass, shapeClass, options = {}) {
      const drop = document.createElement('div');
      drop.className = `water-drop ${sizeClass || 'size-small'} ${shapeClass || 'shape-organic-1'}`;
      drop.style.left = `${x}px`;
      drop.style.top = `${y}px`;

      if (options.rotation) {
        drop.style.transform = `rotate(${options.rotation}deg)`;
      }

      drop.addEventListener('mouseenter', () => {
        triggerWobble(drop);
      });

      drop.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerSplash(e.clientX, e.clientY);
        triggerWobble(drop);
      });

      container.appendChild(drop);
      return drop;
    }

    function triggerWobble(drop) {
      drop.classList.remove('wobble');
      void drop.offsetWidth;
      drop.classList.add('wobble');
    }

    function triggerSplash(x, y) {
      const ripple = document.createElement('div');
      ripple.className = 'water-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = '48px';
      ripple.style.height = '48px';
      container.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);

      const beadCount = 6;
      for (let i = 0; i < beadCount; i++) {
        const bead = document.createElement('div');
        bead.className = 'water-splash-bead';
        const size = Math.random() * 4 + 2;
        bead.style.width = `${size}px`;
        bead.style.height = `${size}px`;
        bead.style.left = `${x}px`;
        bead.style.top = `${y}px`;

        const angle = (i / beadCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = Math.random() * 30 + 16;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;

        bead.style.setProperty('--dx', `${dx}px`);
        bead.style.setProperty('--dy', `${dy}px`);
        container.appendChild(bead);
        setTimeout(() => bead.remove(), 600);
      }
    }

    function spawnCluster(centerX, centerY, radiusX, radiusY, count) {
      for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const rX = (u - 0.5) * 2 * radiusX;
        const rY = (v - 0.5) * 2 * radiusY;
        const x = Math.max(10, Math.min(window.innerWidth - 30, centerX + rX));
        const y = Math.max(10, Math.min(window.innerHeight - 30, centerY + rY));

        const sizeRoll = Math.random();
        let size = 'size-small';
        if (sizeRoll < 0.5) size = 'size-micro';
        else if (sizeRoll < 0.8) size = 'size-small';
        else if (sizeRoll < 0.95) size = 'size-medium';
        else size = 'size-large';

        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const rot = Math.floor(Math.random() * 360);
        createDrop(x, y, size, shape, { rotation: rot });
      }
    }

    function setupTrickling() {
      function runTrickle() {
        const drops = container.querySelectorAll('.water-drop.size-medium, .water-drop.size-large');
        if (drops.length > 0) {
          const target = drops[Math.floor(Math.random() * drops.length)];
          const currentTop = parseFloat(target.style.top);
          const distance = Math.random() * 80 + 35;
          const newTop = Math.min(window.innerHeight - 40, currentTop + distance);

          const trail = document.createElement('div');
          trail.className = 'water-trail';
          trail.style.left = `${parseFloat(target.style.left) + target.offsetWidth / 2 - 1}px`;
          trail.style.top = `${currentTop + target.offsetHeight / 2}px`;
          trail.style.height = `${distance}px`;
          container.appendChild(trail);

          target.classList.add('trickling');
          target.style.top = `${newTop}px`;

          setTimeout(() => {
            trail.style.opacity = '0';
            setTimeout(() => trail.remove(), 1500);
            target.classList.remove('trickling');
          }, 1800);
        }
        setTimeout(runTrickle, Math.random() * 16000 + 10000);
      }
      setTimeout(runTrickle, 6000);
    }

    function populate() {
      const h1 = document.querySelector('.hero-heading h1');
      if (h1) {
        const rect = h1.getBoundingClientRect();
        spawnCluster(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5, rect.width * 0.5, rect.height * 0.65, 20);
      }

      const w = window.innerWidth, h = window.innerHeight;
      spawnCluster(w * 0.12, h * 0.3, 70, 60, 6);
      spawnCluster(w * 0.88, h * 0.35, 70, 70, 7);
      spawnCluster(w * 0.15, h * 0.8, 80, 60, 8);
      spawnCluster(w * 0.85, h * 0.75, 80, 60, 8);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        populate();
        setupTrickling();
      });
    } else {
      populate();
      setupTrickling();
    }
  }

  initDroplets();
})();
