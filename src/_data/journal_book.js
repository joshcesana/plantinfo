const getCacheData = require('../utils/get-cache-data.js');

module.exports = async function(configData) {
  return await getCacheData(configData['cacheData']['journalBookCache'], [configData['collection']], configData['cacheDuration']);
};
