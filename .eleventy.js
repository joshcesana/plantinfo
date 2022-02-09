const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");
const getCacheData = require('./src/utils/get-cache-data.js');
const getLetterGroupCollection = require('./src/utils/get-letter-group-collection.js');
const getNumberLetterCollection = require('./src/utils/get-number-letter-collection.js');
const getRootItemTypeCollection = require('./src/utils/get-root-item-type-collection.js');
const getElementItemsCollection = require('./src/utils/get-element-items-collection.js');
const getLetterListCollection = require('./src/utils/get-letter-list-collection.js');
const getCategoryCollection = require('./src/utils/get-category-collection.js');
const getPagedCategoryCollection = require('./src/utils/get-paged-category-collection.js');
const prepareNurseryIndex = require('./src/utils/prepare-nursery-index.js');
const preparePlantIndex = require('./src/utils/prepare-plant-index.js');
const buildLunrIndex = require('./src/utils/build-lunr-index.js');
const writeLunrIndex = require('./src/utils/write-lunr-index.js');
const writeRawIndex = require('./src/utils/write-raw-index.js');
const getPlantPermalink = require('./src/filters/get-plant-permalink.js');
const getNurseryPermalink = require('./src/filters/get-nursery-permalink.js');
const getNurseryCategoryPermalink = require('./src/filters/get-nursery-category-permalink.js');
const getCommonNamePermalink = require('./src/filters/get-common-name-permalink.js');
const UpgradeHelper = require("@11ty/eleventy-upgrade-help");

