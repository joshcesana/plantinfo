const {
  objectHasOwnProperties,
  isArrayWithItems,
  getItemByTypeAndMachineName
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

  if (isArrayWithItems(nurseryCollection)) {
    nurseryCollection.forEach(nursery => {
      if (
        objectHasOwnProperties(nursery, ['data'])
      ) {
        if (
          objectHasOwnProperties(nursery.data, ['name']) &&
          objectHasOwnProperties(nursery.data, ['machine_name']) &&
          objectHasOwnProperties(nursery.data, ['location', 'state']) &&
          objectHasOwnProperties(nursery.data, ['specialties'])
        ) {

          let nurserySpecialties = [];

          if (isArrayWithItems(nursery.data['specialties'])) {
            nursery.data['specialties'].forEach(specialty => {
              if (
                objectHasOwnProperties(objectHasOwnProperties, ['type', 'machine_name'])
              ) {
                let thisSpecialty = getItemByTypeAndMachineName(nurseryCategories, specialty['type'], specialty['machine_name'])

                if (
                  objectHasOwnProperties(thisSpecialty, ['data', 'name'])
                ) {
                  nurserySpecialties.push(thisSpecialty.data['name']);
                }
              }
            });
          }

          index.push({
            machine_name: nursery.data['machine_name'],
            name: nursery.data['name'],
            state: nursery.data['location']['state'],
            specialties: nurserySpecialties,
          });
      }
      }
    });
  }

  return index;
};
