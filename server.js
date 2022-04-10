const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')

const User = require('./Model/User');
const Exercise = require('./Model/Exercise');
const mongoose = require('mongoose');
const moment = require('moment')

require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }))

app.use(cors())

app.post('/api/users/:id/exercises', function(req,res,next){
  console.log(req.method, req.baseUrl, req.hostname)
  next();
})

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

function convertToDate(date){
  return moment(date).format('ddd MMM DD YYYY')
}

/* CREATE USER */
app.post('/api/users', async (req, res) => {
  try {
    const findUser = await User.findOne({ username: req.body.username })
    if (findUser) {
      res.json({ error: 'User already created' })
      return
    }

    const user = new User({
      username: req.body.username
    })

    const result = await user.save()

    const responseData = (({ username, _id }) => ({ username, _id }))(result)

    res.json({ ...responseData })
  }
  catch (err) {
    res.json({ error: err })
  }
})

/* CREATE EXERCISE */
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const findUser = await User.findById(req.params._id)
    if (!findUser) {
      res.json({ error: 'User not founded' })
      return
    }


    const newDate = moment(req.body.date).format('YYYY-MM-DD')
    const resDate = convertToDate(req.body.date)

    console.log(newDate,resDate)

    const exercise = new Exercise({
      username: findUser.username,
      description: req.body.description,
      duration: req.body.duration,
      date: newDate
    })

    const result = await exercise.save()

    const responseData = ({
      _id: findUser._id,
      username: result.username,
      date: resDate,
      duration: result.duration,
      description: result.description
    })

    res.json({ ...responseData })
  }
  catch (err) {
    res.json({ error: err })
    console.log(err)
  }
})

/* GET ALL USERS */
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();

    const usersRes = users.map((d) => {
      return {
        _id: d.id,
        username: d.username,
      }
    })
    res.json(usersRes)
  } catch (error) {
    res.json(error)
  }
})

/* GET LOGS USERS */
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const findUser = await User.findById(req.params._id)
    if (!findUser) {
      res.json({ error: "User not found" })
    }

    let { from = "1970-02-02", to = "2100-01-01", limit = 0 } = req.query

    from = moment(from).utcOffset('+0700').format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    to = moment(to).utcOffset('+0700').format("YYYY-MM-DDTHH:mm:ss.SSSZ");

    const findExercises = await Exercise.find({ username: findUser.username, date: { $gt: from, $lt: to } }).limit(limit);

    const resultExercises = findExercises.map(d => {
      return {
        description: d.description,
        duration: d.duration,
        date: convertToDate(d.date),
      }
    })

    const result = {
      username: findUser.username,
      count: findExercises.length,
      _id: findUser._id,
      log: [...resultExercises]
    }
    res.json(result)

  }
  catch (err) {
    res.json({ error: err })
  }

})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
