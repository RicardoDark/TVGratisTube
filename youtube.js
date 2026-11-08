/* ====================================================================
   YOUTUBE DENTRO DE FILMES E SÉRIES
   - As pastas de Filmes e Séries buscam vídeos do YouTube (sem anúncios),
     usando os servidores Piped/Invidious que ficam no GitHub.
   - Filmes e Séries abrem onde a pessoa deixou (padrão: YouTube). O botão piscando mostra onde está ("YouTube" ou "TV") e troca para o outro.
   - O app sempre abre na tela inicial, já com a lista IPTV embutida. A tela de login só abre com o código secreto
     (direita, esquerda, baixo, cima, 2 vezes). O botão "TV" da tela de login (senha 1289) abre o modo grátis.
   ==================================================================== */

// Versão deste app. Quando o version.json do GitHub tiver um versionCode MAIOR, aparece o aviso de atualização.
const APP_VERSION_CODE = 6;

// Regras do YouTube (servidores, SponsorBlock, pastas) e verificação de atualização
const YT_RULES_URL = 'https://raw.githubusercontent.com/RicardoDark/tviptvtube-arquivoderegras/refs/heads/main/update.json';
// Aviso de atualização DESLIGADO (vazio): o link antigo era do app Flames TV e oferecia o APK dele.
// Para ligar, coloque aqui o link do version.json do SEU GitHub (formato no arquivo version.json do projeto).
const YT_VERSION_URL = '';

const YT_RES = 480;                       // qualidade padrão: 480p roda bem nos TV Box fracos (o usuário pode trocar em "Qualidade" e a escolha dele fica guardada)
const YT_QUAL_KEY = 'iptv_yt_quality';
const YT_QUAL_LIST = [1080, 720, 480, 360, 240, 144];
// qualidade escolhida (guardada no aparelho); sem escolha = 480p
function ytRes() { const q = parseInt(lsGet(YT_QUAL_KEY, YT_RES), 10); return q > 0 ? q : YT_RES; }
const YT_TTL = 3 * 60 * 60 * 1000;        // a lista guardada é atualizada em segundo plano depois de 3 horas
const YT_SB_CATS = ['sponsor', 'selfpromo', 'interaction', 'intro', 'outro', 'preview'];
const LS_YT_REMOTE = 'iptv_yt_remote';
const LS_YT_CARDS = 'iptv_yt_cards';

