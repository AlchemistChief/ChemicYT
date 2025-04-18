import sys
import os
import shutil
import json
import logging
from yt_dlp import YoutubeDL

Cookie_File = os.path.join(os.path.dirname(__file__), "cookies.txt")
Binary_Location = os.path.join(os.path.dirname(__file__), "bin")

logging.basicConfig(
    level=logging.DEBUG,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('download_errors.log')
    ]
)

def get_basic_options(output_dir):
    return {
        'outtmpl': {
        'default': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'pl_thumbnail': os.path.join(output_dir, '%(playlist_title)s_thumbnail.%(ext)s'),
        },
        'format': 'm4a/bestaudio[ext=m4a]/bestaudio',
        'ffmpeg_location': Binary_Location,
        'cookiefile': Cookie_File,
        'noCheckCertificate': True,
        'no_abort_on_error': True,
        'writethumbnail': True,
        #'dumpSingleJson': True,
        'extract_audio': True,
        'no_embed_subs': True,
        'ignore_errors': True,
        'force_ipv6': True,
        'no_update': True,
        'quiet': False,
        'verbose': True,
        'postprocessors': [
            {
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'm4a',
            },
            {
                'key': 'EmbedThumbnail',
                'already_have_thumbnail': False
             },
            {
                'key': 'FFmpegMetadata',
            }
        ],
        'addheaders': [
            ('referer', 'https://youtube.com'),
            ('user-agent', 'googlebot')
        ],
    }

def download_file(url, output_dir):
    ydl_opts = {
        **get_basic_options(output_dir),
        "noplaylist": True,
        "yesplaylist": False,
    }
    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            return filename
    except Exception as e:
        logging.error(f"Error downloading file: {e}")
        raise

def download_playlist(url, output_dir):
    ydl_opts = {
        **get_basic_options(output_dir),
        "noplaylist": False,
        "yesplaylist": True,
    }
    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            playlist_title = info.get('title', 'playlist')
            playlist_dir = os.path.join(output_dir, playlist_title)
            zip_path = os.path.join(output_dir, f"{playlist_title}.zip")

            # Create a zip file of the playlist
            shutil.make_archive(playlist_dir, 'zip', playlist_dir)
            return zip_path
    except Exception as e:
        logging.error(f"Error downloading playlist: {e}")
        raise

def main():
	if len(sys.argv) < 4:
		error = {"error": "Usage: download.py <url> <type> <channel_path>"}
		with open("/tmp/fallback_channel.json", "w") as f:
			json.dump(error, f)
		sys.exit(1)

	url = sys.argv[1]
	download_type = sys.argv[2]
	channel_path = sys.argv[3]
	output_dir = '/tmp'

	result = {}

	try:
		if download_type == 'file':
			result["file_path"] = download_file(url, output_dir)
		elif download_type == 'playlist':
			result["file_path"] = download_playlist(url, output_dir)
		else:
			result["error"] = "Invalid type. Must be 'file' or 'playlist'."
	except Exception as e:
		result["error"] = str(e)

	with open(channel_path, "w") as f:
		json.dump(result, f)

if __name__ == "__main__":
    main()
