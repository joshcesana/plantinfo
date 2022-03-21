const { AssetCache } = require("@11ty/eleventy-fetch");
const getPlantInfoData = require("./plant_info.js");

const {
  getConfigPathData,
  getCollectionPathData,
  getItemByTypeAndMachineName,
  isObject,
} = require("../_data/helpers.js");

module.exports = async function(configData) {
  const plantInfoData = await getPlantInfoData(configData);

  let
    plantVarietyData = {},
    plantVarietyItemData = {},
    pathFamily = '',
    pathGenus = '',
    pathSpecies = '',
    pathVariety = '',
    pathUUID = ''
  ;

  if (isObject(plantInfoData)) {
    let plantData = getCollectionPathData(plantInfoData, ['plants', 'data']);

    if (process.env.ELEVENTY_SERVERLESS) {
      pathFamily = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'family']);
      pathGenus = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'genus']);
      pathSpecies = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'species']);
      pathVariety = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'variety']);
      pathUUID = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'uuid']);

      if (pathFamily !== '' && pathGenus !== '' && pathSpecies !== '' && pathVariety !== '' && pathUUID !== '') {
        plantVarietyItemData = getItemByTypeAndMachineName(plantData, 'variety', pathVariety, pathUUID);

        if (plantVarietyItemData !== {}) {
          plantVarietyData[pathVariety] = plantVarietyItemData;
        }
      }
    } else {
      plantVarietyData = getCollectionPathData(plantData, ['variety']);
    }

    console.log('plant info has ' + Object.entries(plantInfoData).length + ' items');
    console.log('plant data has ' + Object.entries(plantData).length + ' items');
    console.log('plant variety has ' + Object.entries(plantVarietyData).length + ' items');
  }

  return plantVarietyData;
}
