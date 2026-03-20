import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import L from 'leaflet';
import { Clock } from 'lucide-react';

// Fix Leaflet icons issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ onLocationFound }) {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      if (onLocationFound) onLocationFound(e.latlng);
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Você está aqui</Popup>
    </Marker>
  );
}

export default function Home() {
  const [lines, setLines] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [etaData, setEtaData] = useState([]);
  const [loadingEta, setLoadingEta] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchStops();
    fetchLines();
  }, []);

  const fetchStops = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stops`);
      if (response.ok) {
        setStops(await response.json());
      }
    } catch (err) {
      console.error("Failed to fetch stops:", err);
    }
  };

  const fetchLines = async () => {
    try {
      const response = await fetch(`${API_URL}/api/lines`);
      if (response.ok) {
        setLines(await response.json());
      }
    } catch (err) {
      console.error("Failed to fetch lines:", err);
    }
  };

  const fetchEta = async (stopId) => {
    setLoadingEta(true);
    try {
      const response = await fetch(`${API_URL}/api/eta?stop_id=${stopId}`);
      if (response.ok) {
        setEtaData(await response.json());
      } else {
        setEtaData([]);
      }
    } catch (err) {
      console.error("Failed to fetch ETA:", err);
      setEtaData([]);
    } finally {
      setLoadingEta(false);
    }
  };

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
    fetchEta(stop.id);
  };

  // Center around Sao Paulo by default
  const defaultCenter = [-23.5505, -46.6333];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      <div className="w-full md:w-3/4 h-1/2 md:h-full relative z-0">
        <MapContainer center={defaultCenter} zoom={13} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          
          {stops.map((stop) => (
            <Marker 
              key={stop.id} 
              position={[stop.latitude, stop.longitude]}
              eventHandlers={{
                click: () => handleStopClick(stop),
              }}
            >
              <Popup>
                <strong>{stop.name}</strong><br/>
                Para previsões, clique aqui ou veja no painel.
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="w-full md:w-1/4 h-1/2 md:h-full bg-white p-4 shadow-lg overflow-y-auto border-t md:border-t-0 md:border-l border-gray-200 z-10 flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Previsões de Chegada</h2>
        
        {!selectedStop ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
            <MapPin className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-center">Selecione um ponto no mapa para ver as previsões dos ônibus.</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-indigo-800">
              <span className="font-semibold block text-sm opacity-70">Ponto Selecionado</span>
              <span className="text-lg font-bold">{selectedStop.name}</span>
            </div>

            {loadingEta ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : etaData.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg text-gray-500">
                Nenhum ônibus reportado recentemente para as linhas deste ponto.
              </div>
            ) : (
              <div className="space-y-3">
                {etaData.map((eta, idx) => (
                  <div key={idx} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-indigo-600 text-white font-bold py-1 px-2 rounded text-sm">
                        {eta.line.line_number}
                      </span>
                      <span className="text-gray-600 font-medium truncate ml-2">
                        {eta.line.name}
                      </span>
                    </div>
                    <div className="flex items-center text-green-600 mt-3 font-semibold text-lg">
                      <Clock className="w-5 h-5 mr-1" />
                      {eta.etaMinutes === 0 ? 'Chegando agora!' : `~${eta.etaMinutes} min`}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Distância: {eta.distanceKm} km
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
