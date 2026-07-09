# SEM Lab website

Static website for the **Somatic Evolution Monitoring Lab**, built with [Hugo](https://gohugo.io) (extended) and deployed free on GitHub Pages.

## Quick start (local preview)

```bash
# 1. Install Hugo extended (>= 0.148)
#    macOS:  brew install hugo
#    Linux:  see https://gohugo.io/installation/

# 2. Preview with live reload
hugo server
#    → open http://localhost:1313
```

## Where to edit things

| I want to change… | Edit this |
|---|---|
| Lab name, tagline, email, social links | `hugo.toml` → `[params]` |
| Navigation menu | `hugo.toml` → `[menu]` |
| Homepage mission statement | `content/_index.md` |
| Research page text | `content/research/_index.md` |
| **People** (add/remove members) | `data/people.yaml` |
| **Publications** | `data/publications.yaml` |
| Homepage research cards + stats | `data/research.yaml` |
| **News** posts | add a `.md` file in `content/news/` |
| **Gallery** captions/images | `data/gallery.yaml` + `static/images/gallery/` |
| Opportunities / Contact text | `content/opportunities/_index.md`, `content/contact/_index.md` |
| Colours / fonts | `assets/css/main.css` → `:root` |

### Images
- **Group photo:** drop a file at `static/images/group.jpg` (auto-used on the homepage).
- **Headshots:** put files in `static/images/people/` and add `photo: filename.jpg` to that person in `data/people.yaml`. Without a photo, initials are shown.
- **Gallery:** put files in `static/images/gallery/` matching the `image:` names in `data/gallery.yaml`.

## Deploying to GitHub Pages (with a custom domain)

1. Create a repo on GitHub and push this project (see git notes below).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   The included workflow (`.github/workflows/hugo.yml`) builds and deploys on every push to `main`.
3. **Custom domain:** `static/CNAME` already contains `semlab.com`. At your registrar, add DNS records:
   - Four `A` records for the apex `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One `CNAME` record for `www` → `<your-github-username>.github.io`
   Then in **Settings → Pages** enter `semlab.com` as the custom domain and tick **Enforce HTTPS**.
   (Change the domain in both `static/CNAME` and `hugo.toml` `baseURL` if it differs.)

DNS usually propagates within an hour or two; the HTTPS certificate is issued automatically.

## Git workflow

Work happens on the `claude` branch; `main` is deployment-only. Merge `claude` → `main` when ready to publish. Build output (`/public`, `/resources`) is git-ignored.
