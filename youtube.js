/* ====================================================================
   YOUTUBE DENTRO DE FILMES E SÉRIES
   - As pastas de Filmes e Séries buscam vídeos do YouTube (sem anúncios),
     usando os servidores Piped/Invidious que ficam no GitHub.
   - O botão "IPTV" (ao lado de Pesquisar e Histórico) abre a lista IPTV embutida.
   - O app abre direto na tela inicial (sem login) e avisa quando há versão nova.
   ==================================================================== */

// Versão deste app. Quando o version.json do GitHub tiver um versionCode MAIOR, aparece o aviso de atualização.
const APP_VERSION_CODE = 1;

// Regras do YouTube (servidores, SponsorBlock, pastas) e verificação de atualização
const YT_RULES_URL = 'https://raw.githubusercontent.com/RicardoDark/tviptvtube-arquivoderegras/refs/heads/main/update.json';
const YT_VERSION_URL = 'https://raw.githubusercontent.com/RicardoDark/tviptvtube/refs/heads/main/version.json';

const YT_RES = 720;                       // qualidade preferida
const YT_TTL = 30 * 60 * 1000;            // guarda cada pasta por 30 min
const YT_SB_CATS = ['sponsor', 'selfpromo', 'interaction', 'intro', 'outro', 'preview'];
const LS_YT_REMOTE = 'iptv_yt_remote';
const LS_YT_CARDS = 'iptv_yt_cards';

// Servidores reserva (usados se o GitHub não responder)
const YT_DEFAULT_SERVERS = [
    { type: 'piped', url: 'https://pipedapi.kavin.rocks' },
    { type: 'piped', url: 'https://pipedapi.leptons.xyz' },
    { type: 'piped', url: 'https://pipedapi.nosebs.ru' },
    { type: 'piped', url: 'https://pipedapi.adminforge.de' },
    { type: 'piped', url: 'https://pipedapi.drgns.space' },
    { type: 'piped', url: 'https://pipedapi.owo.si' },
    { type: 'piped', url: 'https://pipedapi.reallyaweso.me' },
    { type: 'inv', url: 'https://inv.nadeko.net' },
    { type: 'inv', url: 'https://yewtu.be' }
];

