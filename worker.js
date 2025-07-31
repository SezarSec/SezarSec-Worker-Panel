// Version 3.0.0 
// @Sezar_Sec

const subLinks = [
    'https://raw.githubusercontent.com/SezarSec/sezarsubs/refs/heads/main/Sezar-sublink',
    'https://raw.githubusercontent.com/Surfboardv2ray/Proxy-sorter/main/ws_tls/proxies/wstls',
    'https://raw.githubusercontent.com/MahsaNetConfigTopic/config/refs/heads/main/xray_final.txt',
    'https://raw.githubusercontent.com/Surfboardv2ray/TGParse/refs/heads/main/configtg.txt',
    'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/mix/sub.html',
    'https://raw.githubusercontent.com/hamedp-71/Trojan/refs/heads/main/hp.txt',
    'https://raw.githubusercontent.com/itsyebekhe/PSG/main/subscriptions/xray/normal/vmess_domain',
    'https://raw.githubusercontent.com/itsyebekhe/PSG/main/subscriptions/xray/normal/vless',
    'https://raw.githubusercontent.com/itsyebekhe/PSG/main/subscriptions/xray/normal/reality',
    'https://raw.githubusercontent.com/itsyebekhe/PSG/main/subscriptions/xray/normal/trojan',
    'https://raw.githubusercontent.com/MhdiTaheri/V2rayCollector/main/sub/trojan',
    'https://raw.githubusercontent.com/10ium/V2rayCollectorVpnclashfa/main/trojan_iran.txt',
    'https://raw.githubusercontent.com/10ium/V2rayCollectorVpnclashfa/main/vless_iran.txt',
    'https://raw.githubusercontent.com/10ium/V2rayCollectorVpnclashfa/main/vmess_iran.txt',
];

const cleanIpUrl = 'https://raw.githubusercontent.com/ircfspace/cf2dns/refs/heads/master/list/ipv4.json';

// Allowed ports for filtering configs
const ALLOWED_TLS_PORTS = [443, 2053, 2083, 2087, 2096, 8443];
const ALLOWED_HTTP_PORTS = [80, 8080, 8880];
// Ports to use for the on-demand scanner
const SCANNER_PORTS = [443, 2053, 2083, 2087, 2096, 8443];


// --- Helper Functions ---
function isIp(ipstr) {
    try {
        if (!ipstr) return false;
        const ipv4Regex = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
        if (!ipv4Regex.test(ipstr)) return false;
        let segments = ipstr.split('.');
        if (segments[3] === '0') return false;
        return true;
    } catch (e) {
        return false;
    }
}

async function checkServerHealth(host, port) {
    const timeout = 1500;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(`https://${host}:${port}`, { signal: controller.signal, method: 'HEAD', redirect: 'manual' });
        clearTimeout(timeoutId);
        return true;
    } catch (error) {
        clearTimeout(timeoutId);
        return false;
    }
}

// --- IP SCANNER BACKEND LOGIC ---

function getRandomIP(cidr) {
    try {
        let [ip, mask] = cidr.split('/');
        mask = parseInt(mask, 10);
        if (mask < 16 || mask > 32) return null;
        let start = ip.split('.').reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0);
        start &= (-1 << (32 - mask));
        const range = 1 << (32 - mask);
        const randomIp = start + Math.floor(Math.random() * range);
        return [(randomIp >> 24) & 255, (randomIp >> 16) & 255, (randomIp >> 8) & 255, randomIp & 255].join('.');
    } catch (e) { return null; }
}

async function checkPort(ip, port) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);
    try {
        
        await fetch(`https://${ip}:${port}`, { signal: controller.signal, method: 'HEAD', redirect: 'manual' });
        return true;
    } catch (err) {
        return false;
    } finally {
        clearTimeout(timeout);
    }
}

async function checkOpenPorts(ip, ports) {
    const concurrencyLimit = 10;
    let open_ports = [];
    for (let i = 0; i < ports.length; i += concurrencyLimit) {
        const chunk = ports.slice(i, i + concurrencyLimit);
        const promises = chunk.map(port => checkPort(ip, port));
        const results = await Promise.all(promises);
        results.forEach((isOpen, index) => {
            if (isOpen) open_ports.push(chunk[index]);
        });
    }
    return open_ports;
}

