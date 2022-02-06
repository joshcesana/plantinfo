const sortByMachineName = require('./sort-by-machine-name.js');
const getElementItemsByType = require('./get-element-items-by-type.js');

/**
 * Takes a collection and returns it back with the attached element items by
 * type, then sorted by machine name.
 *
 * @param {Array}           collection      The 11ty collection
 * @param {String}          itemType        The item type to use for the collection.
 * @param {Boolean|String}  elementTypeRef  The option to add a reference to the
 *                                            element machine name, using the element type.
 * @returns {Array}                         The filtered collection
 */
module.exports = (collection, itemType, elementTypeRef) => {
  return sortByMachineName(
    getElementItemsByType(collection, itemType, elementTypeRef)
  );
};
