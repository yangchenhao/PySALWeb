
var isNode = false,
    baseUrl,
    paths;

if (typeof module !== 'undefined' && module.exports) {
  // node.js
  isNode = true;
  require = require('requirejs');
  baseUrl = "../lib";
  paths = {
    rarity : '../rarity',
    jquery : 'jquery.min',
    kdtree : 'static-kdtree'
  };
} else {  
  // browsers
  baseUrl = "../media/js";
  paths = {
    rarity : 'rarity',
    jquery : 'lib/jquery.min',
    "static-kdtree": 'lib/static-kdtree',
  };
}

require.config({ 
  //By default load any module IDs from ../media/js/rarity
  baseUrl: baseUrl,
  //except, if the module ID starts with "app",
  //load it from the ../media/js/app directory. paths
  //config is relative to the baseUrl, and
  //never includes a ".js" extension since
  //the paths config could be for a directory.
  paths: paths,
  shim : {
    "static-kdtree" : {
      exports : "kdtree"
    }
  }
});
 
require(['jquery', 'rarity/io/geojson','rarity/io/geojson_map','rarity/viz/canvas_map'], 
function($, GeoJSON, GeoJsonMap, CanvasMap) { 
  var json = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"Name":"One","IValue":1,"FValue":1.1},"geometry":{"type":"Point","coordinates":[-0.0006817661753210358,-0.25904661905760773]}},
{"type":"Feature","properties":{"Name":"Two","IValue":2,"FValue":2.2},"geometry":{"type":"Point","coordinates":[0.11697145363360706,-0.25630328607387354]}},
{"type":"Feature","properties":{"Name":"Three","IValue":3,"FValue":3.3},"geometry":{"type":"Point","coordinates":[0.05043668122270728,-0.33930131004366804]}},
{"type":"Feature","properties":{"Name":"Four","IValue":4,"FValue":4.4},"geometry":{"type":"Point","coordinates":[-0.04126637554585155,-0.4126637554585152]}},
{"type":"Feature","properties":{"Name":"Five","IValue":5,"FValue":5.5},"geometry":{"type":"Point","coordinates":[-0.011462882096069604,-0.44017467248908293]}},
{"type":"Feature","properties":{"Name":"Six","IValue":6,"FValue":6.6},"geometry":{"type":"Point","coordinates":[0.027510917030567628,-0.4608078602620088]}},
{"type":"Feature","properties":{"Name":"Seven","IValue":7,"FValue":7.7},"geometry":{"type":"Point","coordinates":[0.07565502183406081,-0.4585152838427947]}},
{"type":"Feature","properties":{"Name":"Eight","IValue":8,"FValue":8.8},"geometry":{"type":"Point","coordinates":[0.11233624454148461,-0.43558951965065495]}},
{"type":"Feature","properties":{"Name":"Nine","IValue":9,"FValue":9.9},"geometry":{"type":"Point","coordinates":[0.13984716157205224,-0.40578602620087334]}}]};
  
  var geojson = new GeoJSON("test", json);
  var jsonMap = new GeoJsonMap(geojson);
  
  
  var canvas = $('#map');
  var hlcanvas = $('#hlmap');
  var mapCanvas = new CanvasMap(jsonMap, canvas, hlcanvas);
}); 
  