// Pastas. tipo: 'movies' (aba FILMES) ou 'series' (aba SERIES).
// min/max = duração em segundos. O GitHub (update.json, campo "secoes") pode trocar a busca ("q") e o "min"
// de qualquer pasta pela "key", ou criar pastas novas (use "tipo": "movies" ou "series").
const YT_FOLDERS = [
    // ---- FILMES ----
    { key: 'filmes', tipo: 'movies', title: 'Filmes | Dublados', q: 'filme completo dublado português', min: 3000 },
    { key: 'acao', tipo: 'movies', title: 'Filmes | Ação', q: 'filme de ação completo dublado', min: 3000 },
    { key: 'comedia', tipo: 'movies', title: 'Filmes | Comédia', q: 'filme de comédia completo dublado', min: 3000 },
    { key: 'terror', tipo: 'movies', title: 'Filmes | Terror', q: 'filme de terror completo dublado', min: 3000 },
    { key: 'drama', tipo: 'movies', title: 'Filmes | Drama', q: 'filme drama completo dublado', min: 3000 },
    { key: 'ficcao', tipo: 'movies', title: 'Filmes | Ficção Científica', q: 'filme ficção científica completo dublado', min: 3000 },
    { key: 'aventura', tipo: 'movies', title: 'Filmes | Aventura', q: 'filme de aventura completo dublado', min: 3000 },
    { key: 'suspense', tipo: 'movies', title: 'Filmes | Suspense', q: 'filme de suspense thriller completo dublado', min: 3000 },
    { key: 'romance', tipo: 'movies', title: 'Filmes | Romance', q: 'filme romance completo dublado', min: 3000 },
    { key: 'faroeste', tipo: 'movies', title: 'Filmes | Faroeste', q: 'filme de faroeste completo dublado', min: 3000 },
    { key: 'guerra', tipo: 'movies', title: 'Filmes | Guerra', q: 'filme de guerra completo dublado', min: 3000 },
    { key: 'policial', tipo: 'movies', title: 'Filmes | Policial', q: 'filme policial crime completo dublado', min: 3000 },
    { key: 'fantasia', tipo: 'movies', title: 'Filmes | Fantasia', q: 'filme de fantasia completo dublado', min: 3000 },
    { key: 'misterio', tipo: 'movies', title: 'Filmes | Mistério', q: 'filme de mistério completo dublado', min: 3000 },
    { key: 'artesmarciais', tipo: 'movies', title: 'Filmes | Artes Marciais', q: 'filme artes marciais kung fu completo dublado', min: 3000 },
    { key: 'animacao', tipo: 'movies', title: 'Filmes | Animação', q: 'filme de animação completo dublado', min: 2400 },
    { key: 'infantil', tipo: 'movies', title: 'Filmes | Infantil e Família', q: 'filme infantil família completo dublado', min: 2400 },
    { key: 'classicos', tipo: 'movies', title: 'Filmes | Clássicos', q: 'filme clássico antigo completo dublado', min: 3000 },
    { key: 'nacionais', tipo: 'movies', title: 'Filmes | Nacionais', q: 'filme nacional brasileiro completo', min: 3000 },
    // ---- SÉRIES ----
    { key: 'animes', tipo: 'series', title: 'Séries | Animes', q: 'anime completo dublado português', min: 1200 },
    { key: 'animesclassicos', tipo: 'series', title: 'Séries | Animes Clássicos', q: 'anime clássico anos 90 episódios dublado', min: 900 },
    { key: 'desenhos', tipo: 'series', title: 'Séries | Desenhos Clássicos', q: 'desenho animado clássico episódios completos dublado', min: 900 },
    { key: 'desinfantil', tipo: 'series', title: 'Séries | Desenhos Infantis', q: 'desenho infantil episódios completos', min: 900 },
    { key: 'novelas', tipo: 'series', title: 'Séries | Novelas', q: 'novela capítulo completo', min: 1500 },
    { key: 'seriescompletas', tipo: 'series', title: 'Séries | Séries Completas', q: 'série completa dublada episódios', min: 1500 },
    { key: 'docs', tipo: 'series', title: 'Séries | Documentários', q: 'documentário completo dublado português', min: 1800 },
    { key: 'animais', tipo: 'series', title: 'Séries | Animais e Vida Selvagem', q: 'documentário animais vida selvagem português', min: 1200 },
    { key: 'natureza', tipo: 'series', title: 'Séries | Natureza', q: 'documentário natureza paisagens português brasil', min: 1200 },
    { key: 'historia', tipo: 'series', title: 'Séries | Documentários de História', q: 'documentário história completo dublado', min: 1800 },
    { key: 'ciencia', tipo: 'series', title: 'Séries | Ciência e Espaço', q: 'documentário espaço universo ciência dublado', min: 1800 },
    { key: 'crimes', tipo: 'series', title: 'Séries | Crimes Reais', q: 'documentário crimes reais completo', min: 1800 },
    { key: 'standup', tipo: 'series', title: 'Séries | Stand-up Comedy', q: 'stand up comedy especial completo', min: 1500 },
    { key: 'clipestop', tipo: 'series', title: 'Clipes | Top Hits Internacionais', q: 'top english hits official music video', min: 120, max: 720 },
    { key: 'clipespop', tipo: 'series', title: 'Clipes | Pop Internacional', q: 'pop official music video english', min: 120, max: 720 },
    { key: 'clipesrock', tipo: 'series', title: 'Clipes | Rock Internacional', q: 'rock official music video english', min: 120, max: 720 },
    { key: 'clipeshiphop', tipo: 'series', title: 'Clipes | Hip Hop e Rap', q: 'hip hop rap official music video english', min: 120, max: 720 },
    { key: 'clipesdance', tipo: 'series', title: 'Clipes | Eletrônica e Dance', q: 'dance electronic official music video', min: 120, max: 720 },
    { key: 'clipescountry', tipo: 'series', title: 'Clipes | Country', q: 'country official music video english', min: 120, max: 720 },
    { key: 'clipes80', tipo: 'series', title: 'Clipes | Anos 80', q: '80s official music video hits', min: 120, max: 720 },
    { key: 'clipes90', tipo: 'series', title: 'Clipes | Anos 90', q: '90s official music video hits', min: 120, max: 720 },
    { key: 'clipes2000', tipo: 'series', title: 'Clipes | Anos 2000', q: '2000s official music video hits', min: 120, max: 720 }
];

const yt = {
    servers: YT_DEFAULT_SERVERS.slice(), key: '', sb: 'https://sponsor.ajay.app',
    folders: [], byTitle: {}, st: {}, list: [], seen: {},
    good: 0, tok: 0, segs: [], dual: false, audio: null,
    remoteP: null, kind: 'movies',
    sq: { state: 'idle' }, sqT: null, sqTok: 0, lastQ: null, lastCards: null
};

