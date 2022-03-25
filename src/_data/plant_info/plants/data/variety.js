const getCacheOptions = require('../../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../../utils/get-cache-asset-save.js");

const getPlantSpeciesData = require("./species.js");
const getElementItemsCollection = require("../../../../utils/get-element-items-collection.js");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoPlantVarietyExternalDataAsset",
      "getFunction": null,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    plantSpeciesData = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    plantSpeciesData = await getPlantSpeciesData(configData);

    cacheContents = getElementItemsCollection(
      plantSpeciesData,
      'variety',
      false
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}
