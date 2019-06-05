const { resolve } = require('path');
const fs = require('fs-extra');
const routes = require('./modules/root');

module.exports = {
	dir: `${process.cwd()}/src/pages/`, 
	type: 'routeForVue',
	project: 'xls',
	routes
};