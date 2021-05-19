const uuidv4 = require("uuid/v4");

/**
 * Takes a collection and returns it back with the attached element items by type.
 *
 * @param {Array}        collection   The 11ty collection
 * @param {String}       itemType     The item type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (collection, itemType) => {
  let elementItems = [];
  const elementItemsLabel = itemType + '_items';

  if (
    typeof(collection) !== 'undefined' &&
    Array.isArray(collection) &&
    collection.length > 0
  ) {
    collection.forEach(item => {
      if (
        item.hasOwnProperty('data') &&
        item.data.hasOwnProperty(elementItemsLabel) &&
        typeof(item.data[elementItemsLabel]) !== 'undefined' &&
        item.data[elementItemsLabel].length > 0
      ) {
        item.data[elementItemsLabel].forEach(elementItem => {
          if (
            elementItem.hasOwnProperty('type') &&
            elementItem.type === itemType
          ) {
            elementItem['uuid'] = uuidv4();

            elementItems.push({
              data: elementItem
            });
          }
        });
      }
    });
  }

  return elementItems;
};