// CONFIGURAÇÃO EMBUTIDA NO APP (mesmo formato do update.json do GitHub).
// - O app funciona sozinho com ela, mesmo sem internet ou se o GitHub estiver fora do ar.
// - A ORDEM das pastas aqui é a ordem na tela (as pastas "24 Horas" ficam em primeiro).
// - O GitHub (update.json) só ACRESCENTA o que o app ainda não tem; veja ytMergeConfig().
// - tipo "movies" = aba FILMES, tipo "series" = aba SERIES. min/max = duração em segundos; "ao_vivo": true = só transmissões ao vivo.
const YT_BUILTIN = {
  "versao": 3,

  "servidores": [
    {"tipo": "piped", "url": "https://pipedapi.kavin.rocks"},
    {"tipo": "piped", "url": "https://pipedapi.leptons.xyz"},
    {"tipo": "piped", "url": "https://pipedapi.nosebs.ru"},
    {"tipo": "piped", "url": "https://pipedapi.adminforge.de"},
    {"tipo": "piped", "url": "https://pipedapi.drgns.space"},
    {"tipo": "piped", "url": "https://pipedapi.owo.si"},
    {"tipo": "piped", "url": "https://pipedapi.reallyaweso.me"},
    {"tipo": "inv", "url": "https://inv.nadeko.net"},
    {"tipo": "inv", "url": "https://yewtu.be"}
  ],
  "chave_api": "",
  "sponsorblock": "https://sponsor.ajay.app",

  "_____1_TV_____": "TV AO VIVO. Uma unica pasta: Canais 24 Horas. O app busca no YouTube os canais ao vivo (lista 'buscas'), nao precisa por canal na mao. Para acrescentar um canal fixo: coloque { \"nome\": \"...\", \"id\": \"11 letras do video ao vivo\" } em 'canais'.",
  "tv": [
    {
      "key": "canais24h",
      "title": "Canais 24 Horas",
      "buscas": [
        "canal 24 horas ao vivo ptbr",
        "tv ao vivo 24 horas ptbr",
        "notícias ao vivo 24 horas ptbr",
        "música ao vivo 24 horas ptbr",
        "desenhos ao vivo 24 horas ptbr",
        "esportes ao vivo 24 horas ptbr",
        "filmes e séries ao vivo 24 horas ptbr",
        "lofi 24/7 ao vivo",
        "live 24/7 channel"
      ],
      "canais": []
    }
  ],

  "secoes": [
    {"_": "=================== 2 - LOCADORA (FILMES) - 24 horas fica em primeiro ==================="},
    {"key": "24Filmes", "tipo": "movies", "title": "Filmes | 24 Horas", "q": "filmes 24 horas ao vivo dublado", "ao_vivo": true},
    {"key": "filmes", "tipo": "movies", "title": "Filmes | Dublados", "q": "filme completo dublado português", "min": 3000},
    {"key": "acao", "tipo": "movies", "title": "Filmes | Ação", "q": "filme de ação completo dublado", "min": 3000},
    {"key": "comedia", "tipo": "movies", "title": "Filmes | Comédia", "q": "filme de comédia completo dublado", "min": 3000},
    {"key": "terror", "tipo": "movies", "title": "Filmes | Terror", "q": "filme de terror completo dublado", "min": 3000},
    {"key": "drama", "tipo": "movies", "title": "Filmes | Drama", "q": "filme drama completo dublado", "min": 3000},
	{"key": "asiático ", "tipo": "movies", "title": "Filmes | Asiático ", "q": "filmes asiático completo dublado", "min": 3000},
    {"key": "ficcao", "tipo": "movies", "title": "Filmes | Ficção Científica", "q": "filme ficção científica completo dublado", "min": 3000},
    {"key": "aventura", "tipo": "movies", "title": "Filmes | Aventura", "q": "filme de aventura completo dublado", "min": 3000},
    {"key": "suspense", "tipo": "movies", "title": "Filmes | Suspense", "q": "filme de suspense thriller completo dublado", "min": 3000},
    {"key": "romance", "tipo": "movies", "title": "Filmes | Romance", "q": "filme romance completo dublado", "min": 3000},
    {"key": "faroeste", "tipo": "movies", "title": "Filmes | Faroeste", "q": "filme de faroeste completo dublado", "min": 3000},
    {"key": "guerra", "tipo": "movies", "title": "Filmes | Guerra", "q": "filme de guerra completo dublado", "min": 3000},
    {"key": "policial", "tipo": "movies", "title": "Filmes | Policial", "q": "filme policial crime completo dublado", "min": 3000},
    {"key": "fantasia", "tipo": "movies", "title": "Filmes | Fantasia", "q": "filme de fantasia completo dublado", "min": 3000},
    {"key": "misterio", "tipo": "movies", "title": "Filmes | Mistério", "q": "filme de mistério completo dublado", "min": 3000},
    {"key": "artesmarciais", "tipo": "movies", "title": "Filmes | Artes Marciais", "q": "filme artes marciais kung fu completo dublado", "min": 3000},
    {"key": "animacao", "tipo": "movies", "title": "Filmes | Animação", "q": "filme de animação completo dublado", "min": 2400},
    {"key": "infantil", "tipo": "movies", "title": "Filmes | Infantil e Família", "q": "filme infantil família completo dublado", "min": 2400},
    {"key": "classicos", "tipo": "movies", "title": "Filmes | Clássicos", "q": "filme clássico antigo completo dublado", "min": 3000},
    {"key": "nacionais", "tipo": "movies", "title": "Filmes | Nacionais", "q": "filme nacional brasileiro completo", "min": 3000},
	{"key": "envangelicos", "tipo": "movies", "title": "Filmes | envangelicos", "q": "filmes envangelicos completo dublado", "min": 2400},
    {"_": "=================== 3 - SERIES (24 horas em primeiro, depois series, clipes e videos) ==================="},
    {"key": "24horas", "tipo": "series", "title": "Séries | 24 Horas", "q": "24 horas ao vivo maratona dublado ptbr", "ao_vivo": true},
    {"key": "animes", "tipo": "series", "title": "Séries | Animes", "q": "anime completo dublado português", "min": 1200},
    {"key": "animesclassicos", "tipo": "series", "title": "Séries | Animes Clássicos", "q": "anime clássico anos 90 episódios dublado", "min": 900},
    {"key": "desenhos", "tipo": "series", "title": "Séries | Desenhos Clássicos", "q": "desenho animado clássico episódios completos dublado", "min": 900},
    {"key": "desinfantil", "tipo": "series", "title": "Séries | Desenhos Infantis", "q": "desenho infantil episódios completos dublado ptbr", "min": 900},
    {"key": "novelas", "tipo": "series", "title": "Séries | Novelas", "q": "novela capítulo completo dublado ptbr", "min": 1500},
    {"key": "seriescompletas", "tipo": "series", "title": "Séries | Séries Completas", "q": "série completa dublada episódios", "min": 1500},
    {"key": "docs", "tipo": "series", "title": "Séries | Documentários", "q": "documentário completo dublado português", "min": 1800},
    {"key": "animais", "tipo": "series", "title": "Séries | Animais e Vida Selvagem", "q": "documentário animais vida selvagem português", "min": 1200},
    {"key": "natureza", "tipo": "series", "title": "Séries | Natureza", "q": "documentário natureza paisagens português brasil", "min": 1200},
    {"key": "historia", "tipo": "series", "title": "Séries | Documentários de História", "q": "documentário história completo dublado", "min": 1800},
    {"key": "ciencia", "tipo": "series", "title": "Séries | Ciência e Espaço", "q": "documentário espaço universo ciência dublado", "min": 1800},
    {"key": "crimes", "tipo": "series", "title": "Séries | Crimes Reais", "q": "documentário crimes reais completo dublado ptbr", "min": 1800},
	{"key": "Minidramas", "tipo": "series", "title": "Séries | Minidramas", "q": "Minidramas dublado", "min": 1800},
    {"key": "pegadinha", "tipo": "series", "title": "Videos | pegadinha", "q": "comedia  pegadinha  dublado", "min": 1500},
    {"key": "clipestop", "tipo": "series", "title": "Clipes | Top Hits Internacionais", "q": "top english hits official music video"},
    {"key": "clipespop", "tipo": "series", "title": "Clipes | Pop Internacional", "q": "pop official music video english"},
    {"key": "clipesrock", "tipo": "series", "title": "Clipes | Rock Internacional", "q": "rock official music video english"},
    {"key": "clipeshiphop", "tipo": "series", "title": "Clipes | Hip Hop e Rap", "q": "hip hop rap official music video english"},
    {"key": "clipesdance", "tipo": "series", "title": "Clipes | Eletrônica e Dance", "q": "dance electronic official music video"},
    {"key": "clipescountry", "tipo": "series", "title": "Clipes | Country", "q": "country official music video english"},
    {"key": "clipes80", "tipo": "series", "title": "Clipes | Anos 80", "q": "80s official music video hits"},
    {"key": "clipes90", "tipo": "series", "title": "Clipes | Anos 90", "q": "90s official music video hits"},
    {"key": "clipes2000", "tipo": "series", "title": "Clipes | Anos 2000", "q": "2000s official music video hits"},
	{"key": "portadosfundos", "tipo": "series", "title": "Videos | porta dos fundos", "q": "porta dos fundos oficial video"},
    {"key": "galofrito", "tipo": "series", "title": "Videos | galo frito", "q": "galo frito oficial video"},
    {"key": "nocturnal", "tipo": "series", "title": "Clipes | Nocturnal Records", "q": "Nocturnal Records"},
    {"key": "Repo!", "tipo": "series", "title": "Clipes | Repo! The Genetic Opera", "q": "Repo! The Genetic Opera Official Video"},
    {"key": "K-pop", "tipo": "series", "title": "Clipes | K-pop Asian", "q": "kpop girl group official MV"},
    {"key": "emo", "tipo": "series", "title": "Clipes | Emo", "q": "clip music emo"},
    {"key": "gothic", "tipo": "series", "title": "Clipes | Gothic", "q": "clip music gothic"},
	{"key": "Melanie Martinez", "tipo": "series", "title": "Clipes | Melanie Martinez", "q": "Melanie Martinez (Official Video)"},  
	{"key": "AvrilLavigne", "tipo": "series", "title": "Clipes | Avril Lavigne", "q": "Avril Lavigne  (Official Video)"},
	{"key": "Guns", "tipo": "series", "title": "Clipes | Guns N' Roses", "q": "Guns N' Roses (Official Video)"},
	{"key": "TheCure", "tipo": "series", "title": "Clipes | The Cure", "q": "clip The Cure (Official Video)"},
	{"key": "BlackEyedPeas", "tipo": "series", "title": "Clipes | Black Eyed Peas", "q": "Black Eyed Peas (Official Video)"},
	{"key": "OfficialVideo", "tipo": "series", "title": "Clipes | Official Video", "q": "Clipes Official Video"},
	{"key": "brasil", "tipo": "series", "title": "Clipes | Brasil", "q": "official videoclip brasil"},
	{"key": "parodia", "tipo": "series", "title": "Clipes | Parodia", "q": "parodia video clips"},
	{"key": "cdzremake", "tipo": "series", "title": "Videos | cdz ia", "q": "CDZ Remake ia ptbr"},
    {"key": "jogos", "tipo": "series", "title": "Videos | GamePlay", "q": "jogos gamepaly play pt br"},
    {"key": "dbd", "tipo": "series", "title": "Videos | DBD", "q": "Dead By Daylight no commentary"},
	{"key": "kof", "tipo": "series", "title": "Videos | KOF", "q": "M. Bizarro"},
    {"key": "terceiroolho", "tipo": "series", "title": "Videos | Terceiro olho", "q": "Terceiro olho"},
    {"key": "mantras", "tipo": "series", "title": "Videos | Mantras", "q": "mantras Terceiro olho"},
    {"key": "noticiasrecentes", "tipo": "series", "title": "Videos | Noticias recentes", "q": "noticias recentes"},
    {"key": "espiritismo", "tipo": "series", "title": "Videos | Espiritismo", "q": "espiritismo dubloado"}
  ]
};

