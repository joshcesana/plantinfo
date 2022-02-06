const sortLetterArray = require("./sort-letter-array.js");
const getLetterListByItemType = require("./get-letter-list-by-item-type.js");

/**
 * Takes a collection and returns back the first letters of the names in the
 * collection, then sorted by letter array.
 *
 * @param {Array}        collection   The 11ty collection
 * @param {String}       itemType     The item type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (collection, itemType) => {
  return sortLetterArray(
    getLetterListByItemType(collection, itemType)
  );
};
