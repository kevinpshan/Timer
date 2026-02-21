function loadReport() {
    const logs = JSON.parse(localStorage.getItem(KEY_LOGS) || "[]");
    document.getElementById('reportLog').innerText = logs.length ? logs.join('\n') : "No entries recorded.";
}

function copyReport() {
    navigator.clipboard.writeText(document.getElementById('reportLog').innerText);
    alert("Report Copied");
}
