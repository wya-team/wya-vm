/* eslint-disable */
/**
 * http://www.expressjs.com.cn/4x/api.html#res
 */
const { resolve } = require('path');
const fs = require('fs-extra');


module.exports = (req, res, next) => {
	// res.header('X-Hello', 'World');
	const fullpath = resolve(__dirname, `./data${req.path}`);
	
	let fn = require(fullpath);

	res.send(fn(req, res));
	res.status(200).end();

	// next();
};