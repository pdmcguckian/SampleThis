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
                    y_shifted = librosa.effects.pitch_shift(y, sr, n_steps=i+1, bins_per_octave=12) # shifted by 4 half steps
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
        pitch_shift = (pitch-440)/440 

        y_A = librosa.effects.pitch_shift(y, sr, n_steps=-pitch_shift, bins_per_octave=1)
        sf.write(file_path+file_names[0], y_A, 44100, 'PCM_24')



file_path = "/Users/pdmcguckian/Documents/Projects 4/Audio Experience/"
file_names = ["c4.wav", "c#4.wav", "d4.wav", "d#4.wav", "e4.wav", "f4.wav", "f#4.wav", "g4.wav", "g#4.wav", "a4.wav", "a#4.wav", "b4.wav"]


vals = RecordNotes(file_path, file_names)