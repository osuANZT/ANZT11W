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

// Sponsor
const sponsorEl = document.getElementById("sponsor")

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
        panelImage.setAttribute("src", `../_shared/panels/${currentMap.mod}panel.png`)

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
        bannedPanel.setAttribute("src", "../_shared/panels/BANNEDpanel.png")

        // Played panel
        const playedPanel = document.createElement("img")
        playedPanel.classList.add("playedPanel")
        playedPanel.setAttribute("src", "../_shared/panels/PLAYEDpanel.png")

        // Action image
        const actionImage = document.createElement("img")
        actionImage.classList.add("actionImage")

        // Win image
        const winImage = document.createElement("img")
        winImage.classList.add("winImage")

        // Append everything
        panel.append(panelImage, mapBackgroundImage, mapArtistAndTitle, mapDifficulty, CSARODStats, SRBPMLENStats, 
            mapMapper, bannedPanel, playedPanel, actionImage, winImage)
        switch (currentMap.mod) {
            case "NM": NMPanelsEl.append(panel); break;
            case "HD": HDPanelsEl.append(panel); break;
            case "HR": HRPanelsEl.append(panel); break;
            case "DT": DTPanelsEl.append(panel); break;
            case "TB": TBPanelsEl.append(panel); break;
        }
    }

    // Match history section
    matchHistoryTimelineContainerEl.style.top = `${HDPanelsEl.childElementCount * 142 + 246}px`
    matchHistoryTimelineBottomEl.style.top = `${HDPanelsEl.childElementCount * 142 + 527}px`

    // Top section
    sponsorEl.style.top = `${(DTPanelsEl.childElementCount + 1) * 142 + 250}px`
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

// Beatmap information
let currentBeatmapId, currentBeatmapMd5

// IPC State
let checkedForWinner = false
let currentIPCState

// Match history stuff
const matchHistoryTimelineEl = document.getElementById("matchHistoryTimeline")
let previousMPLink
let currentMPLink
let numberOfMapsCounted = 0

// Chat Display
const chatDisplay = document.getElementById("chatDisplay")
let chatLen = 0

socket.onmessage = event => {
    const data = JSON.parse(event.data)

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

    // beatmap changes for autopicking
    if (currentBeatmapId !== data.menu.bm.id || currentBeatmapMd5 !== data.menu.bm.md5 && allBeatmaps) {
        currentBeatmapId = data.menu.bm.id
        currentBeatmapMd5 = data.menu.bm.md5
        
        if (autoPickerOn) {
            // Find button to click on
            let element = document.querySelector(`[data-id="${currentBeatmapId}"]`)

            // Check if autopicked already
            if (!element.hasAttribute("data-is-autopicked") || element.getAttribute("data-is-autopicked") !== "true") {
                const event = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: (nextAutoPicker === "Red")? 0 : 2
                })
                element.dispatchEvent(event)
                element.setAttribute("data-is-autopicked", "true")

                if (nextAutoPicker === "Red") {
                    setNextAutoPicker("Blue")
                } else if (nextAutoPicker === "Blue") {
                    setNextAutoPicker("Red")
                }
            }
        }
    }

    // IPC State
    if (currentIPCState !== data.tourney.manager.ipcState) {
        currentIPCState = data.tourney.manager.ipcState
        if (currentIPCState !== 4) checkedForWinner = false
    }

    if (currentIPCState === 4 && !checkedForWinner) {
        checkedForWinner = true

        // Assign the current picked map winner
        if (currentPickTile) {
            let currentScoreLeft = data.tourney.manager.gameplay.score.left
            let currentScoreRight = data.tourney.manager.gameplay.score.right
            if (currentScoreLeft > currentScoreRight) {
                currentPickTile.children[10].style.opacity = 1
                currentPickTile.children[10].setAttribute("src", "static/players/redWon.png")
            } else if (currentScoreRight > currentScoreLeft) {
                currentPickTile.children[10].style.opacity = 1
                currentPickTile.children[10].setAttribute("src", "static/players/blueWon.png")
            }
        }

        getAndAppendMatchHistory()
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

        document.cookie = `currentPicker=${team}`
    } else if (action === "ban") {
        this.children[7].style.opacity = 1
        this.children[8].style.opacity = 0

        // Set ban
        this.children[9].setAttribute("src", `static/players/${team}Ban.png`)
        this.children[9].style.opacity = 1
        this.children[10].style.opacity = 0

        // Set dataset action
        this.dataset.action = "ban"
        this.removeAttribute("data-is-autopicked")
    } else if (action === "reset") {
        if (currentPickTile === this) currentPickTile = previousPickTile

        this.children[7].style.opacity = 0
        this.children[8].style.opacity = 0

        this.children[9].setAttribute("src", ``)
        this.children[9].style.opacity = 0
        this.children[10].setAttribute("src", ``)
        this.children[10].style.opacity = 0

        this.removeAttribute("data-action")
        this.removeAttribute("data-is-autopicked")
    }
}

