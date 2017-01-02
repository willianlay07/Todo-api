var Sequelize 		= require('sequelize');
var sequelize  		= new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlite'
});		// Instance;

var db 			= {};

db.todo 		= sequelize.import(__dirname + '/models/todo.js');	// Load Model;
db.sequelize 	= sequelize;			// Instance;
db.Sequelize 	= Sequelize;			// Library;

module.exports	= db;