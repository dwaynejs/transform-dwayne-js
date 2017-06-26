const tmpl = htmlScopeless`
  <div>
    <Block>
      {text}
    </Block>
  </div>
`;

const tmpl2 = () => htmlScopeless`
  <div>{this.value}</div>
`;