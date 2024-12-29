import { useState, useEffect, useRef } from 'react';
import useGoogleMaps from '../../hooks/useGoogleMaps';
import './Maps.css';

const containerStyle = {
  width: '100%',
  height: '400px',
};

// Centre de la France
const FRANCE_CENTER = {
  lat: 46.603354,
  lng: 1.888334
};

function MapComponent({ location, onLocationSelect = null, markers = [] }) {
  const { isLoaded, error } = useGoogleMaps();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const [currentLocation, setCurrentLocation] = useState(location || FRANCE_CENTER);

  // Fonction pour nettoyer les pac-containers
  const cleanupPacContainers = () => {
    const pacContainers = document.querySelectorAll('.pac-container');
    pacContainers.forEach(container => {
      if (container) container.remove();
    });
  };

  // Fonction pour vérifier si les coordonnées sont valides
  const isValidCoordinates = (lat, lng) => {
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  // Fonction pour créer un marqueur avec une infowindow
  const createMarker = (position, event = null) => {
    if (!isValidCoordinates(position.lat, position.lng)) {
      console.warn('Coordonnées invalides pour le marqueur:', position);
      return null;
    }

    const marker = new window.google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      animation: window.google.maps.Animation.DROP
    });

    if (event) {
      const infowindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0;">${event.name}</h3>
            <p style="margin: 0 0 5px 0;">${new Date(event.eventDate).toLocaleDateString('fr-FR')}</p>
            ${event.duration > 1 ? `<p style="margin: 0 0 5px 0;">${event.duration} jours</p>` : ''}
            <p style="margin: 0;">${event.eventType}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infowindow.open(mapInstanceRef.current, marker);
      });
    }

    return marker;
  };

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Nettoyer les anciens pac-containers
    cleanupPacContainers();

    // Initialiser la carte
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: currentLocation,
      zoom: markers.length > 0 ? 6 : 15,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    // Si on a des marqueurs, les afficher
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      const validMarkers = markers.filter(event => {
        const lat = parseFloat(event.latitude);
        const lng = parseFloat(event.longitude);
        return isValidCoordinates(lat, lng);
      });

      markersRef.current = validMarkers.map(event => {
        const position = {
          lat: parseFloat(event.latitude),
          lng: parseFloat(event.longitude)
        };
        bounds.extend(position);
        return createMarker(position, event);
      }).filter(Boolean); // Filtrer les marqueurs null

      if (markersRef.current.length > 0) {
        mapInstanceRef.current.fitBounds(bounds);
      } else {
        // Si aucun marqueur valide, centrer sur la France
        mapInstanceRef.current.setCenter(FRANCE_CENTER);
        mapInstanceRef.current.setZoom(6);
      }
    } else if (location && isValidCoordinates(location.lat, location.lng)) {
      // Si on a une seule position valide
      markersRef.current = [createMarker(location)].filter(Boolean);
    }

    // Initialiser l'autocomplete si on est en mode sélection
    if (onLocationSelect && inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'fr' },
        fields: ['address_components', 'geometry', 'formatted_address']
      });

      const placeChangedListener = autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        mapInstanceRef.current.setCenter(newLocation);
        mapInstanceRef.current.setZoom(15);
        
        // Nettoyer les anciens marqueurs
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        
        const newMarker = createMarker(newLocation);
        if (newMarker) {
          markersRef.current = [newMarker];
        }
        
        setCurrentLocation(newLocation);
        if (onLocationSelect) onLocationSelect(newLocation);
        cleanupPacContainers();
      });

      // Écouter les clics sur la carte si on est en mode sélection
      const clickListener = mapInstanceRef.current.addListener('click', (e) => {
        const newLocation = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };
        
        // Nettoyer les anciens marqueurs
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        
        const newMarker = createMarker(newLocation);
        if (newMarker) {
          markersRef.current = [newMarker];
        }
        
        setCurrentLocation(newLocation);
        if (onLocationSelect) onLocationSelect(newLocation);
        cleanupPacContainers();
      });

      return () => {
        if (placeChangedListener) placeChangedListener.remove();
        if (clickListener) clickListener.remove();
        markersRef.current.forEach(marker => marker.setMap(null));
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
        cleanupPacContainers();
      };
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      cleanupPacContainers();
    };
  }, [isLoaded, location, markers, onLocationSelect]);

  if (error) {
    return <div style={containerStyle}>Erreur lors du chargement de la carte</div>;
  }

  return (
    <div className="map-container">
      {onLocationSelect && inputRef && (
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher une adresse..."
          className="map-search-input"
        />
      )}
      <div ref={mapRef} style={containerStyle} />
    </div>
  );
}

export default MapComponent;
