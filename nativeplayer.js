/* ====================================================================
   PLAYER PROPRIO (LibVLC) - ponte entre o <video> da pagina e o player nativo do app

   Quando o app roda dentro do APK com o player nativo (window.AndroidPlayer), o elemento <video>
   deixa de usar o decodificador do aparelho/WebView: ele passa a "falar" com o LibVLC embutido no app.
   O resto do app (app.js / youtube.js) nao muda: continua usando v.play(), v.pause(), v.currentTime,
   v.duration, v.playbackRate e os eventos (playing, waiting, timeupdate, ended, error...).

   O video aparece ATRAS da pagina: a pagina fica transparente (html.native-on) e, na janelinha da
   tela de detalhes, abre-se um "buraco" (clip-path) no fundo para o video aparecer.

   Se o player nativo nao estiver disponivel (abrindo no navegador do PC, por exemplo), este arquivo
   nao faz nada e o app usa o <video> normal + hls.js.
   ==================================================================== */
(function () {
    'use strict';

    var B = window.AndroidPlayer, avail = false;
    try { avail = !!(B && B.isAvailable()); } catch (e) {}
    var v = document.getElementById('video-player');
    if (!avail || !v) return;

    // O LibVLC toca HLS/TS/MP4 sozinho: o hls.js nao e necessario (e o app.js cai direto no "player nativo")
    window.Hls = { isSupported: function () { return false; } };

    var html = document.documentElement;
    html.classList.add('native-player');

    function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
    function fire(n) { try { v.dispatchEvent(new Event(n)); } catch (e) {} }
    function bridge(fn) { try { fn(); } catch (e) {} }

    function fresh() {
        return {
            src: '', loaded: false, paused: true, ended: false, started: false, buffering: false,
            time: 0, at: 0, seekAt: 0, dur: NaN, err: null, metaDone: false, startedAt: 0
        };
    }
    var st = fresh();
    var rate = 1, muted = false, vol = 1, nextAudio = '', nextMaxH = 0, rectKey = '', timer = null, mo = null;

    function curTime() {
        var t = st.time;
        if (st.loaded && st.started && !st.paused && !st.buffering && !st.ended) t += (now() - st.at) / 1000 * rate;
        if (isFinite(st.dur) && t > st.dur) t = st.dur;
        return t;
    }

    function def(name, get, set) {
        try { Object.defineProperty(v, name, { configurable: true, get: get, set: set }); } catch (e) {}
    }

    def('src', function () { return st.src; }, function (u) { setSrc(u); });
    def('currentSrc', function () { return st.src; });
    def('currentTime', curTime, function (t) { seek(t); });
    def('duration', function () { return st.dur; });
    def('paused', function () { return st.paused; });
    def('ended', function () { return st.ended; });
    def('readyState', function () { return st.started ? 4 : (st.loaded ? 1 : 0); });
    def('networkState', function () { return st.loaded ? 2 : 0; });
    def('error', function () { return st.err; });
    def('videoWidth', function () { return 0; });
    def('videoHeight', function () { return 0; });
    def('volume', function () { return vol; }, function (x) { vol = Math.max(0, Math.min(1, +x || 0)); });
    def('muted', function () { return muted; }, function (m) {
        m = !!m;
        if (m === muted) return;
        muted = m;
        bridge(function () { B.setMuted(muted); });
    });
    def('playbackRate', function () { return rate; }, function (r) {
        r = +r;
        if (!(r > 0) || r === rate) return;
        rate = r;
        if (st.loaded && st.started) { st.time = curTime(); st.at = now(); }
        bridge(function () { B.setRate(rate); });
        fire('ratechange');
    });

    v.play = function () {
        if (st.loaded && (st.paused || st.ended)) {
            st.paused = false;
            if (st.ended) { st.ended = false; st.time = 0; }
            st.at = now();
            bridge(function () { B.play(); });
            fire('play');
        }
        return Promise.resolve();
    };

    v.pause = function () {
        if (st.loaded && !st.paused) {
            st.time = curTime();
            st.paused = true;
            bridge(function () { B.pause(); });
            fire('pause');
        }
    };

    // load(): como o src ja carrega sozinho, so serve para "esvaziar" quando nao ha src
    v.load = function () {
        if (!st.src) stopNative();
    };

    var origRemove = v.removeAttribute, origSet = v.setAttribute;
    v.removeAttribute = function (name) {
        if (String(name).toLowerCase() === 'src') { stopNative(); return; }
        return origRemove.apply(v, arguments);
    };
    v.setAttribute = function (name, value) {
        if (String(name).toLowerCase() === 'src') { setSrc(value); return; }
        return origSet.apply(v, arguments);
    };

    function setSrc(u) {
        u = String(u == null ? '' : u);
        if (!u) { stopNative(); return; }
        var audio = nextAudio, maxH = nextMaxH;
        nextAudio = '';
        nextMaxH = 0;
        st = fresh();
        st.src = u;
        st.loaded = true;
        st.paused = false;           // o <video> tem autoplay
        html.classList.add('native-on');
        bridge(function () { B.load(u, audio, maxH); });
        startTimers();
        sync(true);
        var mine = st;
        setTimeout(function () {
            if (st !== mine) return;
            fire('loadstart');
            fire('play');
        }, 0);
    }

    function stopNative() {
        st = fresh();
        nextAudio = '';
        nextMaxH = 0;
        bridge(function () { B.stop(); });
        html.classList.remove('native-on');
        clearHole();
        stopTimers();
        rectKey = '';
    }

    function seek(t) {
        t = +t;
        if (!st.loaded || !isFinite(t)) return;
        if (t < 0) t = 0;
        st.time = t;
        st.at = now();
        st.seekAt = st.at;
        st.ended = false;
        bridge(function () { B.seek(Math.round(t * 1000)); });
        fire('seeking');
        var mine = st;
        setTimeout(function () {
            if (st !== mine) return;
            fire('seeked');
            fire('timeupdate');
        }, 250);
    }

    function maybeMeta() {
        if (st.metaDone || !st.started) return;
        var known = isFinite(st.dur) && st.dur > 0;
        if (known || now() - st.startedAt > 3000) {
            st.metaDone = true;
            if (!known) st.dur = Infinity;     // sem duracao = ao vivo
            fire('loadedmetadata');
            fire('durationchange');
            fire('canplay');
        }
    }

    // ---------------------------------------------------------------- eventos que vem do Java
    window.__np = {
        ev: function (name, arg) {
            if (!st.loaded) return;
            switch (name) {
                case 'playing':
                    if (!st.started) { st.started = true; st.startedAt = now(); }
                    st.buffering = false;
                    st.ended = false;
                    st.at = now();
                    sync(true);
                    fire('playing');
                    maybeMeta();
                    break;
                case 'buffering':
                    if (!st.started) break;
                    if (+arg < 100) {
                        if (!st.buffering) { st.time = curTime(); st.buffering = true; fire('waiting'); }
                    } else if (st.buffering) {
                        st.buffering = false;
                        st.at = now();
                        fire('playing');
                    }
                    break;
                case 'pause':
                    if (!st.paused && !st.ended) { st.time = curTime(); st.paused = true; fire('pause'); }
                    break;
                case 'ended':
                    st.ended = true;
                    if (isFinite(st.dur)) st.time = st.dur;
                    fire('timeupdate');
                    if (!st.paused) { st.paused = true; fire('pause'); }
                    fire('ended');
                    break;
                case 'error':
                    st.err = { code: 4, message: 'player nativo' };
                    fire('error');
                    break;
            }
        },
        tick: function (t, len, playing) {
            if (!st.loaded) return;
            var seeking = now() - st.seekAt < 700;      // logo depois de pular, ignora o tempo antigo
            if (!seeking) { st.time = t / 1000; st.at = now(); }
            if (len > 0) {
                var d = len / 1000;
                if (d !== st.dur) { st.dur = d; if (st.metaDone) fire('durationchange'); }
            }
            maybeMeta();
            if (playing && !st.paused && !seeking) fire('timeupdate');
        }
    };

    // ---------------------------------------------------------------- posicao do video na tela
    // O video nativo fica atras da pagina; aqui o Java recebe onde o <video> esta (em pixels da tela).
    function clearHole() {
        var root = document.getElementById('vod-root');
        if (root) { root.style.webkitClipPath = ''; root.style.clipPath = ''; }
    }

    function sync(force) {
        if (!st.loaded) return;
        if (force) rectKey = '';
        var cs = window.getComputedStyle(v);
        var r = v.getBoundingClientRect();
        var s = (typeof stage !== 'undefined' && stage && stage.s) ? stage.s : 1;
        var bl = (parseFloat(cs.borderLeftWidth) || 0) * s, bt = (parseFloat(cs.borderTopWidth) || 0) * s;
        var d = window.devicePixelRatio || 1;
        var ix = r.left + bl, iy = r.top + bt, iw = r.width - 2 * bl, ih = r.height - 2 * bt;
        var vis = cs.display !== 'none' && cs.visibility !== 'hidden' && iw > 2 && ih > 2 &&
                  r.bottom > 0 && r.top < window.innerHeight;
        var fit = cs.objectFit === 'cover' ? 'cover' : 'contain';
        var key = [Math.round(ix * d), Math.round(iy * d), Math.round(iw * d), Math.round(ih * d), fit, vis ? 1 : 0].join(',');
        if (key !== rectKey) {
            rectKey = key;
            bridge(function () { B.setRect(Math.round(ix * d), Math.round(iy * d), Math.round(iw * d), Math.round(ih * d), fit, vis); });
        }
        // janelinha da tela de detalhes: abre um buraco no fundo da tela de filmes/series para o video aparecer
        var root = document.getElementById('vod-root');
        if (root) {
            if (vis && v.classList.contains('vod-window')) {
                var L = (ix - stage.x) / s, T = (iy - stage.y) / s, R = L + iw / s, Bt = T + ih / s;
                var W = root.offsetWidth, H = root.offsetHeight;
                var p = 'polygon(evenodd,0px 0px,' + W + 'px 0px,' + W + 'px ' + H + 'px,0px ' + H + 'px,0px 0px,' +
                        L + 'px ' + T + 'px,' + R + 'px ' + T + 'px,' + R + 'px ' + Bt + 'px,' + L + 'px ' + Bt + 'px,' + L + 'px ' + T + 'px)';
                if (root.style.clipPath !== p) { root.style.webkitClipPath = p; root.style.clipPath = p; }
            } else if (root.style.clipPath || root.style.webkitClipPath) {
                root.style.webkitClipPath = '';
                root.style.clipPath = '';
            }
        }
    }

    function startTimers() {
        if (!timer) timer = setInterval(function () { sync(false); }, 250);
        if (!mo && window.MutationObserver) {
            mo = new MutationObserver(function () { sync(false); });
            mo.observe(v, { attributes: true, attributeFilter: ['class', 'style'] });
        }
    }
    function stopTimers() {
        if (timer) { clearInterval(timer); timer = null; }
        if (mo) { mo.disconnect(); mo = null; }
    }
    window.addEventListener('resize', function () { sync(true); });

    // Pagina saindo/recarregando (Voltar da TV para a tela inicial): para o player nativo, senao o canal continua tocando atras
    function stopOnLeave() { if (st.loaded) stopNative(); }
    window.addEventListener('pagehide', stopOnLeave);
    window.addEventListener('beforeunload', stopOnLeave);

    // ---------------------------------------------------------------- usado pelo youtube.js e pelo menu de ajustes
    window.NativeVideo = {
        // audio separado (YouTube em alta qualidade): vale para o proximo v.src
        setAudio: function (url) { nextAudio = url || ''; },
        // altura maxima (ex.: 480) para o proximo v.src; vale tambem para HLS ao vivo (o player escolhe a variante ate essa altura)
        setMaxHeight: function (h) { nextMaxH = parseInt(h, 10) || 0; },
        decoder: function () { try { return String(B.getDecoder()); } catch (e) { return 'soft'; } },
        toggleDecoder: function () {
            var n = this.decoder() === 'hw' ? 'soft' : 'hw';
            bridge(function () { B.setDecoder(n); });
            return n;
        }
    };
})();
