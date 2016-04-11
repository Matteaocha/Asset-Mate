#!/usr/bin/env node

var fs = require('fs')
var argv = require('yargs').argv

var gulpbuild = require(__dirname + "/gulpbuild.js")()

var exports = {
	autogenerate : autogenerate,
	clean	: clean
}

module.exports = function(){
	return exports
}

//---------------------------------------------------------

switch(argv.option) {
	case "autogenerate":
		autogenerate()
		break
		
	case "clearcache":
		clean()
		break
		
	case "new":
		clean()
		create()
		break		
	
	default:
		break
}

//--------------------------------------------------------

function create() {
	console.log("Generating gulp-manifest")
	var rs = fs.createReadStream(__dirname + '/gulp-manifest.json')
	var ws = fs.createWriteStream(process.cwd() + '/gulp-manifest.json')
	rs.pipe(ws)
}

function autogenerate() {
	console.log("Autogenerating gulpfile")
	gulpbuild.buildGulpfile()
}


function clean() {
	console.log("Clearing asset-mate cache")
	
	try{
		fs.unlinkSync(__dirname + '/modificationsRecord.json')
	}
	catch(err) {
		console.log("Nothing to clear")
		return
	}	
}