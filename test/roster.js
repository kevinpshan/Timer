let allSpeakers = JSON.parse(localStorage.getItem(KEY_SPEAKERS) || "[]");

function refreshRoster(filter = "") {
    const area = document.getElementById('speakerArea');
    if (!area) return;
    const filtered = allSpeakers.filter(n => n.toLowerCase().includes(filter.toLowerCase()));
    area.innerHTML = filtered.map(n => `
        <div class="roster-item">
            <span class="roster-name" onclick="selectSpeaker('${n}')">${n}</span>
            <span style="color:var(--red); font-weight:800; cursor:pointer; padding:10px;" onclick="delSpeaker('${n}')">✕</span>
        </div>
    `).join('');
}

function filterRoster() {
    refreshRoster(document.getElementById('nameInput').value);
}

function selectSpeaker(name) {
    document.getElementById('nameInput').value = name;
    refreshRoster(name);
}

function saveSpeaker() {
    const n = document.getElementById('nameInput').value.trim().toUpperCase();
    if (n && !allSpeakers.includes(n)) {
        allSpeakers.push(n);
        allSpeakers.sort();
        localStorage.setItem(KEY_SPEAKERS, JSON.stringify(allSpeakers));
        refreshRoster();
    }
}

function delSpeaker(n) {
    openCustomModal("Delete Speaker?", `Remove ${n} from roster?`, () => {
        allSpeakers = allSpeakers.filter(s => s !== n);
        localStorage.setItem(KEY_SPEAKERS, JSON.stringify(allSpeakers));
        refreshRoster();
    });
}
