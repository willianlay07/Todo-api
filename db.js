var Sequelize 		= require('sequelize');
var env				= process.env.NODE_ENV || 'development';
var sequelize;

if(env === 'production'){		// only running on heroku;
	sequelize 	= new Sequelize(process.env.DATABASE_URL, {
		'dialect': 'postgres'
	});
} else {
	sequelize  		= new Sequelize(undefined, undefined, undefined, {
			'dialect': 'sqlite',
			'storage': __dirname + '/data/dev-todo-api.sqlite'
	});		// Instance;
}

var db 			= {};

db.todo 		= sequelize.import(__dirname + '/models/todo.js');	// Load Model; Model Method;
db.user 		= sequelize.import(__dirname + '/models/user.js');	// Load Model; Model Method;
db.sequelize 	= sequelize;			// Instance;
db.Sequelize 	= Sequelize;			// Library;

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports	= db;