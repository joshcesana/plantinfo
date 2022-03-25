const getCacheOptions = require('../../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../../utils/get-cache-asset-save.js");

const getNurserySpecialtyData = require("./nursery_specialty.js");
const getPagedCategoryCollection = require("../../../../utils/get-paged-category-collection.js");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoNurseryByCategoryExternalDataAsset",
      "getFunction": null,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    nurserySpecialtyData = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    nurserySpecialtyData = await getNurserySpecialtyData(configData);

    cacheContents = getPagedCategoryCollection(
      nurserySpecialtyData,
      20,
      'nursery_category'
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}
