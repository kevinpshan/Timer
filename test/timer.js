let iv, start, elapsed = 0;

function renderSetupGrid() {
    const grid = document.getElementById('roleGridArea');
    grid.innerHTML = "";
    if (currentMode === 'timer') {
        const roles = [
            { l: "TABLE TOPICS", s: "1-2m", g: 60, y: 90, r: 120 },
            { l: "EVALUATION", s: "2-3m", g: 120, y: 150, r: 180 },
            { l: "SPEECH", s: "5-7m", g: 300, y: 360, r: 420 },
            { l: "ICE BREAKER", s: "4-6m", g: 240, y: 300, r: 360 },
            { l: "CUSTOM", s: "Custom Time", isC: true }
        ];
        roles.forEach(r => {
            const card = document.createElement('div');
            card.className = 'role-card';
            card.onclick = () => r.isC ? askCustomTime(card) : selectRole(card, r.l, r.g, r.y, r.r);
            card.innerHTML = `<h4>${r.l}</h4><p>${r.s}</p>`;
            grid.appendChild(card);
        });
    } else {
        ["AH COUNTER", "GRAMMARIAN", "SPEAKER"].forEach(r => {
            grid.innerHTML += `<div class="role-card" onclick="selectRole(this, '${r}', 0,0,0)"><h4>${r}</h4></div>`;
        });
    }
}

function selectRole(el, r, g, y, rt) {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedRole = r;
    lims = { g, y, r: rt };
}

function askCustomTime(el) {
    const s = JSON.parse(localStorage.getItem(KEY_CUSTOM) || '{"g":5,"y":6,"r":7}');
    const body = `<label>Green (min):</label><input type="number" id="cg" value="${s.g}"><label>Yellow (mid):</label><input type="number" id="cy" value="${s.y}"><label>Red (max):</label><input type="number" id="cr" value="${s.r}">`;
    openCustomModal("Thresholds", body, () => {
        const g = document.getElementById('cg').value, y = document.getElementById('cy').value, r = document.getElementById('cr').value;
        localStorage.setItem(KEY_CUSTOM, JSON.stringify({ g, y, r }));
        selectRole(el, "CUSTOM", g * 60, y * 60, r * 60);
    });
}

function handleStart() {
    const n = document.getElementById('nameInput').value;
    if (!n || !selectedRole) return;
    if (currentMode === 'timer') {
        showScreen('timerDisplay');
        document.getElementById('spkNameLabel').innerText = n;
        elapsed = 0; start = Date.now();
        iv = setInterval(updateTimer, 1000);
    }
}

function updateTimer() {
    elapsed = Math.floor((Date.now() - start) / 1000);
    let m = Math.floor(elapsed / 60).toString().padStart(2, '0'), s = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('timerText').innerText = `${m}:${s}`;
    if (lims.g > 0) {
        if (elapsed >= lims.r) document.body.style.background = "var(--red)";
        else if (elapsed >= lims.y) document.body.style.background = "var(--yellow)";
        else if (elapsed >= lims.g) document.body.style.background = "var(--green)";
    }
}

function commitAndExit() {
    clearInterval(iv);
    let logs = JSON.parse(localStorage.getItem(KEY_LOGS) || "[]");
    logs.push(`${document.getElementById('nameInput').value} | ${selectedRole} :: ${document.getElementById('timerText').innerText}`);
    localStorage.setItem(KEY_LOGS, JSON.stringify(logs));
    document.body.style.background = "var(--bg)";
    showScreen('menu');
}
