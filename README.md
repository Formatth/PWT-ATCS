# 🦖 PWT ATCS

**Live traffic CCTV viewer for Purwokerto & Banyumas.**

PWT ATCS is a lightweight frontend for publicly published ATCS CCTV feeds. The player connects directly to the published HLS stream instead of routing video segments through a Vercel proxy.

## Current test camera

- **Simpang Karang Bawang**
- Low-latency HLS
- Automatic live/error state
- Responsive player

## Stack

- React + Vite
- hls.js
- Vercel-ready static frontend

## Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Notes

Streams are consumed directly from the publisher's publicly exposed endpoint. This project does not download, record, or store CCTV footage.

---

Part of **PWTDEV — Purwokerto Developer**.
