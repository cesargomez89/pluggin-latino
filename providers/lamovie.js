var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE_URL = "https://la.movie";
var API_URL = "https://la.movie/wp-api/v1";
var ANIME_COUNTRIES = ["JP", "CN", "KR"];
var GENRE_ANIMATION = 16;
var DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 13; Chromecast) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json"
};

function httpGet(url, extraHeaders) {
  var headers = Object.assign({}, DEFAULT_HEADERS, extraHeaders || {});
  return fetch(url, { headers: headers, redirect: "follow" }).then(function (res) {
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
    var ct = res.headers.get("content-type") || "";
    if (ct.indexOf("json") !== -1) return res.json();
    return res.text();
  });
}

function normalizeQuality(quality) {
  var str = quality.toString().toLowerCase();
  var match = str.match(/(\d+)/);
  if (match) return match[1] + "p";
  if (str.indexOf("4k") !== -1 || str.indexOf("uhd") !== -1) return "2160p";
  if (str.indexOf("full") !== -1 || str.indexOf("fhd") !== -1) return "1080p";
  if (str.indexOf("hd") !== -1) return "720p";
  return "SD";
}

function getServerName(url) {
  if (url.indexOf("goodstream") !== -1) return "GoodStream";
  if (url.indexOf("hlswish") !== -1 || url.indexOf("streamwish") !== -1 || url.indexOf("strwish") !== -1 || url.indexOf("vibuxer") !== -1) return "StreamWish";
  if (url.indexOf("voe.sx") !== -1) return "VOE";
  if (url.indexOf("filemoon") !== -1) return "Filemoon";
  if (url.indexOf("vimeos.net") !== -1) return "Vimeos";
  if (url.indexOf("dood") !== -1 || url.indexOf("d0000d") !== -1) return "DoodStream";
  return "Online";
}

function buildSlug(title, year) {
  var slug = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return year ? slug + "-" + year : slug;
}

function getCategories(mediaType, genres, originCountries) {
  if (mediaType === "movie") return ["peliculas"];
  var isAnimation = (genres || []).indexOf(GENRE_ANIMATION) !== -1;
  if (!isAnimation) return ["series"];
  var isAnimeCountry = false;
  for (var i = 0; i < (originCountries || []).length; i++) {
    if (ANIME_COUNTRIES.indexOf(originCountries[i]) !== -1) {
      isAnimeCountry = true;
      break;
    }
  }
  return isAnimeCountry ? ["animes"] : ["animes", "series"];
}

function getTmdbData(tmdbId, mediaType) {
  var type = mediaType === "movie" ? "movie" : "tv";
  var attempts = [
    { lang: "es-MX", name: "Latino" },
    { lang: "en-US", name: "Inglés" }
  ];

  function tryLang(lang, name) {
    var url = "https://api.themoviedb.org/3/" + type + "/" + tmdbId + "?api_key=" + TMDB_API_KEY + "&language=" + lang;
    return httpGet(url).then(function (data) {
      var title = type === "movie" ? data.title : data.name;
      var originalTitle = type === "movie" ? data.original_title : data.original_name;
      if (lang === "es-MX" && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(title)) {
        return Promise.reject(new Error("CJK in Spanish"));
      }
      console.log("[LaMovie] TMDB (" + name + "): \"" + title + "\"" + (title !== originalTitle ? " | Original: \"" + originalTitle + "\"" : ""));
      var year = (type === "movie" ? data.release_date || "" : data.first_air_date || "").slice(0, 4);
      var genresArr = (data.genres || []).map(function (g) { return g.id; });
      var originCountries = data.origin_country || (data.production_countries || []).map(function (c) { return c.iso_3166_1; }) || [];
      return { title: title, originalTitle: originalTitle, year: year, genres: genresArr, originCountries: originCountries };
    });
  }

  return tryLang(attempts[0].lang, attempts[0].name).catch(function (e) {
    console.log("[LaMovie] Error TMDB Latino: " + e.message);
    return tryLang(attempts[1].lang, attempts[1].name);
  });
}

