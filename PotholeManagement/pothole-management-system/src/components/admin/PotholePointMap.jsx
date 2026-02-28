// PotholePointMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import coordinates from './coordinates';

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom blue icon for user location
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Red icon for pothole markers
const potholeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Auto-fit map to show all markers (user + potholes)
function FitAllBounds({ userPos }) {
    const map = useMap();
    useEffect(() => {
        const allPoints = coordinates.map(p => [p.latitude, p.longitude]);
        if (userPos) allPoints.push(userPos);
        if (allPoints.length > 0) {
            const bounds = L.latLngBounds(allPoints);
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }
    }, [userPos, map]);
    return null;
}

export default function PotholePointMap() {
    const defaultPosition = [11.0168, 76.9558]; // Fallback: Coimbatore
    const [userPos, setUserPos] = useState(null);
    const [gpsStatus, setGpsStatus] = useState('detecting'); // detecting | found | denied

    useEffect(() => {
        if (!navigator.geolocation) {
            setGpsStatus('denied');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserPos([pos.coords.latitude, pos.coords.longitude]);
                setGpsStatus('found');
            },
            (err) => {
                console.warn('GPS denied, using default location:', err.message);
                setGpsStatus('denied');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }, []);

    const mapCenter = userPos || defaultPosition;

    return (
        <div className='pt-5' style={{ height: '500px', width: '100%' }}>
            {/* GPS Status Banner */}
            {gpsStatus === 'detecting' && (
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg mb-2 text-sm flex items-center gap-2">
                    <span className="animate-spin">📡</span> Detecting your device location...
                </div>
            )}
            {gpsStatus === 'denied' && (
                <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg mb-2 text-sm">
                    📍 Location access denied — showing default (Coimbatore)
                </div>
            )}
            {gpsStatus === 'found' && (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg mb-2 text-sm">
                    📍 Showing your current location ({userPos[0].toFixed(4)}, {userPos[1].toFixed(4)})
                </div>
            )}
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitAllBounds userPos={userPos} />
                {/* User location marker */}
                {userPos && (
                    <>
                        <Marker position={userPos} icon={userIcon}>
                            <Popup>📍 Your Location</Popup>
                        </Marker>
                        <Circle center={userPos} radius={200} color="#2563EB" fillColor="#2563EB" fillOpacity={0.08} />
                    </>
                )}
                {coordinates.map((point, index) => (
                    <Marker key={index} position={[point.latitude, point.longitude]} icon={potholeIcon}>
                        <Popup>
                            ⚠️ Pothole location. <br /> Latitude: {point.latitude}, Longitude: {point.longitude}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
