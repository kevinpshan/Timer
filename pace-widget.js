(function() {
// Parse script tag params
var scripts = document.getElementsByTagName('script');
var thisScript = scripts[scripts.length - 1];
var src = thisScript.src;
var params = {};
src.replace(/[?&]([^=&]+)=([^&]*)/g, function(_, k, v) { params[k] = decodeURIComponent(v); });

var clubCode = params.club;
var type     = params.type || 'leaderboard';   // 'leaderboard' or 'chart'
var targetId = params.target;
var year     = params.year || null;             // e.g. '2025-26', defaults to current TM year

if (!clubCode || !targetId) {
    console.error('PACE Widget: missing club or target parameter');
    return;
}

// ── TM Year ────────────────────────────────────────────────────────────
function getCurrentTMYear() {
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth();
    return m >= 6 ? (y + '-' + String(y+1).slice(2)) : ((y-1) + '-' + String(y).slice(2));
}
function getTMYearBounds(tmYear) {
    var startY = parseInt(tmYear.split('-')[0]);
    return { start: startY + '-07-01', end: (startY+1) + '-06-30' };
}
var tmYear = year || getCurrentTMYear();
var bounds = getTMYearBounds(tmYear);

// ── Firebase project (SDTM) ────────────────────────────────────────────
var PROJECT_ID = 'sdtm-tm-app';
var API_KEY    = 'AIzaSyC2QfJzXrVg9TmUasmtfLbegSlUGmg5JR4';

// ── Firestore REST query ────────────────────────────────────────────────
function firestoreQuery() {
    var url = 'https://firestore.googleapis.com/v1/projects/' + PROJECT_ID +
              '/databases/(default)/documents/clubs/' + clubCode + ':runQuery?key=' + API_KEY;
    var body = {
        structuredQuery: {
            from: [{ collectionId: 'pace_entries', allDescendants: false }],
            where: {
                compositeFilter: {
                    op: 'AND',
                    filters: [
                        { fieldFilter: { field: { fieldPath: 'date' }, op: 'GREATER_THAN_OR_EQUAL', value: { stringValue: bounds.start } } },
                        { fieldFilter: { field: { fieldPath: 'date' }, op: 'LESS_THAN_OR_EQUAL',    value: { stringValue: bounds.end   } } }
                    ]
                }
            }
        }
    };
    return fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
        .then(function(r) { return r.json(); });
}

// ── Parse Firestore response ────────────────────────────────────────────
function parseResults(docs) {
    var totals = {};
    docs.forEach(function(item) {
        if (!item.document) return;
        var f = item.document.fields;
        var member = f.member && f.member.stringValue;
        var pts    = f.pointsEarned && (f.pointsEarned.integerValue || f.pointsEarned.doubleValue);
        var date   = f.date && f.date.stringValue;
        if (!member || !pts) return;
        if (!totals[member]) totals[member] = { points: 0, meetings: new Set() };
        totals[member].points += Number(pts);
        if (date) totals[member].meetings.add(date);
    });
    return Object.entries(totals)
        .map(function(e) { return { name: e[0], points: e[1].points, meetings: e[1].meetings.size }; })
        .sort(function(a, b) { return b.points - a.points; });
}

// ── Styles ─────────────────────────────────────────────────────────────
var STYLES = [
    '.pace-widget { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 600px; }',
    '.pace-widget-header { font-size: 13px; font-weight: 700; color: #8E8E93; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }',
    '.pace-widget-year { color: #007AFF; }',
    '.pace-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F2F2F7; }',
    '.pace-row:last-child { border-bottom: none; }',
    '.pace-rank-num { width: 28px; text-align: center; font-size: 13px; font-weight: 700; color: #8E8E93; flex-shrink: 0; }',
    '.pace-name { font-size: 15px; font-weight: 700; text-transform: uppercase; flex: 1; min-width: 0; }',
    '.pace-bar-wrap { flex: 1; }',
    '.pace-bar-bg { height: 8px; background: #E5E5EA; border-radius: 4px; overflow: hidden; }',
    '.pace-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }',
    '.pace-pts { font-size: 18px; font-weight: 800; flex-shrink: 0; width: 52px; text-align: right; }',
    '.pace-goal-line { border: none; border-top: 2px dashed #34C759; margin: 12px 0 4px; }',
    '.pace-chart-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }',
    '.pace-chart-label { font-size: 12px; font-weight: 700; text-transform: uppercase; width: 120px; flex-shrink: 0; text-align: right; color: #1C1C1E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
    '.pace-chart-bar-bg { flex: 1; height: 20px; background: #E5E5EA; border-radius: 4px; overflow: hidden; position: relative; }',
    '.pace-chart-bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }',
    '.pace-chart-pts { font-size: 12px; font-weight: 800; width: 36px; flex-shrink: 0; }',
].join('\n');

function injectStyles() {
    if (document.getElementById('pace-widget-styles')) return;
    var s = document.createElement('style');
    s.id = 'pace-widget-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
}

function pointColor(pts) {
    return pts >= 100 ? '#34C759' : pts >= 50 ? '#BF941A' : '#007AFF';
}

// ── Leaderboard renderer ────────────────────────────────────────────────
function renderLeaderboard(el, data) {
    var goal = 100;
    var medals = ['🥇','🥈','🥉'];
    var rows = data.map(function(d, i) {
        var pct = Math.min(100, Math.round(d.points / goal * 100));
        var color = pointColor(d.points);
        var rank = i < 3 ? '<span style="font-size:20px;">' + medals[i] + '</span>' :
                   '<span class="pace-rank-num">' + (i+1) + '</span>';
        return '<div class="pace-row">' +
            rank +
            '<div class="pace-bar-wrap">' +
                '<div class="pace-name">' + d.name + '</div>' +
                '<div class="pace-bar-bg"><div class="pace-bar-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>' +
            '</div>' +
            '<div class="pace-pts" style="color:' + color + ';">' + d.points + '</div>' +
        '</div>';
    }).join('');
    el.innerHTML =
        '<div class="pace-widget">' +
        '<div class="pace-widget-header">PACE Standings &mdash; <span class="pace-widget-year">' + tmYear + '</span></div>' +
        rows +
        '</div>';
}

// ── Bar chart renderer ──────────────────────────────────────────────────
function renderChart(el, data) {
    var max = data.length ? Math.max(data[0].points, 100) : 100;
    var bars = data.map(function(d) {
        var pct = Math.round(d.points / max * 100);
        var color = pointColor(d.points);
        return '<div class="pace-chart-bar-row">' +
            '<div class="pace-chart-label">' + d.name + '</div>' +
            '<div class="pace-chart-bar-bg">' +
                '<div class="pace-chart-bar-fill" style="width:' + pct + '%;background:' + color + ';"></div>' +
                (max >= 100 ? '<div style="position:absolute;top:0;left:' + Math.round(100/max*100) + '%;width:2px;height:100%;background:rgba(52,199,89,0.5);"></div>' : '') +
            '</div>' +
            '<div class="pace-chart-pts" style="color:' + color + ';">' + d.points + '</div>' +
        '</div>';
    }).join('');
    el.innerHTML =
        '<div class="pace-widget">' +
        '<div class="pace-widget-header">PACE Points &mdash; <span class="pace-widget-year">' + tmYear + '</span></div>' +
        bars +
        '<div style="font-size:11px;color:#8E8E93;margin-top:8px;">&#9646; green line = 100-point goal</div>' +
        '</div>';
}

// ── Mount ───────────────────────────────────────────────────────────────
function mount() {
    var el = document.getElementById(targetId);
    if (!el) { console.error('PACE Widget: target element #' + targetId + ' not found'); return; }
    injectStyles();
    el.innerHTML = '<div style="font-family:sans-serif;font-size:13px;color:#8E8E93;padding:12px 0;">Loading PACE data...</div>';
    firestoreQuery().then(function(docs) {
        var data = parseResults(docs);
        if (!data.length) { el.innerHTML = '<div style="font-size:13px;color:#8E8E93;">No PACE data for ' + tmYear + '.</div>'; return; }
        if (type === 'chart') renderChart(el, data);
        else renderLeaderboard(el, data);
    }).catch(function(e) {
        el.innerHTML = '<div style="font-size:13px;color:#FF3B30;">Could not load PACE data: ' + e.message + '</div>';
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
} else {
    mount();
}

})();