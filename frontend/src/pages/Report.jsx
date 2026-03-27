import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Report() {
  const [lines, setLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
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

  const handleToggleShare = async () => {
    if (isSharing) {
        setIsSharing(false);
        return;
    }

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
        setIsSharing(true);
        setTimeout(() => {
          // Keep it on the same page and fade success
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to submit report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedLineObj = lines.find(l => l.id === selectedLine) || null;
  const lineNameDisplay = selectedLineObj ? `${selectedLineObj.line_number} - ${selectedLineObj.name}` : 'Nenhuma linha selecionada';

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen pb-24 md:pb-8 pt-6 px-4 md:px-12 max-w-5xl mx-auto">
      {/* Hero Section: Shared State */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight leading-tight">Compartilhar Viagem</h1>
            <p className="text-on-surface-variant mt-2 max-w-md">Contribua com dados em tempo real para ajudar outros passageiros a planejar suas viagens com mais precisão.</p>
          </div>
          
          {/* Large Clear Toggle Switch + Select Line */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_20px_40px_rgba(13,28,46,0.06)] flex flex-col gap-4 min-w-[320px]">
             <div>
               <label className="block text-sm font-bold text-on-surface mb-2">Linha do Ônibus</label>
               <select 
                 value={selectedLine}
                 onChange={(e) => setSelectedLine(e.target.value)}
                 disabled={isSharing}
                 className="w-full bg-surface-container-low border-none rounded-lg p-3 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
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
             
             <div className="flex items-center justify-between gap-8 mt-2">
               <div>
                  <span className="font-headline font-bold block text-on-surface">Compartilhar Localização</span>
                  {submitting ? (
                    <span className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[14px] animate-spin">refresh</span> Processando...</span>
                  ) : locating ? (
                    <span className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[14px] animate-spin">sync</span> Localizando...</span>
                  ) : userLocation ? (
                    isSharing ? (
                        <span className="text-secondary font-bold text-xs uppercase tracking-widest">Ativo & Contribuindo</span>
                    ) : (
                        <span className="text-primary font-bold text-xs uppercase tracking-widest">Pronta para envio</span>
                    )
                  ) : (
                    <span className="text-error font-bold text-xs uppercase tracking-widest cursor-pointer hover:underline" onClick={getLocation}>Tentar novamente</span>
                  )}
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input 
                   disabled={!selectedLine || !userLocation || submitting}
                   type="checkbox" 
                   checked={isSharing}
                   onChange={handleToggleShare}
                   className="sr-only peer" 
                 />
                 <div className="w-16 h-8 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-7 after:transition-all peer-checked:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"></div>
               </label>
             </div>
             {success && (
                <div className="mt-2 text-sm text-secondary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> Compartilhado com sucesso!
                </div>
             )}
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Map Card */}
        <div className="md:col-span-2 relative h-[400px] md:h-auto min-h-[400px] rounded-3xl overflow-hidden bg-surface-container group flex items-center justify-center">
          {userLocation ? (
              <img alt="Real-time transit map" className="absolute top-0 left-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8SmXCzvLNJ_whIJaDkk2ebRvXNop9N-QzlUemrpCC2pTA_dl1nyN6XGjr5mWu43dby3qgnHt92_NYVZ73rQiLBjTNeLNeIrtb0cHoLcAJxSIz2E7q1cPxDCRls4yxvn6RUNzH95BlY0nXI5C5i_vhhna34xeWBUCuwuwYKvWxz8HOKS75zaAUmGzc1QwQsy7bZ0iwZxIQAIB0Kw9LKjhqGAoTluOvZ8WfXiyvjcaIAymaEJMf98J-kT7ZFxmSXcPCLzBqGYS-SCr4" />
          ) : (
              <span className="material-symbols-outlined text-outline-variant text-[100px] opacity-50 z-10">map</span>
          )}
          
          {/* Floating Map Info */}
          <div className="absolute bottom-6 left-6 right-6 glass-card p-5 rounded-2xl flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container" style={{fontVariationSettings: "'FILL' 1"}}>directions_bus</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Atualmente no</span>
                <span className="font-headline font-extrabold text-xl text-on-surface">{selectedLine ? lineNameDisplay : 'Nenhum'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-black text-secondary uppercase tracking-tighter">Live Tracker</span>
              <div className="flex items-center gap-1 justify-end">
                <span className={`w-2 h-2 rounded-full ${isSharing ? 'bg-secondary animate-pulse' : 'bg-outline-variant'}`}></span>
                <span className="font-headline font-bold text-lg text-on-surface">{isSharing ? 'Ativo' : 'Pausado'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Bento Column */}
        <div className="flex flex-col gap-6">
          {/* Impact Card */}
          <div className="bg-primary text-on-primary p-8 rounded-3xl flex flex-col justify-between aspect-square md:aspect-auto md:flex-1 shadow-lg shadow-primary/30">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-white">volunteer_activism</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-2xl leading-tight mb-2">Você está ajudando dezenas de pessoas!</h3>
              <p className="text-primary-fixed-dim text-sm">Sua localização em tempo real ajuda usuários nas próximas paradas a verem a chegada exata.</p>
            </div>
          </div>
          
          {/* Next Stop Card */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl flex flex-col justify-between aspect-square md:aspect-auto md:flex-1 shadow-[0_20px_40px_rgba(13,28,46,0.04)]">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Frequência da Linha</span>
              <h3 className="font-headline font-black text-3xl text-on-surface leading-none">{selectedLine ? 'Regular' : '--'}</h3>
            </div>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="font-headline font-black text-5xl text-primary tracking-tighter">{selectedLine ? '12' : '--'}</span>
              <span className="font-label font-bold text-xs text-on-surface-variant uppercase">Mins avr.</span>
            </div>
            <div className="mt-6 flex gap-1 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="bg-primary w-2/3 h-full rounded-full"></div>
              <div className="bg-surface-variant w-1/3 h-full rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Crowdsourcing Rewards / Gamification */}
      <section className="mt-12">
        <h2 className="font-headline font-bold text-xl text-on-surface mb-6">Contribuição da Comunidade</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-low p-6 rounded-2xl hover:bg-surface-container-high transition-colors group cursor-pointer">
            <span className="material-symbols-outlined text-tertiary mb-3 group-hover:scale-110 transition-transform block">groups</span>
            <span className="font-headline font-bold text-on-surface block">Lotação</span>
            <span className="text-xs text-on-surface-variant">Reportar lugares</span>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl hover:bg-surface-container-high transition-colors group cursor-pointer">
            <span className="material-symbols-outlined text-blue-600 mb-3 group-hover:scale-110 transition-transform block">ac_unit</span>
            <span className="font-headline font-bold text-on-surface block">Ar Cond/Temp</span>
            <span className="text-xs text-on-surface-variant">Como está o clima?</span>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl hover:bg-surface-container-high transition-colors group cursor-pointer">
            <span className="material-symbols-outlined text-secondary mb-3 group-hover:scale-110 transition-transform block">timer</span>
            <span className="font-headline font-bold text-on-surface block">Atrasos</span>
            <span className="text-xs text-on-surface-variant">Trânsito parado</span>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl hover:bg-surface-container-high transition-colors group cursor-pointer">
            <span className="material-symbols-outlined text-primary mb-3 group-hover:scale-110 transition-transform block">security</span>
            <span className="font-headline font-bold text-on-surface block">Segurança</span>
            <span className="text-xs text-on-surface-variant">Reportar problema</span>
          </div>
        </div>
      </section>
    </div>
  );
}
