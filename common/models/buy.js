module.exports = function(Buy) {
var app = require('../../server/server');
var json2csv = require('json2csv');
var csv2 = require('csv-to-collection');
var fs = require('fs');
var transaction_buy_id;
Buy.remoteMethod(
	'updateInventoryBuy',
	{
		http:{path:'/updateInventoryBuy',verb:'post'},
		accepts:{'arg':'product_list','type':'array'},
		returns:{'arg':'res','type':'array'}
	}

	);

Buy.updateInventoryBuy=function(allproduct,cb){
	console.log("allproduct = ",allproduct);
		var datenow=new Date().toJSON().slice(0,10);
		var len=allproduct.length;

		var transactionUpdateBuy={};
		transactionUpdateBuy.supplierId=allproduct[len-2].supplierId;
		transactionUpdateBuy.userId=allproduct[len-1].userId;
		transactionUpdateBuy.total=allproduct[len-1].total;
		transactionUpdateBuy.cash_out=allproduct[len-1].cash_out;
		transactionUpdateBuy.due=transactionUpdateBuy.total-transactionUpdateBuy.cash_out;
		transactionUpdateBuy.discount=allproduct[len-1].discount;
		transactionUpdateBuy.payment_method = allproduct[len-1].payment_method;
		transactionUpdateBuy.date=new Date().toJSON().slice(0,10);

		app.models.transaction_buy.create(transactionUpdateBuy,function(err,res){
			if(err){
				console.log("err1=",err);
		     	console.log("res1= ",res);		
		    	throw err;
			}
			else{
				//cb(null,'successfull');
				console.log("else res1 ",res);

				}
		});


		for(j=0;j<allproduct.length-1;j++){
		(function(item){
			
			var datenow=new Date().toJSON().slice(0,10);
			app.models.transaction_buy.findOne({where:{and:[{supplierId:transactionUpdateBuy.supplierId},{date:datenow}]}},function(err,res){
			if(err){
				console.log("err5=",err);	
		    	throw err;
			}
			else{
				var updateBuy={};
				updateBuy.transactionBuyId=res.id;
				updateBuy.userId=allproduct[len-1].userId;
				updateBuy.productId=allproduct[item].productId;
				updateBuy.quantity=allproduct[item].quantity;
				updateBuy.location=allproduct[item].location;
				updateBuy.supplierId=allproduct[item].supplierId;
				updateBuy.amount=allproduct[item].amount;
				updateBuy.date=new Date().toJSON().slice(0,10);
			

				Buy.create(updateBuy,function(err,res){
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
			});
		
			//console.log("productId ="+productId+" quantity= "+quantity+"  location ="+location);
			productId=allproduct[item].productId;
			quantity=allproduct[item].quantity;
			location=allproduct[item].location;
			supplierId=allproduct[item].supplierId;
			amount=allproduct[item].amount;
		
			app.models.inventory.findOne({where:{and:[{productId:productId},{location:location}]}},function(err,result){
				if(err) {
					//console.log("err1=",err);
					cb(err);
				}
				if(!result)
				{
					//console.log("entry ",item);
					
					var upInventory={};
					upInventory.productId=allproduct[item].productId;
					upInventory.userId=allproduct[len-1].userId;
					upInventory.location=allproduct[item].location;
					upInventory.available_amount=allproduct[item].quantity;
					app.models.inventory.create(upInventory,function(err,res){
						if(err){
							console.log("err3=",err);
					     	console.log("res3= ",res);
							throw err;
						}
						else{
							//cb(null,'successfull');
							console.log("else res3 ",res);
						}
					});
				}
				else{
					result.productId=allproduct[item].productId;
					result.available_amount=result.available_amount+allproduct[item].quantity;
					result.location=allproduct[item].location;
					result.save();
					//console.log('result ', result);
					//console.log('item ',item);
			    }
			});

		})(j);
	}
		cb(null,allproduct);
	}
	Buy.afterRemote('updateInventoryBuy',function(context, remoteMethodOutput, next){
		console.log("Creation successfull = ");
		console.log("result remoteMethodOutput = ",remoteMethodOutput);
		next();
	});


Buy.remoteMethod(
	'exportImport',
	{
		http:{path:'/exportImport',verb:'post'},
		accepts:{'arg':'data','type':'object'},
		returns:{'arg':'res','type':'string'}
	}	
);
var result = [];
Buy.exportImport = function(data,cb){
	var modelname = data.fieldname; 
	var user = data.userId;
	if(modelname === 'buy'){
		app.models.buy.find({where:{userId:user}},function(err,res){
			if(err)console.log("error = "+err);
			else {
				console.log("result = ",res);
				var fields = ['id','quantity', 'location', 'amount','date','productId','supplierId','userId','transactionBuyId'];
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
