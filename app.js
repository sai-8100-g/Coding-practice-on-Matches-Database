const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const dbPath = path.join(__dirname, 'covid19IndiaPortal.db')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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

const authenticateToken = (request, response, next) => {
  const headerInfo = request.headers['authorization']

  let jwtToken = null
  if (headerInfo !== undefined) {
    jwtToken = headerInfo.split(' ')[1]
  } else {
    response.status(401)
    response.send('Invalid JWT Token')
  }
  if (jwtToken === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jwt.verify(jwtToken, 'SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(400)
        response.send('Invalid jwt Access Token')
      } else {
        request.username = payload.username
        next()
      }
    })
  }
}

app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const checkForUserExist = `
    SELECT 
    *
    FROM
    user
    WHERE 
    username = '${username}';
    `
  const dbUser = await db.get(checkForUserExist)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched === false) {
      response.status(400)
      response.send('Invalid password')
    } else {
      const payload = {
        username: username,
      }
      const jwtToken = jwt.sign(payload, 'SECRET_TOKEN')
      response.send({
        jwtToken: jwtToken,
      })
    }
  }
})

app.get('/states/', authenticateToken, async (request, response) => {
  const getStatesListQuery = `
  SELECT 
  *
  FROM 
  state; 
  `
  const result = await db.all(getStatesListQuery)
  response.send(
    result.map(eachObj => {
      return {
        stateId: eachObj.state_id,
        stateName: eachObj.state_name,
        population: eachObj.population,
      }
    }),
  )
})

app.get('/states/:stateId/', authenticateToken, async (request, response) => {
  const {stateId} = request.params
  const getStatesListQuery = `
  SELECT 
  *
  FROM 
  state
  WHERE 
  state_id = '${stateId}'; 
  `
  const result = await db.get(getStatesListQuery)
  response.send({
    stateId: result.state_id,
    stateName: result.state_name,
    population: result.population,
  })
})

app.post('/districts/', authenticateToken, async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const insertingDetails = `
      INSERT INTO 
      district(district_name,
               state_id,
               cases,
               cured,
               active,
               deaths)
      VALUES('${districtName}',
              '${stateId}',
              '${cases}',
              '${cured}',
              '${active}',
              '${deaths}');`
  await db.run(insertingDetails)
  response.send('District Successfully Added')
})

app.get(
  '/districts/:districtId/',
  authenticateToken,
  async (request, response) => {
    const {districtId} = request.params
    const getStatesListQuery = `
  SELECT 
  *
  FROM 
  district
  WHERE
  district_id = '${districtId}'; 
  `
    const result = await db.get(getStatesListQuery)
    console.log(result)
    response.send({
      districtId: result.district_id,
      districtName: result.district_name,
      stateId: result.state_id,
      cases: result.cases,
      cured: result.cured,
      active: result.active,
      deaths: result.deaths,
    })
  },
)

app.delete(
  '/districts/:districtId',
  authenticateToken,
  async (request, response) => {
    const {districtId} = request.params
    const deletingQuery = `
  DELETE FROM 
  district
  WHERE 
  district_id = '${districtId}';`
    await db.run(deletingQuery)
    response.send('District Removed')
  },
)

app.put(
  '/districts/:districtId/',
  authenticateToken,
  async (request, response) => {
    const {districtName, stateId, cases, cured, active, deaths} = request.body
    const {districtId} = request.params
    const updatingQuery = `
  UPDATE 
  district 
  SET 
  district_name='${districtName}',
  state_id='${stateId}',
  cases='${cases}',
  cured='${cured}',
  active='${active}',
  deaths='${deaths}';
  WHERE 
  district_id = '${districtId}';`
    await db.run(updatingQuery)
    response.send('Districts Details Updated')
  },
)

app.get(
  '/states/:stateId/stats/',
  authenticateToken,
  async (request, response) => {
    const {stateId} = request.params
    const getStatesListQuery = `
  SELECT 
  sum(cases) as cases,
  sum(cured) as cured,
  sum(active) as active,
  sum(deaths) as deaths
  FROM 
  district
  WHERE 
  state_id = '${stateId}'; 
  `
    const result = await db.get(getStatesListQuery)
    console.log(result)
    response.send({
      totalCases: result.cases,
      totalCured: result.cured,
      totalActive: result.active,
      totalDeaths: result.deaths,
    })
  },
)

module.exports = app
