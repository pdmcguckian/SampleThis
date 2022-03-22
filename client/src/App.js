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
  Modal,
} from "react-bootstrap";
import { PlayFill, StopFill, InfoCircle } from "react-bootstrap-icons";

function App() {
  var youtubeInput = React.useRef();
  var [URLInput, setURLInput] = React.useState(1);
  var [showSpinner, setShowModalSpinner] = React.useState(0);
  var [showError, setShowModalError] = React.useState(0);
  var [midiMsg, setMidiMsg] = React.useState("");
  var [enablePlayButtons, setEnablePlayButtons] = React.useState(1);
  var [enableStopButtons, setEnableStopButtons] = React.useState(0);
  var [changeSongEnabled, setChangeSongEnabled] = React.useState(1);
  var [audioSampler, setAudioSampler] = React.useState(false);
  var [audioSamplerLoading, setAudioSamplerLoading] = React.useState(0);
  var [audioSamplerMsg, setAudioSamplerMsg] = React.useState("");
  var [showModal, setShowModal] = React.useState(true);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const SERVER_URL = "http://localhost:5000";

  const downloadMp3 = () => {
    const ytUrl = youtubeInput.current.value;

    setMidiMsg("");

    setEnablePlayButtons(0);
    setEnableStopButtons(0);
    setShowModalError(0);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: ytUrl,
      }),
    };
    setShowModalSpinner(1);
    setChangeSongEnabled(0);
    fetch(SERVER_URL + "/api/submitsong", requestOptions) //POST request
      .then((response) => {
        if (response.ok) {
          setURLInput(0);
          setShowModalSpinner(0);
          showMidiStatus();
        } else if (response.status === 404) {
          setShowModalSpinner(0);
          setShowModalError(1);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  async function showMidiStatus() {
    setMidiMsg("Creating midi file...");
    setShowModalSpinner(1);
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
            setShowModalSpinner(0);
            setEnablePlayButtons(1);
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
  function playAudio() {
    var status = 0;
    const requestOptions = {
      method: "GET",
    };
    setEnablePlayButtons(0);
    fetch(SERVER_URL + "/api/playaudio", requestOptions) //POST request
      .then((response) => {
        console.log("play audio");
        setEnableStopButtons(1);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  function stopAudio() {
    var status = 0;
    const requestOptions = {
      method: "GET",
    };
    setEnableStopButtons(0);
    fetch(SERVER_URL + "/api/stopaudio", requestOptions) //POST request
      .then((response) => {
        console.log("stop audio");
        setEnablePlayButtons(1);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function sampleNewAudio() {
    const requestOptions = {
      method: "GET",
    };
    setAudioSamplerMsg("Press and hold the SPACE key while speaking");
    setAudioSamplerLoading(1);
    fetch(SERVER_URL + "/api/sampleaudio", requestOptions)
      .then(async (response) => {
        await timeout(10000);
        console.log("audio sampler ready");
        setAudioSampler(true);
        setAudioSamplerLoading(0);
        window.addEventListener("keydown", spaceDownHandler);
        window.addEventListener("keyup", spaceUpHandler);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function timeout(delay) {
    return new Promise((res) => setTimeout(res, delay));
  }

  async function spaceDownHandler({ code }) {
    console.log(audioSampler);
    if (code === "Space") {
      await timeout(200);
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
      <h1 className="mb32">Bad Pitches <InfoCircle onClick={handleShow}/></h1>
      {showError ? (
        <div className="error mb16">Url is invalid, please try again</div>
      ) : (
        <></>
      )}
      <div className="row-cont mb32">
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
      </div>
      {!URLInput ? (
        <div className="row-cont mb32">
          <div>{midiMsg}</div>
          <Button onClick={() => setURLInput(1)} disabled={!changeSongEnabled}>
            Change Song
          </Button>
          {showSpinner ? <Spinner animation="border" /> : <></>}
        </div>
      ) : (
        <div className="row-cont mb32">
          <input
            type="text"
            ref={youtubeInput}
            placeholder="Youtube URL to Song"
          ></input>
          <Button onClick={downloadMp3} disabled={!changeSongEnabled}>
            Change Song
          </Button>
          {showSpinner ? <Spinner animation="border" /> : <></>}
        </div>
      )}
      <div className="row-cont">
        <Button onClick={playAudio} disabled={!enablePlayButtons}>
          <PlayFill />
        </Button>
        <Button onClick={stopAudio} disabled={!enableStopButtons}>
          <StopFill />
        </Button>
      </div>
      <Modal
        show={showModal}
        onHide={handleClose}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Audio Experience Design - Bad Pitches</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Welcome to the AXD Project, by Oscar Jones, Patrick D. McGuckian and
          Oliver Colebourne.
        </Modal.Body>
        <Modal.Body>
          Bad pitches takes an audio sample of your voice, then plays a tune of
          your choice (via youtube) with it. There is also an effects panel
          which adds effects to the audio output.
        </Modal.Body>
        <Modal.Body>
          To start input a youtube URL, and press "Change Sample" and follow the
          prompts to sample your voice. The play and stop buttons control the
          playback.
        </Modal.Body>
      </Modal>
    </body>
  );
}

export default App;
