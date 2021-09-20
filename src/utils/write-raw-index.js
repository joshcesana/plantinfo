const fs = require("fs");

/**
 * Takes a collection and builds a raw index for lunr.
 *
 * @param {String}          outputDir   The 11ty output directory.
 * @param {String}          indexSlug   The slug for the custom lunr index.
 * @param {Array}          collection  The collection used by the index.
 */
module.exports = (outputDir, indexSlug, collection) => {
  let lunrDir = './' + outputDir + '/lunr';
  let customDir = '/' +indexSlug;

  if (!fs.existsSync(lunrDir)){
    fs.mkdirSync(lunrDir);
  }

  if (!fs.existsSync(lunrDir + customDir)){
    fs.mkdirSync(lunrDir + customDir);
  }

  fs.writeFileSync(lunrDir + customDir  + '/raw.json', JSON.stringify(collection));
};
