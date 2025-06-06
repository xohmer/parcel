// @flow strict-local
import type {FilePath} from '@parcel/types';

import invariant from 'assert';
// flowlint-next-line untyped-import:off
import jsonMap from 'json-source-map';
import nullthrows from 'nullthrows';

/** These positions are 1-based (so <code>1</code> is the first line/column) */
export type DiagnosticHighlightLocation = {|
  +line: number,
  +column: number,
|};

export type DiagnosticSeverity = 'error' | 'warn' | 'info';

/**
 * Note: A tab character is always counted as a single character
 * This is to prevent any mismatch of highlighting across machines
 */
export type DiagnosticCodeHighlight = {|
  /** Location of the first character that should get highlighted for this highlight. */
  start: DiagnosticHighlightLocation,
  /** Location of the last character that should get highlighted for this highlight. */
  end: DiagnosticHighlightLocation,
  /** A message that should be displayed at this location in the code (optional). */
  message?: string,
|};

/**
 * Describes how to format a code frame.
 * A code frame is a visualization of a piece of code with a certain amount of
 * code highlights that point to certain chunk(s) inside the code.
 */
export type DiagnosticCodeFrame = {|
  /**
   * The contents of the source file.
   *
   * If no code is passed, it will be read in from Diagnostic#filePath, remember that
   * the asset's current code could be different from the input contents.
   *
   */
  code?: string,
  codeHighlights: DiagnosticCodeHighlight | Array<DiagnosticCodeHighlight>,
|};

/**
 * A style agnostic way of emitting errors, warnings and info.
 * Reporters are responsible for rendering the message, codeframes, hints, ...
 */
export type Diagnostic = {|
  /** This is the message you want to log. */
  message: string,
  /** Name of plugin or file that threw this error */
  origin?: string,

  /** A stacktrace of the error (optional) */
  stack?: string,
  /** Name of the error (optional) */
  name?: string,

  /** Path to the file this diagnostic is about (optional, absolute or relative to the project root) */
  filePath?: FilePath,
  /** Language of the file this diagnostic is about (optional) */
  language?: string,

  /** A code frame points to a certain location(s) in the file this diagnostic is linked to (optional) */
  codeFrame?: DiagnosticCodeFrame,

  /** An optional list of strings that suggest ways to resolve this issue */
  hints?: Array<string>,

  /** @private */
  skipFormatting?: boolean,
|};

// This type should represent all error formats Parcel can encounter...
export type PrintableError = Error & {
  fileName?: string,
  filePath?: string,
  codeFrame?: string,
  highlightedCodeFrame?: string,
  loc?: ?{
    column: number,
    line: number,
    ...
  },
  source?: string,
  ...
};

export type DiagnosticWithoutOrigin = {|
  ...Diagnostic,
  origin?: string,
|};

/** Something that can be turned into a diagnostic. */
export type Diagnostifiable =
  | Diagnostic
  | Array<Diagnostic>
  | ThrowableDiagnostic
  | PrintableError
  | string;

/** Normalize the given value into a diagnostic. */
export function anyToDiagnostic(
  input: Diagnostifiable,
): Diagnostic | Array<Diagnostic> {
  // $FlowFixMe
  let diagnostic: Diagnostic | Array<Diagnostic> = input;
  if (input instanceof ThrowableDiagnostic) {
    diagnostic = input.diagnostics;
  } else if (input instanceof Error) {
    diagnostic = errorToDiagnostic(input);
  }

  return diagnostic;
}

