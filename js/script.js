let history = [];
let forms = {};
let autocomplete = 0;
let system = {
	add: function (str) {
		if (this.current.commands[str]) {
			this.current = {name: str, ...this.current.commands[str]};
			this.arr.push(this.current);
			if (this.arr.length === 2) this.string += `${str}`;
			else this.string += ` ${str}`;
			
			$('#cli-highlight-list').append(clui.create.cli_highlight(this.current.name));
			$('.clui-cli input').val('');
			$('.clui-cli input').attr('placeholder', this.current.description);
			updateDropdown();

			return true;
		} else if (str.trim() === '') {
			return false;
		} else {
			return Object.keys(this.current.commands).filter(el => new RegExp(str).test(el));
		}
	},
	back: function () {
		if (this.arr.length > 1) {
			let pop = this.arr.pop();
			this.current = this.last();
			this.string = this.string.replace(new RegExp(`${pop}$`), '');

			updateDropdown();
			$('.clui-cli input').val('');
			if ($(this).val() === '' && this.isRoot()) {
				$('.clui-cli input').attr('placeholder', 'Enter a command');
			} else if ($(this).val() === '') {
				$('.clui-cli input').attr('placeholder', this.current.description);
			}
			if (this.canRender()) {
				$('.clui-cli-run').show();
			} else {
				$('.clui-cli-run').hide();
			}

			return pop;
		} else {
			return false;
		}
	},
	isRoot: function () {
		return this.arr.length === 1;
	},
	render: function (args) { // TODO: Check if form is page or initial form
		if (this.current.run) {
			let id = hash();
			if (this.current.inputs && this.current.inputs.length > 0) { // if inputs exist, render form
				$('.clui-form-container').prepend(clui.create.form(this.current, {id}));
				forms[id] = this.current;
			} else {
				history.push(this.string);
				$('.clui-form-container').prepend(clui.create.form(this.current, {inputs: this.current.run().page, id}));
			}
			$('.clui-text-placeholder').each(function () {
				$(this).toggleClass('clui-shrink-blur', $(this).siblings('input').val() !== '');
			});
			this.clear();
			return true;
		} else {
			return false;
		}
	},
	canRender: function (cmd) {
		if (cmd) {
			return !!cmd.run;
		} else {
			return !!this.current.run;
		}
	},
	parse: function (str) {
		
	},
	find: function (str, asRaw) {
		if (!asRaw && this.current.commands[str]) {
			return {name: str, ...this.current.commands[str]};
		} else {
			let filter = Object.keys(this.current.commands).filter(el => new RegExp(str).test(el));
			let ret = {};
			if (asRaw) {
				filter.forEach(el => ret[el] = this.current.commands[el]);
				return ret;
			} else {
				return filter;
			}
		}
	},
	clear: function () {
		this.arr = [clui];
		this.current = clui;
		this.string = '';

		$('#cli-highlight-list').empty();
		$('.clui-cli input').val('');
		$('.clui-cli input').attr('placeholder', 'Ender a command');
		$('.clui-cli-run').hide();
		updateDropdown(this.first());
	},
	last: function () {
		return this.arr[this.arr.length - 1];
	},
	first: function () {
		return this.arr[0].commands;
	},
	current: clui, // Gives the .commands property
	arr: [clui],
	string: ''
};

