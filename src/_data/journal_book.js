const getCacheData = require('../utils/get-cache-data.js');
const { objectHasOwnProperties } = require('../_data/helpers.js');
module.exports = async function(configData) {
  let collectionData = [];

  if (objectHasOwnProperties(configData, ['collection'])) {
    collectionData = configData['collection'];
  }

  return await getCacheData(configData['cacheData']['journalBookCache'], [collectionData], configData['cacheDuration']);
};
