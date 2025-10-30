/* script.js — Vanilla JS for nav, slider, reveal */

document.addEventListener('DOMContentLoaded', function () {
  // ヘッダーメニューの開閉
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('globalNav');
  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
    nav.setAttribute('aria-hidden', String(expanded));
  });

  // スライダー（シンプル自作）
  const slider = document.getElementById('slider');
  const slidesEl = document.getElementById('slides');
  const slides = slidesEl ? slidesEl.children : [];
  const dotsEl = document.getElementById('dots');
  let index = 0;
  const total = slides.length;
  let sliderInterval;
  
  let isPaused = false;
  const sliderToggleBtn = document.getElementById('sliderToggleBtn');

  // スワイプ機能用変数
  let touchStartX = 0;
  let touchMoveX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  const swipeThreshold = 50;
  
  function createDots() {
    if (!dotsEl) return;
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.dataset.idx = i;
      d.addEventListener('click', () => {
        goToSlide(parseInt(d.dataset.idx, 10));
        resetInterval();
      });
      dotsEl.appendChild(d);
    }
  }

  function updateDots() {
    if (!dotsEl) return;
    const dots = dotsEl.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === index);
    }
  }

  function goToSlide(i) {
    index = (i + total) % total;
    if (slidesEl) {
      slidesEl.style.transform = `translateX(-${index * 100}%)`;
    }
    updateDots();
  }

  function nextSlide() {
    goToSlide(index + 1);
  }

  function resetInterval() {
    clearInterval(sliderInterval);
    if (!isPaused) {
      sliderInterval = setInterval(nextSlide, 3200);
    }
  }

  function toggleSliderPause() {
    isPaused = !isPaused;
    slider.classList.toggle('is-paused', isPaused);
    
    if (isPaused) {
      clearInterval(sliderInterval);
      sliderToggleBtn.setAttribute('aria-label', 'スライドショーを再生');
    } else {
      sliderInterval = setInterval(nextSlide, 3200);
      sliderToggleBtn.setAttribute('aria-label', 'スライドショーを停止');
    }
  }
  
  // スワイプ処理関数
  function onTouchStart(e) {
    isSwiping = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchMoveX = touchStartX;
    slidesEl.classList.add('is-swiping');
    clearInterval(sliderInterval);
  }

  function onTouchMove(e) {
    if (!isSwiping) return;

    touchMoveX = e.touches[0].clientX;
    const touchMoveY = e.touches[0].clientY;
    const diffX = touchMoveX - touchStartX;
    const diffY = touchMoveY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault(); 
      
      const basePercent = -index * 100;
      const slideWidth = slidesEl.offsetWidth;
      const movePercent = (diffX / slideWidth) * 100;
      slidesEl.style.transform = `translateX(${basePercent + movePercent}%)`;
    } else {
      isSwiping = false;
      slidesEl.classList.remove('is-swiping');
    }
  }

  function onTouchEnd() {
    if (!isSwiping) return;
    
    isSwiping = false;
    slidesEl.classList.remove('is-swiping');
    
    const diff = touchMoveX - touchStartX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff < 0) {
        goToSlide(index + 1);
      } else {
        goToSlide(index - 1);
      }
    } else {
      goToSlide(index);
    }
    
    resetInterval();
  }
  

  if (total > 0) {
    createDots();
    sliderInterval = setInterval(nextSlide, 3200);

    slidesEl.addEventListener('mouseenter', () => clearInterval(sliderInterval));
    slidesEl.addEventListener('mouseleave', resetInterval);

    if (sliderToggleBtn) {
      sliderToggleBtn.addEventListener('click', toggleSliderPause);
    }
    
    slidesEl.addEventListener('touchstart', onTouchStart, { passive: true });
    slidesEl.addEventListener('touchmove', onTouchMove, { passive: false }); 
    slidesEl.addEventListener('touchend', onTouchEnd);
  }

  // IntersectionObserver for reveal animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(elem => observer.observe(elem));

  // Accessibility: close nav when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('open')) return;
    const withinNav = nav.contains(e.target) || menuBtn.contains(e.target);
    if (!withinNav) {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
    }
  });


  /* ==============================
     テーマ切り替え
  ============================== */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const body = document.body;
  const storageKey = 'winglish-theme'; 

  function applyTheme() {
    const currentTheme = localStorage.getItem(storageKey);
    
    if (currentTheme) {
      body.setAttribute('data-theme', currentTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }
  applyTheme(); 

  themeToggleBtn.addEventListener('click', () => {
    let newTheme;
    if (body.getAttribute('data-theme') === 'dark') {
      newTheme = 'light';
    } else {
      newTheme = 'dark';
    }
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem(storageKey, newTheme); 
  });

  /* ==============================
     ヘッダー変形（スクロール連動）
  ============================== */
  const header = document.querySelector('.site-header');
  
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }
  
  /* ==============================
     ページトップボタン表示制御
  ============================== */
  const pageTopBtn = document.getElementById('pageTopBtn');
  
  if (pageTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        pageTopBtn.classList.add('is-visible');
      } else {
        pageTopBtn.classList.remove('is-visible');
      }
    });
  }
  
  /* ==================================================
     スクロール連動ナビゲーション
  ================================================== */
  const navLinks = document.querySelectorAll('#globalNav a');
  const sections = document.querySelectorAll('main section[id]');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-hidden', 'true');
      }
    });
  });

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const navLink = document.querySelector(`#globalNav a[href="#${id}"]`);
      
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('nav-active'));
        if (navLink) {
          navLink.classList.add('nav-active');
        }
      }
    });
  }, {
    rootMargin: '-25% 0px -75% 0px',
    threshold: 0
  });

  sections.forEach(section => {
    scrollObserver.observe(section);
  });


  /* ==============================================
     FAQアコーディオン排他制御
  ============================================== */
  const allFaqs = document.querySelectorAll('.faq');

  allFaqs.forEach(faq => {
    faq.addEventListener('toggle', (event) => {
      if (faq.open) {
        allFaqs.forEach(otherFaq => {
          if (otherFaq !== faq && otherFaq.open) {
            otherFaq.open = false;
          }
        });
      }
    });
  });
  
  /* ==============================================
     スクロール進捗バー
  ============================================== */
  const progressBar = document.getElementById('progressBar');

  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100;
      progressBar.style.width = scrollPercent + '%';
    }, { passive: true });
  }

  /* ==============================================
     ▼▼▼ 削除 (1): 3Dホバーエフェクト ▼▼▼
  ============================================== */
  // (Discord風デザインに合わないため、該当ブロックを削除)


  /* ==============================================
     ▼▼▼ 追記 (2): インタラクティブ・デモ ▼▼▼
  ============================================== */
  const demo = document.getElementById('interactiveDemo');
  if (demo) {
    const options = demo.querySelectorAll('.demo-options button');
    const resultEl = document.getElementById('demoResult');
    let answered = false;

    options.forEach(button => {
      button.addEventListener('click', () => {
        if (answered) return; // 一度回答したら終わり
        answered = true;

        const isCorrect = button.dataset.correct === 'true';
        
        if (isCorrect) {
          resultEl.textContent = '✅ 正解！ (be destined to 〜: 〜する運命だ)';
          resultEl.className = 'demo-result correct';
          button.classList.add('correct');
        } else {
          resultEl.textContent = '❌ 不正解...';
          resultEl.className = 'demo-result wrong';
          button.classList.add('wrong');
          // 正解をハイライト
          demo.querySelector('[data-correct="true"]').classList.add('correct');
        }
      });
    });
  }

  /* ==============================================
     ▼▼▼ 追記 (3): 追従CTAフッター表示制御 ▼▼▼
  ============================================== */
  const stickyFooter = document.getElementById('stickyFooter');
  if (stickyFooter) {
    const heroSection = document.getElementById('hero');
    
    // ヒーローセクション（ファーストビュー）を抜けたら表示
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          // ヒーローが画面外に出たらフッターを表示
          stickyFooter.classList.add('is-visible');
        } else {
          // ヒーローが画面内に戻ったらフッターを隠す
          stickyFooter.classList.remove('is-visible');
        }
      });
    }, {
      rootMargin: '0px 0px -100px 0px' // 画面下部から100px入ったら判定
    });
    
    if (heroSection) {
      heroObserver.observe(heroSection);
    }
  }
  
}); // DOMContentLoaded の閉じカッコ