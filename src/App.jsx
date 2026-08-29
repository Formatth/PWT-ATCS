import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const CAMERAS = [
  {
    id: 'karang-bawang',
    name: 'Simpang Karang Bawang',
    area: 'Purwokerto, Banyumas',
    stream:
      'https://cctv.dev.banyumaskab.go.id/cctv_simpang_karang_bawang/video1_stream.m3u8',
  },
];

function Player({ camera, onStatus }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !camera) return;

    let cancelled = false;
    onStatus('connecting');

    const start = () => {
      if (cancelled) return;

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
          if (data?.fatal) onStatus('error');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = camera.stream;
        video.addEventListener(
          'loadedmetadata',
          () => {
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
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
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

export default function App() {
  const [selected, setSelected] = useState(CAMERAS[0]);
  const [status, setStatus] = useState('connecting');
  const [query, setQuery] = useState('');

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
          <h1>
            PANTAU.
            <br />
            <em>JALAN.</em>
            <br />
            LANGSUNG.
          </h1>
          <p>
            Live CCTV lalu lintas Purwokerto & Banyumas dari feed publik ATCS.
            Dibuat supaya akses kamera terasa cepat, simpel, dan nyaman.
          </p>
          <div className="hero-meta">
            <span>● DIRECT STREAM</span>
            <span>LOW-LATENCY HLS</span>
          </div>
        </div>

        <div className="hero-dino" aria-hidden="true">
          <div className="dino-eye" />
          <div className="dino-mouth" />
          <span>ATCS</span>
        </div>
      </section>

      <section className="viewer container">
        <div className="section-head">
          <div>
            <span className="eyebrow">LIVE CAMERA</span>
            <h2>{selected.name}</h2>
            <p>{selected.area}</p>
          </div>
          <span className={`status status-${status}`}>
            <i /> {statusLabel}
          </span>
        </div>

        <div className="viewer-grid">
          <div className="video-card">
            <Player camera={selected} onStatus={setStatus} />
            <div className="video-footer">
              <span>Source: ATCS Banyumas</span>
              <span>Direct HLS</span>
            </div>
          </div>

          <aside className="camera-list">
            <div className="list-top">
              <div>
                <span className="eyebrow">CAMERAS</span>
                <h3>Lokasi</h3>
              </div>
              <span className="count">{CAMERAS.length}</span>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari kamera..."
              aria-label="Cari kamera"
            />
            <div className="camera-buttons">
              {filtered.map((camera) => (
                <button
                  key={camera.id}
                  className={selected.id === camera.id ? 'selected' : ''}
                  onClick={() => {
                    setSelected(camera);
                    setStatus('connecting');
                  }}
                >
                  <span className="camera-dot" />
                  <span>
                    <strong>{camera.name}</strong>
                    <small>{camera.area}</small>
                  </span>
                  <b>↗</b>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <span>LIVE TRAFFIC</span><b>•</b><span>PURWOKERTO</span><b>•</b>
        <span>BANYUMAS</span><b>•</b><span>BUILD · LEARN · CREATE</span><b>•</b>
        <span>LIVE TRAFFIC</span>
      </div>

      <footer className="footer container">
        <span>© {new Date().getFullYear()} PWTDEV</span>
        <span>Viewer for publicly published ATCS CCTV feeds.</span>
      </footer>
    </main>
  );
}
