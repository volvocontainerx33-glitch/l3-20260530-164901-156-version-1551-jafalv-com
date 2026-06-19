(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
    menu.querySelectorAll("[data-mobile-link]").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        document.body.classList.remove("menu-open");
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var category = panel.querySelector("[data-filter-category]");
    var reset = panel.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
    var empty = document.querySelector("[data-no-results]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function matchYear(value, mode) {
      var number = parseInt(value, 10);
      if (!mode) {
        return true;
      }
      if (mode === "2020") {
        return number >= 2020;
      }
      if (mode === "2010") {
        return number >= 2010 && number <= 2019;
      }
      if (mode === "2000") {
        return number >= 2000 && number <= 2009;
      }
      if (mode === "old") {
        return number > 0 && number < 2000;
      }
      return true;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";
      var selectedCategory = category ? category.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title || "",
          card.dataset.type || "",
          card.dataset.category || "",
          card.dataset.region || "",
          card.dataset.year || ""
        ].join(" ").toLowerCase();
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (selectedType && card.dataset.type !== selectedType) {
          ok = false;
        }
        if (selectedCategory && card.dataset.category !== selectedCategory) {
          ok = false;
        }
        if (!matchYear(card.dataset.year || "", selectedYear)) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, type, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (category) {
          category.value = "";
        }
        apply();
      });
    }
    apply();
  }

  function bindPlayer(source) {
    var wrap = document.querySelector("[data-player-wrap]");
    var video = document.querySelector("#movie-player");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-play-button]");
    if (!wrap || !video || !source) {
      return;
    }
    var hls = null;

    function ensureSource() {
      if (video.dataset.ready === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 60,
          backBufferLength: 60
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.dataset.ready = "1";
    }

    function start() {
      ensureSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }
    video.addEventListener("click", function () {
      if (video.dataset.ready !== "1") {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
  });

  window.MovieSite = {
    bindPlayer: bindPlayer
  };
})();
