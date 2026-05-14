const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const os = require('os');
const logger = require('../../utils/logger');

class TranscoderService {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'seanime-transcode');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Starts transcoding a local file to HLS
   */
  async transcodeToHLS(filePath, sessionId) {
    const outputDir = path.join(this.tempDir, sessionId);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const playlistPath = path.join(outputDir, 'playlist.m3u8');

    // If playlist already exists, return it
    if (fs.existsSync(playlistPath)) {
      return playlistPath;
    }

    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .addOptions([
          '-profile:v baseline',
          '-level 3.0',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls'
        ])
        .output(playlistPath)
        .on('start', (command) => {
          logger.info(`[Transcoder] Started FFmpeg with command: ${command}`);
          resolve(playlistPath); // Resolve early so client can start polling the playlist
        })
        .on('error', (err) => {
          logger.error(`[Transcoder] Error: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  getSegment(sessionId, segmentName) {
    return path.join(this.tempDir, sessionId, segmentName);
  }
}

module.exports = new TranscoderService();
