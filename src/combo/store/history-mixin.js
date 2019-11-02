import { cloneDeep } from '../../utils/helper';

export default {
	data() {
		return {
			states: {
				currentSnapshot: 0,
				totalSnapshot: 0,
			}
		};
	},
	created() {
		this.historyData = [];
	},
	methods: {
		verifyChange(key) {
			if (!key) {
				throw new Error('[wya-vm/combo]: id / original 必传');
			}
		},
		updateHistory(type, payload) {
			const { data, currentSnapshot, totalSnapshot } = this.states;
			const { id, original, index } = payload;
			const snapshot = {
				type,
				id,
				original,
				index: id && typeof index === 'undefined' 
					? data.findIndex(item => item.id === id) 
					: index,
				data: cloneDeep(data.find(item => item.id === id)),
			};

			// 继续插入，还是以当前停留位置插入
			currentSnapshot === totalSnapshot 
				? this.historyData.push(snapshot)
				: this.historyData.splice(currentSnapshot, totalSnapshot - currentSnapshot, snapshot);

			let { length } = this.historyData;
			this.states.currentSnapshot = length;
			this.states.totalSnapshot = length;
		}
	}
};
