const {
  objectHasOwnProperties,
  isArrayWithItems,
  createPlantPermalinkPath,
  capitalizeFirstLetter,
  cloneObject,
} = require('../_data/helpers.js');

/**
 * Takes a collection and returns it back with the custom index.
 *
 * @param {Array}           plantLevelCollections  An array of 11ty collections
 * @returns {Array}                            The custom index
 */
module.exports = (plantLevelCollections) => {
  let index = [],
    plantLevels = plantLevelCollections,
    index_default_settings = {
      machine_name: null,
      permalink_path: null,
      name: null,
      has_plant: false,
      plant_name: null,
      plant_machine_name: null,
      plant_permalink_path: null,
      has_taxonomy_level: false,
      taxonomy_level_key: null,
      taxonomy_level_name: null,
      has_common_name: false,
      common_name:  null,
      common_machine_name: null,
      common_name_permalink_path: null,
      availabile_in_nursery: null,
      has_citations: null
    };

  let addItemToIndex = function(index_settings = index_default_settings) {
    let merged_index_settings = {
      ...index_default_settings,
      ...cloneObject(index_settings)
    }

    index.push(merged_index_settings);

    return index;
  }

  let addPlantToIndex = function(plantInLevel, index) {
    if (
      objectHasOwnProperties(plantInLevel, ['data'])
    ) {

      if (
        objectHasOwnProperties(plantInLevel.data, ['name']) &&
        objectHasOwnProperties(plantInLevel.data, ['machine_name']) &&
        objectHasOwnProperties(plantInLevel.data, ['type'])
      ) {
        let
          plant_name = plantInLevel.data['name'],
          plant_machine_name = plantInLevel.data['machine_name'],
          plant_permalink_path = createPlantPermalinkPath(plantInLevel),
          has_taxonomy_level = true,
          taxonomy_level_key,
          taxonomy_level_name;

        if (
          objectHasOwnProperties(plantInLevel.data, ['lower_ranks']) &&
          isArrayWithItems(plantInLevel.data['lower_ranks'])
        ) {
          taxonomy_level_key = plantInLevel.data['lower_ranks'][0];
          taxonomy_level_name = plantInLevel.data['lower_ranks'][0];
        } else {
          taxonomy_level_key = plantInLevel.data['type'];
          taxonomy_level_name = capitalizeFirstLetter(plantInLevel.data['type']);
        }

        let this_plant_index_settings = {
          machine_name: plant_machine_name,
          permalink_path: plant_permalink_path,
          name: plant_name,
          has_plant: true,
          plant_name: plant_name,
          plant_machine_name: plant_machine_name,
          plant_permalink_path: plant_permalink_path,
          has_taxonomy_level: has_taxonomy_level,
          taxonomy_level_key: taxonomy_level_key,
          taxonomy_level_name: taxonomy_level_name,
        };

        index = addItemToIndex(this_plant_index_settings);
      }
    }

    return index;
  }

  let addPlantLevelToIndex = function(plantLevelCollection, index) {
    if (
      isArrayWithItems(plantLevelCollection) &&
      Array.isArray(index)
    ) {
      return plantLevelCollection.reduce((index, plantInLevel) => {
        return addPlantToIndex(plantInLevel, index);
      }, index);
    } else {
      return index;
    }
  }

  let addPlantLevelsToIndex = function(plantLevels, index) {
    if (
      isArrayWithItems(plantLevels) &&
      Array.isArray(index)
    ) {
      return plantLevels.reduce((index, plantLevel) => {
        return addPlantLevelToIndex(plantLevel, index);
      }, index);
    } else {
      return index;
    }
  }

  index = addPlantLevelsToIndex(plantLevels, index);

  return index;
};
