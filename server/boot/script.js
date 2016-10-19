module.exports=function(app){
/*var User=app.models.user;
var Role=app.models.Role;
var RoleMapping=app.models.RoleMapping;
User.create([
	{username:"admin",email:"admin@inventory.com",password:"xxxx"}
	],function(err,users){
		if(err) throw err;

		console.log('Created Users: ',users);
		Role.create({
			name:'admin'
		},function(err,role){
			if(err) throw err;
			console.log('Created Role : ',role);
			role.principals.create({
				principalType: RoleMapping.USER,
				principlaId:users[0].id
			},function(err,principal){
				if(err) throw err;
				console.log('pricipals Created: ',principal)
			});
		});
	});
*/
};