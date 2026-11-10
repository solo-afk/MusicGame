from flask import Flask, render_template, render_template, redirect, request, session, jsonify
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import random
import json
import requests
import re
from spotipy.cache_handler import MemoryCacheHandler

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)
SCOPE = "playlist-read-private user-top-read"

def create_spotify_oauth():

    return SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
        scope=SCOPE,
        show_dialog=True,
        cache_handler=MemoryCacheHandler()
    )

def deezer_search(q):
    r = requests.get("https://api.deezer.com/search", params={'q': q}, timeout=5)
    print(f"Deezer {r.status_code} for [{q}]: {r.text[:150]}")
    for match in r.json().get('data', []):
        if match.get('preview'):
            return match['preview']
    return None

def get_deezer_preview(artist_name, track_name, isrc):
    try:
        if isrc:
            r = requests.get(f"https://api.deezer.com/track/isrc:{isrc}", timeout=5)
            data = r.json()
            if r.ok and r.json().get('preview'):
                return data['preview']
        clean = re.sub(r"\s*[-(\[].*$", "", track_name)  # strip "- Remastered", "(feat. X)"
        return (deezer_search(f'artist:"{artist_name}" track:"{clean}"')
                or deezer_search(f'{artist_name} {clean}'))
    except Exception as e:
        print(f"Error fetching from Deezer: {e}")
    return None

def get_token():
    info = session.get('token_info')
    if not info:
        return None
    oauth = create_spotify_oauth()
    if oauth.is_token_expired(info):
        info = oauth.refresh_access_token(info['refresh_token'])
        session['token_info'] = info
    return info['access_token']

def album_cards(albums):
    cards = {}
    for a in albums:
        if a.get('total_tracks', 0) < 4:      # the game needs at least 4 songs
            continue
        images = a.get('images') or []
        artist = a['artists'][0]['name'] if a.get('artists') else ''
        cards[a['id']] = {                    # dict by id removes duplicates
            'type': 'album',
            'id': a['id'],
            'name': f"{a['name']} - {artist}",
            'image': images[0]['url'] if images else None,
            'release_date': a.get('release_date', '')
        }
    return sorted(cards.values(), key=lambda c: c['release_date'], reverse=True)

@app.route('/')
def index():
    print("INDEX: token in session?", 'token_info' in session)
    is_logged_in = 'token_info' in session
    pfp_url = None

    if is_logged_in:
        try:
            token = get_token()
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
    print("CALLBACK: got token?", bool(token_info))
    session["token_info"] = token_info
    return redirect('/')

@app.route('/api/get_tracks')
def get_tracks():
    if 'token_info' not in session:
        return jsonify({'error' : 'Unauthoried'}), 401
    
    source_type = request.args.get('type', 'playlist')
    source_id = request.args.get('id')
    if not source_id:
        return jsonify({'error': 'Nothing selected'}), 400


    try:
        token = get_token()
        sp = spotipy.Spotify(auth=token)
        '''
        playlist_id = request.args.get('playlist_id')
        if not playlist_id:
            return jsonify({'error': 'No playlist selected'}), 400
            '''
        if source_type == 'album':
            album = sp.album(source_id)
            images = album.get('images') or []
            cover = images[0]['url'] if images else None
            candidates = [{
                'title': t['name'],
                'artist': t['artists'][0]['name'] if t['artists'] else 'Unknown Artist',
                'isrc': None,
                'cover': cover
            } for t in album['tracks']['items']]
        else:
            playlist_info = sp.playlist(source_id, fields="items.total")
            print(playlist_info)
            total_tracks = playlist_info['items']['total']

            game_len = 20
            max_offset = max(0, total_tracks - game_len)
            random_offset = random.randint(0, max_offset) if max_offset > 0 else 0

        #gets the songs from the playlist and the relevant information that we need
            results = sp.playlist_tracks(source_id, 
                                     fields= 'items(item(name,artists(name), external_ids(isrc),album(images)))', 
                                     limit = game_len,
                                      offset=random_offset )
        
            items = results.get('items', [])

            print(f"--- DEBUG: Total items returned from Spotify API: {len(items)} ---")

            candidates = []
            for entry in results.get('items', []):
                track = entry.get('item')
                if not track:
                    continue
                images = (track.get('album') or {}).get('images') or []
                candidates.append({
                    'title': track['name'],
                    'artist': track['artists'][0]['name'] if track['artists'] else 'Unknown Artist',
                    'isrc': (track.get('external_ids') or {}).get('isrc'),
                    'cover': images[0]['url'] if images else None
                })

        random.shuffle(candidates)
        game_tracks = []
        for c in candidates:
            if len(game_tracks) >= 10:
                break
            preview = get_deezer_preview(c['artist'], c['title'], c['isrc'])
            if preview:
                game_tracks.append({
                    'title': c['title'],
                    'artist': c['artist'],
                    'preview_url': preview,
                    'cover': c['cover']
                })
        print(f"--- DEBUG: Total tracks added to game_tracks: {len(game_tracks)} ---")
            
        return jsonify(game_tracks)
        
    
    except Exception as e:
        print(f"Error getting playlist: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/get_user_playlists')
def get_user_playlists():
    token = get_token()
    if not token:
        return jsonify({'error': 'Unauthorized'}), 401
    sp = spotipy.Spotify(auth=token)
    me = sp.current_user()['id']

    playlists, offset = [], 0
    while True:
        page = sp.current_user_playlists(limit=50, offset=offset)
        for p in page['items']:
            owner_id = (p.get('owner') or {}).get('id')
            if owner_id == me or p.get('collaborative'):
                images = p.get('images') or []
                playlists.append({
                    'id': p['id'],
                    'name': p['name'],
                    'image': images[0]['url'] if images else None
                })
        if not page['next']:
            break
        offset += 50
    return jsonify(playlists)

@app.route('/api/get_new_from_artists')
def get_new_from_artists():
    token = get_token()
    if not token:
        return jsonify({'error': 'Unauthorized'}), 401
    sp = spotipy.Spotify(auth=token)
    try:
        artists = sp.current_user_top_artists(limit=5, time_range='medium_term')['items']
        albums = []
        for artist in artists:
            page = sp.artist_albums(artist['id'], include_groups='album,single', limit=5)
            albums.extend(page['items'])
        return jsonify(album_cards(albums)[:15])
    except Exception as e:
        print(f"Error getting artist albums: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/search')
def search():
    token = get_token()
    if not token:
        return jsonify({'error': 'Unauthorized'}), 401
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify([])
    sp = spotipy.Spotify(auth=token)
    results = sp.search(q=q, type='album', limit=10)
    return jsonify(album_cards(results['albums']['items']))

if __name__ == '__main__':
    #port = int(os.environ.get("PORT", 5001))
    #app.run(host="0.0.0.0", port=port)
    app.run(port=5001, debug=True)