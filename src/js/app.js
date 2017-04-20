'use strict';
import {Map} from './Map';
import {KrakowCoords} from './constants';

const app = () => {

  // init map class
  const mapBox = document.getElementById('map');
  const map = new Map({
    mapBox: mapBox,
    mapOptions: {
      center: KrakowCoords,
      zoom: 14
    }
  });

  // reset button
  const reset = document.getElementById('resetBtn');
  reset.addEventListener('click', () => {
    map.reset();
  });

  // calculate btn
  const btn = document.getElementById('calculateBtn');
  btn.addEventListener('click', () => {
    map.renderResults();
  });
};

// init app when DOM is ready
if (document.readyState === 'complete' || document.readyState !== 'loading') {
  app();
} else {
  document.addEventListener('DOMContentLoaded', app);
}
