const uuidv4 = require("uuid/v4");
const fetch = require('node-fetch');
const nestedProperty = require('nested-property');
const http = require('node:http');
const https = require('node:https');
const sizeof = require("object-sizeof");

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
   * Gets the methods for an object, including those on prototype chain.
   *
   * @param {Object}       checkThis       The object chain.
   * @returns {Array}                   The array of object methods.
   */
  getObjectMethods(checkThis) {
    let properties = new Set();
    let currentObject = checkThis;
    do {
      Object.getOwnPropertyNames(currentObject).map(item => properties.add(item));
    } while (
      (currentObject = Object.getPrototypeOf(currentObject))
      );
    return [...properties.keys()].filter(item => typeof checkThis[item] === 'function');
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
   * Checks if this is an object.
   *
   * @param {Object}       checkThis   The item to check.
   * @returns {Boolean}               The determination if this is an object.
   */
  isObject(checkThis) {
    return (
      typeof checkThis !== undefined &&
      typeof checkThis !== null &&
      Object.prototype.toString.call(checkThis) === '[object Object]'
    );
  },

  /**
   * Checks if this object is an array.
   *
   * @param {Array}       checkThis   The item to check.
   * @returns {Boolean}               The determination if this is an array.
   */
  isArray(checkThis) {
    return (
      typeof checkThis !== undefined &&
      typeof checkThis !== null &&
      Object.prototype.toString.call(checkThis) === '[object Array]'
    );
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
   * Checks if this is an array with multiple items.
   *
   * @param {Array}       checkThis   The item to check.
   * @returns {Boolean}               The determination if the object has these properties.
   */
  isArrayWithMultipleItems(checkThis) {
    return (
      Array.isArray(checkThis) &&
      checkThis.length > 1
    );
  },

  /**
   * Checks if this is an Eleventy collection.
   *
   * @param {Array}       checkThis   The item to check.
   * @returns {Boolean}               The determination if the object has these properties.
   */
  isCollection(checkThis) {
    return (
      module.exports.isObject(checkThis) &&
      module.exports.getObjectMethods(checkThis).includes('getAll')
    );
  },

  /**
   * Copies an object without a reference.
   *
   * @param {Object}       object      The object.
   * @returns {Object}                 The copied object.
   */
  copyObject(object) {
    return Object.assign(object)
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
   * Finds the values from an object.
   *
   * @param {Object|Array}       checkThis      The item to check.
   * @returns {Array}                           The object values.
   */
  objectValueSeeker(checkThis) {
    let objectValues = [];

    if (module.exports.isObject(checkThis)) {
      objectValues = Object.values(checkThis);
    } else if (module.exports.isArray(checkThis)) {
      let arrayToObject = {};

      checkThis.map((arrayItemValue, objectKey) => {
        arrayToObject[objectKey] = arrayItemValue;
      });

      objectValues = module.exports.objectValueSeeker(arrayToObject);
    }

    return objectValues;
  },

  /**
   * Gets the size of an object.
   *
   * @param {Object}       checkThis      The item to check.
   * @returns {String}                    he object size.
   */
  getObjectSize(checkThis) {
    let
      objectSizeOf = 0,
      objectSizeUnit = 'B',
      unitMinSize = 1
    ;

    const k = 1024,
      minSizeK = k,
      minSizeMB = k * k,
      minSizeGB = k * k * k,
      unitK = 'K',
      unitMB = 'MB',
      unitGB = 'GB'
    ;

    objectSizeOf = sizeof(checkThis);

    if (objectSizeOf > minSizeGB) {
      unitMinSize = minSizeGB;
      objectSizeUnit = unitGB;

    } else if (objectSizeOf > minSizeMB) {
      unitMinSize = minSizeMB;
      objectSizeUnit = unitMB;
    } else if (objectSizeOf > minSizeK) {
      unitMinSize = minSizeK;
      objectSizeUnit = unitK;
    }

    let
      objectSizeOfInUnits = (objectSizeOf / unitMinSize),
      objectSizeOfInUnitsRounded = Math.round(objectSizeOfInUnits * 100) / 100;

    return objectSizeOfInUnitsRounded + objectSizeUnit;
  },

  /**
   * Get all data from collection.
   *
   * @param {Array|Object}  collection         The 11ty collection
   * @returns {Array}                          The collection data array.
   */
  collectionGetAll(collection) {
    let
      isCollection = module.exports.isCollection(collection),
      allCollectionData = []
    ;

    if (isCollection) {
      allCollectionData = collection.getAll();
    } else if (module.exports.isObject(collection)) {
      allCollectionData = [
        {
          data: collection
        }
      ]
    }

    return allCollectionData;
  },

  /**
   * Get root data from collection.
   *
   * @param {Array|Object}        collection         The 11ty collection
   * @returns {Object}                        The collection data.
   */
  getCollectionRootData(collection) {
    let
      allCollectionData = module.exports.collectionGetAll(collection),
      rootCollectionData = {};

    if (
      module.exports.isArrayWithItems(allCollectionData) &&
      module.exports.isObject(allCollectionData[0]) &&
      module.exports.objectHasOwnProperties(allCollectionData[0], ['data'])
    ) {
      rootCollectionData = allCollectionData[0].data;
    }

    return rootCollectionData;
  },

  /**
   * Get data from collection path.
   *
   * @param {Array|Object} collectionData     The 11ty collection data.
   * @param {Array}        dataPath           The path to the data.
   * @returns {Object}                        The collection data.
   */
  getCollectionPathData(collectionData, dataPath) {
    let collectionPathData = {};

    if (module.exports.isObject(collectionData) && module.exports.isArrayWithItems(dataPath)) {
      collectionPathData = collectionData;
      dataPath.forEach(pathItem => {
        if (module.exports.objectHasOwnProperties(collectionPathData, [pathItem])) {
          collectionPathData = collectionPathData[pathItem];
        }
      });
    }

    return collectionPathData;
  },

  /**
   * Get data from config.
   *
   * @param {Object}       configData         The 11ty config data.
   * @param {Array}        dataPath           The path to the data.
   * @returns {Object|Array|String|Number}    The config data.
   */
  getConfigPathData(configData, dataPath) {
    let configPathData = null;

    if (module.exports.isObject(configData) && module.exports.isArrayWithItems(dataPath)) {
      configPathData = configData;
      dataPath.forEach(pathItem => {
        if (module.exports.objectHasOwnProperties(configPathData, [pathItem])) {
          configPathData = configPathData[pathItem];
        }
      });
    }

    return configPathData;
  },

  /**
   * Add item from group to group of items.
   *
   * @param {Array}        groupItems    The group items.
   * @param {Object}       groupItem     The group item object.
   * @return {Array}                     The group items.
   */
  addGroupItem (groupItems, groupItem) {
    groupItem['uuid'] = uuidv4();

    groupItems.push({
      data: groupItem
    });

    return groupItems;

  },

  /**
   * Check an element item from group before adding it to a group of items.
   *
   * @param {Array}     groupItems            The group items.
   * @param {Object}    elementItem           The element item object.
   * @param {String}    elementType         The group item type.
   * @param {String}    elementMachineName  The group item machine name.
   * @param {String}    itemType              The item type for the group items.
   * @param {Boolean|String}  elementTypeRef  The option to add a reference to
   *                                          the element machine name, using
   *                                          the element type.
   * @return {Array}                     The group items.
   */
  checkGroupElementItem (
    groupItems,
    elementItem,
    elementType,
    elementMachineName,
    itemType,
    elementTypeRef = false,
  ) {
    let itemToCheck = elementItem;

    if (
      module.exports.objectHasOwnProperties(itemToCheck, ['type']) &&
      itemToCheck.type === itemType
    ) {
      if (elementTypeRef !== false) {
        itemToCheck[elementType] = elementMachineName;
      }

      groupItems = module.exports.addGroupItem(groupItems, itemToCheck);
    }

    return groupItems;
  },

  /**
   * Check an item from group before adding it to a group of items.
   *
   * @param {Array}     groupItems       The group items.
   * @param {Object}    groupItem        The group item object.
   * @param {String}    itemType         The item type for the group items.
   * @param {Boolean}   hasData          The group item has a data sub-element.
   * @param {Boolean}   hasName          The group item has a name value.
   * @param {Boolean}   hasElementItems  The group item has element items (label).
   * @param {String}    elementItems     The element items label.
   * @param {Boolean|String}  elementTypeRef  The option to add a reference to
   *                                          the element machine name, using
   *                                          the element type.
   * @return {Array}                     The group items.
   */
  checkGroupItem (
    groupItems,
    groupItem,
    itemType,
    hasData = false,
    hasName = false,
    hasElementItems = false,
    elementItems = '',
    elementTypeRef = false,
  ) {
    let itemToCheck = groupItem;

    if (
      hasData &&
      module.exports.objectHasOwnProperties(itemToCheck, ['data'])
    ) {
      itemToCheck = itemToCheck['data'];
    }

    if (
      module.exports.objectHasOwnProperties(itemToCheck, ['type']) &&
      module.exports.objectHasOwnProperties(itemToCheck, ['machine_name'])
    ) {
      if (
        hasName &&
        module.exports.objectHasOwnProperties(itemToCheck, ['name']) &&
        itemToCheck.type === itemType
      ) {
        groupItems = module.exports.addGroupItem(groupItems, itemToCheck);
      } else if (
        hasElementItems &&
        module.exports.objectHasOwnProperties(itemToCheck, [elementItems]) &&
        module.exports.isArrayWithItems(itemToCheck[elementItems])
      ) {
        itemToCheck[elementItems].forEach(elementItem => {
          let
            elementType = itemToCheck['type'],
            elementMachineName = itemToCheck['machine_name'];

          groupItems = module.exports.checkGroupElementItem(
            groupItems,
            elementItem,
            elementType,
            elementMachineName,
            itemType,
            elementTypeRef
          );
        });
      }
    }

    return groupItems;
  },

  /**
   * Add item from letter group to group of items.
   *
   * @param {Object}    letterListSearch  The object used for collecting the
   *                                      letter list, containing:
   *                                      - @param {Array} letterList
   *                                      - @param {Array} letterFoundList
   * @param {Object}    letterGroupItem   The letter group item object.
   * @param {String}    firstLetter       The first letter to add.
   * @return {Object}                     The letterListSearch items.
   */
  addLetterGroupItem (letterListSearch, letterGroupItem, firstLetter) {
    letterListSearch.letterFoundList.push(firstLetter);
    letterListSearch.letterList.push({
      data: {
        name: firstLetter,
        letter: firstLetter,
        letter_slug: firstLetter.toLowerCase()
      }
    });

    return letterListSearch;
  },

  /**
   * Check an item from letter group before adding it to a group of items.
   *
   * @param {Object}    letterListSearch The object used for collecting the
   *                                     letter list, containing:
   *                                     - @param {Array} letterList
   *                                     - @param {Array} letterFoundList
   * @param {Object}    letterGroupItem  The letter group item object.
   * @param {String}    itemType         The item type for the letter group items.
   * @return {Object}                     The letterListSearch items.
   */
  checkLetterGroupItem (
    letterListSearch,
    letterGroupItem,
    itemType,
  ) {
    let itemToCheck = letterGroupItem;

    if (
      module.exports.objectHasOwnProperties(itemToCheck, ['data'])
    ) {
      itemToCheck = itemToCheck['data'];
    }

    if (
      module.exports.objectHasOwnProperties(itemToCheck, ['type']) &&
      module.exports.objectHasOwnProperties(itemToCheck, ['name']) &&
      itemToCheck.type === itemType
    ) {
      let
        letterGroupItem = module.exports.cloneObject(itemToCheck),
        letterName = letterGroupItem.name
      ;

      if (
        typeof letterName !== undefined &&
        letterName !== ''
      ) {
        let firstLetter = (letterGroupItem.name.match(/[a-zA-Z]/) || []).pop();

        if (firstLetter.match(/[a-z]/)) {
          firstLetter = firstLetter.toUpperCase();
        }

        if (!letterListSearch.letterFoundList.includes(firstLetter)) {
          letterListSearch = module.exports.addLetterGroupItem(letterListSearch, letterGroupItem, firstLetter)
        }
      }
    }

    return letterListSearch;
  },

  /**
   * Get file for fetching external data.
   *
   * @param {Object}   externalDomain  An externalPath object containing
   *                                     general info about the domain.
   * @param {Object}   externalTopic   An externalPath object containing
   *                                     specific info about the topic.
   * @return {string}                  A file for fetching external data.
   */
  getExternalDataIndexFile (externalDomain, externalTopic) {
    let
      dataIndexFile = '',
      mergedExternalPathData = {};

    if (
      module.exports.isObject(externalDomain) &&
      module.exports.isObject(externalTopic) &&
      (
        module.exports.objectHasOwnProperties(externalDomain, ['indexFile']) &&
        module.exports.objectHasOwnProperties(externalDomain, ['indexFileType'])
      )
    ) {
      mergedExternalPathData = module.exports.mergeObjects(externalDomain, externalTopic)

      dataIndexFile =
        mergedExternalPathData['indexFile'] + '.' +
        mergedExternalPathData['indexFileType'];
    }

    return dataIndexFile;
  },

  /**
   * Get file path for fetching external data.
   *
   * @param {Object}   externalFile  An externalPath object containing
   *                                  info about the file.
   * @return {string}                  A file for fetching external data.
   */
  getExternalDataFilePath (externalFile) {
    let
      dataFilePath = '',
      mergedExternalPathData = {};

    if (
      module.exports.isObject(externalFile) &&
      (
        module.exports.objectHasOwnProperties(externalFile, ['directory']) &&
        module.exports.objectHasOwnProperties(externalFile, ['file']) &&
        module.exports.objectHasOwnProperties(externalFile, ['fileType'])
      )
    ) {
      dataFilePath =
        externalFile['directory'] + '/' +
        externalFile['file'] + '.' +
        externalFile['fileType'];
    }

    return dataFilePath;
  },

  /**
   * Get domain for fetching external data.
   *
   * @param {Object}   externalDomain  An externalPath object containing
   *                                     general info about the domain.
   * @param {Object}   externalTopic   An externalPath object containing
   *                                     specific info about the topic.
   * @return {string}                  A domain uri for fetching external data.
   */
  getExternalDataDomain (externalDomain, externalTopic) {
    let
      dataIndexDomain = '',
      mergedExternalPathData = {};

    if (
      module.exports.isObject(externalDomain) &&
      module.exports.isObject(externalTopic) &&
      (
        module.exports.objectHasOwnProperties(externalDomain, ['schema']) &&
        module.exports.objectHasOwnProperties(externalDomain, ['domain']) &&
        module.exports.objectHasOwnProperties(externalDomain, ['subDomain'])
      ) &&
      (
        module.exports.objectHasOwnProperties(externalTopic, ['topicSubDomain'])
      )
    ) {
      mergedExternalPathData = module.exports.mergeObjects(externalDomain, externalTopic)

      dataIndexDomain =
        mergedExternalPathData['schema'] + '://' +
        mergedExternalPathData['topicSubDomain'] + '.' +
        mergedExternalPathData['subDomain'] + '.' +
        mergedExternalPathData['domain'] + '.' +
        mergedExternalPathData['tld']
    }

    return dataIndexDomain;
  },

  /**
   * Get path for fetching external data.
   *
   * @param {String}   externalDomainUri  An external domain uri.
   * @param {String}   externalFilePath   A path on a domain to a file.
   * @return {string}                  A uri for fetching external data.
   */
  getExternalDataUri(externalDomainUri, externalFilePath) {
    let dataIndexUri = '';

    if (
      externalDomainUri !== '' &&
      externalFilePath !== ''
    ) {

      dataIndexUri =
        externalDomainUri+ '/' +
        externalFilePath;
    }

    return dataIndexUri;
  },

  /**
   * Get path for fetching external data.
   *
   * @param {Object}   externalDomain  An externalPath object containing
   *                                     general info about the domain.
   * @param {Object}   externalTopic   An externalPath object containing
   *                                     specific info about the topic.
   * @return {string}                  A uri for fetching external data.
   */
  getExternalDataIndexUri(externalDomain, externalTopic) {
    let
      dataIndexUri = '',
      dataIndexDomain = module.exports.getExternalDataDomain(externalDomain, externalTopic),
      dataIndexFile = module.exports.getExternalDataIndexFile(externalDomain, externalTopic)
    ;

    if (
      dataIndexDomain !== '' &&
      dataIndexFile !== ''
    ) {
      dataIndexUri = module.exports.getExternalDataUri(dataIndexDomain, dataIndexFile);
    }

    return dataIndexUri;
  },

  /**
   * Get path for fetching external data.
   *
   * @param {Object}   externalFile    An externalPath object containing
   *                                     specific info about the file.
   * @return {string}                  A uri for fetching external data.
   */
  getExternalFileUri(externalFile) {
    let
      dataFileUri = '',
      dataFileDomain = '',
      dataFilePath = module.exports.getExternalDataFilePath(externalFile)
    ;

    if (module.exports.objectHasOwnProperties(externalFile, ['fullDomain'])) {
      dataFileDomain = externalFile["fullDomain"]
    }

    if (
      dataFileDomain !== '' &&
      dataFilePath !== ''
    ) {
      dataFileUri = module.exports.getExternalDataUri(dataFileDomain, dataFilePath);
    }

    return dataFileUri;
  },

  /**
   * Get agent options used to fetch external data.
   *
   * @param {String}    uriProtocol    The protocol for the URI.
   * @return {Object}                  The fetch agent options.
   */
  getFetchAgentOptions(uriProtocol) {
    const
      httpAgent = new http.Agent({
        keepAlive: true
      }),
      httpsAgent = new https.Agent({
        keepAlive: true
      });

    let fetchOptions = {
      options: null,
    }

    if (uriProtocol === 'http:') {
      fetchOptions['options'] = httpAgent;
    } else {
      fetchOptions['options'] = httpsAgent;
    }

    return fetchOptions;
  },

  /**
   * Fetch an external JSON file with a URI.
   *
   * @param {String}       fetchURI      The URI to fetch the JSON.
   * @param {Object}       fetchOptions  The options for fetching the JSON.
   * @return {Promise}                   The external JSON Promise.
   */
  async fetchExternalData(fetchURI, fetchOptions= {}) {
    let dataFetched = null;

    await fetch(fetchURI, fetchOptions)
      .then(response => response.json())
      .then(fetchedJSON => {
        dataFetched = fetchedJSON;
      })
      .catch(console.error);

    return dataFetched;
  },

  /**
   * Add item from level to collection of items.
   *
   * @param {Array}        collectionItems    The collection items.
   * @param {Object}       levelItem          The level item object.
   * @param {String}       itemType           The collection item type.
   * @return {Array}                          The collection items.
   */
  addLevelItem (collectionItems, levelItem, itemType) {
    if (
      module.exports.objectHasOwnProperties(levelItem, ['type']) &&
      levelItem.type === itemType
    ) {
      levelItem['uuid'] = uuidv4();

      collectionItems.push({
        data: levelItem
      });
    }

    return collectionItems;
  },

  /**
   * Get the values for the level in an array.
   *
   * @param {Object|Array} levelToSearch        The level to search.
   * @param {Boolean}      checkForLevelArray   The option to check if the level
   *                                            to search is in an array.
   * @return {Array}                            The level values.
   */
  getLevelValues(levelToSearch, checkForLevelArray) {
    let levelValues = [];

    if (checkForLevelArray) {
      levelValues = module.exports.objectValueSeeker(levelToSearch);
    } else if (module.exports.isObject(levelToSearch)) {
      levelValues = Object.values(levelToSearch);
    }

    return levelValues;
  },

  /**
   * See if this level value should be checked for an array.
   *
   * @param {Array|Object}  levelValue         The level value.
   * @return {Boolean}                         The option to check if the level
   *                                            to search is in an array.
   */
  getCheckForLevelArray(levelValue) {
    let checkForLevelArray = false;

    if (module.exports.isObject(levelValue)) {
      checkForLevelArray = false;
    } else if (module.exports.isArray(levelValue)) {
      checkForLevelArray = true;
    }

    return checkForLevelArray;
  },

  /**
   * See if level values should be checked for this level.
   *
   * @param {Array}        levelValues         The level values.
   * @param {Boolean}      checkForLevelArray  The option to check if the level
   *                                            to search is in an array.
   * @return {Boolean}                         The option to check level values.
   */
  getCheckLevelValues(levelValues, checkForLevelArray) {
    let checkLevelValues = false;

    if (checkForLevelArray) {
      if (module.exports.isArrayWithItems(levelValues)) {
        checkLevelValues = true;
      }
    } else {
      checkLevelValues = true;
    }

    return checkLevelValues;
  },

  /**
   * Check if this level value has an array with multiple items.
   *
   * @param {Array|Object}  levelValue         The level value.
   * @return {Boolean}                         The level has an array with multiple items.
   */
  getCheckLevelForMultipleItems(levelValue) {
    let checkLevelForMultipleItems = false;

    if (module.exports.isObject(levelValue)) {
      checkLevelForMultipleItems = false;
    } else if (module.exports.isArrayWithMultipleItems(levelValue)) {
      checkLevelForMultipleItems = true;
    }

    return checkLevelForMultipleItems;
  },

  /**
   * See if level values should be checked for this level.
   *
   * @param {Array|Object} levelValues                 The level values.
   * @param {Boolean}      checkLevelForMultipleItems  The option to check if the level
   *                                                    has multiple items.
   * @return {Boolean}                                 The level has multiple items
   */
  checkLevelForMultipleItems(levelValues, checkLevelForMultipleItems) {
    let levelHasMultipleItems = false;

    if (checkLevelForMultipleItems) {
      if (module.exports.isArrayWithMultipleItems(levelValues)) {
        levelHasMultipleItems = true;
      }
    } else {
      levelHasMultipleItems = true;
    }

    return levelHasMultipleItems;
  },

  /**
   * Recursively search through levels until reaching target level, then add
   * items to collection.
   *
   * @param {Array}        collectionItems    The collection items.
   * @param {Object|Array} levelToSearch      The level to search.
   * @param {Number}       currentLevel       The current level being searched.
   * @param {Number}       targetLevel        The target level to find items.
   * @param {String}       itemType           The collection item type.
   * @param {Boolean}      checkForLevelArray  The option to check if the level
   *                                            to search is in an array.
   * @return {Array}                          The collection items.
   */
  levelItemSeeker(collectionItems, levelToSearch, currentLevel, targetLevel, itemType, checkForLevelArray= false) {
    let
      levelValues = module.exports.getLevelValues(levelToSearch, checkForLevelArray),
      checkLevelValues = module.exports.getCheckLevelValues(levelValues, checkForLevelArray);

    if (checkLevelValues) {
      levelValues.forEach(levelValue => {
        if (currentLevel === targetLevel) {
          let levelItem = module.exports.copyObject(levelValue);
          collectionItems = module.exports.addLevelItem(collectionItems, levelItem, itemType);
        } else {
          let checkForLevelArray = module.exports.getCheckForLevelArray(levelValue);

          collectionItems = module.exports.levelItemSeeker(collectionItems, levelValue, currentLevel + 1, targetLevel, itemType, checkForLevelArray);
        }
      });
    }

    return collectionItems;
  },

  /**
   * Add item to nested property array.
   *
   * @param {Array}  nestedPropertyArrayNotation   The array notation to a nested property.
   *                                               - {String} propertyKey
   * @param {String|Number} propertyKey                   The key for a nested property.
   *
   * @return {Array}                              The array notation to a nested property.
   */
  addNestedPropertyArrayItem(nestedPropertyArrayNotation, propertyKey) {
    if (
      module.exports.isArray(nestedPropertyArrayNotation) &&
      propertyKey !== ''
    ) {
      nestedPropertyArrayNotation.push(propertyKey);
    }

    return nestedPropertyArrayNotation;
  },

  /**
   * Remove item from nested property array.
   *
   * @param {Array}  nestedPropertyArrayNotation   The array notation to a nested property.
   *                                               - {String} propertyKey
   *
   * @return {Array}                              The array notation to a nested property.
   */
  removeNestedPropertyArrayItem(nestedPropertyArrayNotation) {
    if (nestedPropertyArrayNotation.length > 0) {
      nestedPropertyArrayNotation.slice(0, -1);
    }

    return nestedPropertyArrayNotation;
  },

  /**
   * Add directory from index to external data.
   *
   * @param {Array}  nestedPropertyArrayNotation   The array notation to a nested property.
   *                                               - {String} propertyKey
   *
   * @return {String}                              The dot notation to a nested property.
   */
  getNestedPropertyDotNotation(nestedPropertyArrayNotation) {
    let nestedPropertyDotNotation = '';

    if (module.exports.isArrayWithItems(nestedPropertyArrayNotation)) {
      nestedPropertyArrayNotation.forEach((propertyKey, index) => {
        if (index !== 0) {
          nestedPropertyDotNotation = nestedPropertyDotNotation + '.';
        }

        nestedPropertyDotNotation = nestedPropertyDotNotation + propertyKey;
      });
    }

    return nestedPropertyDotNotation;
  },

  /**
   * Get the property key for the level item
   *
   * @param {Object}    levelItem             The level item object.
   * @return {String}                         The level directory property key.
   */
  getLevelItemPropertyKey(levelItem) {
    let levelDirectoryPropertyKey = '';

    if (
      module.exports.objectHasOwnProperties(levelItem, ['name']) &&
      levelItem['name'] !== ''
    ) {
      levelDirectoryPropertyKey = levelItem['name'];
    }

    if (levelDirectoryPropertyKey.endsWith('.json')) {
      levelDirectoryPropertyKey = levelDirectoryPropertyKey.slice(0, -5);
    }

    return levelDirectoryPropertyKey;
  },

  /**
   * Get the directory children for the level item
   *
   * @param {Object}    levelItem             The level item object.
   * @param {String}    childItemsKey         The key for an array of child items.
   * @param {String}    directoryTypeKey      The type key for a directory.
   * @return {Object|Array}                   The level directory children.
   */
  getLevelItemDirectoryChildren(levelItem, childItemsKey, directoryTypeKey) {
    let levelDirectoryChildren = null;

    if (
      module.exports.objectHasOwnProperties(levelItem, ['type']) &&
      module.exports.objectHasOwnProperties(levelItem, [childItemsKey]) &&
      levelItem['type'] === directoryTypeKey &&
      (
        module.exports.isObject(levelItem[childItemsKey]) ||
        module.exports.isArrayWithItems(levelItem[childItemsKey])
      )
    ) {
      levelDirectoryChildren = levelItem[childItemsKey];
    }

    return levelDirectoryChildren;
  },

  /**
   * Add level directory from index to external data.
   *
   * @param {Object}    externalData          The external data.
   * @param {Array}     externalDataItemPath  The path to where this item data
   *                                          should be placed in externalData.
   *                                          - e.g ['a', 'b', 1, 'c']
   * @param {Object}    levelItem             The level item object.
   * @return {Object}                         The external data.
   */
  addLevelArrayItem(externalData, externalDataItemPath, levelItem) {
    let
      levelArrayItemData = {},
      levelArrayItemPropertyPath = module.exports.getNestedPropertyDotNotation(externalDataItemPath);
    // console.log('array item data being added');
    // console.log(levelArrayItemData)
    // console.log('array item being added at this path:');
    // console.log(levelArrayItemPropertyPath);

    nestedProperty.set(externalData, levelArrayItemPropertyPath, levelArrayItemData);

    // Add array item property path if it does not already exist.
    if (nestedProperty.has(externalData, levelArrayItemPropertyPath)) {
      nestedProperty.set(externalData, levelArrayItemPropertyPath, levelArrayItemData);
    }

    return externalData;
  },

  /**
   * Add level directory from index to external data.
   *
   * @param {Object}    externalData          The external data.
   * @param {Array}     externalDataItemPath  The path to where this item data
   *                                          should be placed in externalData.
   *                                          - e.g ['a', 'b', 1, 'c']
   * @param {Object}    levelItem             The level item object.
   * @param {String}    childItemsKey         The key for an array of child items.
   * @param {String}    directoryTypeKey      The type key for a directory.
   * @return {Object}                         The external data.
   */
  addLevelDirectory(externalData, externalDataItemPath, levelItem, childItemsKey, directoryTypeKey) {
    let directoryLevelData = {},
      directoryLevelPropertyPath = module.exports.getNestedPropertyDotNotation(externalDataItemPath);
    // console.log('adding level directory');
    // console.log('directory level property path');
    // console.log(directoryLevelPropertyPath);

    if (
      module.exports.objectHasOwnProperties(levelItem, ['type']) &&
      module.exports.objectHasOwnProperties(levelItem, ['name']) &&
      module.exports.objectHasOwnProperties(levelItem, [childItemsKey]) &&
      levelItem['type'] === directoryTypeKey &&
      levelItem['name'] !== ''
    ) {
      // console.log('directory has required properties');
      //
      // console.log('directory level data to add');
      // console.log(directoryLevelData);
      //
      // console.log('directory level data being added at this path:');
      // console.log(directoryLevelPropertyPath);

      // Add directory property path if it does not already exist.
      if (nestedProperty.has(externalData, directoryLevelPropertyPath)) {
        nestedProperty.set(externalData, directoryLevelPropertyPath, directoryLevelData);
      }
    }

    return externalData;
  },

  /**
   * Add level data from index to external data.
   *
   * @param {Object}    externalData          The external data.
   * @param {String}    externalDomainUri     An external domain uri.
   * @param {String}    externalDomainSchema  An external domain schema.
   * @param {Array}     externalDataItemPath  The path to where this item data
   *                                          should be placed in externalData.
   *                                          - e.g ['a', 'b', 1, 'c']
   * @param {Object}    levelItem             The level item object.
   * @param {String}    fileTypeKey           The type key for a file.

   * @return {Object}                         The external data.
   */
  async addFileLevelData(externalData, externalDomainUri, externalDomainSchema, externalDataItemPath, levelItem, fileTypeKey) {
    let
      fileLevelData = {},
      fileLevelPropertyPath = module.exports.getNestedPropertyDotNotation(externalDataItemPath);

    if (
      module.exports.objectHasOwnProperties(levelItem, ['type']) &&
      module.exports.objectHasOwnProperties(levelItem, ['name']) &&
      module.exports.objectHasOwnProperties(levelItem, ['path']) &&
      levelItem['type'] === fileTypeKey &&
      levelItem['path'] !== '' &&
      levelItem['name'] !== ''
    ) {
      let
        levelItemDataUri = module.exports.getExternalDataUri(externalDomainUri, levelItem['path']),
        levelItemDataFetchOptions = module.exports.getFetchAgentOptions(externalDomainSchema);

      fileLevelData = await module.exports.fetchExternalData(levelItemDataUri, levelItemDataFetchOptions);
      nestedProperty.set(externalData, fileLevelPropertyPath, fileLevelData);
    }

    return externalData;
  },

  /**
   * Check an external data level with file data.
   *
   * @param {Object}        externalData            The external data.
   * @param {String}        externalDomainUri       An external domain uri.
   * @param {String}        externalDomainSchema    An external domain schema.
   * @param {Array}         externalDataItemPath    The path to where this item
   *                                                data should be placed in externalData.
   *                                                - e.g ['a', 'b', 1, 'c']
   * @param {Array|Object}  levelValue        The external data level.
   * @param {String}        fileTypeKey       The type key for a file.
   *
   * @return {Object}                         The external data structure.
   */
  async checkLevelFile(
    externalData,
    externalDomainUri,
    externalDomainSchema,
    externalDataItemPath,
    levelValue,
    fileTypeKey
  ) {
    let
      levelFileDataItem = module.exports.copyObject(levelValue),
      filePropertyKey = module.exports.getLevelItemPropertyKey(levelFileDataItem),
      levelFileDataItemPath = module.exports.copyObject(externalDataItemPath)
    ;

    // console.log('add file key ' + levelFileDataItemPropertyKey + ' to property path');
    levelFileDataItemPath = module.exports.addNestedPropertyArrayItem(levelFileDataItemPath, filePropertyKey);
    // console.log(levelFileDataItemPath);

    // console.log('file data item path');
    // console.log(levelFileDataItemPath);
    nestedProperty.set(externalData, levelFileDataItemPath, {});
    // console.log('set blank object as placeholder for file data');
    // console.log('then add file level data');
    externalData = await module.exports.addFileLevelData(externalData, externalDomainUri, externalDomainSchema, levelFileDataItemPath, levelFileDataItem, fileTypeKey);
    // console.log('file level data added');

    return externalData;
  },

  /**
   * Check an external data level with directory data.
   *
   * @param {Object}        externalData            The external data.
   * @param {String}        externalDomainUri       An external domain uri.
   * @param {String}        externalDomainSchema    An external domain schema.
   * @param {Array}         externalDataItemPath    The path to where this item
   *                                                data should be placed in externalData.
   *                                                - e.g ['a', 'b', 1, 'c']
   * @param {Array|Object}  levelValue        The external data level.
   * @param {String}        childItemsKey     The key for an array of child items.
   * @param {String}        directoryTypeKey  The type key for a directory.
   * @param {Number}        maxDataItemsPerLevel  The maximum number of data items per level.
   *
   * @return {Object}                         The external data structure.
   */
  async checkLevelDirectory(
    externalData,
    externalDomainUri,
    externalDomainSchema,
    externalDataItemPath,
    levelValue,
    childItemsKey,
    directoryTypeKey,
    maxDataItemsPerLevel
  ) {
    let
      directoryItem = module.exports.copyObject(levelValue),
      directoryChildren = module.exports.getLevelItemDirectoryChildren(directoryItem, childItemsKey, directoryTypeKey),
      directoryDataItemPath = module.exports.copyObject(externalDataItemPath),
      directoryPropertyKey = module.exports.getLevelItemPropertyKey(directoryItem)
    ;

    directoryDataItemPath = module.exports.addNestedPropertyArrayItem(directoryDataItemPath, directoryPropertyKey);

    // console.log('directory data item path');
    // console.log(directoryDataItemPath);
    externalData = module.exports.addLevelDirectory(externalData, externalDataItemPath, directoryItem, childItemsKey, directoryTypeKey);
    externalData = await module.exports.externalDataSeeker(externalData, externalDomainUri, externalDomainSchema, directoryChildren, maxDataItemsPerLevel, externalDataItemPath);

    return externalData;
  },

  /**
   * Check an external data level with array data.
   *
   * @param {Object}        externalData            The external data.
   * @param {String}        externalDomainUri       An external domain uri.
   * @param {String}        externalDomainSchema    An external domain schema.
   * @param {Array}         externalDataItemPath    The path to where this item
   *                                                data should be placed in externalData.
   *                                                - e.g ['a', 'b', 1, 'c']
   * @param {Array}         levelValues       The external data leve values.
   * @param {String}        childItemsKey     The key for an array of child items.
   * @param {String}        directoryTypeKey  The type key for a directory.
   * @param {String}        fileTypeKey       The type key for a file.
   * @param {Number}        maxDataItemsPerLevel  The maximum number of data items per level.
   *
   * @return {Object}                         The external data structure.
   */
  async checkLevelItem(
    externalData,
    externalDomainUri,
    externalDomainSchema,
    externalDataItemPath,
    levelValues,
    childItemsKey,
    directoryTypeKey,
    fileTypeKey,
    maxDataItemsPerLevel
  ) {
    let
      levelItem = module.exports.copyObject(levelValues),
      levelItemPath = module.exports.copyObject(externalDataItemPath)
    ;

    if (
      module.exports.objectHasOwnProperties(levelItem, ['type']) &&
      levelItem['type'] === fileTypeKey
    ) {
      // console.log('check level file');
      externalData = await module.exports.checkLevelFile(externalData, externalDomainUri, externalDomainSchema, levelItemPath, levelItem, fileTypeKey);
    } else if (
      module.exports.objectHasOwnProperties(levelItem, ['type']) &&
      levelItem['type'] === directoryTypeKey &&
      module.exports.objectHasOwnProperties(levelItem, [childItemsKey])
    ) {
      // console.log('check level directory');
      externalData = await module.exports.checkLevelDirectory(externalData, externalDomainUri, externalDomainSchema, levelItemPath, levelItem, childItemsKey, directoryTypeKey, maxDataItemsPerLevel);
    }

    return externalData;
  },

  /**
   * Check an external data level with array item data.
   *
   * @param {Object}        externalData            The external data.
   * @param {String}        externalDomainUri       An external domain uri.
   * @param {String}        externalDomainSchema    An external domain schema.
   * @param {Array}         externalDataItemPath    The path to where this item
   *                                                data should be placed in externalData.
   *                                                - e.g ['a', 'b', 1, 'c']
   * @param {Array}         levelValues       The external data level values.
   * @param {Number}        levelIndex        The index for the level item.
   * @param {String}        childItemsKey     The key for an array of child items.
   * @param {String}        directoryTypeKey  The type key for a directory.
   * @param {String}        fileTypeKey       The type key for a file.
   * @param {Number}        maxDataItemsPerLevel  The maximum number of data items per level.
   *
   * @return {Object}                         The external data structure.
   */
  async checkLevelArrayItem(
    externalData,
    externalDomainUri,
    externalDomainSchema,
    externalDataItemPath,
    levelValues,
    levelIndex,
    childItemsKey,
    directoryTypeKey,
    fileTypeKey,
    maxDataItemsPerLevel
  ) {
    let
      arrayItem = module.exports.copyObject(levelValues),
      arrayItemPath = module.exports.cloneObject(externalDataItemPath),
      arrayIndex = levelIndex
    ;

    // console.log('checking array item');
    // console.log('path for array items');
    // console.log(externalDataItemPath);
    arrayItemPath = module.exports.addNestedPropertyArrayItem(arrayItemPath, arrayIndex);
    // console.log('path for this array item (using this index: [' + levelIndex + ']');
    // console.log(arrayItemPath);

    // console.log('add level array item');
    externalData = module.exports.addLevelArrayItem(externalData, arrayItemPath, arrayItem);
    // console.log('finished adding array item');
    //
    // console.log('check array item for additional nested levels');
    externalData = await module.exports.checkLevel(externalData, externalDomainUri, externalDomainSchema, arrayItemPath, arrayItem, childItemsKey, directoryTypeKey, fileTypeKey, maxDataItemsPerLevel);
    // console.log('finished checking this array item');

    return externalData;
  },

  /**
   * Check an external data level with array data.
   *
   * @param {Object}        externalData            The external data.
   * @param {String}        externalDomainUri       An external domain uri.
   * @param {String}        externalDomainSchema    An external domain schema.
   * @param {Array}         externalDataItemPath    The path to where this item
   *                                                data should be placed in externalData.
   *                                                - e.g ['a', 'b', 1, 'c']
   * @param {Array}         levelValues       The external data leve values.
   * @param {String}        childItemsKey     The key for an array of child items.
   * @param {String}        directoryTypeKey  The type key for a directory.
   * @param {String}        fileTypeKey       The type key for a file.
   * @param {Number}        maxDataItemsPerLevel  The maximum number of data items per level.
   *
   * @return {Object}                         The external data structure.
   */
  async checkLevelArray(
    externalData,
    externalDomainUri,
    externalDomainSchema,
    externalDataItemPath,
    levelValues,
    childItemsKey,
    directoryTypeKey,
    fileTypeKey,
    maxDataItemsPerLevel
  ) {
    let
      levelArray = {
        externalData: module.exports.cloneObject(externalData),
        externalDomainUri: externalDomainUri,
        externalDomainSchema: externalDomainSchema,
        childItemsKey: childItemsKey,
        directoryTypeKey: directoryTypeKey,
        fileTypeKey: fileTypeKey,
        maxDataItemsPerLevel: maxDataItemsPerLevel,
        arrayItems: module.exports.cloneObject(levelValues),
        arrayItemsPath: module.exports.cloneObject(externalDataItemPath),
        arrayItemsPathDotNotation: null,
        arrayItemsData: [],
        totalArrayItems: null,
        currentArrayItemIndex: null,
        previousArrayItemIndex: null,
        mostRecentArrayItemIndexed: null,
        totalItemsIndexed: null,
        getArrayItemsPathDotNotation: () => {
          return levelArray.arrayItemsPathDotNotation;
        },
        setArrayItemsPathDotNotation: (arrayItemsPath = levelArray.arrayItemsPath) => {
          levelArray.arrayItemsPathDotNotation = module.exports.getNestedPropertyDotNotation(arrayItemsPath);
        },
        getTotalArrayItems: () => {
          return levelArray.totalArrayItems;
        },
        setTotalArrayItems: (arrayItems = levelArray.arrayItems) => {
          levelArray.totalArrayItems = arrayItems.length;
        },
        getTotalItemsIndexed: () => {
          return levelArray.totalItemsIndexed;
        },
        setTotalItemsIndexed: (totalItemsIndexed) => {
          levelArray.totalItemsIndexed = totalItemsIndexed;
        },
        getCurrentArrayItemIndex: () => {
          return levelArray.currentArrayItemIndex;
        },
        setCurrentArrayItemIndex: (currentItemIndex = 0) => {
          levelArray.currentArrayItemIndex = currentItemIndex;
        },
        getPreviousArrayItemIndex: () => {
          return levelArray.previousArrayItemIndex;
        },
        setMostRecentArrayItemIndexed: (mostRecentArrayItemIndexed = -1) => {
          levelArray.mostRecentArrayItemIndexed = mostRecentArrayItemIndexed;
        },
        getMostRecentArrayItemIndexed: () => {
          return levelArray.mostRecentArrayItemIndexed;
        },
        setPreviousArrayItemIndex: (previousItemIndex = levelArray.getCurrentArrayItemIndex() - 1) => {
          levelArray.previousArrayItemIndex = previousItemIndex;
        },
        getLevelArrayExternalData: () => {
          return levelArray.externalData;
        },
        setLevelArrayExternalData: (data) => {
          levelArray.externalData = data;
        },
        getArrayItemData: (
          arrayItemIndex = levelArray.getCurrentArrayItemIndex(),
          externalData = levelArray.getLevelArrayExternalData(),
          arrayItemsPath = module.exports.cloneObject(levelArray.arrayItemsPath)
          ) =>{
          let
            arrayItemPath = module.exports.addNestedPropertyArrayItem(arrayItemsPath, arrayItemIndex),
            arrayItemPathDotNotation = module.exports.getNestedPropertyDotNotation(arrayItemPath);
          ;

          return nestedProperty.get(externalData, arrayItemPathDotNotation);
        },
        getArrayItemsData: () => {
          return levelArray.arrayItemsData;
        },
        setArrayItemsData: (arrayItemData) => {
          levelArray.arrayItemsData.push(arrayItemData);
        },
        collectArrayItemPathData: (
          arrayItemData,
          collectedArrayItemsData,
          externalData,
          arrayItemsPathDotNotation
        ) => {
          let arrayItemsPathData = levelArray.getArrayItemsPathData(externalData, arrayItemsPathDotNotation);

          // console.log('updating array items path data');
          // console.log('data before update');
          // console.log(arrayItemsPathData);
          //
          // console.log('data merged in');
          // console.log(arrayItemData);

          collectedArrayItemsData = {
            ...collectedArrayItemsData,
            ...arrayItemData
          };

          // console.log('merged data');
          // console.log(collectedArrayItemsData);

          return collectedArrayItemsData;
        },
        getArrayItemsPathData: (
          externalData = levelArray.getLevelArrayExternalData(),
          arrayItemsPathDotNotation = levelArray.getArrayItemsPathDotNotation()
        ) => {
          return nestedProperty.get(externalData, arrayItemsPathDotNotation);
        },
        setArrayItemsPathData: (
          arrayItemsData = levelArray.getArrayItemsData(),
          externalData = levelArray.getLevelArrayExternalData(),
          arrayItemsPathDotNotation = levelArray.getArrayItemsPathDotNotation()
        ) => {
          let
            updatedExternalData = module.exports.cloneObject(externalData),
            collectedArrayItemsData = {}
          ;
          // console.log('updating external data with data from all array items');
          // console.log('all array items data');
          // console.log(arrayItemsData);
          // console.log('place data at this point in external data');
          // console.log(arrayItemsPathDotNotation);

          arrayItemsData.forEach(arrayItemData => {
            collectedArrayItemsData = levelArray.collectArrayItemPathData(arrayItemData, collectedArrayItemsData, updatedExternalData, arrayItemsPathDotNotation);
          });
          // console.log('collected array items data');
          // console.log(collectedArrayItemsData);

          nestedProperty.set(updatedExternalData, arrayItemsPathDotNotation, collectedArrayItemsData);
          levelArray.setLevelArrayExternalData(updatedExternalData);
        },
        init: (arrayItems = levelArray.totalArrayItems) => {
          levelArray.setTotalArrayItems(arrayItems);
          levelArray.setCurrentArrayItemIndex();
          levelArray.setPreviousArrayItemIndex();
          levelArray.setMostRecentArrayItemIndexed();
          levelArray.setTotalItemsIndexed();
          levelArray.setArrayItemsPathDotNotation();
        },
        updateLevelArrayExternalData: async (arrayItem, arrayItemIndex) => {
          // console.log('updating external data bt checking array item');
          // console.log('checking array item with index [' + arrayItemIndex + ']');
          return await module.exports.checkLevelArrayItem(
            levelArray.getLevelArrayExternalData(),
            levelArray.externalDomainUri,
            levelArray.externalDomainSchema,
            levelArray.arrayItemsPath,
            arrayItem,
            arrayItemIndex,
            levelArray.childItemsKey,
            levelArray.directoryTypeKey,
            levelArray.fileTypeKey,
            levelArray.maxDataItemsPerLevel
          );
        },
        forArrayItem: async (arrayItem, arrayItemIndex) => {
          // console.log('for array item ' + arrayItemIndex);
          levelArray.setCurrentArrayItemIndex(arrayItemIndex);

          let
            updatedExternalData = await levelArray.updateLevelArrayExternalData(arrayItem, arrayItemIndex),
            arrayItemData = await levelArray.getArrayItemData(arrayItemIndex, updatedExternalData);

          // console.log('array item data');
          // console.log(arrayItemData);
          levelArray.setArrayItemsData(arrayItemData);
          levelArray.setPreviousArrayItemIndex();

          return arrayItemIndex;
        },
        forArrayItems: async (arrayItems) => {
          levelArray.init(arrayItems);
          // console.log('for array items');

          for (const arrayItem of arrayItems) {
            let
              arrayItemIndex = arrayItems.indexOf(arrayItem),
              arrayItemIndexed = null;

            if (arrayItemIndex < levelArray.maxDataItemsPerLevel) {
              arrayItemIndexed = await levelArray.forArrayItem(arrayItem, arrayItemIndex);
              levelArray.setMostRecentArrayItemIndexed(arrayItemIndexed);
            }
          }

          return levelArray.getTotalArrayItems();
        },
        updateAfterItemsChecked: async(arrayItems  = levelArray.arrayItems) => {
          const
            arrayItemsChecked = await levelArray.forArrayItems(arrayItems),
            arrayItemsData = levelArray.getArrayItemsData();
          // console.log('data from all items in array');
          // console.log(arrayItemsData);

          levelArray.setTotalItemsIndexed(arrayItemsChecked);
          levelArray.setArrayItemsPathData(arrayItemsData);

          return levelArray.getLevelArrayExternalData();
        }
      }
    ;

    return await levelArray.updateAfterItemsChecked();
  },

  /**
   * Check an external data level.
   *
   * @param {Object}        externalData            The external data.
   * @param {String}        externalDomainUri       An external domain uri.
   * @param {String}        externalDomainSchema    An external domain schema.
   * @param {Array}         externalDataItemPath    The path to where this item
   *                                                data should be placed in externalData.
   *                                                - e.g ['a', 'b', 1, 'c']
   * @param {Array}         levelValues       The external data leve values.
   * @param {String}        childItemsKey     The key for an array of child items.
   * @param {String}        directoryTypeKey  The type key for a directory.
   * @param {String}        fileTypeKey       The type key for a file.
   * @param {Number}        maxDataItemsPerLevel  The maximum number of data items per level.
   *
   * @return {Object}                         The external data structure.
   */
  async checkLevel(
    externalData,
    externalDomainUri,
    externalDomainSchema,
    externalDataItemPath,
    levelValues,
    childItemsKey,
    directoryTypeKey,
    fileTypeKey,
    maxDataItemsPerLevel
  ) {
    let checkForLevelArray = module.exports.getCheckForLevelArray(levelValues);

    // console.log('check level');
    // console.log('current path');
    // console.log(externalDataItemPath);
    // console.log('data before checking level');
    // console.log(externalData);
    if (checkForLevelArray) {
      // console.log('check level array');
      externalData = await module.exports.checkLevelArray(externalData, externalDomainUri, externalDomainSchema, externalDataItemPath, levelValues, childItemsKey, directoryTypeKey, fileTypeKey, maxDataItemsPerLevel);
    } else {
      // console.log('check level item');
      externalData = await module.exports.checkLevelItem(externalData, externalDomainUri, externalDomainSchema, externalDataItemPath, levelValues, childItemsKey, directoryTypeKey, fileTypeKey, maxDataItemsPerLevel);
    }
    // console.log('data after checking level');
    // console.log(externalData);
    // console.log('path for level checked');
    // console.log(externalDataItemPath);

    return externalData;
  },

  /**
   * Recursively search through an external data index, building an external
   * data structure, using directory information and fetching additional JSON
   * data as necessary.
   *
   * @param {Object}       externalData            The external data structure.
   * @param {String}       externalDomainUri       An external domain uri.
   * @param {String}       externalDomainSchema    An external domain schema.
   * @param {Object|Array} externalDataIndexLevel  The external data index level.
   * @param {Number}       maxDataItemsPerLevel    The maximum number of data items per level.
   * @param {Array}        externalDataItemPath    The path to where this item data
   *                                               should be placed in externalData.
   *                                               - e.g ['a', 'b', 1, 'c']
   * @param {String}       childItemsKey           The key for an array of child items.
   * @param {String}       directoryTypeKey        The type key for a directory.
   * @param {String}       fileTypeKey             The type key for a file.
   * @return {Object}                              The external data structure.
   */
  async externalDataSeeker(externalData, externalDomainUri, externalDomainSchema, externalDataIndexLevel,  maxDataItemsPerLevel, externalDataItemPath = [], childItemsKey= 'children', directoryTypeKey = 'directory', fileTypeKey= 'file') {
    let levelValues = module.exports.cloneObject(externalDataIndexLevel);

    externalData = await module.exports.checkLevel(externalData, externalDomainUri, externalDomainSchema, externalDataItemPath, levelValues, childItemsKey, directoryTypeKey, fileTypeKey, maxDataItemsPerLevel);

    return externalData;
  },

  /**
   * Process externalDataIndex in order to fetch additional nested data and
   * build an externalData structure.
   *
   * @param {Object}    externalDataIndex     The externalDataIndex to process.
   * @param {String}    externalDomainUri     An external domain uri.
   * @param {String}    externalDomainSchema  An external domain schema.
   * @param {Number}    maxDataItemsPerLevel  The maximum number of data items per level.
   * @return {Object}                         The external data.
   */
  async processExternalData(externalDataIndex, externalDomainUri, externalDomainSchema, maxDataItemsPerLevel) {
    let externalData = {};

    externalData = await module.exports.externalDataSeeker(externalData, externalDomainUri, externalDomainSchema, externalDataIndex, maxDataItemsPerLevel);

    return externalData;
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
   * Filters a list of items in a directory by letter.
   *
   * @param {Array}      directoryItems      The directory items.
   * @param {String}     letter_slug         The letter to filter by.
   * @returns {Array}                        The directory items.
   */
  filterDirectoryItemsByLetter(directoryItems, letter_slug) {
    let getLetterSlug = () => letter_slug;

    let matchItemWithSlug = (item) => {
      const slug = getLetterSlug();

      return item.hasOwnProperty('data') &&
        item.data.hasOwnProperty('name') &&
        item.data.name !== '' &&
        item.data.name.toLowerCase().charAt(0) === slug;
    };

    return directoryItems.filter(item => matchItemWithSlug(item));
  },

  /**
   * Creates the permalink path for a nursery.
   *
   * @param {Array}      nurseryItem         The nursery item.
   * @returns {String}                        The permalink path.
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
   * @param {Object|Array}      nurseryCategoryItem The nursery category item.
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
   * @returns {String}                        The permalink path.
   */
  createPlantPermalinkPath(plantItem) {
    let permalinkPath = '';
    let pathParts = {
      familySlug: '',
      genusSlug: '',
      speciesSlug: '',
      varietySlug: '',
      uuidSlug: 'NONE'
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

      permalinkPath = permalinkPath + 'uuid/' + pathParts.uuidSlug + '/';
    }

    return permalinkPath;
  },

  /**
   * Returns a link list of items in a directory.
   *
   * @param {Array}      collections      The default collections.
   * @param {Array}      dirItems         The directory items.
   * @param {String}     dirItemType      The item type of the directory items.
   * @param {String}     dirPermalinkType The permalink type of the directory items.
   * @returns {Array}                     The directory  items.
   */
  createDirectoryLinkList(collections, dirItems, dirItemType, dirPermalinkType = 'plant') {
    return module.exports.createLinkList(collections, dirItems, dirItemType, 'directory', dirPermalinkType);
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
        } else if (permalinkType === 'common_name') {
          permalinkPath = module.exports.createCommonNamePermalinkPath(item)
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
   * Returns a letter link list based on initial letters of item type.
   *
   * @param {Array}      letterList        The array of common names.
   * @param {String}     itemType          The item type.
   * @param {Boolean}    itemDirHasPlural  If the item directory name is
   *                                       pluralized.
   * @returns {Array}                      The link list of plant letters.
   */
  createItemTypeLetterLinkList(letterList, itemType, itemDirHasPlural) {

    let
      letterLinkList = [],
      directoryPath = itemType;

    if (itemDirHasPlural) {
      directoryPath = directoryPath + 's';
    }

    letterList.forEach(letter => {
      if (
        letter.hasOwnProperty('data') &&
        letter.data.hasOwnProperty('letter_slug') &&
        letter.data.hasOwnProperty('letter')
      ) {
        letterLinkList.push(
          {
            list_item_class: '[ letter-list-item--' + itemType + '-directory ]',
            link_class: '[ letter-list--' + itemType + '-directory ]',
            directory_path: directoryPath,
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
