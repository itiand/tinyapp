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
};

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
};

const findUserByEmail = function(email) {
  return Object.values(users).find(user => user.email === email) || false;

};

///ROUTING/////
////////////////
///////////////
app.get('/urls', (req, res) => {
  const currentUser = users[req.cookies.user_id];

  ////DEV///
  // console.log('current cookie', req.cookies.user_id);
  // console.log(('users database', users));
  // console.log('retrieved user', currentUser);



  const templateVars = { userObj: currentUser, urls: urlDatabase };
  // console.log(req.cookies);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const currentUser = users[req.cookies.user_id];
  const templateVars = { userObj: currentUser, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const currentUser = users[req.cookies.user_id];
  const templateVars = { userObj: currentUser, urls: urlDatabase };
  res.render("form", templateVars);
});

app.get("/login", (req, res) => {
  const currentUser = users[req.cookies.user_id];
  const templateVars = { userObj: currentUser };
  res.render('login', templateVars);
});

//POST NON VAR
app.post("/urls", (req, res) => {
  const generatedId = generateRandomString();
  urlDatabase[generatedId] = req.body['longURL'];
  res.redirect(`/urls/${generatedId}`);
});

app.post('/login', (req, res) => {


  const userFound = findUserByEmail(req.body.email);

  if(!userFound || req.body.password !== userFound.password) {
    const message = "Invalid login";
    res.status(403).render('error400', { message, userObj: undefined  });
    return
  }

  console.log('Successfully logged in!');
  res.cookie('user_id',userFound.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const bodyInfo = req.body;
  const currentUser = users[req.cookies.user_id];
  //NEW
  //IF email or password empty --> 400
  if (!bodyInfo.email || !bodyInfo.password) {
    const message = "ERROR: Please fillout BOTH email and password.";
    console.log('CURRENT USER', currentUser);
    res.status(400).render('error400', { message, userObj: currentUser });
    return;
  }

  //if already in users --> 400 status code
  if (findUserByEmail(bodyInfo.email)) {
    const message = "ERROR: Email already in use";
    res.status(400).render('error400', { message, userObj: currentUser });
    return;
  }

  const id = generateRandomString();

  //updates our 'users database, parameters from req.body and generatedID
  users[id] = { id, email: bodyInfo.email, password: bodyInfo.password };

  //then set the cookie to the generated id --> user_id = genertatedID
  res.cookie('user_id', users[id].id);

  //redirect tp the urls page
  res.redirect('/urls');
});


///VARIABLE ROUTES
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const currentUser = users[req.cookies.user_id];
  const templateVars = { userObj: currentUser, id: req.params.id, longURL: urlDatabase[req.params.id] };

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