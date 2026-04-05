'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CATEGORIES, INDIA_CENTER, DEFAULT_ZOOM, CategoryKey } from '@/lib/constants';

interface Incident {
  id: string;
  title: string;
  category: CategoryKey;
  subCategory: string;
  severity: string;
  location: string;
  time: string;
  lat: number;
  lng: number;
}

interface MapContainerProps {
  incidents: Incident[];
  activeTab: 'all' | CategoryKey;
  showHeatmap: boolean;
  onIncidentClick?: (incident: Incident) => void;
}

export default function MapContainer({ incidents, activeTab, showHeatmap, onIncidentClick }: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [INDIA_CENTER.lat, INDIA_CENTER.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    // Clean light map tiles (like Kumamap)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when incidents or tab changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    if (markersRef.current) {
      map.removeLayer(markersRef.current);
    }

    const markerGroup = L.layerGroup();

    // Add big bold circle dots (like Kumamap)
    incidents.forEach((incident) => {
      const color = activeTab === 'all'
        ? CATEGORIES[incident.category].color
        : CATEGORIES[activeTab as CategoryKey].color;

      // Big bold dot with white border — Kumamap style
      const marker = L.circleMarker([incident.lat, incident.lng], {
        radius: 10,
        fillColor: color,
        color: '#FFFFFF',
        weight: 3,
        fillOpacity: 0.85,
        opacity: 1,
      });

      // Popup on click
      marker.bindPopup(`
        <div style="min-width: 220px; font-family: Inter, sans-serif; padding: 4px;">
          <div style="font-weight: 700; font-size: 14px; color: #111827; margin-bottom: 4px;">${incident.title}</div>
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">
            <span style="margin-right: 4px;">📍</span>${incident.location}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
            <span style="
              display: inline-flex; align-items: center; gap: 4px;
              padding: 2px 10px; border-radius: 12px;
              background: ${color}15; color: ${color}; font-weight: 600;
            ">${CATEGORIES[incident.category].icon} ${incident.category}</span>
            <span style="color: #9CA3AF;">${incident.time} ago</span>
          </div>
        </div>
      `, { className: 'netra-popup', maxWidth: 280 });

      // Hover effect
      marker.on('mouseover', () => {
        marker.setStyle({ radius: 14, fillOpacity: 1 });
      });
      marker.on('mouseout', () => {
        marker.setStyle({ radius: 10, fillOpacity: 0.85 });
      });

      if (onIncidentClick) {
        marker.on('click', () => onIncidentClick(incident));
      }

      markerGroup.addLayer(marker);
    });

    markerGroup.addTo(map);
    markersRef.current = markerGroup;
  }, [incidents, activeTab, onIncidentClick]);

  // Heatmap layer (purple/pink glow like Kumamap)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (showHeatmap && incidents.length > 0) {
      const heatGroup = L.layerGroup();

      // Group incidents by proximity to create density clusters
      const clusters: { lat: number; lng: number; count: number; color: string }[] = [];
      const processed = new Set<string>();

      incidents.forEach((incident) => {
        const key = `${Math.round(incident.lat * 10) / 10},${Math.round(incident.lng * 10) / 10}`;
        if (!processed.has(key)) {
          processed.add(key);
          const nearby = incidents.filter(i =>
            Math.abs(i.lat - incident.lat) < 0.5 && Math.abs(i.lng - incident.lng) < 0.5
          );
          const color = activeTab === 'all' ? '#7B1FA2' : CATEGORIES[activeTab as CategoryKey].color;
          clusters.push({
            lat: incident.lat,
            lng: incident.lng,
            count: nearby.length,
            color,
          });
        }
      });

      // Draw heatmap circles (purple glow like Kumamap)
      clusters.forEach(({ lat, lng, count, color }) => {
        const radius = Math.min(30000 + count * 15000, 80000);
        L.circle([lat, lng], {
          radius,
          color: 'transparent',
          fillColor: color,
          fillOpacity: Math.min(0.08 + count * 0.04, 0.25),
        }).addTo(heatGroup);
      });

      heatGroup.addTo(map);
      heatLayerRef.current = heatGroup;
    }
  }, [showHeatmap, incidents, activeTab]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}
