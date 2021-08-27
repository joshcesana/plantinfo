const {AssetCache} = require("@11ty/eleventy-cache-assets");
const {objectHasOwnProperties} = require('./src/_data/helpers.js');
const getCustomCollection = require('./src/utils/get-custom-collection.js');
const getFilteredByLetterGroup = require('./src/utils/get-filtered-by-letter-group.js');
const getFilteredByNumberLetterGroup = require('./src/utils/get-filtered-by-number-letter-group.js');
const getFilteredByRootItemType = require('./src/utils/get-filtered-by-root-item-type.js');
const getElementItemsByType = require('./src/utils/get-element-items-by-type.js');
const getLetterListByItemType = require('./src/utils/get-letter-list-by-item-type.js');
const getFilteredByCategoryCollection = require('./src/utils/get-filtered-by-category-collection.js');
const getPagedItemsInCategoryCollection = require('./src/utils/get-paged-items-in-category-collection.js');
const prepareNurseryIndex = require('./src/utils/prepare-nursery-index.js');
const buildLunrIndex = require('./src/utils/build-lunr-index.js');
const sortByMachineName = require('./src/utils/sort-by-machine-name.js');
const sortLetterArray = require('./src/utils/sort-letter-array.js');
const getPlantPermalink = require('./src/filters/get-plant-permalink.js');
const getNurseryPermalink = require('./src/filters/get-nursery-permalink.js');
const getNurseryCategoryPermalink = require('./src/filters/get-nursery-category-permalink.js');
const getCommonNamePermalink = require('./src/filters/get-common-name-permalink.js');

