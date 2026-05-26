const BASE_URL = 'https://kitsu.io/api/edge';

const normalizeJsonApiData = (payload) => {
  if (!payload || !payload.data) return [];
  return payload.data.map((item) => ({
    id: item.id,
    ...item.attributes,
    relationships: item.relationships,
  }));
};

const normalizeJsonApiItem = (payload) => {
  if (!payload || !payload.data) return null;
  return {
    id: payload.data.id,
    ...payload.data.attributes,
    relationships: payload.data.relationships,
  };
};

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

const KITSU_MAX_PAGE_LIMIT = 20;

const rawGet = async (path, params = {}) => {
  const safeParams = { ...params };
  if (safeParams['page[limit]'] !== undefined) {
    safeParams['page[limit]'] = Math.min(Number(safeParams['page[limit]']) || KITSU_MAX_PAGE_LIMIT, KITSU_MAX_PAGE_LIMIT);
  }
  const query = buildQueryString(safeParams);
  const url = `${BASE_URL}/${path}${query ? `?${query}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    const payload = await response.text();
    const error = new Error(`Kitsu request failed: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.body = payload;
    throw error;
  }

  return response.json();
};

export const kitsuClient = {
  getManga: async (params = {}) => {
    const payload = await rawGet('manga', params);
    return {
      items: normalizeJsonApiData(payload),
      meta: payload.meta,
      links: payload.links,
    };
  },

  getMangaById: async (id, params = {}) => {
    const payload = await rawGet(`manga/${id}`, params);
    return normalizeJsonApiItem(payload);
  },

  getMangaChapters: async (mangaId, params = {}) => {
    const payload = await rawGet(`manga/${mangaId}/chapters`, params);
    return normalizeJsonApiData(payload);
  },

  getMangaCharacters: async (mangaId, params = {}) => {
    const payload = await rawGet(`manga/${mangaId}/characters`, params);
    return payload;
  },
};
