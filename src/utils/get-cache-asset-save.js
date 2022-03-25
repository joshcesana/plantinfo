/**
 * Save an asset cache.
 *
 * @param {Object}       cacheAsset             The cache asset.
 * @param {Object|String}       cacheContents          The cache contents.
 * @returns {Object}                            The cache asset.
 */
module.exports = async (cacheAsset, cacheContents) => {
  await cacheAsset.save(cacheContents, 'json');
};
