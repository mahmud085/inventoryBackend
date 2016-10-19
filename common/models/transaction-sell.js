module.exports = function(TransactionSell) {
var app = require('../../server/server');
var json2csv = require('json2csv');
var csv2 = require('csv-to-collection');
var fs = require('fs');
TransactionSell.remoteMethod(
	'calculation',
	{
		http:{path:'/calculation',verb:'get'},
		accepts:{arg:'id',type:'string'},
		returns:[
		{arg:'totalAmount',type:'number'},
		{arg:'totalCashIn',type:'number'},
		{arg:'totalDue',type:'number'}
		]
	}
	);
TransactionSell.calculation=function(id,cb){
	TransactionSell.find({where:{customerId:id}},function(err,calc){
		//console.log("err =",err);
		//console.log("calculation =",calc);
		var len=calc.length;
		var totalDue=0,totalAmount=0,totalCashIn=0;
		for(j=0;j<calc.length;j++){
			totalAmount+=calc[j].total;
			totalCashIn+=calc[j].cash_in;
			totalDue=totalAmount-totalCashIn;
		}
		if(err) throw err;
		cb(null,totalAmount,totalCashIn,totalDue);
	});
}
TransactionSell.remoteMethod(
	'exportImport',
	{
		http:{path:'/exportImport',verb:'post'},
		accepts:{'arg':'data','type':'object'},
		returns:{'arg':'res','type':'string'}
	}	
);
var result = [];
TransactionSell.exportImport = function(data,cb){
	var modelname = data.fieldname; 
	var user = data.userId;
	if(modelname === 'transaction_sell'){
		app.models.transaction_sell.find({where:{userId:user}},function(err,res){
			if(err)console.log("error = "+err);
			else {
				console.log("result = ",res);
				var fields = ['id','total', 'cash_in', 'due','discount','payment_method','date','customerId','salesagentId','userId'];
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
