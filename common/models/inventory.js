module.exports = function(Inventory) {
var app = require('../../server/server');
var json2csv = require('json2csv');
var csv2 = require('csv-to-collection');
var fs = require('fs');
	Inventory.remoteMethod(
	'movetoshop',
	{
		http:{'path':'/moveToShop','verb':'post'},
		accepts:{'arg':'products','type':'array'},
		returns:{'arg':'messages','type':'string'}
	}

	);
	Inventory.movetoshop=function(allproducts,cb){
		console.log('all inventory godown products =',allproducts);
		for(j=0;j<allproducts.length;j++){
			(function(item){

				productId=allproducts[item].productId;
				quantity=allproducts[item].quantity;
				Inventory.find({where:{and:[{productId:productId},{location:'Shop'}]}},function(err,result){
					if(err) {
						throw err;
						console.log('err 1=',err);
					}
					else if(!result[0]){
						var update={};
						update.productId=allproducts[item].productId;
						update.userId =allproducts[item].userId;
						update.location='Shop';
						update.available_amount=allproducts[item].quantity;
						Inventory.create(update,function(err,res){
							if(err){
								console.log("err2=",err);
						     	console.log("res2= ",res);
								throw err;
							}
							else{
								//cb(null,'successfull');
								console.log("else res2 ",res);
							}
						});
						
					}
					else{
						console.log('res 3=',result[0]);
						result[0].productId=allproducts[item].productId;
						result[0].available_amount=result[0].available_amount+allproducts[item].quantity;
						result[0].save();
					}
				});

				Inventory.findOne({where:{and:[{productId:productId},{location:'Godown'}]}},function(err,result){
					result.productId=allproducts[item].productId;
					result.available_amount=result.available_amount-allproducts[item].quantity;
					result.save()
				});


			})(j)
		}
		cb(null,'successfull!');
	}
Inventory.remoteMethod(
	'exportImport',
	{
		http:{path:'/exportImport',verb:'post'},
		accepts:{'arg':'data','type':'object'},
		returns:{'arg':'res','type':'string'}
	}	
);
var result = [];
Inventory.exportImport = function(data,cb){
	var modelname = data.fieldname; 
	var user = data.userId;
	if(modelname === 'inventory'){
		app.models.inventory.find({where:{userId:user}},function(err,res){
			if(err)console.log("error = "+err);
			else {
				console.log("result = ",res);
				var fields = ['id','location', 'available_amount','productId','userId'];
				var csv = json2csv({ data: res,fields: fields ,quotes:""});
				fs.writeFile(__dirname+"/data/"+user+modelname+'.csv', csv, function(err) {
				  if (err) throw err;
				  console.log('file saved');
				});
				// csv2.readCsv(__dirname+"/data/"+"buy.csv", function (err, data) {
				//     if (err) throw err;
				//     console.log("read file ",data);
				//    // console.log(data[0].id + "  " +data[0].name +" " +data[0].userid);
				// });				
				//cb(null,result);
			}
		});
	}

	cb(null,"success");
}
};
