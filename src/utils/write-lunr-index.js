const fs = require("fs");

/**
 * Takes a collection and builds a lunr index.
 *
 * @param {String}          outputDir   The 11ty output directory.
 * @param {String}          indexSlug   The slug for the custom lunr index.
 * @param {Object}          idx         The lunr index.
 */
module.exports = (outputDir, indexSlug, idx) => {
  let lunrDir = './' + outputDir + '/lunr';
  let customDir = '/' +indexSlug;

  if (!fs.existsSync(lunrDir)){
    fs.mkdirSync(lunrDir);
  }

  if (!fs.existsSync(lunrDir + customDir)){
    fs.mkdirSync(lunrDir + customDir);
  }

  fs.writeFileSync(lunrDir + customDir  + '/index.json', JSON.stringify(idx));
};
