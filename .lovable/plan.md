

# Add JSON-LD Structured Data and Smart App Banner

## Changes to `index.html`

### 1. Smart App Banner Meta Tag
Add the `apple-itunes-app` meta tag in the `<head>` section. This makes Safari on iOS show a native "Open in App" banner at the top of the page.

- You will need your **App Store ID** once the app is published. For now, a placeholder ID will be used that you can update later.
- Format: `<meta name="apple-itunes-app" content="app-id=YOUR_APP_STORE_ID, app-argument=https://marketpulseterminal.com">`

### 2. JSON-LD SoftwareApplication Schema
Add a `<script type="application/ld+json">` block in the `<head>` with a `SoftwareApplication` schema that includes:

- **name**: MarketPulse
- **applicationCategory**: FinanceApplication
- **operatingSystem**: iOS, Web
- **description**: AI-powered stock analysis with screener, alerts, and research
- **offers**: Free tier and Pro tier ($19.99/mo)
- **aggregateRating** placeholder (can be updated once you have real ratings)
- **author/publisher**: NovaWealth

This helps Google display rich results (app info boxes, pricing, ratings) when people search for MarketPulse.

### 3. Also update meta tags (from previously approved ASO plan)
- **Title**: "MarketPulse -- AI Stock Analysis"
- **Meta description**: Keyword-rich rewrite
- **OG tags**: Updated title and description
- **Twitter tags**: Add title and description

---

## Technical Details

### File Modified
| File | What Changes |
|------|-------------|
| `index.html` | Add Smart App Banner meta tag, JSON-LD script block, update title/description/OG tags |

### Smart App Banner Note
The `app-id` value needs to be your actual Apple App Store ID (a numeric ID like `123456789`). A placeholder will be inserted -- replace it once your app is live on the App Store. You can find your App Store ID in App Store Connect under "App Information".

### JSON-LD Schema Structure
```text
SoftwareApplication
  +-- name: "MarketPulse"
  +-- applicationCategory: "FinanceApplication"
  +-- operatingSystem: "iOS, Web"
  +-- offers: [Free, Pro $19.99/mo]
  +-- author: { Organization: "NovaWealth" }
```

No new files or dependencies needed -- just updates to `index.html`.
