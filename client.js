const net = require('net');

const client = net.connect({port: 6969}, () => {
  console.log('connected to server');

  //Listen to the data the user is inputting
  process.stdin.on('data',(chunk) =>{
    client.write(chunk.toString());
  });

  // Listen to data coming from the server
  client.on('data', data =>{
    console.log(data.toString());
  });

  //When the server ends the connection
  client.on("end", () => {
    console.log("connection closed, come back later");
  });

});