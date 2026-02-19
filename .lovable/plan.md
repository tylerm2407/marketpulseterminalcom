

# Fix iOS Build Workflow and Apply ASO Changes

## What This Does
Stops the iOS build from failing on every push by making it manual-only, and updates the app display name to "MarketPulse" for the App Store.

## Changes

### 1. GitHub Actions Workflow (`.github/workflows/ios.yml`)
- Remove the `push: branches: [main]` trigger so builds only run when you manually trigger them
- Keep `workflow_dispatch` so you can run it from GitHub when you're ready with all the Apple signing secrets

### 2. Capacitor Config (`capacitor.config.ts`)
- Change `appName` from `'MarketPulseTerminal'` to `'MarketPulse'` (this is what shows under the app icon on the home screen)

### 3. iOS Info.plist (`ios-config/Info.plist.additions.xml`)
- Update `CFBundleDisplayName` to `'MarketPulse'` if not already set

Once these changes are made, you can re-add the GitHub repository and pushes will no longer trigger the failing iOS build. When you have all the Apple signing secrets configured, you can manually trigger the build from the GitHub Actions tab.

