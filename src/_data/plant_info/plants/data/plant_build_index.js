const getCacheOptions = require('../../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../../utils/get-cache-asset-save.js");

const getPlantIndex = require("./plant_prepare_index.js");
const buildLunrIndex = require("../../../../utils/build-lunr-index.js");
const writeLunrIndex = require("../../../../utils/write-lunr-index.js");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoPlantBuildIndexExternalDataAsset",
      "getFunction": null,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    plantIndex = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    plantIndex = await getPlantIndex(configData);

    cacheContents = buildLunrIndex(
      plantIndex,
      configData['searchData']['plants']['refKey'],
      configData['searchData']['plants']['fieldKeys']
    );

    writeLunrIndex(
      configData['gdSearchOutputDir'],
      configData['searchData']['plants']['indexSlug'],
      cacheContents
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}
