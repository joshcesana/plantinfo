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
        collectionItems.push({ data: levelItem });
      }
    };

    let levelItemSeeker = function(items, currentLevel, targetLevel, itemType) {
      Object.values(items).forEach(levelItems => {
        if (currentLevel === targetLevel) {
          let levelItem = Object.assign(levelItems);
          addLevelItem(levelItem, itemType);
        } else {
          levelItemSeeker(levelItems, currentLevel + 1, targetLevel, itemType);
        }
      });
    };

    levelItemSeeker(itemsToSeek, 1, levels, itemType);

  });

  return collectionItems;
};
