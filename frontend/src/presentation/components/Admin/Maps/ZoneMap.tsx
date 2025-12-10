import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Zone } from "../../../../domain/types/Zone";

// Fix Leaflet icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface ZoneMapProps {
  existingZones: Zone[];
  isDrawing: boolean;
  initialPoints?: { lat: number; lng: number }[];
  onPolygonComplete: (coords: { lat: number; lng: number }[]) => void;
  // ✅ NEW: Callback for live updates (dragging)
  onPointsChange?: (coords: { lat: number; lng: number }[]) => void;
}

const DrawingController: React.FC<{
  isDrawing: boolean;
  onAddPoint: (lat: number, lng: number) => void;
}> = ({ isDrawing, onAddPoint }) => {
  useMapEvents({
    click(e) {
      if (!isDrawing) return;
      onAddPoint(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const ZoneMap: React.FC<ZoneMapProps> = ({ 
  existingZones, 
  isDrawing, 
  initialPoints, 
  onPolygonComplete,
  onPointsChange 
}) => {
  const [drawPoints, setDrawPoints] = useState<{ lat: number; lng: number }[]>([]);

  useEffect(() => {
    if (isDrawing && initialPoints && initialPoints.length > 0) {
      setDrawPoints(initialPoints);
    } else if (!isDrawing) {
      setDrawPoints([]);
    }
  }, [isDrawing, initialPoints]);

  const handleAddPoint = (lat: number, lng: number) => {
    // Logic to close the loop only if it's a NEW drawing (not editing an existing full shape)
    // If we are editing, we usually just want to adjust points, but adding points is also allowed.
    if (drawPoints.length > 2) {
      const first = drawPoints[0];
      const distance = Math.sqrt(Math.pow(first.lat - lat, 2) + Math.pow(first.lng - lng, 2));
      if (distance < 0.001) {
        onPolygonComplete(drawPoints);
        return;
      }
    }
    
    const newPoints = [...drawPoints, { lat, lng }];
    setDrawPoints(newPoints);
    if (onPointsChange) onPointsChange(newPoints); // Notify parent
  };

  // ✅ NEW: Handle Dragging
  const handleMarkerDrag = (index: number, lat: number, lng: number) => {
    const newPoints = [...drawPoints];
    newPoints[index] = { lat, lng };
    setDrawPoints(newPoints);
    if (onPointsChange) onPointsChange(newPoints); // Notify parent of move
  };

  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={11}
      className="h-full w-full rounded-lg shadow-inner z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />

      <DrawingController isDrawing={isDrawing} onAddPoint={handleAddPoint} />

      {/* Render Existing Zones */}
      {existingZones.map((zone) => (
        <Polygon
          key={zone.id || zone._id}
          positions={zone.boundaries.map((b) => [b.lat, b.lng])}
          pathOptions={{ color: "purple", fillOpacity: 0.2 }}
        />
      ))}

      {/* Render Active Drawing / Editing */}
      {drawPoints.length > 0 && (
        <>
          {drawPoints.map((p, idx) => (
            <DraggableMarker 
              key={`${idx}-${p.lat}-${p.lng}`} 
              position={p} 
              index={idx}
              isDraggable={isDrawing}
              onDrag={handleMarkerDrag}
            />
          ))}
          <Polyline positions={drawPoints.map((p) => [p.lat, p.lng])} color="blue" />
          <Polygon 
            positions={drawPoints.map((p) => [p.lat, p.lng])} 
            pathOptions={{ color: "blue", fillOpacity: 0.1, dashArray: "5, 5" }} 
          />
        </>
      )}
    </MapContainer>
  );
};

// ✅ Helper Component for Draggable Marker
const DraggableMarker: React.FC<{
  position: { lat: number; lng: number };
  index: number;
  isDraggable: boolean;
  onDrag: (index: number, lat: number, lng: number) => void;
}> = ({ position, index, isDraggable, onDrag }) => {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onDrag(index, lat, lng);
        }
      },
    }),
    [index, onDrag]
  );

  return (
    <Marker
      draggable={isDraggable}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
    />
  );
};

export default ZoneMap;