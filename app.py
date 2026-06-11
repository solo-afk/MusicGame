from flask import Flask, render_template, jsonify

app = Flask(__name__)

testPlaylist = [
    {
        "title": "Mona Lisa",
        "artist": "Dominic Fike",
        "preview_url": "https://www.w3schools.com/html/horse.mp3", 
        "choices": ["Mona Lisa", "3 Nights", "Babydoll", "Phone Numbers"]
    },
    {
        "title": "Let You Break My Heart Again",
        "artist": "Laufey",
        "preview_url": "https://www.w3schools.com/html/horse.mp3",
        "choices": ["From The Start", "Let You Break My Heart Again", "Valentine", "Fragile"]
    },
    {
        "title": "Blinding Lights",
        "artist": "The Weeknd",
        "preview_url": "https://www.w3schools.com/html/horse.mp3",
        "choices": ["Starboy", "Circles", "Blinding Lights", "Save Your Tears"]
    }
]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/playlist')
def get_playlist():
    return jsonify(testPlaylist)

if __name__ == '__main__':
    app.run(debug=True, port=5001)