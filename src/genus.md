---
title: {{ plant.data.name }}
layout: 'layouts/plant.html'
pagination:
  data: plants_genus
  size: 1
  alias: plant
  serverless: eleventy.serverless.path.genus
permalink:
  serverless: '/plants/family/:family/genus/:genus/uuid/:uuid/'
eleventyComputed:
    title: "Plant Genus: {{ plant.data.name }}"
    family: "{{ eleventy.serverless.path.family }}"
    genus: "{{ eleventy.serverless.path.genus }}"
    uuid: "{{ eleventy.serverless.path.uuid }}"
---
