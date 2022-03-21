---
title: {{ plant.data.name }}
layout: 'layouts/plant.html'
pagination:
  data: plant_variety
  size: 1
  alias: plant
  serverless: eleventy.serverless.path.variety
permalink:
    serverless: '/plants/family/:family/genus/:genus/species/:species/variety/:variety/uuid/:uuid/'
eleventyComputed:
    title: "Plant Variety: {{ plant.data.name }}"
    family: "{{ eleventy.serverless.path.family }}"
    genus: "{{ eleventy.serverless.path.genus }}"
    species: "{{ eleventy.serverless.path.species }}"
    variety: "{{ eleventy.serverless.path.variety }}"
    uuid: "{{ eleventy.serverless.path.uuid }}"
---
