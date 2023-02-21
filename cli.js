#!/usr/bin/env node

// Help message
const minimist = require("minimist")
const args = minimist(process.argv)
if (args.h) {
    console.log(`Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE
    -h            Show this help message and exit.
    -n, -s        Latitude: N positive; S negative.
    -e, -w        Longitude: E positive; W negative.
    -z            Time zone: uses tz.guess() from moment-timezone by default.
    -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.
    -j            Echo pretty JSON from open-meteo API and exit.`)
    process.exit(0)
}

// Validate input
for (let k in args) {
    let validArgs = "hnsewzdj"
    if (!validArgs.includes(k)) {
        if (k == "_") { continue }
        console.error(`ERROR: Invalid option: -${k}.`)
        process.exit(1)
    }
}
if ("n" in args && "s" in args) {
    console.error("ERROR: Cannot specify LATITUDE twice.")
    process.exit(1)
}
if ("e" in args && "w" in args) {
    console.log("ERROR: Cannot specify LONGITUDE twice.")
    process.exit(1)
}
if ((!("n" in args) && !("s" in args)) || (!("e" in args) && !("w" in args))) {
    console.error("ERROR: Must specify both LATITUDE and LONGITUDE.")
    process.exit(1)
}
if ("d" in args && (args.d < 0 || args.d > 6)) {
    console.error("ERROR: Day option -d must be 0-6.")
    process.exit(1)
}

// Get user input
const latitude = "n" in args ? args.n : -args.s
const longitude = "e" in args ? args.e : -args.w
const timezone = "z" in args ? args.z : require("moment-timezone").tz.guess()
const day = "d" in args ? args.d : 1
const json = "j" in args
