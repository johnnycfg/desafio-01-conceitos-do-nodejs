const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'Username is not available!' });
  }

  const newUser = {
    id: uuidv4(),
    name, 
    username, 
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params

  const todoExists = user.todos.some(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({error: "Todo not exist!"})
  }

  const updatedTodos = user.todos.map((todo) =>  {
    if (todo.id === id) {
      return { ...todo, title, deadline: new Date(deadline)}
    }

    return todo
  });

  user.todos = updatedTodos;

  return response.status(201).json(updatedTodos[0]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.some(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({error: "Todo not exist!"})
  }

  const updatedTodos = user.todos.map((todo) =>  {
    if (todo.id === id) {
      return { ...todo, done: true}
    }

    return todo
  });

  user.todos = updatedTodos;

  return response.status(201).json(updatedTodos[0]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({error: "Todo not exist!"})
  }

  user.todos.splice(todoExists, 1)

  return response.status(204).json(user.todos);
});

module.exports = app;