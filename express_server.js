const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.post("/urls", (req, res) => {
  const generatedId = generateRandomString()
  urlDatabase[generatedId] = req.body['longURL']
  console.log(urlDatabase);
  res.redirect(`/urls/${generatedId}`);

});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  console.log('testing', req.params);
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };

  res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', (req,res) => {
  console.log(req.params); //{ id: '9sm5xK' }
  delete urlDatabase[req.params.id];

  //redirect to /urls
  res.redirect('/urls')
})

app.post('/urls/:id/update', (req, res) => {
  const id = req.params.id;
  // const newURL = req.body['newURL'];

  console.log(id);
  console.log(req.body);
  // // Update the URL in the database
  // urlDatabase[id] = newURL;

  // res.redirect(`/urls/${id}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening to port ${PORT}!`);
});
