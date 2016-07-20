var fs = require('fs')
var path = require('path')
var glob = require('glob')
var async = require('async')
var child_process = require('child_process')
var fileStuff = require(path.dirname(__filename) + '/fileStuff.js')
var imageSize = require('image-size')


module.exports = {
	images : images,
	ffmpegIsInstalled : ffmpegIsInstalled,
	fileIsImage : fileIsImage,
	processImage : processImage,
	percsToWidths : percsToWidths,
	fileIsImage : fileIsImage,
	addSizeToPath : addSizeToPath
}

var imageExts 	= ['.jpg', '.jpeg', '.ico', '.gif', '.png', 
					'.svg', '.bmp', '.psd', '.xcf', '.tiff']

//-------------------------------------------------


function images(manifest, pkgIndex, destIndex, cb) {
	
	var src  = manifest[pkgIndex]["src"]
	var dest = manifest[pkgIndex]["dest"][destIndex]	
	if(!src.images || (Array.isArray(src.images) && src.images.length === 0)) {
		cb()
		return
	}
	
	ffmpegIsInstalled(function(err){
	
		if(err) {
			cb("You need to install ffmpeg in order to process images")
			return
		}
		
		var imagesList = []		
		if(Array.isArray(src.images)) {
			for(var i in src.images) {
				imagesList.push(src.images[i])
			}
		}
		else imagesList.push(src.images)
		
		var mRecord = fileStuff.openModificationsRecord()
		
		async.each(imagesList, function(imageSrc, cb1){
		
			var srcBase = src.directory
			if(srcBase !== "") srcBase += "/"
			
			if(Array.isArray(imageSrc.glob)) {

				async.each(imageSrc.glob, function(fileglob, cb2){
					var allFiles = glob.sync(srcBase + fileglob)
					if(allFiles.length === 0) {
						cb2()
					}
					else {
						imageProcessLoop(allFiles, imageSrc, src, dest, mRecord, cb2)
					}
					
				},
				function(err){
					if(err) cb1(err)
					else cb1()
				})
			}
			else {				
				var allFiles = glob.sync(srcBase + imageSrc.glob)
				if(allFiles.length === 0){
					cb1()
				}
				else {
					imageProcessLoop(allFiles, imageSrc, src, dest, mRecord, cb1)
				}				
			}			
			
		}, function(err){
			if(err) cb(err)
			else {
				console.log("IMAGE PROCESSING FINISHED")
				fileStuff.closeModificationsRecord(mRecord)
				cb()
			}
		})
	
	})
}


function imageProcessLoop(files, imageSrc, src, dest, mRecord, cb) {

	async.each(files, function(file, cb1) {
	
		var fileOut = fileStuff.getDestPath(file, src.directory, dest.directory)
		
		if(!fileStuff.fileIsDirectory(file)) {
		
			var fileNeedsUpdating = imagesNeedUpdating(mRecord, file, fileOut, imageSrc.sizes)
			var isImage = fileIsImage(file)
			
			if(fileNeedsUpdating && isImage) {
				fileStuff.mkdirIfNotExist(fileOut)
				console.log("Processing image: ", file)
				processImage(file, fileOut, imageSrc.sizes, cb1)
			}
			else {
				cb1()
			}
		}	
		else {
			fileStuff.mkdirIfNotExist(fileOut)
			cb1()
		}
	}, function(err){
		if(err) cb(err)
		else cb()
	})
}

function imagesNeedUpdating(mRecord, fileIn, fileOut, sizes){
	
	var needsUpdating = false
	
	for(var size in sizes) {
		var newFileOut = addSizeToPath(fileOut, size)
		if(fileStuff.fileNeedsUpdating(mRecord, fileIn, newFileOut)) needsUpdating = true
	}
	return needsUpdating
}

function ffmpegIsInstalled(cb) {
	child_process.exec('ffmpeg -version', function(error, stdout, stdin){
		if(error) cb("ffmpeg not installed")
		else cb()
	})	
}

function fileIsImage(file) {
	var ext = path.extname(file).toLowerCase()
	return imageExts.indexOf(ext) !== -1
}

function percsToWidths(file, sizes) {

	var output = []
	var imgWidth = imageSize(file).width

	for(var size in sizes) {
	
		var fract
		if(typeof sizes[size] === "number") {
			fract = sizes[size]
		}
		else if (typeof sizes[size] === "string") {
			if(sizes[size].indexOf('%') !== -1) {
				fract = sizes[size].replace(/%/, '')/100
			}
			else {
				fract = sizes[size]
			}
		}		
		else {
			throw new Error("Image size is not understood")
		}
		output.push({
			name: size,
			width: Math.floor(imgWidth*fract)
		})	
	}
	return output
}

function addSizeToPath(file, sizeName) {
	var ext = path.extname(file)
	file = file.slice(0, -1*ext.length)
	file += "_" + sizeName + ext
	return file.replace(/\\/g, '/')
}

function processImage(src, dest, sizes, cb) {

	sizes = percsToWidths(src, sizes)

	async.each(sizes, function(size, cb1){
	
		var base = process.cwd()
		if(base !== "") base += '/'
		
		var fileIn = (base + src).replace(/\\/g, '/')
		var fileOut = (base + addSizeToPath(dest, size.name)).replace(/\\/g, '/')

		var cmd = 	'ffmpeg -i "' + fileIn + '" ' +
					'-vf scale=' + size.width + ':-1 ' +
					'"' + fileOut + '"'
		
		//console.log(cmd)
		
		child_process.exec(cmd, function(err, stdout, stdin){cb1()})
	
	}, function(err){
		if(err) cb(err)
		else cb()
	})
}