// Set next auto picker
const nextAutoPickerEl = document.getElementById("nextAutoPicker")
let nextAutoPicker = "Red"
function setNextAutoPicker(colour) {
    nextAutoPickerEl.innerText = colour
    nextAutoPicker = colour
}

// Toggle Auto picker
const toggleAutoPickButtonEl = document.getElementById("toggleAutoPickButton")
let autoPickerOn = false
function toggleAutoPick() {
    autoPickerOn = !autoPickerOn
    if (!autoPickerOn) {
        toggleAutoPickButtonEl.innerText = "Toggle Auto Pick: OFF"
    } else {
        toggleAutoPickButtonEl.innerText = "Toggle Auto Pick: ON"
    }
}

// Reset All Maps
function resetAllMaps() {
    for (let i = 0; i < allBeatmaps.length; i++) {
        const element = document.querySelector(`[data-id="${allBeatmaps[i].beatmapID}"]`)
        const event = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 0,
            shiftKey: true
        })
        element.dispatchEvent(event)
    }
}

// Get Matches
const matchIdEl = document.getElementById("matchId")
function getMatches() {
    currentMPLink = parseInt(matchIdEl.value)
    getAndAppendMatchHistory()
}

// Get and append match history
async function getAndAppendMatchHistory() {

    // Get MP Link
    if (previousMPLink !== currentMPLink) resetMatchHistory()

    const response = await fetch(`https://osu.ppy.sh/api/get_match?k=${getAPIKey()}&mp=${currentMPLink}`)
    const responseJson = await response.json()

    const fragment = document.createDocumentFragment()
    for (numberOfMapsCounted; numberOfMapsCounted < responseJson.games.length; numberOfMapsCounted++) {
        const currentMap = findMapInMapool(parseInt(responseJson.games[numberOfMapsCounted].beatmap_id))

        if (responseJson.games[numberOfMapsCounted].scores.length !== 2) continue
        
        if (currentMap) {
            // Create elements
            // Panel
            const matchHistoryPanel = document.createElement("div")
            matchHistoryPanel.classList.add("matchHistoryPanel")
            fragment.append(matchHistoryPanel)

            // Panel Image
            const matchHistoryPanelImage = document.createElement("img")
            matchHistoryPanelImage.classList.add("matchHistoryPanelImage")
            matchHistoryPanelImage.setAttribute("src", "../_shared/panels/MatchHistoryPanel.png")
            matchHistoryPanel.append(matchHistoryPanelImage)

            // Background Image
            const matchHistoryPanelBackgroundImage = document.createElement("div")
            matchHistoryPanelBackgroundImage.classList.add("matchHistoryPanelBackgroundImage")
            matchHistoryPanelBackgroundImage.style.backgroundImage = `url("${currentMap.imgURL}")`
            matchHistoryPanel.append(matchHistoryPanelBackgroundImage)

            // Picked Overlay
            const matchHistoryPanelPickedBackground = document.createElement("div")
            matchHistoryPanelPickedBackground.classList.add("matchHistoryPanelPickedBackground")
            matchHistoryPanel.append(matchHistoryPanelBackgroundImage)

            // Mod
            const matchHistoryPanelMod = document.createElement("img")
            matchHistoryPanelMod.classList.add("matchHistoryPanelMod")
            matchHistoryPanelMod.setAttribute("src", `../_shared/match-history/${currentMap.mod}${currentMap.order}.png`)
            matchHistoryPanel.append(matchHistoryPanelMod)

            // Get scores
            let scoreObjects = []
            for (let j = 0; j < responseJson.games[numberOfMapsCounted].scores.length; j++) {
                const currentScoreObject = responseJson.games[numberOfMapsCounted].scores[j]
                scoreObjects[j] = {
                    "player": parseInt(currentScoreObject.user_id),
                    "score": parseInt(currentScoreObject.score)
                }
            }

            // Sort scores
            scoreObjects.sort((a, b) => b.score - a.score)

            // Create 1st score object
            function createScoreElement(index) {
                console.log(index)
                console.log(scoreObjects)
                const scoreElement = document.createElement("div")
                scoreElement.classList.add("matchHistoryPanelScore")
                if (index === 0) scoreElement.classList.add("matchHistoryPanelWinnerScore")
                else scoreElement.classList.add("matchHistoryPanelLoserScore")
                if (scoreObjects[index].player === currentRedPlayerId) scoreElement.classList.add("matchHistoryPanelRedScore")
                else scoreElement.classList.add("matchHistoryPanelBlueScore")
                scoreElement.innerText = scoreObjects[index].score.toLocaleString()
                matchHistoryPanel.append(scoreElement)
            }

            createScoreElement(0)
            createScoreElement(1)
        }
    }
    matchHistoryTimelineEl.append(fragment)

    if (matchHistoryTimelineEl.childElementCount > 6) {
        matchHistoryTimelineEl.style.transform = `translateX(${-172.79 * (matchHistoryTimelineEl.childElementCount - 6)}px)`
    } else {
        matchHistoryTimelineEl.style.transform = `translateX(0px)`
    }
    previousMPLink = currentMPLink
}

