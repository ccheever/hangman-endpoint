let googleTrendsApi = require('google-trends-api');

let dailyTrendsAsync = async (opts) => {
  return await new Promise((resolve, reject) => {
    googleTrendsApi.dailyTrends({ geo: 'US', ...opts }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(result));
      }
    });
  });
};

let justSearchTermsAsync = async (opts) => {
  let trends = await dailyTrendsAsync(opts);
  let searches = [];
  for (let day = 0; day < trends.default.trendingSearchesDays.length; day++) {
    let daySearches = trends.default.trendingSearchesDays[day].trendingSearches;
    for (let i = 0; i < daySearches.length; i++) {
      if (daySearches[i] && daySearches[i].title && daySearches[i].title.query) {
        let query = daySearches[i].title.query.toLowerCase();
        // Strip out everything except letters and spaces 
        query = query.replace(/[^a-z ]/g, '');
        let link = null;
        if (daySearches[i].image && daySearches[i].image.newsUrl) {
          link = daySearches[i].image.newsUrl;
        }
        searches.push({
          query,
          link,
        });
      }
    }
  }
  return searches;
};

let DAY_IN_MS = 86400000;
let randomTrendingSearchAsync = async (opts) => {
  let when = new Date(Date.now() - Math.floor(Math.random() * 15 * DAY_IN_MS));
  let terms = await justSearchTermsAsync({ ...opts, trendDate: when });
  return terms[Math.floor(Math.random() * terms.length)];
};

module.exports = async (req, res) => {
  res.end(JSON.stringify(await randomTrendingSearchAsync()));
};

Object.assign(module.exports, {
  dailyTrendsAsync,
  justSearchTermsAsync,
  randomTrendingSearchAsync,
});
