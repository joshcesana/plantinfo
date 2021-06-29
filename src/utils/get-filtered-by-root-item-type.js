const uuidv4 = require("uuid/v4");

/**
 * Takes a collection and returns it back with the attached items by type.
 *
 * @param {Array}       collection    The 11ty collection
 * @param {Array}       dataPath      The data path to the terms.
 * @param {String}      itemType      The term type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (collection, dataPath, itemType) => {
  let rootGroup = collection.getAll()[0].data;
  let rootItems = [];

  dataPath.forEach(pathItem => {
    if (
      rootGroup.hasOwnProperty(pathItem) &&
      typeof(rootGroup[pathItem]) !== 'undefined'
    ) {
      rootGroup = rootGroup[pathItem];
    }
  });

  if (
    typeof(rootGroup) !== 'undefined' &&
    Array.isArray(rootGroup) &&
    rootGroup.length > 0
  ) {

    rootGroup.forEach(rootItem => {
      if (
        rootItem.hasOwnProperty('type') &&
        rootItem.type === itemType &&
        rootItem.hasOwnProperty('name') &&
        rootItem.hasOwnProperty('machine_name')
      ) {
        rootItem['uuid'] = uuidv4();

        rootItems.push({
          data: rootItem
        });
      }
    });
  }

  return rootItems;
};
