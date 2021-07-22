/**
 * Takes a collection and returns back the first letters of the names in the collection.
 *
 * @param {Array}        collection   The 11ty collection
 * @param {String}       itemType     The item type to use for the collection.
 * @returns {Array}                   The filtered collection
 */
module.exports = (collection, itemType) => {
  let letterList = [];
  let letterFoundList = [];

  let cloneItem = (item) => {
    return JSON.parse(JSON.stringify(item))
  };

  if (
    typeof(collection) !== 'undefined' &&
    Array.isArray(collection) &&
    collection.length > 0
  ) {
    collection.forEach(item => {
      if (
        item.hasOwnProperty('data') &&
        item.data.hasOwnProperty('type') &&
        item.data.hasOwnProperty('name')
      ) {
        if (item.data.type === itemType) {
          let thisItem = cloneItem = item;
          let firstLetter = (thisItem.data.name.match(/[a-zA-Z]/) || []).pop();

          if (firstLetter !== '' && !letterFoundList.includes(firstLetter)) {
            letterFoundList.push(firstLetter);
            letterList.push({
              data: {
                name: firstLetter,
                letter: firstLetter,
                letter_slug: firstLetter.toLowerCase()
              }
            });
          }
        }
      }
    });
  }

  return letterList;
};
