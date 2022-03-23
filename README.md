# SampleThis
DE4 Audio Project

# File Structure
├───arduino-axp  
├───client  
│     ├───node_modules  
│     ├───public  
│     └───src  
├───effects-panel  
├───player  
│     └───to-play  
│          ├───notes  
│          └───notes_stretched  
├───sampler  
└───server  
    ├───download  
    ├───node_modules  
    └───public  

# System Overview
- Node.js backend coordinates running the various commands and Python scripts. Operated by a REST API.
- A React.js frontend is used to trigger functions on the Node backend, input values and instruct the user.
- Inputting a youtube URL gets sent to backend. Downloaded as an MP3 with a forked version of the “youtube-mp3-converter” npm module. Forked to add a custom naming functionality so that all songs have the same song name.
- The downloaded MP3 is then converted to a .mid midi file by AnthemScore. This is triggered by a command line interface launched through a child-process within the Node.js server.
- Pressing the ‘Change Sample’ button launches the AudioSampler file in a Python shell within the Node.js backend. Instructions on the react frontend instruct the user how to record their voice.
- The react frontend keeps polling an endpoint to update the midi and audio sampler status.
- Once both operations are complete the ‘Play’ button on the GUI becomes available.
- Pressing this sends an API request to the Node.js server which starts a different Python shell to run the midiPlayer Python script.
- A stop button sends a request to kill the python shell playing the song
The GUI also handles bad YouTube URL errors, has a popup to explain how to use the platform, and allows the user to overwrite the audio sample live, while still playing the song.
