import mapboxgl, { LngLatLike } from 'mapbox-gl';

import { TourData } from 'models/tourModel.js';

export const displayMap = (locations: TourData['locations']) => {
  // @ts-ignore
  mapboxgl.accessToken =
    'pk.eyJ1Ijoiaml3b2tyaXN0aSIsImEiOiJjbWlmbWpydjcwNmlwM2ZwczRsN3R5NzRrIn0.GQjOk1w87jwUqOQIeoK83w';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jiwokristi/cmifn6toi00mx01pfevpz652e',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates as LngLatLike)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates as LngLatLike)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend the map bounds to include the current location
    bounds.extend(loc.coordinates as LngLatLike);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
