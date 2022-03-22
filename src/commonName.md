---
title: {{ common_name.data.name }}
layout: 'layouts/common-name.html'
pagination:
  data: plants_common_name
  size: 1
  alias: common_name
  serverless: eleventy.serverless.path.common
permalink:
  serverless: '/plants/common-names/:common/uuid/:uuid/'
eleventyComputed:
  common: "{{ eleventy.serverless.path.common }}"
  uuid: "{{ eleventy.serverless.path.uuid }}"

---
