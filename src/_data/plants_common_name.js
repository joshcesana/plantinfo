const { AssetCache } = require("@11ty/eleventy-fetch");
const getPlantInfoData = require("./plant_info.js");

const {
  isObject,
  getConfigPathData,
  getCollectionPathData,
  getItemByTypeAndMachineName,
} = require("../_data/helpers.js");

module.exports = async (configData) => {
  const plantInfoData = await getPlantInfoData(configData);

  let
    plantCommonNameData = {},
    plantCommonNameItemData = {},
    pathCommon = '',
    pathUUID = ''
  ;

  if (isObject(plantInfoData)) {
    let plantData = getCollectionPathData(plantInfoData, ['plants', 'data']);

    if (process.env.ELEVENTY_SERVERLESS) {
      pathCommon = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'common']);
      pathUUID = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'uuid']);

      if (pathCommon !== '' && pathUUID !== '') {
        plantCommonNameItemData = getItemByTypeAndMachineName(plantData, 'common_name', pathCommon, pathUUID);

        if (plantCommonNameItemData !== {}) {
          plantCommonNameData[pathFamily] = plantCommonNameItemData;
        }
      }
    } else {
      plantCommonNameData = getCollectionPathData(plantData, ['common_name']);
    }

    console.log('plant info has ' + Object.entries(plantInfoData).length + ' items');
    console.log('plant data has ' + Object.entries(plantData).length + ' items');
    console.log('plant common name has ' + Object.entries(plantCommonNameData).length + ' items');
  }

  return plantCommonNameData;
}
