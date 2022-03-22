const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");
const getGlobalDataCollection = require('./src/utils/get-global-data-collection.js');
const getPlantPermalink = require('./src/filters/get-plant-permalink.js');
const getNurseryPermalink = require('./src/filters/get-nursery-permalink.js');
const getNurseryCategoryPermalink = require('./src/filters/get-nursery-category-permalink.js');
const getCommonNamePermalink = require('./src/filters/get-common-name-permalink.js');
const UpgradeHelper = require("@11ty/eleventy-upgrade-help");

module.exports = config => {
  let
    maxDataItemsPerLevel = 20,
    cacheDuration = '1s',
    cacheDirectory = '.cache',
    cacheDurationServerless = '1s',
    cacheDirectoryServerless = 'cache',
    searchOutputDir = 'dist',
    gdSearchOutputDir = 'dist_global',
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
        common_name_letters: {
          globalDataPath: ['plants', 'data', 'common_name_letters'],
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
    }
  ;

  config.addGlobalData('cacheDuration', cacheDuration);
  config.addGlobalData('cacheDirectory', cacheDirectory);
  config.addGlobalData('cacheDurationServerless', cacheDurationServerless);
  config.addGlobalData('cacheDirectoryServerless', cacheDirectoryServerless);
  config.addGlobalData('searchOutputDir', searchOutputDir);
  config.addGlobalData('gdSearchOutputDir', gdSearchOutputDir);
  config.addGlobalData('rootData', rootData);
  config.addGlobalData('searchData', searchData);
  config.addGlobalData('globalDataKey', globalDataKey);
  config.addGlobalData('maxDataItemsPerLevel', maxDataItemsPerLevel);

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

  // Returns journal_book items.
  config.addCollection('journal_book', async (collection) => {
    rootData.collections.journal_book.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.journal_book.globalDataPath);

    return rootData.collections.journal_book.collectionData;
  });

  // Returns citation reference items.
  config.addCollection('citation_reference', async (collection) => {
    rootData.collections.citation_reference.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.citation_reference.globalDataPath);

    return rootData.collections.citation_reference.collectionData;
  });

  // Returns family items.
  config.addCollection('family', async (collection) => {
    rootData.collections.family.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.family.globalDataPath);

    return rootData.collections.family.collectionData;
  });

  // Returns genus items.
  config.addCollection('genus', async (collection) => {
    rootData.collections.genus.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.genus.globalDataPath);

    return rootData.collections.genus.collectionData;
  });

  // Returns genus letter items.
  config.addCollection('genusLetters', async (collection) => {
    rootData.collections.genus_letters.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.genus_letters.globalDataPath);

    return rootData.collections.genus_letters.collectionData;
  });

  // Returns species items.
  config.addCollection('species', async (collection) => {
    rootData.collections.species.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.species.globalDataPath);

    return rootData.collections.species.collectionData;
  });

  // Returns variety items.
  config.addCollection('variety', async (collection) => {
    rootData.collections.variety.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.variety.globalDataPath);

    return rootData.collections.variety.collectionData;
  });

  // Returns common name items.
  config.addCollection('common_name', async (collection) => {
    rootData.collections.common_name.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.common_name.globalDataPath);

    return rootData.collections.common_name.collectionData;
  });

  // Returns common name letter items.
  config.addCollection('commonNamesLetters', async (collection) => {
    rootData.collections.common_name_letters.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.common_name_letters.globalDataPath);

    return rootData.collections.common_name_letters.collectionData;
  });

  // Returns nursery items.
  config.addCollection('nursery', async (collection) => {
    rootData.collections.nursery.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.nursery.globalDataPath);

    return rootData.collections.nursery.collectionData;
  });

  // Returns nursery catalog items.
  config.addCollection('nursery_catalog', async (collection) => {
    rootData.collections.nursery_catalog.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.nursery_catalog.globalDataPath);

    return rootData.collections.nursery_catalog.collectionData;
  });

  // Returns nursery term items.
  config.addCollection('nursery_category', async (collection) => {
    rootData.collections.nursery_category.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.nursery_category.globalDataPath);

    return rootData.collections.nursery_category.collectionData;
  });

  config.addCollection('nursery_by_category', async (collection) => {
    rootData.collections.nursery_by_category.collectionData = getGlobalDataCollection(collection, globalDataKey, rootData.collections.nursery_by_category.globalDataPath);

    return rootData.collections.nursery_by_category.collectionData;
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
