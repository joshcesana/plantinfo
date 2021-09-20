const lunr = require("lunr");

/**
 * Takes a collection and builds a lunr index.
 *
 * @param {Array}           collection  The 11ty collection
 * @param {String}          refKey      The field key to use as the unique reference.
 * @param {Array}           fieldKeys   The field keys to index.
 * @returns {Object}                    The lunr index
 */
module.exports = (collection, refKey, fieldKeys) => {
  let docs = JSON.parse(JSON.stringify(collection));

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
