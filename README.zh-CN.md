# DeepSeek Harness 中转站仪表盘

**简体中文** · [English](README.md)

在 DeepSeek Harness（DSH）侧栏中，集中查看多个兼容 Sub2API 的 AI 中转站。**v1.0.8** 支持服务器保存站点与 Token，并保留原有纸色仪表盘。

## 功能

- 为每个站点保存独立的网址与 Token，通过站点卡片一键切换。
- 按接口支持情况展示账户余额、API 密钥数量、今日及累计请求/费用/Token、RPM/TPM、响应时间、平台拆分、模型分布，以及近 7/30/90 天趋势。
- 使用当前 DSH profile 的凭据存储持久化站点。该数据由这个 profile 的已认证 owner 共享，并非按 Web 账号单独隔离。
- 自动迁移浏览器中的站点列表，保留服务器已有 Token，不删除浏览器副本。
- 接受原始 Token、可选 `Bearer` 前缀，以及首尾直引号或弯引号。
- 提供持续保留的保存成功反馈、键盘焦点提示、桌面端卡片倾斜与减少动效支持。

目前界面文案为中文；插件展示元数据提供中英双语。

## 环境要求

- DeepSeek Harness Web，启用 `credentials`、`webServer`、`connection` 及侧栏/主面板服务。已在 **DSH 0.2.2-rc.1** 验证，其他版本兼容性尚未验证。
- 中转站提供下文列出的兼容接口。
- 浏览器能访问中转站，且中转站的 CORS 配置允许 DSH 页面来源。私有网络或 TLS 限制也可能影响请求。
- 开发与发布检查使用支持内置测试运行器的 Node.js、npm、Git 和 Python 3。插件没有额外 npm 运行依赖，不需要独立的前端编译步骤。

## 安装

1. 下载经过检查的发布压缩包，或克隆仓库后运行下文检查命令。
2. 在 DSH 中通过插件管理器安装本地压缩包或 bundle 目录的绝对路径。由 Agent 调用工具时，使用 `install_bundle`，将本地路径传入 `target`。
3. 根据插件管理器结果操作；如果提示需要重启，则先重启 DSH，再刷新现有 Web 页面。
4. 打开侧栏的 **中转站仪表盘**。

这是 DSH 插件，不是独立 Web 服务器。包保留 `private` 标记以避免误发布到 npm registry，但仍可共享 Git 仓库或由 npm 生成的 tarball。

## 添加与切换站点

1. 输入中转站来源地址，例如 `https://gateway.example`。这是文档示例，不是真实服务。
2. 在对应中转站页面打开开发者工具，在控制台执行：

   ```js
   localStorage.getItem("auth_token")
   ```

3. 将返回值粘贴到密码输入框，点击 **保存**。插件会自动清除首尾引号。保存成功表示服务器已持久化，不代表中转站已经接受该 Token。
4. 点击已保存的站点卡片，进入相应仪表盘。点击 **切换中转站** 返回管理页，添加站点或更新 Token。

插件相对所选站点请求以下接口：

```text
/api/v1/user/profile
/api/v1/usage/dashboard/stats
/api/v1/usage/dashboard/trend
/api/v1/usage/dashboard/models
```

统计请求由浏览器直接发送，只携带所选站点的 Bearer Token。DSH 服务器通过 `/relay-dashboard/profiles` 提供已认证的站点存储，不代理统计请求。

## 保存与迁移

服务器使用既有 DSH 凭据记录 `relay-dashboard/sites`。仓库及安装包不应包含 Token、凭据文件、服务器配置或浏览器导出数据。owner 读取站点列表时，Token 会返回到浏览器以调用对应中转站；响应设置 `Cache-Control: no-store`。静态存储保护由 DSH 凭据提供器决定，本插件不额外实现加密。

浏览器键 `dsh.relay-dashboard.profiles` 中的站点列表会自动迁移。旧的单 Token 记录没有站点来源信息；本发布版已移除部署专属默认站点，因此自动迁移前需要明确指定旧站点。在 DSH 页面将映射设为**你的真实旧站点**，然后刷新：

```js
localStorage.setItem("dsh.relay-dashboard.legacy-site", "https://gateway.example")
```

执行前必须替换示例来源地址。也可以直接在表单中重新输入正确站点与 Token。旧单 Token 存储键仅为兼容而保留，其内容不会被打包。迁移不会删除浏览器数据。

## 开发与发布检查

```sh
npm run check
npm run check:secrets
mkdir -p dist
npm run pack:release
python3 scripts/check-release.py dist/*.tgz
```

安装包采用明确的文件白名单。测试、检查脚本、Git 元数据、构建产物、环境文件、本地审查记录、凭据与运行数据不会进入安装包。源码仓库保留合成测试与只读发布扫描脚本，扫描工作区、Git 可达提交/对象及传入的压缩包，且不输出匹配的敏感值。扫描器提供一组已定义规则，不能证明所有未知格式的秘密都可被检测。

测试覆盖 Token 规范化、并发保存、单站更新、迁移优先级、写入失败、owner 认证、请求大小限制与跨分块 UTF-8。浏览器视觉效果和真实中转站请求需要另行人工验证。

## 常见问题

- **DSH 站点存储返回 401：**重新登录 DSH；该路由仅允许 owner 会话访问。
- **中转站返回 401：**刷新对应站点 Token，并确认保存的网址正确。
- **CORS、网络或 TLS 错误：**检查浏览器能否访问中转站，以及中转站是否允许 DSH 页面来源。插件不能绕过浏览器网络策略。
- **部分指标缺失：**检查中转站是否实现相应接口与字段。
- **保存失败：**保留表单草稿，检查 DSH 凭据存储可用性后重试。失败不会显示保存成功。

## 安全与分发

提交问题或分享日志前，请先阅读 [SECURITY.md](SECURITY.md)。所有文档示例与测试 Token 均为合成值。项目所有者尚未选择许可证，仓库可见性不表示授予开源许可；再分发或发布到 npm registry 前应确认许可安排。
