import { auth } from './config';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// Configuration pour l'email de connexion
const actionCodeSettings = {
  url: 'http://localhost:5173', // URL de développement local
  handleCodeInApp: true
};

// Envoyer le lien de connexion par email
export const sendLoginLink = async (email) => {
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Sauvegarder l'email dans le localStorage pour la vérification
    window.localStorage.setItem('emailForSignIn', email);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi du lien:", error);
    throw error;
  }
};

// Vérifier si l'URL actuelle est un lien de connexion
export const isLoginLink = (url) => {
  return isSignInWithEmailLink(auth, url);
};

// Compléter le processus de connexion
export const completeSignIn = async (email) => {
  try {
    const result = await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem('emailForSignIn');
    return result.user;
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    throw error;
  }
};

// Déconnexion
export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    throw error;
  }
};

// Observer les changements d'état de l'authentification
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
