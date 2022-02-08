const {
  isArray,
  isArrayWithItems,
  checkGroupItem,
} = require('../_data/helpers.js');

/**
 * Takes a collection and returns it back with the attached element items by type.
 *
 * @param {Array}           collection      The 11ty collection
 * @param {String}          itemType        The item type to use for the collection.
 * @param {Boolean|String}  elementTypeRef  The option to add a reference to the
 *                                            element machine name, using the element type.
 * @returns {Array}                         The filtered collection
 */
module.exports = (collection, itemType, elementTypeRef) => {
  const elementItemsLabel = itemType + '_items';
  let
    groupItems = [],
    itemGroup = collection,
    groupItemHasData = true,
    groupItemHasName = false,
    groupItemHasElementItems = true,
    groupElementItems = elementItemsLabel,
    groupElementTypeRef = elementTypeRef
  ;

  if (
    isArray(itemGroup) &&
    isArrayWithItems(itemGroup)
  ) {
    itemGroup.forEach(groupItem => {
      groupItems = checkGroupItem(
        groupItems,
        groupItem,
        itemType,
        groupItemHasData,
        groupItemHasName,
        groupItemHasElementItems,
        groupElementItems,
        groupElementTypeRef
      );
    });
  }

  console.log('element items by type group has ' + groupItems.length + ' items for ' + itemType);

  return groupItems;
};
