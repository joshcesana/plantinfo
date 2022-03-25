const getCacheOptions = require('../../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../../utils/get-cache-asset-save.js");

const getNurseryIndex = require("./nursery_prepare_index.js");
const buildLunrIndex = require("../../../../utils/build-lunr-index.js");
const writeLunrIndex = require("../../../../utils/write-lunr-index.js");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoNurseryBuildIndexExternalDataAsset",
      "getFunction": null,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    nurseryIndex = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    nurseryIndex = await getNurseryIndex(configData);

    cacheContents = buildLunrIndex(
      nurseryIndex,
      configData['searchData']['nurseries']['refKey'],
      configData['searchData']['nurseries']['fieldKeys']
    );

    writeLunrIndex(
      configData['gdSearchOutputDir'],
      configData['searchData']['nurseries']['indexSlug'],
      cacheContents
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}
