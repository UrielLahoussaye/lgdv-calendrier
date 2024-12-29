import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import EventForm from './EventForm';
import MapComponent from '../Maps/MapComponent';
import './Events.css';

function EventList({ user }) {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          eventDate: new Date(data.eventDate).toLocaleDateString('fr-FR'),
          createdAt: data.createdAt?.toDate().toLocaleDateString('fr-FR') || 'Date inconnue'
        };
      });
      setEvents(eventsList);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (eventId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Une erreur s'est produite lors de la suppression de l'événement.");
      }
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
  };

  const handleEventAdded = (newEvent) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  return (
    <div className="events-container">
      <EventForm user={user} onEventAdded={handleEventAdded} />
      
      <div className="events-list">
        <h2>Événements</h2>
        {events.map(event => (
          <div key={event.id} className="event-card">
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.name} className="event-image" />
            )}
            <div className="event-content">
              <h3>{event.name}</h3>
              <p className="event-date">Date: {event.eventDate}</p>
              <p className="event-duration">Durée: {event.duration} jour{event.duration > 1 ? 's' : ''}</p>
              <p className="event-location">Lieu: {event.location}</p>
              <div className="event-map">
                <MapComponent 
                  location={{ 
                    lat: parseFloat(event.latitude || 0), 
                    lng: parseFloat(event.longitude || 0) 
                  }}
                />
              </div>
              <p className="event-type">Type: {event.eventType}</p>
              <p className="event-description">{event.description}</p>
              <p className="event-contact">Contact: {event.contactInfo}</p>
              <p className="event-coordinates">
                Coordonnées GPS: {event.latitude}, {event.longitude}
              </p>
              <p className="event-meta">
                Ajouté par {event.createdBy} le {event.createdAt}
              </p>
              
              <div className="event-actions">
                <button onClick={() => handleEdit(event)} className="edit-button">
                  Modifier
                </button>
                <button onClick={() => handleDelete(event.id)} className="delete-button">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventList;