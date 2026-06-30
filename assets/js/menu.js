/* مطاعم الرمال — menu.js
   Menu rendering, cart, product modal, mock checkout, fly-to-cart. Vanilla JS. */
(function () {
  'use strict';

  var DATA = window.RIMAL_DATA || { categories: [] };
  var DELIVERY_FEE = 8;
  var WA = '966500549144';
  var CART_KEY = 'rimal_cart_v1';
  var PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23eddcc1'/%3E%3Ccircle cx='50' cy='50' r='22' fill='none' stroke='%23c8a24c' stroke-width='3'/%3E%3Cpath d='M50 38v24M38 50h24' stroke='%23c0142b' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E";

  var cart = load();
  var modalItem = null;

  // ---------- utils ----------
  function lang() { return (window.rimalLang && window.rimalLang()) || 'ar'; }
  function t(ar, en) { return lang() === 'en' ? en : ar; }
  function money(n) { return n + ' ' + t('ر.س', 'SAR'); }
  function $(s, ctx) { return (ctx || document).querySelector(s); }
  function cdnT(it) { return it.cdn ? it.cdn + '?width=512&quality=100&webp=true' : ''; }
  function cdnL(it) { return it.cdn ? it.cdn + '?width=1024&quality=100&webp=true' : ''; }
  function load() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }

  function bindImg(img, local, cdn) {
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = local || cdn || PLACEHOLDER;
    img.onerror = function () {
      if (cdn && this.src !== cdn) { this.src = cdn; }
      else { this.onerror = null; this.src = PLACEHOLDER; }
    };
  }

  // ---------- build catalogue ----------
  var ITEMS = {}; // uid -> item
  DATA.categories.forEach(function (cat, ci) {
    cat.items.forEach(function (it, j) { it._uid = ci + '-' + j; ITEMS[it._uid] = it; });
  });

  // ---------- render menu ----------
  function renderChips() {
    var wrap = $('#menu-chips'); if (!wrap) return;
    wrap.innerHTML = '';
    DATA.categories.forEach(function (cat) {
      var b = document.createElement('button');
      b.className = 'menu-chip';
      b.textContent = cat.name;
      b.dataset.target = cat.slug;
      b.addEventListener('click', function () {
        var sec = document.getElementById(cat.slug);
        if (sec) {
          var top = sec.getBoundingClientRect().top + window.scrollY - 132;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
      wrap.appendChild(b);
    });
  }

  function calBadge(it) {
    if (it.cal == null || it.cal === '') return '';
    return '<span class="cal-badge"><i class="fa-solid fa-fire-flame-curved"></i> ' + it.cal + ' ' + t('سعرة', 'cal') + '</span>';
  }

  function makeCard(it) {
    var card = document.createElement('div');
    card.className = 'menu-card';
    card.dataset.uid = it._uid;
    card.setAttribute('data-aos', 'fade-up');

    var media = document.createElement('div');
    media.className = 'menu-card__media';
    var img = document.createElement('img');
    img.className = 'menu-card__img';
    img.alt = it.name;
    bindImg(img, it.thumb, cdnT(it));
    media.appendChild(img);
    media.insertAdjacentHTML('beforeend', '<span class="menu-card__zoom"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></span>');
    media.addEventListener('click', function () { openProduct(it); });

    var body = document.createElement('div');
    body.className = 'menu-card__body';
    body.innerHTML =
      '<h4 class="menu-card__name">' + esc(it.name) + '</h4>' +
      (it.desc ? '<p class="menu-card__desc">' + esc(it.desc) + '</p>' : '<p class="menu-card__desc"></p>') +
      '<div class="menu-card__meta">' + calBadge(it) +
      '<span class="price">' + it.price + ' <span class="cur">' + t('ر.س', 'SAR') + '</span></span></div>';

    var add = document.createElement('button');
    add.className = 'menu-card__add';
    add.setAttribute('aria-label', t('أضف إلى السلة', 'Add to cart'));
    add.innerHTML = '<i class="fa-solid fa-plus"></i>';
    add.addEventListener('click', function (e) { e.stopPropagation(); addToCart(it, img); });

    card.appendChild(media);
    card.appendChild(body);
    card.appendChild(add);
    return card;
  }

  function renderMenu() {
    var host = $('#menu-sections'); if (!host) return;
    host.innerHTML = '';
    DATA.categories.forEach(function (cat) {
      var sec = document.createElement('div');
      sec.className = 'menu-cat';
      sec.id = cat.slug;
      sec.dataset.cat = cat.id;
      sec.innerHTML =
        '<div class="menu-cat__head"><h3 class="menu-cat__title">' + esc(cat.name) + '</h3>' +
        '<span class="menu-cat__rule"></span>' +
        '<span class="menu-cat__count">' + cat.items.length + ' ' + t('صنف', 'items') + '</span></div>';
      var grid = document.createElement('div');
      grid.className = 'menu-grid';
      cat.items.forEach(function (it) { grid.appendChild(makeCard(it)); });
      sec.appendChild(grid);
      host.appendChild(sec);
    });
  }

  function renderSpecialties() {
    var row = $('#spec-row'); if (!row) return;
    // curated picks across categories (meat, chicken, rice, fata/marsa, kunafa)
    var picks = [];
    [2, 3, 5, 0, 10].forEach(function (ci) {
      var cat = DATA.categories[ci]; if (!cat) return;
      var it = cat.items.find(function (x) { return x.thumb || x.cdn; });
      if (it && picks.indexOf(it) === -1) picks.push(it);
    });
    row.innerHTML = '';
    picks.slice(0, 5).forEach(function (it) {
      var c = document.createElement('div');
      c.className = 'spec-card';
      c.style.backgroundImage = "url('" + (it.thumb || cdnT(it)) + "')";
      c.innerHTML = '<span class="spec-card__tag">' + t('مميز', 'Signature') + '</span>' +
        '<div class="spec-card__body"><div class="spec-card__name">' + esc(it.name) + '</div>' +
        '<div class="spec-card__price">' + money(it.price) + '</div></div>';
      c.addEventListener('click', function () { openProduct(it); });
      row.appendChild(c);
    });
  }

  // ---------- cart ----------
  function addToCart(it, srcImg) {
    var u = it._uid;
    if (!cart[u]) cart[u] = { name: it.name, price: it.price, thumb: it.thumb, cdn: it.cdn, qty: 0 };
    cart[u].qty++;
    save(); updateCart();
    if (srcImg) flyToCart(srcImg);
    bumpCart();
    toast(t('أُضيف إلى السلة', 'Added to cart'));
  }
  function setQty(u, q) { if (!cart[u]) return; cart[u].qty = q; if (q <= 0) delete cart[u]; save(); updateCart(); }
  function count() { return Object.keys(cart).reduce(function (s, u) { return s + cart[u].qty; }, 0); }
  function subtotal() { return Object.keys(cart).reduce(function (s, u) { return s + cart[u].price * cart[u].qty; }, 0); }

  function updateCart() {
    var n = count();
    var badge = $('#cart-count');
    badge.textContent = n;
    badge.classList.toggle('show', n > 0);

    var box = $('#cart-items'), foot = $('#cart-foot');
    box.innerHTML = '';
    var keys = Object.keys(cart);
    if (!keys.length) {
      box.innerHTML = '<div class="cart-empty"><i class="fa-solid fa-basket-shopping"></i><p>' +
        t('سلتك فارغة — أضف أطباقك المفضلة.', 'Your cart is empty — add your favorites.') + '</p></div>';
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    keys.forEach(function (u) {
      var c = cart[u];
      var line = document.createElement('div');
      line.className = 'cart-line';
      var img = document.createElement('img');
      img.className = 'cart-line__img'; img.alt = c.name;
      bindImg(img, c.thumb, c.cdn ? c.cdn + '?width=512&quality=100&webp=true' : '');
      var main = document.createElement('div');
      main.className = 'cart-line__main';
      main.innerHTML = '<p class="cart-line__name">' + esc(c.name) + '</p>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">' +
        '<span class="qty-stepper"><button class="qty-btn" data-act="dec">−</button>' +
        '<span class="qty-val">' + c.qty + '</span>' +
        '<button class="qty-btn" data-act="inc">+</button></span>' +
        '<span class="cart-line__price">' + money(c.price * c.qty) + '</span></div>';
      var rm = document.createElement('button');
      rm.className = 'cart-line__remove'; rm.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      rm.addEventListener('click', function () { setQty(u, 0); });
      main.querySelector('[data-act="dec"]').addEventListener('click', function () { setQty(u, c.qty - 1); });
      main.querySelector('[data-act="inc"]').addEventListener('click', function () { setQty(u, c.qty + 1); });
      line.appendChild(img); line.appendChild(main); line.appendChild(rm);
      box.appendChild(line);
    });
    var sub = subtotal();
    $('#cart-subtotal').textContent = money(sub);
    $('#cart-total').textContent = money(sub + DELIVERY_FEE);
    var wa = $('#wa-order-btn'); if (wa) wa.href = waLink();
  }

  function waLink() {
    var lines = Object.keys(cart).map(function (u) { return '• ' + cart[u].name + ' ×' + cart[u].qty + ' = ' + (cart[u].price * cart[u].qty) + ' ر.س'; });
    var msg = 'السلام عليكم،\nأرغب بطلب من مطاعم الرمال:\n' + lines.join('\n') +
      '\n\nالمجموع: ' + subtotal() + ' ر.س (+ رسوم التوصيل ' + DELIVERY_FEE + ' ر.س)';
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }

  function bumpCart() { var c = $('#cart-btn'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }

  function flyToCart(srcImg) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var target = $('#cart-btn').getBoundingClientRect();
    var s = srcImg.getBoundingClientRect();
    var g = document.createElement('img');
    g.src = srcImg.src; g.className = 'fly-ghost';
    g.style.left = s.left + 'px'; g.style.top = s.top + 'px';
    g.style.width = s.width + 'px'; g.style.height = s.height + 'px';
    document.body.appendChild(g);
    var dx = (target.left + target.width / 2) - (s.left + s.width / 2);
    var dy = (target.top + target.height / 2) - (s.top + s.height / 2);
    requestAnimationFrame(function () {
      g.style.transition = 'transform .8s cubic-bezier(.5,-0.2,.3,1), opacity .8s ease';
      g.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.15) rotate(20deg)';
      g.style.opacity = '0.2';
    });
    setTimeout(function () { g.remove(); }, 850);
  }

  // ---------- product modal ----------
  function openProduct(it) {
    modalItem = it;
    $('#pm-media').style.backgroundImage = "url('" + (it.large || cdnL(it) || it.thumb) + "')";
    $('#pm-title').textContent = it.name;
    $('#pm-desc').textContent = it.desc || '';
    var cal = $('#pm-cal');
    if (it.cal == null) { cal.style.display = 'none'; }
    else { cal.style.display = ''; cal.innerHTML = '<i class="fa-solid fa-fire-flame-curved"></i> ' + it.cal + ' ' + t('سعرة', 'cal'); }
    $('#pm-price').textContent = money(it.price);
    openModal('#product-modal');
  }
  $('#pm-add').addEventListener('click', function () {
    if (modalItem) { addToCart(modalItem, null); bumpCart(); closeModal('#product-modal'); openCart(); }
  });

  // ---------- generic modal ----------
  function openModal(sel) { var m = $(sel); m.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeModal(sel) { var m = $(sel); m.classList.remove('open'); if (!document.querySelector('.rm-modal.open') && !$('#cart-drawer').classList.contains('open')) document.body.style.overflow = ''; }
  document.querySelectorAll('.rm-modal [data-close]').forEach(function (b) {
    b.addEventListener('click', function () { closeModal('#' + b.closest('.rm-modal').id); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.rm-modal.open').forEach(function (m) { closeModal('#' + m.id); });
      closeCart();
    }
  });

  // ---------- cart drawer ----------
  function openCart() { $('#cart-drawer').classList.add('open'); $('#drawer-overlay').classList.add('show'); document.body.style.overflow = 'hidden'; }
  function closeCart() { $('#cart-drawer').classList.remove('open'); $('#drawer-overlay').classList.remove('show'); if (!document.querySelector('.rm-modal.open')) document.body.style.overflow = ''; }
  $('#cart-btn').addEventListener('click', openCart);
  $('#cart-close').addEventListener('click', closeCart);
  $('#drawer-overlay').addEventListener('click', closeCart);

  // ---------- checkout ----------
  var co = { type: 'delivery', name: '', phone: '', address: '', notes: '' };
  $('#checkout-btn').addEventListener('click', function () {
    if (!count()) { toast(t('سلتك فارغة', 'Your cart is empty')); return; }
    closeCart(); openModal('#checkout-modal'); coStep(1);
  });

  function setSteps(n) {
    document.querySelectorAll('#checkout-modal .co__step').forEach(function (s, i) {
      s.classList.toggle('done', i < n - 1);
      s.classList.toggle('active', i === n - 1);
    });
  }

  function coStep(n) {
    setSteps(n);
    var body = $('#co-body');
    if (n === 1) {
      body.innerHTML =
        '<div class="co__panel"><p class="co__panel-title">' + t('نوع الطلب', 'Order type') + '</p>' +
        '<div class="co-type">' +
        '<div class="co-type__btn ' + (co.type === 'delivery' ? 'active' : '') + '" data-type="delivery"><i class="fa-solid fa-truck-fast"></i>' + t('توصيل', 'Delivery') + '</div>' +
        '<div class="co-type__btn ' + (co.type === 'pickup' ? 'active' : '') + '" data-type="pickup"><i class="fa-solid fa-bag-shopping"></i>' + t('استلام', 'Pickup') + '</div>' +
        '</div><button class="btn-rm btn-block-rm" id="co-next1">' + t('متابعة', 'Continue') + '</button></div>';
      body.querySelectorAll('.co-type__btn').forEach(function (b) {
        b.addEventListener('click', function () {
          co.type = b.dataset.type;
          body.querySelectorAll('.co-type__btn').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
        });
      });
      $('#co-next1').addEventListener('click', function () { coStep(2); });
    }
    else if (n === 2) {
      body.innerHTML =
        '<div class="co__panel"><p class="co__panel-title">' + t('بياناتك', 'Your details') + '</p>' +
        field('name', t('الاسم', 'Full name'), co.name, 'text') +
        field('phone', t('رقم الجوال', 'Phone'), co.phone, 'tel') +
        (co.type === 'delivery' ? field('address', t('العنوان', 'Address'), co.address, 'text') : '') +
        '<div class="form-field"><label>' + t('ملاحظات (اختياري)', 'Notes (optional)') + '</label><textarea id="co-notes" rows="2">' + esc(co.notes) + '</textarea></div>' +
        '<div style="display:flex;gap:10px"><button class="btn-rm btn-ghost" style="--fg:#531417;border-color:#ddd;color:#531417;box-shadow:none" id="co-back2">' + t('رجوع', 'Back') + '</button>' +
        '<button class="btn-rm btn-block-rm" id="co-next2">' + t('متابعة للدفع', 'Continue to payment') + '</button></div></div>';
      $('#co-back2').addEventListener('click', function () { collect2(); coStep(1); });
      $('#co-next2').addEventListener('click', function () {
        collect2();
        if (!co.name.trim() || !co.phone.trim() || (co.type === 'delivery' && !co.address.trim())) {
          toast(t('يرجى تعبئة الحقول المطلوبة', 'Please fill the required fields')); return;
        }
        coStep(3);
      });
    }
    else if (n === 3) {
      var total = subtotal() + (co.type === 'delivery' ? DELIVERY_FEE : 0);
      body.innerHTML =
        '<div class="co__panel"><p class="co__panel-title">' + t('الدفع', 'Payment') + '</p>' +
        '<div class="pay-card"><svg class="dunes" viewBox="0 0 300 160" preserveAspectRatio="none" aria-hidden="true"><path d="M0,70 C 80,40 160,90 300,55"/><path d="M0,110 C 90,80 170,120 300,95"/></svg>' +
        '<span class="pay-brand">RIMAL</span><div class="pay-card__chip"></div>' +
        '<div class="pay-card__num" id="pc-num">•••• •••• •••• ••••</div>' +
        '<div class="pay-card__row"><span id="pc-name">' + t('الاسم على البطاقة', 'CARDHOLDER') + '</span><span id="pc-exp">MM/YY</span></div></div>' +
        '<div class="form-field"><label>' + t('رقم البطاقة', 'Card number') + '</label><input id="cc-num" inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242"></div>' +
        '<div class="form-grid-2">' +
        '<div class="form-field"><label>' + t('تاريخ الانتهاء', 'Expiry') + '</label><input id="cc-exp" inputmode="numeric" maxlength="5" placeholder="MM/YY"></div>' +
        '<div class="form-field"><label>CVV</label><input id="cc-cvv" inputmode="numeric" maxlength="4" placeholder="123"></div></div>' +
        '<button class="btn-rm btn-block-rm" id="co-pay"><i class="fa-solid fa-lock"></i> ' + t('ادفع', 'Pay') + ' ' + money(total) + '</button>' +
        '<a class="btn-rm btn-wa btn-block-rm" style="margin-top:10px" href="' + waLink() + '" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> ' + t('أرسل الطلب عبر واتساب بدلاً من الدفع', 'Send via WhatsApp instead') + '</a>' +
        '<p class="demo-note"><i class="fa-solid fa-circle-info"></i> ' + t('عرض تجريبي — لا يتم خصم أي مبلغ فعلي.', 'Demo only — no real charge is made.') + '</p></div>';
      wireCard();
      $('#co-pay').addEventListener('click', function () { payNow(this, total); });
    }
  }

  function field(id, label, val, type) {
    return '<div class="form-field"><label>' + label + '</label><input id="co-' + id + '" type="' + type + '" value="' + esc(val) + '"></div>';
  }
  function collect2() {
    co.name = (val('#co-name') || '').trim();
    co.phone = (val('#co-phone') || '').trim();
    if ($('#co-address')) co.address = (val('#co-address') || '').trim();
    if ($('#co-notes')) co.notes = val('#co-notes') || '';
  }
  function val(s) { var e = $(s); return e ? e.value : ''; }

  function wireCard() {
    var num = $('#cc-num'), exp = $('#cc-exp'), cvv = $('#cc-cvv');
    num.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '').slice(0, 16);
      this.value = v.replace(/(.{4})/g, '$1 ').trim();
      $('#pc-num').textContent = (this.value || '•••• •••• •••• ••••').padEnd(19, '•').replace(/(.{4})/g, '$1 ').trim().slice(0, 24) || '•••• •••• •••• ••••';
      $('#pc-num').textContent = this.value ? this.value : '•••• •••• •••• ••••';
    });
    exp.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
      this.value = v; $('#pc-exp').textContent = v || 'MM/YY';
    });
    cvv.addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 4); });
    var nm = $('#co-name');
    $('#pc-name').textContent = (co.name || t('الاسم على البطاقة', 'CARDHOLDER'));
  }

  function payNow(btn, total) {
    var num = (val('#cc-num') || '').replace(/\s/g, '');
    if (num.length < 12 || !val('#cc-exp') || (val('#cc-cvv') || '').length < 3) {
      toast(t('أكمل بيانات البطاقة (تجريبية)', 'Complete the (demo) card details')); return;
    }
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spin"></span> ' + t('جارٍ المعالجة...', 'Processing...');
    setTimeout(function () {
      var orderNo = 'AR-' + String(Date.now()).slice(-6);
      cart = {}; save(); updateCart();
      $('#co-body').innerHTML =
        '<div class="co-success">' +
        '<svg class="check-circle" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36"/><path d="M25 41 l11 11 l20 -22"/></svg>' +
        '<h3>' + t('تم الدفع بنجاح', 'Payment successful') + '</h3>' +
        '<p>' + t('شكراً لك! تم استلام طلبك.', 'Thank you! Your order is confirmed.') + '</p>' +
        '<p class="order-no">' + t('رقم الطلب:', 'Order #') + ' ' + orderNo + '</p>' +
        '<button class="btn-rm btn-block-rm" style="margin-top:18px" id="co-done">' + t('تم', 'Done') + '</button>' +
        '<p class="demo-note"><i class="fa-solid fa-circle-info"></i> ' + t('عرض تجريبي — لم يتم خصم أي مبلغ.', 'Demo only — no charge was made.') + '</p></div>';
      setSteps(3);
      document.querySelectorAll('#checkout-modal .co__step').forEach(function (s) { s.classList.add('done'); s.classList.remove('active'); });
      $('#co-done').addEventListener('click', function () { closeModal('#checkout-modal'); });
    }, 1700);
  }

  // ---------- toast ----------
  var toastTimer;
  function toast(msg) {
    var el = $('#toast'); $('#toast-msg').textContent = msg;
    el.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  // ---------- category scroll-spy ----------
  function spyCats() {
    var y = window.scrollY + 150, active = null;
    DATA.categories.forEach(function (cat) {
      var el = document.getElementById(cat.slug);
      if (el && el.getBoundingClientRect().top + window.scrollY <= y) active = cat.slug;
    });
    document.querySelectorAll('.menu-chip').forEach(function (c) {
      var on = c.dataset.target === active;
      c.classList.toggle('active', on);
      if (on) {
        // scroll ONLY the chips bar horizontally — never the page
        var bar = c.parentElement;
        if (bar) bar.scrollTo({ left: c.offsetLeft - bar.clientWidth / 2 + c.offsetWidth / 2, behavior: 'smooth' });
      }
    });
  }

  // ---------- helpers ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- init ----------
  renderChips();
  renderMenu();
  renderSpecialties();
  updateCart();
  if (window.AOS) AOS.refreshHard();
  window.addEventListener('scroll', spyCats, { passive: true });
  document.addEventListener('rimal:lang', function () { renderChips(); renderMenu(); renderSpecialties(); updateCart(); if (window.AOS) AOS.refreshHard(); });

  // demo notice modal — opens on every page load (after the loader fades)
  window.addEventListener('load', function () {
    setTimeout(function () { if (document.getElementById('demo-modal')) openModal('#demo-modal'); }, 700);
  });
})();
