var index=function(){"use strict";function e(){}const t=e=>e;function n(e){return e()}function s(){return Object.create(null)}function r(e){e.forEach(n)}function i(e){return"function"==typeof e}function o(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function l(t,n,s){t.$$.on_destroy.push(function(t,...n){if(null==t)return e;const s=t.subscribe(...n);return s.unsubscribe?()=>s.unsubscribe():s}(n,s))}const c="undefined"!=typeof window;let a=c?()=>window.performance.now():()=>Date.now(),u=c?e=>requestAnimationFrame(e):e;const d=new Set;function h(e){d.forEach((t=>{t.c(e)||(d.delete(t),t.f())})),0!==d.size&&u(h)}function f(e){let t;return 0===d.size&&u(h),{promise:new Promise((n=>{d.add(t={c:e,f:n})})),abort(){d.delete(t)}}}function p(e,t){e.appendChild(t)}function g(e,t,n){e.insertBefore(t,n||null)}function m(e){e.parentNode.removeChild(e)}function v(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function b(e){return document.createElement(e)}function y(e){return document.createTextNode(e)}function _(){return y(" ")}function k(){return y("")}function w(e,t,n,s){return e.addEventListener(t,n,s),()=>e.removeEventListener(t,n,s)}function $(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function x(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}function C(e,t){e.value=null==t?"":t}const S=new Set;let O,P=0;function A(e,t,n,s,r,i,o,l=0){const c=16.666/s;let a="{\n";for(let e=0;e<=1;e+=c){const s=t+(n-t)*i(e);a+=100*e+`%{${o(s,1-s)}}\n`}const u=a+`100% {${o(n,1-n)}}\n}`,d=`__svelte_${function(e){let t=5381,n=e.length;for(;n--;)t=(t<<5)-t^e.charCodeAt(n);return t>>>0}(u)}_${l}`,h=e.ownerDocument;S.add(h);const f=h.__svelte_stylesheet||(h.__svelte_stylesheet=h.head.appendChild(b("style")).sheet),p=h.__svelte_rules||(h.__svelte_rules={});p[d]||(p[d]=!0,f.insertRule(`@keyframes ${d} ${u}`,f.cssRules.length));const g=e.style.animation||"";return e.style.animation=`${g?`${g}, `:""}${d} ${s}ms linear ${r}ms 1 both`,P+=1,d}function j(e,t){const n=(e.style.animation||"").split(", "),s=n.filter(t?e=>e.indexOf(t)<0:e=>-1===e.indexOf("__svelte")),r=n.length-s.length;r&&(e.style.animation=s.join(", "),P-=r,P||u((()=>{P||(S.forEach((e=>{const t=e.__svelte_stylesheet;let n=t.cssRules.length;for(;n--;)t.deleteRule(n);e.__svelte_rules={}})),S.clear())})))}function D(e){O=e}const M=[],R=[],E=[],T=[],U=Promise.resolve();let I=!1;function z(e){E.push(e)}let W=!1;const q=new Set;function H(){if(!W){W=!0;do{for(let e=0;e<M.length;e+=1){const t=M[e];D(t),B(t.$$)}for(D(null),M.length=0;R.length;)R.pop()();for(let e=0;e<E.length;e+=1){const t=E[e];q.has(t)||(q.add(t),t())}E.length=0}while(M.length);for(;T.length;)T.pop()();I=!1,W=!1,q.clear()}}function B(e){if(null!==e.fragment){e.update(),r(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(z)}}let N;function G(){return N||(N=Promise.resolve(),N.then((()=>{N=null}))),N}function V(e,t,n){e.dispatchEvent(function(e,t){const n=document.createEvent("CustomEvent");return n.initCustomEvent(e,!1,!1,t),n}(`${t?"intro":"outro"}${n}`))}const L=new Set;let K;function F(e,t){e&&e.i&&(L.delete(e),e.i(t))}function J(e,t,n,s){if(e&&e.o){if(L.has(e))return;L.add(e),K.c.push((()=>{L.delete(e),s&&(n&&e.d(1),s())})),e.o(t)}}const Q={duration:0};function X(e,t){-1===e.$$.dirty[0]&&(M.push(e),I||(I=!0,U.then(H)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function Y(t,o,l,c,a,u,d=[-1]){const h=O;D(t);const f=t.$$={fragment:null,ctx:null,props:u,update:e,not_equal:a,bound:s(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(h?h.$$.context:[]),callbacks:s(),dirty:d,skip_bound:!1};let p=!1;if(f.ctx=l?l(t,o.props||{},((e,n,...s)=>{const r=s.length?s[0]:n;return f.ctx&&a(f.ctx[e],f.ctx[e]=r)&&(!f.skip_bound&&f.bound[e]&&f.bound[e](r),p&&X(t,e)),n})):[],f.update(),p=!0,r(f.before_update),f.fragment=!!c&&c(f.ctx),o.target){if(o.hydrate){const e=function(e){return Array.from(e.childNodes)}(o.target);f.fragment&&f.fragment.l(e),e.forEach(m)}else f.fragment&&f.fragment.c();o.intro&&F(t.$$.fragment),function(e,t,s,o){const{fragment:l,on_mount:c,on_destroy:a,after_update:u}=e.$$;l&&l.m(t,s),o||z((()=>{const t=c.map(n).filter(i);a?a.push(...t):r(t),e.$$.on_mount=[]})),u.forEach(z)}(t,o.target,o.anchor,o.customElement),H()}D(h)}var Z={PATH_SEPARATOR:".",TARGET:Symbol("target"),UNSUBSCRIBE:Symbol("unsubscribe")};var ee={withMutableMethods:e=>e instanceof Date||e instanceof Set||e instanceof Map||e instanceof WeakSet||e instanceof WeakMap,withoutMutableMethods:e=>("object"==typeof e?null===e:"function"!=typeof e)||e instanceof RegExp},te=Array.isArray,ne=e=>"symbol"==typeof e;const{PATH_SEPARATOR:se}=Z;var re=(e,t)=>te(e)?e.slice(t.length):""===t?e:e.slice(t.length+1),ie=(e,t)=>te(e)?(e=e.slice(),t&&e.push(t),e):t&&void 0!==t.toString?(""!==e&&(e+=se),ne(t)?e+t.toString():e+t):e,oe=e=>{if(te(e))return e.slice(0,-1);if(""===e)return e;const t=e.lastIndexOf(se);return-1===t?"":e.slice(0,t)},le=e=>{if(te(e))return e[e.length-1]||"";if(""===e)return e;const t=e.lastIndexOf(se);return-1===t?e:e.slice(t+1)},ce=(e,t)=>{if(te(e))e.forEach((e=>t(e)));else if(""!==e){let n=0,s=e.indexOf(se);if(-1===s)t(e);else for(;n<e.length;)-1===s&&(s=e.length),t(e.slice(n,s)),n=s+1,s=e.indexOf(se,n)}};const{TARGET:ae}=Z;var ue=(e,t,n,s,r)=>{const i=e.next;if("entries"===t.name)e.next=function(){const e=i.call(this);return!1===e.done&&(e.value[0]=r(e.value[0],t,e.value[0],s),e.value[1]=r(e.value[1],t,e.value[0],s)),e};else if("values"===t.name){const o=n[ae].keys();e.next=function(){const e=i.call(this);return!1===e.done&&(e.value=r(e.value,t,o.next().value,s)),e}}else e.next=function(){const e=i.call(this);return!1===e.done&&(e.value=r(e.value,t,e.value,s)),e};return e},de=(e,t,n)=>e.isUnsubscribed||t.ignoreSymbols&&ne(n)||t.ignoreUnderscores&&"_"===n.charAt(0)||"ignoreKeys"in t&&t.ignoreKeys.includes(n);var he=class{constructor(e){this._equals=e,this._proxyCache=new WeakMap,this._pathCache=new WeakMap,this.isUnsubscribed=!1}_getDescriptorCache(){return void 0===this._descriptorCache&&(this._descriptorCache=new WeakMap),this._descriptorCache}_getProperties(e){const t=this._getDescriptorCache();let n=t.get(e);return void 0===n&&(n={},t.set(e,n)),n}_getOwnPropertyDescriptor(e,t){if(this.isUnsubscribed)return Reflect.getOwnPropertyDescriptor(e,t);const n=this._getProperties(e);let s=n[t];return void 0===s&&(s=Reflect.getOwnPropertyDescriptor(e,t),n[t]=s),s}getProxy(e,t,n,s){if(this.isUnsubscribed)return e;this._pathCache.set(e,t);let r=this._proxyCache.get(e);return void 0===r&&(r=void 0===e[s]?new Proxy(e,n):e,this._proxyCache.set(e,r)),r}getPath(e){return this.isUnsubscribed?void 0:this._pathCache.get(e)}isDetached(e,t){return ce(this.getPath(e),(e=>{t&&(t=t[e])})),!Object.is(e,t)}defineProperty(e,t,n){return!!Reflect.defineProperty(e,t,n)&&(this.isUnsubscribed||(this._getProperties(e)[t]=n),!0)}setProperty(e,t,n,s,r){if(!this._equals(r,n)||!(t in e)){const r=this._getOwnPropertyDescriptor(e,t);return void 0!==r&&"set"in r?Reflect.set(e,t,n,s):Reflect.set(e,t,n)}return!0}deleteProperty(e,t,n){if(Reflect.deleteProperty(e,t)){if(!this.isUnsubscribed){const s=this._getDescriptorCache().get(e);s&&(delete s[t],this._pathCache.delete(n))}return!0}return!1}isSameDescriptor(e,t,n){const s=this._getOwnPropertyDescriptor(t,n);return void 0!==e&&void 0!==s&&Object.is(e.value,s.value)&&(e.writable||!1)===(s.writable||!1)&&(e.enumerable||!1)===(s.enumerable||!1)&&(e.configurable||!1)===(s.configurable||!1)&&e.get===s.get&&e.set===s.set}isGetInvariant(e,t){const n=this._getOwnPropertyDescriptor(e,t);return void 0!==n&&!0!==n.configurable&&!0!==n.writable}unsubscribe(){this._descriptorCache=null,this._pathCache=null,this._proxyCache=null,this.isUnsubscribed=!0}},fe=e=>"[object Object]"===toString.call(e);const pe=()=>!0,ge=(e,t)=>e.length!==t.length||e.some(((e,n)=>t[n]!==e)),me=(e,t)=>{if(e.size!==t.size)return!0;for(const n of e)if(!t.has(n))return!0;return!1},ve=(e,t)=>{if(e.size!==t.size)return!0;let n;for(const[s,r]of e)if(n=t.get(s),n!==r||void 0===n&&!t.has(s))return!0;return!1},be=new Set(["hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"]),ye=new Set(["concat","includes","indexOf","join","keys","lastIndexOf"]),_e=new Set(["has","toString"]),ke=new Set([..._e].concat(["get"])),we={push:pe,pop:pe,shift:pe,unshift:pe,copyWithin:ge,reverse:ge,sort:ge,splice:ge,flat:ge,fill:ge},$e={add:me,clear:me,delete:me},xe=["keys","values","entries"],Ce={set:ve,clear:ve,delete:ve},Se=new Set([...be].concat([...ye]).concat(Object.keys(we))),Oe=new Set([..._e].concat(Object.keys($e)).concat(xe)),Pe=new Set([...ke].concat(Object.keys(Ce)).concat(xe));class Ae{constructor(e,t,n){this._path=t,this._isChanged=!1,this._clonedCache=new Set,e instanceof WeakSet?this._weakValue=e.has(n[0]):e instanceof WeakMap?this._weakValue=e.get(n[0]):this.clone=void 0===t?e:this._shallowClone(e)}_shallowClone(e){let t;return fe(e)?t={...e}:te(e)?t=[...e]:e instanceof Date?t=new Date(e):e instanceof Set?t=new Set(e):e instanceof Map&&(t=new Map(e)),this._clonedCache.add(t),t}preferredThisArg(e,t,n){const{name:s}=e;return je.isHandledMethod(n,s)?(te(n)?this._onIsChanged=we[s]:n instanceof Set?this._onIsChanged=$e[s]:n instanceof Map&&(this._onIsChanged=Ce[s]),n):t}update(e,t,n){if(void 0!==n&&"length"!==t){let s=this.clone;ce(re(e,this._path),(e=>{this._clonedCache.has(s[e])||(s[e]=this._shallowClone(s[e])),s=s[e]})),s[t]=n}this._isChanged=!0}isChanged(e,t,n){return e instanceof Date?!t(this.clone.valueOf(),e.valueOf()):e instanceof WeakSet?this._weakValue!==e.has(n[0]):e instanceof WeakMap?this._weakValue!==e.get(n[0]):void 0===this._onIsChanged?this._isChanged:this._onIsChanged(this.clone,e)}}class je{constructor(){this.stack=[]}static isHandledType(e){return fe(e)||te(e)||ee.withMutableMethods(e)}static isHandledMethod(e,t){return fe(e)?be.has(t):te(e)?Se.has(t):e instanceof Set?Oe.has(t):e instanceof Map?Pe.has(t):ee.withMutableMethods(e)}get isCloning(){return 0!==this.stack.length}start(e,t,n){this.stack.push(new Ae(e,t,n))}update(e,t,n){this.stack[this.stack.length-1].update(e,t,n)}preferredThisArg(e,t,n){return this.stack[this.stack.length-1].preferredThisArg(e,t,n)}isChanged(e,t,n,s){return this.stack[this.stack.length-1].isChanged(e,t,n,s)}stop(){return this.stack.pop().clone}}var De=je;const{TARGET:Me,UNSUBSCRIBE:Re}=Z,Ee={equals:Object.is,isShallow:!1,pathAsArray:!1,ignoreSymbols:!1,ignoreUnderscores:!1,ignoreDetached:!1},Te=(e,t,n={})=>{n={...Ee,...n};const s=Symbol("ProxyTarget"),{equals:r,isShallow:i,ignoreDetached:o}=n,l=new he(r),c=new De,a=(t,s,r,i)=>{de(l,n,s)||o&&l.isDetached(t,e)||u(l.getPath(t),s,r,i)},u=(e,n,s,r,i)=>{c.isCloning?c.update(e,n,s):t(ie(e,n),r,s,i)},d=e=>e&&e[s]||e,h=(t,r,c,a)=>ee.withoutMutableMethods(t)||"constructor"===c||i&&!De.isHandledMethod(r,c)||de(l,n,c)||l.isGetInvariant(r,c)||o&&l.isDetached(r,e)?t:(void 0===a&&(a=l.getPath(r)),l.getProxy(t,ie(a,c),f,s)),f={get(e,t,n){if(ne(t)){if(t===s||t===Me)return e;if(t===Re&&!l.isUnsubscribed&&0===l.getPath(e).length)return l.unsubscribe(),e}const r=ee.withMutableMethods(e)?Reflect.get(e,t):Reflect.get(e,t,n);return h(r,e,t)},set(e,t,n,i){n=d(n);const o=e[s]||e,c=o[t],u=t in e;return!!l.setProperty(o,t,n,i,c)&&(r(c,n)&&u||a(e,t,c,n),!0)},defineProperty(e,t,n){if(!l.isSameDescriptor(n,e,t)){if(!l.defineProperty(e,t,n))return!1;a(e,t,void 0,n.value)}return!0},deleteProperty(e,t){if(!Reflect.has(e,t))return!0;const n=Reflect.get(e,t);return!!l.deleteProperty(e,t,n)&&(a(e,t,n),!0)},apply(e,t,n){const i=t[s]||t;if(l.isUnsubscribed)return Reflect.apply(e,i,n);if(De.isHandledType(i)){const o=oe(l.getPath(e)),a=De.isHandledMethod(i,e.name);c.start(i,o,n);const p=Reflect.apply(e,c.preferredThisArg(e,t,i),a?n.map((e=>d(e))):n),g=c.isChanged(i,r,n),m=c.stop();return g&&(c.isCloning?u(oe(o),le(o),m,i,e.name):u(o,"",m,i,e.name)),(t instanceof Map||t instanceof Set)&&(e=>"object"==typeof e&&"function"==typeof e.next)(p)?ue(p,e,t,o,h):De.isHandledType(p)&&a?l.getProxy(p,o,f,s):p}return Reflect.apply(e,t,n)}},p=l.getProxy(e,n.pathAsArray?[]:"",f);return t=t.bind(p),p};Te.target=e=>e[Me]||e,Te.unsubscribe=e=>e[Re]||e;var Ue=Te;const Ie=[];function ze(t,n=e){let s;const r=[];function i(e){if(o(t,e)&&(t=e,s)){const e=!Ie.length;for(let e=0;e<r.length;e+=1){const n=r[e];n[1](),Ie.push(n,t)}if(e){for(let e=0;e<Ie.length;e+=2)Ie[e][0](Ie[e+1]);Ie.length=0}}}return{set:i,update:function(e){i(e(t))},subscribe:function(o,l=e){const c=[o,l];return r.push(c),1===r.length&&(s=n(i)||e),o(t),()=>{const e=r.indexOf(c);-1!==e&&r.splice(e,1),0===r.length&&(s(),s=null)}}}}const We=ze({}),qe=ze(""),He=ze({});let Be={commands:commands};We.subscribe((e=>Be=e));let Ne="";qe.subscribe((e=>Ne=e));let Ge={};He.subscribe((e=>Ge=e));const Ve=Ue(Ge,((e,t,n,s)=>{He.update((e=>Ge))}));Ve.depth=0,Ve.argDepth=0,Ve.tokens=[],Ve.pages=[],Ve.toasts=[];const Le={Toast:class{constructor(e,t){this.msg=Array.isArray(e)?e.join(" "):e,this.color=t,Ve.toasts.push(this),setTimeout((function(){Ve.toasts.splice(this,1)}),3e3)}},execute:function(e){null==e||e.run},parse:function(e){let t=e,n=this.tokenize(e),s={commands:commands};Ve.depth=0;for(let e of n)(null==s?void 0:s.commands)&&Object.keys(s.commands).includes(e)&&" "===t[t.lastIndexOf(e)+e.length]&&(s=s.commands[e],Ve.depth++);Ve.tokens=n,We.update((e=>s))},select:function(e){let t=this.tokenize(Ne);(null==Be?void 0:Be.commands)&&Object.keys(null==Be?void 0:Be.commands).includes(e)?(t.length>Ve.depth?qe.update((n=>[...t.slice(0,t.length-1),e,""].join(" "))):qe.update((n=>[...t,e,""].join(" "))),this.parse(Ne)):(null==Be?void 0:Be.args)&&Be.args.filter((e=>!e.required&&!e.isArg)).some((t=>t.name===e))&&(t.length>Ve.depth?qe.update((n=>[...t.slice(0,t.length-1),`--${e}`,""].join(" "))):qe.update((n=>[...t,`--${e}`,""].join(" "))),this.parse(Ne))},filter:function(e){let t=this.tokenize(e),n=t[t.length-1];if(null==Be?void 0:Be.args)return this.getArgs(e);if(null==Be?void 0:Be.commands){if(t.length>Ve.depth){let e=Object.keys(Be.commands).filter((e=>-1!==e.indexOf(n))),t={};return e.map((e=>t[e]=Be.commands[e])),t}return Be.commands}return[]},getArgs:function(e){let t=this.tokenize(e),n=null==Be?void 0:Be.args.filter((e=>e.required)),s=null==Be?void 0:Be.args.filter((e=>!e.required&&e.isArg)),r=null==Be?void 0:Be.args.filter((e=>!e.required&&!e.isArg)),i=this.separateArgs(t.slice(Ve.depth),e),o=[...n,...s][i.withSpace.params.length];return r=r.filter((e=>!i.flags.includes(e.name))),[o,...r].filter((e=>void 0!==e))},separateArgs:function(e,t=""){var n;let s=[],r=[],i=0,o={params:[],flags:[]};for(let l=0;l<e.length;l++){let c=e[l];if(c.startsWith("-")){if(null!==c.match(/^(-)(\w)+/g))s.push(...c.split("").slice(1).map((e=>{var t,n;return null===(n=null===(t=null==Be?void 0:Be.args)||void 0===t?void 0:t.find((t=>t.short===e)))||void 0===n?void 0:n.name})));else if(null!==c.match(/^(--)(.)+/g)){let e=null===(n=null==Be?void 0:Be.args)||void 0===n?void 0:n.find((e=>e.name===c.substr(2)));if(void 0===e)continue;"boolean"!==(null==e?void 0:e.type)?(s.push(e.name),i++,l++):"boolean"===(null==e?void 0:e.type)&&s.push(e.name)}}else r.push(c)," "===t[t.lastIndexOf(c)+c.length]&&o.params.push(c)}return Ve.argDepth=s.length+o.params.length+i,{flags:s,params:r,withSpace:o}},setCurrent:function(e){Object.keys(Be.commands).includes(e)&&We.update((t=>Be.commands[e]))},tokenize:function(e){let t=e.split(""),n=[],s="",r=!1;for(let e=0;e<t.length;e++){const i=t[e];" "===i?!1===r?(n.push(s),s=""):s+=i:'"'===i?'"'===r?(r=!1,s+=i,n.push(s),s="",e++):"'"===r?s+=i:(s+=i,r='"'):"'"===i?"'"===r?(r=!1,s+=i,n.push(s),s="",e++):'"'===r?s+=i:(s+=i,r="'"):s+=i}return""!==s&&n.push(s),n}};function Ke(e){const t=e-1;return t*t*t+1}function Fe(e,{delay:n=0,duration:s=400,easing:r=t}={}){const i=+getComputedStyle(e).opacity;return{delay:n,duration:s,easing:r,css:e=>"opacity: "+e*i}}function Je(e,{delay:t=0,duration:n=400,easing:s=Ke,x:r=0,y:i=0,opacity:o=0}={}){const l=getComputedStyle(e),c=+l.opacity,a="none"===l.transform?"":l.transform,u=c*(1-o);return{delay:t,duration:n,easing:s,css:(e,t)=>`\n\t\t\ttransform: ${a} translate(${(1-e)*r}px, ${(1-e)*i}px);\n\t\t\topacity: ${c-u*t}`}}function Qe(e,t,n){const s=e.slice();return s[16]=t[n],s[15]=n,s}function Xe(e,t,n){const s=e.slice();return s[13]=t[n],s[15]=n,s}function Ye(e,t,n){const s=e.slice();return s[18]=t[n],s}function Ze(n){let s,o,l,c,u,d,h=n[18].msg+"";return{c(){s=b("div"),o=y(h),$(s,"class",l="clui-toast clui-toast-"+n[18].color+" svelte-bdks4t")},m(e,t){g(e,s,t),p(s,o),d=!0},p(e,t){(!d||8&t)&&h!==(h=e[18].msg+"")&&x(o,h),(!d||8&t&&l!==(l="clui-toast clui-toast-"+e[18].color+" svelte-bdks4t"))&&$(s,"class",l)},i(n){d||(z((()=>{u&&u.end(1),c||(c=function(n,s,r){let o,l,c=s(n,r),u=!1,d=0;function h(){o&&j(n,o)}function p(){const{delay:s=0,duration:r=300,easing:i=t,tick:p=e,css:g}=c||Q;g&&(o=A(n,0,1,r,s,i,g,d++)),p(0,1);const m=a()+s,v=m+r;l&&l.abort(),u=!0,z((()=>V(n,!0,"start"))),l=f((e=>{if(u){if(e>=v)return p(1,0),V(n,!0,"end"),h(),u=!1;if(e>=m){const t=i((e-m)/r);p(t,1-t)}}return u}))}let g=!1;return{start(){g||(j(n),i(c)?(c=c(),G().then(p)):p())},invalidate(){g=!1},end(){u&&(h(),u=!1)}}}(s,Je,{x:200,duration:500})),c.start()})),d=!0)},o(n){c&&c.invalidate(),u=function(n,s,o){let l,c=s(n,o),u=!0;const d=K;function h(){const{delay:s=0,duration:i=300,easing:o=t,tick:h=e,css:p}=c||Q;p&&(l=A(n,1,0,i,s,o,p));const g=a()+s,m=g+i;z((()=>V(n,!1,"start"))),f((e=>{if(u){if(e>=m)return h(0,1),V(n,!1,"end"),--d.r||r(d.c),!1;if(e>=g){const t=o((e-g)/i);h(1-t,t)}}return u}))}return d.r+=1,i(c)?G().then((()=>{c=c(),h()})):h(),{end(e){e&&c.tick&&c.tick(1,0),u&&(l&&j(n,l),u=!1)}}}(s,Fe,{duration:300}),d=!1},d(e){e&&m(s),e&&u&&u.end()}}}function et(e){let t,n=Le.filter(e[2]),s=[];for(let t=0;t<n.length;t+=1)s[t]=nt(Qe(e,n,t));return{c(){for(let e=0;e<s.length;e+=1)s[e].c();t=k()},m(e,n){for(let t=0;t<s.length;t+=1)s[t].m(e,n);g(e,t,n)},p(e,r){if(37&r){let i;for(n=Le.filter(e[2]),i=0;i<n.length;i+=1){const o=Qe(e,n,i);s[i]?s[i].p(o,r):(s[i]=nt(o),s[i].c(),s[i].m(t.parentNode,t))}for(;i<s.length;i+=1)s[i].d(1);s.length=n.length}},d(e){v(s,e),e&&m(t)}}}function tt(e){let t,n=Object.keys(Le.filter(e[2])),s=[];for(let t=0;t<n.length;t+=1)s[t]=st(Xe(e,n,t));return{c(){for(let e=0;e<s.length;e+=1)s[e].c();t=k()},m(e,n){for(let t=0;t<s.length;t+=1)s[t].m(e,n);g(e,t,n)},p(e,r){if(39&r){let i;for(n=Object.keys(Le.filter(e[2])),i=0;i<n.length;i+=1){const o=Xe(e,n,i);s[i]?s[i].p(o,r):(s[i]=st(o),s[i].c(),s[i].m(t.parentNode,t))}for(;i<s.length;i+=1)s[i].d(1);s.length=n.length}},d(e){v(s,e),e&&m(t)}}}function nt(e){let t,n,s,i,o,l,c,a,u,d,h=(e[16].short?e[16].short+", ":"")+e[16].name,f=e[16]?.description+"";function v(){return e[11](e[15])}function k(){return e[12](e[16])}return{c(){t=b("div"),n=b("span"),s=y(h),i=_(),o=b("span"),l=y(f),c=_(),$(n,"class","clui-dropdown-name svelte-bdks4t"),$(o,"class","clui-dropdown-description"),$(t,"class",a="clui-dropdown-item "+(e[15]===e[0]?"clui-selected":"")+" svelte-bdks4t")},m(e,r){g(e,t,r),p(t,n),p(n,s),p(t,i),p(t,o),p(o,l),p(t,c),u||(d=[w(t,"mouseover",v),w(t,"click",k)],u=!0)},p(n,r){e=n,4&r&&h!==(h=(e[16].short?e[16].short+", ":"")+e[16].name)&&x(s,h),4&r&&f!==(f=e[16]?.description+"")&&x(l,f),1&r&&a!==(a="clui-dropdown-item "+(e[15]===e[0]?"clui-selected":"")+" svelte-bdks4t")&&$(t,"class",a)},d(e){e&&m(t),u=!1,r(d)}}}function st(e){let t,n,s,i,o,l,c,a,u,d,h=e[13]+"",f=e[1].commands[e[13]].description+"";function v(){return e[9](e[13])}function k(){return e[10](e[15])}return{c(){t=b("div"),n=b("span"),s=y(h),i=_(),o=b("span"),l=y(f),c=_(),$(n,"class","clui-dropdown-name svelte-bdks4t"),$(o,"class","clui-dropdown-description"),$(t,"class",a="clui-dropdown-item "+(e[15]===e[0]?"clui-selected":"")+" svelte-bdks4t")},m(e,r){g(e,t,r),p(t,n),p(n,s),p(t,i),p(t,o),p(o,l),p(t,c),u||(d=[w(t,"click",v),w(t,"mouseover",k)],u=!0)},p(n,r){e=n,4&r&&h!==(h=e[13]+"")&&x(s,h),6&r&&f!==(f=e[1].commands[e[13]].description+"")&&x(l,f),1&r&&a!==(a="clui-dropdown-item "+(e[15]===e[0]?"clui-selected":"")+" svelte-bdks4t")&&$(t,"class",a)},d(e){e&&m(t),u=!1,r(d)}}}function rt(e){let t,n,s,i,o,l,c,a,u,d,h,f,k,S,O,P,A,j,D=e[3]?.tokens.slice(0,e[3].depth+e[3].argDepth).join(" ")+"",M=e[3].toasts,R=[];for(let t=0;t<M.length;t+=1)R[t]=Ze(Ye(e,M,t));const E=e=>J(R[e],1,1,(()=>{R[e]=null}));function T(e,t){return e[1]?.commands?tt:e[1]?.args?et:void 0}let U=T(e),I=U&&U(e);return{c(){t=b("div");for(let e=0;e<R.length;e+=1)R[e].c();n=_(),s=b("div"),i=b("div"),o=b("img"),c=_(),a=b("div"),u=y(D),d=_(),h=b("input"),f=_(),k=b("div"),I&&I.c(),S=_(),O=b("div"),$(t,"class","clui-toasts svelte-bdks4t"),o.src!==(l="icons/cli.png")&&$(o,"src","icons/cli.png"),$(o,"alt",""),$(o,"class","clui-cli-icon svelte-bdks4t"),$(a,"class","clui-cli-autocomplete svelte-bdks4t"),$(h,"type","text"),$(h,"placeholder","enter a command"),$(h,"class","svelte-bdks4t"),$(i,"class","clui-cli-input svelte-bdks4t"),$(k,"class","clui-cli-dropdown svelte-bdks4t"),$(s,"class","clui-cli svelte-bdks4t"),$(O,"class","clui-pages")},m(r,l){g(r,t,l);for(let e=0;e<R.length;e+=1)R[e].m(t,null);g(r,n,l),g(r,s,l),p(s,i),p(i,o),p(i,c),p(i,a),p(a,u),p(i,d),p(i,h),C(h,e[2]),p(s,f),p(s,k),I&&I.m(k,null),g(r,S,l),g(r,O,l),P=!0,A||(j=[w(window,"error",e[7]),w(h,"input",e[8]),w(h,"input",e[4]),w(h,"keydown",e[6])],A=!0)},p(e,[n]){if(8&n){let s;for(M=e[3].toasts,s=0;s<M.length;s+=1){const r=Ye(e,M,s);R[s]?(R[s].p(r,n),F(R[s],1)):(R[s]=Ze(r),R[s].c(),F(R[s],1),R[s].m(t,null))}for(K={r:0,c:[],p:K},s=M.length;s<R.length;s+=1)E(s);K.r||r(K.c),K=K.p}(!P||8&n)&&D!==(D=e[3]?.tokens.slice(0,e[3].depth+e[3].argDepth).join(" ")+"")&&x(u,D),4&n&&h.value!==e[2]&&C(h,e[2]),U===(U=T(e))&&I?I.p(e,n):(I&&I.d(1),I=U&&U(e),I&&(I.c(),I.m(k,null)))},i(e){if(!P){for(let e=0;e<M.length;e+=1)F(R[e]);P=!0}},o(e){R=R.filter(Boolean);for(let e=0;e<R.length;e+=1)J(R[e]);P=!1},d(e){e&&m(t),v(R,e),e&&m(n),e&&m(s),I&&I.d(),e&&m(S),e&&m(O),A=!1,r(j)}}}function it(e,t,n){let s,r,i;l(e,We,(e=>n(1,s=e))),l(e,qe,(e=>n(2,r=e))),l(e,He,(e=>n(3,i=e)));let o=0;!function(e,t,n=t){e.set(n)}(We,s={commands:commands},s);const c=e=>n(0,o=e);return[o,s,r,i,()=>Le.parse(r),c,e=>{"Enter"===e.key||("Tab"===e.key?(e.preventDefault(),s?.commands&&Le.select(Object.keys(Le.filter(r))[o]),s?.args&&Le.select(Le.filter(r)[o]?.name)):"ArrowUp"===e.key?(e.preventDefault(),n(0,o--,o)):"ArrowDown"===e.key&&(e.preventDefault(),n(0,o++,o))),s?.commands?n(0,o=o>=Object.keys(Le.filter(r)).length?Object.keys(Le.filter(r)).length-1:o):s?.args&&n(0,o=o>=Le.filter(r).length?Le.filter(r).length-1:o),n(0,o=o<0?0:o)},e=>new Le.Toast(e.message,"red"),function(){r=this.value,qe.set(r)},e=>Le.select(e),e=>c(e),e=>c(e),e=>Le.select(e.name)]}return new class extends class{$destroy(){!function(e,t){const n=e.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}{constructor(e){super(),Y(this,e,it,rt,o,{})}}({target:document.getElementById("clui")})}();
