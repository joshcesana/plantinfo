/**
 * Efforts to add collections asynchronously.
 *
 * @param {Array}        config     The 11ty config
 * @returns {Array}                      The custom collection
 */
module.exports = (config) => {
  let timerInterval = 50;

  let promiseTimer = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  let asyncChecker = async (fn, ms, ...args) => {
    await promiseTimer(ms);
    return fn(...args);
  };

  let asyncCollectionChecker = async (collection, collectionName, interval) => {
    let thisCollection = [];

    if (!thisCollection.length > 0) {
      while(!thisCollection.length > 0) {
        console.log('loop for ' + collectionName);
        await promiseTimer(interval);
        thisCollection = getAsyncData(collection, interval)
          .then(asyncCollection => asyncCollection);
        console.log(thisCollection);
      }
    }

    return Promise.resolve(thisCollection);
    // return Promise.resolve(thisCollection);
  };

  let getAsyncData = async (collection, collectionName, interval) => {
    await promiseTimer(interval);
    return Promise.resolve(collection);
  };

  let setAsyncData = async (collection, collectionName, interval) => {
    await promiseTimer(interval);
    console.log('set ' + collectionName);
    return Promise.resolve(collection);
  };

  let getAsyncCollection = async (collection, collectionName, interval) => {
    let asyncCollection = await asyncCollectionChecker(collection, collectionName, interval);
    return await Promise.resolve(asyncCollection);
  };

  let asyncDataCollection = async (collection, collectionName, interval) => {
    await promiseTimer(interval);
    return Promise.resolve(getElementItemsByType(collection, collectionName));
  };

  let asyncCollection = async (collection, collectionName, interval) => {
    return await asyncGetCustomCollection(collection, collectionName, interval);
  };


  // Returns family items.
  let familyCollection = [];
  config.addCollection('family', async(collection) => {
    let familyCollectionData = sortByMachineName(
      getFilteredByLetterGroup(collection, ['plants_archive', 'family'], [3], 'family')
    );

    familyCollection = setAsyncData(familyCollectionData, 'family', timerInterval);

    return familyCollectionData;
  });

  // Returns genus items.
  let genusCollection = [];
  // config.addCollection('genus', collection => {
  //   return sortByMachineName(getFilteredByLetterGroup(collection, ['plants', 'family'], [6], 'genus'));
  // })
  config.addCollection('genus', async (collection) => {
    let awaitFamilyCollection = await getAsyncCollection(familyCollection, 'family', timerInterval)
      .then(thisCollection => thisCollection);

    let genusCollectionData = sortByMachineName(
      getElementItemsByType(awaitFamilyCollection, 'genus')
    );

    genusCollection = setAsyncData(genusCollectionData, 'genus', timerInterval);

    return genusCollectionData;
  });

  // Returns genus letter items.
  let genusLettersCollection = [];
  config.addCollection('genusLetters', async (collection) => {
    let awaitGenusForLettersCollection = await getAsyncCollection(genusCollection, 'genus', timerInterval)
      .then(thisCollection => thisCollection);

    let genusLettersCollectionData = sortLetterArray(
      getLetterListByItemType(awaitGenusForLettersCollection, 'genus')
    );

    genusLettersCollection = setAsyncData(genusLettersCollectionData, 'genusLetters', timerInterval);

    return genusLettersCollectionData;
  });

  // Returns species items.
  let speciesCollection = [];
  // config.addCollection('species', collection => {
  //   return sortByMachineName(getFilteredByLetterGroup(collection, ['plants', 'family'], [9], 'species'));
  // });
  config.addCollection('species', async (collection) => {
    let awaitGenusForSpeciesCollection = await getAsyncCollection(genusCollection, 'genus', timerInterval)
      .then(thisCollection => thisCollection);

    let speciesCollectionData = sortByMachineName(
      getElementItemsByType(awaitGenusForSpeciesCollection, 'species ')
    );

    speciesCollection = setAsyncData(speciesCollectionData, 'species', timerInterval);

    return speciesCollectionData;
  });

  // Returns variety items.
  let varietyCollection = [];
  // config.addCollection('variety', collection => {
  //   return sortByMachineName(getFilteredByLetterGroup(collection, ['plants', 'family'], [9, 12], 'variety'));
  // });
  config.addCollection('variety', async (collection) => {
    let awaitSpeciesCollection = await getAsyncCollection(speciesCollection, timerInterval)
      .then(thisCollection => thisCollection);

    let varietyCollectionData = sortByMachineName(
      getElementItemsByType(awaitSpeciesCollection, 'variety ')
    );

    varietyCollection = setAsyncData(varietyCollectionData, 'species', timerInterval);

    return varietyCollectionData;
  });
};
