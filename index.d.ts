import { type BrowserWindow } from "electron";

export type Options = {
	/**
	The directory to serve, relative to the app root directory.
	*/
	directory: string;

	/**
	Custom scheme. For example, `foo` results in your `directory` being available at `foo://-`.

	@default 'app'
	*/
	scheme?: string;

	/**
	Custom hostname.

	@default '-'
	*/
	hostname?: string;

	/**
	Custom HTML filename. This gets appended with `'.html'`.

	@default 'index'
	*/
	file?: string;

	/**
	The [partition](https://electronjs.org/docs/api/session#sessionfrompartitionpartition-options) where the protocol should be installed, if not using Electron's default partition.

	@default electron.session.defaultSession
	*/
	partition?: string;

	/**
	Whether [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) should be enabled.
	Useful for testing purposes.

	@default true
	*/
	isCorsEnabled?: boolean;

	/**
	Whether the scheme is treated as a standard scheme.
	Standard schemes adhere to what RFC 3986 calls "generic URI syntax".

	@default true
	*/
	standard?: boolean;

	/**
	Whether the scheme is treated as secure.
	Secure schemes do not trigger mixed content warnings.

	@default true
	*/
	secure?: boolean;

	/**
	Whether service workers are allowed to register for the scheme.

	@default true
	*/
	allowServiceWorkers?: boolean;

	/**
	Whether the Fetch API is supported for the scheme.

	@default true
	*/
	supportFetchAPI?: boolean;
};

/**
Load the index file in the window.
*/
export type LoadURL = (
	window: BrowserWindow,
	searchParameters?: Record<string, string> | URLSearchParams,
	path?: string
) => Promise<void>; // eslint-disable-line @typescript-eslint/naming-convention

/**
Static file serving for Electron apps.

@example
```
import {app, BrowserWindow} from 'electron';
import serve from 'electron-serve';

const loadURL = serve({directory: 'renderer'});

let mainWindow;

(async () => {
	await app.whenReady();

	mainWindow = new BrowserWindow();

	await loadURL(mainWindow);

	// Or optionally with search parameters.
	await loadURL(mainWindow, {id: 4, foo: 'bar'}, '/electron-page');

	// The above is equivalent to this:
	await mainWindow.loadURL('app://-');
	// The `-` is just the required hostname.
})();
```
*/
export default function electronServe(options: Options): LoadURL;
