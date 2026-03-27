/**
 * KORODUR Space Health Dashboard
 * Loads monthly JSON snapshots and renders KPIs + Area Cards.
 */

// Detect base path: works both from src/ (dev) and repo root (GitHub Pages)
const SNAPSHOTS_DIR = (() => {
  const path = window.location.pathname;
  if (path.includes('/src/')) return '../data/snapshots/';
  return 'data/snapshots/';
})();

// Month names for display
const MONTHS_DE = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember'
];

// ─── State ───────────────────────────────────────────
let currentSnapshot = null;
let availableSnapshots = [];

// ─── Init ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await discoverSnapshots();
  if (availableSnapshots.length > 0) {
    await loadSnapshot(availableSnapshots[0]);
  } else {
    showEmpty();
  }
});

// ─── Snapshot Discovery ──────────────────────────────
// In production, this would read from an index file.
// For now, we check a known list or use the index.json approach.
async function discoverSnapshots() {
  try {
    const res = await fetch(SNAPSHOTS_DIR + 'index.json');
    if (res.ok) {
      availableSnapshots = await res.json();
    }
  } catch {
    // Fallback: try recent weeks
    const now = new Date();
    const candidates = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      // ISO week calculation
      const tmp = new Date(d.getTime());
      tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
      const jan4 = new Date(tmp.getFullYear(), 0, 4);
      const week = 1 + Math.round(((tmp - jan4) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
      const isoYear = tmp.getFullYear();
      const key = `${isoYear}-W${String(week).padStart(2, '0')}`;
      if (!candidates.includes(key)) candidates.push(key);
    }

    for (const key of candidates) {
      try {
        const r = await fetch(SNAPSHOTS_DIR + key + '.json');
        if (r.ok) availableSnapshots.push(key);
      } catch { /* skip */ }
    }
  }

  renderSidebar();
}

// ─── Load Snapshot ───────────────────────────────────
async function loadSnapshot(key) {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="loading"><div class="loading__spinner"></div>Lade Snapshot...</div>`;

  try {
    const res = await fetch(SNAPSHOTS_DIR + key + '.json');
    if (!res.ok) throw new Error('Snapshot nicht gefunden');
    currentSnapshot = await res.json();

    // Update active state in sidebar
    document.querySelectorAll('.sidebar__item').forEach(el => {
      el.classList.toggle('active', el.dataset.key === key);
    });

    renderDashboard(currentSnapshot);
    updateHeaderMeta(key);
  } catch (err) {
    main.innerHTML = `<div class="loading">Fehler beim Laden: ${err.message}</div>`;
  }
}

// ─── Render Sidebar ──────────────────────────────────
function renderSidebar() {
  const list = document.getElementById('snapshot-list');
  if (!list) return;

  if (availableSnapshots.length === 0) {
    list.innerHTML = '<li style="padding:20px;color:var(--muted);font-size:.85rem;">Keine Snapshots vorhanden</li>';
    return;
  }

  list.innerHTML = availableSnapshots.map((key, i) => {
    let labelText;
    if (key.includes('-W')) {
      const [year, weekPart] = key.split('-W');
      labelText = `KW ${parseInt(weekPart, 10)} ${year}`;
    } else {
      const [year, month] = key.split('-');
      labelText = `${MONTHS_DE[parseInt(month, 10) - 1]} ${year}`;
    }
    const badge = i === 0 ? 'Aktuell' : '';

    return `
      <li>
        <a class="sidebar__item ${i === 0 ? 'active' : ''}"
           data-key="${key}"
           onclick="loadSnapshot('${key}')">
          ${labelText}
          ${badge ? `<span class="sidebar__item-date">${badge}</span>` : ''}
        </a>
      </li>
    `;
  }).join('');
}

// ─── Update Header ───────────────────────────────────
function updateHeaderMeta(key) {
  const el = document.getElementById('header-meta');
  if (!el || !currentSnapshot) return;

  let display;
  if (key.includes('-W')) {
    const [year, weekPart] = key.split('-W');
    display = `KW ${parseInt(weekPart, 10)} ${year}`;
  } else {
    const [year, month] = key.split('-');
    display = `${MONTHS_DE[parseInt(month, 10) - 1]} ${year}`;
  }
  el.textContent = `Snapshot: ${display}`;
}

// ─── Render Dashboard ────────────────────────────────
function renderDashboard(data) {
  const main = document.getElementById('main');
  const t = data.totals;
  const tasksDonePercent = t.tasks > 0 ? Math.round((t.tasks_done / t.tasks) * 100) : 0;

  main.innerHTML = `
    <!-- Snapshot Title -->
    <div class="snapshot-header fade-in">
      <h1 class="snapshot-header__title">SPACE HEALTH DASHBOARD</h1>
      <p class="snapshot-header__sub">
        KORODUR Notion Workspace &mdash; ${data._meta.snapshot_date}
        ${data._meta.demo ? ' <span class="header__badge">DEMO-DATEN</span>' : ''}
      </p>
    </div>

    <!-- KPI Row -->
    <div class="kpi-row">
      <div class="kpi-card fade-in">
        <div class="kpi-card__label">Areas</div>
        <div class="kpi-card__value kpi-card__value--accent">${t.areas}</div>
        <div class="kpi-card__detail">Verantwortungsbereiche</div>
      </div>
      <div class="kpi-card fade-in">
        <div class="kpi-card__label">Projekte</div>
        <div class="kpi-card__value">${t.projects}</div>
        <div class="kpi-card__detail">${data.projects_by_status.erledigt || 0} abgeschlossen</div>
      </div>
      <div class="kpi-card fade-in">
        <div class="kpi-card__label">Aufgaben</div>
        <div class="kpi-card__value">${t.tasks}</div>
        <div class="kpi-card__detail">${tasksDonePercent}% erledigt</div>
      </div>
      <div class="kpi-card fade-in">
        <div class="kpi-card__label">Datenbanken</div>
        <div class="kpi-card__value">${t.databases}</div>
        <div class="kpi-card__detail">Strukturierte Wissensbasis</div>
      </div>
      <div class="kpi-card fade-in">
        <div class="kpi-card__label">Prozesse</div>
        <div class="kpi-card__value">${t.processes}</div>
        <div class="kpi-card__detail">Dokumentiert</div>
      </div>
    </div>

    <!-- Project Status -->
    ${renderProjectStatus(data)}

    <!-- Task Status -->
    ${renderTaskStatus(data)}

    <!-- Areas: Marketing -->
    <h3 class="area-grid-title fade-in">MARKETING</h3>
    <div class="area-grid">
      ${data.areas.filter(a => a.group === 'Marketing').map(a => renderAreaCard(a)).join('')}
    </div>

    <!-- Areas: Strategie -->
    <h3 class="area-grid-title fade-in">STRATEGIE</h3>
    <div class="area-grid">
      ${data.areas.filter(a => a.group === 'Strategie').map(a => renderAreaCard(a)).join('')}
    </div>

    <!-- Footer -->
    <div class="footer">
      KORODUR Space Health Dashboard &mdash; Generiert am ${new Date(data._meta.generated_at).toLocaleDateString('de-DE')}
      &mdash; <a href="https://github.com/sfleischmann-3steps2/Korodur-Reporting" target="_blank">GitHub</a>
    </div>
  `;
}

// ─── Project Status Bar ──────────────────────────────
function renderProjectStatus(data) {
  const s = data.projects_by_status;
  const total = data.totals.projects;
  if (!total) return '';

  const todo = (s.idee || 0) + (s.konzept || 0) + (s.geplant || 0);
  const progress = (s.laufend || 0) + (s.in_bearbeitung || 0) + (s.in_review || 0);
  const paused = (s.stopp || 0) + (s.pending || 0);
  const done = s.erledigt || 0;

  return `
    <div class="status-section fade-in">
      <h3 class="status-section__title">PROJEKTE NACH STATUS</h3>
      <div class="status-bar">
        ${barSegment(todo, total, 'todo', `${todo} Offen`)}
        ${barSegment(progress, total, 'progress', `${progress} Aktiv`)}
        ${barSegment(paused, total, 'paused', `${paused} Wartend`)}
        ${barSegment(done, total, 'done', `${done} Erledigt`)}
      </div>
      <div class="status-legend">
        <span class="status-legend__item"><span class="status-legend__dot" style="background:var(--mid-gray)"></span>Offen (Idee/Konzept/Geplant): ${todo}</span>
        <span class="status-legend__item"><span class="status-legend__dot" style="background:var(--secondary)"></span>Aktiv (Laufend/In Bearbeitung/Review): ${progress}</span>
        <span class="status-legend__item"><span class="status-legend__dot" style="background:var(--warning)"></span>Wartend (Stopp/Pending): ${paused}</span>
        <span class="status-legend__item"><span class="status-legend__dot" style="background:var(--success)"></span>Erledigt: ${done}</span>
      </div>
    </div>
  `;
}

// ─── Task Status Bar ─────────────────────────────────
function renderTaskStatus(data) {
  const t = data.totals;
  const total = t.tasks;
  if (!total) return '';

  return `
    <div class="status-section fade-in">
      <h3 class="status-section__title">AUFGABEN NACH STATUS</h3>
      <div class="status-bar">
        ${barSegment(t.tasks_open, total, 'todo', `${t.tasks_open} Offen`)}
        ${barSegment(t.tasks_in_progress, total, 'progress', `${t.tasks_in_progress} Aktiv`)}
        ${barSegment(t.tasks_done, total, 'done', `${t.tasks_done} Erledigt`)}
      </div>
      <div class="status-legend">
        <span class="status-legend__item"><span class="status-legend__dot" style="background:var(--mid-gray)"></span>Offen: ${t.tasks_open}</span>
        <span class="status-legend__item"><span class="status-legend__dot" style="background:var(--secondary)"></span>In Arbeit: ${t.tasks_in_progress}</span>
        <span class="status-legend__item"><span class="status-legend__dot" style="background:var(--success)"></span>Erledigt: ${t.tasks_done}</span>
      </div>
    </div>
  `;
}

// ─── Status Bar Segment Helper ───────────────────────
function barSegment(count, total, type, label) {
  if (!count) return '';
  const pct = Math.max((count / total) * 100, 5);
  return `<div class="status-bar__segment status-bar__segment--${type}" style="width:${pct}%">${pct > 8 ? label : ''}</div>`;
}

// ─── Area Card ───────────────────────────────────────
function renderAreaCard(area) {
  const p = area.projects;
  const t = area.tasks;
  const taskTotal = t.total || 1;

  const openPct = (t.open / taskTotal) * 100;
  const progressPct = (t.in_progress / taskTotal) * 100;
  const donePct = (t.done / taskTotal) * 100;

  return `
    <div class="area-card fade-in" data-area="${area.name}">
      <div class="area-card__header">
        <span class="area-card__emoji">${area.emoji}</span>
        <span class="area-card__name">${area.name}</span>
        <span class="area-card__group-tag">${area.group}</span>
      </div>
      <div class="area-card__stats">
        <div class="area-card__stat">
          <span class="area-card__stat-label">Projekte</span>
          <span class="area-card__stat-value">${p.total}</span>
        </div>
        <div class="area-card__stat">
          <span class="area-card__stat-label">Aufgaben</span>
          <span class="area-card__stat-value">${t.total}</span>
        </div>
        <div class="area-card__stat">
          <span class="area-card__stat-label">Datenbanken</span>
          <span class="area-card__stat-value">${area.databases}</span>
        </div>
        <div class="area-card__stat">
          <span class="area-card__stat-label">Prozesse</span>
          <span class="area-card__stat-value">${area.processes}</span>
        </div>

        <div class="area-card__mini-bar">
          <div class="area-card__mini-bar-label">Aufgaben-Fortschritt</div>
          <div class="mini-bar">
            <div class="mini-bar__seg mini-bar__seg--done" style="width:${donePct}%"></div>
            <div class="mini-bar__seg mini-bar__seg--progress" style="width:${progressPct}%"></div>
            <div class="mini-bar__seg mini-bar__seg--open" style="width:${openPct}%"></div>
          </div>
          <div class="area-card__task-counts">
            <span class="area-card__task-count"><strong>${t.done}</strong> erledigt</span>
            <span class="area-card__task-count"><strong>${t.in_progress}</strong> aktiv</span>
            <span class="area-card__task-count"><strong>${t.open}</strong> offen</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── Empty State ─────────────────────────────────────
function showEmpty() {
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="loading">
      Noch keine Snapshots vorhanden.<br>
      Starte den ersten Snapshot mit <code>python scripts/fetch_snapshot.py</code>
    </div>
  `;
}
