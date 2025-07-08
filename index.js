import electron from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

// See https://cs.chromium.org/chromium/src/net/base/net_error_list.h
const FILE_NOT_FOUND = -6;

const getPath = async (path_, file) => {
	try {
		const result = await fs.stat(path_);

		if (result.isFile()) {
			return path_;
		}

		if (result.isDirectory()) {
			return getPath(path.join(path_, `${file}.html`));
		}
	} catch { }
};

export default function electronServe(options) {
	options = {
		scheme: 'app',
		hostname: '-',
		file: 'index',
		isCorsEnabled: true,
		standard: true,
		secure: true,
		allowServiceWorkers: true,
		supportFetchAPI: true,
		...options,
	};

	if (!options.directory) {
		throw new Error('The `directory` option is required');
	}

	options.directory = path.resolve(electron.app.getAppPath(), options.directory);

	const handler = async (request, callback) => {
		const indexPath = path.join(options.directory, `${options.file}.html`);
		const filePath = path.join(options.directory, decodeURIComponent(new URL(request.url).pathname));

		const relativePath = path.relative(options.directory, filePath);
		const isSafe = !relativePath.startsWith('..') && !path.isAbsolute(relativePath);

		if (!isSafe) {
			callback({ error: FILE_NOT_FOUND });
			return;
		}

		const finalPath = await getPath(filePath, options.file);
		const fileExtension = path.extname(filePath);

		if (!finalPath && fileExtension && fileExtension !== '.html' && fileExtension !== '.asar') {
			callback({ error: FILE_NOT_FOUND });
			return;
		}

		callback({
			path: finalPath || indexPath,
		});
	};

	electron.protocol.registerSchemesAsPrivileged([
		{
			scheme: options.scheme,
			privileges: {
				standard: options.standard,
				secure: options.secure,
				allowServiceWorkers: options.allowServiceWorkers,
				supportFetchAPI: options.supportFetchAPI,
				corsEnabled: options.isCorsEnabled,
			},
		},
	]);

	electron.app.on('ready', () => {
		const session = options.partition
			? electron.session.fromPartition(options.partition)
			: electron.session.defaultSession;

		session.protocol.registerFileProtocol(options.scheme, handler);
	});

	return async (window_, searchParameters, path = "") => {
		const queryString = searchParameters ? '?' + new URLSearchParams(searchParameters).toString() : '';
		await window_.loadURL(`${options.scheme}://${options.hostname}${path}${queryString}`);
	};
}
