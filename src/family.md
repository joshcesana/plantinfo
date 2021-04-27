---
layout: 'layouts/plant.html'
pagination:
  data: collections.family
  size: 1
  alias: plant
permalink: '/plants/family/{{ plant.data.machine_name }}/'
eleventyComputed:
    title: "Plant Family: {{ plant.data.name }}"
---
