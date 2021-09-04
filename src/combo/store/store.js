import BaseWatcher from './base';
import { cloneDeep, isEqualWith } from '../../utils/helper';

class Store extends BaseWatcher {
	constructor(combo, initialState = {}) {
		super();

		if (!combo) {
			throw new Error('combo必传');
		}
		this.combo = combo;

		/**
		 * 初始化配置项信息
		 */
		Object.keys(initialState).forEach(key => {
			this.states[key] = initialState[key];
		});
	}

	mutations = {
		/**
		 * TODO: 增加对数据的合法性校正
		 */
		INIT(states, data) {
			// 用户是否修改了数据或引用。TODO: 去掉isEqualWith
			if (
				states._data === data 
				|| isEqualWith(data, states.data)
			) {
				return;
			}

			const rebuildData = this._makeRebuildData(data);

			states._data = rebuildData; // clone
			states.data = rebuildData; // reset

			// 同步页面设置数据
			this.updatePageEditor(rebuildData);
			// 同步历史数据
			this.updateCurrentEditor();
		},
		CREATE(states, payload) {
			let { id, index, data } = payload;

			states.data.splice(index, 0, data);

			// 同步历史数据
			this.updateHistory('CREATE', {
				...payload,
				data,
				index
			});
		},
		DELETE(states, payload) {
			let { id, revert } = payload;
			let index = states.data.findIndex(i => i.id === id);
			let data = states.data[index];

			states.data.splice(index, 1);

			// 同步编辑数据
			this.resetCurrentEditor();
			// 同步历史数据
			this.updateHistory('DELETE', {
				...payload,
				revert,
				data,
				index
			});
		},
		/**
		 * changed 修改的字段
		 * original 原始字段
		 * revert: 表示撤回时额外回滚次数
		 * history 为true时记录历史, 默认值true
		 */
		UPDATE(states, payload) {
			let { id, changed, original = {}, history = true, revert } = payload;
			let index = states.data.findIndex(i => i.id === id);
			
			// 只有original时已经同步修改
			changed && Object.keys(changed).forEach(key => {
				original[key] = states.data[index][key];
				states.data[index][key] = changed[key];
			});

			// 同步编辑数据
			states.currentEditor 
				&& states.currentEditor.id === id
				&& this.resetCurrentEditor(states.data[index]);
			
			// 同步历史数据
			if (history) {
				this.updateHistory('UPDATE', { 
					...payload, 
					revert,
					original, 
					data: states.data[index],
					index
				});
			}
		},

		/**
		 * changed 修改的字段（sorting）
		 * original 原始字段（sorted）
		 * revert: 表示撤回时额外回滚次数
		 * history 为true时记录历史, 默认值true
		 */
		SORT(states, payload) {
			let { changed, original, history = true, revert } = payload;
			// 是否记录历史
			if (changed && changed[0] !== changed[1]) {

				let current = states.data[changed[0]];
				let target = states.data[changed[1]];

				if (
					target.z 
					&& current.z 
					&& current.z != target.z
				) {
					current.z = target.z;
				}

				states.data.splice(changed[1] + (changed[0] < changed[1]), 0, current);
				states.data.splice(changed[0] + (changed[0] > changed[1]), 1);
			}

			// 同步历史数据
			if (history && (!original || original[0] !== original[1])) {
				this.updateHistory('SORT', { original: changed || original, revert });
			}
		},

		/**
		 * 仿操作
		 * 仅仅用于记录，记录需要回滚的次数 
		 * revert: 表示撤回时额外回滚次数
		 */
		DUMMY(states, payload) {
			let { revert } = payload;
			this.updateHistory('DUMMY', { ...payload, revert });
		},

		UNDO(states, payload) {
			let { current } = payload;
			states.currentSnapshot = current;

			let { type, id, data, index, original } = this.historyData[current] || {};
			let fn = {
				CREATE: () => states.data.splice(index, 1),
				DELETE: () => states.data.splice(index, 0, data),
				UPDATE: () => states.data.splice(index, 1, cloneDeep({ ...data, ...original })),
				SORT: () => this.commit('SORT', { changed: original, history: false }),
				DUMMY: () => {}
			};
			fn[type] && fn[type]();

			// 同步编辑数据
			states.currentEditor 
				&& states.currentEditor.id === id
				&& this.resetCurrentEditor(states.data[index]);
		},
		REDO(states, payload) {
			let { current } = payload;
			states.currentSnapshot = current;

			let { type, id, data, index, original } = this.historyData[current - 1] || {};
			let fn = {
				CREATE: () => states.data.splice(index, 1, data),
				DELETE: () => states.data.splice(index, 1),
				UPDATE: () => states.data.splice(index, 1, data),
				SORT: () => this.commit('SORT', { changed: original, history: false }),
				DUMMY: () => {}
			};
			fn[type] && fn[type]();

			// 同步编辑数据
			states.currentEditor 
				&& states.currentEditor.id === id
				&& this.resetCurrentEditor(states.data[index]);
		}
	}

	/**
	 * 基本不用, 资源默认回收（目前不存在定时器和事件监听）;
	 */
	destroy() {
		this.$destroy();
	}

	commit(name, ...args) {
		name = name.toUpperCase();

		const { mutations } = this;
		if (mutations[name]) {
			mutations[name].apply(this, [this.states].concat(args));
		} else {
			throw new Error(`[wya-vm/combo]: mutation 未定义 - ${name}`);
		}
	}

	/**
	 * 数据与初始数据合并，避免修改时无响应
	 */
	_makeRebuildData(source) {
		let { modules } = this.combo.$options;
		let result = cloneDeep(source).map((it) => {
			let { data = {}, rebuilder = {} } = modules[it.module] || {};

			typeof data === 'function' && (data = data());
			typeof rebuilder === 'function' && (rebuilder = rebuilder());

			// TODO: 深度遍历，目前仅一层
			Object.keys(it).forEach(key => {
				if (!rebuilder[key]) return;
				if (it[key] instanceof Array) {
					it[key] = it[key].map((children) => {
						return {
							...rebuilder[key],
							...children
						};
					});
				} else if (it[key] instanceof Object) {
					it[key] = {
						...rebuilder[key],
						...it[key]
					};
				}
			});

			return {
				...data,
				...it
			};
		});
		return result;
	}
}

export default Store;
