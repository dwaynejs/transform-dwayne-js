export interface Options {
  unscopables?: string[];
  transformEmbeddedHtml?: boolean;
  transformEmbeddedHtmlScopeless?: boolean;
  transformEmbeddedJs?: boolean;
  transformJsx?: boolean;
  taggedHtmlFuncName?: string;
  taggedHtmlScopelessFuncName?: string;
  taggedJsFuncName?: string;
  sourceMap?: boolean;
  inputSourceMap?: SourceMap | null;
  filename?: string;
  indent?: number | string;
  useES6?: boolean;
}

export interface SourceMap {
  version: number;
  sources: string[];
  sourcesContent: Array<string | null>;
  names: string[];
  mappings: string;
  file?: string;
  sourceRoot?: string;
}

export = function (code: string, options?: Options): {
  code: string,
  map: SourceMap | null
};
