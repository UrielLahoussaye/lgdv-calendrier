import { useState, useEffect, useRef } from 'react';
import useGoogleMaps from '../../hooks/useGoogleMaps';
import './Maps.css';

const containerStyle = {
  width: '100%',
  height: '300px',
  margin: '10px 0'
};

const defaultCenter = {
  lat: 46.603354,
  lng: 1.888334
};

function MapComponent({ location, onLocationSelect = null }) {
  const { isLoaded, error } = useGoogleMaps();
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: location || defaultCenter,
      zoom: location ? 15 : 6,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    if (onLocationSelect) {
      newMap.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        onLocationSelect({ lat, lng });
      });
    }

    setMap(newMap);
  }, [isLoaded, location, onLocationSelect]);

  useEffect(() => {
    if (!map || !location) return;

    map.setCenter(location);
    map.setZoom(15);

    if (marker) {
      marker.setMap(null);
    }

    const newMarker = new window.google.maps.Marker({
      position: location,
      map: map
    });

    setMarker(newMarker);

    return () => {
      if (marker) marker.setMap(null);
    };
  }, [map, location]);

  useEffect(() => {
    return () => {
      if (map) {
        window.google?.maps?.event.clearInstanceListeners(map);
      }
    };
  }, [map]);

  if (error) {
    return <div style={containerStyle}>Erreur lors du chargement de la carte</div>;
  }

  if (!isLoaded) {
    return <div style={containerStyle}>Chargement de la carte...</div>;
  }

  return <div ref={mapRef} style={containerStyle} />;
}

export default MapComponent;
