---
title: {{ plant.data.name }}
layout: 'layouts/plant.html'
pagination:
  data: collections.genus
  size: 1
  alias: plant
permalink: '/plants/{{ plant.data.type }}/{{ plant.data.machine_name }}/'
eleventyComputed:
    title: "Plant Genus: {{ plant.data.name }}"
---
