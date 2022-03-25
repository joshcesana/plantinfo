const getCacheData = require('../../../utils/get-cache-data.js');
const getCacheOptions = require('../../../utils/get-cache-options.js');
const getPlantInfoProcessedExternalData = require('../../../utils/get-plant-info-processed-external-data.js');

let nurseriesExternalDetails = require("../../plant_info_metadata/nurseries/external.json");

module.exports = async (configData) => {
  let
    cacheNurseriesExternalDetails = {
      "assetKey": "plantInfoNurseriesExternalDetailsAsset",
      "getFunction": getPlantInfoProcessedExternalData,
      "staticParameters": []
    },
    cacheOptions = getCacheOptions(configData)
  ;

  // Pass through the function and parameters to get external data, cache it.
  nurseriesExternalDetails = await getCacheData(
    cacheNurseriesExternalDetails,
    [nurseriesExternalDetails, configData],
    cacheOptions
  );

  return nurseriesExternalDetails;
}
