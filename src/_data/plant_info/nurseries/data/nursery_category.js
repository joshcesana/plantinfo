const getCacheOptions = require('../../../../utils/get-cache-options.js');
const getCacheAssetNew = require("../../../../utils/get-cache-asset-new.js");
const getCacheAssetCheck = require("../../../../utils/get-cache-asset-check.js");
const getCacheAssetSave = require("../../../../utils/get-cache-asset-save.js");

const getNurseryTermsDetails = require("../terms.js");
const getRootItemTypeCollection = require("../../../../utils/get-root-item-type-collection.js");

module.exports = async (configData) => {
  let
    cacheContents,
    cacheOptions = getCacheOptions(configData),
    cacheDetails = {
      "assetKey": "plantInfoNurseryCategoryExternalDataAsset",
      "getFunction": null,
      "staticParameters": []
    },
    cacheAsset = await getCacheAssetNew(cacheDetails, cacheOptions),
    nurseryTermsDetails = {},
    nurseryTermsData = {}
  ;

  cacheContents = await getCacheAssetCheck(cacheAsset, cacheOptions);

  if (cacheContents !== null) {
    return cacheContents;
  } else {
    nurseryTermsDetails = await getNurseryTermsDetails(configData);
    nurseryTermsData = nurseryTermsDetails["data"];

    cacheContents = getRootItemTypeCollection(
      nurseryTermsData,
      configData['rootData']['nursery_categories']['globalDataPath'],
      configData['rootData']['nursery_categories']['itemType']
    );

    await getCacheAssetSave(cacheAsset, cacheContents);
  }

  return cacheContents;
}
