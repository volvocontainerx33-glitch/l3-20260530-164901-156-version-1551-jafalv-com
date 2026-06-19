(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
      navToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var focusTitle = document.querySelector('[data-focus-title]');
    var focusText = document.querySelector('[data-focus-text]');
    var focusImage = document.querySelector('[data-focus-image]');
    var focusLink = document.querySelector('[data-focus-link]');
    var activeIndex = 0;

    function activateSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      activeIndex = nextIndex % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === activeIndex);
      });

      var activeSlide = slides[activeIndex];
      if (focusTitle && activeSlide.dataset.title) {
        focusTitle.textContent = activeSlide.dataset.title;
      }
      if (focusText && activeSlide.dataset.text) {
        focusText.textContent = activeSlide.dataset.text;
      }
      if (focusImage && activeSlide.dataset.image) {
        focusImage.setAttribute('src', activeSlide.dataset.image);
        focusImage.setAttribute('alt', activeSlide.dataset.title || '');
      }
      if (focusLink && activeSlide.dataset.href) {
        focusLink.setAttribute('href', activeSlide.dataset.href);
      }
    }

    if (slides.length) {
      activateSlide(0);
      window.setInterval(function () {
        activateSlide(activeIndex + 1);
      }, 5200);
    }

    var heroForm = document.querySelector('[data-hero-search]');
    if (heroForm) {
      heroForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = heroForm.querySelector('input');
        var query = input ? input.value.trim() : '';
        var target = './search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterYear = document.querySelector('[data-filter-year]');
    var filterType = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function applyQueryFromUrl() {
      if (!filterInput) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        filterInput.value = query;
      }
    }

    function normalize(value) {
      return (value || '').toString().toLowerCase();
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var query = normalize(filterInput && filterInput.value);
      var year = filterYear ? filterYear.value : '';
      var type = filterType ? filterType.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags,
          card.dataset.year
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || card.dataset.year === year;
        var matchType = !type || card.dataset.type === type;
        var show = matchQuery && matchYear && matchType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (filterInput || filterYear || filterType) {
      applyQueryFromUrl();
      [filterInput, filterYear, filterType].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });
      applyFilters();
    }

    var video = document.querySelector('[data-stream]');
    if (video) {
      var playTrigger = document.querySelector('[data-play-trigger]');
      var playCover = document.querySelector('[data-player-cover]');
      var stream = video.getAttribute('data-stream');
      var attached = false;
      var hlsInstance = null;

      function attachStream() {
        if (attached || !stream) {
          return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function startVideo() {
        attachStream();
        video.controls = true;
        if (playCover) {
          playCover.classList.add('is-hidden');
        }
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {});
        }
      }

      if (playTrigger) {
        playTrigger.addEventListener('click', startVideo);
      }

      video.addEventListener('click', function () {
        if (!attached) {
          startVideo();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }
  });
})();
