# Još — jos.rs

Static website for Još (bento cakes and tiramisu, Veternik / Novi Sad). Plain HTML, CSS and a little JavaScript, no build step. All code is in English; only the text shown to visitors is in Serbian (Latin script).

## Local development

```sh
python3 -m http.server 8000
```

then open http://localhost:8000.

## Structure

- `index.html` — the whole page, meta and Open Graph tags, JSON-LD (`Bakery`)
- `css/style.css` — BEM styles and self-hosted fonts (Playfair Display, Cormorant Garamond; latin + latin-ext)
- `js/main.js` — intro animation, mobile menu (popover + `commandfor`), "build your own cake" form
- `img/` — logo (SVG), photos (AVIF / WebP / JPEG), Open Graph image, touch icon
- `robots.txt`, `sitemap.xml`, `404.html`, `.nojekyll`

Section anchors (`#ponuda`, `#napravi`, `#kako`, `#prica`, `#kontakt`, `#instagram`) stay in Serbian because they show up in the address bar.

## Content Security Policy

`index.html` ships a CSP in a `<meta>` tag. The small inline script in `<head>` (intro timing) is allowed by its SHA-256 hash, so **after editing that script, recompute the hash** and update `script-src`:

```sh
python3 -c "import re,hashlib,base64;s=open('index.html').read();m=re.search(r'<script>(.*?)</script>',s,re.S);print(base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode())"
```

GitHub Pages cannot send response headers, so `frame-ancestors` / `X-Frame-Options` are not available there.

## Deployment (GitHub Pages)

1. Push to GitHub, then Settings › Pages › Deploy from branch › `main` / root.
2. For the jos.rs domain add a `CNAME` file containing `jos.rs` and configure DNS at the registrar.
3. All absolute URLs (canonical, Open Graph, sitemap, JSON-LD) use `https://jos.rs/` — update them if the domain changes.

## To do

- The phone number `+381601234567` is a placeholder (`index.html`, `js/main.js`).
- A photo of a bento cake (the offer tile has no image yet).
- Confirm the cake flavours in the builder (Vanila, Čokolada, Crvena kadifa, Pistać).
