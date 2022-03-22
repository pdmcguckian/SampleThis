from MIDI import MIDIFile
from sys import argv
import time
import pygame # version 1.2.2
from mutagen.mp3 import MP3
import os

myself = os.path.dirname(__file__)

pygame.init()
pygame.mixer.init()

def find_end(raw_midi, note_name, start_pos):
    start_msg = str(raw_midi[1][start_pos]).split("@")[1].split(" ")[0]
    for idx in range(start_pos+1, len(raw_midi[1])):
        line = raw_midi[1][idx]
        if "NOTE_OFF" in str(line) and note_name in str(line):
            end_msg = str(raw_midi[1][idx]).split("@")[1].split(" ")[0]
            length = int(end_msg) - int(start_msg)
            break
        else:
            pass
    return length

def parse(file):
    c=MIDIFile(f"{file}.mid")
    c.parse()
    for idx, track in enumerate(c):
        track.parse()
    note_dict = {}
    final = track[-1]
    last_num = int(str(final).split("@")[1].split(" ")[0])
    for i in range(len(c[1])):
        line = c[1][i]
        if "NOTE_ON" in str(line):
            num = str(line).split("@")[1].split(" ")[0]
            vel = str(line).split("@")[1].split(" ")[-1]
            note_name = str(line).split(" ")[2]
            len_note = find_end(c, note_name, i)
            packet = (note_name, float(vel)/100, len_note)
            if num in note_dict:
                note_dict[num].append(packet)
            else:
                note_dict[num] = [packet]
    return track, note_dict, last_num

def make_midi(dict, last_number):
    midi_track = {}
    for i in range(last_number):
        i_str = str(i)
        if i_str in dict:
            midi_track[i_str] = dict[i_str]
        else:
            midi_track[i_str] = None
    return midi_track

def get_speed(in_midi, last_stamp, name):
    for line in in_midi:
        if "PROGRAM_CHANGE" in str(line):
            start_stamp = int(str(line).split("@")[1].split(" ")[0])
            break
        else:
            pass
    num_stamps = last_stamp - start_stamp
    track = MP3(f"{name}.mp3")
    time_length = track.info.length
    time_step = time_length / num_stamps
    return time_step, time_length

def trim_start_end(in_midi):
    track_start = False
    x = 0
    while not track_start:
        x += 1
        if in_midi[str(x)] != None:
            track_start=True
    track_end = False
    y = len(in_midi)-1
    while not track_end:
        y -= 1
        if in_midi[str(y)] != None:
            track_end=True
    for k in range(y+1, len(in_midi)+1):
        in_midi.pop(str(k), None)
    for k in range(x):
        in_midi.pop(str(k), None)
    return in_midi, x, y

def get_note_length(time):
    time = time*4
    if time > 1.2:
        return 1.2
    elif time < 0.2:
        return 0.2
    else:
        return str(time)[:3]

track_name = os.path.join(myself, "to-play/audio")
note_set = os.path.join(myself, "to-play/notes_stretched")

print("\n")
raw, dick, nob = parse(track_name)

print(f"Getting track speed...")
time_step, duration = get_speed(raw, nob, track_name)
print(f"Duration: {duration}")
print(f"Time step: {time_step}")

print(f"Creating time series...")
track = make_midi(dick, nob)

print(f"Trimming...")
track, m_start, m_stop = trim_start_end(track)
print(f"Start stamp: {m_start}, Stop stamp: {m_stop}")
print(f"Real duration: {(m_stop-m_start)*time_step}")

for i in range(m_start,m_stop+1):
    if track[str(i)] != None:
        notes = track[str(i)]
        for note in notes:
            new_note = note[0][:-1] + str(int(note[0][-1])-0)
            note_duration = note[2] * time_step
            note_time = get_note_length(note_duration)
            if note_time == "0.0":
                note_time = "0.1"
            sound = pygame.mixer.Sound(f"{note_set}/{new_note}_{note_time}.wav")
            sound.set_volume(float(note[1]))
            sound.play()   
            #print(f"{new_note} | {note[1]} | {note_time}")
    else:
        pass
    time.sleep(time_step)