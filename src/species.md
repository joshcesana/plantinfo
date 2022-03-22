---
title: {{ plant.data.name }}
layout: 'layouts/plant.html'
pagination:
  data: plants_species
  size: 1
  alias: plant
  serverless: eleventy.serverless.path.species
permalink:
  serverless: '/plants/family/:family/genus/:genus/species/:species/uuid/:uuid/'
eleventyComputed:
    title: "Plant Species: {{ plant.data.name }}"
    family: "{{ eleventy.serverless.path.family }}"
    genus: "{{ eleventy.serverless.path.genus }}"
    species: "{{ eleventy.serverless.path.species }}"
    uuid: "{{ eleventy.serverless.path.uuid }}"
---
