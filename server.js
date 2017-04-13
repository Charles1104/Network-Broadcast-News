// Load the server library
const net = require("net");
// Keep track of users
let users = [];
// Define the port
let port = 6969;
// Start a server
let checkTime;
let word_limit_minute = 20;

const server = net.createServer((socket) => {

  // Put the user in the array
  users.push(socket);

  // Send welcome message to the user
  socket.write("welcome Unknown person. \nPlease enter your nickname and start with # \n ");

  // Register the user and handle incoming messages from clients
  socket.on("data",function (data){

    // Will check for user registration
    if(data.toString().slice(0,1) === "#"){
      console.log(users.map(function(socket){return socket.name;}).indexOf(data.toString().slice(1,-1)) !== -1);

      //Check if a user name already exists for this socket
      if(socket.name !== undefined){
        socket.write("You already have a username and you cannot change it \n");
      }
      //Check that [ADMIN] or ADMIN is not used as username
      else if(data.toString().slice(1).replace(/(\r\n|\n|\r)/gm,"") === "[admin]" || data.toString().slice(1).replace(/(\r\n|\n|\r)/gm,"") === "admin"){
        socket.write("ADMIN cannot be included in your nickname \n");
      }
      //Check if the username is already take
      else if(users.map(function(socket){return socket.name;}).indexOf(data.toString().slice(1,-1)) !== -1){
        socket.write("This username is already taken ! \n");
      }
      else{
        socket.name = data.slice(1,-1).toString();

        let message1 = socket.name + " has just connected \n";
        let message2 = socket.name + " joined the chat\n";
        // Console log a message to the server
        process.stdout.write(message1);
        // Broadcast to others excluding this socket
        broadcast(socket.name, message2);
      }
    }

    // Check if the user already registered
    else if(socket.name === undefined || socket.name === null){
      socket.write("Please enter a nickname before moving on with chatting\n");
    }

    // If the user is already registered and he doesn't try to change its username, then broadcast its message but only if the word limit is not exceeded
    else{
      //chekcs the time at which the user entered the message
      checkTime = Math.floor((new Date().getTime())/1000);
      socket[checkTime] = data.length - 1;

      //checks if the user hasn't passed over the maximum limit of words per minute
      if(checkLimit(checkTime, socket) === false){
        socket[checkTime] = 0;
        socket.write("You have exceeded the maximum limit of words per minute\n");
      } else{
        let message = socket.name + "> " + data;
        // Send the message to all the other clients
        broadcast(socket.name, message);
        // Log it to the server output
        process.stdout.write(message);
      }
    }
  });

  // When user leaves
  socket.on("end", function(){
    let message = socket.name + "> " + "left this chat\n";
    //Log it to the server output
    process.stdout.write(message);
    //Remove client from users array
    removeSocket(socket);
    //notify all clients
    broadcast(socket.name, message);
  });

});

// Upon connecting for the first time, will display a message of the server link
server.listen(port, () => {
  console.log("server listening at http://localhost:" + port);
});

// Enable the server to write message
process.stdin.on('data',(chunk) =>{
  //convert the data entered to a string in lowercase
  let data = chunk.toString().toLowerCase();
  //Check if the server wants to kick someone
  if(data.slice(0,4) === "kick"){
    //Action to carry out of the user to kick is part of the users array
    if(users.map(function(socket){
      return socket.name;
      }).indexOf(data.slice(5,-1)) !== -1){
      kickUser(data.slice(5,-1));
    } else{
      process.stdout.write("You need to enter a connected username to kick \n");
    }
  }
  else{
    broadcast(undefined, "[ADMIN] " + chunk.toString());
  }
});

// Send a message to all clients except the sender
function broadcast(from, message){
  //If there are no users, then don't broadcast any messages and log out a message to the server
  if (users.length === 0){
    process.stdout.write("Everyone left the chat \n");
    return;
  }
  // If there are users in the chat, then send the messages
  users.forEach(function(socket){
    if(socket.name === from || socket.name === undefined) return;
      socket.write(message);
  });
}

// Remove disconnected user from the users array
function removeSocket(socket){
  users.splice(users.indexOf(socket),1);
}

function kickUser(userName){
  users.forEach(function(socket){
    if(socket.name !== userName){
      socket.write(userName +"> has been kicked from the chat \n");
    } else{
      socket.write("I am kicking you \n");
      socket.end();
    }
  });
  process.stdout.write(userName + "> has been kicked from the chat \n");
}

function checkLimit(time, socket){
  let counter = 0;
  for (let i = time - 60; i <= time; i++){
    if(socket[i] === undefined){
      continue;
    }else {
      counter += socket[i];
    }
  }
  if (counter > word_limit_minute){
    return false;
  } else{
    return true;
  }
}

