---
title: {{ nursery_category.data.name }}
layout: 'layouts/nursery-category.html'
pagination:
  data: collections.nursery_category
  size: 1
  alias: nursery_category
permalink: '{{ nursery_category | getNurseryCategoryPermalink }}'
---
