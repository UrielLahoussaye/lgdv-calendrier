import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import MapComponent from '../Maps/MapComponent';
import styles from './EventList.module.css';
import { eventTypes } from '../../data/eventTypes';

function EventList({ user }) {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Vérifier que les coordonnées sont présentes et valides
        const event = {
          id: doc.id,
          ...data,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude)
        };
        console.log('Event coordinates:', event.latitude, event.longitude);
        eventsData.push(event);
      });
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (eventId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
      } catch (error) {
        console.error("Erreur lors de la suppression de l'événement:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getEventTypeLabel = (value) => {
    const eventType = eventTypes.find(type => type.value === value);
    return eventType ? eventType.label : value;
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
  };

  return (
    <div className={styles.eventListContainer}>
      <div className={styles.mapContainer}>
        <MapComponent 
          markers={events}
        />
      </div>
      
      <div className={styles.eventGrid}>
        {events.map((event) => (
          <article key={event.id} className={styles.eventCard}>
            {event.imageUrl && (
              <img 
                src={event.imageUrl} 
                alt={event.name}
                className={styles.eventImage}
              />
            )}
            <div className={styles.eventContent}>
              <h2 className={styles.eventTitle}>{event.name}</h2>
              <div className={styles.eventDate}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 4h14M4 2v4M12 2v4M1 8h14M1 4v10h14V4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {formatDate(event.eventDate)}
                {event.duration > 1 && ` (${event.duration} jours)`}
              </div>
              <span className={styles.eventType}>
                {getEventTypeLabel(event.eventType)}
              </span>
              <p className={styles.eventDescription}>{event.description}</p>
              <div className={styles.eventFooter}>
                <div className={styles.eventContact}>
                  {event.contactInfo}
                </div>
                <button
                  onClick={() => handleEdit(event)}
                  className={styles.editButton}
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className={styles.deleteButton}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        ))}
        {events.length === 0 && (
          <p className={styles.noEvents}>
            Aucun événement n'a été ajouté pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}

export default EventList;