var sinon = require('sinon')
var expect = require('chai').expect

var awssdk = require('aws-sdk')
var mime = require('mime')
var async = require('async')
var fileStuff = require('../lib/fileStuff.js')()
var glob = require('glob')
var path = require('path')

var awsDeps = {
	awssdk 			: awssdk,
	mime 			: mime,
	fileStuff 		: fileStuff,
	async			: async,
	glob			: glob,
	path			: path
}

var manifest = require('./project/gulp-manifest.json')

var aws = require('../lib/aws.js')(manifest, awsDeps)


describe("AWS tests", function(){	

	
	describe("Is deployable", function(){
		
		it("determines that the dest is deployable", function(){
			var dest = {}
			dest.s3Bucket = "yay"
			dest.awsCredentialsProfile = "profile"
			
			expect(aws.isDeployable(dest)).to.equal(true)
		})
		
		it("determines that the dest isn't deployable", function(){
			var dest = {}			
			expect(aws.isDeployable(dest)).to.equal(false)
		})
	})	
	
	describe("Get bucket objects", function(){
	
		var objectsReturn = {
			Contents: [
				{
					Key : "test1",
					LastModified : "Sun Apr 10 2016 23:57:35 GMT+0100 (GMT Summer Time)"
				},
				{
					Key: "test2",
					LastModified: "Sun Apr 10 2016 23:58:15 GMT+0100 (GMT Summer Time)"
				}
			]
		}
		
		var expected = [
			{key: "test1", lastModified: 1460329055000},
			{key: "test2", lastModified: 1460329095000}
		]
		
		var s3GoodStub = {
			listObjects: function(bucket, cb){ cb(null, objectsReturn) }
		}
		
		var s3BadStub = {
			listObjects: function(bucket, cb){ cb("ERROR", null) }
		}
		
		it("gives back correctly parsed data", function(done){
			aws.getBucketObjects(s3GoodStub, "", function(err, data){
				expect(err).to.equal(null)
				expect(data.length).to.equal(expected.length)
				expect(data[0].key).to.equal(expected[0].key)
				expect(data[0].lastModified).to.equal(expected[0].lastModified)
				expect(data[1].key).to.equal(expected[1].key)
				expect(data[1].lastModified).to.equal(expected[1].lastModified)
				done()
			})
		})
		
		it("gives an error if it received one", function(done){
			aws.getBucketObjects(s3BadStub, "", function(err, data){
				expect(err).to.not.equal(undefined)
				done()
			})
		})
		
	})
	
	describe("Should be uploaded", function(){
	
		var objects = [
			{key: "prefix/test", lastModified: 20}
		]
		
		var finStub 
		
		beforeEach(function(){
			finStub = sinon.stub(fileStuff, 'fileIsNewer')
		})
		
		it("determines that an out-of-date file should be replaced", sinon.test(function(){
		
			finStub.returns(true)
		
			var file = {key: "test", path: ""}
			var result = aws.shouldBeUploaded(objects, file, "prefix/")
			
			expect(result).to.equal(true)
			
		}))
		
		it("determines that an older file should not be replaced", sinon.test(function(){
		
			finStub.returns(false)
		
			var file = {key: "test", path: ""}
			var result = aws.shouldBeUploaded(objects, file, "prefix/")
			
			expect(result).to.equal(false)
			
		}))
		
		it("determines that an unlisted file should be uploaded", sinon.test(function(){
			var file = {key: "test2", path: ""}
			var result = aws.shouldBeUploaded(objects, file, "prefix/")
			expect(result).to.equal(true)
		}))
		
		afterEach(function(){
			finStub.restore()
		})		
	
	})
	
	/* describe("Get deployable files", function(){
		
		var files = ["test/test1/file", "test/test2/file"]
		
		var directory = "test"
		
		var expected = [
			{path: "test/test1/file", key: "test1/file"},
			{path: "test/test2/file", key: "test2/file"}
		]
		
		var globStub
		var fileStuffStub
		
		before(function(){
			globStub = sinon.stub(glob, 'sync')
			globStub.returns(files)
			fileStuffStub = sinon.stub(fileStuff, 'fileIsDirectory')
			fileStuffStub.returns(false)
		})
		
		it("produces the correct list of keys and paths", function(){
			var result = aws.getDeployableFiles(directory)
			expect(result.length).to.equal(expected.length)
			expect(result[0].path).to.equal(expected[0].path)
			expect(result[0].key).to.equal(expected[0].key)
			expect(result[1].path).to.equal(expected[1].path)
			expect(result[1].key).to.equal(expected[1].key)
		})
		
		after(function(){
			globStub.restore()
			fileStuffStub.restore()
		})
	})
	
	
	describe("Performs an upload from the manifest", function(){
		
		var awsS3Stub
		var awsCredentials
		var gboStub
		var doUploadStub
		
		var bucketObjects = {Contents: []}
		
		var error
		
		var file1src = "test/project/dist/doc.txt"
		var file1key = "prefix/doc.txt"
		var file2src = "test/project/dist/images/sunrise.png"
		var file2key = "prefix/images/sunrise.png"
		
		before(function(done){
			awsS3Stub = sinon.stub(awssdk, 'S3')
			awsS3Stub.returns(function(){})			
			
			awsCredentials = sinon.stub(awssdk, 'SharedIniFileCredentials')
			awsCredentials.returns({})
			
			gboStub = sinon.stub(aws, 'getBucketObjects')
			gboStub.callsArgWith(2, null, bucketObjects)
			
			doUploadStub = sinon.stub(aws, 'doUpload')
			doUploadStub.callsArg(4)
			
			aws.deploy(0, 1, function(err){
				if(err) error = err
				done()
			})
		})
		
		it("Performs an upload from the manifest", sinon.test(function(){
			expect(error).to.equal(undefined)
			sinon.assert.calledThrice(3)
			sinon.assert.calledWith(doUploadStub.firstCall, 'test', file1src, file1key) 
			sinon.assert.calledWith(doUploadStub.secondCall, 'test', file2src, file2key) 
		}))
		
		after(function(){
			awsS3Stub.restore()
			awsCredentials.restore()
			gboStub.restore()
			doUploadStub.restore()
		})		
	}) */

})