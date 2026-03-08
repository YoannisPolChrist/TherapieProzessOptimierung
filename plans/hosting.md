## Firebase Hosting & Domains

These notes capture how to keep the therapy client web app on `therapieprozessunterstuetzung.web.app` without touching other custom domains such as `johanneschrist.com`.

### Deployment target

- Hosting configuration lives in [`firebase.json`](../firebase.json). The only hosting target is `therapyApp`, mapped to the site `therapy-client-app-live` via `.firebaserc`.
- Build the static web bundle before deploy: `npx expo export --platform web` so that `/dist` is fresh.
- Deploy only this target: `firebase deploy --only hosting:therapyApp`. This publishes to the web.app + firebaseapp.com URLs and any aliases that site owns.

### Domain separation

- `johanneschrist.com` should **not** be attached to the `therapy-client-app-live` site. If it appears under `firebase hosting:sites:list`, remove it or reattach it to a different site so that its DNS stays independent.
- The therapy app can keep using the default domain `https://therapieprozessunterstuetzung.web.app/` until a new, dedicated custom domain is verified and mapped to the same hosting site.
- Email templates and Cloud Functions currently link to the web.app domain. If you ever point to a custom domain again, update the URLs in `functions/src/index.ts` to avoid confusing users.

### Recommended checks before deploying

1. `firebase hosting:sites:list` – verify only `therapy-client-app-live` is tied to the therapy app.
2. `firebase hosting:channels:list --site therapy-client-app-live` – optional sanity check for preview channels.
3. After deploy, confirm that `https://therapieprozessunterstuetzung.web.app/` serves the new build and that `johanneschrist.com` continues to serve its own site.
