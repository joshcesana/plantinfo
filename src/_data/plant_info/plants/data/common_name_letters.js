const getCacheOptions = require('../../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../../utils/get-cache-asset-save.js");

const getPlantCommonNameData = require("./common_name.js");
const getLetterListCollection = require("../../../../utils/get-letter-list-collection.js");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoPlantCommonNameLettersExternalDataAsset",
      "getFunction": null,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    plantCommonNameData = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    plantCommonNameData = await getPlantCommonNameData(configData);

    cacheContents = getLetterListCollection(
      plantCommonNameData,
      'common_name',
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}
