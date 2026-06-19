document.addEventListener('DOMContentLoaded', function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (panel) {
    var video = panel.querySelector('video[data-src]');
    var trigger = panel.querySelector('[data-player-trigger]');
    var hasInitialized = false;
    var hlsInstance = null;

    function playVideo() {
      if (!video) {
        return;
      }

      var source = video.dataset.src;

      if (!source) {
        return;
      }

      if (!hasInitialized) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        hasInitialized = true;
      }

      panel.classList.add('is-playing');
      video.play().catch(function () {});
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    panel.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }

      if (!hasInitialized) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
