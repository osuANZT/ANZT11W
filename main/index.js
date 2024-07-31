const countUp = require("../_shared/deps/countUp")

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
let currentRed100Count, currentRed50Count, currentRedMissCount, currentBlue100Count, currentBlue50Count, currentBlueMissCount

// Unstable rate
const unstableRatesEl = document.getElementById("unstableRates")
const redUnstableRateEl = document.getElementById("redUnstableRate")
const blueUnstableRateEl = document.getElementById("blueUnstableRate")
let currentRedUnstableRate, currentBlueUnstableRate

// Score Visibility
let isScoreVisible

// Scores
const currentScoreContainersEl = document.getElementById("currentScoreContainers")
const currentScoreRedEl = document.getElementById("currentScoreRed")
const currentScoreBlueEl = document.getElementById("currentScoreBlue")
const currentPlayingScoreRedEl = document.getElementById("currentPlayingScoreRed")
const currentPlayingScoreRedDifferenceEl = document.getElementById("currentPlayingScoreRedDifference")
const currentPlayingScoreBlueEl = document.getElementById("currentPlayingScoreBlue")
const currentPlayingScoreBlueDifferenceEl = document.getElementById("currentPlayingScoreBlueDifference")
let currentScoreRed, currentScoreBlue, currentScoreDelta

// Moving score bars
const movingScoreBarsEl = document.getElementById("movingScoreBars")
const movingScoreBarRedEl = document.getElementById("movingScoreBarRed")
const movingScoreBarBlueEl = document.getElementById("movingScoreBarBlue")

