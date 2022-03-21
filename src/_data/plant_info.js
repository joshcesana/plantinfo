const { AssetCache } = require("@11ty/eleventy-fetch");

const getPlantInfoData = require('../utils/get-plant-info-data.js');

module.exports = async (configData) => {
  let
    plantInfoData = {},
    cacheOptions = {
      duration: configData['cacheDuration'],
      directory: configData['cacheDirectory'],
    }
  ;

  if(process.env.ELEVENTY_SERVERLESS) {
    // Infinite duration (until the next build)
    cacheOptions.duration = configData['cacheDurationServerless'];
    // Instead of ".cache" default because files/directories
    // that start with a dot are not bundled by default
    cacheOptions.directory = configData['cacheDirectoryServerless'];
  }

  let plantInfoDataAsset = new AssetCache("plantInfoDataCache", cacheOptions.directory)

  if (plantInfoDataAsset.isCacheValid(cacheOptions.duration)) {
    // return cached data.
    return plantInfoDataAsset.getCachedValue(); // a promise
  }

  plantInfoData = {
    "external": {
      "path": {
        "schema": "https",
        "domain": "plantinfo",
        "tld": "org",
        "subDomain": "data",
        "indexFile": "file-index",
        "indexFileType": "json",
      }
    },
    "citations": {
      "external": {
        "path": {
          "topicSubDomain": "citations",
          "fullDomain": null,
        },
        "dataIndexUri": null,
        "dataIndex": null,
        "data": null,
      },
      "data": {
        "journal_book": null,
        "citation_reference": null,
      }
    },
    "plants": {
      "external": {
        "path": {
          "topicSubDomain": "plants",
          "fullDomain": null,
        },
        "dataIndexUri": null,
        "dataIndex": null,
        "data": null,
      },
      "common_names": {
        "path": {
          "fullDomain": null,
          "directory": "common_names",
          "file": "common_names",
          "fileType": "json",
        },
        "fileUri": null,
        "data": null,
      },
      "data": {
        "family": null,
        "genus": null,
        "species": null,
        "variety": null,
        "genus_letters": null,
        "common_name": null,
        "common_name_letters": null,
        "plant_prepare_index": null,
        "plant_build_index": null,
        "full_plant_index": null,
      }
    },
    "nurseries": {
      "external": {
        "path": {
          "topicSubDomain": "nurseries",
          "fullDomain": null,
        },
        "dataIndexUri": null,
        "dataIndex": null,
        "data": null,
      },
      "terms": {
        "path": {
          "fullDomain": null,
          "directory": "terms",
          "file": "terms",
          "fileType": "json",
        },
        "fileUri": null,
        "data": null,
      },
      "data": {
        "nursery":  null,
        "nursery_catalog": null,
        "nursery_category": null,
        "nursery_specialty": null,
        "nursery_by_category": null,
        "nursery_prepare_index": null,
        "nursery_build_index": null,
      }
    },
  };
  plantInfoData = await getPlantInfoData(plantInfoData, configData);

  await plantInfoDataAsset.save(plantInfoData, "json");

  return plantInfoData;
};
