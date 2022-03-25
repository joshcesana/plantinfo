/**
 * Get the cache options.
 *
 * @param {Object}  configData      The configData.
 * @returns {Object}                The processed external data.
 */
module.exports = (configData) => {
  let cacheOptions = {
    duration: configData['cacheDuration'],
    directory: configData['cacheDirectory'],
  }

  if (process.env.ELEVENTY_SERVERLESS) {
    // Infinite duration (until the next build)
    cacheOptions.duration = configData['cacheDurationServerless'];
    // Instead of ".cache" default because files/directories
    // that start with a dot are not bundled by default
    cacheOptions.directory = configData['cacheDirectoryServerless'];
  }

  return cacheOptions;
}
