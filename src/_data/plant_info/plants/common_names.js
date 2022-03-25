const getCacheOptions = require('../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../utils/get-cache-asset-save.js");

const getPlantInfoSimpleExternalData = require('../../../utils/get-plant-info-simple-external-data.js');

const getPlantsExternalDetails = require("./external.js");
let commonNamesExternalDetails = require("../../plant_info_metadata/plants/common_names.json");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoCommonNamesExternalDetailsAsset",
      "getFunction": getPlantInfoSimpleExternalData,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    plantsExternalDetails = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    plantsExternalDetails = await getPlantsExternalDetails(configData);

    cacheContents = await getPlantInfoSimpleExternalData(
      plantsExternalDetails,
      commonNamesExternalDetails,
      configData
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}


