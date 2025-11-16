import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css'; // Importa el NUEVO CSS

import { db } from './firebaseConfig';
import { collection, getDocs } from "firebase/firestore";

// --- Configuración del Mapa ---
const center = [17.9869, -92.9303];
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;
// --- Fin de Configuración ---

const LISTA_ORIGENES = ["", "Comalcalco", "Cunduacán", "Paraíso"];
const LISTA_DESTINOS = ["", "Villahermosa", "Tenosique", "Frontera"];

function App() {
  const [loading, setLoading] = useState(true);
  const [todasLasRutas, setTodasLasRutas] = useState([]);
  const [rutasFiltradas, setRutasFiltradas] = useState([]);

  const [selectedOrigen, setSelectedOrigen] = useState("");
  const [selectedDestino, setSelectedDestino] = useState("");

  useEffect(() => {
    const fetchRutas = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "rutas"));
        const rutasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTodasLasRutas(rutasData);
      } catch (error) {
        console.error("Error al cargar rutas desde Firebase:", error);
      }
      setLoading(false);
    };
    fetchRutas();
  }, []);

  useEffect(() => {
    if (selectedOrigen && selectedDestino) {
      const filtradas = todasLasRutas.filter(ruta => {
        return ruta.origen === selectedOrigen && ruta.destino === selectedDestino;
      });
      setRutasFiltradas(filtradas);
    } else {
      setRutasFiltradas([]);
    }
  }, [selectedOrigen, selectedDestino, todasLasRutas]);

  if (loading) {
    return <div>Cargando...</div>
  }

  // Estructura vertical (flex-direction: column)
  return (
    <div className="app-container">



      {/* --- 2. BARRA DE CONTROLES --- */}
      <div className="controls-container">
        {/* --- 1. HEADER --- */}
        <header className="app-header">
          <h1>RutiMax</h1>
        </header>
        <h3>Elige tu ruta</h3>

        <div className="select-group">
          <label>Origen: </label>
          <select
            value={selectedOrigen}
            onChange={e => setSelectedOrigen(e.target.value)}
          >
            {LISTA_ORIGENES.map(origen => (
              <option key={origen} value={origen}>{origen}</option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label>Destino: </label>
          <select
            value={selectedDestino}
            onChange={e => setSelectedDestino(e.target.value)}
          >
            {LISTA_DESTINOS.map(destino => (
              <option key={destino} value={destino}>{destino}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- 3. MAPA (Ocupa el resto del espacio) --- */}
      <div className="map-container">
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom={true}
          className="leaflet-map" // Usa la clase del CSS
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {rutasFiltradas.map(ruta => {
            try {
              const positions_raw = JSON.parse(ruta.polyline);
              const positions = positions_raw.map(coord => [coord[1], coord[0]]);

              return (
                <Polyline
                  key={ruta.id}
                  positions={positions}
                  color="blue"
                  weight={5}
                />
              );
            } catch (e) {
              console.error("Error al parsear la polyline:", ruta.id, e);
              return null;
            }
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;