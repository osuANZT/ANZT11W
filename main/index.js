// Round name
const roundNameEl = document.getElementById("roundName")

// Get mappool
let allBeatmaps
async function getMappool() {
    const response = await fetch("../_data/beatmaps.json")
    const responseJson = await response.json()
    allBeatmaps = responseJson

    roundNameEl.innerText = responseJson.roundName
}
getMappool()

// Find maps in mappool
const findMapInMapool = beatmapID => allBeatmaps.find(beatmap => beatmap.beatmapID === beatmapID)

// Get players
let allPlayers
async function getPlayers() {
    const response = await fetch("../_data/players.json")
    const responseJson = await response.json()
    allPlayers = responseJson
}
getPlayers()

// Get players from player name
const getPlayersFromName = playerName => allPlayers.find(player => player.playerName === playerName)

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Seeds
const redPlayerSeedEl = document.getElementById("redPlayerSeed")
const bluePlayerSeedEl = document.getElementById("bluePlayerSeed")
// Profile Pictures
const redProfilePictureEl = document.getElementById("redProfilePicture")
const blueProfilePictureEl = document.getElementById("blueProfilePicture")
// Player Names
const redPlayerNameEl = document.getElementById("redPlayerName")
const bluePlayerNameEl = document.getElementById("bluePlayerName")
let currentRedPlayerName, currentBluePlayerName
let currentRedPlayerId, currentBluePlayerId

// Star logic
const redStarsContainerEl = document.getElementById("redStarsContainer")
const blueStarsContainerEl = document.getElementById("blueStarsContainer")
let currentBestOf = 0, currentFirstTo = 0, currentRedStarsCount = 0, currentBlueStarsCount = 0

// IPC State
let currentIPCState

// Gameplay related stuff
// Non 300 Counts
const redNon300CountsEl = document.getElementById("redNon300Counts")
const red100CountEl = document.getElementById("red100Count")
const red50CountEl = document.getElementById("red50Count")
const redMissCountEl = document.getElementById("redMissCount")
const blueNon300CountsEl = document.getElementById("blueNon300Counts")
const blue100CountEl = document.getElementById("blue100Count")
const blue50CountEl = document.getElementById("blue50Count")
const blueMissCountEl = document.getElementById("blueMissCount")

socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Set player names and profile pictures
    if (currentRedPlayerName !== data.tourney.manager.teamName.left && allPlayers) {
        currentRedPlayerName = data.tourney.manager.teamName.left
        redPlayerNameEl.innerText = currentRedPlayerName

        let playerDetails = getPlayersFromName(currentRedPlayerName)
        if (playerDetails) {
            currentRedPlayerId = playerDetails.playerId
            redPlayerSeedEl.innerText = playerDetails.playerSeed
            redProfilePictureEl.style.backgroundImage = `url("https://a.ppy.sh/${currentRedPlayerId}")`
        }
    }
    if (currentBluePlayerName !== data.tourney.manager.teamName.right && allPlayers) {
        currentBluePlayerName = data.tourney.manager.teamName.right
        bluePlayerNameEl.innerText = currentBluePlayerName

        let playerDetails = getPlayersFromName(currentBluePlayerName)
        if (playerDetails) {
            currentBluePlayerId = playerDetails.playerId
            bluePlayerSeedEl.innerText = playerDetails.playerSeed
            blueProfilePictureEl.style.backgroundImage = `url("https://a.ppy.sh/${currentBluePlayerId}")`
        }
    }

    // Star container
    if (currentBestOf !== data.tourney.manager.bestOF ||
        currentRedStarsCount !== data.tourney.manager.stars.left ||
        currentBlueStarsCount !== data.tourney.manager.stars.right
    ) {
        currentBestOf = data.tourney.manager.bestOF
        currentFirstTo = Math.ceil(currentBestOf / 2)
        currentRedStarsCount = data.tourney.manager.stars.left
        currentBlueStarsCount = data.tourney.manager.stars.right

        // Reset stars
        redStarsContainerEl.innerHTML = ""
        blueStarsContainerEl.innerHTML = ""

        // Create star
        function createStar(image) {
            let newStar = document.createElement("img")
            newStar.setAttribute("src", `../_shared/stars/${image}.png`)
            return newStar
        }

        // Red stars
        let i = 0
        for (i; i < currentRedStarsCount; i++) redStarsContainerEl.append(createStar("scorePoint"))
        for (i; i < currentFirstTo; i++) redStarsContainerEl.append(createStar("scoreBlank"))
        // Blue stars
        i = 0
        for (i; i < currentBlueStarsCount; i++) blueStarsContainerEl.append(createStar("scorePoint"))
        for (i; i < currentFirstTo; i++) blueStarsContainerEl.append(createStar("scoreBlank"))
    }

    // Current IPC State
    if (currentIPCState !== data.tourney.manager.ipcState) {
        currentIPCState = data.tourney.manager.ipcState

        // Gameplay only stuff
        if (currentIPCState === 2 || currentIPCState === 3) {
            redNon300CountsEl.style.opacity = 1
            blueNon300CountsEl.style.opacity = 1
        } else {
            redNon300CountsEl.style.opacity = 0
            blueNon300CountsEl.style.opacity = 0
        }
    }

    // Non 100 counts
    if (currentIPCState === 2 || currentIPCState === 3) {
        if (red100CountEl.innerText !== data.tourney.ipcClients[0].gameplay.hits[100]) {
            red100CountEl.innerText = data.tourney.ipcClients[0].gameplay.hits[100]
        }
        if (red50CountEl.innerText !== data.tourney.ipcClients[0].gameplay.hits[50]) {
            red50CountEl.innerText = data.tourney.ipcClients[0].gameplay.hits[50]
        }
        if (redMissCountEl.innerText !== data.tourney.ipcClients[0].gameplay.hits[0]) {
            redMissCountEl.innerText = data.tourney.ipcClients[0].gameplay.hits[0]
        }
        if (blue100CountEl.innerText !== data.tourney.ipcClients[1].gameplay.hits[100]) {
            blue100CountEl.innerText = data.tourney.ipcClients[1].gameplay.hits[100]
        }
        if (blue50CountEl.innerText !== data.tourney.ipcClients[1].gameplay.hits[50]) {
            blue50CountEl.innerText = data.tourney.ipcClients[1].gameplay.hits[50]
        }
        if (blueMissCountEl.innerText !== data.tourney.ipcClients[1].gameplay.hits[0]) {
            blueMissCountEl.innerText = data.tourney.ipcClients[1].gameplay.hits[0]
        }
    }
}