/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var attribute = require('../src/index.js');
var doc = window.document;
var divEl = null;
var styleEl = null;
var id = 'div-' + new Date().getTime();

describe('测试文件', function () {
    beforeAll(function (done) {
        styleEl = doc.createElement('style');
        var cssText = '#' + id + '{' +
            'float: left;' +
            'width: 200px;' +
            'padding: 10px;' +
            'background: #f00;' +
            'opacity: 0.5;' +
            'filter: alpha(opacity=50);' +
            '}';
        divEl = doc.createElement('div');
        divEl.id = id;
        doc.body.appendChild(styleEl);
        if (styleEl.styleSheet) {
            styleEl.styleSheet.cssText = cssText;
        } else {
            styleEl.innerHTML = cssText;
        }
        doc.body.appendChild(divEl);
        done();
    });

    afterAll(function () {
        doc.body.removeChild(divEl);
        doc.body.removeChild(styleEl);
    });

    it('.css', function (done) {
        var ret1 = attribute.css({
            width: 100
        });
        var ret2 = attribute.css('width', 100);
        var ret3 = attribute.css({
            transform: {
                translateX: 100,
                rotate: 100
            }
        });

        expect(ret1.width).toEqual('100px');
        expect(ret2.key).toEqual('width');
        expect(ret2.val).toEqual('100px');
        console.log(ret3);
        
        if (ret3.transform || ret3['-webkit-transform']) {
            expect(ret3.transform || ret3['-webkit-transform']).toMatch(/translateX\(100px\)/);
            expect(ret3.transform || ret3['-webkit-transform']).toMatch(/rotate\(100deg\)/);
        }

        done();
    });

    it('.style', function (done) {
        expect(attribute.style(divEl, 'border-xx-radius')).toEqual('');
        expect(attribute.style(divEl, 'float')).toEqual('left');
        expect(attribute.style(divEl, 'opacity')).toEqual('0.5');
        attribute.style(divEl, 'opacity', 0.9);
        // phantom 里返回的是 0.8999999761581421
        expect(parseFloat(attribute.style(divEl, 'opacity')).toFixed(1)).toEqual('0.9');
        expect(attribute.style(divEl, 'width')).toEqual('200px');
        expect(attribute.style(divEl, 'display')).toEqual('block');
        var ret = attribute.style(divEl, ['display', 'height']);
        expect(ret.display).not.toBe(undefined);
        expect(ret.height).not.toBe(undefined);
        attribute.style(divEl, 'width', 300);
        attribute.style(divEl, {
            'margin-left': 10,
            paddingLeft: 20
        });
        expect(attribute.style(divEl, 'width')).toEqual('300px');
        expect(attribute.style(divEl, 'margin-left')).toEqual('10px');
        expect(attribute.style(divEl, 'paddingLeft')).toEqual('20px');
        done();
    });

    it('.attr/.removeAttr/.hasAttr', function (done) {
        attribute.attr(divEl, 'a', 1);
        expect(attribute.attr(divEl, 'a')).toEqual('1');

        attribute.attr(divEl, {
            b: 2,
            c: 3
        });
        expect(attribute.attr(divEl, ['b', 'c'])).toEqual({
            b: '2',
            c: '3'
        });

        attribute.removeAttr(divEl, 'a');
        expect(attribute.hasAttr(divEl, 'a')).toBe(false);

        attribute.removeAttr(divEl, ['b', 'c']);
        expect(attribute.hasAttr(divEl, ['b', 'c'])).toEqual({
            b: false,
            c: false
        });

        done();
    });

    it('.prop', function (done) {
        var prop1 = {
            a: 1,
            b: 2
        };
        attribute.prop(divEl, 'aa', prop1);
        attribute.prop(divEl, 'class', 'abc');
        attribute.prop(divEl, 'contenteditable', true);
        attribute.prop(divEl, 'for', 'abc');
        attribute.prop(divEl, 'readonly', true);
        attribute.prop(divEl, 'tabindex', -1);
        expect(attribute.prop(divEl, 'aa')).toBe(prop1);
        expect(attribute.prop(divEl, 'class')).toBe('abc');
        expect(attribute.prop(divEl, 'className')).toBe('abc');
        // @todo 为什么是字符串 true
        expect(attribute.prop(divEl, 'contenteditable')).toBe('true');
        expect(attribute.prop(divEl, 'contentEditable')).toBe('true');
        expect(attribute.prop(divEl, 'for')).toBe('abc');
        expect(attribute.prop(divEl, 'htmlFor')).toBe('abc');
        expect(attribute.prop(divEl, 'readonly')).toBe(true);
        expect(attribute.prop(divEl, 'readOnly')).toBe(true);
        expect(attribute.prop(divEl, 'tabindex')).toBe(-1);
        expect(attribute.prop(divEl, 'tabIndex')).toBe(-1);

        var prop2 = {a: 1};
        var prop3 = {b: 2};
        attribute.prop(divEl, {
            bb: prop2,
            cc: prop3
        });
        var ret = attribute.prop(divEl, ['bb', 'cc']);
        expect(ret.bb).toBe(prop2);
        expect(ret.cc).toBe(prop3);

        done();
    });

    it('.data', function (done) {
        var data1 = {
            a: 1
        };
        attribute.data(divEl, 'a-aA', data1);
        expect(attribute.data(divEl, 'aAA')).toEqual({
            a: 1
        });
        expect(attribute.data(divEl, 'aAA')).not.toBe(data1);
        expect(attribute.data(divEl, 'a-a-a')).toEqual({
            a: 1
        });

        var data3 = [1];
        attribute.data(divEl, {
            'BBB': 'data2',
            'ccc': data3
        });
        var ret = attribute.data(divEl, ['-b-b-b', 'ccc']);
        expect(ret['-b-b-b']).toEqual('data2');
        expect(ret.ccc).toEqual([1]);
        expect(ret.ccc).not.toBe(data3);

        done();
    });

    it('.addClass/.removeClass/.hasClass', function (done) {
        attribute.addClass(divEl, 'a');
        expect(attribute.hasClass(divEl, 'a')).toBe(true);
        attribute.removeClass(divEl, 'a');
        expect(attribute.hasClass(divEl, 'a')).toBe(false);

        attribute.addClass(divEl, ['b', 'c']);
        expect(attribute.hasClass(divEl, ['b', 'c'])).toEqual({
            b: true,
            c: true
        });
        attribute.removeClass(divEl, ['b', 'c']);
        expect(attribute.hasClass(divEl, ['b', 'c'])).toEqual({
            b: false,
            c: false
        });

        done();
    });

    it('.html/.text', function (done) {
        attribute.html(divEl, '<b>');
        expect(attribute.html(divEl)).toEqual('<b></b>');
        expect(attribute.text(divEl)).toEqual('');
        attribute.text(divEl, '<b>');
        expect(attribute.text(divEl)).toEqual('<b>');
        expect(attribute.html(divEl)).toEqual('&lt;b&gt;');
        done();
    });
});
