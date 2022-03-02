const getPagedItemsInCategoryCollection = require("./get-paged-items-in-category-collection.js");

/**
 * Takes a category collection and returns it back chunked for paging.
 *
 * @param {Array|Object}  categoryCollection    The 11ty collection with categories
 * @param {Number}        itemsPerPage          The number of items to display per page.
 * @param {String}        itemType              The term type to use for the collection.
 * @returns {Array}                             The paged collection
 */
module.exports = (categoryCollection, itemsPerPage, itemType) => {
  return getPagedItemsInCategoryCollection(categoryCollection, itemsPerPage, itemType)
};
