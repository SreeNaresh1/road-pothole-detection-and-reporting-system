import React, { useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder";
import cities from "./data";
import coordinates from "../admin/coordinates";

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

const Routing = ({ startCity, endCity, onPotholesFound }) => {
    const map = useMap();

    React.useEffect(() => {
        if (!map) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(startCity.lat, startCity.lng),
                L.latLng(endCity.lat, endCity.lng),
            ],
            routeWhileDragging: true,
            geocoder: L.Control.Geocoder.nominatim(),
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

            const nearbyPotholes = coordinates.filter(
                pt => minDistToRoute(pt, routeCoords) <= 500
            );

            markerLayerGroup.clearLayers();

            nearbyPotholes.forEach(pt => {
                L.marker([pt.latitude, pt.longitude], { icon: potholeIcon })
                    .addTo(markerLayerGroup)
                    .bindPopup(`<b style="color:#EF4444;">⚠ Pothole #${pt.id}</b><br/><span style="font-size:11px;">${pt.latitude.toFixed(4)}, ${pt.longitude.toFixed(4)}</span>`);
            });

            if (onPotholesFound) onPotholesFound(nearbyPotholes.length);
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

const MapComponent = () => {
    const [selectedStartCity, setSelectedStartCity] = useState("");
    const [selectedEndCity, setSelectedEndCity] = useState("");
    const [startCity, setStartCity] = useState(null);
    const [endCity, setEndCity] = useState(null);
    const [mapVisible, setMapVisible] = useState(false);
    const [potholeCount, setPotholeCount] = useState(null);

    const findCityCoordinates = (cityName) => {
        const city = cities.find((c) => c.city.toLowerCase() === cityName.toLowerCase());
        if (city) {
            return { lat: parseFloat(city.lat), lng: parseFloat(city.lng) };
        } else {
            alert(`City ${cityName} not found in the predefined list`);
            return null;
        }
    };

    const handleFindRoute = () => {
        const startCoords = findCityCoordinates(selectedStartCity);
        const endCoords = findCityCoordinates(selectedEndCity);

        if (startCoords && endCoords) {
            setStartCity(startCoords);
            setEndCity(endCoords);
            setMapVisible(true);
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center bg-gray-100">
            {/* Form Container */}
            <div className="w-full p-4 bg-gradient-to-r from-emerald-400 to-teal-600 text-white flex flex-col md:flex-row justify-center items-center md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex flex-col w-full md:w-1/2 lg:w-1/3">
                    <select
                        id="startCity"
                        className="rounded-md px-4 py-2 text-black border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                        value={selectedStartCity}
                        onChange={(e) => setSelectedStartCity(e.target.value)}
                    >
                        <option value="" disabled>Select City</option>
                        {cities.map((city) => (
                            <option key={city.city} value={city.city}>{city.city}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col w-full md:w-1/2 lg:w-1/3">
                    <select
                        id="endCity"
                        className="rounded-md px-4 py-2 text-black border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                        value={selectedEndCity}
                        onChange={(e) => setSelectedEndCity(e.target.value)}
                    >
                        <option value="" disabled>Select City</option>
                        {cities.map((city) => (
                            <option key={city.city} value={city.city}>{city.city}</option>
                        ))}
                    </select>
                </div>
                <button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-md m-2 w-full md:w-auto transition duration-150 ease-in-out"
                    onClick={handleFindRoute}
                >
                    Find Route
                </button>
            </div>

            {/* Pothole alert */}
            {mapVisible && potholeCount !== null && (
                <div className={`w-full max-w-6xl mx-auto mt-3 px-4`}>
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${potholeCount > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                        <span className="text-xl">{potholeCount > 0 ? '⚠️' : '✅'}</span>
                        <p className={`text-sm font-medium ${potholeCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
                            {potholeCount > 0
                                ? `${potholeCount} pothole${potholeCount > 1 ? 's' : ''} detected near this route. Drive carefully!`
                                : 'No potholes detected near this route. Safe to drive!'}
                        </p>
                    </div>
                </div>
            )}
        
            {/* Map Container */}
            {mapVisible && (
                <div className="w-full z-40 flex justify-center mt-2 p-2">
                    <div className="w-full max-w-6xl h-80 sm:h-72 md:h-96 lg:h-[500px] bg-white shadow-lg rounded-md overflow-hidden">
                        <MapContainer
                            center={[11.0168, 76.9558]}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {startCity && endCity && (
                                <Routing startCity={startCity} endCity={endCity} onPotholesFound={setPotholeCount} />
                            )}
                        </MapContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
