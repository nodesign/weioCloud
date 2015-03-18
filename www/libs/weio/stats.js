/**
 *
 * WEIO Web Of Things Platform
 * Copyright (C) 2013 Nodesign.net, Uros PETREVSKI, Drasko DRASKOVIC
 * All rights reserved
 *
 *               ##      ## ######## ####  #######  
 *               ##  ##  ## ##        ##  ##     ## 
 *               ##  ##  ## ##        ##  ##     ## 
 *               ##  ##  ## ######    ##  ##     ## 
 *               ##  ##  ## ##        ##  ##     ## 
 *               ##  ##  ## ##        ##  ##     ## 
 *                ###  ###  ######## ####  #######
 *
 *                    Web Of Things Platform
 *
 * WEIO is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * WEIO is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * This file is part of WEIO.
 *
 * Authors : 
 * Uros PETREVSKI <uros@nodesign.net>
 * Drasko DRASKOVIC <drasko.draskovic@gmail.com>
 * 
 *
 **/

var statSocket;
var cpuViz;
var ramViz;
var flashViz;
var tempViz;

var serverProcessRunning = false;

var defs = {
	//Boolean - Whether we should show a stroke on each segment
	segmentShowStroke : true,
	
	//String - The colour of each segment stroke
	segmentStrokeColor : "#fff",
	
	//Number - The width of each segment stroke
	segmentStrokeWidth : 2,
	
	//The percentage of the chart that we cut out of the middle.
	percentageInnerCutout : 50,
	
	//Boolean - Whether we should animate the chart	
	animation : true,
	
	//Number - Amount of animation steps
	animationSteps : 100,
	
	//String - Animation easing effect
	animationEasing : "easeOutBounce",
	
	//Boolean - Whether we animate the rotation of the Doughnut
	animateRotate : true,
    
	//Boolean - Whether we animate scaling the Doughnut from the centre
	animateScale : false,
	
	//Function - Will fire on animation completion.
	onAnimationComplete : null
}

/**
 * Global configuration
 */
var confFile;

/*
 * When all DOM elements are fully loaded
 */
$(document).ready(function () {
	cpuViz = new Chart(document.getElementById("cpuViz").getContext("2d"));
    ramViz = new Chart(document.getElementById("ramViz").getContext("2d"));
    flashViz = new Chart(document.getElementById("flashViz").getContext("2d"));
    tempViz = new Chart(document.getElementById("tempViz").getContext("2d"));
               
    /** Get global configuration */
    $.getJSON('config.json', function(data) {
                confFile = data;
                var http_prefix = "http://";

                if (confFile.https == "YES") {
                    http_prefix = "https://";
                }
                else {
                    http_prefix = "http://";
                }
                /*
                * SockJS object, Web socket
                */
                statSocket = new SockJS(http_prefix + location.host + '/stats');
                            
                //////////////////////////////////////////////////////////////// SOCK JS STATS        
            
                /*
                * On opening of wifi web socket ask server to scan wifi networks
                */
                statSocket.onopen = function() {
                    console.log('stats Web socket is opened');
                
                };
                
                /*
                * Dashboard parser, what we got from server
                */
                statSocket.onmessage = function(e) {
                    //console.log('Received: ' + e.data);
                    
                    // JSON data is parsed into object
                    data = JSON.parse(e.data);
                    console.log(data);
                    
                    // switch
                    if ("requested" in data) {
                        // this is instruction that was echoed from server + data as response
                        instruction = data.requested;  
                        if (instruction in callbacksStats) 
                            callbacksStats[instruction](data);
                    } else if ("serverPush" in data) {
                        // this is instruction that was echoed from server + data as response
                        instruction = data.serverPush;  
                        if (instruction in callbacksStats) 
                            callbacksStats[instruction](data);
                    }
                };
                
                statSocket.onclose = function() {
                    console.log('Stats Web socket is closed');
                };

    }); /** getJSON */
});




function updateDataViz(data) {
    
    var cpu = data.data.cpu;
    var ram = data.data.ram;
    var flash = data.data.flash;
    var temperature = data.data.temperature;
    //console.log(cpu, " " , ram, " ", flash);
    
    var cpuData = getCpu(cpu);
    var ramData = getRam(ram);
    var flashData = getFlash(flash);
    var tempData = getTemperature(temperature)


    $("#cpuUser").html(cpu.user + "%");
    $("#cpuSystem").html(cpu.system + "%");
    $("#cpuIdle").html(cpu.idle + "%");
    
    $("#ramUsed").html(ram.used + "Mb");
    $("#ramFree").html(ram.free + "Mb");
    
    $("#flashUsed").html(flash.used + "Mb");
    $("#flashFree").html(flash.free + "Mb");
    
    $("#temperature").html(temperature + "°C");
    
   
    cpuViz.Doughnut(cpuData, defs);
    // Call this only one in previous objet otherwise it will create 3 separate calls on server
    defs.onAnimationComplete = null;
    
    ramViz.Doughnut(ramData, defs);
    flashViz.Doughnut(flashData, defs);
    tempViz.Doughnut(tempData, defs);
}


function getCpu(cpu) {
    
    var cpuData = [
    // CPU
    {
    value: cpu.user,
    color : "#f85c32"
    },
    {
    value : cpu.system,
    color:"#3CDDF7"
    },
    {
    value : cpu.idle,
    color : "#383838"
    }
    ];

    return cpuData;
}

function getRam(ram) {
    var ramData = [
        // RAM
        {
            value: parseFloat(ram.free),
            color:"#3CDDF7"
        },
        {
            value : parseFloat(ram.used),
            color : "#f85c32"
        }
        ];
    return ramData;
}

function getFlash(flash) {
    var flashData = [
    // FLASH
    {
        value: parseFloat(flash.free),
        color:"#3CDDF7"
    },
    {
        value : parseFloat(flash.used),
        color : "#f85c32"
    }
    ];
    return flashData;
}

function getTemperature(t) {
    
    var temp = [
    // CPU
    {
    value: t,
    color : "#f85c32"
    },
    {
    value : 60-t,
    color : "#383838"
    }
    ];

    return temp;
}



function animateDataViz(data) {
    defs.onAnimationComplete = requestPeriodicStats;
    defs.animation = true;
    
    serverProcessRunning==false;
    
    updateDataViz(data);
 
}


function requestPeriodicStats() {
    if (serverProcessRunning==false) {
        var rq = { "request": "getTopPeriodic"};
        statSocket.send(JSON.stringify(rq));
            
        defs.onAnimationComplete = null;
        defs.animation = false;
        
        serverProcessRunning = true;
    }
}


function stopDataViz() {
    var rq = { "request": "stopTopPeriodic"};
    statSocket.send(JSON.stringify(rq));
    serverProcessRunning = true;
    
}


//CALLBACKS////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Define callbacks here and request keys
 * Each key is binded to coresponding function
 */
var callbacksStats = {
    "getTop": animateDataViz,
    "getTopPeriodic": updateDataViz,
    "stopTopPeriodic" : deblockInterface
}


function startDataViz() {
    
    var rq = { "request": "getTop"};
    statSocket.send(JSON.stringify(rq));
    console.log("GET TOP ", serverProcessRunning);

}


function deblockInterface(data) {
    console.log("STOPed PERIODIC");
    serverProcessRunning = false;
}