module.exports = config => {
  // Set directories to pass through to the dist folder
  config.addPassthroughCopy('./src/images/');
  config.addPassthroughCopy('./src/js/');

  config.addNunjucksFilter("getPlantPermalink", (value) => getPlantPermalink(value));
  config.addNunjucksFilter("getNurseryPermalink", (value) => getNurseryPermalink(value));
  config.addNunjucksFilter("getNurseryCategoryPermalink", (value) => getNurseryCategoryPermalink(value));
  config.addNunjucksFilter("getCommonNamePermalink", (value) => getCommonNamePermalink(value));

  let cacheDuration = '1d';

  let getCacheData = async function(cache, collectionParameters, duration) {
    let cacheContents = [];

    if (
      typeof(cache) !== 'undefined' &&
      objectHasOwnProperties(cache, ['assetKey']) &&
      objectHasOwnProperties(cache, ['getFunction']) &&
      objectHasOwnProperties(cache, ['staticParameters']) &&
      Array.isArray(cache.staticParameters) &&
      Array.isArray(collectionParameters)
    ) {
      let asset = new AssetCache(cache.assetKey);
      if (asset.isCacheValid(duration)) {
        return asset.getCachedValue();
      }
      let getParameters = [...collectionParameters, ...cache.staticParameters];

      cacheContents = cache.getFunction(...getParameters);
      await asset.save(cacheContents, 'json');
    }

    return cacheContents;
  };

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

  let getElementItemsCollection = (collection, itemType, elementTypeRef) => {
    return sortByMachineName(
      getElementItemsByType(collection, itemType, elementTypeRef)
    );
  };

  let getLetterListCollection = (collection, itemType) => {
    return sortLetterArray(
      getLetterListByItemType(collection, itemType)
    );
  };

  let getCategoryCollection = (sourceCollection, targetCollection, categoryKey, itemType) => {
    return sortByMachineName(
      getFilteredByCategoryCollection(sourceCollection, targetCollection, categoryKey, itemType)
    );
  };

  let getPagedCategoryCollection = (categoryCollection, itemsPerPage, itemType) => {
    return getPagedItemsInCategoryCollection(categoryCollection, itemsPerPage, itemType)
  };

  let buildCustomLunrIndex = (collection, outputDir, indexSlug, refKey, fieldKeys) => {
    buildLunrIndex(collection, outputDir, indexSlug, refKey, fieldKeys)
  };

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
  let
    nurseryRootCollection,
    nurseryCategoryRootCollection,
    nurseryCollection,
    nurseryCategoryCollection,
    nurserySpecialtiesCollection,
    nurseryIndexCollection,
    nurseryPagedCategoryCollection = [];


  let cacheData = {
    nurseryCache: {
      assetKey: 'nursery_cache_nurseries',
      getFunction: getNumberLetterCollection,
      staticParameters: [rootData.nurseries.dataPath, rootData.nurseries.levelsDeep, rootData.nurseries.itemType]
    },
    nurseryCatalogCache: {
      assetKey: 'nursery_catalog_cache_nursery_catalogs',
      getFunction: getElementItemsCollection,
      staticParameters: ['nursery_catalog', false]
    },
    nurseryCategoryCache: {
      assetKey: 'nursery_category_cache_categories',
      getFunction: getRootItemTypeCollection,
      staticParameters: [rootData.nursery_categories.dataPath, rootData.nursery_categories.itemType]
    },
    nurserySpecialtiesCache: {
      assetKey: 'nursery_by_category_cache_specialties',
      getFunction: getCategoryCollection,
      staticParameters: ["specialties", "nursery_category"]
    },
    nurseryIndexCache: {
      assetKey: 'nursery_by_category_cache_index',
      getFunction: prepareNurseryIndex,
      staticParameters: []
    },
    nurseryPagedCategoryCollectionCache: {
      assetKey: 'nursery_by_category_cache_paged_category_collection',
      getFunction: getPagedCategoryCollection,
      staticParameters: [20, "nursery_category"]
    }
  };

  //
  // // Returns family items.
  // config.addCollection('family', collection => {
  //   return getLetterGroupCollection(collection, rootData.plants.dataPath, rootData.plants.levelsDeep, rootData.plants.itemType);
  // });
  //
  // // Returns genus items.
  // config.addCollection('genus', async (collection) => {
  //   let familyCollection = getLetterGroupCollection(collection, rootData.plants.dataPath, rootData.plants.levelsDeep, rootData.plants.itemType);
  //
  //   return getElementItemsCollection(familyCollection, 'genus', false);
  // });
  //
  // // Returns genus letter items.
  // config.addCollection('genusLetters', async (collection) => {
  //   let familyCollection = getLetterGroupCollection(collection, rootData.plants.dataPath, rootData.plants.levelsDeep, rootData.plants.itemType);
  //   let genusCollection = getElementItemsCollection(familyCollection, 'genus', false);
  //
  //   return getLetterListCollection(genusCollection, 'genus');
  // });
  //
  // // Returns species items.
  // let speciesCollection = [];
  // config.addCollection('species', async (collection) => {
  //   let familyCollection = getLetterGroupCollection(collection, rootData.plants.dataPath, rootData.plants.levelsDeep, rootData.plants.itemType);
  //   let genusCollection = getElementItemsCollection(familyCollection, 'genus', false);
  //
  //   return getElementItemsCollection(genusCollection, 'species', false);
  // });
  //
  // // Returns variety items.
  // config.addCollection('variety', async (collection) => {
  //   let familyCollection = getLetterGroupCollection(collection, rootData.plants.dataPath, rootData.plants.levelsDeep, rootData.plants.itemType);
  //   let genusCollection = getElementItemsCollection(familyCollection, 'genus', false);
  //   let speciesCollection = getElementItemsCollection(genusCollection, 'species', false);
  //
  //   return getElementItemsCollection(speciesCollection, 'variety', false);
  // });
  //
  // // Returns nursery term items.
  // config.addCollection('common_name', collection => {
  //   return getRootItemTypeCollection(collection, rootData.common_names.dataPath, rootData.common_names.itemType);
  // });

  // Returns nursery items.
  config.addCollection('nursery', async (collection) => {
    nurseryRootCollection = collection;

    return await getCacheData(cacheData.nurseryCache, [nurseryRootCollection], cacheDuration);
  });

  // Returns nursery catalog items.
  config.addCollection('nursery_catalog', async (collection) => {
    nurseryRootCollection = collection;
    nurseryCollection = await getCacheData(cacheData.nurseryCache, [nurseryRootCollection], cacheDuration);

    return await getCacheData(cacheData.nurseryCatalogCache, [nurseryCollection], cacheDuration);
  });

  // Returns nursery term items.
  config.addCollection('nursery_category', async (collection) => {
    nurseryCategoryRootCollection = collection;

    return await getCacheData(cacheData.nurseryCategoryCache, [nurseryCategoryRootCollection], cacheDuration);
  });

  config.addCollection('nursery_by_category', async (collection) => {
    nurseryRootCollection = collection;
    nurseryCategoryRootCollection = collection;

    nurseryCollection = await getCacheData(cacheData.nurseryCache, [nurseryRootCollection], cacheDuration);
    nurseryCategoryCollection = await getCacheData(cacheData.nurseryCategoryCache, [nurseryCategoryRootCollection], cacheDuration);
    nurserySpecialtiesCollection = await getCacheData(cacheData.nurserySpecialtiesCache, [nurseryCollection, nurseryCategoryCollection], cacheDuration);
    nurseryIndexCollection = await getCacheData(cacheData.nurseryIndexCache, [nurseryCollection, nurseryCategoryCollection], cacheDuration);
    nurseryPagedCategoryCollection = await getCacheData(cacheData.nurseryPagedCategoryCollectionCache, [nurserySpecialtiesCollection], cacheDuration);

    buildCustomLunrIndex(nurseryIndexCollection, 'dist', 'nursery', 'machine_name', ['name','state', 'specialties']);

    return nurseryPagedCategoryCollection;
  });

  // // Returns journal_book items.
  // config.addCollection('journal_book', collection => {
  //   return getNumberLetterCollection(collection, rootData.journals.dataPath, rootData.journals.levelsDeep, rootData.journals.itemType);
  // });
  //
  // // Returns citation reference items.
  // config.addCollection('citation_reference', async (collection) => {
  //   let journalCollection = getNumberLetterCollection(collection, rootData.journals.dataPath, rootData.journals.levelsDeep, rootData.journals.itemType);
  //
  //   return getElementItemsCollection(journalCollection, 'citation_reference', 'journal_book');
  // });

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