/* ---------- utilidades ---------- */
function ytGet(url, ms) {
    return new Promise(function (res, rej) {
        const x = new XMLHttpRequest();
        let fin = false;
        const fail = function (m) { if (fin) return; fin = true; rej(new Error(m)); };
        try { x.open('GET', url, true); } catch (e) { fail(e.message); return; }
        x.timeout = ms || 9000;
        x.onload = function () {
            if (fin) return;
            let j = null;
            try { j = JSON.parse(x.responseText); } catch (e) {}
            if (x.status >= 200 && x.status < 300 && j !== null) { fin = true; res(j); }
            else fail(x.status >= 200 && x.status < 300 ? 'resposta inválida' : 'HTTP ' + x.status);
        };
        x.onerror = function () { fail('falha de rede'); };
        x.ontimeout = function () { fail('demorou demais'); };
        x.send();
    });
}
function ytHost(u) { return String(u || '').replace(/^https?:\/\//, ''); }
function ytIdFromUrl(u) { const m = /[?&]v=([^&]+)/.exec(u || ''); return m ? m[1] : ''; }
function ytThumb(id) { return 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg'; }
function ytViews(n) {
    n = +n;
    if (!n) return '';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + ' mi';
    if (n >= 1e3) return Math.round(n / 1e3) + ' mil';
    return String(n);
}
function ytIsoDur(s) {
    const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(s || '');
    return m ? ((+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0)) : 0;
}
function ytDecode(s) { const t = document.createElement('textarea'); t.innerHTML = s || ''; return t.value; }

/* ---------- regras do GitHub ---------- */
function ytApplyRemote(r) {
    yt.folders = YT_FOLDERS.map(function (f) { return Object.assign({}, f); });
    if (r && typeof r === 'object') {
        if (Array.isArray(r.servidores)) {
            const l = r.servidores.map(function (x) {
                return { type: String((x && (x.tipo || x.type)) || ''), url: String((x && x.url) || '').replace(/\/$/, '') };
            }).filter(function (x) { return (x.type === 'piped' || x.type === 'inv') && /^https?:\/\//.test(x.url); });
            if (l.length) { yt.servers = l; yt.good = 0; }
        }
        if (typeof r.chave_api === 'string' && r.chave_api.trim()) yt.key = r.chave_api.trim();
        if (typeof r.sponsorblock === 'string' && /^https?:\/\//.test(r.sponsorblock)) yt.sb = r.sponsorblock.replace(/\/$/, '');
        if (Array.isArray(r.secoes)) {
            r.secoes.forEach(function (x) {
                if (!x || !x.key || !x.q) return;
                const key = String(x.key).replace(/[^a-z0-9_-]/gi, '');
                const f = yt.folders.filter(function (y) { return y.key === key; })[0];
                if (f) {
                    f.q = String(x.q);
                    if (+x.min) f.min = +x.min;
                    if (+x.max) f.max = +x.max;
                } else if (x.title) {
                    const tp = String(x.tipo || x.type || 'movies') === 'series' ? 'series' : 'movies';
                    yt.folders.push({ key: key, tipo: tp, title: String(x.title), q: String(x.q), min: +x.min || 600, max: +x.max || 0 });
                }
            });
        }
    }
    yt.byTitle = {};
    yt.folders.forEach(function (f) { yt.byTitle[f.title] = f; });
}

function ytLoadRemote() {
    ytApplyRemote(lsGet(LS_YT_REMOTE, null));
    return ytGet(YT_RULES_URL + '?t=' + Date.now(), 4000).then(function (r) {
        if (r && typeof r === 'object') { lsSet(LS_YT_REMOTE, r); ytApplyRemote(r); }
        return true;
    }).catch(function () { return false; });
}

/* ---------- busca e streams (Piped / Invidious / API do YouTube) ---------- */
function ytPick(list, min, max) {
    const seen = {};
    return (list || []).filter(function (x) {
        if (!x || !x.id || seen[x.id]) return false;
        const d = +x.dur || 0;
        if (d < (min || 0)) return false;
        if (max && d > max) return false;
        seen[x.id] = 1;
        return true;
    });
}

const YT_OPS = {
    piped: {
        search: async function (u, a) {
            let out = [], next = null;
            for (let p = 0; p < 4; p++) {
                const url = next
                    ? u + '/nextpage/search?nextpage=' + encodeURIComponent(next) + '&q=' + encodeURIComponent(a.q) + '&filter=videos'
                    : u + '/search?q=' + encodeURIComponent(a.q) + '&filter=videos';
                let res;
                try { res = await ytGet(url); } catch (e) { if (!out.length) throw e; break; }
                const items = (res.items || []).map(function (p) {
                    return { id: ytIdFromUrl(p.url), title: p.title, channel: p.uploaderName, dur: p.duration, views: p.views };
                }).filter(function (x) { return x.id; });
                out = out.concat(items);
                next = res.nextpage;
                if (!next || !items.length || ytPick(out, a.min, a.max).length >= 24) break;
            }
            return out;
        },
        stream: async function (u, id) {
            const d = await ytGet(u + '/streams/' + id, 10000);
            const vs = d.videoStreams || [];
            const H = function (s) { return s.height || parseInt(s.quality, 10) || 0; };
            const mp = function (s) { return /mp4/i.test(s.mimeType || ''); };
            return {
                hls: d.livestream ? (d.hls || null) : null,
                muxed: vs.filter(function (s) { return !s.videoOnly; }).map(function (s) { return { url: s.url, h: H(s), mp4: mp(s) }; }),
                vids: vs.filter(function (s) { return s.videoOnly; }).map(function (s) { return { url: s.url, h: H(s), mp4: mp(s), avc: /^avc/.test(s.codec || '') }; }),
                auds: (d.audioStreams || []).map(function (s) { return { url: s.url, br: s.bitrate || 0, mp4: mp(s) }; })
            };
        }
    },
    inv: {
        search: async function (u, a) {
            let out = [];
            for (let p = 1; p <= 4; p++) {
                let res;
                try { res = await ytGet(u + '/api/v1/search?q=' + encodeURIComponent(a.q) + '&type=video&page=' + p); }
                catch (e) { if (!out.length) throw e; break; }
                const items = (res || []).filter(function (x) { return x.videoId; }).map(function (x) {
                    return { id: x.videoId, title: x.title, channel: x.author, dur: x.lengthSeconds, views: x.viewCount };
                });
                out = out.concat(items);
                if (!items.length || ytPick(out, a.min, a.max).length >= 24) break;
            }
            return out;
        },
        stream: async function (u, id) {
            const d = await ytGet(u + '/api/v1/videos/' + id + '?local=true', 10000);
            const abs = function (x) { return /^https?:/.test(x) ? x : u + x; };
            const ad = d.adaptiveFormats || [];
            return {
                hls: d.liveNow ? (d.hlsUrl || null) : null,
                muxed: (d.formatStreams || []).map(function (s) { return { url: abs(s.url), h: parseInt(s.qualityLabel, 10) || 0, mp4: /mp4/.test(s.type || '') }; }),
                vids: ad.filter(function (s) { return /^video/.test(s.type || ''); }).map(function (s) { return { url: abs(s.url), h: parseInt(s.qualityLabel, 10) || 0, mp4: /mp4/.test(s.type), avc: /avc1/.test(s.type) }; }),
                auds: ad.filter(function (s) { return /^audio/.test(s.type || ''); }).map(function (s) { return { url: abs(s.url), br: +s.bitrate || 0, mp4: /mp4/.test(s.type) }; })
            };
        }
    },
    api: {
        search: async function (u, a) {
            const dur = (a.min || 0) >= 1200 ? 'long' : (a.min || 0) >= 240 ? 'medium' : 'any';
            const base = 'https://www.googleapis.com/youtube/v3';
            const r = await ytGet(base + '/search?part=snippet&type=video&videoEmbeddable=true&videoDuration=' + dur +
                '&maxResults=50&regionCode=BR&q=' + encodeURIComponent(a.q) + '&key=' + encodeURIComponent(yt.key));
            const ids = (r.items || []).map(function (i) { return i.id && i.id.videoId; }).filter(Boolean);
            if (!ids.length) return [];
            const d = await ytGet(base + '/videos?part=snippet,contentDetails,statistics&id=' + ids.join(',') + '&key=' + encodeURIComponent(yt.key));
            return (d.items || []).map(function (v) {
                return {
                    id: v.id, title: ytDecode(v.snippet.title), channel: ytDecode(v.snippet.channelTitle),
                    dur: ytIsoDur(v.contentDetails && v.contentDetails.duration),
                    views: v.statistics && v.statistics.viewCount != null ? +v.statistics.viewCount : 0
                };
            });
        }
    }
};

// Tenta vários servidores quase ao mesmo tempo; vale o primeiro que responder certo.
function ytRace(op, arg, validate) {
    return new Promise(function (res, rej) {
        let list = yt.servers.slice();
        if (op === 'search' && yt.key) list.unshift({ type: 'api', url: '' });
        const n = list.length;
        if (!n) { rej(new Error('nenhum servidor')); return; }
        let done = false, fails = 0;
        const errs = [], timers = [];
        const first = yt.good % n;
        const order = [first].concat(list.map(function (x, i) { return i; }).filter(function (i) { return i !== first; }));
        order.forEach(function (i, k) {
            timers.push(setTimeout(function () {
                if (done) return;
                YT_OPS[list[i].type][op](list[i].url, arg).then(function (r) {
                    if (done) return;
                    if (validate && !validate(r)) throw new Error('sem resultado');
                    done = true;
                    timers.forEach(clearTimeout);
                    yt.good = i;
                    res(r);
                }).catch(function (e) {
                    errs.push((list[i].type === 'api' ? 'YouTube API' : ytHost(list[i].url)) + ': ' + e.message);
                    if (++fails === n && !done) rej(new Error(errs.slice(0, 3).join('\n')));
                });
            }, k * 350));
        });
    });
}

/* ---------- cartões ---------- */
function ytMk(it, group) {
    const id = it.id;
    const dur = +it.dur || 0;
    const plot = (it.channel ? 'Canal: ' + it.channel : '') +
        (it.views ? (it.channel ? '  •  ' : '') + ytViews(it.views) + ' visualizações' : '');
    return {
        key: 'yt:' + id, title: ytDecode(it.title || ''), logo: ytThumb(id), kind: 'movie', group: group,
        url: 'yt:' + id, ytId: id, plot: plot || 'Vídeo do YouTube.', genre: group,
        duration: dur ? fmtTime(dur) : ''
    };
}

// registra o cartão (uma vez por pasta+vídeo) para o app inteiro enxergar
function ytRegister(it, group) {
    const k = group + '|' + it.id;
    if (yt.seen[k]) return yt.seen[k];
    const c = ytMk(it, group);
    yt.seen[k] = c;
    yt.list.push(c);
    if (vod.src === 'yt') {
        vod.cards.push(c);
        if (!vod.byKey[c.key]) vod.byKey[c.key] = c;
    }
    return c;
}

// favoritos e histórico precisam lembrar o cartão para aparecer na próxima abertura
function ytRemember(card) {
    const m = lsGet(LS_YT_CARDS, {});
    m[card.key] = {
        key: card.key, title: card.title, logo: card.logo, kind: 'movie', group: card.group, url: card.url,
        ytId: card.ytId, plot: card.plot, genre: card.genre, duration: card.duration
    };
    const keys = Object.keys(m);
    if (keys.length > 300) {
        const keep = lsGet(favKey(), []).concat(lsGet(histKey(), []));
        keys.forEach(function (k) { if (keep.indexOf(k) === -1 && Object.keys(m).length > 300) delete m[k]; });
    }
    lsSet(LS_YT_CARDS, m);
}

function ytMergeStored() {
    const m = lsGet(LS_YT_CARDS, {});
    Object.keys(m).forEach(function (k) { if (!vod.byKey[k]) vod.byKey[k] = Object.assign({}, m[k]); });
}

/* ---------- pastas ---------- */
function ytFillFolder(f, items) {
    items.forEach(function (it) { ytRegister(it, f.title); });
}

function ytRefresh(f) {
    if (!state.vodActive || vod.src !== 'yt' || vod.view !== 'home' || vod.catId !== f.title) return;
    vod.list = getCatList(vod.catId);
    vod.shown = GRID_STEP;
    renderGrid();
    applyFocus();
}

function ytEnsureFolder(catId, force) {
    const f = yt.byTitle[catId];
    if (!f) return;
    const s = yt.st[f.key] || (yt.st[f.key] = { state: 'idle' });
    if (s.state === 'loading') return;
    if (s.state === 'ok' && !force) return;
    const ck = 'iptv_yt_sec_' + f.key;
    const c = lsGet(ck, null);
    const hasCache = c && c.q === f.q && c.items && c.items.length;
    if (!force && hasCache && Date.now() - c.t < YT_TTL) {
        ytFillFolder(f, c.items);
        s.state = 'ok';
        return;
    }
    s.state = 'loading';
    ytRace('search', { q: f.q, min: f.min, max: f.max }, function (r) { return ytPick(r, f.min, f.max).length > 0; })
        .then(function (r) {
            const items = ytPick(r, f.min, f.max).slice(0, 48);
            lsSet(ck, { t: Date.now(), q: f.q, items: items });
            ytFillFolder(f, items);
            s.state = 'ok';
        })
        .catch(function (e) {
            if (hasCache) { ytFillFolder(f, c.items); s.state = 'ok'; }   // usa a cópia antiga
            else { s.state = 'fail'; s.err = e && e.message; }
        })
        .then(function () { ytRefresh(f); });
}

function ytEmptyText() {
    if (vod.src !== 'yt') return null;
    if (vod.view === 'search') {
        if (!vod.query.trim()) return null;
        if (yt.sq.state === 'wait' || yt.sq.state === 'loading') return 'Buscando no YouTube...';
        if (yt.sq.state === 'fail') return 'Não consegui buscar agora. Confira a internet e tente de novo.';
        return null;
    }
    const f = yt.byTitle[vod.catId];
    const s = f && yt.st[f.key];
    if (!s) return null;
    if (s.state === 'loading') return 'Carregando vídeos do YouTube...';
    if (s.state === 'fail') return 'Não consegui carregar esta pasta. Confira a internet e aperte OK para tentar de novo.';
    return null;
}

/* ---------- pesquisa no YouTube ---------- */
function ytRunSearch() {
    const q = vod.query.trim();
    clearTimeout(yt.sqT);
    const my = ++yt.sqTok;
    if (q.length < 2) { yt.sq = { state: 'idle' }; vod.list = []; vod.shown = GRID_STEP; renderGrid(); return; }
    if (yt.lastQ === q && yt.lastCards) {
        yt.sq = { state: 'ok' };
        vod.list = yt.lastCards; vod.shown = GRID_STEP; renderGrid();
        return;
    }
    yt.sq = { state: 'wait' };
    renderGrid();
    yt.sqT = setTimeout(function () {
        yt.sq = { state: 'loading' };
        const min = yt.kind === 'series' ? 60 : 1200;
        ytRace('search', { q: q, min: min }, function (r) { return ytPick(r, min, 0).length > 0; })
            .then(function (r) {
                if (my !== yt.sqTok) return;
                const cards = ytPick(r, min, 0).slice(0, 60).map(function (it) { return ytRegister(it, 'Resultados'); });
                yt.lastQ = q; yt.lastCards = cards;
                yt.sq = { state: 'ok' };
                if (vod.view !== 'search') return;
                vod.list = cards; vod.shown = GRID_STEP; renderGrid(); applyFocus();
            })
            .catch(function (e) {
                if (my !== yt.sqTok) return;
                yt.sq = { state: /sem resultado/.test(e && e.message) ? 'ok' : 'fail' };
                if (vod.view !== 'search') return;
                vod.list = []; renderGrid();
            });
    }, 1000);
}

/* ---------- início, alternância YouTube <-> IPTV ---------- */
// no YouTube o título da pasta no topo mostra só a parte depois do "|" (a lista da esquerda já mostra o nome inteiro)
function ytShortLabel(l) { return vod.src === 'yt' ? String(l).replace(/^[^|]*\|\s*/, '') : l; }

function srcBtnHtml() {
    return vod.src === 'yt'
        ? '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>IPTV'
        : '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4"></rect><polygon points="10 9 16 12 10 15 10 9"></polygon></svg>YouTube';
}

function ytStart(kind) {
    yt.kind = kind === 'series' ? 'series' : 'movies';
    showStatus('Carregando YouTube...');
    Promise.race([yt.remoteP, new Promise(function (r) { setTimeout(r, 2500); })]).then(function () {
        hideStatus();
        ytShow();
    });
}

function ytShow(entryCat) {
    vod.src = 'yt';
    document.body.classList.add('yt-on');
    const fs = yt.folders.filter(function (f) { return f.tipo === yt.kind; });
    vod.cards = yt.list.slice();
    vod.byKey = {};
    vod.cards.forEach(function (c) { if (!vod.byKey[c.key]) vod.byKey[c.key] = c; });
    ytMergeStored();
    vod.folders = fs.map(function (f) { return f.title; });
    vod.cats = [{ id: '__fav', label: 'Favoritos' }].concat(fs.map(function (f) { return { id: f.title, label: f.title }; }));
    vodActivate();
    vod.stack = [];
    vod.query = '';
    let ci = 1;
    if (entryCat) {
        const k = vod.cats.map(function (c) { return c.id; }).indexOf(entryCat);
        vod.catId = entryCat;
        vod.catIndex = k === -1 ? 1 : k;
        if (getCatList(entryCat).length) { vodShowHome('grid', 0); return; }
        ci = vod.catIndex;
    } else {
        vod.catId = vod.cats[1].id;
        vod.catIndex = 1;
    }
    vodShowHome('cats', ci);
}

// Favoritos/Histórico: tenta a lista IPTV junto; se ela falhar, abre só os do YouTube
function ytFromMixed() {
    yt.kind = 'movies';
    ytShow(state.vodEntryCat || '__fav');
    return true;
}

function ytToggleSource() {
    if (vod.src === 'yt') {
        document.body.classList.remove('yt-on');
        state.selectedCategory = yt.kind;
        startFromM3U();
    } else {
        hideStatus();
        yt.kind = (state.selectedCategory === 'series') ? 'series' : 'movies';
        ytShow();
    }
}

/* ---------- reprodução ---------- */
function ytBuildSources(d) {
    const T = YT_RES, c = [];
    const m = d.muxed.filter(function (s) { return s.h === T; }).sort(function (a, b) { return b.mp4 - a.mp4; })[0];
    if (m) c.push({ mode: 'single', url: m.url });
    const v = d.vids.filter(function (s) { return s.h === T; }).sort(function (a, b) { return (b.avc - a.avc) || (b.mp4 - a.mp4); })[0];
    const a = d.auds.slice().sort(function (x, y) { return (y.mp4 - x.mp4) || (y.br - x.br); })[0];
    if (d.hls) c.push({ mode: 'hls', url: d.hls });
    if (v && a) c.push({ mode: 'dual', v: v.url, a: a.url });
    const mb = d.muxed.filter(function (s) { return s.h <= T && s.h !== T; }).sort(function (x, y) { return y.h - x.h; })[0];
    if (mb) c.push({ mode: 'single', url: mb.url });
    if (!c.length && d.muxed.length) c.push({ mode: 'single', url: d.muxed[0].url });
    return c;
}

function ytStopAux() {
    yt.tok++;
    yt.dual = false;
    yt.segs = [];
    try {
        if (yt.audio) { yt.audio.pause(); yt.audio.removeAttribute('src'); yt.audio.load(); }
    } catch (e) {}
    el.video.muted = false;
}

function ytInitAudio() {
    if (yt.audio) return;
    const a = yt.audio = new Audio();
    a.preload = 'auto';
    const v = el.video;
    const sync = function () { if (yt.dual && Math.abs(a.currentTime - v.currentTime) > 0.35) a.currentTime = v.currentTime; };
    v.addEventListener('play', function () { if (yt.dual) { sync(); a.playbackRate = v.playbackRate; a.play().catch(function () {}); } });
    v.addEventListener('playing', function () { if (yt.dual) { sync(); a.play().catch(function () {}); } });
    v.addEventListener('pause', function () { if (yt.dual) a.pause(); });
    v.addEventListener('waiting', function () { if (yt.dual) a.pause(); });
    v.addEventListener('seeked', function () { if (yt.dual) { a.currentTime = v.currentTime; if (!v.paused) a.play().catch(function () {}); } });
    v.addEventListener('ratechange', function () { if (yt.dual) a.playbackRate = v.playbackRate; });
    v.addEventListener('timeupdate', function () {
        if (yt.dual) sync();
        // SponsorBlock: pula trechos de patrocínio/propaganda
        if (yt.segs.length && state.vodActive && String(vod.playUrl).indexOf('yt:') === 0) {
            const t = v.currentTime;
            for (let i = 0; i < yt.segs.length; i++) {
                if (t >= yt.segs[i][0] && t < yt.segs[i][1] - 0.4) { v.currentTime = yt.segs[i][1]; break; }
            }
        }
    });
}

function ytLoad(id, startAt) {
    ytInitAudio();
    ytStopAux();
    const tok = yt.tok;
    vod.resumeAt = startAt || 0;
    vodSpin(true);

    ytGet(yt.sb + '/api/skipSegments?videoID=' + id + '&categories=' + encodeURIComponent(JSON.stringify(YT_SB_CATS)), 6000)
        .then(function (r) { if (tok === yt.tok) yt.segs = (r || []).map(function (x) { return x.segment; }); })
        .catch(function () {});

    ytRace('stream', id, function (r) { return r && (r.muxed.length || (r.vids.length && r.auds.length) || r.hls); })
        .then(function (d) {
            if (tok !== yt.tok) return;
            const list = ytBuildSources(d);
            if (!list.length) throw new Error('sem fonte compatível');
            ytTry(list, 0, tok);
        })
        .catch(function (e) {
            if (tok !== yt.tok) return;
            vodSpin(false);
            vodMsg('Não foi possível carregar este vídeo do YouTube. Os servidores podem estar ocupados; tente de novo em instantes.' +
                (e && e.message ? '\n' + e.message.split('\n')[0] : ''), 7000);
        });
}

function ytTry(list, i, tok) {
    if (tok !== yt.tok) return;
    const s = list[i];
    if (!s) {
        vodSpin(false);
        vodMsg('Não foi possível reproduzir este vídeo do YouTube. Tente outro ou volte em instantes.', 7000);
        return;
    }
    const v = el.video;
    const next = function () { ytTry(list, i + 1, tok); };
    if (s.mode === 'dual') {
        yt.dual = true;
        v.muted = true;
        yt.audio.src = s.a;
        yt.audio.currentTime = 0;
    } else {
        yt.dual = false;
        v.muted = false;
        try { yt.audio.pause(); yt.audio.removeAttribute('src'); } catch (e) {}
    }
    loadStreamOne(s.mode === 'dual' ? s.v : s.url, {
        live: false, quick: true, timeout: 25000, forceHls: s.mode === 'hls',
        onPlaying: function () { if (tok === yt.tok) vodSpin(false); },
        onBlocked: function () { vodSpin(false); },
        onFail: function () { next(); }
    });
}

/* ---------- entrada direta (sem login) ---------- */
function autoEnterFree() {
    document.getElementById('login-screen').classList.add('instant');
    state.api = null;
    state.m3uUrl = M3U_URL;
    renderExpiry(null);
    showSplashAfterLogin();
    yt.remoteP = ytLoadRemote();
    setTimeout(ytCheckUpdate, 1500);
}

/* ---------- aviso de atualização ---------- */
function ytCheckUpdate() {
    ytGet(YT_VERSION_URL + '?t=' + Date.now(), 6000).then(function (v) {
        const code = parseInt(v && v.versionCode, 10);
        if (!code || code <= APP_VERSION_CODE || !v.apkUrl) return;
        ytUpdateModal(v);
    }).catch(function () {});
}

function ytUpdateModal(v) {
    if (document.getElementById('upd-modal')) return;
    const m = document.createElement('div');
    m.id = 'upd-modal';
    m.className = 'upd-modal';
    m.innerHTML =
        '<div class="upd-box">' +
          '<div class="upd-title">Nova versão disponível</div>' +
          '<div class="upd-sub">Versão ' + esc(v.versionName || v.versionCode) + ' pronta para instalar.</div>' +
          '<div class="upd-btns">' +
            '<div class="vod-btn vfocus" data-i="0">Atualizar agora</div>' +
            '<div class="vod-btn" data-i="1">Agora não</div>' +
          '</div>' +
        '</div>';
    document.body.appendChild(m);
    const btns = m.querySelectorAll('.vod-btn');
    let idx = 0;
    const focus = function (i) {
        idx = i;
        for (let k = 0; k < btns.length; k++) btns[k].classList.toggle('vfocus', k === i);
    };
    const close = function () {
        document.removeEventListener('keydown', onKey, true);
        if (m.parentNode) m.parentNode.removeChild(m);
    };
    const act = function (i) {
        if (i === 0) { close(); window.location.href = v.apkUrl; }
        else close();
    };
    function onKey(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const k = e.key;
        if (k === 'ArrowLeft' || k === 'ArrowUp') focus(0);
        else if (k === 'ArrowRight' || k === 'ArrowDown') focus(1);
        else if (k === 'Enter') act(idx);
        else if (k === 'Escape' || k === 'Backspace' || k === 'GoBack' || k === 'BrowserBack') close();
    }
    document.addEventListener('keydown', onKey, true);
    for (let k = 0; k < btns.length; k++) btns[k].addEventListener('click', (function (i) { return function () { act(i); }; })(k));
}

// valores iniciais (pastas padrão) antes mesmo do GitHub responder
ytApplyRemote(lsGet(LS_YT_REMOTE, null));
