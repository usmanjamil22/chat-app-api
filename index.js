const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require('socket.io')(server);
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./models");
const dbConfig = require("./config/db.config");
const authConfig = require("./config/auth.config.js");
const jwt = require("jsonwebtoken");
const { startChat, sendMessage, checkIfUserPartOfChat, joinGroupChat } = require("./lib/chat.lib");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");

require("dotenv").config();

const PORT = process.env.PORT || 8080;

db.mongoose
  .connect(dbConfig.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log(`Successfully connect to MongoDB.${conn.connection.host}`);
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// //app.use(express.static(__dirname + "/public"));

// //app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });

// app.get("/chat", function (req, res) {
//   res.sendFile(__dirname + "/chat.html");
// });

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

app.use("/api", authRoutes, userRoutes, chatRoutes);

let connections = [];
let rooms = [];

io.use(function(socket, next){
  if (socket.handshake.query && socket.handshake.query.token){
    jwt.verify(socket.handshake.query.token, authConfig.secret, function(err, decoded) {
      if (err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      next();
    });
  }
  else {
    next(new Error('Authentication error'));
  }
})
  .on('connection', function(socket) {
    connections.push(socket.decoded.id)

    console.log(connections);

    socket.on('join private room', function(targetUserId) {
      console.log(rooms);
      startChat(socket.decoded.id, targetUserId)
        .then(res => {
          const chatRoom = res.data;
          if (res.data) {
            socket.join(chatRoom.id)
            socket.emit('private room joined', chatRoom);
          }
        })
    });

    socket.on('send private message', function(chatId, message) {
      checkIfUserPartOfChat(socket.decoded.id, chatId)
        .then(isPartOfChat => {
          if (isPartOfChat) {
            sendMessage(chatId, socket.decoded.id, message)
              .then(res => {
                socket.to(chatId).emit('receive private message', message)
              })
          }
        })
    });

    socket.on('join public room', function(targetUserId) {
      console.log(rooms);
      joinGroupChat(socket.decoded.id, targetUserId)
        .then(res => {
          const chatRoom = res.data;
          if (res.data) {
            socket.join(chatRoom.id)
            socket.emit('public room joined', chatRoom);
          }
        })
    });

    socket.on('send public message', function(chatId, message) {
      checkIfUserPartOfChat(socket.decoded.id, chatId)
        .then(isPartOfChat => {
          if (isPartOfChat) {
            sendMessage(chatId, socket.decoded.id, message)
              .then(res => {
                socket.to(chatId).emit('receive public message', message)
              })
          }
        })
    });

    socket.on('disconnect', function() {
      let index = connections.indexOf(socket.decoded.id);

      if (index !== -1) connections.splice(index, 1);
    })
  });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
