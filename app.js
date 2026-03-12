const AuthModule = {
  PRESENTER_KEY: 'SECRET_KEY_HERE',
  getRole() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'presenter' && params.get('key') === this.PRESENTER_KEY) {
      return 'presenter';
    }
    return 'viewer';
  },
  isPresenter() { return this.getRole() === 'presenter'; }
};

const SlideEngine = {
  currentIndex: 0,
  totalSlides: 14,
  stripElement: null,

  init(initialIndex, animate) {
    this.stripElement = document.getElementById('slide-strip');
    if (!animate) {
      this.stripElement.classList.add('no-transition');
    }
    this.currentIndex = Math.max(0, Math.min(initialIndex, this.totalSlides - 1));
    this.stripElement.style.transform = 'translateX(-' + (this.currentIndex * 100) + 'vw)';
    if (!animate) {
      requestAnimationFrame(() => {
        this.stripElement.classList.remove('no-transition');
      });
    }
  },

  goToSlide(index, animate = true) {
    index = Math.max(0, Math.min(index, this.totalSlides - 1));
    this.currentIndex = index;
    if (!animate) {
      this.stripElement.classList.add('no-transition');
    }
    this.stripElement.style.transform = 'translateX(-' + (index * 100) + 'vw)';
    if (!animate) {
      requestAnimationFrame(() => {
        this.stripElement.classList.remove('no-transition');
      });
    }
  },

  next() {
    if (this.currentIndex < this.totalSlides - 1) {
      this.goToSlide(this.currentIndex + 1);
    }
  },

  prev() {
    if (this.currentIndex > 0) {
      this.goToSlide(this.currentIndex - 1);
    }
  },

  canNavigate(direction) {
    if (direction === 'next') return this.currentIndex < this.totalSlides - 1;
    if (direction === 'prev') return this.currentIndex > 0;
    return false;
  },

  getCurrentIndex() {
    return this.currentIndex;
  }
};

const SyncService = {
  supabase: null,
  channel: null,
  isConnected: false,
  onSlideChange: null,
  onConnectionChange: null,
  SUPABASE_URL: 'https://jacbhpmskamnjaoimirj.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_ciyo0-Qsixesxkzm0nHwKA_hdys8feI',
  CHANNEL_NAME: 'presentation',
  TABLE_NAME: 'presentation_state',

  init(onSlideChange, onConnectionChange) {
    this.onSlideChange = onSlideChange;
    this.onConnectionChange = onConnectionChange;

    if (!window.supabase || this.SUPABASE_URL === 'YOUR_SUPABASE_URL') {
      console.warn('Supabase not configured — sync disabled');
      return;
    }

    try {
      this.supabase = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
      this.channel = this.supabase.channel(this.CHANNEL_NAME);

      this.channel.on('broadcast', { event: 'slide_change' }, (payload) => {
        if (payload.payload && typeof payload.payload.slideIndex === 'number') {
          this.onSlideChange(payload.payload.slideIndex);
        }
      });

      let wasDisconnected = false;
      this.channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          const previouslyDisconnected = !this.isConnected && wasDisconnected;
          this.isConnected = true;
          this.onConnectionChange(true);
          if (previouslyDisconnected) {
            this.fetchCurrentSlide().then(idx => this.onSlideChange(idx));
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isConnected = false;
          wasDisconnected = true;
          this.onConnectionChange(false);
        }
      });
    } catch (e) {
      console.warn('Supabase init failed:', e);
    }
  },

  async fetchCurrentSlide() {
    if (!this.supabase) return 0;
    try {
      const { data, error } = await this.supabase
        .from(this.TABLE_NAME)
        .select('slide_index')
        .eq('id', 1)
        .single();
      if (error || !data) return 0;
      return data.slide_index;
    } catch (e) {
      return 0;
    }
  },

  async publishSlide(slideIndex) {
    if (!this.channel) return;
    this.channel.send({
      type: 'broadcast',
      event: 'slide_change',
      payload: { slideIndex }
    });
    try {
      await this.supabase
        .from(this.TABLE_NAME)
        .upsert({ id: 1, slide_index: slideIndex });
    } catch (e) {
      console.warn('Failed to persist slide state:', e);
    }
  },

  destroy() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
    }
  }
};

