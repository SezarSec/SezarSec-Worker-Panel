
// Version 1.0.0
// Tips: Change your subLinks accordingly. Note that only ws+tls+443 configs will work.



const subLinks = [
  'https://raw.githubusercontent.com/Surfboardv2ray/Proxy-sorter/main/ws_tls/proxies/wstls',
  'https://raw.githubusercontent.com/itsyebekhe/HiN-VPN/main/subscription/normal/trojan',
  'https://raw.githubusercontent.com/Surfboardv2ray/TGParse/refs/heads/main/configtg.txt',
  'https://raw.githubusercontent.com/soroushmirzaei/telegram-configs-collector/refs/heads/main/protocols/trojan',
  'https://raw.githubusercontent.com/yebekhe/V2Hub/main/Split/Normal/trojan',  // Add more links here as needed
];

export default {
  async fetch(request) {
    let url = new URL(request.url);
    let pathSegments = url.pathname.split('/').filter(segment => segment !== '');
    let realhostname = pathSegments[0] || '';
    let realpathname = pathSegments[1] || '';

    // Handle the base URL ("/")
    if (url.pathname === '/') {
      // Return the HTML content with improved design
      return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>SezarSec Worker Panel</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
                
                body {
                  font-family: 'Poppins', sans-serif;
                  color: #ffffff;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  position: relative;
                  overflow: hidden;
              }
                .container {
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  border-radius: 10px;
                  padding: 40px;
                  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                  border: 1px solid rgba(255, 255, 255, 0.18);
                  text-align: center;
                  max-width: 500px;
                  width: 90%;
                  position: relative;
                  z-index: 1;
              }
                h1 {
                    font-size: 2.5em;
                    margin-bottom: 20px;
                    color: #fff;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                }
                .btn {
                    background: none;
                    color: white;
                    border: solid 1px white;
                    padding: 12px 24px;
                    margin: 10px 0;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 1em;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                }
                .btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 7px 14px rgba(50, 50, 93, .1), 0 3px 6px rgba(0, 0, 0, .08);
                }
                .btn img {
                    width: 24px;
                    height: 24px;
                    margin-right: 10px;
                }
                #subscription-link {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 15px;
                    border-radius: 10px;
                    margin-top: 20px;
                    font-size: 0.9em;
                    word-break: break-all;
                }
                .animate-charcter {
                    background-image: linear-gradient(
                        -225deg,
                        #231557 0%,
                        #44107a 29%,
                        #ff1361 67%,
                        #fff800 100%
                    );
                    background-size: auto auto;
                    background-clip: border-box;
                    background-size: 200% auto;
                    color: #fff;
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: textclip 2s linear infinite;
                    display: inline-block;
                }
                @keyframes textclip {
                    to {
                        background-position: 200% center;
                    }
                }

                body::before {
                  content: '';
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(125deg, #283a6c ,#015869 ,#7088c6 ,#00b2a4 ,#b5b9dc);
                  background-size: 400% 400%;
                  animation: gradient 15s ease infinite;
                  z-index: -1;
              }
              
              @keyframes gradient {
                  0% {
                      background-position: 0% 50%;
                  }
                  50% {
                      background-position: 100% 50%;
                  }
                  100% {
                      background-position: 0% 50%;
                  }
              }


            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="animate-charcter">SezarSec Worker Panel</h1>
                <a href="https://t.me/SezarSec" class="btn" target="_blank">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z'/%3E%3C/svg%3E" alt="Telegram Icon" />
                    Join Our Telegram Channel
                </a>
                <p>Your Subscription link will be:</p>
                <div id="subscription-link"><strong>https://{worker-address}/sub/{clean-ip}</strong></div>
                <button id="get-clean-ip" class="btn">Get Clean IP</button>
            </div>
            <script>
                document.getElementById('get-clean-ip').onclick = async function() {
                    const response = await fetch('https://raw.githubusercontent.com/ircfspace/cf2dns/refs/heads/master/list/ipv4.json');
                    const data = await response.json();
                    const randomIndex = Math.floor(Math.random() * data.length);
                    const cleanIP = data[randomIndex].ip;
                    const workerAddress = window.location.hostname;
                    const subscriptionLink = \`https://\${workerAddress}/sub/\${cleanIP}\`;
                    document.getElementById('subscription-link').innerHTML = \`<a href="\${subscriptionLink}" target="_blank">\${subscriptionLink}</a>\`;
                }
            </script>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Create sets to store unique paths for each protocol
    let trojanPaths = new Set();
    let vlessPaths = new Set();
    let vmessPaths = new Set();

    if (url.pathname.startsWith('/sub')) {
      let newConfigs = '';

      // Fetch configurations from all subLinks
      for (let subLink of subLinks) {
        try {
          let resp = await fetch(subLink);
          if (!resp.ok) {
            continue;  // Skip invalid responses
          }
          let subConfigs = await resp.text();

          // Check if the content is base64 encoded
          let isBase64Encoded = false;
          try {
            atob(subConfigs);  // Try to decode it
            isBase64Encoded = true;
          } catch (e) {
            isBase64Encoded = false;  // Not base64 encoded
          }

          // Decode base64 content if encoded
          if (isBase64Encoded) {
            subConfigs = atob(subConfigs);
          }

          // Split configurations by lines
          subConfigs = subConfigs.split(/\r?\n/);

          for (let subConfig of subConfigs) {
            subConfig = subConfig.trim();  // Trim any leading/trailing whitespace
            if (subConfig === '') continue;  // Skip empty lines

            try {
              if (subConfig.startsWith('vmess://')) {
                // Handle VMess configuration
                let vmessData = subConfig.replace('vmess://', '');
                vmessData = atob(vmessData);
                let vmessConfig = JSON.parse(vmessData);

                // Ensure WebSocket (ws) and port 443 for VMess
                if (
                  vmessConfig.sni &&
                  !isIp(vmessConfig.sni) &&
                  vmessConfig.net === 'ws' &&
                  vmessConfig.port === 443
                ) {
                  let configNew = {
                    v: '2',
                    ps: `Node-${vmessConfig.sni}`,
                    add: realpathname === '' ? url.hostname : realpathname,
                    port: vmessConfig.port,
                    id: vmessConfig.id,
                    net: vmessConfig.net,
                    type: 'ws',
                    host: url.hostname,
                    path: `/${vmessConfig.sni}${vmessConfig.path}`,
                    tls: vmessConfig.tls,
                    sni: url.hostname,
                    aid: '0',
                    scy: 'auto',
                    fp: 'chrome',
                    alpn: 'http/1.1',
                  };

                  // Check for unique paths and avoid duplications
                  let fullPath = configNew.path;
                  if (!vmessPaths.has(fullPath)) {
                    vmessPaths.add(fullPath);  // Add the path to the Set
                    let encodedVmess = 'vmess://' + btoa(JSON.stringify(configNew));
                    newConfigs += encodedVmess + '\n';
                  }
                }
              } else if (subConfig.startsWith('vless://')) {
                // Handle VLESS configuration
                let vlessParts = subConfig.replace('vless://', '').split('@');
                if (vlessParts.length !== 2) continue;  // Invalid format

                let uuid = vlessParts[0];
                let remainingParts = vlessParts[1].split('?');
                if (remainingParts.length !== 2) continue;  // Invalid format

                let [ipPort, params] = remainingParts;
                let [ip, port] = ipPort.split(':');
                if (!port) continue;  // Port is required

                let queryParams = new URLSearchParams(params);
                let security = queryParams.get('security');
                let sni = queryParams.get('sni');
                let alpn = queryParams.get('alpn');
                let fp = queryParams.get('fp');
                let type = queryParams.get('type');  // For WebSocket check

                // Ensure WebSocket (type=ws) and port 443 for VLESS
                if (
                  sni &&
                  !isIp(sni) &&
                  security === 'tls' &&
                  port === '443' &&
                  type === 'ws'
                ) {
                  let newPath = `/${sni}${queryParams.get('path') || ''}`;

                  // Check for unique paths and avoid duplications
                  if (!vlessPaths.has(newPath)) {
                    vlessPaths.add(newPath);  // Add the path to the Set
                    let newVlessConfig = `vless://${uuid}@${realpathname === '' ? url.hostname : realpathname}:${port}?encryption=none&security=${security}&sni=${url.hostname}&alpn=${alpn}&fp=chrome&allowInsecure=1&type=ws&host=${url.hostname}&path=${newPath}#Node-${sni}`;
                    newConfigs += newVlessConfig + '\n';
                  }
                }
              } else if (subConfig.startsWith('trojan://')) {
                // Handle Trojan configuration

                // Find the last '#' to separate the remark
                let lastHashIndex = subConfig.lastIndexOf('#');
                let configWithoutRemark = subConfig;
                let remark = '';
                if (lastHashIndex !== -1) {
                  configWithoutRemark = subConfig.substring(0, lastHashIndex);
                  remark = subConfig.substring(lastHashIndex + 1);
                }

                // Now parse configWithoutRemark
                let trojanURL = configWithoutRemark.replace('trojan://', '');
                let [passwordAndHost, params] = trojanURL.split('?');
                if (!params) continue;  // Invalid format

                let [password, hostAndPort] = passwordAndHost.split('@');
                if (!hostAndPort) continue;  // Invalid format

                let [ip, port] = hostAndPort.split(':');
                if (!port) continue;  // Port is required

                let queryParams = new URLSearchParams(params);
                let security = queryParams.get('security');
                let sni = queryParams.get('sni');
                let alpn = queryParams.get('alpn');
                let fp = queryParams.get('fp');
                let type = queryParams.get('type');  // For WebSocket check

                // Ensure WebSocket (type=ws), TLS, and port 443 for Trojan
                if (
                  sni &&
                  !isIp(sni) &&
                  security === 'tls' &&
                  port === '443' &&
                  type === 'ws'
                ) {
                  let newPath = `/${sni}${decodeURIComponent(queryParams.get('path') || '')}`;

                  // Check for unique paths and avoid duplications
                  if (!trojanPaths.has(newPath)) {
                    trojanPaths.add(newPath);  // Add the path to the Set
                    let newTrojanConfig = `trojan://${password}@${realpathname === '' ? url.hostname : realpathname}:${port}?security=${security}&sni=${url.hostname}&alpn=${alpn}&fp=chrome&allowInsecure=1&type=ws&host=${url.hostname}&path=${encodeURIComponent(newPath)}#${remark ? encodeURIComponent(remark) : `Node-${sni}`}`;
                    newConfigs += newTrojanConfig + '\n';
                  }
                }
              }
            } catch (error) {
              // Skip non-compliant configurations and move to the next
              continue;
            }
          }
        } catch (error) {
          // Handle any fetch errors for subLink
          continue;
        }
      }

      return new Response(newConfigs, {
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      // Handle non-/sub requests by proxying them
      const url = new URL(request.url);
      const splitted = url.pathname.replace(/^\/*/, '').split('/');
      const address = splitted[0];
      url.pathname = splitted.slice(1).join('/');
      url.hostname = address;
      url.protocol = 'https';
      return fetch(new Request(url, request));
    }
  },
};

function isIp(ipstr) {
  try {
    if (!ipstr) return false;
    // Regular expression to validate IPv4 addresses
    const ipv4Regex = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
    if (!ipv4Regex.test(ipstr)) {
      return false;
    }
    let segments = ipstr.split('.');
    // Ensure the last octet is not "0"
    if (segments[3] === '0') {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
