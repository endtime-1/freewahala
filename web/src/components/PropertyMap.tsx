'use client';

import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { useState, useCallback, useMemo } from 'react';
import { Property } from '@/lib/api';

interface PropertyMapProps {
    properties: Property[];
    onPropertySelect: (property: Property) => void;
    selectedProperty?: Property | null;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

// Default center: Accra, Ghana
const DEFAULT_CENTER = {
    lat: 5.6037,
    lng: -0.1870,
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
        },
        {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
        },
    ],
};

export default function PropertyMap({ properties, onPropertySelect, selectedProperty }: PropertyMapProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    });

    const onLoad = useCallback((map: google.maps.Map) => {
        if (properties.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            properties.forEach((property) => {
                if (property.locationLat && property.locationLng) {
                    bounds.extend({
                        lat: Number(property.locationLat),
                        lng: Number(property.locationLng),
                    });
                }
            });
            map.fitBounds(bounds);
        }
        setMap(map);
    }, [properties]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const formatPrice = (price: number) => {
        if (price >= 1000) {
            return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`;
        }
        return price.toString();
    };

    const center = useMemo(() => {
        if (properties.length > 0 && properties[0].locationLat && properties[0].locationLng) {
            return {
                lat: Number(properties[0].locationLat),
                lng: Number(properties[0].locationLng),
            };
        }
        return DEFAULT_CENTER;
    }, [properties]);

    if (loadError) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-100 rounded-2xl">
                <div className="text-center p-8">
                    <div className="text-4xl mb-4">🗺️</div>
                    <p className="text-gray-600 mb-2">Error loading map</p>
                    <p className="text-sm text-gray-500">Please check your API key configuration</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-100 rounded-2xl">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-500">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
        >
            {properties.map((property) => {
                if (!property.locationLat || !property.locationLng) return null;

                const isSelected = selectedProperty?.id === property.id;

                return (
                    <OverlayView
                        key={property.id}
                        position={{
                            lat: Number(property.locationLat),
                            lng: Number(property.locationLng),
                        }}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <button
                            onClick={() => onPropertySelect(property)}
                            className={`map-price-bubble ${isSelected ? 'active' : ''}`}
                            style={{
                                transform: 'translate(-50%, -50%)',
                                position: 'relative',
                                zIndex: isSelected ? 100 : 1,
                            }}
                        >
                            GH₵{formatPrice(property.price)}
                        </button>
                    </OverlayView>
                );
            })}
        </GoogleMap>
    );
}
