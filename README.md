# lp-live.korodur.de

KORODUR Landing Pages auf eigener Subdomain via GitHub Pages.

**Live-URL:** https://lp-live.korodur.de

## Landing Pages

| Seite | URL |
|-------|-----|
| Rapid Set ASPHALT REPAIR MIX | https://lp-live.korodur.de/arm/ |
| MICROTOP TW Trinkwasser | https://lp-live.korodur.de/microtop-tw/ |

## Setup-Anleitung (IT)

### Schritt 1: DNS-Eintrag (IT-Admin bei Domain-Provider)

Einen **CNAME-Record** anlegen:

```
Typ:   CNAME
Host:  lp-live
Ziel:  korodur.github.io
TTL:   3600 (oder Standard)
```

Das heisst: `lp-live.korodur.de` zeigt auf `korodur.github.io`.

### Schritt 2: GitHub Pages aktivieren (Repo-Settings)

1. Repo oeffnen: https://github.com/korodur/lp-live.korodur.de
2. **Settings** > **Pages** (linke Sidebar)
3. **Source**: "Deploy from a branch" > Branch `main` / Ordner `/ (root)` > **Save**
4. **Custom domain**: `lp-live.korodur.de` eingeben > **Save**
5. Warten bis DNS verifiziert (kann bis zu 24h dauern, meistens Minuten)
6. **Enforce HTTPS** aktivieren (Checkbox erscheint nach DNS-Verifizierung)

### Schritt 3: Pruefen

- https://lp-live.korodur.de/arm/ sollte die ARM Landing Page zeigen
- https://lp-live.korodur.de/microtop-tw/ sollte die MICROTOP TW Landing Page zeigen

## Struktur

```
arm/
  index.html              # Rapid Set ASPHALT REPAIR MIX Landing Page
  assets/                 # Bilder, Logo, Berater-Fotos
microtop-tw/
  index.html              # MICROTOP TW Landing Page
  img/                    # Bilder, Logo, Referenzfotos
CNAME                     # GitHub Pages Custom Domain Config
```
