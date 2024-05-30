const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const dbpath = path.join(__dirname, 'cricketMatchDetails.db')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

let db = null

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

app.get('/players/', async (request, response) => {
  const query = `
    SELECT 
    * 
    FROM 
    player_details;
    `
  const result = await db.all(query)
  response.send(
    result.map(eachObj => {
      return {
        playerId: eachObj.player_id,
        playerName: eachObj.player_name,
      }
    }),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `
    SELECT 
    * 
    FROM 
    player_details
    WHERE
    player_id = '${playerId}';
    `
  const result = await db.get(query)
  response.send({
    playerId: result.player_id,
    playerName: result.player_name,
  })
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const query = `
    UPDATE 
    player_details
    SET
    player_name = '${playerName}'
    WHERE
    player_id = '${playerId}';
    `
  await db.run(query)
  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const query = `
    SELECT 
    * 
    FROM 
    match_details
    WHERE
    match_id = '${matchId}';
    `
  const result = await db.get(query)
  console.log(result)
  response.send({
    matchId: result.match_id,
    match: result.match,
    year: result.year,
  })
})

app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const query = `
    SELECT 
    m.match_id,
    m.match,
    m.year
    FROM 
    player_match_score as pm
    NATURAL JOIN 
    match_details as m
    WHERE 
    player_id = '${playerId}';
    `
  const result = await db.all(query)
  console.log(result)
  response.send(
    result.map(eachObj => {
      return {
        matchId: eachObj.match_id,
        match: eachObj.match,
        year: eachObj.year,
      }
    }),
  )
})

app.get('/matches/:matchId/players/', async (request, response) => {
  const {matchId} = request.params
  const query = `
    SELECT 
    p.player_id,
    p.player_name
    FROM 
    player_match_score as pm
    NATURAL JOIN 
    player_details as p
    WHERE 
    pm.match_id = '${matchId}';
    `
  const result = await db.all(query)
  response.send(
    result.map(eachObj => {
      return {
        playerId: eachObj.player_id,
        playerName: eachObj.player_name,
      }
    }),
  )
})

app.get('/players/:playerId/playerScores/', async (request, response) => {
  const {playerId} = request.params
  const query = `
    SELECT 
    p.player_id,
    p.player_name,
    sum(pm.score) as score,
    sum(pm.fours) as fours,
    sum(pm.sixes) as sixes
    FROM 
    player_match_score as pm
    NATURAL JOIN 
    player_details as p
    WHERE 
    player_id = '${playerId}';
    `
  const result = await db.get(query)
  console.log(result)
  response.send({
    playerId: result.player_id,
    playerName: result.player_name,
    totalScore: result.score,
    totalFours: result.fours,
    totalSixes: result.sixes,
  })
})

module.exports = app
