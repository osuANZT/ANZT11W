// Round Name
const roundNameEl = document.getElementById("roundName")

// Beatmap information
const NMPanelsEl = document.getElementById("NMPanels")
const HDPanelsEl = document.getElementById("HDPanels")
const HRPanelsEl = document.getElementById("HRPanels")
const DTPanelsEl = document.getElementById("DTPanels")
const TBPanelsEl = document.getElementById("TBPanels")
let allBeatmaps

// Match history panel
const matchHistoryTimelineContainerEl = document.getElementById("matchHistoryTimelineContainer")
const matchHistoryTimelineBottomEl = document.getElementById("matchHistoryTimelineBottom")

// Get mappool
async function getMappool() {
    const response = await fetch("../_data/beatmaps.json")
    const responseJson = await response.json()

    // Round name
    roundNameEl.innerText = responseJson.roundName.toUpperCase()
    // Set beatmaps
    allBeatmaps = responseJson.beatmaps

    // Load in the mappool
    for (let i = 0; i < allBeatmaps.length; i++) {
        const currentMap = allBeatmaps[i]

        const panel = document.createElement("div")
        panel.classList.add("panel")
        panel.addEventListener("mousedown", mapClickEvent)
        panel.addEventListener("contextmenu", function(event) {event.preventDefault()})
        panel.dataset.id = currentMap.beatmapID

        // Image
        const panelImage = document.createElement("img")
        panelImage.setAttribute("src", `static/panels/${currentMap.mod}panel.png`)

        // Map background Image
        const mapBackgroundImage = document.createElement("div")
        mapBackgroundImage.classList.add("mapBackgroundImage")
        mapBackgroundImage.style.backgroundImage = `url("${currentMap.imgURL}")`

        // Map Artist and Title
        const mapArtistAndTitle = document.createElement("div")
        mapArtistAndTitle.classList.add("mapArtistAndTitle")
        const mapArtist = document.createElement("span")
        mapArtist.classList.add("mapArtist")
        mapArtist.innerText = currentMap.artist
        const mapTitle = document.createElement("span")
        mapTitle.classList.add("mapTitle")
        mapTitle.innerText = currentMap.songName
        mapArtistAndTitle.append(mapArtist," - ",mapTitle)

        // Map difficulty
        const mapDifficulty = document.createElement("div")
        mapDifficulty.classList.add("mapDifficulty")
        mapDifficulty.innerText = `[${currentMap.difficultyname}]`

        // CS AR OD
        const CSARODStats = document.createElement("div")
        CSARODStats.classList.add("CSARODStats")
        // CS
        const csStats = document.createElement("span")
        csStats.classList.add("stats")
        csStats.innerText = Math.round(parseFloat(currentMap.cs) * 10) / 10
        // AR
        const arStats = document.createElement("span")
        arStats.classList.add("stats")
        arStats.innerText = Math.round(parseFloat(currentMap.ar) * 10) / 10
        // OD
        const odStats = document.createElement("span")
        odStats.classList.add("stats")
        odStats.innerText = Math.round(parseFloat(currentMap.od) * 10) / 10
        CSARODStats.append("cs: ", csStats, " ar: ", arStats, " od: ", odStats)

        // SR BPM LEN
        const SRBPMLENStats = document.createElement("div")
        SRBPMLENStats.classList.add("SRBPMLENStats")
        // SR
        const srStats = document.createElement("span")
        srStats.classList.add("stats")
        srStats.innerText = `${Math.round(parseFloat(currentMap.difficultyrating) * 100) / 100}*`
        // BPM
        const bpmStats = document.createElement("span")
        bpmStats.classList.add("stats")
        bpmStats.innerText = `${Math.round(currentMap.bpm)}bpm`
        // LEN
        const lenStats = document.createElement("span")
        lenStats.classList.add("stats")
        let totalSeconds = currentMap.songLength
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0')
        lenStats.innerText = `${minutes}:${seconds}`
        SRBPMLENStats.append(srStats, bpmStats, lenStats)

        // Mapper
        const mapMapper = document.createElement("div")
        mapMapper.classList.add("mapMapper")
        mapMapper.innerText = currentMap.mapper

        // Banned panel
        const bannedPanel = document.createElement("img")
        bannedPanel.classList.add("bannedPanel")
        bannedPanel.setAttribute("src", "static/panels/BANNEDpanel.png")

        // Played panel
        const playedPanel = document.createElement("img")
        playedPanel.classList.add("playedPanel")
        playedPanel.setAttribute("src", "static/panels/PLAYEDpanel.png")

        // Action image
        const actionImage = document.createElement("img")
        actionImage.classList.add("actionImage")

        // Append everything
        panel.append(panelImage, mapBackgroundImage, mapArtistAndTitle, mapDifficulty, CSARODStats, SRBPMLENStats, 
            mapMapper, bannedPanel, playedPanel, actionImage)
        switch (currentMap.mod) {
            case "NM": NMPanelsEl.append(panel); break;
            case "HD": HDPanelsEl.append(panel); break;
            case "HR": HRPanelsEl.append(panel); break;
            case "DT": DTPanelsEl.append(panel); break;
            case "TB": TBPanelsEl.append(panel); break;
        }
    }

    matchHistoryTimelineContainerEl.style.top = `${HDPanelsEl.childElementCount * 139 + 246}px`
    matchHistoryTimelineBottomEl.style.top = `${HDPanelsEl.childElementCount * 139 + 527}px`
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
        for (i; i < currentRedStarsCount; i++) redStarsContainerEl.append(createStar("scorePoint"))
        for (i; i < currentFirstTo; i++) redStarsContainerEl.append(createStar("scoreBlank"))
        // Blue stars
        i = 0
        for (i; i < currentBlueStarsCount; i++) blueStarsContainerEl.append(createStar("scorePoint"))
        for (i; i < currentFirstTo; i++) blueStarsContainerEl.append(createStar("scoreBlank"))
    }
}

// Map Click Event
let previousPickTile
let currentPickTile
function mapClickEvent() {
    // Team
    let team
    if (event.button === 0) team = "red"
    else if (event.button === 2) team = "blue"
    if (!team) return

    // Action
    let action = "pick"
    if (event.ctrlKey) action = "ban"
    if (event.shiftKey) action = "reset"


    if (action === "pick") {
        this.children[7].style.opacity = 0
        this.children[8].style.opacity = 1

        // Set picker
        this.children[9].setAttribute("src", `static/players/${team}Pick.png`)
        this.children[9].style.opacity = 1

        // Set dataset action
        this.dataset.action = "pick"

        previousPickTile = currentPickTile
        currentPickTile = this
    } else if (action === "ban") {
        this.children[7].style.opacity = 1
        this.children[8].style.opacity = 0

        // Set ban
        this.children[9].setAttribute("src", `static/players/${team}Ban.png`)
        this.children[9].style.opacity = 1

        // Set dataset action
        this.dataset.action = "ban"
    } else if (action === "reset") {
        if (currentPickTile === this) currentPickTile = previousPickTile

        this.children[7].style.opacity = 0
        this.children[8].style.opacity = 0

        this.children[9].setAttribute("src", ``)
        this.children[9].style.opacity = 0

        this.removeAttribute("data-action")
    }
}