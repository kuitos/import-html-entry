/**
 * @author kuitos
 * @since 2019-05-16
 */

type IImportFileData = { src: string; data: string; async?: boolean; module?: boolean; };

interface IImportResult {
	entry: Entry;

	template: string;

	assetPublicPath: string;

	entryScript: string;

	execScripts<T>(sandbox?: object, strictGlobal?: boolean, execScriptsHooks?: ExecScriptsHooks): Promise<T>;

	getExternalScripts(): Promise<(string | IImportFileData)[]>;

	getExternalStyleSheets(): Promise<(string | IImportFileData)[]>;
}

interface TemplateScriptObject {
	async?: boolean;
	module?: boolean;
	src: string;
}

interface TemplateResult {
	template: string;
	scripts: (string | TemplateScriptObject)[];
	styles: string[];
	entry: string | TemplateScriptObject;
}

export type ImportEntryOpts = {
	fetch?: typeof window.fetch | { fn?: typeof window.fetch, autoDecodeResponse?: boolean }
	getPublicPath?: (entry: Entry) => string;
	getTemplate?: (tpl: string) => string;
	postProcessTemplate?: (tplResult: TemplateResult) => TemplateResult;
}

export type ExecScriptsHooks = {
	// 每个脚本执行之前触发，如果返回的是非空string， 那么将把返回值替换code执行
	beforeExec?: (code: string, script: string) => string | void;
	// 每个脚本执行完毕后触发，如果脚本执行报错，那么就不会触发
	afterExec?: (code: string, script: string) => void;
}

type ExecScriptsOpts = Pick<ImportEntryOpts, 'fetch'> & ExecScriptsHooks & {
	strictGlobal?: boolean;
	success?: CallableFunction;
	error?: CallableFunction;
}

export type Entry = string | { styles?: string[], scripts?: string[], html?: string };

export function execScripts<T>(entry: string | null, scripts: string[], proxy: Window, opts?: ExecScriptsOpts): Promise<T>;

export default function importHTML(url: string, opts?: ImportEntryOpts | Function): Promise<IImportResult>;

export function importEntry(entry: Entry, opts?: ImportEntryOpts): Promise<IImportResult>;
