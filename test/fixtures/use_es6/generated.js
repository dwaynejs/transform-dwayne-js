let _tmpl, _mixin;

const tmpl = (_tmpl = [
  {
    type: "div",
    args: {
      Mixin: (_mixin = () => true, _mixin.mixin = Mixin, _mixin.__source = "source.js:2:7", _mixin)
    },
    children: [
      {
        type: "#text",
        value: _ => _.text
      }
    ]
  }
], _tmpl.vars = ["text"], _tmpl);

const tmpl2 = function () {
  return [
    {
      type: "div",
      children: [
        {
          type: "#text",
          value: () => this.value
        }
      ]
    }
  ];
};

const js = _ => _.a + _.b;