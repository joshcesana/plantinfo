module.exports = {

  /**
   * Capitalizes the first letter of a string.
   *
   * @param {String}       string       The string.
   * @returns {String}                  The capitalized string.
   */
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  /**
   * Checks if the object or object chain has a set of properties.
   *
   * @param {Object}       object       The object chain.
   * @param {Array}        properties   The array of property names.
   * @returns {Boolean}                 The determination if the object has these properties.
   */
  objectHasOwnProperties(object, properties) {
    let currentObject = Object.assign(object);
    let hasProperties = true;

    if (Array.isArray(properties)) {
      properties.forEach(property => {
        if (
          currentObject.hasOwnProperty(property) &&
          currentObject[property] !== null &&
          typeof(currentObject[property]) !== 'undefined'
        ) {
          currentObject = Object.assign(currentObject[property]);
        } else {
          hasProperties = false;
        }
      });
    }

    return hasProperties;
  },

  /**
   * Iterates over an object's boolean properties in order to allow a check
   * function to do something with the properties set to `true`.
   *
   * @param {Object}       object          The object to iterate over.
   * @param {Function}     checkFunction   The check function, which should take
   *                                         parameters of `key` and `in_use`.
   */
  checkBooleanObjectProperties(object, checkFunction) {
    let objectEntries = Object.entries(object);
    if (module.exports.isArrayWithItems(objectEntries)) {
      objectEntries.forEach(([key, in_use]) => {
        if (in_use) {
          checkFunction(key, in_use);
        }
      });
    }
  },

  /**
   * Checks if this is an array that has items.
   *
   * @param {Array}       checkThis   The item to check.
   * @returns {Boolean}               The determination if the object has these properties.
   */
  isArrayWithItems(checkThis) {
    return (
      Array.isArray(checkThis) &&
      checkThis.length > 0
    );
  },

  /**
   * Clones an object without a reference.
   *
   * @param {Object}       object      The object.
   * @returns {Object}                 The cloned object.
   */
  cloneObject(object) {
    return JSON.parse(JSON.stringify(object))
  },

  /**
   * Merges two objects.
   *
   * @param {Object}       defaultObject      The default object.
   * @param {Object}       overrideObject     The override object.
   * @returns {Object}                        The merged object.
   */
  mergeObjects(defaultObject, overrideObject) {
    return {
      ...defaultObject,
      ...module.exports.cloneObject(overrideObject)
    };
  },

  /**
   * Insert line break opportunities into a URL
   */
  addUrlLineBreaks(url) {
  // Split the URL into an array to distinguish double slashes from single slashes
    var doubleSlash = url.split('//');

    // Format the strings on either side of double slashes separately
    return doubleSlash.map(str =>
        // Insert a word break opportunity after a colon and at-sign
        str.replace(/(?<after>[:@])/giu, '$1<wbr>')
        // Before a single slash, tilde, period, comma, hyphen, underline, question mark, number sign, or percent symbol
          .replace(/(?<before>[/~.,\-_?#%])/giu, '<wbr>$1')
          // Before and after an equals sign or ampersand
          .replace(/(?<beforeAndAfter>[=&])/giu, '<wbr>$1<wbr>')
      // Reconnect the strings with word break opportunities after double slashes
    ).join('//<wbr>');
  },

  /**
   * Gets the name of the country based on a country key.
   *
   * @param {String}       country_key      The country key.
   * @returns {String}                      The country name.
   */
  getCountryName(country_key) {
    let countryName = "";

    if (country_key === "united_states") {
      countryName = "United States";
    } else if (country_key === "canada") {
      countryName = "Canada";
    }

    return countryName;
  },

  /**
   * Returns back some attributes based on whether the
   * link is active or a parent of an active item
   *
   * @param {String} itemUrl The link in question
   * @param {String} pageUrl The page context
   * @returns {String} The attributes or empty
   */
  getLinkActiveState(itemUrl, pageUrl) {
    let response = '';

    if (itemUrl === pageUrl) {
      response = ' aria-current="page"';
    }

    if (itemUrl.length > 1 && pageUrl.indexOf(itemUrl) === 0) {
      response += ' data-state="active"';
    }

    return response;
  },

  /**
   * Finds an item based on the collection type and machine name.
   *
   * @param {Array}        collections  The 11ty collections.
   * @param {String}       itemType     The item type to use for the collection.
   * @param {String}       machineName  The machine name of the item.
   * @param {String}       uuid         The uuid of the item.
   * @returns {Array}                   The item from the collection.
   */
  async findItemByTypeAndMachineName(collections, itemType, machineName, uuid = '') {
    let collectionItemsFound = [];

    if (module.exports.objectHasOwnProperties(collections, [itemType])) {
      const collectionItems = collections[itemType];

      if (module.exports.isArrayWithItems(collectionItems)) {
        collectionItems.forEach(collectionItem => {
          let thisItem = {};

          if (module.exports.objectHasOwnProperties(collectionItem, ['data'])) {
            if (
              module.exports.objectHasOwnProperties(collectionItem['data'], ['type']) &&
              module.exports.objectHasOwnProperties(collectionItem['data'], ['machine_name']) &&
              collectionItem['data']['type'] === itemType &&
              collectionItem['data']['machine_name'] === machineName
            ) {
              thisItem['data'] = module.exports.cloneObject(collectionItem.data);
            }
          }

          if (module.exports.objectHasOwnProperties(thisItem, ['data'])) {
            collectionItemsFound.push(thisItem);
          }
        });
      }
    }

    return new Promise(resolve => {
      resolve(collectionItemsFound);
    });
  },

  /**
   * Returns an item based on the collection type and machine name.
   *
   * @param {Array}        collections  The 11ty collections.
   * @param {String}       itemType     The item type to use for the collection.
   * @param {String}       machineName  The machine name of the item.
   * @param {String}       uuid         The uuid of the item.
   * @returns {Array}                   The item from the collection.
   */
  getItemByTypeAndMachineName(collections, itemType, machineName, uuid = '') {

    let checkItem = function(item, itemType, machineName) {
      let thisItem = {};

      if (module.exports.objectHasOwnProperties(item, ['data'])) {
        if (
          module.exports.objectHasOwnProperties(item['data'], ['type']) &&
          module.exports.objectHasOwnProperties(item['data'], ['machine_name']) &&
          item['data']['type'] === itemType &&
          item['data']['machine_name'] === machineName
        ) {
          thisItem['data'] = module.exports.cloneObject(item.data);
        }
      }

      return thisItem;
    };

    let addItem = function(item, collectedItems) {
      if (module.exports.objectHasOwnProperties(item, ['data'])) {
        collectedItems.push(item);
      }

      return collectedItems;
    };

    let findItemByTypeAndMachineName = function(collections, itemType, machineName, uuid = '') {
      let collectionItemsFound = [];

      if (module.exports.objectHasOwnProperties(collections, [itemType])) {
        const collectionItems = collections[itemType];

        if (module.exports.isArrayWithItems(collectionItems)) {
          collectionItems.forEach(collectionItem => {
            let thisItem = checkItem(collectionItem, itemType, machineName);

            collectionItemsFound = addItem(thisItem, collectionItemsFound);
          });
        }
      }

      return collectionItemsFound;
    };

    let itemFound = {},
      collectionItems = [];

    collectionItems = findItemByTypeAndMachineName(collections, itemType, machineName, uuid = '');


    if (collectionItems.length > 0 ) {
      itemFound = collectionItems[0];
    }

    return itemFound;
  },

  /**
   * Returns a plant item based on the collection type and machine name.
   *
   * @param {Array}        collections  The 11ty collections.
   * @param {String}       itemType     The item type to use for the collection.
   * @param {String}       machineName  The machine name of the plant item.
   * @param {String}       uuid         The uuid of the plant item.
   * @returns {Array}                   The item from the collection.
   */
  getPlantByTypeAndMachineName(collections, itemType, machineName, uuid) {
    return module.exports.getItemByTypeAndMachineName(collections, itemType, machineName, uuid);
  },

  /**
   * Returns a plant type based on the parent of the provided plant type.
   *
   * @param {String}       plantType    The plant type.
   * @returns {String}                  The parent plant type.
   */
  getParentPlantType(plantType) {
    let parentPlantType = null;

    if (plantType === 'genus') {
      parentPlantType = 'family';
    } else if (plantType === 'species') {
      parentPlantType = 'genus';
    } else if (plantType === 'variety') {
      parentPlantType = 'species';
    }

    return parentPlantType;
  },

  /**
   * Returns a plant type based on the child of the provided plant type.
   *
   * @param {String}       plantType    The plant type.
   * @returns {String}                  The child plant type.
   */
  getChildPlantType(plantType) {
    let childPlantType = null;

    if (plantType === 'family') {
      childPlantType = 'genus';
    } else if (plantType === 'genus') {
      childPlantType = 'species';
    } else if (plantType === 'species') {
      childPlantType = 'variety';
    }

    return childPlantType;
  },

  /**
   * Returns a plant title based on the plant type.
   *
   * @param {String}       plantType    The plant type.
   * @returns {String}                  The plant title.
   */
  getPlantTypeTitle(plantType) {
    let plantTypeTitle = null;

    if (plantType === 'family') {
      plantTypeTitle = 'Family';
    } else if (plantType === 'genus') {
      plantTypeTitle = 'Genus';
    } else if (plantType === 'species') {
      plantTypeTitle = 'Species';
    } else if (plantType === 'variety') {
      plantTypeTitle = 'Variety';
    }
    return plantTypeTitle;
  },

  /**
   * Returns plant items that are the child of a plant type and machine name.
   *
   * @param {Array}      childCollection The 11ty collection for the child plant items.
   * @param {String}     childPlantType  The plant type of the child plant items.
   * @param {String}     plantType       The plant type of the plant item.
   * @param {String}     machineName     The machine name of the plant item.
   * @returns {Array}                    The child plant items.
   */
  getChildPlantsByTypeAndMachineName(childCollection, childPlantType, plantType, machineName) {
    const plantItems = childCollection;
    let childPlantItems = [];

    plantItems.forEach(plant => {
      if (
        plant.hasOwnProperty('data') &&
        plant.data.hasOwnProperty('type') &&
        plant.data.type === childPlantType &&
        plant.data.hasOwnProperty(plantType) &&
        plant.data[plantType] === machineName) {
        childPlantItems.push({data: plant.data});
      }
    });

    return childPlantItems;
  },

  /**
   * Returns a link list of plant items that are the child of a plant type and machine name.
   *
   * @param {Array}      collections     The default collections.
   * @param {Array}      childPlantItems The child plant items.
   * @param {String}     childPlantType  The plant type of the child plant items.
   * @returns {Array}                    The child plant items.
   */
  createChildLinkList(collections, childPlantItems, childPlantType) {
    return module.exports.createLinkList(collections, childPlantItems, childPlantType, 'related');
  },

  /**
   * Returns nursery specialties for a particular nursery
   *
   * @param {Object}     nurseryData     The data from a nursery.
   * @returns {Array}                    The nursery speciality items.
 */
  getNurserySpecialties(nurseryData) {
    let specialityItems = [];

    if (
      module.exports.objectHasOwnProperties(nurseryData, ['specialties']) &&
      module.exports.isArrayWithItems(nurseryData.specialties)
    ) {
      nurseryData.specialties.forEach(specialty => {
        specialityItems.push(
          {
            data: specialty
          }
        );
        if (
          module.exports.objectHasOwnProperties(specialty, ['type']) &&
          module.exports.objectHasOwnProperties(specialty, ['machine_name'])
        ) {
          specialityItems.push(
            {
              data: specialty
            }
          );
        }
      });
    }

    return specialityItems;
  },

  /**
   * Returns plant items that are the child of a plant type and machine name.
   *
   * @param {Array}      collection      The 11ty collection for the child plant items.
   * @param {Object}     plantData       The data from a plant item.
   * @returns {Array}                    The plant citation items.
   */
  getPlantCitations(collection, plantData) {
    const citationReferences = collection;
    let plantCitationItems = [];

    let plantType = plantData.hasOwnProperty('type') ? plantData['type'] : '';
    let plantMachineName = plantData.hasOwnProperty('machine_name') ? plantData['machine_name'] : '';
    let plantArchivalId = '';

    if (
      plantData.hasOwnProperty('archival_data') &&
      typeof(plantData['archival_data']) !== 'undefined' &&
      plantData['archival_data'].hasOwnProperty('id')
    ) {
      plantArchivalId = plantData['archival_data']['id'];
    }


    citationReferences.forEach(plantCitationItem => {
      if (
        plantCitationItem.hasOwnProperty('data') &&
        typeof(plantCitationItem['data']) !== 'undefined' &&
        plantCitationItem.data.hasOwnProperty('plant') &&
        typeof(plantCitationItem.data['plant']) !== 'undefined' &&
        plantCitationItem.data['plant'].hasOwnProperty('type') &&
        plantCitationItem.data['plant']['type'] === plantType &&
        plantCitationItem.data['plant'].hasOwnProperty('machine_name') &&
        plantCitationItem.data['plant']['machine_name'] === plantMachineName
      ) {
        let pushItem = false;

        if (
          plantArchivalId !== '' &&
          plantCitationItem.data['plant'].hasOwnProperty('archival_data') &&
          typeof(plantCitationItem.data['plant']['archival_data']) !== 'undefined' &&
          Array.isArray(plantCitationItem.data['plant']['archival_data']) === true &&
          plantCitationItem.data['plant']['archival_data'].length > 0
        ) {
          plantCitationItem.data['plant']['archival_data'].forEach(id => {
            if (
              id !== '' &&
              id === plantArchivalId
            ) {
              pushItem = true;
            }
          })
        } else {
          pushItem = true;
        }

        if (pushItem) {
          plantCitationItems.push(plantCitationItem.data);
        }
      }
    });


    return plantCitationItems;
  },

  /**
   * Filters a list of plant items in a directory by letter.
   *
   * @param {Array}      directoryPlantItems The directory plant items.
   * @param {String}     letter_slug         The letter to filter by.
   * @returns {Array}                        The directory plant items.
   */
  filterDirectoryItemsByLetter(directoryPlantItems, letter_slug) {
    let getLetterSlug = () => letter_slug;

    let matchItemWithSlug = (item) => {
      const slug = getLetterSlug();

      return item.hasOwnProperty('data') &&
        item.data.hasOwnProperty('name') &&
        item.data.name !== '' &&
        item.data.name.toLowerCase().charAt(0) === slug;
    };

    return directoryPlantItems.filter(item => matchItemWithSlug(item));
  },

  /**
   * Creates the permalink path for a nursery.
   *
   * @param {Array}      nurseryItem         The nursery item.
   * @returns {Array}                        The permalink path.
   */
  createNurseryPermalinkPath(nurseryItem) {
    let permalinkPath = '';
    let pathParts = {
      nurserySlug: '',
      uuidSlug: ''
    };

    if (
      nurseryItem.hasOwnProperty('data') &&
      nurseryItem.data.hasOwnProperty('type') &&
      nurseryItem.data.hasOwnProperty('machine_name')
    ) {
      if (nurseryItem.data.type === 'nursery') {
        pathParts.nurserySlug = nurseryItem.data.machine_name;
      }

      if (
        nurseryItem.data.hasOwnProperty('archival_data') &&
        nurseryItem.data.archival_data.hasOwnProperty('id')
      ) {
        pathParts.uuidSlug = nurseryItem.data.archival_data.id;
      }
    }

    if (pathParts.nurserySlug !== '') {
      permalinkPath = permalinkPath + '/nurseries/nursery/' + pathParts.nurserySlug + '/';

      if (pathParts.uuidSlug !== '') {
        permalinkPath = permalinkPath + 'uuid/' + pathParts.uuidSlug + '/';
      }
    }

    return permalinkPath;
  },

  /**
   * Creates the permalink path for a nursery category.
   *
   * @param {Array}      nurseryCategoryItem The nursery category item.
   * @returns {Array}                        The permalink path.
   */
  createNurseryCategoryPermalinkPath(nurseryCategoryItem) {
    let permalinkPath = '';
    let pathParts = {
      nurseryCategorySlug: '',
      uuidSlug: ''
    };

    let permalink_data = {};

    if (
      module.exports.objectHasOwnProperties(nurseryCategoryItem, ['data'])
    ) {
      permalink_data = Object.assign(nurseryCategoryItem.data);
    }

    if (
      module.exports.objectHasOwnProperties(permalink_data, ['nursery_category_items'])
    ) {
      permalink_data = Object.assign(nurseryCategoryItem.data);
    }

    // if (
    //   permalink_data.hasOwnProperty('nursery_category') &&
    //   typeof(permalink_data['nursery_category']) !== 'undefined' &&
    //   permalink_data['nursery_category'].hasOwnProperty('data') &&
    //   typeof(permalink_data['nursery_category'].data) !== 'undefined'
    // ) {
    //   permalink_data = permalink_data['nursery_category'].data
    // }

    if (
      module.exports.objectHasOwnProperties(permalink_data, ['type']) &&
      module.exports.objectHasOwnProperties(permalink_data, ['machine_name'])
    ) {
      if (permalink_data.type === 'nursery_category') {
        pathParts.nurseryCategorySlug = permalink_data.machine_name;
      }

      if (
        module.exports.objectHasOwnProperties(permalink_data, ['archival_data', 'id'])
      ) {
        pathParts.uuidSlug = permalink_data.archival_data.id;
      }
    }

    if (
      pathParts.nurseryCategorySlug !== '' &&
      typeof(pathParts.nurseryCategorySlug) !== 'undefined'
    ) {
      permalinkPath = permalinkPath + '/nurseries/nursery-category/' + pathParts.nurseryCategorySlug + '/';

      if (
        pathParts.uuidSlug !== '' &&
        typeof(pathParts.uuidSlug) !== 'undefined'
      ) {
        permalinkPath = permalinkPath + 'uuid/' + pathParts.uuidSlug + '/';
      }
    }

    return permalinkPath;
  },

  /**
   * Creates the permalink path for a common name.
   *
   * @param {Array}      commonNameItem      The common name item.
   * @returns {Array}                        The permalink path.
   */
  createCommonNamePermalinkPath(commonNameItem) {
    let permalinkPath = '';
    let pathParts = {
      commonNameSlug: '',
      uuidSlug: ''
    };

    if (
      commonNameItem.hasOwnProperty('data') &&
      commonNameItem.data.hasOwnProperty('type') &&
      commonNameItem.data.hasOwnProperty('machine_name')
    ) {
      if (commonNameItem.data.type === 'common_name') {
        pathParts.commonNameSlug = commonNameItem.data.machine_name;
      }

      if (
        commonNameItem.data.hasOwnProperty('archival_data') &&
        commonNameItem.data.archival_data.hasOwnProperty('id')
      ) {
        pathParts.uuidSlug = commonNameItem.data.archival_data.id;
      }
    }

    if (pathParts.commonNameSlug !== '') {
      permalinkPath = permalinkPath + '/plants/common-names/' + pathParts.commonNameSlug + '/';

      if (pathParts.uuidSlug !== '') {
        permalinkPath = permalinkPath + 'uuid/' + pathParts.uuidSlug + '/';
      }
    }

    return permalinkPath;
  },

  /**
   * Creates the permalink path for a plant.
   *
   * @param {Array}      plantItem           The plant item.
   * @returns {Array}                        The permalink path.
   */
  createPlantPermalinkPath(plantItem) {
    let permalinkPath = '';
    let pathParts = {
      familySlug: '',
      genusSlug: '',
      speciesSlug: '',
      varietySlug: '',
      uuidSlug: ''
    };

    if (
      plantItem.hasOwnProperty('data') &&
      plantItem.data.hasOwnProperty('type') &&
      plantItem.data.hasOwnProperty('machine_name')
    ) {
      if (plantItem.data.type === 'family') {
        pathParts.familySlug = plantItem.data.machine_name;
      }

      if (plantItem.data.type === 'genus') {
        pathParts.genusSlug = plantItem.data.machine_name;
      }

      if (plantItem.data.type === 'species') {
        pathParts.speciesSlug = plantItem.data.machine_name;
      }

      if (plantItem.data.type === 'variety') {
        pathParts.varietySlug = plantItem.data.machine_name;
      }

      if (plantItem.data.hasOwnProperty('family')) {
        pathParts.familySlug = plantItem.data.family;
      }

      if (plantItem.data.hasOwnProperty('genus')) {
        pathParts.genusSlug = plantItem.data.genus;
      }

      if (plantItem.data.hasOwnProperty('species')) {
        pathParts.speciesSlug = plantItem.data.species;
      }

      if (
        plantItem.data.hasOwnProperty('archival_data') &&
        plantItem.data.archival_data.hasOwnProperty('id')
      ) {
        pathParts.uuidSlug = plantItem.data.archival_data.id;
      }
    }

    if (pathParts.familySlug !== '') {
      permalinkPath = permalinkPath + '/plants/family/' + pathParts.familySlug + '/';

      if (pathParts.genusSlug !== '') {
        permalinkPath = permalinkPath + 'genus/' + pathParts.genusSlug + '/';
      }

      if (pathParts.speciesSlug !== '') {
        permalinkPath = permalinkPath + 'species/' + pathParts.speciesSlug + '/';
      }

      if (pathParts.varietySlug !== '') {
        permalinkPath = permalinkPath + 'variety/' + pathParts.varietySlug + '/';
      }

      if (pathParts.uuidSlug !== '') {
        permalinkPath = permalinkPath + 'uuid/' + pathParts.uuidSlug + '/';
      }
    }

    return permalinkPath;
  },

  /**
   * Returns a link list of plant items in a directory.
   *
   * @param {Array}      collections         The default collections.
   * @param {Array}      directoryPlantItems The directory plant items.
   * @param {String}     directoryPlantType  The plant type of the directory plant items.
   * @returns {Array}                         The directory plant items.
   */
  createDirectoryLinkList(collections, directoryPlantItems, directoryPlantType) {
    return module.exports.createLinkList(collections, directoryPlantItems, directoryPlantType, 'directory');
  },

  /**
   * Returns a link list of items.
   *
   * @param {Array}     collections   The default collections.
   * @param {Array}      items         The items.
   * @param {String}     itemType      The type of the items.
   * @param {String}     classPrefix   The prefix to use in the class name.
   * @param {String}     permalinkType The permalink type to use.
   * @returns {Array}                  The link list items.
   */
  createLinkList(collections, items, itemType, classPrefix, permalinkType = 'plant') {
    let linkList = [];

    items.forEach(item => {
      if (
        module.exports.objectHasOwnProperties(item, ['data']) &&
        module.exports.objectHasOwnProperties(item.data, ['type']) &&
        module.exports.objectHasOwnProperties(item.data, ['machine_name'])
      ) {
        let permalinkPath = '';
        if (permalinkType === 'plant') {
          permalinkPath = module.exports.createPlantPermalinkPath(item);
        } else if (permalinkType === 'nursery_category') {
          permalinkPath = module.exports.createNurseryCategoryPermalinkPath(item);
        }

        let linkListItem = {
          list_item_class: '[ ' + classPrefix + '-' + itemType + '__link-list-item ]',
          link_class: '[ ' + classPrefix + '-' + itemType + '__link ]',
          type: item.data.type,
          machine_name: item.data.machine_name,
          uuid: item.data.uuid,
          permalink_path: permalinkPath
        };

        if (
          module.exports.objectHasOwnProperties(item.data, ['name'])
        ) {
          linkListItem.name = item.data.name
        } else {
          const itemData = module.exports.getItemByTypeAndMachineName(collections, itemType, item.data.machine_name);

          if (
            module.exports.objectHasOwnProperties(itemData, ['data', 'name'])
          ) {
            linkListItem.name = itemData.data.name
          }
        }

        linkList.push(linkListItem);
      }
    });

    return linkList;
  },

  /**
   * Returns a letter list based on initial letters of plants for a
   * particular plant type.
   *
   * @param {Array}      typeCollection  The 11ty collection for a plant type.
   * @param {String}     plantType       The plant type.
   * @returns {Array}                    The link list of plant letters.
   */
  createLetterList(typeCollection, plantType) {

    let letterList = [];

    typeCollection.forEach(plant => {
      if (
        plant.hasOwnProperty('data') &&
        plant.data.hasOwnProperty('type') &&
        plant.data.hasOwnProperty('name')
      ) {
        if (plant.data.type === plantType) {
          let thisPlant = module.exports.cloneObject(plant);
          let firstLetter = (thisPlant.data.name.match(/[a-zA-Z]/) || []).pop();

          if (firstLetter !== '' && !letterList.includes(firstLetter)) {
            letterList.push(
              {
                data: {
                  letter: firstLetter,
                  letter_slug: firstLetter.toLowerCase()
                }
              }
            );
          }
        }
      }
    });

    return letterList;
  },

  /**
   * Returns a letter link list based on initial letters of plants for a
   * particular plant type.
   *
   * @param {Array}      letterList      The array of letters.
   * @param {String}     plantType       The plant type.
   * @returns {Array}                    The link list of plant letters.
   */
  createLetterLinkList(letterList, plantType) {

    let letterLinkList = [];

    letterList.forEach(letter => {
      if (
        letter.hasOwnProperty('data') &&
        letter.data.hasOwnProperty('letter_slug') &&
        letter.data.hasOwnProperty('letter')
      ) {
        letterLinkList.push(
          {
            list_item_class: '[ letter-list-item--' + plantType + '-directory ]',
            link_class: '[ letter-list--' + plantType + '-directory ]',
            directory_path: plantType + '-directory',
            letter_slug: letter.data.letter_slug,
            letter: letter.data.letter
          }
        );
      }
    });

    return letterLinkList;
  },

  /**
   * Sets information in a scientific name object, based on plant data. Used in
   * a recursive function to set all levels of the scientific name.
   *
   * @param {Array}        collections    The 11ty collections.
   * @param {Object}       plantData      The plant data object.
   * @param {String}       plantType      The plant type.
   * @param {String}       scientificName The original scientific name object.
   * @returns {Object}                    The recursive object used for name setting.
   */
  setScientificNameInfo(collections, plantData, plantType, scientificName) {
    let thisScientificName = Object.assign(scientificName);

    thisScientificName[plantType].name = plantData.name;
    thisScientificName[plantType].machine_name = plantData.machine_name;
    thisScientificName[plantType].naming_authorities = plantData.naming_authorities;

    if (plantType !== 'family') {
      if (plantType === 'species' || plantType === 'genus') {
        if (plantData.hasOwnProperty('hybrid') && (plantData.hybrid === 'true' || (typeof(plantData.hybrid) === 'boolean' && plantData.hybrid === true))) {
          thisScientificName[plantType].hybrid = true;
        }
      }

      if (plantType === 'species' && plantData.hasOwnProperty('species')) {
        if (plantData.species === 'unknown') {
          thisScientificName.species.species_name = '[Cultivars]';
        } else {
          thisScientificName.species.species_name = plantData.species;
        }
      }

      if (plantType === 'variety') {
        if (plantData.hasOwnProperty('lower_ranks_name') && (plantData.lower_ranks_name !== '' && plantData.lower_ranks_name !== null)) {
          thisScientificName.lower_ranks.name = plantData.lower_ranks_name;
        }

        if (plantData.hasOwnProperty('mark') && (plantData.mark === 'tm' || plantData.mark === 'r')) {
          thisScientificName.lower_ranks.mark.none = false;

          if (plantData.mark === 'tm') {
            thisScientificName.lower_ranks.mark.trademark = true;
          } else if (plantData.mark === 'r') {
            thisScientificName.lower_ranks.mark.registered = true;
          }
        }

        if (plantData.hasOwnProperty('lower_ranks')) {
          if (
            plantData.lower_ranks.hasOwnProperty('cultivar') && (
              plantData.lower_ranks.cultivar === 'true' ||
              (typeof(plantData.lower_ranks.cultivar) === 'boolean' && plantData.lower_ranks.cultivar === true)
            )
          ) {
            thisScientificName.lower_ranks.type.cultivar = plantData.lower_ranks.cultivar;
          } else if (
            plantData.lower_ranks.hasOwnProperty('variety') && (
              plantData.lower_ranks.variety === 'true' ||
              (typeof(plantData.lower_ranks.variety) === 'boolean' && plantData.lower_ranks.variety === true)
            )
          ) {
            thisScientificName.lower_ranks.type.variety = plantData.lower_ranks.variety;
          } else if (
            plantData.lower_ranks.hasOwnProperty('form') && (
              plantData.lower_ranks.form === 'true' ||
              (typeof(plantData.lower_ranks.form) === 'boolean' && plantData.lower_ranks.form === true)
            )
          ) {
            thisScientificName.lower_ranks.type.form = plantData.lower_ranks.form;
          } else if (
            plantData.lower_ranks.hasOwnProperty('grex') && (
              plantData.lower_ranks.grex === 'true' ||
              (typeof(plantData.lower_ranks.grex) === 'boolean' && plantData.lower_ranks.grex === true)
            )
          ) {
            thisScientificName.lower_ranks.type.grex = plantData.lower_ranks.grex
            ;
          } else if (
            plantData.lower_ranks.hasOwnProperty('subspecies') && (
              plantData.lower_ranks.subspecies === 'true' ||
              (typeof(plantData.lower_ranks.subspecies) === 'boolean' && plantData.lower_ranks.subspecies === true)
            )
          ) {
            thisScientificName.lower_ranks.type.subspecies = plantData.lower_ranks.subspecies;
          }
        }
      }
    }

    return thisScientificName;
  },

  /**
   * Returns an object with the information necessary to build the scientific
   * name of a plant, based on the data for a particular plant, and the type of
   * plant (family, genus, species, variety).
   *
   * @param {Array}        collections  The 11ty collections.
   * @param {Object}       plantData    The plant data object.
   * @param {String}       plantType    The plant type.
   * @returns {Object}                  The scientific name object.
   */
  getScientificNameInfo(collections, plantData, plantType) {
    const scientificName = {
      family: {
        name: '',
        machine_name: '',
        naming_authorities: ''
      },
      genus: {
        name: '',
        machine_name: '',
        naming_authorities: '',
        hybrid: false
      },
      species: {
        name: '',
        machine_name: '',
        naming_authorities: '',
        hybrid: false,
        species_name: ''
      },
      variety: {
        name: '',
        machine_name: '',
        naming_authorities: ''
      },
      lower_ranks: {
        name: '',
        mark: {
          none: true,
          registered: false,
          trademark: false
        },
        type: {
          cultivar: false,
          variety: false,
          form: false,
          grex: false,
          subspecies: false
        }
      }
    };

    let currentScientificName = Object.assign(scientificName);
    let currentPlant = {};
    let currentPlantData = Object.assign(plantData);
    let currentPlantType = plantType;

    // Only loop through when the plant type is not 'family'.
    while (currentPlantType !== 'family') {
      // Fill the scientific name object with info for this level.
      currentScientificName = module.exports.setScientificNameInfo(collections, currentPlantData, currentPlantType, currentScientificName);

      // Not on the family level, so move one level up before looping again.
      // On the family level, the loop will exit.
      currentPlantType = module.exports.getParentPlantType(currentPlantType);
      currentPlant = module.exports.getPlantByTypeAndMachineName(collections, currentPlantType, currentPlantData[currentPlantType]);
      currentPlantData = currentPlant.data;
    }

    // We are on the family level now, so set the scientific name info for family.
    currentScientificName = module.exports.setScientificNameInfo(collections, currentPlantData, currentPlantType, currentScientificName);

    return currentScientificName;
  },

  /**
   * Returns an object with the information necessary to display nursery data.
   *
   * @param {Object}       nurseryData    The nursery data object.
   * @returns {Object}                    The nursery details object.
   */
  getNurseryDetails(nurseryData) {
    const location = nurseryData.location;

    const nurseryDetails = {
      name: '',
      website: '',
      email: '',
      email_breaks: '',
      phone: '',
      phone_tel: '',
      fax: '',
      fax_tel: '',
      contact_name: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      geo_coordinate: '',
      catalog_print: false,
      catalog_online: false,
      catalog_web_only: false
    };

    if (
      module.exports.objectHasOwnProperties(nurseryData, ['name'])
    ) {
      nurseryDetails.name = nurseryData.name;
    }

    if (
      module.exports.objectHasOwnProperties(nurseryData, ['contact'])
    ) {
      const contact = nurseryData.contact;

      if (
        module.exports.objectHasOwnProperties(contact, ['website', 'url'])
      ) {
        nurseryDetails.website = contact.website.url;
      }

      if (
        module.exports.objectHasOwnProperties(contact, ['email'])
      ) {
        nurseryDetails.email = contact.email;
        nurseryDetails.email_breaks = module.exports.addUrlLineBreaks(contact.email);
      }

      if (
        module.exports.objectHasOwnProperties(contact, ['phone'])
      ) {
        nurseryDetails.phone = contact.phone;
        nurseryDetails.phone_tel = contact.phone.replace('-', '');
      }

      if (
        module.exports.objectHasOwnProperties(contact, ['fax'])
      ) {
        nurseryDetails.fax = contact.fax;
        nurseryDetails.fax_tel = contact.fax.replace('-', '');
      }

      if (
        module.exports.objectHasOwnProperties(contact, ['name'])
      ) {
        nurseryDetails.contact_name = contact.name;
      }
    }

    if (
      module.exports.objectHasOwnProperties(nurseryData, ['location'])
    ) {
      const location = nurseryData.location;

      if (
        module.exports.objectHasOwnProperties(location, ['address_1'])
      ) {
        nurseryDetails.address_1 = location.address_1;
      }

      if (
        module.exports.objectHasOwnProperties(location, ['address_2'])
      ) {
        nurseryDetails.address_2 = location.address_2;
      }

      if (
        module.exports.objectHasOwnProperties(location, ['city'])
      ) {
        nurseryDetails.city = location.city;
      }

      if (
        module.exports.objectHasOwnProperties(location, ['state'])
      ) {
        nurseryDetails.state = location.state;
      }

      if (
        module.exports.objectHasOwnProperties(location, ['postal_code'])
      ) {
        nurseryDetails.postal_code = location.postal_code;
      }

      if (
        module.exports.objectHasOwnProperties(location, ['country']) &&
        module.exports.objectHasOwnProperties(location.country, ['united_states']) &&
        module.exports.objectHasOwnProperties(location.country, ['canada'])
      ) {

        nurseryDetails.country = module.exports.checkBooleanObjectProperties(location.country, (key, in_use) => {
          return module.exports.getCountryName(key);
        });
      }

      if (
        module.exports.objectHasOwnProperties(location, ['geo_coordinate'])
      ) {
        nurseryDetails.geo_coordinate = location.geo_coordinate;
      }
    }

    if (
      module.exports.objectHasOwnProperties(nurseryData, ['catalog'])
    ) {
      const catalog = nurseryData.catalog;

      if (
        module.exports.objectHasOwnProperties(catalog, ['print'])
      ) {
        nurseryDetails.catalog_print = catalog.print;
      }

      if (
        module.exports.objectHasOwnProperties(catalog, ['online'])
      ) {
        nurseryDetails.catalog_online = catalog.online;
      }

      if (
        module.exports.objectHasOwnProperties(catalog, ['web_only'])
      ) {
        nurseryDetails.catalog_web_only = catalog.web_only;
      }
    }

    return nurseryDetails;
  }
};
