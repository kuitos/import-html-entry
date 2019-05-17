/**
 * @author kuitos
 * @since 2019-05-16
 */

type LifeCycles = {
	bootstrap: () => Promise<any>;
	mount: () => Promise<any>;
	unmount: () => Promise<any>;
};

interface IImportResult {
	template: string;

	execScripts(sandbox?: object): Promise<LifeCycles>;

	getExternalScripts(): Promise<string[]>;

	getExternalStyleSheets(): Promise<string[]>;
}

export type Entry = string | { styles?: string[], scripts?: string[], html?: string };

export default function importHTML(url: string): Promise<IImportResult>;

export function importEntry(entry: Entry): Promise<IImportResult>;
