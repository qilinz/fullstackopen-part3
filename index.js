require('dotenv').config()
const express = require('express')
const { notEqual } = require('assert')
const cors = require('cors')
const Person = require('./models/person')
const morgan = require('morgan')

morgan.token('data', (request) => {
  if (request.method !== "POST") {
    return null
  }
  return JSON.stringify(request.body)
})


const app = express()

app.use(express.json())
app.use(express.static('build')) // make express hsow static content
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(cors())


// app.get('/info', (request, response) => {
//   response.send(
//     `<p>Phonebook has info for ${persons.length} people</p>
//     <p>${new Date()}`
//   )
// })

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

// app.delete('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id)
//   persons = persons.filter(person => person.id !== id)

//   response.status(204).end()
// })

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      "error": 'name missing'
    })
  } else if (!body.number) {
    return response.status(400).json({
      "error": 'number missing'
    })
  } 

  const person = new Person({
    name: body.name,
    number: body.number
  })
  
  person.save().then(savedPerson => {
    return response.json(savedPerson)
  })

})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})