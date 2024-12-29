import { useState, useMemo } from 'react';
import { db, storage } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MapComponent from '../../components/Maps/MapComponent';
import styles from './FormEvents.module.css';
import { eventTypes } from '../../data/eventTypes';

// Première partie du formulaire
const FormInputsPartOne = ({ formData, handleInputChange }) => (
  <>
    <div className={styles.formGroup}>
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

    <div className={styles.formRow}>
      <div className={styles.formGroup}>
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

      <div className={styles.formGroup}>
        <label htmlFor="duration">Durée (jours) *</label>
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
    </div>
  </>
);

// Deuxième partie du formulaire
const FormInputsPartTwo = ({ formData, handleInputChange, handleImageChange, loading }) => (
  <>
    <div className={`${styles.formRow} ${styles.coordinatesDisplay}`}>
      <div className={styles.formGroup}>
        <label htmlFor="latitude">Latitude</label>
        <input
          type="number"
          id="latitude"
          name="latitude"
          step="any"
          value={formData.latitude}
          onChange={handleInputChange}
          required
          readOnly
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="longitude">Longitude</label>
        <input
          type="number"
          id="longitude"
          name="longitude"
          step="any"
          value={formData.longitude}
          onChange={handleInputChange}
          required
          readOnly
        />
      </div>
    </div>

    <div className={styles.formGroup}>
      <label htmlFor="eventType">Type d'événement *</label>
      <select
        id="eventType"
        name="eventType"
        value={formData.eventType}
        onChange={handleInputChange}
        required
      >
        <option value="">Sélectionnez un type</option>
        {eventTypes.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>

    <div className={styles.formGroup}>
      <label htmlFor="description">Description *</label>
      <textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        required
        placeholder="Une description de l'événement, des règles particulières..."
      />
    </div>

    <div className={styles.formGroup}>
      <label htmlFor="contactInfo">Informations de contact *</label>
      <textarea
        id="contactInfo"
        name="contactInfo"
        value={formData.contactInfo}
        onChange={handleInputChange}
        required
        placeholder="Numéro de téléphone, email, site web..."
      />
    </div>

    <div className={styles.formGroup}>
      <label htmlFor="image">Image</label>
      <input
        type="file"
        id="image"
        name="image"
        onChange={handleImageChange}
        accept="image/*"
      />
    </div>

    <button type="submit" className={styles.submitButton} disabled={loading}>
      {loading ? "Ajout en cours..." : "Ajouter l'événement"}
    </button>
  </>
);

function FormEvents({ user }) {
  const [formData, setFormData] = useState({
    name: '',
    eventDate: '',
    duration: '1',
    latitude: '',
    longitude: '',
    eventType: '',
    description: '',
    contactInfo: '',
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

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
        const storageRef = ref(storage, `events/${selectedImage.name}_${Date.now()}`);
        const uploadResult = await uploadBytes(storageRef, selectedImage);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const eventData = {
        ...formData,
        imageUrl,
        createdAt: serverTimestamp(),
        createdBy: user.email,
      };

      await addDoc(collection(db, 'events'), eventData);

      setFormData({
        name: '',
        eventDate: '',
        duration: '1',
        latitude: '',
        longitude: '',
        eventType: '',
        description: '',
        contactInfo: '',
      });
      setSelectedImage(null);
      setSelectedLocation(null);

      alert("Événement ajouté avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'événement:", error);
      alert("Erreur lors de l'ajout de l'événement");
    }

    setLoading(false);
  };

  // Mémoriser le composant Map pour éviter les re-renders inutiles
  const memoizedMap = useMemo(() => (
    <div className={styles.formGroup}>
      <MapComponent 
        location={selectedLocation} 
        onLocationSelect={handleMapClick}
      />
    </div>
  ), [selectedLocation]);

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <FormInputsPartOne 
        formData={formData}
        handleInputChange={handleInputChange}
      />
      {memoizedMap}
      <FormInputsPartTwo 
        formData={formData}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        loading={loading}
      />
    </form>
  );
}

export default FormEvents;
