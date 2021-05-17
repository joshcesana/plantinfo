---
title: {{ plant.data.name }}
layout: 'layouts/plant.html'
pagination:
  data: collections.species
  size: 1
  alias: plant
permalink: '/plants/family/{{ plant.data.family }}/genus/{{ plant.data.genus }}/species/{{ plant.data.machine_name }}/'
eleventyComputed:
    title: "Plant Species: {{ plant.data.name }}"
---