// Reset match history
function resetMatchHistory() {
    matchHistoryTimelineEl.innerHTML = ""
    numberOfMapsCounted = 0
}

/* Pick Ban Management */
const pickBanManagementEl = document.getElementById("pickBanManagement")
const pickBanManagementOptionsEl = document.getElementById("pickBanManagementOptions")
let currentPickBanManagementOption
pickBanManagementOptionsEl.onchange = () => {
    currentPickBanManagementOption = pickBanManagementOptionsEl.value
    currentPickBanManagementMapId = undefined

    while (pickBanManagementEl.childElementCount > 2) {
        pickBanManagementEl.lastChild.remove()
    }

    function createPickBanManagementMapSelection() {
        // Title
        const whichMapTitle = document.createElement("h1")
        whichMapTitle.innerText = "Which map?"
        pickBanManagementEl.append(whichMapTitle)

        // Element to store all buttons
        const whichMapButtonContainer = document.createElement("div")
        whichMapButtonContainer.classList.add("whichMapButtonContainer")
        pickBanManagementEl.append(whichMapButtonContainer)
        for (let i = 0; i < allBeatmaps.length; i++) {
            const whichMapButton = document.createElement("button")
            whichMapButton.classList.add("whichMapButton")
            whichMapButton.innerText = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
            whichMapButton.setAttribute("data-id", allBeatmaps[i].beatmapID)
            whichMapButton.setAttribute("data-pickBanManagement", "ban")
            whichMapButton.addEventListener("click", pickBanManagementSetMap)
            whichMapButtonContainer.append(whichMapButton)
        }
    }

    function createPickBanManagementTeamSelection() {
        // Choose which team
        // Title
        const whichTeamTitle = document.createElement("h1")
        whichTeamTitle.innerText = "Which team?"
        pickBanManagementEl.append(whichTeamTitle)
        // Element to store both teams
        const whichTeamSelectContainer = document.createElement("select")
        whichTeamSelectContainer.classList.add("pickManagementSelect")
        whichTeamSelectContainer.setAttribute("id", "whichTeamSelectOptions")
        whichTeamSelectContainer.setAttribute("size", 2)
        pickBanManagementEl.append(whichTeamSelectContainer)
        for (let i = 0; i < 2; i++) {
            const whichTeamOption = document.createElement("option")
            whichTeamOption.setAttribute("value", (i === 0)? "red" : "blue")
            whichTeamOption.innerText = (i === 0)? "Red" : "Blue"
            whichTeamSelectContainer.append(whichTeamOption)
        }
    }

    // Set and remove ban
    if (currentPickBanManagementOption === "setBan" || currentPickBanManagementOption === "removeBan" ||
        currentPickBanManagementOption === "setPick" || currentPickBanManagementOption === "removePick" ||
        currentPickBanManagementOption === "setWinner" || currentPickBanManagementOption === "removeWinner"
    ) {
        // Choose which map
        createPickBanManagementMapSelection()

        if (currentPickBanManagementOption === "setBan" || currentPickBanManagementOption === "setPick" || 
            currentPickBanManagementOption === "setWinner") {
            createPickBanManagementTeamSelection()
        }
    }

    // Apply changes button
    const applyChangesButton = document.createElement("button")
    applyChangesButton.classList.add("sideBarButton", "fullSizeButton")
    applyChangesButton.innerText = "Apply Changes"

    switch (currentPickBanManagementOption) {
        case "setBan": applyChangesButton.addEventListener("click", pickBanManagementSetBan); break;
        case "removeBan": applyChangesButton.addEventListener("click", pickBanManagementRemoveBan); break;
        case "setPick": applyChangesButton.addEventListener("click", pickBanManagementSetPick); break;
        case "removePick": applyChangesButton.addEventListener("click", pickBanManagementRemovePick); break;
        case "setWinner": applyChangesButton.addEventListener("click", pickBanManagementSetWinner); break;
        case "removeWinner": applyChangesButton.addEventListener("click", pickBanManagementRemoveWinner); break;
    }
    pickBanManagementEl.append(applyChangesButton)
}

