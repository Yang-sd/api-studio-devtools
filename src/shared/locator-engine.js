(function(global) {
  'use strict';

  var ATTRIBUTE_PRIORITY = [
    { name: 'data-testid', strategy: 'data-testid', score: 100, useTag: false },
    { name: 'data-test', strategy: 'data-test', score: 98, useTag: false },
    { name: 'data-qa', strategy: 'data-qa', score: 96, useTag: false },
    { name: 'data-cy', strategy: 'data-cy', score: 94, useTag: false },
    { name: 'id', strategy: 'id', score: 92, useTag: false },
    { name: 'name', strategy: 'name', score: 88, useTag: true },
    { name: 'aria-label', strategy: 'aria-label', score: 84, useTag: true },
    { name: 'role', strategy: 'role', score: 78, useTag: true },
    { name: 'placeholder', strategy: 'placeholder', score: 72, useTag: true },
    { name: 'title', strategy: 'title', score: 68, useTag: true },
    { name: 'alt', strategy: 'alt', score: 66, useTag: true },
    { name: 'type', strategy: 'type', score: 54, useTag: true }
  ];

  var STATEFUL_CLASSES = {
    active: true,
    selected: true,
    checked: true,
    disabled: true,
    focused: true,
    focus: true,
    hover: true,
    open: true,
    closed: true,
    loading: true,
    hidden: true,
    visible: true
  };

  function inspectElement(element) {
    if (!element || element.nodeType !== 1) throw new Error('INVALID_ELEMENT');

    var cssResult = buildCssSelector(element);
    var shadowContext = buildShadowContext(element, cssResult);
    var xpathResult = shadowContext.hosts.length ? emptyLocator('shadow-dom') : buildXPath(element);
    var frameContext = buildFrameContext(element);
    var warnings = [];

    if (!cssResult.selector && !xpathResult.selector) {
      warnings.push('NO_STABLE_LOCATOR');
    }
    if (xpathResult.strategy === 'text') warnings.push('TEXT_MAY_CHANGE');
    if (!frameContext.isTopFrame) warnings.push('IFRAME_CONTEXT');
    if (shadowContext.hosts.length) warnings.push('SHADOW_CONTEXT');

    var recommendedType = cssResult.selector ? 'css' : (xpathResult.selector ? 'xpath' : '');
    var recommended = recommendedType === 'css' ? cssResult.selector : xpathResult.selector;

    return {
      id: 'locator_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      tagName: String(element.localName || element.tagName || '').toLowerCase(),
      elementLabel: describeElement(element),
      css: cssResult.selector,
      cssStrategy: cssResult.strategy,
      xpath: xpathResult.selector,
      xpathStrategy: xpathResult.strategy,
      recommended: recommended,
      recommendedType: recommendedType,
      unique: !!recommended,
      warnings: warnings,
      frame: frameContext,
      shadow: shadowContext,
      pageUrl: safeDocumentUrl(element.ownerDocument),
      capturedAt: Date.now()
    };
  }

  function buildCssSelector(element) {
    var root = getSelectorRoot(element);
    var directCandidates = buildCssCandidates(element);
    var directMatch = firstUniqueCss(root, element, directCandidates);
    if (directMatch.selector) return directMatch;

    var ancestor = element.parentElement;
    var depth = 0;
    while (ancestor && depth < 6 && getSelectorRoot(ancestor) === root) {
      var anchor = firstUniqueCss(root, ancestor, buildCssCandidates(ancestor));
      if (anchor.selector) {
        for (var i = 0; i < directCandidates.length; i++) {
          var combined = anchor.selector + ' ' + directCandidates[i].selector;
          if (isUniqueCss(root, combined, element)) {
            return { selector: combined, strategy: 'relative-' + directCandidates[i].strategy };
          }
        }
      }
      ancestor = ancestor.parentElement;
      depth++;
    }

    return emptyLocator('no-stable-css');
  }

  function buildCssCandidates(element) {
    var tag = getTagName(element);
    var attrs = getStableAttributes(element);
    var candidates = [];

    attrs.forEach(function(attr) {
      var selector;
      if (attr.name === 'id') selector = '#' + cssIdentifier(attr.value);
      else selector = (attr.useTag ? tag : '') + '[' + attr.name + '="' + cssString(attr.value) + '"]';
      pushCandidate(candidates, selector, attr.strategy, attr.score);
    });

    for (var i = 0; i < Math.min(attrs.length, 5); i++) {
      for (var j = i + 1; j < Math.min(attrs.length, 5); j++) {
        if (attrs[i].name === 'id' || attrs[j].name === 'id') continue;
        var combo = tag + attributeCss(attrs[i]) + attributeCss(attrs[j]);
        pushCandidate(candidates, combo, 'attributes', Math.min(attrs[i].score, attrs[j].score) - 1);
      }
    }

    var classes = getStableClasses(element);
    for (var count = 1; count <= Math.min(classes.length, 3); count++) {
      var classSelector = tag + classes.slice(0, count).map(function(value) {
        return '.' + cssIdentifier(value);
      }).join('');
      pushCandidate(candidates, classSelector, 'stable-class', 48 - count);
    }

    pushCandidate(candidates, tag, 'tag', 10);
    return candidates.sort(function(a, b) { return b.score - a.score; }).slice(0, 28);
  }

  function buildXPath(element) {
    var root = getSelectorRoot(element);
    if (!root || root.nodeType !== 9) return emptyLocator('xpath-unavailable');

    var candidates = buildXPathCandidates(element);
    var directMatch = firstUniqueXPath(root, element, candidates);
    if (directMatch.selector) return directMatch;

    var ancestor = element.parentElement;
    var depth = 0;
    while (ancestor && depth < 6 && getSelectorRoot(ancestor) === root) {
      var anchor = firstUniqueXPath(root, ancestor, buildXPathCandidates(ancestor));
      if (anchor.selector) {
        for (var i = 0; i < candidates.length; i++) {
          var relativePart = candidates[i].selector.replace(/^\/\//, '');
          var combined = anchor.selector + '//' + relativePart;
          if (isUniqueXPath(root, combined, element)) {
            return { selector: combined, strategy: 'relative-' + candidates[i].strategy };
          }
        }
      }
      ancestor = ancestor.parentElement;
      depth++;
    }

    return emptyLocator('no-stable-xpath');
  }

  function buildXPathCandidates(element) {
    var tag = getTagName(element);
    var attrs = getStableAttributes(element);
    var candidates = [];

    attrs.forEach(function(attr) {
      var nodeName = attr.useTag ? tag : '*';
      pushCandidate(candidates, '//' + nodeName + '[@' + attr.name + '=' + xpathLiteral(attr.value) + ']', attr.strategy, attr.score);
    });

    for (var i = 0; i < Math.min(attrs.length, 5); i++) {
      for (var j = i + 1; j < Math.min(attrs.length, 5); j++) {
        var combo = '//' + tag + '[@' + attrs[i].name + '=' + xpathLiteral(attrs[i].value) + ' and @' + attrs[j].name + '=' + xpathLiteral(attrs[j].value) + ']';
        pushCandidate(candidates, combo, 'attributes', Math.min(attrs[i].score, attrs[j].score) - 1);
      }
    }

    getStableClasses(element).slice(0, 2).forEach(function(className) {
      var expression = '//' + tag + '[contains(concat(" ", normalize-space(@class), " "), ' + xpathLiteral(' ' + className + ' ') + ')]';
      pushCandidate(candidates, expression, 'stable-class', 46);
    });

    var text = getStableText(element);
    if (text && isTextLocatorElement(element)) {
      pushCandidate(candidates, '//' + tag + '[normalize-space(.)=' + xpathLiteral(text) + ']', 'text', 42);
    }

    pushCandidate(candidates, '//' + tag, 'tag', 10);
    return candidates.sort(function(a, b) { return b.score - a.score; }).slice(0, 30);
  }

  function getStableAttributes(element) {
    return ATTRIBUTE_PRIORITY.map(function(config) {
      var value = readAttribute(element, config.name);
      if (!isUsableAttributeValue(value)) return null;
      if ((config.name === 'id' || config.name === 'class') && isLikelyDynamicToken(value)) return null;
      return {
        name: config.name,
        value: value,
        strategy: config.strategy,
        score: config.score,
        useTag: config.useTag
      };
    }).filter(Boolean);
  }

  function getStableClasses(element) {
    var className = readAttribute(element, 'class');
    if (!className) return [];
    return className.split(/\s+/).map(function(value) { return value.trim(); }).filter(function(value) {
      var lower = value.toLowerCase();
      return value && value.length <= 64 && !STATEFUL_CLASSES[lower] && !isLikelyDynamicToken(value);
    }).slice(0, 5);
  }

  function isLikelyDynamicToken(value) {
    value = String(value || '');
    if (!value) return true;
    if (/^:r[\w-]*:$/.test(value)) return true;
    if (/^[0-9]{8,}$/.test(value)) return true;
    if (/^[a-f0-9]{8}-[a-f0-9-]{20,}$/i.test(value)) return true;
    if (/^[a-f0-9]{12,}$/i.test(value)) return true;
    if (/^(css|sc|jss|jsx|emotion)-?[a-z0-9_-]{5,}$/i.test(value)) return true;
    if (/^(react-select|headlessui|radix|ember|mui)-.*[0-9]/i.test(value)) return true;
    if (/__[a-z0-9_-]{5,}$/i.test(value)) return true;
    if (/[\-_][0-9]{6,}$/.test(value)) return true;
    if (value.length >= 18 && /[a-z]/i.test(value) && /[0-9]/.test(value) && !/[\s]/.test(value)) return true;
    return false;
  }

  function firstUniqueCss(root, element, candidates) {
    for (var i = 0; i < candidates.length; i++) {
      if (isUniqueCss(root, candidates[i].selector, element)) {
        return { selector: candidates[i].selector, strategy: candidates[i].strategy };
      }
    }
    return emptyLocator('not-unique');
  }

  function firstUniqueXPath(doc, element, candidates) {
    for (var i = 0; i < candidates.length; i++) {
      if (isUniqueXPath(doc, candidates[i].selector, element)) {
        return { selector: candidates[i].selector, strategy: candidates[i].strategy };
      }
    }
    return emptyLocator('not-unique');
  }

  function isUniqueCss(root, selector, element) {
    if (!root || !selector || typeof root.querySelectorAll !== 'function') return false;
    try {
      var matches = root.querySelectorAll(selector);
      return matches.length === 1 && matches[0] === element;
    } catch (error) {
      return false;
    }
  }

  function isUniqueXPath(doc, xpath, element) {
    if (!doc || !xpath || typeof doc.evaluate !== 'function') return false;
    try {
      var result = doc.evaluate(xpath, doc, null, 7, null);
      return result.snapshotLength === 1 && result.snapshotItem(0) === element;
    } catch (error) {
      return false;
    }
  }

  function buildShadowContext(element, elementCss) {
    var hosts = [];
    var current = element;
    var root = getSelectorRoot(current);
    while (root && root.nodeType === 11 && root.host) {
      var hostCss = buildCssSelector(root.host);
      hosts.push({
        tagName: getTagName(root.host),
        css: hostCss.selector,
        strategy: hostCss.strategy
      });
      current = root.host;
      root = getSelectorRoot(current);
    }
    hosts.reverse();
    return {
      hosts: hosts,
      localCss: elementCss.selector,
      cssChain: hosts.map(function(host) { return host.css || host.tagName; }).concat(elementCss.selector ? [elementCss.selector] : []).join(' >>> ')
    };
  }

  function buildFrameContext(element) {
    var doc = element.ownerDocument;
    var view = doc && doc.defaultView;
    var isTopFrame = true;
    var frameElement = null;
    try {
      isTopFrame = !view || view.top === view;
      frameElement = view && view.frameElement;
    } catch (error) {
      isTopFrame = false;
    }

    var frameCss = emptyLocator('frame-unavailable');
    var frameXPath = emptyLocator('frame-unavailable');
    if (frameElement) {
      frameCss = buildCssSelector(frameElement);
      frameXPath = buildXPath(frameElement);
    }

    return {
      isTopFrame: isTopFrame,
      url: safeDocumentUrl(doc),
      name: view && typeof view.name === 'string' ? view.name : '',
      css: frameCss.selector,
      xpath: frameXPath.selector
    };
  }

  function describeElement(element) {
    var tag = getTagName(element);
    var parts = ['<' + tag + '>'];
    var id = readAttribute(element, 'id');
    var name = readAttribute(element, 'name');
    var label = readAttribute(element, 'aria-label') || readAttribute(element, 'placeholder') || readAttribute(element, 'title') || readAttribute(element, 'alt') || getStableText(element);
    if (id && !isLikelyDynamicToken(id)) parts[0] = '<' + tag + '#' + truncateText(id, 40) + '>';
    else if (name) parts[0] = '<' + tag + '[name=' + truncateText(name, 40) + ']>';
    if (label) parts.push(truncateText(label, 80));
    return parts.join(' · ');
  }

  function getStableText(element) {
    var text = '';
    try { text = element.innerText || element.textContent || ''; } catch (error) {}
    text = normalizeSpace(text);
    return text && text.length <= 80 ? text : '';
  }

  function isTextLocatorElement(element) {
    return /^(a|button|label|option|summary|h1|h2|h3|h4|h5|h6)$/.test(getTagName(element));
  }

  function getSelectorRoot(element) {
    if (!element) return null;
    try {
      if (typeof element.getRootNode === 'function') return element.getRootNode();
    } catch (error) {}
    return element.ownerDocument || null;
  }

  function getTagName(element) {
    return String(element && (element.localName || element.tagName) || '*').toLowerCase();
  }

  function readAttribute(element, name) {
    if (!element || typeof element.getAttribute !== 'function') return '';
    try { return String(element.getAttribute(name) || '').trim(); }
    catch (error) { return ''; }
  }

  function isUsableAttributeValue(value) {
    return !!value && value.length <= 200 && !/[\r\n]/.test(value);
  }

  function attributeCss(attr) {
    return '[' + attr.name + '="' + cssString(attr.value) + '"]';
  }

  function cssIdentifier(value) {
    value = String(value || '');
    if (global.CSS && typeof global.CSS.escape === 'function') return global.CSS.escape(value);
    var escaped = '';
    for (var i = 0; i < value.length; i++) {
      var character = value.charAt(i);
      var needsEscape = !/[a-zA-Z0-9_-]/.test(character) || (i === 0 && /[0-9]/.test(character)) || (i === 1 && value.charAt(0) === '-' && /[0-9]/.test(character));
      escaped += needsEscape ? '\\' + character.charCodeAt(0).toString(16) + ' ' : character;
    }
    return escaped;
  }

  function cssString(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\d ').replace(/\n/g, '\\a ');
  }

  function xpathLiteral(value) {
    value = String(value || '');
    if (value.indexOf("'") === -1) return "'" + value + "'";
    if (value.indexOf('"') === -1) return '"' + value + '"';
    return "concat('" + value.replace(/'/g, "', \"'\", '") + "')";
  }

  function pushCandidate(list, selector, strategy, score) {
    if (!selector || list.some(function(item) { return item.selector === selector; })) return;
    list.push({ selector: selector, strategy: strategy, score: score || 0 });
  }

  function normalizeSpace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function truncateText(value, maxLength) {
    value = String(value || '');
    return value.length > maxLength ? value.slice(0, maxLength - 3) + '...' : value;
  }

  function safeDocumentUrl(doc) {
    try { return String(doc && doc.location && doc.location.href || ''); }
    catch (error) { return ''; }
  }

  function emptyLocator(strategy) {
    return { selector: '', strategy: strategy || '' };
  }

  global.ApiStudioLocatorEngine = {
    inspect: inspectElement,
    buildCssSelector: buildCssSelector,
    buildXPath: buildXPath,
    isLikelyDynamicToken: isLikelyDynamicToken,
    xpathLiteral: xpathLiteral
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
