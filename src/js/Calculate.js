import {calcDirectDistance, getCoordsFromMarker} from './constants';
// helper function for splitting array into array of pairs
const arrPairs = (arr) => {
  let result = [];
  arr.forEach(function(item, i, arr) {
    if(i < arr.length-1){
      result.push([item, arr[i + 1]]);
    }
  });
  return result;
};
// helper function for getting sum of numbers in array
const arrSum = (arr) => {
  return arr.reduce((sum, current) => {
    return sum + current;
  }, 0);
};
export class Calculate {
  // method return total direct distance between selected points in km
  getDirectDistance(arr) {
    let result = [];
    const routeArr = arrPairs(arr);
    routeArr.forEach((item) => {
      const point1 = getCoordsFromMarker(item[0]);
      const point2 = getCoordsFromMarker(item[1]);
      result.push(calcDirectDistance(point1, point2));
    });
    return Math.round(arrSum(result) * 100) / 100;
  }
  //return total distance for route in km
  getRouteDistance(obj) {
    let result = 0;
    // get all parts of route from object returned from google direction service
    const routes = obj.routes[0].legs;
    routes.forEach((item) => {
      result += item.distance.value;
    });
    return Math.round(result / 10) / 100;
  }
}