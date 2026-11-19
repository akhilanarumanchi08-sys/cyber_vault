function addLog(text) {
    const log = document.getElementById('auditLog');
    const item = document.createElement('li');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    item.textContent = `[${time}] ${text}`;
    log.prepend(item);
}

async function lockMessage() {
    const message = document.getElementById('secretInput').value;
    const apiKey = document.getElementById('apiKeyInput').value;
    const output = document.getElementById('lockOutput');

    if (!message.trim()) {
        output.innerHTML = '<span style="color:#ff5ca1">Please type a secret message first.</span>';
        return;
    }

    try {
        const response = await fetch('/lock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();

        if (response.ok) {
            output.innerHTML = `<span style="color:#ffe600; font-weight:bold;">SEALED!</span> ID: <strong style="color:#ffffff; font-size:15px;">${data.secretId}</strong>`;
            document.getElementById('secretInput').value = '';
            addLog(`Payload encrypted. ID ${data.secretId} issued.`);
        } else {
            output.innerHTML = `<span style="color:#ff2a85">DENIED: ${data.error}</span>`;
            addLog('Unauthorized /lock attempt blocked.');
        }
    } catch (err) {
        output.innerHTML = '<span style="color:#ff2a85">Error: Make sure node server.js is running!</span>';
    }
}

async function unlockMessage() {
    const id = document.getElementById('idInput').value.trim();
    const apiKey = document.getElementById('apiKeyInput').value;
    const output = document.getElementById('unlockOutput');

    if (!id) {
        output.innerHTML = '<span style="color:#ffe600">Paste a Secret ID first.</span>';
        return;
    }

    try {
        const response = await fetch(`/unlock/${id}`, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey
            }
        });
        const data = await response.json();

        if (response.ok) {
            output.innerHTML = `<span style="color:#ff5ca1; font-weight:bold;">DECRYPTED:</span> <span style="color:#ffffff">${data.secretMessage}</span><br><small style="color:#ffe600;">Wiped from server memory.</small>`;
            document.getElementById('idInput').value = '';
            addLog(`ID ${id} decrypted & wiped from RAM.`);
        } else {
            output.innerHTML = `<span style="color:#ff2a85">ERROR: ${data.error}</span>`;
            addLog(`Failed unlock attempt for ID ${id}.`);
        }
    } catch (err) {
        output.innerHTML = '<span style="color:#ff2a85">Error: Make sure node server.js is running!</span>';
    }
}
