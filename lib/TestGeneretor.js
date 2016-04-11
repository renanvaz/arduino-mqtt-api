'use strict';

var _marked = [teste].map(regeneratorRuntime.mark);

console.log('antes');

function teste() {
  var file;
  return regeneratorRuntime.wrap(function teste$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log('call');

          _context2.next = 3;
          return regeneratorRuntime.mark(function _callee() {
            var caller;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    console.log('inside');
                    _context.next = 3;
                    return;

                  case 3:
                    caller = _context.sent;
                    _context.next = 6;
                    return setTimeout(function () {
                      caller.success('Teste');
                    }, 1000);

                  case 6:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, this);
          })().next().value;

        case 3:
          file = _context2.sent;

          console.log(file);

        case 5:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[0], this);
};

var a = teste();

console.log(a.next().value);
console.log(a.next().value);

console.log('depois');