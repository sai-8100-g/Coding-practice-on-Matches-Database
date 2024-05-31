const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const path = require('path')

const dbpath = path.join(__dirname, 'userData.db')
let db = null

const intializer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log(`DB error: ${e.message}`)
    process.exit(1)
  }
}

intializer()

app.post('/register/', async (request, response) => {
  const {username, password, name, gender, location} = request.body
  const hasedPassword = bcrypt.hash(password, 10)
  const getUserDetails = `
    SELECT 
    *
    FROM 
    user
    WHERE 
    username='${username}';
    `
  const dbuser = await db.get(getUserDetails)
  if (dbuser !== undefined) {
    response.status(400)
    response.send('User already exists')
  } else {
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const createNewUser = `
                INSERT INTO 
                user(username, 
                     name,
                     password,
                     gender,
                     location)
                VALUES(
                     '${username}',
                     '${name}',
                     '${hasedPassword}',
                     '${gender}',
                     '${location}'
                );`
      await db.run(createNewUser)
      response.status(200)
      response.send('User created successfully')
    }
  }
})

app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const getUserDetails = `
  SELECT 
  * 
  FROM 
  user
  WHERE
  username = '${username}';`
  const dbuser = await db.get(getUserDetails)
  if (dbuser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbuser.password)
    if (isPasswordMatched === false) {
      response.status(400)
      response.send('Invalid password')
    } else {
      response.status(200)
      response.send('Login success!')
    }
  }
})

app.put('/change-password/', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  console.log(newPassword)
  console.log(oldPassword)
  const getUserDetails = `
  SELECT 
  * 
  FROM
  user
  WHERE 
  username='${username}';`
  const dbuser = await db.get(getUserDetails)
  console.log(dbuser)
  if (dbuser === undefined) {
    response.status(400)
    response.send('User not registered')
  } else {
    const isPasswordMatched = await bcrypt.compare(oldPassword, dbuser.password)
    console.log(isPasswordMatched)
    if (isPasswordMatched === false) {
      response.status(400)
      response.send('Invalid current password')
    } else {
      if (newPassword.length < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const newHasedPassword = bcrypt.hash(newPassword, 10)
        const creatingUser = `
        UPDATE
        user
        SET
        password = '${newHasedPassword}'
        WHERE 
        username = '${username}';`
        await db.run(creatingUser)
        response.status(200)
        response.send('Password updated')
      }
    }
  }
})

module.exports = app
