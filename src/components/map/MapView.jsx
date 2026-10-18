import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair } from 'lucide-react';

// Component to dynamically pan/zoom map when coordinates change or route bounds update
const MapController = ({ center, zoom, polyline, fitBoundsOnPolyline, onCenterChange }) => {
  const map = useMap();
  const prevPolylineRef = useRef(null);

  // Update center when props change
  useEffect(() => {
    if (center && (!polyline || polyline.length === 0)) {
      map.setView(center, zoom || 14, { animate: true });
    }
  }, [center, zoom, map]);

  // Fit bounds when polyline updates
  useEffect(() => {
    if (fitBoundsOnPolyline && polyline && polyline.length > 1) {
      const bounds = L.latLngBounds(polyline);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
          animate: true,
        });
      }
    }
  }, [polyline, fitBoundsOnPolyline, map]);

  // Ensure Leaflet recalculates viewport to prevent grey/clipped tiles
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 200);
    const t2 = setTimeout(() => map.invalidateSize(), 600);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  // Handle map drag/move end to report center position (useful for "Set Pin on Map" mode)
  useMapEvents({
    moveend: () => {
      if (onCenterChange) {
        const c = map.getCenter();
        onCenterChange([c.lat, c.lng]);
      }
    },
  });

  return null;
};

export const MapView = ({
  center = [28.6139, 77.2090],
  zoom = 14,
  markers = [],
  polyline = null,
  fitBoundsOnPolyline = true,
  onMapClick,
  onCenterChange,
  onLocateMe,
  showCenterCrosshair = false,
  className = '',
  style = {},
  children,
}) => {
  // Fix Leaflet container size invalidation issue
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
        mapRef.current.invalidateSize();
      }
    }, 250);

    let observer = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
          mapRef.current.invalidateSize();
        }
      });
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, []);

  // Tile style: 'osm' | 'esri' | 'esri-gray'
  const [tileStyle, setTileStyle] = React.useState('osm');

  const tileConfigs = {
    'osm': {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    },
    'esri': {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19,
    },
    'esri-gray': {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16,
    },
  };

  const currentTile = tileConfigs[tileStyle] || tileConfigs['osm'];

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ minHeight: '380px', ...style }}
    >
      {/* Map Style Quick Switcher in bottom left */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-uber border border-neutral-200 flex items-center space-x-1.5 text-[11px] font-bold text-neutral-700">
        <span className="text-[10px] text-neutral-400 uppercase tracking-wider mr-1">Style:</span>
        <button
          type="button"
          onClick={() => setTileStyle('osm')}
          className={`px-2 py-0.5 rounded-lg transition ${
            tileStyle === 'osm' ? 'bg-black text-white' : 'hover:bg-neutral-100'
          }`}
        >
          OSM
        </button>
        <button
          type="button"
          onClick={() => setTileStyle('esri')}
          className={`px-2 py-0.5 rounded-lg transition ${
            tileStyle === 'esri' ? 'bg-black text-white' : 'hover:bg-neutral-100'
          }`}
        >
          Esri Road
        </button>
        <button
          type="button"
          onClick={() => setTileStyle('esri-gray')}
          className={`px-2 py-0.5 rounded-lg transition ${
            tileStyle === 'esri-gray' ? 'bg-black text-white' : 'hover:bg-neutral-100'
          }`}
        >
          Minimal Gray
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
        ref={mapRef}
      >
        {/* 100% Free Public Tile Layer (Zero API key, No watermark) */}
        <TileLayer
          key={tileStyle}
          attribution={currentTile.attribution}
          url={currentTile.url}
          maxZoom={currentTile.maxZoom}
        />

        {/* Map Controller for dynamic panning & fitBounds */}
        <MapController
          center={center}
          zoom={zoom}
          polyline={polyline}
          fitBoundsOnPolyline={fitBoundsOnPolyline}
          onCenterChange={onCenterChange}
        />

        {/* Route Polyline (Uber Black with blue glow) */}
        {polyline && polyline.length > 1 && (
          <>
            {/* Glow / Outline layer */}
            <Polyline
              positions={polyline}
              pathOptions={{
                color: '#276EF1',
                weight: 8,
                opacity: 0.4,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Primary Road Line */}
            <Polyline
              positions={polyline}
              pathOptions={{
                color: '#000000',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Render Custom Markers */}
        {markers.map((marker) => {
          if (!marker.position || !marker.position[0] || !marker.position[1]) return null;
          return (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={marker.icon}
              zIndexOffset={marker.zIndexOffset || 100}
              eventHandlers={{
                click: () => {
                  if (marker.onClick) marker.onClick(marker);
                },
              }}
            >
              {marker.popupContent && (
                <Popup className="custom-uber-popup">
                  <div className="p-1 text-xs">{marker.popupContent}</div>
                </Popup>
              )}
            </Marker>
          );
        })}

        {children}
      </MapContainer>

      {/* Floating GPS Live Recenter Button */}
      {onLocateMe && (
        <button
          type="button"
          onClick={onLocateMe}
          className="absolute bottom-6 right-6 z-10 bg-white hover:bg-neutral-100 text-black p-3 rounded-2xl shadow-uber-lg border border-neutral-300 transition-all flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer group"
          title="Center on my live GPS location"
        >
          <Crosshair className="w-5 h-5 text-neutral-800 group-hover:text-emerald-600 transition" />
        </button>
      )}

      {/* Center Pin Crosshair for "Set Location on Map" mode */}
      {showCenterCrosshair && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="flex flex-col items-center transform -translate-y-6 animate-bounce">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-black/20">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="w-1.5 h-4 bg-black rounded-b" />
            <div className="w-4 h-1.5 bg-black/30 rounded-full blur-[1px] mt-0.5" />
          </div>
        </div>
      )}
    </div>
  );
};
