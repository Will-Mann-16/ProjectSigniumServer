var express = require('express');
var crud = require("./crud");
var verifyToken = require("./auth").verifyToken;
var apiRoutes = express.Router();
var studentRoutes = express.Router();
var userRoutes = express.Router();
var locationRoutes = express.Router();
var houseRoutes = express.Router();
var historyRoutes = express.Router();
var calloverRoutes = express.Router();
var calenderRoutes = express.Router();

userRoutes.post("/create", verifyToken, function (req, res) {
    var user = {
        username: req.body.user.username.toLowerCase(),
        password: req.body.user.password,
        role: req.body.user.role,
        house: req.body.user.house,
        firstname: req.body.user.firstname,
        surname: req.body.user.surname
    }
    crud.createUser(user, function (response, status) {
        res.status(status).json(response);
    });
});
userRoutes.post("/read", function (req, res) {
    var jwt_key = req.body.jwt;
    crud.readUser(jwt_key, crud.readConfigUser,function (response, status) {
        res.status(status).json(response);
    });
});
userRoutes.post("/update", verifyToken, function (req, res) {
    crud.updateUser(req.body.id, req.body.user, function (response, status) {
        res.status(status).json(response);
    });
});

userRoutes.get("/delete", verifyToken, function (req, res) {
    crud.deleteUser(req.query.id, function (response, status) {
        res.status(status).json(response);
    });
});
userRoutes.post("/authenticate", function (req, res) {
    var username = req.body.username.toLowerCase();
    var password = req.body.password;
    crud.authenticateUser(username, password, function (response, status) {
        res.status(status).json(response);
    });
});
userRoutes.get("/read-config", verifyToken, function (req, res) {
    crud.readConfigUser(req.query.house, function (response, status) {
        res.status(status).json(response);
    });
});


studentRoutes.post("/create",verifyToken, function (req, res) {
    crud.createStudent(req.body.student, function (response, status) {
        res.status(status).json(response);
    });
});

studentRoutes.get("/read", verifyToken,function (req, res) {
    var minor = req.query.minor;
    var house = req.query.house;
    crud.readStudents(minor, house, function (response, status) {
        res.status(status).json(response);
    });
});

studentRoutes.post("/update", verifyToken,function (req, res) {
    crud.updateStudent(req.body.id, req.body.student, function (response, status) {
        res.status(status).json(response);
    });
});

studentRoutes.get("/update-location", verifyToken,function (req, res) {
    crud.updateStudentLocation(req.query.ids, JSON.parse(req.query.location), function (response, status) {
        res.status(status).json(response);
    }, crud.createHistory);
});

studentRoutes.get("/delete", verifyToken,function (req, res) {
    crud.deleteStudent(req.query.id, function (response, status) {
        res.status(status).json(response);
    });
});
studentRoutes.post("/upload", verifyToken,function (req, res) {
    var sent = false;
    crud.uploadStudents(req.body.json, req.body.house, function (response, status) {
        if (!sent) {
            res.status(status).json(response);
            sent = true;
        }
    });
});

locationRoutes.post("/create", verifyToken,function (req, res) {
    crud.createLocation(req.body.location, function (response, status) {
        res.status(status).json(response);
    });
});
locationRoutes.get("/read", verifyToken,function (req, res) {
    crud.readLocations(req.query.house, function (response, status) {
        res.status(status).json(response);
    });
});
locationRoutes.post("/update", verifyToken,function (req, res) {
    crud.updateLocation(req.body.id, req.body.location, function (response, status) {
        res.status(status).json(response);
    });
});
locationRoutes.get("/delete", verifyToken,function (req, res) {
    crud.deleteLocation(req.query.id, function (response, status) {
        res.status(status).json(response);
    });
});

houseRoutes.post("/create",verifyToken, function (req, res) {
    crud.createHouse(req.body.house, function (response, status) {
        res.status(status).json(response);
    });
});
houseRoutes.get("/read",verifyToken, function (req, res) {
    crud.readHouses(function (response, status) {
        res.status(status).json(response);
    });
});
houseRoutes.post("/update", verifyToken,function (req, res) {
    crud.updateHouse(req.body.id, req.body.house, function (response, status) {
        res.status(status).json(response);
    });
});
houseRoutes.get("/delete", verifyToken,function (req, res) {
    crud.deleteHouse(req.query.id, function (response, status) {
        res.status(status).json(response);
    });
});
houseRoutes.post("/update-config", verifyToken,function (req, res) {
    crud.updateHouseConfig(req.body.house, req.body.config, function (response, status) {
        res.status(status).json(response);
    });
});

historyRoutes.get("/read", verifyToken,function (req, res) {
    crud.readHistory(req.query.filter, req.query.amount, req.query.house, function (response, status) {
        res.status(status).json(response);
    });
});

calloverRoutes.post("/create",verifyToken, function (req, res) {
    crud.createCallover(req.body.callover, function (response, status) {
        res.status(status).json(response);
    });
});
calloverRoutes.get("/read", verifyToken,function (req, res) {
    crud.readCallover(req.query.house, function (response, status) {
        res.status(status).json(response);
    })
});
calenderRoutes.post("/create", verifyToken, function (req, res) {
    crud.createCalender(req.body.event, function (response, status) {
        res.status(status).json(response);
    });
});
calenderRoutes.get("/read", verifyToken, function(req, res){
   crud.readCalender(req.query.house, function(response, status){
       res.status(status).json(response);
   })
});
calenderRoutes.post("/update", verifyToken, function(req, res){
    crud.updateCalender(req.body.id, req.body.event, function(response, status){
        res.status(status).json(response);
    });
});
calenderRoutes.get("/delete", verifyToken, function(req, res){
    crud.deleteCalender(req.query.id, function(response, status){
        res.status(status).json(response);
    });
});
apiRoutes.use('/students', studentRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/locations', locationRoutes);
apiRoutes.use('/houses', houseRoutes);
apiRoutes.use('/history', historyRoutes);
apiRoutes.use('/callover', calloverRoutes);
apiRoutes.use('/calender', calenderRoutes);
module.exports = {
    routes: apiRoutes
}