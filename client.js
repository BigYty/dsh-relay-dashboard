window.__ModuleLoader__.load({
  id: '@local/relay-dashboard',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const PANEL = '@local/relay-dashboard';
    const DEFAULT_SITE = '';
    const PROFILE_KEY = 'dsh.relay-dashboard.profiles';
    const SPARK_HEIGHT = 56;
    const SPARK_PAD = 6;

    const css = `
      .relay-page { --paper-bg: #F7F3EA; --paper-surface: #F2ECE0; --paper-text: #3B342A; --paper-dim: #7C7263; --paper-brand: #8A6A45; --paper-ok: #4F7A5A; --paper-warn: #B07D28; --paper-bad: #A34A3C; --paper-line: #D8CFBA; --paper-on-brand: #F7F3EA; --ui-bg: var(--paper-bg); --ui-surface: var(--paper-surface); --ui-text: var(--paper-text); --ui-text-dim: var(--paper-dim); --ui-brand: var(--paper-brand); --ui-success: var(--paper-ok); box-sizing: border-box; height: 100%; min-height: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; padding: 24px clamp(16px, 3vw, 40px) 40px; color: var(--paper-text); background: var(--paper-bg); }
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
      .relay-card { position: relative; isolation: isolate; min-width: 0; min-height: 104px; padding: 15px 16px 13px; overflow: hidden; border: 1px solid var(--paper-line); border-left: 3px solid var(--paper-brand); border-radius: 5px; background: var(--paper-surface); background-image: repeating-linear-gradient(180deg, rgba(59,52,42,.055) 0 1px, transparent 1px 4px); box-shadow: none; transition: transform .25s ease, border-color .25s ease; }
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
      .relay-site-card { width:100%; overflow:visible; position: relative; min-height: 126px; padding: 14px; border: 1px solid color-mix(in srgb, var(--paper-text) 15%, transparent); border-radius: 10px; color: var(--paper-text); text-align: left; background: color-mix(in srgb, var(--paper-text) 5%, var(--paper-surface)); background-image: repeating-linear-gradient(180deg, rgba(59,52,42,.04) 0 1px, transparent 1px 4px); transform: rotateX(0deg) rotateY(0deg); transform-style: preserve-3d; will-change: transform; cursor: pointer; }
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
      .relay-section { margin-top: 18px; padding: 16px; border: 1px solid var(--paper-line); border-radius: 5px; background: var(--paper-surface); background-image: repeating-linear-gradient(180deg, rgba(59,52,42,.055) 0 1px, transparent 1px 4px); }

      .relay-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
      .relay-section-title { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: 0; }
      .relay-section-meta { color: var(--paper-dim); font-size: 12px; }
      .relay-two-col { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, .72fr); gap: 16px; margin-top: 18px; }
      .relay-platform-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
      .relay-platform { padding: 12px 13px; border: 1px solid var(--paper-line); border-left: 3px solid var(--paper-brand); border-radius: 4px; background: color-mix(in srgb, var(--paper-text) 8%, var(--paper-surface)); background-image: repeating-linear-gradient(180deg, rgba(59,52,42,.055) 0 1px, transparent 1px 4px); }
      .relay-platform-head { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 600; }
      .relay-platform-stat { display: flex; justify-content: space-between; gap: 12px; margin-top: 8px; color: var(--paper-dim); font-size: 11px; }
      .relay-model-list { display: flex; flex-direction: column; gap: 8px; }
      .relay-model-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 10px; border-radius: 4px; background: color-mix(in srgb, var(--paper-text) 8%, var(--paper-surface)); background-image: repeating-linear-gradient(180deg, rgba(59,52,42,.055) 0 1px, transparent 1px 4px); font-size: 12px; }
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

    function readProfiles() {
      try {
        const value = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
        if (value && typeof value === 'object' && Object.keys(value).length) return value;
        // An old single-token entry has no origin; require an explicit mapping.
        const legacySite = localStorage.getItem('dsh.relay-dashboard.legacy-site');
        const legacy = localStorage.getItem('dsh.wawazz.token');
        return legacy && legacySite ? { [normalizeSite(legacySite)]: { token: legacy, updatedAt: Date.now() } } : {};
      } catch {
        return {};
      }
    }

    async function getJson(site, path, token, params) {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await fetch(`${site}/api/v1${path}${query}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(response.status === 401 ? 'Token 无效或已过期' : `请求失败（${response.status}）`);
      return response.json();
    }

    function unwrap(value, key) {
      return value?.data?.[key] || value?.[key] || [];
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

    async function profileRequest(input) {
      const response = await fetch('/relay-dashboard/profiles', {
        method: input ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store',
        headers: input ? { 'Content-Type': 'application/json' } : {},
        body: input ? JSON.stringify(input) : undefined,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '服务器站点存储不可用');
      return result.profiles;
    }

    function siteLabel(site) {
      try { return new URL(site).host; } catch { return site; }
    }

    function formatSavedAt(timestamp) {
      const date = new Date(timestamp);
      return Number.isNaN(date.getTime()) ? '尚无保存时间' : `保存于 ${date.toLocaleString()}`;
    }

    function SiteTiltCard({ site, profile, active, onSelect, demo }) {
      const [node, setNode] = React.useState(null);
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
        h('button', { type: 'button', className: 'relay-site-card', onClick: onSelect, 'aria-pressed': active, 'aria-label': `切换到 ${siteLabel(site)}${active ? '，当前站点' : ''}` },
          h('span', { className: 'relay-site-glow g1', 'aria-hidden': true }),
          h('span', { className: 'relay-site-glow g2', 'aria-hidden': true }),
          h('span', { className: 'relay-site-content' },
            h('strong', null, siteLabel(site)),
            h('span', null, site),
            active ? h('span', { className: 'relay-site-current' }, '当前站点') : h('span', { className: 'relay-section-meta' }, formatSavedAt(profile.updatedAt)))));
    }

    function SaveFeedback({ site, token, busy, onSave }) {
      const [saved, setSaved] = React.useState(false);
      const [savedAt, setSavedAt] = React.useState('');
      const [button, setButton] = React.useState(null);
      const [done, setDone] = React.useState(null);
      const [stage, setStage] = React.useState(null);
      React.useEffect(() => {
        if (!saved || !done?.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
        done.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.08)' },
          { transform: 'scale(1)' },
        ], { duration: 300, delay: 420, easing: 'ease-out' });
      }, [saved, done]);
      const complete = async () => {
        if (saved || busy) return;
        try { if (await onSave()) { setSavedAt(new Date().toLocaleString()); setSaved(true); } } catch {}
      };
      React.useEffect(() => {
        if (window.__uiInteractive || typeof window.__uiDemoCursor !== 'function' || !stage || busy) return undefined;
        const cursor = window.__uiDemoCursor();
        let pressTimer = 0, releaseTimer = 0, resetTimer = 0, interval = 0, demoSaved = false;
        const demo = () => {
          if (demoSaved) { setSaved(false); demoSaved = false; }
          cursor.moveTo(button);
          pressTimer = setTimeout(() => {
            cursor.press?.(); button?.classList.add('pressing');
            releaseTimer = setTimeout(() => {
              cursor.release?.(); button?.classList.remove('pressing');
              setSavedAt(new Date().toLocaleString()); setSaved(true); demoSaved = true; cursor.hide?.();
              resetTimer = setTimeout(() => { setSaved(false); demoSaved = false; }, 1700);
            }, 190);
          }, 560);
        };
        const first = setTimeout(() => { demo(); interval = setInterval(demo, 3100); }, 300);
        return () => {
          clearTimeout(first); clearTimeout(pressTimer); clearTimeout(releaseTimer); clearTimeout(resetTimer); clearInterval(interval); cursor.hide?.();
        };
      }, [stage, button, busy]);
      return h('div', { className: 'relay-save-card' },
        h('div', { className: 'relay-save-doc' },
          h('span', { className: 'relay-save-icon', 'aria-hidden': true }, h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z' }), h('path', { d: 'M14 3v5h5M9 13h6M9 17h4' }))),
          h('div', { className: 'relay-save-meta' }, h('strong', null, site ? siteLabel(site) : '新中转站 Token'), h('span', null, saved ? `保存时间 ${savedAt}` : site ? '准备保存到 DSH Host 凭据库' : '填写站点网址与 Token 后保存'))),
        h('div', { className: 'relay-save-stage', ref: setStage },
          h('button', { ref: setButton, type: 'submit', className: `relay-save-button${saved ? ' out' : ''}`, onClick: event => { event.preventDefault(); complete(); }, disabled: busy || saved || !site || !token, tabIndex: saved ? -1 : 0, 'aria-hidden': saved || undefined }, busy ? '保存中…' : '保存'),
          h('div', { className: `relay-save-done${saved ? ' show' : ''}`, ref: setDone, 'aria-hidden': !saved },
            h('svg', { className: 'relay-save-ring', viewBox: '0 0 52 52', 'aria-hidden': true }, h('circle', { cx: 26, cy: 26, r: 22 }), h('path', { d: 'M16 27.2l7.2 7.1 13.2-14.2' })),
            h('span', { className: 'relay-save-done-text' }, '已保存')),
          h('span', { className: 'relay-live', 'aria-live': 'polite' }, saved ? '已保存' : '')));
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

    function Dashboard() {
      const initial = (() => {
        const profiles = readProfiles();
        const site = Object.keys(profiles)[0] || DEFAULT_SITE;
        return { profiles, site, token: profiles[site]?.token || '' };
      })();
      const [profiles, setProfiles] = React.useState(initial.profiles);
      const [savingGate] = React.useState(() => ({ current: false, saved: null }));
      const [requests] = React.useState(() => ({ sequence: 0 }));
      const [restoring, setRestoring] = React.useState(true);
      const [site, setSite] = React.useState(initial.site);
      const [token, setToken] = React.useState(initial.token);
      const [draftSite, setDraftSite] = React.useState(initial.site);
      const [draftToken, setDraftToken] = React.useState(initial.token);
      const [data, setData] = React.useState(null);
      const [error, setError] = React.useState('');
      const [managerError, setManagerError] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const [saving, setSaving] = React.useState(false);
      const [managingSites, setManagingSites] = React.useState(!initial.token);
      const [range, setRange] = React.useState('7');

      const load = async (targetSite = site, targetToken = token, targetRange = range) => {
        if (!targetSite || !targetToken.trim()) return;
        const sequence = ++requests.sequence;
        setBusy(true);
        setError('');
        const end = new Date();
        const start = new Date(Date.now() - (Number(targetRange) - 1) * 86400000);
        const params = {
          start_date: start.toISOString().slice(0, 10),
          end_date: end.toISOString().slice(0, 10),
          granularity: 'day',
        };
        try {
          const [profile, stats, trend, models] = await Promise.all([
            getJson(targetSite, '/user/profile', targetToken.trim()),
            getJson(targetSite, '/usage/dashboard/stats', targetToken.trim()),
            getJson(targetSite, '/usage/dashboard/trend', targetToken.trim(), params),
            getJson(targetSite, '/usage/dashboard/models', targetToken.trim(), params),
          ]);
          if (sequence !== requests.sequence) return;
          setData({
            profile: profile?.data || profile,
            stats: stats?.data || stats,
            trend: unwrap(trend, 'trend'),
            models: unwrap(models, 'models'),
          });
        } catch (cause) {
          if (sequence === requests.sequence) setError(cause.message || '无法读取中转站数据');
        } finally {
          if (sequence === requests.sequence) setBusy(false);
        }
      };

      React.useEffect(() => {
        let disposed = false;
        (async () => {
          try {
            let stored = await profileRequest();
            for (const [legacySite, profile] of Object.entries(initial.profiles)) {
              if (!stored[legacySite] && profile?.token) stored = await profileRequest({ site: legacySite, token: profile.token, migrate: true });
            }
            if (disposed) return;
            setProfiles(stored);
            const selected = stored[initial.site] ? initial.site : Object.keys(stored)[0];
            if (selected) {
              setSite(selected); setToken(stored[selected].token); setManagingSites(false);
              load(selected, stored[selected].token);
            } else setManagingSites(true);
          } catch (cause) { if (!disposed) { setManagerError(cause.message); setManagingSites(true); } }
          finally { if (!disposed) setRestoring(false); }
        })();
        return () => { disposed = true; requests.sequence++; };
      }, []);

      const saveSite = async () => {
        if (savingGate.current) return false;
        let targetSite, value;
        try {
          targetSite = normalizeSite(draftSite); value = normalizeToken(draftToken);
          if (!value) throw new Error('请输入 Token');
        } catch (cause) { setManagerError(cause.message); throw cause; }
        if (savingGate.saved === `${targetSite}\n${value}`) return true;
        savingGate.current = true;
        setSaving(true);
        setManagerError('');
        try {
          const nextProfiles = await profileRequest({ site: targetSite, token: value });
          savingGate.saved = `${targetSite}\n${value}`;
          setProfiles(nextProfiles);
          setSite(targetSite);
          setToken(value);
          setData(null);
          load(targetSite, value);
          return true;
        } catch (cause) {
          setManagerError(cause.message || 'Token 保存失败');
          throw cause;
        } finally {
          savingGate.current = false;
          setSaving(false);
        }
      };

      const changeSite = () => {
        setManagerError('');
        setDraftSite(site);
        setDraftToken('');
        setManagingSites(true);
      };

      const switchSite = targetSite => {
        if (savingGate.current) return;
        const savedProfile = profiles[targetSite];
        if (!savedProfile?.token) return;
        setSite(targetSite);
        setToken(savedProfile.token);
        setDraftSite(targetSite);
        setDraftToken('');
        setData(null);
        setError('');
        setManagingSites(false);
        load(targetSite, savedProfile.token);
      };

      if (restoring) return h('main', { className: 'relay-page' }, h('style', null, css), h('p', { role: 'status' }, '正在恢复服务器站点列表…'));

      if (managingSites || !token) return h('main', { className: 'relay-page' },
        h('style', null, css),
        h('section', { className: 'relay-setup' },
          h('h1', { className: 'relay-title' }, '中转站站点管理'),
          h('p', { className: 'relay-subtitle' }, '保存多个站点的 Token，并一键切换查看各站数据。'),
          Object.keys(profiles).length ? h('section', { className: 'relay-manager-panel' },
            h('div', { className: 'relay-section-head' }, h('h2', { className: 'relay-section-title' }, '已保存站点'), h('span', { className: 'relay-section-meta' }, `${Object.keys(profiles).length} 个`)),
            h('div', { className: 'relay-site-grid' }, Object.entries(profiles).map(([savedSite, savedProfile], index) =>
              h(SiteTiltCard, { key: savedSite, site: savedSite, profile: savedProfile, active: savedSite === site, onSelect: () => switchSite(savedSite), demo: index === 0 })))) : null,
          h('div', { className: 'relay-manager' },
            h('section', { className: 'relay-manager-panel' },
              h('div', { className: 'relay-section-head' }, h('h2', { className: 'relay-section-title' }, '添加或更新站点')),
              h('form', { className: 'relay-form', onSubmit: event => event.preventDefault() },
                h('label', { htmlFor: 'relay-site' }, '中转站网址'),
                h('input', { id: 'relay-site', type: 'url', disabled: saving, value: draftSite, onChange: event => { setDraftSite(event.target.value); setManagerError(''); }, placeholder: 'https://gateway.example', autoComplete: 'url' }),
                h('label', { htmlFor: 'relay-token' }, '访问 Token'),
                h('input', { id: 'relay-token', type: 'password', disabled: saving, value: draftToken, onChange: event => { setDraftToken(event.target.value); setManagerError(''); }, placeholder: '粘贴 auth_token（可带引号）', autoComplete: 'off' }),

                h(SaveFeedback, { key: `${draftSite}\u0000${draftToken}`, site: draftSite, token: draftToken, busy: saving, onSave: saveSite }),
                h('p', { className: 'relay-manager-error', role: 'alert' }, managerError),
                site && token ? h('button', { className: 'relay-button', type: 'button', disabled: saving, onClick: () => setManagingSites(false) }, '返回仪表盘') : null)),
            h('div', null,
              h('p', { className: 'relay-help' }, '插件会请求该网址的 /api/v1 用户资料、统计、趋势和模型接口。每个站点分别保存 Token，不会跨站发送。'),
              h('p', { className: 'relay-help' }, '获取token请在对应站点启用开发者工具并在控制台输入：localStorage.getItem("auth_token")'),
              h('p', { className: 'relay-help' }, '站点与 Token 保存在当前 DSH 服务器的凭据库；切换时只使用所选站点的 Token。')))));

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
            h('button', { className: 'relay-button', onClick: changeSite }, '切换中转站'))),
        h('div', { className: 'relay-toolbar' },
          h('label', { htmlFor: 'relay-range' }, '统计时间范围'),
          h('select', { id: 'relay-range', value: range, onChange: event => {
            const nextRange = event.target.value;
            setRange(nextRange);
            load(site, token, nextRange);
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
      } catch (error) {
        const message = error && error.stack ? error.stack : String(error);
        return h('main', { className: 'relay-page' },
          h('style', null, css),
          h('section', { className: 'relay-setup' },
            h('h1', { className: 'relay-title' }, '中转站仪表盘加载失败'),
            h('p', { className: 'relay-subtitle' }, '请刷新页面后重试。'),
            h('pre', { style: { whiteSpace: 'pre-wrap', color: 'var(--paper-bad)', fontSize: 12 } }, message)));
      }
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const Panel = props => h(SafeDashboard, props);
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL, order: 30, label: '中转站仪表盘',
        }, Icon));
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL }, Panel));
      },
    };
  },
});
