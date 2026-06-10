// js/main.js
// Scrapbook Features: Drag-and-drop Polaroids, 3D flips, dynamic sticker stamps, animated envelope unsealing, and URL names.

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Canvas Particles
  celebrationFX.init('effects-canvas');

  // DOM Elements
  const transitionPage = document.getElementById('transition-page');
  const appreciationPage = document.getElementById('appreciation-page');
  
  const narrativeText = document.getElementById('narrative-text');
  
  const secretMsgBtn = document.getElementById('secret-msg-btn');
  const secretModal = document.getElementById('secret-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicIcon = document.getElementById('music-icon');
  const replayBtn = document.getElementById('replay-btn');
  
  // Scrapbook Elements
  const stampToolbar = document.getElementById('stamp-toolbar');
  const stampButtons = document.querySelectorAll('.stamp-btn');
  const polaroids = document.querySelectorAll('.polaroid-card');
  
  // Interactive Envelope & Flower Dictionary
  const envelope = document.getElementById('envelope');
  const envelopeSeal = document.getElementById('envelope-seal');
  const envelopeView = document.getElementById('envelope-view');
  const appreciationMainView = document.getElementById('appreciation-main-view');
  const bouquetImg = document.getElementById('bouquet-img');
  const flowerDictionary = document.getElementById('flower-dictionary');

  // Narrative Script (Change back to Girl/She)
  const storyLines = [
    "There was a girl...",
    "Who accepted a major challenge,",
    "Who stepped up and took responsibility,",
    "Who led her very first program...",
    "SOS-TA. 🌸",
    "And despite all the pressure...",
    "She made it. ✨"
  ];

  let currentLineIndex = 0;
  let activeStamp = null;

  // 0. URL Query Name Personalization (Defaulting: To L, From F)
  function parsePersonalizationQuery() {
    const params = new URLSearchParams(window.location.search);
    const toName = params.get('to');
    const fromName = params.get('from');

    if (toName) {
      document.querySelectorAll('.param-to').forEach(el => {
        el.textContent = toName;
      });
    } else {
      document.querySelectorAll('.param-to').forEach(el => {
        el.textContent = "L"; // Default recipient L
      });
    }

    if (fromName) {
      document.querySelectorAll('.param-from').forEach(el => {
        el.textContent = fromName;
      });
    } else {
      document.querySelectorAll('.param-from').forEach(el => {
        el.textContent = "F"; // Default sender F
      });
    }
  }

  // Parse URL parameters
  parsePersonalizationQuery();

  // 1. Trigger Narrative Sequence Automatically on Load
  setTimeout(() => {
    startNarrativeSequence();
  }, 600);

  function startNarrativeSequence() {
    transitionPage.style.display = 'flex';
    transitionPage.offsetHeight;
    transitionPage.classList.add('active');
    
    showNextStoryLine();
  }

  function showNextStoryLine() {
    if (currentLineIndex < storyLines.length) {
      narrativeText.classList.remove('fade-in');
      narrativeText.classList.add('fade-out');
      
      setTimeout(() => {
        narrativeText.innerHTML = storyLines[currentLineIndex];
        narrativeText.classList.remove('fade-out');
        narrativeText.classList.add('fade-in');
        
        currentLineIndex++;
        setTimeout(showNextStoryLine, 1800);
      }, 450);
    } else {
      transitionPage.classList.remove('active');
      transitionPage.classList.add('fade-out');
      
      setTimeout(() => {
        transitionPage.style.display = 'none';
        appreciationPage.style.display = 'flex';
        appreciationPage.offsetHeight;
        appreciationPage.classList.add('active');
        
        if (window.celebrationFX) {
          window.celebrationFX.triggerExplosion(window.innerWidth / 2, window.innerHeight * 0.4);
        }
      }, 500);
    }
  }

  // 2. Interactive Envelope Unsealing & Card Slide-Out
  envelopeSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    if (envelope.classList.contains('open')) return;
    
    envelope.classList.add('open');
    
    // Play Pop sound
    if (window.musicBox) {
      window.musicBox.playPopSound();
    }

    // Play Background Chime Music (Initialize on click gesture)
    setTimeout(() => {
      if (window.musicBox) {
        window.musicBox.play();
        updateMusicButtonUI(true);
      }
    }, 150);
    
    const rect = envelopeSeal.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    if (window.celebrationFX) {
      window.celebrationFX.triggerExplosion(x, y);
    }
    
    // Smoothly hide envelope cover and slide up scrapbook card after unsealing animation
    setTimeout(() => {
      envelopeView.classList.add('hidden');
      appreciationMainView.classList.add('visible');
      
      // Stamp toolbar appears with the main page reveal
      stampToolbar.classList.add('visible');
      
      if (window.celebrationFX) {
        window.celebrationFX.triggerExplosion(window.innerWidth / 2, window.innerHeight * 0.45);
      }
    }, 950);
  });

  // 3. Bouquet Dictionary Toggle
  bouquetImg.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = flowerDictionary.classList.toggle('visible');
    
    if (window.musicBox) {
      window.musicBox.playPopSound();
    }
    
    if (isVisible && window.celebrationFX) {
      const rect = bouquetImg.getBoundingClientRect();
      window.celebrationFX.triggerExplosion(rect.left + rect.width/2, rect.top + rect.height/2);
    }
  });

  // 4. Polaroid Drag-and-Drop & 3D Flip Mechanics
  polaroids.forEach((card) => {
    let isDragging = false;
    let startX = 0, startY = 0;
    let dragX = 0, dragY = 0;
    let cardStartX = 0, cardStartY = 0;
    let totalMove = 0;

    let rotAngle = 0;
    if (card.classList.contains('polaroid-1')) rotAngle = -3;
    if (card.classList.contains('polaroid-2')) rotAngle = 4;
    if (card.classList.contains('polaroid-3')) rotAngle = -2;

    card.style.transform = `translate3d(0px, 0px, 0px) rotate(${rotAngle}deg)`;

    function onStart(e) {
      if (activeStamp) return;

      const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

      isDragging = true;
      startX = clientX;
      startY = clientY;
      totalMove = 0;
      
      const transformValue = card.style.transform || '';
      const match = transformValue.match(/translate3d\(([-\d.]+)px,\s*([-\d.]+)px/);
      if (match) {
        cardStartX = parseFloat(match[1]);
        cardStartY = parseFloat(match[2]);
      } else {
        cardStartX = 0;
        cardStartY = 0;
      }
      
      card.classList.add('dragging');
      
      if (e.cancelable) e.preventDefault();
    }

    function onMove(e) {
      if (!isDragging) return;

      const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      totalMove = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      dragX = cardStartX + deltaX;
      dragY = cardStartY + deltaY;

      card.style.transform = `translate3d(${dragX}px, ${dragY}px, 0px) rotate(${rotAngle}deg)`;
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      card.classList.remove('dragging');

      if (totalMove < 5) {
        card.classList.toggle('flipped');
      }
    }

    card.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    card.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  });

  // 5. Sticker Stamping Tool Controller
  stampButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const stampType = btn.getAttribute('data-stamp');
      
      if (activeStamp === stampType) {
        activeStamp = null;
        btn.classList.remove('active');
        clearCursorClasses();
      } else {
        stampButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeStamp = stampType;
        
        clearCursorClasses();
        document.body.classList.add(`stamp-cursor-${stampType}`);
      }
    });
  });

  function clearCursorClasses() {
    document.body.classList.remove(
      'stamp-cursor-flower',
      'stamp-cursor-heart',
      'stamp-cursor-star',
      'stamp-cursor-bear',
      'stamp-cursor-ribbon',
      'stamp-cursor-hug',
      'stamp-cursor-kiss'
    );
  }

  document.addEventListener('click', (e) => {
    if (!activeStamp) return;

    const isInteractive = e.target.closest('.stamp-toolbar') || 
                          e.target.closest('.polaroid-card') || 
                          e.target.closest('.greeting-card') || 
                          e.target.closest('.floating-controls') || 
                          e.target.closest('.floating-left-controls') || 
                          e.target.closest('.modal-content') ||
                          e.target.closest('#secret-msg-btn') ||
                          e.target.closest('.close-btn') ||
                          e.target.closest('.flower-dictionary-card') ||
                          e.target.closest('#bouquet-img') ||
                          e.target.closest('.ticket-stub') ||
                          e.target.closest('.memo-sticky') ||
                          e.target.closest('.scrapbook-badge');
    if (isInteractive) return;

    const px = e.pageX;
    const py = e.pageY;
    
    if (activeStamp === 'hug') {
      const hugContainer = document.createElement('div');
      hugContainer.className = 'hug-stamp-container';
      hugContainer.style.left = `${px - 50}px`;
      hugContainer.style.top = `${py - 25}px`;

      const leftChar = document.createElement('span');
      leftChar.className = 'hug-left';
      leftChar.textContent = '🧸';

      const rightChar = document.createElement('span');
      rightChar.className = 'hug-right';
      rightChar.textContent = '🐰';

      const heart = document.createElement('span');
      heart.className = 'hug-heart';
      heart.textContent = '💖';

      hugContainer.appendChild(leftChar);
      hugContainer.appendChild(rightChar);
      hugContainer.appendChild(heart);

      document.body.appendChild(hugContainer);

      if (window.musicBox) {
        window.musicBox.playPopSound();
      }

      setTimeout(() => {
        hugContainer.remove();
      }, 1300);
      
    } else if (activeStamp === 'kiss') {
      const kissContainer = document.createElement('div');
      kissContainer.className = 'kiss-stamp-container';
      kissContainer.style.left = `${px - 30}px`;
      kissContainer.style.top = `${py - 30}px`;

      const lips = document.createElement('span');
      lips.className = 'kiss-lips';
      lips.textContent = '💋';
      kissContainer.appendChild(lips);

      // Spawn 3 small random-offset trailing hearts
      for (let i = 0; i < 3; i++) {
        const trailHeart = document.createElement('span');
        trailHeart.className = 'kiss-trail-heart';
        trailHeart.textContent = '❤️';
        
        const tx = (Math.random() * 60 - 30) + 'px';
        const ty = -(Math.random() * 40 + 50) + 'px';
        
        trailHeart.style.setProperty('--tx', tx);
        trailHeart.style.setProperty('--ty', ty);
        trailHeart.style.left = '20px'; // center horizontally relative to 60px container
        trailHeart.style.top = '20px';
        trailHeart.style.animationDelay = `${0.1 + i * 0.15}s`;
        
        kissContainer.appendChild(trailHeart);
      }

      document.body.appendChild(kissContainer);

      if (window.musicBox) {
        window.musicBox.playKissSound();
      }

      setTimeout(() => {
        kissContainer.remove();
      }, 1000);
      
    } else {
      const emojis = {
        flower: '🌸',
        heart: '💖',
        star: '⭐',
        bear: '🧸',
        ribbon: '🎀'
      };

      const stampNode = document.createElement('span');
      stampNode.className = 'placed-stamp';
      stampNode.textContent = emojis[activeStamp];
      stampNode.style.left = `${px - 18}px`;
      stampNode.style.top = `${py - 18}px`;
      
      const rot = Math.random() * 40 - 20;
      stampNode.style.setProperty('--rot', `${rot}deg`);
      
      document.body.appendChild(stampNode);
      
      if (window.musicBox) {
        window.musicBox.playPopSound();
      }
    }
  });

  // 6. Secret Message Modal Events
  secretMsgBtn.addEventListener('click', () => {
    secretModal.style.display = 'flex';
    setTimeout(() => {
      secretModal.classList.add('open');
    }, 10);
    
    if (window.celebrationFX) {
      window.celebrationFX.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2);
    }
  });

  closeModalBtn.addEventListener('click', () => {
    secretModal.classList.remove('open');
    setTimeout(() => {
      secretModal.style.display = 'none';
    }, 300);
  });

  secretModal.addEventListener('click', (e) => {
    if (e.target === secretModal) {
      closeModalBtn.click();
    }
  });

  // 7. Audio Control Toggles
  musicToggleBtn.addEventListener('click', () => {
    if (window.musicBox) {
      const isPlaying = window.musicBox.toggle();
      updateMusicButtonUI(isPlaying);
    }
  });

  function updateMusicButtonUI(isPlaying) {
    if (isPlaying) {
      musicToggleBtn.classList.remove('paused');
      musicIcon.textContent = '🎵';
      musicToggleBtn.setAttribute('title', 'Pause Music');
    } else {
      musicToggleBtn.classList.add('paused');
      musicIcon.textContent = '🔇';
      musicToggleBtn.setAttribute('title', 'Play Music');
    }
  }

  // 8. Reset / Replay Experience (Starts with Narrative Slideshow)
  replayBtn.addEventListener('click', () => {
    if (window.musicBox) {
      window.musicBox.pause();
      window.musicBox.currentNoteIndex = 0;
      updateMusicButtonUI(false);
    }
    
    // Clear stamps
    const placedStamps = document.querySelectorAll('.placed-stamp, .hug-stamp-container, .kiss-stamp-container');
    placedStamps.forEach(stamp => stamp.remove());
    
    // Deselect stamp tool
    activeStamp = null;
    stampButtons.forEach(b => b.classList.remove('active'));
    clearCursorClasses();
    stampToolbar.classList.remove('visible');

    // Reset polaroids state
    polaroids.forEach(card => {
      card.classList.remove('flipped');
      let rotAngle = 0;
      if (card.classList.contains('polaroid-1')) rotAngle = -3;
      if (card.classList.contains('polaroid-2')) rotAngle = 4;
      if (card.classList.contains('polaroid-3')) rotAngle = -2;
      card.style.transform = `translate3d(0px, 0px, 0px) rotate(${rotAngle}deg)`;
    });
    
    // Reset Envelope & Dictionary
    envelope.classList.remove('open');
    envelopeView.classList.remove('hidden');
    appreciationMainView.classList.remove('visible');
    flowerDictionary.classList.remove('visible');
    
    appreciationPage.classList.remove('active');
    appreciationPage.classList.add('fade-out');
    
    setTimeout(() => {
      currentLineIndex = 0;
      narrativeText.innerHTML = '';
      narrativeText.className = 'narrative-text';
      
      appreciationPage.style.display = 'none';
      appreciationPage.classList.remove('fade-out');
      
      // Start narrative again
      startNarrativeSequence();
    }, 500);
  });
});
