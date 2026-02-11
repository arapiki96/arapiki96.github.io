# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website/blog for Thomas Manch built with Astro. The site is hosted on GitHub Pages at https://arapiki96.github.io and features a blog managed through Keystatic CMS, along with dynamically fetched work samples from BusinessDesk.

## Development Commands

- `npm run dev` - Start local dev server at localhost:4321
- `npm run build` - Build production site to ./dist/
- `npm run preview` - Preview production build locally
- `npm run astro` - Run Astro CLI commands (e.g., `astro check`)

## Architecture

### Content Management

**Keystatic CMS**: The blog uses Keystatic for content management (dev only, disabled in production builds).
- Access at http://localhost:4321/keystatic during development
- Content is stored as files in [src/content/blog/](src/content/blog/)
- Configuration in [keystatic.config.ts](keystatic.config.ts)
- Keystatic integration is conditionally loaded in [astro.config.mjs:10](astro.config.mjs#L10) based on NODE_ENV

**Content Collections**: Astro content collections are defined in [src/content.config.ts](src/content.config.ts)
- Blog posts have: title, date, description (optional), draft (optional), tags (optional)
- Draft posts are filtered out in production

### Layouts and Components

**BaseLayout** ([src/layouts/baselayout.astro](src/layouts/baselayout.astro)): Main site layout
- Provides consistent navigation across all pages
- Shows/hides brand name based on current route
- Includes sidebar navigation with 5 main sections: About, Work, Blog, Talk to a reporter, Contact

**SEO Component** ([src/components/SEO.astro](src/components/SEO.astro)): Handles all meta tags
- Open Graph tags for social sharing
- Twitter card metadata
- Canonical URLs
- Article publish/modified times for blog posts

### Dynamic Content

**BusinessDesk Feed** ([src/lib/businessdeskFeed.js](src/lib/businessdeskFeed.js)): Scrapes Thomas's latest articles from BusinessDesk
- `getThomasManchStories(limit)` function fetches and parses HTML
- Used on the Work page to display recent journalism

**Writing Data** ([src/data/writing.ts](src/data/writing.ts)): Manual list of featured work samples

### Page Routing

Blog posts use dynamic routing in [src/pages/blog/[...slug].astro](src/pages/blog/[...slug].astro):
- `getStaticPaths()` generates pages for all non-draft blog posts
- Strips `/index` from slugs for cleaner URLs
- Renders Markdoc content via `post.render()`

## Deployment

The site deploys automatically via GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)):
- Triggers on push to main branch
- Runs on a schedule every 6 hours (to fetch fresh BusinessDesk content)
- Can be manually triggered via workflow_dispatch
- Builds with Node 20 and deploys to GitHub Pages

## Key Integrations

- **@astrojs/react**: React components support
- **@astrojs/markdoc**: Markdoc content format
- **@keystatic/astro**: CMS for blog management

## Security

### Security Headers
The site implements comprehensive security headers via middleware ([src/middleware.ts](src/middleware.ts)):
- **Content Security Policy (CSP)**: Restricts resource loading to prevent XSS attacks
- **X-Frame-Options**: Prevents clickjacking attacks
- **Strict-Transport-Security (HSTS)**: Enforces HTTPS connections
- **X-Content-Type-Options**: Prevents MIME-type sniffing
- **Referrer-Policy**: Controls referrer information sent with requests
- **Permissions-Policy**: Restricts browser features (geolocation, camera, microphone)

### Keystatic CMS Security
**IMPORTANT**: Keystatic is only available during local development and is disabled in production builds.
- Never expose the development server (`npm run dev`) to the public internet
- Keystatic provides unauthenticated local file system access at `/keystatic`
- Only run the dev server on localhost or trusted local networks
- Production builds automatically exclude Keystatic ([astro.config.mjs:11](astro.config.mjs#L11))

### External Content Security
**BusinessDesk Feed** ([src/lib/businessdeskFeed.ts](src/lib/businessdeskFeed.ts)):
- Validates all URLs are from `businessdesk.co.nz` domain before rendering
- Implements 10-second timeout to prevent hanging requests
- HTML entities are properly decoded but not executed
- Errors are handled gracefully without exposing internal details

### Dependency Security
- Automated `npm audit` runs on every deployment (audit-level: high)
- Deployment fails if high or critical vulnerabilities are detected
- Dependencies are locked via `package-lock.json`
- Production builds use `npm ci` to ensure reproducible installs

### Third-Party Resources
**Google Fonts**: Loaded from Google CDN without Subresource Integrity (SRI) hashes.
- Google Fonts doesn't officially support SRI due to dynamic content
- Consider self-hosting fonts if stricter security is required
- Current implementation uses `crossorigin` attribute for CORS

## Publishing Blog Posts

After creating/editing posts in Keystatic:
1. Changes are automatically saved to files in src/content/blog/
2. Commit and push to main branch
3. GitHub Actions will build and deploy automatically
