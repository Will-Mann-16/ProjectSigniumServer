var config = require("./config");
var saltRounds = config.saltRounds;
var secretKey = config.secretKey;
var bcrypt = require('bcryptjs');

var jwt = require("jsonwebtoken");
var schema = require("./schema");

var User = schema.user;
var Student = schema.student;
var Location = schema.location;
var House = schema.house;
var History = schema.history;
var Callover = schema.callover;
var Calender = schema.calender;

//User
module.exports.createUser = function (user, callback) {
    bcrypt.hash(user.password, saltRounds, function (err, hash) {
        if (err) {
            callback({success: false, reason: err.message});
        }
        else {
            user.password = hash;
            User.create(user, function (error, nUser) {
                if (error) {
                    callback({success: false, reason: error.message}, 500);
                } else {
                    callback({success: true}, 200);
                }
            });
        }
    });
}
module.exports.readUser = function (jwt_key, getConfig, callback) {
    if (jwt_key) {
        jwt.verify(jwt_key, secretKey, function (err, decoded) {
            if (err) {
                callback({success: false, reason: err}, 500);
            } else {
                getConfig(decoded.data.house, function(response, status) {
                    if(response.success && status == 200){
                        callback({success: true, user: decoded, config: response.config}, 200);
                    }else{
                        callback({success: false, reason: response.reason});
                    }
                });
            }
        });
    } else {
        callback({success: false, empty: true}, 403);
    }
}
module.exports.updateUser = function (id, user, callback) {
    if (user.password != "") {
        bcrypt.hash(user.password, saltRounds, function (err1, hash) {
            if (err1) {
                callback({success: false, reason: err1.message}, 500);
            }
            else {
                user.password = hash;
                User.findByIdAndUpdate(id, user, function (err, user) {
                    if (err) {
                        callback({success: false, reason: err.message}, 500);
                    } else {
                        callback({
                            success: true, token: jwt.sign({
                                data: user
                            }, secretKey)
                        }, 200);
                    }
                });
            }
        });
    }
    else {
        User.findByIdAndUpdate(id, user, function (err, user) {
            if (err) {
                callback({success: false, reason: err.message}, 500);
            } else {
                callback({
                    success: true, token: jwt.sign({
                        data: user
                    }, secretKey)
                }, 200);
            }
        });
    }
}
module.exports.deleteUser = function (id, callback) {
    User.findByIdAndRemove(id, function (err, user) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true}, 200);
        }
    });
}
module.exports.authenticateUser = function (username, password, callback) {
    var success = true;
    User.findOne({'username': username}, function (err, hash) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
            success = false;
        }
        if (success && hash != null) {
            bcrypt.compare(password, hash.password, function (err, result) {
                if (err && success) {
                    callback({success: false, reason: err.message}, 500);
                    success = false;
                }
                if (result && success) {
                    User.findOne({"username": username}, function (err1, user) {
                        if (err1 && success) {
                            callback({success: false, reason: err1.message}, 500);
                            success = false;
                        } else if (success) {
                            delete user.password;
                            callback({
                                success: true,
                                authenticated: true,
                                token: jwt.sign({
                                    data: user
                                }, secretKey)
                            }, 200);
                        }
                    });

                } else if (success && !result) {
                    callback({success: true, authenticated: false}, 403);
                }
            });
        }
    });
}
module.exports.readConfigUser = function (house, callback) {
    House.findById(house, function (err, resHouse) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true, config: resHouse.config}, 200);
        }
    });
}

