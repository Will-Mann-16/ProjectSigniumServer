var jwt = require("jsonwebtoken");
var config = require("./config");
module.exports.verifyToken = function(req, res, next){
    var token = req.headers['x-access-token'];
    if(!token){
        return res.status(403).json({success: false, reason: "No token provided"});
    }
    jwt.verify(token, config.secretKey, function(err, decoded){
        if(err){
            return res.status(403).json({success: false, reason: "Failed to authenticate token"});
        }
        else{
            next();
        }
    });

}
module.exports.verifyTokenApp = function(packet, next){
    var token = packet.token;
    if(!token){
        next({success: false, reason: "No token provided"});
    }
    jwt.verify(token, config.secretKey, function(err, decoded){
        if(err){
            next({success: false, reason: "Failed to authenticate token"});
        }
        else{
            next({success: true});
        }
    });

}