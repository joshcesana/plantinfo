---
title: {{ plant.data.name }}
layout: 'layouts/plant.html'
pagination:
  data: collections.variety
  size: 1
  alias: plant
permalink: '/plants/family/{{ plant.data.family }}/genus/{{ plant.data.genus }}/species/{{ plant.data.species }}/variety/{{ plant.data.machine_name }}/'
eleventyComputed:
    title: "Plant Variety: {{ plant.data.name }}"
---
