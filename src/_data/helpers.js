module.exports = {
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
   * Returns a plant item based on the collection type and machine name.
   *
   * @param {Array}        collections  The 11ty collections.
   * @param {String}       itemType     The item type to use for the collection.
   * @param {String}       machineName  The machine name of the plant item.
   * @returns {Array}                   The item from the collection.
   */
  getPlantByTypeAndMachineName(collections, itemType, machineName, uuid) {
    const plantItems = collections[itemType];
    let plantFound = {};
    let plantItemsFound = [];

    plantItems.forEach(plant => {
      let plantItem = {};

      if (
        plant.hasOwnProperty('data') &&
        plant.data.hasOwnProperty('type') &&
        plant.data.type === itemType &&
        plant.data.hasOwnProperty('machine_name') &&
        plant.data.machine_name === machineName) {
        plantItem['data'] = plant.data;
      }

      if (plantItem.hasOwnProperty('data')) {
        plantItemsFound.push(plantItem);
      }
    });

    if (plantItemsFound.length > 0) {
      plantFound = plantItemsFound[0];
    }

    return plantFound;
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
   * @param {Array}      childPlantItems The child plant items.
   * @param {String}     childPlantType  The plant type of the child plant items.
   * @returns {Array}                    The child plant items.
   */
  createChildLinkList(childPlantItems, childPlantType) {
    return module.exports.createLinkList(childPlantItems, childPlantType, 'related');
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

      if (plantItem.data.hasOwnProperty('uuid')) {
        pathParts.uuidSlug = plantItem.data.uuid;
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
   * @param {Array}      directoryPlantItems The directory plant items.
   * @param {String}     directoryPlantType  The plant type of the directory plant items.
   * @returns {Array}                         The directory plant items.
   */
  createDirectoryLinkList(directoryPlantItems, directoryPlantType) {
    return module.exports.createLinkList(directoryPlantItems, directoryPlantType, 'directory');
  },

  /**
   * Returns a link list of plant items.
   *
   * @param {Array}      plantItems     The child plant items.
   * @param {String}     plantType      The plant type of the child plant items.
   * @param {String}     classPrefix    The prefix to use in the class name.
   * @returns {Array}                   The child plant items.
   */
  createLinkList(plantItems, plantType, classPrefix) {
    let linkList = [];

    plantItems.forEach(plant => {
      if (
        plant.hasOwnProperty('data') &&
        plant.data.hasOwnProperty('type') &&
        plant.data.hasOwnProperty('machine_name') &&
        plant.data.hasOwnProperty('name')
      ) {
        linkList.push(
          {
            list_item_class: '[ ' + classPrefix + '-' + plantType + '__link-list-item ]',
            link_class: '[ ' + classPrefix + '-' + plantType + '__link ]',
            type: plant.data.type,
            machine_name: plant.data.machine_name,
            name: plant.data.name,
            permalink_path: module.exports.createPlantPermalinkPath(plant)
          }
        );
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
    let letterLinkList = [];

    typeCollection.forEach(plant => {
      if (
        plant.hasOwnProperty('data') &&
        plant.data.hasOwnProperty('type') &&
        plant.data.hasOwnProperty('name')
      ) {
        if (plant.data.type === plantType) {
          let firstLetter = '';
          firstLetter = (plant.data.name.match(/[a-zA-Z]/) || []).pop();

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
  }
};
