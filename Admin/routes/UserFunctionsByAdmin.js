const router = require("express").Router();
//const userAuthorizationChecking = require("../middleware/UsersAuthorized");
const adminAuthonticationChecking = require("../middleware/AdminAuthorized");
//const {body , ValidationResult, validationResult} = require("express-validator")
//const imageAthorizedChecking = require("../middleware/UploadImagesAuthorized")
const util = require("util");
const connection = require("../DB/dbConnector");
//const fileSystem = require("fs");
//const bcrypt = require("bcrypt");
//const crypto = require("crypto")


router.get("/userList", adminAuthonticationChecking, async (req, res) => {
    const query = util.promisify(connection.query).bind(connection);
    const usersList = await query("select * from user");
    usersList.forEach(usersList => {
        delete usersList['password'];
    });
    return res.status(200).json(usersList);
});


router.get("/searchUser/:search", adminAuthonticationChecking, async (req, res) => {
    const query = util.promisify(connection.query).bind(connection);
    if (req.params.search){
        search = `where firstName LIKE '%${req.params.search}%'`;
        const userinfo = await query(`select * from user ${search}`);
        if (!userinfo[0]){
            return res.status(404).json("user doesn't existce !")
        }
        userinfo.forEach(userinfo => {
            delete userinfo['password'];
        });
        return res.status(200).json(userinfo);
    }
    else {
        return res.status(404).json("user doesn't existce !");
    }
    
});



module.exports = router ;