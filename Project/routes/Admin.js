const router = require("express").Router();
//const userAuthorizationChecking = require("../middleware/UsersAuthorized");
const adminAuthonticationChecking = require("../middleware/AdminAuthorized");
const {body , ValidationResult, validationResult} = require("express-validator")
const imageAthorizedChecking = require("../middleware/UploadImagesAuthorized")
const util = require("util");
const connection = require("../DB/dbConnector");
const fileSystem = require("fs");
const bcrypt = require("bcrypt");
const crypto = require("crypto")

router.post("/create",
imageAthorizedChecking.single("image"),

body("name")
.isString()
.withMessage("please enter a valid name!")
.isLength({min : 2 , max:50})
.withMessage("the name of the product between 2 -> 50 character"),
body("description")
.isString()
.withMessage("please enter an understandable descrription")
.isLength({min : 10 , max: 100})
.withMessage("please enter an well description"),
body("price")
.isLength({min: 0 , max:8})
.withMessage("the price should be between 0 -> 8 digits"),
body("title")
.isString()
.withMessage("please enter a valid title")
.isLength({min:0 ,max:100})
.withMessage("the max length for the title is 100 character")

,adminAuthonticationChecking, async (req, res) => {
    try {
        // 1 -> validate the fields except the image 
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors : errors.array()});
        }
        // 2 -> validate the image 
        if (!req.file){
            return res.status(400).json(
                {
                    errors:[
                        {
                            msg : "Image is required",
                        },
                    ],
                },
            );
        }
        // 3 -> product object
        const productObject = {
            name : req.body.name ,
            description : req.body.description,
            price : req.body.price,
            image_url : req.file.filename,
            title : req.body.title, 
        };

        // 4 -> insert pruduct to database
        const query = util.promisify(connection.query).bind(connection)
        await query("insert into Product set ? " , productObject) ;
        res.status(200).json("Product Created");
    } catch (error) {
        console.log(error);
        res.status(500).json("panic it's not working")
        
    }
});
router.put("/update/:id",
imageAthorizedChecking.single("image"),

body("name")
.isString()
.withMessage("please enter a valid name!")
.isLength({min : 2 , max:50})
.withMessage("the name of the product between 2 -> 50 character"),
body("description")
.isString()
.withMessage("please enter an understandable descrription")
.isLength({min : 10 , max: 100})
.withMessage("please enter an well description"),
body("price")
.isLength({min: 0 , max:8})
.withMessage("the price should be between 0 -> 8 digits"),
body("title")
.isString()
.withMessage("please enter a valid title")
.isLength({min:0 ,max:100})
.withMessage("the max length for the title is 100 character")

,adminAuthonticationChecking, 
async (req, res) => {
    try {
        const query = util.promisify(connection.query).bind(connection);

        // 1 -> validate the fields except the image 
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors : errors.array()});
        }

        // 2- > check is movie exists or not 
        const productExistance = await query ("select * from Product where id = ? " ,[req.params.id]);
        if (!productExistance[0]){
            res.status(404).json({msg : "the product is not found !"});
            return ;
        }

        // 3 -> product object 
        const productObject = {
            name : req.body.name ,
            description : req.body.description ,
            price : req.body.price ,
            title : req.body.title, 
        };
        // check if the image updated or not 
        if (req.file){
            //res.status(400).json(productExistance[0].image_url);
            productObject.image_url = req.file.filename;
            fileSystem.unlinkSync("./ProductsImages/" + productExistance[0].image_url);
        }
        // "1681710104372.png"
        

        // insert the new data to database
        await query ("update Product set ? where id = ?",[productObject , productExistance[0].id]);

        res.status(200).json("Product updated");
    } catch (error) {
        console.log(error);
        res.status(500).json("panic it's not working")
    }
});
router.delete("/delete/:id"

,adminAuthonticationChecking, 
async (req, res) => {
    try {
        const query = util.promisify(connection.query).bind(connection);
        // 2- > check is movie exists or not 
        const productExistance = await query ("select * from Product where id = ? " ,[req.params.id]);
        
        if (!productExistance[0]){
            res.status(404).json({msg : "the product is not found !"});
        }
        
        // delete the product from databse
        fileSystem.unlinkSync("./ProductsImages/" + productExistance[0].image_url);
        await query("delete from Product where id = ?" ,[productExistance[0].id]);
        res.status(200).json("Product Deleted ");
    } catch (error) {
        console.log(error);
        res.status(500).json("panic it's not working")
        
    }
    //1681710104372.png
});
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
            res.status(404).json({
                errors: [
                    {
                        msg: "email already exists",
                    },
                ],
            });
            return;
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
        res.status(200).json(adminObject);


    } catch (error) {
        console.log(error);
        res.status(500).json("panic it's not working");
    }
});
router.get("/userList", adminAuthonticationChecking, async (req, res) => {
    const query = util.promisify(connection.query).bind(connection);
    const usersList = await query("select * from user");
    res.status(200).json(usersList);
});
router.get("/searchUser/:id", adminAuthonticationChecking, async (req, res) => {
    const query = util.promisify(connection.query).bind(connection);
    const userinfo = await query("select * from user where id = ?" , [req.params.id]);
    if (!userinfo[0]) {
        res.status(404).json({ ms: "user not existce !" });
      }
    res.status(200).json(userinfo);
});
router.get("/checkQuantity/:id" ,adminAuthonticationChecking, async (req,res) => {
    try {
        const query = util.promisify(connection.query).bind(connection);
        const orderInfo = await query("select * from user where id = ?", [req.params.id]);
        if (orderInfo[0].quantity <= 0) {
            return res.status(404).json("out of stock");
        }
        return res.status(200).json("you could buy");
    } catch (error) {
        res.status(500).json("panic it's not working");

    }
});
module.exports = router;