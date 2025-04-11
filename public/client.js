document.addEventListener("DOMContentLoaded", () => {

    const closeLogButton = document.querySelector(".close-log");
    const logContent = document.querySelector(".log-content");
    const logContainer = document.querySelector(".log-container");

    closeLogButton.addEventListener("click", () => {
        if (logContent.style.display === "none") {
            // Show the log content
            logContent.style.display = "block";
            logContainer.style.maxHeight = "300px"; // Restore original size
        } else {
            // Hide the log content
            logContent.style.display = "none";
            logContainer.style.maxHeight = "50px"; // Resize to header size
        }
    });

    function logMessage(message, type = "DEBUG") {
        const logContent = document.querySelector(".log-content");
        const logEntry = document.createElement("p");

        // Create a span for the colored keyword
        const keywordSpan = document.createElement("span");
        keywordSpan.style.fontWeight = "600";
        switch (type.toUpperCase()) {
            case "ERROR":
                keywordSpan.style.color = "#FF0000";
                break;
            case "SUCCESS":
                keywordSpan.style.color = "#00FF00";
                break;
            case "DEBUG":
            default:
                keywordSpan.style.color = "#FFD700";
                break;
        }
        keywordSpan.textContent = `[${type.toUpperCase()}] `;

        // Append the keyword and the message
        logEntry.appendChild(keywordSpan);
        logEntry.appendChild(document.createTextNode(message));
        logContent.appendChild(logEntry);

        // Ensure the log container scrolls to the latest message
        logContent.scrollTop = logContent.scrollHeight;

        // Plain log in the console
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    async function fetchYTApiKey() {
        const response = await fetch('./data.json');
        const data = await response.json();
        return data["YT-APIKey"];
    }

    async function fetchServerApiUrl() {
        const response = await fetch('./data.json');
        const data = await response.json();
        return data["Server-APIURL"];
    }

    function normalizeYoutubeLink(link) {
        try {
            const url = new URL(link);
            const validDomains = ["m.youtube.com", "music.youtube.com", "youtu.be", "youtube.com"];
            if (!validDomains.some(domain => url.hostname.includes(domain))) {
                throw new Error("Invalid YouTube domain.");
            }

            let normalizedUrl, type, id;
            if (url.pathname.startsWith("/playlist")) {
                id = url.searchParams.get("list");
                normalizedUrl = `https://youtube.com/playlist?list=${id}`;
                type = "playlist";
            } else if (url.pathname.startsWith("/watch")) {
                id = url.searchParams.get("v") || url.pathname.slice(1);
                normalizedUrl = `https://youtube.com/watch?v=${id}`;
                type = "file";
            } else {
                throw new Error("Invalid YouTube URL format.");
            }

            return { normalizedUrl, type, id };
        } catch (error) {
            logMessage(error.message, "ERROR");
            return null;
        }
    }
    async function requestDownloadApi(type, normalizedUrl) {
        try {
            const serverApiUrl = await fetchServerApiUrl();
            const response = await fetch(`${serverApiUrl}/server/download`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: normalizedUrl, type })
            });

            if (response.ok) {
                logMessage(`Download request successful for type: ${type}`, "SUCCESS");
            } else {
                logMessage(`Download request failed for type: ${type}`, "ERROR");
            }
        } catch (error) {
            logMessage(`Error during download request: ${error.message}`, "ERROR");
        }
    }

    async function showDownloadRow(title, type, normalizedUrl) {
        const downloadContainer = document.querySelector('.download-container');
        downloadContainer.style.display = "block";

        const tableBody = downloadContainer.querySelector('tbody');

        const row = document.createElement('tr');
        row.classList.add('download-row');

        // Title column
        const titleColumn = document.createElement('td');
        titleColumn.classList.add('download-title');
        titleColumn.textContent = title;

        // Button column
        const buttonColumn = document.createElement('td');
        buttonColumn.classList.add('download-button');
        const button = document.createElement('button');
        button.textContent = type === "file" ? "Download MP3/M4A" : "Download Playlist";
        button.addEventListener('click', () => requestDownloadApi(type, normalizedUrl));
        buttonColumn.appendChild(button);

        row.appendChild(titleColumn);
        row.appendChild(buttonColumn);
        tableBody.appendChild(row);
    }

    document.querySelector('.fetch-button').addEventListener('click', async () => {
        const linkInputElement = document.querySelector('.link-input');
        const linkInput = linkInputElement.value;

        logMessage(`Input URL: ${linkInput}`, "DEBUG");

        const videoEmbed = document.querySelector('.video-embed');
        videoEmbed.style.display = "none";

        if (linkInput) {
            const result = normalizeYoutubeLink(linkInput);
            if (result) {
                const { normalizedUrl, type, id } = result;
                linkInputElement.value = normalizedUrl;
                logMessage(`Normalized URL: ${normalizedUrl}`, "SUCCESS");

                const apiKey = await fetchYTApiKey();
                if (type === "file") {
                    logMessage(`Fetching video details for ID: ${id}`, "DEBUG");

                    const apiResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${apiKey}&part=snippet`);
                    const apiData = await apiResponse.json();

                    if (apiData.items && apiData.items.length > 0) {
                        const videoTitle = apiData.items[0].snippet.title;
                        showDownloadRow(videoTitle, type, normalizedUrl);

                        // Embed the video
                        const videoEmbed = document.querySelector('.video-embed');
                        videoEmbed.style.display = "block";
                        videoEmbed.src = `https://www.youtube.com/embed/${id}`;
                    } else {
                        logMessage("Failed to fetch video details.", "ERROR");
                    }
                } else if (type === "playlist") {
                    logMessage(`Fetching playlist details for ID: ${id}`, "DEBUG");

                    const apiResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlists?id=${id}&key=${apiKey}&part=snippet`);
                    const apiData = await apiResponse.json();

                    if (apiData.items && apiData.items.length > 0) {
                        const playlistTitle = apiData.items[0].snippet.title;
                        showDownloadRow(playlistTitle, type, normalizedUrl);
                    } else {
                        logMessage("Failed to fetch playlist details.", "ERROR");
                    }
                }
            }
        } else {
            logMessage('Please enter a YouTube link.', "ERROR");
        }
    });
});