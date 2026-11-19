# 1.2.0

## English

- Add a one-command installer for adding the reviewed bundle to another local DSH profile through the supported `dsh plugin` CLI.
- Keep DSH authentication local to each installation; do not inspect startup logs or transfer process tokens or authenticated sessions.
- Remove gateway-browser `localStorage` token-format guidance; accept only gateway-authorized API tokens.
- Add installer argument/error tests and document restart persistence and compatibility limits.

## 中文

- 增加通过受支持的 `dsh plugin` CLI 将 bundle 一键安装到其他本地 DSH profile 的命令。
- DSH 登录认证仍由每个安装实例独立管理；不读取启动日志、不转交进程 Token 或登录会话。
- 移除依赖网关浏览器 `localStorage` Token 格式的操作指导，仅使用网关授权的 API Token。
- 增加导入参数/异常测试，并说明重启持久性与兼容性边界。

This local patch does not publish a release or marketplace update.

# 1.1.7

## English

- Set manually entered access tokens to expire 24 hours after successful Host persistence, using the existing absolute `expiresAt` field.
- Restore the same per-site expiry across page reloads and route state recovery; expired manual tokens follow the existing reauthentication path without refresh attempts.

## 中文

- 手动录入的访问 Token 在 Host 成功保存后 24 小时过期，沿用现有绝对时间字段 `expiresAt`。
- 页面刷新和状态恢复时按站点恢复相同过期时间；手动 Token 过期后沿用现有重新登录流程，不尝试续期。

This local patch does not publish a release or marketplace update.

# 1.1.6

## English

- Show each credential's real expiry/next-update time and a live countdown when the gateway supplies `expires_in`.
- Restore time state per site after page re-entry; manual Tokens without expiry data remain explicitly marked as unavailable and are never treated as auto-renewable.

## 中文

- 中转站提供 `expires_in` 时展示对应凭据的真实过期/下次更新时间，并实时更新倒计时。
- 页面重新进入时按站点恢复时间状态；没有过期数据的手动 Token 明确显示不可用，不伪装成可自动续期凭据。

This local patch does not publish a release or marketplace update.

# 1.1.5

## English

- Persist per-site dashboard verification state after a successful Token query so returning to the page restores the correct card status.
- Keep automatic-renewal status tied to a real refresh token; distinguish verified manual Tokens without changing credential operations.

## 中文

- Token 成功查询仪表盘后持久化单站点验证状态，返回页面时恢复正确的站点卡片状态。
- 自动续期状态仍只由真实 Refresh Token 决定；已验证的手动 Token 单独显示，不改变凭据处理逻辑。

This local patch does not publish a release or marketplace update.

# 1.1.4

## English

- Extend the direct-token helper text with the requested official-site developer-console retrieval instruction; authentication and token handling are unchanged.

## 中文

- 在直接 Token 提示中追加指定的站点开发者工具取 Token 说明；不改动认证及 Token 处理逻辑。

This local patch does not publish a release or marketplace update.

# 1.1.3

## English

- Restore direct access-token login, Host-side persistence, automatic dashboard query, and saved-site recovery.
- Keep account/password and account Token-only modes; add an accessible segmented switch between credential methods.
- Clarify that interactive human verification must be completed through a gateway-supported official flow; the plugin does not solve or bypass challenges.

## 中文

- 恢复直接输入访问 Token、Host 端持久化、自动查询仪表盘和已保存站点恢复。
- 保留账号密码及账号登录后的“仅 Token”模式，并增加可键盘操作的登录方式切换。
- 明确交互式人机验证必须通过中转站官方流程完成；插件不会代解或绕过挑战。

This local patch does not publish a release or marketplace update.

# 1.1.2

## English

- Omit undefined optional fields at the persistence boundary to satisfy the real credential provider's strict JSON contract.
- Distinguish credential-store read, write, and delete failures; include only a safe OS error code or error class.
- Never return paths, raw provider messages, or credential values in diagnostics.

## 中文

- 区分凭据存储的读取、写入和删除错误；只附带安全的系统错误码或错误类型。
- 诊断信息不返回路径、提供器原始消息或凭据值。

This local patch does not publish a release or marketplace update.

# 1.1.1

## English

- Report DSH credential-provider failures with a sanitized, actionable error code.
- Include only a constrained JavaScript error class for otherwise-unclassified Host failures; never return raw exception details.

## 中文

- 将 DSH 凭据提供器故障转换为明确且脱敏的错误代码。
- 未分类 Host 异常仅返回受限的 JavaScript 错误类型，不返回原始异常详情。

This local patch does not publish a release or marketplace update.

# 1.1.0

## English

- Add Sub2API email/password login and verified TOTP two-factor completion.
- Persist the rotating access/refresh credential pair only in the DSH Host credential provider; never return refresh tokens to the Client.
- Refresh near-expiry access tokens and retry once after a gateway 401, serializing refresh-token rotation through `credentials.modifyRecord()`.
- Add separate dashboard-data and access-token-only modes, saved-site access-token retrieval, and per-site/all-site deletion.
- Move gateway requests to a Host HTTPS proxy with public-address validation, DNS pinning, no redirects, bounded payloads, and sanitized errors.
- Filter dashboard responses to fields rendered by the existing UI and migrate legacy browser token copies before clearing them.
- Add synthetic contract, privacy, refresh, mode isolation, migration, deletion, and route tests; update bilingual security documentation.

This source change is versioned 1.1.0 locally. It does not publish a release, alter marketplace entries, or update an installed profile automatically.

## 中文

- 增加 Sub2API 邮箱/密码登录与经接口契约核实的 TOTP 两步验证。
- 访问/Refresh Token 凭据对仅保存在 DSH Host 凭据提供器中；Refresh Token 不返回 Client。
- 临近过期时续期，网关返回 401 后重试一次，并通过 `credentials.modifyRecord()` 串行处理 Refresh Token 轮换。
- 增加“仪表盘数据”和“仅访问 Token”两种模式、已保存站点单独取 Token，以及单站/全部凭据删除。
- 将网关请求迁至 Host HTTPS 代理，验证公网地址并固定 DNS，不跟随重定向，限制数据体大小且清洗错误信息。
- 只返回现有 UI 使用的仪表盘字段；旧版浏览器 Token 先成功迁移再清除。
- 增加接口契约、隐私、续期、模式隔离、迁移、删除和路由合成测试，并更新双语安全文档。

本次仅将源码版本标记为 1.1.0，不会发布 Release、改动市场列表或自动更新已安装 profile。

# 1.0.8

## English

- Persist per-site origins and tokens in the existing DSH credential provider.
- Add saved-site cards, one-click switching, save confirmation, and desktop tilt.
- Normalize pasted token quotes and optional Bearer prefixes.
- Preserve browser data during migration and prefer existing server tokens.
- Guard concurrent saves and stale analytics responses.
- Prepare a deployment-neutral distribution with an empty initial site and example-only URLs.
- Add bilingual documentation, a package file allowlist, release scanning and synthetic tests.

## 中文

- 使用既有 DSH 凭据提供器保存各站网址及 Token。
- 增加已保存站点卡片、一键切换、保存成功反馈与桌面倾斜效果。
- 清理粘贴 Token 的首尾引号与可选 Bearer 前缀。
- 迁移保留浏览器数据，并优先保留服务器已有 Token。
- 防止重复保存与过期统计响应覆盖新数据。
- 准备默认站点留空、仅使用示例网址的通用发布版本。
- 补充双语文档、安装包文件白名单、发布扫描与合成测试。
