var express 	= require('express');
var app 		= express();
var PORT 		= process.env.PORT || 3000;
var todos 		= [{
	id: 1,
	description: 'Meet mom for lunch',
	completed: false
}, {
	id: 2,
	description: 'Go to market',
	completed: false
}, {
	id: 3,
	description: 'Feed the cat',
	completed: true
}];

app.get('/', function(req, res){
	res.send('Hello - Todo API Root');
});

// Get /todos
app.get('/todos', function(req, res){
	res.json(todos);
});

// Get /todos/:id
app.get('/todos/:id', function(req, res){
	var todoId 		= parseInt(req.params.id, 10);
	var matchedTodo;

	todos.forEach(function (todo){
		if(todoId === todo.id){
			matchedTodo 	= todo;
		}
	});

	if(matchedTodo){
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}

	//res.send('Asking for todo with id of ' + req.params.id);
});



app.listen(PORT, function(){
	console.log('Express listning on port ' + PORT + '!');
});