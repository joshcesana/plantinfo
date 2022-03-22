---
title: {{ plant.data.name }}
layout: 'layouts/plant.html'
pagination:
  data: plants_family
  size: 1
  alias: plant
  serverless: eleventy.serverless.path.family
permalink:
  serverless: '/plants/family/:family/uuid/:uuid/'
eleventyComputed:
    title: "Plant Family: {{ plant.data.name }}"
    family: "{{ eleventy.serverless.path.family }}"
    uuid: "{{ eleventy.serverless.path.uuid }}"
---
