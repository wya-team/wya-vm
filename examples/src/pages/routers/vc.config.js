/**
 * 需要处理是测试还是正式
 */
const P_ICON_URL = '//at.alicdn.com/t/font_1096957_79w2lcfxnd6.js';
export default (opts = {}) => ({
	store: opts.store,
	router: opts.router,
	Icon: {
		urls: [P_ICON_URL]
	},
	Upload: {
		URL_UPLOAD_IMG_POST: 'https://wyaoa-new.ruishan666.com/uploadfile/upimg.json?action=uploadimage&encode=utf-8&code=oa',
		URL_UPLOAD_FILE_POST: 'https://wyaoa-new.ruishan666.com/uploadfile/upimg.json?action=uploadimage&encode=utf-8&code=oa'
	}
});
