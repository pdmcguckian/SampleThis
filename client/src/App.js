import logo from "./logo.svg";
import "./App.css";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  Button,
  Spinner,
  ProgressBar,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import { PlayFill, StopFill } from "react-bootstrap-icons";

function App() {
  var youtubeInput = React.useRef();
  var [URLInput, setURLInput] = React.useState(1);
  var [showSpinner, setShowSpinner] = React.useState(0);
  var [showError, setShowError] = React.useState(0);
  var [midiMsg, setMidiMsg] = React.useState("");
  var [enableMediaButtons, setEnableMediaButtons] = React.useState(0);
  var [changeSongEnabled, setChangeSongEnabled] = React.useState(1);
  var [audioSampler, setAudioSampler] = React.useState(false);
  var [audioSamplerLoading, setAudioSamplerLoading] = React.useState(0);
  var [audioSamplerMsg, setAudioSamplerMsg] = React.useState("");

  const SERVER_URL = "http://localhost:5000";

  const downloadMp3 = () => {
    const ytUrl = youtubeInput.current.value;

    setMidiMsg("");

    setEnableMediaButtons(0);
    setShowError(0);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: ytUrl,
      }),
    };
    setShowSpinner(1);
    setChangeSongEnabled(0);
    fetch(SERVER_URL + "/api/submitsong", requestOptions) //POST request
      .then((response) => {
        if (response.ok) {
          setURLInput(0);
          setShowSpinner(0);
          showMidiStatus();
        } else if (response.status === 404) {
          console.log("here");
          setShowSpinner(0);
          setShowError(1);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  async function showMidiStatus() {
    setMidiMsg("Creating midi file...");
    var status = 0;
    const requestOptions = {
      method: "GET",
    };
    while (status == 0) {
      fetch(SERVER_URL + "/api/midiStatus", requestOptions) //POST request
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          if (json.status == 1) {
            console.log("midi finished loading");
            setMidiMsg("Ready to Play");
            setChangeSongEnabled(1);
            setEnableMediaButtons(1);
            status = 1;
          }
        })
        .catch((error) => {
          console.log(error);
        });
      await timeout(2000);
    }
  }

  async function samplerStatus() {
    var status = 0;
    const requestOptions = {
      method: "GET",
    };
    while (status == 0) {
      fetch(SERVER_URL + "/api/samplerstatus", requestOptions) //POST request
        .then((response) => {
          return response.json();
        })
        .then(async (json) => {
          if (json.status == 1) {
            console.log("sampler finished");
            status = 1;
            setAudioSamplerLoading(0);
            setAudioSamplerMsg("Finished processing");
            await timeout(2000);
            setAudioSampler(0);
          }
        })
        .catch((error) => {
          console.log(error);
        });
      await timeout(2000);
    }
  }

  function sampleNewAudio() {
    const requestOptions = {
      method: "GET",
    };
    setAudioSamplerMsg("Press and hold the SPACE key while speaking");
    setAudioSamplerLoading(1);
    fetch(SERVER_URL + "/api/sampleaudio", requestOptions)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if (json.status == 1) {
          console.log("audio sampler ready");
          setAudioSampler(true);
          setAudioSamplerLoading(0);
          window.addEventListener("keydown", spaceDownHandler);
          window.addEventListener("keyup", spaceUpHandler);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function timeout(delay) {
    return new Promise((res) => setTimeout(res, delay));
  }

  function spaceDownHandler({ code }) {
    console.log(audioSampler);
    if (code === "Space") {
      setAudioSamplerMsg("Recording... Release to stop");
      window.removeEventListener("keydown", spaceDownHandler);
    }
  }

  function spaceUpHandler({ code }) {
    if (code === "Space") {
      setAudioSamplerLoading(1);
      setAudioSamplerMsg("Finished recording. Processing...");
      window.removeEventListener("keyup", spaceUpHandler);
      samplerStatus();
    }
  }

  return (
    <body className="App-cont">
      <h1 className="mb32">Pitches be drippin</h1>
      {showError ? (
        <div className="error mb16">Url is invalid, please try again</div>
      ) : (
        <></>
      )}
      {/* <div className="row-cont mb32">
        {!audioSampler ? (
          <>
            <Button
              onClick={() => sampleNewAudio()}
              disabled={audioSamplerLoading}
            >
              Change Sample
            </Button>
            {audioSamplerLoading ? <Spinner animation="border" /> : <></>}
          </>
        ) : (
          <>
            <div>{audioSamplerMsg}</div>
            {audioSamplerLoading ? <Spinner animation="border" /> : <></>}
          </>
        )}
      </div> */}
      {!URLInput ? (
        <div className="row-cont mb32">
          <div>{midiMsg}</div>
          <Button onClick={() => setURLInput(1)} disabled={!changeSongEnabled}>
            Change Song
          </Button>
        </div>
      ) : (
        <div className="row-cont mb32">
          <input type="text" ref={youtubeInput}></input>
          <Button onClick={downloadMp3} disabled={!changeSongEnabled}>
            Change Song
          </Button>
          {showSpinner ? <Spinner animation="border" /> : <></>}
        </div>
      )}
      <div className="row-cont">
        <Button disabled={!enableMediaButtons}>
          <PlayFill />
        </Button>
        <Button disabled={!enableMediaButtons}>
          <StopFill />
        </Button>
      </div>
    </body>
  );
}

export default App;
