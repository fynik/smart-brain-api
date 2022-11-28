const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt-nodejs");
const knex = require('knex')

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'ash12345',
    database : 'smart-brain'
  }
});

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("server is working");
});

app.get("/users", (req, res) => {
  db.select('*').from('users')
    .then(users => {
      if (users.length) {
        res.json(users);
      } else {
        res.status(400).json("no users in db");
      }
    })
    .catch(err => res.status(400).json("error getting users"));
});

app.get("/profile/:id", (req, res) => {
  const id = Number(req.params.id);
  db('users').where({ id }).select('*')
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("no such user");
      }
    })
    .catch(err => res.status(400).json("error getting user"));
});

app.post("/signin", (req, res) => {
  const body = req.body;

  db.select('email', 'hash').from('login')
    .where({email:body.email})
    .then(data => {
      const isValid = bcrypt.compareSync(body.password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users').where({email:body.email})
          .then(user => res.json(user[0]))
          .catch(err => res.status(400).json("unable to get user"));
      }
      res.status(400).json("wrong credentials");
    })
    .catch(err => res.status(400).json("error logging in"));
});

app.post("/register", (req, res) => {
  const body = req.body;
  if (!body.email || !body.name || !body.password) {
    res.status(400).json({error: "some form fields are missing"});
  } else {
    const hash = bcrypt.hashSync(body.password);
    
    const loginInfo = {
      email: body.email,
      hash: hash
    }

    db.transaction(trx => {
      trx.insert(loginInfo).into('login')
        .returning('email')
        .then(loginEmail => {
          const newUser = {
            name: body.name,
            email: loginEmail[0].email,
            entries: 0,
            joined: new Date()
          }
          trx('users')
            .returning('*')
            .insert(newUser)
            .then(user => res.json(user[0]))
            .catch(err => res.status(400).json("unable to register"));
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })

    
  }
});

app.put('/image', (req, res) => {
  const id = Number(req.body.id);

  db('users').where({id})
  .increment('entries', 1)
  .returning('entries')
  .then(data => res.json(data[0].entries))
  .catch(err => res.status(400).json("unable to get entries"));
});

app.listen(PORT, () => console.log(`Server  is running on port ${PORT}`));