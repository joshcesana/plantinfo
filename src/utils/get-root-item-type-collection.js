const sortByMachineName = require('./sort-by-machine-name.js');
const getFilteredByRootItemType = require("./get-filtered-by-root-item-type.js");

/**
 * Takes a collection and returns it back filtered by letter group, then sorted
 * by machine name.
 *
 * @param {Array|Object}        collection   The 11ty collection
 * @param {Array}       dataPath      The data path to the terms.
 * @param {String}       itemType     The item type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (collection, dataPath, itemType) => {
  return sortByMachineName(
    getFilteredByRootItemType(collection, dataPath, itemType)
  );
};
