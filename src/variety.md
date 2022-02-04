---
title: {{ plant.data.name }}
layout: 'layouts/plant.html'
pagination:
  data: collections.variety
  size: 1
  alias: plant
permalink:
  serverless: '{{ plant | getPlantPermalink }}'
eleventyComputed:
    title: "Plant Variety: {{ plant.data.name }}"
---
