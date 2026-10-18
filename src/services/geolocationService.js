/**
 * Real-World Geolocation Service
 * Integrates HTML5 Browser Geolocation API, GPS hardware polling,
 * heading calculation, and reverse geocoding via OpenStreetMap.
 */

import { reverseGeocode } from './gisService';

class GeolocationService {
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
    this.subscribers = new Set();
    this.isWatching = false;
  }

  /**
   * Check if Geolocation is supported by the client browser
   */
  isSupported() {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  }

  /**
   * Check permission status: 'granted' | 'prompt' | 'denied'
   */
  async getPermissionStatus() {
    if (typeof window === 'undefined' || !navigator.permissions) {
      return 'prompt';
    }
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch {
      return 'prompt';
    }
  }

  /**
   * Request one-time high-accuracy GPS position
   */
  getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
        ...options,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy || 10),
            heading: position.coords.heading || 0,
            speed: position.coords.speed || 0,
            altitude: position.coords.altitude || null,
            timestamp: position.timestamp || Date.now(),
          };
          this.currentPosition = coords;
          resolve(coords);
        },
        (error) => {
          reject(error);
        },
        defaultOptions
      );
    });
  }

  /**
   * Fetch current GPS location along with human-readable street address
   */
  async getCurrentLocationWithAddress() {
    const coords = await this.getCurrentPosition();
    try {
      const address = await reverseGeocode(coords.lat, coords.lng);
      return {
        ...coords,
        address: address || `GPS Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
      };
    } catch {
      return {
        ...coords,
        address: `GPS Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
      };
    }
  }

  /**
   * Start live GPS tracking for real-world driving/walking telemetry
   */
  startLiveTracking(onPositionUpdate, onError, options = {}) {
    if (!this.isSupported()) {
      if (onError) onError(new Error('Geolocation is not supported.'));
      return () => {};
    }

    if (onPositionUpdate) {
      this.subscribers.add(onPositionUpdate);
    }

    if (!this.isWatching) {
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 2000,
        ...options,
      };

      let prevCoords = null;

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy || 5);
          const speedKmh = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0;

          // Compute heading if hardware gyro/compass is unavailable
          let heading = position.coords.heading;
          if (heading === null || isNaN(heading)) {
            if (prevCoords) {
              const dLat = lat - prevCoords.lat;
              const dLng = lng - prevCoords.lng;
              if (Math.hypot(dLat, dLng) > 0.00005) {
                let deg = (Math.atan2(dLng, dLat) * 180) / Math.PI;
                if (deg < 0) deg += 360;
                heading = Math.round(deg);
              } else {
                heading = prevCoords.heading || 0;
              }
            } else {
              heading = 0;
            }
          }

          const coords = {
            lat,
            lng,
            accuracy,
            heading,
            speedKmh,
            timestamp: position.timestamp || Date.now(),
          };

          prevCoords = coords;
          this.currentPosition = coords;

          // Notify all subscribers
          this.subscribers.forEach((cb) => {
            try {
              cb(coords);
            } catch (err) {
              console.error('GPS subscriber error:', err);
            }
          });
        },
        (err) => {
          console.warn('GPS live tracking warning:', err.message);
          if (onError) onError(err);
        },
        defaultOptions
      );

      this.isWatching = true;
    }

    // Return cleanup unsubscriber function
    return () => {
      if (onPositionUpdate) {
        this.subscribers.delete(onPositionUpdate);
      }
      if (this.subscribers.size === 0 && this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
        this.isWatching = false;
      }
    };
  }

  /**
   * Stop all active GPS tracking listeners
   */
  stopLiveTracking() {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.subscribers.clear();
    this.isWatching = false;
  }
}

export const geoService = new GeolocationService();
