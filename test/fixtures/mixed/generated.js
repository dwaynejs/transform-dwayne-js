let _tmpl, _mixin, _tmpl2;

import { Block, If, Children, Class, initApp, find } from 'dwayne';

class Block1 extends Block {
  static html = (_tmpl = [
    {
      type: "div",
      args: {
        "Class:active": (_mixin = _ => _.active, _mixin.mixin = Class, _mixin),
        attribute: ""
      }
    }
  ], _tmpl.vars = ["active"], _tmpl);
}

class Block2 extends Block {
  static html = (_tmpl2 = [
    {
      type: "span",
      children: [
        {
          type: "#text",
          value: _ => _.text
        }
      ]
    }
  ], _tmpl2.vars = ["text"], _tmpl2);
}

class App extends Block {
  static html = [
    {
      type: Children,
      args: {
        __source: {
          file: "source.js",
          line: 22,
          column: 5
        }
      },
      children: [
        {
          type: If,
          args: {
            if: _ => _.args.condition,
            __source: {
              file: "source.js",
              line: 23,
              column: 7
            }
          },
          children: [
            {
              type: Block1,
              args: {
                __source: {
                  file: "source.js",
                  line: 24,
                  column: 9
                }
              }
            }
          ]
        },
        {
          type: If,
          args: {
            if: _ => !_.args.condition,
            __source: {
              file: "source.js",
              line: 26,
              column: 7
            }
          },
          children: [
            {
              type: Block2,
              args: {
                __source: {
                  file: "source.js",
                  line: 27,
                  column: 9
                }
              }
            }
          ]
        }
      ]
    }
  ];
}

const value = true;

initApp([
  {
    type: App,
    args: {
      condition: () => value,
      __source: {
        file: "source.js",
        line: 35,
        column: 23
      }
    }
  }
], find('.root'));