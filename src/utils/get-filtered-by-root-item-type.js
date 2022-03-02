const {
  getCollectionRootData,
  isArray,
  isArrayWithItems,
  getCollectionPathData,
  checkGroupItem,
} = require('../_data/helpers.js');

/**
 * Takes a collection and returns it back with the attached items by type.
 *
* @param {Array|Object}        collection   The 11ty collection
 * @param {Array}       dataPath      The data path to the terms.
 * @param {String}      itemType      The item type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (collection, dataPath, itemType) => {
  let
    groupItems = [],
    collectionRootData = getCollectionRootData(collection),
    collectionPathData = getCollectionPathData(collectionRootData, dataPath),
    itemGroup = collectionPathData,
    groupItemHasData = false,
    groupItemHasName = true
  ;

  if (
    isArray(itemGroup) &&
    isArrayWithItems(itemGroup)
  ) {
    itemGroup.forEach(groupItem => {
      groupItems = checkGroupItem(
        groupItems,
        groupItem,
        itemType,
        groupItemHasData,
        groupItemHasName
      );
    });
  }

  console.log('root group has ' + groupItems.length + ' items for ' + itemType);

  return groupItems;
};
