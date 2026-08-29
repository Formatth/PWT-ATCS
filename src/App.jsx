import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const HLS_HOST = 'https://cctv.dev.banyumaskab.go.id';

const stream = (slug, kind = 'simpang') => {
  const endpointSlug = slug
    .replace(/^ruas-/, '')
    .replace(/-/g, '_');

  return `${HLS_HOST}/cctv_${kind}_${endpointSlug}/video1_stream.m3u8`;
};

// Coordinates are map points for the intersection/road location. Multi-angle
// cameras at the same junction intentionally share one map marker.
const CAMERAS = [
  ['gor-satria', 'Simpang GOR Satria', 'Purwokerto Timur', 'simpang', -7.416923, 109.244721],
  ['kebon-dalem', 'Simpang Kebon Dalem', 'Purwokerto Timur', 'simpang', -7.423220, 109.243936],
  ['sutosuman', 'Simpang Sutosuman', 'Purwokerto Selatan', 'simpang', -7.427806, 109.243705],
  ['kalibogor', 'Simpang Kalibogor', 'Purwokerto Barat', 'simpang', -7.422313, 109.212762],
  ['tanjung', 'Simpang Tanjung', 'Purwokerto Selatan', 'simpang', -7.425200, 109.235000],
  ['tanjung-barat', 'Simpang Tanjung Barat', 'Purwokerto Selatan', 'simpang', -7.425200, 109.234600],
  ['tanjung-utara', 'Simpang Tanjung Utara', 'Purwokerto Selatan', 'simpang', -7.423900, 109.235000],
  ['karang-pucung', 'Simpang Karang Pucung', 'Purwokerto Selatan', 'simpang', -7.442100, 109.238500],
  ['patriot', 'Simpang Patriot', 'Purwokerto Selatan', 'simpang', -7.432000, 109.240500],
  ['karang-bawang', 'Simpang Karang Bawang', 'Purwokerto Selatan', 'simpang', -7.426167, 109.251200],
  ['karang-bawang-selatan', 'Simpang Karang Bawang Selatan', 'Purwokerto Selatan', 'simpang', -7.426650, 109.251200],
  ['karang-bawang-timur', 'Simpang Karang Bawang Timur', 'Purwokerto Selatan', 'simpang', -7.426167, 109.251800],
  ['karang-bawang-barat', 'Simpang Karang Bawang Barat', 'Purwokerto Selatan', 'simpang', -7.426167, 109.250600],
  ['pancurawis', 'Simpang Pancurawis', 'Purwokerto Selatan', 'simpang', -7.438800, 109.245000],
  ['tugu-adipura', 'Tugu Adipura', 'Purwokerto Selatan', 'simpang', -7.437290, 109.262327],
  ['ruas-kalibogor', 'Ruas Kalibogor', 'Purwokerto Barat', 'ruas', -7.422313, 109.212762],
  ['ruas-tanjung', 'Ruas Tanjung', 'Purwokerto Selatan', 'ruas', -7.425200, 109.235000],
  ['ruas-patriot', 'Ruas Patriot', 'Purwokerto Selatan', 'ruas', -7.432000, 109.240500],
  ['ruas-tugu-adipura', 'Ruas Tugu Adipura', 'Purwokerto Selatan', 'ruas', -7.437290, 109.262327],
  ['sawangan', 'Simpang Sawangan', 'Purwokerto Barat', 'simpang', -7.421000, 109.222000],
  ['museum-bri', 'Simpang Museum BRI', 'Purwokerto Barat', 'simpang', -7.421800, 109.227500],
  ['alun-alun', 'Simpang Alun Alun', 'Purwokerto Timur', 'simpang', -7.423900, 109.230800],
  ['sutosuman-barat', 'Simpang Sutosuman Barat', 'Purwokerto Selatan', 'simpang', -7.427806, 109.241900],
  ['jl-masjid', 'Simpang Jl. Masjid', 'Purwokerto Timur', 'simpang', -7.421800, 109.238500],
  ['sokaraja', 'Simpang Sokaraja', 'Sokaraja', 'simpang', -7.458827, 109.271784],
  ['margono', 'Margono', 'Purwokerto Selatan', 'simpang', -7.447000, 109.252500],
  ['situmpur', 'Situmpur', 'Purwokerto Selatan', 'simpang', -7.430000, 109.236000],
  ['underpass', 'Underpass Purwokerto', 'Purwokerto Barat', 'simpang', -7.419900, 109.224000],
  ['linggamas', 'Simpang Linggamas', 'Banyumas', 'simpang', -7.455000, 109.285000],
  ['kalibagor', 'Simpang Kalibagor', 'Kalibagor', 'simpang', -7.480000, 109.300000],
  ['karang-lewas', 'Simpang Karang Lewas', 'Karanglewas', 'simpang', -7.420000, 109.200000],
  ['karanglo', 'Simpang Karanglo', 'Banyumas', 'simpang', -7.395000, 109.280000],
  ['ajibarang', 'Simpang Ajibarang', 'Ajibarang', 'simpang', -7.410000, 109.090000],
  ['purwanegara', 'Simpang Purwanegara', 'Purwokerto Utara', 'simpang', -7.386000, 109.245000],
  ['sangkal-putung', 'Simpang Sangkal Putung', 'Purwokerto', 'simpang', -7.430000, 109.250000],
].map(([id, name, area, kind, lat, lng]) => ({
  id,
  name,
  area,
  kind,
  lat,
  lng,
  stream: stream(id, kind),
}));

