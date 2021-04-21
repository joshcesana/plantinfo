/**
 * Takes a collection and returns it back sorted by machine name.
 *
 * @param {Array} collection The 11ty collection
 * @returns {Array} the sorted collection
 */
module.exports = collection =>
  collection.sort((a, b) => {
    if(a.data.machine_name < b.data.machine_name) { return -1; }
    if(a.data.machine_name > b.data.machine_name) { return 1; }
    return 0;
  });
