const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  itian: {
    id: "itian",
    email: "itian@example.com",
    password: "password",
  },
  negativedelos: {
    id: "negativedelos",
    email: "itian@example.com",
    password: "password1",
  },
}

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}


///ROUTING/////
////////////////
///////////////
app.get('/urls', (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  // console.log(req.cookies);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("form", templateVars)
})

//POST NON VAR
app.post("/urls", (req, res) => {
  const generatedId = generateRandomString();
  urlDatabase[generatedId] = req.body['longURL'];
  res.redirect(`/urls/${generatedId}`);
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);

  res.redirect('/urls');
});

app.post('/logout', (req,res) => {
  res.clearCookie('username')
  res.redirect('/urls');
})

app.post('/register', (req,res) => {
  // const newUser = {}
  const id = generateRandomString()

  //updates our 'users database, parameters from req.body and generatedID
  users[id] = { id, email : req.body.email, password : req.body.password  }

  //then set the cookie to the generated id --> user_id = genertatedID
  res.cookie('user_id', users[id].id);

  //redirect tp the urls page
  res.redirect('/urls')
})


///VARIABLE ROUTES
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { username: req.cookies["username"], id: req.params.id, longURL: urlDatabase[req.params.id] };

  res.render("urls_show", templateVars);
});


app.post('/urls/:id/delete', (req, res) => {

  delete urlDatabase[req.params.id];

  //redirect to /urls
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const updatedURL = req.body['updatedURL'];

  // // Update the URL in the database
  urlDatabase[id] = updatedURL;
  res.redirect(`/urls/${id}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening to port ${PORT}!`);
});


// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });