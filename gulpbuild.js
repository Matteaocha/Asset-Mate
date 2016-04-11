var manifest = require(process.cwd() + '/gulp-manifest.json')
var tasks = require(__dirname + '/lib/gulp-tasks.js')(manifest)
var fs = require('fs')
var argv = require('yargs').argv

var exports = {
	determineAction : determineAction,
	buildGulpfile	: buildGulpfile
}

module.exports = function(){
	return exports
}

//---------------------------------------------------------

function determineAction() {
	
	var src = null
	var dest = null
	
	if(argv.src !== null && argv.src !== undefined) {
		if(isNaN(argv.src)){
			for(var i in manifest) {
				if(manifest[i]["name"] && manifest[i]["name"].toLowerCase() === argv.src.toString().toLowerCase()) {
					src = i
					
					if(argv.dest !== null && argv.dest !== undefined){
						if(isNaN(argv.dest)) {
							for(var d in manifest[src]["dest"]) {
								if(manifest[src]["dest"][d]["name"] && manifest[src]["dest"][d]["name"].toLowerCase() === argv.dest.toString().toLowerCase()) {
									dest = d
								}
							}
						}
						else if(manifest[src]["dest"].length > argv.dest && argv.dest >= 0) {
							dest = Math.floor(argv.dest)
						}
					}
				}
			}
		}
		else if (manifest.length > argv.src && argv.src >= 0) {
			src = Math.floor(argv.src)
			if(argv.dest !== null && argv.dest !== undefined){
				if(isNaN(argv.dest)) {
					for(var d in manifest[src]["dest"]) {
						if(manifest[src]["dest"][d]["name"] && manifest[src]["dest"][d]["name"].toLowerCase() === argv.dest.toString().toLowerCase()) {
							dest = d
						}
					}
				}
				else if(manifest[src]["dest"].length > argv.dest && argv.dest >= 0) {
					dest = Math.floor(argv.dest)
				}
			}
		}
	}
	
	return [src, dest]
}

//-------------------------------------------------------------

var gulpfileHeader = ""
gulpfileHeader += "var gulp 		= require('gulp')\n"
gulpfileHeader += "var glob 		= require('glob')\n"
gulpfileHeader += "var babelify 	= require('babelify')\n"
gulpfileHeader += "var browserify 	= require('browserify')\n"
gulpfileHeader += "var buffer 		= require('vinyl-buffer')\n"
gulpfileHeader += "var source 		= require('vinyl-source-stream')\n"
gulpfileHeader += "var uglify 		= require('gulp-uglify')\n"
gulpfileHeader += "var sass 		= require('gulp-sass')\n"
gulpfileHeader += "var autoprefixer = require('gulp-autoprefixer')\n"
gulpfileHeader += "var rename 		= require('gulp-rename')\n"
gulpfileHeader += "var path 		= require('path')\n"
gulpfileHeader += "\n"
gulpfileHeader += "var manifest		= require('./gulp-manifest.json')\n"
gulpfileHeader += "var amTasks		= require('./node_modules/asset-mate/lib/gulp-tasks.js')(manifest)\n"
gulpfileHeader += "var amCopy 		= require('./node_modules/asset-mate/lib/copy.js')(manifest)\n"
gulpfileHeader += "var amRewrite 	= require('./node_modules/asset-mate/lib/rewrite.js')(manifest)\n"
gulpfileHeader += "var amAWS 		= require('./node_modules/asset-mate/lib/aws.js')(manifest)\n"
gulpfileHeader += "var amImages		= require('./node_modules/asset-mate/lib/images.js')(manifest)\n"
gulpfileHeader += "var amBuild		= require('./node_modules/asset-mate/gulpbuild.js')(manifest)\n"
gulpfileHeader += "\n"
gulpfileHeader += "\n"
gulpfileHeader += "//----------------------------------------------------------------\n"
gulpfileHeader += "\n"
gulpfileHeader += "var action 	= amBuild.determineAction()\n"
gulpfileHeader += "var pkg 		= action[0]\n"
gulpfileHeader += "var dest 	= action[1]\n"
gulpfileHeader += "\n"
gulpfileHeader += "var buildTaskName 	= amTasks.buildTaskname(pkg, dest)\n"
gulpfileHeader += "var copyTaskName 	= amTasks.copyTaskname(pkg, dest)\n"
gulpfileHeader += "var imagesTaskName 	= amTasks.imagesTaskname(pkg, dest)\n"
gulpfileHeader += "var deployTaskName 	= amTasks.deployTaskname(pkg, dest)\n"
gulpfileHeader += "var watchTaskName 	= amTasks.watchTaskname(pkg, dest)\n"
gulpfileHeader += "var scriptsTaskName 	= amTasks.scriptsTaskname(pkg, dest)\n"
gulpfileHeader += "var stylesTaskName 	= amTasks.stylesTaskname(pkg, dest)\n"
gulpfileHeader += "\n"
gulpfileHeader += "\n"


var gulpfileFooter = "\n"
gulpfileFooter += "gulp.task('build', [buildTaskName])\n"
gulpfileFooter += "gulp.task('copy', [copyTaskName])\n"
gulpfileFooter += "gulp.task('images', [imagesTaskName])\n" 
gulpfileFooter += "gulp.task('deploy', [deployTaskName])\n"
gulpfileFooter += "gulp.task('scripts', [scriptsTaskName])\n" 
gulpfileFooter += "gulp.task('styles', [stylesTaskName])\n"
gulpfileFooter += "gulp.task('watch', [watchTaskName])\n"
gulpfileFooter += "\n"

function buildGulpfile() {

	var output = gulpfileHeader
	
	output += tasks.build()
	for(var p in manifest) {
		output += tasks.build(p)
		for(var d in manifest[p]["dest"]) {
			output += tasks.build(p, d)
		}
	}
	
	output += tasks.copy()
	for(var p in manifest) {
		output += tasks.copy(p)
		for(var d in manifest[p]["dest"]) {
			output += tasks.copy(p, d)
		}
	}
	
	output += tasks.images()
	for(var p in manifest) {
		output += tasks.images(p)
		for(var d in manifest[p]["dest"]) {
			output += tasks.images(p, d)
		}
	}
	
	output += tasks.deploy()
	for(var p in manifest) {
		output += tasks.deploy(p)
		for(var d in manifest[p]["dest"]) {
			output += tasks.deploy(p, d)
		}
	}
	
	output += tasks.scripts()
	for(var p in manifest) {
		output += tasks.scripts(p)
		for(var d in manifest[p]["dest"]) {
			output += tasks.scripts(p, d)
		}
	}
	
	output += tasks.styles()
	for(var p in manifest) {
		output += tasks.styles(p)
		for(var d in manifest[p]["dest"]) {
			output += tasks.styles(p, d)
		}
	}
	
	output += tasks.watch()
	for(var p in manifest) {
		output += tasks.watch(p)
	}
	
	output += gulpfileFooter
	fs.writeFileSync(process.cwd() + "/gulpfile.js", output)
}


