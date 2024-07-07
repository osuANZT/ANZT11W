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

// Player details
const playerNameEl = document.getElementById("playerName")
const playerScoreEl = document.getElementById("playerScore")
const playerAccuracyEl = document.getElementById("playerAccuracy")
const playerDetailsComboEl = document.getElementById("playerDetailsCombo")
const playerDetailsCurrentComboEl = document.getElementById("playerDetailsCurrentCombo")
const playerDetailsMaxComboEl = document.getElementById("playerDetailsMaxCombo")

// IPC State
let currentState

socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

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

    
    // Check state
    if (currentState !== data.menu.state) currentState = data.menu.state

    // Conditionals for stat
    // This is specifically for the middle section
    if (currentState === 2) {
        // Gameplay
        const gameplayScreenInfo = data.gameplay
        playerNameEl.innerText = gameplayScreenInfo.name
        playerScoreEl.innerText = gameplayScreenInfo.score
        playerAccuracyEl.innerText = `${Math.round(gameplayScreenInfo.accuracy * 100) / 100}%`
        playerDetailsCurrentComboEl.innerText = gameplayScreenInfo.combo.current
        playerDetailsMaxComboEl.innerText = data.menu.bm.stats.maxCombo
        playerDetailsComboEl.style.display = "block"
    } else if (currentState === 7) {
        // Results screen
        const resultsScreenInfo = data.resultsScreen

        let totalAccuracy = resultsScreenInfo[300] * 100 +resultsScreenInfo[100] * 100 / 3 + resultsScreenInfo[50] * 100 / 6
        let totalSum = Math.round(totalAccuracy / (resultsScreenInfo[300] + resultsScreenInfo[100] + resultsScreenInfo[50] + resultsScreenInfo[0]) * 100) / 100
        
        playerNameEl.innerText = resultsScreenInfo.name
        playerScoreEl.innerText = resultsScreenInfo.score
        playerAccuracyEl.innerText = `${totalSum}%`
        playerDetailsCurrentComboEl.innerText = resultsScreenInfo.maxCombo
        playerDetailsMaxComboEl.innerText = data.menu.bm.stats.maxCombo
        playerDetailsComboEl.style.display = "block"
    } else {
        // Everything else
        playerNameEl.innerText = ""
        playerScoreEl.innerText = ""
        playerAccuracyEl.innerText = ""
        playerDetailsCurrentComboEl.innerText = ""
        playerDetailsMaxComboEl.innerText = ""
        playerDetailsComboEl.style.display = "none"
    }
}