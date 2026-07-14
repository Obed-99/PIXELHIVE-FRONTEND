# PixelHive — Mobile / Web App

Cross-platform Expo app for PixelHive: digital asset management and secure
delivery for freelance videographers and creators.

## Live demo
- **Web / installable app:** https://obed-99-mobile.expo.app
  (on a phone: open in the browser → share → *Add to Home Screen*)
- **Expo Go:** published to the `preview` branch of project `mobile`
  (account `obed-99`), runtime `exposdk:54.0.0`
- **Backend API:** https://pixelhive-backend-production.up.railway.app
- **Demo login:** `obed@pixelhive.com` / `secret123`

## The core flow
1. Creator uploads a real picture from their device (expo-image-picker)
2. Client sees a **watermarked preview** (solid logo overlay)
3. Client reviews and **signs the generated contract**
4. Client **pays** (Paystack test-mode checkout, or demo fallback)
5. Verified payment **releases the original files**

## Features
- **Animated splash screen** — glow, spring-in logo, shimmer loader
- **JWT sessions** — login/signup store a token; every API call sends it
- **Home** — search, auto-advancing photo slideshow, recent + trending
- **Projects** — photo cards, status filter chips, portfolio total
- **Messages** — conversation list with latest message previews + chat
- **Uploads** — device photo library, preview before upload, dynamic
  price suggestion (resolution auto-detected, quality chips)
- **Analytics** — views and downloads recorded and shown per project
- **Theme** — dark (default) and light mode, toggle in the Home header
  and Profile; every screen restyles live via `useTheme()`

## Tech
Expo SDK 54 · React Native 0.81 · React 19 · TypeScript ·
React Navigation (native-stack) · expo-image-picker

## Run locally
```bash
npm install
npx expo start          # phones via Expo Go (add --tunnel off-network)
npx expo start --web    # browser
```

## Deploy
```bash
# Web (Expo Hosting)
npx expo export -p web
npx eas-cli deploy --prod

# Expo Go (EAS Update, cloud-hosted)
npx eas-cli update --branch preview --message "..."
```
After a web export, re-add the PWA head tags to `dist/index.html` and copy
`public/manifest.json` + `public/pixelhive-icon.png` into `dist/`.

## Layout
```
src/
  api.ts          Backend calls (JWT attached automatically)
  auth.ts         In-memory session (user + token)
  theme.ts        Dark/light palettes + live theme store
  covers.ts       Project cover photos, matched by title
  components/     TabBar
  screens/        Splash, Login, Signup, Home, Projects, ProjectDetail,
                  Contract, Payment, Upload, Chat, Messages,
                  Notifications, Profile, AccountSettings
scripts/
  make-brand-assets.js   Regenerates icon/splash/favicon from the logo
  make-covers.js         Compresses project cover photos
```