require(['jquery', 'rarity/io/topojson_map', 'rarity/viz/canvas_map'], 
function($, TopoJsonMap,CanvasMap) {
  var topology = {"type":"Topology","transform":{"scale":[0.0002520165073211382,0.00019492849732399704],"translate":[-0.04527237752903268,-0.4646223970748078]},"objects":{"Polygon":{"type":"GeometryCollection","geometries":[{"arcs":[[[0]],[[1]]],"type":"MultiPolygon","properties":{"Name":"Eyes","IValue":1,"FValue":1.1}},{"arcs":[[2]],"type":"Polygon","properties":{"Name":"Nose","IValue":2,"FValue":2.2}},{"arcs":[[3]],"type":"Polygon","properties":{"Name":"Mouth","IValue":3,"FValue":3.3}}]}},"arcs":[[[137,1059],[13,17],[23,8],[20,-6],[11,-13],[4,-17],[-15,-11],[-25,-2],[-21,4],[-7,7],[-3,13]],[[605,1069],[16,22],[18,6],[23,-6],[15,-11],[10,-17],[-8,-15],[-27,-4],[-19,-2],[-14,8],[-11,4],[-3,15]],[[394,780],[-10,-205],[33,51],[13,-10],[-56,-77],[-8,241],[28,0]],[[0,262],[21,30],[116,-149],[148,-107],[180,4],[153,118],[115,166],[15,-19],[-107,-169],[-153,-125],[-198,-11],[-165,104],[-125,158]]]};
 
  //  create contiguity weights  in backgroun
  
  var topoMap = new TopoJsonMap('xxx', topology);

  var canvas = $('#map');
  var hlcanvas = $('#hlmap');
  //var mapCanvas = new CanvasMap(topoMap, canvas, hlcanvas);
  
  //var w = topoMap.createQueenWeights();
});