module.exports = config => {
  config.addPlugin(UpgradeHelper);
  // Reverse 1.0.0 breaking changes until full impacts are understood.
  config.setDataDeepMerge(false);
  config.setLiquidOptions(
    {
      strictFilters: false,
      dynamicPartials: false,
    }
  );

  config.addPlugin(EleventyServerlessBundlerPlugin, {
    name: 'serverless',
    functionsDir: './netlify/functions/',
    copy: [
      'src/filters/',
      'src/utils/',
      { from: ".cache", to: "cache" }
    ]
  });

  // Set directories to pass through to the dist folder
  config.addPassthroughCopy('./src/images/');
  config.addPassthroughCopy('./src/js/');

  config.addNunjucksFilter("getPlantPermalink", (value) => getPlantPermalink(value));
  config.addNunjucksFilter("getNurseryPermalink", (value) => getNurseryPermalink(value));
  config.addNunjucksFilter("getNurseryCategoryPermalink", (value) => getNurseryCategoryPermalink(value));
  config.addNunjucksFilter("getCommonNamePermalink", (value) => getCommonNamePermalink(value));

  let
    cacheDuration = '5d',
    rootData = {
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
    },
    searchOutputDir = 'dist',
    searchData = {
      nurseries: {
        indexSlug: 'nursery',
        refKey: 'machine_name',
        fieldKeys: ['name', 'city', 'state', 'country_keys', 'country_names', 'specialty_keys', 'specialty_names', 'sales_type_keys', 'sales_type_names']
      },
      plants: {
        indexSlug: 'plant',
        refKey: 'machine_name',
        fieldKeys: ['machine_name','name','plant_machine_name','plant_name','taxonomy_level_key','taxonomy_level_name','common_machine_name','common_name',"has_common_name",'available_in_nursery','has_citations']
      }
    },
    cacheData = {
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
      },
      plantPrepareIndexCache: {
        assetKey: 'plant_cache_prepare_index',
        getFunction: preparePlantIndex,
        staticParameters: []
      },
      plantBuildIndexCache: {
        assetKey: 'plant_cache_build_index',
        getFunction: buildLunrIndex,
        staticParameters: [searchData['plants']['refKey'], searchData['plants']['fieldKeys']]
      },
    },
    journalCollection,
    citationCollection,
    plantFamilyRootCollection,
    plantFamilyCollection,
    plantGenusCollection,
    plantSpeciesCollection,
    plantVarietyCollection,
    plantCommonNameCollection,
    nurseryRootCollection,
    nurseryCategoryRootCollection,
    nurseryCollection,
    nurseryCatalogCollection,
    nurseryCategoryCollection,
    nurserySpecialtiesCollection,
    nurseryPrepareIndexCollection,
    nurseryBuildIndexCollection,
    nurseryPagedCategoryCollection = [],
    plantPrepareIndexCollection,
    plantBuildIndexCollection
  ;

  config.addGlobalData('cacheDuration', cacheDuration);
  config.addGlobalData('rootData', rootData);
  config.addGlobalData('searchOutputDir', searchOutputDir);
  config.addGlobalData('searchData', searchData);
  config.addGlobalData('cacheData', cacheData);

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
    console.log('family collection has items');
    console.log(plantFamilyCollection.length > 0);

    return await getCacheData(cacheData.plantGenusCache, [plantFamilyCollection], cacheDuration);
  });

  // Returns genus letter items.
  config.addCollection('genusLetters', async (collection) => {
    plantFamilyRootCollection = collection;
    plantFamilyCollection = await getCacheData(cacheData.plantFamilyCache, [plantFamilyRootCollection], cacheDuration);
    plantGenusCollection = await getCacheData(cacheData.plantGenusCache, [plantFamilyCollection], cacheDuration);
    console.log('genus collection has items');
    console.log(plantGenusCollection.length > 0);

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
    console.log('species collection has items');
    console.log(plantSpeciesCollection.length > 0);

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
    console.log('nursery collection has items');
    console.log(nurseryCollection.length > 0);

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
    console.log('nursery prepare index collection has items');
    console.log(nurseryPrepareIndexCollection.length > 0);

    nurseryBuildIndexCollection = await getCacheData(cacheData.nurseryBuildIndexCache, [nurseryPrepareIndexCollection], cacheDuration);
    console.log('nursery category collection has items');
    console.log(nurseryCategoryCollection.length > 0);

    console.log('nursery specialty collection has items');
    console.log(nurserySpecialtiesCollection.length > 0);

    console.log('nursery paged category collection has items');
    console.log(nurseryPagedCategoryCollection.length > 0);

    writeLunrIndex(searchOutputDir, searchData['nurseries']['indexSlug'], nurseryBuildIndexCollection);
    writeRawIndex(searchOutputDir, searchData['nurseries']['indexSlug'], nurseryPrepareIndexCollection);

    return nurseryPagedCategoryCollection;
  });

  config.addCollection('full_plant_index', async (collection) => {
    plantFamilyRootCollection = collection;
    nurseryRootCollection = collection;

    plantFamilyCollection = await getCacheData(cacheData.plantFamilyCache, [plantFamilyRootCollection], cacheDuration);
    plantGenusCollection = await getCacheData(cacheData.plantGenusCache, [plantFamilyCollection], cacheDuration);
    plantSpeciesCollection = await getCacheData(cacheData.plantSpeciesCache, [plantGenusCollection], cacheDuration);
    plantVarietyCollection = await getCacheData(cacheData.plantVarietyCache, [plantSpeciesCollection], cacheDuration);

    plantCommonNameCollection = await getCacheData(cacheData.plantCommonNameCache, [collection], cacheDuration);

    nurseryCollection = await getCacheData(cacheData.nurseryCache, [nurseryRootCollection], cacheDuration);
    nurseryCatalogCollection = await getCacheData(cacheData.nurseryCatalogCache, [nurseryCollection], cacheDuration)

    journalCollection = await getCacheData(cacheData.journalBookCache, [collection], cacheDuration);
    citationCollection = await getCacheData(cacheData.citationReferenceCache, [journalCollection], cacheDuration);

    console.log('plant variety collection has items');
    console.log(plantVarietyCollection.length > 0);

    console.log('plant common name collection has items');
    console.log(plantCommonNameCollection.length > 0);

    console.log('journal collection has items');
    console.log(journalCollection.length > 0);

    console.log('citation collection has items');
    console.log(citationCollection.length > 0);

    plantPrepareIndexCollection = [];
    plantPrepareIndexCollection = await getCacheData(cacheData.plantPrepareIndexCache, [
      [plantGenusCollection, plantSpeciesCollection, plantVarietyCollection],
      plantCommonNameCollection,
      nurseryCatalogCollection,
      citationCollection
    ], cacheDuration);
    console.log('plant prepare index collection has items');
    console.log(plantPrepareIndexCollection.length > 0);
    plantBuildIndexCollection = await getCacheData(cacheData.plantBuildIndexCache, [plantPrepareIndexCollection], cacheDuration);

    writeLunrIndex(searchOutputDir, searchData['plants']['indexSlug'], plantBuildIndexCollection);
    writeRawIndex(searchOutputDir, searchData['plants']['indexSlug'], plantPrepareIndexCollection);

    return plantPrepareIndexCollection;
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
