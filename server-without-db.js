var express 		= require('express');
var bodyParser 		= require('body-parser');
var _ 				= require('underscore');
//var db 				= require('./db.js');

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
	var queryParams	 	= req.query;
	var filteredTodos 	= todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}


	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}

	res.json(filteredTodos);
	//res.json(todos);
});

// Get /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}

	//res.send('Asking for todo with id of ' + req.params.id);
});


// POST /todos
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.description = body.description.trim();

	body.id = todoNextId;
	todoNextId++;

	// Push body into a array;
	todos.push(body);

	console.log('description : ' + body.description);

	res.json(body);
});


app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (!matchedTodo) {
		res.status(404).json({
			"error": "no todo found with that id"
		});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}
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


//db.sequelize.sync().then(function(){
	app.listen(PORT, function() {
		console.log('Express listning on port ' + PORT + '!');
	});	
//});
