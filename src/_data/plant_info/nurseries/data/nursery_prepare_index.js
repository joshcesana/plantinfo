const getCacheOptions = require('../../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../../utils/get-cache-asset-save.js");

const getNurseryData = require("./nursery.js");
const getNurseryCategoryData = require("./nursery_category.js");
const prepareNurseryIndex = require("../../../../utils/prepare-nursery-index.js");
const writeRawIndex = require("../../../../utils/write-raw-index.js");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoNurseryPrepareIndexExternalDataAsset",
      "getFunction": null,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    nurseryData = {},
    nurseryCategoryData = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    nurseryData = await getNurseryData(configData);
    nurseryCategoryData = await getNurseryCategoryData(configData);

    cacheContents = prepareNurseryIndex(
      nurseryData,
      nurseryCategoryData
    );

    writeRawIndex(
      configData['gdSearchOutputDir'],
      configData['searchData']['nurseries']['indexSlug'],
      cacheContents
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}