function Player({ camera, onStatus }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const retryRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !camera) return;

    let cancelled = false;
    onStatus('connecting');

    const destroy = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    const start = () => {
      if (cancelled) return;
      destroy();
      onStatus('connecting');

      if (Hls.isSupported()) {
        const hls = new Hls({
          lowLatencyMode: true,
          liveSyncDurationCount: 2,
          liveMaxLatencyDurationCount: 4,
          maxBufferLength: 4,
          maxMaxBufferLength: 8,
          backBufferLength: 0,
          capLevelToPlayerSize: true,
          enableWorker: true,
        });

        hlsRef.current = hls;
        hls.loadSource(camera.stream);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (cancelled) return;
          onStatus('live');
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data?.fatal || cancelled) return;
          onStatus('error');
          destroy();
          retryRef.current = window.setTimeout(start, 1500);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = camera.stream;
        video.addEventListener(
          'loadedmetadata',
          () => {
            if (cancelled) return;
            onStatus('live');
            video.play().catch(() => {});
          },
          { once: true },
        );
      } else {
        onStatus('unsupported');
      }
    };

    start();

    return () => {
      cancelled = true;
      window.clearTimeout(retryRef.current);
      destroy();
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [camera, onStatus]);

  return (
    <div className="player-shell">
      <video ref={videoRef} className="player" controls playsInline muted />
      <div className="player-grid" />
    </div>
  );
}

function CameraMap({ cameras, selected, onSelect }) {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(null);

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;

    const map = L.map(mapNodeRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
    }).setView([-7.425, 109.245], 13);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = markersRef.current;
    if (!layer) return;
    layer.clearLayers();

    cameras.forEach((camera) => {
      const marker = L.marker([camera.lat, camera.lng], {
        icon: L.divIcon({
          className: `camera-pin ${selected.id === camera.id ? 'active' : ''}`,
          html: '<span></span>',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
      });

      marker.bindPopup(
        `<strong>${camera.name}</strong><br><small>${camera.area}</small>`,
        { closeButton: false, offset: [0, -6] },
      );
      marker.on('click', () => onSelect(camera));
      marker.addTo(layer);
    });
  }, [cameras, selected.id, onSelect]);

  useEffect(() => {
    if (!mapRef.current || !selected) return;
    mapRef.current.flyTo([selected.lat, selected.lng], Math.max(mapRef.current.getZoom(), 14), {
      duration: 0.6,
    });
  }, [selected]);

  return <div ref={mapNodeRef} className="camera-map" aria-label="Peta lokasi kamera CCTV" />;
}

