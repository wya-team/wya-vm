/**
 * 中间件
 */
import createLogger from 'vuex/dist/logger';
import createApi from './plugins/api';

/**
 * 根级别
 */
import { actions } from './actions';
import { mutations } from './mutations';
import modules from './modules/root';

const debug = process.env.NODE_ENV !== 'production';

export const storeConfig = {
	strict: debug,
	plugins: debug ? [createLogger(), createApi()] : [createApi()],
	actions,
	mutations,
	modules
};