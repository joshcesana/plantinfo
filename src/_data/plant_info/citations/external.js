const getCacheData = require('../../../utils/get-cache-data.js');
const getCacheOptions = require('../../../utils/get-cache-options.js');
const getPlantInfoProcessedExternalData = require('../../../utils/get-plant-info-processed-external-data.js');

let citationsExternalDetails = require("../../plant_info_metadata/citations/external.json");

module.exports = async (configData) => {
  let
    cacheCitationsExternalDetails = {
      "assetKey": "plantInfoCitationsExternalDetailsAsset",
      "getFunction": getPlantInfoProcessedExternalData,
      "staticParameters": []
    },
    cacheOptions = getCacheOptions(configData)
  ;

  // Pass through the function and parameters to get external data, cache it.
  citationsExternalDetails = await getCacheData(
    cacheCitationsExternalDetails,
    [citationsExternalDetails, configData],
    cacheOptions
  );

  return citationsExternalDetails;
}
