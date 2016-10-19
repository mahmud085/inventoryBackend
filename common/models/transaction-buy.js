module.exports = function(TransactionBuy) {
var app = require('../../server/server');
var json2csv = require('json2csv');
var csv2 = require('csv-to-collection');
var fs = require('fs');
TransactionBuy.remoteMethod(
	'calculation',
	{
		http:{path:'/calculation',verb:'get'},
		accepts:{arg:'id',type:'string'},
		returns:[
		{arg:'totalAmount',type:'number'},
		{arg:'totalCashOut',type:'number'},
		{arg:'totalDue',type:'number'}
		]
	}
	);
TransactionBuy.calculation=function(id,cb){
	TransactionBuy.find({where:{supplierId:id}},function(err,calc){
		//console.log("err =",err);
		//console.log("calculation =",calc);
		var len=calc.length;
		var totalDue=0,totalAmount=0,totalCashOut=0;
		for(j=0;j<calc.length;j++){
			totalAmount+=calc[j].total;
			totalCashOut+=calc[j].cash_out;
			totalDue=totalAmount-totalCashOut;
		}
		if(err) throw err;
		cb(null,totalAmount,totalCashOut,totalDue);
	});
}
TransactionBuy.remoteMethod(
	'exportImport',
	{
		http:{path:'/exportImport',verb:'post'},
		accepts:{'arg':'data','type':'object'},
		returns:{'arg':'res','type':'string'}
	}	
);
var result = [];
TransactionBuy.exportImport = function(data,cb){
	var modelname = data.fieldname; 
	var user = data.userId;
	if(modelname === 'transaction_buy'){
		app.models.transaction_buy.find({where:{userId:user}},function(err,res){
			if(err)console.log("error = "+err);
			else {
				console.log("result = ",res);
				var fields = ['id','total', 'cash_out', 'due','discount','payment_method','date','supplierId','userId'];
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
