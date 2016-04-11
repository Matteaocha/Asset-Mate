var sinon = require('sinon')
var expect = require('chai').expect

var readable = require('stream').Readable
var through = require('through2')

var rewrite = require('../lib/rewrite.js')()


describe("Rewrite tests", function(){	
	
	describe("Rewrite stream", function(){
	
		var rewrites = {"REPLACE_1" : "test1", "REPLACE_2" : "test2"}
		var input = "REPLACE_1 and REPLACE_2"
		var expected = "test1 and test2"

	
		it("rewrites the given stream", function(done){			
			
			var rewriteStream = rewrite.rewriteStream(rewrites)
			
			var inputStream = new readable();
			inputStream._read = function(){
				this.push(input);
				this.push(null);
			}	
			
			var output = ""
			
			var outStream = inputStream.pipe(rewriteStream)
			
			outStream.on('data', function(data){
				output += data.toString()
			})
			
			outStream.on('end', function(data){
				expect(output).to.equal(expected)
				done()
			})
		})

	})	

})