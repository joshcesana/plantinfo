(function (lunr) {
  const
    searchInput = document.getElementById("search-text"),
    searchSubmit = document.getElementById("submit-search-results"),
    searchClear = document.getElementById("clear-search-results"),
    getTemplate = true,
    resultHeadings = getResultHeadings(),
    headingsRowTemplate = getResultHeadingsItemCollection(getTemplate),
    headingsItemTemplate = getResultHeadingsItem(getTemplate),
    resultsRowTemplate = getResultItemCollection(getTemplate).item(0),
    resultsItemTemplate = getResultItem(getTemplate),
    resultItemTextTemplate = getResultItemText(getTemplate),
    resultItemLinkTemplate = getResultItemLink(getTemplate);

  let
    indexData,
    searchData = {
      docs: null,
      idx: null,
      query: '',
      terms: '',
      results: null
    },
    searchType = null,
    searchTypes = {
      nurseries: {
        results: [
          {
            key: "name",
            label: "Nursery name",
          },
          {
            key: "city",
            label: "City",
          },
          {
            key: "state",
            label: "State",
          }
        ]
      },
    }
  ;

  async function loadSearchIndex() {
    try {
      const index = await fetch("/lunr/nursery/index.json");
      indexData = await index.json();
      searchData.idx = lunr.Index.load(indexData);

      let docs = await fetch("/lunr/nursery/raw.json");
      searchData.docs = await docs.json();
    } catch (e) {
      console.log(e);
    }
  }

  function cloneObject(object) {
    return JSON.parse(JSON.stringify(object))
  }

  function isArrayWithItems(checkThis) {
    return (
      Array.isArray(checkThis) &&
      checkThis.length > 0
    );
  }

  function objectHasOwnProperties(object, properties) {
    let currentObject = Object.assign(object);
    let hasProperties = true;

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

    return hasProperties;
  }

  function setElementHTML(element, html) {
    element.innerHTML = html;
  }

  function setElementHref(element, href) {
    element.href = href;
  }

  function setHideElement(element, boolean) {
    element.setAttribute("data-hide-element", boolean);
  }

  function setAvailable(element, target, boolean) {
    element.setAttribute("data-" + target + "-available", boolean);
  }

  function setIsTemplate(element, target, boolean) {
    element.setAttribute("data-" + target +  "-is-template", boolean);
  }

  function setTextFilled(element, boolean) {
    element.setAttribute("data-text-filled", boolean);
  }

  function setSearchScore(element, score) {
    element.setAttribute("data-search-score", score);
  }

  function showSearchTable() {
    let searchResultsTable = getResultTable();

    setHideElement(searchResultsTable, "false");
  }

  function showSearchResults() {
    let searchResultsTable = getResultTable();

    setAvailable(searchResultsTable, "results", "true");
    // document.querySelector(".search-results").classList.remove("hide-element");
    // document.getElementById("site-search").classList.add("expanded");
    // document.getElementById("clear-search-results-sidebar").classList.remove("hide-element");
  }

  function displayErrorMessage(message) {
    let
      searchErrorMessage = document.querySelector(".search-error__message"),
      searchErrorMessageList = document.querySelector(".search-form__messages");
    setElementHTML(searchErrorMessage, message);
    // document.querySelector(".search-container").classList.remove("focused");
    setHideElement(searchErrorMessageList, "false");
    // document.querySelector(".search-error").classList.add("fade");
  }

// function removeAnimation() {
//   this.classList.remove("fade");
//   this.classList.add("hide-element");
//   document.querySelector(".search-container").classList.add("focused");
// }

  function searchSite(query) {
    searchData.query = query;
    searchData.terms = getLunrSearchTerms(searchData.query);
    searchData.results = [];
    let results = getSearchResults(searchData.terms);

    if (!results.length && searchData.query !== searchData.terms) {
      results = getSearchResults(searchData.query);
    }

    if (results.length) {
      searchData.results = results;
    }
  }

  function getSearchResults(query) {
    return searchData.idx.search(query).flatMap((hit) => {
      if (hit.ref === "undefined") return [];
      let pageMatch = searchData.docs.filter((page) => page.machine_name === hit.ref)[0];
      pageMatch.score = hit.score;
      return [pageMatch];
    });
  }

  function getLunrSearchTerms(query) {
    let queryTerms = cloneObject(query);
    const searchTerms = queryTerms.split(" ");
    if (searchTerms.length === 1) {
      return queryTerms;
    }
    queryTerms = "";
    for (const term of searchTerms) {
      queryTerms += `+${term} `;
    }
    return queryTerms.trim();
  }

  function handleSearchQuery(event) {
    event.preventDefault();
    clearSearchResults({ clearInput: false, clearSearchData: true });

    const query = document.getElementById("search-text").value.trim().toLowerCase();
    if (!query) {
      displayErrorMessage("Please enter a search term");
      return;
    }
    searchSite(query);
    if (!searchData.results.length) {
      displayErrorMessage("Your search returned no results");
      return;
    } else {
      renderSearchResults();
    }
  }

  function getSearchFormType() {
    return document.querySelector(".search-form").getAttribute("data-search-type");
  }

  function getSearchResultsType() {
    return document.querySelector(".search-results").getAttribute("data-search-type");
  }

  function getSearchType() {
    const searchFormType = getSearchFormType();
    const searchResultsType = getSearchResultsType();
    if (
      searchFormType !== null &&
      typeof(searchFormType) !== 'undefined'
    ) {
      searchType = searchFormType
    } else if (
      searchResultsType !== null &&
      typeof(searchResultsType) !== 'undefined'
    ) {
      searchType = searchResultsType
    }
  }

  function getResultTable() {
    return document.querySelector(".search-results__table");
  }

  function getResultTotal() {
    return document.querySelectorAll(".search-results__total").item(0);
  }

  function getResultTotalCount() {
    return document.querySelectorAll(".search-results__total-count").item(0);
  }

  function getResultTotalText() {
    return document.querySelectorAll(".search-results__total-text").item(0);
  }

  function getResultHeadings() {
    return document.querySelector(".search-results__headings");
  }

  function getResultHeadingsItemCollection(isTemplate) {
    const selector = ".search-results__headings-item-list[data-row-is-template='" + isTemplate + "']";
    return document.querySelectorAll(selector);
  }

  function getResultHeadingsItem(isTemplate) {
    const selector = ".search-results__heading-item[data-item-is-template='"  + isTemplate + "']";
    return document.querySelectorAll(selector).item(0);
  }

  function getResultItemList() {
    return document.querySelectorAll(".search-results__result-item-list");
  }

  function getResultItemCollection(isTemplate) {
    const selector = ".search-results__result-item[data-row-is-template='" + isTemplate + "']";
    return document.querySelectorAll(selector);
  }

  function getResultItem(isTemplate) {
    const selector = ".search-results__result-data[data-item-is-template='"  + isTemplate + "']";
    return document.querySelector(selector);
  }

  function getResultItemText(isTemplate) {
    const selector = ".search-results__result-text[data-item-is-template='"  + isTemplate + "']";
    return document.querySelector(selector);
  }

  function getResultItemLink(isTemplate) {
    const selector = ".search-results__result-link[data-item-is-template='"  + isTemplate + "']";
    return document.querySelector(selector);
  }

  function removeElementChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function addElementChildren(element, children) {
    children.forEach(child => {
      element.appendChild(child);
    });
  }

  function clearSearchHeadings() {
    const isTemplate = false;

    // Select non-template heading rows.
    const resultHeadingsItemCollection = getResultHeadingsItemCollection(isTemplate);
    if (resultHeadings !== null && resultHeadingsItemCollection !== null && resultHeadingsItemCollection.length > 0) {
      // Loop through non-template heading rows and remove them.
      resultHeadingsItemCollection.forEach(resultHeadingsItem => {
        resultHeadings.removeChild(resultHeadingsItem);
      });
    }
  }

  /**
   *
   * @param { Object } options
   *  - { Boolean } clearInput
   *    Whether or not to clear the input when clearing search results.
     - { Boolean } clearSearchData
   *    Whether or not to clear the query and results from the search data.
   */
  function clearSearchResults(options) {
    let resultRows = getResultItemList().item(0);
    // Remove results.
    removeElementChildren(resultRows);

    // Clear search result count.
    updateSearchResultCount(0);

    // Clear search query.
    updateSearchCaptionQuery("", "false");

    // Clear search input.
    if (objectHasOwnProperties(options, ['clearInput']) &&
      options['clearInput'] === true) {
      searchInput.value = '';
    }

    // Clear search search data.
    if (objectHasOwnProperties(options, ['clearSearchData']) &&
      options['clearSearchData'] === true) {
      searchData.query = '';
      searchData.terms = '';
      searchData.results = [];
    }
  }

  function addSearchHeadings() {
    let headingItems = [];

    if (
      searchType !== null &&
      objectHasOwnProperties(searchTypes, [searchType]) &&
      isArrayWithItems(searchTypes[searchType].results)
    ) {
      // Loop through heading labels for search type, add a heading item for each.
      searchTypes[searchType].results.forEach(searchHeading => {
        let thisHeading = headingsItemTemplate.cloneNode(true);
        let thisHeadingText = thisHeading.querySelector(".search-results__heading-text");
        setElementHTML(thisHeadingText, searchHeading.label);
        setTextFilled(thisHeadingText, "true");
        setIsTemplate(thisHeading, "item", "false");
        setAvailable(thisHeading, "item", "true");
        headingItems.push(thisHeading);
      });

      let thisHeadingsRow = headingsRowTemplate.item(0);

      // Remove template children
      removeElementChildren(thisHeadingsRow);

      // Add headings for search type.
      addElementChildren(thisHeadingsRow, headingItems);
      setIsTemplate(thisHeadingsRow, "row", "false");
      setAvailable(thisHeadingsRow, "row", "true");

      resultHeadings.appendChild(thisHeadingsRow);
      showSearchTable();
    }
  }

  function updateSearchCaptionQuery(query, queryAvailable) {
    let
      search_query_caption = document.querySelector(".search-results__caption"),
      search_query_caption_query = document.getElementById("search-results-caption-query");

    setElementHTML(search_query_caption_query, searchData.query);
    setAvailable(search_query_caption, "caption-topic", "true");
  }

  function updateSearchResultCount(resultCount) {
    const
      resultTotal = getResultTotal(),
      resultTotalCount = getResultTotalCount(),
      resultTotalText = getResultTotalText();

    let resultTotalCountText = " Search Result";

    if (resultCount !== 1) {
      resultTotalCountText += "s";
    }

    setElementHTML(resultTotalCount, resultCount);
    setElementHTML(resultTotalText, resultTotalCountText);

    setTextFilled(resultTotalCount, "true");
    setAvailable(resultTotal, "true");
  }

  function updateSearchResults() {
    updateSearchCaptionQuery(searchData.query, "true");

    let
      resultItems = [],
      resultRows = getResultItemList().item(0);

    if (
      objectHasOwnProperties(searchData, ['results']) &&
      isArrayWithItems(searchData.results) &&
      searchType !== null &&
      objectHasOwnProperties(searchTypes, [searchType]) &&
      isArrayWithItems(searchTypes[searchType].results)
    ) {
      // Loop through search results, add a row for each.
      searchData.results.forEach(searchResult => {
        let thisResultRow = resultsRowTemplate.cloneNode(true);
        let thisResultRowData = [];

        let permalinkPath = '';

        if (objectHasOwnProperties(searchResult, ['permalink_path'])) {
          permalinkPath = searchResult['permalink_path'];
        }

        // Remove template children
        removeElementChildren(thisResultRow);

        // Loop through heading labels for search type, add a result item for each.
        searchTypes[searchType].results.forEach((searchHeading, index) => {
          let
            thisResultItem = resultsItemTemplate.cloneNode(true),
            thisResultItemText = resultItemTextTemplate.cloneNode(true),
            thisResultItemLink = resultItemLinkTemplate.cloneNode(true),
            thisResultItemLinkText = thisResultItemLink.querySelector(".search-results__result-link-text"),
            thisResultItemData = [];

          // Remove template children
          removeElementChildren(thisResultItem);

          if (objectHasOwnProperties(searchResult, [searchHeading.key])) {
            if (index === 0 && permalinkPath !== '') {
              setElementHTML(thisResultItemLinkText, searchResult[searchHeading.key]);
              setTextFilled(thisResultItemLinkText, "true");
              setIsTemplate(thisResultItemLinkText, "item", "false");

              setElementHref(thisResultItemLink, permalinkPath);
              setIsTemplate(thisResultItemLink, "item", "false");
              setAvailable(thisResultItemLink, "item", "true");
              thisResultItemData.push(thisResultItemLink);
            } else {
              setElementHTML(thisResultItemText, searchResult[searchHeading.key]);
              setTextFilled(thisResultItemText, "true");
              setIsTemplate(thisResultItemText, "item", "false");
              thisResultItemData.push(thisResultItemText);
            }
          }

          // Add row item data to row item.
          addElementChildren(thisResultItem, thisResultItemData);
          setIsTemplate(thisResultItem, "item", "false");
          setAvailable(thisResultItem, "item", "true");

          // Add row item to result row.
          thisResultRowData.push(thisResultItem);
        });

        // Add row data to results row.
        addElementChildren(thisResultRow, thisResultRowData);

        if (objectHasOwnProperties(searchResult, ['score'])) {
          let searchScore = searchResult.score.toFixed(2);
          setSearchScore(thisResultRow, searchScore);
        }

        setIsTemplate(thisResultRow, "row", "false");
        setAvailable(thisResultRow, "row", "true");

        resultItems.push(thisResultRow);

      });

      // Remove template children
      removeElementChildren(resultRows);

      // Add result items to result rows.
      addElementChildren(resultRows, resultItems);
      updateSearchResultCount(resultItems.length);
      showSearchResults();
    }
  }

  function scrollToTop() {
    // const toTopInterval = setInterval(function () {
    //   const supportedScrollTop = document.body.scrollTop > 0 ? document.body : document.documentElement;
    //   if (supportedScrollTop.scrollTop > 0) {
    //     supportedScrollTop.scrollTop = supportedScrollTop.scrollTop - 50;
    //   }
    //   if (supportedScrollTop.scrollTop < 1) {
    //     clearInterval(toTopInterval);
    //   }
    // }, 10);
  }

  function renderSearchResults() {
    clearSearchResults({ clearInput: false, clearSearchData: false });
    updateSearchResults();
    showSearchResults();
    scrollToTop();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("search-form") !== null) {
      loadSearchIndex();
      getSearchType();
      addSearchHeadings();

      searchInput.addEventListener("keydown", (event) => {
        if (event.code === "Enter") {
          handleSearchQuery(event);
        }
      });

      searchInput.addEventListener("click", (event) => {
        handleSearchQuery(event);
      });

      searchSubmit.addEventListener("click", (event) => {
        handleSearchQuery(event);
      });

      searchClear.addEventListener("click", (event) => {
        clearSearchResults({ clearInput: true, clearSearchData: true });
      });

      // document
      //   .querySelector(".search-error")
      //   .addEventListener("animationend", removeAnimation);
      // document
      //   .querySelector(".fa-search")
      //   .addEventListener("click", (event) => handleSearchQuery(event));
    }
  });
})(lunr);
