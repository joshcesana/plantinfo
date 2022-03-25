const getPlantInfoExternalDetails = require("./plant_info/external.js");

const getCitationsExternalDetails = require("./plant_info/citations/external.js");

const getNurseriesExternalDetails = require("./plant_info/nurseries/external.js");
const getTermsExternalDetails = require("./plant_info/nurseries/terms.js");

const getPlantsExternalDetails = require("./plant_info/plants/external.js");
const getCommonNamesExternalDetails = require("./plant_info/plants/common_names.js");

const getJournalBookData = require("./plant_info/citations/data/journal_book.js");
const getCitationReferenceData = require("./plant_info/citations/data/citation_reference.js");

const getNurseryData = require("./plant_info/nurseries/data/nursery.js");
const getNurseryCategoryData = require("./plant_info/nurseries/data/nursery_category.js");
const getNurserySpecialtyData = require("./plant_info/nurseries/data/nursery_specialty.js");
const getNurseryByCategoryData = require("./plant_info/nurseries/data/nursery_by_category.js");
const getNurseryCatalogData = require("./plant_info/nurseries/data/nursery_catalog.js");

const getPlantFamilyData = require("./plant_info/plants/data/family.js");
const getPlantGenusData = require("./plant_info/plants/data/genus.js");
const getPlantSpeciesData = require("./plant_info/plants/data/species.js");
const getPlantVarietyData = require("./plant_info/plants/data/variety.js");
const getPlantCommonNameData = require("./plant_info/plants/data/common_name.js");
const getPlantGenusLettersData = require("./plant_info/plants/data/genus_letters.js");
const getPlantCommonNameLettersData = require("./plant_info/plants/data/common_name_letters.js");

const getNurseryIndex = require("./plant_info/nurseries/data/nursery_prepare_index.js");
const buildNurseryIndex = require("./plant_info/nurseries/data/nursery_build_index.js");

const getPlantIndex = require("./plant_info/plants/data/plant_prepare_index.js");
const buildPlantIndex = require("./plant_info/plants/data/plant_build_index.js");


module.exports = async (configData) => {
  let plantInfoData = {
    "external": {},
    "citations": {
      "external": {},
      "data": {}
    },
    "nurseries": {
      "external": {},
      "terms": {},
      "data": {}
    },
    "plants": {
      "external": {},
      "common_names": {},
      "data": {}
    }
  };

  plantInfoData["external"] = getPlantInfoExternalDetails(configData);

  plantInfoData["citations"]["external"] = await getCitationsExternalDetails(configData);

  plantInfoData["nurseries"]["external"] = await getNurseriesExternalDetails(configData);
  plantInfoData["nurseries"]["terms"] = await getTermsExternalDetails(configData);

  plantInfoData["plants"]["external"] = await getPlantsExternalDetails(configData);
  plantInfoData["plants"]["common_names"] = await getCommonNamesExternalDetails(configData);

  plantInfoData["citations"]["data"]["journal_book"] = await getJournalBookData(configData);
  plantInfoData["citations"]["data"]["citation_reference"] = await getCitationReferenceData(configData);
  // console.log('journal book data has ' + Object.entries(plantInfoData["citations"]["data"]["journal_book"]).length + ' items');
  // console.log('citation reference data has ' + Object.entries(plantInfoData["citations"]["data"]["citation_reference"]).length + ' items');

  plantInfoData["nurseries"]["data"]["nursery"] = await getNurseryData(configData);
  plantInfoData["nurseries"]["data"]["nursery_category"] = await getNurseryCategoryData(configData);
  plantInfoData["nurseries"]["data"]["nursery_specialty"] = await getNurserySpecialtyData(configData);
  plantInfoData["nurseries"]["data"]["nursery_by_category"] = await getNurseryByCategoryData(configData);
  plantInfoData["nurseries"]["data"]["nursery_catalog"] = await getNurseryCatalogData(configData);
  // console.log('nursery data has ' + Object.entries(plantInfoData["nurseries"]["data"]["nursery"]).length + ' items');
  // console.log('nursery category data has ' + Object.entries(plantInfoData["nurseries"]["data"]["nursery_category"]).length + ' items');
  // console.log('nursery specialty data has ' + Object.entries(plantInfoData["nurseries"]["data"]["nursery_specialty"]).length + ' items');
  // console.log('nursery by category data has ' + Object.entries(plantInfoData["nurseries"]["data"]["nursery_by_category"]).length + ' items');
  // console.log('nursery catalog data has ' + Object.entries(plantInfoData["nurseries"]["data"]["nursery_catalog"]).length + ' items');

  plantInfoData["plants"]["data"]["family"] = await getPlantFamilyData(configData);
  plantInfoData["plants"]["data"]["genus"] = await getPlantGenusData(configData);
  plantInfoData["plants"]["data"]["species"] = await getPlantSpeciesData(configData);
  plantInfoData["plants"]["data"]["variety"] = await getPlantVarietyData(configData);
  plantInfoData["plants"]["data"]["common_name"] = await getPlantCommonNameData(configData);
  plantInfoData["plants"]["data"]["common_name_letters"] = await getPlantCommonNameLettersData(configData);
  plantInfoData["plants"]["data"]["genus_letters"] = await getPlantGenusLettersData(configData);
  // console.log('plants family data has ' + Object.entries(plantInfoData["plants"]["data"]["family"]).length + ' items');
  // console.log('plants genus data has ' + Object.entries(plantInfoData["plants"]["data"]["genus"]).length + ' items');
  // console.log('plants species data has ' + Object.entries(plantInfoData["plants"]["data"]["species"]).length + ' items');
  // console.log('plants variety data has ' + Object.entries(plantInfoData["plants"]["data"]["variety"]).length + ' items');
  // console.log('plants common name data has ' + Object.entries(plantInfoData["plants"]["data"]["common_name"]).length + ' items');
  // console.log('plants common name letters data has ' + Object.entries(plantInfoData["plants"]["data"]["common_name_letters"]).length + ' items');
  // console.log('plants genus letters data has ' + Object.entries(plantInfoData["plants"]["data"]["genus_letters"]).length + ' items');

  plantInfoData["nurseries"]["data"]["prepare_nursery_index"] = await getNurseryIndex(configData);
  plantInfoData["nurseries"]["data"]["build_nursery_index"] = await buildNurseryIndex(configData);
  // console.log('nurseries prepare nursery index data has ' + Object.entries(plantInfoData["nurseries"]["data"]["prepare_nursery_index"]).length + ' items');
  // console.log('nurseries build nursery index data has ' + Object.entries(plantInfoData["nurseries"]["data"]["build_nursery_index"]).length + ' items');

  plantInfoData["plants"]["data"]["prepare_plant_index"] = await getPlantIndex(configData);
  plantInfoData["plants"]["data"]["build_plant_index"] = await buildPlantIndex(configData);
  // console.log('plants prepare nursery index data has ' + Object.entries(plantInfoData["plants"]["data"]["prepare_plant_index"]).length + ' items');
  // console.log('plants build nursery index data has ' + Object.entries(plantInfoData["plants"]["data"]["build_plant_index"]).length + ' items');

  return plantInfoData;
};
