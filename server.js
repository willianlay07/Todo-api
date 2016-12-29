var express 	= require('express');
var bodyParser	= require('body-parser');
var _			= require('underscore');

var app 		= express();
var PORT 		= process.env.PORT || 3000;
var todos 		= [];
var todoNextId	= 1;

app.use(bodyParser.json());		// Middleware;


app.get('/', function(req, res){
	res.send('Hello - Todo API Root');
});

// Get /todos
app.get('/todos', function(req, res){
	res.json(todos);
});

// Get /todos/:id
app.get('/todos/:id', function(req, res){
	var todoId 			= parseInt(req.params.id, 10);
	var matchedTodo 	= _.findWhere(todos, {id: todoId});

	if(matchedTodo){
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}

	//res.send('Asking for todo with id of ' + req.params.id);
});


// POST /todos
app.post('/todos', function(req, res){
	var body 	= _.pick(req.body, 'description', 'completed');

	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(400).send();
	}

	body.description	= body.description.trim();

	body.id 	= todoNextId;
	todoNextId++;

	// Push body into a array;
	todos.push(body);

	console.log('description : ' + body.description);
	
	res.json(body);
});


app.delete('/todos/:id', function(req, res){
	var todoId 			= parseInt(req.params.id, 10);
	var matchedTodo		= _.findWhere(todos, {id: todoId});

	if(!matchedTodo){
		res.status(404).json({"error": "no todo found with that id"});
	} else {
		//console.log(matchedTodo);

		todos 	= _.without(todos, matchedTodo);

		//console.log(todos);

		res.json(matchedTodo);
	}
});


app.listen(PORT, function(){
	console.log('Express listning on port ' + PORT + '!');
});