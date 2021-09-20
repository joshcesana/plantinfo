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
const writeLunrIndex = require('./src/utils/write-lunr-index.js');
const writeRawIndex = require('./src/utils/write-raw-index.js');
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

  let cacheDuration = '5d';

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

  let buildCustomLunrIndex = (collection, refKey, fieldKeys) => {
    buildLunrIndex(collection, refKey, fieldKeys)
  };

  let writeCustomLunrIndex = (outputDir, indexSlug, idx) => {
    writeLunrIndex(outputDir, indexSlug, idx)
  };

  let writeCustomRawIndex = (outputDir, indexSlug, collection) => {
    writeRawIndex(outputDir, indexSlug, collection)
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
    searchOutputDir = 'dist',
    searchData = {
      nurseries: {
        indexSlug: 'nursery',
        refKey: 'machine_name',
        fieldKeys: ['name', 'city', 'state', 'country_keys', 'country_names', 'specialty_keys', 'specialty_names', 'sales_type_keys', 'sales_type_names']
      }
    };

  let
    journalCollection,
    plantFamilyRootCollection,
    plantFamilyCollection,
    plantGenusCollection,
    plantSpeciesCollection,
    nurseryRootCollection,
    nurseryCategoryRootCollection,
    nurseryCollection,
    nurseryCategoryCollection,
    nurserySpecialtiesCollection,
    nurseryPrepareIndexCollection,
    nurseryBuildIndexCollection,
    nurseryPagedCategoryCollection = [];

  let cacheData = {
    journalBookCache: {
      assetKey: 'journal_book_cache',
      getFunction: getNumberLetterCollection,
      staticParameters: [rootData.journals.dataPath, rootData.journals.levelsDeep, rootData.journals.itemType]
    },
    citationReferenceCache: {
      assetKey: 'citation_reference_cache',
      getFunction: getElementItemsCollection,
      staticParameters: ['citation_reference', 'journal_book']
    },
    plantFamilyCache: {
      assetKey: 'plant_family_cache',
      getFunction: getLetterGroupCollection,
      staticParameters: [rootData.plants.dataPath, rootData.plants.levelsDeep, rootData.plants.itemType]
    },
    plantGenusCache: {
      assetKey: 'plant_genus_cache',
      getFunction: getElementItemsCollection,
      staticParameters: ['genus', false]
    },
    plantGenusLettersCache: {
      assetKey: 'plant_genus_letters_cache',
      getFunction: getLetterListCollection,
      staticParameters: ['genus']
    },
    plantSpeciesCache: {
      assetKey: 'plant_species_cache',
      getFunction: getElementItemsCollection,
      staticParameters: ['species', false]
    },
    plantVarietyCache: {
      assetKey: 'plant_variety_cache',
      getFunction: getElementItemsCollection,
      staticParameters: ['variety', false]
    },
    plantCommonNameCache: {
      assetKey: 'plant_common_name_cache',
      getFunction: getRootItemTypeCollection,
      staticParameters: [rootData.common_names.dataPath, rootData.common_names.itemType]
    },
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
    nurseryPrepareIndexCache: {
      assetKey: 'nursery_by_category_cache_prepare_index',
      getFunction: prepareNurseryIndex,
      staticParameters: []
    },
    nurseryBuildIndexCache: {
      assetKey: 'nursery_by_category_cache_build_index',
      getFunction: buildLunrIndex,
      staticParameters: [searchData['nurseries']['refKey'], searchData['nurseries']['fieldKeys']]
    },
    nurseryPagedCategoryCollectionCache: {
      assetKey: 'nursery_by_category_cache_paged_category_collection',
      getFunction: getPagedCategoryCollection,
      staticParameters: [20, "nursery_category"]
    }
  };

  // Returns journal_book items.
  config.addCollection('journal_book', async (collection) => {
    return await getCacheData(cacheData.journalBookCache, [collection], cacheDuration);
  });

  // Returns citation reference items.
  config.addCollection('citation_reference', async (collection) => {
    journalCollection = await getCacheData(cacheData.journalBookCache, [collection], cacheDuration);

    return await getCacheData(cacheData.citationReferenceCache, [journalCollection], cacheDuration);
  });

  // Returns family items.
  config.addCollection('family', async (collection) => {
    plantFamilyRootCollection = collection;

    return await getCacheData(cacheData.plantFamilyCache, [plantFamilyRootCollection], cacheDuration);
  });

  // Returns genus items.
  config.addCollection('genus', async (collection) => {
    plantFamilyRootCollection = collection;
    plantFamilyCollection = await getCacheData(cacheData.plantFamilyCache, [plantFamilyRootCollection], cacheDuration);

    return await getCacheData(cacheData.plantGenusCache, [plantFamilyCollection], cacheDuration);
  });

  // Returns genus letter items.
  config.addCollection('genusLetters', async (collection) => {
    plantFamilyRootCollection = collection;
    plantFamilyCollection = await getCacheData(cacheData.plantFamilyCache, [plantFamilyRootCollection], cacheDuration);
    plantGenusCollection = await getCacheData(cacheData.plantGenusCache, [plantFamilyCollection], cacheDuration);

    return await getCacheData(cacheData.plantGenusLettersCache, [plantGenusCollection], cacheDuration);
  });

  // Returns species items.
  config.addCollection('species', async (collection) => {
    plantFamilyRootCollection = collection;
    plantFamilyCollection = await getCacheData(cacheData.plantFamilyCache, [plantFamilyRootCollection], cacheDuration);
    plantGenusCollection = await getCacheData(cacheData.plantGenusCache, [plantFamilyCollection], cacheDuration);

    return await getCacheData(cacheData.plantSpeciesCache, [plantGenusCollection], cacheDuration);
  });

  // Returns variety items.
  config.addCollection('variety', async (collection) => {
    plantFamilyRootCollection = collection;
    plantFamilyCollection = await getCacheData(cacheData.plantFamilyCache, [plantFamilyRootCollection], cacheDuration);
    plantGenusCollection = await getCacheData(cacheData.plantGenusCache, [plantFamilyCollection], cacheDuration);
    plantSpeciesCollection = await getCacheData(cacheData.plantSpeciesCache, [plantGenusCollection], cacheDuration);

    return await getCacheData(cacheData.plantVarietyCache, [plantSpeciesCollection], cacheDuration);
  });

  // Returns nursery term items.
  config.addCollection('common_name', async (collection) => {
    return await getCacheData(cacheData.plantCommonNameCache, [collection], cacheDuration);
  });

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
    nurseryPagedCategoryCollection = await getCacheData(cacheData.nurseryPagedCategoryCollectionCache, [nurserySpecialtiesCollection], cacheDuration);
    nurseryPrepareIndexCollection = await getCacheData(cacheData.nurseryPrepareIndexCache, [nurseryCollection, nurseryCategoryCollection], cacheDuration);
    nurseryBuildIndexCollection = await getCacheData(cacheData.nurseryBuildIndexCache, [nurseryPrepareIndexCollection], cacheDuration);

    writeCustomLunrIndex(searchOutputDir, searchData['nurseries']['indexSlug'], nurseryBuildIndexCollection);
    writeCustomRawIndex(searchOutputDir, searchData['nurseries']['indexSlug'], nurseryPrepareIndexCollection);

    return nurseryPagedCategoryCollection;
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
