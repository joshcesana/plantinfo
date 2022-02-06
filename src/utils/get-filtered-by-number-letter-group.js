const uuidv4 = require("uuid/v4");

/**
 * Takes a collection and returns it back filtered by letter group.
 *
 * @param {Array}        collection   The 11ty collection
 * @param {Array}        dataPath     The data path to the letter group.
 * @param {Array|Number} levelsDeep   Number of levels deep to seek items.
 * @param {String}       itemType     The item type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (collection, dataPath, levelsDeep, itemType) => {
  let letterGroup = collection.getAll()[0].data;

  dataPath.forEach(pathItem => {
    if (letterGroup.hasOwnProperty(pathItem)) {
      letterGroup = letterGroup[pathItem];
    }
  });

  let collectionItems = [];

  levelsDeep.forEach(levels => {
    let itemsToSeek = Object.assign(letterGroup);

    let addLevelItem = function(levelItem, itemType) {
      if (levelItem.hasOwnProperty('type') && levelItem.type === itemType) {
        levelItem['uuid'] = uuidv4();

        collectionItems.push({
          data: levelItem
        });
      }
    };

    let objectValueSeeker = function(items) {
      let itemValues = [];
      if (Object.prototype.toString.call(items) === '[object Object]') {
        itemValues = Object.values(items);
      } else if (Object.prototype.toString.call(items) === '[object Array]') {
        let myItems = new Object();
        items.map((item, index) => {
          myItems[index] = item;
        });
        objectValueSeeker(myItems);
      }

      return itemValues;
    };

    let levelItemSeeker = function(items, currentLevel, targetLevel, itemType) {
      // Make sure items is not undefined or null, and that items is an Object.
      if (typeof items !== undefined && typeof items !== null) {
        let itemValues = objectValueSeeker(items);

        if (itemValues.length > 0) {
          itemValues.forEach(levelItems => {
            if (currentLevel === targetLevel) {
              let levelItem = Object.assign(levelItems);
              addLevelItem(levelItem, itemType);
            } else {
              levelItemSeeker(levelItems, currentLevel + 1, targetLevel, itemType);
            }
          });
        }
      }
    };

    levelItemSeeker(itemsToSeek, 1, levels, itemType);

  });

  return collectionItems;
};
