'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CATEGORIES, CategoryKey } from '@/lib/constants';

// Dense realistic incident data across India
const HERO_INCIDENTS: { lat: number; lng: number; category: CategoryKey }[] = [
  // Delhi NCR cluster (dense)
  { lat: 28.614, lng: 77.209, category: 'crime' }, { lat: 28.653, lng: 77.189, category: 'accident' },
  { lat: 28.570, lng: 77.243, category: 'crime' }, { lat: 28.593, lng: 77.219, category: 'animal' },
  { lat: 28.704, lng: 77.102, category: 'accident' }, { lat: 28.549, lng: 77.204, category: 'animal' },
  { lat: 28.633, lng: 77.219, category: 'crime' }, { lat: 28.459, lng: 77.027, category: 'accident' },
  { lat: 28.980, lng: 77.706, category: 'crime' }, { lat: 28.410, lng: 77.310, category: 'animal' },
  // Mumbai cluster (dense)
  { lat: 19.076, lng: 72.877, category: 'crime' }, { lat: 19.136, lng: 72.830, category: 'animal' },
  { lat: 19.018, lng: 72.843, category: 'crime' }, { lat: 19.043, lng: 72.862, category: 'environmental' },
  { lat: 19.054, lng: 72.836, category: 'animal' }, { lat: 19.228, lng: 72.856, category: 'animal' },
  { lat: 19.119, lng: 72.905, category: 'accident' }, { lat: 19.250, lng: 73.208, category: 'crime' },
  { lat: 18.520, lng: 73.856, category: 'accident' }, // Pune
  // Bangalore cluster
  { lat: 12.972, lng: 77.594, category: 'animal' }, { lat: 12.935, lng: 77.624, category: 'animal' },
  { lat: 12.978, lng: 77.641, category: 'environmental' }, { lat: 12.969, lng: 77.749, category: 'accident' },
  { lat: 12.959, lng: 77.697, category: 'crime' },
  // Chennai cluster
  { lat: 13.083, lng: 80.270, category: 'crime' }, { lat: 13.006, lng: 80.257, category: 'animal' },
  { lat: 13.041, lng: 80.234, category: 'accident' }, { lat: 13.120, lng: 80.290, category: 'crime' },
  // Kolkata cluster
  { lat: 22.572, lng: 88.363, category: 'environmental' }, { lat: 22.581, lng: 88.412, category: 'animal' },
  { lat: 22.551, lng: 88.357, category: 'environmental' }, { lat: 22.620, lng: 88.380, category: 'crime' },
  // Hyderabad cluster
  { lat: 17.385, lng: 78.486, category: 'accident' }, { lat: 17.432, lng: 78.407, category: 'accident' },
  { lat: 17.434, lng: 78.503, category: 'crime' }, { lat: 17.360, lng: 78.475, category: 'animal' },
  // Other major cities
  { lat: 26.912, lng: 75.787, category: 'crime' },    // Jaipur
  { lat: 26.985, lng: 75.851, category: 'animal' },
  { lat: 23.259, lng: 77.412, category: 'environmental' }, // Bhopal
  { lat: 21.170, lng: 72.831, category: 'accident' }, // Surat
  { lat: 23.022, lng: 72.571, category: 'animal' },   // Ahmedabad
  { lat: 26.449, lng: 80.331, category: 'accident' }, // Kanpur
  { lat: 25.317, lng: 82.987, category: 'animal' },   // Varanasi
  { lat: 30.733, lng: 76.775, category: 'animal' },   // Chandigarh
  { lat: 21.146, lng: 79.088, category: 'accident' }, // Nagpur
  { lat: 11.016, lng: 76.955, category: 'animal' },   // Coimbatore
  { lat: 25.612, lng: 85.144, category: 'crime' },    // Patna
  { lat: 26.846, lng: 80.946, category: 'accident' }, // Lucknow
  { lat: 9.931, lng: 76.267, category: 'environmental' }, // Kochi
  { lat: 15.491, lng: 73.818, category: 'environmental' }, // Goa
  { lat: 32.219, lng: 76.323, category: 'animal' },   // Dharamshala
  { lat: 27.176, lng: 78.008, category: 'animal' },   // Agra
  { lat: 20.296, lng: 85.824, category: 'environmental' }, // Bhubaneswar
  { lat: 10.790, lng: 78.704, category: 'animal' },   // Trichy
  { lat: 24.585, lng: 73.712, category: 'animal' },   // Udaipur
  { lat: 22.719, lng: 75.857, category: 'crime' },    // Indore
  { lat: 26.144, lng: 91.736, category: 'environmental' }, // Guwahati
  { lat: 17.686, lng: 83.218, category: 'environmental' }, // Vizag
  { lat: 31.105, lng: 77.173, category: 'environmental' }, // Shimla
  { lat: 11.685, lng: 76.132, category: 'animal' },   // Wayanad
  { lat: 8.524, lng: 76.937, category: 'animal' },    // Thiruvananthapuram
  { lat: 15.317, lng: 75.714, category: 'accident' }, // Hubli
  { lat: 10.089, lng: 77.060, category: 'animal' },   // Munnar
  { lat: 27.041, lng: 88.266, category: 'environmental' }, // Darjeeling
  { lat: 34.083, lng: 74.797, category: 'environmental' }, // Srinagar
  { lat: 22.310, lng: 73.181, category: 'environmental' }, // Vadodara
  { lat: 29.945, lng: 78.164, category: 'environmental' }, // Dehradun
  { lat: 25.435, lng: 81.846, category: 'crime' },    // Prayagraj
  { lat: 23.810, lng: 91.276, category: 'environmental' }, // Agartala
  { lat: 25.578, lng: 91.880, category: 'environmental' }, // Shillong
  { lat: 19.877, lng: 75.343, category: 'accident' }, // Aurangabad
  { lat: 16.705, lng: 74.243, category: 'environmental' }, // Kolhapur
  { lat: 14.680, lng: 77.600, category: 'animal' },   // Anantapur
];

