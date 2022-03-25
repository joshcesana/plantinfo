const getCacheOptions = require('../../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../../utils/get-cache-asset-save.js");

const getPlantsExternalDetails = require("../external.js");
const getLetterGroupCollection = require("../../../../utils/get-letter-group-collection.js");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoPlantFamilyExternalDataAsset",
      "getFunction": null,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    plantsExternalDetails = {},
    plantsExternalData = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    plantsExternalDetails = await getPlantsExternalDetails(configData);
    plantsExternalData = plantsExternalDetails["data"];

    cacheContents = getLetterGroupCollection(
      plantsExternalData,
      configData['rootData']['plants']['globalDataPath'],
      configData['rootData']['plants']['levelsDeep'],
      configData['rootData']['plants']['itemType']
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}
