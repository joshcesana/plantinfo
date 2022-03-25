const getCacheData = require('../../../utils/get-cache-data.js');
const getCacheOptions = require('../../../utils/get-cache-options.js');
const getPlantInfoProcessedExternalData = require('../../../utils/get-plant-info-processed-external-data.js');

let plantsExternalDetails = require("../../plant_info_metadata/plants/external.json");

module.exports = async (configData) => {
  let
    cachePlantsExternalDetails = {
      "assetKey": "plantInfoPlantsExternalDetailsAsset",
      "getFunction": getPlantInfoProcessedExternalData,
      "staticParameters": []
    },
    cacheOptions = getCacheOptions(configData)
  ;

  // Pass through the function and parameters to get external data, cache it.
  plantsExternalDetails = await getCacheData(
    cachePlantsExternalDetails,
    [plantsExternalDetails, configData],
    cacheOptions
  );

  return plantsExternalDetails;
}
