/*
 * @Description: 
 * @Version: 2.0
 * @Autor: mayako
 * @Date: 2020-03-16 08:48:20
 * @LastEditors: mayako
 * @LastEditTime: 2020-03-27 13:26:47
 */
/**
 * @author kuitos
 * @since 2019-05-16
 */

interface IImportResult {
	template: string;

	assetPublicPath: string;

	execScripts<T>(sandbox?: object): Promise<T>;

	getExternalScripts(): Promise<string[]>;

	getExternalStyleSheets(): Promise<string[]>;
}

export type ImportEntryOpts = {
	fetch?: typeof window.fetch;
	getPublicPath?: (rawPublicPath: string) => string;
	getTemplate?: (tpl: string) => string;
}
type ExecScriptsOpts = {
	fetch?: Function;
}
export type Entry = string | { styles?: string[], scripts?: string[], html?: string };

export function execScripts<T>(entry: string | null, scripts: string[], proxy: Window, opts?: ExecScriptsOpts): Promise<T>;

export default function importHTML(url: string, opts?: ImportEntryOpts | Function): Promise<IImportResult>;

export function importEntry(entry: Entry, opts?: ImportEntryOpts): Promise<IImportResult>;
