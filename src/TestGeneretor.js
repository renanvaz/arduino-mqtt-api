'use strict';

console.log('antes');

function *teste() {
  console.log('call');

  var file = yield (function *(){
    console.log('inside');
    const caller = yield;
    yield setTimeout(() => { caller.success('Teste'); }, 1000);
  })().next().value;
  console.log(file);
};

 var a = teste();

console.log(a.next().value);
console.log(a.next().value);

console.log('depois');
