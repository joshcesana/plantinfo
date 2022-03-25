const getPlantInfoData = require("./plant_info_data.js");

const {
  isObject,
  getConfigPathData,
  getCollectionPathData,
  getItemByTypeAndMachineName,
} = require("../_data/helpers.js");

module.exports = async (configData) => {
  const plantInfoData = await getPlantInfoData(configData);

  let
    plantFamilyData = {},
    plantFamilyItemData = {},
    pathFamily = '',
    pathUUID = ''
  ;

  if (isObject(plantInfoData)) {
    let plantData = getCollectionPathData(plantInfoData, ['plants', 'data']);

    if (process.env.ELEVENTY_SERVERLESS) {
      pathFamily = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'family']);
      pathUUID = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'uuid']);

      if (pathFamily !== '' && pathUUID !== '') {
        plantFamilyItemData = getItemByTypeAndMachineName(plantData, 'family', pathFamily, pathUUID);

        if (plantFamilyItemData !== {}) {
          plantFamilyData[pathFamily] = plantFamilyItemData;
        }
      }
    } else {
      plantFamilyData = getCollectionPathData(plantData, ['family']);
    }

    // console.log('plant info has ' + Object.entries(plantInfoData).length + ' items');
    // console.log('plant data has ' + Object.entries(plantData).length + ' items');
    console.log('plant family data has ' + Object.entries(plantFamilyData).length + ' items');
  }

  return plantFamilyData;
}
