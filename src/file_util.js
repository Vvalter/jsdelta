const fs = require("node-fs-extra"),
    path = require("path"),
    escodegen = require("escodegen"),
    esprima = require("esprima");
// get name of current test case
function getTempFileName(state) {
    var fn = state.tmp_dir + "/delta_js_" + state.round + "." + state.ext;
    state.round++;
    return fn;
}

// write the current test case out to disk
function writeTempFile(state) {
    var fn = getTempFileName(state);
    persistAST(fn, state);
    return fn;
}

function persistAST(file, state) {
    fs.writeFileSync(file, pp(state).trim() + "\n");
}

function pp(state) {
    var ast = state.ast;
    if (!ast) {
        throw new Error();
    }
    // we pass the 'parse' option here to avoid converting 0.0 to 0, etc.;
    // for JSON files, we skip the top-level `Program` and `ExpressionStatement`
    // nodes to prevent escodegen from inserting spurious parentheses
    return escodegen.generate(state.ext === 'json' && ast.body[0] ? ast.body[0].expression : ast, {
        format: {
            json: state.ext === 'json'
        },
        parse: parse
    });
}

function parse(input) {
    try {
        return esprima.parse(input);
    } catch (e) {
        throw e;
    }
}

function du_sb (file) {
    var size = 0;
    var fileStat = fs.statSync(file);
    if (fileStat.isDirectory()) {
        fs.readdirSync(file).forEach(function (child) {
            size += du_sb(path.resolve(file, child));
        });
    }
    size += fileStat.size;
    return size;
}

module.exports.du_sb = du_sb;
module.exports.getTempFileName = getTempFileName;
module.exports.writeTempFile = writeTempFile;
module.exports.persistAST = persistAST;
module.exports.pp = pp;
module.exports.parse = parse;