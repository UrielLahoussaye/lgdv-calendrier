import { db } from './config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

// Collection name
const EVENTS_COLLECTION = 'events';

// Add a new event
export const addEvent = async (eventData) => {
  try {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding event: ", error);
    throw error;
  }
};

// Get all events
export const getAllEvents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting events: ", error);
    throw error;
  }
};

// Update an event
export const updateEvent = async (eventId, eventData) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, eventData);
  } catch (error) {
    console.error("Error updating event: ", error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error("Error deleting event: ", error);
    throw error;
  }
};

// Get events by category
export const getEventsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting events by category: ", error);
    throw error;
  }
};
