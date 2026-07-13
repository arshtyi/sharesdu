# GitHub Actions

## Web CI (`web-ci.yml`)

Runs on pull requests and pushes to `main` when files under `web/` change.

- Installs dependencies with `npm ci`
- Builds production bundle with `vue-cli-service build`
- Uploads `web/dist` as a short-lived workflow artifact (7 days)

## Web Release (`web-release.yml`)

Builds a Docker image from `web/Dockerfile` and publishes it to **GitHub Container Registry (GHCR)**.

Image: `ghcr.io/w1412x/sharesdu-web`

### Trigger by tag (recommended)

```bash
git tag web-v0.1.1
git push origin web-v0.1.1
```

Tag format must start with `web-v`.

### Trigger manually

1. Open **Actions → Web Release → Run workflow**
2. Enter version without prefix, e.g. `0.1.1`

### Pull and run on another server

```bash
docker pull ghcr.io/w1412x/sharesdu-web:0.1.1
docker run -d --name sharesdu-web -p 80:80 ghcr.io/w1412x/sharesdu-web:0.1.1
```

With HTTPS (mount certs at runtime):

```bash
docker run -d --name sharesdu-web \
  -p 80:80 -p 443:443 \
  -v /path/to/cert.pem:/etc/ssl/certs/cert.pem:ro \
  -v /path/to/privkey.pem:/etc/ssl/private/privkey.pem:ro \
  -v /path/to/chain.pem:/etc/ssl/certs/chain.pem:ro \
  ghcr.io/w1412x/sharesdu-web:0.1.1
```

Or from the repo:

```bash
cd web
docker compose up -d
```

### Make the image public (first time)

If other servers cannot pull without login:

1. GitHub → **Packages** → `sharesdu-web`
2. **Package settings** → **Change visibility** → **Public**

### TLS behavior

- **No certs mounted**: nginx serves HTTP on port 80 only.
- **Certs mounted** to `/etc/ssl/certs/cert.pem` and `/etc/ssl/private/privkey.pem`: HTTPS config is enabled (HTTP redirects to HTTPS).
