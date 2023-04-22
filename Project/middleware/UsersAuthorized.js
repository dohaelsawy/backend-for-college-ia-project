
const util = require("util");
const connection = require("../DB/dbConnector");


const userAuthorizationChecking = async (req , res , next) => {
    const query = util.promisify(connection.query).bind(connection);
    const {token} = req.headers;
    const userTokenExistance = await query("select * from user where token = ?" ,[token] );
    if (userTokenExistance[0]){
        next();
    }else {
        res.status(403).json({
            msg : "you have to login first",
        });
    }
};


module.exports = userAuthorizationChecking;