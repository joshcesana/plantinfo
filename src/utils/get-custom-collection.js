/**
 * Returns a custom collection by name.
 *
 * @param {string}       cacheKey      A unique key used for caching the data.
 * @param {string}       getFunction   The name of the function used t.
 * @returns {Array}                      The custom collection
 */
module.exports = (collection, collectionName) => {
  return collection.getAll()[0].data.collections[collectionName];
};
