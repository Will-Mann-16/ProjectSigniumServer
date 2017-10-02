var secretKey = "signium";
var bcrypt = require('bcryptjs');
var saltRounds = 10;
var jwt = require("jsonwebtoken");
var schema = require("./schema");

var User = schema.user;
var Student = schema.student;
var Location = schema.location;
var House = schema.house;
var History = schema.history;

//User
module.exports.createUser = function(user, callback){
  bcrypt.hash(user.password, saltRounds, function(err, hash) {
    if (err) {
      callback({success: false, reason: err.message});
    }
    else{
      user.password = hash;
      User.create({
        username: user.username,
        password: user.password,
        firstname: user.firstname,
        surname: user.surname,
        role: user.role,
        house: user._house
      }, function(error, nUser) {
        if (error) {
          callback({success: false, reason: error.message});
        } else {
          callback({success: true});
        }
      });
  }
  });
}
module.exports.readUser = function(jwt_key, callback){
  if (jwt_key) {
    jwt.verify(jwt_key, secretKey, function(err, decoded) {
      if (err) {
        callback({success: false, reason: err});
      } else {
        callback({success: true, user: decoded});
      }
    });
  } else {
    callback({success: false,  empty: true});
  }
}
module.exports.updateUser = function(id, user, callback){
  if(user.password != ""){
    bcrypt.hash(user.password, saltRounds, function(err1, hash) {
      if (err1) {
        callback({success: false, reason: err1.message});
      }
      else{
        user.password = hash;
        User.findByIdAndUpdate(id, user, function(err, user) {
          if (err) {
            callback({success: false, reason: err.message});
          } else {
            callback({success: true});
          }
        });
      }
    });
  }
  else{
    User.findByIdAndUpdate(id, user, function(err, user) {
      if (err) {
        callback({success: false, reason: err.message});
      } else {
        callback({success: true});
      }
    });
  }
}
module.exports.deleteUser = function(id, callback){
  User.findByIdAndRemove(id, function(err, user) {
    if (err) {
      callback({success: false, reason: err.message});
    } else {
      callback({success: true});
    }
  });
}
module.exports.authenticateUser = function(username, password, callback){
  var success = true;
  User.findOne({'username': username}, function(err, hash) {
    if (err) {
      callback({success: false, reason: err.message});
      success = false;
    }
    if (success && hash != null) {
      bcrypt.compare(password, hash.password, function(err, result) {
        if (err && success) {
          callback({success: false, reason: err.message});
          success = false;
        }
        if (result && success) {
          User.findOne({"username": username}, function(err1, user) {
            if (err1 && success) {
              callback({success: false, reason: err1.message});
              success = false;
            } else if (success) {
              callback({
                success: true,
                authenticated: true,
                token: jwt.sign({
                  data: user
                }, secretKey)
              });
            }
          });

        } else if (!success) {
          callback({success: true, authenticated: false});
        }
      });
    }
  });
}

