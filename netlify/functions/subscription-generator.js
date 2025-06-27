// netlify/functions/subscription-generator.js
// Version 1.1.0 for Netlify Functions (رفع مشکل بازگشت HTML به جای کانفیگ)

import { Buffer } from 'buffer'; // برای رمزگذاری/رمزگشایی Base64 در محیط Node.js

const subLinks = [
  'https://raw.githubusercontent.com/Surfboardv2ray/Proxy-sorter/main/ws_tls/proxies/wstls',
  'https://raw.githubusercontent.com/itsyebekhe/HiN-VPN/main/subscription/normal/trojan',
  'https://raw.githubusercontent.com/Surfboardv2ray/TGParse/refs/heads/main/configtg.txt',
  'https://raw.githubusercontent.com/soroushmirzaei/telegram-configs-collector/refs/heads/main/protocols/trojan',
  'https://raw.githubusercontent.com/yebekhe/V2Hub/main/Split/Normal/trojan',
];

/**
 * تابع کمکی برای بررسی اینکه آیا یک رشته آدرس IP معتبر IPv4 است یا خیر.
 * @param {string} ipstr - رشته‌ای که باید بررسی شود.
 * @returns {boolean} - اگر IP معتبر باشد true، در غیر این صورت false.
 */
function isIp(ipstr) {
  try {
    if (!ipstr) return false;
    const ipv4Regex = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
    if (!ipv4Regex.test(ipstr)) {
      return false;
    }
    let segments = ipstr.split('.');
    if (segments[3] === '0') {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * هندلر اصلی برای Netlify Function.
 * @param {Object} event - شیء event شامل جزئیات درخواست.
 * @param {Object} context - شیء context شامل اطلاعات محیط.
 * @returns {Promise<Object>} - یک Promise که به شیئی شامل statusCode، headers و body حل می‌شود.
 */
export const handler = async (event, context) => {
  const urlPath = event.path; // مسیر درخواست از شیء event.
  const urlHostname = event.headers.host; // نام هاست (دامنه) از هدرهای درخواست.
  // بررسی وجود پارامتر 'ip' در query string. این مهم‌ترین معیار برای تشخیص نوع درخواست است.
  const cleanIP = event.queryStringParameters ? event.queryStringParameters.ip : null;

  // --- منطق اصلی: اولویت با تولید کانفیگ‌ها در صورت وجود IP ---
  // اگر پارامتر 'ip' در query string وجود داشته باشد، یعنی کاربر کانفیگ می‌خواهد.
  if (cleanIP) {
    const realpathname = cleanIP;

    let trojanPaths = new Set();
    let vlessPaths = new Set();
    let vmessPaths = new Set();
    let newConfigs = '';

    // حلقه‌ای برای گرفتن کانفیگ‌ها از تمام لینک‌های اشتراک‌گذاری
    for (let subLink of subLinks) {
      try {
        let resp = await fetch(subLink);
        if (!resp.ok) {
          console.warn(`خطا در دریافت ${subLink}: کد وضعیت ${resp.status}`);
          continue;
        }
        let subConfigs = await resp.text();

        let isBase64Encoded = false;
        try {
          Buffer.from(subConfigs, 'base64').toString('utf8');
          isBase64Encoded = true;
        } catch (e) {
          isBase64Encoded = false;
        }

        if (isBase64Encoded) {
          subConfigs = Buffer.from(subConfigs, 'base64').toString('utf8');
        }

        subConfigs = subConfigs.split(/\r?\n/);

        for (let subConfig of subConfigs) {
          subConfig = subConfig.trim();
          if (subConfig === '') continue;

          try {
            if (subConfig.startsWith('vmess://')) {
              let vmessData = subConfig.replace('vmess://', '');
              vmessData = Buffer.from(vmessData, 'base64').toString('utf8');
              let vmessConfig = JSON.parse(vmessData);

              if (
                vmessConfig.sni &&
                !isIp(vmessConfig.sni) &&
                vmessConfig.net === 'ws' &&
                vmessConfig.port === 443
              ) {
                let configNew = {
                  v: '2',
                  ps: `Node-${vmessConfig.sni}`,
                  add: realpathname,
                  port: vmessConfig.port,
                  id: vmessConfig.id,
                  net: vmessConfig.net,
                  type: 'ws',
                  host: urlHostname,
                  path: `/${vmessConfig.sni}${vmessConfig.path}`,
                  tls: vmessConfig.tls,
                  sni: urlHostname,
                  aid: '0',
                  scy: 'auto',
                  fp: 'chrome',
                  alpn: 'http/1.1',
                };

                let fullPath = configNew.path;
                if (!vmessPaths.has(fullPath)) {
                  vmessPaths.add(fullPath);
                  let encodedVmess = 'vmess://' + Buffer.from(JSON.stringify(configNew)).toString('base64');
                  newConfigs += encodedVmess + '\n';
                }
              }
            } else if (subConfig.startsWith('vless://')) {
              let vlessParts = subConfig.replace('vless://', '').split('@');
              if (vlessParts.length !== 2) continue;

              let uuid = vlessParts[0];
              let remainingParts = vlessParts[1].split('?');
              if (remainingParts.length !== 2) continue;

              let [ipPort, params] = remainingParts;
              let [ip, port] = ipPort.split(':');
              if (!port) continue;

              let queryParams = new URLSearchParams(params);
              let security = queryParams.get('security');
              let sni = queryParams.get('sni');
              let alpn = queryParams.get('alpn');
              let fp = queryParams.get('fp');
              let type = queryParams.get('type');

              if (
                sni &&
                !isIp(sni) &&
                security === 'tls' &&
                port === '443' &&
                type === 'ws'
              ) {
                let newPath = `/${sni}${queryParams.get('path') || ''}`;

                if (!vlessPaths.has(newPath)) {
                  vlessPaths.add(newPath);
                  let newVlessConfig = `vless://${uuid}@${realpathname}:${port}?encryption=none&security=${security}&sni=${urlHostname}&alpn=${alpn}&fp=chrome&allowInsecure=1&type=ws&host=${urlHostname}&path=${newPath}#Node-${sni}`;
                  newConfigs += newVlessConfig + '\n';
                }
              }
            } else if (subConfig.startsWith('trojan://')) {
              let lastHashIndex = subConfig.lastIndexOf('#');
              let configWithoutRemark = subConfig;
              let remark = '';
              if (lastHashIndex !== -1) {
                configWithoutRemark = subConfig.substring(0, lastHashIndex);
                remark = subConfig.substring(lastHashIndex + 1);
              }

              let trojanURL = configWithoutRemark.replace('trojan://', '');
              let [passwordAndHost, params] = trojanURL.split('?');
              if (!params) continue;

              let [password, hostAndPort] = passwordAndHost.split('@');
              if (!hostAndPort) continue;

              let [ip, port] = hostAndPort.split(':');
              if (!port) continue;

              let queryParams = new URLSearchParams(params);
              let security = queryParams.get('security');
              let sni = queryParams.get('sni');
              let alpn = queryParams.get('alpn');
              let fp = queryParams.get('fp');
              let type = queryParams.get('type');

              if (
                sni &&
                !isIp(sni) &&
                security === 'tls' &&
                port === '443' &&
                type === 'ws'
              ) {
                let newPath = `/${sni}${decodeURIComponent(queryParams.get('path') || '')}`;

                if (!trojanPaths.has(newPath)) {
                  trojanPaths.add(newPath);
                  let newTrojanConfig = `trojan://${password}@${realpathname}:${port}?security=${security}&sni=${urlHostname}&alpn=${alpn}&fp=chrome&allowInsecure=1&type=ws&host=${urlHostname}&path=${encodeURIComponent(newPath)}#${remark ? encodeURIComponent(remark) : `Node-${sni}`}`;
                  newConfigs += newTrojanConfig + '\n';
                }
              }
            }
          } catch (error) {
            console.error('خطا در پردازش کانفیگ:', error, 'کانفیگ:', subConfig);
            continue;
          }
        }
      } catch (error) {
        console.error('خطا در دریافت لینک اشتراک‌گذاری:', subLink, error);
        continue;
      }
    }

    // نکته مهم: اینجا خروجی نهایی رو Base64 می‌کنیم تا v2rayN بتونه ایمپورت کنه
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: Buffer.from(newConfigs).toString('base64'), // تبدیل کل خروجی به Base64
    };
  }
  // --- منطق دوم: اگر پارامتر IP نباشد (یعنی درخواست برای صفحه اصلی است) ---
  else {
    // این بلاک HTML برای نمایش صفحه اصلی است.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: `
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
                <div id="subscription-link"><strong>https://{your-netlify-site.netlify.app}/.netlify/functions/subscription-generator?ip=YOUR_CLEAN_IP</strong></div>
                <button id="get-clean-ip" class="btn">Get Clean IP</button>
            </div>
            <script>
                document.getElementById('get-clean-ip').onclick = async function() {
                    const response = await fetch('https://raw.githubusercontent.com/ircfspace/cf2dns/refs/heads/master/list/ipv4.json');
                    const data = await response.json();
                    const randomIndex = Math.floor(Math.random() * data.length);
                    const cleanIP = data[randomIndex].ip;
                    const netlifyHostname = window.location.hostname;
                    // ساخت URL برای فراخوانی Netlify Function با پارامتر IP
                    const subscriptionLink = \`https://\${netlifyHostname}/.netlify/functions/subscription-generator?ip=\${cleanIP}\`;
                    document.getElementById('subscription-link').innerHTML = \`<a href="\${subscriptionLink}" target="_blank">\${subscriptionLink}</a>\`;
                }
            </script>
        </body>
        </html>
      `,
    };
  }
};
