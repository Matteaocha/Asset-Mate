var fs
var path
var glob
var async
var amRewrite
var fileStuff

var manifest

var exports = {
	copy : copy,
	copyFile : copyFile,
	buildExclusionsList : buildExclusionsList
}

module.exports = function(gulpManifest, deps) {
	if(deps) {
		fs = deps.fs
		path = deps.path
		glob = deps.glob
		amRewrite = deps.rewrite
		async = deps.async
		fileStuff = deps.fileStuff
	}
	else {
		fs = require('fs')
		path = require('path')
		glob = require('glob')
		async = require('async')
		amRewrite = require(__dirname + '/rewrite.js')()
		fileStuff = require(__dirname + '/fileStuff.js')()
	}

	manifest = gulpManifest
	return exports
}

var fontExts 	= ['.ttf', '.otf', '.woff', '.woff2', '.svg', '.eot']
var audioExts 	= ['.mp3', '.mp4', '.ogg', '.aac', '.wav']
var videoExts 	= ['.webm']
var imageExts 	= ['.jpg', '.jpeg', '.ico', '.gif', '.png', 
					'.svg', '.bmp', '.psd', '.xcf', '.tiff']
var archiveExts	= ['.zip', '.rar', '.bz2', '.tar', '.iso', '.gz']

var allExts = fontExts.concat(audioExts).concat(videoExts).concat(archiveExts)

//-------------------------------------------------


function copy(pkgIndex, destIndex, cb) {

	var src  = manifest[pkgIndex]["src"]
	var dest = manifest[pkgIndex]["dest"][destIndex]
	
	if(!src.copy || (Array.isArray(src.copy) && src.copy.length === 0)) {
		cb()
		return
	}
	
	var exclusions = exports.buildExclusionsList(src)	
	var base = src.directory
	if(base !== "") base += "/"
	
	var copyGlobs = []
	if(Array.isArray(src.copy)) {
		for(var i in src.copy) {
			copyGlobs.push(base + src.copy[i])
		}
	}
	else {
		copyGlobs.push(base + src.copy)
	}
	
	var allFiles = fileStuff.intersect(copyGlobs, exclusions)
	
	if(allFiles.length === 0) {
		cb()
		return
	}
	
	var mRecord = fileStuff.openModificationsRecord()
	
	async.each(allFiles, function(fileIn, cb1) {
	
		var fileOut = fileStuff.getDestPath(fileIn, src.directory, dest.directory)
		fileStuff.mkdirIfNotExist(fileOut)
						
		if(!fileStuff.fileIsDirectory(fileIn)) {
			if(fileStuff.fileNeedsUpdating(mRecord, fileIn, fileOut)) {
				console.log("Copying file: ", fileIn)
				copyFile(fileIn, fileOut, dest.rewrites, cb1)
			}else {
				cb1()
			}
		} else {
			cb1()
		}	

	}, function(err){
		fileStuff.closeModificationsRecord(mRecord)
		if(err) cb(err)
		else cb()
	})
}

function buildExclusionsList(src) {
	var excludes = []
	
	var base = src.directory
	if(base !== "") base += "/"

	if(src.js) {
		if(Array.isArray(src.js)) {
			for(var i in src.js) {
				excludes.push(base + src.js[i])
			}
		}
		else if (src.js !== "") excludes.push(base + src.js)
	}
	if(src.es6) {
		if(Array.isArray(src.es6)) {
			for(var i in src.es6) {
				excludes.push(base + src.es6[i])
			}
		}
		else if (src.es6 !== "") excludes.push(base + src.es6)
	}
	if(src.css) {
		if(Array.isArray(src.css)) {
			for(var i in src.css) {
				excludes.push(base + src.css[i])
			}
		}
		else if (src.css !== "") excludes.push(base + src.css)
	}
	if(src.scss) {
		if(Array.isArray(src.scss)) {
			for(var i in src.scss) {
				excludes.push(base + src.scss[i])
			}
		}
		else if (src.scss !== "") excludes.push(base + src.scss)
	}
	if(src.copyExclude) {
		if(Array.isArray(src.copyExclude)) {
			for(var i in src.copyExclude) {
				excludes.push(base + src.copyExclude[i])
			}
		}
		else if (src.copyExclude !== "") excludes.push(base + src.copyExclude)
	}
	if(src.images){
		if(Array.isArray(src.images)) {
			for(var j in src.images) {
				if(src.images[j].glob && Array.isArray(src.images[j].glob)) {
					for(var i in src.images[j].glob) {
						excludes.push(base + src.images[j].glob[i])
					}
				}
				else if(src.images[j].glob) {
					excludes.push(base + src.images[j].glob)
				}
			}
		}
		else {
			if(src.images.glob && Array.isArray(src.images.glob)) {
				for(var i in src.images.glob) {
					excludes.push(base + src.images.glob[i])
				}
			}
			else if(src.images.glob) {
				excludes.push(base + src.images.glob)
			}
		}		
	}

	return excludes
}

function copyFile(fileIn, fileOut, rewrites, cb) {

	var rs = fs.createReadStream(process.cwd() + '/' + fileIn)
	var ws = fs.createWriteStream(process.cwd() + '/' + fileOut)
	var ext = path.extname(fileIn)
	
	if(rewrites === null || rewrites === {} || allExts.indexOf(ext) !== -1) {
		rs.pipe(ws)
	}
	else {
		rs.pipe(amRewrite.rewriteStream(rewrites)).pipe(ws)
	}
	
	ws.on('close', function(){	
		cb()
	})
}
