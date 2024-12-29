import { useState } from 'react';
import { db, storage } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import LocationSearchInput from '../Maps/LocationSearchInput';
import MapComponent from '../Maps/MapComponent';
import { eventTypes } from '../../data/eventTypes';
import './Events.css';

function EventForm({ user, onEventAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    eventDate: '',
    duration: '1',
    location: '',
    latitude: '',
    longitude: '',
    eventType: '',
    description: '',
    contactInfo: '',
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLocationSelect = (location) => {
    if (location) {
      setFormData(prev => ({
        ...prev,
        location: location.address,
        latitude: location.coordinates.lat,
        longitude: location.coordinates.lng
      }));

      setSelectedLocation({
        lat: location.coordinates.lat,
        lng: location.coordinates.lng
      });
    }
  };

  const handleMapClick = (coords) => {
    if (coords) {
      setFormData(prev => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng
      }));
      setSelectedLocation(coords);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';
      if (selectedImage) {
        const imageRef = ref(storage, `events/${Date.now()}_${selectedImage.name}`);
        await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      const eventData = {
        ...formData,
        imageUrl,
        createdAt: serverTimestamp(),
        createdBy: user.email,
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      
      setFormData({
        name: '',
        eventDate: '',
        duration: '1',
        location: '',
        latitude: '',
        longitude: '',
        eventType: '',
        description: '',
        contactInfo: '',
      });
      setSelectedImage(null);
      
      if (onEventAdded) {
        onEventAdded({ id: docRef.id, ...eventData });
      }
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Une erreur s'est produite lors de l'ajout de l'événement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <h2>Ajouter un nouvel événement</h2>
      
      <div className="form-group">
        <label htmlFor="name">Nom de l'événement *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="eventDate">Date de l'événement *</label>
        <input
          type="date"
          id="eventDate"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="duration">Durée (en jours) *</label>
        <input
          type="number"
          id="duration"
          name="duration"
          min="1"
          value={formData.duration}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Lieu *</label>
        <LocationSearchInput onLocationSelect={handleLocationSelect} />
      </div>

      <div className="form-group">
        <MapComponent 
          location={selectedLocation} 
          onLocationSelect={handleMapClick}
        />
      </div>

      <div className="form-row coordinates-display">
        <div className="form-group">
          <label htmlFor="latitude">Latitude</label>
          <input
            type="number"
            step="any"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            required
            disabled
            className="coordinates-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="longitude">Longitude</label>
          <input
            type="number"
            step="any"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            required
            disabled
            className="coordinates-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="eventType">Type d'événement *</label>
        <select
          id="eventType"
          name="eventType"
          value={formData.eventType}
          onChange={handleInputChange}
          required
          className="form-select"
        >
          <option value="">Sélectionnez un type</option>
          {eventTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="contactInfo">Informations de contact *</label>
        <textarea
          id="contactInfo"
          name="contactInfo"
          value={formData.contactInfo}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Image de l'événement</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Ajout en cours...' : 'Ajouter l\'événement'}
      </button>
    </form>
  );
}

export default EventForm;
