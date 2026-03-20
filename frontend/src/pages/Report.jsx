import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Report() {
  const [lines, setLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchLines();
    getLocation();
  }, []);

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

  const getLocation = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLine || !userLocation) return;
    
    setSubmitting(true);
    
    // Simulate user id (in a real app, it would be from auth)
    const userId = "anonymous_user_" + Math.floor(Math.random() * 100000);
    
    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          line_id: selectedLine,
          latitude: userLocation.lat,
          longitude: userLocation.lng
        }),
      });
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to submit report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reportado com sucesso!</h2>
        <p className="text-gray-600 mb-6">Obrigado por contribuir para o ÔnibusAgora. Compartilhando a sua localização, você ajuda dezenas de pessoas!</p>
        <p className="text-sm text-indigo-500 font-medium">Redirecionando para o mapa...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-center space-x-3 mb-6">
        <div className="bg-indigo-100 p-3 rounded-full">
          <Bus className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Estou no Ônibus</h1>
      </div>
      
      <p className="text-gray-600 text-center mb-8">
        Selecione a linha que você está utilizando e compartilhe a sua localização para ajudar os outros passageiros que aguardam.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Linha do Ônibus
          </label>
          <select 
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border font-medium outline-none"
            required
          >
            <option value="" disabled>Selecione uma linha...</option>
            {lines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.line_number} - {line.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-gray-500" /> 
              Sua Localização
            </span>
            {locating ? (
              <span className="flex items-center text-xs text-indigo-600 font-medium">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Localizando...
              </span>
            ) : userLocation ? (
              <span className="text-xs text-green-600 flex items-center font-medium">
                <CheckCircle className="w-3 h-3 mr-1" /> Pronta
              </span>
            ) : (
              <button 
                type="button" 
                onClick={getLocation}
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                Tentar novamente
              </button>
            )}
          </div>
          {userLocation ? (
            <div className="text-xs text-gray-500 font-mono">
              Lat: {userLocation.lat.toFixed(5)} <br/> Lng: {userLocation.lng.toFixed(5)}
            </div>
          ) : !locating && (
            <div className="text-xs text-red-500">
              Não foi possível obter sua localização. Precisamos da sua permissão para continuar.
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={!selectedLine || !userLocation || submitting}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando Localização...
            </>
          ) : (
            'Reportar Minha Viagem'
          )}
        </button>
      </form>
    </div>
  );
}
