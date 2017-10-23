var express = require('express');
var crud = require("./crud");



var apiRoutes = express.Router();
var studentRoutes = express.Router();
var userRoutes = express.Router();
var locationRoutes = express.Router();
var houseRoutes = express.Router();
var historyRoutes = express.Router();

userRoutes.post("/create", function(req, res) {
    var user = {
        username: req.body.params.user.username.toLowerCase(),
        password: req.body.params.user.password,
        role: req.body.params.user.role,
        _house: req.body.params.user._house,
        firstname: req.body.params.user.firstname,
        surname: req.body.params.user.surname
    }
    crud.createUser(user, function(response){
        res.json(response);
    });
});
userRoutes.post("/read", function(req, res) {
    var jwt_key = req.body.params.jwt;
    crud.readUser(jwt_key, function(response){
        res.json(response);
    });
});
userRoutes.post("/update", function(req, res) {
    crud.updateUser(req.body.params.id, req.body.params.user, function(response){
        res.json(response);
    });
});

userRoutes.get("/delete", function(req, res) {
    crud.deleteUser(req.query.id, function(response){
        res.json(response);
    });
});
userRoutes.post("/authenticate", function(req, res) {
    var username = req.body.params.username.toLowerCase();
    var password = req.body.params.password;
    crud.authenticateUser(username, password, function(response){
        res.json(response);
    });
});


studentRoutes.post("/create", function(req, res) {
    crud.createStudent(req.body.params.student, function(response){
        res.json(response);
    });
});

studentRoutes.get("/read", function(req, res) {
    var minor = req.query.minor;
    var house = req.query.house;
    crud.readStudents(minor, house, function(response){
        res.json(response);
    });
});

studentRoutes.post("/update", function(req, res) {
    crud.updateStudent(req.body.params.id, req.body.params.student, function(response){
        res.json(response);
    });
});

studentRoutes.get("/update-location", function(req, res) {
    crud.updateStudentLocation(req.query.ids, JSON.parse(req.query.location), function(response){
        res.json(response);
    }, crud.createHistory);
});

studentRoutes.get("/delete", function(req, res) {
    crud.deleteStudent(req.query.id, function(response){
        res.json(response);
    });
});
studentRoutes.post("/upload", function(req, res) {
    var sent = false;
    crud.uploadStudents(req.body.params.json, req.body.params.house, function(response){
        if(!sent){
            res.json(response);
            sent = true;
        }
    });
});

locationRoutes.post("/create", function(req, res) {
    crud.createLocation(req.body.params.location, function(response){
        res.json(response);
    });
});
locationRoutes.get("/read", function(req, res) {
    crud.readLocations(req.query.house, function(response){
        res.json(response);
    });
});
locationRoutes.post("/update", function(req, res) {
    crud.updateLocation(req.body.params.id, req.body.params.location, function(response){
        res.json(response);
    });
});
locationRoutes.get("/delete", function(req, res) {
    crud.deleteLocation(req.query.id, function(response){
        res.json(response);
    });
});

houseRoutes.post("/create", function(req, res) {
    crud.createHouse(req.body.params.house, function(response){
        res.json(response);
    });
});
houseRoutes.get("/read", function(req, res) {
    crud.readHouses(function(response){
        res.json(response);
    });
});
houseRoutes.post("/update", function(req, res) {
    crud.updateHouse(req.body.params.id, req.body.params.house, function(response){
        res.json(response);
    });
});
houseRoutes.get("/delete", function(req, res) {
    crud.deleteHouse(req.query.id, function(response){
        res.json(response);
    });
});

historyRoutes.get("/read", function(req, res){
    crud.readHistory(req.query.filter, req.query.amount, req.query.house, function(response){
        res.json(response);
    });
});

apiRoutes.use('/students', studentRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/locations', locationRoutes);
apiRoutes.use('/houses', houseRoutes);
apiRoutes.use('/history', historyRoutes);

module.exports = {
    routes: apiRoutes
}