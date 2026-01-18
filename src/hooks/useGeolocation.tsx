import { useState, useEffect, useMemo } from "react";

interface GeolocationData {
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = (): GeolocationData => {
  const [location, setLocation] = useState<GeolocationData>({
    city: "Trindade",
    state: "PE",
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: "Geolocalização não suportada pelo navegador"
      }));
      return;
    }

    const success = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // Usando uma API de geocoding reverso gratuita
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`
        );
        
        if (response.ok) {
          const data = await response.json();
          setLocation({
            city: data.city || data.locality || "Cidade não identificada",
            state: data.principalSubdivisionCode?.replace('BR-', '') || "Estado não identificado",
            latitude,
            longitude,
            loading: false,
            error: null,
          });
        } else {
          // Fallback para localização padrão
          setLocation(prev => ({
            ...prev,
            latitude,
            longitude,
            loading: false,
          }));
        }
      } catch (error) {
        console.error("Erro ao obter dados de localização:", error);
        setLocation(prev => ({
          ...prev,
          latitude,
          longitude,
          loading: false,
          error: "Erro ao identificar a cidade"
        }));
      }
    };

    const error = (err: GeolocationPositionError) => {
      console.error("Erro de geolocalização:", err);
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: "Não foi possível obter sua localização"
      }));
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutos
    });
  }, []);

  // Memoizar o retorno para evitar re-renders desnecessários
  const memoizedLocation = useMemo(() => ({
    city: location.city,
    state: location.state,
    latitude: location.latitude,
    longitude: location.longitude,
    loading: location.loading,
    error: location.error,
  }), [location.city, location.state, location.latitude, location.longitude, location.loading, location.error]);

  return memoizedLocation;
};
