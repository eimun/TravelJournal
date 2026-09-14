import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * High-performance, interactive OpenStreetMap / Leaflet web map
 * Renders real Bengaluru streets, road networks, landmarks, and route polylines.
 */
export default function WebRoadMap({
  userLocation,
  destination,
  activeRoute,
  activeStepIndex,
  onSelectStep,
}) {
  const mapHtml = useMemo(() => {
    const centerLat = userLocation?.latitude || 12.9716;
    const centerLng = userLocation?.longitude || 77.5946;

    // Extract all route coordinates for polyline and auto-fitting bounds
    const steps = activeRoute?.steps || [];
    const milestones = activeRoute?.milestones || [];

    // Serialize steps and milestones safely into JS
    const serializedSteps = JSON.stringify(
      steps.map((s, idx) => ({
        index: idx,
        type: s.type,
        line: s.line,
        selectedMode: s.selectedMode,
        coordinates: (s.coordinates || []).map((c) => [c.latitude, c.longitude]),
      }))
    );

    const serializedMilestones = JSON.stringify(
      milestones.map((m) => ({
        id: m.id,
        title: m.title || '',
        label: m.label || '',
        type: m.type,
        line: m.line,
        stepIndex: m.stepIndex,
        coords: [m.coordinate?.latitude || 0, m.coordinate?.longitude || 0],
      }))
    );

    const userCoord = userLocation ? [userLocation.latitude, userLocation.longitude] : null;
    const destCoord = destination ? [destination.latitude, destination.longitude] : null;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #f8f6f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .custom-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border-radius: 999px;
      font-weight: 700;
      font-size: 11px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      border: 2px solid #2d3748;
      color: #1a202c;
      white-space: nowrap;
      padding: 2px 6px;
      transform: translate(-50%, -50%);
    }
    .marker-origin {
      background: #2563eb;
      border-color: #ffffff;
      color: #ffffff;
    }
    .marker-dest {
      background: #e11d48;
      border-color: #ffffff;
      color: #ffffff;
    }
    .marker-purple {
      background: #7c3aed;
      border-color: #ffffff;
      color: #ffffff;
    }
    .marker-green {
      background: #16a34a;
      border-color: #ffffff;
      color: #ffffff;
    }
    .marker-user {
      width: 14px;
      height: 14px;
      background: #2563eb;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.35);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.6); }
      70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
      100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
    }
    .leaflet-control-attribution {
      font-size: 9px !important;
      opacity: 0.65;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([${centerLat}, ${centerLng}], 13);

    // High quality OSM street tiles without watermark
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
      subdomains: 'abc'
    }).addTo(map);

    const steps = ${serializedSteps};
    const milestones = ${serializedMilestones};
    const activeStepIdx = ${activeStepIndex !== null ? activeStepIndex : 'null'};
    const allBounds = [];

    // Render Polylines for each step
    steps.forEach((step) => {
      if (!step.coordinates || step.coordinates.length < 2) return;
      const isSelected = activeStepIdx === step.index;
      const isMetro = step.type === 'metro';
      const isAuto = step.type === 'auto' || step.selectedMode === 'auto';
      const isBike = step.selectedMode === 'bike';
      
      let strokeColor = '#d97706'; // default connecting walk
      if (isMetro) {
        strokeColor = step.line === 'green' ? '#16a34a' : '#7c3aed';
      } else if (isAuto) {
        strokeColor = '#0284c7';
      } else if (isBike) {
        strokeColor = '#d97706';
      }

      // Background casing / glow for selected route
      if (isSelected) {
        L.polyline(step.coordinates, {
          color: '#fbbf24',
          weight: 9,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
      }

      // Actual road / rail line
      const poly = L.polyline(step.coordinates, {
        color: strokeColor,
        weight: isMetro ? 5 : 4,
        opacity: 0.95,
        dashArray: (!isMetro && !isAuto && !isBike) ? '6, 6' : undefined,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      step.coordinates.forEach(c => allBounds.push(c));
    });

    // Render Milestone Pins
    milestones.forEach((m) => {
      if (!m.coords || m.coords[0] === 0) return;
      allBounds.push(m.coords);

      let badgeClass = 'custom-marker';
      if (m.type === 'origin') badgeClass += ' marker-origin';
      else if (m.type === 'destination') badgeClass += ' marker-dest';
      else if (m.line === 'green') badgeClass += ' marker-green';
      else if (m.line === 'purple') badgeClass += ' marker-purple';

      const icon = L.divIcon({
        className: 'leaflet-div-custom',
        html: '<div class="' + badgeClass + '">' + (m.label || m.title || '●') + '</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      L.marker(m.coords, { icon: icon })
        .addTo(map)
        .bindPopup('<b>' + m.title + '</b>');
    });

    // Render user location pulse dot if available
    ${
      userCoord
        ? `
      const userIcon = L.divIcon({
        className: 'leaflet-user-pulse',
        html: '<div class="marker-user"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      L.marker([${userCoord[0]}, ${userCoord[1]}], { icon: userIcon }).addTo(map).bindPopup('<b>Your Location</b>');
      allBounds.push([${userCoord[0]}, ${userCoord[1]}]);
    `
        : ''
    }

    // Fit map bounds smoothly to the full route
    if (allBounds.length > 1) {
      map.fitBounds(allBounds, { padding: [35, 35], maxZoom: 16 });
    } else {
      map.setView([${centerLat}, ${centerLng}], 13);
    }
  </script>
</body>
</html>
    `;
  }, [userLocation, destination, activeRoute, activeStepIndex]);

  return (
    <View style={styles.container}>
      <iframe
        title="Interactive Road Map"
        srcDoc={mapHtml}
        style={styles.iframe}
        sandbox="allow-scripts allow-same-origin"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f8f6f0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: 16,
  },
});