$(document).ready(function () {
	updateDropdown(system.first());

	$(document).on('click', '.cli-highlight', function () {
		let max = system.arr.length - $(this).index() - 1;
		for (let i = 0; i < max; i++) {
			let last = $('#cli-highlight-list').find('.cli-highlight').last();
			last.remove();
			system.back();
		}
	});

	$(document).on('focus', '.clui-cli input', function () {
		$('.clui-dropdown-item').eq(autocomplete).addClass('clui-active');
	});
	$(document).on('blur', '.clui-cli input', function () {
		$('.clui-dropdown-item.clui-active').removeClass('clui-active');
	});

	$(document).on('mouseup', '.clui-cli input', function () {
		let parsed = parse($(this).val(), {cursor: Math.min($(this)[0].selectionStart, $(this)[0].selectionEnd)});
		if (parsed.inputs && parsed.inputs.length > 0) { // if inputs
			let parsedLast = parsed.inputs.find(el => el.selected) || parsed.inputs[parsed.inputs.length - 1];
			updateDropdown([{...parsedLast, description: parsedLast.input.description}]);
		}
	});
	$(document).on('keydown', '.clui-cli input', function (e) {
		if (e.key === 'Backspace' && $(this)[0].selectionStart === 0) {
			if (system.arr.length > 1) { // if not root command
				let last = $('#cli-highlight-list').find('.cli-highlight').last();
				last.remove();
				system.back();
				updateDropdown();
				if (!e.ctrlKey) {
					e.preventDefault();
					$('.clui-cli input').val(last.text() + $('.clui-cli input').text());
				}
				$('.clui-cli input').attr('placeholder', system.current.description);
			}
		} else if (e.key === ' ' || e.key === 'Enter') {
			let parsed = parse($(this).val(), {cursor: Math.min($(this)[0].selectionStart, $(this)[0].selectionEnd)});
			if (parsed.cmd && parsed.cmd.length) {
				e.preventDefault();
				for (let cmd of parsed.cmd) {
					system.add(cmd.name);
				}
			}
			if (e.key === 'Enter') system.render();
		} else if (e.key === 'ArrowUp') {
			if (autocomplete > 0) {
				autocomplete--;
				$('.clui-dropdown-item.clui-active').removeClass('clui-active');
				$('.clui-dropdown-item').eq(autocomplete).addClass('clui-active');
			}
		} else if (e.key === 'ArrowDown') {
			if (autocomplete < system.find().length - 1) {
				autocomplete++;
				$('.clui-dropdown-item.clui-active').removeClass('clui-active');
				$('.clui-dropdown-item').eq(autocomplete).addClass('clui-active');
			}
		} else if (e.key === 'Tab') {
			e.preventDefault();
			let find = system.find($(this).val());
			if (Array.isArray(find)) { // if autocomplete list
				system.add(find[autocomplete]);
			} else {
				if (!system.add($(this).val())) return;
			}
		}
		if (system.canRender()) {
			$('.clui-cli-run').show();
		} else {
			$('.clui-cli-run').hide();
		}
	});
	$(document).on('keyup', '.clui-cli input', function (e) {
		if ($(this).val() === '' && system.isRoot()) {
			$('.clui-cli input').attr('placeholder', 'Enter a command');
		} else if ($(this).val() === '') {
			$('.clui-cli input').attr('placeholder', system.current.description);
		}
		if (system.canRender()) {
			$('.clui-cli-run').show();
		} else {
			updateDropdown(system.find($(this).val(), true));
			$('.clui-cli-run').hide();
		}
		let parsed = parse($(this).val(), {cursor: Math.min($(this)[0].selectionStart, $(this)[0].selectionEnd)});
		if (parsed.inputs && parsed.inputs.length > 0) { // if inputs
			let parsedLast = parsed.inputs.find(el => el.selected) || parsed.inputs[parsed.inputs.length - 1];
			console.log('parsed.inputs', parsedLast);
			updateDropdown([{...parsedLast, description: parsedLast.input.description}]);
		}
	});
	
	$(document).on('focus', '.clui-input-text > input', function () {
		$(this).siblings('.clui-text-placeholder').removeClass('clui-shrink-blur');
		$(this).siblings('.clui-text-placeholder').addClass('clui-shrink-active');
	});
	$(document).on('blur', '.clui-input-text > input', function () {
		$(this).siblings('.clui-text-placeholder').removeClass('clui-shrink-active clui-shrink-blur');
		$(this).siblings('.clui-text-placeholder').toggleClass('clui-shrink-blur', $(this).val() !== '');
	});

	$(document).on('click', '.clui-cli-run', function () {
		system.render();
	});

	$(document).on('click', '.clui-dropdown-item', function () {
		if (system.add($(this).find('button').text()) === true) {
			if ($('.clui-cli input').val() === '' && system.isRoot()) {
				$('.clui-cli input').attr('placeholder', 'Enter a command');
			} else if ($('.clui-cli input').val() === '') {
				$('.clui-cli input').attr('placeholder', system.current.description);
				if (system.canRender()) {
					if (!system.render()) {
						$('.clui-cli-run').show();
					}
				} else {
					$('.clui-cli-run').hide();
				}
			}
		}
	});

	$(document).on('click', '.clui-form-close', function () {
		let id = $(this).closest('.clui-form').attr('clui-id');
		$(this).closest('.clui-form').remove();
		delete forms[id];
	});
	$(document).on('click', '.clui-form-restart', function () {
		// TODO: If no inputs, run and replaceWith page
		let id = $(this).closest('.clui-form').attr('clui-id');
		$(this).closest('.clui-form').replaceWith(clui.create.form(forms[id], {id}));

		$('.clui-text-placeholder').each(function () {
			$(this).toggleClass('clui-shrink-blur', $(this).siblings('input').val() !== '');
		});
	});
	$(document).on('click', '.clui-form-back', function () {
		// TODO: Fill form with previous inputs
	});

	$(document).on('click', '.clui-form-run', function () {
		let id = $(this).closest('.clui-form').attr('clui-id');
		if (system.canRender(forms[id])) {
			let form = $(this).closest('form.clui-form-box').serializeArray();
			let obj = {};
			form.forEach(el => {
				let name = el.name.split('::')[0];
				obj[name] = el.value;
			});
			let run = forms[id].run(obj);
			$(this).closest('.clui-form').replaceWith(clui.create.form(forms[id], {id, inputs: run.page}));
		}
	});
});

