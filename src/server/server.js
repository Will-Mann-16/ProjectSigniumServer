var bodyParser = require("body-parser");
var express = require('express');
var app = express();
var http = require("http");
var server = http.createServer(app);
var io = require('socket.io')(server);

//var uri = 'mongodb://127.0.0.1:27017';
var uri = 'mongodb://127.0.0.1:27017/project-signium'
//var uri = 'mongodb://ridge-mongodb:jL74RbgxKAcBoQx8xChqtcQmUkR0ecixULdp8sfH4xpdkU4TXAkpyjk3DxqHDmE3Iby6HhaCCOOH5grAWFIQmw==@ridge-mongodb.documents.azure.com:10255/ridge-wellington?ssl=true&sslverifycertificate=false';

//var uri = 'mongodb://RIDGE:C0d1ngG33k@ridgewelly-shard-00-00-lamqk.mongodb.net:27017,ridgewelly-shard-00-01-lamqk.mongodb.net:27017,ridgewelly-shard-00-02-lamqk.mongodb.net:27017/test?ssl=true&replicaSet=RIDGEWelly-shard-0&authSource=admin'

var mongoose = require("mongoose");
mongoose.connect(uri);
var db = mongoose.connection;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var crud = require("./crud");


db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log("DB opened");
    var routes = require("./routes");
    app.use("/api", routes.routes)
});

io.on("connect", function (socket) {
    var socketHouse;
    console.log("Socket Connected");
    socket.on("socket-client-server-init", function (packet) {
        socketHouse = packet.house;
        socket.emit("socket-server-client-init");
    });
    socket.on("socket-client-server-redraw-major", function () {
        io.sockets.emit("socket-server-client-redraw-major", {house: socketHouse});
    });
    socket.on("socket-client-server-redraw-minor", function () {
        io.sockets.emit("socket-server-client-redraw-minor", {house: socketHouse});
    });
    socket.on("disconnect", function () {

    });
    socket.on("socket-client-server-app-authenticate", function (packet) {
        crud.appAuthenticateStudent(packet.username, packet.password, function (response) {
            socket.emit("socket-server-client-app-authenticate", response);
        });
    });
    socket.on("socket-client-server-app-read-token", function (packet) {
        crud.appReadStudentToken(packet.token, function (response) {
            socket.emit("socket-server-client-app-read-token", response);
        });
    });
    socket.on("socket-client-server-app-read-major", function (packet) {
        crud.appReadStudent(packet.id, false, function (response) {
            socket.emit("socket-server-client-app-read-major", response);
        });
    });
    socket.on("socket-client-server-app-read-minor", function (packet) {
        crud.appReadStudent(packet.id, true, function (response) {
            socket.emit("socket-server-client-app-read-minor", response);
        });
    });
    socket.on("socket-client-server-app-read-locations", function (packet) {
        crud.readLocations(packet.house, function (response) {
            socket.emit("socket-server-client-app-read-locations", response);
        });
    });
    socket.on("socket-client-server-app-update-location", function (packet) {
        crud.appUpdateStudentLocation(packet.studentID, packet.locationID, function (response) {
            socket.emit("socket-server-client-app-update-location", response);
        }, crud.createHistory);
    });
});

server.listen(8081);
