/**
 * 核心 dom 属性器
 * @author ydr.me
 * @create 2016年04月14日22:42:03
 */


'use strict';


var dataSet = require('blear.polyfills.data-set');
var classList = require('blear.polyfills.class-list');

var typeis = require('blear.utils.typeis');
var string = require('blear.utils.string');
var access = require('blear.utils.access');
var array = require('blear.utils.array');
var compatible = require('blear.utils.compatible');
var json = require('blear.utils.json');
var validator = require('blear.utils.validator');
var object = require('blear.utils.object');

var win = window;
var doc = win.document;
var bodyEl = doc.body;
var rePx = /margin|width|height|padding|top|right|bottom|left|translate|font/i;
var reDeg = /rotate|skew/i;
var spaceRE = /\s+/;
var cssExceptions = {
    'float': ['cssFloat', 'styleFloat'] // styleFloat is IE8
};
var propFix = {
    "class": "className",
    contenteditable: "contentEditable",
    "for": "htmlFor",
    readonly: "readOnly",
    tabindex: "tabIndex"
};


/**
 * 标准化 css
 * @param cssKey
 * @param cssVal
 * @returns {*}
 */
var css = exports.css = function (cssKey, cssVal) {
    var args = access.args(arguments);
    var sett = {};
    var ret = {};
    var returnKV = false;
    var lastCom = null;

    if (args.length === 2) {
        sett[cssKey] = cssVal;
        returnKV = true;
    } else {
        sett = cssKey;
    }

    object.each(sett, function (_cssKey, _cssVal) {
        // transform
        if (typeis.Object(_cssVal)) {
            _cssVal = transform(_cssVal);
        }

        // to string
        _cssVal += '';

        // width: 100 => width: 100px
        if (rePx.test(_cssKey) && validator.isNumber(_cssVal)) {
            _cssVal += 'px';
        }

        lastCom = compatible.css(_cssKey, _cssVal);
        ret[lastCom.key] = lastCom.val;
    });

    if (returnKV) {
        return lastCom;
    }

    return ret;
};

/**
 * 获取元素的样式
 * @param el {HTMLElement} 元素
 * @param cssKey {String} 样式名
 * @returns {string}
 */
var _getStyle = function (el, cssKey) {
    cssKey = compatible.css(cssKey).key;

    if (!cssKey) {
        return '';
    }

    cssKey = string.separatorize(cssKey);
    return getComputedStyle(el).getPropertyValue(cssKey);
};


/**
 * 获取元素的样式
 * @param el {HTMLElement} 元素
 * @param cssKey {String} 样式名
 * @returns {string}
 */
var getStyle = function (el, cssKey) {
    var cssException = cssExceptions[cssKey];
    var cssVal = '';

    // @fuckie
    /* istanbul ignore next */
    if (cssException) {
        array.each(cssException, function (index, item) {
            cssVal = _getStyle(el, item);
            if (cssVal) {
                return false;
            }
        });

        if (cssVal) {
            return cssVal;
        }
    }

    return _getStyle(el, cssKey);
};


/**
 * 设置元素样式
 * @param el {HTMLElement} 元素
 * @param cssKey {String} 样式名
 * @param cssVal {String} 样式值
 */
var _setStyle = function (el, cssKey, cssVal) {
    try {
        //@fuckie `min-width = none` 等会报错
        el.style[cssKey] = cssVal;
    } catch (err) {
        // ignore
    }
};


/**
 * 设置元素样式
 * @param el {HTMLElement} 元素
 * @param cssKey {String} 样式名
 * @param cssVal {String} 样式值
 */
var setStyle = function (el, cssKey, cssVal) {
    _setStyle(el, cssKey, cssVal);

    var cssException = cssExceptions[cssKey];

    // @fuckie
    /* istanbul ignore next */
    if (cssException) {
        array.each(cssException, function (index, item) {
            _setStyle(el, item, cssVal);
        });
    }
};


/**
 * transform 值
 * @param tf
 */
var transform = function (tf) {
    var ret = [];

    object.each(tf, function (k, v) {
        if (typeis.Number(v)) {
            if (rePx.test(k)) {
                v += 'px';
            } else if (reDeg.test(k)) {
                v += 'deg';
            }
        }

        ret.push(k + '(' + v + ')');
    });

    return ret.join(' ');
};


/**
 * 设置或获取样式
 * @param el {HTMLElement|*}
 * @param cssKey {string|array|object}
 * @param [cssVal] {string|number}
 * @returns {string|array|object}
 */
var style = exports.style = function (el, cssKey, cssVal) {
    var args = access.args(arguments).slice(1);
    return access.getSet({
        get: function (cssKey) {
            return getStyle(el, cssKey);
        },
        set: function (cssKey, cssVal) {
            var cssStd = css(cssKey, cssVal);
            setStyle(el, cssStd.key, cssStd.val);
        }
    }, args);
};


/**
 * 显示元素
 * @param el {HTMLElement} 元素
 * @param [display] {String} 显示值
 */
exports.show = function (el, display) {
    style(el, 'display', display || 'block');
};


/**
 * 隐藏元素
 * @param el {HTMLElement|Object} 元素
 */
exports.hide = function (el) {
    style(el, 'display', 'none');
};


