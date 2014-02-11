//
//  Journo-stream
//
//     Copyright 2014 Scott Hamilton
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

var http = require('http');
var path = require('path');
var timecode = require("timecode").Timecode;
var currentPgmTimecode = timecode.init({framerate: "25", timecode: "00:00:01:00"});
var currentPgmFile = "";
console.log("Get MeltedManager...");
var mltMgr = require('./melt/MeltedManager');
console.log("Got MeltedManager, now create instance #1");
var prvMgr = new mltMgr("mlt://localhost:5250");
var pgmMgr = new mltMgr("mlt://localhost:5250");
console.log("Got two instances, now set loop...");
prvMgr.setLoop("0");
console.log("set loop on second instance...");
pgmMgr.setLoop("0");
console.log("All done with melted");

var async = require('async'), socketio = require('socket.io');
var express = require('express'), app = express(), server = http.createServer(app);
console.log("Created express server");
var io = require('socket.io').listen(server, {'destroy upgrade': false});
io.configure(function() {
    io.set('transports', ['websocket', 'xhr-polling']);
    //io.enable('log');
    io.set('log level', 2);
});

var pgmUnit = 1;
var previewUnit = 0;
var viewEngine = 'jade'; // modify for your view engine
// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', viewEngine);
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});
/*************
 app.configure('development', function(){
 app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
 });
 app.configure('production', function(){
 app.use(express.errorHandler());
 });
 *******/



server.listen(process.env.PORT || 8888);
var addr = server.address().address;
console.log('Started listening on: '.concat(addr).concat(':').concat(process.env.PORT || 8888));

//  get current status from the melted server.
setInterval(function() {
        //currentPgmTimecode.add("00:00:00:01");
        pgmMgr.getUnitStatus(0).then(function(status) {
            //console.log("got back status: "+status.toString());
            //var result = JSON.stringify(status);
            currentPgmTimecode = status.timecode;
            currentPgmFile = status.file;
        });
    }, 1000/(25/2));   //milliseconds divided by half the frame-rate
    
    
    

// when client view the presentation page, we get a new connection
io.sockets.on('connection', function(socket) {
    var statusInterval = 120;
    console.log("Got connection...");
    socket.emit("statechange", {pgm: pgmUnit, prv: previewUnit});
    
    setInterval(function() {
        var today = new Date();
        socket.emit('pgmTimecode', {file: currentPgmFile, timecode: currentPgmTimecode, unit: pgmUnit, timestamp: today.getTime()});
    }, statusInterval);
    socket.on("cutProgram", function(data) {
        console.log("cutPGM: " + data);
        pgmUnit = data;
        socket.broadcast.emit('statechange', {pgm: pgmUnit, prv: previewUnit});
    });

    socket.on("cutPreview", function(data) {
        console.log("cutPreview: " + data);
        previewUnit = data;
        //socket.broadcast.emit('onNoteUpdated', data);
        socket.broadcast.emit('statechange', {pgm: pgmUnit, prv: previewUnit});
        pgmMgr.cutStream(data);
    });

    socket.on('mix', function(data) {
        console.log("mix between: "+pgmUnit+" and "+previewUnit+" by "+data.mix);
        if (data.mix == 0 || data.mix == 100) {
          var tmpPgm = pgmUnit;
          var tmpPrv = previewUnit;
          pgmUnit = tmpPrv;
          previewUnit = tmpPgm;
          socket.emit('statechange', {pgm: pgmUnit, prv: previewUnit});
          socket.broadcast.emit('statechange', {pgm: pgmUnit, prv: previewUnit});
          console.log("swapped");
        };
    });

    socket.on('cut', function(data) {
        console.log("cut between pgm and preview")
    });
    socket.on('slow', function(data) {
        statusInterval = statusInterval+(statusInterval*0.1);
        if (statusInterval > 1000) {
            statusInterval = 1000;
        }
        console.log("Received request from client to reduce status interval, new interval: "+statusInterval);
    });
});