//Student
module.exports.createStudent = function(student, callback){
  console.log(student);
  var newStudent = Student.create(student, function(err, student) {
    if (err) {
      callback({success: false, reason: err.message});
    } else {
      callback({success: true});
    }
  });
}
module.exports.readStudents = function(minor, house, callback){
  if (minor) {
    Student.find({
      "_house": house
    }, 'location timelastout', {sort: {yeargroup: 1, surname: 1}}, function(err, students) {
      if (err) {
        callback({success: false, reason: err.message});
      } else {
        callback({success: true, students: students}) ;
      }
    });
  } else {
    Student.find({
      "_house": house
    }, null, {sort: {yeargroup: 1, surname: 1}}, function(err, students) {
      if (err) {
        callback({success: false, reason: err.message});
      } else {
        callback({success: true, students: students});
      }
    });
  }
}
module.exports.updateStudent = function(id, student, callback){
  if(student.password !== ""){
    bcrypt.hash(student.password, saltRounds, function(err, hash) {
      student.password = hash;
      Student.findByIdAndUpdate(id, student, function(err, student) {
        if (err) {
          callback({success: false, reason: err.message});
        } else {
          callback({success: true, student: student});
        }
      });
    });
  }else{
    Student.findByIdAndUpdate(id, student, function(err, student) {
      if (err) {
        callback({success: false, reason: err.message});
      } else {
        callback({success: true, student: student});
      }
    });
  }
}
module.exports.updateStudentLocation = function(ids, queryLocation, callback, createHistory){
  success = true;
  results = [];
  var newLocation = {
    id: queryLocation._id,
    name: queryLocation.name,
    colour: queryLocation.colour
  };
  if (ids) {
    ids.forEach(function(id) {
      Student.findByIdAndUpdate(id, {
        location: newLocation,
        timelastout: new Date()
      }, function(err, student) {
        if (err) {
          success = false;
          callback({success: false, reason: err.message});
        }
        createHistory({student:{
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
        time: new Date()}, function(){});
      });
    });
  }
  if (success) {
    callback({success: true, students: results});
  }
}
module.exports.deleteStudent = function(id, callback){
  Student.findByIdAndRemove(id, function(err, user) {
    if (err) {
      callback({success: false, reason: err.message});
    } else {
      callback({success: true});
    }
  });
}
module.exports.uploadStudents = function(json, house, callback){
  var success = true;
  var defaultLocation = {
    id: "",
    colour: "#ffffff",
    name: "No Location"
  }
  json.forEach(function(student){
    Student.find({code: student.Code}, function(err, docs){
      if(!docs.length){
        if(student.Password !== ""){
          bcrypt.hash(student.Password, saltRounds, function(err1, hash) {
            if(err && success){
              callback({success: false, reason: err1});
              success = false;
            }
            else{
              var newStudent = Student.create({
                firstname: student.Firstname,
                surname: student.Surname,
                yeargroup: student.Yeargroup,
                code: student.Code,
                _house: house,
                password: hash,
                location: defaultLocation,
                timelastout: new Date()}, function(err2, nStudent){
                  if(err && success){
                    callback({success: false, reason: err2});
                    success = false;
                  }
                });
              }
          });
        }else{
          var newStudent = Student.create({
            firstname: student.Firstname,
            surname: student.Surname,
            yeargroup: student.Yeargroup,
            code: student.Code,
            _house: house,
            location: defaultLocation,
            timelastout: new Date()}, function(err2, nStudent){
              if(err && success){
                callback({success: false, reason: err2});
                success = false;
              }
            });
        }
      }else{
        if(student.Password !== ""){
          bcrypt.hash(student.Password, saltRounds, function(err1, hash) {
            if(err && success){
              callback({success: false, reason: err1});
              success = false;
            }
            else{
              var newStudent = Student.update({code: student.Code},{
                firstname: student.Firstname,
                surname: student.Surname,
                yeargroup: student.Yeargroup,
                code: student.Code,
                _house: house,
                password: hash}, function(err2, nStudent){
                  if(err && success){
                    callback({success: false, reason: err2});
                    success = false;
                  }
                });
              }
          });
        }else{
          var newStudent = Student.update({code: student.Code}, {
            firstname: student.Firstname,
            surname: student.Surname,
            yeargroup: student.Yeargroup,
            code: student.Code,
            _house: house}, function(err2, nStudent){
              if(err && success){
                callback({success: false, reason: err2});
                success = false;
              }
            });
        }
      }
    });
  });
  if(success){
    callback({success: success});
  }
}
module.exports.appAuthenticateStudent = function(username, password, callback) {
    var success = true;
    Student.findOne({ 'code': username.toLowerCase() },function (err, hash) {
        if (err && success) {
            callback({ success: false, reason: err.message });
            success = false;
        }
        if (success && hash != null) {
            bcrypt.compare(password, hash.password, function (err1, result) {
                if (err1 && success) {
                    callback({ success: false, reason: err1.message });
                    success = false;
                }
                if (result && success) {
                    Student.findOne({ "code": username.toLowerCase() }, function (err2, user) {
                        if (err2 && success) {
                            callback({ success: false, reason: err2.message });
                            success = false;
                        } else if (success) {
                            callback({
                                success: true,
                                authenticated: true,
                                token: jwt.sign({
                                    data: user
                                }, secretKey)
                            });
                        }
                    });

                } else if (success) {
                    callback({ success: true, authenticated: false });
                }
            });
        }
    });
}
module.exports.appReadStudentToken = function(jwt_key, callback){
    if (jwt_key) {
        jwt.verify(jwt_key, secretKey, function(err, decoded) {
            if (err) {
                callback({success: false, reason: err});
            } else {
                callback({success: true, student: decoded});
            }
        });
    } else {
        callback({success: false,  empty: true});
    }
}
module.exports.appReadStudent = function(id, minor, callback){
    if (minor) {
        Student.findOne(id, 'location timelastout', function (err, student) {
            if (err) {
                callback({ success: false, reason: err.message });
            } else {
                callback({ success: true, student: student });
            }
        });
    } else {
        Student.findOne(id, function (err, student) {
            if (err) {
                callback({ success: false, reason: err.message });
            } else {
                callback({ success: true, student: student });
            }
        });
    }
}
module.exports.appUpdateStudentLocation = function(studentID, locationID, callback){
  Location.findOne({_id: locationID}, function(err1, location){
    if(err1) {
        callback({success: false, reason: err1.message});
    } else {
        Student.findByIdAndUpdate(studentID, {location: {
            id: location._id,
            name: location.name,
            colour: location.colour
        },
            timelastout: new Date()
    }, {new: true}, function(err2, student){
            if(err2){
                callback({success: false, reason: err2.message});
            }
            else{
                console.log(student);

                callback({success: true, student: student});
            }
        });
    }
  });
}

//Locations
module.exports.createLocation = function(location, callback){
  var newLocation = Location.create(location, function(err) {
    if (err) {
      callback({success: false, reason: err.message});
    } else {
      callback({success: true});
    }
  });
}
module.exports.readLocations = function(house, callback){
  Location.find({
    "_house": house
  }, function(err, locations) {
    if (err) {
      callback({success: false, reason: err.message});
    } else {
      callback({success: true, locations: locations});
    }
  });
}
module.exports.updateLocation = function (id, location, callback){
  Location.findByIdAndUpdate(id, location, function(err, location) {
    if (err) {
      callback({success: false, reason: err.message});
    }
    else{
      callback({success: true, location: location});
    }
  });
}
module.exports.deleteLocation = function(id, callback){
  Location.findByIdAndRemove(id, function(err) {
    if (err) {
      callback({success: false, reason: err.message});
    } else {
      callback({success: true});
    }
  });
}

//House
module.exports.createHouse = function(house, callback){
  var newHouse = House.create(house, function(err) {
    if (err) {
      callback({success: false, reason: err.message});
    } else {
      callback({success: true});
    }
  });
}
module.exports.readHouses = function(callback){
  House.find({}, function(err, houses) {
    if (err) {
      callback({success: false, reason: err.message});
    } else {
      callback({success: true, houses: houses});
    }
  });
}
module.exports.updateHouse = function(id, nHouse, callback){
  House.findByIdAndUpdate(id, nHouse, function(err, house) {
    if (err) {
      callback({success: false, reason: err.message});
    }
    else {
      callback({success: true, house: house});
    }
  });
}
module.exports.deleteHouse = function(id, callback){
  House.findByIdAndRemove(id, function(err) {
    if (err) {
      callback({success: false, reason: err.message});
    } else {
      callback({success: true});
    }
  });
}

//History
module.exports.createHistory = function(history, callback){
  var newHistory = History.create(history, function(err) {
    if (err) {
      callback({success: false, reason: err.message});
    } else {
      callback({success: true});
    }
  });
}
module.exports.readHistory = function(filter, amount, house, callback){
  var params = {_house: house};
  if(filter != ""){
    params = {_house: house, $or:[
      {"student.firstname": {$regex: filter, $options: "i"}},
      {"student.surname": {$regex: filter, $options: "i"}},
      {"student.yeargroup": {$regex: filter, $options: "i"}},
      {$where: 'new RegExp("' + filter + '", "i").exec(new Date(this.time).toLocaleTimeString())'},
      {$where: 'new RegExp("' + filter + '", "i").exec(new Date(this.time).toLocaleDateString())'}
    ]};
  }
  History.find(params).sort("-time").limit(parseInt(amount)).exec(function(err, records){
    if (err) {
      callback({success: false, reason: err.message});
    } else {
      callback({success: true, records: records});
    }
  })
}
