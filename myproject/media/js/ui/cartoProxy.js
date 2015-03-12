
// Author: xunli at asu.edu
define(['./msgbox', './message', './utils'], function(MsgBox, M, Utils) {

var zip = this.zip;

var carto_uid;
var carto_key;

var CartoProxy = {

  GetAllTables : function(uid, key, onSuccess) {
    carto_uid = uid;
    carto_key = key;
    var sql = "SELECT table_name FROM information_schema.tables WHERE table_schema='public'";
    var url = "http://" + uid + ".cartodb.com/api/v2/sql?api_key=" + key + "&q=" + sql;
    var that = this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.onload = function(evt) {
      var content = xhr.response;
      if (content['rows'] === undefined ) {
        MsgBox.getInstance().Show("Error:Get all tables from CartoDB returns empty", JSON.stringify(content));
        return;
      }
      var rows = content.rows;
      var table_name, geom_type, tables = {};
      for (var i=0, n=rows.length; i<n; i++) {
        table_name = rows[i]["table_name"];
        if (table_name !== 'raster_columns' &&
            table_name !== 'raster_overviews' &&
            table_name !== 'spatial_ref_sys' &&
            table_name !== 'geometry_columns' &&
            table_name !== 'geography_columns' ) 
        {
          tables[table_name] = "";
        }
      }
      if (onSuccess) onSuccess(tables);
    };
    xhr.send(null);
  },

  GetUID : function() {return carto_uid;},
  GetKey: function() {return carto_key;},
  SetUID : function(obj) {carto_uid = obj;},
  SetKey: function(obj) {carto_key = obj;},
  
  GetGeomType : function(table_name, onSuccess) {
    var sql = "SELECT GeometryType(the_geom) FROM " + table_name + " LIMIT 1";
    var url = "http://" + carto_uid + ".cartodb.com/api/v2/sql?api_key=" + carto_key + "&q=" + sql;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.onload = function(evt) {
      var data = xhr.response;
      var geotype = data.rows[0].geometrytype;
      if (geotype) {
        if (geotype.indexOf("POINT") >= 0 ) {
          geotype = "Point";
        } else if (geotype.indexOf("LINE") >= 0 ) {
          geotype = "Line";
        } else if (geotype.indexOf("POLY") >= 0 ) {
          geotype = "Polygon";
        }
      }
      if (onSuccess) onSuccess(geotype);
    };
    xhr.send(null);
    
  },
  
  DownloadTable2TopoJson : function(table_name, onSuccess) {
    var sql = "SELECT the_geom FROM " + table_name;
    var url = "http://" + carto_uid + ".cartodb.com/api/v2/sql?format=topojson&api_key=" + carto_key + "&q=" + sql;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'text';
    xhr.onload = function(evt) {
      var a = xhr.response;
      if (a.indexOf('undefined') >= 0) {
        a = a.replace(/undefined/g,"");
      }
      
      var topojson = JSON.parse(a);
      if (topojson["type"] === undefined ) {
        MsgBox.getInstance().Show(M.m200001, M.m200002 + JSON.stringify(content));
        return;
      }
      // get geometry type
      var type;
      if (a.indexOf('Polygon') > 0) type = 3; // polygon
      else if (a.indexOf('Point') > 0) type = 1; // point
      else type = 2; // line
      
      // the topojson is WGS84 (by cartodb)
      if (onSuccess) 
        onSuccess({
          name: table_name + '.json',
          geotype : type,
          topojson: topojson,
        });
    };
    xhr.send(null);
  },
  
  DownloadTable: function(table_name, onSuccess) {
    var sql = "SELECT the_geom FROM " + table_name;
    var url = "http://" + carto_uid + ".cartodb.com/api/v2/sql?format=shp&api_key=" + carto_key + "&q=" + sql;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = 'blob';
    xhr.onload = function(evt) {
      if (this.status == 200) {
     
        var f = xhr.response,
            bShp=0,
            bHasPrj = false,
            proj = null,
            shpFile, dbfFile, prjFile;
        
        zip.createReader(new zip.BlobReader(f), function(zipReader) {
          zipReader.getEntries(function(entries) {
            entries.forEach(function(entry) {
              var suffix = Utils.getSuffix(entry.filename);
              if (suffix === 'prj') bHasPrj = true;
            });
            entries.forEach(function(entry) {
              var suffix = Utils.getSuffix(entry.filename);
              var writer;
              if (suffix === 'json' || suffix === 'geojson' || suffix === 'prj') {
                writer = new zip.TextWriter();
              } else {
                writer = new zip.BlobWriter();
              }
              entry.getData(writer, function(o) {
                if (entry.filename[0] === '_')  return;
                if (suffix === 'geojson' || suffix === 'json') {
                  o = JSON.parse(o);
                  if (onSuccess) onSuccess( {
                    'file_type' : 'json',
                    'file_name' : table_name,
                    'file_content' : o,
                  });
                  return;
                } else if (suffix === "shp") {
                  bShp += 1;
                  shpFile = o;
                } else if (suffix === "shx") {
                  bShp += 1;
                } else if (suffix === "dbf") {
                  bShp += 1;
                  dbfFile = o;
                } else if (suffix === "prj") {
                  bHasPrj = true;
                  prjFile = o;
                }
                if (bShp >= 3) {
                  if (bHasPrj && prjFile) {
                    if (onSuccess) onSuccess({
                      'file_type' : 'shp',
                      'file_name' : table_name,
                      'file_content' : {'shp': shpFile, 'dbf' : dbfFile, 'prj':prjFile},
                    });
                  }
                }
              });
            });
          });
        });  
        
      }
    };
    xhr.send(null);
  },
  
  GetFields: function(table_name, onSuccess) {
    var sql = "SELECT column_name as a, data_type as b FROM information_schema.columns WHERE table_name='" + table_name + "'";
    var url = "http://" + carto_uid + ".cartodb.com/api/v2/sql?format=json&api_key=" + carto_key + "&q=" + sql;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.onload = function(evt) {
      var data = xhr.response,
          rows = data.rows,
          n = rows.length,
          col,
          fields = {};
      for (var i=0; i<n; i++) {
        col = rows[i].a;
        typ = rows[i].b;
        if (col !== "the_geom" && col !== "cartodb_id" && col !== "created_at" &&
            col !== "updated_at" && col !== "the_geom_webmercator") {
          if (typ.indexOf('double') >= 0) typ = "double";
          else if (typ.indexOf('text') >= 0) typ = "string";
          else if (typ.indexOf('time') >= 0) typ = "time";
          else if (typ.indexOf('USER') >= 0) typ = "string";
          
          fields[col] = typ;
        }
      }
      if (onSuccess) onSuccess(fields);
    };
    xhr.send(null);
  },
  
  GetVariables : function(table_name, vars, isCSV, onSuccess) {
    if (!carto_uid || !carto_key) return;
    var nvars = vars.length;
    
    var sql = "SELECT ";
    for (var i=0, n=nvars-1; i<n; i++) sql += vars[i] + ", ";
    sql += vars[vars.length-1];
    sql += " FROM " + table_name;
    
    var url = "http://" + carto_uid + ".cartodb.com/api/v2/sql?format=csv&api_key=" + carto_key + "&q=" + sql;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'text';
    xhr.onload = function(evt) {
      var content = xhr.response;
      if (isCSV === true) {
        if (onSuccess) onSuccess(content);
      } else {
        var rows = content.split("\n");
        var data = {};
        for (var i=0; i<nvars; i++)  {
          data[vars[i]] = [];
        }
        for (var i=1, n=rows.length; i<n; i++)  {
          var items = rows[i].split(",");
          for (var j=0; j<nvars; j++)  {
            if (items[j] !== "")
              data[vars[j]].push(parseFloat(items[j]));
          }
        }
        if (onSuccess) onSuccess(data);
      }
    };
    xhr.send(null);
  },
  
  FormatWeights : function(data) {
    var rows = data.rows,
        n = rows.length,
        w = {};
    for (var i=0; i<n; i++) {
      w[rows[i].id] = rows[i].nn;
    }
    return w;
  },
  
  CreateContiguityWeights : function(table_name, w_conf, onSuccess) {
    //select b.cartodb_id, ARRAY(
    //  SELECT a.cartodb_id as id
    //  FROM natregimes as a 
    //  WHERE a.cartodb_id <> b.cartodb_id
    //  AND st_intersects(a.the_geom, b.the_geom)
    //) as nn
    //from natregimes b
    var that = this;
    
    var sql = "select b.cartodb_id-1 as id, ARRAY(SELECT a.cartodb_id-1 FROM natregimes as a WHERE a.cartodb_id <> b.cartodb_id AND st_intersects(a.the_geom, b.the_geom)) as nn from natregimes b";
   
    sql = sql.replace(/natregimes/g, table_name);
    
    var url = "http://" + carto_uid + ".cartodb.com/api/v2/sql?format=json&api_key=" + carto_key + "&q=" + sql;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.onload = function(evt) {
      var w = that.FormatWeights(xhr.response);
      if (onSuccess) onSuccess(w);
    };
    xhr.send(null);
  },

  CreateDistanceWeights : function(table_name, w_conf, onSuccess) {
    //select b.cartodb_id, ARRAY(
    //  SELECT a.cartodb_id as id
    //  FROM natregimes as a 
    //  WHERE a.cartodb_id <> b.cartodb_id
    //  AND a.the_geom<->b.the_geom < dist_threshold
    //) as nn
    //from natregimes b
    var that = this;
    var sql; 
    if (w_conf['pow_idist'] === undefined)  {
      sql = "select b.cartodb_id-1 as id, ARRAY(SELECT a.cartodb_id-1 FROM natregimes as a WHERE a.cartodb_id <> b.cartodb_id AND a.the_geom<->b.the_geom < dist_threshold)) as nn from natregimes b";
    } else {
      sql = "select a.cartodb_id-1 as aid, b.cartodb_id-1 as bid, power(1.0/a.the_geom<->b.the_geom, pow_idx) as dist from natregimes as a join natregimes as b on a.the_geom<->b.the_geom<dist_threshold and a.cartodb_id<>b.cartodb_id";
      sql = sql.replace("pow_idx", w_conf['pow_idist']);
    }
   
    sql = sql.replace(/natregimes/g, table_name);
    sql = sql.replace("dist_threshold", w_conf.dist_value);
    
    var url = "http://" + carto_uid + ".cartodb.com/api/v2/sql?format=json&api_key=" + carto_key + "&q=" + sql;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.onload = function(evt) {
      var w = that.FormatWeights(xhr.response);
      if (w_conf['pow_idist']) {
        // power of inverse distance
        // aid, bid, power(1/dist, idx)
      }
      if (onSuccess) onSuccess(w);
    };
    xhr.send(null);
  },

  CreateKnnWeights : function(table_name, w_conf, onSuccess) {
    //select b.cartodb_id, ARRAY(
    //  SELECT a.cartodb_id as id
    //  FROM natregimes as a 
    //  WHERE a.cartodb_id <> b.cartodb_id
    //  ORDER BY a.the_geom<->b.the_geom < dist_threshold
    //  LIMIT kk
    //) as nn
    //from natregimes b
    var that = this;
    
    var sql = "select b.cartodb_id-1 as id, ARRAY(SELECT a.cartodb_id-1 FROM natregimes as a WHERE a.cartodb_id <> b.cartodb_id ORDER BY a.the_geom<->b.the_geom LIMIT kk) as nn from natregimes b";
   
    sql = sql.replace(/natregimes/g, table_name);
    sql = sql.replace("kk", parseInt(w_conf.dist_value));
    
    var url = "http://" + carto_uid + ".cartodb.com/api/v2/sql?format=json&api_key=" + carto_key + "&q=" + sql;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.onload = function(evt) {
      var w = that.FormatWeights(xhr.response);
      if (onSuccess) onSuccess(w);
    };
    xhr.send(null);
  },
  
  CreateKernelWeights : function(table_name, w_conf, onSuccess) {
    //select b.cartodb_id, ARRAY(
    //  SELECT a.cartodb_id as id
    //  FROM natregimes as a 
    //  WHERE a.cartodb_id <> b.cartodb_id
    //  AND st_intersects(a.the_geom, b.the_geom)
    //) as nn
    //from natregimes b
    var that = this;
    
    var sql = "select b.cartodb_id-1 as id, ARRAY(SELECT a.cartodb_id-1 FROM natregimes as a WHERE a.cartodb_id <> b.cartodb_id AND st_intersects(a.the_geom, b.the_geom)) as nn from natregimes b";
   
    sql = sql.replace(/natregimes/g, table_name);
    
    var url = "http://" + carto_uid + ".cartodb.com/api/v2/sql?format=json&api_key=" + carto_key + "&q=" + sql;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.onload = function(evt) {
      var w = that.FormatWeights(xhr.response);
      if (onSuccess) onSuccess(w);
    };
    xhr.send(null);
  },

 
  GetQuantileBins : function(table_name, var_name, k, onSuccess)  {
    var sql = "SELECT CDB_QuantileBins(array_agg(" + var_name +"), "+k+") FROM " + table_name;
    var url = "http://" + carto_uid + ".cartodb.com/api/v2/sql?format=csv&api_key=" + carto_key + "&q=" + sql;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.onload = function(evt) {
      var data = xhr.response;
      if (onSuccess) onSuccess(data);
    };
    xhr.send(null);
  },
  
  UploadTable : function(uid, key, uuid, successHandler) {
    var msg = {"command":"cartodb_upload_table"};
    if (uid) msg["uid"] = uid;
    if (key) msg["key"] = key;
    if (uuid) msg["uuid"] = uuid;
    if (this.socket && this.socket.readyState == 1) {
      this.socket.send(JSON.stringify(msg));
      this.callback_UploadTable = successHandler;
    } else {
      setTimeout(function(){self.CartoUploadTable(uid, key, uuid, successHandler)}, 10);
    }
  },
  
  SpatialCount : function(uid, key, first_layer, second_layer, count_col_name, successHandler) {
    var msg = {"command":"cartodb_spatial_count"};
    if (uid) msg["uid"] = uid;
    if (key) msg["key"] = key;
    msg["firstlayer"] = first_layer;
    msg["secondlayer"] = second_layer;
    msg["columnname"] = count_col_name;
    if (this.socket && this.socket.readyState == 1) {
      this.socket.send(JSON.stringify(msg));
      this.callback_SpatialCount = successHandler;
    } else {
      setTimeout(function(){self.CartoSpatialCount(uid, key, first_layer, second_layer, count_col_name, successHandler)}, 10);
    }
  },
  
};

return CartoProxy;

});
