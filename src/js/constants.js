export const KrakowCoords = {lat: 50.061680, lng: 19.942900}; // Krakow geo coordinates
export const R = 6371; // Earth radius in km
export const degToRadians = deg => deg * (Math.PI/180); // calculate radians from degrees
export const resultBox = document.getElementById('result'); // DOM container for displaying results
export const infoMessage = 'You can select only 2 points in TRANSIT mode!';
export const minPointsMessage = 'Select minimum 2 points on the map!';
// generate unique id
export const uuid = () => {
  const randomize = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${randomize()}${randomize()}${randomize()}${randomize()}`;
};
// calculate distance between two points on sphere
export const calcDirectDistance = (start, end) => {
  const φ1 = degToRadians(start.lat);
  const φ2 = degToRadians(end.lat);
  const Δφ = degToRadians(end.lat - start.lat);
  const Δλ = degToRadians(end.lng - start.lng);
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100;
};
// get LongLat coordinates from google maps Marker object
export const getCoordsFromMarker = (marker) => {
  return {
    lat: marker.getPosition().lat(),
    lng: marker.getPosition().lng()
  }
};