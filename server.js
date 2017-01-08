var express 		= require('express');
var bodyParser 		= require('body-parser');
var _ 				= require('underscore');
var db 				= require('./db.js');
var bcrypt 			= require('bcrypt');

var middleware 		= require('./middleware.js')(db);

var app 			= express();
var PORT 			= process.env.PORT || 3000;
var todos 			= [];
var todoNextId 		= 1;

app.use(bodyParser.json()); // Middleware;

app.get('/', function(req, res) {
	res.send('Hello - Todo API Root');
});

// Get /todos or /todos?completed=true or /todos?completed=true&q=house
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query 		= req.query;
	var where 		= {
		userId : req.user.get('id')
	};

	if (query.hasOwnProperty('completed') && query.completed === 'true'){
		where.completed 	= true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false'){
		where.completed 	= false;
	}

	if(query.hasOwnProperty('q') && query.q.length > 0){
		where.description 	= {
			$like: '%'+query.q+'%'
		};
	}

	//console.log(where);

	db.todo.findAll({where: where}).then(function(todos){
		res.json(todos);
	}, function(e){
		res.status(500).send();
	});

});

// Get /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	
	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(ttdd){

		if(!!ttdd){						// Because of object we need to change object to boolean;
			res.json(ttdd.toJSON());
		} else {
			res.status(404).send();		// Not found;
		}

	}, function(e){
		res.status(500).send();		// Server Error;
	});

});


// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo){
		
		req.user.addTodo(todo).then(function(){
			return todo.reload();
		}).then(function(){
			res.json(todo.toJSON());	
		});

	}, function (e){
		res.status(400).json(e);
	});

});


app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
		
	db.todo.destroy({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(rowsDelected){
		if(rowsDelected === 0){
			res.status(404).json({
				error: 'No todo with Id'
			});
		} else {
			res.status(204).send();		// everything is working fine. nothing to send;
		}
	}, function(){
		res.status(500).send();
	});
});


// PUT;
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId 		= parseInt(req.params.id, 10);
	var body 		= _.pick(req.body, 'description', 'completed');
	var attribute 	= {};

	if (body.hasOwnProperty('completed') ) {
		attribute.completed = body.completed;
	}

	if (body.hasOwnProperty('description') ) {
		attribute.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(todo){			// Model Methods;
		if(todo){
			todo.update(attribute).then(function(todo){		// if todo go well;		Instance Method;
				res.json(todo.toJSON());
			}, function(e){				// if todo go wrong;
				res.status(400).json(e);		// Invalid Syntax;
			});
		} else {
			res.status(404).send();
		}
	}, function () {			// if wasn't found id;
		res.status(500).send();
	});
});

// Post User;
app.post('/users', function(req, res){
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user){
		res.json(user.toPublicJSON());
	}, function (e){
		res.status(400).json(e);
	});
});

// POST /users/login;
app.post('/users/login', function(req, res){
	var body 		= _.pick(req.body, 'email', 'password');

	var userInstance;

	db.user.authenticate(body).then(function (user){
		var token 		= user.generateToken('authentication');

		userInstance 	= user;

		return db.token.create({
			token: token
		});

		// if(token){
		// 	res.header('Auth', token).json(user.toPublicJSON());	
		// } else {
		// 	res.status(401).send();
		// }

		
	}).then(function(tokenInstance) {
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON);
	}).catch(function (){
		res.status(401).send();
	});

});

// Delete user login
app.delete('/users/login', middleware.requireAuthentication, function(req, res){
	req.token.destroy().then(function(){
		res.status(204).send();
	}).catch(function(){
		res.status(500).send();
	});
});

db.sequelize.sync({force: true}).then(function(){
	app.listen(PORT, function() {
		console.log('Express listning on port ' + PORT + '!');
	});	
});
