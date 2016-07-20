#!/usr/bin/env node

var fs = require('fs')
var argv = require('yargs').argv
var path = require('path')
var exec = require('child_process').exec

var gulpbuild


module.exports = {
	autogenerate : autogenerate,
	clean	: clean
}

var options = argv._

//---------------------------------------------------------

if(options.indexOf("autogenerate") !== -1) {
	gulpbuild = require(__dirname + "/gulpbuild.js")()
	autogenerate()
}
else if(options.indexOf("clearcache") !== -1) {
	gulpbuild = require(__dirname + "/gulpbuild.js")()
	clean()
}
else if(options.indexOf("new") !== -1) {
	create()
}

//--------------------------------------------------------

function create() {
	console.log("Generating gulp-manifest")
	
	var base = process.cwd().replace(/\\/g, '/')
	if(base !== '') base += '/'
	
	var rs = fs.createReadStream(path.dirname(__filename) + '/gulp-manifest.json')
	var ws = fs.createWriteStream(base + 'gulp-manifest.json')
	rs.pipe(ws)
	
	console.log("Installing required packages... (this could take a minute or two)")
	
	exec("npm install -g gulp", function(){
		exec("npm install --save-dev gulp browserify asset-mate", function(){
			exec("npm install --save-dev babelify vinyl-buffer vinyl-source-stream gulp-uglify gulp-sass gulp-autoprefixer gulp-rename gulp-util", function(){
				exec("npm install --save-dev glob babel-preset-es2015 babel-preset-react async aws-sdk image-size mime yargs through2", function(){
					console.log("PACKAGES INSTALLED")
				})
			})
		})
	})
		
}

function autogenerate() {
	console.log("Autogenerating gulpfile")
	gulpbuild.buildGulpfile()
}


function clean() {
	console.log("Clearing asset-mate cache")
	
	try{
		var base = process.cwd().replace(/\\/g, '/')
		if(base !== '') base += '/'
		
		fs.unlinkSync(base + 'node_modules/asset-mate/modificationsRecord.json')
	}
	catch(err) {
		console.log("Nothing to clear")
		return
	}	
}