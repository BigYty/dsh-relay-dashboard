window.__ModuleLoader__.load({
  id: '@local/relay-dashboard',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const PANEL = '@local/relay-dashboard';
    const DEFAULT_SITE = '';
    const PROFILE_KEY = 'dsh.relay-dashboard.profiles';
    const UI_TEXT = {
      zh: {
        headerSubtitle: '使用账号密码，或粘贴中转站官方提供的访问 Token',
        authAccount: '账号密码', authToken: '访问 Token', authMethodGroup: '登录方式', accessTokenLabel: '访问 Token',
        tokenLoginHint: '此 Token 会保存到当前 DSH profile 的 Host 凭据库并用于查询。若站点要求人机验证，请先在站点官方页面完成验证并使用其授权提供的 Token；插件不会生成或绕过挑战。可以通过对应站点开发者工具在控制台输入localStorage.getItem("auth_token")获取token',
        tokenSaveError: 'Token 保存失败', savingAndQuery: '正在保存并查询…', saveAndQuery: '保存 Token 并查询',
        challengeFallback: '此站点要求额外的人机验证；请先在站点官方页面完成验证，再使用官方提供的访问 Token 登录。本插件不会生成或绕过验证结果。',
        statusTwoFactor: '待完成两步验证', statusRenewal: '自动续期已启用',
        statusTokenVerified: 'Token 已验证，自动续期不可用', statusTokenUnverified: 'Token 尚未验证',
        statusReauth: '需要重新登录', statusExpired: 'Token 已过期，请重新登录',
        nextUpdate: '下次更新时间', expiry: 'Token 过期时间', unavailable: '未提供',
        expiresIn: 'Token 过期倒计时', expired: '已过期',
      },
      en: {
        headerSubtitle: 'Sign in with a password or paste an access token authorized by the gateway',
        authAccount: 'Email / password', authToken: 'Access token', authMethodGroup: 'Login method', accessTokenLabel: 'Access token',
        tokenLoginHint: 'This token is stored in the current DSH profile Host credential provider and used for queries. Complete any required human verification on the gateway’s official site first, then use a token it authorizes. This plugin does not generate or bypass challenges. You can retrieve the token by entering localStorage.getItem("auth_token") in the corresponding site’s developer tools console.',
        tokenSaveError: 'Token could not be saved', savingAndQuery: 'Saving and querying…', saveAndQuery: 'Save token and query',
        challengeFallback: 'This site requires additional human verification. Complete it on the official site, then use an access token authorized by the gateway. This plugin does not generate or bypass verification results.',
        statusTwoFactor: 'Two-factor verification pending', statusRenewal: 'Automatic renewal enabled',
        statusTokenVerified: 'Token verified; automatic renewal unavailable', statusTokenUnverified: 'Token not yet verified',
        statusReauth: 'Sign-in required', statusExpired: 'Token expired; sign in again',
        nextUpdate: 'Next update', expiry: 'Token expiry', unavailable: 'Not provided',
        expiresIn: 'Token countdown', expired: 'Expired',
      },
    };
    let localeService;
    let t = key => UI_TEXT.zh[key] || key;
    const SPARK_HEIGHT = 56;
    const SPARK_PAD = 6;

    const css = `
      .relay-page { --paper-bg: var(--dsw-alias-bg-base); --paper-surface: var(--dsw-alias-bg-layer-1); --paper-text: var(--dsw-alias-label-primary); --paper-dim: var(--dsw-alias-label-secondary); --paper-brand: var(--dsw-alias-brand-primary); --paper-ok: var(--dsw-alias-state-success-primary); --paper-warn: var(--dsw-alias-state-warn-primary); --paper-bad: var(--dsw-alias-state-error-primary); --paper-line: var(--dsw-alias-border-l1); --paper-on-brand: var(--dsw-alias-brand-text); --ui-bg: var(--paper-bg); --ui-surface: var(--paper-surface); --ui-surface-2: color-mix(in srgb, var(--paper-text) 9%, var(--paper-surface)); --ui-text: var(--paper-text); --ui-text-dim: var(--paper-dim); --ui-brand: var(--paper-brand); --ui-success: var(--paper-ok); box-sizing: border-box; height: 100%; min-height: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; padding: 24px clamp(16px, 3vw, 40px) 40px; color: var(--paper-text); background: var(--paper-bg); }
      .relay-page > * { width: min(100%, 1180px); margin-left: auto; margin-right: auto; }
      .relay-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid var(--paper-line); }
      .relay-title { margin: 0; font-size: 22px; line-height: 1.2; font-weight: 700; letter-spacing: 0; }
      .relay-subtitle, .relay-help { margin: 8px 0 0; color: var(--paper-dim); font-size: 13px; line-height: 1.5; }
      .relay-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
      .relay-button { min-height: 36px; padding: 0 13px; border: 1px solid var(--paper-line); border-radius: 4px; color: var(--paper-text); background: var(--paper-surface); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
      .relay-button:hover:not(:disabled) { border-color: var(--paper-brand); background: color-mix(in srgb, var(--paper-text) 8%, var(--paper-surface)); }
      .relay-button.primary { color: var(--paper-bg); border-color: var(--paper-brand); background: var(--paper-brand); }
      .relay-button:disabled { cursor: wait; opacity: .6; }
      .relay-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(185px, 1fr)); gap: 12px; }
      @media (min-width: 980px) { .relay-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
      .relay-card { position: relative; isolation: isolate; min-width: 0; min-height: 104px; padding: 15px 16px 13px; overflow: hidden; border: 1px solid var(--paper-line); border-left: 3px solid var(--paper-brand); border-radius: 5px; background: var(--paper-surface); background-image: repeating-linear-gradient(180deg, color-mix(in srgb, var(--paper-text) 5.5%, transparent) 0 1px, transparent 1px 4px); box-shadow: none; transition: transform .25s ease, border-color .25s ease; }
      .relay-card:nth-child(2n) { border-left-color: var(--paper-ok); }
      .relay-card:nth-child(3n) { border-left-color: var(--paper-warn); }
      .relay-card:nth-child(4n) { border-left-color: var(--paper-dim); }
      .relay-card::before { content: ''; position: absolute; z-index: -1; inset: 0; pointer-events: none; opacity: 0; background: radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--paper-brand) 24%, transparent), transparent 65%); transition: opacity .25s ease; }
      .relay-card.is-lit { transform: translateY(-3px); border-color: color-mix(in srgb, var(--paper-brand) 45%, transparent); box-shadow: none; }
      .relay-card.is-lit::before { opacity: 1; }
      @media (hover: none) { .relay-card.is-touch-active { transform: translateY(-3px); border-color: color-mix(in srgb, var(--paper-brand) 45%, transparent); box-shadow: none; } .relay-card.is-touch-active::before { opacity: 1; } }
      @media (prefers-reduced-motion: reduce) { .relay-card, .relay-card::before { transition: none; } }
      .relay-label { margin: 0 0 9px; color: var(--paper-dim); font-size: 12px; }
      .relay-value { margin: 0; font-size: 24px; line-height: 1.2; font-weight: 700; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; letter-spacing: 0; }
      .relay-note { margin: 7px 0 0; color: var(--paper-dim); font-size: 12px; }
      .relay-status { min-height: 22px; margin: 16px auto 0; color: var(--paper-bad); font-size: 13px; }
      .relay-status.ok { color: var(--paper-ok); }
      .relay-setup { max-width: 700px; }
      .relay-manager { display: grid; grid-template-columns: minmax(0, .9fr) minmax(280px, 1.1fr); gap: 20px; align-items: start; margin-top: 18px; }
      .relay-manager-panel { min-width: 0; padding: 16px; border: 1px solid var(--paper-line); border-radius: 6px; background: color-mix(in srgb, var(--paper-text) 4%, var(--paper-bg)); }
      .relay-site-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(190px,100%), 1fr)); gap: 12px; }
      .relay-site-tilt { min-width: 0; perspective: 1000px; touch-action: manipulation; }
      .relay-site-card { width:100%; overflow:visible; position: relative; min-height: 126px; padding: 14px; border: 1px solid color-mix(in srgb, var(--paper-text) 15%, transparent); border-radius: 10px; color: var(--paper-text); text-align: left; background: color-mix(in srgb, var(--paper-text) 5%, var(--paper-surface)); background-image: repeating-linear-gradient(180deg, color-mix(in srgb, var(--paper-text) 4%, transparent) 0 1px, transparent 1px 4px); transform: rotateX(0deg) rotateY(0deg); transform-style: preserve-3d; will-change: transform; cursor: pointer; }
      .relay-site-card:focus-visible { outline: 2px solid var(--paper-brand); outline-offset: 3px; }
      .relay-site-card.on .relay-site-glow { opacity: 1; }
      .relay-site-glow { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .4s ease; mix-blend-mode: screen; }
      .relay-site-glow.g1 { background: radial-gradient(420px circle at var(--mx,50%) var(--my,50%), color-mix(in srgb,var(--paper-brand) 32%,transparent),transparent 62%); }
      .relay-site-glow.g2 { background: radial-gradient(170px circle at var(--mx,50%) var(--my,50%), color-mix(in srgb,var(--paper-brand) 42%,transparent),transparent 68%); }
      .relay-site-content { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 7px; }
      .relay-site-content strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
      .relay-site-content span { overflow-wrap: anywhere; color: var(--paper-dim); font-size: 12px; }
      .relay-site-current { align-self: flex-start; padding: 3px 7px; border-radius: 999px; color: var(--paper-ok); background: color-mix(in srgb,var(--paper-ok) 16%,transparent); font-size: 11px; }
      .relay-save-card { box-sizing:border-box; width: min(360px,100%); padding: 13px 16px 12px; display: flex; flex-direction: column; gap: 10px; border: 1px solid color-mix(in srgb,var(--ui-text) 10%,transparent); border-radius: 10px; background: color-mix(in srgb,var(--ui-text) 4%,var(--ui-bg)); }
      .relay-save-doc { display: flex; align-items: center; gap: 9px; }
      .relay-save-icon { flex: 0 0 auto; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 7px; color: var(--ui-text-dim); background: color-mix(in srgb,var(--ui-text) 7%,var(--ui-bg)); }
      .relay-save-meta { min-width: 0; }
      .relay-save-meta strong { display:block; overflow:hidden; color:var(--ui-text); font-size:12.5px; font-weight:600; line-height:1.4; text-overflow:ellipsis; white-space:nowrap; }
      .relay-save-meta span { display:block; color:var(--ui-text-dim); font-size:10.5px; line-height:1.4; }
      .relay-save-stage { position:relative; height:50px; flex:0 0 auto; }
      .relay-save-button, .relay-save-done { position:absolute; left:50%; top:50%; translate:-50% -50%; }
      .relay-save-button { border:0; border-radius:999px; padding:9px 24px; color:var(--ui-bg); background:var(--ui-brand); font:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:opacity .16s ease,scale .16s ease; }
      .relay-save-button:hover:not(:disabled) { opacity:.9; }
      .relay-save-button:focus-visible { outline:2px solid color-mix(in srgb,var(--paper-brand) 45%,transparent); outline-offset:3px; }
      .relay-save-button.out { opacity:0; scale:.9; pointer-events:none; }
      .relay-save-button.pressing { scale:.96; }
      .relay-save-done { display:flex; align-items:center; gap:8px; opacity:0; pointer-events:none; white-space:nowrap; transition:opacity .22s ease; }
      .relay-save-done.show { opacity:1; }
      .relay-save-ring { display:block; width:30px; height:30px; overflow:visible; }
      .relay-save-ring circle, .relay-save-ring path { fill:none; stroke:var(--ui-success); stroke-linecap:round; }
      .relay-save-ring circle { stroke-width:2.5; stroke-dasharray:139; stroke-dashoffset:139; transform:rotate(-90deg); transform-origin:26px 26px; transition:stroke-dashoffset .38s cubic-bezier(.22,1,.36,1); }
      .relay-save-ring path { stroke-width:3; stroke-linejoin:round; stroke-dasharray:32; stroke-dashoffset:32; transition:stroke-dashoffset .3s cubic-bezier(.22,1,.36,1) .26s; }
      .relay-save-done.show circle, .relay-save-done.show path { stroke-dashoffset:0; }
      .relay-save-done-text { color:var(--ui-success); font-size:12.5px; font-weight:600; opacity:0; transform:translateX(-6px); transition:opacity .3s ease .3s,transform .3s ease .3s; }
      .relay-save-done.show .relay-save-done-text { opacity:1; transform:translateX(0); }
      .relay-live { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
      .relay-manager-error { min-height:20px; color:var(--paper-bad); font-size:12px; }
      @media (max-width:760px) { .relay-manager { grid-template-columns:minmax(0,1fr); } }
      @media (max-height:420px) { .relay-save-card { padding:9px 13px 8px; gap:7px; } .relay-save-stage { height:44px; } .relay-save-button { padding:8px 21px; font-size:12px; } .relay-save-ring { width:27px; height:27px; } .relay-save-done-text { font-size:12px; } }
      @media (prefers-reduced-motion:reduce) { .relay-site-card { transform:none !important; will-change:auto; } .relay-site-glow { transition:none; } .relay-save-ring circle,.relay-save-ring path,.relay-save-done-text,.relay-save-done,.relay-save-button { transition:none; } }
      .relay-form { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
      .relay-form label { color: var(--paper-dim); font-size: 12px; }
      .relay-form input { box-sizing: border-box; width: 100%; height: 38px; padding: 0 10px; color: var(--paper-text); background: var(--paper-bg); border: 1px solid var(--paper-line); border-radius: 4px; font: inherit; }
      .relay-form-submit { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
      .relay-site-card { font:inherit; }
      .relay-help { margin-top: 12px; }
      .relay-form input:focus-visible, .relay-button:focus-visible, .relay-toolbar select:focus-visible { outline: 2px solid var(--paper-brand); outline-offset: 2px; }
      .relay-form input:focus { border-color: var(--paper-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--paper-brand) 12%, transparent); }
      .relay-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 16px; padding: 10px 12px; border: 1px solid var(--paper-line); border-radius: 5px; background: var(--paper-surface); }
      .relay-toolbar label { color: var(--paper-dim); font-size: 12px; }
      .relay-toolbar select { height: 32px; padding: 0 8px; color: var(--paper-text); background: var(--paper-surface); border: 1px solid var(--paper-line); border-radius: 4px; font: inherit; }
      .relay-auth-form { max-width:460px; }
       .relay-auth-label { display:block; margin:2px 0 6px; color:var(--paper-dim); font-size:12px; }
       .relay-mode-track { position:relative; display:flex; width:232px; max-width:100%; padding:3px; border-radius:999px; flex:0 0 auto; background:var(--ui-surface-2); background:color-mix(in srgb,var(--ui-text) 9%,var(--ui-bg)); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ui-text) 8%,transparent); }
       .relay-mode-indicator { position:absolute; top:3px; bottom:3px; left:3px; width:0; border-radius:999px; background:var(--ui-brand); transition:left .32s cubic-bezier(.2,.8,.25,1),width .32s cubic-bezier(.2,.8,.25,1); pointer-events:none; }
       .relay-mode-option { position:relative; z-index:1; flex:1 1 0; height:28px; padding:0 5px; border:0; border-radius:999px; color:var(--ui-text-dim); background:transparent; font:inherit; font-size:12px; font-weight:600; cursor:pointer; transition:color .2s ease,transform .12s ease; }
       .relay-mode-option.on { color:var(--ui-bg); }
       .relay-mode-option.pressing { transform:scale(.94); }
       .relay-mode-option:focus-visible { outline:2px solid color-mix(in srgb,var(--ui-brand) 45%,transparent); outline-offset:2px; }
       .relay-mode-copy { min-height:38px; margin:0; color:var(--paper-dim); font-size:12px; line-height:1.5; transition:opacity .16s ease,transform .16s ease; }
       .relay-mode-copy.swap { opacity:0; transform:translateY(4px); }
       .relay-secret-app { display:flex; align-items:center; gap:6px; width:100%; min-height:50px; padding:3px 8px 3px 12px; border:1px solid var(--paper-line); border-radius:13px; background:color-mix(in srgb,var(--ui-text) 6%,var(--ui-surface)); box-shadow:0 1px 2px color-mix(in srgb,var(--ui-text) 7%,transparent); transition:border-color .2s ease,box-shadow .2s ease; }
       .relay-secret-app:focus-within { border-color:color-mix(in srgb,var(--ui-brand) 55%,transparent); box-shadow:0 0 0 3px color-mix(in srgb,var(--ui-brand) 13%,transparent); }
       .relay-secret-field { position:relative; flex:1 1 auto; min-width:0; overflow:hidden; }
       .relay-secret-field input { position:relative; z-index:1; display:block; width:100%; min-height:42px; margin:0; padding:8px 0; border:0; outline:0; color:var(--ui-text); background:transparent; font:inherit; font-size:14px; font-weight:500; }
       .relay-secret-field input::placeholder { color:var(--ui-text-dim); }
       .relay-secret-app:focus-within .relay-secret-field input { border:0; box-shadow:none; outline:0; }
       .relay-eye { flex:0 0 auto; display:grid; place-items:center; width:44px; height:44px; padding:0; border:0; border-radius:10px; color:color-mix(in srgb,var(--ui-text) 76%,var(--ui-bg)); background:transparent; cursor:pointer; transition:color .2s ease,background .2s ease,transform .12s ease; }
       .relay-eye:hover { color:var(--ui-brand); background:color-mix(in srgb,var(--ui-brand) 10%,transparent); }
       .relay-eye:focus-visible { outline:2px solid var(--ui-brand); outline-offset:1px; }
       .relay-eye.pressing { transform:scale(.9); }
       .relay-eye svg { width:24px; height:24px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
       .relay-eye .pupil { transform:scale(1); transform-origin:12px 12px; transition:transform .24s ease-out; }
       .relay-eye .slash { stroke-dasharray:26; stroke-dashoffset:26; transition:stroke-dashoffset .24s ease-out; }
       .relay-eye.is-open .pupil { transform:scale(0); }
       .relay-eye.is-open .slash { stroke-dashoffset:0; }
       .relay-auth-submit { width:100%; min-height:40px; }
       .relay-auth-note { max-width:620px; margin:14px 0 0; color:var(--paper-dim); font-size:12px; line-height:1.55; }
       .relay-site-actions { display:flex; flex-wrap:wrap; gap:7px; margin-top:8px; }
       .relay-site-action { min-height:30px; padding:0 9px; border:1px solid var(--paper-line); border-radius:4px; color:var(--paper-text); background:var(--paper-bg); font:inherit; font-size:11px; cursor:pointer; }
       .relay-site-action:hover:not(:disabled) { border-color:var(--paper-brand); }
       .relay-site-action:focus-visible { outline:2px solid var(--paper-brand); outline-offset:2px; }
       .relay-site-action.danger { color:var(--paper-bad); }
       .relay-token-row { display:flex; align-items:center; gap:8px; max-width:520px; margin-top:14px; }
       .relay-token-row .relay-secret-app { flex:1; }
       .relay-sites-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
       .relay-sites-empty { color:var(--paper-dim); font-size:12px; }
       @media (max-width:760px) { .relay-auth-form { max-width:none; } .relay-site-actions { gap:5px; } }
       @media (max-height:420px) { .relay-mode-track { width:210px; } .relay-mode-option { height:26px; font-size:11px; } .relay-eye { width:32px; height:32px; } .relay-eye svg { width:20px; height:20px; stroke-width:2.4; } .relay-secret-app { min-height:40px; } .relay-secret-field input { min-height:32px; } }
       @media (prefers-reduced-motion:reduce) { .relay-mode-indicator,.relay-mode-option,.relay-mode-copy,.relay-secret-app,.relay-eye,.relay-eye .pupil,.relay-eye .slash { transition-duration:.01s; } }
       .relay-section { margin-top: 18px; padding: 16px; border: 1px solid var(--paper-line); border-radius: 5px; background: var(--paper-surface); background-image: repeating-linear-gradient(180deg, color-mix(in srgb, var(--paper-text) 5.5%, transparent) 0 1px, transparent 1px 4px); }

      .relay-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
      .relay-section-title { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: 0; }
      .relay-section-meta { color: var(--paper-dim); font-size: 12px; }
      .relay-two-col { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, .72fr); gap: 16px; margin-top: 18px; }
      .relay-platform-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
      .relay-platform { padding: 12px 13px; border: 1px solid var(--paper-line); border-left: 3px solid var(--paper-brand); border-radius: 4px; background: color-mix(in srgb, var(--paper-text) 8%, var(--paper-surface)); background-image: repeating-linear-gradient(180deg, color-mix(in srgb, var(--paper-text) 5.5%, transparent) 0 1px, transparent 1px 4px); }
      .relay-platform-head { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 600; }
      .relay-platform-stat { display: flex; justify-content: space-between; gap: 12px; margin-top: 8px; color: var(--paper-dim); font-size: 11px; }
      .relay-model-list { display: flex; flex-direction: column; gap: 8px; }
      .relay-model-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 10px; border-radius: 4px; background: color-mix(in srgb, var(--paper-text) 8%, var(--paper-surface)); background-image: repeating-linear-gradient(180deg, color-mix(in srgb, var(--paper-text) 5.5%, transparent) 0 1px, transparent 1px 4px); font-size: 12px; }
      .relay-model-name { min-width: 0; overflow: hidden; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
      .relay-model-value { color: var(--paper-dim); font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
      .relay-spark-metric { display: flex; align-items: baseline; gap: 6px; margin: -2px 0 2px; font-variant-numeric: tabular-nums; }
      .relay-spark-metric strong { font-size: 21px; line-height: 1.15; font-weight: 600; letter-spacing: 0; }
      .relay-spark-metric .positive, .relay-spark-metric .negative { font-size: 9px; font-weight: 500; letter-spacing: 0; }
      .relay-spark-metric .positive { color: var(--paper-ok); }
      .relay-spark-metric .negative { color: var(--paper-bad); }
      .relay-sparkbox { position: relative; height: 56px; margin-top: 2px; overflow: visible; }
      .relay-spark { display: block; width: 100%; height: 56px; overflow: visible; cursor: crosshair; touch-action: pan-y; }
      .relay-spark .area { fill: url(#relay-spark-gradient); }
      .relay-spark .line { fill: none; stroke: var(--paper-brand); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
      .relay-spark .end { fill: var(--paper-brand); }
      .relay-spark .end-halo { fill: color-mix(in srgb, var(--paper-brand) 26%, transparent); }
      .relay-spark .guide { stroke: color-mix(in srgb, var(--paper-text) 22%, transparent); stroke-width: 1; stroke-dasharray: 2 2; }
      .relay-spark .hover { fill: var(--paper-surface); stroke: var(--paper-brand); stroke-width: 2; opacity: 0; }
      .relay-spark .hover.on { opacity: 1; }
      .relay-spark-tip { position: absolute; z-index: 1; transform: translate(-50%, -130%); padding: 3px 7px; border-radius: 6px; color: var(--paper-bg); background: var(--paper-text); font-size: 8.5px; line-height: 1.25; white-space: nowrap; opacity: 0; transition: opacity .12s ease; pointer-events: none; font-variant-numeric: tabular-nums; }
      .relay-spark-tip.on { opacity: 1; }
      .relay-spark-tip strong { font-weight: 600; }
      @media (max-width: 760px) { .relay-header { align-items: flex-start; flex-direction: column; } .relay-actions { justify-content: flex-start; } .relay-two-col { grid-template-columns: minmax(0, 1fr); } }
      @media (max-height: 420px) { .relay-page { padding-top: 12px; } .relay-card { padding: 8px 10px 6px; } .relay-value { font-size: 19px; } .relay-sparkbox, .relay-spark { height: 48px; } }
      @media (prefers-reduced-motion: reduce) { .relay-spark-tip { transition: none; } }
    `;

    function fmt(value, digits = 2) {
      if (value === undefined || value === null || value === '') return '—';
      const number = Number(value);
      return Number.isFinite(number)
        ? number.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })
        : '—';
    }

    function compact(value) {
      if (value === undefined || value === null || value === '') return '—';
      const number = Number(value);
      if (!Number.isFinite(number)) return '—';
      if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
      if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
      return number.toLocaleString();
    }

    function pick(object, ...keys) {
      for (const key of keys) {
        if (object && object[key] !== undefined && object[key] !== null) return object[key];
      }
      return undefined;
    }

    function normalizeSite(value) {
      const raw = String(value || '').trim();
      if (!raw) throw new Error('请输入中转站网址');
      const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      return url.origin;
    }

    function readLegacyProfiles() {
      const profiles = {};
      let rawProfiles, legacySite, legacyToken;
      try {
        rawProfiles = localStorage.getItem(PROFILE_KEY);
        legacySite = localStorage.getItem('dsh.relay-dashboard.legacy-site');
        legacyToken = localStorage.getItem('dsh.wawazz.token') || '';
      } catch { return { profiles, unmappedToken: '' }; }
      if (rawProfiles) {
        let value;
        try { value = JSON.parse(rawProfiles); } catch { throw new Error('旧版站点数据无法读取，浏览器副本已保留。'); }
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('旧版站点数据格式无效，浏览器副本已保留。');
        for (const [rawSite, profile] of Object.entries(value)) {
          if (!profile || typeof profile !== 'object' || !profile.token) continue;
          if (typeof profile.token !== 'string') throw new Error('旧版 Token 格式无效，浏览器副本已保留。');
          profiles[normalizeSite(rawSite)] = { token: profile.token, updatedAt: Number(profile.updatedAt) || Date.now() };
        }
      }
      if (legacyToken && legacySite) {
        const site = normalizeSite(legacySite);
        if (!profiles[site]) profiles[site] = { token: legacyToken, updatedAt: Date.now() };
      }
      return { profiles, unmappedToken: legacyToken && !legacySite ? legacyToken : '' };
    }

    function clearLegacyStorage(keepUnmappedToken = false) {
      try {
        localStorage.removeItem(PROFILE_KEY);
        if (!keepUnmappedToken) {
          localStorage.removeItem('dsh.relay-dashboard.legacy-site');
          localStorage.removeItem('dsh.wawazz.token');
        }
      } catch {}
    }

    function Icon({ size = 22, active = false }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: active ? 'var(--paper-brand)' : 'currentColor',
        strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
      }, h('path', { d: 'M4 19h16M5 16V5h14v11M8 9h8M8 12h5' }), h('path', { d: 'M8 5V3h8v2' }));
    }

    function Stat({ label, value, note, tone }) {
      return h('article', { className: 'relay-card' },
        h('p', { className: 'relay-label' }, label),
        h('p', { className: 'relay-value', style: tone ? { color: tone } : undefined }, value),
        h('p', { className: 'relay-note' }, note));
    }

    function resetCardLight(card) {
      card.classList.remove('is-lit', 'is-touch-active');
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    }

    function cardFromEvent(event) {
      const target = event.target;
      return target instanceof Element ? target.closest('.relay-card') : null;
    }

    function moveCardLight(event) {
      if (event.pointerType === 'touch') return;
      const card = cardFromEvent(event);
      const grid = event.currentTarget;
      grid.querySelectorAll('.relay-card.is-lit').forEach(activeCard => {
        if (activeCard !== card) resetCardLight(activeCard);
      });
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
      card.classList.add('is-lit');
    }

    function selectCardLight(event) {
      if (event.pointerType !== 'touch') return;
      const card = cardFromEvent(event);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))}%`);
      card.style.setProperty('--my', `${Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))}%`);
      const grid = event.currentTarget;
      grid.querySelectorAll('.relay-card.is-touch-active').forEach(resetCardLight);
      card.classList.add('is-touch-active');
    }

    function releaseCardLight(event) {
      if (event.pointerType !== 'touch') return;
      const card = cardFromEvent(event);
      if (card) setTimeout(() => card.classList.contains('is-touch-active') && resetCardLight(card), 900);
    }

    function leaveCardGrid(event) {
      if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) return;
      event.currentTarget.querySelectorAll('.relay-card.is-lit, .relay-card.is-touch-active').forEach(resetCardLight);
    }

    function normalizeToken(value) {
      return String(value || '').trim().replace(/^["'‘’“”]+|["'‘’“”]+$/g, '').replace(/^Bearer\s+/i, '').trim().replace(/^["'‘’“”]+|["'‘’“”]+$/g, '').trim();
    }

    async function profileRequest(input, method = input ? 'POST' : 'GET') {
      const response = await fetch('/relay-dashboard/profiles', {
        method, credentials: 'same-origin', cache: 'no-store',
        headers: input ? { 'Content-Type': 'application/json' } : {},
        body: input ? JSON.stringify(input) : undefined,
      });
      const result = await response.json();
      if (!response.ok) {
        const diagnostic = typeof result.diagnostic === 'string' && /^[A-Za-z]{1,40}Error$/.test(result.diagnostic) ? `（${result.diagnostic}）` : '';
        const message = result.code === 'login-challenge' ? t('challengeFallback') : result.error || '服务器凭据或中转站请求失败';
        const error = new Error(message + diagnostic);
        error.code = result.code;
        throw error;
      }
      return result;
    }

    function siteLabel(site) {
      try { return new URL(site).host; } catch { return site; }
    }

    function siteCredentialStatus(profile, now = Date.now()) {
      if (profile.needsTwoFactor) return t('statusTwoFactor');
      if (profile.expiresAt > 0 && profile.expiresAt <= now && !profile.hasRefreshToken) return t('statusExpired');
      if (profile.hasRefreshToken) return t('statusRenewal');
      if (profile.hasAccessToken && profile.verifiedAt) return t('statusTokenVerified');
      if (profile.hasAccessToken) return t('statusTokenUnverified');
      return t('statusReauth');
    }

    function formatCountdown(expiresAt, now) {
      if (!(expiresAt > 0)) return t('unavailable');
      const remaining = expiresAt - now;
      if (remaining <= 0) return t('expired');
      const seconds = Math.ceil(remaining / 1000);
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      if (days) return `${days}天 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function formatCredentialTime(timestamp) {
      if (!(timestamp > 0)) return t('unavailable');
      const date = new Date(timestamp);
      return Number.isNaN(date.getTime()) ? t('unavailable') : date.toLocaleString();
    }

    function formatSavedAt(timestamp) {
      if (!(timestamp > 0)) return '尚无保存时间';
      const date = new Date(timestamp);
      return Number.isNaN(date.getTime()) ? '尚无保存时间' : `保存于 ${date.toLocaleString()}`;
    }

    function SiteTiltCard({ site, profile, active, onSelect, onToken, onDelete, demo }) {
      const [node, setNode] = React.useState(null);
      const [now, setNow] = React.useState(() => Date.now());
      React.useEffect(() => {
        if (!(profile.expiresAt > 0)) return undefined;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
      }, [profile.expiresAt]);
      React.useEffect(() => {
        if (!node) return undefined;
        const card = node.firstElementChild;
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const noHover = window.matchMedia?.('(hover: none)').matches;
        let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
        let activeFrame = false, leaving = false, leaveStarted = 0, fromX = 0, fromY = 0;
        let demoFrame = 0, demoTimer = 0, cursor = null;
        const render = () => { card.style.transform = `rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg)`; };
        const loop = now => {
          raf = 0;
          if (leaving) {
            const progress = Math.min(1, (now - leaveStarted) / 1000);
            const eased = 1 - Math.pow(1 - progress, 3);
            cx = fromX * (1 - eased); cy = fromY * (1 - eased); render();
            if (progress < 1) raf = requestAnimationFrame(loop); else leaving = false;
            return;
          }
          if (!activeFrame || reduced || noHover) return;
          cx += (tx - cx) * .16; cy += (ty - cy) * .16; render();
          if (Math.abs(tx - cx) > .05 || Math.abs(ty - cy) > .05) raf = requestAnimationFrame(loop);
          else { cx = tx; cy = ty; render(); activeFrame = false; }
        };
        const kick = () => { activeFrame = true; leaving = false; if (!raf) raf = requestAnimationFrame(loop); };
        const setPointer = (px, py) => {
          px = Math.max(0, Math.min(1, px)); py = Math.max(0, Math.min(1, py));
          tx = (py - .5) * 2 * 32; ty = (.5 - px) * 2 * 32;
          card.style.setProperty('--mx', `${px * 100}%`); card.style.setProperty('--my', `${py * 100}%`);
          kick();
        };
        const move = event => {
          if (reduced || noHover || event.pointerType === 'touch') return;
          const rect = node.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          setPointer((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
          card.classList.add('on');
        };
        const leave = () => {
          card.classList.remove('on');
          if (reduced || noHover) return;
          leaving = true; activeFrame = false; leaveStarted = performance.now(); fromX = cx; fromY = cy;
          if (!raf) raf = requestAnimationFrame(loop);
        };
        node.addEventListener('pointermove', move);
        node.addEventListener('pointerleave', leave);
        if (!window.__uiInteractive && demo && !reduced && !noHover && typeof window.__uiDemoCursor === 'function') {
          cursor = window.__uiDemoCursor();
          const runDemo = () => {
            const rect = node.getBoundingClientRect();
            if (!rect.width || !rect.height) { demoTimer = setTimeout(runDemo, 300); return; }
            const started = performance.now();
            card.classList.add('on');
            cursor.el?.classList.add('show', 'sweeping');
            const step = now => {
              const progress = Math.min(1, (now - started) / 4200);
              const angle = Math.PI * 2 * progress;
              const px = .5 + Math.cos(angle) * .36, py = .5 + Math.sin(angle) * .30;
              setPointer(px, py); cursor.at(rect.left + px * rect.width, rect.top + py * rect.height);
              if (progress < 1) demoFrame = requestAnimationFrame(step);
              else {
                cursor.el?.classList.remove('sweeping'); cursor.hide?.(); card.classList.remove('on'); leave();
                demoTimer = setTimeout(runDemo, 2700);
              }
            };
            demoFrame = requestAnimationFrame(step);
          };
          demoTimer = setTimeout(runDemo, 300);
        }
        return () => {
          node.removeEventListener('pointermove', move); node.removeEventListener('pointerleave', leave);
          cancelAnimationFrame(raf); cancelAnimationFrame(demoFrame); clearTimeout(demoTimer);
          cursor?.hide?.();
        };
      }, [node, demo]);
      return h('div', { className: 'relay-site-tilt', ref: setNode },
        h('button', { type: 'button', className: 'relay-site-card', onClick: onSelect, 'aria-pressed': active, 'aria-label': `打开 ${siteLabel(site)} 的仪表盘` },
          h('span', { className: 'relay-site-glow g1', 'aria-hidden': true }),
          h('span', { className: 'relay-site-glow g2', 'aria-hidden': true }),
          h('span', { className: 'relay-site-content' },
            h('strong', null, siteLabel(site)),
            h('span', null, site),
            active ? h('span', { className: 'relay-site-current' }, '当前站点') : h('span', { className: 'relay-section-meta' }, formatSavedAt(profile.updatedAt)),
            h('span', { className: 'relay-section-meta' }, siteCredentialStatus(profile, now)),
            h('span', { className: 'relay-section-meta' }, `${t('nextUpdate')}：${formatCredentialTime(profile.expiresAt)}`),
            h('span', { className: 'relay-section-meta' }, `${t('expiresIn')}：${formatCountdown(profile.expiresAt, now)}`))),
        h('div', { className: 'relay-site-actions' },
          h('button', { type: 'button', className: 'relay-site-action', onClick: event => { event.stopPropagation(); onToken(); } }, '获取 Token'),
          h('button', { type: 'button', className: 'relay-site-action danger', onClick: event => { event.stopPropagation(); onDelete(); } }, '删除')));
    }

    function Sparkline({ records, period }) {
      const [svgNode, setSvgNode] = React.useState(null);
      const [width, setWidth] = React.useState(0);
      const [hoverIndex, setHoverIndex] = React.useState(-1);
      const source = records.map(item => ({
        date: String(pick(item, 'date', 'day', 'label') || ''),
        value: Number(pick(item, 'total_tokens', 'tokens')),
      })).filter(item => Number.isFinite(item.value));
      const data = source.length <= 7 ? source : Array.from({ length: 7 }, (_, index) => source[Math.round(index * (source.length - 1) / 6)]);
      const values = data.map(item => item.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      const points = width && data.length > 0 ? data.map((item, index) => ({
        x: data.length === 1 ? width / 2 : (index * (width - 2) / (data.length - 1)) + 1,
        y: SPARK_HEIGHT - SPARK_PAD - ((item.value - min) / range) * (SPARK_HEIGHT - SPARK_PAD * 2 - 4),
      })) : [];
      let linePath = '';
      if (points.length) {
        linePath = `M${points[0].x},${points[0].y}`;
        for (let index = 1; index < points.length; index += 1) {
          const previous = points[index - 1];
          const current = points[index];
          const controlX = (previous.x + current.x) / 2;
          linePath += ` C${controlX},${previous.y} ${controlX},${current.y} ${current.x},${current.y}`;
        }
      }
      const areaPath = points.length ? `${linePath} L${points[points.length - 1].x},${SPARK_HEIGHT} L${points[0].x},${SPARK_HEIGHT} Z` : '';
      const firstValue = data.length ? compact(data[0].value) : '—';
      const lastValue = data.length ? compact(data[data.length - 1].value) : '—';
      const latestExact = data.length ? data[data.length - 1].value.toLocaleString() : '—';
      const delta = data.length > 1 && data[0].value !== 0
        ? ((data[data.length - 1].value - data[0].value) / Math.abs(data[0].value)) * 100
        : null;
      const ariaLabel = `近 ${period} 天 Token 使用趋势，数值从 ${firstValue} 到 ${lastValue}`;

      React.useEffect(() => {
        if (!svgNode) return undefined;
        const measure = () => {
          const nextWidth = Math.round(svgNode.getBoundingClientRect().width);
          if (nextWidth > 0) setWidth(current => current === nextWidth ? current : nextWidth);
        };
        measure();
        const retry = setTimeout(measure, 200);
        window.addEventListener('resize', measure);
        return () => {
          clearTimeout(retry);
          window.removeEventListener('resize', measure);
        };
      }, [svgNode]);

      React.useEffect(() => {
        if (!width || points.length < 2 || window.__uiInteractive) return undefined;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        let frame = 0;
        let timeout = 0;
        let startedAt = 0;
        let lastIndex = -1;
        const duration = 2600;
        const sweep = timestamp => {
          if (!startedAt) startedAt = timestamp;
          const progress = Math.min(1, (timestamp - startedAt) / duration);
          const x = progress * (width - 2) + 1;
          let nearest = 0;
          let distance = Infinity;
          points.forEach((point, index) => {
            const nextDistance = Math.abs(point.x - x);
            if (nextDistance < distance) { nearest = index; distance = nextDistance; }
          });
          if (nearest !== lastIndex) { lastIndex = nearest; setHoverIndex(nearest); }
          if (progress < 1) frame = requestAnimationFrame(sweep);
          else timeout = setTimeout(() => {
            setHoverIndex(-1);
            timeout = setTimeout(() => {
              startedAt = 0;
              if (!window.__uiInteractive) frame = requestAnimationFrame(sweep);
            }, 700);
          }, 900);
        };
        timeout = setTimeout(() => { frame = requestAnimationFrame(sweep); }, 600);
        return () => {
          cancelAnimationFrame(frame);
          clearTimeout(timeout);
        };
      }, [width, records]);

      const showNearest = event => {
        if (!points.length) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        let nearest = 0;
        let distance = Infinity;
        points.forEach((point, index) => {
          const nextDistance = Math.abs(point.x - x);
          if (nextDistance < distance) { nearest = index; distance = nextDistance; }
        });
        setHoverIndex(nearest);
      };
      const hovered = points[hoverIndex];
      const tipText = data[hoverIndex];

      return h('div', null,
        h('div', { className: 'relay-spark-metric' },
          h('strong', null, latestExact),
          delta === null ? null : h('span', { className: delta >= 0 ? 'positive' : 'negative' }, `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`)),
        h('div', { className: 'relay-sparkbox' },
        h('svg', {
          ref: setSvgNode,
          className: 'relay-spark',
          viewBox: `0 0 ${Math.max(width, 1)} ${SPARK_HEIGHT}`,
          role: 'img',
          'aria-label': ariaLabel,
          onPointerMove: showNearest,
          onPointerLeave: () => setHoverIndex(-1),
        },
        h('defs', null, h('linearGradient', { id: 'relay-spark-gradient', x1: '0', y1: '0', x2: '0', y2: '1' },
          h('stop', { offset: '0', stopColor: 'var(--paper-brand)', stopOpacity: '.30' }),
          h('stop', { offset: '1', stopColor: 'var(--paper-brand)', stopOpacity: '0' }))),
        h('path', { className: 'area', d: areaPath }),
        hovered ? h('line', { className: 'guide', x1: hovered.x, y1: hovered.y, x2: hovered.x, y2: SPARK_HEIGHT }) : null,
        h('path', { className: 'line', d: linePath }),
        points.length ? h('circle', { className: 'end-halo', cx: points[points.length - 1].x, cy: points[points.length - 1].y, r: 5 }) : null,
        points.length ? h('circle', { className: 'end', cx: points[points.length - 1].x, cy: points[points.length - 1].y, r: 3 }) : null,
        hovered ? h('circle', { className: 'hover on', cx: hovered.x, cy: hovered.y, r: 3.5 }) : null),
        h('div', {
          className: `relay-spark-tip${hovered ? ' on' : ''}`,
          style: hovered ? { left: hovered.x, top: hovered.y } : undefined,
          'aria-hidden': true,
        }, tipText ? h('span', null, h('strong', null, tipText.date), ` · ${compact(tipText.value)}`) : null)));
    }

    function EyeToggle({ open, onToggle, noun }) {
      return h('button', {
        type: 'button', className: `relay-eye${open ? ' is-open' : ''}`,
        'aria-label': `${open ? '隐藏' : '显示'}${noun}`,
        'aria-pressed': open,
        onClick: event => { if (event.isTrusted === false) return; onToggle(); },
      }, h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true },
        h('path', { d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z' }),
        h('circle', { className: 'pupil', cx: 12, cy: 12, r: 3.2 }),
        h('line', { className: 'slash', x1: 3, y1: 3, x2: 21, y2: 21 })));
    }

    function Dashboard() {
      const [, setLocaleRevision] = React.useState(0);
      React.useEffect(() => localeService?.subscribe(() => setLocaleRevision(revision => revision + 1)), []);
      const [profiles, setProfiles] = React.useState({});
      const [legacyUnmappedToken, setLegacyUnmappedToken] = React.useState('');
      const [requests] = React.useState(() => ({ sequence: 0 }));
      const [restoring, setRestoring] = React.useState(true);
      const [site, setSite] = React.useState('');
      const [draftSite, setDraftSite] = React.useState(DEFAULT_SITE);
      const [email, setEmail] = React.useState('');
      const [password, setPassword] = React.useState('');
      const [authMethod, setAuthMethod] = React.useState('account');
      const [directToken, setDirectToken] = React.useState('');
      const [directTokenVisible, setDirectTokenVisible] = React.useState(false);
      const [authMethodIndicator, setAuthMethodIndicator] = React.useState({ left: 3, width: 0 });
      const authMethodButtons = React.useRef({});
      const authMethodTrack = React.useRef(null);
      const [passwordVisible, setPasswordVisible] = React.useState(false);
      const [passwordType, setPasswordType] = React.useState('password');
      const [tokenVisible, setTokenVisible] = React.useState(false);
      const [tokenOutput, setTokenOutput] = React.useState('');
      const [tokenCopyStatus, setTokenCopyStatus] = React.useState('');
      const [totpCode, setTotpCode] = React.useState('');
      const [needsTwoFactor, setNeedsTwoFactor] = React.useState(false);
      const [mode, setMode] = React.useState('dashboard');
      const [modeCopy, setModeCopy] = React.useState('dashboard');
      const [modeCopySwap, setModeCopySwap] = React.useState(false);
      const [modeIndicator, setModeIndicator] = React.useState({ left: 3, width: 0 });
      const modeTrack = React.useRef(null);
      const modeButtons = React.useRef({});
      const modeTimer = React.useRef(0);
      const passwordTimer = React.useRef(0);
      const [data, setData] = React.useState(null);
      const [error, setError] = React.useState('');
      const [managerError, setManagerError] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const [managingSites, setManagingSites] = React.useState(true);
      const [range, setRange] = React.useState('7');

      const load = async (targetSite = site, targetRange = range) => {
        if (!targetSite) return;
        const sequence = ++requests.sequence;
        setBusy(true); setError(''); setManagerError('');
        try {
          const result = await profileRequest({ action: 'dashboard', site: targetSite, range: targetRange });
          if (sequence !== requests.sequence) return;
          setData(result.dashboard);
          setProfiles(result.profiles || {});
          setSite(targetSite); setDraftSite(targetSite);
          setTokenOutput(''); setManagingSites(false); setNeedsTwoFactor(false);
        } catch (cause) {
          if (sequence === requests.sequence) {
            setError(cause.message || '无法读取中转站数据');
            setManagerError(cause.message || '无法读取中转站数据');
            if (cause.code === 'reauth-required' || cause.code === 'login-rejected') {
              setData(null); setManagingSites(true); setDraftSite(targetSite);
              setManagerError('登录状态已失效，请重新登录后继续。');
            }
          }
        } finally {
          if (sequence === requests.sequence) setBusy(false);
        }
      };

      const applyLoginResult = async (result, targetSite, targetMode) => {
        setSite(targetSite); setDraftSite(targetSite); setNeedsTwoFactor(false); setTotpCode('');
        setPassword(''); setEmail('');
        if (Object.hasOwn(result, 'accessToken')) {
          setProfiles((await profileRequest()).profiles || {});
          setTokenOutput(result.accessToken); setTokenVisible(false); setTokenCopyStatus('');
          setData(null); setManagingSites(true);
          return;
        }
        setProfiles(result.profiles || (await profileRequest()).profiles || {});
        setTokenOutput(''); setData(result.dashboard); setManagingSites(false);
        if (targetMode === 'dashboard') setError('');
      };

      const chooseAuthMethod = next => {
        if (busy || needsTwoFactor || !['account', 'token'].includes(next)) return;
        setAuthMethod(next);
        setManagerError('');
        setPassword(''); setDirectToken(''); setDirectTokenVisible(false);
      };

      const handleAuthMethodKeyDown = (event, current) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const next = current === 'account' ? 'token' : 'account';
        chooseAuthMethod(next);
        authMethodButtons.current[next]?.focus();
      };

      const submitLogin = async event => {
        event.preventDefault();
        const sequence = ++requests.sequence;
        setBusy(true); setManagerError(''); setError(''); setTokenOutput('');
        try {
          const targetSite = normalizeSite(draftSite);
          const result = await profileRequest({ action: 'login', site: targetSite, email, password, mode });
          setPassword(''); setEmail('');
          if (result.requiresTwoFactor) {
            setSite(targetSite); setDraftSite(targetSite); setMode(result.mode || mode); setNeedsTwoFactor(true);
            setManagerError('请输入该账户验证器当前生成的 6 位代码。');
            return;
          }
          if (sequence === requests.sequence) await applyLoginResult(result, targetSite, mode);
        } catch (cause) {
          if (sequence === requests.sequence) setManagerError(cause.message || '登录失败');
        } finally { setPassword(''); if (sequence === requests.sequence) setBusy(false); }
      };

      const submitDirectToken = async event => {
        event.preventDefault();
        const sequence = ++requests.sequence;
        setBusy(true); setManagerError(''); setError(''); setTokenOutput('');
        try {
          const targetSite = normalizeSite(draftSite);
          const result = await profileRequest({ action: 'save-token', site: targetSite, token: directToken });
          if (sequence !== requests.sequence) return;
          setProfiles(result.profiles || {});
          setSite(targetSite); setDraftSite(targetSite); setDirectToken(''); setDirectTokenVisible(false);
          setData(null); setNeedsTwoFactor(false);
          await load(targetSite, range);
        } catch (cause) {
          if (sequence === requests.sequence) setManagerError(cause.message || t('tokenSaveError'));
        } finally { if (sequence === requests.sequence) setBusy(false); }
      };

      const submitTwoFactor = async event => {
        event.preventDefault();
        const sequence = ++requests.sequence;
        setBusy(true); setManagerError('');
        try {
          const targetSite = normalizeSite(draftSite);
          const result = await profileRequest({ action: 'complete-two-factor', site: targetSite, totp_code: totpCode });
          if (sequence === requests.sequence) await applyLoginResult(result, targetSite, mode);
        } catch (cause) {
          if (sequence === requests.sequence) setManagerError(cause.message || '两步验证失败');
        } finally { if (sequence === requests.sequence) setBusy(false); }
      };

      const getToken = async targetSite => {
        setBusy(true); setManagerError(''); setTokenOutput('');
        try {
          const result = await profileRequest({ action: 'token', site: targetSite });
          setTokenOutput(result.accessToken); setTokenVisible(false); setTokenCopyStatus('');
          setSite(targetSite); setDraftSite(targetSite); setData(null); setManagingSites(true);
        } catch (cause) { setManagerError(cause.message || '无法获取访问 Token'); }
        finally { setBusy(false); }
      };

      const switchSite = targetSite => {
        if (busy) return;
        const profile = profiles[targetSite];
        setSite(targetSite); setDraftSite(targetSite); setData(null); setTokenOutput('');
        if (profile?.needsTwoFactor) {
          setMode(profile.pendingMode || 'dashboard'); setNeedsTwoFactor(true); setManagingSites(true);
          setManagerError('请输入该账户验证器当前生成的 6 位代码。');
          return;
        }
        setNeedsTwoFactor(false); setManagingSites(false); setError(''); load(targetSite, range);
      };

      const deleteSite = async targetSite => {
        if (!window.confirm(`删除 ${siteLabel(targetSite)} 在 DSH 服务器保存的凭据？此操作不会删除中转站账号。`)) return;
        setBusy(true); setManagerError('');
        try {
          const result = await profileRequest({ site: targetSite }, 'DELETE');
          setProfiles(result.profiles || {});
          if (targetSite === site) { setSite(''); setData(null); setManagingSites(true); }
          setTokenOutput('');
        } catch (cause) { setManagerError(cause.message || '删除失败'); }
        finally { setBusy(false); }
      };

      const deleteAll = async () => {
        if (!window.confirm('删除本 DSH profile 保存的所有中转站凭据和待完成登录信息？此操作无法撤销。')) return;
        setBusy(true); setManagerError('');
        try {
          await profileRequest({}, 'DELETE');
          clearLegacyStorage(); setLegacyUnmappedToken('');
          setProfiles({}); setData(null); setSite(''); setDraftSite(''); setTokenOutput(''); setNeedsTwoFactor(false); setManagingSites(true);
        } catch (cause) { setManagerError(cause.message || '删除失败'); }
        finally { setBusy(false); }
      };

      const cancelTwoFactor = async () => {
        try {
          const result = await profileRequest({ action: 'cancel-pending', site: draftSite });
          setProfiles(result.profiles || {}); setNeedsTwoFactor(false); setTotpCode(''); setManagerError('');
        } catch (cause) { setManagerError(cause.message || '无法取消待完成登录'); }
      };

      const importUnmappedLegacyToken = async () => {
        let targetSite;
        try { targetSite = normalizeSite(draftSite); } catch (cause) { setManagerError(cause.message); return; }
        setBusy(true); setManagerError('');
        try {
          const result = await profileRequest({
            action: 'import-legacy', profiles: { [targetSite]: { token: legacyUnmappedToken } },
          });
          clearLegacyStorage();
          setLegacyUnmappedToken(''); setProfiles(result.profiles || {});
          setSite(targetSite); setDraftSite(targetSite); setData(null); setManagingSites(true);
        } catch (cause) { setManagerError(cause.message || '旧版 Token 迁移失败，浏览器副本仍保留。'); }
        finally { setBusy(false); }
      };

      const chooseMode = next => {
        if (next === mode) return;
        setMode(next); setModeCopySwap(true);
        clearTimeout(modeTimer.current);
        modeTimer.current = setTimeout(() => { setModeCopy(next); setModeCopySwap(false); }, 130);
      };

      const togglePassword = () => {
        const next = !passwordVisible;
        setPasswordVisible(next);
        clearTimeout(passwordTimer.current);
        passwordTimer.current = setTimeout(() => setPasswordType(next ? 'text' : 'password'), 100);
        setTimeout(() => document.getElementById('relay-password')?.focus({ preventScroll: true }), 0);
      };

      const toggleTokenVisible = () => {
        const next = !tokenVisible;
        setTokenVisible(next);
        setTimeout(() => document.getElementById('relay-token-result')?.focus({ preventScroll: true }), 0);
      };

      const copyToken = async () => {
        try {
          await navigator.clipboard.writeText(tokenOutput);
          setTokenCopyStatus('已复制访问 Token');
        } catch { setTokenCopyStatus('复制失败，请选中 Token 后手动复制'); }
      };

      React.useEffect(() => {
        const layout = () => {
          const track = authMethodTrack.current;
          const button = authMethodButtons.current[authMethod];
          if (!track || !button) return;
          const rect = button.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          setAuthMethodIndicator({ left: button.offsetLeft, width: button.offsetWidth });
        };
        const frame = requestAnimationFrame(layout);
        window.addEventListener('resize', layout);
        return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', layout); };
      }, [authMethod, restoring, managingSites, needsTwoFactor]);

      React.useEffect(() => {
        const layout = () => {
          const track = modeTrack.current;
          const button = modeButtons.current[mode];
          if (!track || !button) return;
          const rect = button.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          setModeIndicator({ left: button.offsetLeft, width: button.offsetWidth });
        };
        const frame = requestAnimationFrame(layout);
        window.addEventListener('resize', layout);
        return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', layout); };
      }, [mode, restoring, managingSites]);

      React.useEffect(() => () => { clearTimeout(modeTimer.current); clearTimeout(passwordTimer.current); }, []);

      React.useEffect(() => {
        let disposed = false;
        (async () => {
          try {
            let result = await profileRequest();
            const legacy = readLegacyProfiles();
            const legacySites = Object.entries(legacy.profiles);
            for (const [legacySite, profile] of legacySites) {
              result = await profileRequest({ action: 'import-legacy', profiles: { [legacySite]: profile } });
            }
            if (legacy.unmappedToken) { setLegacyUnmappedToken(legacy.unmappedToken); clearLegacyStorage(true); }
            else clearLegacyStorage();
            if (disposed) return;
            const stored = result.profiles || {};
            setProfiles(stored);
            const selected = Object.keys(stored)[0];
            if (selected && stored[selected].needsTwoFactor) {
              setSite(selected); setDraftSite(selected); setMode(stored[selected].pendingMode || 'dashboard');
              setNeedsTwoFactor(true); setManagerError('请输入该账户验证器当前生成的 6 位代码。'); setManagingSites(true);
            } else if (selected) {
              setSite(selected); setDraftSite(selected); setManagingSites(false);
              load(selected, '7');
            } else setManagingSites(true);
          } catch (cause) {
            if (!disposed) { setManagerError(cause.message || '无法读取服务器凭据'); setManagingSites(true); }
          } finally { if (!disposed) setRestoring(false); }
        })();
        return () => { disposed = true; requests.sequence++; };
      }, []);

      if (restoring) return h('main', { className: 'relay-page' }, h('style', null, css), h('p', { role: 'status' }, '正在恢复服务器站点列表…'));
      if (busy && !data && !managingSites) return h('main', { className: 'relay-page' }, h('style', null, css), h('p', { role: 'status' }, '正在安全读取中转站数据…'));

      if (managingSites || !data) return h('main', { className: 'relay-page' },
        h('style', null, css),
        h('section', { className: 'relay-setup' },
          h('header', { className: 'relay-header' },
            h('div', null, h('h1', { className: 'relay-title' }, '中转站仪表盘'), h('p', { className: 'relay-subtitle' }, t('headerSubtitle'))),
            data ? h('button', { className: 'relay-button', type: 'button', onClick: () => setManagingSites(false) }, '返回仪表盘') : null),
          Object.keys(profiles).length ? h('section', { className: 'relay-manager-panel' },
            h('div', { className: 'relay-section-head' }, h('h2', { className: 'relay-section-title' }, '已登录站点'), h('span', { className: 'relay-section-meta' }, `${Object.keys(profiles).length} 个`)),
            h('div', { className: 'relay-site-grid' }, Object.entries(profiles).map(([savedSite, savedProfile]) =>
              h(SiteTiltCard, {
                key: savedSite, site: savedSite, profile: savedProfile, active: savedSite === site,
                onSelect: () => switchSite(savedSite), onToken: () => getToken(savedSite),
                onDelete: () => deleteSite(savedSite), demo: false,
              }))),
            h('div', { className: 'relay-sites-actions' },
              h('button', { className: 'relay-site-action danger', type: 'button', disabled: busy, onClick: deleteAll }, '删除全部已保存隐私数据'))
          ) : null,
          h('section', { className: 'relay-manager-panel relay-auth-form' },
            h('div', { className: 'relay-section-head' }, h('h2', { className: 'relay-section-title' }, needsTwoFactor ? '完成两步验证' : '登录中转站')),
            !needsTwoFactor ? h('form', { className: 'relay-form', onSubmit: authMethod === 'account' ? submitLogin : submitDirectToken },
              h('label', { className: 'relay-auth-label', htmlFor: 'relay-auth-site' }, '中转站网址'),
              h('input', { id: 'relay-auth-site', type: 'url', value: draftSite, disabled: busy, onChange: event => { setDraftSite(event.target.value); setManagerError(''); }, placeholder: 'https://gateway.example', autoComplete: 'url', required: true }),
              h('div', { ref: authMethodTrack, className: 'relay-mode-track', role: 'group', 'aria-label': t('authMethodGroup') },
                h('span', { className: 'relay-mode-indicator', style: authMethodIndicator, 'aria-hidden': true }),
                h('button', { ref: node => { authMethodButtons.current.account = node; }, type: 'button', className: `relay-mode-option${authMethod === 'account' ? ' on' : ''}`, 'aria-pressed': authMethod === 'account', disabled: busy, onClick: () => chooseAuthMethod('account'), onKeyDown: event => handleAuthMethodKeyDown(event, 'account') }, t('authAccount')),
                h('button', { ref: node => { authMethodButtons.current.token = node; }, type: 'button', className: `relay-mode-option${authMethod === 'token' ? ' on' : ''}`, 'aria-pressed': authMethod === 'token', disabled: busy, onClick: () => chooseAuthMethod('token'), onKeyDown: event => handleAuthMethodKeyDown(event, 'token') }, t('authToken'))),
              authMethod === 'account' ? h(React.Fragment, null,
                h('label', { className: 'relay-auth-label', htmlFor: 'relay-email' }, '邮箱'),
                h('input', { id: 'relay-email', type: 'email', value: email, disabled: busy, onChange: event => setEmail(event.target.value), autoComplete: 'username', required: true }),
                h('label', { className: 'relay-auth-label', htmlFor: 'relay-password' }, '密码'),
                h('div', { className: 'relay-secret-app' },
                  h('div', { className: 'relay-secret-field' }, h('input', { id: 'relay-password', type: passwordType, value: password, disabled: busy, onChange: event => setPassword(event.target.value), autoComplete: 'current-password', required: true })),
                  h(EyeToggle, { open: passwordVisible, onToggle: togglePassword, noun: '密码' })),
                h('div', { ref: modeTrack, className: 'relay-mode-track', role: 'group', 'aria-label': '登录后获取内容' },
                  h('span', { className: 'relay-mode-indicator', style: modeIndicator, 'aria-hidden': true }),
                  h('button', { ref: node => { modeButtons.current.dashboard = node; }, type: 'button', className: `relay-mode-option${mode === 'dashboard' ? ' on' : ''}`, 'aria-pressed': mode === 'dashboard', onClick: () => chooseMode('dashboard') }, '仪表盘'),
                  h('button', { ref: node => { modeButtons.current.token = node; }, type: 'button', className: `relay-mode-option${mode === 'token' ? ' on' : ''}`, 'aria-pressed': mode === 'token', onClick: () => chooseMode('token') }, '仅 Token')),
                h('p', { className: `relay-mode-copy${modeCopySwap ? ' swap' : ''}`, 'aria-live': 'polite' }, modeCopy === 'dashboard' ? '登录后读取余额、用量统计、趋势和模型分布。' : '只登录并返回访问 Token，不请求余额或统计数据。Refresh Token 仅保存在 DSH 服务器。'))
                : h(React.Fragment, null,
                  h('label', { className: 'relay-auth-label', htmlFor: 'relay-access-token' }, t('accessTokenLabel')),
                  h('div', { className: 'relay-secret-app' },
                    h('div', { className: 'relay-secret-field' }, h('input', { id: 'relay-access-token', type: directTokenVisible ? 'text' : 'password', value: directToken, disabled: busy, onChange: event => { setDirectToken(event.target.value); setManagerError(''); }, autoComplete: 'off', autoCorrect: 'off', spellCheck: false, required: true })),
                    h(EyeToggle, { open: directTokenVisible, onToggle: () => setDirectTokenVisible(value => !value), noun: t('accessTokenLabel') })),
                  h('p', { className: 'relay-auth-note' }, t('tokenLoginHint'))),
              h('button', { className: 'relay-button primary relay-auth-submit', type: 'submit', disabled: busy || !draftSite || (authMethod === 'account' ? !email || !password : !directToken) }, busy ? authMethod === 'account' ? '登录中…' : t('savingAndQuery') : authMethod === 'account' ? mode === 'dashboard' ? '登录并打开仪表盘' : '登录并获取访问 Token' : t('saveAndQuery')))
              : h('form', { className: 'relay-form', onSubmit: submitTwoFactor },
                h('label', { className: 'relay-auth-label', htmlFor: 'relay-totp' }, '6 位验证器代码'),
                h('input', { id: 'relay-totp', type: 'text', inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6, value: totpCode, disabled: busy, onChange: event => setTotpCode(event.target.value.replace(/\\D/g, '').slice(0, 6)), autoComplete: 'one-time-code', required: true }),
                h('button', { className: 'relay-button primary relay-auth-submit', type: 'submit', disabled: busy || totpCode.length !== 6 }, busy ? '验证中…' : '验证并继续'),
                h('button', { className: 'relay-button', type: 'button', disabled: busy, onClick: cancelTwoFactor }, '取消待完成登录')),
            h('p', { className: 'relay-manager-error', role: 'alert' }, managerError),
            legacyUnmappedToken ? h('div', { className: 'relay-auth-note' },
              h('p', null, '检测到旧版单 Token，但浏览器没有记录来源站点。请先填写正确的中转站网址，再确认迁移。'),
              h('button', { className: 'relay-button', type: 'button', disabled: busy || !draftSite, onClick: importUnmappedLegacyToken }, '将旧 Token 保存到此来源')) : null,
            tokenOutput ? h('div', { className: 'relay-token-output' },
              h('label', { className: 'relay-auth-label', htmlFor: 'relay-token-result' }, '访问 Token'),
              h('div', { className: 'relay-token-row' },
                h('div', { className: 'relay-secret-app' },
                  h('div', { className: 'relay-secret-field' }, h('input', { id: 'relay-token-result', type: tokenVisible ? 'text' : 'password', value: tokenOutput, readOnly: true, autoComplete: 'off', 'aria-label': '访问 Token' })),
                  h(EyeToggle, { open: tokenVisible, onToggle: toggleTokenVisible, noun: 'Token' })),
                h('button', { className: 'relay-button', type: 'button', onClick: copyToken }, '复制')),
              h('p', { className: 'relay-section-meta', role: 'status', 'aria-live': 'polite' }, tokenCopyStatus)) : null,
            h('p', { className: 'relay-auth-note' }, '账号密码只用于本次登录，不会保存。访问与 Refresh Token 存入当前 DSH profile 的凭据库；统计数据仅在服务器请求期间处理，不写入浏览器持久存储。Token-only 响应只包含访问 Token。'),
            h('p', { className: 'relay-auth-note' }, '登录需要 HTTPS。账号密码不会保存；人机验证须在站点官方页面完成，插件不会模拟或绕过。')),
        ));

      const profile = data?.profile || {};
      const stats = data?.stats || {};
      const platforms = Array.isArray(stats.by_platform) ? stats.by_platform : [];
      const trends = Array.isArray(data?.trend) ? data.trend : [];
      const models = Array.isArray(data?.models) ? data.models : [];
      const balance = pick(profile, 'balance', 'available_balance', 'credit');
      const todayRequests = pick(stats, 'today_requests', 'requests_today');
      const totalRequests = pick(stats, 'total_requests');
      const todayCost = pick(stats, 'today_actual_cost', 'today_cost');
      const totalCost = pick(stats, 'total_actual_cost', 'total_cost');
      const todayTokens = pick(stats, 'today_tokens');
      const totalTokens = pick(stats, 'total_tokens');
      const rpm = pick(stats, 'rpm');
      const tpm = pick(stats, 'tpm');
      const latency = pick(stats, 'avg_response_time', 'average_response_time');
      const card = (label, value, note, tone) => h(Stat, { label, value, note, tone });

      return h('main', { className: 'relay-page' },
        h('style', null, css),
        h('header', { className: 'relay-header' },
          h('div', null,
            h('h1', { className: 'relay-title' }, '中转站仪表盘'),
            h('p', { className: 'relay-subtitle' }, site)),
          h('div', { className: 'relay-actions' },
            h('button', { className: 'relay-button', onClick: () => load(), disabled: busy }, busy ? '读取中…' : '刷新数据'),
            h('button', { className: 'relay-button', onClick: () => { setManagingSites(true); setManagerError(''); setTokenOutput(''); } }, '账号与登录'))),
        h('div', { className: 'relay-toolbar' },
          h('label', { htmlFor: 'relay-range' }, '统计时间范围'),
          h('select', { id: 'relay-range', value: range, onChange: event => {
            const nextRange = event.target.value;
            setRange(nextRange);
            load(site, nextRange);
          } },
          h('option', { value: '7' }, '近 7 天'),
          h('option', { value: '30' }, '近 30 天'),
          h('option', { value: '90' }, '近 90 天')),
          h('span', { className: 'relay-section-meta' }, '数据来自当前中转站账户')),
        h('section', {
          className: 'relay-grid',
          'aria-label': '中转站统计',
          onPointerMove: moveCardLight,
          onPointerDown: selectCardLight,
          onPointerUp: releaseCardLight,
          onPointerCancel: leaveCardGrid,
          onPointerLeave: leaveCardGrid,
        },
          card('账户余额', `$${fmt(balance)}`, '当前可用余额', 'var(--paper-ok)'),
          card('API 密钥', compact(pick(stats, 'total_api_keys')), `${compact(pick(stats, 'active_api_keys'))} 个启用`),
          card('今日请求', compact(todayRequests), `累计 ${compact(totalRequests)} 次`),
          card('今日费用', `$${fmt(todayCost, 4)}`, `累计 $${fmt(totalCost, 4)}`),
          card('今日 Token', compact(todayTokens), `输入 ${compact(pick(stats, 'today_input_tokens'))} / 输出 ${compact(pick(stats, 'today_output_tokens'))}`),
          card('累计 Token', compact(totalTokens), `输入 ${compact(pick(stats, 'total_input_tokens'))} / 输出 ${compact(pick(stats, 'total_output_tokens'))}`),
          card('性能指标', `${fmt(rpm, 0)} RPM`, `${compact(tpm)} TPM`),
          card('平均响应', `${fmt(latency, 2)}s`, '平均响应时间')),
        h('section', { className: 'relay-section' },
          h('div', { className: 'relay-section-head' },
            h('h2', { className: 'relay-section-title' }, '按平台拆分'),
            h('span', { className: 'relay-section-meta' }, `${platforms.length} 个平台`)),
          h('div', { className: 'relay-platform-grid' }, platforms.length ? platforms.map((item, index) =>
            h('article', { className: 'relay-platform', key: String(item.platform || index) },
              h('div', { className: 'relay-platform-head' },
                h('span', null, item.platform || '未知平台'),
                h('span', null, `$${fmt(pick(item, 'total_actual_cost', 'total_cost'), 4)}`)),
              h('div', { className: 'relay-platform-stat' }, h('span', null, '今日费用'), h('span', null, `$${fmt(pick(item, 'today_actual_cost', 'today_cost'), 4)}`)),
              h('div', { className: 'relay-platform-stat' }, h('span', null, '请求'), h('span', null, compact(pick(item, 'total_requests')))),
              h('div', { className: 'relay-platform-stat' }, h('span', null, 'Token'), h('span', null, compact(pick(item, 'total_tokens'))))))
            : h('span', { className: 'relay-section-meta' }, '暂无平台数据'))),
        h('div', { className: 'relay-two-col' },
          h('section', { className: 'relay-section', style: { marginTop: 0 } },
            h('div', { className: 'relay-section-head' },
              h('h2', { className: 'relay-section-title' }, 'Token 使用趋势'),
              h('span', { className: 'relay-section-meta' }, `近 ${range} 天`)),
            trends.length ? h(Sparkline, { records: trends, period: range }) : h('span', { className: 'relay-section-meta' }, '暂无趋势数据')),
          h('section', { className: 'relay-section', style: { marginTop: 0 } },
            h('div', { className: 'relay-section-head' },
              h('h2', { className: 'relay-section-title' }, '模型分布'),
              h('span', { className: 'relay-section-meta' }, `${models.length} 个模型`)),
            h('div', { className: 'relay-model-list' }, models.length ? models.slice(0, 8).map((item, index) =>
              h('div', { className: 'relay-model-row', key: String(item.model || item.name || index) },
                h('span', { className: 'relay-model-name' }, item.model || item.name || '未知模型'),
                h('span', { className: 'relay-model-value' }, `${compact(pick(item, 'total_tokens', 'tokens'))} · ${compact(pick(item, 'total_requests', 'requests'))} 次`)))
              : h('span', { className: 'relay-section-meta' }, '暂无模型数据')))),
        h('p', { className: `relay-status${data && !error ? ' ok' : ''}`, role: 'status', 'aria-live': 'polite' }, error || (data ? '数据已更新' : '正在读取数据…')));
    }

    function SafeDashboard(props) {
      try {
        return Dashboard(props);
      } catch {
        return h('main', { className: 'relay-page' },
          h('style', null, css),
          h('section', { className: 'relay-setup' },
            h('h1', { className: 'relay-title' }, '中转站仪表盘加载失败'),
            h('p', { className: 'relay-subtitle', role: 'alert' }, '请刷新页面后重试。')));
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        localeService = ctx.locale;
        t = ctx.locale.bind('relay-dashboard');
        ctx.effect(() => ctx.locale.register('relay-dashboard', UI_TEXT), 'relay-dashboard UI translations');
        const Panel = props => h(SafeDashboard, props);
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL, order: 30, label: '中转站仪表盘',
        }, Icon));
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL }, Panel));
      },
    };
  },
});
