# 1.0.8

## English

- Persist per-site origins and tokens in the existing DSH credential provider.
- Add saved-site cards, one-click switching, save confirmation, and desktop tilt.
- Normalize pasted token quotes and optional Bearer prefixes.
- Preserve browser data during migration and prefer existing server tokens.
- Guard concurrent saves and stale analytics responses.
- Prepare a deployment-neutral distribution: empty initial site, example-only URLs and generic icon text. Legacy single-token migration now requires an explicit origin mapping, preventing credentials from being sent to an assumed gateway.
- Add bilingual documentation, a package file allowlist, release scanning and synthetic tests.

The installed deployment and its credential storage are not changed by release preparation. The package version remains 1.0.8.

## 中文

- 使用既有 DSH 凭据提供器保存各站网址及 Token。
- 增加已保存站点卡片、一键切换、保存成功反馈与桌面倾斜效果。
- 清理粘贴 Token 的首尾引号与可选 Bearer 前缀。
- 迁移保留浏览器数据，并优先保留服务器已有 Token。
- 防止重复保存与过期统计响应覆盖新数据。
- 准备通用发布版本：默认站点留空，网址改为示例，图标文案通用化。旧单 Token 迁移需明确映射原站点，避免向假定站点发送凭据。
- 补充双语文档、安装包文件白名单、发布扫描与合成测试。

发布准备不会改变已安装部署及其凭据存储，包版本保持 1.0.8。
