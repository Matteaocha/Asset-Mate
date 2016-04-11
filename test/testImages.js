var sinon = require('sinon')
var expect = require('chai').expect

var rimraf = require('rimraf')

var glob = require('glob')
var fs = require('fs')
var path = require('path')
var child_process = require('child_process')
var fileStuff = require('../lib/fileStuff.js')()
var imageSize = require('image-size')
var async = require('async')

var imageDeps = {
	glob 			: glob,
	fs				: fs,
	path 			: path,
	child_process 	: child_process,
	fileStuff 		: fileStuff,
	imageSize		: imageSize,
	async 			: async
}

var manifest = require('./project/gulp-manifest.json')

var images = require('../lib/images.js')(manifest, imageDeps)


describe("Images tests", function(){	
	
	describe("File is image", function(){
	
		it("identifies an image", function(){
			expect(images.fileIsImage("house.png")).to.equal(true)
		})
		
		it("identifies a non-image", function(){
			expect(images.fileIsImage("house.txt")).to.equal(false)
		})

	})	
	
	describe("FFMpeg is installed", function(){
	
		var ffmpegError
		
		before(function(done){
			images.ffmpegIsInstalled(function(err){
				if(err) ffmpegError = err
				done()
			})
		})
	
		it("says that is is installed", function(){
			expect(ffmpegError).to.equal(undefined)
		})
	})
	
	describe("Add size to path", function(){
	
		it("makes the correct image destination", function(){
		
			var file = "file.png"
			var size = "med"
			
			var expected = "file_med.png"
		
			var result = images.addSizeToPath(file, size)
			expect(result).to.equal(expected)
		})
	})
	
	describe("Percs to widths", function(){
		
		var mockSizes1 = {
			"big" : "100%",
			"med" : "50%",
		}
		
		var mockSizes2 = {
			"big" : 1,
			"med" : 0.5
		}
		
		var mockSizes3 = {
			"big" : true
		}
		
		var expected = [
			{"name" : "big", "width" : 100},
			{"name" : "med", "width" : 50},
		]
		
		var file = __dirname + '/project/src/images/1/sunrise.png'
	
		it("gets the correct image widths with percentages", function(){
		
			var result = images.percsToWidths(file, mockSizes1)
			expect(result.length).to.equal(expected.length)
			expect(result[0].name).to.equal("big")
			expect(result[0].width).to.equal(100)
			expect(result[1].name).to.equal("med")
			expect(result[1].width).to.equal(50)
		})
		
		it("gets the correct image widths with numbers", function(){
		
			var result = images.percsToWidths(file, mockSizes2)
			expect(result.length).to.equal(expected.length)
			expect(result[0].name).to.equal("big")
			expect(result[0].width).to.equal(100)
			expect(result[1].name).to.equal("med")
			expect(result[1].width).to.equal(50)
		})
		
		it("throws when size type is nonsense", function(){
		
			function test() {
				images.percsToWidths(file, mockSizes3)
			}
			expect(test).to.throw()
		})		
	})	
	
	describe("Process image", function(){
		
		var fileIn = 'test/project/src/images/1/sunrise.png'
		var fileOut = 'test/project/sunrise.png'
		
		var sizes = {
			"big" : "100%",
			"med" : "50%"
		}
		
		var expected1 = 'test/project/sunrise_big.png'
		var expected2 = 'test/project/sunrise_med.png'
		
		function fileExists(file){
			try{
				fs.accessSync(file, fs.F_OK)
			}
			catch(err){
				return false
			}
			return true
		}
		
						
		before(function(done){
			images.processImage(fileIn, fileOut, sizes, function(){
				done()
			})
		})
	
		it("correctly processes the image", function(){
			expect(fileExists(expected1)).to.equal(true)
			expect(fileExists(expected2)).to.equal(true)
		})
		
		after(function(){
			if(fileExists(expected1)) fs.unlinkSync(expected1)
			if(fileExists(expected2)) fs.unlinkSync(expected2)
		})
	})
	
	describe("Images in array", function(){
		
		var omrStub
		var cmrStub
		var fnuStub
		
		function fileExists(file){
			try{
				fs.accessSync(file, fs.F_OK)
			}
			catch(err){
				return false
			}
			return true
		}
		
		var expected1 = __dirname + '/project/dist_dev/images/1/sunrise_size.png'
		var expected2 = __dirname + '/project/dist_dev/images/2/sunrise_size.png'		
						
		before(sinon.test(function(done){
			omrStub = sinon.stub(fileStuff, 'openModificationsRecord')
			omrStub.returns({})
			cmrStub = sinon.stub(fileStuff, 'closeModificationsRecord')
			fnuStub = sinon.stub(fileStuff, 'fileNeedsUpdating')
			fnuStub.returns(true)
			
			images.images(0, 0, function(){
				done()
			})
		}))
	
		it("correctly processes the images listed in the manifest", function(){
			expect(fileExists(expected1)).to.equal(true)
			expect(fileExists(expected2)).to.equal(true)
		})
		
		after(function(done){
			var toRemove = __dirname + '/project/dist_dev'
			if(fileExists(expected1)) rimraf(toRemove, ['rmdir'], function(){
				omrStub.restore()
				cmrStub.restore()
				fnuStub.restore()
				done()
			})
			else {
				omrStub.restore()
				cmrStub.restore()
				fnuStub.restore()
				done()
			}			
		})
	})
	
	describe("Image sources in non-array, with glob array", function(){
		
		var omrStub
		var cmrStub
		var fnuStub
		
		function fileExists(file){
			try{
				fs.accessSync(file, fs.F_OK)
			}
			catch(err){
				return false
			}
			return true
		}
		
		var expected1 = __dirname + '/project/dist_dev/images/1/sunrise_size.png'
		var expected2 = __dirname + '/project/dist_dev/images/2/sunrise_size.png'		
						
		before(sinon.test(function(done){
			omrStub = sinon.stub(fileStuff, 'openModificationsRecord')
			omrStub.returns({})
			cmrStub = sinon.stub(fileStuff, 'closeModificationsRecord')
			fnuStub = sinon.stub(fileStuff, 'fileNeedsUpdating')
			fnuStub.returns(true)
			
			images.images(1, 0, function(){
				done()
			})
		}))
	
		it("correctly processes the images listed in the manifest", function(){
			expect(fileExists(expected1)).to.equal(true)
			expect(fileExists(expected2)).to.equal(true)
		})
		
		after(function(done){
			var toRemove = __dirname + '/project/dist_dev'
			if(fileExists(expected1)) rimraf(toRemove, ['rmdir'], function(){
				omrStub.restore()
				cmrStub.restore()
				fnuStub.restore()
				done()
			})	
			else {
				omrStub.restore()
				cmrStub.restore()
				fnuStub.restore()
				done()
			}
		})
	})

})