const sortByMachineName = require('./sort-by-machine-name.js');
const getFilteredByNumberLetterGroup = require("./get-filtered-by-number-letter-group.js");

/**
 * Takes a collection and returns it back filtered by letter group, then sorted
 * by machine name.
 *
 * @param {Array}        collection   The 11ty collection
 * @param {Array}        dataPath     The data path to the letter group.
 * @param {Array|Number} levelsDeep   Number of levels deep to seek items.
 * @param {String}       itemType     The item type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (collection, dataPath, levelsDeep, itemType) => {
  return sortByMachineName(
    getFilteredByNumberLetterGroup(collection, dataPath, levelsDeep, itemType)
  );
};
