var path = require('path')
var argv = require('yargs').argv

module.exports = {
	determineAction : determineAction
}


function determineAction(manifest) {
	
	var src = null
	var dest = null
	
	if(argv.src !== null && argv.src !== undefined) {
		if(isNaN(argv.src)){
			for(var i in manifest) {
				if(manifest[i]["name"] && manifest[i]["name"].toLowerCase() === argv.src.toString().toLowerCase()) {
					src = i
					
					if(argv.dest !== null && argv.dest !== undefined){
						if(isNaN(argv.dest)) {
							for(var d in manifest[src]["dest"]) {
								if(manifest[src]["dest"][d]["name"] && manifest[src]["dest"][d]["name"].toLowerCase() === argv.dest.toString().toLowerCase()) {
									dest = d
								}
							}
						}
						else if(manifest[src]["dest"].length > argv.dest && argv.dest >= 0) {
							dest = Math.floor(argv.dest)
						}
					}
				}
			}
		}
		else if (manifest.length > argv.src && argv.src >= 0) {
			src = Math.floor(argv.src)
			if(argv.dest !== null && argv.dest !== undefined){
				if(isNaN(argv.dest)) {
					for(var d in manifest[src]["dest"]) {
						if(manifest[src]["dest"][d]["name"] && manifest[src]["dest"][d]["name"].toLowerCase() === argv.dest.toString().toLowerCase()) {
							dest = d
						}
					}
				}
				else if(manifest[src]["dest"].length > argv.dest && argv.dest >= 0) {
					dest = Math.floor(argv.dest)
				}
			}
		}
	}
	
	return [src, dest]
}
