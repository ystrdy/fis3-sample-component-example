require('./mod.js');
require('./jquery-1.8.3.min.js');

require('/modules/nav/nav')();
console.log('common...');

console.log($('title').html());