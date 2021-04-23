
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var index = (function () {
    'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const current$1 = writable({});

    let current = {commands};
    current$1.subscribe(value => {
    	current = value;
    });

    const clui = {
    	execute: function(name) {
    		if (Object.keys(current.commands).includes(name)) { // if command exists
    			console.log('run:', name);
    			// parse args
    			// check args
    			// run command
    		}
    	},
    	parse: function(value) {
    		let raw = value;
    		value = this.tokenize(value);
    		let command = {commands};
    		for (let token of value) {
    			if (Object.keys(command.commands).includes(token)) { // if command exists
    				console.log(command, 'command exists');
    				if (raw[raw.indexOf(token) + token.length]) command = command.commands[token];
    			} else {
    				console.log(command, 'command does not exist');
    			}
    		}
    		// this.setCurrent(command);
    		current$1.update(value => command);
    	},
    	setCurrent: function(name) {
    		if (Object.keys(current.commands).includes(name)) { // if command exists
    			console.log('set:', name);
    			current$1.update(value => current.commands[name]);
    		}
    	},
    	tokenize: function(input) {
    		let arr = input.split('');
    		let tokens = [];
    		let accumulator = '';
    		let stringType = false;
    		for (let i = 0; i < arr.length; i++) {
    			const char = arr[i];
    			if (char === ' ') {
    				if (stringType === false) { // Not inside string
    					tokens.push(accumulator);
    					accumulator = '';
    				} else { // Inside string
    					accumulator += char;
    				}
    			} else if (char === '"') {
    				if (stringType === '"') { // Closing token
    					stringType = false;
    					accumulator += char;
    					tokens.push(accumulator);
    					accumulator = '';
    					i++;
    				} else if (stringType === "'") { // Ignore
    					accumulator += char;
    				} else { // New string
    					accumulator += char;
    					stringType = '"';
    				}
    			} else if (char === "'") {
    				if (stringType === "'") { // Closing token
    					stringType = false;
    					accumulator += char;
    					tokens.push(accumulator);
    					accumulator = '';
    					i++;
    				} else if (stringType === '"') { // Ignore
    					accumulator += char;
    				} else { // New string
    					accumulator += char;
    					stringType = "'";
    				}
    			} else {
    				accumulator += char;
    			}
    		}
    		if (accumulator !== '') tokens.push(accumulator);
    		return tokens;
    	}
    };

    /* src/Index.svelte generated by Svelte v3.35.0 */

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (34:2) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let each_value_1 = Object.keys(/*$current*/ ctx[1].args);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$current, Object, Array*/ 2) {
    				each_value_1 = Object.keys(/*$current*/ ctx[1].args);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (27:2) {#if $current?.commands}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = Object.keys(/*$current*/ ctx[1].commands);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*clui, Object, $current*/ 2) {
    				each_value = Object.keys(/*$current*/ ctx[1].commands);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (35:3) {#each Object.keys($current.args) as argument}
    function create_each_block_1(ctx) {
    	let div;
    	let span0;

    	let t0_value = (Array.isArray(/*$current*/ ctx[1].args[/*argument*/ ctx[8]].name)
    	? /*$current*/ ctx[1].args[/*argument*/ ctx[8]].name.join(", ")
    	: /*$current*/ ctx[1].args[/*argument*/ ctx[8]].name) + "";

    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*$current*/ ctx[1].args[/*argument*/ ctx[8]].description + "";
    	let t2;
    	let t3;

    	return {
    		c() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			attr(span0, "class", "clui-dropdown-name svelte-3v99mr");
    			attr(span1, "class", "clui-dropdown-description");
    			attr(div, "class", "clui-dropdown-item svelte-3v99mr");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span0);
    			append(span0, t0);
    			append(div, t1);
    			append(div, span1);
    			append(span1, t2);
    			append(div, t3);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$current*/ 2 && t0_value !== (t0_value = (Array.isArray(/*$current*/ ctx[1].args[/*argument*/ ctx[8]].name)
    			? /*$current*/ ctx[1].args[/*argument*/ ctx[8]].name.join(", ")
    			: /*$current*/ ctx[1].args[/*argument*/ ctx[8]].name) + "")) set_data(t0, t0_value);

    			if (dirty & /*$current*/ 2 && t2_value !== (t2_value = /*$current*/ ctx[1].args[/*argument*/ ctx[8]].description + "")) set_data(t2, t2_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (28:3) {#each Object.keys($current.commands) as command}
    function create_each_block(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*command*/ ctx[5] + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*$current*/ ctx[1].commands[/*command*/ ctx[5]].description + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*command*/ ctx[5]);
    	}

    	return {
    		c() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			attr(span0, "class", "clui-dropdown-name svelte-3v99mr");
    			attr(span1, "class", "clui-dropdown-description");
    			attr(div, "class", "clui-dropdown-item svelte-3v99mr");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span0);
    			append(span0, t0);
    			append(div, t1);
    			append(div, span1);
    			append(span1, t2);
    			append(div, t3);

    			if (!mounted) {
    				dispose = listen(div, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$current*/ 2 && t0_value !== (t0_value = /*command*/ ctx[5] + "")) set_data(t0, t0_value);
    			if (dirty & /*$current*/ 2 && t2_value !== (t2_value = /*$current*/ ctx[1].commands[/*command*/ ctx[5]].description + "")) set_data(t2, t2_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	let div4;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let input;
    	let t2;
    	let div2;
    	let t3;
    	let div3;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$current*/ ctx[1]?.commands) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			div4 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			div2 = element("div");
    			if_block.c();
    			t3 = space();
    			div3 = element("div");
    			if (img.src !== (img_src_value = "")) attr(img, "src", img_src_value);
    			attr(img, "alt", "");
    			attr(img, "class", "clui-cli-icon");
    			attr(div0, "class", "clui-cli-autocomplete");
    			attr(input, "type", "text");
    			attr(input, "placeholder", "enter a command");
    			attr(input, "class", "svelte-3v99mr");
    			attr(div1, "class", "clui-cli-input svelte-3v99mr");
    			attr(div2, "class", "clui-cli-dropdown svelte-3v99mr");
    			attr(div3, "class", "clui-pages");
    			attr(div4, "class", "clui-cli svelte-3v99mr");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div1);
    			append(div1, img);
    			append(div1, t0);
    			append(div1, div0);
    			append(div1, t1);
    			append(div1, input);
    			set_input_value(input, /*state*/ ctx[0].cli.value);
    			append(div4, t2);
    			append(div4, div2);
    			if_block.m(div2, null);
    			append(div4, t3);
    			append(div4, div3);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[3]),
    					listen(input, "input", /*parse*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*state*/ 1 && input.value !== /*state*/ ctx[0].cli.value) {
    				set_input_value(input, /*state*/ ctx[0].cli.value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div4);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $current;
    	component_subscribe($$self, current$1, $$value => $$invalidate(1, $current = $$value));
    	set_store_value(current$1, $current = { commands }, $current);

    	let state = {
    		selection: 0,
    		cli: { list: [], value: "" }
    	};

    	const parse = () => {
    		clui.parse(state.cli.value);
    	};

    	function input_input_handler() {
    		state.cli.value = this.value;
    		$$invalidate(0, state);
    	}

    	const click_handler = command => {
    		clui.execute(command);
    	};

    	return [state, $current, parse, input_input_handler, click_handler];
    }

    class Index extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    const app = new Index({
    	target: document.getElementById('clui')
    });

    return app;

}());
