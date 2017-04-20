import {Calculate} from './Calculate';
import {Mode} from './Mode';
import {resultBox, infoMessage, minPointsMessage, uuid} from './constants';

const calculate = new Calculate();
const routeMode = new Mode();

export class Map {
  constructor(options) {
    this.mapBox = options.mapBox;
    this.mapOptions = options.mapOptions;
    this.map = null;
    this.markers = [];
    this.result = minPointsMessage;
    this.directionsDisplay = null;
    this.polyline = new google.maps.Polyline({
      geodesic: true,
      strokeColor: '#19B88A',
      strokeOpacity: 1.0,
      strokeWeight: 3
    });
    this.directionsService = new google.maps.DirectionsService();
    this.routeRendered = false;
    this.polylineRendered = false;

    this.initMap(this.mapBox, this.mapOptions);
  }
  // google map initiation
  initMap(target, config) {
    this.directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers : true
    });
    this.map = new google.maps.Map(target, config);
    this.polyline.setMap(this.map);
    this.directionsDisplay.setMap(this.map);
    // listener for click event
    google.maps.event.addListener(this.map, 'click', (event) => {
      const mode = routeMode.getCurrentMode();
      switch(mode) {
        case 'DIRECT':
          this.addMarker(event.latLng);
          this.addPointToPolyline(event.latLng);
          break;
        case 'WALKING':
          this.addMarker(event.latLng);
          this.markers.length > 1 ? this.calcRoute({mode}) : null;
          break;
        case 'BICYCLING':
          this.addMarker(event.latLng);
          this.markers.length > 1 ? this.calcRoute({mode}) : null;
          break;
        case 'DRIVING':
          this.addMarker(event.latLng);
          this.markers.length > 1 ? this.calcRoute({mode}) : null;
          break;
        case 'TRANSIT':
          if(this.markers.length > 1) {
            this.showAlert('info', infoMessage);
          } else {
            this.addMarker(event.latLng);
            this.markers.length > 1 ? this.calcRoute({mode}) : null;
          }
      }
    });
  }
  // calculate route with google maps direction service based on selected mode
  calcRoute(options) {
    // get array of currently setted markers
    const markers = this.markers;
    // start point of route
    const start = this.markers[0].getPosition();
    // end point of route
    const end = this.markers[this.markers.length - 1].getPosition();
    // creating array of points in route between start and end
    let waypoints = [];
    markers.slice(1, -1).forEach((point) => {
      waypoints.push({
        location: point.getPosition(),
        stopover: true
      });
    });
    let request = {
      origin: start,
      destination: end,
      travelMode: options.mode,
      region: 'PL'
    };
    // include waypoints into request config if they are
    if(waypoints.length) {
      request.waypoints = waypoints;
    }
    // requesting route
    this.directionsService.route(request, (result, status) => {
      if (status == 'OK') {
        // displaying route on the map
        this.directionsDisplay.setMap(this.map);
        this.directionsDisplay.setDirections(result);
        // calculate total distance of route and displaying it
        this.result = `${calculate.getRouteDistance(result)}km`;
        resultBox.innerHTML = this.result;
        // set flag to true - means route is currently on the map
        this.routeRendered = true;
      } else {
        // displaying error status if we got error answer from server
        this.showAlert('error', status);
        this.reset();
      }
    });
  }
  // add new marker with infowindow
  addMarker(location) {
    const geocoder = new google.maps.Geocoder();
    const infowindow = new google.maps.InfoWindow({
      maxWidth: 200
    });

    const marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: 'img/marker.svg',
      id: uuid()
    });
    // display infowindow with address on click
    marker.addListener('click', () => {
      geocoder.geocode({'latLng': marker.getPosition()}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            infowindow.setContent(results[0].formatted_address);
            infowindow.open(this.map, marker);
          }
        }
      });
    });
    // remove marker on rightclick from the map and redraw route or polyline for direct mode
    marker.addListener('rightclick', () => {
      const mode = routeMode.getCurrentMode();
      if (mode === 'DIRECT') {
        this.removePolylineAllPoints();
        this.deleteMarker(marker);
        this.updatePolyline();
      } else if (mode === 'TRANSIT') {
        this.deleteMarker(marker);
        this.markers.length === 2 ? this.calcRoute({mode}) : this.deleteRoute();
      } else {
        this.deleteMarker(marker);
        this.markers.length > 1 ? this.calcRoute({mode}) : this.deleteRoute();
      }
    });
    // add new marker to markers array
    this.markers.push(marker);
  }
  // add new point to polyline
  addPointToPolyline(marker) {
    this.polyline.getPath().push(marker);
    this.polylineRendered = true;
  }
  // update polyline based on current markers
  updatePolyline() {
    for (let i = 0; i < this.markers.length; i++) {
      let point = this.markers[i].getPosition();
      this.polyline.getPath().push(point);
    }
    // set flag to true means polyline is currently on the map
    this.polylineRendered = true;
  }
  // remove polyline from the map by removing all points from it
  removePolylineAllPoints() {
    for (let i = 0; i < this.markers.length; i++) {
      let point = this.markers[i].getPosition();
      this.polyline.getPath().removeAt(point);
    }
    // set flag to false means polyline is removed from the map
    this.polylineRendered = false;
  }
  // display all markers from array on the map
  setMapOnAll(map) {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
    }
  }
  // delete marker from map and from markers array
  deleteMarker(marker) {
    marker.setMap(null);
    for (let i = 0; i < this.markers.length; i++) {
      if( this.markers[i].id === marker.id) {
        this.markers.splice(i, 1);
      }
    }
  }
  // delete all markers from the map and from the markers array
  deleteAllMarkers() {
    this.setMapOnAll(null);
    this.removePolylineAllPoints();
    this.markers = [];
    this.polylineRendered = false;
  }
  // remove route from the map
  deleteRoute() {
    this.directionsDisplay.setMap(null);
    this.routeRendered = false;
  }
  // reset current state - remove all markers, polyline or route and calculated distance
  reset() {
    this.deleteRoute();
    this.deleteAllMarkers();
    resultBox.innerHTML = '';
  }
  // calculate distance
  calculate() {
    const markers = this.markers;
    if(markers.length > 1) {
      const mode = routeMode.getCurrentMode();
      switch(mode) {
        case 'DIRECT':
          this.routeRendered ? this.deleteRoute() : null;
          if(!this.polylineRendered) {
            this.updatePolyline();
          }
          this.result = `${calculate.getDirectDistance(markers)}km`;
          break;
        case 'WALKING':
        case 'BICYCLING':
        case 'DRIVING':
          this.removePolylineAllPoints();
          this.calcRoute({mode});
          break;
        case 'TRANSIT':
          this.polylineRendered ? this.removePolylineAllPoints() : null;
          if(markers.length > 2) {
            this.showAlert('info', infoMessage);
          } else {
            this.calcRoute({mode});
          }
          break;
        default:
          this.result = `${calculate.getDirectDistance(markers)}km`;
      }
    } else {
      this.result = minPointsMessage;
      resultBox.innerHTML = this.result;
    }
  }
  // display results in case it is not done automatically
  renderResults() {
    this.calculate();
    const mode = routeMode.getCurrentMode();
    if (mode === 'DIRECT') {
      resultBox.innerHTML = this.result;
    }
  }
  // function for showing window with required type and message as arguments
  // currently 2 types available: info and error
  showAlert(type, text) {
    const alert = document.getElementById('alert');
    if (!alert.classList.contains('visible')) { // prevent invoking alert if it is already showing
      switch (type) {
        case 'info':
          alert.classList.add('alert-info');
          break;
        case 'error':
          alert.classList.add('alert-error');
          break;
        default:
          alert.classList.add('alert-error');
      }
      alert.querySelector('.alert__content').innerHTML = text;
      alert.classList.add('visible');
      // remove window after 5 seconds
      setTimeout(() => {
        alert.classList.remove('visible');
      }, 5000);
    }
  }
}