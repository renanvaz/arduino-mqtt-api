import {INPUT, OUTPUT, INPUT_PULLUP, HIGH, LOW, Board} from '../src/Board';

var b = new Board('123.456.1.789');
b.pinMode(15, INPUT);
b.pinMode('1', OUTPUT);
b.pinMode(10, INPUT_PULLUP);
