const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const {username} = request.headers

  const userExists = users.filter((us)=>{
    return us.username == username
  })
  if(userExists.length > 0){
    
    // response.send(userExists)
    next();
  }else{
    response.status(400).json({
      error: 'Mensagem do erro'
    })
  }
}

app.post('/users', async (request, response) => {
  const {name, username} = request.body
  
  users.push(
    { 
      id: uuidv4(), // precisa ser um uuid
      name: name, 
      username: username, 
      todos: []
    }
  )
  response.send(users)
});
app.get('/users', async (request, response) => {
  response.send(users)
});

app.get('/todos',  checksExistsUserAccount, (req, resp) => {
  
  const {username} = req.headers

  const usuario = users.filter((u) =>{

    return u.username === username
  })
  if(usuario.length > 0){
    resp.send(usuario[0].todos)
  }

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const userName = request.get('username')
  const {title, deadline} = request.body
  const userTodo =  users.filter((u) =>{
    return u.username === userName
  })
  let todo = { 
    id:  uuidv4(), // precisa ser um uuid
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  if(userTodo.length > 0){
    console.log('TODO',userTodo[0].todos)
    userTodo[0].todos.push(todo)
    response.send(userTodo[0].todos)
  }
  
});


app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  let userExist = users.find((r) => {
    return r.username === username
  })
  
  let idTodoExiste = userExist.todos.find((idtodo) => idtodo.id === request.params.id)
 
  if(userExist && idTodoExiste ){
    const {title, deadline} = request.body
    let td = userExist.todos.find((r)=> r.id === request.params.id)

    td.title = title
    td.deadline = deadline
    response.send(userExist)
  }else{
    response.json({error:'Não existe tarefas'})
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  let userExist = users.find((r) => {
    return r.username === username
  })
  
  let idTodoExiste = userExist.todos.find((idtodo) => idtodo.id === request.params.id)
 
  if(userExist && idTodoExiste ){
    
    let dn = userExist.todos.find((r)=> r.id === request.params.id)

    dn.done = dn.done === false ? true : false;
    response.send(userExist)
  }else{
    response.json({error:'Não existe tarefas'})
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  let userExist = users.find((r) => {
    return r.username === username
  })
  
  let idTodosdiff = userExist.todos.filter((idtodo) => idtodo.id != request.params.id)
 
  if(userExist && idTodosdiff.length > 0){
    
    userExist.todos = []
    userExist.todos.push(idTodosdiff)

    response.send(userExist)
  }else{
    response.json({error:'Não existe tarefas'})
  }
});

module.exports = app;