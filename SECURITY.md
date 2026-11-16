# Security / 安全说明

## English

This bundle handles user-supplied gateway tokens. Store tokens through the dashboard; never hard-code them into source, environment examples, test fixtures, screenshots, browser exports or issue reports.

The DSH profile credential provider owns durable storage. Only authenticated DSH owners may access the plugin's profile route, but all owners of that profile share its saved sites. Tokens are returned to an authorized browser and sent directly to the selected gateway. `no-store` prevents HTTP caching; it does not provide additional encryption. Use HTTPS for remote DSH deployments and gateways, and trust anyone who has owner access to that profile.

Browser copies from earlier versions are retained after migration. Remove those copies only after verifying server restoration, and only if you intend to remove them. Repository cleanup and packaging never read or erase runtime credentials.

Before committing, run `npm run check:secrets`. Before distributing a tarball, scan that exact archive and verify its file list and checksum. The scanner checks known token formats, private keys, non-example credential assignments, deployment paths and reachable Git history. Detection rules are necessarily incomplete; also review unfamiliar binary files, environment/config exports and generated output manually. Do not upload private incident evidence to a public issue.

For a suspected leak, stop distribution, revoke the exposed credential at its issuer, replace it in the dashboard, and review affected Git history and releases before sharing again. Do not force-push shared history without coordinating with the repository owner. Use GitHub private vulnerability reporting when the repository owner enables it; otherwise request a private contact channel without including the secret.

## 中文

本插件处理用户输入的中转站 Token。请通过仪表盘保存 Token，不要将真实值写入源码、环境示例、测试、截图、浏览器导出文件或问题报告。

持久化由 DSH profile 的凭据提供器负责。插件站点路由仅允许已认证 owner 访问，但同一 profile 的所有 owner 共享已保存站点。Token 会返回到获准的浏览器，并直接发送到所选中转站。`no-store` 用于避免 HTTP 缓存，不提供额外加密。远程部署应使用 HTTPS，并确保所有 owner 都是可信人员。

旧版本浏览器副本会在迁移后保留。仅在确认服务器可恢复数据、且确实希望清除本地副本时自行删除。仓库清理和打包不会读取或删除运行凭据。

提交前运行 `npm run check:secrets`；分发前扫描最终压缩包，核对文件清单与校验和。扫描器检查已知 Token 格式、私钥、非示例凭据赋值、部署路径与可达 Git 历史，但检测规则并不完备。陌生二进制、环境/配置导出与生成文件仍需人工检查，私人事故材料不应进入公开 issue。

如疑似泄漏，先停止分发，在凭据签发方撤销相关凭据，更新仪表盘，再检查受影响的 Git 历史与发布资产。未经仓库所有者协调，不要强制覆盖共享历史。如果仓库启用了 GitHub 私密漏洞报告，请使用该渠道；否则先请求私密联系方式，不要在请求中附带秘密。