// Countups
const countUps = {
    redUnstableRate: new CountUp(redUnstableRateEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    blueUnstableRate: new CountUp(blueUnstableRateEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playingScoreRed: new CountUp(currentPlayingScoreRedEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playingScoreRedDelta: new CountUp(currentPlayingScoreRedDifferenceEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playingScoreBlue: new CountUp(currentPlayingScoreBlueEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playingScoreBlueDelta: new CountUp(currentPlayingScoreBlueDifferenceEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
}

// Chat Display
const chatDisplay = document.getElementById("chatDisplay")
let chatLen = 0

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
            unstableRatesEl.style.opacity = 1
        } else {
            redNon300CountsEl.style.opacity = 0
            blueNon300CountsEl.style.opacity = 0
            unstableRatesEl.style.opacity = 0
        }
    }

    if (currentIPCState === 2 || currentIPCState === 3) {
        // Non 300 counts
        if (currentRed100Count !== data.tourney.ipcClients[0].gameplay.hits[100]) {
            currentRed100Count = data.tourney.ipcClients[0].gameplay.hits[100]
            red100CountEl.innerText = currentRed100Count
        }
        if (currentRed50Count !== data.tourney.ipcClients[0].gameplay.hits[50]) {
            currentRed50Count = data.tourney.ipcClients[0].gameplay.hits[50]
            red50CountEl.innerText = currentRed50Count
        }
        if (currentRedMissCount !== data.tourney.ipcClients[0].gameplay.hits[0]) {
            currentRedMissCount = data.tourney.ipcClients[0].gameplay.hits[0]
            redMissCountEl.innerText = currentRedMissCount
        }
        if (currentBlue100Count !== data.tourney.ipcClients[1].gameplay.hits[100]) {
            currentBlue100Count = data.tourney.ipcClients[1].gameplay.hits[100]
            blue100CountEl.innerText = currentBlue100Count
        }
        if (currentBlue50Count !== data.tourney.ipcClients[1].gameplay.hits[50]) {
            currentBlue50Count = data.tourney.ipcClients[1].gameplay.hits[50]
            blue50CountEl.innerText = currentBlue50Count
        }
        if (currentBlueMissCount !== data.tourney.ipcClients[1].gameplay.hits[0]) {
            currentBlueMissCount = data.tourney.ipcClients[1].gameplay.hits[0]
            blueMissCountEl.innerText = currentBlueMissCount
        }

        // Unstable rates
        if (currentRedUnstableRate !== data.tourney.ipcClients[0].gameplay.hits.unstableRate) {
            currentRedUnstableRate = data.tourney.ipcClients[0].gameplay.hits.unstableRate
            countUps.redUnstableRate.update(currentRedUnstableRate)
        }
        if (currentBlueUnstableRate !== data.tourney.ipcClients[1].gameplay.hits.unstableRate) {
            currentBlueUnstableRate = data.tourney.ipcClients[1].gameplay.hits.unstableRate
            countUps.blueUnstableRate.update(currentBlueUnstableRate)
        }
    }

    // Set score visibility
    if (isScoreVisible !== data.tourney.manager.bools.scoreVisible) {
        isScoreVisible = data.tourney.manager.bools.scoreVisible

        if (isScoreVisible) {
            movingScoreBarsEl.style.opacity = 1
            currentScoreContainersEl.style.opacity = 1
        } else {
            movingScoreBarsEl.style.opacity = 0
            currentScoreContainersEl.style.opacity = 0
        }
    }

    // Get scores
    if (isScoreVisible) {
        // Scores
        currentScoreRed = data.tourney.manager.gameplay.score.left
        currentScoreBlue = data.tourney.manager.gameplay.score.left
        currentScoreDelta = Math.abs(currentScoreRed - currentScoreBlue)

        // Update scores
        countUps.playingScoreRed.update(currentScoreRed)
        countUps.playingScoreBlue.update(currentScoreBlue)
        countUps.playingScoreRedDelta.update(currentScoreDelta)
        countUps.playingScoreBlueDelta.update(currentScoreDelta)

        // Bar percentage
        let movingScoreBarDifferencePercent = Math.min(currentScoreDelta / 1000000, 1)
        let movingScoreBarRectangleWidth = Math.min(Math.pow(movingScoreBarDifferencePercent, 0.5)* 470, 470)

        if (currentScoreRed > currentScoreBlue) {
            // Set visibility and classes
            if (!currentPlayingScoreRedEl.classList.has("currentPlayingScoreLead")) {
                currentPlayingScoreRedEl.classList.add("currentPlayingScoreLead")
            }
            currentPlayingScoreRedDifferenceEl.style.display = "block"
            currentPlayingScoreBlueEl.classList.remove("currentPlayingScoreLead")
            currentPlayingScoreBlueDifferenceEl.style.display = "none"

            // Width of moving score bar
            movingScoreBarRedEl.style.width = `${movingScoreBarRectangleWidth}px`
            movingScoreBarBlueEl.style.width = "0px"

            // Set position of elements
            if (currentScoreRedEl.getBoundingClientRect().width + 35 < movingScoreBarRectangleWidth) {
                currentScoreRedEl.style.right = `${1280 + movingScoreBarRectangleWidth - currentScoreRedEl.getBoundingClientRect().width}px`
            } else {
                currentScoreRedEl.style.right = "1315px"
            }
            currentScoreBlueEl.style.left = "1315px"
        } else if (currentScoreRed === currentScoreBlue) {
            // Set visibility and classes
            currentPlayingScoreRedEl.classList.remove("currentPlayingScoreLead")
            currentPlayingScoreRedDifferenceEl.style.display = "none"
            currentPlayingScoreBlueEl.classList.remove("currentPlayingScoreLead")
            currentPlayingScoreBlueDifferenceEl.style.display = "none"

            // Width of moving score bar
            movingScoreBarRedEl.style.width = `0px`
            movingScoreBarBlueEl.style.width = "0px"

            // Set position of elements
            currentScoreRedEl.style.right = "1315px"
            currentScoreBlueEl.style.left = "1315px"
        } else if (currentScoreRed < currentScoreBlue) {
            // Set visibility and classes
            currentPlayingScoreRedEl.classList.remove("currentPlayingScoreLead")
            currentPlayingScoreRedDifferenceEl.style.display = "block"
            if (!currentPlayingScoreBlueEl.classList.has("currentPlayingScoreLead")) {
                currentPlayingScoreBlueEl.classList.add("currentPlayingScoreLead")
            }
            currentPlayingScoreBlueDifferenceEl.style.display = "none"

            // Width of moving score bar
            movingScoreBarRedEl.style.width = "0px"
            movingScoreBarBlueEl.style.width = `${movingScoreBarRectangleWidth}px`

            // Set position of elements
            currentScoreRedEl.style.right = "1315px"
            if (currentScoreBlueEl.getBoundingClientRect().width + 35 < movingScoreBarRectangleWidth) {
                currentScoreBlueEl.style.left = `${1280 + movingScoreBarRectangleWidth - currentScoreBlueEl.getBoundingClientRect().width}px`
            } else {
                currentScoreBlueEl.style.left = "1315px"
            }
        }
    }

    // Chat Stuff
    // This is also mostly taken from Victim Crasher: https://github.com/VictimCrasher/static/tree/master/WaveTournament
    if (chatLen !== data.tourney.manager.chat.length) {
        (chatLen === 0 || chatLen > data.tourney.manager.chat.length) ? (chatDisplay.innerHTML = "", chatLen = 0) : null;
        const fragment = document.createDocumentFragment();

        for (let i = chatLen; i < data.tourney.manager.chat.length; i++) {
            const chatColour = data.tourney.manager.chat[i].team;

            // Chat message container
            const chatMessageContainer = document.createElement("div")
            chatMessageContainer.classList.add("chatMessageContainer")

            // Time
            const chatDisplayTime = document.createElement("div")
            chatDisplayTime.classList.add("chatDisplayTime")
            chatDisplayTime.innerText = data.tourney.manager.chat[i].time

            // Whole Message
            const chatDisplayWholeMessage = document.createElement("div")
            chatDisplayWholeMessage.classList.add("chatDisplayWholeMessage")  
            
            // Name
            const chatDisplayName = document.createElement("span")
            chatDisplayName.classList.add("chatDisplayName")
            chatDisplayName.classList.add(chatColour)
            chatDisplayName.innerText = data.tourney.manager.chat[i].name + ": ";

            // Message
            const chatDisplayMessage = document.createElement("span")
            chatDisplayMessage.classList.add("chatDisplayMessage")
            chatDisplayMessage.innerText = data.tourney.manager.chat[i].messageBody

            chatDisplayWholeMessage.append(chatDisplayName, chatDisplayMessage)
            chatMessageContainer.append(chatDisplayTime, chatDisplayWholeMessage)
            fragment.append(chatMessageContainer)
        }

        chatDisplay.append(fragment)
        chatLen = data.tourney.manager.chat.length;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }  
}