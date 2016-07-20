var through = require('through2');
var PluginError = require('gulp-util').PluginError;

module.exports = {
	rewriteStream 		: rewriteStream,
	gulpRewrite 		: gulpRewrite,
	gulpRewriteFiletype : gulpRewriteFiletype
}

//-----------------------------------------------------------

function rewriteStream(replacements) {

	if(!replacements) {
		replacements = {}
	}

	var stream = through.obj(function(data, enc, callback) {
		var replaced = doReplacements(data.toString(), replacements)
		this.push(replaced)
		callback()
	});
  
	return stream;
}


function gulpRewrite (replacements) {

  if(!replacements) {
	replacements = {}
  }
  

  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
	
	if (file.isNull()) {
	  return cb(null, file);
	}
	if (file.isBuffer()) {
	  file.contents = Buffer(doReplacements(file.contents.toString(enc), replacements), enc);
	}
	if (file.isStream()) {
	  file.contents = file.contents.pipe(rewriteStream(replacements));
	}
	cb(null, file);

  });

}

function gulpRewriteFiletype (filetype, replacement) {  

  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
	
	if (file.isNull()) {
	  return cb(null, file);
	}

	var re = new RegExp("[\/\\\\]" + filetype + "[\/\\\\]", "gi")
	file.path = file.path.replace(re, "/" + replacement + "/")
	re = new RegExp("\." + filetype + "$", "gi")
	file.path = file.path.replace(re, "." + replacement)
	cb(null, file);

  });

}

function doReplacements(content, replacements) {
	for(var match in replacements){
		var re = new RegExp(match, 'g')
		content = content.replace(re, replacements[match])
	}
	return content
}


