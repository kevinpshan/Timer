const prefix = 'prod_';
const KEY_LOGS = prefix + 'sdtm_logs';
const KEY_SPEAKERS = prefix + 'sdtm_speakers';
const KEY_CUSTOM = prefix + 'sdtm_custom_limits';

let currentMode = 'timer';
let selectedRole = "";
let lims = { g: 0, y: 0, r: 0 };

function initApp() {
    refreshRoster();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'setup') {
        document.getElementById('nameInput').value = "";
        refreshRoster();
        renderSetupGrid();
    }
    if (id === 'report') loadReport();
}

function switchMode(m) {
    currentMode = m;
    document.getElementById('mainTitle').innerText = m === 'timer' ? 'Timing Tools' : 'Counter Tools';
    document.getElementById('tabTimer').classList.toggle('active', m === 'timer');
    document.getElementById('tabCounter').classList.toggle('active', m === 'counter');
    document.getElementById('timerMode').style.display = m === 'timer' ? 'flex' : 'none';
    document.getElementById('counterMode').style.display = m === 'counter' ? 'flex' : 'none';
}

function openCustomModal(title, body, onConfirm) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = body;
    const modal = document.getElementById('customModal');
    modal.style.display = 'flex';
    document.getElementById('modalConfirm').onclick = () => { onConfirm(); modal.style.display = 'none'; };
    document.getElementById('modalCancel').onclick = () => { modal.style.display = 'none'; };
}
