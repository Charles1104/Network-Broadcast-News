const net = require('net');

const client = net.connect({port: 6969, host: "10.0.2.15"}, () => {
  console.log('connected to server');

  //Listen to the data the user is inputting
  process.stdin.on('data',(chunk) =>{
    client.write(chunk.toString().toLowerCase());
  });

  // Listen to data coming from the server
  client.on('data', data =>{
    process.stdout.write(data);
  });

  //When the server ends the connection
  client.on("end", () => {
    console.log("connection closed, come back later");
  });

});