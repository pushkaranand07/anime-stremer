const streamingService = require('./streaming.service');
const proxyService = require('./proxy.service');
const torrentService = require('./torrent.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const axios = require('axios');
const logger = require('../../utils/logger');

const getInfo = asyncHandler(async (req, res) => {
  const query = (req.query.q || '').trim();
  logger.info(`[StreamingController] GET /info?q="${query}"`);
  if (!query) throw new ApiError(400, 'Query parameter ?q= is required');

  const result = await streamingService.getAnimeInfo(query);
  res.status(200).json(new ApiResponse(200, 'Anime info fetched', result));
});

const getWatch = asyncHandler(async (req, res) => {
  const { episodeId } = req.params;
  const provider = req.query.provider || 'Hianime';
  const subOrDub = req.query.subOrDub === 'dub' ? 'dub' : 'sub';

  if (!episodeId) throw new ApiError(400, 'Episode ID is required');

  const result = await streamingService.getEpisodeSources(episodeId, provider, subOrDub);
  logger.info(`[StreamingController] Fetched ${result.sources?.length || 0} sources from ${result.provider}`);
  if (result.sources?.length > 0) {
    logger.info(`[StreamingController] First source sample: ${result.sources[0].url.substring(0, 50)}...`);
  }
  res.status(200).json(new ApiResponse(200, 'Video sources fetched', result));
});

/**
 * Advanced Proxy Stream
 * Handles M3U8 rewriting to fix CORS and broken relative paths.
 */
const proxyStream = asyncHandler(async (req, res) => {
  const { url } = req.query;
  if (!url) throw new ApiError(400, 'Stream URL is required');

  const targetUrl = decodeURIComponent(url);
  
  let customHeaders = {};
  if (req.query.headers) {
    try {
      customHeaders = JSON.parse(Buffer.from(req.query.headers, 'base64').toString());
    } catch (e) {
      // Silent fail for malformed headers
    }
  }

  if (targetUrl.includes('.m3u8')) {
    try {
      const protocol = req.protocol;
      const host = req.get('host');
      const proxyPrefix = `${protocol}://${host}/api/v1/streaming/proxy`;
      
      const { content, contentType } = await proxyService.proxyM3U8(targetUrl, proxyPrefix, {
        ...customHeaders,
        'headers': req.query.headers
      });
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(content);
    } catch (err) {
      return res.status(502).json({ error: 'Failed to fetch playlist' });
    }
  }

  try {
    const targetOrigin = new URL(targetUrl).origin;
    const response = await axios.get(targetUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': customHeaders.Referer || targetOrigin,
        ...customHeaders
      },
      timeout: 15000,
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'video/MP2T');
    res.setHeader('Access-Control-Allow-Origin', '*');
    response.data.pipe(res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(err.response?.status || 500).end();
    }
  }
});

/**
 * Torrent Streaming Endpoint
 */
const streamTorrent = asyncHandler(async (req, res) => {
  const { magnet } = req.query;
  if (!magnet) throw new ApiError(400, 'Magnet URI is required');

  const streamInfo = await torrentService.startStream(magnet);
  
  const range = req.headers.range;
  if (!range) {
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', streamInfo.length);
    return res.status(200).end();
  }

  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : streamInfo.length - 1;
  const chunksize = (end - start) + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${streamInfo.length}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': 'video/mp4',
  });

  const stream = torrentService.getStream(magnet, { start, end });
  stream.pipe(res);
});

module.exports = {
  getInfo,
  getWatch,
  proxyStream,
  streamTorrent,
};
