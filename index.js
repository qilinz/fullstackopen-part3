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


app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}`
    )
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  Person.findOne({ name: body.name })
    .then(person => {
      if (person) {
        response.status(400).send({ error: `${body.name} already exists`})
      } else {
        const person = new Person({
          name: body.name,
          number: body.number
        })
        
        person.save()
          .then(savedPerson => {
            return response.json(savedPerson)
          })
          .catch(error => next(error))
      }
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(
    request.params.id, 
    person, 
    { new:true, runValidators: true }
  )
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.name);
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})