const express = require("express");
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//app.route() create chainable route handlers for a route path GET POST etc.
app.get("/", (req, res) => {
  res.send("Help Me");
});

app.get("/register", (req, res) => {
  let templateVariables = { username: req.cookies["username"] };
  res.render("registration", templateVariables);
});

app.post("/register", (req, res) => {
  if (inUsers(users, 'email', req.body.user)) {
    res.status(400).send('email in use</br><a href="/register">Go Back</a>');
  } else {
    let newId = generateRandomString();
    users[newId] = {
      id: newId,
      email: req.body.user,
      password: req.body.pass
    };
    res.cookie("username", req.body.user);
    console.log(users);
    res.redirect("/urls");
  }});

app.get("/urls", (req, res) => {
  let templateVariables = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVariables);
});

app.get("/urls/new", (req, res) => {
  let templateVariables = {username: req.cookies["username"]};
  res.render("urls_new", templateVariables);
});

app.post("/urls", (req, res) => {
  let shortenedURL = generateRandomString()
  urlDatabase[shortenedURL] = "http://" + req.body.longURL;
  let templateVars = { shortURL: shortenedURL, longURL: req.body.longURL, username: req.cookies["username"] };
  // res.render("urls_show", templateVars);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect("/urls");
});

app.post("/login", (req,res) => {
  res.cookie("username", req.body.username);
  // userCookie.username = req.cookies["username"];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let outboundURL = urlDatabase[req.params.shortURL];
  res.redirect(outboundURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(port, () => {
  console.log(`Basic initialation of server listing on port: ${port}.`);
});

function generateRandomString() {
   var result           = '';
   var characters       = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
   var charactersLength = characters.length;
   for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function inUsers(obj, key, value) {
  for (let entry in obj) {
    if (obj[entry][key] === value) {
      return true;
    };
  }''
  return false;
};