//Student
module.exports.createStudent = function (student, callback) {
    console.log(student);
    var newStudent = Student.create(student, function (err, student) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true}, 200);
        }
    });
}
module.exports.readStudents = function (minor, house, callback) {
    if (minor) {
        Student.find({
            "_house": house
        }, 'location timelastout', {sort: {yeargroup: -1, surname: 1}}, function (err, students) {
            if (err) {
                callback({success: false, reason: err.message}, 500);
            } else {
                callback({success: true, students: students}, 200);
            }
        });
    } else {
        Student.find({
            "_house": house
        }, null, {sort: {yeargroup: -1, surname: 1}}, function (err, students) {
            if (err) {
                callback({success: false, reason: err.message}, 500);
            } else {
                callback({success: true, students: students}, 200);
            }
        });
    }
}
module.exports.updateStudent = function (id, student, callback) {
    if (student.password !== "") {
        bcrypt.hash(student.password, saltRounds, function (err, hash) {
            student.password = hash;
            Student.findByIdAndUpdate(id, student, function (err, student) {
                if (err) {
                    callback({success: false, reason: err.message}, 500);
                } else {
                    callback({success: true, student: student}, 200);
                }
            });
        });
    } else {
        Student.findByIdAndUpdate(id, student, function (err, student) {
            if (err) {
                callback({success: false, reason: err.message}, 500);
            } else {
                callback({success: true, student: student}, 200);
            }
        });
    }
}
module.exports.updateStudentLocation = function (ids, queryLocation, callback, createHistory) {
    success = true;
    results = [];
    var newLocation = {
        id: queryLocation._id,
        name: queryLocation.name,
        colour: queryLocation.colour
    };
    if (ids) {
        ids.forEach(function (id) {
            Student.findByIdAndUpdate(id, {
                location: newLocation,
                timelastout: new Date()
            }, function (err, student) {
                if (err) {
                    success = false;
                    callback({success: false, reason: err.message}, 500);
                }
                createHistory({
                    student: {
                        _id: student._id,
                        firstname: student.firstname,
                        surname: student.surname,
                        yeargroup: student.yeargroup
                    },
                    location: {
                        _id: newLocation._id,
                        name: newLocation.name
                    },
                    _house: student._house,
                    time: new Date()
                }, function () {
                });
            });
        });
    }
    if (success) {
        callback({success: true, students: results}, 200);
    }
}
module.exports.deleteStudent = function (id, callback) {
    Student.findByIdAndRemove(id, function (err, user) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true}, 200);
        }
    });
}
module.exports.uploadStudents = function (json, house, callback) {
    var success = true;
    House.findOne({_id: house}, function (err5, housedata) {
        if (err5 && success) {
            callback({success: false, reason: err5.message}, 500);
            success = false;
        }
        Location.findOne({_id: housedata.config.DEFAULT_LOCATION}, function (err6, location) {
            if (err6 && success) {
                callback({success: false, reason: err6.message}, 500);
                success = false;
            }
            var defaultLocation = {
                id: location._id,
                colour: location.colour,
                name: location.name
            };
            json.forEach(function (student) {
                Student.find({code: student.Code}, function (err, docs) {
                    if (err && success) {
                        callback({success: false, reason: err}, 500);
                        success = false;
                    }
                    else if (!docs.length) {
                        if (student.Password !== "") {
                            bcrypt.hash(student.Password, saltRounds, function (err1, hash) {
                                if (err1 && success) {
                                    callback({success: false, reason: err1}, 500);
                                    success = false;
                                }
                                else {
                                    var newStudent = Student.create({
                                        firstname: student.Firstname,
                                        surname: student.Surname,
                                        yeargroup: student.Yeargroup,
                                        code: student.Code,
                                        _house: house,
                                        password: hash,
                                        location: defaultLocation,
                                        timelastout: new Date()
                                    }, function (err2, nStudent) {
                                        if (err2 && success) {
                                            callback({success: false, reason: err2}, 500);
                                            success = false;
                                        }
                                    });
                                }
                            });
                        } else {
                            var newStudent = Student.create({
                                firstname: student.Firstname,
                                surname: student.Surname,
                                yeargroup: student.Yeargroup,
                                code: student.Code,
                                _house: house,
                                location: defaultLocation,
                                timelastout: new Date()
                            }, function (err2, nStudent) {
                                if (err2 && success) {
                                    callback({success: false, reason: err2}, 500);
                                    success = false;
                                }
                            });
                        }
                    } else {
                        if (student.Password !== "") {
                            bcrypt.hash(student.Password, saltRounds, function (err1, hash) {
                                if (err && success) {
                                    callback({success: false, reason: err1}, 500);
                                    success = false;
                                }
                                else {
                                    var newStudent = Student.update({code: student.Code}, {
                                        firstname: student.Firstname,
                                        surname: student.Surname,
                                        yeargroup: student.Yeargroup,
                                        code: student.Code,
                                        _house: house,
                                        password: hash
                                    }, function (err2, nStudent) {
                                        if (err && success) {
                                            callback({success: false, reason: err2}, 500);
                                            success = false;
                                        }
                                    });
                                }
                            });
                        } else {
                            var newStudent = Student.update({code: student.Code}, {
                                firstname: student.Firstname,
                                surname: student.Surname,
                                yeargroup: student.Yeargroup,
                                code: student.Code,
                                _house: house
                            }, function (err2, nStudent) {
                                if (err && success) {
                                    callback({success: false, reason: err2}, 500);
                                    success = false;
                                }
                            });
                        }
                    }
                });
            });
        });
    });
    if (success) {
        callback({success: success}, 200);
    }
}
module.exports.appAuthenticateStudent = function (username, password, callback) {
    var success = true;
    Student.findOne({'code': username.toLowerCase()}, function (err, hash) {
        if (err && success) {
            callback({success: false, reason: err.message}, 500);
            success = false;
        }
        if (success && hash != null) {
            bcrypt.compare(password, hash.password, function (err1, result) {
                if (err1 && success) {
                    callback({success: false, reason: err1.message}, 500);
                    success = false;
                }
                if (result && success) {
                    Student.findOne({"code": username.toLowerCase()}, function (err2, user) {
                        if (err2 && success) {
                            callback({success: false, reason: err2.message}, 500);
                            success = false;
                        } else if (success) {
                            callback({
                                success: true,
                                authenticated: true,
                                token: jwt.sign({
                                    data: user
                                }, secretKey)
                            }, 200);
                        }
                    });

                } else if (success) {
                    callback({success: true, authenticated: false}, 403);
                }
            });
        }
    });
}
module.exports.appReadStudentToken = function (jwt_key, callback) {
    if (jwt_key) {
        jwt.verify(jwt_key, secretKey, function (err, decoded) {
            if (err) {
                callback({success: false, reason: err}, 500);
            } else {
                callback({success: true, student: decoded}, 200);
            }
        });
    } else {
        callback({success: false, empty: true}, 403);
    }
}
module.exports.appReadStudent = function (id, minor, callback) {
    if (minor) {
        Student.findOne(id, 'location timelastout', function (err, student) {
            if (err) {
                callback({success: false, reason: err.message}, 500);
            } else {
                callback({success: true, student: student}, 200);
            }
        });
    } else {
        Student.findOne(id, function (err, student) {
            if (err) {
                callback({success: false, reason: err.message}, 500);
            } else {
                callback({success: true, student: student}, 200);
            }
        });
    }
}
module.exports.appUpdateStudentLocation = function (studentID, locationID, callback, createHistory) {
    Location.findOne({_id: locationID}, function (err1, location) {
        if (err1) {
            callback({success: false, reason: err1.message}, 500);
        } else {
            Student.findByIdAndUpdate(studentID, {
                location: {
                    id: locationID,
                    name: location.name,
                    colour: location.colour
                },
                timelastout: new Date()
            }, {new: true}, function (err2, student) {
                if (err2) {
                    callback({success: false, reason: err2.message}, 500);
                }
                else {
                    createHistory({
                        student: {
                            _id: studentID,
                            firstname: student.firstname,
                            surname: student.surname,
                            yeargroup: student.yeargroup
                        },
                        location: {
                            _id: locationID,
                            name: location.name
                        },
                        _house: student._house,
                        time: new Date()
                    }, function () {
                    });

                    callback({success: true, student: student}, 200);
                }
            });
        }
    });
}

