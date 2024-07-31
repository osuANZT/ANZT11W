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

// Get players
let allPlayers
async function getPlayers() {
    const response = await fetch("../_data/players.json")
    const responseJson = await response.json()
    allPlayers = responseJson()
}
getPlayers()