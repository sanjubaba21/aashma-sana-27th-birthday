(() => {
  const config = window.BIRTHDAY_CONFIG;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('[data-her-name]').forEach((el) => el.textContent = config.herName);
  $$('[data-signature]').forEach((el) => el.textContent = config.yourName);
  $$('[data-birthday-number]').forEach((el) => el.textContent = config.birthdayNumber);
  $$('[data-special-date]').forEach((el) => el.textContent = config.specialDate);
  $$('[data-september-message]').forEach((el) => el.textContent = config.septemberMessage);
  document.title = `Happy ${config.birthdayNumber} Birthday, ${config.herName}`;

  const loveGrid = $('#loveGrid');
  config.thingsILove.forEach((text, index) => {
    const card = document.createElement('button');
    card.className = 'love-card';
    card.type = 'button';
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `<span class="love-card__number">0${index + 1}</span><span class="love-card__text">${text}</span>`;
    card.addEventListener('click', () => {
      card.classList.toggle('is-open');
      card.setAttribute('aria-pressed', String(card.classList.contains('is-open')));
    });
    loveGrid.append(card);
  });

  const gallery = $('#memoryGallery');
  config.memories.forEach((memory, index) => {
    const figure = document.createElement('figure');
    figure.className = 'memory reveal-on-scroll';
    const img = document.createElement('img');
    img.src = memory.image;
    img.alt = memory.caption;
    img.loading = index > 1 ? 'lazy' : 'eager';
    figure.innerHTML = '<div class="memory__image"></div>';
    $('.memory__image', figure).append(img);
    const caption = document.createElement('figcaption');
    caption.innerHTML = `${memory.caption}<span class="memory__index">MEMORY ${String(index + 1).padStart(2, '0')}</span>`;
    figure.append(caption);
    gallery.append(figure);
  });

  const timeline = $('#timelineList');
  config.timeline.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'timeline__item';
    li.innerHTML = `<span class="timeline__date">${item.date}</span><h3>${item.title}</h3><p>${item.text}</p>`;
    timeline.append(li);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  $$('.reveal-on-scroll, .love-card, .timeline__item').forEach((el) => observer.observe(el));

  const finaleObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    $$('.final-line').forEach((line, index) => setTimeout(() => line.classList.add('is-visible'), index * (reducedMotion ? 0 : 650)));
    finaleObserver.disconnect();
  }, { threshold: 0.25 });
  finaleObserver.observe($('#finale'));

  let audioContext;
  let ambientNodes = [];
  let audioElement = $('#backgroundMusic');
  const surpriseVideo = $('#surpriseVideo');
  const surpriseVideoWrap = $('#surpriseVideoWrap');
  const surpriseVideoPlaceholder = $('#surpriseVideoPlaceholder');
  if (config.musicUrl) audioElement.src = config.musicUrl;
  if (config.surpriseVideoUrl) {
    surpriseVideo.src = config.surpriseVideoUrl;
    surpriseVideo.addEventListener('loadedmetadata', () => {
      surpriseVideoWrap.hidden = false;
      surpriseVideoPlaceholder.hidden = true;
    }, { once: true });
    surpriseVideo.addEventListener('error', () => {
      surpriseVideoWrap.hidden = true;
      surpriseVideoPlaceholder.hidden = false;
    }, { once: true });
    surpriseVideo.load();
  }
  let soundOn = false;

  function startAmbient() {
    if (config.musicUrl) {
      audioElement.volume = 0.28;
      return audioElement.play();
    }
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    if (ambientNodes.length) return;
    [110, 164.81, 220].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = index === 1 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.018 / (index + 1);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      ambientNodes.push({ oscillator, gain });
    });
  }

  function stopAmbient() {
    if (audioElement) audioElement.pause();
    ambientNodes.forEach(({ oscillator }) => oscillator.stop());
    ambientNodes = [];
  }

  function setSound(enabled) {
    soundOn = enabled;
    if (enabled) startAmbient(); else stopAmbient();
    $('#soundToggle').setAttribute('aria-pressed', String(enabled));
    $('#soundToggle').setAttribute('aria-label', enabled ? 'Turn music off' : 'Turn music on');
    $('#soundLabel').textContent = enabled ? 'Sound off' : 'Sound on';
  }

  $('#beginButton').addEventListener('click', () => {
    $('#opening').classList.add('is-gone');
    $('#experience').classList.add('is-visible');
    $('#experience').setAttribute('aria-hidden', 'false');
    $('#reveal').classList.add('is-active');
    setSound(true);
  });
  $('#soundToggle').addEventListener('click', () => setSound(!soundOn));

  let resumeMusicAfterVideo = false;
  surpriseVideo.addEventListener('play', () => {
    resumeMusicAfterVideo = soundOn;
    if (soundOn) stopAmbient();
  });
  surpriseVideo.addEventListener('ended', () => {
    if (resumeMusicAfterVideo && soundOn) startAmbient();
    resumeMusicAfterVideo = false;
  });

  function burst(x, y, count = 50) {
    const colors = ['#d7aa62', '#d98b9f', '#f8f0e3', '#7e304e'];
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('i');
      particle.className = 'particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = colors[i % colors.length];
      const angle = (Math.PI * 2 * i) / count;
      const distance = 80 + Math.random() * 240;
      particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--y', `${Math.sin(angle) * distance + 100}px`);
      document.body.append(particle);
      setTimeout(() => particle.remove(), 1900);
    }
  }

  $('#giftButton').addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (button.classList.contains('is-open')) return;
    button.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    const box = button.getBoundingClientRect();
    burst(box.left + box.width / 2, box.top + 70, 70);
    setTimeout(() => { $('#giftMessage').hidden = false; }, reducedMotion ? 0 : 650);
  });

  $('#wishButton').addEventListener('click', (event) => {
    if ($('#cake').classList.contains('is-blown')) return;
    $('#cake').classList.add('is-blown');
    $('.wish').classList.add('is-dimmed');
    const box = event.currentTarget.getBoundingClientRect();
    setTimeout(() => {
      $('.wish').classList.remove('is-dimmed');
      $('#wishResult').classList.add('is-visible');
      burst(innerWidth / 2, Math.max(100, box.top), 85);
    }, reducedMotion ? 0 : 700);
  });

  const canvas = $('#sky');
  const context = canvas.getContext('2d');
  let stars = [];
  function resizeSky() {
    const dpr = Math.min(devicePixelRatio, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.min(110, Math.floor(innerWidth / 7)) }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.4 + .2, a: Math.random() * .55 + .15, s: Math.random() * .006 + .002
    }));
  }
  function drawSky(time = 0) {
    context.clearRect(0, 0, innerWidth, innerHeight);
    stars.forEach((star, i) => {
      context.beginPath();
      context.fillStyle = `rgba(${i % 7 ? '248,240,227' : '215,170,98'},${star.a + Math.sin(time * star.s) * .18})`;
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      context.fill();
    });
    if (!reducedMotion) requestAnimationFrame(drawSky);
  }
  resizeSky();
  addEventListener('resize', resizeSky, { passive: true });
  if (!reducedMotion) requestAnimationFrame(drawSky); else drawSky(0);
})();
