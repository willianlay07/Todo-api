var Sequelize 		= require('sequelize');
var sequelize  		= new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo 	= sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

var User 	= sequelize.define('user', {
	email: {
		type: Sequelize.STRING,
	}
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({force: false}).then(function () {
	console.log('Everything is synced');

	User.findById(1).then(function(user){
		user.getTodos({
			where: {
				completed: false
			}
		}).then(function(todos){
			todos.forEach(function(todo){
				console.log(todo.toJSON());
			});
		});
	});

	// User.create({
	// 	email: 'willianlay07@gmail.com'
	// }).then(function(){
	// 	return Todo.create({
	// 		description: 'Clean yard',
	// 		completed: false
	// 	});
	// }).then(function(todo){
	// 	User.findById(1).then(function(user){
	// 		user.addTodo(todo);
	// 	});
	// });


	// Todo.findById(1).then(function(td){
	// 	if(td){
	// 		console.log(td.toJSON());
	// 	} else {
	// 		console.log('todo not found by id');
	// 	}
	// });

	// Todo.findAll().then(function(tk){
	// 	tk.forEach(function(ttkk){
	// 		console.log(ttkk.toJSON());
	// 	})
	// });


	// Todo.create({
	// 	description: 'Walking my dog',
	// 	completed: false
	// }).then(function(todo){
	// 	return Todo.create({
	// 		description: 'Clean office'
	// 	});
	// 	//console.log('Finished!');
	// 	//console.log(todo);
	// }).then(function(){
	// 	//return Todo.findById(1);
	// 	return Todo.findAll({
	// 		where: {
	// 			//completed: false
	// 			description: {
	// 				$like: '%dog%'
	// 			}
	// 		}
	// 	});
	// }).then(function(todos){
	// 	if(todos){
	// 		todos.forEach(function(tk){
	// 			console.log(tk.toJSON());
	// 		});
			
	// 	} else {
	// 		console.log('no todo found!');
	// 	}
	// })
	// .catch(function(e){
	// 	console.log(e);
	// });

});
