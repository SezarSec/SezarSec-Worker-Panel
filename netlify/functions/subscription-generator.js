// netlify/functions/subscription-generator.js
// Version 1.0.0 for Netlify Functions (Adapted from Cloudflare Worker)

// توضیحات: این کد برای اجرا روی Netlify Functions بهینه‌سازی شده است.
// تغییرات اصلی شامل نحوه export تابع، استفاده از Buffer برای Base64،
// و دسترسی به اطلاعات درخواست از طریق شیء 'event' می‌باشد.

import { Buffer } from 'buffer'; // برای رمزگذاری/رمزگشایی Base64 در محیط Node.js

// لینک‌های اشتراک‌گذاری کانفیگ‌ها. این‌ها می‌توانند بر اساس نیاز شما تغییر کنند.
// توجه داشته باشید که تنها کانفیگ‌های ws+tls+443 فیلتر و استفاده خواهند شد.
const subLinks = [
  'https://raw.githubusercontent.com/Surfboardv2ray/Proxy-sorter/main/ws_tls/proxies/wstls',
  'https://raw.githubusercontent.com/itsyebekhe/HiN-VPN/main/subscription/normal/trojan',
  'https://raw.githubusercontent.com/Surfboardv2ray/TGParse/refs/heads/main/configtg.txt',
  'https://raw.githubusercontent.com/soroushmirzaei/telegram-configs-collector/refs/heads/main/protocols/trojan',
  'https://raw.githubusercontent.com/yebekhe/V2Hub/main/Split/Normal/trojan',
  // لینک‌های بیشتر را در صورت نیاز اینجا اضافه کنید
];

/**
 * تابع کمکی برای بررسی اینکه آیا یک رشته آدرس IP معتبر IPv4 است یا خیر.
 * آدرس‌های IP که آخرین اکتت آن‌ها "0" باشد، نامعتبر تلقی می‌شوند.
 * @param {string} ipstr - رشته‌ای که باید بررسی شود.
 * @returns {boolean} - اگر IP معتبر باشد true، در غیر این صورت false.
 */
function isIp(ipstr) {
  try {
    if (!ipstr) return false;
    // Regex برای اعتبار سنجی آدرس‌های IPv4
    const ipv4Regex = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
    if (!ipv4Regex.test(ipstr)) {
      return false;
    }
    let segments = ipstr.split('.');
    // اطمینان از اینکه آخرین اکتت "0" نیست
    if (segments[3] === '0') {
      return false;
    }
    return true;
  } catch (e) {
    // در صورت بروز خطا در اعتبارسنجی IP، false برگردانده شود.
    return false;
  }
}

/**
 * هندلر اصلی برای Netlify Function.
 * این تابع به عنوان نقطه ورود برای تمام درخواست‌های HTTP به این Function عمل می‌کند.
 * @param {Object} event - شیء event شامل جزئیات درخواست (مسیر، هدرها، query parameters و غیره).
 * @param {Object} context - شیء context شامل اطلاعات مربوط به فراخوانی تابع و محیط اجرا.
 * @returns {Promise<Object>} - یک Promise که به شیئی شامل statusCode، headers و body حل می‌شود.
 */
