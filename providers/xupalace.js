/**
 * xupalace - Built from src/xupalace/
 * Generated: 2026-04-30T19:12:42.562Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/ua.js
var require_ua = __commonJS({
  "src/utils/ua.js"(exports2, module2) {
    var UA_POOL = [
      // Windows - Chrome 146 (Custom modern fingerprint)
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
    ];
    function getRandomUA() {
      const index = Math.floor(Math.random() * UA_POOL.length);
      return UA_POOL[index];
    }
    module2.exports = { getRandomUA, UA_POOL };
  }
});

// src/utils/http.js
var require_http = __commonJS({
  "src/utils/http.js"(exports2, module2) {
    var { getRandomUA } = require_ua();
    var DEFAULT_CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var sessionUA = null;
    function setSessionUA(ua) {
      sessionUA = ua;
    }
    function getSessionUA() {
      return sessionUA || DEFAULT_CHROME_UA;
    }
    function getStealthHeaders() {
      return {
        "User-Agent": getSessionUA(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6",
        "Connection": "keep-alive",
        "sec-ch-ua": '"Chromium";v="137", "Not-A.Brand";v="24", "Google Chrome";v="137"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      };
    }
    var DEFAULT_UA = getSessionUA();
    var MOBILE_UA = getSessionUA();
    function request(url, options) {
      return __async(this, null, function* () {
        var opt = options || {};
        var currentUA = opt.headers && opt.headers["User-Agent"] ? opt.headers["User-Agent"] : getSessionUA();
        var headers = Object.assign({
          "User-Agent": currentUA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
        }, opt.headers);
        try {
          var fetchOptions = Object.assign({
            redirect: opt.redirect || "follow",
            skipSizeCheck: true
          }, opt, {
            headers
          });
          if (opt.signal)
            fetchOptions.signal = opt.signal;
          var response = yield fetch(url, fetchOptions);
          if (opt.redirect === "manual" && (response.status === 301 || response.status === 302)) {
            const redirectUrl = response.headers.get("location");
            console.log(`[HTTP] Redirecci\xF3n detectada (Manual): ${redirectUrl}`);
            return { status: response.status, redirectUrl, ok: false };
          }
          if (!response.ok && !opt.ignoreErrors) {
            console.warn("[HTTP] Error " + response.status + " en " + url);
          }
          return response;
        } catch (error) {
          console.error("[HTTP] Error en " + url + ": " + error.message);
          throw error;
        }
      });
    }
    function fetchHtml(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.text();
      });
    }
    function fetchJson(url, options) {
      return __async(this, null, function* () {
        var res = yield request(url, options);
        return yield res.json();
      });
    }
    module2.exports = {
      request,
      fetchHtml,
      fetchJson,
      getSessionUA,
      setSessionUA,
      getStealthHeaders,
      DEFAULT_UA,
      MOBILE_UA
    };
  }
});

// src/utils/m3u8.js
var require_m3u8 = __commonJS({
  "src/utils/m3u8.js"(exports2, module2) {
    var { getSessionUA } = require_http();
    function getQualityFromHeight(height) {
      if (!height)
        return "1080p";
      const h = parseInt(height);
      if (h >= 2160)
        return "4K";
      if (h >= 1440)
        return "1440p";
      if (h >= 1080)
        return "1080p";
      if (h >= 720)
        return "720p";
      if (h >= 480)
        return "480p";
      if (h >= 360)
        return "360p";
      return "1080p";
    }
    function parseBestQuality(content, url = "") {
      let bestHeight = 0;
      let bestBandwidth = 0;
      if (content) {
        const lines = content.split("\n");
        for (const line of lines) {
          if (line.includes("RESOLUTION=")) {
            const match = line.match(/RESOLUTION=\d+x(\d+)/i);
            if (match) {
              const height = parseInt(match[1]);
              if (height > bestHeight)
                bestHeight = height;
            }
          }
          if (line.includes("BANDWIDTH=")) {
            const match = line.match(/BANDWIDTH=(\d+)/i);
            if (match) {
              const bandwidth = parseInt(match[1]);
              if (bandwidth > bestBandwidth)
                bestBandwidth = bandwidth;
            }
          }
        }
      }
      let quality = "1080p";
      let isReal = false;
      if (bestHeight > 0) {
        quality = getQualityFromHeight(bestHeight);
      } else {
        const qMatch = url.match(/([_-]|\/)(\d{3,4})([pP]|(\.m3u8))?/);
        if (qMatch) {
          const h = parseInt(qMatch[2]);
          if (h >= 360 && h <= 4320)
            quality = getQualityFromHeight(h);
        }
      }
      if (bestHeight > 0)
        isReal = true;
      if (bestBandwidth >= 2e6)
        isReal = true;
      return { quality, isReal };
    }
    var VALIDATION_CACHE = /* @__PURE__ */ new Map();
    function validateStream(stream, signal = null) {
      return __async(this, null, function* () {
        if (!stream || !stream.url)
          return stream;
        const { url, headers } = stream;
        const isMp4 = url.toLowerCase().includes(".mp4");
        if (VALIDATION_CACHE.has(url))
          return __spreadValues(__spreadValues({}, stream), VALIDATION_CACHE.get(url));
        try {
          const fetchOptions = {
            method: isMp4 ? "HEAD" : "GET",
            headers: __spreadValues({
              "User-Agent": getSessionUA()
            }, headers || {})
          };
          if (signal)
            fetchOptions.signal = signal;
          const response = yield fetch(url, fetchOptions);
          if (!response.ok)
            return __spreadProps(__spreadValues({}, stream), { verified: false });
          if (isMp4) {
            const resultData2 = { verified: true, quality: stream.quality || "1080p", isReal: true };
            VALIDATION_CACHE.set(url, resultData2);
            return __spreadValues(__spreadValues({}, stream), resultData2);
          }
          const text = yield response.text();
          const info = parseBestQuality(text, url);
          const resultData = {
            verified: true,
            quality: info.quality,
            isReal: info.isReal
          };
          VALIDATION_CACHE.set(url, resultData);
          return __spreadValues(__spreadValues({}, stream), resultData);
        } catch (error) {
          const info = parseBestQuality("", url);
          const resultData = { quality: info.quality, verified: true, isReal: false };
          VALIDATION_CACHE.set(url, resultData);
          return __spreadValues(__spreadValues({}, stream), resultData);
        }
      });
    }
    module2.exports = { validateStream, getQualityFromHeight };
  }
});

