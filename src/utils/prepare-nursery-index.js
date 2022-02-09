const {
  objectHasOwnProperties,
  checkBooleanObjectProperties,
  isObject,
  isArray,
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
  let
    index = [],
    nurseryCategoriesData = [],
    addCategory = function(category, categories) {
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
    },
    checkCategory = function(category, categories, type, machine_name) {
      if (
        (category['data']['type'] === type) &&
        (category['data']['machine_name'] === machine_name)
      ) {
        categories.push(category);
      }

      return categories;
    },
    findCategory = function(categories, type, machine_name) {
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
    },
    buildNurseryIndexCountries = (itemIndex, itemCheck) => {
      checkBooleanObjectProperties(itemCheck['location']['country'], (country_key, in_use) => {
        itemIndex.country_keys.push(country_key);
        itemIndex.country_names.push(getCountryName(country_key));
      });

      return itemIndex;
    },
    buildNurseryIndexSalesTypes = (itemIndex, itemCheck) => {
      checkBooleanObjectProperties(itemCheck['retail_wholesale'], (sales_type, in_use) => {
        itemIndex.sales_type_keys.push(sales_type);
        itemIndex.sales_type_names.push(capitalizeFirstLetter(sales_type));
      });

      return itemIndex;
    },
    buildNurseryIndexSpecialties = (itemIndex, itemCheck, nurseryCategoriesData) => {
      if (isArrayWithItems(itemCheck['specialties'])) {
        itemCheck['specialties'].forEach(specialty => {
          if (
            objectHasOwnProperties(specialty, ['type']) &&
            objectHasOwnProperties(specialty, ['machine_name'])
          ) {
            let thisSpecialty = findCategory(nurseryCategoriesData, specialty['type'], specialty['machine_name']);

            if (
              isObject(thisSpecialty) &&
              objectHasOwnProperties(thisSpecialty, ['data'])
            ) {
              if (
                objectHasOwnProperties(thisSpecialty['data'], ['name']) &&
                objectHasOwnProperties(thisSpecialty['data'], ['machine_name']) &&
                objectHasOwnProperties(thisSpecialty['data'], ['type'])
              ) {
                let thisSpecialtyPath = createNurseryCategoryPermalinkPath(thisSpecialty);

                itemIndex.specialty_keys.push(thisSpecialty['data']['machine_name']);
                itemIndex.specialty_names.push(thisSpecialty['data']['name']);
                itemIndex.specialty_permalink_paths.push(thisSpecialtyPath);
              }
            }
          }
        });
      }

      return itemIndex;
    },
    buildNurseryIndex = (itemCheck, nurseryCategoriesData) => {
      let itemIndex = {
        machine_name: itemCheck['machine_name'],
        permalink_path: createNurseryPermalinkPath(itemCheck),
        name: itemCheck['name'],
        city: itemCheck['location']['city'],
        state: itemCheck['location']['state'],
        country_keys: [],
        country_names: [],
        specialty_keys: [],
        specialty_names: [],
        specialty_permalink_paths: [],
        sales_type_keys: [],
        sales_type_names: [],
      };

      itemIndex = buildNurseryIndexSpecialties(itemIndex, itemCheck, nurseryCategoriesData);
      itemIndex = buildNurseryIndexSalesTypes(itemIndex, itemCheck);
      itemIndex = buildNurseryIndexCountries(itemIndex, itemCheck);

      return itemIndex;
    },
    addItemToIndex = (index, item) => {
      index.push(item);

      return index;
    },
    checkNursery = (index, nursery, nurseryCategoriesData) => {
      let itemCheck = nursery;

      if (
        objectHasOwnProperties(itemCheck, ['data'])
      ) {
        itemCheck = nursery.data;

        if (
          objectHasOwnProperties(itemCheck, ['name']) &&
          objectHasOwnProperties(itemCheck, ['machine_name']) &&
          objectHasOwnProperties(itemCheck, ['location', 'city']) &&
          objectHasOwnProperties(itemCheck, ['location', 'state']) &&
          objectHasOwnProperties(itemCheck, ['location', 'country']) &&
          objectHasOwnProperties(itemCheck, ['specialties']) &&
          objectHasOwnProperties(itemCheck, ['retail_wholesale'])
        ) {
          let itemIndex = buildNurseryIndex(itemCheck, nurseryCategoriesData);
          index = addItemToIndex(index, itemIndex)
        }
      }

      return index;
    };

  nurseryCategories.forEach(nurseryCategory => {
    nurseryCategoriesData = addCategory(nurseryCategory, nurseryCategoriesData);
  });

  if (
    isArray(nurseryCollection) &&
    isArrayWithItems(nurseryCollection)
  ) {
    console.log('nursery collection has an array for indexing');
    nurseryCollection.forEach(nursery => {
      index = checkNursery(index, nursery, nurseryCategoriesData);
    });
  }

  console.log('nursery index has ' + index.length + ' items');

  return index;
};
