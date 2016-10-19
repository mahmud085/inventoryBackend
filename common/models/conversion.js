module.exports = function(Conversion) {
var app = require('../../server/server');
var json2csv = require('json2csv');
var csv2 = require('csv-to-collection');
var fs = require('fs');
Conversion.remoteMethod(
	'convertProduct',
	{
		http:{'path':'/convertProduct','verb':'post'},
		accepts:{'arg':'products','type':'array'},
		returns:{'arg':'messages','type':'string'}
	}

);
Conversion.convertProduct=function(allproducts,cb){
	console.log('all products to convert =',allproducts);
	for(j=0;j<allproducts.length;j++){
		(function(item){

			start_productId = allproducts[item].start_productId;
			end_productId = allproducts[item].end_productId;
			quantity = allproducts[item].quantity;
			factor = allproducts[item].factor;

			app.models.Inventory.find({where:{and:[{productId:end_productId},{location:'Shop'}]}},function(err,result){
				if(err) {
					throw err;
					console.log('err 1=',err);
				}
				else if(!result[0]){
					var update={};
					update.productId=allproducts[item].end_productId;
					update.userId = allproducts[item].userId;
					update.location='Shop';
					update.available_amount=allproducts[item].quantity * factor;
					app.models.Inventory.create(update,function(err,res){
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
					result[0].productId=allproducts[item].end_productId;
					result[0].available_amount=result[0].available_amount + (allproducts[item].quantity * factor);
					result[0].save();
				}
			});

			app.models.Inventory.findOne({where:{and:[{productId:start_productId},{location:'Shop'}]}},function(err,result){
				result.productId = allproducts[item].start_productId;
				result.available_amount = result.available_amount - allproducts[item].quantity;
				result.save()
			});


		})(j)
	}
	cb(null,'successfull!');
}
Conversion.remoteMethod(
'convertHoldProduct',
{
	http:{'path':'/convertHoldProduct','verb':'post'},
	accepts:{'arg':'products','type':'array'},
	returns:{'arg':'messages','type':'string'}
}

);
Conversion.convertHoldProduct=function(allproducts,cb){
		console.log('all products to convert =',allproducts);
		for(j=0;j<allproducts.length;j++){
			(function(item){
				salesagentId = allproducts[item].salesagentId;
				userId = allproducts[item].userId;
				start_productId = allproducts[item].start_productId;
				end_productId = allproducts[item].end_productId;
				sell_price = allproducts[item].sell_price;
				quantity = allproducts[item].quantity;
				factor = allproducts[item].factor;
				date = allproducts[item].date;
				total = allproducts[item].total;

				app.models.inventory_hold.findOne({where:{and:[{productId:start_productId},{and:[{salesagentId:salesagentId},{date:date}]}]}},function(err,result){
					if(err) throw err;
					else {
						result.quantity = result.quantity - quantity ;
						result.amount = result.amount - (total * sell_price);
						result.save();
					}
				});
				app.models.inventory_hold.find({where:{and:[{productId:end_productId},{and:[{salesagentId:salesagentId},{date:date}]}]}},function(err,result){
					if(err)
					{
						throw err;
					}
					else if(!result[0]){
						var update={};
						update.productId = allproducts[item].end_productId;
						update.salesagentId = salesagentId;
						update.userId = userId;
						update.quantity = total;
						update.amount = total * sell_price;
						update.date = date; 
						app.models.inventory_hold.create(update,function(err,res){
							if(err){
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
						result[0].productId = end_productId;
						result[0].amount = result[0].amount + (total * sell_price);
						result[0].quantity = result[0].quantity + total;
						result[0].save();
					}
				});

			})(j)
		}
		cb(null,'successfull!');
	}
Conversion.remoteMethod(
	'exportImport',
	{
		http:{path:'/exportImport',verb:'post'},
		accepts:{'arg':'data','type':'object'},
		returns:{'arg':'res','type':'string'}
	}	
);
var result = [];
Conversion.exportImport = function(data,cb){
	var modelname = data.fieldname; 
	var user = data.userId;
	if(modelname === 'conversion'){
		app.models.conversion.find({where:{userId:user}},function(err,res){
			console.log("all ",res);
			if(err)console.log("error = "+err);
			else {
				var fields = ['id','factor', 'categoryId','start_productId','end_productId','userId'];
				var csv = json2csv({ data: res,fields: fields ,doubleQuotes :""});
				fs.writeFile(__dirname+"/data/"+user+modelname+'.csv', csv, function(err) {
				  if (err) throw err;
				  console.log('file saved');
				});
				// csv2.readCsv(__dirname+"/data/"+"conversion.csv", function (err, data) {
				//     if (err) throw err;
				//     console.log("read file ",data);
				//    // console.log(data[0].id + "  " +data[0].factor +" " +data[0].userid);
				// });
			}
		});
	}

	cb(null,"success");
}
};
