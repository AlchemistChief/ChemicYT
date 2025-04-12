import sys
import os
import shutil
from yt_dlp import YoutubeDL

# Corrected path for cookies.txt
Cookie_File = os.path.join(os.path.dirname(__file__), "cookies.txt")

# Basic yt-dlp options shared by both file and playlist downloads
def get_basic_options(output_dir):
    return {
        'format': 'm4a/bestaudio[ext=m4a]/bestaudio',
        "cookiefile": Cookie_File,
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'postprocessors': [
            {
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'm4a',
            },
            {
                'key': 'EmbedThumbnail',
            },
            {
                'key': 'FFmpegMetadata',
            }
        ],
        'writethumbnail': True,
        'embedthumbnail': True,
        'embedmetadata': True,
        'addmetadata': True,
        'quiet': True,
    }

def download_file(url, output_dir):
    ydl_opts = {
        **get_basic_options(output_dir),
        "noplaylist": True,
    }

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        print(filename)
        return filename

def download_playlist(url, output_dir):
    ydl_opts = {
        **get_basic_options(output_dir),
        "noplaylist": False,
    }

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        playlist_title = info.get('title', 'playlist')
        playlist_dir = os.path.join(output_dir, playlist_title)
        zip_path = os.path.join(output_dir, f"{playlist_title}.zip")

        # Create a zip file of the playlist
        shutil.make_archive(playlist_dir, 'zip', playlist_dir)
        print(zip_path)
        return zip_path

def main():
    if len(sys.argv) < 3:
        print("Error: Missing arguments. Usage: download.py <url> <type>")
        sys.exit(1)

    url = sys.argv[1]
    download_type = sys.argv[2]
    output_dir = '/tmp'

    if download_type == 'file':
        try:
            downloaded_file = download_file(url, output_dir)
            print(f"File downloaded successfully: {downloaded_file}")
        except Exception as e:
            print(f"Error downloading file: {e}")
            sys.exit(1)
    elif download_type == 'playlist':
        try:
            downloaded_zip = download_playlist(url, output_dir)
            print(f"Playlist downloaded and zipped successfully: {downloaded_zip}")
        except Exception as e:
            print(f"Error downloading playlist: {e}")
            sys.exit(1)
    else:
        print("Error: Invalid type. Must be 'file' or 'playlist'.")
        sys.exit(1)

if __name__ == "__main__":
    main()