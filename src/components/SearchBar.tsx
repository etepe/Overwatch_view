import { useState, useRef, useEffect, useCallback } from 'react';
import { GlassPanel } from './ui/GlassPanel';
import { useViewStore } from '../stores/viewStore';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const flyTo = useViewStore((s) => s.flyTo);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = (await res.json()) as NominatimResult[];
      setResults(data);
      setIsOpen(data.length > 0);
    } catch {
      setResults([]);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const handleSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    flyTo(lon, lat, 500_000);
    setQuery(result.display_name.split(',')[0] ?? '');
    setIsOpen(false);
    setResults([]);
  };

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', top: 72, left: 16, zIndex: 10, width: 280 }}
    >
      <GlassPanel hover={false}>
        <div style={{ padding: '8px 12px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search location..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 13,
            }}
          />
        </div>
      </GlassPanel>

      {isOpen && results.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <GlassPanel hover={false}>
            <div style={{ padding: '4px 0', maxHeight: 200, overflowY: 'auto' }}>
              {results.map((result) => (
                <button
                  key={result.place_id}
                  type="button"
                  onClick={() => handleSelect(result)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 12,
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-panel-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
