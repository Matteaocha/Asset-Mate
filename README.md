# Asset-Mate
Asset-Mate auto-generates a gulpfile based on a manifest, which enables you to easily compile, rewrite, copy, or deploy Javascript, ES6, SCSS, CSS and images

#How it works
1) You fill in a manifest of your source tree assets, and desired destinations

2) It auto-generates a gulp file

3) Call 'watch', or 'build' with gulp to have it make your output assets

4) Call 'deploy' with gulp to have it deployed to an AWS S3 bucket

#What it can do
- Compile ES6 files
- Compile SASS files
- Minify ES6 or Javascript files
- Autoprefix CSS files (automatic cross-browser support)
- Do find and replace (rewrites) on all text files
- Create multiple output sizes of images
- Simple copying of files
- Deploy to an S3 bucket
- Keeps an internal list of files (so that you don't copy everything every time)

#Requirements
- Node and NPM
- Ffmpeg (If you want to resize images)

#Installation
1) npm install -g asset-mate

2) cd to the root of your project directory

3) asset-mate new

#Commands
- asset-mate new
- asset-mate autogenerate
- asset-mate clearcache
- gulp (build | deploy | watch)
- gulp (build | deploy | watch) [--src 0] [ --dest 0]
- gulp (build | deploy | watch) [--src src_name] [ --dest dest_name]

#Usage
When you call 'asset-mate new' it installs gulp and the dependencies you need to run the gulp file, and adds a 'gulp-manifest.json' file to the root of your project.

'gulp-manifest.json' will start with an example structure that you can fill in with the details of your own project. You can have multiple sources and multiple destinations, and it understands arrayed and glob format descriptions of your files.
Once you've finished describing your manifest, call 'asset-mate autogenerate'. This will build your gulp file for you. Then use the commands 'gulp build' or 'gulp watch' to have it produce your assets.

If you specify 's3Bucket' and 'awsCredentialsProfile' in a destination in your manifest, calling 'gulp deploy' will use that information to automatically upload your files to the given S3 bucket. You can also specify an 's3Prefix' if you would like the files in that destination prefixed in the bucket.

#Example
A common example case is when you have a source directory that you would like compiled into three formats:

1) A local 'dev' folder in which javascript is not minified

2) A local 'dist' folder in which sources SRE minified

3) A 'deploy' folder in which sources are both minified and any urls in those files point to S3 or CDN addresses


