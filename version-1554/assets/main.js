(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) return;
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === active);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5000);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          if (timer) window.clearInterval(timer);
          show(i);
          start();
        });
      });

      show(0);
      start();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchItems = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
    if (searchInput && searchItems.length) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      if (searchInput.hasAttribute('data-query-sync') && initial) {
        searchInput.value = initial;
      }

      function applySearch() {
        var query = searchInput.value.trim().toLowerCase();
        searchItems.forEach(function (item) {
          var text = (item.getAttribute('data-search-text') || item.textContent || '').toLowerCase();
          item.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
        });
      }

      searchInput.addEventListener('input', applySearch);
      applySearch();
    }
  });

  window.SitePlayer = {
    mount: function (videoId, buttonId, source) {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);
      if (!video || !button || !source) return;

      var attached = false;
      var hls = null;

      function attach() {
        if (attached) return;
        attached = true;
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }

        video.src = source;
      }

      function play() {
        attach();
        button.classList.add('is-hidden');
        video.play().catch(function () {});
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
  };
})();
