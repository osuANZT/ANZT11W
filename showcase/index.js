const showcaseTitleEl = document.getElementById("showcaseTitle")
let allBeatmaps
async function getMappool() {
    const response = await fetch("http://127.0.0.1:24050/ANZT11W/_data/beatmaps.json")
    const mappool = await response.json()
    allBeatmaps = mappool.beatmaps
    showcaseTitleEl.innerText = `[showcase of ${mappool.roundName.toUpperCase()}]`
}

getMappool()