// Start the main app logic.
require([
  'rarity/esda/moran', 
  'rarity/esda/local_moran', 
  'rarity/weights/weights',
  ], 
  function(Moran, Moran_Local, W) {
  var y = [ 0.91659 ,  0.      ,  1.568381,  1.968504,  6.333568,  4.820937,
      0.      ,  0.      ,  4.132231,  0.620347,  1.932367,  3.596314,
      2.393776,  2.570694,  1.834862,  4.988914,  1.831502,  1.271456,
      0.755858,  2.066116,  1.331558,  0.      ,  0.788022,  1.429593,
      0.843313,  1.421157,  2.782534,  4.531722,  1.264223,  2.007528,
      1.989555,  0.      ,  2.734482,  1.66251 ,  0.      ,  1.291156,
      1.104667,  2.614379,  0.966417,  0.8285  ,  0.      ,  1.452169,
      1.399384,  5.050505,  0.      ,  2.569373,  1.570916,  1.215067,
      2.971367,  0.651324,  2.748331,  0.868961,  1.197605,  1.500375,
      0.947867,  0.      ,  2.600297,  4.444444,  4.597701,  2.220249,
      4.010695,  2.71166 ,  1.588983,  2.055076,  3.610108,  1.749781,
      1.888218,  2.038169,  0.731886,  2.384738,  2.122241,  1.942502,
      0.      ,  2.786291,  2.557545,  1.220324,  1.876173,  0.      ,
      1.322314,  1.845018,  1.94742 ,  1.865855,  1.730104,  1.021711,
      9.55414 ,  4.685408,  0.      ,  1.610954,  1.451379,  0.      ,
      2.215406,  3.547672,  2.599032,  3.929522,  2.071251,  4.489338,
      3.257329,  4.477612,  2.171553,  2.292526];
  var w = {0: [1, 18, 17],
       1: [0, 17, 2],
       2: [24, 1, 17, 22, 9],
       3: [6, 55],
       4: [8, 27, 5, 15],
       5: [27, 4, 7],
       6: [16, 3, 7],
       7: [16, 19, 20, 5, 6],
       8: [23, 4, 30, 14, 15],
       9: [24, 25, 2, 11],
       10: [26, 11, 28, 13],
       11: [24, 9, 10, 26, 25],
       12: [29, 36, 13, 14, 23],
       13: [28, 10, 12, 29],
       14: [8, 12, 23],
       15: [32, 35, 4, 8, 23, 27, 30],
       16: [19, 6, 7],
       17: [0, 1, 2, 38, 33, 40, 18, 22],
       18: [0, 17, 21, 33],
       19: [16, 20, 7],
       20: [19, 7],
       21: [33, 18, 31, 42, 45],
       22: [24, 17, 2, 38, 39],
       23: [36, 8, 12, 14, 15, 53, 30],
       24: [2, 39, 9, 11, 22, 41, 25],
       25: [9, 11, 46, 41, 24, 26],
       26: [10, 11, 46, 47, 25, 28],
       27: [43, 35, 4, 5, 15],
       28: [10, 26, 29, 13, 47],
       29: [28, 47, 12, 13, 36],
       30: [32, 36, 8, 15, 48, 53, 23],
       31: [34, 21, 45],
       32: [48, 50, 35, 30, 15],
       33: [40, 42, 17, 18, 51, 21],
       34: [45, 52, 37, 31],
       35: [32, 43, 15, 50, 56, 27],
       36: [30, 12, 47, 53, 23, 29, 62],
       37: [34, 52, 54],
       38: [64, 67, 68, 49, 39, 40, 17, 51, 22],
       39: [24, 49, 38, 22, 41],
       40: [17, 51, 38, 33],
       41: [69, 70, 39, 46, 49, 24, 25],
       42: [64, 33, 45, 51, 21, 60, 63],
       43: [56, 35, 27, 44, 86],
       44: [43, 86],
       45: [34, 42, 52, 21, 60, 31],
       46: [66, 69, 41, 47, 25, 26],
       47: [66, 36, 46, 26, 59, 28, 29, 62],
       48: [32, 50, 53, 58, 61, 30],
       49: [68, 69, 70, 39, 41, 38],
       50: [32, 35, 73, 48, 56, 90, 58],
       51: [64, 33, 38, 40, 42, 63],
       52: [34, 37, 71, 74, 45, 54, 60],
       53: [36, 78, 48, 30, 23, 61, 62],
       54: [65, 37, 71, 74, 52, 57],
       55: [3, 86],
       56: [35, 43, 79, 50, 86, 90],
       57: [72, 65, 77, 54],
       58: [48, 73, 50, 61],
       59: [66, 62, 47],
       60: [71, 42, 76, 45, 52, 63],
       61: [73, 78, 48, 53, 87, 58],
       62: [66, 36, 78, 47, 81, 53, 59],
       63: [64, 75, 42, 51, 60],
       64: [67, 38, 42, 75, 51, 63],
       65: [57, 74, 77, 54],
       66: [91, 69, 46, 47, 81, 85, 88, 59, 62],
       67: [64, 75, 83, 68, 38],
       68: [49, 83, 67, 70, 38],
       69: [66, 70, 41, 46, 49, 84, 88],
       70: [68, 69, 41, 49, 83, 84],
       71: [76, 60, 74, 52, 54],
       72: [80, 57, 77],
       73: [82, 61, 50, 87, 90, 58],
       74: [65, 52, 54, 71],
       75: [64, 67, 63],
       76: [60, 71],
       77: [72, 57, 89, 80, 65],
       78: [96, 81, 53, 87, 61, 62, 95],
       79: [56, 90],
       80: [72, 89, 77],
       81: [66, 78, 85, 93, 62, 95],
       82: [73, 90, 92, 94, 87],
       83: [84, 67, 68, 70],
       84: [88, 83, 69, 70],
       85: [88, 81, 66, 91, 93],
       86: [56, 43, 44, 55],
       87: [96, 73, 78, 82, 92, 61],
       88: [66, 91, 84, 69, 85],
       89: [80, 77],
       90: [73, 82, 79, 50, 56, 94],
       91: [88, 66, 85, 93],
       92: [96, 82, 94, 87],
       93: [81, 95, 91, 85, 97],
       94: [82, 92, 90],
       95: [96, 81, 93, 78, 97],
       96: [97, 98, 99, 78, 87, 92, 95],
       97: [96, 99, 93, 95],
       98: [96, 99],
       99: [96, 97, 98]};
  
  // Moran function
  console.time('moran');
  new Moran(y, w);
  console.timeEnd('moran');
  console.time('moran_local');
  new Moran_Local(y, w);
  console.timeEnd('moran_local');
});