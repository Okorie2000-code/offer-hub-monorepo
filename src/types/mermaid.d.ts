/**
 * Minimal type shim for mermaid while the installed package's dist/mermaid.d.ts
 * is missing (incomplete install).  Remove this file once `npm install` fully
 * restores the mermaid package.
 */
declare module "mermaid" {
  export interface MermaidConfig {
    startOnLoad?: boolean;
    theme?: string;
    themeVariables?: Record<string, string>;
    themeCSS?: string;
    flowchart?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export interface RenderResult {
    svg: string;
    bindFunctions?: (element: Element) => void;
  }

  const mermaid: {
    initialize(config: MermaidConfig): void;
    render(id: string, text: string, container?: Element): Promise<RenderResult>;
    parse(text: string, parseOptions?: { suppressErrors?: boolean }): Promise<boolean>;
    [key: string]: unknown;
  };

  export default mermaid;
}