const yt = {
    servers: [], key: '', sb: 'https://sponsor.ajay.app',
    folders: [], byTitle: {}, st: {}, list: [], seen: {},
    good: 0, goodUrl: '', extra: [], discP: null, discDone: false,
    tok: 0, segs: [], dual: false, audio: null,
    heights: [], lastD: null,   // resoluções do vídeo atual e última resposta dos servidores (para trocar a qualidade sem buscar de novo)
    remoteP: null, kind: 'movies',
    tv: [],   // pastas da aba TV (embutidas + novidades do GitHub, campo "tv")
    tvSt: {}, tvLive: {},   // estado da busca de canais ao vivo e lista encontrada, por pasta de TV
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
function ytIdAny(u) {
    const m = /(?:youtu\.be\/|[?&]v=|\/live\/|\/embed\/)([\w-]{11})/.exec(u || '');
    return m ? m[1] : '';
}
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

/* ---------- configuração: embutida no app + novidades do GitHub ---------- */
// Regra: o app já tem tudo (YT_BUILTIN). O que vem do GitHub só ACRESCENTA o que o app ainda não tem:
//   - servidor novo (url que ainda não está na lista)
//   - pasta nova de filmes/séries (key que o app ainda não tem; entra no FIM da lista)
//   - pasta de TV nova, ou canal novo / busca nova dentro de uma pasta de TV que já existe
// O que já existe no app é IGNORADO. Exceção: uma pasta do GitHub com "substituir": true troca q/min/max da pasta de mesmo key.
function ytCleanKey(k) { return String(k || '').replace(/[^a-z0-9_-]/gi, ''); }

// canais colocados à mão: { nome, id | url, logo }
function ytParseCanais(list) {
    const out = [];
    (Array.isArray(list) ? list : []).forEach(function (c) {
        if (!c) return;
        let id = String(c.id || '').trim();
        if (!/^[\w-]{11}$/.test(id)) id = ytIdAny(c.url);
        if (!id) return;
        out.push({ nome: String(c.nome || c.name || 'Canal ao vivo'), id: id, logo: c.logo ? String(c.logo) : '' });
    });
    return out;
}

function ytMergeConfig(c) {
    if (!c || typeof c !== 'object') return;

    if (Array.isArray(c.servidores)) {
        c.servidores.forEach(function (x) {
            const type = String((x && (x.tipo || x.type)) || '');
            const url = String((x && x.url) || '').replace(/\/$/, '');
            if ((type !== 'piped' && type !== 'inv') || !/^https?:\/\//.test(url)) return;
            if (yt.servers.some(function (s) { return s.url === url; })) return;
            yt.servers.push({ type: type, url: url });
        });
    }
    if (typeof c.chave_api === 'string' && c.chave_api.trim()) yt.key = c.chave_api.trim();
    if (typeof c.sponsorblock === 'string' && /^https?:\/\//.test(c.sponsorblock)) yt.sb = c.sponsorblock.replace(/\/$/, '');

    // Pastas de TV ao vivo (aba "TV ao Vivo"): { key, title, buscas: [texto, ...], canais: [ { nome, id | url, logo } ] }
    // "buscas" = o app procura no YouTube transmissões ao vivo com esses textos; "canais" = canais fixos colocados à mão.
    if (Array.isArray(c.tv)) {
        c.tv.forEach(function (p) {
            if (!p || !p.title) return;
            const title = String(p.title);
            const key = ytCleanKey(p.key) || ytCleanKey(title);
            const canais = ytParseCanais(p.canais);
            const buscas = [].concat(Array.isArray(p.buscas) ? p.buscas : [], p.q ? [p.q] : [])
                .map(function (b) { return String(b).trim(); }).filter(Boolean);
            const cur = yt.tv.filter(function (t) { return t.key === key || t.title === title; })[0];
            if (cur) {
                canais.forEach(function (n) { if (!cur.canais.some(function (o) { return o.id === n.id; })) cur.canais.push(n); });
                buscas.forEach(function (b) { if (cur.buscas.indexOf(b) === -1) cur.buscas.push(b); });
            } else if (canais.length || buscas.length) {
                yt.tv.push({ key: key, title: title, canais: canais, buscas: buscas });
            }
        });
    }

    // Pastas de filmes e séries
    if (Array.isArray(c.secoes)) {
        c.secoes.forEach(function (x) {
            if (!x || !x.key || !x.q) return;
            const key = ytCleanKey(x.key);
            if (!key) return;
            const min = x.ao_vivo ? -1 : (+x.min || 0);
            const f = yt.folders.filter(function (y) { return y.key === key; })[0];
            if (f) {
                if (x.substituir === true) { f.q = String(x.q); f.min = min; f.max = +x.max || 0; }
            } else if (x.title) {
                const tp = String(x.tipo || x.type || 'movies') === 'series' ? 'series' : 'movies';
                yt.folders.push({ key: key, tipo: tp, title: String(x.title), q: String(x.q), min: min, max: +x.max || 0 });
            }
        });
    }
}

function ytApplyRemote(r) {
    yt.folders = [];
    yt.tv = [];
    yt.servers = [];
    yt.key = '';
    yt.sb = 'https://sponsor.ajay.app';
    ytMergeConfig(YT_BUILTIN);   // 1) o que já vem dentro do app
    ytMergeConfig(r);            // 2) só o que for novo no GitHub (ou na cópia dele guardada no aparelho)
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
    const liveOnly = min === -1;   // pasta com "ao_vivo": true no GitHub mostra só transmissões ao vivo
    return (list || []).filter(function (x) {
        if (!x || !x.id || seen[x.id]) return false;
        if (liveOnly) { if (!x.live) return false; seen[x.id] = 1; return true; }
        if (x.live) return false;
        const d = +x.dur || 0;
        if (d < Math.max(min || 0, 30)) return false;   // sem filtro, só ignora vinhetas/Shorts de menos de 30 s
        if (max && d > max) return false;
        seen[x.id] = 1;
        return true;
    });
}

const YT_OPS = {
    piped: {
        search: async function (u, a) {
            let out = [], next = null;
            for (let p = 0; p < (a.pages || 4); p++) {
                const url = next
                    ? u + '/nextpage/search?nextpage=' + encodeURIComponent(next) + '&q=' + encodeURIComponent(a.q) + '&filter=videos'
                    : u + '/search?q=' + encodeURIComponent(a.q) + '&filter=videos';
                let res;
                try { res = await ytGet(url); } catch (e) { if (!out.length) throw e; break; }
                const items = (res.items || []).map(function (p) {
                    return { id: ytIdFromUrl(p.url), title: p.title, channel: p.uploaderName, dur: p.duration, views: p.views, live: p.duration === -1 };
                }).filter(function (x) { return x.id; });
                out = out.concat(items);
                next = res.nextpage;
                if (!next || !items.length || ytPick(out, a.min, a.max).length >= (a.want || 24)) break;
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
            for (let p = 1; p <= (a.pages || 4); p++) {
                let res;
                try { res = await ytGet(u + '/api/v1/search?q=' + encodeURIComponent(a.q) + '&type=video&page=' + p + (a.min === -1 ? '&features=live' : '')); }
                catch (e) { if (!out.length) throw e; break; }
                const items = (res || []).filter(function (x) { return x.videoId; }).map(function (x) {
                    return { id: x.videoId, title: x.title, channel: x.author, dur: x.lengthSeconds, views: x.viewCount, live: !!x.liveNow };
                });
                out = out.concat(items);
                if (!items.length || ytPick(out, a.min, a.max).length >= (a.want || 24)) break;
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
                '&maxResults=50&regionCode=BR' + (a.min === -1 ? '&eventType=live' : '') + '&q=' + encodeURIComponent(a.q) + '&key=' + encodeURIComponent(yt.key));
            const ids = (r.items || []).map(function (i) { return i.id && i.id.videoId; }).filter(Boolean);
            if (!ids.length) return [];
            const d = await ytGet(base + '/videos?part=snippet,contentDetails,statistics&id=' + ids.join(',') + '&key=' + encodeURIComponent(yt.key));
            return (d.items || []).map(function (v) {
                return {
                    id: v.id, title: ytDecode(v.snippet.title), channel: ytDecode(v.snippet.channelTitle),
                    dur: ytIsoDur(v.contentDetails && v.contentDetails.duration),
                    views: v.statistics && v.statistics.viewCount != null ? +v.statistics.viewCount : 0,
                    live: !!(v.snippet && v.snippet.liveBroadcastContent === 'live')
                };
            });
        }
    }
};

// Lista de servidores: os do GitHub (update.json) + os descobertos automaticamente (sem repetir)
function ytServerList() {
    const out = [], seen = {};
    yt.servers.concat(yt.extra || []).forEach(function (x) {
        if (!x || !x.url || seen[x.url]) return;
        seen[x.url] = 1;
        out.push(x);
    });
    return out.slice(0, 26);
}

// Tenta vários servidores quase ao mesmo tempo; vale o primeiro que responder certo.
function ytRace(op, arg, validate) {
    return new Promise(function (res, rej) {
        const list = ytServerList();
        if (op === 'search' && yt.key) list.unshift({ type: 'api', url: '' });
        const n = list.length;
        if (!n) { rej(new Error('nenhum servidor')); return; }
        let done = false, fails = 0, first = 0;
        const errs = [], timers = [];
        for (let i = 0; i < n; i++) { if (yt.goodUrl && list[i].url === yt.goodUrl) { first = i; break; } }
        const order = [first].concat(list.map(function (x, i) { return i; }).filter(function (i) { return i !== first; }));
        order.forEach(function (i, k) {
            timers.push(setTimeout(function () {
                if (done) return;
                YT_OPS[list[i].type][op](list[i].url, arg).then(function (r) {
                    if (done) return;
                    if (validate && !validate(r)) throw new Error('sem resultado');
                    done = true;
                    timers.forEach(clearTimeout);
                    if (list[i].type !== 'api') yt.goodUrl = list[i].url;
                    res(r);
                }).catch(function (e) {
                    errs.push((list[i].type === 'api' ? 'YouTube API' : ytHost(list[i].url)) + ': ' + e.message);
                    if (++fails === n && !done) rej(new Error(errs.slice(0, 4).join('\n')));
                });
            }, k * 300));
        });
    });
}

// Busca; se todos os servidores da lista falharem, espera a descoberta automática e tenta de novo
function ytSearch(arg, validate) {
    const had = ytServerList().length;
    return ytRace('search', arg, validate).catch(function (e) {
        if (!yt.discP) throw e;
        return yt.discP.then(function () {
            if (ytServerList().length <= had) throw e;
            return ytRace('search', arg, validate);
        });
    });
}

// Descobre sozinho servidores Piped/Invidious que estão no ar (listas oficiais dos projetos)
function ytDiscover() {
    const C = lsGet('iptv_yt_disc', null);
    if (C && C.l && C.l.length) yt.extra = C.l;
    if (C && C.l && C.l.length && Date.now() - C.t < 6 * 3600 * 1000) { yt.discDone = true; return Promise.resolve(); }
    const out = [];
    const p1 = ytGet('https://piped-instances.kavin.rocks/', 6000).then(function (r) {
        let n = 0;
        (Array.isArray(r) ? r : []).forEach(function (x) {
            const u = x && x.api_url;
            if (n >= 14 || !/^https:\/\//.test(u || '')) return;
            out.push({ type: 'piped', url: u.replace(/\/$/, '') }); n++;
        });
    }).catch(function () {});
    const p2 = ytGet('https://api.invidious.io/instances.json?sort_type=health', 6000).then(function (r) {
        let n = 0;
        (Array.isArray(r) ? r : []).forEach(function (x) {
            const o = x && x[1];
            if (n >= 10 || !o || o.type !== 'https' || o.api === false || o.cors === false || !/^https:\/\//.test(o.uri || '')) return;
            out.push({ type: 'inv', url: o.uri.replace(/\/$/, '') }); n++;
        });
    }).catch(function () {});
    yt.discP = Promise.all([p1, p2]).then(function () {
        if (out.length) { yt.extra = out; lsSet('iptv_yt_disc', { t: Date.now(), l: out }); }
        yt.discDone = true;
    });
    return yt.discP;
}

/* ---------- cartões ---------- */
function ytMk(it, group) {
    const id = it.id;
    const dur = Math.max(0, +it.dur || 0);
    const plot = (it.live ? 'AO VIVO' + (it.channel ? '  •  ' : '') : '') + (it.channel ? 'Canal: ' + it.channel : '') +
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
    if (!state.free && vod.src !== 'yt') return;
    const m = lsGet(LS_YT_CARDS, {});
    Object.keys(m).forEach(function (k) { if (!vod.byKey[k]) vod.byKey[k] = Object.assign({}, m[k]); });
}

/* ---------- TV ao vivo do YouTube (pasta "Canais 24 Horas") ---------- */
// A pasta junta: canais fixos colocados à mão ("canais") + canais ao vivo que o app acha sozinho no YouTube ("buscas").
// A lista achada fica guardada no aparelho (abre na hora) e é atualizada em segundo plano.
const LS_YT_TV = 'iptv_yt_tv_';
const YT_TV_TTL = 3 * 60 * 60 * 1000;   // depois de 3 horas a lista guardada é buscada de novo
const YT_TV_MAX = 300;

function ytTvLogo(id) { return 'https://i.ytimg.com/vi/' + id + '/mqdefault_live.jpg'; }

// resultado de busca -> canal da aba TV
function ytTvChannel(it, title) {
    const t = ytDecode(it.title || '').trim();
    const ch = ytDecode(it.channel || '').trim();
    let name = t || ch || 'Canal ao vivo';
    if (ch && t && t.toLowerCase().indexOf(ch.toLowerCase()) === -1) name = ch + ' | ' + t;
    return { id: 'yt_' + it.id, name: name.slice(0, 80), url: 'yt:' + it.id, folder: title, logo: ytTvLogo(it.id) };
}

function ytTvCached(p) {
    const c = lsGet(LS_YT_TV + p.key, null);
    return (c && Array.isArray(c.items)) ? c.items : [];
}

// lista final da pasta: canais fixos primeiro, depois os achados na busca (sem repetir)
function ytTvList(p, live) {
    const seen = {}, out = [];
    p.canais.map(function (c) {
        return { id: 'yt_' + c.id, name: c.nome, url: 'yt:' + c.id, folder: p.title, logo: c.logo || ytTvLogo(c.id) };
    }).concat(live || yt.tvLive[p.key] || ytTvCached(p)).forEach(function (c) {
        if (!c || !c.url || seen[c.url]) return;
        seen[c.url] = 1;
        out.push(Object.assign({}, c, { folder: p.title }));
    });
    return out;
}

// Coloca as pastas de TV na lista da aba TV ao Vivo (os canais viram "yt:ID") e começa a busca dos canais ao vivo
function ytInjectTv() {
    state.ytTvCount = 0;
    const add = [];
    (yt.tv || []).forEach(function (p) {
        const list = ytTvList(p);
        if (!list.length && !p.buscas.length) return;
        add.push({ p: p, title: p.title, list: list });
    });
    // fica fixa no topo (logo depois de Favoritos)
    add.slice().reverse().forEach(function (a) {
        state.folders = state.folders.filter(function (f) { return f !== a.title; });
        state.folders.unshift(a.title);
        state.channelsByFolder[a.title] = a.list;
        state.channels = state.channels.filter(function (c) { return c.folder !== a.title; }).concat(a.list);
    });
    state.ytTvCount = add.length;
    add.forEach(function (a) { if (a.p.buscas.length) ytTvLoad(a.p); });
}

// mostra na tela a lista nova da pasta (só se a aba TV está aberta)
function ytTvApply(p, live) {
    const list = ytTvList(p, live);
    if (state.selectedCategory !== 'tv' || state.folders.indexOf(p.title) === -1) return;
    state.channelsByFolder[p.title] = list;
    state.channels = state.channels.filter(function (c) { return c.folder !== p.title; }).concat(list);
    if (state.channelsByFolder[ALL_FOLDER]) {
        state.channelsByFolder[ALL_FOLDER] = state.channels.filter(function (c) { return !isAdultLocked(c.folder); })
            .slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'pt', { numeric: true, sensitivity: 'base' }); });
    }
    if (state.folders[state.selectedFolderIndex] === p.title) {
        if (state.focusedChannelIndex >= list.length) state.focusedChannelIndex = Math.max(0, list.length - 1);
        el.currentFolderTitle.textContent = p.title + ' < ' + list.length + ' >';
        renderChannels(p.title);
        updateFocusDOM();
    }
}

// texto na pasta enquanto ela está vazia (usado pelo renderChannels do app.js)
function ytTvHint(folder, n) {
    if (n) return '';
    const p = (yt.tv || []).filter(function (t) { return t.title === folder; })[0];
    if (!p || !p.buscas.length) return '';
    const s = yt.tvSt[p.key];
    if (s && s.state === 'fail') return 'Não consegui buscar os canais ao vivo agora. Confira a internet e entre na TV de novo.';
    if (s && s.attempt) return 'Os servidores estão ocupados. Tentando de novo (' + s.attempt + '/' + YT_RETRY_WAIT.length + ')...';
    return 'Buscando canais 24 horas ao vivo no YouTube...';
}

// Procura no YouTube transmissões ao vivo (uma busca por vez, para não sobrecarregar os servidores)
function ytTvLoad(p) {
    const s = yt.tvSt[p.key] || (yt.tvSt[p.key] = { state: 'idle' });
    if (s.state === 'loading') return;
    const c = lsGet(LS_YT_TV + p.key, null);
    const hasCache = !!(c && c.items && c.items.length);
    const same = !!(c && JSON.stringify(c.b) === JSON.stringify(p.buscas));
    if (hasCache && same && Date.now() - c.t < YT_TV_TTL) { s.state = 'ok'; return; }   // lista ainda nova

    const run = s.run = (s.run || 0) + 1;
    s.state = 'loading';
    s.attempt = 0;
    const fresh = [], seen = {};
    let qi = 0, fails = 0, shown = hasCache;   // com lista guardada ela já está na tela; sem lista, mostra assim que chegar o primeiro resultado

    const finish = function () {
        if (s.run !== run) return;
        if (!fresh.length) {
            if (s.attempt < YT_RETRY_WAIT.length) {
                const w = YT_RETRY_WAIT[s.attempt++];
                ytTvApply(p);
                setTimeout(function () { if (s.run === run) { qi = 0; next(); } }, w);
            } else {
                s.state = 'fail';
                s.attempt = 0;
                ytTvApply(p);   // com lista guardada ela continua na tela
            }
            return;
        }
        s.state = 'ok';
        s.attempt = 0;
        const items = fresh.slice(0, YT_TV_MAX);
        yt.tvLive[p.key] = items;
        try { localStorage.setItem(LS_YT_TV + p.key, JSON.stringify({ t: Date.now(), b: p.buscas, items: items })); } catch (e) {}
        ytTvApply(p, items);
    };

    const next = function () {
        if (s.run !== run) return;
        if (qi >= p.buscas.length || fresh.length >= YT_TV_MAX) { finish(); return; }
        const q = p.buscas[qi++];
        ytSearch({ q: q, min: -1, max: 0, pages: 3, want: 40 }, function (r) { return ytPick(r, -1, 0).length > 0; })
            .then(function (r) {
                if (s.run !== run) return;
                ytPick(r, -1, 0).forEach(function (it) {
                    if (!seen[it.id]) { seen[it.id] = 1; fresh.push(ytTvChannel(it, p.title)); }
                });
                fails = 0;
                if (!shown && fresh.length) { shown = true; ytTvApply(p, fresh.slice()); }
                setTimeout(next, 300);
            })
            .catch(function () {
                // 3 buscas seguidas sem nada (internet fora ou servidores ocupados): para e tenta de novo mais tarde
                if (++fails >= 3 && !fresh.length) { finish(); return; }
                setTimeout(next, 600);
            });
    };
    next();
}

// Reproduz uma transmissão ao vivo do YouTube dentro da aba TV (sem abrir o app do YouTube)
function ytPlayLive(channel) {
    const id = String(channel.url).slice(3);
    try { stopStream(); el.video.pause(); } catch (e) {}
    ytInitAudio();
    ytStopAux();
    const tok = yt.tok;
    localStorage.setItem(STORAGE_LAST_CHANNEL_KEY, JSON.stringify(channel));
    localStorage.setItem('iptv_last_played_folder', state.folders[state.selectedFolderIndex]);
    const ytc = document.getElementById('youtube-iframe-container');
    if (ytc) ytc.style.display = 'none';
    el.video.style.display = 'block';
    showStatus('Carregando ' + channel.name + '...');
    ytRace('stream', id, function (r) { return r && (r.hls || (r.muxed && r.muxed.length) || (r.vids.length && r.auds.length)); })
        .then(function (d) {
            if (tok !== yt.tok) return;
            const list = ytBuildSources(d).sort(function (a, b) { return (b.mode === 'hls') - (a.mode === 'hls'); });
            if (!list.length) throw new Error('sem fonte compatível');
            ytLiveTry(list, 0, tok, channel);
        })
        .catch(function () {
            if (tok !== yt.tok) return;
            showStatus('Não foi possível abrir este canal ao vivo agora (os servidores podem estar ocupados, ou a transmissão acabou). Tente outro.', false);
        });
}

function ytLiveTry(list, i, tok, channel) {
    if (tok !== yt.tok) return;
    const s = list[i];
    if (!s) {
        showStatus('Não foi possível abrir este canal ao vivo. Tente outro.', false);
        return;
    }
    const v = el.video;
    if (window.NativeVideo) {
        // player proprio: ele mesmo junta o video e o audio separados (sem o <audio> auxiliar)
        yt.dual = false;
        v.muted = false;
        NativeVideo.setAudio(s.mode === 'dual' ? s.a : '');
        NativeVideo.setMaxHeight(ytRes());
    } else if (s.mode === 'dual') {
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
        live: true, quick: true, timeout: 25000, forceHls: s.mode === 'hls',
        onPlaying: function () { if (tok === yt.tok) { hideStatus(); showToast(channel.name, channel.folder); } },
        onBlocked: function () { showStatus('Pressione OK para reproduzir.', false); },
        onFail: function () { ytLiveTry(list, i + 1, tok, channel); }
    });
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

// Meta de vídeos por pasta e variações da busca usadas para completar a lista
const YT_TARGET = 300;
const YT_RETRY_WAIT = [3000, 6000, 10000, 15000];   // tentativas automáticas quando a busca falha (ms)

// grava a lista da pasta; se faltar espaço no aparelho, apaga as pastas guardadas mais antigas e tenta de novo
function ytCacheSet(ck, obj) {
    try { localStorage.setItem(ck, JSON.stringify(obj)); return; } catch (e) {}
    try {
        const ks = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.indexOf('iptv_yt_sec_') === 0 && k !== ck) {
                let t = 0;
                try { t = JSON.parse(localStorage.getItem(k)).t || 0; } catch (e) {}
                ks.push([t, k]);
            }
        }
        ks.sort(function (a, b) { return a[0] - b[0]; });
        for (let j = 0; j < ks.length && j < 8; j++) {
            localStorage.removeItem(ks[j][1]);
            try { localStorage.setItem(ck, JSON.stringify(obj)); return; } catch (e) {}
        }
    } catch (e) {}
}
const YT_VARIANTS = ['', ' HD', ' 2023', ' 2022', ' 2021', ' 2019', ' legendado', ' grátis', ' melhores', ' online', ' 2018', ' 2017'];

// a lista cresceu em segundo plano: atualiza o total e acrescenta cartões sem mexer na posição da tela
function ytGrow(f) {
    if (!state.vodActive || vod.src !== 'yt' || vod.view !== 'home' || vod.catId !== f.title) return;
    vod.list = getCatList(vod.catId);
    const g = $v('vod-grid');
    if (!g) return;
    if (g.querySelector('.vod-empty')) { ytRefresh(f); return; }
    // acrescenta na tela os cartões novos (até o limite já mostrado; o resto aparece ao rolar)
    const from = g.children.length, upto = Math.min(vod.shown, vod.list.length);
    if (from < upto) {
        g.insertAdjacentHTML('beforeend', vod.list.slice(from, upto).map(function (c, k) { return cardHtml(c, from + k, 'grid'); }).join(''));
    }
    const t = $v('vod-total'); if (t) t.textContent = 'Total: ' + vod.list.length;
}

// busca mais vídeos (páginas mais fundas + variações do texto) até chegar na meta
function ytDeepen(f, s, run, all, add, ck) {
    let step = 0, fails = 0;
    const next = function () {
        if (s.run !== run || all.length >= YT_TARGET || step >= YT_VARIANTS.length || fails >= 3) return;
        const q = f.q + YT_VARIANTS[step++];
        ytRace('search', { q: q, min: f.min, max: f.max, pages: 12, want: YT_TARGET }, function (r) { return ytPick(r, f.min, f.max).length > 0; })
            .then(function (r) {
                if (s.run !== run) return;
                const fresh = add(ytPick(r, f.min, f.max));
                if (fresh.length) {
                    ytFillFolder(f, fresh);
                    ytCacheSet(ck, { t: Date.now(), q: f.q, items: all.slice(0, YT_TARGET) });
                    ytGrow(f);
                }
                setTimeout(next, 400);
            })
            .catch(function () { fails++; setTimeout(next, 1500); });
    };
    next();
}

function ytEnsureFolder(catId, force) {
    const f = yt.byTitle[catId];
    if (!f) return;
    const s = yt.st[f.key] || (yt.st[f.key] = { state: 'idle' });
    if (s.state === 'loading') return;
    if (s.state === 'ok' && !force) return;
    const ck = 'iptv_yt_sec_' + f.key;
    const c = lsGet(ck, null);
    const hasCache = !!(c && c.q === f.q && c.items && c.items.length);
    const run = s.run = (s.run || 0) + 1;
    const all = [], seen = {};
    const add = function (items) {
        const fresh = [];
        (items || []).forEach(function (it) {
            if (all.length < YT_TARGET && it && it.id && !seen[it.id]) { seen[it.id] = 1; all.push(it); fresh.push(it); }
        });
        return fresh;
    };
    const save = function () { ytCacheSet(ck, { t: Date.now(), q: f.q, items: all.slice(0, YT_TARGET) }); };

    // 1) Se já existe lista guardada, mostra NA HORA (mesmo velha)
    if (hasCache) {
        add(c.items);
        ytFillFolder(f, c.items);
        s.state = 'ok';
        // lista ainda nova: não precisa buscar de novo (só completa se estiver curta)
        if (!force && Date.now() - c.t < YT_TTL) {
            if (all.length < YT_TARGET / 2) ytDeepen(f, s, run, all, add, ck);
            return;
        }
    } else {
        s.state = 'loading';
    }
    s.err = '';
    s.attempt = 0;

    // 2) Busca (lista velha ou sem lista). Se falhar, tenta de novo sozinho algumas vezes.
    const attempt = function (n) {
        ytSearch({ q: f.q, min: f.min, max: f.max, pages: 4, want: 24 }, function (r) { return ytPick(r, f.min, f.max).length > 0; })
            .then(function (r) {
                if (s.run !== run) return;
                const items = ytPick(r, f.min, f.max);
                const old = all.slice();
                all.length = 0;
                Object.keys(seen).forEach(function (k) { delete seen[k]; });
                add(items);        // vídeos novos na frente
                add(old);          // completa com os que já estavam guardados
                save();
                ytFillFolder(f, items);
                s.state = 'ok';
                s.attempt = 0;
                if (hasCache) ytGrow(f); else ytRefresh(f);
                if (all.length < YT_TARGET) ytDeepen(f, s, run, all, add, ck);
            })
            .catch(function (e) {
                if (s.run !== run) return;
                s.err = e && e.message;
                if (n < YT_RETRY_WAIT.length) {
                    if (!hasCache) { s.attempt = n + 1; s.state = 'loading'; ytRefresh(f); }
                    setTimeout(function () { if (s.run === run) attempt(n + 1); }, YT_RETRY_WAIT[n]);
                } else if (!hasCache) {
                    s.state = 'fail';
                    s.attempt = 0;
                    ytRefresh(f);
                }   // com lista guardada: continua mostrando ela e tenta de novo na próxima vez
            });
    };
    attempt(0);
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
    if (s.state === 'loading') return s.attempt ? 'Os servidores estão ocupados. Tentando de novo (' + s.attempt + '/' + YT_RETRY_WAIT.length + ')...' : 'Carregando vídeos do YouTube...';
    if (s.state === 'fail') return 'Não consegui carregar esta pasta. Confira a internet e aperte OK para tentar de novo.' +
        (s.err ? '<br><small>' + esc(String(s.err).split('\n').slice(0, 3).join('  |  ')) + '</small>' : '');
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
    // O botão mostra onde a pessoa está: "YouTube" (vermelho piscando) ou "TV" (piscando); clicar troca para o outro
    return vod.src === 'yt'
        ? '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4"></rect><polygon points="10 9 16 12 10 15 10 9"></polygon></svg>YouTube'
        : '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>TV';
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
    vod.enterLock = Date.now() + 1500;   // a troca é demorada: ignora OK repetido do controle até a tela nova abrir
    lsSet('tube_src', vod.src === 'yt' ? 'tv' : 'yt');   // guarda a escolha da pessoa para a próxima vez
    if (vod.src === 'yt') {
        // Voltar: sai do YouTube e volta para a lista IPTV (pela API do servidor quando há login)
        document.body.classList.remove('yt-on');
        state.selectedCategory = yt.kind;
        state.fromYtBack = true;   // se a lista IPTV vier vazia, não volta sozinho para o YouTube
        if (state.api) startApp(); else startFromM3U();
    } else {
        ytBootFree();   // carrega as pastas do YouTube na primeira vez (no login normal ainda não foram carregadas)
        hideStatus();
        yt.kind = (state.selectedCategory === 'series') ? 'series' : 'movies';
        ytShow();
    }
}

/* ---------- reprodução ---------- */
// Escolhe as resoluções por ordem de proximidade da qualidade preferida (YT_RES):
// primeiro a própria (480p), depois as menores (360p...), por último as maiores (720p...).
// Antes só aceitava 720p exato; sem 720p dava "sem fonte compatível".
function ytHeightsByCloseness(list) {
    const hs = [];
    list.forEach(function (s) { if (s.h > 0 && hs.indexOf(s.h) === -1) hs.push(s.h); });
    const R = ytRes();
    const below = hs.filter(function (h) { return h <= R; }).sort(function (a, b) { return b - a; });
    const above = hs.filter(function (h) { return h > R; }).sort(function (a, b) { return a - b; });
    return below.concat(above);
}

/* ---------- qualidade do vídeo (botão "Qualidade") ---------- */
function ytHeightsOf(d) {
    const hs = [];
    (d.muxed || []).concat(d.vids || []).forEach(function (s) { if (s.h >= 100 && hs.indexOf(s.h) === -1) hs.push(s.h); });
    return hs.sort(function (a, b) { return b - a; });
}
// resoluções que o vídeo atual tem (do maior para o menor); sem informação, usa a lista padrão
function ytQualityOptions() {
    return yt.heights && yt.heights.length ? yt.heights.slice() : YT_QUAL_LIST.slice();
}
function ytQualLabel() { return 'Qualidade: ' + ytRes() + 'p'; }
// dir = -1 baixa a qualidade (menos travadas), +1 sobe; no fim da lista dá a volta
function ytStepQuality(dir) {
    const o = ytQualityOptions(), cur = ytRes();
    let n;
    if (dir < 0) { n = o.filter(function (h) { return h < cur; })[0]; if (n == null) n = o[0]; }
    else { const up = o.filter(function (h) { return h > cur; }); n = up.length ? up[up.length - 1] : o[o.length - 1]; }
    ytSetQuality(n);
}
function ytSetQuality(h) {
    lsSet(YT_QUAL_KEY, h);
    const b = document.getElementById('vod-qualbtn');
    if (b) b.innerHTML = ICON_QUAL + ytQualLabel();
    // recarrega o vídeo que está tocando, no mesmo ponto
    if (state.vodActive && vod.src === 'yt' && vod.playUrl && String(vod.playUrl).indexOf('yt:') === 0) {
        const t = el.video.currentTime || 0;
        ytLoad(String(vod.playUrl).slice(3), t > 5 ? t : 0, true);
    }
}

function ytBuildSources(d) {
    const c = [];
    const mp4First = function (a, b) { return (b.mp4 ? 1 : 0) - (a.mp4 ? 1 : 0); };
    const avcFirst = function (a, b) { return ((b.avc ? 1 : 0) - (a.avc ? 1 : 0)) || mp4First(a, b); };

    if (d.hls) c.push({ mode: 'hls', url: d.hls });

    // vídeo e áudio já juntos (mais simples e seguro): a qualidade escolhida (480p por padrão) vai primeiro; as outras resoluções ficam de reserva
    const muxHs = ytHeightsByCloseness(d.muxed).slice(0, 2);
    const addMux = function (h) {
        const m = d.muxed.filter(function (s) { return s.h === h; }).sort(mp4First)[0];
        if (m) c.push({ mode: 'single', url: m.url });
    };
    const R = ytRes();
    if (muxHs[0] === R) addMux(R);

    // vídeo e áudio separados (as 2 resoluções mais próximas da escolhida)
    const a = d.auds.slice().sort(function (x, y) { return (y.mp4 - x.mp4) || (y.br - x.br); })[0];
    if (a) {
        ytHeightsByCloseness(d.vids).slice(0, 2).forEach(function (h) {
            const v = d.vids.filter(function (s) { return s.h === h; }).sort(avcFirst)[0];
            if (v) c.push({ mode: 'dual', v: v.url, a: a.url });
        });
    }

    muxHs.forEach(function (h) { if (h !== R) addMux(h); });

    // último recurso: qualquer fonte que o servidor tenha mandado (inclusive com altura desconhecida)
    if (!c.length && d.muxed.length) c.push({ mode: 'single', url: d.muxed[0].url });
    if (!c.length && a && d.vids.length) c.push({ mode: 'dual', v: d.vids[0].url, a: a.url });
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

function ytLoad(id, startAt, reuse) {
    ytInitAudio();
    ytStopAux();
    const tok = yt.tok;
    vod.resumeAt = startAt || 0;
    vodSpin(true);

    ytGet(yt.sb + '/api/skipSegments?videoID=' + id + '&categories=' + encodeURIComponent(JSON.stringify(YT_SB_CATS)), 6000)
        .then(function (r) { if (tok === yt.tok) yt.segs = (r || []).map(function (x) { return x.segment; }); })
        .catch(function () {});

    const cached = (reuse && yt.lastD && yt.lastD.id === id && Date.now() - yt.lastD.t < 10 * 60 * 1000) ? Promise.resolve(yt.lastD.d) : null;
    (cached || ytRace('stream', id, function (r) { return r && (r.muxed.length || (r.vids.length && r.auds.length) || r.hls); }))
        .then(function (d) {
            if (tok !== yt.tok) return;
            if (!cached) yt.lastD = { id: id, d: d, t: Date.now() };
            yt.heights = ytHeightsOf(d);
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
    if (window.NativeVideo) {
        // player proprio: ele mesmo junta o video e o audio separados (sem o <audio> auxiliar)
        yt.dual = false;
        v.muted = false;
        NativeVideo.setAudio(s.mode === 'dual' ? s.a : '');
        NativeVideo.setMaxHeight(ytRes());
    } else if (s.mode === 'dual') {
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

/* ---------- modo TV grátis (entra pelo botão TV da tela de login) ---------- */
function ytBootFree() {
    // carrega as regras do YouTube e procura os canais ao vivo (só uma vez)
    if (yt.booted) return;
    yt.booted = true;
    yt.remoteP = ytLoadRemote();
    ytDiscover();
}

/* ---------- aviso de atualização ---------- */
function ytCheckUpdate() {
    // a cada abertura do app já confere o arquivo de regras do GitHub (fica guardado e vale quando abrir o YouTube)
    if (!yt.booted) { try { ytLoadRemote(); } catch (e) {} }
    if (!YT_VERSION_URL) return;
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
