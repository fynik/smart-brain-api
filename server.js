const express = require("express");

const PORT = 3001;

const app = express();

app.use(express.json());

const database = {
  users: [
    {
      id: 1,
      name: "John",
      email: "jonh@somemail.org",
      password: "user1",
      entries: 0,
      joined: new Date()
    },
    {
      id: 2,
      name: "Martha",
      email: "martha@somemail.org",
      password: "user2",
      entries: 0,
      joined: new Date()
    },
  ]
}

app.get("/", (req, res) => {
  res.send("server is working");
});

app.get("/users", (req, res) => {
  res.json(database.users);
});

app.get("/profile/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = database.users.find(p => p.id === id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({error: "no such user"});
  }
})
app.post("/signin", (req, res) => {
  const bosy = req.body;
  const user = database.users.find(p => p.email === body.email);
  if (user && user.password === body.password) {
    res.json("success")
  } else {
    res.status(400).json({error: "error logging in"});
  }
});

app.post("/register", (req, res) => {
  const body = req.body;
  const user = database.users.find(p => p.email === body.email);
  if (user) {
    res.status(400).json({error: "this email already exist"});
  } else if (!body.email || !body.name || !body.password) {
    res.status(400).json({error: "some form fields are missing"});
  } else {
    const newUser = {
      id: generateId(),
      name: body.name,
      email: body.email,
      password: body.password,
      entries: 0,
      joined: new Date()
    }
    database.users = database.users.concat(newUser);
    res.json(newUser);
  }
});

app.put('/image', (req, res) => {
  const id = Number(req.body.id);
  const user = database.users.find(p => p.id === id);

  if (user) {
    user.entries = user.entries + 1;
    database.users = database.users.filter(p => p.id !== id);
    database.users = database.users.concat(user);
    res.json({ entries: user.entries });
  } else {
    res.status(404).json({error: "no such user"});
  }
});

const generateId = () => {
  const rangeUpperLimit = 10000;
  const currentIds = database.users.map(p => p.id);

  let newId = Math.floor(1 + Math.random() * rangeUpperLimit);

  while (currentIds.includes(newId)) {
    newId = Math.floor(1 + Math.random() * rangeUpperLimit);
  }
  
  return newId;
}

app.listen(PORT, () => console.log(`Server  is running on port ${PORT}`));