export default function App() {
  const [selected, setSelected] = useState(CAMERAS.find((camera) => camera.id === 'karang-bawang') ?? CAMERAS[0]);
  const [status, setStatus] = useState('connecting');
  const [query, setQuery] = useState('');

  const handleSelect = (camera) => {
    setSelected(camera);
    setStatus('connecting');
    window.setTimeout(() => {
      document.getElementById('live-camera')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const filtered = CAMERAS.filter((camera) =>
    `${camera.name} ${camera.area}`.toLowerCase().includes(query.toLowerCase()),
  );

  const statusLabel = {
    connecting: 'CONNECTING',
    live: 'LIVE',
    error: 'OFFLINE / RETRYING',
    unsupported: 'UNSUPPORTED',
  }[status];

  return (
    <main>
      <nav className="nav container">
        <a className="brand" href="/" aria-label="PWT ATCS home">
          <span className="brand-mark">◉</span>
          <span>
            <strong>PWT ATCS</strong>
            <small>PURWOKERTO TRAFFIC</small>
          </span>
        </a>
        <div className="nav-note">LIVE CCTV · BANYUMAS</div>
      </nav>

      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">PWTDEV / TRAFFIC</span>
          <h1>PANTAU.<br /><em>JALAN.</em><br />LANGSUNG.</h1>
          <p>Live CCTV lalu lintas Purwokerto & Banyumas dari feed publik ATCS. Dibuat supaya akses kamera terasa cepat, simpel, dan nyaman.</p>
          <div className="hero-meta"><span>● DIRECT STREAM</span><span>LOW-LATENCY HLS</span><span>{CAMERAS.length} CAMERA POINTS</span></div>
        </div>

        <div className="hero-dino" aria-hidden="true">
          <div className="dino-eye" />
          <div className="dino-mouth" />
          <span>ATCS</span>
        </div>
      </section>

      <section className="map-section container">
        <div className="section-head map-head">
          <div>
            <span className="eyebrow">CAMERA MAP</span>
            <h2>Pilih titik dari peta</h2>
            <p>Marker kuning = lokasi CCTV yang tersedia di viewer.</p>
          </div>
          <span className="map-count"><b>{CAMERAS.length}</b> titik</span>
        </div>
        <div className="map-card">
          <CameraMap cameras={CAMERAS} selected={selected} onSelect={handleSelect} />
        </div>
      </section>

      <section className="viewer container" id="live-camera">
        <div className="section-head">
          <div>
            <span className="eyebrow">LIVE CAMERA</span>
            <h2>{selected.name}</h2>
            <p>{selected.area}</p>
          </div>
          <span className={`status status-${status}`}><i /> {statusLabel}</span>
        </div>

        <div className="viewer-grid">
          <div className="video-card">
            <Player camera={selected} onStatus={setStatus} />
            <div className="video-footer"><span>Source: ATCS Banyumas</span><span>Direct HLS</span></div>
          </div>

          <aside className="camera-list">
            <div className="list-top">
              <div><span className="eyebrow">CAMERAS</span><h3>Lokasi</h3></div>
              <span className="count">{CAMERAS.length}</span>
            </div>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari kamera..." aria-label="Cari kamera" />
            <div className="camera-buttons">
              {filtered.map((camera) => (
                <button key={camera.id} className={selected.id === camera.id ? 'selected' : ''} onClick={() => handleSelect(camera)}>
                  <span className="camera-dot" />
                  <span><strong>{camera.name}</strong><small>{camera.area}</small></span>
                  <b>↗</b>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <div className="ticker" aria-hidden="true"><span>LIVE TRAFFIC</span><b>•</b><span>PURWOKERTO</span><b>•</b><span>BANYUMAS</span><b>•</b><span>BUILD · LEARN · CREATE</span><b>•</b><span>LIVE TRAFFIC</span></div>

      <footer className="footer container"><span>© {new Date().getFullYear()} PWTDEV</span><span>Viewer for publicly published ATCS CCTV feeds.</span></footer>
    </main>
  );
}