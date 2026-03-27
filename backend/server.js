import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup to allow frontend to communicate
app.use(cors());
app.use(express.json());

// Initialize Supabase Client (Service Role for backend)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Supabase URL and Service Role Key are missing.');
}

// We initialize the client inside a try block to handle undefined keys gracefully
let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Calculation utility for straight-line distance (Haversine formula) in KM
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Routes
app.get('/api/lines', async (req, res) => {
  const mockLines = [
    { id: "1", line_number: "204", name: "Expresso Centro" },
    { id: "2", line_number: "305", name: "Interbairros" },
    { id: "3", line_number: "402", name: "Circular Sul" }
  ];
  try {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase
      .from('bus_lines')
      .select('*')
      .order('line_number', { ascending: true });
      
    if (error) throw error;
    
    if (!data || data.length === 0) return res.json(mockLines);
    res.json(data);
  } catch (err) {
    console.warn("Returning mock lines due to API/DB error:", err.message);
    res.json(mockLines);
  }
});

app.get('/api/stops', async (req, res) => {
  const mockStops = [
    { id: 1, name: "Ponto Capitão Salomão", latitude: -21.1760, longitude: -47.8100 },
    { id: 2, name: "Ponto Moura Lacerda", latitude: -21.1740, longitude: -47.8130 },
    { id: 3, name: "Ponto Amazonas", latitude: -21.1780, longitude: -47.8080 },
    { id: 4, name: "Ponto Silveira Martins", latitude: -21.1720, longitude: -47.8150 }
  ];
  try {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { search } = req.query;
    let query = supabase.from('stops').select('*');
    
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (!data || data.length === 0) return res.json(mockStops);
    res.json(data);
  } catch (err) {
    console.warn("Returning mock stops due to API/DB error:", err.message);
    res.json(mockStops);
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { user_id, line_id, latitude, longitude } = req.body;
    
    if (!user_id || !line_id || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find the closest stop to assign to the report
    const { data: stops, error: stopsError } = await supabase.from('stops').select('*');
    if (stopsError) throw stopsError;
    
    let closestStop = null;
    let minDistance = Infinity;
    
    for (const stop of stops) {
      const dist = getDistanceFromLatLonInKm(latitude, longitude, stop.latitude, stop.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestStop = stop;
      }
    }
    
    // Insert report
    const { data, error } = await supabase
      .from('reports')
      .insert([
        { 
          user_id, 
          line_id, 
          stop_id: closestStop ? closestStop.id : null, 
          latitude, 
          longitude,
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/eta', async (req, res) => {
  try {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { stop_id } = req.query;
    if (!stop_id) return res.status(400).json({ error: 'stop_id is required' });
    
    // Fetch the stop
    const { data: stop, error: stopError } = await supabase
      .from('stops')
      .select('*')
      .eq('id', stop_id)
      .single();
      
    if (stopError || !stop) return res.status(404).json({ error: 'Stop not found' });
    
    // Fetch all lines
    const { data: lines, error: linesError } = await supabase.from('bus_lines').select('*');
    if (linesError) throw linesError;
    
    const etas = [];
    const AVERAGE_SPEED_KMH = 25; // Speed = 25 km/h
    
    // For each line, find the latest report
    for (const line of lines) {
      const { data: latestReport, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('line_id', line.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
        
      if (reportError && reportError.code !== 'PGRST116') {
        // PGRST116 is "No rows found", which is fine - means no report for this line
        throw reportError;
      }
      
      if (latestReport) {
        const distanceKm = getDistanceFromLatLonInKm(
          latestReport.latitude, 
          latestReport.longitude, 
          stop.latitude, 
          stop.longitude
        );
        
        // Time = Distance / Speed. Returns hours.
        const timeHours = distanceKm / AVERAGE_SPEED_KMH;
        const timeMin = Math.round(timeHours * 60);
        
        etas.push({
          line,
          etaMinutes: timeMin,
          distanceKm: distanceKm.toFixed(2),
          lastReportTime: latestReport.timestamp
        });
      }
    }
    
    // Sort by ETA ascending
    etas.sort((a, b) => a.etaMinutes - b.etaMinutes);
    
    res.json(etas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
