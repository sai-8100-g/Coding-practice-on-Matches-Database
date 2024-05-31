const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const dbpath = path.join(__dirname, 'todoApplication.db')

let db = null

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const intializer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log(`DB error : ${e.message}`)
    process.exit(1)
  }
}

intializer()

app.get('/todos/', async (request, response) => {
  const {status, priority, search_q = ''} = request.query
  const hasPriorityAndStatus = requestQuery => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    )
  }

  const hasPriorityOnly = requestQuery => {
    return requestQuery.priority !== undefined
  }

  const hasStatusOnly = requestQuery => {
    return requestQuery.status !== undefined
  }

  let query = ''

  switch (true) {
    case hasPriorityAndStatus(request.query):
      query = `
        SELECT 
        *
        FROM 
        todo
        WHERE
        status = '${status}'
        AND 
        priority = '${priority}'
        AND 
        todo LIKE '%${search_q}%';
        `
      break
    case hasPriorityOnly(request.query):
      query = `
        SELECT 
        *
        FROM 
        todo
        WHERE 
        priority = '${priority}'
        AND 
        todo LIKE '%${search_q}%';
        `
      break
    case hasStatusOnly(request.query):
      query = `
        SELECT 
        *
        FROM 
        todo
        WHERE
        status = '${status}'
        AND 
        todo LIKE '%${search_q}%';
        `
      break
    default:
      query = `
        SELECT 
        *
        FROM 
        todo
        WHERE 
        todo LIKE '%${search_q}%';
        `
  }

  result = await db.all(query)
  console.log(result)
  response.send(result)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `
  SELECT 
  * 
  FROM 
  todo
  WHERE 
  id = '${todoId}';
  `
  const result = await db.get(query)
  response.send(result)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const query = `
    INSERT INTO
    todo(id, todo, priority, status)
    VALUES('${id}', '${todo}', '${priority}', '${status}');
    `
  await db.run(query)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const hasPriorityOnly = requestQuery => {
    return requestQuery.priority !== undefined
  }

  const hasStatusOnly = requestQuery => {
    return requestQuery.status !== undefined
  }

  const hasTodo = requestQuery => {
    return requestQuery.todo !== undefined
  }
  let query = ''
  switch (true) {
    case hasPriorityOnly(request.body):
      query = `
    UPDATE
    todo
    SET
    priority= '${request.body.priority}'
    WHERE 
    id = '${todoId}';
    `
      await db.run(query)
      response.send('Priority Updated')
      break
    case hasStatusOnly(request.body):
      query = `
    UPDATE
    todo
    SET
    status= '${request.body.status}'
    WHERE 
    id = '${todoId}';
    `
      await db.run(query)
      response.send('Status Updated')
      break
    case hasTodo(request.body):
      query = `
    UPDATE
    todo
    SET
    todo= '${request.body.todo}'
    WHERE 
    id = '${todoId}';
    `
      await db.run(query)
      response.send('Todo Updated')
      break
  }
})

app.delete('/todots/:todoId', async (request, response) => {
  const {todoId} = request.params
  const query = `
  DELETE FROM 
  todo 
  WHERE 
  id = '${todoId}';
  `
  await db.run(query)
  response.send('Todo Deleted')
})

module.exports = app
