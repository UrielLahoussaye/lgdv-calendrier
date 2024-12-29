import { db } from './config';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';

// Créer ou mettre à jour le profil utilisateur
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error("Erreur lors de la création du profil:", error);
    throw error;
  }
};

// Récupérer le profil d'un utilisateur
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    throw error;
  }
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    throw error;
  }
};
