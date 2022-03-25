const getCacheOptions = require('../../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../../utils/get-cache-asset-save.js");

const getCommonNamesExternalDetails = require("../common_names.js");
const getRootItemTypeCollection = require("../../../../utils/get-root-item-type-collection.js");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoPlantCommonNamesExternalDataAsset",
      "getFunction": null,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    commonNamesExternalDetails = {},
    commonNamesExternalData = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    commonNamesExternalDetails = await getCommonNamesExternalDetails(configData);
    commonNamesExternalData = commonNamesExternalDetails["data"];

    cacheContents = getRootItemTypeCollection(
      commonNamesExternalData,
      configData['rootData']['common_names']['globalDataPath'],
      configData['rootData']['common_names']['itemType']
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}
