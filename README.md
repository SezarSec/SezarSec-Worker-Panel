<h1 align="center">
  SezarSec Worker Panel
</h1>

<h2 align="center">
Access xray (v2ray) configs using Cloudflare CDN.

</h2>

![Project Image](https://github.com/SezarSec/SezarSec-Worker-Panel/blob/main/assest/pic.png)


## Introduction
🛑 This project is an advanced script for Cloudflare Workers that allows you to route various configurations (VLESS, VMess, Trojan) through Cloudflare's CDN to bypass internet restrictions. Featuring a modern UI and new capabilities such as gRPC support, custom port selection, and a smart IP scanner, this panel provides a comprehensive experience for generating subscription links.

## Installation
🔻1. Sign up or log in to Cloudflare (cloudflare.com), and ensure that you have verified your email.

🔻2. Navigate to the `Workers and Pages` section, then create and name a new worker.

🔻3. Click on `Edit Code` to access the code editing environment.

🔻4. Download or Copy entire content the latest version of the [SezarSec Worker Panel script](https://github.com/SezarSec/SezarSec-Worker-Panel-/releases/tag/worker), and copy the entire content.

🔻5. Paste the content of the script onto the mentioned step 3 javascript editing environment.

🔻6. Click on `Deploy` in the top-right corner (you may need to press Ctrl+S to save first if the Deploy button is not active).

🔻7. Your worker's subscription URL will follow this format: `https://{your_worker_address}.workers.dev/sub/{your_clean_ip}`

## Features
〽️ Modern UI: A redesigned, user-friendly management panel.

〽️ Multi-Protocol Support: Works with VLESS, VMess, and Trojan protocols.

〽️ gRPC & WebSocket: Supports both gRPC and WS transmissions.

〽️ Custom Port Selection: Allows you to filter configs by your desired ports.

〽️ Smart IP Scanner: A built-in tool to live-scan Cloudflare IPs and find the one with the lowest latency.

〽️ Server Health Check: An optional feature to verify that config servers are online.

## How to Use
〽️ After deployment, access the management panel by navigating to your worker's main URL.

〽️ Quick Method: Click the "Get Quick Link" button to instantly generate a subscription link using a randomly selected clean IP.

〽️ Smart Scan Method: Click "Scan Clean IP" to view a list of healthy IPs with their latencies. You can then "Select" the best option to build your link.

〽️ The final subscription URL will follow this format: https://{your_worker_address}.workers.dev/sub/{your_clean_ip}. Add this URL to your client.

## Customization
〽️ You can easily add or modify the subscription source links by editing the subLinks section at the beginning of the script. Both standard and Base64-encoded links are supported.

## Additional Notes
〽️ The panel has a built-in scanner for finding clean IPs, but you can still use IPs found through other scanners.
〽️ The base worker URL can fetch clean IPs via [IRCF Space Repo](https://github.com/ircfspace/cf2dns/blob/master/list/ipv4.json), but it's still recommended to use [Scanners](https://ircf.space/scanner.html).
❤️Forked version of Trojan Worker by Surfboardv2ray




