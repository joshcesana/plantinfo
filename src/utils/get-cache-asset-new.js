const { AssetCache } = require("@11ty/eleventy-cache-assets");
const { objectHasOwnProperties } = require("../_data/helpers.js");

/**
 * Create a new asset cache.
 *
 * @param {Object}       cache                  The cache configuration,
 *                                              containing the following keys:
 *                                              - @param {String} assetKey
 *                                                - The key used for caching
 *                                              - @param {String} getFunction
 *                                                - The function to get the data
 *                                              - @param {String} staticParameters
 *                                                - The function to get the data
 * @param {Object}       cacheOptions           The options used for caching.
 * @returns {Object}                            The cache asset.
 */
module.exports = async (cache, cacheOptions) => {
  let asset = null;

  if (
    typeof(cache) !== 'undefined' &&
    objectHasOwnProperties(cache, ['assetKey']) &&
    objectHasOwnProperties(cacheOptions, ['directory'])
  ) {
    asset = new AssetCache(cache['assetKey'], cacheOptions['directory']);
  }

  return asset;
};
