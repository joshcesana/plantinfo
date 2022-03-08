const {
  isObject,
  isArray,
  getCollectionRootData,
  getCollectionPathData,
} = require('../_data/helpers.js');

/**
 * Returns a collection of data added to a global data item..
 *
 * @param {Object|Array} collection     The 11ty collection
 * @param {string}       globalDataKey  The key for the globalData.
 * @param {Array}        globalDataPath       The data path to the collection data.
 *                                      - An array of nested object keys.
 * @returns {Object|Array}                     The global data collection.
 */
module.exports = (collection, globalDataKey, globalDataPath) => {
  let
    globalDataCollection = {},
    collectionRootData = getCollectionRootData(collection),
    collectionGlobalData = getCollectionPathData(collectionRootData, [globalDataKey]),
    collectionPathData = getCollectionPathData(collectionGlobalData, globalDataPath);

  if (isObject(collectionPathData)) {
    globalDataCollection = collectionPathData;
    console.log('global data collection object has ' + Object.entries(globalDataCollection).length);
  } else if (isArray(collectionPathData)) {
    globalDataCollection = collectionPathData;
    console.log('global data collection array has ' + globalDataCollection.length);
  }

  return globalDataCollection;
};
