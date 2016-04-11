var sinon = require('sinon')
var expect = require('chai').expect

var glob = require('glob')
var fs = require('fs')
var path = require('path')

var rimraf = require('rimraf')

var fileStuffDeps = {
	glob : glob,
	fs	: fs,
	path : path
}
var fileStuff = require('../lib/fileStuff.js')(fileStuffDeps)


describe("File stuff tests", function(){

	function fileExists(file){
		try{
			fs.accessSync(file, fs.F_OK)
		}
		catch(err){
			return false
		}
		return true
	}

	describe("Intersect", function(){
	
		var allFiles = [
						"src/things",
						"src/things/thing1",
						"src/things/thing2",
						"src/other/thing1",
						"src/other/thing2"
						]
						
		var files1 = ["src/things/thing2"]
		var files2 = ["src/other/thing2"]
		
		var expected = [
						"src/things",
						"src/things/thing1",
						"src/other/thing1"
						]
		var globStub
						
		before(function(){
			globStub = sinon.stub(glob, 'sync')
			globStub.withArgs("*").returns(allFiles)
			globStub.withArgs("1").returns(files1)
			globStub.withArgs("2").returns(files2)
		})
	
		it("Correctly gets the intersection of globs", sinon.test(function(){
			var result = fileStuff.intersect("*", ["1", "2"])
			expect(result.length).to.equal(expected.length)
			for(var i in expected) {
				expect(result.indexOf(expected[i])).to.not.equal(-1)
			}
		}))
		
		after(function(){
			globStub.restore()
		})
	})
	
	describe("Get dest path", function(){
	
		it("produces the right path", sinon.test(function(){
			var src = "test/test1/testfile"
			var base = "test"
			var dest = "test2"
			var expected = "test2/test1/testfile"
			
			var result = fileStuff.getDestPath(src, base, dest)
			expect(result).to.equal(expected)
		}))
		
	})

	describe("Mkdir if not exist", function(){
	
		var file1 = 'test/project/dir1/dir2/image.png'
		var file2 = 'test/project/dir1/dir2'

		
		it("makes the directory when given a file", function(){
			fileStuff.mkdirIfNotExist(file1)
			expect(fileExists(file2)).to.equal(true)
		})
		
		it("makes the directory when given a folder", function(){
			fileStuff.mkdirIfNotExist(file2)
			expect(fileExists(file2)).to.equal(true)
		})
		
		afterEach(function(done){
			if(fileExists('test/project/dir1')) {
				rimraf('test/project/dir1', ['rmdir'], function(){
					done()
				})
			}
		})	
	})	
	
	describe("Modifications record", function(){
	
		var src = __dirname + "/project/src/doc3.txt"
		var dest = "dest"
		
		var recordPath = __dirname + "/../modificationsRecord.json"
	
		it("asserts that the file needs updating", function(done){
			fs.writeFileSync(src, "content")
			var record = fileStuff.openModificationsRecord()
			
			setTimeout(function(){
				fileStuff.fileNeedsUpdating(record, src, dest)
				fs.writeFileSync(src, "content2")
				var fileNeedsUpdating = fileStuff.fileNeedsUpdating(record, src, dest)
				expect(fileNeedsUpdating).to.equal(true)
				done()
			}, 1)
			
		})
		
		/* it("asserts that the file doesn't need updating", function(){
			fs.writeFileSync(src, "content")
			var record = fileStuff.openModificationsRecord()
			fileStuff.fileNeedsUpdating(record, src, dest)
			var fileNeedsUpdating = fileStuff.fileNeedsUpdating(record, src, dest)
			expect(fileNeedsUpdating).to.equal(false)
		}) */
		
		it("Creates the record file", function(){
			fs.writeFileSync(src, "content")
			var record = fileStuff.openModificationsRecord()
			fileStuff.fileNeedsUpdating(record, src, dest)
			fileStuff.closeModificationsRecord(record)
			expect(fileExists(recordPath)).to.equal(true)
		})
		
		/* it("Reads from a closed record", function(){
			fs.writeFileSync(src, "content")
			var record = fileStuff.openModificationsRecord()
			fileStuff.fileNeedsUpdating(record, src, dest)
			fileStuff.closeModificationsRecord(record)
			record = fileStuff.openModificationsRecord()
			var fileNeedsUpdating = fileStuff.fileNeedsUpdating(record, src, dest)
			expect(fileNeedsUpdating).to.equal(false)
		}) */
		
		it("asserts a file is newer when compared with a value", function(){
			fs.writeFileSync(src, "content")
			var lastModified = fileStuff.getLastModifiedTime(src)
			var newer = fileStuff.fileIsNewer(src, lastModified-1)
			expect(newer).to.equal(true)
		})
		
		it("asserts a file is older when compared with a value", function(){
			fs.writeFileSync(src, "content")
			var lastModified = fileStuff.getLastModifiedTime(src)
			var newer = fileStuff.fileIsNewer(src, lastModified+1)
			expect(newer).to.equal(false)
		})
		
		afterEach(function(){
			if(fileExists(recordPath)) fs.unlinkSync(recordPath)
			if(fileExists(src)) fs.unlinkSync(src)
		})
	})

})