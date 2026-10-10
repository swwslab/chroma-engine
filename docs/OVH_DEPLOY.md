# OVH deployment — CHROMA ENGINE (staging)
Status: prepared, **not deployed**.

## Existing infrastructure (from prior SWWS deployment)
- OVH VPS previously configured: `152.228.239.180`, SSH account `ubuntu`.
- STL viewer intended at `viewer.swws.net`, with Node.js `/proxy` for Dropbox. **Do not touch its processes, reverse proxy, certificates, or files.**
- Proposed independent hostname: `chroma.swws.net`.
- Source branch: `dev/chroma-v0.1`; no merge into `main`.

## Required read-only preflight (on the VPS, authorized SSH session)
```bash
hostname; id; pwd
sudo nginx -T 2>&1 | grep -E 'server_name|root |proxy_pass' | head -100
sudo ss -lntp
ls -la /var/www
systemctl --type=service --state=running | grep -E 'nginx|apache|node|pm2' || true
```
Do not run any modifications until the existing Nginx configuration, document roots and DNS have been checked.

## Safe static deployment plan (after preflight)
1. Create a dedicated web root, e.g. `/var/www/chroma-engine`, only after confirming it does not already contain user files.
2. Upload/copy **index.html and src/toolpath.mjs**, preserving relative paths.
3. Create an isolated Nginx server block for `chroma.swws.net` with `root /var/www/chroma-engine`, `index index.html`, and `try_files $uri $uri/ =404`.
4. Configure DNS A record for `chroma.swws.net` pointing to the **verified** current VPS address; do not change other records.
5. Run `sudo nginx -t` before reloading Nginx; configure HTTPS certificate for this hostname only.
6. Verify both `chroma.swws.net` and the existing `viewer.swws.net` after deploy.

## Browser testing
- Open CHROMA via HTTPS (not via file://; the UI uses ES module imports).
- Confirm profile, patterns, colors, layer slider, and CSV exports.
- Open browser console and confirm `src/toolpath.mjs` loads without 404/CORS errors.
- Run `npm test` locally (Node 18+). Tests are not yet confirmed executed.

## Boundaries
- No Bambu A1 G-code or AMS Lite commands are emitted.
- No changes to other repositories or their deployed services.
- No deployment without authorized OVH/SSH access and verification.
