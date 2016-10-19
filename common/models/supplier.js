module.exports = function(Supplier) {
var app = require('../../server/server');
var json2csv = require('json2csv');
var csv2 = require('csv-to-collection');
var fs = require('fs');
Supplier.remoteMethod(
	'exportImport',
	{
		http:{path:'/exportImport',verb:'post'},
		accepts:{'arg':'data','type':'object'},
		returns:{'arg':'res','type':'string'}
	}	
);
var result = [];
Supplier.exportImport = function(data,cb){
	var modelname = data.fieldname; 
	var user = data.userId;
	if(modelname === 'supplier'){
		app.models.supplier.find({where:{userId:user}},function(err,res){
			if(err)console.log("error = "+err);
			else {
				console.log("result = ",res);

				var fields = ['id','name', 'address','phone','userId'];
				var csv = json2csv({ data: res,fields: fields ,doubleQuotes :""});
				fs.writeFile(__dirname+"/data/"+user+modelname+'.csv', csv, function(err) {
				  if (err) throw err;
				  console.log('file saved');
				});
				//cb(null,result);
				// csv2.readCsv(__dirname+"/data/"+"supplier.csv", function (err, data) {
				//     if (err) throw err;
				//     console.log("read file ",data);
				//     console.log(data[0].id + "  " +data[0].name +" " +data[0].userid);
				//     var suplr = {};
				//     suplr.name = data[0].name;
				//     suplr.address = data[0].address;
				//     suplr.userId = data[0].userid;
				//     suplr.phone = data[0].phone;
				//     app.models.supplier.create(suplr,function(err,res){
				//     	if(err) console.log(err);
				//     	else console.log("supplier created ",res);
				//     });
				// });
			}
		});
	}

	cb(null,"success");
}
};
