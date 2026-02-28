import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import coordinates from './coordinates';
import './NearestPointsMap.css';

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
};

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

// Auto-fit map to show user + nearest potholes together
function FitNearestBounds({ userPosition, nearestPoints }) {
    const map = useMap();
    useEffect(() => {
        const allPoints = [[userPosition.latitude, userPosition.longitude]];
        nearestPoints.forEach(p => allPoints.push([p.latitude, p.longitude]));
        if (allPoints.length > 1) {
            const bounds = L.latLngBounds(allPoints);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } else {
            map.setView([userPosition.latitude, userPosition.longitude], 14);
        }
    }, [userPosition, nearestPoints, map]);
    return null;
}

const NearestPointsMap = () => {
    const defaultPosition = { latitude: 11.0168, longitude: 76.9558 }; // Fallback: Coimbatore
    const [userPosition, setUserPosition] = useState(null);
    const [gpsStatus, setGpsStatus] = useState('detecting');
    const [circleColor, setCircleColor] = useState("green");
    const [sortedCoordinates, setSortedCoordinates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Detect GPS location
    useEffect(() => {
        if (!navigator.geolocation) {
            setUserPosition(defaultPosition);
            setGpsStatus('denied');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setGpsStatus('found');
            },
            (err) => {
                console.warn('GPS denied, using default location:', err.message);
                setUserPosition(defaultPosition);
                setGpsStatus('denied');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }, []);

    // Calculate distances and sort the coordinates
    useEffect(() => {
        if (!userPosition) return;

        const calculatedCoordinates = coordinates.map(point => {
            const distance = haversineDistance(userPosition.latitude, userPosition.longitude, point.latitude, point.longitude);
            return {
                ...point,
                distance: distance,
            };
        });

        // Sort by distance and get the nearest 5 points
        const nearestPoints = calculatedCoordinates.sort((a, b) => a.distance - b.distance).slice(0, 5);
        setSortedCoordinates(nearestPoints);

        // Check for nearby points within 50 meters
        const nearbyPoints = nearestPoints.filter(point => point.distance <= 50);
        setCircleColor(nearbyPoints.length > 0 ? "red" : "green");

        setLoading(false);
    }, [userPosition]);


    if (loading || !userPosition) {
        return (
            <div className="pt-5 flex flex-col items-center justify-center h-[500px]">
                <div className="animate-spin text-4xl mb-3">📡</div>
                <p className="text-gray-600">Detecting your location...</p>
            </div>
        );
    }

    return (
        <div className='pt-5' style={{ position: 'relative', height: '500px', width: '100%' }}>
            {/* GPS Status Banner */}
            {gpsStatus === 'denied' && (
                <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg mb-2 text-sm">
                    📍 Location access denied — showing nearest to default (Coimbatore)
                </div>
            )}
            {gpsStatus === 'found' && (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg mb-2 text-sm">
                    📍 Showing 5 nearest potholes to your location ({userPosition.latitude.toFixed(4)}, {userPosition.longitude.toFixed(4)})
                </div>
            )}
            <MapContainer
                center={[userPosition.latitude, userPosition.longitude]}
                zoom={10}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitNearestBounds userPosition={userPosition} nearestPoints={sortedCoordinates} />
                <Marker position={[userPosition.latitude, userPosition.longitude]} icon={userIcon}>
                    <Popup>
                        📍 You Are Here <br /> Latitude: {userPosition.latitude.toFixed(6)}, Longitude: {userPosition.longitude.toFixed(6)}
                    </Popup>
                </Marker>
                <Circle
                    center={[userPosition.latitude, userPosition.longitude]}
                    radius={50}
                    color={circleColor}
                    fillColor={circleColor}
                    fillOpacity={0.1}
                />

                {sortedCoordinates.map((point, index) => (
                    <Marker key={index} position={[point.latitude, point.longitude]} icon={potholeIcon}>
                        <Popup>
                            ⚠️ Nearest Pothole #{index + 1} <br /> Distance: {point.distance.toFixed(0)}m <br /> Lat: {point.latitude}, Lng: {point.longitude}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default NearestPointsMap;
