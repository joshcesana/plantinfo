const getCacheOptions = require('../../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../../utils/get-cache-asset-save.js");

const getPlantFamilyData = require("./family.js");
const getElementItemsCollection = require("../../../../utils/get-element-items-collection.js");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoPlantGenusExternalDataAsset",
      "getFunction": null,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    plantFamilyData = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    plantFamilyData = await getPlantFamilyData(configData);

    cacheContents = getElementItemsCollection(
      plantFamilyData,
      'genus',
      false
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}
