var mysql = require('mysql');
var bdd = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database : "DBServ"
});

module.exports= {
	searchNamePass : function(name,password){
		return new Promise(function(resolve , reject){
			bdd.connect(function(error){
				if(error){reject(error);throw error;}
				bdd.query("SELECT * FROM User Where nom = \""+name+ "\"and Password = \""+password+"\";",function (err,result,fields){
					if(err){reject(error);throw err;}{
						resolve(result);
					}
				});

			});
		});
	}


};