/**
 * 获取元素属性
 * @param el
 * @param attrKey
 * @returns {string}
 */
var getAttribute = function (el, attrKey) {
    attrKey = string.separatorize(attrKey);
    return el.getAttribute(attrKey);
};


/**
 * 获取元素属性
 * @param el
 * @param attrKey
 * @param attrVal
 */
var setAttribute = function (el, attrKey, attrVal) {
    attrKey = string.separatorize(attrKey);
    return el.setAttribute(attrKey, attrVal);
};


/**
 * 设置或获取属性
 * @param el {HTMLElement|*}
 * @param attrKey {string|array|object}
 * @param [attrVal] {string|number}
 * @returns {string|array|object|undefined}
 */
exports.attr = function (el, attrKey, attrVal) {
    var args = access.args(arguments).slice(1);
    return access.getSet({
        get: function (attrKey) {
            return getAttribute(el, attrKey);
        },
        set: function (attrKey, attrVal) {
            setAttribute(el, attrKey, attrVal);
        }
    }, args);
};


/**
 * 移除元素属性
 * @param el {HTMLElement|*}
 * @param attrKey {string|array|object}
 */
exports.removeAttr = function (el, attrKey) {
    // @covertest 覆盖测试有问题
    /* istanbul ignore next */
    var args = access.args(arguments).slice(1);
    // @covertest 覆盖测试有问题
    /* istanbul ignore next */
    return access.getSet({
        set: function (attrKey) {
            attrKey = string.separatorize(attrKey);
            el.removeAttribute(attrKey)
        },
        setLength: 1
    }, args);
};


/**
 * 移除元素属性
 * @param el {HTMLElement|*}
 * @param attrKey {string|array|object}
 */
exports.hasAttr = function (el, attrKey) {
    var args = access.args(arguments).slice(1);
    return access.getSet({
        get: function (attrKey) {
            attrKey = string.separatorize(attrKey);
            return el.hasAttribute(attrKey);
        },
        setLength: 0
    }, args);
};


/**
 * 获取修正后的 prop key
 * @param propKey
 * @returns {*}
 */
var getFixPropKey = function (propKey) {
    if (propFix[propKey]) {
        return propFix[propKey];
    }

    return propKey;
};


/**
 * 设置或获取特性
 * @param el {HTMLElement|*}
 * @param propKey {string|array|object}
 * @param [propVal] {string|number}
 * @returns {string|array|object|undefined}
 */
exports.prop = function (el, propKey, propVal) {
    var args = access.args(arguments).slice(1);
    return access.getSet({
        get: function (propKey) {
            return el[getFixPropKey(propKey)];
        },
        set: function (propKey, propVal) {
            el[getFixPropKey(propKey)] = propVal;
        }
    }, args);
};


/**
 * 设置或获取 dataset
 * @param el {HTMLElement|*}
 * @param dataKey {string|array|object}
 * @param [dataVal] {string|number}
 * @returns {string|array|object|undefined}
 *
 * @example
 * attribute.data(el, 'some');
 * attribute.data(el, 'some-key');
 * attribute.data(el, 'someKey');
 * attribute.data(el, 'some', 'some');
 * attribute.data(el, 'some-key', {a: 1});
 * attribute.data(el, 'someKey', {a: 1});
 */
exports.data = function (el, dataKey, dataVal) {
    var args = access.args(arguments).slice(1);
    return access.getSet({
        get: function (dataKey) {
            return dataSet.get(el, dataKey);
        },
        set: function (dataKey, dataVal) {
            dataSet.set(el, dataKey, dataVal);
        }
    }, args);
};


/**
 * 添加 className
 * @param el
 * @param className
 * @returns {*}
 */
exports.addClass = function (el, className) {
    var args = access.args(arguments).slice(1);
    return access.getSet({
        set: function (className) {
            array.each(className.trim().split(spaceRE), function (index, className) {
                classList.add(el, className);
            });
        },
        setLength: 1
    }, args);
};


/**
 * 添加 className
 * @param el
 * @param className
 * @returns {*}
 */
exports.removeClass = function (el, className) {
    var args = access.args(arguments).slice(1);
    return access.getSet({
        set: function (className) {
            array.each(className.trim().split(spaceRE), function (index, className) {
                classList.remove(el, className);
            });
        },
        setLength: 1
    }, args);
};


/**
 * 添加 className
 * @param el
 * @param className
 * @returns {*}
 */
exports.hasClass = function (el, className) {
    var args = access.args(arguments).slice(1);
    return access.getSet({
        get: function (className) {
            return classList.has(el, className);
        },
        setLength: 0
    }, args);
};


/**
 * 设置、获取 html
 * @param el
 * @param html
 * @returns {*}
 */
exports.html = function (el, html) {
    var args = access.args(arguments).slice(1);
    return access.getSet({
        get: function () {
            return el.innerHTML;
        },
        set: function (html) {
            el.innerHTML = html;
        },
        setLength: 1
    }, args);
};


/**
 * 设置、获取 text
 * @param node
 * @param text
 * @returns {*}
 */
exports.text = function (node, text) {
    var args = access.args(arguments).slice(1);
    return access.getSet({
        get: function () {
            return node.textContent;
        },
        set: function (text) {
            node.textContent = text;
        },
        setLength: 1
    }, args);
};
