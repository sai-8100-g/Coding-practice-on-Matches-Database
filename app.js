const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

let db = null

const intializer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log(`DB error : ${e.message}`)
    process.exit(1)
  }
}

intializer()

const priorityItems = ['HIGH', 'MEDIUM', 'LOW']
const statusItems = ['TO DO', 'IN PROGRESS', 'DONE']
const categoryItems = ['WORK', 'HOME', 'LEARNING']
let dueDateArray = null

const hasPriorityOnly = requestQurey => {
  return (
    requestQurey.priority !== undefined &&
    requestQurey.status === undefined &&
    requestQurey.category === undefined
  )
}

const hasCategoryOnly = requestQurey => {
  return (
    requestQurey.category !== undefined &&
    requestQurey.status === undefined &&
    requestQurey.priority === undefined
  )
}

const hasStatusOnly = requestQurey => {
  return (
    requestQurey.status !== undefined &&
    requestQurey.category === undefined &&
    requestQurey.priority === undefined
  )
}

const hasTodoOnly = requestQurey => {
  return requestQurey.todo !== undefined
}

const hasDueDateOnly = requestQurey => {
  return requestQurey.dueDate !== undefined
}

const hasPriorityAndStatus = requestQurey => {
  return (
    requestQurey.priority !== undefined &&
    requestQurey.status !== undefined &&
    requestQurey.category === undefined
  )
}

const hasPriorityAndCategory = requestQurey => {
  return (
    requestQurey.priority !== undefined &&
    requestQurey.category !== undefined &&
    requestQurey.status === undefined
  )
}

const hasCategoryAndStatus = requestQurey => {
  return (
    requestQurey.category !== undefined &&
    requestQurey.status !== undefined &&
    requestQurey.priority === undefined
  )
}

const hasCategoryAndStatusAndPriority = requestQurey => {
  return (
    requestQurey.category !== undefined &&
    requestQurey.priority !== undefined &&
    requestQurey.status !== undefined
  )
}

