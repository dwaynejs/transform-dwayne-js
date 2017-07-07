const tmpl = [
  {
    type: "div",
    children: [
      {
        type: Block,
        args: {
          __source: "source.js:3:6"
        },
        children: [
          {
            type: "#text",
            value: function () {
              return text;
            }
          }
        ]
      }
    ]
  }
];

const tmpl2 = () => {
  var _this2 = this;

  return [
    {
      type: "div",
      children: [
        {
          type: "#text",
          value: function () {
            return _this2.value;
          }
        }
      ]
    }
  ];
};