import React from "react";
import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ZoneOption } from "../../api/technicianOnboardingRepository";

interface TechnicianZoneSelectMapProps {
  zones: ZoneOption[];
  selectedZoneIds: string[];
  onZoneClick: (zoneId: string) => void;
}

const TechnicianZoneSelectMap: React.FC<TechnicianZoneSelectMapProps> = ({
  zones,
  selectedZoneIds,
  onZoneClick,
}) => {
  return (
    <MapContainer
      center={[12.9716, 77.5946]}   
      zoom={11}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />

      {zones.map((zone) => {
        const isSelected = selectedZoneIds.includes(zone.id);
        const isInactive = !zone.isActive;
 
        const color = isSelected ? "#2563eb" : isInactive ? "#9ca3af" : "#10b981";
        const fillOpacity = isSelected ? 0.5 : 0.2;

        return (
          <Polygon
            key={zone.id}
            positions={zone.boundaries.map((b) => [b.lat, b.lng])}
            pathOptions={{ color, fillOpacity, weight: isSelected ? 3 : 1 }}
            eventHandlers={{ click: () => onZoneClick(zone.id) }}
          >
            <Tooltip sticky direction="top">
              <span className="font-bold text-sm">{zone.name}</span>
              {isInactive && <span className="text-xs block text-gray-500">(Coming Soon)</span>}
            </Tooltip>
          </Polygon>
        );
      })}
    </MapContainer>
  );
};

export default TechnicianZoneSelectMap;