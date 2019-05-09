const express = require("express");
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


const bcrypt = require('bcrypt');
function hashedPassword(password) {
  return bcrypt.hashSync(password, 10)
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "None" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "None" }
};

const users = {};


//app.route() create chainable route handlers for a route path GET POST etc.
app.get("/", (req, res) => {
  res.send("Help Me");
});

app.get("/register", (req, res) => {
  let templateVariables = { userlist: users, user_Id: req.cookies["user_id"] };
  res.render("registration", templateVariables);
});

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
    res.cookie("user_id", newId);
    console.log(users);
    res.redirect("/urls");
  }});

app.get("/login", (req, res) => {
  let templateVariables = { urls: urlDatabase, userlist: users, user_Id: req.cookies["user_id"] };
  res.render("login", templateVariables);
});

app.post("/login", (req,res) => {
  let tempID = emailToId(req.body.email);
  if (tempID === false) {
    res.send(`User not found </br><a href="/login">Go Back</a>`)
  } else if (bcrypt.compareSync(req.body.pass, users[tempID].password)) {
      res.cookie("user_id", tempID);
  } else {
    res.send(`Password incorrect.</br><a href="/login">Go Back</a>`)
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVariables = { urls: urlDatabase, userlist: users, user_Id: req.cookies["user_id"] };
  res.render("urls_index", templateVariables);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/urls");
  }
  console.log(req.cookies["user_id"]);
  let templateVariables = { userlist: users, user_Id: req.cookies["user_id"]};
  res.render("urls_new", templateVariables);
});

app.post("/urls", (req, res) => {
  let shortenedURL = generateRandomString()
  urlDatabase[shortenedURL] = {
    longURL: "http://" + req.body.longURL,
    userID: req.cookies["user_id"]};
  let templateVars = { shortURL: shortenedURL, longURL: req.body.longURL, userlist: users, user_Id: req.cookies["user_id"] };
  // res.render("urls_show", templateVars);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, fullURL: urlDatabase[req.params.shortURL].longURL, userlist: users, user_Id: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  if (shortURLExists(req.params.shortURL)) {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  };
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  if (shortURLExists(req.params.shortURL)) {
    let outboundURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(outboundURL);
  };
  res.status(400).send('Shorted URL does not exist.</br><a href="/urls">Go Back</a>');
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
  };
  return false;
};

function idToEmail(user_id) {
  if (users[user_id].email !== undefined) {
    return users[user_id].email;
  } else return "None";
};

function emailToId(input) {
  for (let id in users) {
    if (users[id].email === input) {
      return id;
    };
  };
  return false;
};

function shortURLExists(shorturl) {
  if (urlDatabase[shorturl]) return true;
  else return false;
}

