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

var async = require('async'), socketio = require('socket.io');
var express = require('express'), app = express(), server = http.createServer(app);
var io = require('socket.io').listen(server, { 'destroy upgrade': false });
io.configure(function () {
  io.set('transports', ['websocket', 'xhr-polling']);
  //io.enable('log');
  io.set('log level', 5);
});
//var melted_node = require('melted-node');

//var mlt = new melted_node('ctl.journostream.org.au', 5250);

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

server.listen(process.env.PORT);
var addr = server.address().address;
console.log('Started listening on: '.concat(addr).concat(':').concat(process.env.PORT));

setTimeout(function() {
    currentPgmTimecode.add("00:00:00:01");
    io.sockets.emit('pgmTimecode', {unit: "1", timecode: currentPgmTimecode.toString()} );
}, 40 );

io.sockets.on('connection', function(socket) {
    console.log("Got connection...");
    socket.on("cutPGM", function(data) {
        console.log("cutPGM: "+data);
        //socket.broadcast.emit('onNoteCreated', data);
    });

    socket.on("cutPreview", function(data) {
        console.log("cutPreview: "+data);
        //socket.broadcast.emit('onNoteUpdated', data);
    });

    socket.on('mix', function(data) {
        socket.broadcast.emit('onNoteDeleted', data);
    });

    socket.on('cut', function(data) {
        socket.broadcast.emit('onNoteMoved', data);
    });
});

