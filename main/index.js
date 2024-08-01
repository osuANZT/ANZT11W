// Round name
const roundNameEl = document.getElementById("roundName")

// Get mappool
let allBeatmaps
async function getMappool() {
    const response = await fetch("../_data/beatmaps.json")
    const responseJson = await response.json()
    allBeatmaps = responseJson.beatmaps

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
    playingScoreRed: new CountUp(currentPlayingScoreRedEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playingScoreRedDelta: new CountUp(currentPlayingScoreRedDifferenceEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playingScoreBlue: new CountUp(currentPlayingScoreBlueEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playingScoreBlueDelta: new CountUp(currentPlayingScoreBlueDifferenceEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
}

// Chat Display
const chatDisplay = document.getElementById("chatDisplay")
let chatLen = 0

// Now Playing
const nowPlayingPanelImageEl = document.getElementById("nowPlayingPanelImage")
const nowPlayingBannerImageEl = document.getElementById("nowPlayingBannerImage")
const nowPlayingArtistSongNameEl = document.getElementById("nowPlayingArtistSongName")
const nowPlayingDifficultyNameEl = document.getElementById("nowPlayingDifficultyName")
const nowPlayingMapperEl = document.getElementById("nowPlayingMapper")
// Stats
const nowPlayingStatsCSEl = document.getElementById("nowPlayingStatsCS")
const nowPlayingStatsAREl = document.getElementById("nowPlayingStatsAR")
const nowPlayingStatsODEl = document.getElementById("nowPlayingStatsOD")
const nowPlayingStatsSREl = document.getElementById("nowPlayingStatsSR")
const nowPlayingStatsBPMEl = document.getElementById("nowPlayingStatsBPM")
const nowPlayingStatsLENEl = document.getElementById("nowPlayingStatsLEN")
let nowPlayingID, nowPlayingMd5
let foundMapInMappool = false
// Now Playing Mod
const nowPlayingModImageEl = document.getElementById("nowPlayingModImage")
const nowPlayingWarmupTextEl = document.getElementById("nowPlayingWarmupText")

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
            chatDisplay.style.opacity = 0
        } else {
            movingScoreBarsEl.style.opacity = 0
            currentScoreContainersEl.style.opacity = 0
            chatDisplay.style.opacity = 1
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

    // Beatmap information
    if ((nowPlayingID !== data.menu.bm.id || nowPlayingMd5 !== data.menu.bm.md5) && nowPlayingID !== 0 && allBeatmaps) {
        nowPlayingID = data.menu.bm.id
        nowPlayingMd5 = data.menu.bm.md5
        foundMapInMappool = false
        currentlyShowingMod = false
        currentOverrideModText = false
        setNowPlayingSideOverride = false

        nowPlayingBannerImageEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${data.menu.bm.set}/covers/cover.jpg")`
        nowPlayingArtistSongNameEl.innerText = `${data.menu.bm.metadata.artist} - ${data.menu.bm.metadata.title}`
        nowPlayingDifficultyNameEl.innerText = `[${data.menu.bm.metadata.difficulty}]`
        nowPlayingMapperEl.innerText = data.menu.bm.metadata.mapper

        const currentMap = findMapInMapool(nowPlayingID)
        if (currentMap) {
            foundMapInMappool = true
            // Other stats
            nowPlayingStatsCSEl = Math.round(parseFloat(currentMap.cs) * 10) / 10
            nowPlayingStatsAREl = Math.round(parseFloat(currentMap.ar) * 10) / 10
            nowPlayingStatsODEl = Math.round(parseFloat(currentMap.od) * 10) / 10
            nowPlayingStatsSREl = `${Math.round(parseFloat(currentMap.difficultyrating) * 100) / 100}*`
            nowPlayingStatsBPMEl = `${Math.round(parseFloat(currentMap.bpm) * 10) / 10}bpm`
            displayLength(parseInt(currentMap.songLength))
            // Panel Image
            nowPlayingPanelImageEl.setAttribute("src", `../_shared/panels/${currentMap.mod}panel.png`)
            // Mod Image
            nowPlayingModImageEl.setAttribute("src", `${currentMap.mod}${(currentMap.mod === "TB")? "" : currentMap.order}`)
            nowPlayingWarmupTextEl.style.display = "none"
            setCurrentModOfMap()
            currentlyShowingMod = true
        }  else {
            // Panel Image
            nowPlayingPanelImageEl.setAttribute("src", `../_shared/panels/NMPanel.png`)

            // Mod Image
            showDefaultNowPlayingModText()
        }
    }

    if (!foundMapInMappool) {
        nowPlayingStatsCSEl.innerText = data.menu.bm.stats.CS
        nowPlayingStatsAREl.innerText = data.menu.bm.stats.AR
        nowPlayingStatsODEl.innerText = data.menu.bm.stats.OD
        nowPlayingStatsSREl.innerText = `${data.menu.bm.stats.fullSR}*`
        nowPlayingStatsBPMEl.innerText = `${data.menu.bm.stats.BPM.common}bpm`
        displayLength(parseInt(data.menu.bm.time.full / 1000))
    }
}

function displayLength(songLengthSeconds) {
    // Length
    let totalSeconds = songLengthSeconds
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0')
    nowPlayingStatsLENEl.innerText = `${minutes}:${seconds}`
}


// SIDEBAR FUNCTIONS
// Set current mod of map
let currentlyShowingMod = false
function setCurrentModOfMap() {
    // Find map
    let currentMap = findMapInMapool(nowPlayingID)
    if (currentMap) {
        nowPlayingModImageEl.setAttribute("src", `${currentMap.mod}${(currentMap.mod !== "TB")? currentMap.order : ""}`)
        nowPlayingWarmupTextEl.style.display = "none"
        currentlyShowingMod = true
    } else {
        showDefaultNowPlayingModText()
        currentlyShowingMod = false
    }
}

// Show now playing mod text
let currentOverrideModText = false
function showNowPlayingModText(text) {
    nowPlayingModImageEl.style.display = "none"
    nowPlayingWarmupTextEl.style.display = "block"
    nowPlayingWarmupTextEl.innerText = text
    currentOverrideModText = true
}

// Set default now playing mod text
let setCurrentDefaultNowPlayingModText
function setDefualtNowPlayingModText(text) {
    setCurrentDefaultNowPlayingModText = text
    if (!currentOverrideModText && !currentlyShowingMod) {
        showDefaultNowPlayingModText()
    }
}

// Show current default text
function showDefaultNowPlayingModText() {
    nowPlayingModImageEl.style.display = "none"
    nowPlayingWarmupTextEl.style.display = "block"
    if (setCurrentDefaultNowPlayingModText === "none") {
        nowPlayingWarmupTextEl.innerText = ""
    } else if (setCurrentDefaultNowPlayingModText === "warmup") {
        nowPlayingWarmupTextEl.innerText = setCurrentDefaultNowPlayingModText
    }
}

// Set now playing side
const nowPlayingEl = document.getElementById("nowPlaying")
const nowPlayingModEl = document.getElementById("nowPlayingMod")
let setNowPlayingSideOverride = false
function setNowPlayingSide(side) {
    setNowPlayingSideOverride = true
    if (side === "default") {
        let currentSide = getCookie("currentPicker")
        if (currentSide === "right") side = "right"
        else side = "left"
    }

    if (side === "left") {
        nowPlayingEl.style.left = "1px"
        nowPlayingEl.style.right = "unset"
        nowPlayingModEl.style.left = "503px"
        nowPlayingModEl.style.right = "unset"
    } else if (side === "right") {
        nowPlayingEl.style.left = "unset"
        nowPlayingEl.style.right = "1px"
        nowPlayingModEl.style.left = "unset"
        nowPlayingModEl.style.right = "503px"
    }
}

// Get Cookie
function getCookie(cname) {
    let name = cname + "="
    let ca = document.cookie.split(';')
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

setTimeout(() => {
    let currentSide = getCookie("currentPicker")
    if (!setNowPlayingSideOverride) {
        if (currentSide === "left") {
            nowPlayingEl.style.left = "1px"
            nowPlayingEl.style.right = "unset"
            nowPlayingModEl.style.left = "503px"
            nowPlayingModEl.style.right = "unset"
            nowPlayingWarmupTextEl.style.marginLeft = "15px"
            nowPlayingWarmupTextEl.style.marginLeft = "15px"
        } else if (currentSide === "right") {
            nowPlayingEl.style.left = "unset"
            nowPlayingEl.style.right = "1px"
            nowPlayingModEl.style.left = "unset"
            nowPlayingModEl.style.right = "503px"
        }
    }
}, 500)