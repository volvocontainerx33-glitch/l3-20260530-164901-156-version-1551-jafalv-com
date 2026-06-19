(function () {
  const toggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let currentSlide = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
      dot.setAttribute('aria-selected', dotIndex === currentSlide ? 'true' : 'false');
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          showSlide(currentSlide + 1);
        }, 5200);
      });
    });

    timer = setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  const filterForms = Array.from(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    const scopeSelector = form.getAttribute('data-filter-form');
    const scope = document.querySelector(scopeSelector);
    const cards = scope ? Array.from(scope.querySelectorAll('.movie-card')) : [];
    const search = form.querySelector('[data-filter-keyword]');
    const year = form.querySelector('[data-filter-year]');
    const region = form.querySelector('[data-filter-region]');
    const empty = document.querySelector(form.getAttribute('data-empty-target') || '');

    function applyFilter() {
      const keyword = search ? search.value.trim().toLowerCase() : '';
      const yearValue = year ? year.value : '';
      const regionValue = region ? region.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = card.getAttribute('data-filter') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const cardRegion = card.getAttribute('data-region') || '';
        const okKeyword = !keyword || text.indexOf(keyword) !== -1;
        const okYear = !yearValue || cardYear === yearValue;
        const okRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
        const shouldShow = okKeyword && okYear && okRegion;

        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    ['input', 'change', 'submit'].forEach(function (eventName) {
      form.addEventListener(eventName, function (event) {
        if (eventName === 'submit') {
          event.preventDefault();
        }
        applyFilter();
      });
    });

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && search) {
      search.value = q;
      applyFilter();
    }
  });
})();
