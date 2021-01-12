# Asset-Mate

**(Warning: This package is no longer being actively maintained)**

Asset-Mate auto-generates a gulpfile based on a manifest, which enables you to easily compile, rewrite, copy, or deploy Javascript, ES6 and React with Browserify, SCSS, CSS and images

UPDATES: 
1) The babel es6 transformer now handles React too
2) Calling watch on gulp now watches all files in directories alongside js/scss/css globs
3) You can now specify an 's3CacheControl' option to set the default cache-control header on all the assets

### How it works

1) You fill in a manifest of your source-tree assets, and desired destinations

2) It auto-generates a gulp file

3) Call 'watch', or 'build' with gulp to have it make your output assets

4) Call 'deploy' with gulp to have it deployed to an AWS S3 bucket

### What it can do

- Compile ES6 files
- Compile SASS files
- Minify ES6 or Javascript files
- Autoprefix CSS files (automatic cross-browser support)
- Do find and replace (rewrites) on all text files
- Create multiple output sizes of images
- Simple copying of files
- Deploy to an S3 bucket
- Keeps an internal list of files (so that you don't copy everything every time)

### Requirements

- Node and NPM
- Ffmpeg (If you want to resize images)

### Installation

1) npm install -g asset-mate

2) cd to the root of your project directory

3) asset-mate new

### Commands

- asset-mate new
- asset-mate autogenerate
- asset-mate clearcache
- gulp (build | deploy | watch)
- gulp (build | deploy | watch) [--src 0] [ --dest 0]
- gulp (build | deploy | watch) [--src src_name] [ --dest dest_name]

### Usage

When you call 'asset-mate new' it installs gulp and the dependencies you need to run the gulp file, and adds a 'gulp-manifest.json' file to the root of your project.

'gulp-manifest.json' will start with an example structure that you can fill in with the details of your own project. You can have multiple sources and multiple destinations, and it understands arrayed and glob format descriptions of your files.
Once you've finished describing your manifest, call 'asset-mate autogenerate'. This will build your gulp file for you. Then use the commands 'gulp build' or 'gulp watch' to have it produce your assets.

If you specify 's3Bucket' and 'awsCredentialsProfile' in a destination in your manifest, calling 'gulp deploy' will use that information to automatically upload your files to the given S3 bucket. You can also specify an 's3Prefix' if you would like the files in that destination prefixed in the bucket.

### Example

A common example case is when you have a source directory that you would like compiled into three formats:

- A local 'dev' folder in which sources are not minified
- A local 'dist' folder in which sources are minified
- A 'deploy' folder in which sources are both minified and any urls in those files point to S3 or CDN addresses

Your gulp-manifest.json file for this use case might look as follows:

```
[
    {		
        "name" : "my-app",
        "src" : {
            "directory" : "src",
            "es6" : "js/*.js",
            "js" : "other_file/js/*.js",
            "scss" : "scss/*.scss",
            "css" : "css/*",
            "images" : [
                        {
                        "glob" : "images/**",
                        "sizes" : {
                            "big" : "100%",
                            "med" : 0.5
                            }
                        }
                    ],			
            "copy" : "**",			
            "copyExclude" : ["folder_to_exclude1/*", "folder_to_exclude2/*"]
        },
        "dest" : [
            {
                "name" : "dev",
                "directory" : "dist_dev",
                "minify" : false,
                "autoprefix" : true,
                "rewrites" : { "ASSET_URL" : "dist_dev" },
            },
            {
                "name" : "dist",
                "directory" : "dist",
                "minify" : true,
                "autoprefix" : true,
                "rewrites" : { "ASSET_URL" : "" },
            },
            {
                "name" : "deploy",
                "directory" : "deploy",
                "minify" : true,
                "autoprefix" : true,
                "rewrites" : { "ASSET_URL" : "aws-cdn.com" },
                "s3Bucket" : "my-bucket",
                "s3Prefix" : "app-asset",
                "s3CacheControl" : "max-age=86400",
                "awsCredentialsProfile" : "default"
            }
        ]		
    }
]
```

You can omit any of the keys that are not relevant to your project and it should still build ok.

(Note: I've also used this example to demonstrate that the images list will understand you specifying your sizes as both percentages and fractions)

Since I've specified the copy glob as "**", when gulp runs it will copy and rewrite all files in the 'src' directory that don't match with those specified in the other globs, it will parse everything in the es6 glob using Babel and Browserify, it will resize my images and appended them with their size name (e.g. image_med.png), and it will compile and autoprefix any css.

The results will vary as per the rules specified in each of the destinations

When I call 'gulp deploy' it will ignore the first two destinations (as they don't list any s3 information) any only deploy the files in the third.

If I only want to watch or build to a single destination, the second for example, I can call 'gulp build --src my-app --dest dist' or 'gulp build --src 0 --dest 1'

Also, any subsequent times I run the build command it 'should' check the source files against their destinations and an internal record and only copy those with changes (this might be a bit flakey though)

Oh and! Subsequent deploys should also upload only the files that have changed

