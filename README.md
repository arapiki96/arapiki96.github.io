# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 📝 Keystatic CMS (Blog)

The blog is managed via Keystatic and stored as files in `src/content/blog/`.

### Run locally
1) `npm install`
2) `npm run dev`
3) Visit `http://localhost:4321/keystatic` (dev only)

### Add/edit a post
- Use the Keystatic UI to create or edit posts.
- Content is saved to files in `src/content/blog/`.

### Publish
Run these from the project root after editing/creating posts:
```
git status -sb
git add -A
git commit -m "Add blog post"
git push
```
GitHub Actions builds and deploys the site after you push.

## Recent reporting feed

The homepage collects the latest ten Thomas Manch stories from
`https://www.businessdesk.co.nz/author/thomas-manch/` at build time. It reads the
page's `Fusion.globalContent` JSON, filters by author, validates links and dates,
removes duplicate links, and sorts newest first. Dates display in New Zealand time.

Use Node 24 (as in GitHub Actions) and run `npm test` before building. The tests include a reduced
publisher-page fixture and a synthetic recommendation by another author.

GitHub Actions rebuilds every six hours and on pushes to `main`. A failed fetch or
unrecognised/empty feed fails the build, leaving the last successful deployment
online. The homepage's Updated date therefore reflects a successful collection.
Check failed runs in the repository's Actions tab; notification delivery follows
your GitHub Actions notification settings.

GitHub automatically disables scheduled workflows in public repositories after
60 days without repository activity. To recover, enable **Deploy to GitHub Pages**
in Actions, then select **Run workflow**. An independent scheduler can avoid this
dependency by enabling and dispatching the workflow every six hours:

1. `PUT /repos/arapiki96/arapiki96.github.io/actions/workflows/deploy.yml/enable`
2. `POST /repos/arapiki96/arapiki96.github.io/actions/workflows/deploy.yml/dispatches`
   with JSON body `{"ref":"main"}`.

Both requests use GitHub's REST API and a repository-scoped token with Actions
write permission. Store that token only in the scheduler's secret store. An
external scheduler has not yet been configured.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
