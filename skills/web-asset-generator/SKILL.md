---
name: web-asset-generator
description: Generate web assets including favicons, app icons (PWA), and social media meta images (Open Graph) for Facebook, Twitter, WhatsApp, and LinkedIn. Use when users need icons, favicons, social sharing images, or Open Graph images from logos or text slogans. Handles image resizing, text-to-image generation, and provides proper HTML meta tags.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  category: design
---

# Web Asset Generator

Generate professional web assets from logos or text slogans, including favicons, app icons, and social media meta images.

## Quick Start

When a user requests web assets:

1. **Clarify needs** if not specified:
   - What type of assets they need (favicons, app icons, social images, or everything)
   - Whether they have source material (logo image vs text/slogan)
   - For text-based images: color preferences

2. **Check for source material**:
   - If user uploaded an image: use it as the source
   - If user provides text/slogan: generate text-based images

3. **Check dependencies**:
   ```bash
   pip install Pillow
   ```
   For emoji support:
   ```bash
   pip install pilmoji emoji
   ```

4. **Run the appropriate script(s)** from the skill's scripts directory:
   - Favicons/icons: `python <skill_dir>/scripts/generate_favicons.py`
   - Social media images: `python <skill_dir>/scripts/generate_og_images.py`

5. **Provide the generated assets and HTML tags** to the user

## Workflows

### Generate Favicons and App Icons from Logo

```bash
python <skill_dir>/scripts/generate_favicons.py <source_image> <output_dir> [icon_type]
```

Arguments:
- `source_image`: Path to the logo/image file
- `output_dir`: Where to save generated icons
- `icon_type`: 'favicon', 'app', or 'all' (default: 'all')

Example:
```bash
python <skill_dir>/scripts/generate_favicons.py /path/to/logo.png ./public all
```

Generates:
- `favicon-16x16.png`, `favicon-32x32.png`, `favicon-96x96.png`
- `favicon.ico` (multi-resolution)
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`, `android-chrome-512x512.png`

### Generate Favicons from Emoji

```bash
python <skill_dir>/scripts/generate_favicons.py --emoji "🚀" <output_dir> favicon
python <skill_dir>/scripts/generate_favicons.py --emoji "☕" --emoji-bg "#F5DEB3" <output_dir> all
python <skill_dir>/scripts/generate_favicons.py --suggest "coffee shop" <output_dir> all
```

### Generate Social Media Meta Images from Logo

```bash
python <skill_dir>/scripts/generate_og_images.py <output_dir> --image <source_image>
```

### Generate Social Media Meta Images from Text

```bash
python <skill_dir>/scripts/generate_og_images.py <output_dir> --text "Your text here" [options]
```

Options:
- `--logo <path>`: Include a logo with the text
- `--bg-color <color>`: Background color (hex or name, default: '#4F46E5')
- `--text-color <color>`: Text color (default: 'white')

Example:
```bash
python <skill_dir>/scripts/generate_og_images.py ./public --text "Transform Your Business with AI" --logo ./logo.png --bg-color "#4F46E5"
```

### Generate Everything

```bash
python <skill_dir>/scripts/generate_favicons.py ./logo.png ./public all
python <skill_dir>/scripts/generate_og_images.py ./public --image ./logo.png
```

## Delivering Assets to User

After generating assets:

### 1. Show Generated HTML Tags

**Favicons:**
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
```

**Open Graph:**
```html
<meta property="og:image" content="/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="/twitter-image.png">
```

### 2. Offer Code Integration

Ask the user if they want help adding the tags to their codebase. Detect framework and offer to insert tags:

- **Next.js (App Router)**: `app/layout.tsx` or `app/layout.js`
- **Astro**: `src/layouts/*.astro`
- **SvelteKit**: `src/app.html`
- **Vue/Nuxt**: `app.vue` or `nuxt.config.ts`
- **Plain HTML**: `index.html` or `public/index.html`

### 3. Offer Testing Links

Provide testing validator links:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/
- Generic OG: https://www.opengraph.xyz/

## Validation

Run with `--validate` flag:
```bash
python <skill_dir>/scripts/generate_favicons.py logo.png ./public all --validate
python <skill_dir>/scripts/generate_og_images.py ./public --text "My Site" --validate
```

Validates: file sizes, dimensions, formats, contrast ratio (WCAG).

## Specifications

See `references/specifications.md` for detailed platform specs.

## Dependencies

- Python 3.6+
- Pillow: `pip install Pillow`
- pilmoji (optional, for emoji): `pip install pilmoji`
