const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const {username} = request.headers

  const userExists = users.find((us)=>{
    return us.username === username
  })
  if(!userExists){
    return response.status(404).json({
       error: 'Mensagem do erro'
     })
    
    }
    request.user = userExists
    return next();
}

app.post('/users', async (request, response) => {
  const {name, username} = request.body

  const userExists = users.find(user => user.username === username)

  if(userExists) {
    return response.status(400).json({error: 'User already exist'})
  }
  
  const user =
    { 
      id: uuidv4(),
      name: name, 
      username: username, 
      todos: []
    }
  users.push(user)
  return response.status(201).json(user)
});

app.get('/users', async (request, response) => {
  response.send(users)
});

app.get('/todos',  checksExistsUserAccount, (request, response) => {
  
  const {user} = request

  return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body
 
  let todo = { 
    id:  uuidv4(), // precisa ser um uuid
    title: title,
    done: false, 
    deadline: new Date(deadline).toISOString(), 
    created_at: new Date()
  }

  user.todos.push(todo)
  return response.status(201).json(todo);
});


app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
 
  
    const {title, deadline} = request.body
    let td = user.todos.find((r)=> r.id === request.params.id)
    if(!td){
      return response.status(404).json({error: 'Todo no found'})
    }

    td.title = title
    td.deadline = new Date(deadline)

    return response.json(td);
  

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params
  const todo = user.todos.find(todo => todo.id === id);
  if(!todo){
    return response.status(404).json({error: 'Todo no found'})
  }
  todo.done = true;

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params
  const todoIndex = user.todos.findindex(todo => todo.id === id);

  if(todoIndex === -1){
    return response.status(404).json({error: 'Todo no found'})
  }
  user.todos.splice(todoIndex, 1)
  return response.status(204)
});

module.exports = app;