module.exports = function(Sell) {
var app = require('../../server/server');
var json2csv = require('json2csv');
var csv2 = require('csv-to-collection');
var fs = require('fs');

Sell.remoteMethod(
	'updateInventorySell',
	{
		http:{path:'/updateInventorySell',verb:'post'},
		accepts:{'arg':'product_list','type':'array'},
		returns:{'arg':'message','type':'object'}
	}

	);

Sell.updateInventorySell=function(allproduct,cb){
		// console.log("allproduct = ",allproduct);
		// console.log("length = ",allproduct.length);
		
		var dateNow=new Date().toJSON().slice(0,10);
		var len=allproduct.length;

		var transactionUpdateSell={};
		transactionUpdateSell.customerId=allproduct[len-2].customerId;
		transactionUpdateSell.userId=allproduct[len-1].userId;
		transactionUpdateSell.total=allproduct[len-1].total;
		transactionUpdateSell.cash_in=allproduct[len-1].cash_in;
		transactionUpdateSell.due=transactionUpdateSell.total-transactionUpdateSell.cash_in;
		transactionUpdateSell.discount=allproduct[len-1].discount;
		transactionUpdateSell.payment_method=allproduct[len-1].payment_method;
		transactionUpdateSell.date=new Date().toJSON().slice(0,10);

		app.models.transaction_sell.create(transactionUpdateSell,function(err,result){
			if(err) console.log('err 1 ',err);
			else console.log('res 1 ',result);
		});


		var message={}; 
		for(j=0;j<allproduct.length-1;j++){
			
		(function(item){
			
			var datenow=new Date().toJSON().slice(0,10);
			app.models.transaction_sell.findOne({where:{and:[{customerId:allproduct[len-2].customerId},{date:datenow}]}},function(err,res){
			if(err){
				console.log("err 2 =",err);	
		    	throw err;
			}
			else{
				var updateSell={};
				updateSell.transactionSellId=res.id;
				updateSell.productId=allproduct[item].productId;
				updateSell.userId=allproduct[len-1].userId;
				updateSell.quantity=allproduct[item].quantity;
				updateSell.location=allproduct[item].location;
				updateSell.customerId=allproduct[item].customerId;
				updateSell.amount=allproduct[item].amount;
				updateSell.date=new Date().toJSON().slice(0,10);

				app.models.Sell.create(updateSell,function(err,res){
					if(err){
						console.log("err 3=",err);
			     		console.log("res 3= ",res);
			     		throw err;
					}
					else{
						//cb(null,'successfull');
						console.log("else res 3 ",res);
					}
				});
					console.log("else res 4 ",res);
					console.log("transaction sell id ",res.id);
				}
			});


			productId=allproduct[item].productId;
			quantity=allproduct[item].quantity;
			location=allproduct[item].location;
			//console.log("productId ="+productId+" quantity= "+quantity+"  location ="+location);
		
			app.models.inventory.findOne({where:{and:[{productId:productId},{location:location}]}},function(err,result){
				console.log('result ',result);
				
				if(err){
					//console.log("err1=",err);
					//cb(err);
				}
				else if(!result){
					message.error='There is no available product';
					//cb(message);
				}
				else if(result.available_amount<allproduct[item].quantity){
					message.error='Lack of available product';
					//console.log('message ',message.error);
				}
				else{
					result.productId=allproduct[item].productId;
					result.available_amount=result.available_amount-allproduct[item].quantity;
					result.location=allproduct[item].location;
					result.save();
					
			    }
			    if(message.error&&item===allproduct.length-2){
					//console.log("out mess4 ",message);
					//console.log("item1= ",item);
					cb(null,message);
				}
				if(!message.error&&item===allproduct.length-2){
					message.error="Success!";
					//console.log("out mess5 ",message);
					//console.log("item2= ",item);
					cb(null,message);
				}
			});
		})(j);

	}

	}
Sell.remoteMethod(
	'exportImport',
	{
		http:{path:'/exportImport',verb:'post'},
		accepts:{'arg':'data','type':'object'},
		returns:{'arg':'res','type':'string'}
	}	
);
var result = [];
Sell.exportImport = function(data,cb){
	var modelname = data.fieldname; 
	var user = data.userId;
	if(modelname === 'sell'){
		app.models.sell.find({where:{userId:user}},function(err,res){
			if(err)console.log("error = "+err);
			else {
				console.log("result = ",res);
				var fields = ['id','quantity', 'location', 'amount','date','productId','customerId','userId','transactionSellId','salesagentId'];
				var csv = json2csv({ data: res,fields: fields ,doubleQuotes :"",quotes:""});
				fs.writeFile(__dirname+"/data/"+user+modelname+'.csv', csv, function(err) {
				  if (err) throw err;
				  console.log('file saved');
				});
				// csv2.readCsv(__dirname+"/data/"+"sell.csv", function (err, data) {
				//     if (err) throw err;
				//     console.log("read file ",data);
				//     //console.log(data[0].id + "  " +data[0].name +" " +data[0].userid);
				// });
								//cb(null,result);
			}
		});
	}

	cb(null,"success");
}
};
