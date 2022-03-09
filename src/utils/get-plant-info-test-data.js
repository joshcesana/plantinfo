/**
 * Get the plant info test data.
 *
 * @param {Object}  plantInfoData   The plantInfoData to get and process.
 * @returns {Object}                The plantInfoData with test data.
 */
module.exports = async (plantInfoData) => {
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

  // plantsResponse = await fetch('https://plants.data.plantinfo.org/file-index.json')
  // plantsExternalData = await plantsResponse.json()
  //
  // citationsResponse = await fetch('https://citations.data.plantinfo.org/file-index.json')
  // citationsExternalData = await citationsResponse.json()
  //
  // nurseriesResponse = await fetch('https://nurseries.data.plantinfo.org/file-index.json')
  // nurseriesExternalData = await nurseriesResponse.json()

  /*
   * Temporary simulation of external data fetched and processed into the
   * plantsData structure, so we can work on testing the data processing.
   */
  let
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
    },
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
    },
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
    },
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
    },
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

  plantInfoData["citations"]["external"]["data"] = citationsData;
  plantInfoData["plants"]["external"]["data"] = plantsData;
  plantInfoData["nurseries"]["external"]["data"] = nurseriesData;
  plantInfoData["plants"]["common_names"]["data"] = commonNamesData;
  plantInfoData["nurseries"]["terms"]["data"] = termsData;

  // console.log(plantInfoData["citations"]["external"]["data"]);
  // console.log(plantInfoData["plants"]["external"]["data"]);
  // console.log(plantInfoData["nurseries"]["external"]["data"]);
  // console.log(plantInfoData["plants"]["common_names"]["data"]);
  // console.log(plantInfoData["nurseries"]["terms"]["data"]);

  return plantInfoData;
}
