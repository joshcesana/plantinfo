const getCustomCollection = require('./src/utils/get-custom-collection.js');
const getFilteredByLetterGroup = require('./src/utils/get-filtered-by-letter-group.js');
const getElementItemsByType = require('./src/utils/get-element-items-by-type.js');
const getLetterListByItemType = require('./src/utils/get-letter-list-by-item-type.js');
const sortByMachineName = require('./src/utils/sort-by-machine-name.js');
const sortLetterArray = require('./src/utils/sort-letter-array.js');

module.exports = config => {
  // Set directories to pass through to the dist folder
  config.addPassthroughCopy('./src/images/');

  let rootDataPath = ['plants_archive', 'family'];
  let rootLevelsDeep = [3];
  let rootItemType = 'family';

  let getLetterGroupCollection = (collection, dataPath, levelsDeep, itemType) => {
    return sortByMachineName(
      getFilteredByLetterGroup(collection, ['plants_archive', 'family'], [3], 'family')
    );
  };

  let getElementItemsCollection = (collection, itemType) => {
    return sortByMachineName(
      getElementItemsByType(collection, itemType)
    );
  };

  let getLetterListCollection = (collection, itemType) => {
    return sortLetterArray(
      getLetterListByItemType(collection, itemType)
    );
  };

  // Returns family items.
  config.addCollection('family', collection => {
    return getLetterGroupCollection(collection, rootDataPath, rootLevelsDeep, rootItemType);
  });

  // Returns genus items.
  config.addCollection('genus', async (collection) => {
    let familyCollection = getLetterGroupCollection(collection, rootDataPath, rootLevelsDeep, rootItemType);

    return getElementItemsCollection(familyCollection, 'genus');
  });

  // Returns genus letter items.
  config.addCollection('genusLetters', async (collection) => {
    let familyCollection = getLetterGroupCollection(collection, rootDataPath, rootLevelsDeep, rootItemType);
    let genusCollection = getElementItemsCollection(familyCollection, 'genus');

    return getLetterListCollection(genusCollection, 'genus');
  });

  // Returns species items.
  let speciesCollection = [];
  config.addCollection('species', async (collection) => {
    let familyCollection = getLetterGroupCollection(collection, rootDataPath, rootLevelsDeep, rootItemType);
    let genusCollection = getElementItemsCollection(familyCollection, 'genus');

    return getElementItemsCollection(genusCollection, 'species');
  });

  // Returns variety items.
  config.addCollection('variety', async (collection) => {
    let familyCollection = getLetterGroupCollection(collection, rootDataPath, rootLevelsDeep, rootItemType);
    let genusCollection = getElementItemsCollection(familyCollection, 'genus');
    let speciesCollection = getElementItemsCollection(genusCollection, 'species');

    return getElementItemsCollection(speciesCollection, 'variety');
  });

  // Tell 11ty to use the .eleventyignore and ignore our .gitignore file
  config.setUseGitIgnore(false);

  // Do not watch JS dependencies in order to improve build times. This means if
  // data sources are switched, watch must be restarted.
  config.setWatchJavaScriptDependencies(false);


  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',

    dir: {
      input: 'src',
      output: 'dist'
    }
  };
};
