var fs = require('fs'),
    _ = require('lodash'),
    turf = require('turf');

var fileSpain = fs.readFileSync('./spain.geojson', 'utf8');
var fileDataCoord = fs.readFileSync('./coordinates_final.json', 'utf8');
var spainJson = JSON.parse(fileSpain);
var jsonFileDataCoord = JSON.parse(fileDataCoord);

filtersNullsOk(jsonFileDataCoord);

// createFileNulls(jsonFileDataCoord);

function writeFile(jsonData, strFile) {
    fs.writeFile(strFile + '.json', JSON.stringify(jsonData, null, 4), function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(strFile + ' --> Created!!!');
    });
}


// var cleanCoords = _.filter(jsonFileDataCoord, function(o) {
//     return (o.intCoordenadaLatitud !== 'NULL' || o.intCoordenadaLongitud !== 'NULL') &&
//         !(_.isInteger(o.intCoordenadaLatitud) || _.isInteger(o.intCoordenadaLongitud));
// });

//


// var filtered = _.filter(jsonFileDataCoord, function(o) {
//     return (o.intCoordenadaLatitud !== 'NULL' ||
//             o.intCoordenadaLongitud !== 'NULL') &&
//         (parseFloat(o.intCoordenadaLatitud) > 43 || parseFloat(o.intCoordenadaLatitud) < 27 ||
//             parseFloat(o.intCoordenadaLongitud) > 4 || parseFloat(o.intCoordenadaLongitud) < -19);
// });

function filterDataInt(jsonData) {
    var filterByParse = _.filter(jsonData, function(o) {
        return _.isInteger(o.intCoordenadaLatitud) || _.isInteger(o.intCoordenadaLongitud);
    });
    return filterByParse;
}

function filtersNullsOk(data) {
    var nullsOK = _.filter(data, function(obj) {
        if (obj['intCodigoPostal'].toString().length === 4) {
            obj['intCodigoPostal'] = '0' + obj['intCodigoPostal'].toString();
        } else {
            obj['intCodigoPostal'] = obj['intCodigoPostal'].toString();
        }
        return (obj['intCoordenadaLatitud'] === 'NULL' || obj['intCoordenadaLongitud'] === 'NULL') &&
            (obj['Nombre vía'] !== 'NULL' && obj['Numero'] !== 'NULL') &&
            (obj['strMunicipio'] !== 'NULL' || obj['intCodigoPostal'].length === 5);
    });
    writeFile(nullsOK, 'nullsOk');
}

function createFileNulls(jsonData) {
    var filterByNull = _.filter(jsonData, function(o) {
        return o.intCoordenadaLatitud === 'NULL' || o.intCoordenadaLongitud === 'NULL';
    });
    fs.writeFile('coordsNull.json', JSON.stringify(filterByNull, null, 4), function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('coordsNull.json Created!!!');
    });
}

function outOfPolygon(data, polygon) {
    var multiPolTurf = turf.multiPolygon(polygon.features[0].geometry.coordinates);
    var fileName;
    return _.filter(data, function(obj) {
        var pt1 = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [
                    parseFloat((obj.intCoordenadaLongitud.toString()).replace(',', '.')),
                    parseFloat((obj.intCoordenadaLatitud.toString()).replace(',', '.'))
                ]
            }
        };
        var ok = turf.inside(pt1, multiPolTurf);
        return ok;
    });
}

function createFileData(jsonData, jsonSpain, inSpain) {
    var multiPolTurf = turf.multiPolygon(jsonSpain.features[0].geometry.coordinates);
    var fileName;
    var coords = _.filter(jsonData, function(obj) {
        var pt1 = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [
                    parseFloat((obj.intCoordenadaLongitud.toString()).replace(',', '.')),
                    parseFloat((obj.intCoordenadaLatitud.toString()).replace(',', '.'))
                ]
            }
        };
        var ok = turf.inside(pt1, multiPolTurf);
        console.log(ok);
        return ok && inSpain;
    });
    if (inSpain) {
        fileName = 'coordsInSpain.json';
    } else {
        fileName = 'coordsOutSpain.json';
    }
    fs.writeFile(fileName, JSON.stringify(coords, null, 4), function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(fileName + ' created!!!!!');
    });
}