// src/utils/sorting.js
var sorting_exports = {};
__export(sorting_exports, {
  sortStreamsByQuality: () => sortStreamsByQuality
});
function sortStreamsByQuality(streams) {
  if (!Array.isArray(streams))
    return [];
  return [...streams].sort((a, b) => {
    const scoreA = QUALITY_SCORE[a.quality] || 0;
    const scoreB = QUALITY_SCORE[b.quality] || 0;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    const serverA = (a.serverLabel || "").split(" ")[0];
    const serverB = (b.serverLabel || "").split(" ")[0];
    const speedA = SERVER_SCORE[serverA] || 0;
    const speedB = SERVER_SCORE[serverB] || 0;
    if (speedA !== speedB) {
      return speedB - speedA;
    }
    if (a.verified && !b.verified)
      return -1;
    if (!a.verified && b.verified)
      return 1;
    return 0;
  });
}
var QUALITY_SCORE, SERVER_SCORE;
var init_sorting = __esm({
  "src/utils/sorting.js"() {
    QUALITY_SCORE = {
      "4K": 100,
      "1440p": 90,
      "1080p": 80,
      "720p": 70,
      "480p": 60,
      "360p": 50,
      "240p": 40,
      "Auto": 30,
      "Unknown": 0
    };
    SERVER_SCORE = {
      "VOE": 10,
      "Filemoon": 10,
      "Tplayer": 10,
      "Vimeos": 10,
      "Netu": 5,
      "GoodStream": 10,
      "StreamWish": -5,
      "VidHide": -5
    };
  }
});

// src/utils/mirrors.js
var require_mirrors = __commonJS({
  "src/utils/mirrors.js"(exports2, module2) {
    var MIRRORS = {
      VIDHIDE: [
        "vidhide",
        "minochinos",
        "vadisov",
        "vaiditv",
        "amusemre",
        "callistanise",
        "vhaudm",
        "mdfury",
        "dintezuvio",
        "acek-cdn",
        "vedonm",
        "vidhidepro",
        "vidhidevip",
        "masukestin",
        "vidoza",
        "supervideo"
      ],
      STREAMWISH: [
        "hlswish",
        "streamwish",
        "hglink",
        "hglamioz",
        "hglink.to",
        "audinifer",
        "embedwish",
        "awish",
        "dwish",
        "strwish",
        "filelions",
        "wishembed",
        "wishfast",
        "hanerix"
      ],
      FILEMOON: [
        "filemoon",
        "moonalu",
        "moonembed",
        "bysedikamoum",
        "r66nv9ed",
        "398fitus",
        "filemoon.sx",
        "filemoon.to",
        "filemoon.lat",
        "filemoon.live",
        "filemoon.online",
        "filemoon.me",
        "bysedikamoum.com",
        "r66nv9ed.com",
        "398fitus.com",
        "fmoon.top"
      ],
      VOE: [
        "voe.sx",
        "voe-sx",
        "voex.sx",
        "marissashare",
        "cloudwindow",
        "marissasharecareer"
      ],
      FASTREAM: [
        "fastream",
        "fastplay",
        "fembed"
      ],
      OKRU: [
        "ok.ru",
        "okru"
      ],
      PIXELDRAIN: [
        "pixeldrain"
      ],
      BUZZHEAVIER: [
        "buzzheavier",
        "bzh.sh"
      ],
      GOODSTREAM: [
        "goodstream",
        "gs.one"
      ],
      LULUSTREAM: [
        "lulustream",
        "luluvdo",
        "luluvids",
        "pondy",
        "lulupuv"
      ],
      SEEKSTREAMING: [
        "seekplays",
        "seekstreaming",
        "embedseek"
      ],
      DROPCDN: [
        "dropcdn.io",
        "dropload.io",
        "dropcdn",
        "dropload",
        "dr0pstream"
      ],
      DOODSTREAM: [
        "dood.li",
        "dood.la",
        "ds2video.com",
        "ds2play.com",
        "dood.yt",
        "dood.ws",
        "dood.so",
        "dood.to",
        "dood.pm",
        "dood.watch",
        "dood.sh",
        "dood.cx",
        "dood.wf",
        "dood.re",
        "dood.one",
        "dood.tech",
        "dood.work",
        "doods.pro",
        "dooood.com",
        "doodstream.com",
        "doodstream.co",
        "d000d.com",
        "d0000d.com",
        "doodapi.com",
        "d0o0d.com",
        "do0od.com",
        "dooodster.com",
        "vidply.com",
        "do7go.com",
        "all3do.com",
        "doply.net",
        "dsvplay.com"
      ]
    };
    function isMirror(url, groupName) {
      if (!url || !MIRRORS[groupName])
        return false;
      const s = url.toLowerCase();
      return MIRRORS[groupName].some((m) => s.includes(m));
    }
    module2.exports = { MIRRORS, isMirror };
  }
});

