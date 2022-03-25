const { objectHasOwnProperties } = require("../_data/helpers.js");

/**
 * Check if a cache asset has valid contents that can be returned.
 *
 * @param {Object}       cacheAsset             The cache asset.
 * @param {Object}       cacheOptions           The options used for caching.
 * @returns {Object}                            The cache asset.
 */
module.exports = async (cacheAsset, cacheOptions) => {
  let cacheContents = null;

  if (
    objectHasOwnProperties(cacheOptions, ['duration'])
  ) {
    if (cacheAsset.isCacheValid(cacheOptions['duration'])) {
      // return cached data.
      return cacheAsset.getCachedValue();
    }
  }

  return cacheContents;
};
