import { useState, useEffect } from 'react';
import { sendLoginLink, isLoginLink, completeSignIn } from '../firebase/authService';
import { createUserProfile } from '../firebase/userService';
import { isEmailAllowed } from '../firebase/allowedUsers';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('initial'); // 'initial', 'sent', 'error'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Vérifier si l'URL actuelle est un lien de connexion
    if (isLoginLink(window.location.href)) {
      const emailFromStorage = window.localStorage.getItem('emailForSignIn');
      if (emailFromStorage) {
        completeSignIn(emailFromStorage)
          .then((user) => {
            return createUserProfile(user.uid, {
              email: user.email,
              lastLogin: new Date()
            });
          })
          .catch((error) => {
            setError(error.message);
            setStatus('error');
          });
      } else {
        setError("Veuillez saisir à nouveau votre email pour compléter la connexion.");
        setStatus('error');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('initial');
    setIsLoading(true);
    
    try {
      // Vérifier si l'email est autorisé
      const isAllowed = await isEmailAllowed(email);
      
      if (!isAllowed) {
        setError("Cet email n'est pas autorisé à se connecter. Veuillez contacter l'administrateur.");
        setStatus('error');
        setIsLoading(false);
        return;
      }

      await sendLoginLink(email);
      setStatus('sent');
    } catch (error) {
      setError(error.message);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Connexion à LGDV Événements</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {status === 'sent' ? (
          <div className="success-message">
            <p>Un lien de connexion a été envoyé à {email}.</p>
            <p>Veuillez vérifier votre boîte de réception et cliquer sur le lien pour vous connecter.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Vérification...' : 'Recevoir le lien de connexion'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