// src/utils/engine.js
var require_engine = __commonJS({
  "src/utils/engine.js"(exports2, module2) {
    var { validateStream } = require_m3u8();
    var { sortStreamsByQuality: sortStreamsByQuality2 } = (init_sorting(), __toCommonJS(sorting_exports));
    var { isMirror } = require_mirrors();
    function normalizeLanguage(lang) {
      const l = (lang || "").toLowerCase();
      if (l === "latino" || l === "espa\xF1ol" || l === "lat" || l === "auto") {
        return "Latino";
      }
      if (l.includes("lat") || l.includes("mex") || l.includes("col") || l.includes("arg") || l.includes("chi") || l.includes("per") || l.includes("dub") || l.includes("dual")) {
        return "Latino";
      }
      if (l.includes("esp") || l.includes("cas") || l.includes("spa") || l.includes("cast") || l === "esp") {
        return "Espa\xF1ol";
      }
      if (l.includes("sub") || l.includes("vose") || l === "sub") {
        return "Subtitulado";
      }
      if (l.includes("eng") || l.includes("en-us") || l === "en") {
        return "Ingl\xE9s";
      }
      return lang || "Latino";
    }
    function normalizeServer(server, url = "", resolvedServerName = null) {
      if (resolvedServerName)
        return resolvedServerName;
      const u = (url || "").toLowerCase();
      const s = (server || "").toLowerCase();
      if (u.includes("goodstream") || s.includes("goodstream"))
        return "GoodStream";
      if (u.includes("vimeos") || u.includes("vms.sh") || s.includes("vimeos"))
        return "Vimeos";
      if (isMirror(u, "VIDHIDE") || isMirror(s, "VIDHIDE"))
        return "VidHide";
      if (isMirror(u, "STREAMWISH") || isMirror(s, "STREAMWISH"))
        return "StreamWish";
      if (isMirror(u, "VOE") || isMirror(s, "VOE"))
        return "VOE";
      if (isMirror(u, "FILEMOON") || isMirror(s, "FILEMOON"))
        return "Filemoon";
      if (isMirror(u, "DOODSTREAM") || isMirror(s, "DOODSTREAM"))
        return "DoodStream";
      if (url) {
        try {
          const domainParts = new URL(url).hostname.replace("www.", "").split(".");
          const mainName = domainParts.length > 1 ? domainParts[domainParts.length - 2] : domainParts[0];
          return mainName.charAt(0).toUpperCase() + mainName.slice(1);
        } catch (e) {
        }
      }
      return server || "Servidor";
    }
    function finalizeStreams2(streams, providerName, mediaTitle) {
      return __async(this, null, function* () {
        if (!Array.isArray(streams) || streams.length === 0)
          return [];
        console.log(`[Engine] PROCESANDO STREAMS - Bitrate Global v7.6.0`);
        const { validateStream: validateStream2 } = require_m3u8();
        const sorted = sortStreamsByQuality2(streams);
        const CONCURRENCY_LIMIT = 5;
        const MAX_VALIDATIONS = 5;
        const validatedStreams = [];
        for (let i = 0; i < sorted.length; i += CONCURRENCY_LIMIT) {
          if (i >= MAX_VALIDATIONS) {
            validatedStreams.push(...sorted.slice(i));
            break;
          }
          const batch = sorted.slice(i, i + CONCURRENCY_LIMIT);
          const batchResults = yield Promise.all(batch.map((s) => __async(this, null, function* () {
            try {
              if (s.isReal === true)
                return s;
              if (s.url && (s.url.includes(".m3u8") || s.url.includes(".mp4"))) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2500);
                try {
                  const validated = yield validateStream2(s, controller.signal);
                  clearTimeout(timeoutId);
                  return validated;
                } catch (e) {
                  clearTimeout(timeoutId);
                  return __spreadProps(__spreadValues({}, s), { verified: false, isReal: false });
                }
              }
            } catch (e) {
            }
            return s;
          })));
          validatedStreams.push(...batchResults);
        }
        const processed = [];
        const seenTitles = /* @__PURE__ */ new Set();
        for (const s of validatedStreams) {
          if (!s)
            continue;
          const rawLang = normalizeLanguage(s.lang || s.Audio || s.langLabel || s.language || s.audio || "Latino");
          const l = rawLang.toLowerCase();
          const isLatino = l.includes("latino") || l.includes("espa\xF1ol");
          if (!isLatino && providerName !== "FuegoCine")
            continue;
          const server = normalizeServer(s.serverLabel || s.serverName || s.servername, s.url, s.serverName);
          const quality = s.quality || "HD";
          const isReal = s.isReal === true;
          const isVerified = s.verified === true;
          const checkMark = isReal ? " \u2705" : "";
          const streamName = `${providerName} - ${quality}${checkMark}`;
          const streamTitle = `${rawLang} - ${server}`;
          if (seenTitles.has(streamName + streamTitle + s.url))
            continue;
          seenTitles.add(streamName + streamTitle + s.url);
          processed.push({
            name: streamName,
            title: streamTitle,
            url: s.url,
            quality,
            verified: isVerified,
            isReal,
            provider: server,
            language: rawLang,
            headers: s.headers || {
              "User-Agent": "Mozilla/5.0 (Linux; Android 10; TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
          });
        }
        return processed;
      });
    }
    module2.exports = { finalizeStreams: finalizeStreams2, normalizeLanguage };
  }
});

// src/utils/tmdb.js
var require_tmdb = __commonJS({
  "src/utils/tmdb.js"(exports2, module2) {
    var axios2 = require("axios");
    var TMDB_API_KEY2 = "439c478a771f35c05022f9feabcca01c";
    var titleCache = /* @__PURE__ */ new Map();
    function getTmdbTitle2(tmdbId, mediaType, language = "en-US", retries = 2) {
      return __async(this, null, function* () {
        if (!tmdbId)
          return null;
        const cleanId = tmdbId.toString().split(":")[0];
        const cacheKey = `${cleanId}_${mediaType}_${language}`;
        if (titleCache.has(cacheKey))
          return titleCache.get(cacheKey);
        try {
          const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
          let url;
          if (cleanId.startsWith("tt")) {
            url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY2}&external_source=imdb_id&language=${language}`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            const result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
            const title = result ? result.name || result.title : null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY2}&language=${language}`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            const title = data.name || data.title || null;
            if (title)
              titleCache.set(cacheKey, title);
            return title;
          }
        } catch (e) {
          if (retries > 0) {
            console.log(`[TMDB-Rescue] Retrying ${tmdbId} (${retries} left)...`);
            yield new Promise((r) => setTimeout(r, 1e3));
            return getTmdbTitle2(tmdbId, mediaType, retries - 1);
          }
          console.log(`[TMDB-Rescue] Failed to fetch title for ${tmdbId}: ${e.message}`);
          return null;
        }
      });
    }
    function getTmdbInfo(tmdbId, mediaType) {
      return __async(this, null, function* () {
        if (!tmdbId)
          return null;
        const cleanId = tmdbId.toString().split(":")[0];
        const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
        try {
          let url;
          let result;
          if (cleanId.startsWith("tt")) {
            url = `https://api.themoviedb.org/3/find/${cleanId}?api_key=${TMDB_API_KEY2}&external_source=imdb_id`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            result = type === "movie" ? data.movie_results && data.movie_results[0] : data.tv_results && data.tv_results[0] || data.movie_results && data.movie_results[0];
          } else {
            url = `https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY2}`;
            const { data } = yield axios2.get(url, { timeout: 6e3 });
            result = data;
          }
          if (result) {
            const title = result.name || result.title;
            const date = result.release_date || result.first_air_date || "";
            const year = date.split("-")[0];
            return { title, year };
          }
          return null;
        } catch (e) {
          return null;
        }
      });
    }
    function getTmdbAliases(tmdbId, mediaType) {
      return __async(this, null, function* () {
        if (!tmdbId)
          return [];
        const cleanId = tmdbId.toString().split(":")[0];
        const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
        const titles = /* @__PURE__ */ new Set();
        try {
          const [enTitle, esTitle] = yield Promise.all([
            getTmdbTitle2(cleanId, type, "en-US"),
            getTmdbTitle2(cleanId, type, "es-MX")
          ]);
          if (enTitle)
            titles.add(enTitle);
          if (esTitle)
            titles.add(esTitle);
          const altUrl = `https://api.themoviedb.org/3/${type}/${cleanId}/alternative_titles?api_key=${TMDB_API_KEY2}`;
          const { data } = yield axios2.get(altUrl, { timeout: 5e3 });
          const altResults = data.titles || data.results || [];
          altResults.forEach((item) => {
            if (item.title)
              titles.add(item.title);
          });
          return Array.from(titles);
        } catch (e) {
          console.warn(`[TMDB-Aliases] Failed for ${tmdbId}: ${e.message}`);
          return Array.from(titles);
        }
      });
    }
    module2.exports = { getTmdbTitle: getTmdbTitle2, getTmdbInfo, getTmdbAliases };
  }
});

