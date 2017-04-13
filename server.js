// Load the server library
const net = require("net");

// Keep track of users
let users = [];

// Define the port
let port = 6969;

// Start a server
const server = net.createServer((socket) => {

  // Put the user in the array
  users.push(socket);

  // Send welcome message to the user
  socket.write("welcome Unknown person. \nPlease enter your nickname and start with # \n ");

  // Register the user and handle incoming messages from clients
  socket.on("data",function (data){

    // Will check for user registration
    if(data.toString().slice(0,1) === "#"){
      //Check that [ADMIN] or ADMIN is not used as username
      if(data.toString().slice(1).replace(/(\r\n|\n|\r)/gm,"") === "[admin]" || data.toString().slice(1).replace(/(\r\n|\n|\r)/gm,"") === "admin"){
        socket.write("ADMIN cannot be included in your nickname \n");
      }
      else{
        socket.name = data.slice(1).toString().replace(/(\r\n|\n|\r)/gm,"");

        let message1 = socket.name + " has just connected \n";
        let message2 = socket.name + " joined the chat\n";

        // Console log a message to the server
        process.stdout.write(message1);

        // Broadcast to others excluding this socket
        broadcast(socket.name, message2);
      }
    }

    else if(socket.name === undefined || socket.name === null){
      socket.write("Please enter a nickname before moving on with chatting\n");
    }

    else{
      let message = socket.name + ">" + data;

      // Send the message to all the other clients
      broadcast(socket.name, message);

      // Log it to the server output
      process.stdout.write(message);
    }
  });

  // When user leaves
  socket.on("end", function(){

    let message = socket.name + ">" + "left this chat\n";

    //Log it to the server output
    process.stdout.write(message);

    //Remove client from users array
    removeSocket(socket);

    //notify all clients
    broadcast(socket.name, message);
  });

  // Enable the server to write message
  process.stdin.on('data',(chunk) =>{
    users.forEach(function(socket){
      socket.write("[ADMIN] " + chunk.toString());
    });
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

