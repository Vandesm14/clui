const clui = (function () {
	const clui = {
		create: {
			dropdown_section: function (list) {
				let arr = [];
				for (let item of Object.keys(list)) {
					arr.push(
						`<div class="clui-dropdown-item">
							<button>${list[item].name || item || ''}</button>
							<p>${list[item].description || ''}</p>
						</div>`);
				}
				return (
					`<div class="clui-dropdown-section">
						${arr.join('\n')}
					</div>`);
			},
			cli_highlight_list: function(arr) {

			},
			cli_highlight: function (text) {
				return `<p class="cli-highlight">${text}</p>`;
			},
			form: function (cmd, {inputs, id, raw}) {
				let isPage = !!inputs;
				cmd = cmd || {name: '', description: ''};
				inputs = inputs || cmd.inputs || [];
				let arr = [];
				for (let item of inputs) {
					switch (item.type) {
						case 'number':
							arr.push(components.input_number(item, item.name, item.description, item.default));
							break;
						case 'string':
							arr.push(components.input_text(item, item.name, item.description, item.default));
							break;
						case 'boolean':
							arr.push(components.input_checkbox(item, item.name, item.description, item.default));
							break;
						case 'label':
							arr.push(components.output_label(item.name, item.description));
							break;
						case 'button':
							arr.push(components.input_button(item.name, item.description));
							break;
						case 'table':
							arr.push(components.output_table(item.name, item.description, item.data));
							break;
						case 'group':
							let data = this.form(null, {inputs: item.data, raw: true});
							arr.push(`<div class="clui-form-group">${data.join('\n')}</div>`);
							break;
						default:
						arr.push(components.output_label('Invalid type', '<span style="color:red">Check command data</span>"'));
					}
				}
				if (isPage) {
					// arr.unshift(components.output_label('', cmd.name));
				} else {
					arr.unshift(components.output_label(cmd.name, cmd.description));
					arr.push(components.input_run('run'));
				}
				if (raw) {
					return arr;
				} else {
					return (
						`<div class="clui-form" clui-id="${id}">
							<div class="clui-form-buttons">
								<img src="icons/back.png" class="clui-form-back" title="back">
								<img src="icons/restart.png" class="clui-form-restart" title="restart">
								<img src="icons/close.png" class="clui-form-close" title="close">
							</div>
							<form class="clui-form-box" action="#" onsubmit="return false;">
								${arr.join('\n')}
							</form>
						</div>`);
				}
			}
		}
	};

	const components = {
		input_checkbox: function (obj, name, desc, base) {
			if (obj.mode === 'option') {
				name = `--${obj.name}`;
				if (obj.short) name = `-${obj.short}, --${obj.name}`;
			}
			return (
				`<div class="clui-input clui-input-checkbox">
					<div class="clui-checkbox-container">
						<p>${name}</p>
						<input type="checkbox" value="${base || false}" name="${name + '::' + obj.type}">
						<div class="clui-checkbox-checkmark"></div>
					</div>
					<label>${desc || ''}</label>
				</div>`);
		},
		input_text: function (obj, name, desc, base) {
			if (obj.mode === 'option') {
				name = `--${obj.name}`;
				if (obj.short) name = `-${obj.short}, --${obj.name}`;
			}
			return (
				`<div class="clui-input clui-input-text">
					<p class="clui-text-placeholder">${name}</p>
					<input type="text" value="${base || ''}" name="${name + '::' + obj.type}">
					<label>${desc || ''}</label>
				</div>`);
		},
		input_number: function (obj, name, desc, base) {
			if (obj.mode === 'option') {
				name = `--${obj.name}`;
				if (obj.short) name = `-${obj.short}, --${obj.name}`;
			}
			return (
				`<div class="clui-input clui-input-text">
					<p class="clui-text-placeholder">${name}</p>
					<input type="number" value="${base || ''}" name="${name + '::' + obj.type}">
					<label>${desc || ''}</label>
				</div>`);
		},
		input_button: function (name, desc) {
			return (
				`<div class="clui-input clui-input-button">
					<button>${name}</button>
					<label>${desc || ''}</label>
				</div>`);
		},
		input_run: function (name, desc) {
			return (
				`<div class="clui-input clui-input-button">
					<button class="clui-form-run">${name || 'run'}</button>
					<label>${desc || ''}</label>
				</div>`);
		},
		output_label: function (name, desc) {
			return (
				`<div class="clui-output clui-output-label">
					<p>${name || ''}</p>
					<label>${desc || ''}</label>
				</div>`);
		},
		output_table: function (name, desc, data) {
			let keys = [];
			for (let item of data) {
				Object.keys(item).forEach(el => {if (keys.indexOf(el) === -1) keys.push(el);});
			}
			return (
				`<table class="clui-output clui-output-table">
					<tr>${keys.map(el => '<th>' + el + '</th>').join('')}</tr>\n
					${data.map(el => '<tr>' + keys.map(el2 => '<td>' + (el[el2] || '') + '</td>').join('') + '</tr>\n').join('')}
				</table>`);
		}
	};

	return clui;
})();