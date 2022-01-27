const {
  objectHasOwnProperties,
  isArrayWithItems,
  createPlantPermalinkPath,
  createCommonNamePermalinkPath,
  capitalizeFirstLetter,
  cloneObject,
  mergeObjects,
} = require('../_data/helpers.js');

/**
 * Takes a collection and returns it back with the custom index.
 *
 * @param {Array}           plantLevels      An array of 11ty collections
 * @param {Array}           commonNames       The 11ty collection
 * @param {Array}           nurseryCatalogs   The 11ty collection
 * @param {Array}           journalCitations         The 11ty collection
 * @returns {Array}                                    The custom index
 */
module.exports = (plantLevels, commonNames, nurseryCatalogs, journalCitations) => {
  let index = [],
    plantsInNurseryCatalogs = [],
    plantsInJournalCitations = [],
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
      common_name_has_permalink: false,
      common_name_permalink_path: null,
      available_in_nursery: false,
      has_citations: false
    },

  addItemToIndex = function(index_settings = index_default_settings, index) {
    let merged_index_settings = mergeObjects(index_default_settings, index_settings);
    index.push(merged_index_settings);

    return index;
  },

  addNurseryCatalogPlant = function(plant) {
    if (
      objectHasOwnProperties(plant, ['machine_name']) &&
      plantsInNurseryCatalogs.includes(plant['machine_name']) === false
    ) {
      plantsInNurseryCatalogs.push(plant['machine_name']);
    }
  },

  addJournalCitationPlant = function(plant) {
    if (
      objectHasOwnProperties(plant, ['machine_name']) &&
      plantsInJournalCitations.includes(plant['machine_name']) === false
    ) {
      plantsInJournalCitations.push(plant['machine_name']);
    }
  },

  mergeItemsToIndexProp = function(itemsArray, index, indexProp) {
    const
      merge_key = 'machine_name',
      merge_settings = {};

    merge_settings[indexProp] = true;

    itemsArray.forEach(itemKey => {
      let
        merged_item_index = null,
        item_for_merge = {},
        merged_item = {};

      merged_item_index = index.findIndex(item => item[merge_key] === itemKey);

      if (merged_item_index !== -1) {
        item_for_merge = index[merged_item_index];
        merged_item = mergeObjects(item_for_merge, merge_settings);
        index[merged_item_index] = merged_item;
      }
    });

    return index;
  },

  mergeCommonNameWithIndex = function(index_settings = index_default_settings, index) {
    let
      merged_index_settings = mergeObjects(index_default_settings, index_settings),
      merge_key = 'machine_name',
      merge_with_index = false,
      merged_item_index = null,
      item_for_merge = {},
      merged_item = {};

    if (
      objectHasOwnProperties(index_settings, ['machine_name']) &&
      objectHasOwnProperties(index_settings, ['has_plant']) &&
      objectHasOwnProperties(index_settings, ['has_common_name']) &&
      index_settings['has_plant'] === true &&
      index_settings['has_common_name'] === true
    ) {
      merged_item_index = index.findIndex(item => item[merge_key] === index_settings['machine_name']);

      if (merged_item_index !== -1) {
        item_for_merge = index[merged_item_index];
        merged_item = mergeObjects(item_for_merge, index_settings);
        merge_with_index = true;
      }
    }

    if (
      merge_with_index === true &&
      merged_item_index !== null &&
      merged_item !== {}
    ) {
      index[merged_item_index] = merged_item;
    } else {
      index.push(merged_index_settings);
    }

    return index;
  },

  addPlantToIndex = function(plantInLevel, index) {
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

        index = addItemToIndex(this_plant_index_settings, index);
      }
    }

    return index;
  },

  addPlantLevelToIndex = function(plantLevel, index) {
    if (
      isArrayWithItems(plantLevel) &&
      Array.isArray(index)
    ) {
      return plantLevel.reduce((index, plantInLevel) => {
        return addPlantToIndex(plantInLevel, index);
      }, index);
    } else {
      return index;
    }
  },

  addCommonNameToIndex = function(commonName, index) {
    if (
      objectHasOwnProperties(commonName, ['data'])
    ) {
      if (
        objectHasOwnProperties(commonName.data, ['name']) &&
        objectHasOwnProperties(commonName.data, ['machine_name']) &&
        objectHasOwnProperties(commonName.data, ['type']) &&
        commonName.data['type'] === 'common_name'
      ) {
        let
          common_name = commonName.data['name'],
          common_machine_name = commonName.data['machine_name'],
          common_name_permalink_path = createCommonNamePermalinkPath(commonName),
          default_plant_index_settings = {
            has_common_name: true,
            common_name: common_name,
            common_machine_name: common_machine_name,
          },
          override_plant_index_settings = {},
          this_plant_index_settings = {};

        if (
          objectHasOwnProperties(commonName.data, ['plants']) &&
          isArrayWithItems(commonName.data['plants']) &&
          objectHasOwnProperties(commonName.data['plants'][0], ['machine_name'])
        ) {
          override_plant_index_settings = {
            has_plant: true,
            machine_name: commonName.data['plants'][0]['machine_name'],
            common_name_has_permalink: true,
            common_name_permalink_path: common_name_permalink_path
          };
        } else {
          override_plant_index_settings = {
            has_plant: false,
            name: common_name,
            machine_name: common_machine_name,
            permalink_path: null,
            common_name_has_permalink: false,
            common_name_permalink_path: null
          };
        }

        this_plant_index_settings = mergeObjects(default_plant_index_settings, override_plant_index_settings);
        index = mergeCommonNameWithIndex(this_plant_index_settings, index);
      }
    }

    return index;
  },

  reviewNurseryCatalog = function(nurseryCatalog) {
    if (
      objectHasOwnProperties(nurseryCatalog, ['data']) &&
      objectHasOwnProperties(nurseryCatalog.data, ['plants']) &&
      isArrayWithItems(nurseryCatalog.data['plants'])
    ) {
      nurseryCatalog.data['plants'].forEach(plant => {
        addNurseryCatalogPlant(plant);
      });
    }
  },

  reviewJournalCitation = function(journalCitation) {
    if (
      objectHasOwnProperties(journalCitation, ['data']) &&
      objectHasOwnProperties(journalCitation.data, ['plant'])
    ) {
      addJournalCitationPlant(journalCitation.data['plant']);
    }
  },

  addPlantLevelsToIndex = function(plantLevels, index) {
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
  },

  addCommonNamesToIndex = function(commonNames, index) {
    if (
      isArrayWithItems(commonNames) &&
      Array.isArray(index)
    ) {
      return commonNames.reduce((index, commonName) => {
        return addCommonNameToIndex(commonName, index);
      }, index);
    } else {
      return index;
    }
  },

  reviewNurseryCatalogs = function(nurseryCatalogs, index) {
    if (
      isArrayWithItems(nurseryCatalogs) &&
      Array.isArray(index)
    ) {
      nurseryCatalogs.forEach(nurseryCatalog => {
        reviewNurseryCatalog(nurseryCatalog);
      });
    }

    index = mergeItemsToIndexProp(plantsInNurseryCatalogs, index, 'available_in_nursery')

    return index;
  },

  reviewJournalCitations = function(journalCitations, index) {
    if (
      isArrayWithItems(journalCitations) &&
      Array.isArray(index)
    ) {
      journalCitations.forEach(journalCitation => {
        reviewJournalCitation(journalCitation);
      });
    }

    index = mergeItemsToIndexProp(plantsInJournalCitations, index, 'has_citations')

    return index;
  }

  index = addPlantLevelsToIndex(plantLevels, index);
  index = addCommonNamesToIndex(commonNames, index);
  index = reviewNurseryCatalogs(nurseryCatalogs, index);
  index = reviewJournalCitations(journalCitations, index);

  return index;
};
