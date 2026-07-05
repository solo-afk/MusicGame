from flask import Flask, render_template, render_template, redirect, request, session, jsonify
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import random
import json
import requests

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)
SCOPE = "playlist-read-private"

def create_spotify_oauth():

    return SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
        scope=SCOPE,
        show_dialog=True
    )

def get_deezer_preview(artist_name, track_name):
    query = f'artist:"{artist_name}" track:"{track_name}"'
    url = "https://api.deezer.com/search"

    try:
        response = requests.get(url, params={'q': query})
        data = response.json()

        if data.get('data'):
            first_match = data['data'][0]
            preview_url = first_match.get('preview')
            return preview_url
    except Exception as e:
        print(f"Error fetching from Deezer: {e}")
        
    return None

@app.route('/')
def index():
    is_logged_in = 'token_info' in session
    pfp_url = None

    if is_logged_in:
        try:
            token = session.get('token_info')['access_token']
            sp = spotipy.Spotify(auth=token)
            user_profile = sp.current_user()
            if user_profile.get('images'):
                pfp_url = user_profile['images'][0]['url']
        except Exception as e:
            print(f"No profile found: {e}")
            is_logged_in = False

    return render_template('index.html', is_logged_in=is_logged_in, pfp_url=pfp_url)

@app.route('/login')
def login():
    sp_oauth = create_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/callback')
def callback():
    sp_oauth = create_spotify_oauth()
    session.clear()
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session["token_info"] = token_info
    return redirect('/')

#DEBUG THIS GET_TRAKCS, ITS NOT WORKING

@app.route('/api/get_tracks')
def get_tracks():
    if 'token_info' not in session:
        return jsonify({'error' : 'Unauthoried'}), 401
    
    try:
        token = session.get('token_info')['access_token']
        sp = spotipy.Spotify(auth=token)

        playlist_id = '0uQlPlBiRrvFhuv7eEJlwJ'
        
        playlist_info = sp.playlist(playlist_id, fields="items.total")
        print(playlist_info)
        total_tracks = playlist_info['items']['total']

        game_len = 20
        max_offset = max(0, total_tracks - game_len)
        random_offset = random.randint(0, max_offset) if max_offset > 0 else 0

        #gets the songs from the playlist and the relevant information that we need
        results = sp.playlist_tracks(playlist_id, 
                                     fields= 'items(item(name,artists(name)))', 
                                     limit = game_len,
                                      offset=random_offset )
        
        items = results.get('items', [])

        print(f"--- DEBUG: Total items returned from Spotify API: {len(items)} ---")

        game_tracks = []
        print('\n', items, '\n')

        for item in items:
            track = item.get('item')
            if not item:
                continue

            track_name = track['name']
            artist = track['artists'][0]['name'] if track['artists'] else 'Unknown Artist'
            deezer_preview = get_deezer_preview(artist, track_name)

            if deezer_preview:
                game_tracks.append({
                    'title': track_name,
                    'artist': artist,
                    'preview_url': deezer_preview
                })
        print(f"--- DEBUG: Total tracks added to game_tracks: {len(game_tracks)} ---")
            
        random.shuffle(game_tracks)
        return jsonify(game_tracks[:10])
        
    
    except Exception as e:
        print(f"Error getting playlist: {e}")
        return jsonify({'error': str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True, port=5001)