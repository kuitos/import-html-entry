/**
 * @author kuitos
 * @since 2019-05-16
 */

interface IImportResult {
	template: string;

	execScripts<T>(sandbox?: object): Promise<T>;

	getExternalScripts(): Promise<string[]>;

	getExternalStyleSheets(): Promise<string[]>;
}

export type Entry = string | { styles?: string[], scripts?: string[], html?: string };

export default function importHTML(url: string): Promise<IImportResult>;

export function importEntry(entry: Entry): Promise<IImportResult>;
