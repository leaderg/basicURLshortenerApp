//Dependencies and modules declared.
const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const app = express();
const port = 8080;

//sets view engine to EJS
app.set("view engine", "ejs");

//Assigns module methods
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000
}));

//Commissioning URL and User Database.
const urlDatabase = {};
const users = {};

//Redirect to homepage "/urls"
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Registration page GET
app.get("/register", (req, res) => {
  let templateVariables = { userlist: users, user_Id: req.session.user_id };
  res.render("registration", templateVariables);
});

//Registration form POST
app.post("/register", (req, res) => {
  if (inUsers(users, 'email', req.body.email)) {
    res.status(400).send('email in use</br><a href="/register">Go Back</a>');
  } else {
    let newId = generateRandomString();
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: hashedPassword(req.body.pass)
    };
    req.session.user_id = newId;
    console.log(users);
    res.redirect("/urls");
  }
});

//Login Page GET
app.get("/login", (req, res) => {
  let templateVariables = { urls: urlDatabase, userlist: users, user_Id: req.session.user_id };
  res.render("login", templateVariables);
});

//Login form POST
app.post("/login", (req,res) => {
  let tempID = emailToId(req.body.email);
  if (tempID === false) {
    res.send(`User not found </br><a href="/login">Go Back</a>`)
  } else if (bcrypt.compareSync(req.body.pass, users[tempID].password)) {
      req.session.user_id = tempID;
  } else {
    res.send(`Password incorrect.</br><a href="/login">Go Back</a>`)
  }
  res.redirect("/urls");
});

//Logout POST
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Homepage GET
app.get("/urls", (req, res) => {
  let templateVariables = { urls: urlDatabase, userlist: users, user_Id: req.session.user_id };
  res.render("urls_index", templateVariables);
});

//Create a new TinyApp URL page GET
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/urls");
  } else {
    let templateVariables = { userlist: users, user_Id: req.session.user_id };
    res.render("urls_new", templateVariables);
  };
});

//Create new TinyApp URL POST
app.post("/urls", (req, res) => {
  let shortenedURL = generateRandomString()
  urlDatabase[shortenedURL] = {
    longURL: addhttp(req.body.longURL),
    userID: req.session.user_id};
  let templateVars = { shortURL: shortenedURL, longURL: req.body.longURL, userlist: users, user_Id: req.session.user_id };
  res.redirect("/urls");
});

//Delete a TinyApp URL POST
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Page to edit TinyApp URL GET
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, fullURL: urlDatabase[req.params.shortURL].longURL, userlist: users, user_Id: req.session.user_id };
  res.render("urls_show", templateVars);
});

//Edit TinyApp URL POST
app.post("/urls/:shortURL", (req, res) => {
  if (shortURLExists(req.params.shortURL)) {
    urlDatabase[req.params.shortURL].longURL = addhttp(req.body.newURL);
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  };
});

//Redirect to TinyApp original URL GET
app.get("/u/:shortURL", (req, res) => {
  if (shortURLExists(req.params.shortURL)) {
    let outboundURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(outboundURL);
  };
  res.status(400).send('Shorted URL does not exist.</br><a href="/urls">Go Back</a>');
});

//Listening Port to commission server.
app.listen(port, () => {
  console.log(`Basic initialation of server listing on port: ${port}.`);
});


//Function list
//generates a randomized ID (Not scaleable)
function generateRandomString() {
   let result           = '';
   let characters       = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
   let charactersLength = characters.length;
   for ( let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   };
   return result;
};

//Searches User ID to see if in list.
function inUsers(obj, key, value) {
  for (let entry in obj) {
    if (obj[entry][key] === value) {
      return true;
    };
  };
  return false;
};

//Determines user's email address from a given user ID.
function idToEmail(user_id) {
  if (users[user_id].email !== undefined) {
    return users[user_id].email;
  } else return "None";
};

//takes an email adress and finds corrosponding user ID.
function emailToId(input) {
  for (let id in users) {
    if (users[id].email === input) {
      return id;
    };
  };
  return false;
};

//Determines if a tinyApp URL exists in the database.
function shortURLExists(shorturl) {
  if (urlDatabase[shorturl]) return true;
  else return false;
};

//Hashes a password.
function hashedPassword(password) {
  return bcrypt.hashSync(password, 10)
};

//Error handles http.
function addhttp(url) {
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  };
  return url;
};