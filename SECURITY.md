# Security / 安全说明

## English

This bundle handles account passwords, short-lived TOTP temporary tokens, access tokens, and rotating refresh tokens. Passwords are used only for the login request. Manually entered access tokens are sent to the Host credential provider and cleared from the form after saving; they are not placed in browser persistent storage. Temporary TOTP tokens and the access/refresh token pair are persisted only in the DSH profile credential provider. Refresh tokens are never returned to the Client, included in dashboard responses, or written to logs. The optional account Token-only result contains only an access token.

The DSH credential record is shared by authenticated owners of the current profile; it is not isolated per Web account. Dashboard payloads are reduced to fields used by the UI and held only in page memory. All plugin routes use `Cache-Control: no-store`; this prevents HTTP caching but does not provide additional encryption. The DSH credential provider controls storage-at-rest protection. Users can delete a saved site or remove the complete plugin credential record from the UI.

Host requests accept HTTPS origins only. DNS results are checked against private/reserved address ranges and pinned for each request; redirects are not followed. Request and response bodies are capped, upstream cookies are not forwarded, and error responses are sanitized. No authorized third-party integration for CodeKey.ai's interactive challenge was found: complete verification on the gateway's official page and use an access token the gateway authorizes, if provided. The plugin does not generate or bypass challenge results. These controls reduce, but do not eliminate, risks from a compromised DSH Host, a compromised public gateway, or owners with access to the profile.

Older browser token copies are migrated to the DSH credential record before being cleared. A failed migration leaves the browser copy intact. Repository checks and packaging never read runtime credentials. Do not add real credentials, user data, screenshots, browser exports or production configuration to source control or public issues.

Before committing, run `npm run check` and `npm run check:secrets`. Before distributing a tarball, scan that exact archive and verify its file list and checksum. The scanner covers known token formats, private keys, non-example credential assignments, deployment paths and reachable Git history; its rules are necessarily incomplete. Review generated output and unfamiliar binaries manually.

For a suspected leak, stop distribution, revoke the exposed credential at its issuer, sign in again to rotate credentials, and review affected Git history and releases before sharing again. Do not force-push shared history without coordinating with the repository owner. Use GitHub private vulnerability reporting when available; otherwise request a private contact channel without including the secret.

## 中文

本插件处理账号密码、短时 TOTP 临时 Token、访问 Token 与轮换 Refresh Token。密码仅用于登录请求。手动输入的访问 Token 会发送给 Host 凭据提供器，保存后从表单清空，不写入浏览器持久存储。TOTP 临时 Token 和访问/Refresh Token 凭据对仅持久化在 DSH profile 凭据提供器中。Refresh Token 不会返回 Client、包含在仪表盘响应或写入日志。账号登录的“仅 Token”响应只包含访问 Token。

当前 DSH profile 的已认证 owner 共享凭据记录，并非按 Web 账号隔离。仪表盘响应会筛选为界面使用字段，仅在页面内存中处理。插件路由设置 `Cache-Control: no-store`，用于避免 HTTP 缓存，但不提供额外加密。静态存储保护由 DSH 凭据提供器负责。用户可从界面删除单站凭据，或移除插件的完整凭据记录。

Host 只接受 HTTPS 来源。DNS 解析结果会与私有/保留地址段比对，并固定地址发起请求；不跟随重定向。请求和响应大小受限，不转发上游 Cookie，错误信息会清洗。尚未找到 CodeKey.ai 对第三方插件开放的授权交互式验证集成：请在中转站官方页面完成验证，再使用该站授权提供的访问 Token（如果站点提供）。插件不会生成或绕过验证结果。这些措施只能降低风险，无法消除 DSH Host、中转站或 profile owner 被攻破带来的风险。

旧版浏览器 Token 会先迁移到 DSH 凭据记录，之后才清除浏览器副本。迁移失败时保留浏览器数据。仓库检查和打包不会读取运行凭据。不要把真实凭据、用户数据、截图、浏览器导出或生产配置加入源码仓库或公开 issue。

提交前运行 `npm run check` 与 `npm run check:secrets`。分发前扫描最终压缩包并核对文件清单和校验和。扫描器检查已知 Token 格式、私钥、非示例凭据赋值、部署路径与可达 Git 历史，但检测规则不可能穷尽。生成文件和陌生二进制仍需人工检查。

如疑似泄漏，先停止分发，在凭据签发方撤销暴露凭据，重新登录轮换凭据，并检查受影响的 Git 历史与发布资产。未经仓库所有者协调，不要强制覆盖共享历史。若仓库启用了 GitHub 私密漏洞报告，请使用该渠道；否则先请求私密联系方式，不要在请求中附带秘密。
