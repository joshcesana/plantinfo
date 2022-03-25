const getCacheOptions = require('../../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../../utils/get-cache-asset-save.js");

const getPlantGenusData = require("./genus.js");
const getPlantSpeciesData = require("./species.js");
const getPlantVarietyData = require("./variety.js");
const getPlantCommonNameData = require("./common_name.js");
const getNurseryCatalogData = require("../../nurseries/data/nursery_catalog.js");
const getCitationReferenceData = require("../../citations/data/citation_reference.js");

const preparePlantIndex = require("../../../../utils/prepare-plant-index.js");
const writeRawIndex = require("../../../../utils/write-raw-index.js");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoPlantPrepareIndexExternalDataAsset",
      "getFunction": null,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    genusData = {},
    speciesData = {},
    varietyData = {},
    commonNameData = {},
    nurseryCatalogData = {},
    citationReferenceData = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    genusData = await getPlantGenusData(configData);
    speciesData = await getPlantSpeciesData(configData);
    varietyData = await getPlantVarietyData(configData);
    commonNameData = await getPlantCommonNameData(configData);
    nurseryCatalogData = await getNurseryCatalogData(configData);
    citationReferenceData = await getCitationReferenceData(configData);

    cacheContents = preparePlantIndex(
      [genusData, speciesData, varietyData],
      commonNameData,
      nurseryCatalogData,
      citationReferenceData
    );

    writeRawIndex(
      configData['gdSearchOutputDir'],
      configData['searchData']['plants']['indexSlug'],
      cacheContents
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}
