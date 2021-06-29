const getCustomCollection = require('./src/utils/get-custom-collection.js');
const getFilteredByLetterGroup = require('./src/utils/get-filtered-by-letter-group.js');
const getFilteredByNumberLetterGroup = require('./src/utils/get-filtered-by-number-letter-group.js');
const getFilteredByRootItemType = require('./src/utils/get-filtered-by-root-item-type.js');
const getElementItemsByType = require('./src/utils/get-element-items-by-type.js');
const getLetterListByItemType = require('./src/utils/get-letter-list-by-item-type.js');
const sortByMachineName = require('./src/utils/sort-by-machine-name.js');
const sortLetterArray = require('./src/utils/sort-letter-array.js');
const getPlantPermalink = require('./src/filters/get-plant-permalink.js');
const getNurseryPermalink = require('./src/filters/get-nursery-permalink.js');
const getNurseryCategoryPermalink = require('./src/filters/get-nursery-category-permalink.js');
const getCommonNamePermalink = require('./src/filters/get-common-name-permalink.js');

module.exports = config => {
  // Set directories to pass through to the dist folder
  config.addPassthroughCopy('./src/images/');

  let rootData = {
    plants: {
      dataPath: ['plants_archive', 'family'],
      levelsDeep: [3],
      itemType: 'family'
    },
    common_names: {
      dataPath: ['common_names_full', 'common_names'],
      itemType: 'common_name'
    },
    nurseries: {
      dataPath: ['nursery_catalogs_archive', 'nurseries'],
      levelsDeep: [2],
      itemType: 'nursery'
    },
    nursery_categories: {
      dataPath: ['terms_full', 'terms'],
      itemType: 'nursery_category'
    },
    journals: {
      dataPath: ['journal_citations_archive', 'journals'],
      levelsDeep: [3],
      itemType: 'journal_book'
    }
  };

  config.addNunjucksFilter("getPlantPermalink", (value) => getPlantPermalink(value));
  config.addNunjucksFilter("getNurseryPermalink", (value) => getNurseryPermalink(value));
  config.addNunjucksFilter("getNurseryCategoryPermalink", (value) => getNurseryCategoryPermalink(value));
  config.addNunjucksFilter("getCommonNamePermalink", (value) => getCommonNamePermalink(value));

  let getLetterGroupCollection = (collection, dataPath, levelsDeep, itemType) => {
    return sortByMachineName(
      getFilteredByLetterGroup(collection, dataPath, levelsDeep, itemType)
    );
  };

  let getNumberLetterCollection = (collection, dataPath, levelsDeep, itemType) => {
    return sortByMachineName(
      getFilteredByNumberLetterGroup(collection, dataPath, levelsDeep, itemType)
    );
  };

  let getRootItemTypeCollection = (collection, dataPath, termType) => {
    return sortByMachineName(
      getFilteredByRootItemType(collection, dataPath, termType)
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
    return getLetterGroupCollection(collection, rootData.plants.dataPath, rootData.plants.levelsDeep, rootData.plants.itemType);
  });

  // Returns genus items.
  config.addCollection('genus', async (collection) => {
    let familyCollection = getLetterGroupCollection(collection, rootData.plants.dataPath, rootData.plants.levelsDeep, rootData.plants.itemType);

    return getElementItemsCollection(familyCollection, 'genus');
  });

  // Returns genus letter items.
  config.addCollection('genusLetters', async (collection) => {
    let familyCollection = getLetterGroupCollection(collection, rootData.plants.dataPath, rootData.plants.levelsDeep, rootData.plants.itemType);
    let genusCollection = getElementItemsCollection(familyCollection, 'genus');

    return getLetterListCollection(genusCollection, 'genus');
  });

  // Returns species items.
  let speciesCollection = [];
  config.addCollection('species', async (collection) => {
    let familyCollection = getLetterGroupCollection(collection, rootData.plants.dataPath, rootData.plants.levelsDeep, rootData.plants.itemType);
    let genusCollection = getElementItemsCollection(familyCollection, 'genus');

    return getElementItemsCollection(genusCollection, 'species');
  });

  // Returns variety items.
  config.addCollection('variety', async (collection) => {
    let familyCollection = getLetterGroupCollection(collection, rootData.plants.dataPath, rootData.plants.levelsDeep, rootData.plants.itemType);
    let genusCollection = getElementItemsCollection(familyCollection, 'genus');
    let speciesCollection = getElementItemsCollection(genusCollection, 'species');

    return getElementItemsCollection(speciesCollection, 'variety');
  });

  // Returns nursery term items.
  config.addCollection('common_name', collection => {
    return getRootItemTypeCollection(collection, rootData.common_names.dataPath, rootData.common_names.itemType);
  });

  // Returns nursery items.
  config.addCollection('nursery', collection => {
    return getNumberLetterCollection(collection, rootData.nurseries.dataPath, rootData.nurseries.levelsDeep, rootData.nurseries.itemType);
  });

  // Returns nursery catalog items.
  config.addCollection('nursery_catalog', async (collection) => {
    let nurseryCollection = getNumberLetterCollection(collection, rootData.nurseries.dataPath, rootData.nurseries.levelsDeep, rootData.nurseries.itemType);

    return getElementItemsCollection(nurseryCollection, 'nursery_catalog');
  });

  // Returns nursery term items.
  config.addCollection('nursery_category', collection => {
    return getRootItemTypeCollection(collection, rootData.nursery_categories.dataPath, rootData.nursery_categories.itemType);
  });

  // Returns journal_book items.
  config.addCollection('journal_book', collection => {
    return getNumberLetterCollection(collection, rootData.journals.dataPath, rootData.journals.levelsDeep, rootData.journals.itemType);
  });

  // Returns citation reference items.
  config.addCollection('citation_reference', async (collection) => {
    let journalCollection = getNumberLetterCollection(collection, rootData.journals.dataPath, rootData.journals.levelsDeep, rootData.journals.itemType);

    return getElementItemsCollection(journalCollection, 'citation_reference');
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
