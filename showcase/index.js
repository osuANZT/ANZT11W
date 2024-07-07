const showcaseTitleEl = document.getElementById("showcaseTitle")
let allBeatmaps
async function getMappool() {
    const response = await fetch("http://127.0.0.1:24050/ANZT11W/_data/showcaseBeatmaps.json")
    const mappool = await response.json()
    allBeatmaps = mappool.beatmaps
    showcaseTitleEl.innerText = `[showcase of ${mappool.roundName.toUpperCase()}]`
}

getMappool()

const findMapInMappool = beatmapId => allBeatmaps.find(beatmap => beatmap.beatmapID === beatmapId)

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Map Information
const mapBannerEl = document.getElementById("mapBanner")
const mapArtistEl = document.getElementById("mapArtist")
const mapSongAndDifficultyEl = document.getElementById("mapSongAndDifficulty")
const mapInfoModsTextEl = document.getElementById("mapInfoModsText")
const mapInfoMapIdEl = document.getElementById("mapInfoMapId")
let currentMapId, currentMd5, foundMapInMappool, currentMod
// Map Statistics
const mapStatsCSEl = document.getElementById("mapStatsCS")
const mapStatsAREl = document.getElementById("mapStatsAR")
const mapStatsODEl = document.getElementById("mapStatsOD")
const mapStatsSREl = document.getElementById("mapStatsSR")

// IPC State
let currentState

socket.onmessage = event => {
    const data = JSON.parse(event.data)
    // console.log(data)

    if (currentMapId !== data.menu.bm.id || currentMd5 !== data.menu.bm.md5) {
        currentMapId = data.menu.bm.id
        currentMd5 = data.menu.bm.md5
        foundMapInMappool = false

        // Set map information
        mapBannerEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${data.menu.bm.set}/covers/cover.jpg")`
        mapArtistEl.innerText = data.menu.bm.metadata.artist
        mapSongAndDifficultyEl.innerText = `${data.menu.bm.metadata.title} [${data.menu.bm.metadata.difficulty}]`
        if (data.menu.mods.str !== "") {
            mapInfoModsTextEl.innerText = `+${data.menu.mods.str}`
        }
        else if (data.resultsScreen.mods.str !== "") mapInfoModsTextEl.innerText = `+${data.resultsScreen.mods.str}`
        else mapInfoModsTextEl.innerText = `+NM`
        mapInfoMapIdEl.innerText = currentMapId

        // Set mappool map stats
        const currentMap = findMapInMappool(currentMapId)
        if (currentMap) {
            foundMapInMappool = true
            mapStatsCSEl.innerText = Math.round(parseFloat(currentMap.cs) * 10) / 10
            mapStatsAREl.innerText = Math.round(parseFloat(currentMap.ar) * 10) / 10
            mapStatsODEl.innerText = Math.round(parseFloat(currentMap.od) * 10) / 10
            mapStatsSREl.innerText = Math.round(parseFloat(currentMap.difficultyrating) * 100) / 100
        }
    }

    // If map not found in mappool
    if (!foundMapInMappool) {
        mapStatsCSEl.innerText = data.menu.bm.stats.CS
        mapStatsAREl.innerText = data.menu.bm.stats.AR
        mapStatsODEl.innerText = data.menu.bm.stats.OD
        mapStatsSREl.innerText = data.menu.bm.stats.fullSR
    }
}