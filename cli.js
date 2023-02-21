#!/usr/bin/env node

import minimist from 'minimist';
import moment from 'moment-timezone';
import fetch from 'node-fetch';

// Help message
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
// if ((!("n" in args) && !("s" in args)) || (!("e" in args) && !("w" in args))) {
//     console.error("ERROR: Must specify both LATITUDE and LONGITUDE.")
//     process.exit(1)
// }
if ("d" in args && (args.d < 0 || args.d > 6)) {
    console.error("ERROR: Day option -d must be 0-6.")
    process.exit(1)
}

// Get user input
const latitude = "n" in args ? args.n : -args.s
const longitude = "e" in args ? args.e : -args.w
const timezone = "z" in args ? args.z : moment.tz.guess()
const day = "d" in args ? args.d : 1
const json = "j" in args

// Make request to Open_Mateo
const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=precipitation_hours`)
const data = await response.json()

// Write output
if (json) {
    console.log(data)
    process.exit(0)
}
if (data.daily.precipitation_hours[day] <= 0) {
    process.stdout.write("You will not need your galoshes ");
} else {
    process.stdout.write("You might need your galoshes ");
}
if (day == 0) {
    console.log("today.")
} else if (day == 1) {
    console.log("tomorrow.")
} else {
    console.log(`in ${day} days.`)
}