function updateDropdown(arr) {
	$('#clui-dropdown').html(clui.create.dropdown_section(arr || system.current.commands || []));
	let offset = $('.cli-icon').css('display') === 'none' ? -6 : 28;
	$('#clui-dropdown .clui-dropdown-item').css('padding-left', $('#cli-highlight-list').width() + offset);
	autocomplete = 0;
	if ($('.clui-cli input:focus').length === 1) $('.clui-dropdown-item').eq(autocomplete).addClass('clui-active');
}

function hash() {
	return Math.random().toString(36).slice(2);
}

console.log(parse('parser-test "random string" 123.123 --option hello'));

function parse(string, {root, cursor} = {}) {
	root = root || system.last();
	let sel = cursor === undefined ? 0 : cursor;
	let arr = lex(string);
	let inputs = organize(arr);

	function lex(string) {
		let arr = [];
		let accumulator = '';
		let type = '';
		for (let i = 0; i < string.length; i++) {
			let char = string[i];
			if (char.match(/["']/)) { // string
				if (type === char) { // end string
					arr.push({type: 'string', val: accumulator});
					accumulator = '';
					type = '';
				} else { // new string
					type = char;
				}
			} else if (char.match(/[0-9.]/) || char.match(/\-/) && string[i+1] && string[i+1].match(/[0-9.]/)) { // number
				if (string[i-1] === ' ' || i-1 === -1) { // new number
					type = 'number';
					accumulator = char;
				} else { // number
					accumulator += char;
				}
			} else if (char.match(/\-/) && type === '') { // none of the above
				if (char.match(/\-/) && string[i+1] && string[i+1].match(/\-/)) {
					type = 'option';
					i++;
				} else {
					type = 'flag';
				}
			} else if (char.match(/\s/)) { // none of the above or EOF
				if (!type.match(/["']/) && !string[i-1].match(/["']/)) { // not string and wasn't string
					arr.push({type, val: accumulator});
					accumulator = '';
					type = '';
				} else {
					accumulator += char;
				}
			} else { // none of the above (DATA)
				if (type === '') type = 'ident';
				accumulator += char;
			}
			if (i === sel) sel = {type, index: arr.length - 1};
		}
		arr.push({type, val: accumulator});
		sel.index++;
		return arr;
	}

	function organize(arr) {
		arr.forEach((el, i) => arr[i].rel = ['ident', 'number', 'string'].includes(arr[i].type) ? 'data' : 'ident');
		let prev = '';
		let inputs = [];
		let cmdList = [];
		for (let i = 0; i < arr.length; i++) {
			let item = arr[i];
			if (sel && sel.index !== undefined && sel.index === i) item.selected = true;
			if (item.type === 'ident' && root.commands && root.commands[item.val]) { // is sub-command
				root = {name: item.val, ...root.commands[item.val], selected: item.selected || false};
				cmdList.push(root);
				item.mode = 'cmd';
				prev = 'command';
			} else if (root.inputs) { // if has inputs
				if (item.type === 'flag') { // is flag
					let index = root.inputs.find(el => (el.short === item.val || el.name === item.val) && el.type === 'boolean');
					if (index) {
						inputs.push({name: item.val, val: true, input: index, selected: item.selected || false});
						prev = 'flag';
					}
				} else if (item.type === 'option') { // is option
					let index = root.inputs.find(el => el.name === item.val && el.mode !== 'param');
					if (index) {
						if (arr[i+1] && arr[i+1].rel === 'data' && arr[i+1].type === index.type) {
							inputs.push({name: item.val, val: arr[i+1].val, input: index, selected: item.selected || false});
						} else if (index.type === 'boolean') {
							inputs.push({name: item.val, val: true, input: index, selected: item.selected || false});
						}
						prev = 'option';
					}
				} else { // any data
					if (item.type === 'ident' || item.type === 'string' || item.type === 'number') {
						let params = root.inputs.filter(el => el.mode === 'param').map(el => el.name); // find all params
						let paramIndex = arr.filter(el => el.mode === undefined).indexOf(item); // get index of current param
						let index = root.inputs.find(el => el.name === params[paramIndex] && el.mode === 'param');
						inputs.push({name: params[paramIndex], val: item.val, input: index, selected: item.selected || false});
					}
				}
			} else {
				return {inputs, cmd: cmdList};
			}
		}

		return {inputs, cmd: cmdList};
	}

	return inputs;
}