---
title: {{ nursery.data.name }}
layout: 'layouts/nursery.html'
pagination:
  data: nurseries_nursery
  size: 1
  alias: nursery
  serverless: eleventy.serverless.path.nursery
permalink:
  serverless: '/nurseries/nursery/:nursery/uuid/:uuid/'
eleventyComputed:
  nursery: "{{ eleventy.serverless.path.nursery }}"
  uuid: "{{ eleventy.serverless.path.uuid }}"
---
