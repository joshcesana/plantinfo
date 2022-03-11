const sizeof = require('object-sizeof')

const {
  getExternalDataIndexUri,
  getExternalDataDomain,
  getExternalFileUri,
  fetchExternalData,
  processExternalData,
  getObjectSize,
} = require("../_data/helpers.js");

const getNumberLetterCollection = require("../utils/get-number-letter-collection.js");
const getElementItemsCollection = require("../utils/get-element-items-collection.js");
const getLetterGroupCollection = require("../utils/get-letter-group-collection.js");
const getLetterListCollection = require("../utils/get-letter-list-collection.js");
const getRootItemTypeCollection = require("../utils/get-root-item-type-collection.js");
const getCategoryCollection = require("../utils/get-category-collection.js");
const getPagedCategoryCollection = require("../utils/get-paged-category-collection.js");
const prepareNurseryIndex = require("../utils/prepare-nursery-index.js");
const buildLunrIndex = require("../utils/build-lunr-index.js");
const writeLunrIndex = require("../utils/write-lunr-index.js");
const writeRawIndex = require("../utils/write-raw-index.js");
const preparePlantIndex = require("../utils/prepare-plant-index.js");

/**
 * Get the processed plant info data.
 *
 * @param {Object}  plantInfoData   The plantInfoData to get and process.
 * @param {Object}  configData      The configData to use in the processing.
 * @returns {Object}                The processed plantInfoData
 */