module.exports.appGetHouseConfig = function (house, callback){
    House.findOne({_id: house}, 'config', function(err, result){
       if(err){
           callback({success: false, reason: err.message}, 500);
       } else{
           callback({success: true, config: result}, 200);
       }

    });
}

//Locations
module.exports.createLocation = function (location, callback) {
    var newLocation = Location.create(location, function (err) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true}, 200);
        }
    });
}
module.exports.readLocations = function (house, callback) {
    Location.find({
        "_house": house
    }, {}, {sort: {heading: 1, order: 1}}, function (err, locations) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true, locations: locations}, 200);
        }
    });
}
module.exports.updateLocation = function (id, location, callback) {
    Location.findByIdAndUpdate(id, location, function (err, location) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        }
        else {
            callback({success: true, location: location}, 200);
        }
    });
}
module.exports.deleteLocation = function (id, callback) {
    Location.findByIdAndRemove(id, function (err) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true}, 200);
        }
    });
}

//House
module.exports.createHouse = function (house, callback) {
    var newHouse = House.create(house, function (err) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true}, 200);
        }
    });
}
module.exports.readHouses = function (callback) {
    House.find({}, function (err, houses) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true, houses: houses}, 200);
        }
    });
}
module.exports.updateHouse = function (id, nHouse, callback) {
    House.findByIdAndUpdate(id, nHouse, function (err, house) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        }
        else {
            callback({success: true, house: house}, 200);
        }
    });
}
module.exports.deleteHouse = function (id, callback) {
    House.findByIdAndRemove(id, function (err) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true}, 200);
        }
    });
}

