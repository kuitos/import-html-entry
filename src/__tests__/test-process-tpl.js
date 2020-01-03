import processTpl, { genIgnoreAssetReplaceSymbol, genLinkReplaceSymbol, genScriptReplaceSymbol } from '../process-tpl';

test('test process-tpl', () => {

	const tpl = '<!DOCTYPE html><html><head>\n' +
		'\n' +
		'<link rel="shortcut icon" href="https://t.alipayobjects.com/images/rmsweb/T1pqpiXfJgXXXXXXXX.png" type="image/x-icon">\n' +
		'<link rel="preload" href="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js">\n' +
		'<link rel="prefetch" href="/a3-ie6-polyfill.js">\n' +
		'<link rel="stylesheet" href="/umi.css">\n' +
		'\n' +
		'<meta charset="utf-8">\n' +
		'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">\n' +
		'<title>&#x91D1;&#x878D;&#x4E91;&#x63A7;&#x5236;&#x53F0;</title>\n' +
		'<script data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script \n ' +
		'data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script>\n' +
		'\n' +
		'// umi version: 2.2.8\n' +
		'// build time: Wed Dec 26 2018 17:54:47 GMT+0800 (CST)\n' +
		'\n' +
		'</script>\n' +
		'<script src="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js"></script>\n' +
		'<script \n' +
		'  src="https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js"\n' +
		'  crossorigin="anonymous"' +
		'></script>' +
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
	expect(scripts).toEqual(['<script data-test>\n  window.routerBase = "/";\n</script>',
		'<script \n data-test>\n  window.routerBase = "/";\n</script>',
		'//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js',
		'https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js',
		'http://kuitos.me/umi.js',
		'http://kuitos.me/comment.js']);
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/umi.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/comment.js')) !== -1).toBeTruthy();

	// 验证 preload prefetch 补全 host 功能，绝对路径的不受影响
	expect(template.indexOf('<link rel="preload" href="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js">') !== -1).toBeTruthy();
	// prefetch/preload 资源不会被 replace
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/a3-ie6-polyfill.js')) !== -1).toBeFalsy();
	// 相对路径的补全 host
	expect(template.indexOf('<link rel="prefetch" href="http://kuitos.me/a3-ie6-polyfill.js">') !== -1).toBeTruthy();

	const { styles, template: template2 } = processTpl(tpl, 'http://kuitos.me/cdn');
	expect(styles[0]).toBe('http://kuitos.me/cdn/umi.css');
	expect(template2.indexOf(genLinkReplaceSymbol('http://kuitos.me/cdn/umi.css')) !== -1).toBeTruthy();

});

