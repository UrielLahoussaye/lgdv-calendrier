import { useEffect, useRef, useState } from 'react';
import useGoogleMaps from '../../hooks/useGoogleMaps';
import './Maps.css';

function LocationSearchInput({ onLocationSelect }) {
  const { isLoaded, error } = useGoogleMaps();
  const [value, setValue] = useState('');
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.places?.Autocomplete || !inputRef.current || autocompleteRef.current) {
      return;
    }

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'fr' },
        fields: ['address_components', 'geometry', 'formatted_address', 'place_id'],
      });

      const listener = autocompleteRef.current.addListener('place_changed', () => {
        try {
          const place = autocompleteRef.current.getPlace();
          if (!place.geometry) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const location = {
            address: place.formatted_address,
            coordinates: { lat, lng }
          };
          
          onLocationSelect(location);
          setValue(place.formatted_address);
        } catch (error) {}
      });

      return () => {
        if (listener) {
          window.google?.maps?.event.removeListener(listener);
        }
        if (autocompleteRef.current) {
          window.google?.maps?.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }
      };
    } catch (error) {}
  }, [isLoaded, onLocationSelect]);

  const handleInputChange = (e) => {
    setValue(e.target.value);
    if (!e.target.value) {
      onLocationSelect(null);
    }
  };

  return (
    <div className="location-search">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={!isLoaded ? "Chargement..." : error ? "Erreur de chargement" : "Entrez une adresse"}
        className="location-input"
        disabled={!isLoaded || error}
      />
    </div>
  );
}

export default LocationSearchInput;
