(function (lunr) {
  const
    searchInput = document.getElementById("search-text"),
    countryInput = document.getElementById("country"),
    salesTypeInput = document.getElementById("sales-type"),
    searchSubmit = document.getElementById("submit-search-results"),
    searchClear = document.getElementById("clear-search-results"),
    getTemplate = true,
    resultHeadings = getResultHeadings(),
    headingsRowTemplate = getResultHeadingsItemCollection(getTemplate),
    headingsItemTemplate = getResultHeadingsItem(getTemplate),
    resultsRowTemplate = getResultItemCollection(getTemplate).item(0),
    resultsItemTemplate = getResultItem(getTemplate),
    resultItemTextTemplate = getResultItemText(getTemplate),
    resultItemLinkTemplate = getResultItemLink(getTemplate),
    resultItemLinkTextTemplate = getResultItemLinkText(getTemplate);

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
            has_multiple_items: false,
            has_text_link: true,
            link_key: "permalink_path",
          },
          {
            key: "city",
            label: "City",
            has_multiple_items: false,
            has_text_link: false,
            link_key: null,
          },
          {
            key: "state",
            label: "State",
            has_multiple_items: false,
            has_text_link: false,
            link_key: null,
          },
          {
            key: "specialty_names",
            label: "Specialties",
            has_multiple_items: true,
            has_text_link: true,
            link_key: "specialty_permalink_paths",
          },
          {
            key: "sales_type_names",
            label: "Sales Types",
            has_multiple_items: true,
            has_text_link: false,
            link_key: null,
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

  function searchSite(query, modifiers) {
    searchData.query = query;
    searchData.terms = getLunrSearchTerms(searchData.query, modifiers);
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

  function getQuery() {
    return document.getElementById("search-text").value.trim().toLowerCase();
  }

  function getQueryModifiers() {
    let
      country_default = "all",
      country = document.getElementById("country").options[countryInput.selectedIndex].value,
      country_key = "country_keys",
      country_term = country_key + ":" + country,
      sales_type_default = "all",
      sales_type = document.getElementById("sales-type").options[salesTypeInput.selectedIndex].value,
      sales_type_key = "sales_type_keys",
      sales_type_term = sales_type_key + ":" + sales_type,
      modifier_terms = "";

    if (country !== country_default) {
      modifier_terms = addTerm(modifier_terms, country_term);
    }

    if (sales_type !== sales_type_default) {
      modifier_terms = addTerm(modifier_terms, sales_type_term);
    }

    return modifier_terms;
  }

  function getLunrSearchTerms(query, modifiers) {
    let queryTerms = cloneObject(query);

    if (modifiers !== "") {
      queryTerms = addTerm(queryTerms, modifiers);
    }

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

    const
      query = getQuery(),
      query_modifiers = getQueryModifiers();
    if (!query && !query_modifiers) {
      displayErrorMessage("Please enter a search term or select a search option");
      return;
    }
    searchSite(query, query_modifiers);
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

  function getHasMultipleItems(searchTypeInfo) {
    let has_multiple_items = false;

    if (objectHasOwnProperties(searchTypeInfo, ['has_multiple_items'])) {
      has_multiple_items = searchTypeInfo['has_multiple_items'];
    }

    return has_multiple_items;
  }

  function getHasTextLink(searchTypeInfo) {
    let has_text_link = false;

    if (objectHasOwnProperties(searchTypeInfo, ['has_text_link'])) {
      has_text_link = searchTypeInfo['has_text_link'];
    }

    return has_text_link;
  }

  function getLinkKey(searchTypeInfo) {
    let link_key = null;

    if (objectHasOwnProperties(searchTypeInfo, ['link_key'])) {
      link_key = searchTypeInfo['link_key'];
    }

    return link_key;
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

  function getResultItemLinkText(isTemplate) {
    const selector = ".search-results__result-link-text[data-item-is-template='"  + isTemplate + "']";
    return document.querySelector(selector);
  }

  function getElementToString(element) {
    return element.outerHTML;
  }

  function removeElementChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    return element;
  }

  function addElementChildren(element, children) {
    children.forEach(child => {
      element.appendChild(child);
    });

    return element;
  }

  function addTextElementData(element, data) {
    setElementHTML(element, data);
    setTextFilled(element, "true");
    setIsTemplate(element, "item", "false");

    return element;
  }

  function addLinkElementPath(element, path) {
    setElementHref(element, path);
    setIsTemplate(element, "item", "false");
    setAvailable(element, "item", "true");

    return element;
  }

  function addTextToLinkElement(textElement, linkElement, textData, linkPath) {
    let
      text_element = addTextElementData(textElement, textData),
      link_element = addLinkElementPath(linkElement, linkPath);

    link_element = removeElementChildren(link_element);
    link_element = addElementChildren(link_element, [text_element]);

    return link_element;
  }

  function addElementToItemData(element, itemData) {

    itemData.push(element);

    return itemData;
  }

  function addTerm(terms, term) {
    if (terms !== "") {
      terms += " ";
    }

    terms += term;

    return terms;
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
      thisHeadingsRow = removeElementChildren(thisHeadingsRow);

      // Add headings for search type.
      thisHeadingsRow = addElementChildren(thisHeadingsRow, headingItems);
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
        thisResultRow = removeElementChildren(thisResultRow);

        // console.log(searchResult);

        // Loop through heading labels for search type, add a result item for each.
        searchTypes[searchType].results.forEach((searchTypeInfo, index) => {
          let
            thisResultItem = resultsItemTemplate.cloneNode(true),
            thisResultItemText = resultItemTextTemplate.cloneNode(true),
            thisResultItemLink = resultItemLinkTemplate.cloneNode(true),
            thisResultItemLinkText = resultItemLinkTextTemplate.cloneNode(true),
            thisResultItemData = [];

          // Remove template children
          thisResultItem = removeElementChildren(thisResultItem);

          if (objectHasOwnProperties(searchResult, [searchTypeInfo.key])) {
            let
              searchResultData = searchResult[searchTypeInfo.key],
              has_multiple_items = getHasMultipleItems(searchTypeInfo),
              has_text_link = getHasTextLink(searchTypeInfo),
              link_key = getLinkKey(searchTypeInfo);

            if (has_multiple_items && isArrayWithItems(searchResultData)) {
              let
                itemCount = searchResultData.length,
                thisResultItemDataList = [],
                thisResultItemDataListText = '';

              searchResultData.forEach((dataItem, index) => {
                if (
                  has_text_link &&
                  link_key !== null &&
                  objectHasOwnProperties(searchResult, [link_key]) &&
                  searchResult[link_key][index] !== null
                ) {
                  let
                    thisDataItemPermalinkPath = searchResult[link_key][index],
                    thisDataItemLink = resultItemLinkTemplate.cloneNode(true),
                    thisDataItemLinkText = thisResultItemLinkText.cloneNode(true),
                    thisLinkElement = addTextToLinkElement(thisDataItemLinkText, thisDataItemLink, dataItem, thisDataItemPermalinkPath),
                    thisLinkTextData = getElementToString(thisLinkElement);

                  thisResultItemDataList = addElementToItemData(thisLinkTextData, thisResultItemDataList);
                } else {

                  let
                    thisDataItemText = thisResultItemText.cloneNode(true),
                    thisTextElement = addTextElementData(thisDataItemText, dataItem),
                    thisTextData = getElementToString(thisTextElement);

                  thisResultItemDataList = addElementToItemData(thisTextData, thisResultItemDataList);
                }

                if (itemCount - 2 >= 0 && itemCount - 1 !== index ) {
                  thisResultItemDataList.push(', ');
                }

                if (itemCount - 1 >= 0 && itemCount - 2 === index ) {
                  thisResultItemDataList.push(' and ');
                }
              });

              thisResultItemDataList.forEach(listItem => {
                thisResultItemDataListText += listItem;
              });

              let thisResultItemDataListTextElement = addTextElementData(thisResultItemText, thisResultItemDataListText);

              thisResultItemData = addElementToItemData(thisResultItemDataListTextElement, thisResultItemData);
            } else {
              let thisElement = null;

              if (has_text_link && link_key !== null) {
                thisElement = addTextToLinkElement(thisResultItemLinkText, thisResultItemLink, searchResultData, permalinkPath);
              } else {
                thisElement = addTextElementData(thisResultItemText, searchResultData);
              }

              thisResultItemData = addElementToItemData(thisElement, thisResultItemData);
            }
          }

          // Add row item data to row item.
          thisResultItem = addElementChildren(thisResultItem, thisResultItemData);
          setIsTemplate(thisResultItem, "item", "false");
          setAvailable(thisResultItem, "item", "true");

          // Add row item to result row.
          thisResultRowData.push(thisResultItem);
        });

        // Add row data to results row.
        thisResultRow = addElementChildren(thisResultRow, thisResultRowData);

        if (objectHasOwnProperties(searchResult, ['score'])) {
          let searchScore = searchResult.score.toFixed(2);
          setSearchScore(thisResultRow, searchScore);
        }

        setIsTemplate(thisResultRow, "row", "false");
        setAvailable(thisResultRow, "row", "true");

        resultItems.push(thisResultRow);

      });

      // Remove template children
      resultRows = removeElementChildren(resultRows);

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

      countryInput.addEventListener("change", (event) => {
        handleSearchQuery(event);
      });

      salesTypeInput.addEventListener("change", (event) => {
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
