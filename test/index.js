const { deepStrictEqual, strictEqual, throws } = require('assert');
const _ = require('lodash');
const fs = require('fs');
const { decode } = require('sourcemap-codec');
const transformDwayneJs = require('../src');

describe('transform', () => {
  const dirs = fs.readdirSync(__dirname + '/fixtures');

  _.forEach(dirs, (dirname) => {
    const root = __dirname + '/fixtures/' + dirname;

    it(dirname.replace(/_/g, ' '), () => {
      let options = _.attempt(() => (
        require(root + '/options.json')
      ));
      let sourcemap = _.attempt(() => (
        require(root + '/sourcemap.json')
      ));

      if (_.isError(options)) {
        options = {};
      }

      if (_.isError(sourcemap)) {
        sourcemap = {
          names: [],
          mappings: []
        };
      }

      const code = fs.readFileSync(root + '/source.js', 'utf8');

      options.filename = 'source.js';
      options.sourceContent = code;

      const generated = transformDwayneJs(code, options);

      strictEqual(
        generated.code,
        fs.readFileSync(root + '/generated.js', 'utf8')
      );
      compareMaps(sourcemap, generated.map, code);
    });
  });

  it('should throw an error with wrong options.indent', () => {
    throws(() => {
      transformDwayneJs('', { indent: null });
    }, /options\.indent has to be either a string or a number!/);

    throws(() => {
      transformDwayneJs('', { indent: 'string' });
    }, /options\.indent has to be whitespace!/);
  });

  it('should work with options.sourceMap = null', () => {
    deepStrictEqual(transformDwayneJs(`const elem = html\`
  <div>
    {text}
  </div>
\`;`, { sourceMap: null }), {
      code: `var _tmpl;

const elem = (_tmpl = [
  {
    type: "div",
    children: [
      {
        type: "#text",
        value: function (_) {
          return _.text;
        }
      }
    ]
  }
], _tmpl.vars = ["text"], _tmpl);`,
      map: null
    });
  });

  it('should throw syntax errors with right positions', (done) => {
    try {
      transformDwayneJs(`import { Block } from 'dwayne';

const tmpl = html\`
  <div>
    {a + *}
  </div>
\`;`);
    } catch (err) {
      try {
        strictEqual(err.message, 'Unexpected token (5:9)');
        strictEqual(err.pos, 69);
        deepStrictEqual(err.loc, {
          line: 5,
          column: 9
        });

        done();
      } catch (err) {
        done(err);
      }
    }
  });
});

function compareMaps(probableMap, realMap, code) {
  probableMap.version = 3;
  probableMap.sources = realMap.mappings
    ? ['source.js']
    : [];
  probableMap.sourcesContent = realMap.mappings
    ? [code]
    : [];

  const realMappings = decode(realMap.mappings);
  const probableMappings = probableMap.mappings;

  delete realMap.mappings;
  delete probableMap.mappings;

  deepStrictEqual(probableMap, realMap);

  probableMappings.forEach((lineMappings, line) => {
    const realLineMapping = realMappings[line];

    lineMappings.forEach((mapping) => {
      deepStrictEqual(
        _.find(realLineMapping, ([column]) => mapping[0] === column),
        mapping
      );
    });
  });
}
