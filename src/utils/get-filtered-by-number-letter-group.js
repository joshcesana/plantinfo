const {
  isObject,
  getCollectionRootData,
  getCollectionPathData,
  levelItemSeeker,
} = require('../_data/helpers.js');

/**
 * Takes a collection and returns it back filtered by letter group.
 *
 * @param {Object|Array} collection   The 11ty collection
 * @param {Array}        dataPath     The data path to the letter group.
 * @param {Array|Number} levelsDeep   Number of levels deep to seek items.
 * @param {String}       itemType     The item type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (collection, dataPath, levelsDeep, itemType) => {
  let
    collectionItems = [],
    collectionRootData = getCollectionRootData(collection),
    collectionPathData = getCollectionPathData(collectionRootData, dataPath),
    checkForLevelArray = true,
    levelToSearch = collectionPathData;

  if (isObject(collectionPathData)) {
    levelsDeep.forEach(levels => {
      collectionItems = levelItemSeeker(collectionItems, levelToSearch, 1, levels, itemType, checkForLevelArray);
    });
  }

  console.log('number letter group has ' + collectionItems.length + ' items for ' + itemType);

  return collectionItems;
};
