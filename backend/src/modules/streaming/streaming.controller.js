const streamingService = require('./streaming.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

const getInfo = asyncHandler(async (req, res) => {
  const query = (req.query.q || '').trim();
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
  res.status(200).json(new ApiResponse(200, 'Video sources fetched', result));
});

module.exports = {
  getInfo,
  getWatch,
};
