const { ANIME } = require('@consumet/extensions');

async function test() {
  const providers = [
    { name: 'Gogoanime', klass: ANIME.Gogoanime },
    { name: 'AnimePahe', klass: ANIME.AnimePahe },
    { name: 'Hianime', klass: ANIME.Hianime }
  ];

  for (const { name, klass } of providers) {
    try {
      console.log(`Testing ${name}...`);
      const provider = new klass();
      const results = await provider.search('One Piece');
      console.log(`${name} found ${results.results.length} results.`);
      if (results.results.length > 0) {
        const best = results.results[0];
        console.log(`Best match: ${best.title} (${best.id})`);
        const info = await provider.fetchAnimeInfo(best.id);
        console.log(`${name} info episodes count: ${info.episodes?.length || 0}`);
      }
    } catch (err) {
      console.error(`${name} failed: ${err.message}`);
    }
  }
}

test();
