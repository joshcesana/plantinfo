const sortByMachineName = require('./sort-by-machine-name.js');
const getFilteredByCategoryCollection = require('./get-filtered-by-category-collection.js');

/**
 * Takes a collection and returns it back with the attached items by type, then
 * sort by machine name.
 *
 * @param {Array|Object}  sourceCollection  The 11ty collection to be sorted into categories
 * @param {Array|Object}  targetCollection  The 11ty collection with the categories.
 * @param {String}        categoryKey       The key for the category.
 * @param {String}        itemType          The term type to use for the collection.
 * @returns {Array}                         The filtered collection
 */
module.exports = (sourceCollection, targetCollection, categoryKey, itemType) => {
  return sortByMachineName(
    getFilteredByCategoryCollection(sourceCollection, targetCollection, categoryKey, itemType)
  );
};
