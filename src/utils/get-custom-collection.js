/**
 * Returns a custom collection by name.
 *
 * @param {Array}        collection     The 11ty collection
 * @param {String}       collectionName The custom collecion name.
 * @returns {Array}                      The custom collection
 */
module.exports = (collection, collectionName) => {
  return collection.getAll()[0].data.collections[collectionName];
};
