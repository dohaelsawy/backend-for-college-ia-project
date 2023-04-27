const router = require("express").Router();
//const userAuthorizationChecking = require("../middleware/UsersAuthorized");
const adminAuthonticationChecking = require("../middleware/AdminAuthorized");
const {body ,validationResult} = require("express-validator")
//const imageAthorizedChecking = require("../middleware/UploadImagesAuthorized")
const util = require("util");
const connection = require("../DB/dbConnector");
//const fileSystem = require("fs");
const bcrypt = require("bcrypt");
const crypto = require("crypto");



router.post("/setNewAdmin",
body("firstName")
.isString()
.withMessage("enter a valid name !")
.isLength({min: 2 , max : 10})
.withMessage("the first name shoud be between 2 to 10 character"),
body("lastName")
.isString()
.withMessage("enter a valid name")
.isLength({min: 2 , max : 10})
.withMessage("the last name shoud be between 2 to 10 character"),
body("email")
.isEmail()
.withMessage("please enter a valid email"),
body("password")
.isLength({min : 8 , max : 10})
.withMessage("please enter the correct password"),
adminAuthonticationChecking, 
async (req , res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }
        const query = util.promisify(connection.query).bind(connection);
        const userObject = await query("select * from user where email = ?", [req.body.email]);
        if (userObject.length > 0) {
            return res.status(404).json({
                errors: [
                    {
                        msg: "email already exists",
                    },
                ],
            });
        }
        const adminObject = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            token: crypto.randomBytes(10).toString("hex"),
            role: 1,
        };
        await query("insert into user set ?", adminObject);
        delete adminObject.password;
        return res.status(200).json(adminObject);


    } catch (error) {
        console.log(error);
        return res.status(500).json("panic it's not working");
    }
});
module.exports = router ;