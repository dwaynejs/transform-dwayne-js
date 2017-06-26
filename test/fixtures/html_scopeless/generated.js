const tmpl = [
  {
    type: "div",
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