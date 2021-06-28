const { createNurseryCategoryPermalinkPath } = require('../_data/helpers.js');

module.exports = function(nursery) {
  return createNurseryCategoryPermalinkPath(nursery);
};
