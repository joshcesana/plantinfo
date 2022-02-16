const getCacheData = require('../utils/get-cache-data.js');
const { objectHasOwnProperties } = require('../_data/helpers.js');
module.exports = async function(configData) {
  let
    plantInfoData = {},
    citationsData = {},
    nurseriesData = {},
    plantsData = {}
  ;

  /*
   * Fetch JSON from external data sources
   * - plantinfo-data-citations
   * - plantinfo-data-nurseries
   * - plantinfo-data-nurseries
   *
   * Each external data source should have an index.json file, containing a
   * hierachical data structure matching the directory structure of the
   * external resource, with additional individual JSON files in that structure.
   *
   * Iterate through that data structure to retrieve each individual JSON object
   * and add it to the overall data structure, matching that external source.
   * - citationsData = plantinfo-data-citations
   * - nurseriesData = plantinfo-data-nurseries
   * - plantsData = plantinfo-data-nurseries
   *
   * The data structure for each of these items should end up matching what
   * Eleventy would have created had the files been processed by Eleventy.
   *
   * These data structures will be processed to add keys to plantInfoData that
   * match the collections being added in .eleventy.js, so that this processing
   * can be cached ahead of time. This includes the creation of search indexes.
   */

  return plantInfoData;
};
