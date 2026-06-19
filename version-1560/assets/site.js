(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function imageFallback() {
    $all("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.opacity = "0";
      }, { once: true });
    });
  }

  function mobileMenu() {
    var toggle = $("[data-menu-toggle]");
    var menu = $("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function heroCarousel() {
    var slides = $all("[data-hero-slide]");
    var dots = $all("[data-hero-dot]");
    var previous = $("[data-hero-prev]");
    var next = $("[data-hero-next]");
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
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
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
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    start();
  }

  function initPlayers() {
    $all(".player-box").forEach(function (player) {
      var video = $("video", player);
      var button = $(".play-overlay", player);
      var message = $(".player-message", player);
      var streamUrl = player.getAttribute("data-hls");
      var hlsInstance = null;
      var loaded = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function load() {
        if (!video || !streamUrl) {
          setMessage("暂时无法播放，请稍后再试");
          return;
        }
        if (loaded) {
          video.play().catch(function () {
            setMessage("请再次点击播放");
          });
          return;
        }
        loaded = true;
        player.classList.add("is-ready");
        setMessage("");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          video.play().catch(function () {
            setMessage("请再次点击播放");
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setMessage("请再次点击播放");
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("暂时无法播放，请稍后再试");
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
            }
          });
          return;
        }

        setMessage("暂时无法播放，请稍后再试");
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          load();
        });
      }
      player.addEventListener("click", function (event) {
        if (event.target === player) {
          load();
        }
      });
    });
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\">" +
        "<a class=\"card-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
          "<figure class=\"poster-frame\">" +
            "<span class=\"cover-letter\">" + escapeHtml(String(movie.title || "").slice(0, 1)) + "</span>" +
            "<img onerror=\"this.style.opacity='0'\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>" +
          "</figure>" +
          "<div class=\"card-body\">" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "<h2>" + escapeHtml(movie.title) + "</h2>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"meta-row\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
          "</div>" +
        "</a>" +
      "</article>";
  }

  function searchPage() {
    var form = $("[data-search-form]");
    var results = $("[data-search-results]");
    var status = $("[data-search-status]");
    if (!form || !results || !window.MOVIE_INDEX) {
      return;
    }
    var input = form.elements.q;
    var type = form.elements.type;
    var year = form.elements.year;
    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) {
      input.value = params.get("q");
    }

    function apply() {
      var keyword = (input.value || "").trim().toLowerCase();
      var selectedType = type.value;
      var selectedYear = year.value;
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
        var hitKeyword = !keyword || text.indexOf(keyword) !== -1;
        var hitType = !selectedType || String(movie.type || "").indexOf(selectedType) !== -1;
        var hitYear = !selectedYear || String(movie.year || "").indexOf(selectedYear) !== -1;
        return hitKeyword && hitType && hitYear;
      }).slice(0, 120);

      results.innerHTML = matched.map(renderSearchCard).join("");
      if (status) {
        status.textContent = matched.length ? "已显示相关影片" : "没有找到匹配影片";
      }
      imageFallback();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    input.addEventListener("input", apply);
    type.addEventListener("change", apply);
    year.addEventListener("change", apply);
    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    imageFallback();
    mobileMenu();
    heroCarousel();
    initPlayers();
    searchPage();
  });
})();
