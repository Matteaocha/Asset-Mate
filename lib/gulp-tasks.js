var amCopy
var amRewrite
var amAWS
var path = require('path')

var manifest

var exports = {
	build 			: build,
	copy 			: copy,
	deploy 			: deploy,
	images			: images,
	scripts 		: scripts,
	styles 			: styles,	
	watch 			: watch,
	buildTaskname	: buildTaskname,
	copyTaskname	: copyTaskname,
	deployTaskname	: deployTaskname,
	imagesTaskname	: imagesTaskname,
	scriptsTaskname	: scriptsTaskname,
	stylesTaskname	: stylesTaskname,
	watchTaskname	: watchTaskname
}

module.exports = function(gulpManifest) {
	manifest 	= gulpManifest
	amCopy 		= require(path.dirname(__filename) + '/copy.js')(manifest)
	amRewrite 	= require(path.dirname(__filename) + '/rewrite.js')(manifest)
	amAWS 		= require(path.dirname(__filename) + '/aws.js')(manifest)
	amImages	= require(path.dirname(__filename) + '/images.js')(manifest)
	return exports
}



function build(pkgIndex, destIndex) {

	if(pkgIndex === null || pkgIndex === undefined) {
		var taskList = "["
		
		manifest.forEach(function(pkg, pkgIndex, array){
			taskList += "'" + buildTaskname(pkgIndex) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + buildTaskname() + "', " + taskList + ')\n'
	}
	
	if(destIndex === null || destIndex === undefined) {
		var taskList = "["
		
		manifest[pkgIndex]["dest"].forEach(function(dest, d, array){
			taskList += "'" + buildTaskname(pkgIndex, d) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + buildTaskname(pkgIndex) + "', " + taskList + ')\n'
	}
	
	var tasks = "["
	
	tasks += "'" + scriptsTaskname(pkgIndex, destIndex) + "',"
	tasks += "'" + stylesTaskname(pkgIndex, destIndex) + "',"
	tasks += "'" + copyTaskname(pkgIndex, destIndex) + "',"
	tasks += "'" + imagesTaskname(pkgIndex, destIndex) + "',"
	
	tasks = tasks.slice(0, -1)
	tasks += "]"
	return "gulp.task('" + buildTaskname(pkgIndex, destIndex) + "', " + tasks + ')\n\n'
}

function copy(pkgIndex, destIndex) {

	if(pkgIndex === null || pkgIndex === undefined) {
		var taskList = "["
		
		manifest.forEach(function(pkg, pkgIndex, array){
			taskList += "'" + copyTaskname(pkgIndex) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + copyTaskname() + "', " + taskList + ')\n'
	}
	
	if(destIndex === null || destIndex === undefined) {
		var taskList = "["
		
		manifest[pkgIndex]["dest"].forEach(function(dest, d, array){
			taskList += "'" + copyTaskname(pkgIndex, d) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + copyTaskname(pkgIndex) + "', " + taskList + ')\n'
	}
	
	var task = "gulp.task('" + copyTaskname(pkgIndex, destIndex) + "', function(done){\n"
	
	task +=	"\t amCopy.copy(" + pkgIndex + ", " + destIndex + ", done)\n"
	task += "})\n\n"
	
	return  task
}


function images(pkgIndex, destIndex) {

	if(pkgIndex === null || pkgIndex === undefined) {
		var taskList = "["
		
		manifest.forEach(function(pkg, pkgIndex, array){
			taskList += "'" + imagesTaskname(pkgIndex) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + imagesTaskname() + "', " + taskList + ')\n'
	}
	
	if(destIndex === null || destIndex === undefined) {
		var taskList = "["
		
		manifest[pkgIndex]["dest"].forEach(function(dest, d, array){
			taskList += "'" + imagesTaskname(pkgIndex, d) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + imagesTaskname(pkgIndex) + "', " + taskList + ')\n'
	}
	
	var task = "gulp.task('" + imagesTaskname(pkgIndex, destIndex) + "', function(done){\n"
	
	task +=	"\t amImages.images(" + pkgIndex + ", " + destIndex + ", done)\n"
	task += "})\n\n"
	
	return  task
}


function deploy(pkgIndex, destIndex) {

	if(pkgIndex === null || pkgIndex === undefined) {
		var taskList = "["
		
		manifest.forEach(function(pkg, pkgIndex, array){
			taskList += "'" + deployTaskname(pkgIndex) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + deployTaskname() + "', " + taskList + ')\n'
	}
	
	if(destIndex === null || destIndex === undefined) {
		var taskList = "["
		
		manifest[pkgIndex]["dest"].forEach(function(dest, d, array){
			taskList += "'" + deployTaskname(pkgIndex, d) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + deployTaskname(pkgIndex) + "', " + taskList + ')\n'
	}
	
	var task = "gulp.task('" + deployTaskname(pkgIndex, destIndex) + "', function(done){\n"
	
	task +=	"\t amAWS.deploy(" + pkgIndex + ", " + destIndex + ", done)\n"
	task += "})\n\n"
	
	return  task
}



function scripts(pkgIndex, destIndex) {

	if(pkgIndex === null || pkgIndex === undefined) {
		var taskList = "["
		
		manifest.forEach(function(pkg, pkgIndex, array){
			taskList += "'" + scriptsTaskname(pkgIndex) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + scriptsTaskname() + "', " + taskList + ')\n'
	}
	
	if(destIndex === null || destIndex === undefined) {
		var taskList = "["
		
		manifest[pkgIndex]["dest"].forEach(function(dest, d, array){
			taskList += "'" + scriptsTaskname(pkgIndex, d) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + scriptsTaskname(pkgIndex) + "', " + taskList + ')\n'
	}
	
	//-----------------------------------------------------------------
	
	var destDir = manifest[pkgIndex]["dest"][destIndex]["directory"].replace(/\\/g, '/')
	var rewrites = manifest[pkgIndex]["dest"][destIndex]["rewrites"]
	var src = manifest[pkgIndex]["src"]["directory"].replace(/\\/g, '/')
	
	var jsGlob  = "["
	var es6Glob = "["
	
	if(manifest[pkgIndex]["src"]["js"]) {
		var js = manifest[pkgIndex]["src"]["js"]
		if(Array.isArray(js) && js.length > 0) {
			js.forEach(function(glob, i, a){
				jsGlob += "'" + src + "/" + glob.replace(/\\/g, '/') + "',"
			})
			jsGlob = jsGlob.slice(0, -1)
		}
		else if (js !== "") {
			jsGlob += "'" + src + "/" + js.replace(/\\/g, '/') + "'"
		}
	}
	jsGlob += "]"
	
	if(manifest[pkgIndex]["src"]["es6"]) {
		var es6 = manifest[pkgIndex]["src"]["es6"]
		if(Array.isArray(es6) && es6.length > 0) {
			es6.forEach(function(glob, i, a){
				es6Glob += "'" + src + "/" + glob.replace(/\\/g, '/') + "',"
			})
			es6Glob = es6Glob.slice(0, -1)
		}
		else if (es6 !== "") {
			es6Glob += "'" + src + "/" + es6.replace(/\\/g, '/') + "'"
		}
	}
	es6Glob += "]"
	
	var minify = manifest[pkgIndex]["dest"][destIndex]["minify"]	
	
	var task = "gulp.task('" + scriptsTaskname(pkgIndex, destIndex) + "', function () {\n\n"
	
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
				task += "\t\t .pipe(amRewrite.gulpRewrite(" + JSON.stringify(rewrites) +"))\n"
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
					task += "\t\t\t var destRelative = path.relative(srcDir, file).replace(/\\/?[^\\/]+$/, '')\n"
					task += "\n"
					task += "\t\t\t browserify(file).transform('babelify',{presets: ['es2015']})\n"
					task += "\t\t\t .bundle()\n"
					task += "\t\t\t .on('error', function (err) { console.error(err) })\n"
					task += "\t\t\t .pipe(source(path.basename(file)))\n"
					task += "\t\t\t .pipe(buffer())\n"
					if(rewrites) {
					task += "\t\t\t .pipe(amRewrite.gulpRewrite(" + JSON.stringify(rewrites) +"))\n"	
					}							
					if(minify) {
					task += "\t\t\t .pipe(uglify())\n"
					task += "\t\t\t .pipe(rename(function(path){\n"
					task += "\t\t\t\t path.extname = '.min.js'\n"
					task += "\t\t\t }))\n"
					}			
					task += "\t\t\t .pipe(gulp.dest(destDir + '/' + destRelative))\n"
			task += "\t\t })\n"
			task += "\t })\n"
		}
	task += "})\n\n"
	return task
}



function styles(pkgIndex, destIndex) {

	if(pkgIndex === null || pkgIndex === undefined) {
		var taskList = "["
		
		manifest.forEach(function(pkg, pkgIndex, array){
			taskList += "'" + stylesTaskname(pkgIndex) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + stylesTaskname() + "', " + taskList + ')\n'
	}
	
	if(destIndex === null || destIndex === undefined) {
		var taskList = "["
		
		manifest[pkgIndex]["dest"].forEach(function(dest, d, array){
			taskList += "'" + stylesTaskname(pkgIndex, d) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + stylesTaskname(pkgIndex) + "', " + taskList + ')\n'
	}
	
	//---------------------------------------------------------------

	var destDir = manifest[pkgIndex]["dest"][destIndex]["directory"].replace(/\\/g, '/')
	var rewrites = manifest[pkgIndex]["dest"][destIndex]["rewrites"]
	var src = manifest[pkgIndex]["src"]["directory"].replace(/\\/g, '/')
	var autoprefix = manifest[pkgIndex]["dest"][destIndex]["autoprefix"]	
	
	var cssGlob  = "["
	var scssGlob = "["
	
	if(manifest[pkgIndex]["src"]["css"]) {
		var css = manifest[pkgIndex]["src"]["css"]
		if(Array.isArray(css) && css.length > 0) {
			css.forEach(function(glob, i, a){
				cssGlob += "'" + src + "/" + glob.replace(/\\/g, '/') + "',"
			})
			cssGlob = cssGlob.slice(0, -1)
		}
		else if (css !== "") {
			cssGlob += "'" + src + "/" + css.replace(/\\/g, '/') + "'"
		}
	}
	cssGlob += "]"
	
	if(manifest[pkgIndex]["src"]["scss"]) {
		var scss = manifest[pkgIndex]["src"]["scss"]
		if(Array.isArray(scss) && scss.length > 0) {
			scss.forEach(function(glob, i, a){
				scssGlob += "'" + src + "/" + glob.replace(/\\/g, '/') + "',"
			})
			scssGlob = scssGlob.slice(0, -1)
		}
		else if (scss !== "") {
			scssGlob += "'" + src + "/" + scss.replace(/\\/g, '/') + "'"
		}
	}
	scssGlob += "]"
	
	
	var task = "gulp.task('" + stylesTaskname(pkgIndex, destIndex) + "', function () {\n\n"
	
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
				task += "\t\t .pipe(amRewrite.gulpRewrite(" + JSON.stringify(rewrites) +"))\n"
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
				task += "\t\t .pipe(amRewrite.gulpRewrite(" + JSON.stringify(rewrites) +"))\n"
			}			
			if(autoprefix === undefined || autoprefix) {
				task += "\t\t .pipe(autoprefixer({\n"
					task +=	"\t\t\t browsers: ['last 10 versions'],\n"
					task +=	"\t\t\t cascade: false\n"
				task += "\t\t }))\n"
			}			
			task += "\t\t .pipe(amRewrite.gulpRewriteFiletype('scss', 'css'))\n"
			task += "\t\t .pipe(gulp.dest(destDir))\n"
			task += "\t })\n"
		}
		
		
	task += "})\n\n"
	return task
}


function watch(pkgIndex) {	

	if(pkgIndex === null || pkgIndex === undefined) {
		var taskList = "["
		
		manifest.forEach(function(pkg, pkgIndex, array){
			taskList += "'" + watchTaskname(pkgIndex) + "',"
		})
		taskList = taskList.slice(0, -1)
		taskList += "]"
		
		return "gulp.task('" + watchTaskname() + "', " + taskList + ')\n'
	}
	
	
	var task = "gulp.task('" + watchTaskname(pkgIndex) + "', function(){\n"
	
	var src = manifest[pkgIndex]["src"]
	
	manifest.forEach(function(pkg, pkgIndex, array){		
	
		var scriptsTasks = "['" + scriptsTaskname(pkgIndex) + "']"
		var stylesTasks = "['" + stylesTaskname(pkgIndex) + "']"
		
		if(src.js) {			
			if(Array.isArray(src.js) && src.js.length > 0){
				for(var i in src.js) {
					task += "\t gulp.watch('" + src.js[i] + "', " + scriptsTasks + ")\n"
				}
			}
			else {
				if(src.js !== "") task += "\t gulp.watch('" + src.js + "', " + scriptsTasks + ")\n"
			}			
		}
		
		if(src.es6) {			
			if(Array.isArray(src.es6) && src.es6.length > 0){
				for(var i in src.es6) {
					task += "\t gulp.watch('" + src.es6[i] + "', " + sciptsTasks + ")\n"
				}
			}
			else {
				if(src.es6 !== "") task += "\t gulp.watch('" + src.es6 + "', " + scriptsTasks + ")\n"
			}			
		}
		
		if(src.css) {			
			if(Array.isArray(src.css) && src.css.length > 0){
				for(var i in src.css) {
					task += "\t gulp.watch('" + src.css[i] + "', " + stylesTasks + ")\n"
				}
			}
			else {
				if(src.css !== "") task += "\t gulp.watch('" + src.css + "', " + stylesTasks + ")\n"
			}			
		}
		
		if(src.scss) {			
			if(Array.isArray(src.scss) && src.scss.length > 0){
				for(var i in src.scss) {
					task += "\t gulp.watch('" + src.scss[i] + "', " + stylesTasks + ")\n"
				}
			}
			else {
				if(src.scss !== "") task += "\t gulp.watch('" + src.scss + "', " + stylesTasks + ")\n"
			}			
		}

	
	})
	
	task += "})\n\n"
	
	return  task

}

//--------------------------------------------------------------------


function buildTaskname(pkgIndex, destIndex) {
	if(pkgIndex === null || pkgIndex === undefined) return "build_all"
	if(destIndex === null || destIndex === undefined) return "build_" + pkgIndex
	return "build_" + pkgIndex + "_" + destIndex
}


function copyTaskname(pkgIndex, destIndex) {
	if(pkgIndex === null || pkgIndex === undefined) return "copy_all"
	if(destIndex === null || destIndex === undefined) return "copy_" + pkgIndex
	return "copy_" + pkgIndex + "_" + destIndex
}

function deployTaskname(pkgIndex, destIndex) {
	if(pkgIndex === null || pkgIndex === undefined) return "deploy_all"
	if(destIndex === null || destIndex === undefined) return "deploy_" + pkgIndex
	return "deploy_" + pkgIndex + "_" + destIndex
}

function imagesTaskname(pkgIndex, destIndex) {
	if(pkgIndex === null || pkgIndex === undefined) return "images_all"
	if(destIndex === null || destIndex === undefined) return "images_" + pkgIndex
	return "images_" + pkgIndex + "_" + destIndex
}

function scriptsTaskname(pkgIndex, destIndex) {
	if(pkgIndex === null || pkgIndex === undefined) return "scripts_all"
	if(destIndex === null || destIndex === undefined) return "scripts_" + pkgIndex
	return "scripts_" + pkgIndex + "_" + destIndex
}

function stylesTaskname(pkgIndex, destIndex) {
	if(pkgIndex === null || pkgIndex === undefined) return "styles_all"
	if(destIndex === null || destIndex === undefined) return "styles_" + pkgIndex
	return "styles_" + pkgIndex + "_" + destIndex
}

function watchTaskname(pkgIndex, destIndex) {
	if(pkgIndex === null || pkgIndex === undefined) return "watch_all"
	if(destIndex === null || destIndex === undefined) return "watch_" + pkgIndex
	return "watch_" + pkgIndex + "_" + destIndex
}