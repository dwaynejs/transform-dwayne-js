# transform-dwayne-html

The module is used for transforming javascript code with embedded
Dwayne HTML and Javascript.

It's supposed to be used in loaders, plugins for bundlers,
build systems, task runners and etc.

### Installation

```bash
npm install --save transform-dwayne-js
```

### Usage

```js
const transformDwayneJs = require('transform-dwayne-js');

const js = `import { Block } from 'dwayne';

export default class MyBlock extends Block {
  static html = html\`
    <div>
      {text}
    </div>
  \`;
}
`;

console.log(transformDwayneJs(js));

// {
//   code: `var _tmpl;
//
//   import { Block } from 'dwayne';
//
//   export default class MyBlock extends Block {
//     static html = (_tmpl = [
//       {
//         type: 'div',
//         children: [
//           {
//             type: '#text',
//             value: function (_) {
//               return _.value;
//             }
//           }
//         ]
//       }
//     ], _tmpl.vars = ["value"], _tmpl);
//   }`,
//   map: { ... }
// }
```

### API

```
transformDwayneJs(code: string, options?: {
  unscopables?: string[] = ['reauire'],
  transformEmbeddedHtml?: boolean = true,
  transformEmbeddedScopelessHtml?: boolean = true,
  transformEmbeddedJs?: boolean = true,
  transformJsx?: boolean = false,
  taggedHtmlFuncName?: string = 'html',
  taggedHtmlScopelessFuncName?: string = 'htmlScopeless',
  taggedJsFuncName?: string = 'js',
  sourceMap?: boolean = true,
  inputSourceMap?: SourceMap | null = null,
  filename?: string = 'unknown',
  indent?: number | 'string' = 2,
  useES6?: boolean = false,
  ...optionsThatArePassedToHtmlTransformer
}): {
  code: string,
  map: SourceMap | null
}
```

There are two types of options: ones that are used by loaders,
plugins and etc (not by the end Dwayne user) and ones that are usually
passed through.

Plugins options:

* `options.inputSourceMap` (default: `null`): input sourcemap.
* `options.filename` (default: `'unknown'`): used for sourcemaps and
`__source` args (see `options.addSource` in
[transform-dwayne-html](https://github.com/dwaynejs/transform-dwayne-html)).

Dwayne user options:

* `options.unscopables` (default: `['require']`): passed to
[transform-dwayne-html](https://github.com/dwaynejs/transform-dwayne-html)
and [transform-dwayne-js-expressions](https://github.com/dwaynejs/transform-dwayne-js-expressions).
* `options.sourceMap` (default: `true`): whether the sourcemap should
be generated (also passed to
[transform-dwayne-html](https://github.com/dwaynejs/transform-dwayne-html)
and [transform-dwayne-js-expressions](https://github.com/dwaynejs/transform-dwayne-js-expressions)).
* `options.indent` (default: `2`): output indent string. Number means
that many spaces.
* `options.useES6` (default: `false`): whether ES6 should be used in
the output rather than ES5: `let` instead of `var`, arrow functions
instead of usual functions. It's recommended setting this option to
`true` and leave transformations to babel. Also passed to
[transform-dwayne-html](https://github.com/dwaynejs/transform-dwayne-html)
and [transform-dwayne-js-expressions](https://github.com/dwaynejs/transform-dwayne-js-expressions).

All other options are as well passed to
[transform-dwayne-html](https://github.com/dwaynejs/transform-dwayne-html)
and [transform-dwayne-js-expressions](https://github.com/dwaynejs/transform-dwayne-js-expressions).
See additional options there.

Returns an object with following properties:

* `code`: the output js code.
* `map`: the output sourcemap.

### Examples

#### Html tagged expression

Input:

```js
const tmpl = html`
  <div Class:active={active}>
    <Block>
      {text}
    </Block>
  </div>
`;
```

Output:

```js
var _tmpl, _mixin;

const tmpl = (_tmpl = [
  {
    type: "div",
    args: {
      "Class:active": (_mixin = function (_) {
        return _.active;
      }, _mixin.mixin = Class, _mixin)
    },
    children: [
      {
        type: Block,
        args: {
          __source: {
            file: "source.js",
            line: 3,
            column: 5
          }
        },
        children: [
          {
            type: "#text",
            value: function (_) {
              return _.text;
            }
          }
        ]
      }
    ]
  }
], _tmpl.vars = ["active", "text"], _tmpl);
```

#### Scopeless html tagged expression

Input:

```js
function getTemplate() {
  return htmlScopeless`
    <div Class:active="{active}">
      <Block>
        {this.value + text}
      </Block>
    </div>
  `;
}
```

Output:

```js
function getTemplate() {
  var _mixin,
      _this = this;

  return [
    {
      type: "div",
      args: {
        "Class:active": (_mixin = function () {
          return active;
        }, _mixin.mixin = Class, _mixin)
      },
      children: [
        {
          type: Block,
          args: {
            __source: {
              file: "source.js",
              line: 4,
              column: 7
            }
          },
          children: [
            {
              type: "#text",
              value: function () {
                return _this.value + text;
              }
            }
          ]
        }
      ]
    }
  ];
}
```

#### Js tagged expression

Input:

```js
const expression = js`a + b`;
```

Output:

```js
const expression = function (_) {
  return _.a + _.b;
};
```

#### Jsx template

Input:

```jsx
const tmpl = (
  <div Class:active={active}>
    <Block>
      {text}
    </Block>
  </div>
);
```

Output:

```js
var _tmpl, _mixin;

const tmpl = (_tmpl = [
  {
    type: "div",
    args: {
      "Class:active": (_mixin = function (_) {
        return _.active;
      }, _mixin.mixin = Class, _mixin)
    },
    children: [
      {
        type: Block,
        args: {
          __source: {
            file: "source.js",
            line: 3,
            column: 5
          }
        },
        children: [
          {
            type: "#text",
            value: function (_) {
              return _.text;
            }
          }
        ]
      }
    ]
  }
], _tmpl.vars = ["active", "text"], _tmpl);
```
