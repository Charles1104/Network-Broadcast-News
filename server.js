// Load the server library
const net = require("net");

// Keep track of users
let users = [];

// Define the port
let port = 6969;

// Define guestId
let guestId = 0;

// Start a server
const server = net.createServer((socket) => {
  // Increment the guest ID so that each connection has a different ID
  guestId++;

  //Identify the user
  socket.name = "User" + guestId;
  let userName = socket.name;

  // Put the user in the array
  users.push(socket);

  // Send welcome message to the user
  socket.write("welcome "+ userName + "\n");

  // Console log a message to the server
  process.stdout.write(userName + " has just connected \n");

  // Broadcast to others excluding this socket
  broadcast(userName, userName + " joined the chat\n");

  // Handle incoming messages from clients
  socket.on("data",function (data){

    let message = userName + ">" + data;

    // Send the message to all the other clients
    broadcast(userName, message);

    // Log it to the server output
    process.stdout.write(message);
  });

  // When user leaves
  socket.on("end", function(){

    let message = userName + ">" + "left this chat\n";

    //Log it to the server output
    process.stdout.write(message);

    //Remove client from users array
    removeSocket(socket);

    //notify all clients
    broadcast(userName, message);
  });

});

// Send a message to all clients except the sender
function broadcast(from, message){

  //If there are no users, then don't broadcast any messages and log out a message to the server
  if (users.length === 0){
    process.stdout.write("Everyone left the chat");
    return;
  }

  // If there are users in the chat, then send the messages
  users.forEach(function(socket){
    if(socket.name === from) return;

    socket.write(message);
  });
}

// Remove disconnected user from the users array
function removeSocket(socket){
  users.splice(users.indexOf(socket),1);
}

// Upon connecting for the first time, will display a message of the server link
server.listen(port, () => {
  console.log("server listening at http://localhost:" + port);
});