export const handler = async (event, context) => {
  const urlPath = event.path; // مسیر درخواست از شیء event.
  const urlHostname = event.headers.host; // نام هاست (دامنه) از هدرهای درخواست.

  // در Netlify Functions، بهتر است فایل‌های HTML ثابت را جداگانه میزبانی کنید.
  // این بلاک فقط برای نمایش خودکار HTML در مسیر روت تابع است، اما برای تولید
  // بهتر است این HTML به عنوان یک فایل ثابت در سایت Netlify شما سرو شود.
  // در آن صورت، دکمه 'Get Clean IP' باید به API endpoint تابع Netlify اشاره کند.
  if (urlPath === '/' || urlPath === '/index.html' || urlPath === '/.netlify/functions/subscription-generator') {
    // اگر تابع بدون query parameter یا در مسیر روت فراخوانی شود، HTML را نمایش دهد.
    // لینک تولید شده در اینجا شامل .netlify/functions/subscription-generator و query parameter 'ip' است.
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
                    const netlifyHostname = window.location.hostname; // یا دامنه سفارشی شما اگر تنظیم شده است
                    // ساخت URL برای فراخوانی Netlify Function
                    const subscriptionLink = \`https://\${netlifyHostname}/.netlify/functions/subscription-generator?ip=\${cleanIP}\`;
                    document.getElementById('subscription-link').innerHTML = \`<a href="\${subscriptionLink}" target="_blank">\${subscriptionLink}</a>\`;
                }
            </script>
        </body>
        </html>
      `,
    };
  }

  // اگر درخواست برای مسیر تابع اصلی (مثلاً از طریق redirect /sub/*) باشد.
  // این قسمت مسئول تولید و بازگرداندن کانفیگ‌های VPN است.
  const cleanIP = event.queryStringParameters ? event.queryStringParameters.ip : null;

  if (!cleanIP) {
    return {
      statusCode: 400,
      body: 'خطا: پارامتر IP تمیز (clean IP) موجود نیست. لطفاً IP را با ?ip=X.X.X.X فراهم کنید.',
    };
  }

  // realpathname حالا همان IP تمیز است که از query parameter گرفته شده است.
  const realpathname = cleanIP;

  // مجموعه‌هایی برای ذخیره مسیرهای منحصر به فرد هر پروتکل جهت جلوگیری از تکرار.
  let trojanPaths = new Set();
  let vlessPaths = new Set();
  let vmessPaths = new Set();
  let newConfigs = ''; // رشته‌ای برای ذخیره کانفیگ‌های جدید

  // حلقه‌ای برای گرفتن کانفیگ‌ها از تمام لینک‌های اشتراک‌گذاری
  for (let subLink of subLinks) {
    try {
      let resp = await fetch(subLink);
      if (!resp.ok) {
        console.warn(`خطا در دریافت ${subLink}: کد وضعیت ${resp.status}`);
        continue; // در صورت پاسخ نامعتبر، لینک را رد کرده و به بعدی برود.
      }
      let subConfigs = await resp.text();

      // بررسی و دیکد کردن محتوای base64 با استفاده از Buffer Node.js
      let isBase64Encoded = false;
      try {
        // تلاش برای دیکد کردن به عنوان base64؛ اگر خطا داد، یعنی base64 نیست.
        Buffer.from(subConfigs, 'base64').toString('utf8');
        isBase64Encoded = true;
      } catch (e) {
        isBase64Encoded = false;
      }

      if (isBase64Encoded) {
        subConfigs = Buffer.from(subConfigs, 'base64').toString('utf8');
      }

      // تقسیم کانفیگ‌ها بر اساس خطوط جدید
      subConfigs = subConfigs.split(/\r?\n/);

      for (let subConfig of subConfigs) {
        subConfig = subConfig.trim(); // حذف فاصله از ابتدا و انتهای خط
        if (subConfig === '') continue; // رد کردن خطوط خالی

        try {
          if (subConfig.startsWith('vmess://')) {
            // منطق پردازش کانفیگ VMess
            let vmessData = subConfig.replace('vmess://', '');
            vmessData = Buffer.from(vmessData, 'base64').toString('utf8');
            let vmessConfig = JSON.parse(vmessData);

            // اطمینان از اینکه SNI وجود دارد، IP نیست، نوع شبکه 'ws' و پورت 443 است.
            if (
              vmessConfig.sni &&
              !isIp(vmessConfig.sni) &&
              vmessConfig.net === 'ws' &&
              vmessConfig.port === 443
            ) {
              let configNew = {
                v: '2',
                ps: `Node-${vmessConfig.sni}`,
                add: realpathname, // استفاده از IP تمیز فراهم شده
                port: vmessConfig.port,
                id: vmessConfig.id,
                net: vmessConfig.net,
                type: 'ws',
                host: urlHostname, // استفاده از هاست Netlify Function
                path: `/${vmessConfig.sni}${vmessConfig.path}`, // مسیر برای پروکسی
                tls: vmessConfig.tls,
                sni: urlHostname, // استفاده از هاست Netlify Function برای SNI
                aid: '0',
                scy: 'auto',
                fp: 'chrome',
                alpn: 'http/1.1',
              };

              // بررسی مسیرهای منحصر به فرد برای جلوگیری از تکرار
              let fullPath = configNew.path;
              if (!vmessPaths.has(fullPath)) {
                vmessPaths.add(fullPath); // اضافه کردن مسیر به Set
                let encodedVmess = 'vmess://' + Buffer.from(JSON.stringify(configNew)).toString('base64');
                newConfigs += encodedVmess + '\n';
              }
            }
          } else if (subConfig.startsWith('vless://')) {
            // منطق پردازش کانفیگ VLESS
            let vlessParts = subConfig.replace('vless://', '').split('@');
            if (vlessParts.length !== 2) continue; // فرمت نامعتبر

            let uuid = vlessParts[0];
            let remainingParts = vlessParts[1].split('?');
            if (remainingParts.length !== 2) continue; // فرمت نامعتبر

            let [ipPort, params] = remainingParts;
            let [ip, port] = ipPort.split(':');
            if (!port) continue; // پورت مورد نیاز است

            let queryParams = new URLSearchParams(params);
            let security = queryParams.get('security');
            let sni = queryParams.get('sni');
            let alpn = queryParams.get('alpn');
            let fp = queryParams.get('fp');
            let type = queryParams.get('type'); // برای بررسی WebSocket

            // اطمینان از اینکه SNI وجود دارد، IP نیست، امنیت TLS، پورت 443 و نوع 'ws' است.
            if (
              sni &&
              !isIp(sni) &&
              security === 'tls' &&
              port === '443' &&
              type === 'ws'
            ) {
              let newPath = `/${sni}${queryParams.get('path') || ''}`; // مسیر برای پروکسی

              // بررسی مسیرهای منحصر به فرد برای جلوگیری از تکرار
              if (!vlessPaths.has(newPath)) {
                vlessPaths.add(newPath); // اضافه کردن مسیر به Set
                let newVlessConfig = `vless://${uuid}@${realpathname}:${port}?encryption=none&security=${security}&sni=${urlHostname}&alpn=${alpn}&fp=chrome&allowInsecure=1&type=ws&host=${urlHostname}&path=${newPath}#Node-${sni}`;
                newConfigs += newVlessConfig + '\n';
              }
            }
          } else if (subConfig.startsWith('trojan://')) {
            // منطق پردازش کانفیگ Trojan

            // پیدا کردن آخرین '#' برای جدا کردن remark
            let lastHashIndex = subConfig.lastIndexOf('#');
            let configWithoutRemark = subConfig;
            let remark = '';
            if (lastHashIndex !== -1) {
              configWithoutRemark = subConfig.substring(0, lastHashIndex);
              remark = subConfig.substring(lastHashIndex + 1);
            }

            // پارس کردن configWithoutRemark
            let trojanURL = configWithoutRemark.replace('trojan://', '');
            let [passwordAndHost, params] = trojanURL.split('?');
            if (!params) continue; // فرمت نامعتبر

            let [password, hostAndPort] = passwordAndHost.split('@');
            if (!hostAndPort) continue; // فرمت نامعتبر

            let [ip, port] = hostAndPort.split(':');
            if (!port) continue; // پورت مورد نیاز است

            let queryParams = new URLSearchParams(params);
            let security = queryParams.get('security');
            let sni = queryParams.get('sni');
            let alpn = queryParams.get('alpn');
            let fp = queryParams.get('fp');
            let type = queryParams.get('type'); // برای بررسی WebSocket

            // اطمینان از اینکه SNI وجود دارد، IP نیست، امنیت TLS، پورت 443 و نوع 'ws' است.
            if (
              sni &&
              !isIp(sni) &&
              security === 'tls' &&
              port === '443' &&
              type === 'ws'
            ) {
              let newPath = `/${sni}${decodeURIComponent(queryParams.get('path') || '')}`; // مسیر برای پروکسی

              // بررسی مسیرهای منحصر به فرد برای جلوگیری از تکرار
              if (!trojanPaths.has(newPath)) {
                trojanPaths.add(newPath); // اضافه کردن مسیر به Set
                let newTrojanConfig = `trojan://${password}@${realpathname}:${port}?security=${security}&sni=${urlHostname}&alpn=${alpn}&fp=chrome&allowInsecure=1&type=ws&host=${urlHostname}&path=${encodeURIComponent(newPath)}#${remark ? encodeURIComponent(remark) : `Node-${sni}`}`;
                newConfigs += newTrojanConfig + '\n';
              }
            }
          }
        } catch (error) {
          // در صورت بروز خطا در پردازش یک کانفیگ خاص، آن را لاگ کرده و ادامه دهد.
          console.error('خطا در پردازش کانفیگ:', error, 'کانفیگ:', subConfig);
          continue;
        }
      }
    } catch (error) {
      // خطا در دریافت لینک اشتراک‌گذاری (مثلاً مشکل شبکه، URL نامعتبر)
      console.error('خطا در دریافت لینک اشتراک‌گذاری:', subLink, error);
      continue;
    }
  }

  // بازگرداندن کانفیگ‌های جدید به صورت متن ساده
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    body: newConfigs,
  };
};
