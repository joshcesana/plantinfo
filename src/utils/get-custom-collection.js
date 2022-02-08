const {
  isObject,
  getCollectionRootData,
} = require('../_data/helpers.js');

/**
 * Returns a custom collection by name.
 *
 * @param {Object|Array} collection   The 11ty collection
 * @param {string}       collectionName   The collection name.
 * @returns {Array}                       The custom collection
 */
module.exports = (collection, collectionName) => {
  let collectionItems = [],
  collectionRootData = getCollectionRootData(collection);

  if (isObject(collectionRootData)) {
    collectionItems = collectionRootData.collections[collectionName];
  }

  return collectionItems;
};