app.get('/todos/', async (request, response) => {
  const {category, priority, status, search_q = ''} = request.query
  let isPresentCategory = categoryItems.includes(category)
  let isPresentPriority = priorityItems.includes(priority)
  let ispresentStatus = statusItems.includes(status)
  let getSearchQuery = null

  const trueResponse = async () => {
    const result = await db.all(getSearchQuery)
    console.log(result)
    response.send(
      result.map(eachObj => {
        return {
          id: eachObj.id,
          todo: eachObj.todo,
          priority: eachObj.priority,
          status: eachObj.status,
          category: eachObj.category,
          dueDate: eachObj.due_date,
        }
      }),
    )
  }

  console.log(isPresentCategory)
  console.log(isPresentPriority)
  console.log(ispresentStatus)

  switch (true) {
    case hasPriorityOnly(request.query):
      if (isPresentPriority === true) {
        getSearchQuery = `
      SELECT 
      * 
      FROM 
      todo 
      WHERE 
      priority 
      LIKE '${priority}' 
      AND 
      todo LIKE '%${search_q}%';`
        console.log(getSearchQuery)
        trueResponse()
      } else {
        console.log(getSearchQuery, 1)
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasStatusOnly(request.query):
      if (ispresentStatus === true) {
        getSearchQuery = `
      SELECT 
      * 
      FROM 
      todo 
      WHERE 
      status LIKE '${status}' 
      AND 
      todo LIKE '%${search_q}%';`
        console.log(getSearchQuery)
        trueResponse()
      } else {
        console.log(getSearchQuery, 2)
        response.status(400)
        response.send('Invalid Todo Status')
      }

      break
    case hasCategoryOnly(request.query):
      if (isPresentCategory === true) {
        getSearchQuery = `
      SELECT 
      * 
      FROM 
      todo 
      WHERE 
      category LIKE '${category}' 
      AND 
      todo LIKE '%${search_q}%';`
        console.log(getSearchQuery)
        trueResponse()
      } else {
        console.log(getSearchQuery, 3)
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasPriorityAndCategory(request.query):
      if (isPresentPriority === true && isPresentCategory === true) {
        getSearchQuery = `
      SELECT 
      * 
      FROM 
      todo 
      WHERE 
      priority LIKE '${priority}' 
      AND 
      category LIKE '${category}' 
      AND 
      todo LIKE '%${search_q}%';`
        console.log(getSearchQuery)
        trueResponse()
      } else if (isPresentCategory === true && isPresentPriority === false) {
        response.status(400)
        response.send('Invalid Todo Priority')
        console.log(getSearchQuery, 4)
      } else if (isPresentCategory === false && isPresentPriority === true) {
        console.log(getSearchQuery, 5)
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasPriorityAndStatus(request.query):
      if (isPresentPriority === true && ispresentStatus === true) {
        getSearchQuery = `
      SELECT 
      * 
      FROM 
      todo 
      WHERE 
      priority LIKE '${priority}' 
      AND 
      status LIKE '${status}' 
      AND 
      todo LIKE '%${search_q}%';`
        console.log(getSearchQuery)
        trueResponse()
      } else if (isPresentPriority === false && ispresentStatus === true) {
        console.log(getSearchQuery, 6)
        response.status(400)
        response.send('Invalid Todo Priority')
      } else if (isPresentPriority === true && ispresentStatus === false) {
        console.log(getSearchQuery, 7)
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case hasCategoryAndStatus(request.query):
      if (isPresentCategory === true && ispresentStatus === true) {
        getSearchQuery = `
      SELECT 
      * 
      FROM 
      todo 
      WHERE 
      category LIKE '${category}' 
      AND 
      status LIKE '${status}' 
      AND 
      todo LIKE '%${search_q}%';`
        console.log(getSearchQuery)
        trueResponse()
      } else if (isPresentCategory === false && ispresentStatus === true) {
        console.log(getSearchQuery, 8)
        response.status(400)
        response.send('Invalid Todo Category')
      } else if (isPresentCategory === true && ispresentStatus) {
        console.log(getSearchQuery, 9)
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case hasCategoryAndStatusAndPriority(request.query):
      if (
        isPresentCategory === true &&
        isPresentPriority === true &&
        ispresentStatus === true
      ) {
        getSearchQuery = `
      SELECT 
      * 
      FROM 
      todo 
      WHERE 
      category LIKE '${category}' 
      AND
       priority LIKE '${priority}' 
       AND 
       status LIKE '${status}' 
       AND 
       todo LIKE '%${search_q}%';`
        console.log(getSearchQuery)
        trueResponse()
      } else if (
        isPresentCategory === false &&
        isPresentPriority === true &&
        ispresentStatus === true
      ) {
        console.log(getSearchQuery, 10)
        response.status(400)
        response.send('Invalid Todo Status')
      } else if (
        isPresentCategory === true &&
        isPresentPriority === false &&
        ispresentStatus === true
      ) {
        console.log(getSearchQuery, 11)
        response.status(400)
        response.send('Invalid Todo Priority')
      } else if (
        isPresentCategory === true &&
        isPresentPriority === true &&
        ispresentStatus === false
      ) {
        console.log(getSearchQuery, 12)
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    default:
      getSearchQuery = `
      SELECT 
      * 
      FROM 
      todo 
      WHERE 
      todo LIKE '%${search_q}%';
      `
      console.log(getSearchQuery, 13)
      trueResponse()
  }
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getSearchQuery = `
     SELECT 
     * 
     FROM 
     todo
     WHERE
     id = '${todoId}';
     `
  const result = await db.get(getSearchQuery)
  response.send({
    id: result.id,
    todo: result.todo,
    priority: result.priority,
    status: result.status,
    category: result.category,
    dueDate: result.due_date,
  })
})

const {compareAsc, format} = require('date-fns')

app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  try {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    const getSearchQuery = `
  SELECT 
  *
  FROM 
  todo 
  WHERE 
  due_date = '${newDate}';
  `
    const result = await db.all(getSearchQuery)
    console.log(result)
    response.send(
      result.map(eachObj => {
        return {
          id: eachObj.id,
          todo: eachObj.todo,
          priority: eachObj.priority,
          status: eachObj.status,
          category: eachObj.category,
          dueDate: eachObj.due_date,
        }
      }),
    )
  } catch {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

app.post('/todos/', async (request, response) => {
  try {
    const {id, todo, priority, status, category, dueDate} = request.body
    const newDate = format(new Date(dueDate), 'yyyy-MM-dd')
    const postingFunction = async () => {
      const {id, todo, priority, status, category, dueDate} = request.body
      const newDate = format(new Date(dueDate), 'yyyy-MM-dd')
      const postQurey = `
    INSERT INTO
    todo(id, todo, priority, status, category, due_date)
    VALUES('${id}', '${todo}', '${priority}', '${status}', '${category}', '${newDate}');
    `
      await db.run(postQurey)
      response.send('Todo Successfully Added')
    }

    let isPresentPriority = priorityItems.includes(priority)
    let isPresentCategory = categoryItems.includes(category)
    let ispresentStatus = statusItems.includes(status)

    if (
      ispresentStatus === true &&
      isPresentCategory === true &&
      isPresentPriority === true
    ) {
      postingFunction()
    } else if (
      isPresentCategory === true &&
      isPresentPriority === true &&
      ispresentStatus === false
    ) {
      response.status(400)
      response.send('Invalid Todo Status')
    } else if (
      isPresentCategory === true &&
      isPresentPriority === false &&
      ispresentStatus === true
    ) {
      response.status(400)
      response.send('Invalid Todo Priority')
    } else if (
      isPresentCategory === false &&
      isPresentPriority === true &&
      ispresentStatus === true
    ) {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  } catch {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

app.put('/todos/:todoId/', async (request, response) => {
  try {
    const {todoId} = request.params
    let updateQurey = null
    switch (true) {
      case hasCategoryOnly(request.body):
        let isPresentCategory = categoryItems.includes(request.body.category)
        if (isPresentCategory === true) {
          updateQurey = `
     UPDATE 
     todo
     SET 
     category = '${request.body.category}'
     WHERE 
     id = '${todoId}';
     `
          console.log(updateQurey)
          await db.run(updateQurey)
          response.send('Category Updated')
        } else {
          response.status(400)
          response.send('Invalid Todo Category')
        }
        break
      case hasPriorityOnly(request.body):
        let isPresentPriority = priorityItems.includes(request.body.priority)
        if (isPresentPriority === true) {
          updateQurey = `
     UPDATE 
     todo
     SET 
     priority = '${request.body.priority}'
     WHERE 
     id = '${todoId}';
     `
          console.log(updateQurey)
          await db.run(updateQurey)
          response.send('Priority Updated')
        } else {
          response.status(400)
          response.send('Invalid Todo Priority')
        }

        break
      case hasStatusOnly(request.body):
        let ispresentStatus = statusItems.includes(request.body.status)
        console.log(ispresentStatus)
        if (ispresentStatus === true) {
          updateQurey = `
     UPDATE 
     todo
     SET 
     status = '${request.body.status}'
     WHERE 
     id = '${todoId}';`
          console.log(todoId)
          console.log(updateQurey)
          await db.run(updateQurey)
          response.send('Status Updated')
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
        break
      case hasTodoOnly(request.body):
        updateQurey = `
     UPDATE 
     todo
     SET 
     todo = '${request.body.todo}'
     WHERE 
     id = '${todoId}';
     `
        console.log(updateQurey)
        await db.run(updateQurey)
        response.send('Todo Updated')
        break
      case hasDueDateOnly(request.body):
        const newDate = format(new Date(request.body.dueDate), 'yyyy-MM-dd')
        let date = new Date(newDate)
        console.log(date)
        const month = date.getMonth()
        if (month <= 12) {
          updateQurey = `
     UPDATE 
     todo
     SET 
     due_date = '${request.body.dueDate}'
     WHERE 
     id = '${todoId}';
     `
          console.log(updateQurey)
          await db.run(updateQurey)
          response.send('Due Date Updated')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
        break
    }
  } catch {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQurey = `
  DELETE FROM 
  todo 
  WHERE 
  id = '${todoId}';`
  await db.run(deleteQurey)
  response.send('Todo Deleted')
})

module.exports = app
