const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const bcrypt = require('bcryptjs');
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: { 
    longURL: "https://www.tsn.ca",
    userID: "itian",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "negativedelos",
  },
  isBsGw: {
    longURL: "https://www.google.ca",
    userID: "negativedelos",
  }
};

const users = {
  itian: {
    id: "itian",
    email: "itian@example.com",
    password: "password",
  },
  negativedelos: {
    id: "negativedelos",
    email: "negativedelos@example.com",
    password: "password1",
  },
};

const isLoggedIn = function(reqBodyObj) {
  if (!Object.keys(reqBodyObj.cookies).includes('user_id')) return false;
  return true;
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

const urlsForUser = function(id) {
  let userURLs = {};
  for (let urlID in urlDatabase) {
    if (id === urlDatabase[urlID].userID) {
      userURLs[urlID] = urlDatabase[urlID];
    }
  }
  return userURLs;
};

const isUsersURL = function(urlID, usersURLObj) {
  return Object.keys(usersURLObj).includes(urlID);
};

///ROUTING/////
////////////////
///////////////
app.get('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    const message = "Please login first.";
    res.render('login-first', { message, userObj : undefined });
    return;
  }

  const currentUser = users[req.cookies.user_id];
  const urlsForCurrentUser = urlsForUser(currentUser.id);
  const templateVars = { userObj: currentUser, urls: urlsForCurrentUser };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!isLoggedIn(req)) {
    res.redirect('/login');
    return;
  }

  const currentUser = users[req.cookies.user_id];
  const templateVars = { userObj: currentUser };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  if (isLoggedIn(req)) {
    console.log("yep logged in");
    res.redirect('/urls');
    return;
  }

  const currentUser = users[req.cookies.user_id];
  const templateVars = { userObj: currentUser };
  res.render("form", templateVars);
});

app.get("/login", (req, res) => {
  if (isLoggedIn(req)) {
    console.log("yep logged in");
    res.redirect('/urls');
    return;
  }
  const currentUser = users[req.cookies.user_id];
  const templateVars = { userObj: currentUser };
  res.render('login', templateVars);
});

//POST NON VAR
app.post("/urls", (req, res) => {
  if (!isLoggedIn(req)) {
    res.send('Please login first.');
    return;
  }
  
  const generatedId = generateRandomString();
  urlDatabase[generatedId] = {};
  urlDatabase[generatedId]['longURL'] = req.body['longURL'];
  urlDatabase[generatedId]['userID'] = req.cookies.user_id;
  console.log(urlDatabase[generatedId]);
  console.log('urldatabase :', urlDatabase);
  res.redirect(`/urls/${generatedId}`);
});

app.post('/login', (req, res) => {
  const userFound = findUserByEmail(req.body.email);
  const passwordInput = req.body.password;
  const hashedPass = userFound.password;

  console.log(passwordInput, " VS ", hashedPass);

  const correctPassword = bcrypt.compareSync(passwordInput, hashedPass);
  
  if (!userFound || !correctPassword) {
    const message = "Invalid login";
    res.status(403).render('error400', { message, userObj: undefined });
    return;
  }

  console.log('Successfully logged in!');
  res.cookie('user_id', userFound.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  const bodyInfo = req.body;
  const currentUser = users[req.cookies.user_id];

  //IF email or password empty --> 400
  if (!bodyInfo.email || !bodyInfo.password) {
    const message = "ERROR: Please fillout BOTH email and password.";
    console.log('CURRENT USER', currentUser);
    res.status(400).render('error400', { message, userObj: currentUser });
    return;
  }

  if (findUserByEmail(bodyInfo.email)) {
    const message = "ERROR: Email already in use";
    res.status(400).render('error400', { message, userObj: currentUser });
    return;
  }

  const id = generateRandomString();
  const password = bodyInfo.password;
  var hash = bcrypt.hashSync(password, 10);
  console.log('HASH - ',hash);

  //updates our 'users database, parameters from req.body and generatedID
  users[id] = { id, email: bodyInfo.email, password: hash };
  console.log('Users[id]', users[id]);

  //then set the cookie to the generated id --> user_id = genertatedID
  res.cookie('user_id', users[id].id);
  //redirect tp the urls page
  res.redirect('/urls');
});

///VARIABLE ROUTES
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const currentUser = users[req.cookies.user_id];
    const message = "URL does not exist.";
    res.status(400).render('error400', { message, userObj: currentUser });
    return;
  }

  const longURL = urlDatabase[req.params.id].longURL;
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  if (!isLoggedIn(req)) {
    const message = "Please login first.";
    res.render('login-first', { message, userObj : undefined });
    return;
  }

  const currentUser = users[req.cookies.user_id];
  const urlID = req.params.id;
  const urlsForCurrentUser = urlsForUser(currentUser.id);
  const belongsToUser = isUsersURL(urlID, urlsForCurrentUser)
  let templateVars = { userObj: currentUser, urlID };

  //if url does not exist or if it doesn't belong to user
  if (!urlDatabase[urlID] || !belongsToUser ) {
    const message = "URL not found in your account.";
    return res.status(400).render('error400', {message, ... templateVars});
  }

  const longURL = urlsForCurrentUser[urlID].longURL;
  templateVars = { longURL, ...templateVars}

  res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  if (!isLoggedIn(req)) {
    res.send('Please login first.');
    return;
  }

  const currentUser = users[req.cookies.user_id];
  const urlsForCurrentUser = urlsForUser(currentUser.id);
  const urlID = req.params.id;
  const belongsToUser = isUsersURL(urlID, urlsForCurrentUser)
  //if url does not exist or if it doesn't belong to user
  if (!urlDatabase[urlID] || !belongsToUser ) {
    res.send("URL not found in your account.");
  }

  delete urlDatabase[req.params.id];

  //redirect to /urls
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  if (!isLoggedIn(req)) {
    res.send('Please login first.');
    return;
  }

  const currentUser = users[req.cookies.user_id];
  const urlsForCurrentUser = urlsForUser(currentUser.id);
  const urlID = req.params.id;
  const belongsToUser = isUsersURL(urlID, urlsForCurrentUser)
  //if url does not exist or if it doesn't belong to user
  if (!urlDatabase[urlID] || !belongsToUser ) {
    res.send("URL not found in your account.");
  }

  //if logged in and they own the url....
  const updatedURL = req.body['updatedURL'];
  //// Update the URL in the database
  urlDatabase[urlID].longURL = updatedURL;
  res.redirect(`/urls/${urlID}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening to port ${PORT}!`);
});