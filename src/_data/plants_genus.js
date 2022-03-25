const getPlantInfoData = require("./plant_info_data.js");

const {
  getConfigPathData,
  getCollectionPathData,
  getItemByTypeAndMachineName,
  isObject,
} = require("../_data/helpers.js");

module.exports = async function(configData) {
  const plantInfoData = await getPlantInfoData(configData);

  let
    plantGenusData = {},
    plantGenusItemData = {},
    pathFamily = '',
    pathGenus = '',
    pathUUID = ''
  ;

  if (isObject(plantInfoData)) {
    let plantData = getCollectionPathData(plantInfoData, ['plants', 'data']);

    if (process.env.ELEVENTY_SERVERLESS) {
      pathFamily = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'family']);
      pathGenus = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'genus']);
      pathUUID = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'uuid']);

      if (pathFamily !== '' && pathGenus !== '' && pathUUID !== '') {
        plantGenusItemData = getItemByTypeAndMachineName(plantData, 'genus', pathGenus, pathUUID);

        if (plantGenusItemData !== {}) {
          plantGenusData[pathGenus] = plantGenusItemData;
        }
      }
    } else {
      plantGenusData = getCollectionPathData(plantData, ['genus']);
    }

    // console.log('plant info has ' + Object.entries(plantInfoData).length + ' items');
    // console.log('plant data has ' + Object.entries(plantData).length + ' items');
    console.log('plant genus data has ' + Object.entries(plantGenusData).length + ' items');
  }

  return plantGenusData;
}