export default function HeroMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Center and zoom to show all of India properly
    const map = L.map(containerRef.current, {
      center: [22.5, 79.5],  // Better center for full India view
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      minZoom: 4,
      maxZoom: 5,
    });

    // Clean light tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Fit bounds to show entire India
    map.fitBounds([
      [6.5, 68.0],   // Southwest (Kerala/Kanyakumari)
      [35.5, 97.5],  // Northeast (Kashmir/Arunachal)
    ], { padding: [10, 10] });

    // Heatmap glow circles for dense areas
    const densityCenters = [
      { lat: 28.614, lng: 77.209, r: 60000, color: '#7B1FA2' },  // Delhi
      { lat: 19.076, lng: 72.877, r: 55000, color: '#E53935' },  // Mumbai
      { lat: 12.972, lng: 77.594, r: 40000, color: '#E53935' },  // Bangalore
      { lat: 22.572, lng: 88.363, r: 35000, color: '#2E7D32' },  // Kolkata
      { lat: 13.083, lng: 80.270, r: 35000, color: '#1565C0' },  // Chennai
      { lat: 17.385, lng: 78.486, r: 35000, color: '#7B1FA2' },  // Hyderabad
      { lat: 26.846, lng: 80.946, r: 30000, color: '#E53935' },  // Lucknow
    ];

    densityCenters.forEach(({ lat, lng, r, color }) => {
      L.circle([lat, lng], {
        radius: r,
        color: 'transparent',
        fillColor: color,
        fillOpacity: 0.15,
      }).addTo(map);
    });

    // Bold dots like Kumamap
    HERO_INCIDENTS.forEach(({ lat, lng, category }) => {
      const color = CATEGORIES[category].color;
      L.circleMarker([lat, lng], {
        radius: 6,
        fillColor: color,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9,
      }).addTo(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px] rounded-2xl"
      style={{ cursor: 'default' }}
    />
  );
}
