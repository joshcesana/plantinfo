const uuidv4 = require("uuid/v4");

/**
 * Takes a collection and returns it back with the attached terms by type.
 *
 * @param {Array}       collection    The 11ty collection
 * @param {Array}       dataPath      The data path to the terms.
 * @param {String}      termType      The term type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (collection, dataPath, termType) => {
  let termGroup = collection.getAll()[0].data;
  let termItems = [];

  dataPath.forEach(pathItem => {
    if (
      termGroup.hasOwnProperty(pathItem) &&
      typeof(termGroup[pathItem]) !== 'undefined'
    ) {
      termGroup = termGroup[pathItem];
    }
  });

  if (
    typeof(termGroup) !== 'undefined' &&
    Array.isArray(termGroup) &&
    termGroup.length > 0
  ) {

    termGroup.forEach(termItem => {
      if (
        termItem.hasOwnProperty('type') &&
        termItem.type === termType &&
        termItem.hasOwnProperty('name') &&
        termItem.hasOwnProperty('machine_name')
      ) {
        termItem['uuid'] = uuidv4();

        termItems.push({
          data: termItem
        });
      }
    });
  }

  return termItems;
};
