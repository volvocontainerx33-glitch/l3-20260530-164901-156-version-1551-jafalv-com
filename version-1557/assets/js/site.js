(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }

      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          play();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          play();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          play();
        });
      });
      show(0);
      play();
    }

    document.querySelectorAll('.search-panel').forEach(function (panel) {
      var input = panel.querySelector('.movie-search');
      var select = panel.querySelector('.movie-type-filter');
      var clear = panel.querySelector('.clear-filter');
      var area = panel.parentElement;
      var cards = [];
      while (area && !cards.length) {
        cards = Array.prototype.slice.call(area.parentElement ? area.parentElement.querySelectorAll('.movie-card') : document.querySelectorAll('.movie-card'));
        break;
      }
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var q = normalize(input ? input.value : '');
        var type = normalize(select ? select.value : '');
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type')
          ].join(' '));
          var cardType = normalize(card.getAttribute('data-type'));
          var matched = (!q || haystack.indexOf(q) !== -1) && (!type || cardType.indexOf(type) !== -1);
          card.classList.toggle('is-hidden', !matched);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
      if (clear) {
        clear.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (select) {
            select.value = '';
          }
          apply();
        });
      }
    });
  });
})();

function initVideoPlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var startButton = document.getElementById('player-start');
  var box = document.getElementById('player-box');
  if (!video || !startButton || !streamUrl) {
    return;
  }

  var hlsInstance = null;

  function attachStream() {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    video.setAttribute('data-ready', '1');
    video.controls = true;
  }

  function startPlay() {
    attachStream();
    startButton.classList.add('is-hidden');
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        startButton.classList.remove('is-hidden');
      });
    }
  }

  startButton.addEventListener('click', function (event) {
    event.preventDefault();
    startPlay();
  });

  if (box) {
    box.addEventListener('click', function (event) {
      if (event.target === box) {
        startPlay();
      }
    });
  }

  video.addEventListener('click', function () {
    if (video.getAttribute('data-ready') !== '1') {
      startPlay();
    }
  });

  video.addEventListener('emptied', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
