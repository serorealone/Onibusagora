import { Link } from 'react-router-dom';
import { Bus, MapPin, AlertTriangle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Bus className="h-8 w-8 text-white" />
              <span className="font-bold text-xl tracking-tight">ÔnibusAgora</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-1 hover:text-indigo-200 transition-colors">
              <MapPin className="h-5 w-5" />
              <span className="hidden sm:inline">Mapa</span>
            </Link>
            <Link to="/report" className="flex items-center space-x-1 bg-white text-indigo-600 px-3 py-1.5 rounded-md font-medium hover:bg-indigo-100 transition-colors">
              <AlertTriangle className="h-5 w-5" />
              <span className="hidden sm:inline">Reportar Ônibus</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
