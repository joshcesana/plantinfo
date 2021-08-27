const fs = require("fs");
const lunr = require("lunr");

/**
 * Takes a collection and builds a lunr index.
 *
 * @param {Array}           collection  The 11ty collection
 * @param {String}          outputDir   The 11ty output directory.
 * @param {String}          indexSlug    The slug for the custom lunr index.
 * @param {String}          refKey      The field key to use as the unique reference.
 * @param {Array}           fieldKeys   The field keys to index.
 */
module.exports = (collection, outputDir, indexSlug, refKey, fieldKeys) => {
  let docs = JSON.parse(JSON.stringify(collection));

  let idx = lunr(function () {
    this.ref(refKey);
    fieldKeys.forEach(fieldKey => {
      this.field(fieldKey);
    });

    docs.forEach(function (doc, idx) {
      doc.id = idx;
      this.add(doc);
    }, this);
  });

  let lunrDir = './' + outputDir + '/lunr';
  let customDir = '/' +indexSlug;

  if (!fs.existsSync(lunrDir)){
    fs.mkdirSync(lunrDir);
  }

  if (!fs.existsSync(lunrDir + customDir)){
    fs.mkdirSync(lunrDir + customDir);
  }

  fs.writeFileSync(lunrDir + customDir  + '/raw.json', JSON.stringify(collection));
  fs.writeFileSync(lunrDir + customDir  + '/index.json', JSON.stringify(idx));
};