function extractIdFromHtml(html) {
  var match = html.match(/rel=['"]shortlink['"]\s+href=['"][^'"]*\?p=(\d+)['"]/);
  return match ? match[1] : null;
}

function getIdBySlug(category, slug) {
  var url = BASE_URL + "/" + category + "/" + slug + "/";
  return httpGet(url, { "Accept": "text/html" }).then(function (html) {
    var id = extractIdFromHtml(html);
    if (id) {
      console.log("[LaMovie] ✓ Slug directo: /" + category + "/" + slug + " → id:" + id);
      return { id: id };
    }
    return null;
  }).catch(function () {
    return null;
  });
}

function findBySlug(tmdbInfo, mediaType) {
  var title = tmdbInfo.title;
  var originalTitle = tmdbInfo.originalTitle;
  var year = tmdbInfo.year;
  var genres = tmdbInfo.genres;
  var originCountries = tmdbInfo.originCountries;

  var categories = getCategories(mediaType, genres, originCountries);
  var slugs = [];

  if (title) slugs.push(buildSlug(title, year));
  if (originalTitle && originalTitle !== title) slugs.push(buildSlug(originalTitle, year));

  function trySlug(slug, cats) {
    if (cats.length === 1) {
      return getIdBySlug(cats[0], slug);
    }
    return Promise.all(cats.map(function (cat) {
      return getIdBySlug(cat, slug).catch(function () { return null; });
    })).then(function (results) {
      for (var i = 0; i < results.length; i++) {
        if (results[i]) return results[i];
      }
      return null;
    });
  }

  function tryAllSlugs(idx) {
    if (idx >= slugs.length) return Promise.resolve(null);
    return trySlug(slugs[idx], categories).then(function (result) {
      if (result) return result;
      return tryAllSlugs(idx + 1);
    });
  }

  return tryAllSlugs(0);
}

function getEpisodeId(seriesId, seasonNum, episodeNum) {
  var url = API_URL + "/single/episodes/list?_id=" + seriesId + "&season=" + seasonNum + "&page=1&postsPerPage=50";
  return httpGet(url).then(function (data) {
    if (!data || !data.data || !data.data.posts) return null;
    var posts = data.data.posts;
    for (var i = 0; i < posts.length; i++) {
      var e = posts[i];
      if (String(e.season_number) === String(seasonNum) && String(e.episode_number) === String(episodeNum)) {
        console.log("[LaMovie] Episodio S" + seasonNum + "E" + episodeNum + " id:" + e._id);
        return String(e._id);
      }
    }
    console.log("[LaMovie] Episodio S" + seasonNum + "E" + episodeNum + " no encontrado");
    return null;
  }).catch(function (err) {
    console.log("[LaMovie] Error episodios: " + err.message);
    return null;
  });
}

function b64decode(str) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var result = "";
  var i = 0;
  var s = str.replace(/[^A-Za-z0-9+/]/g, "");
  while (i < s.length) {
    var a = chars.indexOf(s[i++]);
    var b = chars.indexOf(s[i++]);
    var c = i < s.length ? chars.indexOf(s[i++]) : -1;
    var d = i < s.length ? chars.indexOf(s[i++]) : -1;
    var cb = c === -1 ? 0 : c;
    var db = d === -1 ? 0 : d;
    var n = a << 18 | b << 12 | cb << 6 | db;
    result += String.fromCharCode(n >> 16 & 255);
    if (c !== -1) result += String.fromCharCode(n >> 8 & 255);
    if (d !== -1) result += String.fromCharCode(n & 255);
  }
  return result;
}

function unpackEval(payload, radix, symtab) {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return payload.replace(/\b([0-9a-zA-Z]+)\b/g, function (match) {
    var result = 0;
    for (var i = 0; i < match.length; i++) {
      var pos = chars.indexOf(match[i]);
      if (pos === -1) return match;
      result = result * radix + pos;
    }
    if (isNaN(result) || result >= symtab.length) return match;
    return symtab[result] && symtab[result] !== "" ? symtab[result] : match;
  });
}

function normalizeResolution(width, height) {
  if (width >= 3840 || height >= 2160) return "4K";
  if (width >= 1920 || height >= 1080) return "1080p";
  if (width >= 1280 || height >= 720) return "720p";
  if (width >= 854 || height >= 480) return "480p";
  return "360p";
}

function detectQuality(m3u8Url, headers) {
  return fetch(m3u8Url, {
    headers: Object.assign({ "User-Agent": DEFAULT_HEADERS["User-Agent"] }, headers),
    redirect: "follow"
  }).then(function (res) {
    return res.text();
  }).then(function (data) {
    if (data.indexOf("#EXT-X-STREAM-INF") === -1) {
      var match = m3u8Url.match(/[_-](\d{3,4})p/);
      return match ? match[1] + "p" : "1080p";
    }
    var bestHeight = 0;
    var bestWidth = 0;
    var lines = data.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var m = lines[i].match(/RESOLUTION=(\d+)x(\d+)/);
      if (m) {
        var w = parseInt(m[1]);
        var h = parseInt(m[2]);
        if (h > bestHeight) {
          bestHeight = h;
          bestWidth = w;
        }
      }
    }
    return bestHeight > 0 ? normalizeResolution(bestWidth, bestHeight) : "1080p";
  }).catch(function () {
    return "1080p";
  });
}

function resolveGoodstream(embedUrl) {
  var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  return fetch(embedUrl, {
    headers: {
      "User-Agent": UA,
      "Referer": "https://goodstream.one",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    },
    redirect: "follow"
  }).then(function (response) {
    if (!response.ok) throw new Error("HTTP " + response.status);
    return response.text();
  }).then(function (html) {
    var match = html.match(/file:\s*"([^"]+)"/);
    if (!match) {
      console.log("[GoodStream] No se encontró patrón file:\"...\"");
      return null;
    }
    var videoUrl = match[1];
    var refererHeaders = { "Referer": embedUrl, "Origin": "https://goodstream.one", "User-Agent": UA };
    return detectQuality(videoUrl, refererHeaders).then(function (quality) {
      console.log("[GoodStream] URL encontrada (" + quality + "): " + videoUrl.substring(0, 80) + "...");
      return { url: videoUrl, quality: quality, headers: refererHeaders };
    });
  }).catch(function (err) {
    console.log("[GoodStream] Error: " + err.message);
    return null;
  });
}

