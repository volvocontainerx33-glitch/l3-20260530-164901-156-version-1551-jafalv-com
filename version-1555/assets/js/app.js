(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
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
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function initFilters() {
        var panel = qs('[data-filter-panel]');
        var grid = qs('[data-filter-grid]');
        if (!panel || !grid) {
            return;
        }
        var search = qs('[data-filter-search]', panel);
        var region = qs('[data-filter-region]', panel);
        var type = qs('[data-filter-type]', panel);
        var year = qs('[data-filter-year]', panel);
        var category = qs('[data-filter-category]', panel);
        var empty = qs('[data-empty-state]');
        var initialSearch = getQueryValue('search');
        if (search && initialSearch) {
            search.value = initialSearch;
        }
        function apply() {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var categoryValue = category ? category.value : '';
            var visible = 0;
            qsa('[data-card]', grid).forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (regionValue && card.getAttribute('data-region') !== regionValue) {
                    ok = false;
                }
                if (typeValue && card.getAttribute('data-type') !== typeValue) {
                    ok = false;
                }
                if (yearValue && card.getAttribute('data-year') !== yearValue) {
                    ok = false;
                }
                if (categoryValue && card.getAttribute('data-category') !== categoryValue) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('visible', visible === 0);
            }
        }
        [search, region, type, year, category].forEach(function (node) {
            if (!node) {
                return;
            }
            node.addEventListener('input', apply);
            node.addEventListener('change', apply);
        });
        apply();
    }

    window.initializeVideoPlayer = function (videoId, streamUrl) {
        var video = document.getElementById(videoId);
        if (!video || !streamUrl) {
            return;
        }
        var shell = document.querySelector('[data-player-shell="' + videoId + '"]');
        var button = document.querySelector('[data-player-start="' + videoId + '"]');
        var loaded = false;
        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function play() {
            attach();
            if (shell) {
                shell.classList.add('playing');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }
        if (shell) {
            shell.addEventListener('click', function (event) {
                if (event.target === button || button && button.contains(event.target)) {
                    return;
                }
                if (!loaded) {
                    play();
                }
            });
        }
        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('playing');
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
}());
