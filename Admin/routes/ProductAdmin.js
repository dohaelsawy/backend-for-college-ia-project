const router = require("express").Router();
//const userAuthorizationChecking = require("../middleware/UsersAuthorized");
const adminAuthonticationChecking = require("../middleware/AdminAuthorized");
const {body , ValidationResult, validationResult} = require("express-validator")
const imageAthorizedChecking = require("../middleware/UploadImagesAuthorized")
const util = require("util");
const connection = require("../DB/dbConnector");
const fileSystem = require("fs");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

router.post("/createProduct",
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
        return res.status(200).json("Product Created");
    } catch (error) {
        console.log(error);
        return res.status(500).json("panic it's not working")
        
    }
});
router.put("/updateProduct/:id",
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
            return res.status(404).json({msg : "the product is not found !"});
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

        return res.status(200).json("Product updated");
    } catch (error) {
        console.log(error);
        return res.status(500).json("panic it's not working")
    }
});
router.delete("/deleteProduct/:id"

,adminAuthonticationChecking, 
async (req, res) => {
    try {
        const query = util.promisify(connection.query).bind(connection);
        // 2- > check is movie exists or not 
        const productExistance = await query ("select * from Product where id = ? " ,[req.params.id]);
        
        if (!productExistance[0]){
            return res.status(404).json({msg : "the product is not found !"});
        }
        
        // delete the product from databse
        fileSystem.unlinkSync("./ProductsImages/" + productExistance[0].image_url);
        await query("delete from Product where id = ?" ,[productExistance[0].id]);
        return res.status(200).json("Product Deleted ");
    } catch (error) {
        console.log(error);
        return res.status(500).json("panic it's not working")
        
    }
});
router.get("/searchProduct/:search", adminAuthonticationChecking, async (req, res) => {
    const query = util.promisify(connection.query).bind(connection);
    if (req.params.search){
        search = `where name LIKE '%${req.params.search}%'`;
        const productInfo = await query(`select * from product ${search}`);
        if (!productInfo[0]){
            return res.status(404).json("product doesn't existce !")
        }
        res.status(200).json(productInfo);
    }
    else {
        return res.status(404).json("product doesn't existce !");
    }
    
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