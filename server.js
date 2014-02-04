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
var mltMgr = require('./melt/MeltedManager');

var async = require('async'), socketio = require('socket.io');
var express = require('express'), app = express(), server = http.createServer(app);
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
console.log('Started listening on: '.concat(addr).concat(':').concat(process.env.PORT));

//  synthesise PAL 25fps content playing.
setInterval(function() {
        currentPgmTimecode.add("00:00:00:01");
    }, 1000/25);


io.sockets.on('connection', function(socket) {
    console.log("Got connection...");
    setInterval(function() {
        mltMgr.getUnitStatus(0).then(function(status) {
            console.log("got back status: "+status.toString());
            var result = JSON.stringify(status)
            console.log("getUnitStatus: "+result);
            socket.emit('pgmTimecode', status);
        });
    }, 120);
    socket.on("cutProgram", function(data) {
        console.log("cutPGM: " + data);
        pgmUnit = data;
        //socket.broadcast.emit('onNoteCreated', data);
    });

    socket.on("cutPreview", function(data) {
        console.log("cutPreview: " + data);
        previewUnit = data;
        //socket.broadcast.emit('onNoteUpdated', data);
        mltMgr.cutStream(data);
    });

    socket.on('mix', function(data) {
        console.log("mix between: "+pgmUnit+" and "+previewUnit+" by "+data.mix);
        if (data.mix == 0 || data.mix == 100) {
          var tmpPgm = pgmUnit;
          var tmpPrv = previewUnit;
          pgmUnit = tmpPrv;
          previewUnit = tmpPgm;
          socket.emit('swap', {pgm: pgmUnit, prv: previewUnit});
          console.log("swapped");
        };
    });

    socket.on('cut', function(data) {
        console.log("cut between pgm and preview")
    });
});

