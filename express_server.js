const express = require("express");
const app = express();
const port = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//app.route() create chainable route handlers for a route path GET POST etc.
app.get("/", (req, res) => {
  res.send("Help Me");
});

app.get("/urls", (req, res) =>{
  let templateVariables = { urls: urlDatabase };
  res.render("urls_index", templateVariables);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
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