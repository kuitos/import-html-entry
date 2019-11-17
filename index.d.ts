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

type ImportEntryOpts = {
	fetch?: Function;
	getDomain?: Function;
}

export type Entry = string | { styles?: string[], scripts?: string[], html?: string };

export default function importHTML(url: string, opts?: ImportEntryOpts): Promise<IImportResult>;

export function importEntry(entry: Entry, opts?: ImportEntryOpts): Promise<IImportResult>;
