<template>
	<div class="vm-assist-preview-popup" :style="popupStyle">
		<transition v-if="mask" :name="animate">
			<div v-show="isActive" class="vm-assist-preview-popup__mask" @click="handleClose" />
		</transition>
		<transition v-if="mask" :name="animate">
			<div v-show="isActive" class="vm-assist-preview-popup__close" @click="handleClose">
				&#10005;
			</div>
		</transition>
		<transition :name="animate">
			<div v-show="isActive" class="vm-assist-preview-popup__content">
				<component :is="componentType" ref="htmlImg">
					<vm-preview 
						:style="styles"
						:data-source="dataSource" 
						:mode="mode"
					/>
				</component>
			</div>
		</transition>
	</div>
</template>

<script>
import { HtmlImg } from '../../../../vc';

export default {
	name: 'vm-preview',
	components: {
		'vc-html-img': HtmlImg
	},
	props: {
		dataSource: Array,
		styles: {
			type: Object
		},
		className: {
			type: String
		},
		animate: {
			type: String,
			default: 'vm-fade'
		},
		mask: {
			type: Boolean,
			default: true
		},
		mode: {
			type: String,
			default: 'draggable'
		},

		// download / image
		expect: {
			type: String,
		},

		imageOpts: Object
	},
	data() {
		return {
			isActive: false,
			transform: `translate(-100px, -100px)`
		};
	},
	computed: {
		isDraggable() {
			return this.mode === 'draggable';
		},
		useImageMode() {
			return this.expect === 'image' || this.expect === 'download';
		},

		componentType() {
			return this.useImageMode ? 'vc-html-img' : 'div';
		},

		popupStyle() {
			if (this.useImageMode) {
				return {
					top: '100%',
					bottom: 'unset'
				};
			}
			return {};
		}
	},
	watch: {
		
	},
	mounted() {
		this.isActive = true;
		this.generateImage();
		this.download();
	},

	methods: {
		async generateImage() {
			if (this.expect !== 'image') return;
			try {
				const res = await this.$refs.htmlImg.getImage(this.imageOpts || {});

				this.isActive = false;
				this.$emit('sure', res);
			} catch (e) {
				this.isActive = false;
				this.$emit('close', res);
			}
		},

		download() {
			// TODO
		},

		handleClose() {
			this.isActive = false;
			setTimeout(() => {
				this.$emit('close');
			}, 300); // 动画时间
		}
	},
};
</script>

<style lang="scss">
.vm-assist-preview-popup {
	position: fixed;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
}
.vm-assist-preview-popup__mask {
	position: absolute;
	z-index: 997;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(#000, 0.2);
	// opacity: 0;
	transition: opacity 0.2s;
}
.vm-assist-preview-popup__content {
	position: relative;
	z-index: 998;
	overflow: auto; // 区域之外不形式
	max-height: 100vh; 
	max-width: 100vw; 
	transition: transform 0.2s, opacity 0.2s;
}
.vm-assist-preview-popup__close {
	position: absolute;
	right: 30px; 
	top: 30px;
	font-size: 24px;
	z-index: 999;
}
.vm-fade-enter, .vm-fade-leave-active {
	opacity: 0;
}
</style>
