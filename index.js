const { notStrictEqual } = require('assert')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

morgan.token('data', (request) => {
  if (request.method !== "POST") {
    return null
  }
  return JSON.stringify(request.body)
})

const app = express()

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(cors())

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}`
  )
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

app.post('/api/persons', (request, response) => {
  console.log(request.method, typeof request.method)
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      "error": 'name missing'
    })
  } else if (!body.number) {
    return response.status(400).json({
      "error": 'number missing'
    })
  } else if (persons.find(p => p.name === body.name)) {
    return response.status(400).json({
      "error": 'name must be unique'
    })
  }
  const person = {
    id: getRandomInt(100000, 1000000),
    name: body.name,
    number: body.number
  }
  persons = persons.concat(person)
  return response.json(person)

})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})