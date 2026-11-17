# Backend deploy (home-server-1)

Pipeline: `.github/workflows/backend.yml`. On push to `main` touching `backend/**` or `deploy/**`:
test, build and push to GHCR (`:sha` and `:latest`), then a self-hosted runner on
home-server-1 pulls the `:sha` image and runs `docker compose up -d --wait`. If the
`/healthz` check fails, the job restores the previous tag and fails. The frontend is
deployed by Cloudflare Pages and is not part of this pipeline.

## One-time server setup

1. Create the app dir. Uploads stay in your existing host folders (audio and images are
   separate mounts). Give both to the container user (uid 1000), existing files included:

   ```bash
   sudo mkdir -p /opt/mkc
   sudo chown -R 1000:1000 <path-to-host-upload-audio> <path-to-host-upload-images>
   ```

   Then tell compose where they are in `/opt/mkc/.env`. The deploy job edits only the
   `IMAGE_TAG` line and keeps these:

   ```bash
   cat >> /opt/mkc/.env <<'EOF'
   AUDIO_DIR=<path-to-host-upload-audio>
   IMAGES_DIR=<path-to-host-upload-images>
   EOF
   ```

   These map to `/app/uploads/audio` and `/app/uploads/images`. `AUDIO_STORAGE` and
   `IMAGE_STORAGE` in `backend.env` must stay `/uploads/audio` and `/uploads/images`.

2. Create `/opt/mkc/backend.env` from `backend/.env.example`. Set `NODE_ENV=production`,
   `DB_URI`, `JWT_SECRET`, `TURNSTILE_SECRET_KEY`, `GOOGLE_CLIENT_ID`, the `SMTP_*` values,
   `ALLOWED_ORIGINS` (exact Pages origin, no wildcard), `TRUST_PROXY=1` (cloudflared is one hop)
   and `IMAGE_STORAGE` / `AUDIO_STORAGE`. Then `chmod 600 /opt/mkc/backend.env`.
   The compose file forces `PORT=8080`, so leave `PORT` out.

3. Create a dedicated user, add it to the `docker` group, and install the GitHub Actions
   self-hosted runner as a service. Repo, Settings, Actions, Runners, New self-hosted runner.
   Give it the label `home-server-1`.

   ```bash
   sudo adduser --disabled-password --gecos "" ghrunner
   sudo usermod -aG docker ghrunner
   sudo chown ghrunner /opt/mkc
   ```

   The `docker` group is root-equivalent on that host. Use the runner only for this private
   repo, and never run it for `pull_request` events (the workflow already gates deploy to `main`).

4. In GitHub: Settings, Environments, create `production`. Optionally add a required reviewer
   for manual approval before each deploy.

5. Point the Cloudflare Tunnel public hostname at `http://localhost:8080`. If cloudflared runs
   as a container, put it on a shared Docker network instead and target `http://mkc-backend:8080`.

6. Optional branch protection on `main`: require the `test` check.

## Operations

```bash
cd /opt/mkc
docker compose ps                  # health state
docker compose logs -f backend
cat .env                           # IMAGE_TAG currently deployed
```

Manual rollback: set `IMAGE_TAG=<older sha>` in `/opt/mkc/.env`, then `docker compose up -d --wait backend`.
