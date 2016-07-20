var path = require('path')
var fs = require('fs')

module.exports = {
	buildGulpfile	: buildGulpfile,
	build 			: build,
	copy 			: copy,
	deploy 			: deploy,
	images			: images,
	scripts 		: scripts,
	styles 			: styles,	
	watch 			: watch,
	makeTaskname	: makeTaskname
}

//MAIN FILE BUILDER--------------------------------------------

var gulpTaskPrinters = {
	build 			: build,
	copy 			: copy,
	deploy 			: deploy,
	images			: images,
	scripts 		: scripts,
	styles 			: styles,	
	watch 			: watch
}

function fileHeader () {

	var header = ""
	+= "var gulp 		= require('gulp')\n"
	+ "var glob 		= require('glob')\n"
	+ "var babelify 	= require('babelify')\n"
	+ "var browserify 	= require('browserify')\n"
	+ "var buffer 		= require('vinyl-buffer')\n"
	+ "var source 		= require('vinyl-source-stream')\n"
	+ "var uglify 		= require('gulp-uglify')\n"
	+ "var sass 		= require('gulp-sass')\n"
	+ "var autoprefixer = require('gulp-autoprefixer')\n"
	+ "var rename 		= require('gulp-rename')\n"
	+ "var path 		= require('path')\n"
	+ "\n"
	+ "var manifest		= require('./gulp-manifest.json')\n"
	+ "var assetMate	= require('./node_modules/asset-mate/lib')\n"
	+ "\n"
	+ "//----------------------------------------------------------------\n"
	+ "\n"
	+ "var action 	= assetMate.runtime.determineAction(manifest)\n"
	+ "var pkg 		= action[0]\n"
	+ "var dest 	= action[1]\n"
	+ "\n"
	+ "makeTaskName = assetMate.gulpfileBuilder.makeTaskname\n"
	+ "var buildTaskName 	= makeTaskName('build', pkg, dest)\n"
	+ "var copyTaskName 	= makeTaskName('copy', pkg, dest)\n"
	+ "var imagesTaskName 	= makeTaskName('images', pkg, dest)\n"
	+ "var deployTaskName 	= makeTaskName('deploy', pkg, dest)\n"
	+ "var watchTaskName 	= makeTaskName('watch', pkg, dest)\n"
	+ "var scriptsTaskName 	= makeTaskName('scripts', pkg, dest)\n"
	+ "var stylesTaskName 	= makeTaskName('styles', pkg, dest)\n"
	+ "\n"
	+ "\n"

	return header
}

function fileFooter () {
	var footer = "\n"
	+ "gulp.task('build', [buildTaskName])\n"
	+ "gulp.task('copy', [copyTaskName])\n"
	+ "gulp.task('images', [imagesTaskName])\n" 
	+ "gulp.task('deploy', [deployTaskName])\n"
	+ "gulp.task('scripts', [scriptsTaskName])\n" 
	+ "gulp.task('styles', [stylesTaskName])\n"
	+ "gulp.task('watch', [watchTaskName])\n"
	+ "\n"

	return footer
}


function buildGulpfile (manifest) {

	var output = fileHeader()

	var gulpTasks = ["build", "copy", "images", "deploy", "scripts", "styles"]

	for(var i=0; i < gulpTasks.length; i++) {

		taskPrinter = gulpTaskPrinters[gulpTasks[i]]

		output += taskPrinter()
		for(var p in manifest) {
			output += taskPrinter(p)
			for(var d in manifest[p]["dest"]) {
				output += taskPrinter(p, d)
			}
		}
	}
	
	output += tasks.watch()
	for(var p in manifest) {
		output += tasks.watch(p)
	}
	
	output += fileFooter()
	var base = process.cwd()
	if(base !== "") base += '/'
	fs.writeFileSync(base + "gulpfile.js", output)
}

//HELPERS---------------------------------------------

