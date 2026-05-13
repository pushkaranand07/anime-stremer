require('dotenv').config();
const providerService = require('./src/modules/streaming/provider.service');

async function test() {
  try {
    const res = await providerService.fetchAnimeInfo('Steel Ball Run');
    console.log(res);
  } catch (err) {
    console.error(err);
  }
}

test();
