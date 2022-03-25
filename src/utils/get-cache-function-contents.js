const { objectHasOwnProperties } = require("../_data/helpers.js");

/**
 * Get the contents of a cache function.
 *
 * @param {Object}       cache                  The cache configuration,
 *                                              containing the following keys:
 *                                              - @param {String} assetKey
 *                                                - The key used for caching
 *                                              - @param {String} getFunction
 *                                                - The function to get the data
 *                                              - @param {String} staticParameters
 *                                                - The function to get the data
 * @param {Object}       dynamicParameters      The params for the function.
 * @param {Object}       cacheOptions           The options used for caching.
 * @returns {Object}                            The cache asset.
 */
module.exports = async (cache, dynamicParameters, cacheOptions) => {
  let cacheContents;

  if (
    typeof(cache) !== 'undefined' &&
    objectHasOwnProperties(cache, ['getFunction']) &&
    objectHasOwnProperties(cache, ['staticParameters']) &&
    Array.isArray(cache['staticParameters']) &&
    Array.isArray(dynamicParameters)
  ) {
    let getParameters = [...dynamicParameters, ...cache['staticParameters']];
    cacheContents = await cache.getFunction(...getParameters);
  }

  return cacheContents;
};
