import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, MapPin, Save, Search, Loader2, AlertCircle, Crosshair, User, Smartphone, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { getZoneByLocation } from '../../../../infrastructure/repositories/customer/customerRepository';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const RecenterMap = ({ position }: { position: L.LatLng }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 17);
  }, [position, map]);
  return null;
};

const LocationMarker = ({ position, setPosition, onDragEnd }: { position: L.LatLng, setPosition: (pos: L.LatLng) => void, onDragEnd: () => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onDragEnd();
    },
  });

  return (
    <Marker
      position={position}
      icon={DefaultIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          setPosition(e.target.getLatLng());
          onDragEnd();
        },
      }}
    />
  );
};

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: unknown) => Promise<void>;
  initialData?: unknown;
  isLoading?: boolean;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const isLocked = useRef(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tag: 'Home',
    houseNumber: '',
    street: '',
    landmark: '',
    city: '',
    pincode: '',
    state: '',
    lat: 12.9716,
    lng: 77.5946,
    isDefault: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<unknown[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [serviceZone, setServiceZone] = useState<string | null>(null);
  const [mapPosition, setMapPosition] = useState<L.LatLng>(new L.LatLng(formData.lat, formData.lng));

  const handleLocateMe = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setIsLocating(true);
    isLocked.current = false;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
        setMapPosition(newPos);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (res: any) => {
    isLocked.current = false;
    const newPos = new L.LatLng(parseFloat(res.lat), parseFloat(res.lon));
    setMapPosition(newPos);
    setSearchResults([]);
    setSearchQuery(res.display_name);

    setFormData(prev => ({
      ...prev,
      street: res.address?.road || res.address?.suburb || '',
      city: res.address?.city || res.address?.town || '',
      state: res.address?.state || '',
      pincode: res.address?.postcode || ''
    }));
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (isLocked.current) return;

    setIsFetchingDetails(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'ServoFixo-App-Final'
          }
        }
      );
      const data = await res.json();

      if (data && data.address) {
        const addr = data.address;
        setFormData(prev => ({
          ...prev,
          street: addr.road || addr.suburb || addr.neighbourhood || '',
          city: addr.city || addr.town || addr.village || '',
          state: addr.state || '',
          pincode: addr.postcode || '',
        }));
      }
    } catch (error) {
      console.error("Auto-fill request failed", error);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  useEffect(() => {
    const sync = async () => {
      const zone = await getZoneByLocation(mapPosition.lat, mapPosition.lng);
      setServiceZone(zone);
      setFormData(prev => ({ ...prev, lat: mapPosition.lat, lng: mapPosition.lng }));

      if (!isLocked.current) {
        await reverseGeocode(mapPosition.lat, mapPosition.lng);
      }
    };

    if (isOpen) {
      const timer = setTimeout(sync, 800);
      return () => clearTimeout(timer);
    }
  }, [mapPosition, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData && initialData.location?.coordinates) {
        const [lng, lat] = initialData.location.coordinates;
        const pos = new L.LatLng(lat, lng);

        isLocked.current = true;
        setMapPosition(pos);

        setFormData({
          name: initialData.name || '',
          phone: initialData.phone || '',
          tag: initialData.tag || 'Home',
          houseNumber: initialData.houseNumber || '',
          street: initialData.street || '',
          landmark: initialData.landmark || '',
          city: initialData.city || '',
          pincode: initialData.pincode || '',
          state: initialData.state || '',
          lat: lat,
          lng: lng,
          isDefault: initialData.isDefault || false
        });
      } else {
        isLocked.current = false;
        setFormData({
          name: '',
          phone: '',
          tag: 'Home',
          houseNumber: '',
          street: '',
          landmark: '',
          city: '',
          pincode: '',
          state: '',
          lat: 12.9716,
          lng: 77.5946,
          isDefault: false
        });
        setSearchQuery('');
        setSearchResults([]);

        handleLocateMe();
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isOutside = serviceZone?.toLowerCase().includes("outside") || !serviceZone;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-white shrink-0">
          <h3 className="text-lg font-black flex items-center gap-2">
            <MapPin className="text-blue-600" size={20} />
            {initialData ? 'Edit Service Address' : 'Confirm Service Address'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">

          {/* Search & Map */}
          <div className="space-y-3">
            <div className="relative z-[1002]">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text" placeholder="Search for your area..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold ring-1 ring-gray-100 border-none outline-none focus:ring-2 focus:ring-blue-600/20 shadow-sm"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {isSearching && <Loader2 className="absolute right-4 top-3.5 animate-spin text-blue-600" size={18} />}

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border z-[1003] max-h-48 overflow-y-auto">
                  {searchResults.map((res, i) => (
                    <button key={i} onClick={() => selectSearchResult(res)} className="w-full p-4 text-left text-[11px] font-bold text-gray-600 hover:bg-blue-50 border-b last:border-none flex gap-2">
                      <MapPin size={12} className="shrink-0 text-blue-500" /> {res.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-56 w-full rounded-2xl overflow-hidden relative border shadow-inner shrink-0 bg-gray-50">
              <MapContainer center={mapPosition} zoom={17} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker
                  position={mapPosition}
                  setPosition={setMapPosition}
                  onDragEnd={() => { isLocked.current = false; }}
                />
                <RecenterMap position={mapPosition} />
              </MapContainer>

              <button
                onClick={handleLocateMe}
                className="absolute bottom-4 right-4 z-[1000] bg-white p-3 rounded-xl shadow-xl border border-blue-50 text-blue-600 active:scale-90"
              >
                {isLocating ? <Loader2 size={22} className="animate-spin" /> : <Crosshair size={22} strokeWidth={2.5} />}
              </button>

              <div className="absolute bottom-4 left-4 z-[1000]">
                <div className={`px-4 py-2.5 rounded-2xl shadow-lg border backdrop-blur-md flex items-center gap-2 ${isOutside ? 'bg-red-50/90 border-red-200' : 'bg-white/90 border-blue-100'}`}>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isOutside ? 'text-red-600' : 'text-blue-600'}`}>
                    {serviceZone || "Locating..."}
                  </span>
                  {isOutside ? <AlertCircle size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-green-500" />}
                </div>
              </div>
            </div>
          </div>

          {/* Identity & Address Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <input type="text" placeholder="Receiver's Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-bold ring-1 ring-gray-100 border-none outline-none" />
            </div>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <input type="text" placeholder="Contact No" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-bold ring-1 ring-gray-100 border-none outline-none" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2 mb-2">
              {['Home', 'Work', 'Other'].map(t => (
                <button key={t} onClick={() => setFormData({ ...formData, tag: t })} className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all ${formData.tag === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-100'}`}>{t}</button>
              ))}
            </div>
            <input type="text" placeholder="House / Flat No / Floor" className="w-full p-4 bg-gray-50 rounded-xl text-sm font-bold ring-1 ring-gray-100 border-none outline-none" value={formData.houseNumber} onChange={e => setFormData({ ...formData, houseNumber: e.target.value })} />
            <input type="text" placeholder="Street Name" className="w-full p-4 bg-gray-50 rounded-xl text-sm font-bold ring-1 ring-gray-100 border-none outline-none" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="p-4 bg-gray-50 rounded-xl text-sm font-bold ring-1 ring-gray-100 border-none outline-none" />
              <input type="text" placeholder="State" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="p-4 bg-gray-50 rounded-xl text-sm font-bold ring-1 ring-gray-100 border-none outline-none" />
              <input type="text" placeholder="Pincode" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} className="p-4 bg-gray-50 rounded-xl text-sm font-bold ring-1 ring-gray-100 border-none outline-none" />
            </div>
          </div>

          {/* Primary Address Selector */}
          <label className="flex items-center gap-3 cursor-pointer p-1 group select-none">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.isDefault ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white group-hover:border-blue-400'}`}>
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                className="hidden"
              />
              {formData.isDefault && <CheckCircle size={14} className="text-white" />}
            </div>
            <span className={`text-sm font-bold transition-colors ${formData.isDefault ? 'text-blue-600' : 'text-gray-600'}`}>
              Set as primary address
            </span>
          </label>

          <button
            disabled={isLoading || isOutside || !formData.houseNumber || !formData.name || isFetchingDetails}
            onClick={() => {
              const payload = {
                ...formData,
                location: { type: "Point", coordinates: [formData.lng, formData.lat] },
                isServiceable: !isOutside
              };
              onSubmit(payload);
            }}
            className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${isOutside || isFetchingDetails ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 active:scale-95'}`}
          >
            {isFetchingDetails || isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isLoading ? 'Saving...' : isFetchingDetails ? 'Syncing...' : isOutside ? 'Area Not Serviceable' : 'Confirm Address'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;