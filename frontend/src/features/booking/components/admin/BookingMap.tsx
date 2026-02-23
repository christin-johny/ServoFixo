import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface BookingMapProps {
  lat: number;
  lng: number;
}

const BookingMap: React.FC<BookingMapProps> = ({ lat, lng }) => {
  // Safe check if coordinates are valid numbers
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
        Invalid Coordinates
      </div>
    );
  }

  return (
    <MapContainer 
      center={[lat, lng]} 
      zoom={15} 
      scrollWheelZoom={false} 
      className="w-full h-full z-0" // z-0 ensures it stays behind dropdowns/modals
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>
          Service Location <br />
          Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default BookingMap;