const app = require("express")();
const cors = require('cors')
const server = require("http").createServer(app);
const io = require("socket.io")(server);
var os = require('os');


app.use(cors());

var ips;
// getlocalip
function getLocalAddress() {
  ips = [];
  var ifacesObj = {}
  ifacesObj.ipv4 = [];
  ifacesObj.ipv6 = [];
  var interfaces = os.networkInterfaces();
  for (var dev in interfaces) {
    interfaces[dev].forEach(function (details) {
      if (!details.internal) {
        switch (details.family) {
          case "IPv4":
            ifacesObj.ipv4.push({ name: dev, address: details.address });
            ips.push(details.address);
            break;
          case "IPv6":
            ifacesObj.ipv6.push({ name: dev, address: details.address })
            break;
        }
      }
    });
  }
  return ifacesObj;
};

// getlocalip
getLocalAddress();

// routing
app.get("/getlocalip", (req, res) => {
  res.set({ 'Access-Control-Allow-Origin': '*' });
  res.send(getLocalAddress());
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/commander.js", (req, res) => {
  res.sendFile(__dirname + "/commander.js");
});
app.get("/index.css", (req, res) => {
  res.sendFile(__dirname + "/index.css");
});
app.get("/feedbackchan.js", (req, res) => {
  res.sendFile(__dirname + "/feedbackchan.js");
});
app.get("/img/youtube_social_icon_red.png", (req, res) => {
  res.sendFile(__dirname + "/img/youtube_social_icon_red.png");
});

// events
io.on("connection", (socket) => {
  console.log("New user connected.");
  io.emit("new_connection", "new user connected.");

  socket.on("post", (msg) => {
    io.emit("member-post", msg);
  });
  socket.on("getip", (msg) => {
    io.emit("ip", {
      command: "ip",
      ips: ips,
    });
  });
  
});

// start server 
port = 4000;
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});