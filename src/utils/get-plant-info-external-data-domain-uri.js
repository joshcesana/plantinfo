const {
  getExternalDataIndexUri,
  getExternalDataDomain,
} = require("../_data/helpers.js");

/**
 * Get the processed plant info external data.
 *
 * @param {Object}  plantInfoExternalDetails  The plant info ExternalDetails.
 * @param {Object}  topicExternalDetails      The topic ExternalDetails.
 * @param {Object}  configData          The configData to use in the processing.
 * @returns {Object}                The processed external data.
 */
module.exports = (plantInfoExternalDetails, topicExternalDetails, configData) => {
  // Get the URI for the index file.
  topicExternalDetails["dataIndexUri"] = getExternalDataIndexUri(
    plantInfoExternalDetails["path"],
    topicExternalDetails["path"]
  );

  // Get the full domain name, including the subdomain.
  topicExternalDetails["path"]["fullDomain"] = getExternalDataDomain(
    plantInfoExternalDetails["path"],
    topicExternalDetails["path"]
  );

  return topicExternalDetails;
}
