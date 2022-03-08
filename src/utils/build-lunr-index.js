const lunr = require("lunr");

/**
 * Takes a collection and builds a lunr index.
 *
 * @param {Array|Object}    collection  The 11ty collection
 * @param {String}          refKey      The field key to use as the unique reference.
 * @param {Array}           fieldKeys   The field keys to index.
 * @returns {Object}                    The lunr index
 */
module.exports = (collection, refKey, fieldKeys) => {
  let
    collection_docs = {},
    lunr_index = {},
    getDocs = (collection) => {
      return JSON.parse(JSON.stringify(collection));
    },
    getIndex = (docs) => {
      return lunr(function () {
        this.ref(refKey);
        fieldKeys.forEach(fieldKey => {
          this.field(fieldKey);
        });

        docs.forEach(function (doc, idx) {
          doc.id = idx;
          this.add(doc);
        }, this);
      });
    };

  collection_docs = getDocs(collection);
  lunr_index = getIndex(collection_docs);

  return lunr_index;
}
