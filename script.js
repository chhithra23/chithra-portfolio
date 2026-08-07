(function () {
  var track = document.getElementById('track');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var bnThumbs = document.getElementById('bnThumbs');
  var rail = document.getElementById('rail');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var current = 0;

  // Build bottom thumbnail nav + left rail dots from slide data attributes
  slides.forEach(function (slide, i) {
    var num = slide.getAttribute('data-index') || String(i).padStart(2, '0');
    var label = slide.getAttribute('data-title') || 'Section';

    var thumb = document.createElement('button');
    thumb.className = 'bn-thumb';
    thumb.setAttribute('aria-label', 'Go to ' + label);
    thumb.innerHTML =
      '<span class="bn-thumb-num">' + num + '</span>' +
      '<span class="bn-thumb-label">' + label + '</span>';
    thumb.addEventListener('click', function () { goTo(i); });
    bnThumbs.appendChild(thumb);

    var dot = document.createElement('button');
    dot.className = 'rail-dot';
    dot.setAttribute('aria-label', 'Go to ' + label);
    dot.addEventListener('click', function () { goTo(i); });
    rail.appendChild(dot);
  });

  var thumbEls = Array.prototype.slice.call(bnThumbs.children);
  var dotEls = Array.prototype.slice.call(rail.children);

  function setActive(i) {
    current = i;
    thumbEls.forEach(function (el, idx) { el.classList.toggle('active', idx === i); });
    dotEls.forEach(function (el, idx) { el.classList.toggle('active', idx === i); });
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === slides.length - 1;

    // keep active thumbnail in view within the scrollable strip
    var activeThumb = thumbEls[i];
    if (activeThumb) {
      var strip = bnThumbs;
      var left = activeThumb.offsetLeft - strip.clientWidth / 2 + activeThumb.clientWidth / 2;
      strip.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  function goTo(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  prevBtn.addEventListener('click', function () { goTo(current - 1); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); });

  document.querySelectorAll('[data-goto]').forEach(function (el) {
    el.addEventListener('click', function () {
      goTo(parseInt(el.getAttribute('data-goto'), 10));
    });
  });

  // Track which slide is in view
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
          var idx = slides.indexOf(entry.target);
          if (idx !== -1) setActive(idx);
        }
      });
    }, { root: track, threshold: [0.55] });
    slides.forEach(function (s) { io.observe(s); });
  }

  setActive(0);

  // Keyboard navigation
  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { goTo(current + 1); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { goTo(current - 1); }
  });

  // Mobile menu button just scrolls to nav slides for now (simple affordance)
  var menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      document.getElementById('bottomNav').scrollIntoView({ block: 'end' });
    });
  }
})();
