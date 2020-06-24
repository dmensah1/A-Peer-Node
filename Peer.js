//required imports
var ptpPkt = require('./PTPpacket'),
    singleton = require('./Singleton'),
    net = require('net'),
    minimist = require('minimist')(process.argv.slice(2)),
    path = require('path');

// required variable declarations
let arg = process.argv;
let dirID = path.basename(path.dirname(__filename));

let maxPeers = 2;
let pCount = 0;

// to store ip and port #'s of peers joining
let ips = [];
let ports = [];


let HOST = '127.0.0.1',
    pServer = net.createServer();
    pServer.listen(0, HOST);

if(arg.length <= 2) {
    //handling the server side
    pServer.on('listening', (sock) => {
        console.log('This peers address is ' + HOST + ': ' + pServer.address().port + ' located on ' + dirID);
    });
} else {
    let server = minimist.p.split(':');
    let pClient = new net.Socket();
    pClient.connect(server[1], server[0]);

    pClient.on('data', (data) => {
        //slicing incoming data
        let packet = data.slice(0, 3).readUIntBE(0, 3),
			msgType = data.slice(3, 4).readUIntBE(0, 1),
			sender = data.slice(4, 8),
			noPeers = data.slice(8, 12).readUIntBE(0, 4),
			portNum = data.slice(14, 16).readUIntBE(0, 2),
            ipAddr = data.slice(16).readUIntBE(0, 4);
            
            if(packet == 3314) {
                //printing the connection to console
                console.log('Connected to peer ' + sender + ':' + server[1] + ' at time: ' + singleton.getTimestamp());
			    console.log('This peer address is ' + HOST + ':' + pServer.address().port + ' located at ' + dirID);
                console.log('Received acknowledgment from ' + sender + ':' + server[1]);
                
                if(noPeers == 1){
                    console.log('	which is peered with: ' + intToString(ipAddr) + ':' + portNum);
                }
                
                //Peer table is full here
                if(msgType == 2){
                    console.log('Joining redirected, try to connect to the peer above');
                    pClient.destroy();
                }
            }
    });

    pClient.on('close', () => {
        process.exit(1);
    });
}

pServer.on('connection', (sock)=> {
    let ip = sock.remoteAddress;
    let PORT = sock.remotePort - 1;

    //when peer table is full
    if(pCount >= maxPeers){
        console.log('The peer table is full: ' +ip+ ': ' +PORT+'has been redirected.');
        ptpPkt.init(3314, 2, dirID, 1, 0, ports[0], stringToInt(ips[0]));
    } else if (pCount > 0) {
        //accepting a peer
        console.log('Connected from peer ' +ip+ ': ' +PORT);
        pCount = pCount + 1;
        ips.push(ip);
        ports.push(PORT);
        ptpPkt.init(3314, 1, dirID, 1, 0, ports[0], stringToInt(ips[0]));
    } else {
        console.log('Connected from peer ' +ip+ ': '+ PORT);
        pCount = pCount + 1;
        ips.push(ip);
        ports.push(PORT);
        ptpPkt.init(3314, 1, dirID, 0, 0, 0, 0);
    }

    sock.write(ptpPkt.getPacket());
});

//Transforming the ip address from string to integer
function stringToInt(addr){
    var i = addr.split('.');
    return ((((((+i[0])*256)+(+i[1]))*256)+(+i[2]))*256)+(+i[3]);
}

//opposite of above function
function intToString(addr){
    var i = addr%256;
    for (var x = 3; x > 0; x--){
        addr = Math.floor(addr/256);
        i = addr%256 + '.' + i;
    }
    return i;
}