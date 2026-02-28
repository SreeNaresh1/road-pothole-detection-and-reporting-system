import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import userCoordinates from './userCoordinates';
import coordinates from './coordinates'; // Your pothole coordinates
import 'leaflet/dist/leaflet.css';

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
    return R * c * 1000; // Distance in meters
};

// Custom icons
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const potholeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

function FollowMarker({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.panTo(position, { animate: true, duration: 0.5 });
    }, [position, map]);
    return null;
}

const PotholeMap = () => {
    const [gpsPosition, setGpsPosition] = useState(null);
    const [gpsStatus, setGpsStatus] = useState('detecting');
    const [currentPosition, setCurrentPosition] = useState(userCoordinates[0]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [circleColor, setCircleColor] = useState('green');
    const [sortedCoordinates, setSortedCoordinates] = useState([]);
    const [alertMessage, setAlertMessage] = useState('No potholes nearby');
    const [alertColor, setAlertColor] = useState('bg-green-500');
    const [animating, setAnimating] = useState(true);

    // GPS detection
    useEffect(() => {
        if (!navigator.geolocation) {
            setGpsStatus('denied');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setGpsPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGpsStatus('found');
            },
            () => setGpsStatus('denied'),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }, []);

    // Animation loop
    useEffect(() => {
        if (!animating) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex < userCoordinates.length - 1 ? prevIndex + 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [animating]);

    // Update position and check for nearby potholes
    useEffect(() => {
        const newPosition = userCoordinates[currentIndex];
        setCurrentPosition(newPosition);

        const calculatedCoordinates = coordinates.map(point => {
            const distance = haversineDistance(newPosition.lat, newPosition.lng, point.latitude, point.longitude);
            return { ...point, distance: distance };
        });

        const nearestPoints = calculatedCoordinates.sort((a, b) => a.distance - b.distance).slice(0, 5);
        setSortedCoordinates(nearestPoints);

        const isNearPothole = nearestPoints.some(point => point.distance <= 10);
        setCircleColor(isNearPothole ? 'red' : 'green');

        if (isNearPothole) {
            setAlertMessage('⚠️ Pothole is nearby!');
            setAlertColor('bg-red-500');
        } else {
            setAlertMessage('✅ No potholes nearby');
            setAlertColor('bg-green-500');
        }
    }, [currentIndex]);

    return (
        <div>
            <div className='pt-5 p-3'>
                {/* GPS + Animation Controls */}
                <div className="flex items-center gap-3 mb-2">
                    {gpsStatus === 'found' && (
                        <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm flex-1">
                            📍 Your location detected ({gpsPosition.lat.toFixed(4)}, {gpsPosition.lng.toFixed(4)})
                        </div>
                    )}
                    {gpsStatus === 'denied' && (
                        <div className="bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg text-sm flex-1">
                            📍 Location access denied — showing route animation
                        </div>
                    )}
                    {gpsStatus === 'detecting' && (
                        <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm flex-1">
                            <span className="animate-spin inline-block">📡</span> Detecting location...
                        </div>
                    )}
                    <button
                        onClick={() => setAnimating(!animating)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium text-white ${animating ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                        {animating ? '⏸ Pause' : '▶ Resume'}
                    </button>
                </div>

                <MapContainer center={currentPosition} zoom={15} style={{ height: '500px', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <FollowMarker position={currentPosition} />

                    {/* Animated route marker */}
                    <Marker position={currentPosition} icon={userIcon}>
                        <Popup>🚗 Simulated Position</Popup>
                    </Marker>
                    <Circle center={currentPosition} radius={10} color={circleColor} fillColor={circleColor} fillOpacity={0.4} />

                    {/* User's real GPS position */}
                    {gpsPosition && (
                        <Marker position={[gpsPosition.lat, gpsPosition.lng]}>
                            <Popup>📍 Your Real Location</Popup>
                        </Marker>
                    )}

                    {sortedCoordinates.map((point, index) => (
                        <Marker key={index} position={[point.latitude, point.longitude]} icon={potholeIcon}>
                            <Popup>
                                ⚠️ Nearest Pothole <br />
                                Distance: {point.distance.toFixed(0)}m
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
            <div>
                <div className={`fixed z-50 bottom-4 right-4 p-4 rounded-lg shadow-lg text-white transition-all duration-300 ${alertColor}`}>
                    <p className="font-medium">{alertMessage}</p>
                    <p className="text-xs opacity-80 mt-1">Step {currentIndex + 1} / {userCoordinates.length}</p>
                </div>
            </div>
        </div>
    );
};

export default PotholeMap;
