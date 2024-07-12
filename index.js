const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const fs = require("fs");
const path = require("path");

const pathTofile = path.resolve("./data.json");

app.use(express.json());

const getResources = () => {
  const stringifiedData = fs.readFileSync(pathTofile);
  return JSON.parse(stringifiedData);
};

//General
app.get("/", (req, res) => {
  res.send(`Server is running on port ${port}`);
});

//By ID
app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const resource = resources.find((resource) => resource.id === id);
  res.send(resource);
});

//Patch
app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const index = resources.findIndex((resource) => resource.id === id);

  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );

  if (resources[index].status === "complete") {
    return res.status(422).send("This resource has been completed");
  }
  resources[index] = req.body;

  //activate related function
  if (req.body.status === "active") {
    if (activeResource) {
      return res.status(422).send("There is already an active resource");
    }

    resources[index].status = "active";
    resources[index].activationTime = new Date();
  }
  //activate related function

  fs.writeFile(pathTofile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannont store data in the file");
    }

    return res.send("Data Has Been Updated");
  });
});

//All
app.get("/api/resources", (req, res) => {
  const resources = getResources();
  res.send(resources);
});

app.get("/api/activeresource", (req, res) => {
  const resources = getResources();
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );

  res.send(activeResource);
});

//Create
app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const resource = req.body;

  resource.createdAt = new Date();
  resource.status = "inactive";
  resource.id = Date.now().toLocaleString();
  resources.unshift(resource);

  fs.writeFileSync(pathTofile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannont store data in the file");
    }
    return res.send("Data Has Been Saved");
  });
  res.send("Data Has been Received");
});

app.listen(port, () => console.log(`Listening on port ${port}`));
