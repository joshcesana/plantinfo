const {
  isArray,
  isArrayWithItems,
  checkLetterGroupItem,
} = require('../_data/helpers.js');

/**
 * Takes a collection and returns back the first letters of the names in the collection.
 *
 * @param {Array}        collection   The 11ty collection
 * @param {String}       itemType     The item type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (collection, itemType) => {
  let
    letterList = [],
    letterFoundList = [],
    letterGroup = collection,
    letterListSearch = {
      letterList: letterList,
      letterFoundList: letterFoundList,
    }
  ;

  if (
    isArray(letterGroup) &&
    isArrayWithItems(letterGroup)
  ) {
    letterGroup.forEach(letterGroupItem => {
      letterListSearch = checkLetterGroupItem(letterListSearch, letterGroupItem, itemType);
    });
  }

  letterList = letterListSearch.letterList;

  console.log('letter group has ' + letterList.length + ' items for ' + itemType);

  return letterList;
};
