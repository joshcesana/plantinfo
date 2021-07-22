const {
  objectHasOwnProperties,
  cloneObject,
  isArrayWithItems
} = require('../_data/helpers.js');

/**
 * Takes a collection and returns it back with the attached items by type.
 *
 * @param {Array}       sourceCollection    The 11ty collection to be sorted into categories
 * @param {Array}       targetCollection    The 11ty collection with the categories.
 * @param {Array}       categoryKey      The data path to the terms.
 * @param {String}      itemType      The term type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (sourceCollection, targetCollection, categoryKey, itemType) => {
  let categoryCollection = {};
  let categoryItemCollection = [];

  let cloneItem = (item) => {
    return JSON.parse(JSON.stringify(item))
  };

  let addItemToCategoryCollection = (item, itemType, category, categoryCollection) => {
    let thisItem = cloneObject(item);
    thisItem.data[itemType] = category;
    categoryCollection[category].push(thisItem);

    return categoryCollection;
  };

  let addItemToCategoryItemCollection = (item, categoryItemCollection) => {
    let thisItem = cloneObject(item);
    categoryItemCollection.push(thisItem);

    return categoryItemCollection;
  };

  if (
    isArrayWithItems(sourceCollection)
  ) {
    sourceCollection.forEach(sourceItem => {


      if (
        objectHasOwnProperties(sourceItem, ['data', categoryKey]) &&
        isArrayWithItems(sourceItem.data[categoryKey])
      ) {
        sourceItem.data[categoryKey].forEach(categoryItem => {
          if (
            objectHasOwnProperties(categoryItem, ['type']) &&
            objectHasOwnProperties(categoryItem, ['machine_name'])
          ) {
            let thisCategory = categoryItem['machine_name'];

            if (!categoryCollection.hasOwnProperty(thisCategory)) {
              categoryCollection[thisCategory] = [];
            }

            categoryCollection = addItemToCategoryCollection(sourceItem, itemType, thisCategory, categoryCollection);
          }
        });
      }
    });

    targetCollection.forEach(targetItem => {
      if (
        objectHasOwnProperties(targetItem, ['data', 'type']) &&
        objectHasOwnProperties(targetItem, ['data', 'machine_name'])
      ) {
        targetItem.data[itemType + '_items'] = [];
        let targetCategory = targetItem.data['machine_name'];
        if (
          objectHasOwnProperties(categoryCollection, [targetCategory]) &&
          isArrayWithItems(categoryCollection[targetCategory])
        ) {
          targetItem.data[itemType + '_items'] = cloneObject(categoryCollection[targetCategory]);
        }
        categoryItemCollection = addItemToCategoryItemCollection(targetItem, categoryItemCollection);
      }
    });
  }

  return categoryItemCollection;
};
