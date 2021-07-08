import {readdirSync, renameSync, readFileSync, writeFileSync} from 'fs';

const list = readdirSync('dist');
const badJs = list.find(el => /index.+js/g.test(el));
const badCss = list.find(el => /index.+css/g.test(el));

try {
	renameSync('dist/' + badJs, 'dist/clui.js', ()=>{});
	console.log('index*.js renamed');
	let file = readFileSync('dist/index.html').toString();
	file = file.replace(badJs, 'clui.js');
	writeFileSync('dist/index.html', file);
	console.log('dist/index.html saved');
} catch (error) {
	console.error(error);
}
try {
	renameSync('dist/' + badCss, 'dist/clui.css', ()=>{});
	console.log('index*.css renamed');
	let file = readFileSync('dist/index.html').toString();
	file = file.replace(badCss, 'clui.css');
	writeFileSync('dist/index.html', file);
	console.log('dist/index.html saved');
} catch (error) {
	console.error(error);
}