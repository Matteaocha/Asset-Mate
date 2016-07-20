var fs = require('fs')
var path = require('path')
var glob = require('glob')
var async = require('async')
var amRewrite = require(path.dirname(__filename) + '/rewrite.js')
var fileStuff = require(path.dirname(__filename) + '/fileStuff.js')

var fontExts 	= ['.ttf', '.otf', '.woff', '.woff2', '.svg', '.eot']
var audioExts 	= ['.mp3', '.mp4', '.ogg', '.aac', '.wav']
var videoExts 	= ['.webm']
var imageExts 	= ['.jpg', '.jpeg', '.ico', '.gif', '.png', 
					'.svg', '.bmp', '.psd', '.xcf', '.tiff']
var archiveExts	= ['.zip', '.rar', '.bz2', '.tar', '.iso', '.gz']

var allExts = fontExts.concat(audioExts).concat(videoExts).concat(archiveExts).concat(imageExts)

module.exports = {
	copy : copy,
	copyFile : copyFile,
	buildExclusionsList : buildExclusionsList
}

//-------------------------------------------------


function copy(manifest, pkgIndex, destIndex, cb) {

	var src  = manifest[pkgIndex]["src"]
	var dest = manifest[pkgIndex]["dest"][destIndex]
	
	if(!src.copy || (Array.isArray(src.copy) && src.copy.length === 0)) {
		cb()
		return
	}
	
	var exclusions = buildExclusionsList(src)	
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

	var exclusionSources = ["js", "es6", "css", "scss", "copyExclude"]

	for(var e=0; e < exclusionSources.length; e++) {
		var excGlob = src[exclusionSources[e]]
		if(excGlob) {
			if(Array.isArray(excGlob)) {
				for(var i in excGlob) {
					excludes.push(base + excGlob[i])
				}
			}
			else if (excGlob !== "") excludes.push(base + excGlob)
		}
	}

	//Do image exclusions separately----------------

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
	
	var rs = fs.createReadStream(fileIn)
	var ws = fs.createWriteStream(fileOut)
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
