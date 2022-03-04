const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");
const getCacheData = require('./src/utils/get-cache-data.js');
const getGlobalDataCollection = require('./src/utils/get-global-data-collection.js');
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
    cacheDuration = '1s',
    useExternalData = false,
    globalDataKey = 'plant_info',
    rootData = {
      collections: {
        journal_book: {
          globalDataPath: ['citations', 'data', 'journal_book'],
          collectionData: null,
        },
        citation_reference: {
          globalDataPath: ['citations', 'data', 'citation_reference'],
          collectionData: null,
        },
        family: {
          globalDataPath: ['plants', 'data', 'family'],
          collectionData: null,
        },
        genus: {
          globalDataPath: ['plants', 'data', 'genus'],
          collectionData: null,
        },
        species: {
          globalDataPath: ['plants', 'data', 'species'],
          collectionData: null,
        },
        variety: {
          globalDataPath: ['plants', 'data', 'variety'],
          collectionData: null,
        },
        genus_letters: {
          globalDataPath: ['plants', 'data', 'genus_letters'],
          collectionData: null,
        },
        common_name: {
          globalDataPath: ['plants', 'data', 'common_name'],
          collectionData: null,
        },
        plant_prepare_index: {
          globalDataPath: ['plants', 'plant_prepare_index'],
          collectionData: [],
        },
        plant_build_index: {
          globalDataPath: ['plants', 'plant_build_index'],
          collectionData: null,
        },
        full_plant_index: {
          globalDataPath: ['plants', 'data', 'full_plant_index'],
          collectionData: [],
        },
        nursery: {
          globalDataPath: ['nurseries', 'data', 'nursery'],
          collectionData: null,
        },
        nursery_catalog: {
          globalDataPath: ['nurseries', 'data', 'nursery_catalog'],
          collectionData: null,
        },
        nursery_category: {
          globalDataPath: ['nurseries', 'data', 'nursery_category'],
          collectionData: null,
        },
        nursery_specialty: {
          globalDataPath: ['nurseries', 'data', 'nursery_specialty'],
          collectionData: null,
        },
        nursery_by_category: {
          globalDataPath: ['nurseries', 'data', 'nursery_by_category'],
          collectionData: null,
        },
        nursery_prepare_index: {
          globalDataPath: ['nurseries', 'data', 'nursery_prepare_index'],
          collectionData: [],
        },
        nursery_build_index: {
          globalDataPath: ['nurseries', 'data', 'nursery_build_index'],
          collectionData: null,
        }
      },
      plants: {
        dataPath: ['plants_archive', 'family'],
        globalDataPath: ['plants', 'family'],
        levelsDeep: [3],
        itemType: 'family'
      },
      common_names: {
        dataPath: ['common_names_full', 'common_names'],
        globalDataPath: ['common_names', 'common_names'],
        itemType: 'common_name'
      },
      nurseries: {
        dataPath: ['nursery_catalogs_archive', 'nurseries'],
        globalDataPath: ['nursery_catalogs', 'nurseries'],
        levelsDeep: [2],
        itemType: 'nursery'
      },
      nursery_categories: {
        dataPath: ['terms_full', 'terms'],
        globalDataPath: ['terms', 'terms'],
        itemType: 'nursery_category'
      },
      journals: {
        dataPath: ['journal_citations_archive', 'journals'],
        globalDataPath: ['journal_citations', 'journals'],
        levelsDeep: [3],
        itemType: 'journal_book'
      }
    },
    searchOutputDir = 'dist',
    gdSearchOutputDir = 'dist_global',
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
    }
  ;

  config.addGlobalData('gdSearchOutputDir', gdSearchOutputDir);
  config.addGlobalData('cacheDuration', cacheDuration);
  config.addGlobalData('rootData', rootData);
  config.addGlobalData('searchOutputDir', searchOutputDir);
  config.addGlobalData('searchData', searchData);
  config.addGlobalData('cacheData', cacheData);

  // Returns journal_book items.
  config.addCollection('journal_book', async (collection) => {
    if (useExternalData) {
      rootData.collections.journal_book.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.journal_book.globalDataPath);
    } else {
      rootData.collections.journal_book.collectionData = await getCacheData(cacheData.journalBookCache, [collection], cacheDuration);
    }

    return rootData.collections.journal_book.collectionData;
  });

  // Returns citation reference items.
  config.addCollection('citation_reference', async (collection) => {
    if (useExternalData) {
      rootData.collections.citation_reference.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.citation_reference.globalDataPath);
    } else {
      rootData.collections.journal_book.collectionData = await getCacheData(cacheData.journalBookCache, [collection], cacheDuration);

      rootData.collections.citation_reference.collectionData = await getCacheData(cacheData.citationReferenceCache, [rootData.collections.journal_book.collectionData], cacheDuration);
    }

    return rootData.collections.citation_reference.collectionData;
  });

  // Returns family items.
  config.addCollection('family', async (collection) => {
    if (useExternalData) {
      rootData.collections.family.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.family.globalDataPath);
      // console.log('eleventy add family');
      // console.log(plantInfoFamilyCollection);
      // console.log(collection.getAll()[0].data['plants']['family']);
      // console.log(await getCacheData(cacheData.plantFamilyCache, [collection], cacheDuration));
    } else {
      rootData.collections.family.collectionData = await getCacheData(cacheData.plantFamilyCache, [collection], cacheDuration);
    }

    return rootData.collections.family.collectionData;
  });

  // Returns genus items.
  config.addCollection('genus', async (collection) => {
    if (useExternalData) {
      rootData.collections.genus.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.genus.globalDataPath);
    } else {
      rootData.collections.family.collectionData = await getCacheData(cacheData.plantFamilyCache, [collection], cacheDuration);
      console.log('family collection has items');
      console.log(rootData.collections.family.collectionData.length > 0);

      rootData.collections.genus.collectionData = await getCacheData(cacheData.plantGenusCache, [rootData.collections.family.collectionData], cacheDuration);
    }

    return rootData.collections.genus.collectionData;
  });

  // Returns genus letter items.
  config.addCollection('genusLetters', async (collection) => {
    if (useExternalData) {
      rootData.collections.genus_letters.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.genus_letters.globalDataPath);
    } else {
      rootData.collections.family.collectionData = await getCacheData(cacheData.plantFamilyCache, [collection], cacheDuration);
      rootData.collections.genus.collectionData = await getCacheData(cacheData.plantGenusCache, [rootData.collections.family.collectionData], cacheDuration);
      console.log('genus collection has items');
      console.log(rootData.collections.genus.collectionData.length > 0);

      rootData.collections.genus_letters.collectionData = await getCacheData(cacheData.plantGenusLettersCache, [rootData.collections.genus.collectionData], cacheDuration);
    }

    return rootData.collections.genus_letters.collectionData;
  });

  // Returns species items.
  config.addCollection('species', async (collection) => {
    if (useExternalData) {
      rootData.collections.species.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.species.globalDataPath);
    } else {
      rootData.collections.family.collectionData = await getCacheData(cacheData.plantFamilyCache, [collection], cacheDuration);
      rootData.collections.genus.collectionData = await getCacheData(cacheData.plantGenusCache, [rootData.collections.family.collectionData], cacheDuration);

      rootData.collections.species.collectionData = await getCacheData(cacheData.plantSpeciesCache, [rootData.collections.genus.collectionData], cacheDuration);
    }

    return rootData.collections.species.collectionData;
  });

  // Returns variety items.
  config.addCollection('variety', async (collection) => {
    if (useExternalData) {
      rootData.collections.variety.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.variety.globalDataPath);
    } else {
      rootData.collections.family.collectionData = await getCacheData(cacheData.plantFamilyCache, [collection], cacheDuration);
      rootData.collections.genus.collectionData = await getCacheData(cacheData.plantGenusCache, [rootData.collections.family.collectionData], cacheDuration);
      rootData.collections.species.collectionData = await getCacheData(cacheData.plantSpeciesCache, [rootData.collections.genus.collectionData], cacheDuration);
      console.log('species collection has items');
      console.log(rootData.collections.species.collectionData.length > 0);

      rootData.collections.variety.collectionData = await getCacheData(cacheData.plantVarietyCache, [rootData.collections.species.collectionData], cacheDuration);
    }

    return rootData.collections.variety.collectionData;
  });

  // Returns nursery term items.
  config.addCollection('common_name', async (collection) => {
    if (useExternalData) {
      rootData.collections.common_name.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.common_name.globalDataPath);
    } else {
      rootData.collections.common_name.collectionData = await getCacheData(cacheData.plantCommonNameCache, [collection], cacheDuration);
    }

    return rootData.collections.common_name.collectionData;
  });

  // Returns nursery items.
  config.addCollection('nursery', async (collection) => {
    if (useExternalData) {
      rootData.collections.nursery.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.nursery.globalDataPath);
    } else {
      rootData.collections.nursery.collectionData = await getCacheData(cacheData.nurseryCache, [collection], cacheDuration);
    }

    return rootData.collections.nursery.collectionData;
  });

  // Returns nursery catalog items.
  config.addCollection('nursery_catalog', async (collection) => {
    if (useExternalData) {
      rootData.collections.nursery_catalog.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.nursery_catalog.globalDataPath);
    } else {
      rootData.collections.nursery.collectionData = await getCacheData(cacheData.nurseryCache, [collection], cacheDuration);
      console.log('nursery collection has items');
      console.log(rootData.collections.nursery.collectionData.length > 0);

      rootData.collections.nursery_catalog.collectionData = await getCacheData(cacheData.nurseryCatalogCache, [rootData.collections.nursery.collectionData], cacheDuration);
    }

    return rootData.collections.nursery_catalog.collectionData;
  });

  // Returns nursery term items.
  config.addCollection('nursery_category', async (collection) => {
    if (useExternalData) {
      rootData.collections.nursery_category.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.nursery_category.globalDataPath);
    } else {
      rootData.collections.nursery_category.collectionData = await getCacheData(cacheData.nurseryCategoryCache, [collection], cacheDuration);
    }

    return rootData.collections.nursery_category.collectionData;
  });

  config.addCollection('nursery_by_category', async (collection) => {
    if (useExternalData) {
      rootData.collections.nursery_by_category.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.nursery_by_category.globalDataPath);
    } else {
      rootData.collections.nursery.collectionData = await getCacheData(cacheData.nurseryCache, [collection], cacheDuration);
      rootData.collections.nursery_category.collectionData = await getCacheData(cacheData.nurseryCategoryCache, [collection], cacheDuration);
      rootData.collections.nursery_specialty.collectionData = await getCacheData(cacheData.nurserySpecialtiesCache, [rootData.collections.nursery.collectionData, rootData.collections.nursery_category.collectionData], cacheDuration);
      rootData.collections.nursery_by_category.collectionData = await getCacheData(cacheData.nurseryPagedCategoryCollectionCache, [rootData.collections.nursery_specialty.collectionData], cacheDuration);

      rootData.collections.nursery_prepare_index.collectionData = await getCacheData(cacheData.nurseryPrepareIndexCache, [rootData.collections.nursery.collectionData, rootData.collections.nursery_category.collectionData], cacheDuration);
      console.log('nursery prepare index collection has items');
      console.log(rootData.collections.nursery_prepare_index.collectionData.length > 0);

      rootData.collections.nursery_build_index.collectionData = await getCacheData(cacheData.nurseryBuildIndexCache, [rootData.collections.nursery_prepare_index.collectionData], cacheDuration);
      console.log('nursery category collection has items');
      console.log(rootData.collections.nursery_category.collectionData.length > 0);

      console.log('nursery specialty collection has items');
      console.log(rootData.collections.nursery_specialty.collectionData.length > 0);

      console.log('nursery paged category collection has items');
      console.log(rootData.collections.nursery_by_category.collectionData.length > 0);

      writeLunrIndex(searchOutputDir, searchData['nurseries']['indexSlug'], rootData.collections.nursery_build_index.collectionData );
      writeRawIndex(searchOutputDir, searchData['nurseries']['indexSlug'], rootData.collections.nursery_prepare_index.collectionData);

      rootData.collections.nursery_by_category.collectionData = rootData.collections.nursery_by_category.collectionData;
    }

    return rootData.collections.nursery_by_category.collectionData;
  });

  config.addCollection('full_plant_index', async (collection) => {
    if (useExternalData) {
      rootData.collections.full_plant_index.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.full_plant_index.globalDataPath);
    } else {

      rootData.collections.family.collectionData = await getCacheData(cacheData.plantFamilyCache, [collection], cacheDuration);
      rootData.collections.genus.collectionData = await getCacheData(cacheData.plantGenusCache, [rootData.collections.family.collectionData], cacheDuration);
      rootData.collections.species.collectionData = await getCacheData(cacheData.plantSpeciesCache, [rootData.collections.genus.collectionData], cacheDuration);
      rootData.collections.variety.collectionData = await getCacheData(cacheData.plantVarietyCache, [rootData.collections.species.collectionData], cacheDuration);

      rootData.collections.common_name.collectionData = await getCacheData(cacheData.plantCommonNameCache, [collection], cacheDuration);

      rootData.collections.nursery.collectionData = await getCacheData(cacheData.nurseryCache, [collection], cacheDuration);
      rootData.collections.nursery_catalog.collectionData = await getCacheData(cacheData.nurseryCatalogCache, [rootData.collections.nursery.collectionData], cacheDuration)

      rootData.collections.journal_book.collectionData = await getCacheData(cacheData.journalBookCache, [collection], cacheDuration);
      rootData.collections.citation_reference.collectionData = await getCacheData(cacheData.citationReferenceCache, [rootData.collections.journal_book.collectionData], cacheDuration);

      console.log('plant variety collection has items');
      console.log(rootData.collections.variety.collectionData.length > 0);

      console.log('plant common name collection has items');
      console.log(rootData.collections.common_name.collectionData.length > 0);

      console.log('journal collection has items');
      console.log(rootData.collections.journal_book.collectionData.length > 0);

      console.log('citation collection has items');
      console.log(rootData.collections.citation_reference.collectionData.length > 0);

      rootData.collections.plant_prepare_index.collectionData = await getCacheData(cacheData.plantPrepareIndexCache, [
        [rootData.collections.genus.collectionData, rootData.collections.species.collectionData, rootData.collections.variety.collectionData],
        rootData.collections.common_name.collectionData,
        rootData.collections.nursery_catalog.collectionData,
        rootData.collections.citation_reference.collectionData
      ], cacheDuration);
      console.log('plant prepare index collection has items');
      console.log(rootData.collections.plant_prepare_index.collectionData.length > 0);
      rootData.collections.plant_build_index.collectionData = await getCacheData(cacheData.plantBuildIndexCache, [rootData.collections.plant_prepare_index.collectionData], cacheDuration);

      writeLunrIndex(searchOutputDir, searchData['plants']['indexSlug'], rootData.collections.plant_build_index.collectionData);
      writeRawIndex(searchOutputDir, searchData['plants']['indexSlug'], rootData.collections.plant_prepare_index.collectionData);

      rootData.collections.full_plant_index.collectionData = rootData.collections.plant_prepare_index.collectionData;
    }

    return rootData.collections.full_plant_index.collectionData;
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
