# Relay Dashboard for DeepSeek Harness

[简体中文](README.zh-CN.md) · **English**

A server-mediated dashboard for Sub2API-compatible gateways in DeepSeek Harness (DSH). Version **1.1.3** restores direct access-token entry with Host-side persistence and dashboard queries while retaining account login and two-factor verification.

## Features

- Log in with a Sub2API email and password; complete TOTP two-factor login when requested.
- Alternatively, paste an access token provided by the gateway's authorized flow; the Host stores it and immediately queries the dashboard.
- Keep access and refresh credentials in the DSH profile credential provider. Refresh tokens are never returned to the browser.
- Automatically refresh rotated credentials near expiry and retry dashboard requests after an expired access token.
- Choose **Dashboard** to request only the four resources used by the existing dashboard, or **Token only** to receive only an access token without requesting dashboard data.
- Retrieve an access token for a saved site without fetching analytics; remove one site's credentials or delete all saved credentials from the UI.
- Display balance, API-key counts, requests, costs, token usage, RPM/TPM, response time, platform breakdowns, model distribution, and trends when the gateway exposes those fields.
- Keep dashboard response data in page memory only. The Host filters profile/statistics fields before returning them to the Client.
- Migrate older browser-only site tokens to the server credential record; clear those browser keys only after a successful migration.

The interface is currently Chinese. Package display metadata is available in English and Chinese.

## Requirements

- DeepSeek Harness Web with `credentials`, `webServer`, `connection`, and the sidebar/main slot services enabled. Verified against **DSH 0.2.2-rc.1**; compatibility with other versions has not been verified.
- A Sub2API-compatible gateway exposing login, optional TOTP, refresh, and dashboard endpoints.
- The DSH Host must be able to make outbound HTTPS requests to a publicly resolved gateway origin. Private, loopback, link-local, and redirect destinations are rejected. This prevents arbitrary private-network access and means local-only HTTP gateways are unsupported.
- Development/release checks use Node.js with the built-in test runner, npm, Git, and Python 3. There are no additional npm runtime dependencies and no separate frontend compilation step.

## Installation

1. Download a reviewed release tarball, or clone this repository and run the checks below.
2. In DSH, ask the plugin manager to install the local tarball or the absolute path to this bundle directory. For an agent using the plugin tool, use `install_bundle` with that local path as `target`.
3. Follow the plugin manager's result. If it reports a restart is required, restart DSH; then refresh the existing Web page.
4. Open **中转站仪表盘** in the sidebar, enter the gateway origin and account credentials, and select a mode.

This is a DSH bundle, not a standalone web server. The package remains marked `private` to prevent accidental npm registry publication; sharing the repository or an npm-generated tarball still works.

## Login and modes

1. Enter the gateway origin, for example `https://gateway.example` (a documentation placeholder, not a service), then choose **账号密码** and enter the account email/password, or choose **访问 Token** and paste a gateway-authorized API access token.
2. Account login can choose **仪表盘** or **仅 Token**. If the account requests TOTP, enter the current six-digit authenticator code. Direct Token mode stores the token on the Host and then queries the dashboard.
3. Dashboard mode requests `/api/v1/user/profile`, `/api/v1/usage/dashboard/stats`, `/api/v1/usage/dashboard/trend`, and `/api/v1/usage/dashboard/models` from the DSH Host. Token-only mode makes no dashboard-data requests.
4. Saved sites can be reopened, used to retrieve only an access token, or removed. **Delete all saved privacy data** removes the plugin's credential record from the current DSH profile.

The plugin uses these authentication endpoints:

```text
POST /api/v1/auth/login
POST /api/v1/auth/login/2fa   # only when the gateway requests TOTP
POST /api/v1/auth/refresh     # refresh-token rotation
```

No authorized CodeKey.ai sitekey, OAuth flow, or challenge API for embedding Turnstile in third-party plugins was found. The account form will not forge or bypass human verification. Complete the challenge on the gateway's official page, then use an API access token the gateway officially provides. If the site does not expose such a token, its operator must provide a supported integration flow.

## Persistence and privacy

The Host uses the DSH credential record `relay-dashboard/sites`, with serialized refresh-token rotation via `credentials.modifyRecord()`. Passwords are transient and are not persisted. A manually entered access token is sent to the Host credential provider, cleared from the input after saving, and reused server-side; it is never written to browser `localStorage`. A pending TOTP temporary token is stored server-side only until completion or user cancellation. Only account login's explicit Token-only mode returns an access token to the page. All plugin responses use `Cache-Control: no-store`.

Dashboard requests are proxied by the DSH Host over HTTPS. The Host forwards no cookies, follows no redirects, validates DNS results against private/reserved address ranges, pins the resolved public address, caps request/response bodies, and returns sanitized errors. Dashboard data is filtered and returned to the page for rendering but is not saved in browser storage or plugin credentials. All authenticated owners of the current DSH profile share its saved gateway credentials; this is not isolated per web account. The DSH credential provider determines storage-at-rest protection; this plugin does not add its own encryption.

Older browser maps under `dsh.relay-dashboard.profiles` and the legacy single-token key are migrated only after the server list is read successfully. The browser copies are cleared only after the server confirms the migration. On a failed migration they remain available for retry. No browser token is sent to a gateway until the user selects that gateway and requests a dashboard or access token.

## Development and release checks

```sh
npm run check
npm run check:secrets
mkdir -p dist
npm run pack:release
python3 scripts/check-release.py dist/*.tgz
```

The package uses an explicit file allowlist. Tests, scripts, Git metadata, generated artifacts, environment files, local reviews, credentials and runtime state are excluded from the installable tarball. The read-only release scanner checks the working tree, reachable Git objects, and supplied archives without printing matched values. It is a release gate with documented patterns, not proof that every possible secret format is detectable.

Synthetic tests cover account login, Host-persisted manual Tokens and dashboard queries, request isolation, two-factor login, credential rotation, 401 retry, migration, deletion, owner admission, response minimization, no-store headers, and request size limits. Live login requires a user-controlled gateway account; no real credentials are stored in tests.

## Troubleshooting

- **401 from DSH profile storage:** log in to DSH again. Only owner sessions can use this route.
- **Credential store unavailable:** responses use `credential-storage-读取`, `credential-storage-写入`, or `credential-storage-删除`; check that the DSH credentials provider is active and its file is writable by the Host process. A safe OS error code may be shown, but provider details are never returned.
- **Login blocked by a human-verification challenge:** complete it on the gateway's official page. If that site officially provides an API access token, use **访问 Token**; otherwise the site operator must provide a supported third-party login flow. This plugin does not solve or bypass challenges.
- **Re-login requested after refresh:** the gateway may have revoked or expired the refresh token; sign in again to rotate a fresh pair.
- **HTTPS / network error:** the DSH Host must reach a publicly resolved HTTPS gateway. Private, local, and redirecting origins are rejected by design.
- **Missing metrics:** verify that the gateway implements the corresponding endpoints and response fields.

## Security and distribution

Read [SECURITY.md](SECURITY.md) before sharing logs or submitting an issue. Examples and test credentials are synthetic. Licensed under the [MIT License](LICENSE). Public release publication and marketplace updates require a separate release step.
