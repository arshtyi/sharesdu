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

## 服务器部署

服务器上的自动上线脚本、systemd 服务、证书续期等运维配置不在本仓库维护，请在服务器本地管理。

拉取镜像示例：

```bash
docker pull ghcr.io/w1412x/sharesdu-web:latest
```

若其他机器无法免登录拉取，将 Package 设为 **Public**：

GitHub → **Packages** → `sharesdu-web` → **Package settings** → **Change visibility**
