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

  $(function () {
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
