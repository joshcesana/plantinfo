const getPlantInfoExternalDetails = require("../_data/plant_info/external.js");
const getPlantInfoExternalDataDomainUri = require("./get-plant-info-external-data-domain-uri.js");

const {
  fetchExternalData,
  processExternalData,
} = require("../_data/helpers.js");

/**
 * Get the processed plant info external data.
 *
 * @param {Object}  topicExternalDetails      The topic ExternalDetails.
 * @param {Object}  configData          The configData to use in the processing.
 * @returns {Object}                The processed external data.
 */
module.exports = async (topicExternalDetails, configData) => {
  const plantInfoExternalDetails = getPlantInfoExternalDetails();

  // Get the URI and full domain, including subdomain, for the index file.
  topicExternalDetails = getPlantInfoExternalDataDomainUri(
    plantInfoExternalDetails,
    topicExternalDetails,
    configData
  );

  // Fetch the index file.
  topicExternalDetails["dataIndex"] = await fetchExternalData(
    topicExternalDetails["dataIndexUri"]
  );

  // Use the index file to fetch the full data and process it into Eleventy data.
  topicExternalDetails["data"] = await processExternalData(
    topicExternalDetails["dataIndex"],
    topicExternalDetails["path"]["fullDomain"],
    plantInfoExternalDetails["path"]["schema"],
    configData['maxDataItemsPerLevel']
  );

  return topicExternalDetails;
}
