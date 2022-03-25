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
    nurseriesNurseryData = {},
    nurseriesNurseryItemData = {},
    pathNursery = '',
    pathUUID = ''
  ;

  if (isObject(plantInfoData)) {
    let nurseriesData = getCollectionPathData(plantInfoData, ['nurseries', 'data']);

    if (process.env.ELEVENTY_SERVERLESS) {
      pathNursery = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'nursery']);
      pathUUID = getConfigPathData(configData, ['eleventy', 'serverless', 'path', 'uuid']);

      if (pathNursery !== '' && pathUUID !== '') {
        nurseriesNurseryItemData = getItemByTypeAndMachineName(nurseriesData, 'nursery', pathNursery, pathUUID);

        if (nurseriesNurseryItemData !== {}) {
          nurseriesNurseryData[pathNursery] = nurseriesNurseryItemData;
        }
      }
    } else {
      nurseriesNurseryData = getCollectionPathData(nurseriesData, ['nursery']);
    }

    // console.log('plant info has ' + Object.entries(plantInfoData).length + ' items');
    // console.log('nurseries data has ' + Object.entries(nurseriesData).length + ' items');
    console.log('nursery data has ' + Object.entries(nurseriesNurseryData).length + ' items');
  }

  return nurseriesNurseryData;
}
