const {
  objectHasOwnProperties,
  checkBooleanObjectProperties,
  isArrayWithItems,
  createNurseryPermalinkPath,
  createNurseryCategoryPermalinkPath,
  capitalizeFirstLetter,
  getCountryName
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
          objectHasOwnProperties(nursery.data, ['location', 'country']) &&
          objectHasOwnProperties(nursery.data, ['specialties']) &&
          objectHasOwnProperties(nursery.data, ['retail_wholesale'])
        ) {
          let
            permalink_path = createNurseryPermalinkPath(nursery),
            nurserySpecialties = [],
            nurserySpecialtyKeys = [],
            nurserySpecialtyPaths = [],
            salesTypeKeys = [],
            salesTypeNames = [],
            countryKeys = [],
            countryNames = [];

          if (isArrayWithItems(nursery.data['specialties'])) {
            nursery.data['specialties'].forEach(specialty => {
              if (
                objectHasOwnProperties(specialty, ['type']) &&
                objectHasOwnProperties(specialty, ['machine_name'])
              ) {
                let thisSpecialty = findCategory(nurseryCategoriesData, specialty['type'], specialty['machine_name']);
                nurserySpecialtyKeys.push(thisSpecialty['data']['machine_name']);

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

          checkBooleanObjectProperties(nursery.data['retail_wholesale'], (sales_type, in_use) => {
            salesTypeKeys.push(sales_type);
            salesTypeNames.push(capitalizeFirstLetter(sales_type));
          });

          checkBooleanObjectProperties(nursery.data['location']['country'], (country_key, in_use) => {
            countryKeys.push(country_key);
            countryNames.push(getCountryName(country_key));
          });

          index.push({
            machine_name: nursery.data['machine_name'],
            permalink_path: permalink_path,
            name: nursery.data['name'],
            city: nursery.data['location']['city'],
            state: nursery.data['location']['state'],
            country_keys: countryKeys,
            country_names: countryNames,
            specialty_keys: nurserySpecialtyKeys,
            specialty_names: nurserySpecialties,
            specialty_permalink_paths: nurserySpecialtyPaths,
            sales_type_keys: salesTypeKeys,
            sales_type_names: salesTypeNames,
          });
      }
      }
    });
  }

  return index;
};
