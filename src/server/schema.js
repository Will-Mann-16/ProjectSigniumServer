var mongoose = require("mongoose");

var studentSchema = mongoose.Schema({
    firstname: String,
    surname: String,
    yeargroup: String,
    location: {
        id: String,
        name: String,
        colour: String
    },
    _house: String,
    timelastout: Date,
    code: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: String
});

var locationSchema = mongoose.Schema({
    name: String,
    heading: String,
    colour: String,
    _house: String,
    order: Number
});

var userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: String,
    role: String,
    house: String,
    firstname: String,
    surname: String
}, {
    runSettersOnQuery: true
});


var houseSchema = mongoose.Schema({
    name: String,
    colours: [String],
    personell: [String],
    config: Object
});

var historySchema = mongoose.Schema({
    student: {
        _id: String,
        firstname: String,
        surname: String,
        yeargroup: String
    },
    location: {
        _id: String,
        name: String
    },
    _house: String,
    time: {type: Date, default: Date.now}
});
//historySchema.index({"student.firstname": "text", "student.surname": "text", "student.yeargroup": "text", "location.name": "text"});

var calloverSchema = mongoose.Schema({
    time: {type: Date, default: Date.now},
    students: [{
        _id: String,
        present: Boolean
    }],
    _house: String
});

var calenderSchema = mongoose.Schema({
    starttime: {type: Date, default: Date.now},
    endtime: {type: Date, default: Date.now},
    title: String,
    _house: String,
    description: String
});

var Student = mongoose.model("Student", studentSchema);
var Location = mongoose.model("Location", locationSchema);
var User = mongoose.model("User", userSchema);
var House = mongoose.model("Houselist", houseSchema, 'houselist');
var History = mongoose.model("History", historySchema, 'history');
var Callover = mongoose.model("Callover", calloverSchema, 'callover');
var Calender = mongoose.model("Calender", calenderSchema, 'calender');

module.exports = {
    student: Student,
    location: Location,
    user: User,
    house: House,
    history: History,
    callover: Callover,
    calender: Calender
};