test('test ignore js or css', () => {
	const tpl = '<!DOCTYPE html><html><head>\n' +
		'\n' +
		'<link rel="shortcut icon" href="https://t.alipayobjects.com/images/rmsweb/T1pqpiXfJgXXXXXXXX.png" type="image/x-icon">\n' +
		'<link ignore rel="stylesheet" href="/umi.css">\n' +
		'\n' +
		'<meta charset="utf-8">\n' +
		'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">\n' +
		'<title>&#x91D1;&#x878D;&#x4E91;&#x63A7;&#x5236;&#x53F0;</title>\n' +
		'<style ignore>body {color: red}</style>\n' +
		'<style ignore>\n' +
		'	body {\n' +
		'		color: red\n' +
		'	}\n' +
		'</style>\n' +
		'<script' +
		'  src="https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js"\n' +
		'  crossorigin="anonymous"' +
		'></script>' +
		'<script src="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js"></script>\n' +
		'</head>\n' +
		'<body>\n' +
		'\n' +
		'<div id="root"></div>\n' +
		'\n' +
		'<script ignore src="//cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js"></script>\n' +
		'<script src="/app.js"></script>\n' +
		'<script ignore>alert(1)</script>\n' +
		'<script ignore src="/polyfill.js"></script>\n' +
		'\n' +
		'\n' +
		'</body></html>';

	const { entry, template } = processTpl(tpl, 'http://kuitos.me');
	expect(entry).toBe('http://kuitos.me/app.js');

	expect(template.indexOf(genIgnoreAssetReplaceSymbol('style file')) !== -1).toBeTruthy();

	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) === -1).toBeTruthy();
	expect(template.indexOf(genIgnoreAssetReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();

	expect(template.indexOf(genScriptReplaceSymbol('//cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js')) === -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/polyfill.js')) === -1).toBeTruthy();
	expect(template.indexOf(genIgnoreAssetReplaceSymbol('http://kuitos.me/polyfill.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genIgnoreAssetReplaceSymbol('js file')) !== -1).toBeTruthy();
});

test('test resource with no quotation marks', () => {

	const tpl = '<!DOCTYPE html><html><head>\n' +
		'\n' +
		'<link rel="shortcut icon" href=https://t.alipayobjects.com/images/rmsweb/T1pqpiXfJgXXXXXXXX.png type="image/x-icon">\n' +
		'<link rel="preload" href=//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js>\n' +
		'<link rel="prefetch" href=/a3-ie6-polyfill.js>\n' +
		'<link rel=stylesheet href=/umi.css>\n' +
		'\n' +
		'<meta charset="utf-8">\n' +
		'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">\n' +
		'<title>&#x91D1;&#x878D;&#x4E91;&#x63A7;&#x5236;&#x53F0;</title>\n' +
		'<script data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script \n ' +
		'data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script>\n' +
		'\n' +
		'// umi version: 2.2.8\n' +
		'// build time: Wed Dec 26 2018 17:54:47 GMT+0800 (CST)\n' +
		'\n' +
		'</script>\n' +
		'<script src=//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js></script>\n' +
		'<script \n' +
		'  src=https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js\n' +
		'  crossorigin="anonymous"' +
		'></script>' +
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
		'<script src=/umi.js></script>\n' +
		'<!-- <script src=/a1.js></script>' +
		'-->' +
		'<script src=/comment.js></script>\n' +
		'<!-- <script src=/a2.js></script>\n' +
		'-->' +
		'<!--[if IE 6]>\n' +
		'<!-- <script src=/a3-ie6-polyfill.js></script>\n' +
		'<![endif]-->' +
		'\n' +
		'\n' +
		'</body></html>';

	const { entry, scripts, template } = processTpl(tpl, 'http://kuitos.me');
	expect(entry).toBe('http://kuitos.me/comment.js');
	expect(scripts).toEqual(['<script data-test>\n  window.routerBase = "/";\n</script>',
		'<script \n data-test>\n  window.routerBase = "/";\n</script>',
		'//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js',
		'https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js',
		'http://kuitos.me/umi.js',
		'http://kuitos.me/comment.js']);
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/umi.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/comment.js')) !== -1).toBeTruthy();

	// 验证 preload prefetch 补全 host 功能，绝对路径的不受影响
	expect(template.indexOf('<link rel="preload" href=//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js>') !== -1).toBeTruthy();
	// 相对路径的补全 host
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/a3-ie6-polyfill.js')) !== -1).toBeFalsy();
	expect(template.indexOf('<link rel="prefetch" href=http://kuitos.me/a3-ie6-polyfill.js>') !== -1).toBeTruthy();

	const { styles, template: template2 } = processTpl(tpl, 'http://kuitos.me/cdn');
	expect(styles[0]).toBe('http://kuitos.me/cdn/umi.css');
	expect(template2.indexOf(genLinkReplaceSymbol('http://kuitos.me/cdn/umi.css')) !== -1).toBeTruthy();

});

test('test resource mixing quotation marks', () => {

	const tpl = '<!DOCTYPE html><html><head>\n' +
		'\n' +
		'<link rel="shortcut icon" href=https://t.alipayobjects.com/images/rmsweb/T1pqpiXfJgXXXXXXXX.png type="image/x-icon">\n' +
		'<link rel="preload" href=//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js>\n' +
		'<link rel="prefetch" href="/a3-ie6-polyfill.js">\n' +
		'<link rel=stylesheet href="/umi.css">\n' +
		'\n' +
		'<meta charset="utf-8">\n' +
		'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">\n' +
		'<title>&#x91D1;&#x878D;&#x4E91;&#x63A7;&#x5236;&#x53F0;</title>\n' +
		'<script data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script \n ' +
		'data-test>\n' +
		'  window.routerBase = "/";\n' +
		'</script>\n' +
		'<script>\n' +
		'\n' +
		'// umi version: 2.2.8\n' +
		'// build time: Wed Dec 26 2018 17:54:47 GMT+0800 (CST)\n' +
		'\n' +
		'</script>\n' +
		'<script src="//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js"></script>\n' +
		'<script \n' +
		'  src=https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js\n' +
		'  crossorigin="anonymous"' +
		'></script>' +
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
		'<script src=/umi.js></script>\n' +
		'<!-- <script src=/a1.js></script>' +
		'-->' +
		'<script src="/comment.js"></script>\n' +
		'<!-- <script src=/a2.js></script>\n' +
		'-->' +
		'<!--[if IE 6]>\n' +
		'<!-- <script src=/a3-ie6-polyfill.js></script>\n' +
		'<![endif]-->' +
		'\n' +
		'\n' +
		'</body></html>';

	const { entry, scripts, template } = processTpl(tpl, 'http://kuitos.me');
	expect(entry).toBe('http://kuitos.me/comment.js');
	expect(scripts).toEqual(['<script data-test>\n  window.routerBase = "/";\n</script>',
		'<script \n data-test>\n  window.routerBase = "/";\n</script>',
		'//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js',
		'https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.production.min.js',
		'http://kuitos.me/umi.js',
		'http://kuitos.me/comment.js']);
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/umi.css')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/umi.js')) !== -1).toBeTruthy();
	expect(template.indexOf(genScriptReplaceSymbol('http://kuitos.me/comment.js')) !== -1).toBeTruthy();

	// 验证 preload prefetch 补全 host 功能，绝对路径的不受影响
	expect(template.indexOf('<link rel="preload" href=//gw.alipayobjects.com/as/g/antcloud-fe/antd-cloud-nav/0.2.22/antd-cloud-nav.min.js>') !== -1).toBeTruthy();
	// 相对路径的补全 host
	expect(template.indexOf(genLinkReplaceSymbol('http://kuitos.me/a3-ie6-polyfill.js')) !== -1).toBeFalsy();
	expect(template.indexOf('<link rel="prefetch" href="http://kuitos.me/a3-ie6-polyfill.js">') !== -1).toBeTruthy();

	const { styles, template: template2 } = processTpl(tpl, 'http://kuitos.me/cdn');
	expect(styles[0]).toBe('http://kuitos.me/cdn/umi.css');
	expect(template2.indexOf(genLinkReplaceSymbol('http://kuitos.me/cdn/umi.css')) !== -1).toBeTruthy();

});
