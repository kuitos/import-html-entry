import processTpl, { genLinkReplaceSymbol, genScriptReplaceSymbol } from '../process-tpl';

test('test process-tpl', () => {

	const tpl = '<!DOCTYPE html><html><head>\n' +
		'\n' +
		'<link rel="shortcut icon" href="https://t.alipayobjects.com/images/rmsweb/T1pqpiXfJgXXXXXXXX.png" type="image/x-icon">\n' +
		'<link rel="stylesheet" href="/umi.css">\n' +
		'\n' +
		'<meta charset="utf-8">\n' +
		'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">\n' +
		'<title>&#x91D1;&#x878D;&#x4E91;&#x63A7;&#x5236;&#x53F0;</title>\n' +
		'<script>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script>\n' +
		'\n' +
		'// bigfish version: 2.7.2\n' +
		'// umi version: 2.2.8\n' +
		'// build time: Wed Dec 26 2018 17:54:47 GMT+0800 (CST)\n' +
		'\n' +
		'</script>\n' +
		'<script src="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js"></script>\n' +
		'<style>\n' +
		'body {\n' +
		'background-color: red;\n' +
		'}\n' +
		'</style>\n' +
		'</head>\n' +
		'<body>\n' +
		'\n' +
		'<div id="root"></div>\n' +
		'\n' +
		'<script src="/umi.js"></script>\n' +
		'<!-- <script src="/a1.js"></script>' +
		'-->' +
		'<script src="/comment.js"></script>\n' +
		'<!-- <script src="/a2.js"></script>\n' +
		'-->' +
		'<!--[if IE 6]>\n' +
		'<!-- <script src="/a3-ie6-polyfill.js"></script>\n' +
		'<![endif]-->' +
		'\n' +
		'\n' +
		'</body></html>';

	const { entry, scripts, template } = processTpl(tpl, 'http://kuitos.me');
	expect(entry).toBe('http://kuitos.me/comment.js');
	expect(scripts).toEqual([ '<script>\n  window.routerBase = "/";\n</script>',
	'//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js',
	'http://kuitos.me/umi.js',
	'http://kuitos.me/comment.js' ]);
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/umi.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/comment.js')) !== -1).toBeTruthy();

	const { styles, template: template2 } = processTpl(tpl, 'http://kuitos.me/cdn');
	expect(styles[0]).toBe('http://kuitos.me/cdn/umi.css');
	expect(styles[1]).toBe(`<style>\nbody {\nbackground-color: red;\n}\n</style>`);
	expect(template2.indexOf(genLinkReplaceSymbol('http://kuitos.me/cdn/umi.css')) !== -1).toBeTruthy();

});
