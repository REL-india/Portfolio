# Premium Static Portfolio

This is a fully static personal portfolio built with HTML, CSS, and JavaScript only. It is ready for GitHub Pages and does not require a backend, database, build step, or server-side code.

## Edit Content

Update the JSON files in `data/`:

- `profile.json`: hero, bio, stats, contact links, gallery, resume, footer
- `projects.json`: project cards, filters, search data, modal details
- `achievements.json`: awards, certifications, competitions, recognition
- `timeline.json`: education, experience, achievements, future goals
- `research.json`: research projects, publications, patents, documentation
- `skills.json`: skill categories and skill levels

## Replace Assets

The current design uses polished CSS placeholders, so the site looks complete before real media is added. When ready, add your real files under `assets/` and update the related JSON paths or labels.

## Local Preview

Because the site loads JSON with `fetch`, preview it through a static server rather than opening `index.html` directly.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

Push this folder to a GitHub repository and enable GitHub Pages from the repository settings. Use the repository root as the publishing source.
