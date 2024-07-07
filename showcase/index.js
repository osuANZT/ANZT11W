const showcaseTitleEl = document.getElementById("showcaseTitle")
let allBeatmaps
async function getMappool() {
    const response = await fetch("http://127.0.0.1:24050/ANZT11W/_data/beatmaps.json")
    const mappool = await response.json()
    allBeatmaps = mappool.beatmaps
    showcaseTitleEl.innerText = `[showcase of ${mappool.roundName.toUpperCase()}]`
}

getMappool()

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Map Information
const mapArtistEl = document.getElementById("mapArtist")
const mapSongAndDifficultyEl = document.getElementById("mapSongAndDifficulty")
const mapInfoModsTextEl = document.getElementById("mapInfoModsText")
const mapInfoMapIdEl = document.getElementById("mapInfoMapId")
// Map Statistics
const mapStatsCSEl = document.getElementById("mapStatsCS")
const mapStatsAREl = document.getElementById("mapStatsAR")
const mapStatsODEl = document.getElementById("mapStatsOD")
const mapStatsSREl = document.getElementById("mapStatsSR")

socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)
}