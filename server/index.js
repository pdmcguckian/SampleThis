const express = require("express"); //Import the express dependency
const app = express(); //Instantiate an express app, the main work horse of this server
const port = 5000; //Save the port number where your server will be listening
var fs = require("fs");
var http = require("http");
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
const { spawn } = require("child_process");

const pathToDownloads = "../player/to-play/";
const songTitle = "audio";
const youtubeMp3Converter = require("youtube-mp3-converter");
// creates Download function
const convertLinkToMp3 = youtubeMp3Converter(pathToDownloads);
// Downloads mp3 and Returns path were it was saved.

app.use(express.urlencoded());
app.use(express.json()); // to support JSON-encoded bodies

const cors = require("cors");

app.use(cors());

var midiStatus = 0;

const { PythonShell } = require("python-shell");

var pyshell;
var pyshell2;

//Idiomatic expression in express to route and respond to a client request
app.get("/", (req, res) => {
  //get requests to the root ("/") will route here
  res.sendFile("index.html", { root: __dirname }); //server responds by sending the index.html file to the client's browser
  //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile
});

function createMidi() {
  console.log("start midi");
  midiStatus = 0;
  const midiProcess = spawn(
    "AnthemScore ../player/to-play/audio.mp3 -a -o -m ../player/to-play/audio.mid",
    [],
    {
      shell: true,
    }
  );

  midiProcess.stdout.on("message", (message) => {
    console.log("midimsg:" + message);
    return;
  });

  midiProcess.on("close", (code) => {
    console.log(`midi process exited with code ${code}`);
    midiStatus = 1;
    return;
  });
}

app.get("/api/midiStatus", (req, res) => {
  res.send(JSON.stringify({ status: midiStatus }));
});

app.get("/api/playaudio", (req, res) => {
  console.log("play audio");
  pyshell = new PythonShell("../player/play.py");
  pyshell.send("hello");
  pyshell.on("message", function (message) {
    console.log(message);
  });
  res.send();
});
app.get("/api/stopaudio", (req, res) => {
  pyshell.kill("SIGINT");
  res.send();
});

app.get("/api/sampleaudio", (req, res) => {
  console.log("audiosampler");
  pyAudioSampler();
  res.send();

  // let options = {
  //   mode: "text",
  //   pythonOptions: ["-u"], // get print results in real-time
  //   scriptPath: "../sampler/", //If you are having python_test.py script in same folder, then it's optional.
  // };

  // PythonShell.super_().run("audioSampler.py", options, function (err, result) {
  //   if (err) throw err;
  //   console.log(result);
  //   // res.send(result.toString());
  // });
});
app.get("/api/samplerstatus", (req, res) => {
  res.send(JSON.stringify({ status: audioSamplerStatus }));
});

var audioSamplerStatus = 0;
var audioSamplerProgress = 0;

function pyAudioSampler() {
  audioSamplerStatus = 0;
  pyshell2 = new PythonShell("../sampler/audioSampler.py");
  pyshell2.on('message', function (message) {
    console.log(message);
    audioSamplerProgress+=1;
    return;
  });
  pyshell2.on('stderr', function (message) {
    console.log(message);
    return;
  });
  pyshell2.on('error', function (message) {
    console.log(message);
    return;
  });
  pyshell2.on('close', function (message) {
    console.log(message);
    console.log("Audio sampler finished")
    audioSamplerStatus = 1;
    return;
  });
  // let options = {
  //   mode: "text",
  //   pythonOptions: ["-u"], // get print results in real-time
  //   scriptPath: "../sampler/", //If you are having python_test.py script in same folder, then it's optional.
  // };

  // PythonShell.run("audioSampler.py", options, function (err, result) {
  //   console.log(err);
  //   console.log(result);
  // });
}

app.post("/api/submitsong", async (req, res) => {
  //post request from the youtube form will route here
  var youtube_url = req.body.url;
  console.log(req.body);
  try {
    const pathToMp3 = await convertLinkToMp3(youtube_url, songTitle);
    createMidi();
    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(404).send();
  }
});

app.listen(port, () => {
  //server starts listening for any attempts from a client to connect at port: {port}
  console.log(`Now listening on port ${port}`);
});
