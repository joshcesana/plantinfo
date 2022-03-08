const {
    objectHasOwnProperties,
    cloneObject,
    isArrayWithItems
  } = require('../_data/helpers.js');

const { chunk } = require('lodash');

/**
 * Takes a category collection and returns it back chunked for paging.
 *
 * @param {Array|Object}  categoryCollection    The 11ty collection with categories
 * @param {Number}        itemsPerPage          The number of items to display per page.
 * @param {String}        itemType              The term type to use for the collection.
 * @returns {Array}                             The paged collection
 */
module.exports = (categoryCollection, itemsPerPage, itemType) => {
  let pagedCategoryCollection = [];
  if (
    isArrayWithItems(categoryCollection)
  ) {
    categoryCollection.forEach(categoryItem => {
      if (
        objectHasOwnProperties(categoryItem, ['data'])
      ) {
        if (
          objectHasOwnProperties(categoryItem.data, ['name']) &&
          objectHasOwnProperties(categoryItem.data, ['machine_name']) &&
          objectHasOwnProperties(categoryItem.data, ['archival_data', 'id']) &&
          objectHasOwnProperties(categoryItem.data, [itemType + '_items'])
        ) {

          let pagedCategoryItems = [];
          let pageSlugs = [];
          let categoryName = categoryItem.data['name'];
          let categorySlug = categoryItem.data['machine_name'];
          let uuidSlug = categoryItem.data['archival_data']['id'];
          let cuSlug = '/nurseries/nursery-category/' + categorySlug + '/uuid/' + uuidSlug;
          let categoryItems = categoryItem.data[itemType + '_items'];

          if (
            isArrayWithItems(categoryItems)
          ) {
            pagedCategoryItems = chunk(categoryItems, itemsPerPage);

            for (let i = 0; i < pagedCategoryItems.length; i++) {
              let pageSlug = i > 0 ? `${cuSlug}/${i + 1}` : `${cuSlug}`;
              pageSlugs.push(pageSlug);
            }
          } else {
            pageSlugs.push(`${cuSlug}`);
          }

          pagedCategoryItems.forEach((categoryItems, index) => {
            pagedCategoryCollection.push({
              title: categoryName,
              slug: pageSlugs[index],
              pageNumber: index,
              totalPages: pageSlugs.length,
              pages: pageSlugs,
              pageSlugs: {
                all: pageSlugs,
                next: pageSlugs[index + 1] || null,
                previous: pageSlugs[index - 1] || null,
                first: pageSlugs[0] || null,
                last: pageSlugs[pageSlugs.length - 1] || null
              },
              source: categoryItem,
              items: categoryItems
            });
          });
        }
      }
    });
  }

  return pagedCategoryCollection;
};
