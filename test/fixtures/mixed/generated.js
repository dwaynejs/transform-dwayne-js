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
        __source: "source.js:22:5"
      },
      children: [
        {
          type: If,
          args: {
            if: _ => _.args.condition,
            __source: "source.js:23:7"
          },
          children: [
            {
              type: Block1,
              args: {
                __source: "source.js:24:9"
              }
            }
          ]
        },
        {
          type: If,
          args: {
            if: _ => !_.args.condition,
            __source: "source.js:26:7"
          },
          children: [
            {
              type: Block2,
              args: {
                __source: "source.js:27:9"
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
      __source: "source.js:35:23"
    }
  }
], find('.root'));