module.exports = async (plantInfoData, configData) => {
  plantInfoData["citations"]["external"]["dataIndexUri"] = getExternalDataIndexUri(plantInfoData["external"]["path"], plantInfoData["citations"]["external"]["path"]);
  plantInfoData["plants"]["external"]["dataIndexUri"] = getExternalDataIndexUri(plantInfoData["external"]["path"], plantInfoData["plants"]["external"]["path"]);
  plantInfoData["nurseries"]["external"]["dataIndexUri"] = getExternalDataIndexUri(plantInfoData["external"]["path"], plantInfoData["nurseries"]["external"]["path"]);

  plantInfoData["citations"]["external"]["path"]["fullDomain"] = getExternalDataDomain(plantInfoData["external"]["path"], plantInfoData["citations"]["external"]["path"]);
  plantInfoData["plants"]["external"]["path"]["fullDomain"] = getExternalDataDomain(plantInfoData["external"]["path"], plantInfoData["plants"]["external"]["path"]);
  plantInfoData["nurseries"]["external"]["path"]["fullDomain"] = getExternalDataDomain(plantInfoData["external"]["path"], plantInfoData["nurseries"]["external"]["path"]);


  plantInfoData["plants"]["common_names"]["path"]["fullDomain"] = plantInfoData["plants"]["external"]["path"]["fullDomain"];
  plantInfoData["plants"]["common_names"]["fileUri"] = getExternalFileUri(plantInfoData["plants"]["common_names"]["path"]);
  // console.log(plantInfoData["plants"]["common_names"]["fileUri"]);

  plantInfoData["nurseries"]["terms"]["path"]["fullDomain"] = plantInfoData["nurseries"]["external"]["path"]["fullDomain"];
  plantInfoData["nurseries"]["terms"]["fileUri"] = getExternalFileUri(plantInfoData["nurseries"]["terms"]["path"]);
  // console.log(plantInfoData["nurseries"]["terms"]["fileUri"]);

  plantInfoData["citations"]["external"]["dataIndex"] = await fetchExternalData(plantInfoData["citations"]["external"]["dataIndexUri"]);
  plantInfoData["plants"]["external"]["dataIndex"] = await fetchExternalData(plantInfoData["plants"]["external"]["dataIndexUri"]);
  plantInfoData["nurseries"]["external"]["dataIndex"] = await fetchExternalData(plantInfoData["nurseries"]["external"]["dataIndexUri"]);

  plantInfoData["plants"]["common_names"]["data"] = await fetchExternalData(plantInfoData["plants"]["common_names"]["fileUri"]);
  plantInfoData["nurseries"]["terms"]["data"] = await fetchExternalData(plantInfoData["nurseries"]["terms"]["fileUri"]);

  plantInfoData["citations"]["external"]["data"] = await processExternalData(
    plantInfoData["citations"]["external"]["dataIndex"],
    plantInfoData["citations"]["external"]["path"]["fullDomain"],
    plantInfoData["external"]["path"]["schema"],
    configData['maxDataItemsPerLevel']
  );
  plantInfoData["plants"]["external"]["data"] = await processExternalData(
    plantInfoData["plants"]["external"]["dataIndex"],
    plantInfoData["plants"]["external"]["path"]["fullDomain"],
    plantInfoData["external"]["path"]["schema"],
    configData['maxDataItemsPerLevel']
  );
  plantInfoData["nurseries"]["external"]["data"] = await processExternalData(
    plantInfoData["nurseries"]["external"]["dataIndex"],
    plantInfoData["nurseries"]["external"]["path"]["fullDomain"],
    plantInfoData["external"]["path"]["schema"],
    configData['maxDataItemsPerLevel']
  );
  // console.log(plantInfoData["citations"]["external"]["data"]);
  // console.log(plantInfoData["plants"]["external"]["data"]);
  // console.log(plantInfoData["nurseries"]["external"]["data"]);

  plantInfoData["citations"]["data"]["journal_book"] = getNumberLetterCollection(plantInfoData["citations"]["external"]["data"], configData['rootData']['journals']['globalDataPath'], configData['rootData']['journals']['levelsDeep'], configData['rootData']['journals']['itemType']);
  plantInfoData["citations"]["data"]["citation_reference"] = getElementItemsCollection(plantInfoData["citations"]["data"]["journal_book"], 'citation_reference', 'journal_book');

  plantInfoData["plants"]["data"]["family"] = getLetterGroupCollection(plantInfoData["plants"]["external"]["data"], configData['rootData']['plants']['globalDataPath'], configData['rootData']['plants']['levelsDeep'], configData['rootData']['plants']['itemType']);
  plantInfoData["plants"]["data"]["genus"] = getElementItemsCollection(plantInfoData["plants"]["data"]["family"], 'genus', false);
  plantInfoData["plants"]["data"]["species"] = getElementItemsCollection(plantInfoData["plants"]["data"]["genus"], 'species', false);
  plantInfoData["plants"]["data"]["variety"] = getElementItemsCollection(plantInfoData["plants"]["data"]["species"], 'variety', false);
  plantInfoData["plants"]["data"]["genus_letters"] = getLetterListCollection(plantInfoData["plants"]["data"]["genus"], 'genus');
  plantInfoData["plants"]["data"]["common_name"] = getRootItemTypeCollection(plantInfoData["plants"]["common_names"]["data"], configData['rootData']['common_names']['globalDataPath'], configData['rootData']['common_names']['itemType']);
  plantInfoData["plants"]["data"]["common_name_letters"] = getLetterListCollection(plantInfoData["plants"]["data"]["common_name"], 'common_name');

  plantInfoData["nurseries"]["data"]["nursery"] = getNumberLetterCollection(plantInfoData["nurseries"]["external"]["data"], configData['rootData']['nurseries']['globalDataPath'], configData['rootData']['nurseries']['levelsDeep'], configData['rootData']['nurseries']['itemType']);
  plantInfoData["nurseries"]["data"]["nursery_catalog"] = getElementItemsCollection(plantInfoData["nurseries"]["data"]["nursery"], 'nursery_catalog', false);
  plantInfoData["nurseries"]["data"]["nursery_category"] = getRootItemTypeCollection(plantInfoData["nurseries"]["terms"]["data"], configData['rootData']['nursery_categories']['globalDataPath'], configData['rootData']['nursery_categories']['itemType']);
  plantInfoData["nurseries"]["data"]["nursery_specialty"] = getCategoryCollection(plantInfoData["nurseries"]["data"]["nursery"], plantInfoData["nurseries"]["data"]["nursery_category"], 'specialties', 'nursery_category');
  plantInfoData["nurseries"]["data"]["nursery_by_category"] = getPagedCategoryCollection( plantInfoData["nurseries"]["data"]["nursery_specialty"], 20, "nursery_category");

  plantInfoData["nurseries"]["data"]["nursery_prepare_index"] = prepareNurseryIndex(plantInfoData["nurseries"]["data"]["nursery"], plantInfoData["nurseries"]["data"]["nursery_category"]);
  plantInfoData["nurseries"]["data"]["nursery_build_index"] = buildLunrIndex(plantInfoData["nurseries"]["data"]["nursery_prepare_index"], configData['searchData']['nurseries']['refKey'], configData['searchData']['nurseries']['fieldKeys']);

  // console.log('nursery category collection has ' + plantInfoData["nurseries"]["data"]["nursery_category"].length  + ' items');
  // console.log('nursery specialty collection has ' +  plantInfoData["nurseries"]["data"]["nursery_specialty"].length + ' items');
  // console.log('nursery paged category collection has ' + plantInfoData["nurseries"]["data"]["nursery_by_category"].length + ' items');
  //
  // console.log('nursery prepare index collection has ' + plantInfoData["nurseries"]["data"]["nursery_prepare_index"].length + ' items');
  // console.log('nursery build index collection has ' + Object.keys(plantInfoData["nurseries"]["data"]["nursery_build_index"]).length + ' items');

  writeLunrIndex(configData['gdSearchOutputDir'], configData['searchData']['nurseries']['indexSlug'], plantInfoData["nurseries"]["data"]["nursery_build_index"]);
  writeRawIndex(configData['gdSearchOutputDir'], configData['searchData']['nurseries']['indexSlug'], plantInfoData["nurseries"]["data"]["nursery_prepare_index"]);

  plantInfoData["plants"]["data"]["plant_prepare_index"] = preparePlantIndex([plantInfoData["plants"]["data"]["genus"], plantInfoData["plants"]["data"]["species"], plantInfoData["plants"]["data"]["variety"]], plantInfoData["plants"]["data"]["common_name"], plantInfoData["nurseries"]["data"]["nursery_catalog"], plantInfoData["citations"]["data"]["citation_reference"]);
  plantInfoData["plants"]["data"]["plant_build_index"] = buildLunrIndex(plantInfoData["nurseries"]["data"]["nursery_prepare_index"], configData['searchData']['plants']['refKey'], configData['searchData']['plants']['fieldKeys']);

  // console.log('plant prepare index collection has ' + plantInfoData["plants"]["data"]["plant_prepare_index"].length + ' items');
  // console.log('plant build index collection has ' + Object.keys(plantInfoData["plants"]["data"]["plant_build_index"]).length + ' items');

  writeLunrIndex(configData['gdSearchOutputDir'], configData['searchData']['plants']['indexSlug'], plantInfoData["plants"]["data"]["plant_build_index"]);
  writeRawIndex(configData['gdSearchOutputDir'], configData['searchData']['plants']['indexSlug'], plantInfoData["plants"]["data"]["plant_prepare_index"]);

  // console.log('plant_info processing complete');

  // Remove external data to reduce memory usage.
  // console.log('total size of plantInfoData');
  // console.log(getObjectSize(plantInfoData));
  // console.log('check size of external data');
  // console.log('size of citations data: ' + getObjectSize(plantInfoData["citations"]["external"]["data"]));
  // console.log('size of plants data: ' + getObjectSize(plantInfoData["plants"]["external"]["data"]));
  // console.log('size of nurseries data: ' + getObjectSize(plantInfoData["nurseries"]["external"]["data"]));
  // console.log('size of common names data: ' + getObjectSize(plantInfoData["plants"]["common_names"]["data"]));
  // console.log('size of terms data: ' + getObjectSize(plantInfoData["nurseries"]["terms"]["data"]));

  plantInfoData["citations"]["external"]["data"] = null;
  plantInfoData["plants"]["external"]["data"] = null;
  plantInfoData["nurseries"]["external"]["data"] = null;
  plantInfoData["plants"]["common_names"]["data"] = null;
  plantInfoData["nurseries"]["terms"]["data"] = null;

  // console.log('total size of processedPlantInfoData after external data removed, and object cloned into new object');
  // console.log(getObjectSize(plantInfoData));

  return plantInfoData;
};
