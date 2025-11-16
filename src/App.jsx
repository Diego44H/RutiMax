import React from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import './App.css'; // Asumiendo que quieres mantener los estilos básicos

// --- Configuración del Mapa ---

// Estilo para el contenedor del mapa
const containerStyle = {
  width: '100vw',
  height: '100vh'
};

// Coordenadas de ejemplo (Centro de Villahermosa)
const center = {
  lat: 17.9869,
  lng: -92.9303
};

// --- Componente Principal ---

function App() {
  // 1. El hook para cargar la API de Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'] // Cargamos 'places' para usarlas después
  });

  // 2. Estado de carga
  if (!isLoaded) {
    return <div>Cargando...</div>;
  }

  // 3. Renderizar el mapa
  return (
    <div className="App">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12} // Un zoom inicial bueno para una ciudad
      >
        {/* Aquí pondremos marcadores y rutas más adelante */}
      </GoogleMap>
    </div>
  );
}

export default App;