const PresenterUI = {
  controlsElement: null,
  prevBtn: null,
  nextBtn: null,
  counter: null,

  init() {
    const controls = document.createElement('div');
    controls.className = 'presenter-controls';
    controls.innerHTML =
      '<button class="presenter-btn prev-btn" aria-label="Previous slide">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
      '</button>' +
      '<span class="slide-counter"></span>' +
      '<button class="presenter-btn next-btn" aria-label="Next slide">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
      '</button>';
    document.body.appendChild(controls);

    this.controlsElement = controls;
    this.prevBtn = controls.querySelector('.prev-btn');
    this.nextBtn = controls.querySelector('.next-btn');
    this.counter = controls.querySelector('.slide-counter');

    this.prevBtn.addEventListener('click', () => App.onPresenterNav('prev'));
    this.nextBtn.addEventListener('click', () => App.onPresenterNav('next'));
  },

  updateControls(currentIndex, totalSlides) {
    this.counter.textContent = (currentIndex + 1) + ' / ' + totalSlides;
    this.prevBtn.disabled = currentIndex === 0;
    this.nextBtn.disabled = currentIndex === totalSlides - 1;
  }
};

const ConnectionIndicator = {
  element: null,
  hideTimeout: null,

  init() {
    this.element = document.getElementById('connection-indicator');
    if (!this.element) return;
    this.element.innerHTML = '<span class="connection-dot"></span><span>Reconnecting...</span>';
  },

  update(connected) {
    if (!this.element) return;
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    const dot = this.element.querySelector('.connection-dot');
    const text = this.element.querySelector('span:last-child');
    if (!connected) {
      this.element.classList.remove('hidden');
      dot.className = 'connection-dot disconnected';
      text.textContent = 'Reconnecting...';
    } else {
      dot.className = 'connection-dot connected';
      text.textContent = 'Connected';
      this.hideTimeout = setTimeout(() => {
        this.element.classList.add('hidden');
      }, 2000);
    }
  }
};

const InteractiveElements = {
  init() {
    document.querySelectorAll('.copy-btn').forEach(button => {
      button.addEventListener('click', () => {
        let text;
        if (button.dataset.promptKey) {
          text = PromptBuilder.getResolvedPrompt(button.dataset.promptKey);
        } else if (button.dataset.copyText) {
          text = button.dataset.copyText;
        } else {
          return;
        }
        this.copyToClipboard(button, text);
      });
    });

    document.querySelectorAll('.tool-link').forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  },

  async copyToClipboard(button, text) {
    const originalHTML = button.innerHTML;
    try {
      await navigator.clipboard.writeText(text);
      button.classList.add('copied');
      button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
      setTimeout(() => {
        button.classList.remove('copied');
        button.innerHTML = originalHTML;
      }, 2000);
    } catch (e) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        button.classList.add('copied');
        button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = originalHTML;
        }, 2000);
      } catch (err) {
        console.warn('Copy failed:', err);
      }
      document.body.removeChild(textarea);
    }
  }
};

