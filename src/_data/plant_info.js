const fetch = require('node-fetch');
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
const preparePlantIndex = require("../utils/prepare-plant-index.js");

module.exports = async function(configData) {
  let
    plantInfoData = {},
    citationsData = {},
    plantsData = {},
    commonNamesData = {},
    nurseriesData = {},
    termsData = {},
    citationsJournalBook,
    citationsCitationReference,
    plantFamily,
    plantGenus,
    plantSpecies,
    plantVariety,
    plantGenusLetter,
    plantCommonName,
    plantCommonNameLetter,
    plantPrepareIndex,
    plantBuildIndex,
    nurseriesNursery,
    nurseriesNurseryCatalog,
    nurseriesNurseryCategory,
    nurseriesNurserySpecialties,
    nurseriesNurseryByCategory,
    nurseriesPrepareIndex,
    nurseriesBuildIndex,
    plantsResponse,
    citationsResponse,
    nurseriesResponse,
    plantsExternalData = {},
    citationsExternalData = {},
    nurseriesExternalData = {}
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

  plantsResponse = await fetch('https://plants.data.plantinfo.org/file-index.json')
  plantsExternalData = await plantsResponse.json()

  citationsResponse = await fetch('https://citations.data.plantinfo.org/file-index.json')
  citationsExternalData = await citationsResponse.json()

  nurseriesResponse = await fetch('https://nurseries.data.plantinfo.org/file-index.json')
  nurseriesExternalData = await nurseriesResponse.json()
  
  /*
   * Temporary simulation of external data fetched and processed into the
   * plantsData structure, so we can work on testing the data processing.
   */
  citationsData = {
    "journal_citations": {
      "journals": {
        "y": {
          "yellow_rose_the": {
            "yellow_rose_the_vol_12_no_1_1995": {
              "name": "Yellow Rose, The. vol 12, no. 1. (1995)",
              "machine_name": "yellow_rose_the_vol_12_no_1_1995",
              "type": "journal_book",
              "volume": null,
              "number": null,
              "year": "1995",
              "additional_info": null,
              "publish_date": null,
              "pulling_date": null,
              "description": null,
              "archival_data": {
                "id": "2112909",
                "legacy_id": "5923",
                "author": "oitadmin",
                "created": "1473951107"
              },
              "citation_reference_items": [
                {
                  "name": "Yellow Rose, The. vol 12, no. 1. (1995) p cover",
                  "machine_name": "yellow_rose_the_vol_12_no_1_1995_p_cover",
                  "type": "citation_reference",
                  "plant": {
                    "machine_name": "rosa_cultivars_bonn",
                    "type": "variety",
                    "archival_data": [
                      "1490345"
                    ]
                  },
                  "volume": null,
                  "page": "p cover",
                  "year": "1995",
                  "notes": null,
                  "parts_shown": {
                    "Flower": true,
                    "Seed": false,
                    "Fruit": false,
                    "Bark": false,
                    "Root": false,
                    "Habit": false,
                    "Leaf": false,
                    "Twig": false,
                    "Unclear": false
                  },
                  "citation_type": {
                    "Art": false,
                    "Photo": false
                  },
                  "archival_data": {
                    "id": "1747908",
                    "legacy_id": "45426",
                    "AD": false,
                    "fpi_pub_issue": null,
                    "pullingdat": "1",
                    "active": true,
                    "author": "oitadmin",
                    "created": "1483154438"
                  }
                }
              ]
            }
          }
        }
      }
    }
  };
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
    "common_names": {
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
    }
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
    "terms": {
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
    }
  };

  citationsJournalBook = getNumberLetterCollection(citationsData, configData['rootData']['journals']['globalDataPath'], configData['rootData']['journals']['levelsDeep'], configData['rootData']['journals']['itemType']);
  citationsCitationReference = getElementItemsCollection(citationsJournalBook, 'citation_reference', 'journal_book');

  plantFamily = getLetterGroupCollection(plantsData, configData['rootData']['plants']['globalDataPath'], configData['rootData']['plants']['levelsDeep'], configData['rootData']['plants']['itemType']);
  plantGenus = getElementItemsCollection(plantFamily, 'genus', false);
  plantSpecies = getElementItemsCollection(plantGenus, 'species', false);
  plantVariety = getElementItemsCollection(plantSpecies, 'variety', false);
  plantGenusLetter = getLetterListCollection(plantGenus, 'genus');
  plantCommonName = getRootItemTypeCollection(commonNamesData, configData['rootData']['common_names']['globalDataPath'], configData['rootData']['common_names']['itemType']);

  nurseriesNursery = getNumberLetterCollection(nurseriesData, configData['rootData']['nurseries']['globalDataPath'], configData['rootData']['nurseries']['levelsDeep'], configData['rootData']['nurseries']['itemType']);
  nurseriesNurseryCatalog = getElementItemsCollection(nurseriesNursery, 'nursery_catalog', false);
  nurseriesNurseryCategory = getRootItemTypeCollection(termsData, configData['rootData']['nursery_categories']['globalDataPath'], configData['rootData']['nursery_categories']['itemType']);
  nurseriesNurserySpecialties = getCategoryCollection(nurseriesNursery, nurseriesNurseryCategory, 'specialties', 'nursery_category');
  nurseriesNurseryByCategory = getPagedCategoryCollection(nurseriesNurserySpecialties, 20, "nursery_category");

  nurseriesPrepareIndex = prepareNurseryIndex(nurseriesNursery, nurseriesNurseryCategory);
  nurseriesBuildIndex = buildLunrIndex(nurseriesPrepareIndex, configData['searchData']['nurseries']['refKey'], configData['searchData']['nurseries']['fieldKeys']);

  console.log('nursery category collection has ' + nurseriesNurseryCategory.length  + ' items');
  console.log('nursery specialty collection has ' + nurseriesNurserySpecialties.length + ' items');
  console.log('nursery paged category collection has ' + nurseriesNurseryByCategory.length + ' items');

  console.log('nursery prepare index collection has ' + nurseriesPrepareIndex.length + ' items');
  console.log('nursery build index collection has ' + Object.keys(nurseriesBuildIndex).length + ' items');

  writeLunrIndex(configData['gdSearchOutputDir'], configData['searchData']['nurseries']['indexSlug'], nurseriesBuildIndex);
  writeRawIndex(configData['gdSearchOutputDir'], configData['searchData']['nurseries']['indexSlug'], nurseriesPrepareIndex);

  plantPrepareIndex = preparePlantIndex([plantGenus, plantSpecies, plantVariety], plantCommonName, nurseriesNurseryCatalog, citationsCitationReference);
  plantBuildIndex = buildLunrIndex(nurseriesPrepareIndex, configData['searchData']['plants']['refKey'], configData['searchData']['plants']['fieldKeys']);

  console.log('plant prepare index collection has ' + plantPrepareIndex.length + ' items');
  console.log('plant build index collection has ' + Object.keys(plantBuildIndex).length + ' items');

  writeLunrIndex(configData['gdSearchOutputDir'], configData['searchData']['plants']['indexSlug'], plantBuildIndex);
  writeRawIndex(configData['gdSearchOutputDir'], configData['searchData']['plants']['indexSlug'], plantPrepareIndex);

  plantInfoData = {
    "citations": {
      "journal_book": citationsJournalBook,
      "citation_reference": citationsCitationReference,
    },
    "plants": {
      "family": plantFamily,
      "genus": plantGenus,
      "species": plantSpecies,
      "variety": plantVariety,
      "genus_letters": plantGenusLetter,
      "common_name": plantCommonName,
      "plant_prepare_index": plantPrepareIndex,
      "plant_build_index": plantBuildIndex,
      "full_plant_index": plantPrepareIndex,
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
