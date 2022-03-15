import pyaudio
import wave
from time import sleep
import numpy as np
import librosa
import soundfile as sf
import aubio
import keyboard
from scipy.io.wavfile import read
import matplotlib.pyplot as plt
import sys
import statistics

class RecordNotes():

    def __init__(self, file_path, file_names):
        
        #Key Recording Variiables        
        self.file_path = file_path
        self.file_names = file_names
        self.chunk = 1024  # Record in chunks of 1024 samples
        self.sample_format = pyaudio.paInt16  # 16 bits per sample
        self.channels = 1 #Audio Channel one (MBP Micropgone)
        self.fs = 44100  #44100hz
        self.seconds = 1.5 #Length of Recording

        print("q to record.")
        while True:
            if keyboard.is_pressed('q'):
                self.recordSound()

                self.NormailseFrequency()

                for i in range(len(file_names)):
                    y, sr = librosa.load(file_path+file_names[0], sr=self.fs) # y is a numpy array of the wav file, sr = sample rate
                    y_shifted = librosa.effects.pitch_shift(y, sr, n_steps=i+1, bins_per_octave=24) # shifted by 4 half steps
                    sf.write(file_path+file_names[i], y_shifted, 44100, 'PCM_24')

    def recordSound(self):
        self.p = pyaudio.PyAudio()  # Create an interface to PortAudio
        #Count in recording
        print("recording...")

        #Record audio stream
        self.stream = self.p.open(format=self.sample_format,
                        channels=self.channels,
                        rate=self.fs,
                        frames_per_buffer=self.chunk,
                        input=True)

        self.frames = []  # Initialize array to store frames

        
        while keyboard.is_pressed('q'):
            self.data = self.stream.read(self.chunk)
            self.frames.append(self.data)

        # Stop and close the stream 
        self.stream.stop_stream()
        self.stream.close()
        self.p.terminate()

        print('Finished recording')

        # Save the recorded data as a WAV file
        wf = wave.open(self.file_path+self.file_names[0], 'wb')
        wf.setnchannels(self.channels)
        wf.setsampwidth(self.p.get_sample_size(self.sample_format))
        wf.setframerate(self.fs)
        wf.writeframes(b''.join(self.frames))
        wf.close()


    def spectral_centroid(self, x, samplerate=44100):
        magnitudes = np.abs(np.fft.rfft(x)) # magnitudes of positive frequencies
        length = len(x)
        freqs = np.abs(np.fft.fftfreq(length, 1.0/samplerate)[:length//2+1]) # positive frequencies
        return np.sum(magnitudes*freqs) / np.sum(magnitudes) # return weighted mean

    def NormailseFrequency(self):
        y, sr = librosa.load(file_path+file_names[0], sr=self.fs)
        print(y)

        tolerance = 0.8
        win_s = 1024 # fft size
        hop_s = 1024 # hop size
        pitch_o = aubio.pitch("default", win_s, hop_s, self.fs)
        pitch_o.set_tolerance(tolerance)

        count = 0
        for i in y:
            count += 1
            if i >= 0.05:
                break

        y = y[count:]

        pitches = []
        for i in range(1, round(len(y)/hop_s)):
            pitch = pitch_o(y[hop_s*(i-1):i*hop_s])[0]
            pitches.append(pitch)

        print(pitches)
        pitch = statistics.median(pitches)
        print(pitch)
        pitch_shift = (pitch-123.47)/123.47 

        y_A = librosa.effects.pitch_shift(y, sr, n_steps=-pitch_shift, bins_per_octave=1)
        sf.write(file_path+file_names[0], y_A, 44100, 'PCM_24')



file_path = "/Users/pdmcguckian/Documents/Projects 4/Audio Experience/"
file_names = ["C2.wav", "C#2.wav", "D2.wav", "D#2.wav", "E2.wav", "F2.wav", "F#2.wav", "G2.wav", "G#2.wav", "A2.wav", "A#2.wav", "B2.wav","C3.wav", "C#3.wav", "D3.wav", "D#3.wav", "E3.wav", "F3.wav", "F#3.wav", "G3.wav", "G#3.wav", "A3.wav", "A#3.wav", "B3.wav", "C4.wav", "C#4.wav", "D4.wav", "D#4.wav", "E4.wav", "F4.wav", "F#4.wav", "G4.wav", "G#4.wav", "A4.wav", "A#4.wav", "B4.wav", "C5.wav", "C#5.wav", "D5.wav", "D#5.wav", "E5.wav", "F5.wav", "F#5.wav", "G5.wav", "G#5.wav", "A5.wav", "A#5.wav", "B5.wav", "C6.wav", "C#6.wav", "D6.wav", "D#6.wav", "E6.wav", "F6.wav", "F#6.wav", "G6.wav", "G#6.wav", "A6.wav", "A#6.wav", "B6.wav", "C7.wav", "C#7.wav", "D7.wav", "D#7.wav", "E7.wav", "F7.wav", "F#7.wav", "G7.wav", "G#7.wav", "A7.wav", "A#7.wav", "B7.wav"]


vals = RecordNotes(file_path, file_names)