// src/resolvers/hlswish.js
var require_hlswish = __commonJS({
  "src/resolvers/hlswish.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    var DOMAIN_MAP = { "hglink.to": "vibuxer.com" };
    function unpackEval(payload, radix, symtab) {
      const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const unbase = (str) => {
        let result = 0;
        for (let i = 0; i < str.length; i++) {
          const pos = chars.indexOf(str[i]);
          if (pos === -1) return NaN;
          result = result * radix + pos;
        }
        return result;
      };
      return payload.replace(/\b([0-9a-zA-Z]+)\b/g, (match) => {
        const idx = unbase(match);
        if (isNaN(idx) || idx >= symtab.length) return match;
        return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
      });
    }
    function extractHlsUrl(unpacked, embedHost) {
      const objMatch = unpacked.match(/\{[^{}]*"hls[234]"\s*:\s*"([^"]+)"[^{}]*\}/);
      if (objMatch) {
        try {
          const normalized = objMatch[0].replace(/(\w+)\s*:/g, '"$1":');
          const obj = JSON.parse(normalized);
          const url = obj.hls4 || obj.hls3 || obj.hls2;
          if (url) return url.startsWith("/") ? embedHost + url : url;
        } catch (e) {
          const urlMatch = objMatch[0].match(/"hls[234]"\s*:\s*"([^"]+\.m3u8[^"]*)"/);
          if (urlMatch) {
            const url = urlMatch[1];
            return url.startsWith("/") ? embedHost + url : url;
          }
        }
      }
      const m3u8Match = unpacked.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
      if (m3u8Match) {
        const url = m3u8Match[1];
        return url.startsWith("/") ? embedHost + url : url;
      }
      return null;
    }
    function resolve(embedUrl) {
      return __async(this, null, function* () {
        var _a;
        try {
          let fetchUrl2 = embedUrl;
          for (const [from, to] of Object.entries(DOMAIN_MAP)) {
            if (fetchUrl2.includes(from)) { fetchUrl2 = fetchUrl2.replace(from, to); break; }
          }
          const embedHost = ((_a = fetchUrl2.match(/^(https?:\/\/[^/]+)/)) == null ? void 0 : _a[1]) || "https://hlswish.com";
          console.log(`[HLSWish] Resolviendo: ${embedUrl}`);
          if (fetchUrl2 !== embedUrl) console.log(`[HLSWish] → Mapped to: ${fetchUrl2}`);
          const resp = yield fetch(fetchUrl2, {
            headers: { "User-Agent": UA, "Referer": "https://embed69.org/", "Origin": "https://embed69.org", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "es-MX,es;q=0.9" },
            redirect: "follow"
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const data = yield resp.text();
          const fileMatch = data.match(/file\s*:\s*["']([^"']+)["']/i);
          if (fileMatch) {
            let url = fileMatch[1];
            if (url.startsWith("/")) url = embedHost + url;
            if (url.includes("vibuxer.com/stream/")) {
              console.log(`[HLSWish] Siguiendo redirect: ${url.substring(0, 80)}...`);
              try {
                const redirectResp = yield fetch(url, { headers: { "User-Agent": UA, "Referer": embedHost + "/" }, redirect: "follow" });
                const finalUrl = redirectResp.url;
                if (finalUrl && finalUrl.includes(".m3u8")) url = finalUrl;
              } catch (e) {}
            }
            console.log(`[HLSWish] URL encontrada: ${url.substring(0, 80)}...`);
            return { url, quality: "1080p", headers: { "User-Agent": UA, "Referer": embedHost + "/" } };
          }
          const packMatch = data.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[^}]+\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
          if (packMatch) {
            const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
            const url = extractHlsUrl(unpacked, embedHost);
            if (url) {
              console.log(`[HLSWish] URL encontrada: ${url.substring(0, 80)}...`);
              return { url, quality: "1080p", headers: { "User-Agent": UA, "Referer": embedHost + "/" } };
            }
          }
          const rawM3u8 = data.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
          if (rawM3u8) {
            console.log(`[HLSWish] URL encontrada: ${rawM3u8[0].substring(0, 80)}...`);
            return { url: rawM3u8[0], quality: "1080p", headers: { "User-Agent": UA, "Referer": embedHost + "/" } };
          }
          console.log("[HLSWish] No se encontró URL");
          return null;
        } catch (err) {
          console.log(`[HLSWish] Error: ${err.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve };
  }
});

// src/utils/aes_gcm.js
var require_aes_gcm = __commonJS({
  "src/utils/aes_gcm.js"(exports2, module2) {
    var _CryptoJS = typeof CryptoJS !== "undefined" ? CryptoJS : null;
    function b64urlToWordArray(s) {
      s = s.replace(/-/g, "+").replace(/_/g, "/");
      const pad = (4 - s.length % 4) % 4;
      return _CryptoJS.default.enc.Base64.parse(s + "=".repeat(pad));
    }
    function wordArrayToBytes(wa) {
      const words = wa.words;
      const sigBytes = wa.sigBytes;
      const bytes = new Uint8Array(sigBytes);
      for (let i = 0; i < sigBytes; i++) {
        bytes[i] = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      }
      return bytes;
    }
    function bytesToWordArray(bytes) {
      const words = [];
      for (let i = 0; i < bytes.length; i += 4) {
        words.push((bytes[i] || 0) << 24 | (bytes[i + 1] || 0) << 16 | (bytes[i + 2] || 0) << 8 | (bytes[i + 3] || 0));
      }
      return _CryptoJS.default.lib.WordArray.create(words, bytes.length);
    }
    function incCounter(block) {
      const b = new Uint8Array(block);
      for (let i = 15; i >= 12; i--) { b[i]++; if (b[i] !== 0) break; }
      return b;
    }
    function aesGcmDecrypt(key32bytes, iv12bytes, ciphertextBytes) {
      try {
        const j0 = new Uint8Array(16);
        j0.set(iv12bytes, 0);
        j0[15] = 1;
        let counter = incCounter(j0);
        const keyWA = bytesToWordArray(key32bytes);
        const result = new Uint8Array(ciphertextBytes.length);
        for (let offset = 0; offset < ciphertextBytes.length; offset += 16) {
          const blockSize = Math.min(16, ciphertextBytes.length - offset);
          const counterWA = bytesToWordArray(counter);
          const encrypted = _CryptoJS.default.AES.encrypt(counterWA, keyWA, { mode: _CryptoJS.default.mode.ECB, padding: _CryptoJS.default.pad.NoPadding });
          const keystreamBytes = wordArrayToBytes(encrypted.ciphertext);
          for (let i = 0; i < blockSize; i++) { result[offset + i] = ciphertextBytes[offset + i] ^ keystreamBytes[i]; }
          counter = incCounter(counter);
        }
        return result;
      } catch (e) {
        console.log("[Filemoon] AES-GCM error:", e.message);
        return null;
      }
    }
    module2.exports = { aesGcmDecrypt, b64urlToWordArray, wordArrayToBytes, bytesToWordArray, incCounter };
  }
});

// src/resolvers/filemoon.js
var require_filemoon = __commonJS({
  "src/resolvers/filemoon.js"(exports2, module2) {
    var _CryptoJS = typeof CryptoJS !== "undefined" ? CryptoJS : null;
    var { b64urlToWordArray, wordArrayToBytes, bytesToWordArray, aesGcmDecrypt } = require_aes_gcm();
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function normalizeResolution(width, height) {
      if (width >= 3840 || height >= 2160) return "4K";
      if (width >= 1920 || height >= 1080) return "1080p";
      if (width >= 1280 || height >= 720) return "720p";
      if (width >= 854 || height >= 480) return "480p";
      return "360p";
    }
    function detectQuality(m3u8Url, headers) {
      return __async(this, arguments, function* (m3u8Url, headers_) {
        try {
          var res = yield fetch(m3u8Url, { headers: __spreadValues({ "User-Agent": UA }, headers_ || {}), redirect: "follow" });
          var data = yield res.text();
          if (!data.includes("#EXT-X-STREAM-INF")) {
            var match = m3u8Url.match(/[_-](\d{3,4})p/);
            return match ? match[1] + "p" : "1080p";
          }
          var bestHeight = 0, bestWidth = 0;
          var lines = data.split("\n");
          for (var i = 0; i < lines.length; i++) {
            var m = lines[i].match(/RESOLUTION=(\d+)x(\d+)/);
            if (m) { var w = parseInt(m[1]), h = parseInt(m[2]); if (h > bestHeight) { bestHeight = h; bestWidth = w; } }
          }
          return bestHeight > 0 ? normalizeResolution(bestWidth, bestHeight) : "1080p";
        } catch (e) { return "1080p"; }
      });
    }
    function resolve(embedUrl) {
      return __async(this, null, function* () {
        var _a, _b, _c;
        console.log("[Filemoon] Resolviendo: " + embedUrl);
        try {
          var match = embedUrl.match(/\/(?:e|d)\/([a-z0-9]{12})/i);
          if (!match) return null;
          var id = match[1];
          var playbackJson = yield fetch("https://filemooon.link/api/videos/" + id + "/embed/playback", { headers: { "User-Agent": UA, "Referer": embedUrl } }).then(function(r) { return r.json(); });
          if (playbackJson.error) { console.log("[Filemoon] API error: " + playbackJson.error); return null; }
          var pb = playbackJson.playback;
          if (!pb || pb.algorithm !== "AES-256-GCM" || !pb.key_parts || pb.key_parts.length !== 2) { console.log("[Filemoon] Formato de cifrado no soportado"); return null; }
          var k1 = wordArrayToBytes(b64urlToWordArray(pb.key_parts[0]));
          var k2 = wordArrayToBytes(b64urlToWordArray(pb.key_parts[1]));
          var rawKey = new Uint8Array(k1.length + k2.length);
          rawKey.set(k1, 0); rawKey.set(k2, k1.length);
          var key32 = rawKey.length === 32 ? rawKey : wordArrayToBytes(_CryptoJS.default.SHA256(bytesToWordArray(rawKey)));
          var ivBytes = wordArrayToBytes(b64urlToWordArray(pb.iv));
          var payloadBytes = wordArrayToBytes(b64urlToWordArray(pb.payload));
          if (payloadBytes.length < 16) return null;
          var ciphertext = payloadBytes.slice(0, -16);
          var decrypted = aesGcmDecrypt(key32, ivBytes, ciphertext);
          if (!decrypted) return null;
          var decStr = "";
          for (var i = 0; i < decrypted.length; i++) decStr += String.fromCharCode(decrypted[i]);
          var inner = JSON.parse(decStr);
          var m3u8Url = (_c = (_b = inner.sources) == null ? void 0 : _b[0]) == null ? void 0 : _c.url;
          if (!m3u8Url) return null;
          console.log("[Filemoon] URL encontrada: " + m3u8Url.substring(0, 80) + "...");
          var finalUrl = m3u8Url, quality = "1080p";
          if (m3u8Url.includes("master")) {
            try {
              var masterResp = yield fetch(m3u8Url, { headers: { "User-Agent": UA, "Referer": embedUrl } }).then(function(r) { return r.text(); });
              var lines = masterResp.split("\n");
              var bestHeight = 0, bestWidth = 0, bestUrl = m3u8Url;
              for (var i2 = 0; i2 < lines.length; i2++) {
                var line = lines[i2].trim();
                if (line.startsWith("#EXT-X-STREAM-INF")) {
                  var mRes = line.match(/RESOLUTION=(\d+)x(\d+)/);
                  var w = mRes ? parseInt(mRes[1]) : 0, h = mRes ? parseInt(mRes[2]) : 0;
                  for (var j = i2 + 1; j < i2 + 3 && j < lines.length; j++) {
                    var urlLine = lines[j].trim();
                    if (urlLine && !urlLine.startsWith("#") && h > bestHeight) { bestHeight = h; bestWidth = w; bestUrl = urlLine.startsWith("http") ? urlLine : new URL(urlLine, m3u8Url).toString(); break; }
                  }
                }
              }
              if (bestHeight > 0) { finalUrl = bestUrl; quality = normalizeResolution(bestWidth, bestHeight); console.log("[Filemoon] Mejor calidad: " + quality); }
            } catch (e) { console.log("[Filemoon] No se pudo parsear master: " + e.message); }
          }
          return { url: finalUrl, quality: quality, headers: { "User-Agent": UA, "Referer": embedUrl, "Origin": "https://filemoon.sx" } };
        } catch (error) { console.log("[Filemoon] Error: " + error.message); return null; }
      });
    }
    module2.exports = { resolve };
  }
});

// src/resolvers/voe.js
var require_voe = __commonJS({
  "src/resolvers/voe.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function b64toString(str) {
      try { return typeof atob !== "undefined" ? atob(str) : Buffer.from(str, "base64").toString("utf8"); } catch (e) { return null; }
    }
    function voeDecode(ct, luts) {
      try {
        var rawLuts = luts.replace(/^\[|\]$/g, "").split("','").map(function(s) { return s.replace(/^'+|'+$/g, ""); });
        var escapedLuts = rawLuts.map(function(i) { return i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); });
        var txt = "";
        for (var i = 0; i < ct.length; i++) { var ch = ct[i], x = ch.charCodeAt(0); if (x > 64 && x < 91) x = (x - 52) % 26 + 65; else if (x > 96 && x < 123) x = (x - 84) % 26 + 97; txt += String.fromCharCode(x); }
        for (var i2 = 0; i2 < escapedLuts.length; i2++) { txt = txt.replace(new RegExp(escapedLuts[i2], "g"), "_"); }
        txt = txt.split("_").join("");
        var decoded1 = b64toString(txt);
        if (!decoded1) return null;
        var step4 = "";
        for (var i3 = 0; i3 < decoded1.length; i3++) step4 += String.fromCharCode((decoded1.charCodeAt(i3) - 3 + 256) % 256);
        return b64toString(step4.split("").reverse().join(""));
      } catch (e) { console.log("[VOE] voeDecode error:", e.message); return null; }
    }
    function fetchUrl(url, headers) { return __async(this, arguments, function* (url, headers_) { headers_ = headers_ || {}; return yield fetch(url, { method: "GET", headers: __spreadValues({ "User-Agent": UA, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" }, headers_), redirect: "follow" }); }); }
    function resolve(embedUrl) {
      return __async(this, null, function* () {
        try {
          console.log("[VOE] Resolviendo: " + embedUrl);
          var pageResp = yield fetchUrl(embedUrl, { Referer: embedUrl });
          if (!pageResp.ok) throw new Error("HTTP " + pageResp.status);
          var data = yield pageResp.text();
          if (/permanentToken/i.test(data)) { var m2 = data.match(/window\.location\.href\s*=\s*'([^']+)'/i); if (m2) { console.log("[VOE] Permanent token redirect -> " + m2[1]); var r2 = yield fetchUrl(m2[1], { Referer: embedUrl }); if (r2.ok) data = yield r2.text(); } }
          var rMain = data.match(/json">\s*\[\s*['"]([^'"]+)['"]\s*\]\s*<\/script>\s*<script[^>]*src=['"]([^'"]+)['"]/i);
          if (rMain) {
            var jsResp = yield fetchUrl(rMain[2].startsWith("http") ? rMain[2] : new URL(rMain[2], embedUrl).href, { Referer: embedUrl });
            var jsData = jsResp.ok ? yield jsResp.text() : "";
            var replMatch = jsData.match(/(\[(?:'[^']{1,10}'[\s,]*){4,12}\])/i) || jsData.match(/(\[(?:"[^"]{1,10}"[,\s]*){4,12}\])/i);
            if (replMatch) { var decoded = voeDecode(rMain[1], replMatch[1]); if (decoded && (decoded.source || decoded.direct_access_url)) { var url = decoded.source || decoded.direct_access_url; console.log("[VOE] URL encontrada: " + url.substring(0, 80) + "..."); return { url: url, quality: "1080p", headers: { Referer: embedUrl } }; } }
          }
          var re1 = /(?:mp4|hls)'\s*:\s*'([^']+)'/gi, re2 = /(?:mp4|hls)"\s*:\s*"([^"]+)"/gi, matches = [];
          var m; while ((m = re1.exec(data)) !== null) matches.push(m); while ((m = re2.exec(data)) !== null) matches.push(m);
          for (var i = 0; i < matches.length; i++) { var candidate = matches[i][1]; if (candidate) { var url = candidate; if (url.startsWith("aHR0")) { try { url = atob(url); } catch (e) {} } console.log("[VOE] URL encontrada (fallback): " + url.substring(0, 80) + "..."); return { url: url, quality: "1080p", headers: { Referer: embedUrl } }; } }
          console.log("[VOE] No se encontró URL"); return null;
        } catch (err) { console.log("[VOE] Error: " + err.message); return null; }
      });
    }
    module2.exports = { resolve };
  }
});

// src/resolvers/vidhide.js
var require_vidhide = __commonJS({
  "src/resolvers/vidhide.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function unpack(packed) {
      try {
        var match = packed.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
        if (!match) return null;
        var p = match[1], a = parseInt(match[2]), c = parseInt(match[3]), k = match[4].split("|");
        var base = function(num, b) { var chars = "0123456789abcdefghijklmnopqrstuvwxyz", result = ""; while (num > 0) { result = chars[num % b] + result; num = Math.floor(num / b); } return result || "0"; };
        return p.replace(/\b\w+\b/g, function(word) { var num = parseInt(word, 36); return num < k.length && k[num] ? k[num] : base(num, a); });
      } catch (e) { return null; }
    }
    function resolve(embedUrl) {
      return __async(this, null, function* () {
        try {
          console.log("[VidHide] Resolviendo: " + embedUrl);
          var resp = yield fetch(embedUrl, { method: "GET", headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Referer": "https://embed69.org/" }, redirect: "follow" });
          if (!resp.ok) throw new Error("HTTP " + resp.status);
          var html = yield resp.text();
          var evalMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
          if (!evalMatch) { console.log("[VidHide] No se encontró bloque eval"); return null; }
          var unpacked = unpack(evalMatch[0]);
          if (!unpacked) { console.log("[VidHide] No se pudo desempacar"); return null; }
          var hls4Match = unpacked.match(/"hls4"\s*:\s*"([^"]+)"/);
          var hls2Match = unpacked.match(/"hls2"\s*:\s*"([^"]+)"/);
          var m3u8Relative = hls4Match ? hls4Match[1] : (hls2Match ? hls2Match[1] : null);
          if (!m3u8Relative) { console.log("[VidHide] No se encontró hls4/hls2"); return null; }
          var m3u8Url = m3u8Relative;
          if (!m3u8Relative.startsWith("http")) { var origin2 = new URL(embedUrl).origin; m3u8Url = origin2 + m3u8Relative; }
          console.log("[VidHide] URL encontrada: " + m3u8Url.substring(0, 80) + "...");
          var origin = new URL(embedUrl).origin;
          return { url: m3u8Url, headers: { "User-Agent": UA, "Referer": origin + "/", "Origin": origin } };
        } catch (e) { console.log("[VidHide] Error: " + e.message); return null; }
      });
    }
    module2.exports = { resolve };
  }
});

// src/resolvers/streamtape.js
var require_streamtape = __commonJS({
  "src/resolvers/streamtape.js"(exports2, module2) {
    var { getSessionUA } = require_http();
    function resolve(url, signal = null) {
      return __async(this, null, function* () {
        try {
          const UA2 = getSessionUA();
          console.log(`[Streamtape] Resolving: ${url}`);
          const response = yield fetch(url, {
            signal,
            headers: {
              "User-Agent": UA2,
              "Referer": "https://streamtape.com/"
            }
          });
          if (!response.ok)
            return null;
          const html = yield response.text();
          const linkMatch = html.match(/document\.getElementById\(['"]robotlink['"]\)\.innerHTML\s*=\s*['"]([^'"]+)['"]\s*\+\s*\(['"]([^'"]+)['"]\);/i) || html.match(/document\.getElementById\(['"]videolink['"]\)\.innerHTML\s*=\s*['"]([^'"]+)['"]\s*\+\s*\(['"]([^'"]+)['"]\);/i);
          let finalUrl = null;
          if (linkMatch) {
            finalUrl = linkMatch[1] + linkMatch[2];
          } else {
            const rawMatch = html.match(/['"](\/\/streamtape\.com\/get_video\?id=[^'"]+)['"]/);
            if (rawMatch)
              finalUrl = rawMatch[1];
          }
          if (finalUrl) {
            if (finalUrl.startsWith("//"))
              finalUrl = "https:" + finalUrl;
            let isLive = true;
            try {
              const check = yield fetch(finalUrl, { method: "HEAD", headers: { "User-Agent": UA2, "Referer": url }, signal });
              if (!check.ok) {
                console.log(`[Streamtape] \u2717 Enlace no v\xE1lido (Status: ${check.status})`);
                isLive = false;
                if (check.status === 404 || check.status === 403)
                  return null;
              }
            } catch (e) {
            }
            return {
              url: finalUrl,
              quality: "720p",
              // Streamtape suele ser estático
              verified: isLive,
              serverName: "Streamtape",
              headers: { "User-Agent": UA2, "Referer": url }
            };
          }
          return null;
        } catch (e) {
          console.error(`[Streamtape] Error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve };
  }
});

// src/resolvers/player_cdn.js
var require_player_cdn = __commonJS({
  "src/resolvers/player_cdn.js"(exports2, module2) {
    var { getSessionUA } = require_http();
    function resolve(url, signal = null) {
      return __async(this, null, function* () {
        try {
          const UA2 = getSessionUA();
          console.log(`[Player-CDN] Resolving: ${url}`);
          const response = yield fetch(url, {
            signal,
            headers: {
              "User-Agent": UA2,
              "Referer": "https://xupalace.org/"
            }
          });
          if (!response.ok)
            return null;
          const html = yield response.text();
          let finalUrl = null;
          const patterns = [
            /sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/i,
            /file\s*:\s*["']([^"']+)["']/i,
            /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
            /["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i
          ];
          for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match) {
              finalUrl = match[1];
              break;
            }
          }
          if (finalUrl) {
            if (finalUrl.startsWith("//"))
              finalUrl = "https:" + finalUrl;
            try {
              const check = yield fetch(finalUrl, { method: "HEAD", headers: { "User-Agent": UA2 } });
              if (check.status === 404)
                return null;
            } catch (e) {
            }
            return {
              url: finalUrl,
              verified: true,
              serverName: "Player-CDN",
              headers: { "User-Agent": UA2, "Referer": url }
            };
          }
          return null;
        } catch (e) {
          console.error(`[Player-CDN] Error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve };
  }
});

// src/resolvers/ggtz.js
var require_ggtz = __commonJS({
  "src/resolvers/ggtz.js"(exports2, module2) {
    var { getSessionUA } = require_http();
    function resolve(url, signal = null) {
      return __async(this, null, function* () {
        try {
          const UA2 = getSessionUA();
          console.log(`[GGTZ] Resolving: ${url}`);
          const response = yield fetch(url, {
            signal,
            headers: {
              "User-Agent": UA2,
              "Referer": "https://xupalace.org/"
            }
          });
          if (!response.ok)
            return null;
          const html = yield response.text();
          const refreshMatch = html.match(/content=["']\d+;\s*url=([^"']+)["']/i);
          const scriptMatch = html.match(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/i) || html.match(/window\.open\(['"]([^'"]+)['"]/);
          let nextUrl = refreshMatch ? refreshMatch[1] : scriptMatch ? scriptMatch[1] : null;
          if (!nextUrl) {
            const downloadMatch = html.match(/href=["']([^"']+\.(?:mp4|mkv|m3u8)[^"']*)["']/i);
            if (downloadMatch)
              nextUrl = downloadMatch[1];
          }
          if (nextUrl) {
            if (nextUrl.startsWith("/"))
              nextUrl = new URL(url).origin + nextUrl;
            return {
              url: nextUrl,
              verified: true,
              serverName: "GGTZ-Internal",
              headers: {
                "User-Agent": UA2,
                "Referer": url
              }
            };
          }
          return null;
        } catch (e) {
          console.error(`[GGTZ] Error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { resolve };
  }
});

// src/xupalace/index.js
var axios = require("axios");
var { finalizeStreams } = require_engine();
var { getTmdbTitle } = require_tmdb();
var { resolve: resolveHlsWish } = require_hlswish();
var { resolve: resolveFilemoon } = require_filemoon();
var { resolve: resolveVoe } = require_voe();
var { resolve: resolveVidhide } = require_vidhide();
var { resolve: resolveStreamtape } = require_streamtape();
var { resolve: resolvePlayerCdn } = require_player_cdn();
var { resolve: resolveGgtz } = require_ggtz();
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE_URL = "https://xupalace.org";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
var HTML_HEADERS = {
  "User-Agent": UA,
  "Accept": "text/html",
  "Accept-Language": "es-MX,es;q=0.9",
  "Connection": "keep-alive",
  "Cache-Control": "no-cache"
};
var RESOLVER_MAP = {
  "hglink.to": { fn: resolveHlsWish, name: "StreamWish" },
  "vibuxer.com": { fn: resolveHlsWish, name: "StreamWish" },
  "hanerix.com": { fn: resolveHlsWish, name: "StreamWish" },
  "embedwish.com": { fn: resolveHlsWish, name: "StreamWish" },
  "strwish.com": { fn: resolveHlsWish, name: "StreamWish" },
  "wishfast.top": { fn: resolveHlsWish, name: "StreamWish" },
  "sfastwish.com": { fn: resolveHlsWish, name: "StreamWish" },
  "streamwish.to": { fn: resolveHlsWish, name: "StreamWish" },
  "awish.pro": { fn: resolveHlsWish, name: "StreamWish" },
  "bysedikamoum.com": { fn: resolveFilemoon, name: "Filemoon" },
  "filemoon.sx": { fn: resolveFilemoon, name: "Filemoon" },
  "voe.sx": { fn: resolveVoe, name: "VOE" },
  "voe-un-block.com": { fn: resolveVoe, name: "VOE" },
  "vidhidepro.com": { fn: resolveVidhide, name: "VidHide" },
  "vidhide.com": { fn: resolveVidhide, name: "VidHide" },
  "dintezuvio.com": { fn: resolveVidhide, name: "VidHide" },
  "filelions.to": { fn: resolveVidhide, name: "VidHide" },
  "vidhidepre.com": { fn: resolveVidhide, name: "VidHide" },
  "streamtape.com": { fn: resolveStreamtape, name: "Streamtape" },
  "player-cdn.com": { fn: resolvePlayerCdn, name: "Player-CDN" },
  "xupalace.org": { fn: resolveGgtz, name: "GGTZ-Internal" }
};
function getImdbId(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const type = mediaType === "movie" || mediaType === "movies" ? "movie" : "tv";
      const url = `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`;
      const { data } = yield axios.get(url, { timeout: 3e3, headers: { "User-Agent": UA } });
      return data.imdb_id || null;
    } catch (e) {
      return null;
    }
  });
}
function getXuSlugs(imdbId, title) {
  const variants = [];
  if (imdbId)
    variants.push(imdbId);
  if (title) {
    const titleUpper = title.toUpperCase();
    const fullSlug = titleUpper.replace(/[^A-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (fullSlug)
      variants.push(fullSlug);
    if (titleUpper.startsWith("THE ")) {
      const noThe = titleUpper.replace("THE ", "").replace(/[^A-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      if (noThe)
        variants.push(noThe);
    }
    const firstWord = titleUpper.split(" ")[0].replace(/[^A-Z0-9]/g, "");
    if (firstWord && firstWord !== "THE")
      variants.push(firstWord);
  }
  return [...new Set(variants)];
}
function getEmbeds(slug, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const path = mediaType === "movie" || mediaType === "movies" ? `/video/${slug}/` : `/video/${slug}-${season}x${String(episode).padStart(2, "0")}/`;
      const { data: html } = yield axios.get(`${BASE_URL}${path}`, {
        timeout: 4500,
        // Timeout agresivo para búsqueda paralela
        headers: HTML_HEADERS
      });
      const matches = [...html.matchAll(/go_to_playerVast\('(https?:\/\/[^']+)'[^)]+\)[^<]*data-lang="(\d+)"/g)];
      if (matches.length === 0) {
        const fallback = [...html.matchAll(/go_to_playerVast\('(https?:\/\/[^']+)'/g)];
        if (fallback.length === 0)
          return null;
        return { 0: [...new Set(fallback.map((m) => m[1]))], _slug: slug };
      }
      const byLang = { _slug: slug };
      let hasData = false;
      for (const m of matches) {
        const url = m[1];
        const lang = parseInt(m[2]);
        if (!byLang[lang])
          byLang[lang] = [];
        if (!byLang[lang].includes(url)) {
          byLang[lang].push(url);
          hasData = true;
        }
      }
      return hasData ? byLang : null;
    } catch (e) {
      return null;
    }
  });
}
function getStreams(tmdbId, mediaType, season, episode, title) {
  return __async(this, null, function* () {
    if (!tmdbId)
      return [];
    let mediaTitle = title || (yield getTmdbTitle(tmdbId, mediaType));
    const LANG_NAMES = { 0: "Latino", 1: "Espa\xF1ol", 2: "Subtitulado" };
    try {
      const imdbId = yield getImdbId(tmdbId, mediaType);
      const slugVariants = getXuSlugs(imdbId, mediaTitle);
      console.log(`[XuPalace Turbo] Lanzando ${slugVariants.length} b\xFAsquedas en paralelo...`);
      const searchPromises = slugVariants.map((s) => getEmbeds(s, mediaType, season, episode));
      const resultsPool = yield Promise.all(searchPromises);
      let winner = null;
      for (const res of resultsPool) {
        if (res && Object.keys(res).length > 1) {
          winner = res;
          break;
        }
      }
      if (!winner)
        return [];
      console.log(`[XuPalace Turbo] Ganador: ${winner._slug}. Resolviendo enlaces...`);
      let allStreams = [];
      for (const lang of [0, 1, 2]) {
        const urls = winner[lang];
        if (!urls || urls.length === 0)
          continue;
        const langName = LANG_NAMES[lang];
        const resolutionResults = yield Promise.allSettled(
          urls.map((url) => __async(this, null, function* () {
            var _a;
            try {
              const urlObj = new URL(url);
              const domain = urlObj.hostname.replace("www.", "");
              const resolver = RESOLVER_MAP[domain];
              if (!resolver)
                return null;
              const result = yield resolver.fn(url);
              if (result) {
                return {
                  langLabel: langName,
                  serverLabel: resolver.name,
                  url: result.url,
                  quality: result.quality || "1080p",
                  verified: (_a = result.verified) != null ? _a : true,
                  // v6.0.1: Asegurar check verde ✅
                  headers: result.headers || {}
                };
              }
            } catch (e) {
            }
            return null;
          }))
        );
        const valid = resolutionResults.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
        if (valid.length > 0) {
          allStreams.push(...valid);
          if (lang === 0)
            break;
        }
      }
      return yield finalizeStreams(allStreams, "XuPalace", mediaTitle);
    } catch (e) {
      return [];
    }
  });
}
module.exports = { getStreams };