async function getLatency(ip) {
    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);
        
        await fetch(`https://${ip}:443`, { signal: controller.signal, method: "HEAD", redirect: 'manual' });
        clearTimeout(timeout);
    } catch (e) {}
    const duration = Date.now() - start;
    return duration >= 1500 ? "Timeout" : `${Math.round(duration)} ms`;
}

async function findSingleIp() {
    
    const cfResponse = await fetch("https://www.cloudflare.com/ips-v4");
    const ranges = (await cfResponse.text()).split('\n').filter(Boolean);
    
    if (ranges.length === 0) return null;

    const attempts = 50; 
    for (let i = 0; i < attempts; i++) {
        const range = ranges[Math.floor(Math.random() * ranges.length)];
        const ip = getRandomIP(range);
        if (!ip) continue;
        
        const openPorts = await checkOpenPorts(ip, SCANNER_PORTS);
        if (openPorts.length > 0) {
            const latency = await getLatency(ip);
            return { ip, latency };
        }
    }
    return null;
}


export default {
    async fetch(request) {
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/').filter(Boolean);

        // --- UI and Frontend Logic ---
        if (url.pathname === '/') {
            const cssContent = `
            :root {
                --hue1: 255; --hue2: 222; --border: 1px;
                --border-color: hsl(var(--hue2), 12%, 20%); --radius: 22px;
                --ease: cubic-bezier(0.5, 1, 0.89, 1); --bg-color: hsl(220deg 25% 4.8% / 0.7);
                --text-color: #b9c1d1; --text-color-light: #e0e6f1;
                --accent-color1: hsl(var(--hue1), 70%, 60%); --accent-color2: hsl(var(--hue2), 70%, 60%);
            }
            body { background: #08090d; background-image: url(https://assets.codepen.io/13471/abstract-light.jpg), linear-gradient(to right in oklab, hsl(var(--hue2) 50% 75%), hsl(var(--hue1) 50% 75%)); background-size: cover; background-position: center; background-blend-mode: hard-light; padding: 2rem; margin: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100svh; font-family: 'Vazirmatn', 'Asap', sans-serif; color: var(--text-color); }
            #menu { visibility: visible; opacity: 1; width: 90%; max-width: 800px; min-height: 600px; border-radius: var(--radius); border: var(--border) solid var(--border-color); padding: 1.5em; background: linear-gradient(235deg, hsl(var(--hue1) 50% 10% / 0.8), hsl(var(--hue1) 50% 10% / 0) 33%), linear-gradient(45deg , hsl(var(--hue2) 50% 10% / 0.8), hsl(var(--hue2) 50% 10% / 0) 33%), var(--bg-color); backdrop-filter: blur(12px); box-shadow: hsl(var(--hue2) 50% 2%) 0px 10px 16px -8px, hsl(var(--hue2) 50% 4%) 0px 20px 36px -14px; position: relative; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; overflow: hidden; }
            .panel-container { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; gap: 1rem; overflow-y: auto; padding: 1.5rem 2.5rem; z-index: 5; }
            .panel-header { text-align: center; margin-bottom: 0.5rem; }
            .panel-header h1 { font-size: 2em; font-weight: bold; background: -webkit-linear-gradient(45deg, var(--accent-color1), var(--accent-color2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
            .telegram-link { display: inline-flex; align-items: center; gap: 8px; background-color: hsla(214, 80%, 50%, 0.3); color: var(--text-color-light); padding: 8px 15px; border-radius: 50px; text-decoration: none; font-weight: 500; transition: all 0.3s var(--ease); border: 1px solid hsla(214, 80%, 60%, 0.5); }
            .telegram-link:hover { background-color: hsla(214, 80%, 60%, 0.5); transform: translateY(-2px); box-shadow: 0 4px 15px hsla(214, 80%, 40%, 0.4); }
            .telegram-link img { width: 20px; height: 20px; }
            .settings-group { width: 100%; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px solid var(--border-color); direction: ltr; }
            .settings-group h3 { margin: 0 0 1rem 0; color: var(--text-color-light); font-size: 1.1em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; text-align: left; }
            .checkbox-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; }
            .checkbox-item { position: relative; display: flex; align-items: center; cursor: pointer; font-size: 1em; user-select: none; background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 8px; transition: background 0.2s ease; }
            .checkbox-item:hover { background: rgba(255,255,255,0.1); }
            .checkbox-item input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
            .checkmark { position: relative; height: 22px; width: 22px; background-color: rgba(0,0,0,0.3); border: 2px solid var(--border-color); border-radius: 6px; transition: all 0.3s var(--ease); margin-right: 12px; }
            .checkbox-item input:checked ~ .checkmark { background: linear-gradient(45deg, var(--accent-color1), var(--accent-color2)); border-color: var(--accent-color1); box-shadow: 0 0 10px var(--accent-color2); }
            .checkmark:after { content: ""; position: absolute; display: none; left: 7px; top: 2px; width: 5px; height: 10px; border: solid white; border-width: 0 3px 3px 0; transform: rotate(45deg); }
            .checkbox-item input:checked ~ .checkmark:after { display: block; }
            #port-checkboxes { grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); }
            .button-group { width: 100%; display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; direction: ltr; }
            .btn { flex-grow: 1; padding: 15px 20px; font-family: 'Vazirmatn', 'Asap', sans-serif; font-size: 1.1em; font-weight: bold; color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; min-width: 200px; }
            .btn:disabled { background: #555; cursor: not-allowed; }
            #save-settings { background: linear-gradient(45deg, hsl(190, 60%, 50%), hsl(190, 80%, 55%)); box-shadow: 0 4px 20px hsl(190, 50%, 30%, 0.4); }
            #scan-ip-btn { background: linear-gradient(45deg, hsl(var(--hue2), 60%, 50%), hsl(var(--hue2), 80%, 55%)); box-shadow: 0 4px 20px hsl(var(--hue2), 50%, 30%, 0.4); }
            #get-link-btn { background: linear-gradient(45deg, hsl(var(--hue1), 60%, 50%), hsl(var(--hue1), 80%, 55%)); box-shadow: 0 4px 20px hsl(var(--hue1), 50%, 30%, 0.4); }
            .btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 25px hsla(var(--hue1), 50%, 30%, 0.6); }
            #subscription-container { width: 100%; margin-top: 1rem; text-align: center; min-height: 50px; display: flex; flex-direction: column; justify-content: center; align-items: center; direction: ltr; }
            #subscription-container p { text-align: left; width: 100%;}
            #subscription-link-display { width: 100%; background: rgba(0,0,0,0.4); border-radius: 8px; border: 1px solid var(--border-color); padding: 10px; min-height: 60px; display: flex; align-items: center; justify-content: space-between; padding-left: 15px; padding-right: 15px; }
            #subscription-link-display a { color: var(--accent-color1); text-decoration: none; font-weight: bold; font-size: 1em; word-break: break-all; flex-grow: 1; text-align: left; padding-left: 10px; }
            #copy-icon { cursor: pointer; fill: var(--text-color); transition: fill 0.2s; } #copy-icon:hover { fill: white; }
            footer.dark { position: absolute; bottom: 10px; z-index: 10; } footer.dark [type=range] { width: 150px; }
            
            /* Scanner Modal Styles */
            .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: none; justify-content: center; align-items: center; z-index: 1000; opacity: 0; transition: opacity 0.3s ease; }
            .modal-overlay.visible { display: flex; opacity: 1; }
            .modal-content { background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 2rem; width: 90%; max-width: 500px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.3); transform: scale(0.9); transition: transform 0.3s ease; }
            .modal-overlay.visible .modal-content { transform: scale(1); }
            .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
            .modal-header h2 { margin: 0; color: var(--text-color-light); font-size: 1.5em; }
            .modal-close-btn { background: none; border: none; font-size: 2rem; color: var(--text-color); cursor: pointer; line-height: 1; padding: 0; }
            .modal-body { overflow-y: auto; text-align: right; direction: rtl; }
            #scanner-results { list-style: none; padding: 0; margin: 0; }
            #scanner-results li { background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.75rem; padding: 1rem; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s ease; }
            #scanner-results li:hover { background: rgba(255,255,255,0.1); }
            .ip-info { font-family: monospace; font-size: 1.1em; color: var(--text-color-light); }
            .ip-info .latency { color: var(--accent-color2); margin-left: 1rem; }
            .select-ip-btn { background: linear-gradient(45deg, hsl(var(--hue1), 50%, 50%), hsl(var(--hue1), 70%, 55%)); color: white; border: none; border-radius: 6px; padding: 8px 15px; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
            .select-ip-btn:hover { transform: scale(1.05); }
            .loader { width: 50px; height: 50px; border: 5px solid var(--border-color); border-top-color: var(--accent-color1); border-radius: 50%; animation: spin 1s linear infinite; margin: 2rem auto; }
            @keyframes spin { to { transform: rotate(360deg); } }
        `;

            const jsContent = `
            const ALL_PORTS = [${[...ALLOWED_TLS_PORTS, ...ALLOWED_HTTP_PORTS].sort((a,b) => a-b).join(',')}];
            const portCheckboxesContainer = document.getElementById('port-checkboxes');
            if (portCheckboxesContainer) { ALL_PORTS.forEach(port => { const label = document.createElement('label'); label.className = 'checkbox-item'; const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.name = 'port'; checkbox.value = port; checkbox.checked = true; const checkmark = document.createElement('span'); checkmark.className = 'checkmark'; label.appendChild(checkbox); label.appendChild(checkmark); label.appendChild(document.createTextNode(port)); portCheckboxesContainer.appendChild(label); }); }
            function showMessageBox(message, type = 'info') { const messageBox = document.createElement('div'); const boxColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'; messageBox.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: ' + boxColor + '; color: white; padding: 15px 25px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 1001; opacity: 0; transform: translateX(100%); transition: all 0.4s ease; direction: rtl;'; messageBox.textContent = message; document.body.appendChild(messageBox); setTimeout(() => { messageBox.style.opacity = 1; messageBox.style.transform = 'translateX(0)'; }, 10); setTimeout(() => { messageBox.style.opacity = 0; messageBox.style.transform = 'translateX(100%)'; messageBox.addEventListener('transitionend', () => messageBox.remove()); }, 3000); }
            function copyToClipboard(text) { if (!text || text === '#' || !text.startsWith('http')) { showMessageBox('محتوایی برای کپی وجود ندارد!', 'error'); return; } const textArea = document.createElement('textarea'); textArea.value = text; document.body.appendChild(textArea); textArea.select(); try { document.execCommand('copy'); showMessageBox('لینک با موفقیت کپی شد!', 'success'); } catch (err) { showMessageBox('خطا در کپی کردن لینک!', 'error'); } document.body.removeChild(textArea); }
            function savePreferences() { try { const selectedProtocols = Array.from(document.querySelectorAll('input[name="protocol"]:checked')).map(cb => cb.value); const selectedTransmissions = Array.from(document.querySelectorAll('input[name="transmission"]:checked')).map(cb => cb.value); const selectedPorts = Array.from(document.querySelectorAll('input[name="port"]:checked')).map(cb => cb.value); const healthCheck = document.getElementById('healthcheck-checkbox').checked; localStorage.setItem('selectedProtocols', JSON.stringify(selectedProtocols)); localStorage.setItem('selectedTransmissions', JSON.stringify(selectedTransmissions)); localStorage.setItem('selectedPorts', JSON.stringify(selectedPorts)); localStorage.setItem('healthCheckEnabled', healthCheck); showMessageBox('تنظیمات ذخیره شد!', 'success'); } catch (e) { showMessageBox('خطا در ذخیره تنظیمات!', 'error'); } }
            function loadPreferences() { try { const storedProtocols = JSON.parse(localStorage.getItem('selectedProtocols')); if (storedProtocols) { document.querySelectorAll('input[name="protocol"]').forEach(cb => cb.checked = storedProtocols.includes(cb.value)); } else { document.querySelectorAll('input[name="protocol"]').forEach(cb => cb.checked = true); } const storedTransmissions = JSON.parse(localStorage.getItem('selectedTransmissions')); if (storedTransmissions) { document.querySelectorAll('input[name="transmission"]').forEach(cb => cb.checked = storedTransmissions.includes(cb.value)); } else { document.querySelectorAll('input[name="transmission"]').forEach(cb => cb.checked = true); } const storedPorts = JSON.parse(localStorage.getItem('selectedPorts')); if (storedPorts) { document.querySelectorAll('input[name="port"]').forEach(cb => cb.checked = storedPorts.includes(cb.value)); } const healthCheckEnabled = localStorage.getItem('healthCheckEnabled'); document.getElementById('healthcheck-checkbox').checked = healthCheckEnabled === 'true'; } catch (e) { console.error('Frontend Error: Error loading preferences:', e); } }
            
            function buildSubscriptionLink(cleanIp) {
                if (!cleanIp) {
                    showMessageBox('آی‌پی معتبری برای ساخت لینک انتخاب نشده است.', 'error');
                    return;
                }
                const subLinkDisplay = document.getElementById('subscription-link-display').querySelector('a');
                const workerAddress = window.location.hostname;
                const selectedProtocols = Array.from(document.querySelectorAll('input[name="protocol"]:checked')).map(cb => cb.value);
                const selectedTransmissions = Array.from(document.querySelectorAll('input[name="transmission"]:checked')).map(cb => cb.value);
                const selectedPorts = Array.from(document.querySelectorAll('input[name="port"]:checked')).map(cb => cb.value);
                const healthCheck = document.getElementById('healthcheck-checkbox').checked;
                
                let subscriptionLink = \`https://\${workerAddress}/sub/\${cleanIp}\`;
                const params = new URLSearchParams();
                if (selectedProtocols.length > 0) params.append('protocols', selectedProtocols.join(','));
                if (selectedTransmissions.length > 0) params.append('transmissions', selectedTransmissions.join(','));
                if (selectedPorts.length > 0) params.append('ports', selectedPorts.join(','));
                params.append('healthcheck', healthCheck);
                
                if (params.toString()) {
                    subscriptionLink += '?' + params.toString();
                }
                
                subLinkDisplay.href = subscriptionLink;
                subLinkDisplay.textContent = subscriptionLink;
                showMessageBox(\`لینک با آی‌پی \${cleanIp} ساخته شد.\`, 'success');
            }

            async function getRandomIpAndBuildLink() {
                const getLinkButton = document.getElementById('get-link-btn');
                const subLinkDisplay = document.getElementById('subscription-link-display').querySelector('a');

                getLinkButton.disabled = true;
                getLinkButton.textContent = 'در حال دریافت IP...';
                subLinkDisplay.href = '#';
                subLinkDisplay.textContent = '-';

                try {
                    const response = await fetch('${cleanIpUrl}');
                    if (!response.ok) throw new Error('Failed to fetch clean IP list.');
                    const data = await response.json();
                    const ips = data.map(item => item.ip);
                    const randomIP = ips[Math.floor(Math.random() * ips.length)];

                    if (!randomIP) throw new Error('Could not get a random IP.');
                    
                    buildSubscriptionLink(randomIP);

                } catch (e) {
                    showMessageBox(\`خطا: \${e.message}\`, 'error');
                } finally {
                    getLinkButton.disabled = false;
                    getLinkButton.textContent = 'دریافت لینک سریع';
                }
            }
            
            async function startIpScan() {
                const modal = document.getElementById('scanner-modal');
                const resultsContainer = document.getElementById('scanner-results');
                
                modal.classList.add('visible');
                resultsContainer.innerHTML = '<div class="loader"></div><p style="text-align:center;">در حال اسکن ۵ آی‌پی... این فرآیند ممکن است کمی طول بکشد.</p>';
                
                try {
                    const response = await fetch('/scanip');
                    if (!response.ok) throw new Error('خطا در ارتباط با سرور اسکنر.');
                    const ips = await response.json();
                    
                    resultsContainer.innerHTML = '';
                    if (ips.length === 0) {
                        resultsContainer.innerHTML = '<p style="text-align:center;">متاسفانه آی‌پی تمیزی یافت نشد. لطفاً دوباره تلاش کنید.</p>';
                        return;
                    }
                    
                    ips.forEach(ipInfo => {
                        const li = document.createElement('li');
                        li.innerHTML = \`
                            <div class="ip-info">
                                \${ipInfo.ip}
                                <span class="latency">(\${ipInfo.latency})</span>
                            </div>
                            <button class="select-ip-btn" data-ip="\${ipInfo.ip}">انتخاب</button>
                        \`;
                        resultsContainer.appendChild(li);
                    });
                    
                } catch (e) {
                    resultsContainer.innerHTML = \`<p style="text-align:center; color: #ff5555;">خطا در هنگام اسکن: \${e.message}</p>\`;
                }
            }

            document.addEventListener('DOMContentLoaded', () => {
                document.getElementById('save-settings').onclick = savePreferences;
                document.getElementById('get-link-btn').onclick = getRandomIpAndBuildLink;
                document.getElementById('scan-ip-btn').onclick = startIpScan;
                
                const copyButton = document.getElementById('copy-icon');
                copyButton.onclick = () => { const link = document.getElementById('subscription-link-display').querySelector('a')?.href; copyToClipboard(link); };
                
                const modal = document.getElementById('scanner-modal');
                document.querySelector('.modal-close-btn').onclick = () => modal.classList.remove('visible');
                modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('visible'); };
                
                document.getElementById('scanner-results').addEventListener('click', (e) => {
                    if (e.target && e.target.classList.contains('select-ip-btn')) {
                        const selectedIp = e.target.getAttribute('data-ip');
                        buildSubscriptionLink(selectedIp);
                        modal.classList.remove('visible');
                    }
                });

                loadPreferences();
                const $hue1 = document.querySelector('#h1'); const $hue2 = document.querySelector('#h2'); const rand1 = 120 + Math.floor(Math.random() * 240); const rand2 = rand1 - 80 + (Math.floor(Math.random() * 60) - 30); $hue1.value = rand1; $hue2.value = rand2; document.body.style.setProperty('--hue1', rand1); document.body.style.setProperty('--hue2', rand2); $hue1.addEventListener('input', (event) => { requestAnimationFrame(() => document.body.style.setProperty('--hue1', event.target.value)); }); $hue2.addEventListener('input', (event) => { requestAnimationFrame(() => document.body.style.setProperty('--hue2', event.target.value)); });
            });
            `;

            return new Response(`
            <!DOCTYPE html>
            <html lang='fa' dir='rtl'>
            <head>
                <meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>SezarSec Worker Panel</title>
                <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Asap:wght@400;500;700&family=Vazirmatn:wght@400;500;700&display=swap" rel="stylesheet">
                <style>${cssContent}</style>
            </head>
            <body>
                <aside id="menu" class="dark">
                    <div class='panel-container'>
                        <div class='panel-header'>
                            <h1>SezarSec Panel</h1>
                            <a href='https://t.me/SezarSec' class='telegram-link' target='_blank'>
                                <img src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"%3E%3Cpath d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/%3E%3C/svg%3E' alt='Telegram Icon' />
                                <span>به تلگرام ما بپیوندید</span>
                            </a>
                        </div>
        
                        <div class='settings-group'>
                            <h3>پروتکل‌ها (Protocols)</h3>
                            <div class='checkbox-container'>
                                <label class='checkbox-item'><input type='checkbox' name='protocol' value='vmess' checked><span class="checkmark"></span> VMess</label>
                                <label class='checkbox-item'><input type='checkbox' name='protocol' value='vless' checked><span class="checkmark"></span> VLESS</label>
                                <label class='checkbox-item'><input type='checkbox' name='protocol' value='trojan' checked><span class="checkmark"></span> Trojan</label>
                            </div>
                        </div>
        
                        <div class='settings-group'>
                            <h3>نحوه ارسال (Transmissions)</h3>
                            <div class='checkbox-container'>
                                <label class='checkbox-item'><input type='checkbox' name='transmission' value='ws' checked><span class="checkmark"></span> WebSocket (WS)</label>
                                <label class='checkbox-item'><input type='checkbox' name='transmission' value='grpc' checked><span class="checkmark"></span> gRPC</label>
                            </div>
                        </div>
        
                        <div class='settings-group'>
                            <h3>پورت‌ها (Ports)</h3>
                            <div class='checkbox-container' id='port-checkboxes'></div>
                        </div>
                        
                        <div class='settings-group'>
                            <h3>تنظیمات پیشرفته</h3>
                            <div class='checkbox-container'>
                                <label class='checkbox-item'><input type='checkbox' id='healthcheck-checkbox' name='healthcheck' checked><span class="checkmark"></span> تست سلامت سرورها</label>
                            </div>
                        </div>
        
                        <div class='button-group'>
                            <button id='save-settings' class='btn'>ذخیره تنظیمات</button>
                            <button id='scan-ip-btn' class='btn'>اسکن آی‌پی تمیز</button>
                            <button id='get-link-btn' class='btn'>دریافت لینک سریع</button>
                        </div>

                        <div id="subscription-container">
                            <p>لینک اشتراک شما:</p>
                            <div id='subscription-link-display'>
                                <a href="#" target="_blank">-</a>
                                <svg id="copy-icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-720v480-480Z"/></svg>
                            </div>
                        </div>
                    </div>
                    <footer class="dark">
                        <input type="range" id="h1" min="0" max="360" value="255" />
                        <input type="range" id="h2" min="0" max="360" value="222" />
                    </footer>
                </aside>
                
                <!-- Scanner Modal -->
                <div id="scanner-modal" class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>اسکنر آی‌پی کلودفلر</h2>
                            <button class="modal-close-btn">&times;</button>
                        </div>
                        <div class="modal-body">
                            <ul id="scanner-results">
                                <!-- Results will be populated by JS -->
                            </ul>
                        </div>
                    </div>
                </div>

                <script>${jsContent}</script>
            </body>
        </html>`, {
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
        }
        
        // --- NEW: Backend IP Scanner Endpoint ---
        if (url.pathname === '/scanip') {
            const promises = Array(5).fill(null).map(() => findSingleIp());
            const settledResults = await Promise.allSettled(promises);
            
            let results = settledResults
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value);
                
            // Remove duplicates
            const uniqueIps = {};
            results = results.filter(item => {
                if (uniqueIps[item.ip]) {
                    return false;
                } else {
                    uniqueIps[item.ip] = true;
                    return true;
                }
            });

            return new Response(JSON.stringify(results), {
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        // --- Backend: Subscription Generation Logic ---
        if (url.pathname.startsWith('/sub')) {
            const cleanIP = pathSegments[1];
            if (!cleanIP || !isIp(cleanIP)) {
                return new Response('Invalid Clean IP address provided in the URL.', { status: 400 });
            }

            const workerHostname = url.hostname;
            const userParams = url.searchParams;
            const selectedProtocols = (userParams.get('protocols') || 'vmess,vless,trojan').split(',');
            const selectedTransmissions = (userParams.get('transmissions') || 'ws,grpc').split(',');
            const selectedPorts = (userParams.get('ports') || [...ALLOWED_TLS_PORTS, ...ALLOWED_HTTP_PORTS].join(',')).split(',').map(Number);
            const performHealthCheck = userParams.get('healthcheck') === 'true';

            let candidateConfigs = [];
            
            for (let subLink of subLinks) {
                try {
                    const resp = await fetch(subLink, { headers: { 'User-Agent': 'Mozilla/5.0' }});
                    if (!resp.ok) continue;

                    let subContent = await resp.text();
                    let decodedSubContent = subContent;
                    try {
                        decodedSubContent = atob(subContent);
                    } catch (e) { /* Not base64 */ }

                    const configs = decodedSubContent.split(/\r?\n/);

                    for (let config of configs) {
                        config = config.trim();
                        if (!config) continue;

                        try {
                            let parsedConfig;
                            if (config.startsWith('vmess://') && selectedProtocols.includes('vmess')) {
                                let vmessData = JSON.parse(atob(config.replace('vmess://', '')));
                                parsedConfig = {
                                    protocol: 'vmess',
                                    originalSni: vmessData.sni,
                                    port: parseInt(vmessData.port),
                                    transmission: vmessData.net,
                                    data: vmessData,
                                    raw: config
                                };
                            } else if ((config.startsWith('vless://') || config.startsWith('trojan://')) ) {
                                const protocolName = config.startsWith('vless://') ? 'vless' : 'trojan';
                                if (!selectedProtocols.includes(protocolName)) continue;
                                let url_parts = new URL(config);
                                parsedConfig = {
                                    protocol: protocolName,
                                    originalSni: url_parts.searchParams.get('sni'),
                                    port: parseInt(url_parts.port),
                                    transmission: url_parts.searchParams.get('type'),
                                    data: url_parts,
                                    raw: config
                                };
                            } else {
                                continue;
                            }

                            if (selectedTransmissions.includes(parsedConfig.transmission) &&
                                selectedPorts.includes(parsedConfig.port) &&
                                parsedConfig.originalSni && !isIp(parsedConfig.originalSni)) {
                                candidateConfigs.push(parsedConfig);
                            }

                        } catch (e) { /* Ignore parsing errors */ }
                    }
                } catch (e) { /* Ignore fetch errors */ }
            }

            let healthyConfigs = [];
            if (performHealthCheck) {
                const healthCheckPromises = candidateConfigs.map(config => 
                    checkServerHealth(config.originalSni, config.port).then(isHealthy => ({ ...config, isHealthy }))
                );
                const results = await Promise.all(healthCheckPromises);
                healthyConfigs = results.filter(c => c.isHealthy);
            } else {
                healthyConfigs = candidateConfigs;
            }

            let finalConfigs = [];
            const uniqueIdentifiers = new Set();
            for (const config of healthyConfigs) {
                let finalConfigStr;
                let identifier;

                if (config.protocol === 'vmess') {
                    let vmessData = config.data;
                    if (config.transmission === 'ws') {
                        identifier = `/${config.originalSni}${vmessData.path || ''}`;
                        vmessData.path = identifier;
                    } else if (config.transmission === 'grpc') {
                        const serviceName = vmessData.path;
                        if (!serviceName) continue;
                        identifier = `/${config.originalSni}${serviceName}`;
                        vmessData.path = identifier;
                    }
                    if (uniqueIdentifiers.has(identifier)) continue;
                    uniqueIdentifiers.add(identifier);
                    vmessData.add = cleanIP;
                    vmessData.host = workerHostname;
                    vmessData.sni = workerHostname;
                    vmessData.ps = `(SezarSec) ${vmessData.ps || config.originalSni}`;
                    finalConfigStr = 'vmess://' + btoa(unescape(encodeURIComponent(JSON.stringify(vmessData))));
                } else { 
                    let url_parts = config.data;
                    if (config.transmission === 'ws') {
                        const original_path = decodeURIComponent(url_parts.searchParams.get('path') || '');
                        identifier = `/${config.originalSni}${original_path}`;
                        url_parts.searchParams.set('path', encodeURIComponent(identifier));
                    } else if (config.transmission === 'grpc') {
                        const serviceName = url_parts.searchParams.get('serviceName');
                        if (!serviceName) continue;
                        identifier = `/${config.originalSni}/${serviceName}`;
                        url_parts.searchParams.set('serviceName', identifier);
                    }
                    if (uniqueIdentifiers.has(identifier)) continue;
                    uniqueIdentifiers.add(identifier);
                    url_parts.hostname = cleanIP;
                    url_parts.searchParams.set('sni', workerHostname);
                    if (url_parts.searchParams.has('host')) url_parts.searchParams.set('host', workerHostname);
                    url_parts.hash = `(SezarSec) ${url_parts.hash ? decodeURIComponent(url_parts.hash.slice(1)) : config.originalSni}`;
                    finalConfigStr = url_parts.toString();
                }
                finalConfigs.push(finalConfigStr);
            }

            return new Response(finalConfigs.join('\n'), {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        // --- Backend: Dynamic Reverse Proxy Logic ---
        const targetUrl = new URL(request.url);
        const address = pathSegments[0];
        
        if (address && address.includes('.')) {
             targetUrl.hostname = address;
             targetUrl.pathname = '/' + pathSegments.slice(1).join('/');
             targetUrl.protocol = 'https';

             const newRequest = new Request(targetUrl, request);
             newRequest.headers.set('Host', targetUrl.hostname);
             
             return fetch(newRequest);
        } else {
            // Redirect to the main page for any other path
            const mainPageUrl = new URL(request.url);
            mainPageUrl.pathname = '/';
            return Response.redirect(mainPageUrl.toString(), 302);
        }
    },
};
