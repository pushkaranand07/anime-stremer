const path = require('path');
const os = require('os');
const logger = require('../../utils/logger');

// Maximum number of concurrent torrents to keep in memory
const MAX_STREAMS = 5;

class TorrentService {
  constructor() {
    this.client = null;
    this.streams = new Map(); // magnetUri -> stream info
  }

  async getClient() {
    if (!this.client) {
      const { default: WebTorrent } = await import('webtorrent');
      this.client = new WebTorrent();
      this.client.on('error', (err) => {
        logger.error(`[TorrentService] Client error: ${err.message}`);
      });
    }
    return this.client;
  }

  _evictOldestIfNeeded() {
    if (this.streams.size >= MAX_STREAMS) {
      // Remove the oldest entry (first inserted)
      const oldestKey = this.streams.keys().next().value;
      const oldestInfo = this.streams.get(oldestKey);
      logger.info(`[TorrentService] Evicting torrent: ${oldestInfo.name}`);
      if (this.client) {
        this.client.remove(oldestKey, { destroyStore: false }, () => {});
      }
      this.streams.delete(oldestKey);
    }
  }

  startStream(magnetUri) {
    if (this.streams.has(magnetUri)) {
      return Promise.resolve(this.streams.get(magnetUri));
    }

    this._evictOldestIfNeeded();

    return new Promise((resolve, reject) => {
      this.getClient().then((client) => {
        client.add(magnetUri, { path: path.join(os.tmpdir(), 'anime-torrents') }, (torrent) => {
          logger.info(`[TorrentService] Torrent added: ${torrent.name}`);

          const file = torrent.files.reduce((a, b) => (a.length > b.length ? a : b));

          const streamInfo = {
            id: magnetUri,
            name: torrent.name,
            fileName: file.name,
            length: file.length,
            file,
            progress: 0,
          };

          this.streams.set(magnetUri, streamInfo);

          torrent.on('download', () => {
            streamInfo.progress = torrent.progress;
          });

          resolve(streamInfo);
        });
      }).catch(reject);
    });
  }

  getStream(magnetUri, range) {
    const streamInfo = this.streams.get(magnetUri);
    if (!streamInfo) return null;
    return streamInfo.file.createReadStream(range);
  }

  destroy() {
    if (this.client) {
      this.client.destroy();
      this.client = null;
    }
    this.streams.clear();
  }
}

const torrentService = new TorrentService();

// Cleanup on process exit
process.on('exit', () => torrentService.destroy());
process.on('SIGINT', () => { torrentService.destroy(); process.exit(0); });
process.on('SIGTERM', () => { torrentService.destroy(); process.exit(0); });

module.exports = torrentService;
