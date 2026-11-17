# Backend deploy (home-server-1)

Pipeline: `.github/workflows/backend.yml`. On push to `main` touching `backend/**` or `deploy/**`:
test, then build and push the image to GHCR (`:sha` and `:latest`). Watchtower, running on
home-server-1, polls GHCR every 5 minutes and restarts the backend when `:latest` changes.
The frontend is deployed by Cloudflare Pages and is not part of this pipeline.

There is no self-hosted runner. The repo is public, and a fork pull request could otherwise
run its own code on the server. Nothing in GitHub can reach the server; the server only pulls.

Trade-offs: an update lands within about 5 minutes of the image being published, and Watchtower
does not wait for the health check or roll back. A bad image restarts the container and the
Docker healthcheck marks it unhealthy. Roll back by hand (see Operations).

## One-time server setup

1. Create the app dir. Uploads stay in your existing host folders (audio and images are
   separate mounts). Give both to the container user (uid 1000), existing files included:

   ```bash
   sudo mkdir -p /opt/mkc
   sudo chown -R 1000:1000 <path-to-host-upload-audio> <path-to-host-upload-images>
   ```

2. Tell compose where the folders are, in `/opt/mkc/.env`:

   ```bash
   sudo tee /opt/mkc/.env <<'EOF'
   AUDIO_DIR=<path-to-host-upload-audio>
   IMAGES_DIR=<path-to-host-upload-images>
   EOF
   ```

   These map to `/app/uploads/audio` and `/app/uploads/images`. `AUDIO_STORAGE` and
   `IMAGE_STORAGE` in `backend.env` must stay `/uploads/audio` and `/uploads/images`.

3. Create `/opt/mkc/backend.env` from `backend/.env.example`. Set `NODE_ENV=production`,
   `DB_URI`, `JWT_SECRET`, `TURNSTILE_SECRET_KEY`, `GOOGLE_CLIENT_ID`, the `SMTP_*` values,
   `ALLOWED_ORIGINS` (exact Pages origin, no wildcard), `TRUST_PROXY=1` (cloudflared is one hop)
   and `IMAGE_STORAGE` / `AUDIO_STORAGE`. Then `chmod 600 /opt/mkc/backend.env`.
   The compose file forces `PORT=8080`, so leave `PORT` out.

4. Make the image pullable. Either set the GHCR package to **Public** (your profile, Packages,
   `mkc-songbook-backend`, Package settings, Change visibility). The image holds no secrets: env
   files are excluded from it and read from the server at run time. Or keep it private, run
   `docker login ghcr.io` on the server with a read-only token, and enable the commented
   `config.json` mount for Watchtower in the compose file.

5. Fetch the compose file and start the stack:

   ```bash
   cd /opt/mkc
   curl -fsSL https://raw.githubusercontent.com/xXRex45Xx/mkc-songbook/main/deploy/docker-compose.yml -o docker-compose.yml
   docker compose up -d --wait backend
   docker compose up -d
   ```

   Stop any old container that uses port 8080 first (`docker stop <old-name>`).

6. Point the Cloudflare Tunnel public hostname at `http://localhost:8080`. If cloudflared runs
   as a container, put it on a shared Docker network instead and target `http://mkc-backend:8080`.

7. Optional branch protection on `main`: require the `test` check.

## Operations

```bash
cd /opt/mkc
docker compose ps                  # health state
docker compose logs -f backend
docker compose logs -f watchtower  # what it pulled and when
```

Update the compose file itself (Watchtower only updates images, not this file):

```bash
cd /opt/mkc
curl -fsSL https://raw.githubusercontent.com/xXRex45Xx/mkc-songbook/main/deploy/docker-compose.yml -o docker-compose.yml
docker compose up -d
```

Update now instead of waiting for the poll: `docker compose pull backend && docker compose up -d backend`.

Manual rollback: pin an older commit image. Set `IMAGE_TAG=<older sha>` in `/opt/mkc/.env`, then
`docker compose up -d backend`. Watchtower will not move a container off a pinned sha tag. Remove
the `IMAGE_TAG` line to go back to `:latest`.
