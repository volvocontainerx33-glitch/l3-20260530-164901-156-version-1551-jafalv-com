(function () {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    const search = document.getElementById('site-search');
    const chips = Array.from(document.querySelectorAll('[data-filter]'));
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const empty = document.querySelector('[data-empty]');
    let activeFilter = '';

    function cardText(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
    }

    function applyFilter() {
        const keyword = search ? search.value.trim().toLowerCase() : '';
        let visible = 0;

        cards.forEach(function (card) {
            const content = cardText(card);
            const matchedKeyword = keyword === '' || content.indexOf(keyword) !== -1;
            const matchedFilter = activeFilter === '' || content.indexOf(activeFilter.toLowerCase()) !== -1;
            const matched = matchedKeyword && matchedFilter;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    if (search && cards.length) {
        search.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeFilter = chip.getAttribute('data-filter') || '';
            chips.forEach(function (item) {
                item.classList.toggle('active', item === chip);
            });
            applyFilter();
        });
    });

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        const video = shell.querySelector('video');
        const cover = shell.querySelector('.player-cover');
        const button = shell.querySelector('.play-button');
        let attached = false;
        let hls = null;

        function startPlayback() {
            if (!video) {
                return;
            }

            const stream = video.getAttribute('data-stream');

            if (!stream) {
                return;
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            if (!attached) {
                attached = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new Hls({ enableWorker: true, lowLatencyMode: false });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!attached) {
                    startPlayback();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
})();
