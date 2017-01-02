var express 		= require('express');
var bodyParser 		= require('body-parser');
var _ 				= require('underscore');
var db 				= require('./db.js');

var app 			= express();
var PORT 			= process.env.PORT || 3000;
var todos 			= [];
var todoNextId 		= 1;

app.use(bodyParser.json()); // Middleware;

app.get('/', function(req, res) {
	res.send('Hello - Todo API Root');
});

// Get /todos or /todos?completed=true or /todos?completed=true&q=house
app.get('/todos', function(req, res) {
	var query 		= req.query;
	var where 		= {};

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
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	
	db.todo.findById(todoId).then(function(ttdd){

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
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo){
		res.json(todo.toJSON());
	}, function (e){
		res.status(400).json(e);
	});

});


app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
		
	db.todo.destroy({
		where: {
			id: todoId
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
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	var body = _.pick(req.body, 'description', 'completed');
	var validAttribute = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}



	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttribute.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttribute.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, validAttribute);

	res.json(matchedTodo); // res.json is automatically sent back 200

});


db.sequelize.sync().then(function(){
	app.listen(PORT, function() {
		console.log('Express listning on port ' + PORT + '!');
	});	
});