const PromptBuilder = {
  fields: {},
  promptCards: [],
  TEMPLATES: {
    adCopy: 'Write 5 Facebook ad variations for {product}. Each ad should have: a scroll-stopping first line, 2-3 sentences of benefit-focused body copy, and a clear CTA. Tone: confident but not salesy. Audience: {audience}.',
    imageConcept: 'Create a clean, modern product lifestyle photo for a Facebook ad. Show {product} in a natural setting with soft lighting. Style: editorial, minimal, high-end. No text overlay.',
    hookGenerator: 'Give me 10 opening lines for a Facebook ad about {product}. Mix formats: questions, bold claims, statistics, and "did you know" style hooks. Keep each under 15 words.',
    competitorResearch: 'Analyze the top Facebook ads in the {industry} space. What hooks, visuals, and CTAs are most common? Summarize the top 5 patterns.'
  },
  PLACEHOLDERS: {
    product: '[your product/service]',
    audience: '[your target audience]',
    industry: '[your industry]'
  },

  init() {
    document.querySelectorAll('.variable-field input[data-var]').forEach(input => {
      this.fields[input.dataset.var] = input;
      input.addEventListener('input', () => this.renderAll());
    });
    document.querySelectorAll('.prompt-block[data-template]').forEach(block => {
      this.promptCards.push({
        element: block.querySelector('.prompt-text'),
        templateKey: block.dataset.template
      });
    });
    this.renderAll();
  },

  getValues() {
    const values = {};
    for (const [key, input] of Object.entries(this.fields)) {
      values[key] = input.value.trim();
    }
    return values;
  },

  renderAll() {
    const values = this.getValues();
    this.promptCards.forEach(card => {
      const template = this.TEMPLATES[card.templateKey];
      if (!template || !card.element) return;
      const html = template.replace(/\{(\w+)\}/g, (match, varName) => {
        const value = values[varName];
        if (value) {
          return '<span class="variable-value">' + this.escapeHtml(value) + '</span>';
        }
        return '<span class="placeholder">' + (this.PLACEHOLDERS[varName] || match) + '</span>';
      });
      card.element.innerHTML = html;
    });
  },

  getResolvedPrompt(templateKey) {
    const template = this.TEMPLATES[templateKey];
    if (!template) return '';
    const values = this.getValues();
    return template.replace(/\{(\w+)\}/g, (match, varName) => {
      return values[varName] || (this.PLACEHOLDERS[varName] || match);
    });
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

const AmbientEffects = {
  canvas: null,
  ctx: null,
  animationId: null,
  orbs: [],
  lastFrame: 0,

  init() {
    this.canvas = document.getElementById('ambient-bg');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();

    const colors = ['#00d4ff', '#8b5cf6', '#00f0ff', '#00d4ff', '#8b5cf6', '#00f0ff', '#8b5cf6'];
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const totalWidth = vw * 14;

    this.orbs = colors.map((color, i) => ({
      x: (totalWidth / colors.length) * i + Math.random() * vw,
      y: vh * 0.2 + Math.random() * vh * 0.6,
      radius: 200 + Math.random() * 300,
      color: color,
      speedX: 0.0002 + Math.random() * 0.0003,
      speedY: 0.0003 + Math.random() * 0.0002,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      baseX: 0,
      baseY: 0
    }));
    this.orbs.forEach(o => { o.baseX = o.x; o.baseY = o.y; });

    this._resizeHandler = () => this.resize();
    window.addEventListener('resize', this._resizeHandler);
    this.animate(0);
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  animate(timestamp) {
    if (timestamp - this.lastFrame < 33) {
      this.animationId = requestAnimationFrame(t => this.animate(t));
      return;
    }
    this.lastFrame = timestamp;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const offset = SlideEngine.getCurrentIndex() * window.innerWidth;

    ctx.clearRect(0, 0, w, h);

    this.orbs.forEach(orb => {
      const now = timestamp * orb.speedX;
      const ox = orb.baseX + Math.sin(now + orb.phaseX) * 100;
      const oy = orb.baseY + Math.cos(timestamp * orb.speedY + orb.phaseY) * 60;

      const rx = ox - offset;
      const ry = oy;

      if (rx > -orb.radius && rx < w + orb.radius) {
        const gradient = ctx.createRadialGradient(rx, ry, 0, rx, ry, orb.radius);
        gradient.addColorStop(0, orb.color + '15');
        gradient.addColorStop(1, orb.color + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(rx - orb.radius, ry - orb.radius, orb.radius * 2, orb.radius * 2);
      }
    });

    this.animationId = requestAnimationFrame(t => this.animate(t));
  },

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
  }
};

const App = {
  role: 'viewer',

  async init() {
    this.role = AuthModule.getRole();
    document.body.classList.add('role-' + this.role);

    AmbientEffects.init();
    ConnectionIndicator.init();

    SyncService.init(
      (slideIndex) => this.onSlideChange(slideIndex),
      (connected) => this.onConnectionChange(connected)
    );

    const initialSlide = await SyncService.fetchCurrentSlide();
    SlideEngine.init(initialSlide, false);

    InteractiveElements.init();
    PromptBuilder.init();

    if (this.role === 'presenter') {
      PresenterUI.init();
      PresenterUI.updateControls(initialSlide, SlideEngine.totalSlides);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          this.onPresenterNav('next');
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          this.onPresenterNav('prev');
        }
      });
    }
  },

  onSlideChange(slideIndex) {
    SlideEngine.goToSlide(slideIndex, true);
    if (this.role === 'presenter') {
      PresenterUI.updateControls(slideIndex, SlideEngine.totalSlides);
    }
  },

  onConnectionChange(connected) {
    if (this.role === 'viewer') {
      ConnectionIndicator.update(connected);
    }
  },

  onPresenterNav(direction) {
    if (direction === 'next') SlideEngine.next();
    else SlideEngine.prev();
    const idx = SlideEngine.getCurrentIndex();
    SyncService.publishSlide(idx);
    PresenterUI.updateControls(idx, SlideEngine.totalSlides);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
