const { findUserByEmail, generateRandomString, isLoggedIn, isUsersURL } = require('./helpers');
const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const bcrypt = require('bcryptjs');
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['barney', 'is', 'a', 'dinosaur', 'mary had a little', 'lamb']
}));
app.use(express.urlencoded({ extended: true }));

//DATA//
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "pJhU8g",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "pJhU8g",
  },
  isBsGw: {
    longURL: "https://www.google.ca",
    userID: "wZ2qTp",
  }
};

const users = {
  pJhU8g: {
    id: 'pJhU8g',
    email: 'c@gmail.com',
    password: '$2a$10$UDGS85RB7iBVtnHRcPD7..rVJvRZLIfLdWoA9hNS1l01GlmHqUm/S'
  },
  wZ2qTp: {
    id: 'wZ2qTp',
    email: 'itian@example.com',
    password: '$2a$10$jIKGZAKojx5rQlBTxtF2E.zpma.Pi6s1hFNJy7TZPjJgBNS9hpR2u'
  }
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

////ROUTES////
app.get('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    const message = "Please login to get started";
    res.render('login-first', { message, userObj: undefined });
    return;
  }

  const currentUser = users[req.session.user_id];
  const urlsForCurrentUser = urlsForUser(currentUser.id);
  const templateVars = { userObj: currentUser, urls: urlsForCurrentUser };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!isLoggedIn(req)) {
    const message = "Please login first";
    res.render('login-first', { message, userObj: undefined });
    return;
  }

  const currentUser = users[req.session.user_id];
  const templateVars = { userObj: currentUser };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/urls');
    return;
  }

  const currentUser = users[req.session.user_id];
  const templateVars = { userObj: currentUser };
  res.render("form", templateVars);
});

app.get("/login", (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/urls');
    return;
  }
  const currentUser = users[req.session.user_id];
  const templateVars = { userObj: currentUser };
  res.render('login', templateVars);
  //return
});

app.post("/urls", (req, res) => {
  if (!isLoggedIn(req)) {
    res.send('Please login first.');
    return;
  }

  const generatedId = generateRandomString();
  urlDatabase[generatedId] = {};
  urlDatabase[generatedId]['longURL'] = req.body['longURL'];
  urlDatabase[generatedId]['userID'] = req.session.user_id;
  res.redirect(`/urls/${generatedId}`);
});

app.post('/login', (req, res) => {

  let userFound = findUserByEmail(req.body.email, users);
  if (!userFound) {
    const message = "Invalid login";
    res.status(403).render('error400', { message, userObj: undefined });
    return;
  }

  const passwordInput = req.body.password;
  const hashedPass = userFound.password;
  const correctPassword = bcrypt.compareSync(passwordInput, hashedPass);
  if (!correctPassword) {
    const message = "Invalid login";
    res.status(403).render('error400', { message, userObj: undefined });
    return;
  }

  console.log('Successfully logged in!');
  req.session.user_id = userFound.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  const bodyInfo = req.body;
  const currentUser = users[req.session.user_id];

  //If email or password empty --> 400
  if (!bodyInfo.email || !bodyInfo.password) {
    const message = "ERROR: Please fillout BOTH email and password.";
    res.status(400).render('error400', { message, userObj: currentUser });
    return;
  }

  if (findUserByEmail(bodyInfo.email, users)) {
    const message = "ERROR: Email already in use";
    res.status(400).render('error400', { message, userObj: currentUser });
    return;
  }

  const id = generateRandomString();
  const password = bodyInfo.password;
  const hash = bcrypt.hashSync(password, 10);

  //updates users database
  users[id] = { id, email: bodyInfo.email, password: hash };
  req.session.user_id = users[id].id;

  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const currentUser = users[req.session.user_id];
    const message = "URL does not exist.";
    res.status(400).render('error400', { message, userObj: currentUser });
    return;
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  if (!isLoggedIn(req)) {
    const message = "Please login first.";
    res.render('login-first', { message, userObj: undefined });
    return;
  }

  const currentUser = users[req.session.user_id];
  const urlID = req.params.id;
  const urlsForCurrentUser = urlsForUser(currentUser.id);
  const belongsToUser = isUsersURL(urlID, urlsForCurrentUser);
  let templateVars = { userObj: currentUser, urlID };

  //if url does not exist or if does not match to user
  if (!urlDatabase[urlID] || !belongsToUser) {
    const message = "URL not found in your account.";
    return res.status(400).render('error400', { message, ...templateVars });
  }

  const longURL = urlsForCurrentUser[urlID].longURL;
  templateVars = { longURL, ...templateVars };

  res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  if (!isLoggedIn(req)) {
    res.send('Please login first.');
    return;
  }

  const currentUser = users[req.session.user_id];
  const urlsForCurrentUser = urlsForUser(currentUser.id);
  const urlID = req.params.id;
  const belongsToUser = isUsersURL(urlID, urlsForCurrentUser);

  //if url does not exist or if does not match to user
  if (!urlDatabase[urlID] || !belongsToUser) {
    res.send("URL not found in your account.");
  }

  delete urlDatabase[req.params.id];

  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  if (!isLoggedIn(req)) {
    res.send('Please login first.');
    return;
  }

  const currentUser = users[req.session.user_id];
  const urlsForCurrentUser = urlsForUser(currentUser.id);
  const urlID = req.params.id;
  const belongsToUser = isUsersURL(urlID, urlsForCurrentUser);

  //if url does not exist or if it doesn't belong to user
  if (!urlDatabase[urlID] || !belongsToUser) {
    res.send("URL not found in your account.");
  }

  //if logged in and url matches
  const updatedURL = req.body['updatedURL'];
  urlDatabase[urlID].longURL = updatedURL;
  res.redirect(`/urls/${urlID}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening to port ${PORT}!`);
});