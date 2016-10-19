module.exports = function(Product) {
var app = require('../../server/server');
var json2csv = require('json2csv');
var csv2 = require('csv-to-collection');
var fs = require('fs');
Product.remoteMethod(
	'exportImport',
	{
		http:{path:'/exportImport',verb:'post'},
		accepts:{'arg':'data','type':'object'},
		returns:{'arg':'res','type':'string'}
	}	
);
var result = [];
Product.exportImport = function(data,cb){
	var modelname = data.fieldname;
	var user = data.userId; 
	if(modelname === 'product'){
		app.models.product.find({where:{userId:user}},function(err,res){
			if(err)console.log("error = "+err);
			else {
				console.log("result = ",res);
				var fields = ['id','name', 'sku_number', 'description','buy_price','sell_price','categoryId','supplierId','userId'];
				var csv = json2csv({ data: res,fields: fields ,doubleQuotes :""});
				fs.writeFile(__dirname+"/data/"+user+modelname+'.csv', csv, function(err) {
				  if (err) throw err;
				  console.log('file saved');
				});
				// csv2.readCsv(__dirname+"/data/"+"product.csv", function (err, data) {
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
