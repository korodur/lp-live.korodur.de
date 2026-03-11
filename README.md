# lp-live.korodur.de

KORODUR Landing Pages auf eigener Subdomain via GitHub Pages.

## Landing Pages

| Seite | Temporaere URL (funktioniert jetzt) | Finale URL (nach DNS-Setup) |
|-------|--------------------------------------|----------------------------|
| Rapid Set ARM | [GitHub Pages](https://korodur.github.io/lp-live.korodur.de/arm/) | https://lp-live.korodur.de/arm/ |
| MICROTOP TW | [GitHub Pages](https://korodur.github.io/lp-live.korodur.de/microtop-tw/) | https://lp-live.korodur.de/microtop-tw/ |

## Setup-Anleitung

GitHub Pages ist bereits aktiviert (Branch `main`, Root `/`).
Es fehlen noch **2 Schritte**, damit die Seiten unter `lp-live.korodur.de` erreichbar sind:

### Schritt 1: DNS-Eintrag anlegen (Domain-Provider / DNS-Admin)

Einen **CNAME-Record** anlegen:

```
Typ:   CNAME
Host:  lp-live
Ziel:  korodur.github.io
TTL:   3600 (oder Standard)
```

> Hinweis: Aenderungen koennen bis zu 24h dauern, sind aber meistens in wenigen Minuten aktiv.

### Schritt 2: Custom Domain in GitHub eintragen

1. https://github.com/korodur/lp-live.korodur.de/settings/pages oeffnen
2. Unter **"Custom domain"**: `lp-live.korodur.de` eingeben > **Save**
3. Warten bis "DNS check successful" erscheint (gruenes Haekchen)
4. **"Enforce HTTPS"** aktivieren (Checkbox erscheint nach DNS-Verifizierung)

### Pruefen

Nach beiden Schritten sollten diese URLs funktionieren:
- https://lp-live.korodur.de/arm/
- https://lp-live.korodur.de/microtop-tw/

## Struktur

```
arm/
  index.html              # Rapid Set ASPHALT REPAIR MIX Landing Page
  assets/                 # Bilder, Logo, Berater-Fotos (19 Dateien)
microtop-tw/
  index.html              # MICROTOP TW Landing Page
  img/                    # Bilder, Logo, Referenzfotos (14 Dateien)
CNAME                     # GitHub Pages Custom Domain Config
```