/** Normalize the given error into a diagnostic. */
export function errorToDiagnostic(
  error: ThrowableDiagnostic | PrintableError | string,
  realOrigin?: string,
): Diagnostic | Array<Diagnostic> {
  let codeFrame: DiagnosticCodeFrame | void = undefined;

  if (typeof error === 'string') {
    return {
      origin: realOrigin ?? 'Error',
      message: error,
      codeFrame,
    };
  }

  if (error instanceof ThrowableDiagnostic) {
    return error.diagnostics.map(d => {
      return {
        ...d,
        origin: realOrigin ?? d.origin ?? 'unknown',
      };
    });
  }

  if (error.loc && error.source != null) {
    codeFrame = {
      code: error.source,
      codeHighlights: {
        start: {
          line: error.loc.line,
          column: error.loc.column,
        },
        end: {
          line: error.loc.line,
          column: error.loc.column,
        },
      },
    };
  }

  return {
    origin: realOrigin ?? 'Error',
    message: error.message,
    name: error.name,
    filePath: error.filePath ?? error.fileName,
    stack: error.highlightedCodeFrame ?? error.codeFrame ?? error.stack,
    codeFrame,
  };
}

/**
 * An error wrapper around a diagnostic that can be <code>throw</code>n (e.g. to signal a
 * build error).
 */
export default class ThrowableDiagnostic extends Error {
  diagnostics: Array<Diagnostic>;

  constructor(opts: {diagnostic: Diagnostic | Array<Diagnostic>, ...}) {
    let diagnostics = Array.isArray(opts.diagnostic)
      ? opts.diagnostic
      : [opts.diagnostic];

    // construct error from diagnostics...
    super(diagnostics[0].message);
    this.stack = diagnostics[0].stack ?? super.stack;
    this.name = diagnostics[0].name ?? super.name;

    this.diagnostics = diagnostics;
  }
}

/**
 * Turns a list of positions in a JSON file with messages into a list of diagnostics.
 * Uses <a href="https://github.com/epoberezkin/json-source-map">epoberezkin/json-source-map</a>.
 *
 * @param code the JSON code
 * @param ids A list of JSON keypaths (<code>key: "/some/parent/child"</code>) with corresponding messages, \
 * <code>type</code> signifies whether the key of the value in a JSON object should be highlighted.
 */
export function generateJSONCodeHighlights(
  code: string,
  ids: Array<{|key: string, type?: ?'key' | 'value', message?: string|}>,
): Array<DiagnosticCodeHighlight> {
  // json-source-map doesn't support a tabWidth option (yet)
  let map = jsonMap.parse(code.replace(/\t/g, ' '));
  return ids.map(({key, type, message}) => {
    let pos = nullthrows(map.pointers[key]);
    return {
      ...getJSONSourceLocation(pos, type),
      message,
    };
  });
}

/**
 * Converts entries in <a href="https://github.com/epoberezkin/json-source-map">epoberezkin/json-source-map</a>'s
 * <code>result.pointers</code> array.
 */
export function getJSONSourceLocation(
  pos: {|
    value: {|line: number, column: number|},
    valueEnd: {|line: number, column: number|},
    ...
      | {||}
      | {|
          key: {|line: number, column: number|},
          keyEnd: {|line: number, column: number|},
        |},
  |},
  type?: ?'key' | 'value',
): {|
  start: DiagnosticHighlightLocation,
  end: DiagnosticHighlightLocation,
|} {
  if (!type && pos.key && pos.value) {
    // key and value
    return {
      start: {line: pos.key.line + 1, column: pos.key.column + 1},
      end: {line: pos.valueEnd.line + 1, column: pos.valueEnd.column},
    };
  } else if (type == 'key' || !pos.value) {
    invariant(pos.key);
    return {
      start: {line: pos.key.line + 1, column: pos.key.column + 1},
      end: {line: pos.keyEnd.line + 1, column: pos.keyEnd.column},
    };
  } else {
    return {
      start: {line: pos.value.line + 1, column: pos.value.column + 1},
      end: {line: pos.valueEnd.line + 1, column: pos.valueEnd.column},
    };
  }
}

/** Sanitizes object keys before using them as <code>key</code> in generateJSONCodeHighlights */
export function encodeJSONKeyComponent(component: string): string {
  return component.replace(/\//g, '~1');
}
