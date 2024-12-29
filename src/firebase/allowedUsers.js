import { db } from './config';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  updateDoc
} from 'firebase/firestore';

const ALLOWED_USERS_COLLECTION = 'allowedUsers';

// Récupérer tous les utilisateurs autorisés
export const getAllowedUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, ALLOWED_USERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw error;
  }
};

// Vérifier si un email est autorisé
export const isEmailAllowed = async (email) => {
  try {
    const q = query(
      collection(db, ALLOWED_USERS_COLLECTION),
      where("email", "==", email.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    throw error;
  }
};

// Ajouter un nouvel utilisateur autorisé
export const addAllowedUser = async (email, role = 'user') => {
  try {
    const q = query(
      collection(db, ALLOWED_USERS_COLLECTION),
      where("email", "==", email)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error("Cet email est déjà autorisé");
    }

    const newUserRef = doc(collection(db, ALLOWED_USERS_COLLECTION));
    await setDoc(newUserRef, {
      email: email.toLowerCase(),
      role: role,
      createdAt: new Date()
    });
    
    return newUserRef.id;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur:", error);
    throw error;
  }
};

// Mettre à jour le rôle d'un utilisateur
export const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, ALLOWED_USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    throw error;
  }
};

// Supprimer un utilisateur autorisé
export const deleteAllowedUser = async (userId) => {
  try {
    await deleteDoc(doc(db, ALLOWED_USERS_COLLECTION, userId));
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    throw error;
  }
};
