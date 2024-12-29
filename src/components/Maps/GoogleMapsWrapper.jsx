import { LoadScript } from '@react-google-maps/api';

const libraries = ["places"];

function GoogleMapsWrapper({ children }) {
  return (
    <LoadScript 
      googleMapsApiKey="AIzaSyBaBsm_x4NRAP3YzGkelrcezgImjiTC7Jo"
      libraries={libraries}
      loadingElement={<div>Chargement de la carte...</div>}
    >
      {children}
    </LoadScript>
  );
}

export default GoogleMapsWrapper;
