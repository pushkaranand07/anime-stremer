const path = require('path');
const os = require('os');
const logger = require('../../utils/logger');

class TorrentService {
  constructor() {
    this.client = null;
    this.streams = new Map(); // torrentId -> stream info
  }

  async getClient() {
    if (!this.client) {
      const { default: WebTorrent } = await import('webtorrent');
      this.client = new WebTorrent();
    }
    return this.client;
  }

  async startStream(magnetUri) {
    if (this.streams.has(magnetUri)) {
      return this.streams.get(magnetUri);
    }

    return new Promise(async (resolve, reject) => {
      const client = await this.getClient();
      client.add(magnetUri, { path: path.join(os.tmpdir(), 'seanime-torrents') }, (torrent) => {
        logger.info(`[TorrentService] Torrent added: ${torrent.name}`);

        // Find the largest file (usually the video)
        const file = torrent.files.reduce((a, b) => (a.length > b.length ? a : b));

        const streamInfo = {
          id: magnetUri,
          name: torrent.name,
          fileName: file.name,
          length: file.length,
          file: file,
          progress: 0
        };

        this.streams.set(magnetUri, streamInfo);

        torrent.on('download', () => {
          streamInfo.progress = torrent.progress;
        });

        resolve(streamInfo);
      });

      client.on('error', (err) => {
        logger.error(`[TorrentService] Client Error: ${err.message}`);
        reject(err);
      });
    });
  }

  getStream(magnetUri, range) {
    const streamInfo = this.streams.get(magnetUri);
    if (!streamInfo) return null;

    // WebTorrent's createReadStream handles sequential prioritization automatically
    return streamInfo.file.createReadStream(range);
  }
}

module.exports = new TorrentService();
