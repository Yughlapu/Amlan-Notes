import type * as MarkdownIt from 'markdown-it';
const JSON5 = require('json5').default;
const abcjs = require('abcjs');
const Entities = require('html-entities').AllHtmlEntities;
const htmlentities = new Entities().encode;

interface AbcContent {
	options: object;
	markup: string;
}

const parseOptions = (options: string) => {
	options = options.trim();
	if (!options) return {};

	try {
		const o = JSON5.parse(options);
		return o ? o : {};
	} catch (error) {
		error.message = `Could not parse options: ${options}: ${error.message}`;
		throw error;
	}
};

const parseAbcContent = (content: string): AbcContent => {
	const pieces = content.split(/\n---\n/g);
	if (pieces.length < 2) return { markup: content.trim(), options: {} };

	return {
		markup: pieces[1].trim(),
		options: parseOptions(pieces[0]),
	};
};

const plugin = (markdownIt: MarkdownIt) => {
	const defaultRender = markdownIt.renderer.rules.fence || function(tokens, idx, options, env, self) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Imported from ABC plugin and don't want to change the function signature as I'm not sure if it's a type issue or if env and self really aren't needed
		return (self.renderToken as any)(tokens, idx, options, env, self);
	};

	markdownIt.renderer.rules.fence = function(tokens, idx, options, env, self) {
		const token = tokens[idx];
		if (token.info !== 'abc') return defaultRender(tokens, idx, options, env, self);

		const elementId = `abc_target_${Math.random()}_${Date.now()}`;
		const element = document.createElement('div');

		let html = '';

		try {
			const globalOptions = {}; // TODO: migrate settings //parseOptions(pluginOptions.settingValue('options'));

			element.setAttribute('id', elementId);
			element.style.display = 'none';
			document.body.appendChild(element);
			const parsed = parseAbcContent(token.content);
			abcjs.renderAbc(elementId, parsed.markup, { ...globalOptions, ...parsed.options });
			html = `<div class="abc-notation-block">${element.innerHTML}</div>`;
		} catch (error) {
			console.error('ABC:', error);
			return `<div style="border: 1px solid red; padding: 10px;">Could not render ABC notation: ${htmlentities(error.message)}</div>`;
		} finally {
			// Remove the element appears to fail when exporting to PDF ("element is not a
			// child of parent"). So we put this in a try/catch block too.
			try {
				document.body.removeChild(element);
			} catch (error) {
				console.warn('ABC: Could not remove child element:', error);
			}
		}

		return html;
	};
};

const assets = () => {
	return [
		{
			inline: true,
			mime: 'text/css',
			text: `
				.abc-notation-block svg {
					background-color: white;
				}
			`,
		},
	];
};

export default {
	plugin,
	assets,
};

