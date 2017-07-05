/* global L */

import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Mixin.create({
  attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors | <a href="http://www.mapzen.com">Mapzen</a> | <a href="http://www.transit.land">Transitland</a> | Imagery © <a href="https://carto.com/">CARTO</a>',
  bbox: null,
  closeTextbox: Ember.inject.service(),
  currentlyLoading: Ember.inject.service(),
  icon: L.icon({
    iconUrl: 'assets/images/marker1.png',
    iconSize: (20, 20),
    iconAnchor: [10, 24],
  }),
  leafletBbox: null,
  leafletBounds: [[43.053900124340984, -89.46407318115234],[43.10875337930414, -89.32708740234375]],
  mapCenter: [43.072963279523,-89.39234018325806],
  pin: null,
  pinLocation: Ember.computed('pin', function(){
    if (typeof(this.get('pin'))==="string"){
      var pinArray = this.get('pin').split(',');
      return pinArray;
    } else {
      return this.get('pin');
    }
  }),
  place: null,
  textboxIsClosed: Ember.computed('closeTextbox.textboxIsClosed', function(){
    if (localStorage.getItem('mobility-explorer-hide-intro') === "true"){
        return true;
    } else {
      return this.get('closeTextbox').get('textboxIsClosed');
    }
  }),
  searchbarContent: Ember.computed(function(){
    if (this.media.isMobile){
      return "Find a place"
    } else {
      return "Find a place using Mapzen Search";
    }
  }),
  mapMatching: Ember.computed('ENV',function(){
    return ENV.mapMatching;
  }),
  webgl: Ember.computed(function(){
      var canvas = document.createElement("canvas");
      var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl && gl instanceof WebGLRenderingContext) {
        return true;
      } else {
        return false;
      }
  }),

  actions: {
    dropPin: function(e){
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;
      var coordinates = [];
      coordinates.push(lat);
      coordinates.push(lng);
      this.set('pin', coordinates);
      this.set('mapCenter', coordinates);
      this.set('leafletBbox', this.get('bbox'));
    },
    removePin: function(){
      var pinCoordinateArray = this.get('pin').split(",");
      pinCoordinateArray[0] = parseFloat(pinCoordinateArray[0]);
      pinCoordinateArray[1] = parseFloat(pinCoordinateArray[1]);
      this.set('mapCenter', pinCoordinateArray);
      this.set('pin', null);
    },
    searchRepo: function(term) {
      if (Ember.isBlank(term)) { return []; }
      const url = `https://search.mapzen.com/v1/autocomplete?api_key=mapzen-jLrDBSP&text=${term}`;      
      return Ember.$.ajax({ url }).then(json => json.features);
    },
    setPlace: function(selected){
      this.set('pin', null);
      var lng = selected.geometry.coordinates[0];
      var lat = selected.geometry.coordinates[1];
      var coordinates = [];
      coordinates.push(lat);
      coordinates.push(lng);
      this.set('place', selected);
      this.set('pin', coordinates);
      this.set('mapCenter', coordinates);
      this.transitionToRoute('index', {queryParams: {pin: this.get('pin'), bbox: null}});
    },
    clearPlace: function(){
      this.set('place', null);
    }
  }
});