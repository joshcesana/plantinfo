const { AssetCache } = require("@11ty/eleventy-cache-assets");
const { objectHasOwnProperties } = require("../_data/helpers.js");

/**
 * Takes a collection and returns it back with the attached items by type, then
 * sort by machine name.
 *
 * @param {Object}       cache                  The cache configuration,
 *                                              containing the following keys:
 *                                              - @param {String} assetKey
 *                                                - The key used for caching
 *                                              - @param {String} getFunction
 *                                                - The function to get the data
 *                                              - @param {Array} staticParameters
 *                                                - The params for the function
 *                                                  included by default.
 * @param {Array}        collectionParameters   The dynamic parameters used for
 *                                              the getFunction.
 * @param {String}       duration               The duration used for caching.
 * @returns {Array}                             The cache contents
 */
module.exports = async (cache, collectionParameters, duration) => {
  let cacheContents = [];

  if (
    typeof(cache) !== 'undefined' &&
    objectHasOwnProperties(cache, ['assetKey']) &&
    objectHasOwnProperties(cache, ['getFunction']) &&
    objectHasOwnProperties(cache, ['staticParameters']) &&
    Array.isArray(cache.staticParameters) &&
    Array.isArray(collectionParameters)
  ) {
    let asset = new AssetCache(cache.assetKey);
    if (asset.isCacheValid(duration)) {
      return asset.getCachedValue();
    }
    let getParameters = [...collectionParameters, ...cache.staticParameters];
    cacheContents = cache.getFunction(...getParameters);
    await asset.save(cacheContents, 'json');
  }

  return cacheContents;
};
