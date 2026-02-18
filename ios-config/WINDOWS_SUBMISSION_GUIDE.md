# ═══════════════════════════════════════════════════════════════════════════════
# MarketPulseTerminal — iOS App Store Submission Guide (Windows Users)
# ═══════════════════════════════════════════════════════════════════════════════
#
# WHAT HAS BEEN DONE FOR YOU (automatically):
# ✅ App icon (1024×1024)  →  src/assets/app-icon-1024.png
# ✅ Splash screen         →  src/assets/splash-screen.png
# ✅ Capacitor config      →  capacitor.config.ts
# ✅ iOS Info.plist config →  ios-config/Info.plist.additions.xml
# ✅ GitHub Actions build  →  .github/workflows/ios.yml
# ✅ Privacy Policy page   →  /privacy (live in the app)
# ✅ Push notifications    →  wired up in src/native/
# ✅ Deep linking          →  wired up in src/native/
# ✅ Offline detection     →  wired up in src/native/
# ✅ Native sharing        →  wired up in src/native/
#
# WHAT YOU NEED TO DO (one-time setup, all done from a browser on Windows):
# ═══════════════════════════════════════════════════════════════════════════════

# ── STEP 1: Apple Developer Account ──────────────────────────────────────────
# Cost: $99/year
# URL: https://developer.apple.com/enroll/
# - Enroll as an Individual or Organization (use your NovaWealth company)
# - Wait for approval (can take 1-2 days for organizations)

# ── STEP 2: Create App Store Connect listing ─────────────────────────────────
# URL: https://appstoreconnect.apple.com
# - Click "My Apps" → "+" → "New App"
# - Platform: iOS
# - Name: MarketPulseTerminal
# - Primary Language: English (US)
# - Bundle ID: com.novawealth.marketpulseterminal
# - SKU: MKTPULSE-001-2026
# - Fill in description, keywords, screenshots, privacy policy URL:
#   https://marketpulseterminal.com/privacy

# ── STEP 3: Create App Store Connect API Key ─────────────────────────────────
# URL: https://appstoreconnect.apple.com/access/api
# - Click "+" to create a new key
# - Name: "GitHub Actions"
# - Access: Developer
# - Download the .p8 file (you can only download ONCE — save it!)
# - Note your Key ID and Issuer ID

# ── STEP 4: Create Distribution Certificate ───────────────────────────────────
# You need a Mac friend OR a cloud Mac for this one step only:
# Option A — Use MacStadium cloud Mac: https://www.macstadium.com (free trial)
# Option B — Ask a friend with a Mac for 15 minutes
# On the Mac:
#   1. Open Keychain Access → Certificate Assistant → Request Certificate From CA
#   2. Upload the .certSigningRequest to: https://developer.apple.com/account/resources/certificates/add
#   3. Select "Apple Distribution", download the certificate
#   4. Double-click to import into Keychain
#   5. In Keychain, right-click certificate → Export → Save as .p12 with a password
#   6. Base64 encode it: base64 -i certificate.p12 | pbcopy

# ── STEP 5: Create Provisioning Profile ──────────────────────────────────────
# URL: https://developer.apple.com/account/resources/profiles/add
# - Type: App Store Connect Distribution
# - App ID: com.novawealth.marketpulseterminal
# - Certificate: select the one you just created
# - Name: "MarketPulseTerminal AppStore"
# - Download the .mobileprovision file
# - Base64 encode it: base64 -i profile.mobileprovision (or use an online base64 tool)

# ── STEP 6: Export project to GitHub ─────────────────────────────────────────
# In Lovable: Settings → GitHub → Export to GitHub
# Create a new repository (can be private)

# ── STEP 7: Add GitHub Secrets ────────────────────────────────────────────────
# In your GitHub repo: Settings → Secrets and variables → Actions → New secret
# Add all of these:
#
# Secret Name                        | Value
# ─────────────────────────────────────────────────────────────────────────────
# BUILD_CERTIFICATE_BASE64           | Base64 of your .p12 certificate file
# P12_PASSWORD                       | Password you set when exporting the .p12
# KEYCHAIN_PASSWORD                  | Any random password (e.g. "temp-keychain-pw")
# BUILD_PROVISION_PROFILE_BASE64     | Base64 of your .mobileprovision file
# PROVISIONING_PROFILE_NAME          | "MarketPulseTerminal AppStore"
# APPLE_TEAM_ID                      | Your 10-char Team ID from developer.apple.com
# APP_STORE_CONNECT_KEY_ID           | Key ID from Step 3
# APP_STORE_CONNECT_ISSUER_ID        | Issuer ID from Step 3
# APP_STORE_CONNECT_API_KEY_BASE64   | Base64 of the .p8 file from Step 3

# ── STEP 8: Trigger the build ─────────────────────────────────────────────────
# Push any commit to the `main` branch, OR go to:
# GitHub repo → Actions → "iOS Build & App Store Deploy" → "Run workflow"
# The GitHub Actions runner (macOS cloud) will:
#   - Build the web app
#   - Package it with Capacitor
#   - Sign it with your certificate
#   - Upload it to App Store Connect automatically

# ── STEP 9: Submit for review ─────────────────────────────────────────────────
# URL: https://appstoreconnect.apple.com
# - Go to your app → TestFlight (to test first) or App Store tab
# - Select the build that was uploaded by GitHub Actions
# - Fill in the "What's New" text
# - Click "Submit for Review"
# - Apple review usually takes 1-3 days

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY: You need a Mac for ~15 minutes (Step 4 only) to create the
# signing certificate. Everything else is done from your Windows browser.
# ═══════════════════════════════════════════════════════════════════════════════
