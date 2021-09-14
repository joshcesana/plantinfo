const {
  objectHasOwnProperties,
  isArrayWithItems,
  createNurseryPermalinkPath,
  createNurseryCategoryPermalinkPath,
  capitalizeFirstLetter
} = require('../_data/helpers.js');

/**
 * Takes a collection and returns it back with the custom index.
 *
 * @param {Array}           nurseryCollection  The 11ty collection
 * @param {Array}           nurseryCategories  The 11ty collection
 * @returns {Array}                            The custom index
 */
module.exports = (nurseryCollection, nurseryCategories) => {
  let index = [];

  let nurseryCategoriesData = [];

  let addCategory = function(category, categories) {
    if (
      objectHasOwnProperties(category, ['data'])
    ) {
      if (
        objectHasOwnProperties(category['data'], ['name']) &&
        objectHasOwnProperties(category['data'], ['machine_name']) &&
        objectHasOwnProperties(category['data'], ['type'])
      ) {
        categories.push(category);
      }
    }
    return categories
  };

  let checkCategory = function(category, categories, type, machine_name) {
    if (
      (category['data']['type'] === type) &&
      (category['data']['machine_name'] === machine_name)
    ) {
      categories.push(category);
    }

    return categories;
  };

  let findCategory = function(categories, type, machine_name) {
    let
      categoriesFound = [],
      categoryFound = {};

    categories.forEach(category => {
      categoriesFound = checkCategory(category, categoriesFound, type, machine_name);
    });

    if (categoriesFound.length > 0) {
      categoryFound = categoriesFound[0];
    }

    return categoryFound;
  };

  nurseryCategories.forEach(nurseryCategory => {
    nurseryCategoriesData = addCategory(nurseryCategory, nurseryCategoriesData);
  });

  if (isArrayWithItems(nurseryCollection)) {
    nurseryCollection.forEach(nursery => {
      if (
        objectHasOwnProperties(nursery, ['data'])
      ) {

        if (
          objectHasOwnProperties(nursery.data, ['name']) &&
          objectHasOwnProperties(nursery.data, ['machine_name']) &&
          objectHasOwnProperties(nursery.data, ['location', 'city']) &&
          objectHasOwnProperties(nursery.data, ['location', 'state']) &&
          objectHasOwnProperties(nursery.data, ['specialties']) &&
          objectHasOwnProperties(nursery.data, ['retail_wholesale'])
        ) {
          let
            permalink_path = createNurseryPermalinkPath(nursery),
            nurserySpecialties = [],
            nurserySpecialtyPaths = [],
            salseTypes = [];

          if (isArrayWithItems(nursery.data['specialties'])) {
            nursery.data['specialties'].forEach(specialty => {
              if (
                objectHasOwnProperties(specialty, ['type']) &&
                objectHasOwnProperties(specialty, ['machine_name'])
              ) {
                let thisSpecialty = findCategory(nurseryCategoriesData, specialty['type'], specialty['machine_name']);

                if (
                  objectHasOwnProperties(thisSpecialty, ['data']) &&
                  objectHasOwnProperties(thisSpecialty['data'], ['name'])
                ) {
                  nurserySpecialties.push(thisSpecialty['data']['name']);
                }

                let thisSpecialtyPath = createNurseryCategoryPermalinkPath(thisSpecialty);
                nurserySpecialtyPaths.push(thisSpecialtyPath);
              }
            });
          }

          let salesTypeEntries = Object.entries(nursery.data['retail_wholesale']);
          if (isArrayWithItems(salesTypeEntries)) {
            salesTypeEntries.forEach(([sales_type, in_use]) => {
              if (in_use) {
                salseTypes.push(capitalizeFirstLetter(sales_type));
              }
            });
          }

          index.push({
            machine_name: nursery.data['machine_name'],
            permalink_path: permalink_path,
            name: nursery.data['name'],
            city: nursery.data['location']['city'],
            state: nursery.data['location']['state'],
            specialty_names: nurserySpecialties,
            specialty_permalink_paths: nurserySpecialtyPaths,
            sales_types: salseTypes,
          });
      }
      }
    });
  }

  return index;
};
