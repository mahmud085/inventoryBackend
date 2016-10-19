module.exports = function(InventoryHold) {
var app = require('../../server/server');
var json2csv = require('json2csv');
var csv2 = require('csv-to-collection');
var fs = require('fs');
	InventoryHold.remoteMethod(
		'updateInventoryHold',
		{
			http:{'path':'/updateInventoryHold','verb':'post'},
			accepts:{'arg':'products','type':'array'},
			returns:{'arg':'message','type':'string'}
		}

	);
	InventoryHold.updateInventoryHold=function(allproducts,cb){
		console.log('all product= ',allproducts);

		for(j=0;j<allproducts.length;j++){
			(function(item){

			productId = allproducts[item].productId;
			salesagentId = allproducts[item].salesagentId;
			var datenow=new Date().toJSON().slice(0,10);
			
			app.models.inventory_hold.findOne({where:{and:[{date:datenow},{and:[{productId:productId},{salesagentId:salesagentId}]}]}},function(err,result){
				if(err) {
					//console.log("err1=",err);
					cb(err);
				}
				if(!result)
				{
					//console.log("entry ",item);
					var up_inventory={};
					up_inventory.salesagentId=allproducts[item].salesagentId;
					up_inventory.productId=allproducts[item].productId;
					up_inventory.userId=allproducts[item].userId;
					up_inventory.location=allproducts[item].location;
					up_inventory.quantity=allproducts[item].quantity;
					up_inventory.amount=allproducts[item].amount;
					up_inventory.date=new Date().toJSON().slice(0,10);

					app.models.inventory_hold.create(up_inventory,function(err,res){
						if(err){
							console.log('err 1 ',err);
						}
						else{
							console.log('res 1 ',res);
						}
					});
				}
				else{
					result.productId = allproducts[item].productId;
					result.amount += allproducts[item].amount;
					result.quantity +=allproducts[item].quantity; 
					result.save();
					//console.log('result ', result);
					//console.log('item ',item);
			    }
			});	 

			location = allproducts[item].location;
			app.models.inventory.findOne({where:{and:[{productId:productId},{location:location}]}},function(err,result){
				if(err) {
					//console.log("err1=",err);
					cb(err);
				}
				else{
					result.productId=allproducts[item].productId;
					result.available_amount=result.available_amount-allproducts[item].quantity;
					result.save();
					console.log("After Saving result = ",result);
			    }
			});

			})(j);
		}
		cb(null,'message');
	}



	InventoryHold.remoteMethod(
		'returnHoldProduct',
		{
			http:{'path':'/returnProduct','verb':'post'},
			accepts:{'arg':'products','type':'array'},
			returns:{'arg':'message','type':'string'}
		}
	);

	InventoryHold.returnHoldProduct=function(allproducts,cb){
		console.log('allproducts = ',allproducts);

		var len = allproducts.length;

		var transactionUpdateSell={};
		transactionUpdateSell.salesagentId=allproducts[len-2].salesagentId;
		transactionUpdateSell.userId=allproducts[len-2].userId;
		transactionUpdateSell.total=allproducts[len-1].total;		
		transactionUpdateSell.cash_in=allproducts[len-1].cash_in;
		transactionUpdateSell.due=allproducts[len-1].due;
		transactionUpdateSell.discount= allproducts[len-1].discount; ;
		transactionUpdateSell.payment_method = 'Cash';
		transactionUpdateSell.date=new Date().toJSON().slice(0,10);

		app.models.transaction_sell.create(transactionUpdateSell,function(err,result){
			if(err) console.log('err 1 ',err);
			else console.log('res 1 ',result);
		});

		
		
		for(j=0;j<allproducts.length-1;j++){
			(function(item){
				console.log("item products = ",allproducts[item]);
				productId=allproducts[item].productId;
				salesagentId=allproducts[item].salesagentId;
				holdDate=allproducts[item].date;

				InventoryHold.findOne({where:{and:[{date:holdDate},{and:[{productId:productId},{salesagentId:salesagentId}]}]}},function(err,result){
					if(err){
						console.log('err 2=',err);
						throw err;
					}
					else{

						console.log('res 2=',result);
						var hold = result.quantity-(allproducts[item].sold+allproducts[item].returned);
						result.quantity = hold;
						result.amount = allproducts[item].due + (hold*allproducts[item].sell_price);
						result.save();
					}
				});
				var location = allproducts[item].location;
				app.models.inventory.findOne({where:{and:[{productId:productId},{location:location}]}},function(err,result1){
					if(err) {
						//console.log("err1=",err);
						cb(err);
					}
					else if(!result1){
						var update={};
						update.productId = allproducts[item].productId;
						update.location = location;
						update.available_amount = allproducts[item].returned;
						app.models.inventory.create(update,function(err,res){
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
						result1.available_amount=result1.available_amount+allproducts[item].returned;
						result1.save();
					}
				});

				var datenow=new Date().toJSON().slice(0,10);
				app.models.transaction_sell.findOne({where:{and:[{date:datenow},{salesagentId:allproducts[item].salesagentId}]}},function(err,res){
					if(err){
						console.log("err 3 =",err);	
				    	throw err;
					}
					else{
						console.log('item= ',item);
						var updateSell={};
						updateSell.transactionSellId=res.id;
						updateSell.productId=allproducts[item].productId;
						updateSell.userId=allproducts[item].userId;
						updateSell.quantity=allproducts[item].sold;
						updateSell.location='Godown';
						updateSell.salesagentId=allproducts[item].salesagentId;
						updateSell.amount=allproducts[item].amount;
						updateSell.date = new Date().toJSON().slice(0,10);

						app.models.Sell.create(updateSell,function(err,res){
							if(err){
								console.log("err 4=",err);
					     		throw err;
							}
							else{
								//cb(null,'successfull');
								console.log("else res 4 ",res);
							}
						});
					}
				});


			})(j);
		}
		cb(null,'successfull!');
	}
InventoryHold.remoteMethod(
	'exportImport',
	{
		http:{path:'/exportImport',verb:'post'},
		accepts:{'arg':'data','type':'object'},
		returns:{'arg':'res','type':'string'}
	}	
);
var result = [];
InventoryHold.exportImport = function(data,cb){
	var modelname = data.fieldname; 
	var user = data.userId;
	if(modelname === 'inventory_hold'){
		app.models.inventory_hold.find({where:{userId:user}},function(err,res){
			if(err)console.log("error = "+err);
			else {
				console.log("result = ",res);
				var fields = ['id','date','quantity', 'location', 'amount','salesagentId','productId','userId'];
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
