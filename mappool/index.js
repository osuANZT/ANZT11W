// Round Name
const roundNameEl = document.getElementById("roundName")
let allBeatmaps

// Get mappool
async function getMappool() {
    const response = await fetch("../_data/beatmaps.json")
    const responseJson = await response.json()

    // Round name
    roundNameEl.innerText = responseJson.roundName.toUpperCase()
    // Set beatmaps
    allBeatmaps = responseJson.beatmaps
}
getMappool()

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
            redProfilePictureEl.style.backgroundImage = `url("https://a.ppy.sh/${currentRedPlayerId}")`
        }
    }
    if (currentBluePlayerName !== data.tourney.manager.teamName.right && allPlayers) {
        currentBluePlayerName = data.tourney.manager.teamName.right
        bluePlayerNameEl.innerText = currentBluePlayerName

        let playerDetails = getPlayersFromName(currentBluePlayerName)
        if (playerDetails) {
            currentBluePlayerId = playerDetails.playerId
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
            newStar.setAttribute("src", `static/${image}.png`)
            return newStar
        }

        // Red stars
        let i = 0
        for (i; i < currentRedStarsCount; i++) {
            redStarsContainerEl.append(createStar("scorePoint"))
        }
        for (i; i < currentFirstTo; i++) {
            redStarsContainerEl.append(createStar("scoreBlank"))
        }
        // Blue stars
        i = 0
        for (i; i < currentBlueStarsCount; i++) {
            blueStarsContainerEl.append(createStar("scorePoint"))
        }
        for (i; i < currentFirstTo; i++) {
            blueStarsContainerEl.append(createStar("scoreBlank"))
        }
    }
}