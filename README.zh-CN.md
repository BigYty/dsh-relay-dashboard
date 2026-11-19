# DeepSeek Harness 中转站仪表盘

**简体中文** · [English](README.md)

在 DeepSeek Harness（DSH）中查看兼容 Sub2API 的中转站数据。v1.2.0 提供跨 profile 的便携安装入口，不复制 DSH 登录态或凭据。

## 功能

- 使用 Sub2API 邮箱与密码登录；按站点要求完成 TOTP 两步验证。
- 可直接粘贴已授权获取的访问 Token；Token 只保存到 DSH Host 凭据库，并在保存后立即查询仪表盘。
- 访问 Token 与 Refresh Token 仅保存在 DSH profile 凭据提供器中，Refresh Token 不返回浏览器。
- 手动录入的访问 Token 在 Host 成功保存后 24 小时过期；绝对过期时间按站点恢复，并由实时倒计时展示。
- **仪表盘**模式只请求页面展示所需的四类数据；**仅 Token**模式只返回访问 Token，不请求余额或统计接口。
- 已保存站点可单独获取访问 Token；可删除单站凭据或从界面删除全部已保存凭据。
- 按接口支持情况展示余额、API 密钥数量、请求/费用/Token、RPM/TPM、响应时间、平台拆分、模型分布与趋势。
- 仪表盘数据只在页面内存中用于渲染；Host 返回 Client 前会筛选 profile 与统计字段。
- 旧版浏览器站点数据仅在成功迁移到服务器后清除；迁移失败会保留浏览器副本以便重试。

目前界面文案为中文；插件展示元数据提供中英双语。

## 环境要求

- DeepSeek Harness Web，启用 `credentials`、`webServer`、`connection` 及侧栏/主面板服务。CLI 安装语法以本机 `dsh plugin --help` 为准。本包声明 `engines.dsh: 0.2.2-rc.1`，目前仅按该版本契约开发和验证；其他版本是否兼容尚无证据。
- 中转站提供兼容的登录、可选 TOTP、续期与仪表盘接口。
- DSH Host 必须能通过 HTTPS 访问解析到公网地址的中转站。私有、环回、链路本地地址和重定向会被拒绝；因此不支持仅本地可访问的 HTTP 中转站。
- 开发与发布检查使用支持内置测试运行器的 Node.js、npm、Git 和 Python 3。插件没有额外 npm 运行依赖，不需要独立的前端编译步骤。

## 安装与导入到其他 profile

将发布包放在目标机器可访问的本地路径，然后在该机器、能调用目标 DSH 安装 CLI 的 shell 中运行一条命令；若目标 DSH 在另一台主机，需先把包复制到该主机：

```sh
npm run import:profile -- --profile <目标profile名> --bundle /path/to/relay-dashboard.tgz
```

`--bundle` 也可指向已解压的插件目录。命令使用 DSH 官方 CLI 的 `dsh plugin --profile <name> add <package>` 入口安装；它不读取启动日志、不转交 DSH token、不导入登录会话。完成后启动/重启目标 profile 并刷新其 Web 页面，再在插件页面用目标实例自己的 owner 登录态和网关账号登录。

也可以直接使用 DSH 原生入口：

```sh
dsh plugin --profile <目标profile名> add /path/to/relay-dashboard.tgz
```

如通过 DSH 插件管理器安装本地压缩包或 bundle 目录，也可使用该管理器提供的正式导入操作。若安装器报告包兼容性不满足，不要绕过版本保护。

这是 DSH 插件，不是独立 Web 服务器。包保留 `private` 标记以避免误发布到 npm registry，但仍可共享 Git 仓库或由 npm 生成的 tarball。

## 登录与模式

1. 输入中转站来源，例如 `https://gateway.example`（文档示例，不是真实服务），选择 **账号密码** 并填写邮箱与密码；或选择 **访问 Token** 并粘贴中转站官方流程授权提供的访问 Token。
2. 账号密码方式可选择 **仪表盘**读取页面数据，或选择 **仅 Token**只返回访问 Token。如果账号要求 TOTP，输入验证器当前生成的 6 位代码。直接 Token 方式会先保存 Token，再用它查询仪表盘。
3. 仪表盘模式由 DSH Host 请求 `/api/v1/user/profile`、`/api/v1/usage/dashboard/stats`、`/api/v1/usage/dashboard/trend` 和 `/api/v1/usage/dashboard/models`。仅 Token 模式不会请求仪表盘数据。
4. 已保存站点可重新打开、单独获取访问 Token，或删除。**删除全部已保存隐私数据**会移除当前 DSH profile 的插件凭据记录。

认证接口：

