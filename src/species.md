---
title: {{ plant.data.name }}
layout: 'layouts/plant.html'
pagination:
  data: collections.species
  size: 1
  alias: plant
permalink:
  serverless: '{{ plant | getPlantPermalink }}'
eleventyComputed:
    title: "Plant Species: {{ plant.data.name }}"
---
