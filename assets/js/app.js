/* مطاعم الرمال — app.js
   Site chrome: loader, sticky nav, smooth scroll, AOS, language toggle, mobile menu.
   jQuery-based to match the benaa-arch.sa public convention. */
(function ($) {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- AOS scroll animations ----
  if (window.AOS) {
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60, disable: reduceMotion });
  }

  // ---- Loader ----
  $(window).on('load', function () {
    document.body.classList.add('loaded');
  });
  // safety: never trap the user behind the loader
  setTimeout(function () { document.body.classList.add('loaded'); }, 2500);

  // ---- Apply per-client config (config.js) BEFORE language is applied ----
  function cfgI18n(el, o) { if (el && o) { el.setAttribute('data-ar', o.ar); el.setAttribute('data-en', o.en); } }
  function cfgHref(el, url) { if (el && url) el.setAttribute('href', url); }
  function applyConfig() {
    var cfg = window.SITE_CONFIG; if (!cfg) return;
    var root = document.documentElement;
    // colours
    if (cfg.colors) Object.keys(cfg.colors).forEach(function (k) { root.style.setProperty('--' + k, cfg.colors[k]); });
    // logo + title
    document.querySelectorAll('.navbar-rm__brand img, .footer-brand img').forEach(function (img) { if (cfg.logo) img.src = cfg.logo; });
    if (cfg.name) document.title = cfg.name.ar + ' | ' + cfg.name.en;
    // navbar brand text
    var bn = document.querySelector('.navbar-rm__brand .b-name'); if (bn && cfg.name) bn.textContent = cfg.name.ar;
    var bs = document.querySelector('.navbar-rm__brand .b-sub'); if (bs && cfg.brandSub) bs.textContent = cfg.brandSub;
    // hero title (accent on last word)
    var htitle = document.querySelector('.hero__title');
    if (htitle && cfg.name) { var p = String(cfg.name.ar).split(' '); htitle.innerHTML = p.length > 1 ? (p.slice(0, -1).join(' ') + ' <span class="accent">' + p.slice(-1)[0] + '</span>') : cfg.name.ar; }
    cfgI18n(document.querySelector('.hero__eyebrow span[data-ar]'), cfg.eyebrow);
    cfgI18n(document.querySelector('.hero__tagline'), cfg.tagline);
    // rating
    if (cfg.rating) { var rb = document.querySelector('.hero__rating b'); if (rb) rb.textContent = cfg.rating.value; cfgI18n(document.querySelector('.hero__rating span[data-ar]'), { ar: 'من ' + cfg.rating.count + ' تقييم', en: 'from ' + cfg.rating.count + ' reviews' }); }
    // WhatsApp links (all except the developer link inside the demo modal)
    if (cfg.whatsapp) document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) { if (a.closest('#demo-modal')) return; a.href = a.getAttribute('href').replace(/wa\.me\/\d+/, 'wa.me/' + cfg.whatsapp); });
    // phones
    var tp = document.getElementById('topbar-phone-link'); if (tp && cfg.whatsapp) tp.href = 'tel:+' + cfg.whatsapp;
    var tpt = document.getElementById('topbar-phone'); if (tpt && cfg.whatsapp) tpt.textContent = '+' + cfg.whatsapp.replace(/^(\d{3})(\d{2})(\d{3})(\d{4})$/, '$1 $2 $3 $4');
    var lp = document.getElementById('loc-phones'); if (lp && cfg.phones) lp.textContent = cfg.phones.join(' · ');
    // address + map
    cfgI18n(document.getElementById('loc-address'), cfg.address);
    if (cfg.map) { var lm = document.getElementById('loc-map'); if (lm) lm.setAttribute('data-map', 'https://www.google.com/maps?q=' + encodeURIComponent(cfg.map.query) + '&output=embed'); cfgHref(document.getElementById('loc-map-link'), cfg.map.link); }
    // hours table (rows are Sun..Sat in order)
    var htab = document.getElementById('hours-table');
    if (htab && cfg.hours) Array.prototype.forEach.call(htab.querySelectorAll('tr'), function (tr, i) { var h = cfg.hours[i]; if (!h) return; var td = tr.querySelectorAll('td'); if (td[0]) { td[0].setAttribute('data-ar', h.ar); td[0].setAttribute('data-en', h.en); } if (td[1]) td[1].textContent = h.time; });
    // social
    if (cfg.social) { cfgHref(document.querySelector('.footer-social a[aria-label="Instagram"]'), cfg.social.instagram); cfgHref(document.querySelector('.footer-social a[aria-label="Snapchat"]'), cfg.social.snapchat); cfgHref(document.querySelector('.footer-social a[aria-label="Facebook"]'), cfg.social.facebook); }
    // delivery cards (matched by img alt)
    if (cfg.delivery) document.querySelectorAll('.delivery-card').forEach(function (a) { var img = a.querySelector('img'); if (!img) return; var key = (img.alt || '').toLowerCase(); if (cfg.delivery[key]) a.href = cfg.delivery[key]; });
    // app badges
    if (cfg.apps) { var badges = document.querySelectorAll('.app-badge'); if (badges[0]) badges[0].href = cfg.apps.googlePlay; if (badges[1]) badges[1].href = cfg.apps.appStore; }
    // demo modal content
    if (cfg.demo) {
      cfgI18n(document.querySelector('.demo-by'), { ar: 'تصميم وتطوير: ' + cfg.demo.dev.ar, en: 'Designed & developed by ' + cfg.demo.dev.en });
      var dwa = document.querySelector('#demo-modal a[href*="wa.me"]'); if (dwa) { dwa.href = 'https://wa.me/' + cfg.demo.whatsapp; var ds = dwa.querySelector('span'); if (ds) ds.textContent = cfg.demo.whatsapp.replace(/^966/, '0'); }
      var dem = document.querySelector('#demo-modal a[href^="mailto"]'); if (dem) { dem.href = 'mailto:' + cfg.demo.email; var es = dem.querySelector('span'); if (es) es.textContent = cfg.demo.email; }
    }
  }

  $(function () {
    applyConfig();

    var $nav = $('#navbar');
    var sections = ['#menu', '#specialties', '#about', '#location', '#contact'];

    // ---- Nav scroll-spy (defined before first use) ----
    function spyNav() {
      var y = window.scrollY + 120, current = '';
      sections.forEach(function (s) {
        var el = document.querySelector(s);
        if (el && el.offsetTop <= y) current = s;
      });
      $('#nav-links a').each(function () {
        $(this).toggleClass('active', $(this).attr('href') === current);
      });
    }

    // ---- Sticky navbar ----
    function onScroll() {
      $nav.toggleClass('is-stuck', window.scrollY > 12);
      spyNav();
    }
    $(window).on('scroll', onScroll);
    onScroll();

    // ---- Smooth scroll for .hscroll links (offset for sticky nav) ----
    $(document).on('click', 'a.hscroll', function (e) {
      var id = $(this).attr('href');
      if (!id || id.charAt(0) !== '#') return;
      var $t = $(id);
      if (!$t.length) return;
      e.preventDefault();
      var top = $t.offset().top - 76;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      $('#nav-links').removeClass('open');
    });

    // ---- Mobile menu ----
    $('#nav-toggle').on('click', function () { $('#nav-links').toggleClass('open'); });

    // ---- Lazy map facade (load heavy iframe only on click) ----
    $('#loc-map-load').on('click', function () {
      var w = document.getElementById('loc-map');
      var url = w.getAttribute('data-map');
      w.innerHTML = '<iframe src="' + url + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="map" style="width:100%;height:100%;min-height:380px;border:0;display:block"></iframe>';
    });

    // ---- Language toggle ----
    var lang = localStorage.getItem('site_lang') || 'ar';
    applyLang(lang);
    $('#lang-toggle').on('click', function () {
      applyLang(document.documentElement.lang === 'ar' ? 'en' : 'ar');
    });

    function applyLang(l) {
      var html = document.documentElement;
      html.lang = l;
      html.dir = (l === 'ar') ? 'rtl' : 'ltr';
      var bsRtl = document.getElementById('bs-rtl');
      if (bsRtl) bsRtl.disabled = (l !== 'ar');
      // swap only text-only elements (never wipe elements that contain icons/children)
      document.querySelectorAll('[data-ar][data-en]').forEach(function (el) {
        if (el.children.length === 0) {
          var t = el.getAttribute(l === 'ar' ? 'data-ar' : 'data-en');
          if (t !== null) el.textContent = t;
        }
      });
      // swap localized images (e.g. store badges)
      document.querySelectorAll('img[data-ar-src][data-en-src]').forEach(function (img) {
        img.src = img.getAttribute(l === 'ar' ? 'data-ar-src' : 'data-en-src');
      });
      $('#lang-toggle').text(l === 'ar' ? 'EN' : 'ع');
      localStorage.setItem('site_lang', l);
      document.dispatchEvent(new CustomEvent('site:lang', { detail: l }));
    }
    window.siteLang = function () { return document.documentElement.lang || 'ar'; };
  });
})(jQuery);
