
import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    const successCallback = (pos: GeolocationPosition) => {
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
      setLoading(false);
    };

    const errorCallback = (err: GeolocationPositionError) => {
      console.warn('Geolocation error:', err);
      // Set a default location (Ho Chi Minh City) if geolocation fails
      setPosition({
        lat: 10.8231,
        lng: 106.6297
      });
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    });
  }, []);

  return { position, loading, error };
}
