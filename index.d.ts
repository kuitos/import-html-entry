/**
 * @author kuitos
 * @since 2019-05-16
 */

interface IImportResult {
	template: string;

	assetPublicPath: string;

	execScripts<T>(sandbox?: object, strictGlobal?: boolean): Promise<T>;

	getExternalScripts(): Promise<string[]>;

	getExternalStyleSheets(): Promise<string[]>;
}

export type ImportEntryOpts = {
	fetch?: typeof window.fetch;
	getPublicPath?: (entry: Entry) => string;
	getTemplate?: (tpl: string) => string;
}

type ExecScriptsOpts = Pick<ImportEntryOpts, 'fetch'> & {
	strictGlobal?: boolean;
	success?: CallableFunction;
	error?: CallableFunction;
	beforeExec?: CallableFunction;
}

export type Entry = string | { styles?: string[], scripts?: string[], html?: string };

export function execScripts<T>(entry: string | null, scripts: string[], proxy: Window, opts?: ExecScriptsOpts): Promise<T>;

export default function importHTML(url: string, opts?: ImportEntryOpts | Function): Promise<IImportResult>;

export function importEntry(entry: Entry, opts?: ImportEntryOpts): Promise<IImportResult>;
