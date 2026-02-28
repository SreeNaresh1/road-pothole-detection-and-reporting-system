import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import potholeCoordinates from '../admin/coordinates';

// Haversine distance in meters
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function minDistToRoute(point, routeCoords) {
    let minDist = Infinity;
    for (let i = 0; i < routeCoords.length; i++) {
        const d = haversineDistance(point.latitude, point.longitude, routeCoords[i].lat, routeCoords[i].lng);
        if (d < minDist) minDist = d;
    }
    return minDist;
}

const potholeIcon = L.divIcon({
    html: `<div style="background:#EF4444;border:2px solid #fff;width:12px;height:12px;border-radius:50%;box-shadow:0 0 6px rgba(239,68,68,0.7);"></div>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

const Routing = ({ startCity, endCity }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(startCity.lat, startCity.lng),
                L.latLng(endCity.lat, endCity.lng),
            ],
            routeWhileDragging: true,
            showAlternatives: true,
            fitSelectedRoutes: true,
            geocoder: L.Control.Geocoder.nominatim(),
            lineOptions: {
                styles: [{ color: '#2563EB', opacity: 0.8, weight: 6 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0,
            },
            altLineOptions: {
                styles: [{ color: '#9CA3AF', opacity: 0.5, weight: 4 }],
            },
        }).addTo(map);

        const markerLayerGroup = L.layerGroup().addTo(map);

        routingControl.on('routesfound', (e) => {
            const route = e.routes[0];
            const routeCoords = route.coordinates;

            // Find potholes near the route
            const nearbyPotholes = potholeCoordinates.filter(
                pt => minDistToRoute(pt, routeCoords) <= 500
            );

            markerLayerGroup.clearLayers();

            nearbyPotholes.forEach(pt => {
                L.marker([pt.latitude, pt.longitude], { icon: potholeIcon })
                    .addTo(markerLayerGroup)
                    .bindPopup(`<b style="color:#EF4444;">⚠ Pothole #${pt.id}</b><br/><span style="font-size:11px;">${pt.latitude.toFixed(4)}, ${pt.longitude.toFixed(4)}</span>`);
            });
        });

        return () => {
            if (map && routingControl) {
                map.removeControl(routingControl);
            }
            markerLayerGroup.clearLayers();
        };
    }, [map, startCity, endCity]);

    return null;
};

const MapRoad = () => {
    const startPoint = { city: 'Gandhipuram', lat: 11.0168, lng: 76.9558 };
    const endPoint = { city: 'Singanallur', lat: 10.9925, lng: 77.0070 };

    return (
        <div className="w-full h-screen">
            <MapContainer
                center={[11.0168, 76.9558]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Routing startCity={startPoint} endCity={endPoint} />
            </MapContainer>
        </div>
    );
};

export default MapRoad;
