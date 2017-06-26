import { Block, If, Children, Class, initApp, find } from 'dwayne';

class Block1 extends Block {
  static html = html`
    <div
      Class:active="{active}"
      attribute
    />
  `;
}

class Block2 extends Block {
  static html = html`
    <span>
      {text}
    </span>
  `;
}

class App extends Block {
  static html = (
    <Children>
      <If if={args.condition}>
        <Block1/>
      </If>
      <If if={!args.condition}>
        <Block2/>
      </If>
    </Children>
  );
}

const value = true;

initApp(htmlScopeless`<App condition="{value}"/>`, find('.root'));