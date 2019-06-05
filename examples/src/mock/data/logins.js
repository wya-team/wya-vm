let Mock = require('mockjs');

let { Random } = Mock;

module.exports = (req, res) => ({
	status: 1,
	data: {
		token: 'KHK5454HJK212'
	}
});