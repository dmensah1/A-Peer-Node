// allocating the size (in bytes) of each field of packet
let packet = Buffer.alloc(3),
            msgType = Buffer.alloc(1),
            sender = Buffer.alloc(4),
            noPeers = Buffer.alloc(4),
            reserved = Buffer.alloc(2),
            portNum = Buffer.alloc(2),
            ipAddr = Buffer.alloc(4);

let pkt;

module.exports = {
    //to initialize the packet
    init: function(pack, type, send, num, res, port, ip) {
        packet.writeUIntBE(pack, 0, 3);
        msgType.writeUIntBE(type, 0, 1);
        sender.write(send, 0, 4, 'utf8');
        noPeers.writeUIntBE(num, 0, 4);
        reserved.writeUIntBE(res, 0, 2);
        portNum.writeUIntBE(port, 0, 2);
        ipAddr.writeUIntBE(ip, 0 , 4);

        // storing the total size of the packet
        const totalSize = packet.length + msgType.length + sender.length + noPeers.length + reserved.length + portNum.length + ipAddr.length;

        // concatinating the different fields into one single packet
        pkt = Buffer.concat([packet,msgType, sender,noPeers,reserved,portNum, ipAddr], totalSize);

    },

    //returns the total length of the ITP packet
    getLength: function() {
        // length of the pkt is that of the entire packet minus the length of the payload (img data)
        let length = pkt.length - imgContent.length;
        return length;
    },

    //returns the entire packet
    getPacket: function() {
        return pkt;
    }
};