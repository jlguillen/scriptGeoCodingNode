GoogleMapsAPI = require('googlemaps'),
    fs = require('fs');

publicConfig = {
    'key': 'AIzaSyDhjwTxVyuWoDPJDLyQ2bifDVgjmJ9Qzyg',
    'stagger_time': 1000, // for elevationPath
    'encode_polylines': false,
    'secure': true // use https
};
var gmAPI = new GoogleMapsAPI(publicConfig);

var fileNulls = fs.readFileSync('./nullsOk.json', 'utf8');
var NullsJson = JSON.parse(fileNulls);
var nullsToOK = [];
var errorsLog = [];

setTimeout(function() {
    addLatLngEmpresas(NullsJson, function(err, results) {
        writeFile(results, 'nullsToOk')
    });
}, 1000);

function getLocation(recurso) {
    var promise, publicConfig, geocodeParams;
    geocodeParams = {
        'address': recurso['Nombre vía'] +
            ', ' + recurso['Numero'].toString() +
            ', ' + recurso['strMunicipio'] +
            ', ' + recurso['intCodigoPostal'] +
            ', ' + 'España',
        'components': 'components=country:ES',
        'language': 'es',
        'region': 'es'
    };
    promise = new Promise(function(resolve) {
        gmAPI.geocode(geocodeParams, function(err, result) {
            if (result) {
                if (result.status === 'OK') {
                    var loc = result.results[0].geometry.location;
                    recurso.intCoordenadaLatitud = loc.lat.toString();
                    recurso.intCoordenadaLongitud = loc.lng.toString();
                    recurso.status = result.status;
                } else {
                    recurso.status = result.status;
                }
            }
            resolve(recurso);
        });
    });
    return promise;
}

function addLatLngEmpresas(arrData, callback) {
    var promisesAll = [];
    if (!arrData.length || typeof callback !== 'function') {
        callback('Invalid data.');
    }

    for (var i = 0; i < arrData.length; i++) {
        promisesAll.push(getLocation(arrData[i]).then(call));
    }

    Promise.all(promisesAll).then(function(value) {
        callback(null, arrData);
    }, function(reason) {
        console.log(reason);
    });

    function call(NewData) {
        arrData[i] = NewData;
        console.log(NewData.status);
    }
}

function writeFile(jsonData, strFile) {
    fs.writeFile(strFile + '.json', JSON.stringify(jsonData, null, 4), function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(strFile + ' --> Created!!!');
    });
}