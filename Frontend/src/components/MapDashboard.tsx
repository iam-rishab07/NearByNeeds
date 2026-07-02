import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Types
interface Issue {
    id: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    category: string;
    status: string;
    upvotes: number;
}

// Component to recenter map when location changes
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const MapDashboard: React.FC = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [userLoc, setUserLoc] = useState<{ lat: number, lng: number } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // 1. Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLoc({ lat, lng });
                    fetchNearbyIssues(lat, lng);
                },
                (error) => {
                    console.error("Error obtaining location", error);
                    // Fallback location (e.g., center of a city)
                    const fallback = { lat: 40.7128, lng: -74.0060 }; // NYC
                    setUserLoc(fallback);
                    fetchNearbyIssues(fallback.lat, fallback.lng);
                }
            );
        }
    }, []);

    const fetchNearbyIssues = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`http://localhost:8080/api/issues/nearby?lat=${lat}&lon=${lng}&radius=15.0`);
            if (response.ok) {
                const data: Issue[] = await response.json();
                setIssues(data);
            }
        } catch (error) {
            console.error("Error fetching issues:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:8080/api/issues/${id}/upvote`, {
                method: 'PATCH'
            });
            if (response.ok) {
                // Update local state to reflect the new upvote count
                setIssues(prevIssues => prevIssues.map(issue => 
                    issue.id === id ? { ...issue, upvotes: issue.upvotes + 1 } : issue
                ));
            }
        } catch (error) {
            console.error("Error upvoting issue:", error);
        }
    };

    if (loading || !userLoc) {
        return <div className="flex h-screen items-center justify-center">Loading Map...</div>;
    }

    return (
        <div className="map-container" style={{ height: '100vh', width: '100%' }}>
            <MapContainer center={[userLoc.lat, userLoc.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <RecenterMap lat={userLoc.lat} lng={userLoc.lng} />

                {/* Current User Location Marker */}
                <Marker position={[userLoc.lat, userLoc.lng]}>
                    <Popup>
                        <strong>You are here</strong>
                    </Popup>
                </Marker>

                {/* Nearby Issues Markers */}
                {issues.map(issue => (
                    <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
                        <Popup>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{issue.title}</h3>
                                <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {issue.category}
                                    </span>
                                    <button 
                                        onClick={() => handleUpvote(issue.id)}
                                        className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                                    >
                                        Upvote ({issue.upvotes})
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapDashboard;
