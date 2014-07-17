var fs = require('fs'),
    spawn = require('child_process').spawn,
    version, verbose = false, build = {};

function errorMsg(msg) {
    console.log("[ERROR]", msg);
    process.exit(1);
}

if(process.argv.length < 3) {
  throw new Error('You should specify a new version');
  process.exit(1);
}


version = process.argv[2];
verbose = process.argv[3] === '--verbose';

function buildBabelfish(cb) {
    build.npm = spawn('npm',['run','build']);

    if(verbose) {
        build.npm.stdout.on('data', function (data) {
            console.log(String(data))
        });
    }

    build.npm.on('close', function (code) {
        if(code) {
            return errorMsg('Cannot build the new Babelfish');
        }
        console.log('  ✔  Build the version', version);

        cb();
    });
}

function testBabelfish() {
    build.test = spawn('npm',['test']);

    if(verbose) {
        build.test.stdout.on('data', function (data) {
            console.log(String(data))
        });
    }

    build.test.on('close', function (code) {
        if(code) {
            return errorMsg('Some tests failed');
        }
        console.log('  ✔  Run tests');
    });
}


buildBabelfish(testBabelfish);

// function configPkg(name, version) {
//   fs.readFile('./' + name + '.json', function(err, data) {

//     if(err) {
//       throw err;
//     }

//     var pkg = JSON.parse(String(data));
//       pkg.version = version.trim();

//     fs.writeFile('./' + name + '.json', JSON.stringify(pkg,undefined,2), function(err) {

//       if(err) {
//         throw err;
//       }

//       console.log('  ✔  Write ' + name + '.json with the version:',version);
//     });
//   });
// }

// ['bower', 'package'].forEach(function (pkgName) {
//   configPkg(pkgName, process.argv[2]);
// });
