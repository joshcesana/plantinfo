---
title: {{ plant.data.name }}
layout: 'layouts/plant.html'
pagination:
  data: collections.family
  size: 1
  alias: plant
permalink: '{{ plant | getPlantPermalink }}'
eleventyComputed:
    title: "Plant Family: {{ plant.data.name }}"
---
