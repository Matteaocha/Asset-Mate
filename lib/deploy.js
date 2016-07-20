var aws = require('aws-sdk')
var async = require('async')
var mime = require('mime')
var glob = require('glob')
var path = require('path')
var fs = require('fs')
var fileStuff = require(path.dirname(__filename) + '/fileStuff.js')

module.exports = {
	deploy : deploy,
	isDeployable : isDeployable,
	getDeployableFiles : getDeployableFiles,
	doUpload : doUpload,
	getBucketObjects : getBucketObjects,
	shouldBeUploaded : shouldBeUploaded
}

//------------------------------------------------------------

function deploy(manifest, pkgIndex, destIndex, cb) {

	try{
	
		var dest = manifest[pkgIndex]["dest"][destIndex]
		
		if(!isDeployable(dest)) {
			cb()
			return
		}
	
		var creds = new aws.SharedIniFileCredentials({profile: dest.awsCredentialsProfile});
		aws.config.credentials = creds		
		var s3 = new aws.S3()		
		
		getBucketObjects(s3, dest.s3Bucket, function(err, data){
		
			if(err) {
				cb(err)
				return
			}
			
			var objects = data
			
			try{
				var deployableFiles = getDeployableFiles(dest.directory)
			}
			catch(err){
				cb(err)
				return
			}
			
			var prefix = (dest.s3Prefix === undefined? "" : dest.s3Prefix + "/")
			var cacheControl = (dest.s3CacheControl === undefined? "" : dest.s3CacheControl)
			if(prefix === "/") prefix = ""
			
			async.each(deployableFiles, function(file, cb){
			
				if(shouldBeUploaded(objects, file, prefix)){
					var filekey = prefix + file.key
					doUpload(dest.s3Bucket, file.path, filekey, cacheControl, s3, cb) 
				}
				else {
					cb()
				}				
			},
			function(err) {
				if(err) cb(err)
				else {
					console.log("")
					console.log("DONE DEPLOYING")
					console.log("")
					cb()
				}
			})
		})	
	}
	catch(err) {
		cb(err)
		return
	}
}

function getBucketObjects(s3, bucketName, cb){
	s3.listObjects({Bucket:bucketName}, function(err, data){
	
		if(err) {
			cb(err)
			return
		}
		
		var objects = []
		
		for(var i in data.Contents){
			objects.push({
				key: data.Contents[i].Key, 
				lastModified: (new Date(data.Contents[i].LastModified)).getTime()
			})
		}

		cb(null, objects)
	})
}

function shouldBeUploaded(objects, file, prefix) {

	var fullKey = prefix + file.key
	var lastModified

	for(var i in objects){
		if(objects[i].key === fullKey) {
			lastModified = objects[i].lastModified
			break
		}
	}
	
	if(lastModified === undefined) {
		return true
	}
	else {
		return fileStuff.fileIsNewer(file.path, lastModified)
	}
}

function doUpload(bucket, filePath, key, cacheControl, s3, cb) {
	console.log("Uploading file: ", key)			
			
	var params = {	Bucket: bucket, 
					Key: key, 
					ContentType: mime.lookup(filePath),
					Body: fs.createReadStream(filePath),
					ACL: 'public-read'
				}

	if(cacheControl !== "") {
		params.CacheControl = cacheControl
	}
	
	var options = {}
	
	s3.upload(params, options, function(err, data){
		if(err) cb(err)
		else {
			console.log("Finished uploading: ", key)
			cb()
		}
	})	
}


function isDeployable(dest) {
	if(dest.s3Bucket && dest.awsCredentialsProfile) return true
	return false
}


function getDeployableFiles(directory) {

	var distDirectory = path.normalize(directory)
	if(distDirectory !== "") distDirectory += "/"
	

	var allFiles = glob.sync(distDirectory + '**')
	var result = []
	
	for(var i in allFiles){
		if(!fileStuff.fileIsDirectory(allFiles[i])) {
			var key = path.relative(distDirectory, allFiles[i]).replace(/\\/g, '/')
			result.push({"path" : allFiles[i], "key" : key})
		}		
	}
	return result
}


