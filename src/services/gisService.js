/**
 * GIS Service: 100% Free Open-Source Geocoding, Reverse Geocoding, and OSRM Routing
 * No API Keys required.
 */

// Popular pre-seeded landmarks for instant autocomplete & offline fallback
export const LOCAL_LANDMARKS = [
  // Delhi NCR
  { display_name: 'Connaught Place, New Delhi, Delhi', lat: 28.6315, lon: 77.2167 },
  { display_name: 'India Gate, Rajpath, New Delhi, Delhi', lat: 28.6129, lon: 77.2295 },
  { display_name: 'DLF Cyber City, Tower B, Gurugram, Haryana', lat: 28.4950, lon: 77.0895 },
  { display_name: 'Indira Gandhi International Airport (DEL), Terminal 3, New Delhi', lat: 28.5562, lon: 77.1000 },
  { display_name: 'Hauz Khas Village & Lake, South Delhi', lat: 28.5494, lon: 77.1932 },
  { display_name: 'Sector 18 Market, Noida, Uttar Pradesh', lat: 28.5708, lon: 77.3271 },
  { display_name: 'Qutub Minar, Mehrauli, New Delhi', lat: 28.5244, lon: 77.1855 },
  { display_name: 'Lotus Temple, Kalkaji, New Delhi', lat: 28.5535, lon: 77.2588 },
  { display_name: 'Akshardham Temple, NH 24, New Delhi', lat: 28.6127, lon: 77.2773 },
  // Mumbai
  { display_name: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra', lat: 19.0657, lon: 72.8687 },
  { display_name: 'Chhatrapati Shivaji Maharaj International Airport (BOM), Mumbai', lat: 19.0896, lon: 72.8656 },
  { display_name: 'Gateway of India, Colaba, Mumbai, Maharashtra', lat: 18.9220, lon: 72.8347 },
  { display_name: 'Marine Drive Promenade, Nariman Point, Mumbai', lat: 18.9432, lon: 72.8230 },
  { display_name: 'Powai Lake & Hiranandani Gardens, Mumbai', lat: 19.1197, lon: 72.9051 },
  // Bengaluru
  { display_name: 'Koramangala 5th Block, Bengaluru, Karnataka', lat: 12.9352, lon: 77.6245 },
  { display_name: 'Indiranagar 100ft Road, Bengaluru, Karnataka', lat: 12.9719, lon: 77.6412 },
  { display_name: 'Kempegowda International Airport (BLR), Bengaluru', lat: 13.1986, lon: 77.7066 },
  { display_name: 'Electronic City Phase 1, Hosur Road, Bengaluru', lat: 12.8399, lon: 77.6770 },
  { display_name: 'MG Road Metro Station, Bengaluru, Karnataka', lat: 12.9756, lon: 77.6066 },
];

/**
 * Autocomplete Places search using OpenStreetMap Nominatim with local fallback
 */
export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim().toLowerCase();

  // Try live Nominatim API first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&addressdetails=1&limit=6`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || 'place',
        }));
      }
    }
  } catch (err) {
    // Fall back to local search
    console.warn('Nominatim search API notice, falling back to local database:', err.message);
  }

  // Fallback to local landmarks
  const matched = LOCAL_LANDMARKS.filter((l) =>
    l.display_name.toLowerCase().includes(cleanQuery)
  );

  if (matched.length > 0) {
    return matched.map((m) => ({
      address: m.display_name,
      lat: m.lat,
      lng: m.lon,
      type: 'landmark',
    }));
  }

  // Generic fallback if nothing matches
  return [
    {
      address: `${query} (Central Point)`,
      lat: 28.6139,
      lng: 77.2090,
      type: 'approximate',
    },
  ];
}

/**
 * Reverse Geocoding (lat, lng to readable street address)
 */
export async function reverseGeocode(lat, lng) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding fallback:', err.message);
  }

  // Find nearest local landmark if available
  let nearest = null;
  let minDist = Infinity;
  for (const lm of LOCAL_LANDMARKS) {
    const d = Math.hypot(lm.lat - lat, lm.lon - lng);
    if (d < minDist) {
      minDist = d;
      nearest = lm;
    }
  }

  if (nearest && minDist < 0.05) {
    return `Near ${nearest.display_name}`;
  }

  return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/**
 * Calculate Road-snapped Route using OSRM through multiple waypoints
 * Waypoints format: array of { lat, lng } in travel order: [pickup, ...stops, dropoff]
 */
export async function calculateOSRMRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) return null;

  // Format coords: "lng1,lat1;lng2,lat2;lng3,lat3"
  const coordsParam = waypoints.map((w) => `${w.lng},${w.lat}`).join(';');
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const primaryRoute = data.routes[0];
        
        // GeoJSON coordinates are [lng, lat], convert to Leaflet [lat, lng]
        const polylineCoords = primaryRoute.geometry.coordinates.map(([lng, lat]) => [
          lat,
          lng,
        ]);

        const distanceMeters = primaryRoute.distance; // meters
        const durationSeconds = primaryRoute.duration; // seconds

        const distanceKm = Number((distanceMeters / 1000).toFixed(1));
        const durationMins = Math.max(1, Math.round(durationSeconds / 60));

        return {
          distanceKm,
          durationMins,
          polylineCoords,
          legs: primaryRoute.legs || [],
        };
      }
    }
  } catch (err) {
    console.warn('OSRM router notice, generating geodesic road polyline:', err.message);
  }

  // Resilient fallback: Generate smooth intermediate points between waypoints
  const polylineCoords = [];
  let totalDistKm = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];

    // Compute Haversine distance
    const legDist = calculateHaversineKm(p1.lat, p1.lng, p2.lat, p2.lng) * 1.25; // 1.25 road curvature factor
    totalDistKm += legDist;

    // Subdivide leg into points for smooth line
    const steps = 12;
    for (let s = 0; s <= steps; s++) {
      if (s === 0 && i > 0) continue; // avoid duplicate junction point
      const fraction = s / steps;
      // add slight natural curve
      const curveOffset = Math.sin(fraction * Math.PI) * 0.002;
      const lat = p1.lat + (p2.lat - p1.lat) * fraction + curveOffset;
      const lng = p1.lng + (p2.lng - p1.lng) * fraction - curveOffset;
      polylineCoords.push([lat, lng]);
    }
  }

  const durationMins = Math.max(1, Math.round(totalDistKm * 2.8)); // avg ~22 km/h in city traffic

  return {
    distanceKm: Number(totalDistKm.toFixed(1)),
    durationMins,
    polylineCoords,
    legs: [],
  };
}

/**
 * Haversine formula for distance in kilometers
 */
export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
