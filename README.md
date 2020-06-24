# A-Peer-Node
A peer-to-peer program in which a peer that receives a join request will accept the peer if and only if its peer table is not full.

# Running the Program
Open a command prompt and run the command: node peer
Next open another command prompt and run the command:

node peer -p ____________

where the ______ will be the ip address and port number of the first peer seen in the command prompt, in the format: ip-address:port-number.
Can open other command prompts and connect them to the peers until their peer tables are full. Once the peer table is full, that peer should be redirected to connect to another peer.
