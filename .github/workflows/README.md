# GitHub Actions

## Web CI (`web-ci.yml`)

### Pull Request

- `npm ci` + `vue-cli-service build` 校验构建

### Push to `main`

- 构建 Docker 镜像并推送到 GHCR：
  - `ghcr.io/w1412x/sharesdu-web:latest`
  - `ghcr.io/w1412x/sharesdu-web:sha-<short>`

## Web Release (`web-release.yml`)

在推送 tag `web-v*` 或手动触发时，发布带版本号的镜像：

- `ghcr.io/w1412x/sharesdu-web:<version>`
- `ghcr.io/w1412x/sharesdu-web:latest`

## 服务器自动上线

服务器上的 `auto_online.sh`、systemd unit、证书续期脚本等部署代码**不纳入本仓库**，仅保留在服务器（如 `/root/auto_online/`）。

自动上线流程：服务器检测 `origin/main` 新提交 → `docker pull ghcr.io/w1412x/sharesdu-web` → 重启容器。

## 首次使用 GHCR

若其他机器无法免登录拉取，将 Package 设为 **Public**：

GitHub → **Packages** → `sharesdu-web` → **Package settings** → **Change visibility**
