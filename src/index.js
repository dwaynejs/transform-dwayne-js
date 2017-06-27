const _ = require('lodash');
const CodeGenerator = require('generate-code');
const { default: LinesAndColumns } = require('lines-and-columns');

const addVars = require('./addVars');
const pickMap = require('./pickMap');
const setJsIndents = require('./setJsIndents');
const filterMapNames = require('./filterMapNames');

module.exports = (source, options) => {
  options = _.assign({}, options);

  options.unscopables = _.get(options, 'unscopables', ['require']);
  options.transformEmbeddedHtml = !!_.get(options, 'transformEmbeddedHtml', true);
  options.transformEmbeddedHtmlScopeless = !!_.get(options, 'transformEmbeddedHtmlScopeless', true);
  options.transformEmbeddedJs = !!_.get(options, 'transformEmbeddedJs', true);
  options.transformJsx = !!_.get(options, 'transformJsx', false);
  options.taggedHtmlFuncName = _.get(options, 'taggedHtmlFuncName', 'html');
  options.taggedHtmlScopelessFuncName = _.get(options, 'taggedHtmlScopelessFuncName', 'htmlScopeless');
  options.taggedJsFuncName = _.get(options, 'taggedJsFuncName', 'js');
  options.sourceMap = !!_.get(options, 'sourceMap', true);
  options.inputSourceMap = _.get(options, 'inputSourceMap', null);
  options.filename = _.get(options, 'filename', 'unknown');
  options.indent = _.get(options, 'indent', 2);
  options.useES6 = _.get(options, 'useES6', false);

  options.sourceContent = source;
  options.lines = new LinesAndColumns(source);

  if (typeof options.indent === 'number') {
    options.indent = ' '.repeat(options.indent);
  }

  if (typeof options.indent !== 'string') {
    throw new Error('options.indent has to be either a string or a number!');
  }

  if (!/^\s+$/.test(options.indent)) {
    throw new Error('options.indent has to be whitespace!');
  }

  const {
    code: codeWithAddedVars,
    map: mapWithAddedVars,
    nodes
  } = addVars(source, options);
  const code = new CodeGenerator(options);
  const lines = new LinesAndColumns(codeWithAddedVars);
  let currentGenIndex = 0;

  nodes.concat(null).forEach((node) => {
    const start = currentGenIndex;
    const end = node
      ? node.genStart
      : codeWithAddedVars.length;
    const map = pickMap(
      mapWithAddedVars,
      { start, end },
      lines
    );

    code.addWithMap(
      codeWithAddedVars.slice(start, end),
      filterMapNames(map)
    );

    if (node) {
      const currentIndent = Math.round(code.getCurrentIndent().length / options.indent.length);
      const withIndents = setJsIndents(node.transformed.code, node.transformed.map, currentIndent, options);

      code.addWithMap(
        withIndents.code,
        filterMapNames(withIndents.map),
        node.expressionStart
      );

      currentGenIndex = node.genEnd;
    }
  });

  return {
    code: code.toString(),
    map: code.generateMap()
  };
};
