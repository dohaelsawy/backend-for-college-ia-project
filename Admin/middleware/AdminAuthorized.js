const connection = require("../DB/dbConnector");
const util = require("util");


const adminAuthonticationChecking = async(req, res , next) =>{
    checking(req , res , next);
    
    
};

async function checking (req , res , next){
    const query = util.promisify(connection.query).bind(connection);
    const {token} = req.headers;
    const adminTokenChecking = await query("select  * from user where token = ?" ,[token]);
    if (adminTokenChecking[0] && adminTokenChecking[0].role){
        next();
    }else {
        res.status(403).json({
            msg : "you are not allowed to acces this",
        });
    }
}


module.exports = adminAuthonticationChecking ;

