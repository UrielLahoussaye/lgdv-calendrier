import { useState, useEffect } from 'react';

let isScriptLoading = false;
let scriptLoadPromise = null;

const loadGoogleMapsScript = () => {
  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  if (isScriptLoading) {
    return new Promise((resolve, reject) => {
      const checkIfLoaded = () => {
        if (window.google?.maps) {
          resolve();
        } else {
          setTimeout(checkIfLoaded, 100);
        }
      };
      checkIfLoaded();
    });
  }

  isScriptLoading = true;
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBaBsm_x4NRAP3YzGkelrcezgImjiTC7Jo&libraries=places`;
    script.async = true;
    script.defer = true;

    script.addEventListener('load', () => {
      isScriptLoading = false;
      resolve();
    });

    script.addEventListener('error', (error) => {
      isScriptLoading = false;
      scriptLoadPromise = null;
      reject(error);
    });

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
};

const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(!!window.google?.maps);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded) {
      loadGoogleMapsScript()
        .then(() => {
          setIsLoaded(true);
        })
        .catch((err) => {
          setError(err);
        });
    }
  }, [isLoaded]);

  return { isLoaded, error };
};

export default useGoogleMaps;
