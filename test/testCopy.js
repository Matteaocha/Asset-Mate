var sinon = require('sinon')
var expect = require('chai').expect

var rimraf = require('rimraf')

var glob = require('glob')
var fs = require('fs')
var path = require('path')
var async = require('async')
var fileStuff = require('../lib/fileStuff.js')()
var rewrite = require('../lib/rewrite.js')()

var manifest = require('./project/gulp-manifest.json')

var copy = require('../lib/copy.js')(manifest, copyDeps)


describe("Copy tests", function(){	

	function fileExists(file){
		try{
			fs.accessSync(file, fs.F_OK)
		}
		catch(err){
			return false
		}
		return true
	}

	
	describe("Builds exclusions list", function(){
	
		it("makes the correct list with an images array", function(){
			var input = {}
			input.directory = ""
			input.js = "js/*"
			input.scss = ["scss1/*", "scss2/*"]
			input.images = [{glob: "i1/*"}, {glob:["i2/*", "i3/*"]}]
			
			var expected = ["js/*", "scss1/*", "scss2/*", "i1/*", "i2/*", "i3/*"]
			var result = copy.buildExclusionsList(input)
			
			expect(result.length).to.equal(expected.length)
			for(var i in expected) {
				expect(result.indexOf(expected[i])).to.not.equal(-1)
			}
		})
		
		it("makes the correct list with an images non-array", function(){
			var input = {}
			input.directory = ""
			input.js = "js/*"
			input.scss = ["scss1/*", "scss2/*"]
			input.images = {glob: ["i1/*", "i2/*"]}
			
			var expected = ["js/*", "scss1/*", "scss2/*", "i1/*", "i2/*"]
			var result = copy.buildExclusionsList(input)
			
			expect(result.length).to.equal(expected.length)
			for(var i in expected) {
				expect(result.indexOf(expected[i])).to.not.equal(-1)
			}
		})

	})	
	
	describe("Copy file", function(){
	
		var file = "test/project/src/doc1.txt"
		var dest = "test/project/src/doccopy.txt"
		
		before(function(done){
			copy.copyFile(file, dest, null, function(){				
				done()
			})
		})
		
		it("successfully copies the file without rewrites", function(){
			expect(fileExists(dest)).to.equal(true)			
		})
		
		after(function(){
			if(fileExists(dest)) fs.unlinkSync(dest)
		})
	
	})
	
	describe("Copy file (rewrites)", function(){
	
		var file = "test/project/src/doc1.txt"
		var dest = "test/project/src/doccopy.txt"
		
		before(function(done){
			copy.copyFile(file, dest, {"REPLACE_ME":"with this"}, function(){				
				done()
			})
		})
		
		it("successfully copies the file with rewrites", function(){
			expect(fileExists(dest)).to.equal(true)			
		})
		
		after(function(){
			if(fileExists(dest)) fs.unlinkSync(dest)
		})
	
	})
	
	describe("Copy", function(){
	
		var omrStub
		var cmrStub
		var fnuStub
		
		before(function(done){
			omrStub = sinon.stub(fileStuff, 'openModificationsRecord')
			omrStub.returns({})
			cmrStub = sinon.stub(fileStuff, 'closeModificationsRecord')
			fnuStub = sinon.stub(fileStuff, 'fileNeedsUpdating')
			fnuStub.returns(true)
			
			copy.copy(0, 0, function(){
				done()
			})
		})
		
		var doc1 = __dirname + '/project/dist_dev/doc1.txt'
		var doc2 = __dirname + '/project/dist_dev/doc2.txt'
		var imagesFolder = __dirname + '/project/dist_dev/images'
		var jsFolder = __dirname + '/project/dist_dev/js'		
		
		it("successfully copies from the manifest", function(){
			expect(fileExists(doc1)).to.equal(true)	
			expect(fileExists(doc1)).to.equal(true)
			expect(!fileExists(imagesFolder)).to.equal(true)	
			expect(fileExists(doc1)).to.equal(true)	
		})
		
		after(function(done){
			var toRemove = __dirname + '/project/dist_dev'
			if(fileExists(toRemove)) rimraf(toRemove, ['rmdir'], function(){
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