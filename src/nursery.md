---
title: {{ nursery.data.name }}
layout: 'layouts/nursery.html'
pagination:
  data: collections.nursery
  size: 1
  alias: nursery
permalink:
  serverless: '{{ nursery | getNurseryPermalink }}'
---
