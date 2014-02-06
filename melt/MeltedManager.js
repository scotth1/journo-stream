//
//         Copyright 2014 Scott Hamilton
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

var melted_node = require('melted-node'), tc = require('timecode').Timecode;
var winston = require('winston');

var logger = new (winston.Logger)({
        transports: [
            new winston.transports.Console({
                colorize: true,
                level: 'warn',
                timestamp: true
            }),
            new (winston.transports.File)({
                filename: './logs/melted-node.log',
                handleExceptions: true,
                level: 'info',
                timestamp: true,
                json: false,
                maxsize: 1024000,
                maxFiles: 5
            })
        ],
        exitOnError: false
    });

var mlt = new melted_node('localhost', 5250, logger);



exports.listUnits = function() {
    
}

exports.startUnit = function() {
    
}

exports.cutStream = function(newClipIdx) {
    
}

exports.setLoop = function(unit) {
    mlt.sendCommand("USET U"+unit+" eof=loop");
}

exports.getUnitStatus = function(unit) {
    return mlt.sendCommand("USTA U0").then(function(response){
        //console.log("USTA result: "+response);
        var split = response.split("\r\n");
        //console.log("USTA split len: "+split.length);
        var retStatus = undefined;
        
        if (split.length>=2) {
            //console.log("SPLIT: "+split[1]);
            var parse = split[1].match(/([0-9]*) ([A-Za-z]*) (\"[A-Za-z0-9\.\/\_\- ]*\") ([0-9]*) ([0-9]*) ([0-9\.]*) ([0-9]*) ([0-9]*)/);
            //var parse = split[1].split(" ");
            //console.log("SPLIT split len: "+parse.length);
            if (parse.length>=6) {
                //console.log("We have enough to make object...");
                var status       = parse[2];
                //console.log("  got [2] = "+status);
                // remove sorrounding " from filename
                var file         = parse[3].replace(/^"|"$/g,'');
                //console.log("  got [3] = "+file);
                //console.log("  got [3] = "+parse[3]);
                var currentFrame = parseInt(parse[4]);
                //console.log("  got [4] = "+currentFrame);
                var fps          = parse[5];
                //console.log("  got [5] = "+fps);
                //var inPoint      = parse[6];
                //console.log("  got [6]");
                //var outPoint     = parse[7];
                //console.log("  got [7]");
                //var length       = parse[8];
                //console.log("  got [8]");
                //var index        = parse[16];
                //console.log("  got [16]");
                var currentTime = tc.init({framerate: "25", timecode: currentFrame});
                //console.log("currentTimecode: "+currentTime.toString());
                retStatus = {unit: unit, status: status, file: file, timecode: currentTime.toString()}; 
            }
        }
        //console.log("USTA: "+retStatus.toString());
        return retStatus;
    });
    
}

exports.getClipList = function(unit) {
    return mlt.sendCommand("LIST U0").then(function(response) {
        var retList = [];
        
        var split = response.split("\r\n");
        console.log("LIST split len: "+split.length);
        if (split.length>=2) {
            console.log("SPLIT: "+split[1]);
            
        }
        return retList;
    });
}