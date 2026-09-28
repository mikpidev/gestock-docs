# Gestock Knowledge Base

Static knowledge base for Gestock. Production host: [documentation.gestock.site](https://documentation.gestock.site).

Gestock — POS en la nube + DTE para El Salvador.

The site is under construction. Two kinds of pages live here:

- **API** — the [API] Users matrix in `api/users.html` is published.
- **SaaS** — how-to cards on the home page are placeholders. Articles are not written yet.
- **Tenant** — tenant policies are a separate document. They are not part of the role matrix.

There is no build step and no CMS.

## Local preview

From the repository root:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Tests

```bash
node --test
```

`tests/site.test.mjs` checks every cell of the API role matrix, the home-page copy, and this deploy note.

## What the matrix says

Columns, in order: `superadmin`, `org_admin`, `store_admin`, `user`.

| Who is granted | Permission keys |
| --- | --- |
| `superadmin` | `companies.*` |
| `superadmin`, `org_admin` | `stores.*` |
| `superadmin`, `org_admin`, `store_admin` | `users.*`, `roles.assign`, `tax_info.*`, `hacienda_access.*`, `correlatives.*`, `dashboard.view`, `dashboard.download_pdf` |
| all four roles | `sales.*`, `customers.*`, `products.*`, `credit_notes.*`, `debit_notes.*`, `dte.download`, `dte.download_bulk`, `contingencies.*` |

`dashboard.view+download_pdf` is published as `dashboard.view` and `dashboard.download_pdf`. `dte.download+download_bulk` is published as `dte.download` and `dte.download_bulk`. Keys ending in `.*` stay as named here. `api/users.html` is the cell-by-cell source of truth.

The only role columns are those four. Tenant policy is not a fifth column.

## Deploy

Publish the repository root as a static site. Do not set a build command. Do not set a publish directory other than the root. `.nojekyll` is present so GitHub Pages serves the `api/` folder as written.

### GitHub Pages

1. Settings → Pages → Build and deployment → Deploy from a branch.
2. Branch: `main`. Folder: `/` (root).
3. The temporary URL is `https://<owner>.github.io/gestock-docs/` until the custom domain is attached.
4. After Miguel creates the DNS record below, set the custom domain to `documentation.gestock.site` in the Pages settings.

### Any other static host

Cloudflare Pages, Netlify, S3, or nginx:

- Build command: none
- Publish directory: repository root
- `api/users.html` is a real file. No SPA rewrite is required.

## DNS handoff (Miguel)

Miguel administers DNS for `gestock.site`. This repository does not change DNS.

After the static host shows a hostname, ask Miguel to add:

| Type | Name | Target |
| --- | --- | --- |
| CNAME | `documentation` | the hostname from the static host |

Examples of that target: `<owner>.github.io` on GitHub Pages, or `<project>.pages.dev` on Cloudflare Pages. Use the hostname the host displays for this project, without a path.

`documentation.gestock.site` is a subdomain, so a CNAME is the record to create. Attach the custom domain on the host only after that record exists.

## Future CMS

TBD. Do not implement a CMS, admin UI, or content database in this repository until that choice is written down. Keep the API matrix in `api/users.html`. Leave the SaaS cards as placeholders until there are articles to publish.
