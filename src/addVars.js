const _ = require('lodash');
const { parse } = require('babylon');
const { default: traverse } = require('babel-traverse');
const { default: generate } = require('babel-generator');
const t = require('babel-types');
const { SourceMapConsumer } = require('source-map');
const { decode } = require('sourcemap-codec');
const transformDwayneHtml = require('transform-dwayne-html');
const transformDwayneJs = require('transform-dwayne-js-expressions');

const generateScopeVar = require('./generateScopeVar');

module.exports = (code, options) => {
  const taggedHtmlFuncName = options.taggedHtmlFuncName;
  const taggedHtmlScopelessFuncName = options.taggedHtmlScopelessFuncName;
  const taggedJsFuncName = options.taggedJsFuncName;

  const ast = parseCode(code, options);
  const nodes = [];

  traverse(ast, {
    enter(path) {
      const isJsx = options.transformJsx && path.isJSXElement();
      const isTagged = path.isTaggedTemplateExpression();

      if (!isJsx && !isTagged) {
        return;
      }

      let handledPath = path;

      do {
        handledPath = handledPath.parentPath;
      } while (handledPath && !handledPath.node.handled);

      if (handledPath) {
        return;
      }

      const {
        tag,
        start,
        end,
        loc: {
          start: loc
        }
      } = path.node;
      let value;
      let expressionStart;

      if (isJsx) {
        value = code.slice(start, end);
        expressionStart = start;
      } else {
        const {
          quasi: {
            quasis,
            expressions,
            start: quasiStart
          },
          tag: { name }
        } = path.node;

        if (
          quasis.length !== 1
          || expressions.length
          || (
            (name !== taggedHtmlFuncName || !options.transformEmbeddedHtml)
            && (name !== taggedHtmlScopelessFuncName || !options.transformEmbeddedScopelessHtml)
            && (name !== taggedJsFuncName || !options.transformEmbeddedJs)
          )
        ) {
          return;
        }

        value = quasis[0].value.cooked;
        expressionStart = quasiStart + 1;
      }

      const thisVarName = generateScopeVar('_this', path, options);
      const tmplVarName = generateScopeVar('_tmpl', path, options);
      const mixinVarName = generateScopeVar('_mixin', path, options);
      const keepScope = isTagged && tag.name === taggedHtmlScopelessFuncName;
      const startLocation = options.lines.locationForIndex(expressionStart);
      const transformerOpts = _.assign({}, options, {
        sourceType: 'embed',
        inputSourceMap: null,
        startLine: startLocation.line + 1,
        startColumn: startLocation.column,
        tmplVarName,
        mixinVarName,
        thisVarName,
        keepScope
      });
      let transformed;

      try {
        const transformer = isTagged && tag.name === taggedJsFuncName
          ? transformDwayneJs
          : transformDwayneHtml;

        transformed = transformer(value, transformerOpts);
      } catch (err) {
        /* istanbul ignore if */
        if (typeof err.pos !== 'number') {
          throw err;
        }

        throwError(err, expressionStart, options);
      }

      if (transformed.generatedTmplVar) {
        path.scope.push({
          id: t.identifier(tmplVarName),
          kind: options.useES6
            ? 'let'
            : 'var'
        });
      }

      if (transformed.generatedMixinVar) {
        path.scope.push({
          id: t.identifier(mixinVarName),
          kind: options.useES6
            ? 'let'
            : 'var'
        });
      }

      if (transformed.generatedThisVar) {
        path.scope.push({
          id: t.identifier(thisVarName),
          init: t.thisExpression(),
          kind: 'var'
        });
      }

      nodes.push({
        expressionStart,
        start,
        loc,
        transformed
      });
      path.node.handled = true;
    }
  });

  const {
    code: generated,
    map
  } = generate(ast, {
    filename: options.filename,
    sourceFileName: options.filename,
    sourceMaps: true
  }, code);
  const smc = new SourceMapConsumer(map);
  const mappings = decode(map.mappings);

  traverse(parseCode(generated, options), {
    enter(path) {
      const isJsx = options.transformJsx && path.isJSXElement();

      if (!isJsx && !path.isTaggedTemplateExpression()) {
        return;
      }

      const {
        start,
        end,
        loc: {
          start: loc
        }
      } = path.node;
      const found = _.find(nodes, ({ loc: origLoc }) => (
        _.some(smc.allGeneratedPositionsFor({
          source: options.filename,
          line: origLoc.line,
          column: origLoc.column
        }), ({ line, column }) => (
          line === loc.line
          && column === loc.column
          && mappings[line - 1].some((mapping) => (
            mapping[0] === column && (mapping.length > 4 || isJsx)
          ))
        ))
      ));

      if (!found) {
        return;
      }

      found.genStart = start;
      found.genEnd = end;
    }
  });

  return {
    code: generated,
    map: options.sourceMap
      ? map
      : null,
    nodes
  };
};

function throwError(err, position, options) {
  err.pos = position + err.pos;

  const location = options.lines.locationForIndex(err.pos);

  location.line++;

  err.loc = location;
  err.message = err.message.replace(/\(\d+:\d+\)$/, () => (
    `(${ location.line }:${ location.column })`
  ));

  throw err;
}

function parseCode(code, options) {
  return parse(code, {
    sourceType: 'module',
    sourceFilename: options.filename,
    plugins: [
      'jsx',
      'flow',
      'doExpressions',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'classPrivateProperties',
      'exportExtensions',
      'asyncGenerators',
      'functionBind',
      'functionSent',
      'dynamicImport',
      'numericSeparator',
      'optionalChaining',
      'importMeta'
    ]
  });
}
