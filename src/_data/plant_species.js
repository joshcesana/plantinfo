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
    plantSpeciesData = {},
    plantSpeciesItemData = {},
    pathFamily = '',
    pathGenus = '',
    pathSpecies = '',
    pathUUID = ''
  ;

  if (isObject(plantInfoData)) {
    let plantData = getCollectionPathData(plantInfoData, ['plants', 'data']);

    if (process.env.ELEVENTY_SERVERLESS) {
      pathFamily = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'family']);
      pathGenus = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'genus']);
      pathSpecies = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'species']);
      pathUUID = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'uuid']);

      if (pathFamily !== '' && pathGenus !== '' && pathSpecies !== '' && pathUUID !== '') {
        plantSpeciesItemData = getItemByTypeAndMachineName(plantData, 'species', pathSpecies, pathUUID);

        if (plantSpeciesItemData !== {}) {
          plantSpeciesData[pathSpecies] = plantSpeciesItemData;
        }
      }
    } else {
      plantSpeciesData = getCollectionPathData(plantData, ['species']);
    }

    console.log('plant info has ' + Object.entries(plantInfoData).length + ' items');
    console.log('plant data has ' + Object.entries(plantData).length + ' items');
    console.log('plant species has ' + Object.entries(plantSpeciesData).length + ' items');
  }

  return plantSpeciesData;
}