function printSubTaskCommands (taskName, manifest, pkgIndex, destIndex) {

	if(pkgIndex === null || pkgIndex === undefined) {
		var taskList = "["
		
		manifest.forEach(function(pkg, pkgIndex, array){
			taskList += "'" + makeTaskName(taskName, pkgIndex) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + makeTaskName(taskName) + "', " + taskList + ')\n'
	}
	
	if(destIndex === null || destIndex === undefined) {
		var taskList = "["
		
		manifest[pkgIndex]["dest"].forEach(function(dest, d, array){
			taskList += "'" + makeTaskName(taskName, pkgIndex, d) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + makeTaskName(taskName, pkgIndex) + "', " + taskList + ')\n'
	}

	return null
}

function amModuleTask (taskName, manifest, pkgIndex, destIndex) {
	var subTaskCommands = printSubTaskCommands (taskName, manifest, pkgIndex, destIndex)
	if(subTaskCommands) return subTaskCommands
	
	var task = "gulp.task('" + makeTaskName(taskName, pkgIndex, destIndex) + "', function(done){\n"
	
	task +=	"\t assetMate." + taskName + "." + taskName + "(manifest, " + pkgIndex + ", " + destIndex + ", done)\n"
	task += "})\n\n"
	
	return  task
}

function getGlobArray (scriptType, manifest, pkgIndex) {

	var output = "["

	if(manifest[pkgIndex]["src"][scriptType]) {
		var globs = manifest[pkgIndex]["src"][scriptType]
		if(Array.isArray(globs) && globs.length > 0) {
			globs.forEach(function(glob, i, a){
				output += "'" + base + glob.replace(/\\/g, '/') + "',"
			})
			output = output.slice(0, -1)
		}
		else if (globs !== "") {
			output += "'" + base + globs.replace(/\\/g, '/') + "'"
		}
	}

	return output + "]"
}

//BUILD TASK------------------------------------------------------

function build(manifest, pkgIndex, destIndex) {

	var subTaskCommands = printSubTaskCommands ("build", manifest, pkgIndex, destIndex)
	if(subTaskCommands) return subTaskCommands
	
	var tasks = "["
	
	tasks += "'" + makeTaskName('scripts', pkgIndex, destIndex) + "',"
	tasks += "'" + makeTaskName('styles', pkgIndex, destIndex) + "',"
	tasks += "'" + makeTaskName('copy', pkgIndex, destIndex) + "',"
	tasks += "'" + makeTaskName('images', pkgIndex, destIndex) + "',"
	
	tasks = tasks.slice(0, -1)
	tasks += "]"
	return "gulp.task('" + makeTaskName('build', pkgIndex, destIndex) + "', " + tasks + ')\n\n'
}

//AM MODULE TASKS---------------------------------------------------

function copy(manifest, pkgIndex, destIndex) {
	return amModuleTask("copy", manifest, pkgIndex, destIndex)
}

function images(manifest, pkgIndex, destIndex) {
	return amModuleTask("images", manifest, pkgIndex, destIndex)
}

function deploy(manifest, pkgIndex, destIndex) {
	return amModuleTask("deploy", manifest, pkgIndex, destIndex)
}


//SCRIPTS & STYLES ----------------------------------------------


function scripts(manifest, pkgIndex, destIndex) {

	var subTaskCommands = printSubTaskCommands ("scripts", manifest, pkgIndex, destIndex)
	if(subTaskCommands) return subTaskCommands
	
	//-----------------------------------------------------------------
	
	var destDir = manifest[pkgIndex]["dest"][destIndex]["directory"].replace(/\\/g, '/')
	var rewrites = manifest[pkgIndex]["dest"][destIndex]["rewrites"]
	var src = manifest[pkgIndex]["src"]["directory"].replace(/\\/g, '/')
	var base = src
	if(base !== "") base += '/'
	
	var jsGlob  = getGlobArray("js", manifest, pkgIndex)
	var es6Glob = getGlobArray("es6", manifest, pkgIndex)
	
	var minify = manifest[pkgIndex]["dest"][destIndex]["minify"]	
	
	var task = "gulp.task('" + makeTaskName('scripts', pkgIndex, destIndex) + "', function () {\n\n"
	
		task += "\t var srcDir = '" + src + "'\n"
		task += "\t var destDir = '" + destDir + "'\n"
		task += "\t var jsSrcs = " + jsGlob + "\n"
		task += "\t var es6Srcs = " + es6Glob + "\n"
		task += "\n"

		if(jsGlob !== "[]") {
			task += "\n"
			task += "\t jsSrcs.forEach(function(fileGlob, index, array){\n"
			task += "\t\t gulp.src(fileGlob, {base : srcDir})\n"
			
			if(rewrites) {
				task += "\t\t .pipe(assetMate.rewrite.rewrite(" + JSON.stringify(rewrites) +"))\n"
			}			
			if(minify) {
				task += "\t\t .pipe(uglify())\n"
				task += "\t\t .pipe(rename(function(path){\n"
				task +=	"\t\t path.extname = '.min.js'\n"
				task += "\t\t }))\n"
			}			
			task += "\t\t .pipe(gulp.dest(destDir))\n"
			task += "\t })\n"
		}
	
		if(es6Glob !== "[]") {
			task += "\n"
			task += "\t es6Srcs.forEach(function(fileGlob, index, array){\n"
				task += "\t\t glob.sync(fileGlob).forEach(function(file, index, array){\n"
					task += "\n"
					task += "\t\t\t var destRelative = path.relative(srcDir, file).replace(/\\\\/g, '/').replace(/\\/?[^\\/]+$/, '')\n"
					task += "\t\t\t if(!(destRelative === '' || destDir === '')) destRelative = '/' + destRelative\n"
					task += "\n"
					task += "\t\t\t browserify(file).transform('babelify',{presets: ['es2015', 'react']})\n"
					task += "\t\t\t .bundle()\n"
					task += "\t\t\t .on('error', function (err) { console.error(err) })\n"
					task += "\t\t\t .pipe(source(path.basename(file)))\n"
					task += "\t\t\t .pipe(buffer())\n"
					if(rewrites) {
					task += "\t\t\t .pipe(assetMate.rewrite.rewrite(" + JSON.stringify(rewrites) +"))\n"	
					}							
					if(minify) {
					task += "\t\t\t .pipe(uglify())\n"
					task += "\t\t\t .pipe(rename(function(path){\n"
					task += "\t\t\t\t path.extname = '.min.js'\n"
					task += "\t\t\t }))\n"
					}			
					task += "\t\t\t .pipe(gulp.dest(destDir + destRelative))\n"
			task += "\t\t })\n"
			task += "\t })\n"
		}
	task += "})\n\n"
	return task
}



function styles(manifest, pkgIndex, destIndex) {

	var subTaskCommands = printSubTaskCommands ("styles", manifest, pkgIndex, destIndex)
	if(subTaskCommands) return subTaskCommands
	
	//---------------------------------------------------------------

	var destDir = manifest[pkgIndex]["dest"][destIndex]["directory"].replace(/\\/g, '/')
	var rewrites = manifest[pkgIndex]["dest"][destIndex]["rewrites"]
	var src = manifest[pkgIndex]["src"]["directory"].replace(/\\/g, '/')
	var autoprefix = manifest[pkgIndex]["dest"][destIndex]["autoprefix"]	
	
	var base = src
	if(base!== '') base += '/'
	
	var cssGlob  = getGlobArray("css", manifest, pkgIndex)
	var scssGlob = getGlobArray("scss", manifest, pkgIndex)
	
	
	var task = "gulp.task('" + makeTaskName('styles', pkgIndex, destIndex) + "', function () {\n\n"
	
		task += "\t var srcDir = '" + src + "'\n"
		task += "\t var destDir = '" + destDir + "'\n"
		task += "\t var cssSrcs = " + cssGlob + "\n"
		task += "\t var scssSrcs = " + scssGlob + "\n"
		task += "\n"

		if(cssGlob !== "[]") {
			task += "\n"
			task += "\t cssSrcs.forEach(function(fileGlob, index, array){\n"
			task += "\t\t gulp.src(fileGlob, {base : srcDir})\n"
			
			if(rewrites) {
				task += "\t\t .pipe(assetMate.rewrite.rewrite(" + JSON.stringify(rewrites) +"))\n"
			}			
			if(autoprefix === undefined || autoprefix) {
				task += "\t\t .pipe(autoprefixer({\n"
					task +=	"\t\t\t browsers: ['last 10 versions'],\n"
					task +=	"\t\t\t cascade: false\n"
				task += "\t\t }))\n"
			}			
			task += "\t\t .pipe(gulp.dest(destDir))\n"
			task += "\t })\n"			
		}
		
		if(scssGlob !== "[]") {
			task += "\n"
			task += "\t scssSrcs.forEach(function(fileGlob, index, array){\n"
			task += "\t\t gulp.src(fileGlob, {base : srcDir})\n"
			task += "\t\t .pipe(sass().on('error', sass.logError))\n"
			if(rewrites) {
				task += "\t\t .pipe(assetMate.rewrite.rewrite(" + JSON.stringify(rewrites) +"))\n"
			}			
			if(autoprefix === undefined || autoprefix) {
				task += "\t\t .pipe(autoprefixer({\n"
					task +=	"\t\t\t browsers: ['last 10 versions'],\n"
					task +=	"\t\t\t cascade: false\n"
				task += "\t\t }))\n"
			}			
			task += "\t\t .pipe(assetMate.rewrite.rewriteFiletype('scss', 'css'))\n"
			task += "\t\t .pipe(gulp.dest(destDir))\n"
			task += "\t })\n"
		}
		
		
	task += "})\n\n"
	return task
}


//WATCHING-------------------------------------------------

function watchTask(taskName, fileExt, taskList, pkgSrc) {
	var output = ""
	var extMatch = new RegExp("\." + fileExt, '')	

	if(pkgSrc[taskName]) {				
		if(Array.isArray(pkgSrc[taskName]) && pkgSrc[taskName].length > 0){
			for(var i in pkgSrc[taskName]) {				
				output += "\t gulp.watch('" + base + pkgSrc[taskName][i].replace(extMatch, '*') + "', " + taskList + ")\n"
			}
		}
		else {
			if(pkgSrc[taskName] !== "") output += "\t gulp.watch('" + base + pkgSrc[taskName].replace(extMatch, '*')  + "', " + taskList + ")\n"
		}			
	}
	return output
}

function watch(manifest, pkgIndex) {	

	if(pkgIndex === null || pkgIndex === undefined) {
		var taskList = "["
		
		manifest.forEach(function(pkg, pkgIndex, array){
			taskList += "'" + makeTaskName('watch', pkgIndex) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + makeTaskName('watch', ) + "', " + taskList + ')\n'
	}
	
	
	var task = "gulp.task('" + makeTaskName('watch', pkgIndex) + "', function(){\n"
	
	var src = manifest[pkgIndex]["src"]
	var base = src["directory"]
	if(base !== '') base += '/'
	
	manifest.forEach(function(pkg, pkgIndex, array){		
	
		var scriptsTasks = "['" + makeTaskName('scripts', pkgIndex) + "']"
		var stylesTasks = "['" + makeTaskName('styles', pkgIndex) + "']"
		
		task += watchTask("js", "js", scriptsTasks, src)
		task += watchTask("es6", "js", scriptsTasks, src)
		task += watchTask("css", "css", stylesTasks, src)
		task += watchTask("scss", "scss", stylesTasks, src)
	
	})
	
	task += "})\n\n"
	
	return  task

}

//--------------------------------------------------------------------

function makeTaskName (taskType, pkgIndex, destIndex) {
	if(pkgIndex === null || pkgIndex === undefined) return taskType + "_all"
	if(destIndex === null || destIndex === undefined) return taskType + "_" + pkgIndex
	return taskType + "_" + pkgIndex + "_" + destIndex
}