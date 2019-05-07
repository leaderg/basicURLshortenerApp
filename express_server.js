const express = require("express");
const app = express();
const port = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Help Me");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(port, () => {
  console.log(`Basic initialation of server listing on port: ${port}.`);
});