# SezarSec-Worker-Panel-
A fork of Cloudflare's Worker Panels project. In line with the freedom of the Internet

<h1 align="center">
  SezarSec Worker Panel
</h1>

<h2 align="center">
Access xray (v2ray) configs using Cloudflare CDN.
  <h3>
    English 🇬🇧 | <a href="README_FA.md">🇮🇷 فارسی</a>
  </h3> 
</h2>

[![Version](https://img.shields.io/github/v/release/SezarSec/SezarSec-Worker-Panel?label=Version&color=blue)](https://github.com/surfboardv2ray/Trojan-worker/releases/latest)
[![Download](https://img.shields.io/github/downloads/SezarSec/SezarSec-Worker-Panel/total?label=Downloads)](https://github.com/surfboardv2ray/Trojan-worker/releases/latest)
[![Stars](https://img.shields.io/github/stars/SezarSec/SezarSec-Worker-Panel?style=flat&label=Stars&color=tomato
)](https://github.com/SezarSec/SezarSec-Worker-Panel)

## Introduction
🟢 Cloudflare offers the ability to run serverless configurations, while also enabling access to VPS configurations by routing traffic through its CDN. In this guide, we aim to demonstrate how to use SezarSec VPS configurations through Cloudflare's CDN.

## Installation
1. Sign up or log in to Cloudflare (cloudflare.com), and ensure that you have verified your email.
2. Navigate to the `Workers and Pages` section, then create and name a new worker.
3. Click on `Edit Code` to access the code editing environment.
4. Download or Copy entire content the latest version of the [SezarSec Worker Panel script](https://github.com/SezarSec/SezarSec-Worker-Panel-/releases/tag/worker), and copy the entire content.
5. Paste the content of the script onto the mentioned step 3 javascript editing environment.
6. Click on `Deploy` in the top-right corner (you may need to press Ctrl+S to save first if the Deploy button is not active).
7. Your worker's subscription URL will follow this format: `https://{your_worker_address}.workers.dev/sub/{your_clean_ip}`


## Modifying Source Links
🟡 You can easily add or modify the subscription source links by editing the subLinks section at the beginning of the script. Both standard and base64-encoded links are supported.

🟡 This script collects configurations for Vmess, Vless, and Trojan protocols, focusing on WebSocket (WS), TLS, and port 443.

## Additional Notes
🟡 The base worker URL can fetch clean IPs via [IRCF Space Repo](https://github.com/ircfspace/cf2dns/blob/master/list/ipv4.json), but it's still recommended to use [Scanners](https://ircf.space/scanner.html).

![0](./assets/redline.gif)

<p align="center">
  <img src="assets/html.jpg" alt="html.jpg" width="500"/>
</p>

![0](./assets/redline.gif)


