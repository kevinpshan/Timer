/**
 * TIMER MODULE v3.0.4
 * Handles Timer Grid and Custom Modal
 */

function renderSetupGrid() {
    const grid = document.getElementById('roleGridArea');
    if (!grid) return;
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
            card.onclick = () => {
                if (r.isC) {
                    askCustomTime(card);
                } else {
                    selectRole(card, r.l, r.g, r.y, r.r);
                }
            };
            card.innerHTML = `<h4>${r.l}</h4><p>${r.s}</p>`;
            grid.appendChild(card);
        });
    } else {
        const cRoles = ["AH COUNTER", "GRAMMARIAN", "SPEAKER"];
        cRoles.forEach(r => {
            const card = document.createElement('div');
            card.className = 'role-card';
            card.onclick = () => selectRole(card, r, 0, 0, 0);
            card.innerHTML = `<h4>${r}</h4>`;
            grid.appendChild(card);
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
    const s = JSON.parse(localStorage.getItem('prod_sdtm_custom_limits') || '{"g":5,"y":6,"r":7}');
    const body = `
        <label style="display:block; text-align:left; font-weight:700;">Green (min):</label>
        <input type="number" id="cg" value="${s.g}" style="width:100%; padding:10px; margin-bottom:10px; border-radius:8px; border:1px solid #ccc;">
        <label style="display:block; text-align:left; font-weight:700;">Yellow (mid):</label>
        <input type="number" id="cy" value="${s.y}" style="width:100%; padding:10px; margin-bottom:10px; border-radius:8px; border:1px solid #ccc;">
        <label style="display:block; text-align:left; font-weight:700;">Red (max):</label>
        <input type="number" id="cr" value="${s.r}" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ccc;">
    `;
    openCustomModal("Custom Thresholds", body, () => {
        const g = document.getElementById('cg').value;
        const y = document.getElementById('cy').value;
        const r = document.getElementById('cr').value;
        localStorage.setItem('prod_sdtm_custom_limits', JSON.stringify({ g, y, r }));
        selectRole(el, "CUSTOM", g * 60, y * 60, r * 60);
    });
}