```text
POST /api/v1/auth/login
POST /api/v1/auth/login/2fa   # 中转站要求 TOTP 时
POST /api/v1/auth/refresh     # 轮换 Refresh Token
```

目前未找到 CodeKey.ai 提供给第三方插件嵌入 Turnstile 的授权 sitekey、OAuth 或 challenge API。账号密码表单不会伪造或绕过人机验证；请先在中转站官方页面完成验证，再使用该站官方提供的访问 Token 方式。若站点没有提供可用于 API 的 Token，需由站点方提供受支持的集成流程。

## 持久化与隐私

Host 使用 DSH 凭据记录 `relay-dashboard/sites`，并通过 `credentials.modifyRecord()` 串行处理 Refresh Token 轮换。密码只用于本次登录，不会持久化。手动输入的访问 Token 会直接提交给 Host 凭据提供器，成功后清空输入并在服务器端恢复使用；它不写入浏览器 `localStorage`。待完成 TOTP 的临时 Token 仅存服务器，验证完成或用户取消后清除。只有用户明确选择“仅 Token”时，登录接口才返回访问 Token。插件响应统一设置 `Cache-Control: no-store`。

统计请求由 DSH Host 通过 HTTPS 代理。Host 不转发 Cookie、不跟随重定向，会检查并固定解析到的公网 DNS 地址，限制请求/响应大小，并清洗错误信息。仪表盘数据筛选后返回页面渲染，不写入浏览器存储或插件凭据。同一 DSH profile 的所有已认证 owner 共享其已保存中转站凭据，并非按 Web 账号隔离。静态存储保护由 DSH 凭据提供器决定，本插件不额外实现加密。

旧版浏览器站点表 `dsh.relay-dashboard.profiles` 和旧单 Token 键会在成功读取服务器列表后尝试迁移；只有服务器确认迁移成功才清除浏览器副本。迁移失败时保留旧数据以便重试。用户未选择相应站点并发起仪表盘或访问 Token 操作前，浏览器中的旧 Token 不会发送到中转站。

## 兼容性边界

DSH CLI help 当前记录的插件入口为 `dsh plugin --profile <name> add <pkg>`；本次在本机 DSH 0.2.2-rc.1 CLI 上核对该语法。bundle 文件格式、Cordis 服务注入和 UI slot 仍是插件运行契约，因此不能据此宣称任意未来 DSH 版本兼容。包声明的 `engines.dsh` 是安装时约束；若其他版本不满足该约束，安装器可能拒绝安装。要彻底消除未来版本兼容验证，需要 DSH 上游提供并维护跨版本稳定的 bundle/插件 ABI 承诺。

## 开发与发布检查

```sh
npm run check
npm run check:secrets
mkdir -p dist
npm run pack:release
python3 scripts/check-release.py dist/*.tgz
```

安装包采用明确的文件白名单。测试、检查脚本、Git 元数据、构建产物、环境文件、本地审查记录、凭据与运行数据不会进入安装包。只读发布扫描器检查工作区、Git 可达对象与传入压缩包，且不输出匹配的敏感值。扫描器提供已定义规则，不能证明所有未知格式的秘密都可检测。

合成测试覆盖账号密码登录、手动 Token Host 持久化与查询、无关请求隔离、两步验证、凭据轮换、401 重试、迁移、删除、owner 认证、响应字段筛选、no-store 与请求大小限制。真实登录需要用户自有的中转站账号；测试不保存真实凭据。

## 常见问题

- **DSH 站点存储返回 401：**重新登录 DSH；该路由仅允许 owner 会话访问。
- **凭据存储不可用：**错误代码会指出 `credential-storage-read`、`credential-storage-write` 或 `credential-storage-delete` 阶段；检查 DSH credentials 插件是否启用，以及 Host 进程是否可写入凭据文件。可能附带安全的系统错误码，不包含提供器异常原文。
- **登录被验证码拦截：**到中转站官方页面完成验证。若站点官方提供 API 访问 Token，可切换到“访问 Token”模式；否则需要站点方提供受支持的第三方登录方式。本插件不会代解或绕过挑战。
- **续期后要求重新登录：**中转站可能已撤销或过期 Refresh Token，请重新登录生成新的凭据对。
- **HTTPS 或网络错误：**DSH Host 必须可访问解析到公网地址的 HTTPS 中转站；按设计拒绝私有、环回及重定向来源。
- **部分指标缺失：**检查中转站是否实现相应接口与字段。

## 安全与分发

提交问题或分享日志前，请先阅读 [SECURITY.md](SECURITY.md)。文档示例与测试凭据均为合成值。项目采用 [MIT 许可证](LICENSE)。公开发布和市场列表更新属于单独的发布步骤。