module.exports.updateHouseConfig = function (id, config, callback) {
    House.findByIdAndUpdate(id, {config: config}, function (err2, house1) {
        if (err2) {
            callback({success: false, reason: err.message}, 500);
        }
        else {
            callback({success: true, house: house1}, 200);
        }
    });
}

//History
module.exports.createHistory = function (history, callback) {
    var newHistory = History.create(history, function (err) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true}, 200);
        }
    });
}
module.exports.readHistory = function (filter, amount, house, callback) {
    var params = {_house: house};
    if (filter != "") {
        params = {
            _house: house, $or: [
                {"student.firstname": {$regex: filter, $options: "i"}},
                {"student.surname": {$regex: filter, $options: "i"}},
                {"student.yeargroup": {$regex: filter, $options: "i"}},
                {$where: 'new RegExp("' + filter + '", "i").exec(new Date(this.time).toLocaleTimeString())'},
                {$where: 'new RegExp("' + filter + '", "i").exec(new Date(this.time).toLocaleDateString())'}
            ]
        };
    }
    History.find(params).sort("-time").limit(parseInt(amount)).exec(function (err, records) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true, records: records}, 200);
        }
    })
}


module.exports.createCallover = function (callover, callback) {
    var newCallover = Callover.create(callover, function (err, callover1) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true, callover: callover1}, 200)
        }
    });
}

module.exports.readCallover = function (house, callback) {
    Callover.find({_house: house}, function (err, callovers) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true, callovers: callovers},200);
        }
    });
}

module.exports.createCalender = function(calender, callback){
    var newCalneder = Calender.create(calender, function(err, event){
        if(err) {
            callback({success: false, reason: err.message}, 500);
        }else{
            callback({success: true, calender: calender}, 200);
        }
    })
}
module.exports.readCalender = function (house, callback) {
    Calender.find({_house: house}, {}, {sort: {starttime: 1}}, function (err, events) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        } else {
            callback({success: true, events: events},200);
        }
    });
}
module.exports.updateCalender = function (id, calender, callback) {
    Calender.findByIdAndUpdate(id, calender, function (err, house) {
        if (err) {
            callback({success: false, reason: err.message}, 500);
        }
        else {
            callback({success: true, calender: calender}, 200);
        }
    });
}