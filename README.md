# 🦖 PWT ATCS

**Live traffic CCTV viewer for Purwokerto & Banyumas.**

PWT ATCS is a lightweight frontend for publicly published ATCS CCTV feeds. Streams are loaded directly from the publisher instead of passing video segments through a Vercel proxy.

## ✨ Features

- ⚡ Low-latency HLS playback with `hls.js`
- 🗺️ Interactive OpenStreetMap camera map
- 📍 Camera markers linked to the live player
- 🔎 Search by camera name or area
- 🟢 LIVE / CONNECTING / OFFLINE states
- 🔄 Automatic retry for fatal HLS errors
- 📱 Responsive desktop & mobile layout
- 🟡 PWTDEV black / white / yellow visual identity

## 📡 Camera coverage

The viewer currently includes the public ATCS points listed for the Purwokerto/Banyumas traffic network, including GOR Satria, Kebon Dalem, Sutosuman, Kalibogor, Tanjung, Karang Pucung, Patriot, Karang Bawang, Pancurawis, Tugu Adipura, Sawangan, Museum BRI, Alun Alun, Jl. Masjid, Sokaraja, Margono, Situmpur, Underpass, Linggamas, Kalibagor, Karang Lewas, Karanglo, Ajibarang and additional road/multi-angle points.

> Map coordinates are maintained as practical map points for the intersection/road location. Multi-angle cameras at the same junction may intentionally share a marker.

## 🧱 Stack

- React
- Vite
- hls.js
- Leaflet
- OpenStreetMap tiles
- Vercel-ready static frontend

## 🚀 Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## 📺 Stream policy

PWT ATCS only displays CCTV feeds that are already publicly exposed by the publisher. It does not download, record, capture, or store CCTV footage.

---

Part of **PWTDEV — Purwokerto Developer**.
