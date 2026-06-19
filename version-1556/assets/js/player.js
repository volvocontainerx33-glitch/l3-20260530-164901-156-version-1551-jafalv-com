(function () {
  window.startMoviePlayer = function (sourceUrl) {
    const video = document.getElementById('movie-video');
    const cover = document.getElementById('player-cover');

    if (!video || !cover || !sourceUrl) {
      return;
    }

    let attached = false;

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    }

    function playVideo() {
      attachSource();
      cover.classList.add('is-hidden');
      video.controls = true;
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    cover.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  };
})();
