import React, { useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-control-geocoder';
import coordinates from '../admin/coordinates';

// Helper: distance in meters between two lat/lng points (Haversine)
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find minimum distance from a point to any segment of the route
function minDistToRoute(point, routeCoords) {
    let minDist = Infinity;
    for (let i = 0; i < routeCoords.length; i++) {
        const d = haversineDistance(point.latitude, point.longitude, routeCoords[i].lat, routeCoords[i].lng);
        if (d < minDist) minDist = d;
    }
    return minDist;
}

// Custom pothole icon
const potholeIcon = L.divIcon({
    html: `<div style="background:#EF4444;border:2px solid #fff;width:14px;height:14px;border-radius:50%;box-shadow:0 0 6px rgba(239,68,68,0.7);"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const PROXIMITY_THRESHOLD = 500; // meters — potholes within 500m of route are shown

const Routing = ({ startCity, endCity, onPotholesFound }) => {
    const map = useMap();

    React.useEffect(() => {
        if (!map || !startCity || !endCity) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(startCity.lat, startCity.lng),
                L.latLng(endCity.lat, endCity.lng),
            ],
            routeWhileDragging: false,
            geocoder: L.Control.Geocoder.nominatim(),
            createMarker: () => null,
            show: false,
            lineOptions: {
                styles: [{ color: '#2563EB', opacity: 0.85, weight: 5 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0,
            },
        }).addTo(map);

        const markerLayerGroup = L.layerGroup().addTo(map);

        routingControl.on('routesfound', function (e) {
            const route = e.routes[0];
            const routeCoords = route.coordinates;
            const latlngs = routeCoords.map(coord => [coord.lat, coord.lng]);

            // Find potholes near the route
            const nearbyPotholes = coordinates.filter(
                pt => minDistToRoute(pt, routeCoords) <= PROXIMITY_THRESHOLD
            );

            // Clear previous markers
            markerLayerGroup.clearLayers();

            // Add start marker
            L.marker([startCity.lat, startCity.lng], {
                icon: L.divIcon({
                    html: `<div style="background:#059669;border:2px solid #fff;width:18px;height:18px;border-radius:50%;box-shadow:0 0 8px rgba(5,150,105,0.7);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:10px;">S</div>`,
                    className: '',
                    iconSize: [18, 18],
                    iconAnchor: [9, 9],
                }),
            }).addTo(markerLayerGroup).bindPopup('<b>Start</b>');

            // Add end marker
            L.marker([endCity.lat, endCity.lng], {
                icon: L.divIcon({
                    html: `<div style="background:#DC2626;border:2px solid #fff;width:18px;height:18px;border-radius:50%;box-shadow:0 0 8px rgba(220,38,38,0.7);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:10px;">D</div>`,
                    className: '',
                    iconSize: [18, 18],
                    iconAnchor: [9, 9],
                }),
            }).addTo(markerLayerGroup).bindPopup('<b>Destination</b>');

            // Add pothole markers
            nearbyPotholes.forEach(pt => {
                const dist = Math.round(minDistToRoute(pt, routeCoords));
                L.marker([pt.latitude, pt.longitude], { icon: potholeIcon })
                    .addTo(markerLayerGroup)
                    .bindPopup(
                        `<div style="text-align:center;">
                            <b style="color:#EF4444;">⚠ Pothole #${pt.id}</b><br/>
                            <span style="font-size:11px;">${pt.latitude.toFixed(4)}, ${pt.longitude.toFixed(4)}</span><br/>
                            <span style="font-size:11px;color:#666;">${dist}m from route</span>
                        </div>`
                    );
            });

            // Notify parent about pothole count
            if (onPotholesFound) onPotholesFound(nearbyPotholes.length);

            // Fit bounds
            const bounds = L.latLngBounds(latlngs);
            map.fitBounds(bounds, { padding: [30, 30] });
        });

        map.scrollWheelZoom.disable();

        return () => {
            if (map && routingControl) {
                map.removeControl(routingControl);
            }
            markerLayerGroup.clearLayers();
        };
    }, [map, startCity, endCity]);

    return null;
};

const RenderMap = ({ startCity, endCity }) => {
    const [potholeCount, setPotholeCount] = useState(null);

    if (!startCity || !endCity) {
        return <div className="text-center mt-2 p-4 bg-white rounded-md shadow-md">Please select both start and end cities.</div>;
    }

    return (
        <div className="mt-2 p-2 bg-white rounded-md shadow-md">
            {/* Pothole alert banner */}
            {potholeCount !== null && (
                <div className={`flex items-center gap-2 p-3 rounded-lg mb-2 ${potholeCount > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <span className="text-xl">{potholeCount > 0 ? '⚠️' : '✅'}</span>
                    <p className={`text-sm font-medium ${potholeCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {potholeCount > 0
                            ? `${potholeCount} pothole${potholeCount > 1 ? 's' : ''} detected near this route. Drive carefully!`
                            : 'No potholes detected near this route. Safe to drive!'}
                    </p>
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 px-2 py-1 text-xs text-gray-600">
                <span className="flex items-center gap-1"><span style={{display:'inline-block',width:12,height:12,borderRadius:'50%',background:'#059669',border:'2px solid #fff'}}></span> Start</span>
                <span className="flex items-center gap-1"><span style={{display:'inline-block',width:12,height:12,borderRadius:'50%',background:'#DC2626',border:'2px solid #fff'}}></span> Destination</span>
                <span className="flex items-center gap-1"><span style={{display:'inline-block',width:12,height:12,borderRadius:'50%',background:'#EF4444',border:'2px solid #fff'}}></span> Pothole</span>
                <span className="flex items-center gap-1"><span style={{display:'inline-block',width:12,height:4,background:'#2563EB',borderRadius:2}}></span> Route</span>
            </div>

            <div className="w-full z-40 flex justify-center mt-1 p-1">
                <div className="w-full max-w-8xl z-20 h-80 sm:h-72 md:h-96 lg:h-[500px] bg-white shadow-lg rounded-md overflow-hidden">
                    <MapContainer
                        center={[11.0168, 76.9558]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Routing startCity={startCity} endCity={endCity} onPotholesFound={setPotholeCount} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default RenderMap;
