const getPlantInfoExternalDetails = require("../_data/plant_info/external.js");

const {
  getExternalDataDomain,
  fetchExternalData,
  getExternalFileUri
} = require("../_data/helpers.js");

/**
 * Get the plant info external data for a subtopic.
 *
 * @param {Object}  topicExternalDetails      The topic ExternalDetails.
 * @param {Object}  subTopicExternalDetails   The subTopic ExternalDetails.
 * @param {Object}  configData          The configData to use in the processing.
 * @returns {Object}                The processed external data.
 */
module.exports = async (topicExternalDetails, subTopicExternalDetails, configData) => {
  const plantInfoExternalDetails = getPlantInfoExternalDetails(configData);

  // Get the full domain, including subdomain, for the external data.
  topicExternalDetails["path"]["fullDomain"] = getExternalDataDomain(
    plantInfoExternalDetails["path"],
    topicExternalDetails["path"]
  );

  // Use the topic full domain for the subtopic as well.
  subTopicExternalDetails["path"]["fullDomain"] = topicExternalDetails["path"]["fullDomain"];

  // Get the full URI for the file the fetch.
  subTopicExternalDetails["fileUri"] = getExternalFileUri(
    subTopicExternalDetails["path"]
  );

  // Fetch the data for the subtopic.
  subTopicExternalDetails["data"] = await fetchExternalData(
    subTopicExternalDetails["fileUri"]
  );

  return subTopicExternalDetails;
}