// Pick Ban Management Set Map
let currentPickBanManagementMapId
function pickBanManagementSetMap() {
    const whichMapButtonEls = document.getElementsByClassName("whichMapButton")
    for (let i = 0; i < whichMapButtonEls.length; i++) {
        whichMapButtonEls[i].style.backgroundColor = "white"
    }
    this.style.backgroundColor = "rgb(206,206,206)"
    currentPickBanManagementMapId = this.dataset.id
}

// Pick Ban Management Find Map Tile
function pickBanManagementFindMapTile() {
    if (!currentPickBanManagementMapId) return false
    const currentTile = document.querySelector(`.panel[data-id="${currentPickBanManagementMapId}"]`)
    if (!currentTile) return false
    return currentTile
}

// Pick Ban Management Set Ban
function pickBanManagementSetBan() {
    // Find tile
    const currentTile = pickBanManagementFindMapTile()
    if (!currentTile) return

    // Set everything for the team colours ban
    const whichTeamSelectOptionsEl = document.getElementById("whichTeamSelectOptions")
    currentTile.children[7].style.opacity = 1
    currentTile.children[8].style.opacity = 0
    currentTile.children[9].setAttribute("src", `static/players/${whichTeamSelectOptionsEl.value}Ban.png`)
    currentTile.children[9].style.opacity = 1
    if (currentTile.children[10].hasAttribute("src")) currentTile.children[10].removeAttribute("src")
    currentTile.children[10].style.opacity = 0
}

// Pick Ban Management Remove Ban
function pickBanManagementRemoveBan() {
    // Find tile
    const currentTile = pickBanManagementFindMapTile()
    if (!currentTile) return

    // Set everything to remove ban
    // Check if it is a ban first
    if (window.getComputedStyle(currentTile.children[7]).opacity != 1) return
    currentTile.children[7].style.opacity = 0
    if (currentTile.children[9].hasAttribute("src")) currentTile.children[9].removeAttribute("src")
    currentTile.children[9].style.opacity = 0
}

// Pick Ban Management Set Pick
function pickBanManagementSetPick() {
    const currentTile = pickBanManagementFindMapTile()
    if (!currentTile) return

    // Set everything to set a pick
    const whichTeamSelectOptionsEl = document.getElementById("whichTeamSelectOptions")
    currentTile.children[7].style.opacity = 0
    currentTile.children[8].style.opacity = 1
    currentTile.children[9].setAttribute("src", `static/players/${whichTeamSelectOptionsEl.value}Pick.png`)
    currentTile.children[9].style.opacity = 1
}

// Pick Ban Management Remove Pick
function pickBanManagementRemovePick() {
    const currentTile = pickBanManagementFindMapTile()
    if (!currentTile) return

    if (window.getComputedStyle(currentTile.children[8]).opacity != 1) return
    currentTile.children[8].style.opacity = 0
    if (currentTile.children[9].hasAttribute("src")) currentTile.children[9].removeAttribute("src")
    currentTile.children[9].style.opacity = 0
    if (currentTile.children[10].hasAttribute("src")) currentTile.children[10].removeAttribute("src")
    currentTile.children[10].style.opacity = 0
}

// Pick Ban Management Set Winner 
function pickBanManagementSetWinner() {
    const currentTile = pickBanManagementFindMapTile()
    if (!currentTile) return

    // Set everything to set a winner
    const whichTeamSelectOptionsEl = document.getElementById("whichTeamSelectOptions")
    if (window.getComputedStyle(currentTile.children[8]).opacity != 1) return
    currentTile.children[10].setAttribute("src", `static/players/${whichTeamSelectOptionsEl.value}Won.png`)
    currentTile.children[10].style.opacity = 1
}

// Pick Ban Management Remove Winner
function pickBanManagementRemoveWinner() {
    const currentTile = pickBanManagementFindMapTile()
    if (!currentTile) return
    
    if (currentTile.children[10].hasAttribute("src")) currentTile.children[10].removeAttribute("src")
    currentTile.children[10].style.opacity = 0
}