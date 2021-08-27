(function (lunr) {
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

  function displayErrorMessage(message) {
    document.querySelector(".search-error__message").innerHTML = message;
    // document.querySelector(".search-container").classList.remove("focused");
    document.querySelector(".search-form__messages").setAttribute("data-hide-element", "false");
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
      console.log('yes we have results');
      console.log(searchData.results);
    }

    renderSearchResults();
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

  function getResultHeadings() {
    return document.querySelector(".search-results__headings");
  }

  function getResultHeadingsItemCollection(isTemplate) {
    const selector = ".search-results__headings-item-list[data-row-is-template='" + isTemplate + "']";
    return document.querySelectorAll(selector);
  }

  function getResultHeadingsItem(isTemplate) {
    const selector = ".search-results__heading-item[data-item-is-template='"  + isTemplate + "']";
    return document.querySelector(selector);
  }

  function getResultItemList() {
    return document.querySelector(".search-results__result-item-list");
  }

  function getResultItemCollection(isTemplate) {
    const selector = ".search-results__result-item-list[data-row-is-template='" + isTemplate + "']";
    return document.querySelectorAll(selector);
  }

  function getResultItem(isTemplate) {
    const selector = ".search-results__result-item[data-item-is-template='"  + isTemplate + "']";
    return document.querySelector(selector);
  }

  function clearSearchHeadings() {
    const isTemplate = false;

    // Select non-template heading rows.
    const resultHeadings = getResultHeadings();
    const resultHeadingsItemCollection = getResultHeadingsItemCollection(isTemplate);
    if (resultHeadings !== null && resultHeadingsItemCollection !== null && resultHeadingsItemCollection.length > 0) {
      // Loop through non-template heading rows and remove them.
      resultHeadingsItemCollection.forEach(resultHeadingsItem => {
        resultHeadings.removeChild(resultHeadingsItem);
      });
    }
  }

  function clearSearchResults() {
    const isTemplate = false;

    // Select non-template result rows.
    const resultItemList = getResultItemList;
    const resultItemCollection = getResultItemCollection(isTemplate);
    if (resultItemList !== null && resultItemCollection !== null && resultItemCollection.length > 0) {
      // Loop through non-template result rows and remove them.
      resultItemCollection.forEach(resultItem => {
        resultItemList.removeChild(resultItem);
      });
    }
  }

  function addSearchHeadings() {
    const
      isTemplate = true,
      headingsRowTemplate = getResultHeadingsItemCollection(isTemplate),
      headingsItemTemplate = getResultHeadingsItem(isTemplate),
      resultHeadings = getResultHeadings();
    console.log(headingsRowTemplate);
    console.log(headingsItemTemplate);
    console.log(resultHeadings);

    let headingItems = [];

    if (
      searchType !== null &&
      objectHasOwnProperties(searchTypes, [searchType]) &&
      isArrayWithItems(searchTypes[searchType].results)
    ) {
      // Loop through heading labels for search type, add a heading item for each.
      searchTypes[searchType].results.forEach(searchHeading => {
        let thisHeading = headingsItemTemplate;
        console.log(thisHeading);
        thisHeading.querySelector(".search-results__heading-text").innerHTML = searchHeading.label;
        thisHeading.querySelector(".search-results__heading-text").setAttribute("data-text-filled", "true");
        thisHeading.setAttribute("data-item-is-template", "false");
        thisHeading.setAttribute("data-item-available", "true");
        headingItems.push(thisHeading);
      });
      let thisHeadingsRow = headingsRowTemplate;
      // Remove template children
      while (thisHeadingsRow.firstChild) {
        thisHeadingsRow.removeChild(thisHeadingsRow.firstChild);
      }
      // Add headings for search type.
      headingItems.forEach(headingItem => {
        thisHeadingsRow.appendChild(headingItem);
      });

      resultHeadings.appendChild(thisHeadingsRow);
    }
  }

  function updateSearchResults() {
    document.getElementById("search-results-caption-query").innerHTML = searchData.query;
    // document.querySelector(".search-results ul").innerHTML = results
    //   .map(
    //     (hit) => `
    // <li class="search-result-item" data-score="${hit.score.toFixed(2)}">
    //   <a href="${hit.href}" class="search-result-page-title">${hit.title}</a>
    //   <p>${createSearchResultBlurb(query, hit.content)}</p>
    // </li>
    // `
    //   )
    //   .join("");
    // const searchResultListItems = document.querySelectorAll(".search-results ul li");
    // document.getElementById("results-count").innerHTML = searchResultListItems.length;
    // document.getElementById("results-count-text").innerHTML = searchResultListItems.length > 1 ? "results" : "result";
    // searchResultListItems.forEach(
    //   (li) => (li.firstElementChild.style.color = getColorForSearchResult(li.dataset.score))
    // );
  }

  function showSearchResults() {
    // document.querySelector(".primary").classList.add("hide-element");
    // document.querySelector(".search-results").classList.remove("hide-element");
    // document.getElementById("site-search").classList.add("expanded");
    // document.getElementById("clear-search-results-sidebar").classList.remove("hide-element");
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
    console.log('time to render');
    clearSearchResults();
    updateSearchResults();
    showSearchResults();
    scrollToTop();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("search-form") !== null) {
      loadSearchIndex();
      getSearchType();
      // addSearchHeadings();

      const searchInput = document.getElementById("search-text");
      const searchSubmit = document.getElementById("submit-search-results");
      searchInput.addEventListener("keydown", (event) => {
        if (event.code === "Enter") {
          handleSearchQuery(event);
        }
      });
      searchInput.addEventListener("click", (event) => {
        handleSearchQuery(event);
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
