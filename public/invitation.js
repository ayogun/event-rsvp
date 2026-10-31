(() => {
  const $ = (id) => document.getElementById(id);
  const body = document.body;
  const endpoint = body.dataset.endpoint || '';
  const invitedAs = (new URLSearchParams(location.search).get('ad') || '').trim().slice(0, 100);
  const storeKey = `rsvp:${invitedAs}`;
  const max = Number(body.dataset.max) || 5;
  const form = $('rsvp-form');
  const nameInput = $('name');
  const countField = $('count-field');
  const countSelect = $('guestCount');

  for (let i = 1; i <= max; i++) {
    countSelect.add(new Option(i === 1 ? '1 kişi' : `${i} kişi`, String(i)));
  }

  const attending = () => (form.querySelector('input[name=attending]:checked') || {}).value;
  const syncCount = () => { countField.hidden = attending() !== 'yes'; };
  form.querySelectorAll('input[name=attending]').forEach((r) => r.addEventListener('change', syncCount));

  // Background music: a hosted audio file (no ads) or, as a fallback, a YouTube video.
  // Browsers block sound until a user gesture, so playback starts on the first tap/click/key
  // and the button toggles it.
  const videoId = body.dataset.music || '';
  const musicFile = body.dataset.musicFile || '';
  const musicBtn = $('music');
  if (musicFile || videoId) {
    let controls = null;
    let wantPlay = false;
    let userPaused = false;
    let gestureHandled = false;

    const setUi = (on) => {
      musicBtn.classList.toggle('on', on);
      musicBtn.setAttribute('aria-pressed', String(on));
      $('music-label').textContent = on ? 'Müziği kapat' : 'Müziği aç';
    };
    const play = () => {
      if (!controls) { wantPlay = true; return; }
      controls.play();
    };

    if (musicFile) {
      const audio = new Audio(musicFile);
      audio.loop = true;
      audio.volume = 0.6;
      audio.preload = 'auto';
      audio.addEventListener('playing', () => setUi(true));
      audio.addEventListener('pause', () => setUi(false));
      audio.addEventListener('error', () => { musicBtn.hidden = true; });
      controls = { play: () => audio.play().catch(() => {}), pause: () => audio.pause() };
      musicBtn.hidden = false;
    } else {
      window.onYouTubeIframeAPIReady = () => {
        const player = new YT.Player('yt-holder', {
          width: 200,
          height: 200,
          videoId,
          playerVars: {
            autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0,
            loop: 1, playlist: videoId, origin: location.origin,
          },
          events: {
            onReady: () => {
              controls = { play: () => player.playVideo(), pause: () => player.pauseVideo() };
              player.setVolume(60);
              musicBtn.hidden = false;
              if (wantPlay && !userPaused) controls.play();
            },
            onStateChange: (e) => setUi(e.data === YT.PlayerState.PLAYING),
            onError: () => { musicBtn.hidden = true; },
          },
        });
      };
      const api = document.createElement('script');
      api.src = 'https://www.youtube.com/iframe_api';
      api.async = true;
      document.head.appendChild(api);
    }

    musicBtn.addEventListener('click', () => {
      if (musicBtn.classList.contains('on')) {
        userPaused = true;
        if (controls) controls.pause();
      } else {
        userPaused = false;
        play();
      }
    });

    const firstGesture = (e) => {
      if (gestureHandled) return;
      gestureHandled = true;
      if (e.target.closest && e.target.closest('#music')) return;
      if (!userPaused) play();
    };
    ['pointerdown', 'keydown', 'touchend'].forEach((ev) =>
      window.addEventListener(ev, firstGesture, { passive: true })
    );
  }

  // Scroll-driven unfolding letter
  const scene = $('scene');
  const sheet = $('sheet');
  const p1 = $('p1');
  const p2 = $('p2');
  const p3 = $('p3');
  const hint = $('hint');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function updateScene() {
    const rect = scene.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    const p = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 1;
    const u2 = ease(seg(p, 0.06, 0.5));
    const u3 = ease(seg(p, 0.38, 0.86));
    const a2 = -180 * (1 - u2);
    const a3 = 180 * (1 - u3);
    const rad = (d) => (d * Math.PI) / 180;
    const h = p1.offsetHeight;

    p2.style.setProperty('--a2', `${a2}deg`);
    p3.style.setProperty('--a3', `${a3}deg`);
    p2.style.setProperty('--shade', (1 - u2) * 0.45);
    p3.style.setProperty('--shade', (1 - u3) * 0.45);
    hint.style.opacity = 1 - seg(p, 0, 0.08);

    // Keep the visible part of the sheet vertically centred while it grows
    const y2 = h + h * Math.cos(rad(a2));
    const y3 = y2 + h * Math.cos(rad(a2 + a3));
    const bottom = Math.max(h, y2, y3);
    const stageH = sheet.parentElement.offsetHeight;
    sheet.style.transform = `translateY(${Math.max(0, (stageH - bottom) / 2)}px)`;
  }

  if (!reduceMotion) {
    scene.classList.add('anim');
    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; updateScene(); });
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    updateScene();
  }

  // Fade-in sections as they enter the viewport
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach((n) => io.observe(n));
  } else {
    document.querySelectorAll('.reveal').forEach((n) => n.classList.add('in'));
  }

  // Countdown
  const start = new Date(body.dataset.start).getTime();
  const cd = $('countdown');
  function tick() {
    const diff = start - Date.now();
    if (!(diff > 0)) { cd.hidden = true; return; }
    cd.hidden = false;
    const s = Math.floor(diff / 1000);
    $('cd-d').textContent = Math.floor(s / 86400);
    $('cd-h').textContent = Math.floor((s % 86400) / 3600);
    $('cd-m').textContent = Math.floor((s % 3600) / 60);
    $('cd-s').textContent = s % 60;
  }
  if (!Number.isNaN(start)) { tick(); setInterval(tick, 1000); }

  // Personal link (?ad=Name): greeting and prefilled name. Remember this device's last answer.
  if (invitedAs) {
    const greet = $('greeting');
    greet.textContent = `Sevgili ${invitedAs},`;
    greet.hidden = false;
    nameInput.value = invitedAs;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
    if (saved && typeof saved.attending === 'boolean') {
      fillForm(saved.name || invitedAs, saved);
      showThanks(saved.attending);
    }
  } catch { /* storage unavailable */ }

  function fillForm(name, r) {
    nameInput.value = name;
    form.querySelector(`input[name=attending][value=${r.attending ? 'yes' : 'no'}]`).checked = true;
    if (r.attending) countSelect.value = String(r.guestCount);
    $('contact').value = r.contact || '';
    $('message').value = r.message || '';
    syncCount();
  }

  function showThanks(isAttending) {
    $('thanks-title').textContent = 'Teşekkürler!';
    $('thanks-text').textContent = isAttending
      ? 'Katılım bildiriminiz bize ulaştı. Sizi aramızda görmek için sabırsızlanıyoruz.'
      : 'Yanıtınız bize ulaştı. Aramızda olamayacak olsanız da düşünceniz için teşekkür ederiz.';
    form.hidden = true;
    $('thanks').hidden = false;
  }

  $('edit').addEventListener('click', () => {
    $('thanks').hidden = true;
    form.hidden = false;
  });

  function clearErrors() {
    form.querySelectorAll('.error').forEach((e) => { e.textContent = ''; });
    $('form-error').textContent = '';
  }
  function setError(field, msg) {
    const el = form.querySelector(`.error[data-for="${field}"]`);
    if (el) el.textContent = msg;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const att = attending();
    let bad = false;
    if (!nameInput.value.trim()) { setError('name', 'Lütfen adınızı ve soyadınızı yazın.'); bad = true; }
    if (!att) { setError('attending', 'Lütfen katılıp katılmayacağınızı seçin.'); bad = true; }
    if (bad) return;

    const btn = $('submit');
    btn.disabled = true;
    try {
      if (!endpoint) throw new Error('no-endpoint');
      const payload = {
        name: nameInput.value.trim(),
        attending: att === 'yes',
        guestCount: att === 'yes' ? Number(countSelect.value) : 0,
        contact: $('contact').value.trim(),
        message: $('message').value.trim(),
        invitedAs,
        website: $('website').value,
      };
      // text/plain avoids a CORS preflight, which Google Apps Script does not answer
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        try {
          localStorage.setItem(storeKey, JSON.stringify({
            name: payload.name, attending: payload.attending, guestCount: payload.guestCount,
            contact: payload.contact, message: payload.message,
          }));
        } catch { /* storage unavailable */ }
        showThanks(payload.attending);
        $('thanks').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (data.error === 'name' || data.error === 'attending' || data.error === 'guestCount') {
        $('form-error').textContent = 'Lütfen formu kontrol edip tekrar deneyin.';
      } else {
        $('form-error').textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
      }
    } catch {
      $('form-error').textContent = 'Bağlantı hatası. Lütfen tekrar deneyin.';
    } finally {
      btn.disabled = false;
    }
  });
})();
