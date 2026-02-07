---
layout: page
title: Projects
permalink: /projects/
---

<div class="project-grid">
{% for project in site.data.projects %}
  <div class="project-card">
    {% if project.icon %}
      <img src="{{ project.icon }}" alt="{{ project.name }}" class="project-icon">
    {% else %}
      <div class="project-icon-placeholder">{{ project.name | slice: 0 }}</div>
    {% endif %}
    <h3>{{ project.name }}</h3>
    <p class="project-tagline">{{ project.tagline }}</p>
    <p>{{ project.description }}</p>
    <div class="project-tags">
      {% for tag in project.tags %}
        <span class="tag">{{ tag }}</span>
      {% endfor %}
    </div>
    <div class="project-links">
      {% if project.appstore %}
        <a href="{{ project.appstore }}" class="btn btn-primary">App Store</a>
      {% endif %}
      {% if project.github %}
        <a href="{{ project.github }}" class="btn btn-secondary">GitHub</a>
      {% endif %}
    </div>
    <span class="project-status status-{{ project.status }}">
      {% if project.status == "released" %}출시{% elsif project.status == "opensource" %}오픈소스{% else %}개발중{% endif %}
    </span>
  </div>
{% endfor %}
</div>