function resolveVimeos(embedUrl) {
  var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  var originMatch = embedUrl.match(/^(https?:\/\/[^/]+)/);
  var origin = originMatch ? originMatch[1] : "https://vimeos.net";

  return fetch(embedUrl, {
    headers: {
      "User-Agent": UA,
      "Referer": "https://vimeos.net/",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    },
    redirect: "follow"
  }).then(function (resp) {
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    return resp.text();
  }).then(function (data) {
    var packMatch = data.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/);
    if (!packMatch) {
      console.log("[Vimeos] No se encontró pack");
      return null;
    }
    var payload = packMatch[1];
    var radix = parseInt(packMatch[2]);
    var symtab = packMatch[4].split("|");

    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var unbase = function (str) {
      var result = 0;
      for (var i = 0; i < str.length; i++) {
        result = result * radix + chars.indexOf(str[i]);
      }
      return result;
    };

    var unpacked = payload.replace(/\b(\w+)\b/g, function (match) {
      var idx = unbase(match);
      return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
    });

    var m3u8Match = unpacked.match(/["']([^"']+\.m3u8[^"']*)['"]/i);
    if (!m3u8Match) {
      console.log("[Vimeos] No se encontró m3u8");
      return null;
    }

    var url = m3u8Match[1];
    var refererHeaders = { "User-Agent": UA, "Referer": "https://vimeos.net/" };
    return detectQuality(url, refererHeaders).then(function (quality) {
      console.log("[Vimeos] URL encontrada: " + url.substring(0, 80) + "...");
      return { url: url, quality: quality, headers: refererHeaders };
    });
  }).catch(function (err) {
    console.log("[Vimeos] Error: " + err.message);
    return null;
  });
}

var RESOLVERS = {
  "goodstream.one": resolveGoodstream,
  "vimeos.net": resolveVimeos
};

function getResolver(url) {
  for (var pattern in RESOLVERS) {
    if (url.indexOf(pattern) !== -1) return RESOLVERS[pattern];
  }
  return null;
}

function processEmbed(embed) {
  var resolver = getResolver(embed.url);
  if (!resolver) {
    console.log("[LaMovie] Sin resolver para: " + embed.url);
    return Promise.resolve(null);
  }
  return resolver(embed.url).then(function (result) {
    if (!result || !result.url) return null;
    var quality = normalizeQuality(embed.quality || "1080p");
    var serverName = getServerName(embed.url);
    return {
      name: "LaMovie",
      title: quality + " · " + serverName,
      url: result.url,
      quality: quality,
      headers: result.headers || {}
    };
  }).catch(function (e) {
    console.log("[LaMovie] Error procesando embed: " + e.message);
    return null;
  });
}

function getStreams(tmdbId, mediaType, season, episode) {
  if (!tmdbId || !mediaType) return Promise.resolve([]);
  var startTime = Date.now();
  var resolvedType = mediaType === "series" ? "tv" : mediaType || "movie";

  console.log("[LaMovie] Buscando: TMDB " + tmdbId + " (" + resolvedType + ")" + (season ? " S" + season + "E" + episode : ""));

  return getTmdbData(tmdbId, resolvedType).then(function (tmdbInfo) {
    if (!tmdbInfo) return [];
    return findBySlug(tmdbInfo, resolvedType).then(function (found) {
      if (!found) {
        console.log("[LaMovie] No encontrado por slug");
        return [];
      }

      var targetId = found.id;

      if (resolvedType === "tv" && season && episode) {
        return getEpisodeId(targetId, season, episode).then(function (epId) {
          if (!epId) {
            console.log("[LaMovie] Episodio S" + season + "E" + episode + " no encontrado");
            return [];
          }
          targetId = epId;
          return targetId;
        });
      }
      return targetId;
    }).then(function (id) {
      if (!id || !id.length) return [];
      return httpGet(API_URL + "/player?postId=" + id + "&demo=0").then(function (data) {
        if (!data || !data.data || !data.data.embeds) {
          console.log("[LaMovie] No hay embeds disponibles");
          return [];
        }

        var embeds = data.data.embeds;
        var promises = embeds.map(function (embed) {
          return processEmbed(embed);
        });

        return Promise.all(promises).then(function (results) {
          var streams = results.filter(function (r) { return r; });
          var elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
          console.log("[LaMovie] ✓ " + streams.length + " streams en " + elapsed + "s");
          return streams;
        });
      });
    });
  }).catch(function (err) {
    console.log("[LaMovie] Error: " + err.message);
    return [];
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getStreams: getStreams };
} else {
  global.getStreams = getStreams;
}