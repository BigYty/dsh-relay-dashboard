# Relay Dashboard for DeepSeek Harness

[简体中文](README.zh-CN.md) · **English**

A sidebar dashboard for monitoring multiple Sub2API-compatible AI gateways from DeepSeek Harness (DSH). Version **1.0.8** adds server-backed site management while keeping the existing paper-colored dashboard.

## Features

- Store a separate gateway origin and access token for each site; switch with one click.
- View account balance, API-key counts, daily and cumulative requests, costs, token usage, RPM/TPM, response time, platform breakdowns, model distribution, and 7/30/90-day trends when the gateway exposes those fields.
- Save site profiles in the current DSH profile's credential store. Credentials are shared by authenticated owners of that DSH profile, not isolated per web account.
- Migrate browser profiles without overwriting an existing server token or deleting the browser copy.
- Accept plain tokens, optional `Bearer` prefixes, and surrounding straight or curly quotes.
- Show persistent save confirmation, keyboard focus indicators, desktop site-card tilt, and reduced-motion behavior.

The interface is currently Chinese. Package display metadata is available in English and Chinese.

## Requirements

- DeepSeek Harness Web with `credentials`, `webServer`, `connection`, and the sidebar/main slot services enabled. Verified against **DSH 0.2.2-rc.1**; compatibility with other versions has not been verified.
- A Sub2API-compatible gateway exposing the user endpoints listed below.
- Browser access to the gateway, including CORS permission for the DSH page origin. Private-network or TLS restrictions can also affect access.
- Development/release checks use Node.js with the built-in test runner, npm, Git, and Python 3. There are no additional npm runtime dependencies and no separate frontend compilation step.

## Installation

1. Download a reviewed release tarball, or clone this repository and run the checks below.
2. In DSH, ask the plugin manager to install the local tarball or the absolute path to this bundle directory. For an agent using the plugin tool, use `install_bundle` with that local path as `target`.
3. Follow the plugin manager's result. If it reports a restart is required, restart DSH; then refresh the existing Web page.
4. Open **中转站仪表盘** in the sidebar.

This is a DSH bundle, not a standalone web server. The package remains marked `private` to prevent accidental npm registry publication; sharing the repository or an npm-generated tarball still works.

## Add and switch sites

1. Enter the gateway's origin, for example `https://gateway.example` (a documentation placeholder, not a service).
2. Obtain your own gateway token. On the gateway page, open Developer Tools and evaluate:

   ```js
   localStorage.getItem("auth_token")
   ```

3. Paste the value into the password field and choose **保存** (Save). Surrounding quotes are removed automatically. A successful save confirms durable storage; it does not establish that the token is valid at the gateway.
4. Select a saved site card to load its dashboard. Use **切换中转站** to return to site management and add or update a site.

The plugin reads these paths relative to the selected origin:

```text
/api/v1/user/profile
/api/v1/usage/dashboard/stats
/api/v1/usage/dashboard/trend
/api/v1/usage/dashboard/models
```

The browser makes gateway requests directly with that site's Bearer token. The DSH server provides authenticated profile storage at `/relay-dashboard/profiles`; it does not proxy gateway analytics requests.

## Persistence and migration

The server uses the existing DSH credential record `relay-dashboard/sites`. No tokens, credential files, server configuration, or browser exports belong in the repository or tarball. Owner-authorized profile reads return tokens to the browser so it can contact the gateway. Responses use `Cache-Control: no-store`. The credential provider determines storage-at-rest protection; this plugin does not add its own encryption.

Existing browser maps under `dsh.relay-dashboard.profiles` migrate automatically. Old single-token browser entries have no recorded origin. This distribution removes the deployment-specific default gateway, so it requires an explicit origin mapping before automatically migrating such an entry. On the DSH page, set the mapping to **your actual old gateway** and reload:

```js
localStorage.setItem("dsh.relay-dashboard.legacy-site", "https://gateway.example")
```

Replace the example origin before running this command. Alternatively, re-enter the correct site and token through the form. The legacy single-token key is retained solely for compatibility and its contents are not bundled. No browser data is deleted by migration.

## Development and release checks

```sh
npm run check
npm run check:secrets
mkdir -p dist
npm run pack:release
python3 scripts/check-release.py dist/*.tgz
```

The package uses an explicit file allowlist. Tests, scripts, Git metadata, generated artifacts, environment files, local reviews, credentials and runtime state are excluded from the installable tarball. The repository includes synthetic tests and a read-only release scanner. The scanner checks the working tree, reachable Git commits/objects, and supplied archives without printing matched values. It is a release gate with documented patterns, not a proof that every possible secret format is detectable.

Tests cover normalization, concurrent saves, independent site updates, migration precedence, storage failures, owner admission, request size limits and UTF-8 across request chunks. Browser visual behavior and live gateway requests require separate manual verification.

## Troubleshooting

- **401 from DSH profile storage:** log in to DSH again. Only owner sessions can use this route.
- **401 from the gateway:** refresh the gateway token and save it for the correct origin.
- **CORS/network/TLS failure:** check gateway access from the browser and its allowed origins. This bundle cannot bypass browser network policy.
- **Missing metrics:** verify that the gateway implements the corresponding endpoints and response fields.
- **Save failed:** keep the draft, check DSH credential storage availability, then retry. Failed saves do not show success.

## Security and distribution

Read [SECURITY.md](SECURITY.md) before sharing logs or submitting an issue. Examples and test tokens are synthetic. No license has been selected by the project owner; no open-source license grant is implied by repository visibility. Confirm licensing before redistributing or publishing to an npm registry.
