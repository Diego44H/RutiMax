import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import { db } from './firebaseConfig';
import { collection, getDocs } from "firebase/firestore";
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const center = [17.9869, -92.9303];
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

const LUGARES_DISPONIBLES = [
  "", 
  "Cárdenas", 
  "Comalcalco", 
  "Cunduacán", 
  "Paraíso",
  "Jalpa de Mendez", 
  "Villahermosa"
];

const LISTA_ORIGENES = LUGARES_DISPONIBLES;
const LISTA_DESTINOS = LUGARES_DISPONIBLES;

// --- Función para asignar colores ---
const getColor = (tipo) => {
  if (tipo === 'Camion') return 'blue';
  if (tipo === 'Combi') return 'green';
  if (tipo === 'Camion/Combi') return 'red';  
  return 'grey';
}

function App() {
  const [loading, setLoading] = useState(true);
  const [todasLasRutas, setTodasLasRutas] = useState([]);
  const [rutasFiltradas, setRutasFiltradas] = useState([]);
  const [selectedOrigen, setSelectedOrigen] = useState("");
  const [selectedDestino, setSelectedDestino] = useState("");
  const [selectedTransporte, setSelectedTransporte] = useState("");

  // Cargar datos
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

  // Filtros
  useEffect(() => {
    if (selectedOrigen && selectedDestino) {
      let filtradas = todasLasRutas.filter(ruta =>
        ruta.origen === selectedOrigen &&
        ruta.destino === selectedDestino
      );

      if (selectedTransporte) {
        filtradas = filtradas.filter(ruta => ruta.tipoTransporte === selectedTransporte);
      }

      setRutasFiltradas(filtradas);
    } else {
      setRutasFiltradas([]);
    }
  }, [selectedOrigen, selectedDestino, selectedTransporte, todasLasRutas]);

  if (loading) {
    return <div>Cargando rutas desde Firebase...</div>;
  }

  return (
    <div className="app-container">

      {/* --- CABECERA --- */}
      <div className="controls-container">
        <header className="app-header">
          <h1>RutiMax</h1>
        </header>

        <h3>Elige tu ruta</h3>

        {/* SELECT ORIGEN */}
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

        {/* SELECT DESTINO */}
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

        {/* --- SELECT TRANSPORTE --- */}
        <div className="select-group">
          <label>Transporte:</label>
          <select
            value={selectedTransporte}
            onChange={e => setSelectedTransporte(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="Camion">Camión</option>
            <option value="Combi">Combi</option>
            <option value="Camion/Combi">Camión/Combi</option>
          </select>
        </div>
      </div>

      {/* --- MAPA --- */}
      <div className="map-container">
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom={true}
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Dibujo de rutas */}
          {rutasFiltradas.map(ruta => {
            try {
              const rawCoords = JSON.parse(ruta.polyline);
              const positions = rawCoords.map(coord => [coord[1], coord[0]]);

              return (
                <Polyline
                  key={ruta.id}
                  positions={positions}
                  color={getColor(ruta.tipoTransporte)}
                  weight={5}
                >
                  <Popup>
                    <div>
                      <h3>{ruta.nombre}</h3>
                      <p><strong>Transporte:</strong> {ruta.tipoTransporte}</p>
                      <p><strong>Costo:</strong> {ruta.costo}</p>
                      <p><strong>Tiempo estimado:</strong> {ruta.tiempoEstimado}</p>
                    </div>
                  </Popup>
                </Polyline>
              );
            } catch (e) {
              console.error("Error al parsear polyline:", ruta.id, e);
              return null;
            }
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
