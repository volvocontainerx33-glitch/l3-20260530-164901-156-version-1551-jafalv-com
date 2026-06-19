document.addEventListener('DOMContentLoaded', function () {
  initializeMobileMenu();
  initializeHeroCarousel();
  initializeFilters();
});

function initializeMobileMenu() {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? '×' : '☰';
  });
}

function initializeHeroCarousel() {
  var carousel = document.querySelector('[data-hero-carousel]');

  if (!carousel) {
    return;
  }

  var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
  var previous = carousel.querySelector('[data-hero-prev]');
  var next = carousel.querySelector('[data-hero-next]');
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function schedule() {
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(activeIndex - 1);
      schedule();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(activeIndex + 1);
      schedule();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.dataset.heroDot || 0));
      schedule();
    });
  });

  carousel.addEventListener('mouseenter', function () {
    window.clearInterval(timer);
  });

  carousel.addEventListener('mouseleave', schedule);

  showSlide(0);
  schedule();
}

function initializeFilters() {
  var toolbar = document.querySelector('[data-filter-toolbar]');
  var list = document.querySelector('[data-filter-list]');

  if (!toolbar || !list) {
    return;
  }

  var input = toolbar.querySelector('[data-filter-input]');
  var regionSelect = toolbar.querySelector('[data-filter-region]');
  var yearSelect = toolbar.querySelector('[data-filter-year]');
  var typeSelect = toolbar.querySelector('[data-filter-type]');
  var count = toolbar.querySelector('[data-result-count]');
  var cards = Array.prototype.slice.call(list.querySelectorAll('.filter-card'));
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  if (input && initialQuery) {
    input.value = initialQuery;
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    var query = normalize(input ? input.value : '');
    var region = normalize(regionSelect ? regionSelect.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.dataset.search || card.textContent);
      var cardRegion = normalize(card.dataset.region);
      var cardYear = normalize(card.dataset.year);
      var cardType = normalize(card.dataset.type);
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesRegion = !region || cardRegion === region;
      var matchesYear = !year || cardYear === year;
      var matchesType = !type || cardType === type;
      var shouldShow = matchesQuery && matchesRegion && matchesYear && matchesType;

      card.classList.toggle('is-hidden', !shouldShow);

      if (shouldShow) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = String(visible);
    }
  }

  [input, regionSelect, yearSelect, typeSelect].forEach(function (control) {
    if (!control) {
      return;
    }

    control.addEventListener('input', applyFilter);
    control.addEventListener('change', applyFilter);
  });

  applyFilter();
}
