var fs = require('fs')
var glob = require('glob')
var path = require('path')


module.exports = {
	intersect 				: intersect,
	openModificationsRecord : openModificationsRecord,
	closeModificationsRecord : closeModificationsRecord,
	fileIsNewer				: fileIsNewer,
	fileNeedsUpdating		: fileNeedsUpdating,
	getLastModifiedTime		: getLastModifiedTime,
	fileIsDirectory			: fileIsDirectory,
	fileExists				: fileExists,
	getDestPath				: getDestPath,
	mkdirIfNotExist			: mkdirIfNotExist
}

//------------------------------------------------------------


function intersect(all, exclusions) {


	var allFiles = []
	if(Array.isArray(all)) {
		for(var i in all) {			
			var files = glob.sync(all[i])
			for(var f in files) {
				allFiles.push(files[f])
			}
		}
	}
	else {
		allFiles = glob.sync(all)
	}
	
	var exclude = []
	
	exclusions.forEach(function(exclusion, index, array){
		var files = glob.sync(exclusion)

		if(exclusion.match(/\/?\*[^\/]*$/)) {
			files.push(exclusion.replace(/\/?\*[^\/]*$/, ''))
		}

		files.forEach(function(file, index, array){
			var matchIndex = allFiles.indexOf(file)
			if(matchIndex !== -1) {
				allFiles.splice(matchIndex, 1)
			}
		})
	})
	return allFiles
}

function openModificationsRecord() {
	if(fileExists(path.dirname(__filename) + '/../modificationsRecord.json')) return require(path.dirname(__filename) + '/../modificationsRecord.json')
	else return {}
}

function closeModificationsRecord(record) {
	var output = JSON.stringify(record)
	fs.writeFileSync(path.dirname(__filename) + '/../modificationsRecord.json', output)
}



function fileIsNewer(filepath, compareTo) {

	var lastModified = getLastModifiedTime(filepath)

	if(compareTo > lastModified) {
		return false
	}
	else {
		return true
	}
}

function fileNeedsUpdating(record, fileSrc, fileDest) {

	//console.log("FILEIN: " + fileSrc + "   FILEOUT: " + fileDest)

	var lastModified = getLastModifiedTime(fileSrc)
	var destExists = fileExists(fileDest)
	
	if(!destExists) {
		record[fileSrc+ '###' + fileDest] = lastModified
		return true
	}
	
	if(record[fileSrc+ '###' + fileDest]) {	
		if(record[fileSrc+ '###' + fileDest] < lastModified) {
			record[fileSrc+ '###' + fileDest] = lastModified
			return true
		}
		else {
			return false
		}
	}
	else {
		record[fileSrc+ '###' + fileDest] = lastModified
		return true
	}
}


function getLastModifiedTime(filepath) {
	return fs.statSync(filepath).mtime.getTime()	
}

function fileIsDirectory(filepath) {
	return fs.statSync(filepath).isDirectory()
}

function getDestPath(file, basename, destDir) {
	var relativePath = path.relative(basename, file)
	if(destDir !== "") destDir += "/"
	var output = destDir + relativePath
	return output.replace(/\\/g, '/')
}

function mkdirIfNotExist(file) {

	var base = process.cwd()
	if(base !== "") base += '/'
	file = base + file
	file = file.replace(/\\/g, '/')
	file = file.replace(/\/$/g, '')

	if(path.extname(file).length > 0) {
		file = file.replace(/\/?[^\/]+$/, '')
	}
	
	var dirsToMake = []
	
	while(file.length > 0 && !fileExists(file)) {
		var dirToMake = file.match(/\/?([^\/]+)$/)[1]
		dirsToMake.unshift(dirToMake)
		file = file.replace(/\/?[^\/]+$/, '')
	}	
	
	for(var i in dirsToMake) {
		file += "/" + dirsToMake[i]
		fs.mkdirSync(file)
	}

}


function fileExists(filepath) {
	
	try {
		fs.accessSync(filepath, fs.F_OK);
	} catch (e) {
		return false
	}
	return true
}

