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
            const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api');
            const response = await fetch(`${apiBase}/issues/nearby?lat=${lat}&lon=${lng}&radius=15.0`);
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
            const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api');
            const response = await fetch(`${apiBase}/issues/${id}/upvote`, {
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
        return <div className="flex h-screen items-center justify-center bg-[var(--color-bg)] text-[#111111] font-bold tracking-widest uppercase">Loading Map...</div>;
    }

    return (
        <div className="map-container relative" style={{ height: '100vh', width: '100%' }}>
            <MapContainer center={[userLoc.lat, userLoc.lng]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="map-tiles"
                />
                
                <RecenterMap lat={userLoc.lat} lng={userLoc.lng} />

                {/* Current User Location Marker */}
                <Marker position={[userLoc.lat, userLoc.lng]}>
                    <Popup className="custom-popup">
                        <div className="p-1">
                            <strong className="text-sm font-bold text-gray-800">You are here</strong>
                        </div>
                    </Popup>
                </Marker>

                {/* Nearby Issues Markers */}
                {issues.map(issue => (
                    <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
                        <Popup className="custom-popup">
                            <div className="p-2 space-y-2 min-w-[200px]">
                                <h3 className="font-bold text-lg leading-tight text-gray-900">{issue.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md">
                                        {issue.category}
                                    </span>
                                    <button 
                                        onClick={() => handleUpvote(issue.id)}
                                        className="text-xs font-bold text-black bg-[#FFD21F] px-3 py-1.5 rounded-md hover:bg-[#F4C430] transition shadow-md"
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
