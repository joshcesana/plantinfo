const getFilteredByLetterGroup = require('./src/utils/get-filltered-by-letter-group.js');
const sortByMachineName = require('./src/utils/sort-by-machine-name.js');

module.exports = config => {
  // Set directories to pass through to the dist folder
  config.addPassthroughCopy('./src/images/');

  // Returns family items.
  config.addCollection('family', collection => {
    return sortByMachineName(getFilteredByLetterGroup(collection, ['plants', 'family'], [3], 'family'));
  });

  // Returns genus items.
  config.addCollection('genus', collection => {
    return sortByMachineName(getFilteredByLetterGroup(collection, ['plants', 'family'], [6], 'genus'));
  });

  // Returns species items.
  config.addCollection('species', collection => {
    return sortByMachineName(getFilteredByLetterGroup(collection, ['plants', 'family'], [9], 'species'));
  });

  // Returns variety items.
  config.addCollection('variety', collection => {
    return sortByMachineName(getFilteredByLetterGroup(collection, ['plants', 'family'], [9, 12], 'variety'));
  });

  // Tell 11ty to use the .eleventyignore and ignore our .gitignore file
  config.setUseGitIgnore(false);

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
