const axios = require('axios');
const path = require('path');
const { Parser } = require('m3u8-parser');

class ProxyService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Proxies and rewrites an M3U8 playlist to ensure all segments and sub-playlists
   * are also routed through the proxy.
   */
  async proxyM3U8(url, proxyPrefix, headers = {}) {
    try {
      const targetOrigin = new URL(url).origin;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Referer': targetOrigin,
          ...headers
        },
        timeout: 10000
      });

      const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
      const content = response.data;
      
      // We rewrite the M3U8 content line by line
      const lines = content.split('\n');
      const rewrittenLines = lines.map(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) {
          // It's a comment or tag, but some tags contain URLs (like #EXT-X-STREAM-INF)
          if (line.startsWith('#EXT-X-I-FRAME-STREAM-INF') || line.startsWith('#EXT-X-STREAM-INF')) {
            // Find URI="..." and rewrite it
            return line.replace(/URI="([^"]+)"/g, (match, uri) => {
              const absoluteUri = this.getAbsoluteUrl(uri, baseUrl);
              return `URI="${this.getProxyUrl(absoluteUri, proxyPrefix)}"`;
            });
          }
          if (line.startsWith('#EXT-X-MEDIA')) {
            return line.replace(/URI="([^"]+)"/g, (match, uri) => {
              const absoluteUri = this.getAbsoluteUrl(uri, baseUrl);
              return `URI="${this.getProxyUrl(absoluteUri, proxyPrefix)}"`;
            });
          }
          return line;
        }

        // It's a segment or sub-playlist URL
        const absoluteUrl = this.getAbsoluteUrl(line, baseUrl);
        return this.getProxyUrl(absoluteUrl, proxyPrefix);
      });

      return {
        content: rewrittenLines.join('\n'),
        contentType: response.headers['content-type'] || 'application/vnd.apple.mpegurl'
      };
    } catch (error) {
      console.error('[ProxyService] Error proxying M3U8:', error.message);
      throw error;
    }
  }

  getAbsoluteUrl(url, baseUrl) {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      const origin = new URL(baseUrl).origin;
      return origin + url;
    }
    return baseUrl + url;
  }

  getProxyUrl(targetUrl, proxyPrefix) {
    return `${proxyPrefix}?url=${encodeURIComponent(targetUrl)}`;
  }
}

module.exports = new ProxyService();
