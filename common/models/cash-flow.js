module.exports = function(CashFlow) {
var app = require('../../server/server');
var json2csv = require('json2csv');
var csv2 = require('csv-to-collection');
var fs = require('fs');
CashFlow.remoteMethod(
	'exportImport',
	{
		http:{path:'/exportImport',verb:'post'},
		accepts:{'arg':'data','type':'object'},
		returns:{'arg':'res','type':'string'}
	}	
);
var result = [];
CashFlow.exportImport = function(data,cb){
	var modelname = data.fieldname; 
	var user = data.userId;
	if(modelname === 'cash_flow'){
		app.models.cash_flow.find({where:{userId:user}},function(err,res){
			if(err)console.log("error = "+err);
			else {
				console.log("result = ",res);
				var fields = ['id','date', 'description', 'cash_in','cash_out','payment_method','bankName','checkNo','userId'];
				var csv = json2csv({ data: res,fields: fields ,quotes:""});
				fs.writeFile(__dirname+"/data/"+user+modelname+'.csv', csv, function(err) {
				  if (err) throw err;
				  console.log('file saved');
				});
				csv2.readCsv(__dirname+"/data/"+user+modelname+".csv", function (err, data) {
				    if (err) throw err;
				    console.log("read file ",data);
				   // console.log(data[0].id + "  " +data[0].name +" " +data[0].userid);
				});				
				//cb(null,result);
			}
		});
	}

	cb(null,"success");
}
};
