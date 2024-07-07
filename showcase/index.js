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

// count up animations
const countUpAnimation = {
    playerScore: new CountUp("playerScore", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerAccuracy: new CountUp("playerAccuracy", 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , suffix: "%"}),
    playerDetailsCurrentCombo: new CountUp("playerDetailsCurrentCombo", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerDetailsMaxCombo: new CountUp("playerDetailsMaxCombo", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
}

// IPC State
let currentState

// Strains
const progressChart = document.getElementById("progress")
let tempStrains, seek, fullTime
let changeStats = false
let statsCheck = false
let last_strain_update = 0

window.onload = function () {
	let ctx = document.getElementById('strain').getContext('2d')
	window.strainGraph = new Chart(ctx, config)

	let ctxProgress = document.getElementById('strainProgress').getContext('2d')
	window.strainGraphProgress = new Chart(ctxProgress, configProgress)
}

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
    if (currentState !== data.menu.state) {
        currentState = data.menu.state
        if (currentState === 2 || currentState === 7) {
            playerNameEl.style.opacity = 1
            playerScoreEl.style.opacity = 1
            playerAccuracyEl.style.opacity = 1
            playerDetailsComboEl.style.opacity = 1
        } else {
            playerNameEl.style.opacity = 0
            playerScoreEl.style.opacity = 0
            playerAccuracyEl.style.opacity = 0
            playerDetailsComboEl.style.opacity = 0
        }
    }

    // Conditionals for stat
    // This is specifically for the middle section
    if (currentState === 2) {
        // Gameplay
        const gameplayScreenInfo = data.gameplay
        playerNameEl.innerText = gameplayScreenInfo.name
        countUpAnimation.playerScore.update(gameplayScreenInfo.score)
        countUpAnimation.playerAccuracy.update(gameplayScreenInfo.accuracy)
        countUpAnimation.playerDetailsCurrentCombo.update(gameplayScreenInfo.combo.current)
        countUpAnimation.playerDetailsMaxCombo.update(data.menu.bm.stats.maxCombo)
    } else if (currentState === 7) {
        // Results screen
        const resultsScreenInfo = data.resultsScreen

        let totalAccuracy = resultsScreenInfo[300] * 100 +resultsScreenInfo[100] * 100 / 3 + resultsScreenInfo[50] * 100 / 6
        let totalSum = totalAccuracy / (resultsScreenInfo[300] + resultsScreenInfo[100] + resultsScreenInfo[50] + resultsScreenInfo[0])
        
        playerNameEl.innerText = resultsScreenInfo.name
        countUpAnimation.playerScore.update(resultsScreenInfo.score)
        countUpAnimation.playerAccuracy.update(totalSum)
        countUpAnimation.playerDetailsCurrentCombo.update(resultsScreenInfo.maxCombo)
        countUpAnimation.playerDetailsMaxCombo.update(data.menu.bm.stats.maxCombo)
    }

    if (tempStrains != JSON.stringify(data.menu.pp.strains) && window.strainGraph) {
        tempStrains = JSON.stringify(data.menu.pp.strains)
        if (data.menu.pp.strains) {
            let temp_strains = smooth(data.menu.pp.strains, 5)
			let new_strains = []
			for (let i = 0; i < 60; i++) {
				new_strains.push(temp_strains[Math.floor(i * (temp_strains.length / 60))])
			}
			new_strains = [0, ...new_strains, 0]

			config.data.datasets[0].data = new_strains
			config.data.labels = new_strains
			config.options.scales.y.max = Math.max(...new_strains)
			configProgress.data.datasets[0].data = new_strains
			configProgress.data.labels = new_strains
			configProgress.options.scales.y.max = Math.max(...new_strains)
			window.strainGraph.update()
			window.strainGraphProgress.update()
        } else {
			config.data.datasets[0].data = []
			config.data.labels = []
			configProgress.data.datasets[0].data = []
			configProgress.data.labels = []
			window.strainGraph.update()
			window.strainGraphProgress.update()
		}
    }

    let now = Date.now()
	if (fullTime !== data.menu.bm.time.mp3) { fullTime = data.menu.bm.time.mp3; onepart = 873 / fullTime }
	if (seek !== data.menu.bm.time.current && fullTime && now - last_strain_update > 300) {
		last_strain_update = now
		seek = data.menu.bm.time.current

		if (data.menu.state !== 2) {
			progressChart.style.maskPosition = '-873px 0px'
			progressChart.style.webkitMaskPosition = '-873px 0px'
		}
		else {
			let maskPosition = `${-873 + onepart * seek}px 0px`
			progressChart.style.maskPosition = maskPosition
			progressChart.style.webkitMaskPosition = maskPosition
		}
	}
}

// Configs are for strain graphs
let config = {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			borderColor: 'rgba(245, 245, 245, 0)',
			backgroundColor: 'rgb(109, 111, 115)',
			data: [],
			fill: true,
			stepped: false,
		}]
	},
	options: {
		tooltips: { enabled: false },
		legend: { display: false, },
		elements: { point: { radius: 0 } },
		responsive: false,
		scales: {
			x: { display: false, },
			y: {
				display: false,
				min: 0,
				max: 100
			}
		},
		animation: { duration: 0 }
	}
}

let configProgress = {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			borderColor: 'rgba(245, 245, 245, 0)',
			backgroundColor: 'rgb(48, 54, 63)',
			data: [],
			fill: true,
			stepped: false,
		}]
	},
	options: {
		tooltips: { enabled: false },
		legend: { display: false, },
		elements: { point: { radius: 0 } },
		responsive: false,
		scales: {
			x: { display: false, },
			y: {
				display: false,
				min: 0,
				max: 100
			}
		},
		animation: { duration: 0 }
	}
}