const tmpl = html`
  <div Mixin>{text}</div>
`;

const tmpl2 = function () {
  return htmlScopeless`
    <div>{this.value}</div>
  `;
};

const js = js`a + b`;