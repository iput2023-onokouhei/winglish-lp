/* script.js — Vanilla JS for nav, slider, reveal */

// 'DOMContentLoaded'イベントは、HTMLの読み込みと解析が完了した時点で実行されます。
// これにより、getElementByIdなどが失敗するのを防ぎます。
document.addEventListener('DOMContentLoaded', function () {

  // --- ヘッダーメニューの開閉機能 ---
  // HTMLからIDを使って要素を取得
  const menuBtn = document.getElementById('menuBtn'); // ハンバーガーボタン
  const nav = document.getElementById('globalNav'); // ナビゲーションメニュー

  // ハンバーガーボタンがクリックされた時の処理
  menuBtn.addEventListener('click', () => {
    // 'aria-expanded'属性（アクセシビリティ用）が'true'かどうかを判定
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';

    // 属性値を反転させる (true -> false, false -> true)
    menuBtn.setAttribute('aria-expanded', String(!expanded));

    // ★CSS連携: nav要素に 'open' クラスを付け外し(トグル)する。
    // style.css の .global-nav.open { display: flex; } が反応し、メニューが表示/非表示される。
    nav.classList.toggle('open');

    // 'aria-hidden'属性も反転させ、スクリーンリーダーに状態を伝える
    nav.setAttribute('aria-hidden', String(expanded));
  });

  // --- スライダー（シンプル自作） ---
  const slider = document.getElementById('slider'); // スライダー全体
  const slidesEl = document.getElementById('slides'); // スライドのコンテナ
  const slides = slidesEl ? slidesEl.children : []; // 個々のスライド要素
  const dotsEl = document.getElementById('dots'); // ドット（ナビゲーション）
  let index = 0; // 現在のスライド番号
  const total = slides.length; // スライドの総数
  let sliderInterval; // 自動再生用のタイマー(setInterval)を保持する変数

  let isPaused = false; // 一時停止中かどうかのフラグ
  const sliderToggleBtn = document.getElementById('sliderToggleBtn'); // 一時停止ボタン

  // スワイプ機能用の変数
  let touchStartX = 0; // タッチ開始位置 (X座標)
  let touchMoveX = 0; // タッチ移動中の位置 (X座標)
  let touchStartY = 0; // タッチ開始位置 (Y座標)
  let isSwiping = false; // スワイプ操作中かどうかのフラグ
  const swipeThreshold = 50; // 50px以上スワイプしたらスライドを切り替える閾値

  // スライドの数だけドットを生成する関数
  function createDots() {
    if (!dotsEl) return; // ドット要素がなければ何もしない
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' active' : ''); // 最初のドットに 'active' クラスを付与
      d.dataset.idx = i; // data属性にインデックス番号を持たせる
      // ドットがクリックされた時の処理
      d.addEventListener('click', () => {
        goToSlide(parseInt(d.dataset.idx, 10)); // 該当スライドへ移動
        resetInterval(); // 自動再生タイマーをリセット
      });
      dotsEl.appendChild(d);
    }
  }

  // 現在のスライドに合わせてドットの表示を更新する関数
  function updateDots() {
    if (!dotsEl) return;
    const dots = dotsEl.children;
    for (let i = 0; i < dots.length; i++) {
      // ★CSS連携: 現在のインデックス(index)と一致するドットに 'active' クラスを付け、他は外す
      // style.css の .slider-dots .dot.active が反応し、見た目が変わる
      dots[i].classList.toggle('active', i === index);
    }
  }

  // 指定されたインデックス(i)にスライドを移動させる関数
  function goToSlide(i) {
    // インデックスを計算 (ループさせるため)
    index = (i + total) % total; // (例: 3枚目で次へ -> (3+1)%4 = 0, 0枚目で前へ -> (0-1+4)%4 = 3)
    if (slidesEl) {
      // ★CSS連携: style属性を直接変更
      // スライドコンテナ(.slides)のtransformプロパティを書き換え、スライドを横に動かす
      slidesEl.style.transform = `translateX(-${index * 100}%)`;
    }
    updateDots(); // ドットの表示も更新
  }

  // 次のスライドへ移動
  function nextSlide() {
    goToSlide(index + 1);
  }

  // 自動再生タイマーをリセット（再開）する関数
  function resetInterval() {
    clearInterval(sliderInterval); // 既存のタイマーを停止
    if (!isPaused) { // 一時停止中でなければ
      // 3.2秒ごとに nextSlide を実行するタイマーをセット
      sliderInterval = setInterval(nextSlide, 3200);
    }
  }

  // 自動再生の一時停止/再生を切り替える関数
  function toggleSliderPause() {
    isPaused = !isPaused; // フラグを反転
    // ★CSS連携: スライダー全体に 'is-paused' クラスを付け外し
    // style.css の .slider.is-paused ... が反応し、再生/停止アイコンを切り替える
    slider.classList.toggle('is-paused', isPaused);

    if (isPaused) {
      clearInterval(sliderInterval); // タイマーを停止
      sliderToggleBtn.setAttribute('aria-label', 'スライドショーを再生');
    } else {
      sliderInterval = setInterval(nextSlide, 3200); // タイマーを再開
      sliderToggleBtn.setAttribute('aria-label', 'スライドショーを停止');
    }
  }

  // --- スワイプ処理関数群 ---
  // タッチ開始時
  function onTouchStart(e) {
    isSwiping = true;
    touchStartX = e.touches[0].clientX; // 開始X座標
    touchStartY = e.touches[0].clientY; // 開始Y座標
    touchMoveX = touchStartX;
    // ★CSS連携: スワイプ中のアニメーションを無効化するため 'is-swiping' クラスを付与
    // style.css の .slides.is-swiping { transition: none; } が反応
    slidesEl.classList.add('is-swiping');
    clearInterval(sliderInterval); // スワイプ中は自動再生を一時停止
  }

  // タッチしながら移動中
  function onTouchMove(e) {
    if (!isSwiping) return;

    touchMoveX = e.touches[0].clientX;
    const touchMoveY = e.touches[0].clientY;
    const diffX = touchMoveX - touchStartX; // X方向の移動量
    const diffY = touchMoveY - touchStartY; // Y方向の移動量

    // 縦スクロール(diffY)より横スワイプ(diffX)の方が大きい場合
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault(); // ページの縦スクロールを止める

      // ★CSS連携: style属性を直接変更
      // 指の動きに合わせてスライドコンテナをリアルタイムで動かす
      const basePercent = -index * 100;
      const slideWidth = slidesEl.offsetWidth; // スライドの幅
      const movePercent = (diffX / slideWidth) * 100; // 移動量をパーセントに変換
      slidesEl.style.transform = `translateX(${basePercent + movePercent}%)`;
    } else {
      // 縦の動きが大きければスワイプ操作をキャンセル
      isSwiping = false;
      slidesEl.classList.remove('is-swiping');
    }
  }

  // タッチ終了時
  function onTouchEnd() {
    if (!isSwiping) return;

    isSwiping = false;
    // ★CSS連携: 'is-swiping' クラスを削除し、CSSアニメーション(transition)を再度有効化
    slidesEl.classList.remove('is-swiping');

    const diff = touchMoveX - touchStartX; // 最終的な移動量

    // 移動量が閾値(50px)より大きい場合
    if (Math.abs(diff) > swipeThreshold) {
      if (diff < 0) { // 左にスワイプ（次へ）
        goToSlide(index + 1);
      } else { // 右にスワイプ（前へ）
        goToSlide(index - 1);
      }
    } else {
      // 移動量が小さければ元のスライドに戻す
      goToSlide(index);
    }

    resetInterval(); // 自動再生を再開
  }


  // --- スライダーの初期化処理 ---
  if (total > 0) { // スライドが1枚以上あれば実行
    createDots(); // ドットを生成
    sliderInterval = setInterval(nextSlide, 3200); // 自動再生を開始

    // マウスが乗ったら自動再生停止
    slidesEl.addEventListener('mouseenter', () => clearInterval(sliderInterval));
    // マウスが離れたら自動再生再開
    slidesEl.addEventListener('mouseleave', resetInterval);

    // 停止/再生ボタンにクリックイベントを設定
    if (sliderToggleBtn) {
      sliderToggleBtn.addEventListener('click', toggleSliderPause);
    }

    // スワイプイベントを登録
    // { passive: true } はスクロール性能向上のため (preventDefaultを呼ばない前提)
    slidesEl.addEventListener('touchstart', onTouchStart, { passive: true });
    // { passive: false } は onTouchMove 内で preventDefault() を呼ぶため必須
    slidesEl.addEventListener('touchmove', onTouchMove, { passive: false });
    slidesEl.addEventListener('touchend', onTouchEnd);
  }

  // --- IntersectionObserver (スクロール連動フェードイン) ---
  // 要素が画面内に入ったかを監視する機能
  const observer = new IntersectionObserver((entries) => {
    // 監視対象の要素(entries)をループ
    entries.forEach(entry => {
      // entry.isIntersecting が true なら、要素が画面内に入った
      if (entry.isIntersecting) {
        // ★CSS連携: 要素に 'is-visible' クラスを付与
        // style.css の .reveal.is-visible が反応し、フェードインアニメーションが実行される
        entry.target.classList.add('is-visible');
        // 一度表示したら、その要素の監視を解除（パフォーマンス向上）
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 }); // 要素が 12% 見えたら反応

  // HTML内の '.reveal' クラスを持つすべての要素を監視対象に追加
  document.querySelectorAll('.reveal').forEach(elem => observer.observe(elem));

  // --- アクセシビリティ: SPでメニュー外をクリックしたら閉じる ---
  document.addEventListener('click', (e) => {
    // メニューが開いていなければ何もしない
    if (!nav.classList.contains('open')) return;

    // クリックした場所(e.target)がナビゲーション内部か、ハンバーガーボタンか
    const withinNav = nav.contains(e.target) || menuBtn.contains(e.target);

    if (!withinNav) { // メニューの「外側」がクリックされたら
      // ★CSS連携: 'open' クラスを削除し、メニューを閉じる
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
    }
  });


  /* ==============================
     テーマ切り替え (ライト/ダーク)
  ============================== */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const body = document.body;
  const storageKey = 'winglish-theme'; // localStorageに保存するキー名

  // ページ読み込み時に実行するテーマ適用関数
  function applyTheme() {
    // localStorageから保存済みのテーマを取得
    const currentTheme = localStorage.getItem(storageKey);

    if (currentTheme) {
      // ★CSS連携: 保存したテーマがあれば、bodyの 'data-theme' 属性に設定
      body.setAttribute('data-theme', currentTheme);
    } else {
      // 保存がなければ、OSの設定(prefers-color-scheme)をチェック
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // ★CSS連携: OS設定に合わせて 'data-theme' を設定
      body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }
  applyTheme(); // ページ読み込み時に実行

  // テーマ切り替えボタンがクリックされた時の処理
  themeToggleBtn.addEventListener('click', () => {
    let newTheme;
    // 現在のテーマを判定し、新しいテーマを決定
    if (body.getAttribute('data-theme') === 'dark') {
      newTheme = 'light';
    } else {
      newTheme = 'dark';
    }

    // ★CSS連携: bodyの 'data-theme' 属性を新しいテーマに書き換える
    // style.css の [data-theme="light"] / [data-theme="dark"] セレクタが反応し、
    // CSS変数の値が切り替わり、サイト全体の配色が変わる
    body.setAttribute('data-theme', newTheme);

    // ユーザーの選択を localStorage に保存し、次回訪問時も反映させる
    localStorage.setItem(storageKey, newTheme);
  });

  /* ==============================
     ヘッダー変形（スクロール連動）
  ============================== */
  const header = document.querySelector('.site-header');

  if (header) {
    // ページのスクロールイベントを監視
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) { // 50pxより多くスクロールしたら
        // ★CSS連携: ヘッダーに 'is-scrolled' クラスを付与
        // style.css の .site-header.is-scrolled が反応し、ヘッダーのpaddingや影が変わる
        header.classList.add('is-scrolled');
      } else { // スクロールが50px未満（ほぼトップ）なら
        // ★CSS連携: 'is-scrolled' クラスを削除
        header.classList.remove('is-scrolled');
      }
    }, { passive: true }); // passive:true はスクロールパフォーマンスを最適化するため
  }

  /* ==============================
     ページトップボタン表示制御
  ============================== */
  const pageTopBtn = document.getElementById('pageTopBtn');

  if (pageTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) { // 400pxより多くスクロールしたら
        // ★CSS連携: ボタンに 'is-visible' クラスを付与
        // style.css の .page-top-btn.is-visible が反応し、ボタンが表示される
        pageTopBtn.classList.add('is-visible');
      } else {
        // ★CSS連携: 'is-visible' クラスを削除
        pageTopBtn.classList.remove('is-visible');
      }
    });
  }

  /* ==================================================
     スクロール連動ナビゲーション（現在地ハイライト）
  ================================================== */
  const navLinks = document.querySelectorAll('#globalNav a'); // ナビの全リンク
  const sections = document.querySelectorAll('main section[id]'); // IDを持つ全セクション

  // (1) ナビのリンクをクリックしたら、SPメニューを閉じる処理
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) { // メニューが開いていたら
        nav.classList.remove('open'); // 閉じる
        menuBtn.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // (2) スクロール位置に応じて、ナビのリンクをハイライトする処理
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id'); // 画面に入ってきたセクションのID
      // そのIDに対応するナビリンク (例: <a href="#features">) を探す
      const navLink = document.querySelector(`#globalNav a[href="#${id}"]`);

      if (entry.isIntersecting) { // セクションが監視領域（画面中央付近）に入ったら
        navLinks.forEach(link => link.classList.remove('nav-active')); // まず全リンクのハイライトを消す
        if (navLink) {
          // ★CSS連携: 該当リンクに 'nav-active' クラスを付与
          // style.css の .global-nav a.nav-active が反応し、太字・色変更される
          navLink.classList.add('nav-active');
        }
      }
    });
  }, {
    // rootMargin: '上マージン 右マージン 下マージン 左マージン'
    // 画面の上端から25%、下端から75%の位置を「監視領域」とする（＝画面中央の50%の領域）
    rootMargin: '-25% 0px -75% 0px',
    threshold: 0
  });

  // 全セクションを監視対象に追加
  sections.forEach(section => {
    scrollObserver.observe(section);
  });


  /* ==============================================
     FAQアコーディオン排他制御
  ============================================== */
  const allFaqs = document.querySelectorAll('.faq'); // <details>タグのリスト

  allFaqs.forEach(faq => {
    // <details>タグが開閉した時('toggle'イベント)に実行
    faq.addEventListener('toggle', (event) => {
      if (faq.open) { // もし開かれたなら
        // 他のすべてのFAQをチェック
        allFaqs.forEach(otherFaq => {
          // 自分自身(faq)以外で、かつ、開いている(otherFaq.open)ものがあれば
          if (otherFaq !== faq && otherFaq.open) {
            otherFaq.open = false; // それを閉じる
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
      // (現在のスクロール量 / スクロール可能な最大量) * 100
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100;
      // ★CSS連携: style属性を直接変更
      // .progress-bar の width をパーセントで直接指定する
      progressBar.style.width = scrollPercent + '%';
    }, { passive: true });
  }

  /* ==============================================
     ▼▼▼ (1): 3Dホバーエフェクト 削除 ▼▼▼
  ============================================== */
  // (関連するJavaScriptコードが削除されています)


  /* ==============================================
     ▼▼▼ (2): インタラクティブ・デモ ▼▼▼
  ============================================== */
  const demo = document.getElementById('interactiveDemo');
  if (demo) {
    const options = demo.querySelectorAll('.demo-options button'); // 選択肢ボタン
    const resultEl = document.getElementById('demoResult'); // 結果表示欄
    let answered = false; // 回答済みフラグ

    options.forEach(button => {
      button.addEventListener('click', () => {
        if (answered) return; // 一度回答したら、以降のクリックは無視
        answered = true;

        // HTMLの 'data-correct' 属性を見て正解かどうかを判定
        const isCorrect = button.dataset.correct === 'true';

        if (isCorrect) {
          resultEl.textContent = '✅ 正解！ (be destined to 〜: 〜する運命だ)';
          // ★CSS連携: 結果欄に 'correct' クラスを付与
          resultEl.className = 'demo-result correct';
          // ★CSS連携: 押したボタンに 'correct' クラスを付与
          button.classList.add('correct');
        } else {
          resultEl.textContent = '❌ 不正解...';
          // ★CSS連携: 結果欄に 'wrong' クラスを付与
          resultEl.className = 'demo-result wrong';
          // ★CSS連携: 押したボタンに 'wrong' クラスを付与
          button.classList.add('wrong');
          // ★CSS連携: 不正解時に、正解のボタンに 'correct' クラスを付与してハイライト
          demo.querySelector('[data-correct="true"]').classList.add('correct');
        }
        // 上記クラス (.correct, .wrong) に style.css が反応し、色が変わる
      });
    });
  }

  /* ==============================================
     ▼▼▼ (3): 追従CTAフッター表示制御 ▼▼▼
  ============================================== */
  const stickyFooter = document.getElementById('stickyFooter');
  if (stickyFooter) {
    const heroSection = document.getElementById('hero'); // ヒーローセクション

    // ヒーローセクションを監視するIntersectionObserver
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          // ヒーローが画面外に出たら (isIntersecting が false になったら)
          // ★CSS連携: 追従フッターに 'is-visible' クラスを付与
          // style.css の .sticky-footer-cta.is-visible が反応し、フッターが表示される
          stickyFooter.classList.add('is-visible');
        } else {
          // ヒーローが画面内に戻ってきたら (トップに戻るなど)
          // ★CSS連携: 'is-visible' クラスを削除
          stickyFooter.classList.remove('is-visible');
        }
      });
    }, {
      rootMargin: '0px 0px -100px 0px' // 画面下部から100px入った時点で「見えている」判定を終了
    });

    if (heroSection) {
      heroObserver.observe(heroSection); // ヒーローセクションの監視を開始
    }
  }

}); // DOMContentLoaded の閉じカッコ