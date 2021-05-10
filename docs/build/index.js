
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var index = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function to_number(value) {
        return value === '' ? null : +value;
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function create_component(block) {
        block && block.c();
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

    var constants = {
    	PATH_SEPARATOR: '.',
    	TARGET: Symbol('target'),
    	UNSUBSCRIBE: Symbol('unsubscribe')
    };

    const isBuiltin = {
    	withMutableMethods: value => {
    		return value instanceof Date ||
    			value instanceof Set ||
    			value instanceof Map ||
    			value instanceof WeakSet ||
    			value instanceof WeakMap;
    	},
    	withoutMutableMethods: value => (typeof value === 'object' ? value === null : typeof value !== 'function') || value instanceof RegExp
    };

    var isBuiltin_1 = isBuiltin;

    var isArray = Array.isArray;

    var isSymbol = value => typeof value === 'symbol';

    const {PATH_SEPARATOR} = constants;



    var path = {
    	after: (path, subPath) => {
    		if (isArray(path)) {
    			return path.slice(subPath.length);
    		}

    		if (subPath === '') {
    			return path;
    		}

    		return path.slice(subPath.length + 1);
    	},
    	concat: (path, key) => {
    		if (isArray(path)) {
    			path = path.slice();

    			if (key) {
    				path.push(key);
    			}

    			return path;
    		}

    		if (key && key.toString !== undefined) {
    			if (path !== '') {
    				path += PATH_SEPARATOR;
    			}

    			if (isSymbol(key)) {
    				return path + key.toString();
    			}

    			return path + key;
    		}

    		return path;
    	},
    	initial: path => {
    		if (isArray(path)) {
    			return path.slice(0, -1);
    		}

    		if (path === '') {
    			return path;
    		}

    		const index = path.lastIndexOf(PATH_SEPARATOR);

    		if (index === -1) {
    			return '';
    		}

    		return path.slice(0, index);
    	},
    	last: path => {
    		if (isArray(path)) {
    			return path[path.length - 1] || '';
    		}

    		if (path === '') {
    			return path;
    		}

    		const index = path.lastIndexOf(PATH_SEPARATOR);

    		if (index === -1) {
    			return path;
    		}

    		return path.slice(index + 1);
    	},
    	walk: (path, callback) => {
    		if (isArray(path)) {
    			path.forEach(key => callback(key));
    		} else if (path !== '') {
    			let position = 0;
    			let index = path.indexOf(PATH_SEPARATOR);

    			if (index === -1) {
    				callback(path);
    			} else {
    				while (position < path.length) {
    					if (index === -1) {
    						index = path.length;
    					}

    					callback(path.slice(position, index));

    					position = index + 1;
    					index = path.indexOf(PATH_SEPARATOR, position);
    				}
    			}
    		}
    	}
    };

    var isIterator = value => typeof value === 'object' && typeof value.next === 'function';

    const {TARGET: TARGET$1} = constants;

    // eslint-disable-next-line max-params
    var wrapIterator = (iterator, target, thisArg, applyPath, prepareValue) => {
    	const originalNext = iterator.next;

    	if (target.name === 'entries') {
    		iterator.next = function () {
    			const result = originalNext.call(this);

    			if (result.done === false) {
    				result.value[0] = prepareValue(
    					result.value[0],
    					target,
    					result.value[0],
    					applyPath
    				);
    				result.value[1] = prepareValue(
    					result.value[1],
    					target,
    					result.value[0],
    					applyPath
    				);
    			}

    			return result;
    		};
    	} else if (target.name === 'values') {
    		const keyIterator = thisArg[TARGET$1].keys();

    		iterator.next = function () {
    			const result = originalNext.call(this);

    			if (result.done === false) {
    				result.value = prepareValue(
    					result.value,
    					target,
    					keyIterator.next().value,
    					applyPath
    				);
    			}

    			return result;
    		};
    	} else {
    		iterator.next = function () {
    			const result = originalNext.call(this);

    			if (result.done === false) {
    				result.value = prepareValue(
    					result.value,
    					target,
    					result.value,
    					applyPath
    				);
    			}

    			return result;
    		};
    	}

    	return iterator;
    };

    var ignoreProperty = (cache, options, property) => {
    	return cache.isUnsubscribed ||
    		(options.ignoreSymbols && isSymbol(property)) ||
    		(options.ignoreUnderscores && property.charAt(0) === '_') ||
    		('ignoreKeys' in options && options.ignoreKeys.includes(property));
    };

    /**
     * @class Cache
     * @private
     */
    class Cache {
    	constructor(equals) {
    		this._equals = equals;
    		this._proxyCache = new WeakMap();
    		this._pathCache = new WeakMap();
    		this.isUnsubscribed = false;
    	}

    	_getDescriptorCache() {
    		if (this._descriptorCache === undefined) {
    			this._descriptorCache = new WeakMap();
    		}

    		return this._descriptorCache;
    	}

    	_getProperties(target) {
    		const descriptorCache = this._getDescriptorCache();
    		let properties = descriptorCache.get(target);

    		if (properties === undefined) {
    			properties = {};
    			descriptorCache.set(target, properties);
    		}

    		return properties;
    	}

    	_getOwnPropertyDescriptor(target, property) {
    		if (this.isUnsubscribed) {
    			return Reflect.getOwnPropertyDescriptor(target, property);
    		}

    		const properties = this._getProperties(target);
    		let descriptor = properties[property];

    		if (descriptor === undefined) {
    			descriptor = Reflect.getOwnPropertyDescriptor(target, property);
    			properties[property] = descriptor;
    		}

    		return descriptor;
    	}

    	getProxy(target, path, handler, proxyTarget) {
    		if (this.isUnsubscribed) {
    			return target;
    		}

    		this._pathCache.set(target, path);

    		let proxy = this._proxyCache.get(target);

    		if (proxy === undefined) {
    			proxy = target[proxyTarget] === undefined ?
    				new Proxy(target, handler) :
    				target;

    			this._proxyCache.set(target, proxy);
    		}

    		return proxy;
    	}

    	getPath(target) {
    		return this.isUnsubscribed ? undefined : this._pathCache.get(target);
    	}

    	isDetached(target, object) {
    		path.walk(this.getPath(target), key => {
    			if (object) {
    				object = object[key];
    			}
    		});

    		return !Object.is(target, object);
    	}

    	defineProperty(target, property, descriptor) {
    		if (!Reflect.defineProperty(target, property, descriptor)) {
    			return false;
    		}

    		if (!this.isUnsubscribed) {
    			this._getProperties(target)[property] = descriptor;
    		}

    		return true;
    	}

    	setProperty(target, property, value, receiver, previous) { // eslint-disable-line max-params
    		if (!this._equals(previous, value) || !(property in target)) {
    			const descriptor = this._getOwnPropertyDescriptor(target, property);

    			if (descriptor !== undefined && 'set' in descriptor) {
    				return Reflect.set(target, property, value, receiver);
    			}

    			return Reflect.set(target, property, value);
    		}

    		return true;
    	}

    	deleteProperty(target, property, previous) {
    		if (Reflect.deleteProperty(target, property)) {
    			if (!this.isUnsubscribed) {
    				const properties = this._getDescriptorCache().get(target);

    				if (properties) {
    					delete properties[property];
    					this._pathCache.delete(previous);
    				}
    			}

    			return true;
    		}

    		return false;
    	}

    	isSameDescriptor(a, target, property) {
    		const b = this._getOwnPropertyDescriptor(target, property);

    		return a !== undefined &&
    			b !== undefined &&
    			Object.is(a.value, b.value) &&
    			(a.writable || false) === (b.writable || false) &&
    			(a.enumerable || false) === (b.enumerable || false) &&
    			(a.configurable || false) === (b.configurable || false) &&
    			a.get === b.get &&
    			a.set === b.set;
    	}

    	isGetInvariant(target, property) {
    		const descriptor = this._getOwnPropertyDescriptor(target, property);

    		return descriptor !== undefined &&
    			descriptor.configurable !== true &&
    			descriptor.writable !== true;
    	}

    	unsubscribe() {
    		this._descriptorCache = null;
    		this._pathCache = null;
    		this._proxyCache = null;
    		this.isUnsubscribed = true;
    	}
    }

    var cache = Cache;

    var isObject = value => toString.call(value) === '[object Object]';

    const certainChange = () => true;

    const shallowEqualArrays = (clone, value) => {
    	return clone.length !== value.length || clone.some((item, index) => value[index] !== item);
    };

    const shallowEqualSets = (clone, value) => {
    	if (clone.size !== value.size) {
    		return true;
    	}

    	for (const element of clone) {
    		if (!value.has(element)) {
    			return true;
    		}
    	}

    	return false;
    };

    const shallowEqualMaps = (clone, value) => {
    	if (clone.size !== value.size) {
    		return true;
    	}

    	let bValue;
    	for (const [key, aValue] of clone) {
    		bValue = value.get(key);

    		if (bValue !== aValue || (bValue === undefined && !value.has(key))) {
    			return true;
    		}
    	}

    	return false;
    };

    const IMMUTABLE_OBJECT_METHODS = new Set([
    	'hasOwnProperty',
    	'isPrototypeOf',
    	'propertyIsEnumerable',
    	'toLocaleString',
    	'toString',
    	'valueOf'
    ]);

    const IMMUTABLE_ARRAY_METHODS = new Set([
    	'concat',
    	'includes',
    	'indexOf',
    	'join',
    	'keys',
    	'lastIndexOf'
    ]);

    const IMMUTABLE_SET_METHODS = new Set([
    	'has',
    	'toString'
    ]);

    const IMMUTABLE_MAP_METHODS = new Set([...IMMUTABLE_SET_METHODS].concat(['get']));

    const SHALLOW_MUTABLE_ARRAY_METHODS = {
    	push: certainChange,
    	pop: certainChange,
    	shift: certainChange,
    	unshift: certainChange,
    	copyWithin: shallowEqualArrays,
    	reverse: shallowEqualArrays,
    	sort: shallowEqualArrays,
    	splice: shallowEqualArrays,
    	flat: shallowEqualArrays,
    	fill: shallowEqualArrays
    };

    const SHALLOW_MUTABLE_SET_METHODS = {
    	add: shallowEqualSets,
    	clear: shallowEqualSets,
    	delete: shallowEqualSets
    };

    const COLLECTION_ITERATOR_METHODS = [
    	'keys',
    	'values',
    	'entries'
    ];

    const SHALLOW_MUTABLE_MAP_METHODS = {
    	set: shallowEqualMaps,
    	clear: shallowEqualMaps,
    	delete: shallowEqualMaps
    };

    const HANDLED_ARRAY_METHODS = new Set([...IMMUTABLE_OBJECT_METHODS]
    	.concat([...IMMUTABLE_ARRAY_METHODS])
    	.concat(Object.keys(SHALLOW_MUTABLE_ARRAY_METHODS)));

    const HANDLED_SET_METHODS = new Set([...IMMUTABLE_SET_METHODS]
    	.concat(Object.keys(SHALLOW_MUTABLE_SET_METHODS))
    	.concat(COLLECTION_ITERATOR_METHODS));

    const HANDLED_MAP_METHODS = new Set([...IMMUTABLE_MAP_METHODS]
    	.concat(Object.keys(SHALLOW_MUTABLE_MAP_METHODS))
    	.concat(COLLECTION_ITERATOR_METHODS));

    class Clone {
    	constructor(value, path, argumentsList) {
    		this._path = path;
    		this._isChanged = false;
    		this._clonedCache = new Set();

    		if (value instanceof WeakSet) {
    			this._weakValue = value.has(argumentsList[0]);
    		} else if (value instanceof WeakMap) {
    			this._weakValue = value.get(argumentsList[0]);
    		} else {
    			this.clone = path === undefined ? value : this._shallowClone(value);
    		}
    	}

    	_shallowClone(value) {
    		let clone;

    		if (isObject(value)) {
    			clone = {...value};
    		} else if (isArray(value)) {
    			clone = [...value];
    		} else if (value instanceof Date) {
    			clone = new Date(value);
    		} else if (value instanceof Set) {
    			clone = new Set(value);
    		} else if (value instanceof Map) {
    			clone = new Map(value);
    		}

    		this._clonedCache.add(clone);

    		return clone;
    	}

    	preferredThisArg(target, thisArg, thisProxyTarget) {
    		const {name} = target;

    		if (SmartClone.isHandledMethod(thisProxyTarget, name)) {
    			if (isArray(thisProxyTarget)) {
    				this._onIsChanged = SHALLOW_MUTABLE_ARRAY_METHODS[name];
    			} else if (thisProxyTarget instanceof Set) {
    				this._onIsChanged = SHALLOW_MUTABLE_SET_METHODS[name];
    			} else if (thisProxyTarget instanceof Map) {
    				this._onIsChanged = SHALLOW_MUTABLE_MAP_METHODS[name];
    			}

    			return thisProxyTarget;
    		}

    		return thisArg;
    	}

    	update(fullPath, property, value) {
    		if (value !== undefined && property !== 'length') {
    			let object = this.clone;

    			path.walk(path.after(fullPath, this._path), key => {
    				if (!this._clonedCache.has(object[key])) {
    					object[key] = this._shallowClone(object[key]);
    				}

    				object = object[key];
    			});

    			object[property] = value;
    		}

    		this._isChanged = true;
    	}

    	isChanged(value, equals, argumentsList) {
    		if (value instanceof Date) {
    			return !equals(this.clone.valueOf(), value.valueOf());
    		}

    		if (value instanceof WeakSet) {
    			return this._weakValue !== value.has(argumentsList[0]);
    		}

    		if (value instanceof WeakMap) {
    			return this._weakValue !== value.get(argumentsList[0]);
    		}

    		return this._onIsChanged === undefined ?
    			this._isChanged :
    			this._onIsChanged(this.clone, value);
    	}
    }

    class SmartClone {
    	constructor() {
    		this.stack = [];
    	}

    	static isHandledType(value) {
    		return isObject(value) ||
    			isArray(value) ||
    			isBuiltin_1.withMutableMethods(value);
    	}

    	static isHandledMethod(target, name) {
    		if (isObject(target)) {
    			return IMMUTABLE_OBJECT_METHODS.has(name);
    		}

    		if (isArray(target)) {
    			return HANDLED_ARRAY_METHODS.has(name);
    		}

    		if (target instanceof Set) {
    			return HANDLED_SET_METHODS.has(name);
    		}

    		if (target instanceof Map) {
    			return HANDLED_MAP_METHODS.has(name);
    		}

    		return isBuiltin_1.withMutableMethods(target);
    	}

    	get isCloning() {
    		return this.stack.length !== 0;
    	}

    	start(value, path, argumentsList) {
    		this.stack.push(new Clone(value, path, argumentsList));
    	}

    	update(fullPath, property, value) {
    		this.stack[this.stack.length - 1].update(fullPath, property, value);
    	}

    	preferredThisArg(target, thisArg, thisProxyTarget) {
    		return this.stack[this.stack.length - 1].preferredThisArg(target, thisArg, thisProxyTarget);
    	}

    	isChanged(isMutable, value, equals, argumentsList) {
    		return this.stack[this.stack.length - 1].isChanged(isMutable, value, equals, argumentsList);
    	}

    	stop() {
    		return this.stack.pop().clone;
    	}
    }

    var smartClone = SmartClone;

    const {TARGET, UNSUBSCRIBE} = constants;









    const defaultOptions = {
    	equals: Object.is,
    	isShallow: false,
    	pathAsArray: false,
    	ignoreSymbols: false,
    	ignoreUnderscores: false,
    	ignoreDetached: false
    };

    const onChange = (object, onChange, options = {}) => {
    	options = {
    		...defaultOptions,
    		...options
    	};
    	const proxyTarget = Symbol('ProxyTarget');
    	const {equals, isShallow, ignoreDetached} = options;
    	const cache$1 = new cache(equals);
    	const smartClone$1 = new smartClone();

    	const handleChangeOnTarget = (target, property, previous, value) => {
    		if (
    			!ignoreProperty(cache$1, options, property) &&
    			!(ignoreDetached && cache$1.isDetached(target, object))
    		) {
    			handleChange(cache$1.getPath(target), property, previous, value);
    		}
    	};

    	// eslint-disable-next-line max-params
    	const handleChange = (changePath, property, previous, value, name) => {
    		if (smartClone$1.isCloning) {
    			smartClone$1.update(changePath, property, previous);
    		} else {
    			onChange(path.concat(changePath, property), value, previous, name);
    		}
    	};

    	const getProxyTarget = value => {
    		if (value) {
    			return value[proxyTarget] || value;
    		}

    		return value;
    	};

    	const prepareValue = (value, target, property, basePath) => {
    		if (
    			isBuiltin_1.withoutMutableMethods(value) ||
    			property === 'constructor' ||
    			(isShallow && !smartClone.isHandledMethod(target, property)) ||
    			ignoreProperty(cache$1, options, property) ||
    			cache$1.isGetInvariant(target, property) ||
    			(ignoreDetached && cache$1.isDetached(target, object))
    		) {
    			return value;
    		}

    		if (basePath === undefined) {
    			basePath = cache$1.getPath(target);
    		}

    		return cache$1.getProxy(value, path.concat(basePath, property), handler, proxyTarget);
    	};

    	const handler = {
    		get(target, property, receiver) {
    			if (isSymbol(property)) {
    				if (property === proxyTarget || property === TARGET) {
    					return target;
    				}

    				if (
    					property === UNSUBSCRIBE &&
    					!cache$1.isUnsubscribed &&
    					cache$1.getPath(target).length === 0
    				) {
    					cache$1.unsubscribe();
    					return target;
    				}
    			}

    			const value = isBuiltin_1.withMutableMethods(target) ?
    				Reflect.get(target, property) :
    				Reflect.get(target, property, receiver);

    			return prepareValue(value, target, property);
    		},

    		set(target, property, value, receiver) {
    			value = getProxyTarget(value);

    			const reflectTarget = target[proxyTarget] || target;
    			const previous = reflectTarget[property];
    			const hasProperty = property in target;

    			if (cache$1.setProperty(reflectTarget, property, value, receiver, previous)) {
    				if (!equals(previous, value) || !hasProperty) {
    					handleChangeOnTarget(target, property, previous, value);
    				}

    				return true;
    			}

    			return false;
    		},

    		defineProperty(target, property, descriptor) {
    			if (!cache$1.isSameDescriptor(descriptor, target, property)) {
    				if (!cache$1.defineProperty(target, property, descriptor)) {
    					return false;
    				}

    				handleChangeOnTarget(target, property, undefined, descriptor.value);
    			}

    			return true;
    		},

    		deleteProperty(target, property) {
    			if (!Reflect.has(target, property)) {
    				return true;
    			}

    			const previous = Reflect.get(target, property);

    			if (cache$1.deleteProperty(target, property, previous)) {
    				handleChangeOnTarget(target, property, previous);

    				return true;
    			}

    			return false;
    		},

    		apply(target, thisArg, argumentsList) {
    			const thisProxyTarget = thisArg[proxyTarget] || thisArg;

    			if (cache$1.isUnsubscribed) {
    				return Reflect.apply(target, thisProxyTarget, argumentsList);
    			}

    			if (smartClone.isHandledType(thisProxyTarget)) {
    				const applyPath = path.initial(cache$1.getPath(target));
    				const isHandledMethod = smartClone.isHandledMethod(thisProxyTarget, target.name);

    				smartClone$1.start(thisProxyTarget, applyPath, argumentsList);

    				const result = Reflect.apply(
    					target,
    					smartClone$1.preferredThisArg(target, thisArg, thisProxyTarget),
    					isHandledMethod ?
    						argumentsList.map(argument => getProxyTarget(argument)) :
    						argumentsList
    				);

    				const isChanged = smartClone$1.isChanged(thisProxyTarget, equals, argumentsList);
    				const clone = smartClone$1.stop();

    				if (isChanged) {
    					if (smartClone$1.isCloning) {
    						handleChange(path.initial(applyPath), path.last(applyPath), clone, thisProxyTarget, target.name);
    					} else {
    						handleChange(applyPath, '', clone, thisProxyTarget, target.name);
    					}
    				}

    				if (
    					(thisArg instanceof Map || thisArg instanceof Set) &&
    					isIterator(result)
    				) {
    					return wrapIterator(result, target, thisArg, applyPath, prepareValue);
    				}

    				return (smartClone.isHandledType(result) && isHandledMethod) ?
    					cache$1.getProxy(result, applyPath, handler, proxyTarget) :
    					result;
    			}

    			return Reflect.apply(target, thisArg, argumentsList);
    		}
    	};

    	const proxy = cache$1.getProxy(object, options.pathAsArray ? [] : '', handler);
    	onChange = onChange.bind(proxy);

    	return proxy;
    };

    onChange.target = proxy => proxy[TARGET] || proxy;
    onChange.unsubscribe = proxy => proxy[UNSUBSCRIBE] || proxy;

    var onChange_1 = onChange;

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
    const value$1 = writable('');
    const store$1 = writable({});

    let current = {};
    current$1.subscribe((val) => current = val);
    let value = '';
    value$1.subscribe(val => value = val);
    let storeMain = {};
    store$1.subscribe(val => storeMain = val);
    const upd = (path, val, prevVal, name) => {
        store$1.set(storeMain);
    };
    const store = onChange_1(storeMain, upd);
    store.depth = 0;
    store.argDepth = 0;
    store.divider = 0;
    store.tokens = [];
    store.pages = [];
    store.toasts = [];
    store.canRun = false;
    store.commands = {};
    const copy = (obj) => JSON.parse(JSON.stringify(obj));
    const uuid = () => (Math.random() * 0xf ** 6 | 0).toString(16);
    function deepCopyObj(obj) {
        if (null == obj || "object" != typeof obj)
            return obj;
        if (obj instanceof Date) {
            let clone = new Date();
            clone.setTime(obj.getTime());
            return clone;
        }
        if (obj instanceof Array) {
            let clone = [];
            for (let i = 0, len = obj.length; i < len; i++) {
                clone[i] = deepCopyObj(obj[i]);
            }
            return clone;
        }
        if (obj instanceof Object) {
            let clone = {};
            for (let attr in obj) {
                if (obj.hasOwnProperty(attr))
                    clone[attr] = deepCopyObj(obj[attr]);
            }
            return clone;
        }
        throw new Error("Unable to copy obj this object.");
    }
    let history = [];
    class Page {
        constructor(args, isForm) {
            this.Toast = Toast;
            this.reset = () => {
                this.render(this.command.args.concat({ name: 'submit', value: 'submit', type: 'button', run: () => {
                        this.items = [];
                        // @ts-expect-error
                        this.command.run(this, this.args);
                    } }));
            };
            this.clear = () => {
                this.render([]);
            };
            this.render = (items) => {
                items.forEach(el => el.id = uuid());
                this.items = items;
                this.update();
            };
            this.append = (...items) => {
                this.render([...this.items, ...items]);
            };
            this.prepend = (...items) => {
                this.render([...items, ...this.items]);
            };
            this.list = () => {
                return this.items.slice();
            };
            this.update = () => {
                upd();
            };
            this.close = () => {
                store.pages.splice(store.pages.indexOf(store.pages.find(el => el.id === this.id)), 1);
            };
            this.id = uuid();
            if (!Array.isArray(args)) { // if args is command
                this.command = args;
                // @ts-expect-error
                args = args.args;
            }
            else
                this.command = Object.assign({}, current);
            this.items = [];
            this.isForm = isForm;
            this.args = args;
            if (isForm) {
                this.items = args.concat({ name: 'submit', value: 'submit', type: 'button', run: () => {
                        this.items = [];
                        if (this.command.mode === 'toast') {
                            this.close();
                            this.command.run(Toast, this.args);
                        }
                        else {
                            this.clear();
                            // @ts-expect-error
                            this.command.run(this, this.args);
                        }
                    } });
            }
            else {
                // @ts-expect-error
                this.command.run(this, this.args);
            }
            store.pages.push(this);
        }
    }
    class Toast {
        constructor(msg, color) {
            this.msg = Array.isArray(msg) ? msg.join(' ') : msg;
            this.color = color;
            this.id = uuid();
            store.toasts.push(this);
            setTimeout(() => {
                store.toasts.splice(store.toasts.indexOf(store.toasts.find(el => el.id === this.id)), 1);
            }, 3000);
        }
    }
    const clui = {
        Toast,
        Page,
        commands: storeMain.commands,
        arg: (name, desc, type, options) => {
            return Object.assign({ name, desc, type }, options);
        },
        load: function (commands) {
            current$1.set({ commands });
            store.commands = commands;
            clui.commands = storeMain.commands;
        },
        clear: function () {
            current$1.set({ commands: store.commands });
            value$1.set('');
            store.tokens = [];
            store.depth = 0;
            store.argDepth = 0;
        },
        /** executes the current command */
        execute: function (command = current) {
            var _a;
            if (command === null || command === void 0 ? void 0 : command.run) { // if command has run function
                if (command === current) { // if same as current
                    let args = copy(clui.getArgs(value, true));
                    if (args.length < ((_a = command.args) === null || _a === void 0 ? void 0 : _a.filter(el => el.required).length)) { // if required args are not complete
                        new Page([...args, ...copy(command.args.slice(args.length))], true);
                    }
                    else if (command.mode === 'toast') {
                        command.run(Toast, args);
                    }
                    else {
                        new Page(args);
                    }
                    history.push(value);
                    history = history.filter((el, i) => history.lastIndexOf(el) === i);
                }
                else { // if command is specified
                    command = deepCopyObj(command);
                    if (command.mode === 'toast') {
                        command.run(Toast, command.args);
                    }
                    else {
                        // @ts-expect-error
                        new Page(command, true);
                    }
                }
                clui.clear();
            }
            else {
                new Toast('Command does not have a run function', 'red');
            }
        },
        /** checks if all required args are met */
        checkRun: function () {
            var _a;
            if (current === null || current === void 0 ? void 0 : current.run) { // if command has run function
                let args = copy(clui.getArgs(value, true));
                if (args.length < ((_a = current.args) === null || _a === void 0 ? void 0 : _a.filter(el => el.required).length)) { // if required args are not complete
                    store.canRun = false;
                }
                else {
                    store.canRun = true;
                }
            }
            else {
                store.canRun = false;
            }
        },
        /** parses CLI and checks for completed commands */
        parse: function (string) {
            let raw = string;
            let tokens = clui.tokenize(string);
            let command = { commands: store.commands };
            store.depth = 0;
            for (let token of tokens) {
                if ((command === null || command === void 0 ? void 0 : command.commands) && Object.keys(command.commands).includes(token)) { // if command exists
                    if (raw[raw.lastIndexOf(token) + token.length] === ' ' || Object.keys(command.commands).filter(el => el.indexOf(token) === 0).length === 1) {
                        // @ts-expect-error
                        command = command.commands[token];
                        store.depth++;
                    }
                }
            }
            store.tokens = tokens;
            current$1.set(command);
            clui.checkRun();
        },
        /** selects command or argument to be pushed to the CLI */
        select: function (name) {
            if (value.startsWith('=')) {
                value$1.set(history[name]);
                clui.parse(value);
            }
            else {
                let tokens = clui.tokenize(value);
                if ((current === null || current === void 0 ? void 0 : current.commands) && Object.keys(current === null || current === void 0 ? void 0 : current.commands).includes(name)) { // if command exists
                    if (tokens.length > store.depth) { // If half-completed in CLI
                        value$1.set([...tokens.slice(0, tokens.length - 1), name, ''].join(' '));
                    }
                    else {
                        value$1.set([...tokens, name, ''].join(' '));
                    }
                    clui.parse(value);
                }
                else if ((current === null || current === void 0 ? void 0 : current.args) && current.args.filter(el => !el.required && !el.isArg).some(el => el.name === name)) {
                    if (tokens.length > store.depth) { // If half-completed in CLI
                        value$1.set([...tokens.slice(0, tokens.length - 1), `--${name}`, ''].join(' '));
                    }
                    else {
                        value$1.set([...tokens, `--${name}`, ''].join(' '));
                    }
                    clui.parse(value);
                }
            }
        },
        /** filters commands and arguments for dropdown */
        filter: function (string) {
            let tokens = clui.tokenize(string);
            let name = tokens[tokens.length - 1];
            if (string.startsWith('=')) {
                // @ts-expect-error
                return history.filter(el => el.indexOf(string.slice(1)) !== -1).map((el, i) => { return { name: i, desc: el }; });
            }
            else {
                if (current === null || current === void 0 ? void 0 : current.args) {
                    return clui.getArgs(string);
                }
                else if (current === null || current === void 0 ? void 0 : current.commands) {
                    let arr = [];
                    if (tokens.length > store.depth) { // If half-completed in CLI
                        let commands = Object.keys(current.commands).filter(el => el.indexOf(name) !== -1);
                        commands.map(el => arr.push(Object.assign({ name: el }, current.commands[el])));
                    }
                    else {
                        Object.keys(current.commands).map(el => arr.push(Object.assign({ name: el }, current.commands[el])));
                    }
                    return arr;
                }
                else { // TODO: this should probably not need to exist
                    return [];
                }
            }
        },
        /** gets and orders arguments for dropdown */
        getArgs: function (string, inverse = false) {
            let tokens = clui.tokenize(string);
            let params = current === null || current === void 0 ? void 0 : current.args.filter(el => el.required);
            let optional = current === null || current === void 0 ? void 0 : current.args.filter(el => !el.required && el.isArg);
            let flags = current === null || current === void 0 ? void 0 : current.args.filter(el => !el.required && !el.isArg);
            if (!inverse) { // filter unused args
                let separated = clui.separateArgs(tokens.slice(store.depth), string);
                let param = [...params, ...optional][separated.withSpace.params.length];
                flags = flags.filter(el => !separated.flags.includes(el.name));
                return [param, ...flags].filter(el => el !== undefined);
            }
            else { // filter used args
                let separated = copy(clui.separateArgs(tokens.slice(store.depth), string));
                let param = copy([...params, ...optional].slice(0, separated.params.length));
                param.forEach((el, i) => {
                    el.value = separated.params[i];
                    if (el.type === 'string' && el.value[0].match(/["']/) !== null)
                        el.value = el.value.slice(1, -1);
                });
                separated.flagData.forEach(el => {
                    if (el.type === 'string')
                        el.value = el.value.slice(1, -1);
                });
                return [...param, ...separated.flagData].filter(el => el !== undefined);
            }
        },
        /** separates arguments from tokens into flags and params */
        separateArgs: function (tokens, string = '') {
            var _a;
            let flags = [];
            let flagData = [];
            let params = [];
            let args = 0;
            let withSpace = { params: [], flags: [] };
            for (let i = 0; i < tokens.length; i++) {
                let token = tokens[i];
                if (token.startsWith('-')) { // is flag
                    if (token.match(/^(-)(\w)+/g) !== null) { // short flag "-f"
                        flags.push(...token.split('').slice(1).map(el => { var _a, _b; return (_b = (_a = current === null || current === void 0 ? void 0 : current.args) === null || _a === void 0 ? void 0 : _a.find(el2 => el2.short === el)) === null || _b === void 0 ? void 0 : _b.name; }));
                        flagData.push(...token.split('').slice(1).map(el => { var _a; return Object.assign(Object.assign({}, (_a = current === null || current === void 0 ? void 0 : current.args) === null || _a === void 0 ? void 0 : _a.find(el2 => el2.short === el)), { value: true }); }));
                    }
                    else if (token.match(/^(--)(.)+/g) !== null) { // long flag "--flag"
                        let arg = (_a = current === null || current === void 0 ? void 0 : current.args) === null || _a === void 0 ? void 0 : _a.find(el => el.name === token.substr(2));
                        if (arg === undefined)
                            continue;
                        if ((arg === null || arg === void 0 ? void 0 : arg.type) !== 'boolean') { // if not boolean
                            flags.push(arg.name);
                            flagData.push(Object.assign(Object.assign({}, arg), { value: tokens[i + 1] }));
                            args++;
                            i++;
                        }
                        else if ((arg === null || arg === void 0 ? void 0 : arg.type) === 'boolean') { // if boolean flag
                            flags.push(arg.name);
                            flagData.push(Object.assign(Object.assign({}, arg), { value: true }));
                        }
                        else ;
                    }
                }
                else { // parameter
                    params.push(token);
                    if (string[string.lastIndexOf(token) + token.length] === ' ')
                        withSpace.params.push(token);
                }
            }
            store.argDepth = flags.length + withSpace.params.length + args;
            return { flags, params, withSpace, flagData };
        },
        /** sets the current command */
        setCurrent: function (name) {
            if (Object.keys(current.commands).includes(name)) { // if command exists
                current$1.update(val => current.commands[name]);
            }
            else {
                new Toast('setCurrent: Command has no children', 'red');
            }
        },
        /** tokenizes a cli input string */
        tokenize: function (input) {
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
                    }
                    else { // Inside string
                        accumulator += char;
                    }
                }
                else if (char === '"') {
                    if (stringType === '"') { // Closing token
                        stringType = false;
                        accumulator += char;
                        tokens.push(accumulator);
                        accumulator = '';
                        i++;
                    }
                    else if (stringType === "'") { // Ignore
                        accumulator += char;
                    }
                    else { // New string
                        accumulator += char;
                        stringType = '"';
                    }
                }
                else if (char === "'") {
                    if (stringType === "'") { // Closing token
                        stringType = false;
                        accumulator += char;
                        tokens.push(accumulator);
                        accumulator = '';
                        i++;
                    }
                    else if (stringType === '"') { // Ignore
                        accumulator += char;
                    }
                    else { // New string
                        accumulator += char;
                        stringType = "'";
                    }
                }
                else {
                    accumulator += char;
                }
            }
            if (accumulator !== '')
                tokens.push(accumulator);
            return tokens;
        }
    };

    /* src/comps/Item.svelte generated by Svelte v3.35.0 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (38:36) 
    function create_if_block_5$1(ctx) {
    	let div;
    	let t;
    	let if_block0 = /*arg*/ ctx[0].name && create_if_block_7$1(ctx);
    	let if_block1 = /*arg*/ ctx[0].value && create_if_block_6$1(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr(div, "class", "ciui-page-item svelte-1kmziob");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p(ctx, dirty) {
    			if (/*arg*/ ctx[0].name) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7$1(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*arg*/ ctx[0].value) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_6$1(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    // (34:33) 
    function create_if_block_4$1(ctx) {
    	let div;
    	let button;
    	let t_value = /*arg*/ ctx[0].value + "";
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", "svelte-1kmziob");
    			attr(div, "class", "ciui-page-item svelte-1kmziob");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*arg*/ ctx[0].run)) /*arg*/ ctx[0].run.apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*arg*/ 1 && t_value !== (t_value = /*arg*/ ctx[0].value + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (25:31) 
    function create_if_block_3$1(ctx) {
    	let div;
    	let span1;
    	let span0;
    	let t0_value = /*arg*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*arg*/ ctx[0].type + "";
    	let t3;
    	let t4;
    	let t5_value = (/*arg*/ ctx[0].required ? "*" : "") + "";
    	let t5;
    	let t6;
    	let select;
    	let each_value = /*arg*/ ctx[0].items;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div = element("div");
    			span1 = element("span");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(span0, "class", "svelte-1kmziob");
    			attr(span1, "class", "clui-item-label svelte-1kmziob");
    			attr(select, "class", "svelte-1kmziob");
    			attr(div, "class", "ciui-page-item svelte-1kmziob");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span1);
    			append(span1, span0);
    			append(span0, t0);
    			append(span0, t1);
    			append(span1, t2);
    			append(span1, t3);
    			append(span1, t4);
    			append(span1, t5);
    			append(div, t6);
    			append(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*arg*/ 1 && t0_value !== (t0_value = /*arg*/ ctx[0].name + "")) set_data(t0, t0_value);
    			if (dirty & /*arg*/ 1 && t3_value !== (t3_value = /*arg*/ ctx[0].type + "")) set_data(t3, t3_value);
    			if (dirty & /*arg*/ 1 && t5_value !== (t5_value = (/*arg*/ ctx[0].required ? "*" : "") + "")) set_data(t5, t5_value);

    			if (dirty & /*arg*/ 1) {
    				each_value = /*arg*/ ctx[0].items;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (19:34) 
    function create_if_block_2$1(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t0;
    	let input;
    	let input_required_value;
    	let t1;
    	let span1;
    	let span0;
    	let t2_value = /*arg*/ ctx[0].name + "";
    	let t2;
    	let t3;
    	let t4;
    	let t5_value = /*arg*/ ctx[0].type + "";
    	let t5;
    	let t6;
    	let t7_value = (/*arg*/ ctx[0].required ? "*" : "") + "";
    	let t7;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			span1 = element("span");
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = text(":");
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = space();
    			t7 = text(t7_value);
    			attr(div0, "class", div0_class_value = "checkbox " + (/*arg*/ ctx[0].value ? "checked" : "") + " svelte-1kmziob");
    			attr(input, "type", "checkbox");
    			input.required = input_required_value = /*arg*/ ctx[0].required;
    			attr(input, "class", "svelte-1kmziob");
    			attr(span0, "class", "svelte-1kmziob");
    			attr(span1, "class", "clui-item-label svelte-1kmziob");
    			attr(div1, "class", "ciui-page-item svelte-1kmziob");
    			set_style(div1, "flex-direction", "row");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div1, t0);
    			append(div1, input);
    			input.checked = /*arg*/ ctx[0].value;
    			append(div1, t1);
    			append(div1, span1);
    			append(span1, span0);
    			append(span0, t2);
    			append(span0, t3);
    			append(span1, t4);
    			append(span1, t5);
    			append(span1, t6);
    			append(span1, t7);

    			if (!mounted) {
    				dispose = [
    					listen(div0, "click", /*click_handler*/ ctx[3]),
    					listen(input, "change", /*input_change_handler*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*arg*/ 1 && div0_class_value !== (div0_class_value = "checkbox " + (/*arg*/ ctx[0].value ? "checked" : "") + " svelte-1kmziob")) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (dirty & /*arg*/ 1 && input_required_value !== (input_required_value = /*arg*/ ctx[0].required)) {
    				input.required = input_required_value;
    			}

    			if (dirty & /*arg*/ 1) {
    				input.checked = /*arg*/ ctx[0].value;
    			}

    			if (dirty & /*arg*/ 1 && t2_value !== (t2_value = /*arg*/ ctx[0].name + "")) set_data(t2, t2_value);
    			if (dirty & /*arg*/ 1 && t5_value !== (t5_value = /*arg*/ ctx[0].type + "")) set_data(t5, t5_value);
    			if (dirty & /*arg*/ 1 && t7_value !== (t7_value = (/*arg*/ ctx[0].required ? "*" : "") + "")) set_data(t7, t7_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (14:33) 
    function create_if_block_1$1(ctx) {
    	let div;
    	let span1;
    	let span0;
    	let t0_value = /*arg*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*arg*/ ctx[0].type + "";
    	let t3;
    	let t4;
    	let t5_value = (/*arg*/ ctx[0].required ? "*" : "") + "";
    	let t5;
    	let t6;
    	let input;
    	let input_required_value;
    	let input_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			span1 = element("span");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = space();
    			input = element("input");
    			attr(span0, "class", "svelte-1kmziob");
    			attr(span1, "class", "clui-item-label svelte-1kmziob");
    			attr(input, "type", "number");
    			input.required = input_required_value = /*arg*/ ctx[0].required;
    			attr(input, "class", input_class_value = "" + (null_to_empty(/*arg*/ ctx[0].value === "" ? "clui-empty" : "") + " svelte-1kmziob"));
    			attr(div, "class", "ciui-page-item svelte-1kmziob");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span1);
    			append(span1, span0);
    			append(span0, t0);
    			append(span0, t1);
    			append(span1, t2);
    			append(span1, t3);
    			append(span1, t4);
    			append(span1, t5);
    			append(div, t6);
    			append(div, input);
    			set_input_value(input, /*arg*/ ctx[0].value);

    			if (!mounted) {
    				dispose = listen(input, "input", /*input_input_handler_1*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*arg*/ 1 && t0_value !== (t0_value = /*arg*/ ctx[0].name + "")) set_data(t0, t0_value);
    			if (dirty & /*arg*/ 1 && t3_value !== (t3_value = /*arg*/ ctx[0].type + "")) set_data(t3, t3_value);
    			if (dirty & /*arg*/ 1 && t5_value !== (t5_value = (/*arg*/ ctx[0].required ? "*" : "") + "")) set_data(t5, t5_value);

    			if (dirty & /*arg*/ 1 && input_required_value !== (input_required_value = /*arg*/ ctx[0].required)) {
    				input.required = input_required_value;
    			}

    			if (dirty & /*arg*/ 1 && input_class_value !== (input_class_value = "" + (null_to_empty(/*arg*/ ctx[0].value === "" ? "clui-empty" : "") + " svelte-1kmziob"))) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*arg*/ 1 && to_number(input.value) !== /*arg*/ ctx[0].value) {
    				set_input_value(input, /*arg*/ ctx[0].value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (9:0) {#if arg?.type === 'string'}
    function create_if_block$1(ctx) {
    	let div;
    	let span1;
    	let span0;
    	let t0_value = /*arg*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*arg*/ ctx[0].type + "";
    	let t3;
    	let t4;
    	let t5_value = (/*arg*/ ctx[0].required ? "*" : "") + "";
    	let t5;
    	let t6;
    	let input;
    	let input_required_value;
    	let input_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			span1 = element("span");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = space();
    			input = element("input");
    			attr(span0, "class", "svelte-1kmziob");
    			attr(span1, "class", "clui-item-label svelte-1kmziob");
    			attr(input, "type", "text");
    			input.required = input_required_value = /*arg*/ ctx[0].required;
    			attr(input, "class", input_class_value = "" + (null_to_empty(/*arg*/ ctx[0].value === "" ? "clui-empty" : "") + " svelte-1kmziob"));
    			attr(div, "class", "ciui-page-item svelte-1kmziob");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span1);
    			append(span1, span0);
    			append(span0, t0);
    			append(span0, t1);
    			append(span1, t2);
    			append(span1, t3);
    			append(span1, t4);
    			append(span1, t5);
    			append(div, t6);
    			append(div, input);
    			set_input_value(input, /*arg*/ ctx[0].value);

    			if (!mounted) {
    				dispose = listen(input, "input", /*input_input_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*arg*/ 1 && t0_value !== (t0_value = /*arg*/ ctx[0].name + "")) set_data(t0, t0_value);
    			if (dirty & /*arg*/ 1 && t3_value !== (t3_value = /*arg*/ ctx[0].type + "")) set_data(t3, t3_value);
    			if (dirty & /*arg*/ 1 && t5_value !== (t5_value = (/*arg*/ ctx[0].required ? "*" : "") + "")) set_data(t5, t5_value);

    			if (dirty & /*arg*/ 1 && input_required_value !== (input_required_value = /*arg*/ ctx[0].required)) {
    				input.required = input_required_value;
    			}

    			if (dirty & /*arg*/ 1 && input_class_value !== (input_class_value = "" + (null_to_empty(/*arg*/ ctx[0].value === "" ? "clui-empty" : "") + " svelte-1kmziob"))) {
    				attr(input, "class", input_class_value);
    			}

    			if (dirty & /*arg*/ 1 && input.value !== /*arg*/ ctx[0].value) {
    				set_input_value(input, /*arg*/ ctx[0].value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (40:2) {#if arg.name}
    function create_if_block_7$1(ctx) {
    	let h1;
    	let t_value = /*arg*/ ctx[0].name + "";
    	let t;

    	return {
    		c() {
    			h1 = element("h1");
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, h1, anchor);
    			append(h1, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*arg*/ 1 && t_value !== (t_value = /*arg*/ ctx[0].name + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(h1);
    		}
    	};
    }

    // (43:2) {#if arg.value}
    function create_if_block_6$1(ctx) {
    	let p;
    	let raw_value = /*arg*/ ctx[0].value.replace(/\n/g, "<br>") + "";

    	return {
    		c() {
    			p = element("p");
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*arg*/ 1 && raw_value !== (raw_value = /*arg*/ ctx[0].value.replace(/\n/g, "<br>") + "")) p.innerHTML = raw_value;		},
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    // (29:3) {#each arg.items as item}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[5].name + "";
    	let t;
    	let option_value_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[5].name;
    			option.value = option.__value;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*arg*/ 1 && t_value !== (t_value = /*item*/ ctx[5].name + "")) set_data(t, t_value);

    			if (dirty & /*arg*/ 1 && option_value_value !== (option_value_value = /*item*/ ctx[5].name)) {
    				option.__value = option_value_value;
    				option.value = option.__value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*arg*/ ctx[0]?.type === "string") return create_if_block$1;
    		if (/*arg*/ ctx[0]?.type === "number") return create_if_block_1$1;
    		if (/*arg*/ ctx[0]?.type === "boolean") return create_if_block_2$1;
    		if (/*arg*/ ctx[0]?.type === "enum") return create_if_block_3$1;
    		if (/*arg*/ ctx[0]?.type === "button") return create_if_block_4$1;
    		if (/*arg*/ ctx[0]?.type === "paragraph") return create_if_block_5$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	
    	let { arg } = $$props;
    	if (arg.type === "string") arg.value = arg.value || ""; else if (arg.type === "boolean") arg.value = arg.value || false;

    	function input_input_handler() {
    		arg.value = this.value;
    		$$invalidate(0, arg);
    	}

    	function input_input_handler_1() {
    		arg.value = to_number(this.value);
    		$$invalidate(0, arg);
    	}

    	const click_handler = () => $$invalidate(0, arg.value = !arg.value, arg);

    	function input_change_handler() {
    		arg.value = this.checked;
    		$$invalidate(0, arg);
    	}

    	$$self.$$set = $$props => {
    		if ("arg" in $$props) $$invalidate(0, arg = $$props.arg);
    	};

    	return [
    		arg,
    		input_input_handler,
    		input_input_handler_1,
    		click_handler,
    		input_change_handler
    	];
    }

    class Item extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { arg: 0 });
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/Index.svelte generated by Svelte v3.35.0 */

    const { window: window_1 } = globals;

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    // (50:1) {#each $store.toasts as toast (toast.id)}
    function create_each_block_4(key_1, ctx) {
    	let div;
    	let t_value = /*toast*/ ctx[26].msg + "";
    	let t;
    	let div_class_value;
    	let div_intro;
    	let div_outro;
    	let current;

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			div = element("div");
    			t = text(t_value);
    			attr(div, "class", div_class_value = "clui-toast clui-toast-" + /*toast*/ ctx[26].color + " svelte-1yg4ncs");
    			this.first = div;
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*$store*/ 1) && t_value !== (t_value = /*toast*/ ctx[26].msg + "")) set_data(t, t_value);

    			if (!current || dirty & /*$store*/ 1 && div_class_value !== (div_class_value = "clui-toast clui-toast-" + /*toast*/ ctx[26].color + " svelte-1yg4ncs")) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: 200, duration: 500 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, slide, { duration: 300 });
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};
    }

    // (58:2) {#if $store?.tokens}
    function create_if_block_7(ctx) {
    	let div;
    	let t0_value = /*$store*/ ctx[0].tokens.slice(0, /*$store*/ ctx[0].depth + /*$store*/ ctx[0].argDepth).join(" ") + "";
    	let t0;
    	let t1;
    	let t2_value = " " + "";
    	let t2;
    	let t3;

    	let t4_value = ((/*$current*/ ctx[3]?.commands)
    	? clui.filter(/*$value*/ ctx[2])[/*selection*/ ctx[1]]?.name ?? ""
    	: "") + "";

    	let t4;

    	return {
    		c() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			attr(div, "class", "clui-cli-autocomplete svelte-1yg4ncs");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, t1);
    			append(div, t2);
    			append(div, t3);
    			append(div, t4);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$store*/ 1 && t0_value !== (t0_value = /*$store*/ ctx[0].tokens.slice(0, /*$store*/ ctx[0].depth + /*$store*/ ctx[0].argDepth).join(" ") + "")) set_data(t0, t0_value);

    			if (dirty & /*$current, $value, selection*/ 14 && t4_value !== (t4_value = ((/*$current*/ ctx[3]?.commands)
    			? clui.filter(/*$value*/ ctx[2])[/*selection*/ ctx[1]]?.name ?? ""
    			: "") + "")) set_data(t4, t4_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (64:2) {#if $current?.run}
    function create_if_block_6(ctx) {
    	let button;
    	let t_value = (/*$store*/ ctx[0].canRun ? "run" : "form") + "";
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", "clui-cli-run svelte-1yg4ncs");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", /*execute*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$store*/ 1 && t_value !== (t_value = (/*$store*/ ctx[0].canRun ? "run" : "form") + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (67:2) {#if $value}
    function create_if_block_5(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.textContent = "x";
    			attr(button, "class", "clui-cli-run svelte-1yg4ncs");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*clear*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (85:27) 
    function create_if_block_3(ctx) {
    	let each_1_anchor;
    	let each_value_3 = clui.filter(/*$value*/ ctx[2]);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
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
    			if (dirty & /*selection, hover, clui, $value, $store*/ 135) {
    				each_value_3 = clui.filter(/*$value*/ ctx[2]);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (73:2) {#if $current?.commands}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value_2 = clui.filter(/*$value*/ ctx[2]);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
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
    			if (dirty & /*selection, clui, $value, hover, $store*/ 135) {
    				each_value_2 = clui.filter(/*$value*/ ctx[2]);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (87:4) {#if $store.divider > 0 && i === $store.divider}
    function create_if_block_4(ctx) {
    	let hr;

    	return {
    		c() {
    			hr = element("hr");
    			attr(hr, "class", "svelte-1yg4ncs");
    		},
    		m(target, anchor) {
    			insert(target, hr, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(hr);
    		}
    	};
    }

    // (86:3) {#each clui.filter($value) as argument, i}
    function create_each_block_3(ctx) {
    	let t0;
    	let div;
    	let span0;

    	let t1_value = (/*argument*/ ctx[24].short
    	? /*argument*/ ctx[24].short + ", "
    	: "") + /*argument*/ ctx[24].name + "";

    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*argument*/ ctx[24]?.desc + "";
    	let t3;
    	let t4;
    	let div_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*$store*/ ctx[0].divider > 0 && /*i*/ ctx[18] === /*$store*/ ctx[0].divider && create_if_block_4();

    	function mouseover_handler_1() {
    		return /*mouseover_handler_1*/ ctx[13](/*i*/ ctx[18]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[14](/*argument*/ ctx[24]);
    	}

    	return {
    		c() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			attr(span0, "class", "clui-dropdown-name svelte-1yg4ncs");
    			attr(span1, "class", "clui-dropdown-description");

    			attr(div, "class", div_class_value = "clui-dropdown-item " + (/*i*/ ctx[18] === /*selection*/ ctx[1]
    			? "clui-selected"
    			: "") + " svelte-1yg4ncs");
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, span0);
    			append(span0, t1);
    			append(div, t2);
    			append(div, span1);
    			append(span1, t3);
    			append(div, t4);

    			if (!mounted) {
    				dispose = [
    					listen(div, "mouseover", mouseover_handler_1),
    					listen(div, "click", click_handler_1)
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*$store*/ ctx[0].divider > 0 && /*i*/ ctx[18] === /*$store*/ ctx[0].divider) {
    				if (if_block) ; else {
    					if_block = create_if_block_4();
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$value*/ 4 && t1_value !== (t1_value = (/*argument*/ ctx[24].short
    			? /*argument*/ ctx[24].short + ", "
    			: "") + /*argument*/ ctx[24].name + "")) set_data(t1, t1_value);

    			if (dirty & /*$value*/ 4 && t3_value !== (t3_value = /*argument*/ ctx[24]?.desc + "")) set_data(t3, t3_value);

    			if (dirty & /*selection*/ 2 && div_class_value !== (div_class_value = "clui-dropdown-item " + (/*i*/ ctx[18] === /*selection*/ ctx[1]
    			? "clui-selected"
    			: "") + " svelte-1yg4ncs")) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (75:4) {#if $store.divider > 0 && i === $store.divider}
    function create_if_block_2(ctx) {
    	let hr;

    	return {
    		c() {
    			hr = element("hr");
    			attr(hr, "class", "svelte-1yg4ncs");
    		},
    		m(target, anchor) {
    			insert(target, hr, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(hr);
    		}
    	};
    }

    // (79:5) {#if typeof command.name !== 'number'}
    function create_if_block_1(ctx) {
    	let span;
    	let t_value = /*command*/ ctx[22].name + "";
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);
    			attr(span, "class", "clui-dropdown-name svelte-1yg4ncs");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$value*/ 4 && t_value !== (t_value = /*command*/ ctx[22].name + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (74:3) {#each clui.filter($value) as command, i}
    function create_each_block_2(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let span;
    	let t2_value = /*command*/ ctx[22].desc + "";
    	let t2;
    	let t3;
    	let div_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$store*/ ctx[0].divider > 0 && /*i*/ ctx[18] === /*$store*/ ctx[0].divider && create_if_block_2();
    	let if_block1 = typeof /*command*/ ctx[22].name !== "number" && create_if_block_1(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[11](/*command*/ ctx[22]);
    	}

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[12](/*i*/ ctx[18]);
    	}

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			attr(span, "class", "clui-dropdown-description");

    			attr(div, "class", div_class_value = "clui-dropdown-item " + (/*i*/ ctx[18] === /*selection*/ ctx[1]
    			? "clui-selected"
    			: "") + " svelte-1yg4ncs");
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			if (if_block1) if_block1.m(div, null);
    			append(div, t1);
    			append(div, span);
    			append(span, t2);
    			append(div, t3);

    			if (!mounted) {
    				dispose = [
    					listen(div, "click", click_handler),
    					listen(div, "mouseover", mouseover_handler)
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*$store*/ ctx[0].divider > 0 && /*i*/ ctx[18] === /*$store*/ ctx[0].divider) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2();
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*command*/ ctx[22].name !== "number") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*$value*/ 4 && t2_value !== (t2_value = /*command*/ ctx[22].desc + "")) set_data(t2, t2_value);

    			if (dirty & /*selection*/ 2 && div_class_value !== (div_class_value = "clui-dropdown-item " + (/*i*/ ctx[18] === /*selection*/ ctx[1]
    			? "clui-selected"
    			: "") + " svelte-1yg4ncs")) {
    				attr(div, "class", div_class_value);
    			}
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (105:5) {#each $store.pages[i].items as item}
    function create_each_block_1(ctx) {
    	let item;
    	let current;
    	item = new Item({ props: { arg: /*item*/ ctx[19] } });

    	return {
    		c() {
    			create_component(item.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const item_changes = {};
    			if (dirty & /*$store*/ 1) item_changes.arg = /*item*/ ctx[19];
    			item.$set(item_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(item, detaching);
    		}
    	};
    }

    // (99:2) {#each $store.pages as page, i (page.id)}
    function create_each_block(key_1, ctx) {
    	let div2;
    	let div0;
    	let button;
    	let t1;
    	let div1;
    	let t2;
    	let div2_intro;
    	let div2_outro;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*$store*/ ctx[0].pages[/*i*/ ctx[18]].items;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "X";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr(button, "class", "svelte-1yg4ncs");
    			attr(div0, "class", "clui-page-buttons svelte-1yg4ncs");
    			attr(div1, "class", "clui-page svelte-1yg4ncs");
    			attr(div2, "class", "clui-page-container svelte-1yg4ncs");
    			this.first = div2;
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, button);
    			append(div2, t1);
    			append(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append(div2, t2);
    			current = true;

    			if (!mounted) {
    				dispose = listen(button, "click", function () {
    					if (is_function(/*page*/ ctx[16].close())) /*page*/ ctx[16].close().apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$store*/ 1) {
    				each_value_1 = /*$store*/ ctx[0].pages[/*i*/ ctx[18]].items;
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				if (!div2_intro) div2_intro = create_in_transition(div2, slide, { duration: 200 });
    				div2_intro.start();
    			});

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, slide, { duration: 200 });
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div2_outro) div2_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	let div0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t0;
    	let div4;
    	let div1;
    	let img;
    	let img_src_value;
    	let t1;
    	let t2;
    	let input;
    	let t3;
    	let t4;
    	let t5;
    	let div2;
    	let t6;
    	let div3;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*$store*/ ctx[0].toasts;
    	const get_key = ctx => /*toast*/ ctx[26].id;

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		let child_ctx = get_each_context_4(ctx, each_value_4, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_4(key, child_ctx));
    	}

    	let if_block0 = /*$store*/ ctx[0]?.tokens && create_if_block_7(ctx);
    	let if_block1 = /*$current*/ ctx[3]?.run && create_if_block_6(ctx);
    	let if_block2 = /*$value*/ ctx[2] && create_if_block_5(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$current*/ ctx[3]?.commands) return create_if_block;
    		if (/*$current*/ ctx[3]?.args) return create_if_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block3 = current_block_type && current_block_type(ctx);
    	let each_value = /*$store*/ ctx[0].pages;
    	const get_key_1 = ctx => /*page*/ ctx[16].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	return {
    		c() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			if (if_block2) if_block2.c();
    			t5 = space();
    			div2 = element("div");
    			if (if_block3) if_block3.c();
    			t6 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "clui-toasts svelte-1yg4ncs");
    			if (img.src !== (img_src_value = "icons/cli.png")) attr(img, "src", img_src_value);
    			attr(img, "alt", "");
    			attr(img, "class", "clui-cli-icon svelte-1yg4ncs");
    			attr(input, "type", "text");
    			attr(input, "placeholder", "");
    			attr(input, "class", "svelte-1yg4ncs");
    			attr(div1, "class", "clui-cli-input svelte-1yg4ncs");
    			attr(div2, "class", "clui-cli-dropdown svelte-1yg4ncs");
    			attr(div3, "class", "clui-pages svelte-1yg4ncs");
    			attr(div4, "class", "clui-cli svelte-1yg4ncs");
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert(target, t0, anchor);
    			insert(target, div4, anchor);
    			append(div4, div1);
    			append(div1, img);
    			append(div1, t1);
    			if (if_block0) if_block0.m(div1, null);
    			append(div1, t2);
    			append(div1, input);
    			set_input_value(input, /*$value*/ ctx[2]);
    			append(div1, t3);
    			if (if_block1) if_block1.m(div1, null);
    			append(div1, t4);
    			if (if_block2) if_block2.m(div1, null);
    			append(div4, t5);
    			append(div4, div2);
    			if (if_block3) if_block3.m(div2, null);
    			append(div4, t6);
    			append(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(window_1, "error", /*error_handler*/ ctx[9]),
    					listen(input, "input", /*input_input_handler*/ ctx[10]),
    					listen(input, "input", /*parse*/ ctx[4]),
    					listen(input, "keydown", /*keydown*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$store*/ 1) {
    				each_value_4 = /*$store*/ ctx[0].toasts;
    				group_outros();
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_4, each0_lookup, div0, outro_and_destroy_block, create_each_block_4, null, get_each_context_4);
    				check_outros();
    			}

    			if (/*$store*/ ctx[0]?.tokens) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					if_block0.m(div1, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*$value*/ 4 && input.value !== /*$value*/ ctx[2]) {
    				set_input_value(input, /*$value*/ ctx[2]);
    			}

    			if (/*$current*/ ctx[3]?.run) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					if_block1.m(div1, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$value*/ ctx[2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_5(ctx);
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if (if_block3) if_block3.d(1);
    				if_block3 = current_block_type && current_block_type(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div2, null);
    				}
    			}

    			if (dirty & /*$store*/ 1) {
    				each_value = /*$store*/ ctx[0].pages;
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div3, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_4.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if (detaching) detach(t0);
    			if (detaching) detach(div4);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();

    			if (if_block3) {
    				if_block3.d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $value;
    	let $current;
    	let $store;
    	component_subscribe($$self, value$1, $$value => $$invalidate(2, $value = $$value));
    	component_subscribe($$self, current$1, $$value => $$invalidate(3, $current = $$value));
    	component_subscribe($$self, store$1, $$value => $$invalidate(0, $store = $$value));
    	window.clui = clui;
    	let selection = 0;
    	const parse = () => clui.parse($value);
    	const execute = () => clui.execute();
    	const clear = () => clui.clear();
    	const hover = index => $$invalidate(1, selection = index);

    	const updSelection = () => {
    		if ($current?.commands) $$invalidate(1, selection = selection >= Object.keys(clui.filter($value)).length
    		? Object.keys(clui.filter($value)).length - 1
    		: selection); else if ($current?.args) $$invalidate(1, selection = selection >= clui.filter($value).length
    		? clui.filter($value).length - 1
    		: selection);

    		$$invalidate(1, selection = selection < 0 ? 0 : selection);
    	};

    	const keydown = e => {
    		if (e.key === "Enter") {
    			clui.execute();
    		} else if (e.key === "Tab") {
    			e.preventDefault();
    			clui.select(clui.filter($value)[selection]?.name);
    		} else if (e.key === "ArrowUp") {
    			e.preventDefault();
    			$$invalidate(1, selection--, selection);
    		} else if (e.key === "ArrowDown") {
    			e.preventDefault();
    			$$invalidate(1, selection++, selection);
    		}

    		updSelection();
    	};

    	const error_handler = err => new clui.Toast(err.message, "red");

    	function input_input_handler() {
    		$value = this.value;
    		value$1.set($value);
    	}

    	const click_handler = command => clui.select(command.name);
    	const mouseover_handler = i => hover(i);
    	const mouseover_handler_1 = i => hover(i);
    	const click_handler_1 = argument => clui.select(argument.name);

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$store*/ 1) {
    			updSelection($store.depth, $store.argDepth);
    		}
    	};

    	return [
    		$store,
    		selection,
    		$value,
    		$current,
    		parse,
    		execute,
    		clear,
    		hover,
    		keydown,
    		error_handler,
    		input_input_handler,
    		click_handler,
    		mouseover_handler,
    		mouseover_handler_1,
    		click_handler_1
    	];
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
