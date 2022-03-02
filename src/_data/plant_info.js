const getCacheData = require('../utils/get-cache-data.js');
const { objectHasOwnProperties } = require('../_data/helpers.js');
const getLetterGroupCollection = require('../utils/get-letter-group-collection.js');
const getElementItemsCollection = require("../utils/get-element-items-collection.js");
const getLetterListCollection = require("../utils/get-letter-list-collection.js");
const getRootItemTypeCollection = require("../utils/get-root-item-type-collection.js");
const getNumberLetterCollection = require("../utils/get-number-letter-collection.js");
const getCategoryCollection = require("../utils/get-category-collection.js");
const getPagedCategoryCollection = require("../utils/get-paged-category-collection.js");
const prepareNurseryIndex = require("../utils/prepare-nursery-index.js");
const buildLunrIndex = require("../utils/build-lunr-index.js");
const writeLunrIndex = require("../utils/write-lunr-index.js");
const writeRawIndex = require("../utils/write-raw-index.js");

module.exports = async function(configData) {
  let
    plantInfoData = {},
    citationsData = {},
    plantsData = {},
    commonNamesData = {},
    nurseriesData = {},
    termsData = {},
    plantFamily,
    plantGenus,
    plantSpecies,
    plantVariety,
    plantGenusLetter,
    plantCommonName,
    plantCommonNameLetter,
    nurseriesNursery,
    nurseriesNurseryCatalog,
    nurseriesNurseryCategory,
    nurseriesNurserySpecialties,
    nurseriesNurseryByCategory,
    nurseriesPrepareIndex,
    nurseriesBuildIndex
  ;

  /*
   * Fetch JSON from external data sources
   * - plantinfo-data-citations
   * - plantinfo-data-nurseries
   * - plantinfo-data-nurseries
   *
   * Each external data source should have an index.json file, containing a
   * hierachical data structure matching the directory structure of the
   * external resource, with additional individual JSON files in that structure.
   *
   * Iterate through that data structure to retrieve each individual JSON object
   * and add it to the overall data structure, matching that external source.
   * - citationsData = plantinfo-data-citations
   * - nurseriesData = plantinfo-data-nurseries
   * - plantsData = plantinfo-data-nurseries
   *
   * The data structure for each of these items should end up matching what
   * Eleventy would have created had the files been processed by Eleventy.
   *
   * These data structures will be processed to add keys to plantInfoData that
   * match the collections being added in .eleventy.js, so that this processing
   * can be cached ahead of time. This includes the creation of search indexes.
   */

  /*
   * Temporary simulation of external data fetched and processed into the
   * plantsData structure, so we can work on testing the data processing.
   */
  plantsData = {
    "plants": {
      "family": {
        "x": {
          "xanthorrhoeaceae": {
            "xanthorrhoeaceae": {
              "name": "Xanthorrhoeaceae",
              "machine_name": "xanthorrhoeaceae",
              "type": "family",
              "authorities": null,
              "naming_authorities": null,
              "description": null,
              "archival_data": {
                "id": "1381444",
                "legacy_id": "438",
                "author": "oitadmin",
                "created": "1473443572"
              },
              "genus_items": [
                {
                  "name": "Haworthiopsis",
                  "machine_name": "haworthiopsis",
                  "type": "genus",
                  "hybrid": "false",
                  "authorities": "none?",
                  "naming_authorities": null,
                  "description": null,
                  "family": "xanthorrhoeaceae",
                  "cross_references": [],
                  "species_items": [
                    {
                      "name": "Haworthiopsis sordida",
                      "machine_name": "haworthiopsis_sordida",
                      "type": "species",
                      "hybrid": "false",
                      "authorities": "none?",
                      "naming_authorities": null,
                      "description": null,
                      "genus": "haworthiopsis",
                      "family": "xanthorrhoeaceae",
                      "variety_items": [
                        {
                          "name": "Haworthiopsis sordida sordida",
                          "machine_name": "haworthiopsis_sordida_sordida",
                          "type": "variety",
                          "mark": null,
                          "lower_ranks_name": "sordida",
                          "authorities": null,
                          "naming_authorities": null,
                          "description": null,
                          "lower_ranks": [
                            "Variety"
                          ],
                          "species": "haworthiopsis_sordida",
                          "genus": "haworthiopsis",
                          "family": "xanthorrhoeaceae",
                          "cross_references": [],
                          "archival_data": {
                            "id": "2218971",
                            "legacy_id": null,
                            "fgsid": null,
                            "legacy_from_data_cross_ref": [],
                            "fpi": "false",
                            "source": "false",
                            "active": "false",
                            "author": "r-isaa",
                            "created": "1516977804"
                          }
                        }
                      ],
                      "cross_references": [],
                      "archival_data": {
                        "id": "2218966",
                        "legacy_id": null,
                        "fgsid": null,
                        "legacy_from_data_cross_ref": [],
                        "fpi": "false",
                        "source": "false",
                        "active": "false",
                        "author": "r-isaa",
                        "created": "1516977773"
                      }
                    }
                  ],
                  "archival_data": {
                    "id": "1397497",
                    "legacy_id": "29804",
                    "legacy_from_data_cross_ref": [],
                    "active": "true",
                    "author": "oitadmin",
                    "created": "1482758874"
                  }
                }
              ]
            }
          }
        }
      }
    }
  };
  commonNamesData = {
    "common_names": [
      {
        "name": "Llacon",
        "machine_name": "llacon",
        "type": "common_name",
        "plants": [
          {
            "machine_name": "smallanthus_sonchifolius",
            "type": "species",
            "archival_data": {
              "id": "1453185"
            }
          }
        ],
        "archival_data": {
          "id": "2102802",
          "legacy_id": "12897",
          "active": true,
          "author": "oitadmin",
          "created": "1483715040"
        }
      }
    ]
  };
  nurseriesData = {
    "nursery_catalogs": {
      "nurseries": {
        "w": {
          "w_w_nurseries": {
            "name": "W.W. Nurseries",
            "machine_name": "w_w_nurseries",
            "type": "nursery",
            "retail_wholesale": {
              "retail": true,
              "wholesale": false
            },
            "location": {
              "country": {
                "united_states": true,
                "canada": false
              },
              "address_1": "188 VALLEY GREEN DR.",
              "address_2": "",
              "city": "Indiana",
              "state": "PA",
              "postal_code": "15701",
              "geo_coordinate": null
            },
            "contact": {
              "website": {
                "url": "https:\/\/www.rhodiesrus.com\/",
                "title": null,
                "attributes": []
              },
              "email": null,
              "phone": null,
              "fax": null,
              "name": null
            },
            "specialties": [
              {
                "machine_name": "rhododendron",
                "type": "nursery_category",
                "archival_data": {
                  "id": "216179"
                }
              },
              {
                "machine_name": "trees",
                "type": "nursery_category",
                "archival_data": {
                  "id": "216185"
                }
              }
            ],
            "catalog": {
              "print": false,
              "online": true,
              "web_only": true
            },
            "update": null,
            "nursery_catalog_items": [],
            "archival_data": {
              "id": "2471921",
              "legacy_id": null,
              "ships": true,
              "NODATE": false,
              "NoCatalog": true,
              "active": true,
              "bulkmail": false,
              "SRCE2000": null,
              "author": "jense035",
              "created": "1550786106"
            }
          }
        }
      }
    }
  };
  termsData = {
    "terms": [
      {
        "name": "Evergreens",
        "machine_name": "evergreens",
        "type": "nursery_category",
        "archival_data": {
          "id": "216162",
          "legacy_id": "10"
        }
      }
    ]
  };

  const
    plantDataPath = [ 'plants', 'family' ],
    nurseriesDataPath = ['nursery_catalogs', 'nurseries'],
    searchOutputDir = 'dist_test'
  ;

  plantFamily = getLetterGroupCollection(plantsData, plantDataPath, configData['rootData']['plants']['levelsDeep'], configData['rootData']['plants']['itemType']);
  plantGenus = getElementItemsCollection(plantFamily, 'genus', false);
  plantSpecies = getElementItemsCollection(plantGenus, 'species', false);
  plantVariety = getElementItemsCollection(plantSpecies, 'variety', false);
  plantGenusLetter = getLetterListCollection(plantGenus, 'genus');
  plantCommonName = getRootItemTypeCollection(commonNamesData, configData['rootData']['common_names']['dataPath'], configData['rootData']['common_names']['itemType']);

  nurseriesNursery = getNumberLetterCollection(nurseriesData, nurseriesDataPath, configData['rootData']['nurseries']['levelsDeep'], configData['rootData']['nurseries']['itemType']);
  nurseriesNurseryCatalog = getElementItemsCollection(nurseriesNursery, 'nursery_catalog', false);
  nurseriesNurseryCategory = getRootItemTypeCollection(termsData, configData['rootData']['nursery_categories']['dataPath'], configData['rootData']['nursery_categories']['itemType']);
  nurseriesNurserySpecialties = getCategoryCollection(nurseriesNursery, nurseriesNurseryCategory, 'specialties', 'nursery_category');
  nurseriesNurseryByCategory = getPagedCategoryCollection(nurseriesNurserySpecialties, 20, "nursery_category");
  nurseriesPrepareIndex = prepareNurseryIndex(nurseriesNursery, nurseriesNurseryCategory);
  nurseriesBuildIndex = buildLunrIndex(nurseriesPrepareIndex, configData['searchData']['nurseries']['refKey'], configData['searchData']['nurseries']['fieldKeys']);

  console.log('nursery category collection has ' + nurseriesNurseryCategory.length  + ' items');
  console.log('nursery specialty collection has ' + nurseriesNurserySpecialties.length + ' items');
  console.log('nursery paged category collection has ' + nurseriesNurseryByCategory.length + ' items');

  console.log('nursery prepare index collection has ' + nurseriesPrepareIndex.length + ' items');
  console.log('nursery build index collection has ' + Object.keys(nurseriesBuildIndex).length + ' items');

  writeLunrIndex(searchOutputDir, configData['searchData']['nurseries']['indexSlug'], nurseriesBuildIndex);
  writeRawIndex(searchOutputDir, configData['searchData']['nurseries']['indexSlug'], nurseriesPrepareIndex);

  plantInfoData = {
    "plants": {
      "family": plantFamily,
      "genus": plantGenus,
      "species": plantSpecies,
      "variety": plantVariety,
      "genusLetters": plantGenusLetter,
      "commonName": plantCommonName,
    },
    "nurseries": {
      "nursery":  nurseriesNursery,
      "nursery_catalog": nurseriesNurseryCatalog,
      "nursery_category": nurseriesNurseryCategory,
      "nursery_specialty": nurseriesNurserySpecialties,
      "nursery_by_category": nurseriesNurseryByCategory,
      "nursery_prepare_index": nurseriesPrepareIndex,
      "nursery_build_index": nurseriesBuildIndex,
    },
  };

  console.log('plant_info processing complete');

  return plantInfoData;
};
