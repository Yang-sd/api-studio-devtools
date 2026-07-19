(function(global) {
  'use strict';

  var ATTRIBUTE_PRIORITY = [
    { name: 'data-testid', strategy: 'data-testid', score: 100, useTag: false },
    { name: 'data-test', strategy: 'data-test', score: 98, useTag: false },
    { name: 'data-qa', strategy: 'data-qa', score: 96, useTag: false },
    { name: 'data-cy', strategy: 'data-cy', score: 94, useTag: false },
    { name: 'data-e2e', strategy: 'data-e2e', score: 94, useTag: false },
    { name: 'id', strategy: 'id', score: 92, useTag: false },
    { name: 'name', strategy: 'name', score: 88, useTag: true },
    { name: 'aria-label', strategy: 'aria-label', score: 84, useTag: true },
    { name: 'role', strategy: 'role', score: 78, useTag: true },
    { name: 'placeholder', strategy: 'placeholder', score: 72, useTag: true },
    { name: 'title', strategy: 'title', score: 38, useTag: true },
    { name: 'alt', strategy: 'alt', score: 66, useTag: true },
    { name: 'for', strategy: 'for', score: 64, useTag: true },
    { name: 'href', strategy: 'href', score: 36, useTag: true },
    { name: 'autocomplete', strategy: 'autocomplete', score: 58, useTag: true },
    { name: 'type', strategy: 'type', score: 32, useTag: true }
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
    element = resolveTargetElement(element);

    var candidateSet = buildLocatorCandidates(element);
    var cssResult = firstCandidateOfType(candidateSet.ranked, 'css');
    var shadowContext = buildShadowContext(element, cssResult);
    var xpathResult = shadowContext.hosts.length ? emptyLocator('shadow-dom') : firstCandidateOfType(candidateSet.ranked, 'xpath');
    var frameContext = buildFrameContext(element);
    var warnings = [];

    if (!cssResult.selector && !xpathResult.selector) {
      warnings.push('NO_STABLE_LOCATOR');
    }
    if (!frameContext.isTopFrame) warnings.push('IFRAME_CONTEXT');
    if (!frameContext.complete) warnings.push('FRAME_CONTEXT_INCOMPLETE');
    if (shadowContext.hosts.length) warnings.push('SHADOW_CONTEXT');

    // 唯一性是进入候选列表的硬条件，评分只负责比较通过验证的候选。
    var alternatives = candidateSet.ranked.slice(0, 3);
    var recommendation = alternatives[0] || emptyLocator('no-stable-locator');
    var recommendedType = recommendation.type;
    var recommended = recommendation.selector;
    var confidence = rateStrategy(recommendation.strategy, recommendation.score, recommendation.reasonCode);
    if (recommendation.strategy.indexOf('text') !== -1) warnings.push('TEXT_MAY_CHANGE');

    return {
      id: 'locator_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      tagName: String(element.localName || element.tagName || '').toLowerCase(),
      elementLabel: describeElement(element),
      css: cssResult.selector,
      cssStrategy: cssResult.strategy,
      cssScore: cssResult.score,
      xpath: xpathResult.selector,
      xpathStrategy: xpathResult.strategy,
      xpathScore: xpathResult.score,
      recommended: recommended,
      recommendedType: recommendedType,
      recommendedScore: recommendation.score,
      confidence: confidence.level,
      confidenceReason: confidence.reason,
      alternatives: alternatives,
      unique: !!recommended,
      warnings: warnings,
      frame: frameContext,
      shadow: shadowContext,
      pageUrl: safeDocumentUrl(element.ownerDocument),
      capturedAt: Date.now()
    };
  }

  function buildLocatorCandidates(element) {
    var cssCandidates = collectCssAlternatives(element);
    var root = getSelectorRoot(element);
    var xpathCandidates = root && root.nodeType === 9 ? collectXPathAlternatives(element) : [];
    return { ranked: rankLocatorCandidates(cssCandidates.concat(xpathCandidates)) };
  }

  function buildCssSelector(element) {
    return rankLocatorCandidates(collectCssAlternatives(element))[0] || emptyLocator('no-stable-css');
  }

  function collectCssAlternatives(element) {
    var root = getSelectorRoot(element);
    if (!root || typeof root.querySelectorAll !== 'function') return [];
    var directCandidates = buildCssCandidates(element);
    var results = [];
    var repeated = [];

    directCandidates.forEach(function(candidate) {
      var info = inspectCssMatches(root, candidate.selector, element);
      if (!info.containsTarget) return;
      if (info.count === 1) {
        addLocatorCandidate(results, createLocatorCandidate('css', candidate, info, {
          reasonCode: 'direct',
          baseMatchCount: 1
        }));
      } else if (info.count > 1 && repeated.length < 12) {
        repeated.push({ candidate: candidate, info: info });
      }
    });

    var ancestor = element.parentElement;
    var depth = 0;
    while (ancestor && depth < 6 && getSelectorRoot(ancestor) === root && repeated.length) {
      var anchors = buildCssCandidates(ancestor).filter(isUsefulAnchorCandidate).slice(0, 8);
      for (var a = 0; a < anchors.length; a++) {
        var anchor = anchors[a];
        var anchorInfo = inspectCssMatches(root, anchor.selector, ancestor);
        if (!anchorInfo.containsTarget || anchorInfo.count > 8) continue;
        for (var d = 0; d < repeated.length; d++) {
          var base = repeated[d];
          var combined = anchor.selector + ' ' + base.candidate.selector;
          var combinedInfo = inspectCssMatches(root, combined, element);
          if (!combinedInfo.uniqueTarget) continue;
          var score = calculateCombinedScore(base.candidate.score, anchor.score, anchorInfo.count === 1 ? 8 : 12);
          addLocatorCandidate(results, createLocatorCandidate('css', {
            selector: combined,
            strategy: 'relative-' + base.candidate.strategy,
            score: score.score
          }, combinedInfo, {
            reasonCode: 'relative',
            baseSelector: base.candidate.selector,
            baseScore: base.candidate.score,
            baseMatchCount: base.info.count,
            anchorSelector: anchor.selector,
            anchorStrategy: anchor.strategy,
            anchorMatchCount: anchorInfo.count,
            penalty: score.penalty,
            contextDepth: depth + 1
          }));
        }
      }
      ancestor = ancestor.parentElement;
      depth++;
    }
    return results;
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
    for (var classIndex = 0; classIndex < classes.length; classIndex++) {
      pushCandidate(candidates, tag + '.' + cssIdentifier(classes[classIndex]), 'stable-class', 48);
    }
    for (var firstClass = 0; firstClass < Math.min(classes.length, 4); firstClass++) {
      for (var secondClass = firstClass + 1; secondClass < Math.min(classes.length, 5); secondClass++) {
        pushCandidate(candidates, tag + '.' + cssIdentifier(classes[firstClass]) + '.' + cssIdentifier(classes[secondClass]), 'stable-class', 47);
      }
    }
    if (classes.length > 2) {
      pushCandidate(candidates, tag + classes.slice(0, 4).map(function(className) {
        return '.' + cssIdentifier(className);
      }).join(''), 'stable-class', 49);
    }

    pushCandidate(candidates, tag, 'tag', 10);
    return candidates.sort(function(a, b) { return b.score - a.score; }).slice(0, 28);
  }

  function buildXPath(element) {
    return rankLocatorCandidates(collectXPathAlternatives(element))[0] || emptyLocator('no-stable-xpath');
  }

  function collectXPathAlternatives(element) {
    var root = getSelectorRoot(element);
    if (!root || root.nodeType !== 9 || typeof root.evaluate !== 'function') return [];
    var directCandidates = buildXPathCandidates(element);
    var results = [];
    var repeated = [];

    directCandidates.forEach(function(candidate) {
      var info = inspectXPathMatches(root, candidate.selector, element);
      if (!info.containsTarget) return;
      if (info.count === 1) {
        addLocatorCandidate(results, createLocatorCandidate('xpath', candidate, info, {
          reasonCode: 'direct',
          baseMatchCount: 1
        }));
      } else if (info.count > 1 && repeated.length < 12) {
        repeated.push({ candidate: candidate, info: info });
      }
    });

    var ancestor = element.parentElement;
    var depth = 0;
    while (ancestor && depth < 6 && getSelectorRoot(ancestor) === root && repeated.length) {
      collectAncestorXPathCandidates(results, root, element, ancestor, depth, repeated);
      collectContextualXPathCandidates(results, root, element, ancestor, depth, repeated);
      ancestor = ancestor.parentElement;
      depth++;
    }
    return results;
  }

  function collectAncestorXPathCandidates(results, root, element, ancestor, depth, repeated) {
    var anchors = buildXPathCandidates(ancestor).filter(isUsefulAnchorCandidate).slice(0, 8);
    for (var a = 0; a < anchors.length; a++) {
      var anchor = anchors[a];
      var anchorInfo = inspectXPathMatches(root, anchor.selector, ancestor);
      if (!anchorInfo.containsTarget || anchorInfo.count > 8) continue;
      for (var d = 0; d < repeated.length; d++) {
        var base = repeated[d];
        var combined = anchor.selector + '//' + xpathDescendantPart(base.candidate.selector);
        var combinedInfo = inspectXPathMatches(root, combined, element);
        if (!combinedInfo.uniqueTarget) continue;
        var score = calculateCombinedScore(base.candidate.score, anchor.score, anchorInfo.count === 1 ? 8 : 12);
        addLocatorCandidate(results, createLocatorCandidate('xpath', {
          selector: combined,
          strategy: 'relative-' + base.candidate.strategy,
          score: score.score
        }, combinedInfo, {
          reasonCode: 'relative',
          baseSelector: base.candidate.selector,
          baseScore: base.candidate.score,
          baseMatchCount: base.info.count,
          anchorSelector: anchor.selector,
          anchorStrategy: anchor.strategy,
          anchorMatchCount: anchorInfo.count,
          penalty: score.penalty,
          contextDepth: depth + 1
        }));
      }
    }
  }

  function collectContextualXPathCandidates(results, root, element, ancestor, depth, repeated) {
    var contextAnchors = findContextAnchors(root, ancestor, element);
    for (var a = 0; a < contextAnchors.length; a++) {
      var context = contextAnchors[a];
      for (var d = 0; d < repeated.length; d++) {
        var base = repeated[d];
        var combined = context.scopeSelector + '//' + xpathDescendantPart(base.candidate.selector);
        var combinedInfo = inspectXPathMatches(root, combined, element);
        if (!combinedInfo.uniqueTarget) continue;
        var score = calculateCombinedScore(base.candidate.score, context.score, 10 + Math.min(depth, 3));
        addLocatorCandidate(results, createLocatorCandidate('xpath', {
          selector: combined,
          strategy: 'contextual-' + base.candidate.strategy,
          score: score.score
        }, combinedInfo, {
          reasonCode: 'contextual',
          baseSelector: base.candidate.selector,
          baseScore: base.candidate.score,
          baseMatchCount: base.info.count,
          anchorSelector: context.anchorSelector,
          anchorStrategy: context.strategy,
          anchorMatchCount: context.anchorMatchCount,
          scopeSelector: context.scopeSelector,
          containerTag: getTagName(ancestor),
          penalty: score.penalty,
          contextDepth: depth + 1
        }));
      }
    }
  }

  function findContextAnchors(root, ancestor, element) {
    if (!ancestor || typeof ancestor.querySelectorAll !== 'function') return [];
    var nodes;
    try { nodes = ancestor.querySelectorAll('*'); }
    catch (error) { return []; }
    var result = [];
    var seenScopes = Object.create(null);
    var limit = Math.min(nodes.length, 80);
    for (var i = 0; i < limit && result.length < 10; i++) {
      var node = nodes[i];
      if (!node || node === element || element.contains(node) || node.contains(element)) continue;
      var anchors = buildXPathCandidates(node).filter(isUsefulContextCandidate).slice(0, 4);
      for (var a = 0; a < anchors.length && result.length < 10; a++) {
        var anchor = anchors[a];
        var scopeSelector = '//' + getTagName(ancestor) + '[' + xpathPredicatePart(anchor.selector) + ']';
        if (seenScopes[scopeSelector]) continue;
        var scopeInfo = inspectXPathMatches(root, scopeSelector, ancestor);
        if (!scopeInfo.containsTarget || scopeInfo.count > 4) continue;
        var anchorInfo = inspectXPathMatches(root, anchor.selector, node);
        seenScopes[scopeSelector] = true;
        result.push({
          scopeSelector: scopeSelector,
          anchorSelector: anchor.selector,
          strategy: anchor.strategy,
          score: anchor.score,
          anchorMatchCount: anchorInfo.count
        });
      }
    }
    return result;
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

    var classes = getStableClasses(element);
    if (classes.length > 1) {
      var classConditions = classes.slice(0, 4).map(function(className) {
        return 'contains(concat(" ", normalize-space(@class), " "), ' + xpathLiteral(' ' + className + ' ') + ')';
      });
      pushCandidate(candidates, '//' + tag + '[' + classConditions.join(' and ') + ']', 'stable-class', 47);
    }

    var text = getStableText(element);
    if (text && isTextLocatorElement(element)) {
      pushCandidate(candidates, '//' + tag + '[normalize-space(.)=' + xpathLiteral(text) + ']', 'text', 52);
    }

    pushCandidate(candidates, '//' + tag, 'tag', 10);
    return candidates.sort(function(a, b) { return b.score - a.score; }).slice(0, 30);
  }

  function getStableAttributes(element) {
    var configured = ATTRIBUTE_PRIORITY.map(function(config) {
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
    var knownNames = {};
    configured.forEach(function(attr) { knownNames[attr.name] = true; });
    getGenericDataAttributes(element).forEach(function(attr) {
      if (!knownNames[attr.name]) configured.push(attr);
    });
    return configured;
  }

  function getGenericDataAttributes(element) {
    var result = [];
    var attributes = element && element.attributes;
    if (!attributes || typeof attributes.length !== 'number') return result;
    for (var i = 0; i < attributes.length; i++) {
      var attribute = attributes[i];
      var name = String(attribute && attribute.name || '').toLowerCase();
      var value = String(attribute && attribute.value || '').trim();
      if (name.indexOf('data-') !== 0 || /^data-(v-|react|vue|random|timestamp)/.test(name)) continue;
      if (!isUsableAttributeValue(value) || isLikelyDynamicToken(value)) continue;
      result.push({ name: name, value: value, strategy: 'data-attribute', score: 60, useTag: true });
      if (result.length >= 5) break;
    }
    return result;
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

  function inspectCssMatches(root, selector, element) {
    if (!root || !selector || typeof root.querySelectorAll !== 'function') return emptyMatchInfo();
    try {
      var matches = root.querySelectorAll(selector);
      var containsTarget = false;
      for (var i = 0; i < matches.length; i++) {
        if (matches[i] === element) {
          containsTarget = true;
          break;
        }
      }
      return { count: matches.length, containsTarget: containsTarget, uniqueTarget: matches.length === 1 && containsTarget };
    } catch (error) {
      return emptyMatchInfo();
    }
  }

  function inspectXPathMatches(doc, xpath, element) {
    if (!doc || !xpath || typeof doc.evaluate !== 'function') return emptyMatchInfo();
    try {
      var result = doc.evaluate(xpath, doc, null, 7, null);
      var containsTarget = false;
      for (var i = 0; i < result.snapshotLength; i++) {
        if (result.snapshotItem(i) === element) {
          containsTarget = true;
          break;
        }
      }
      return { count: result.snapshotLength, containsTarget: containsTarget, uniqueTarget: result.snapshotLength === 1 && containsTarget };
    } catch (error) {
      return emptyMatchInfo();
    }
  }

  function emptyMatchInfo() {
    return { count: 0, containsTarget: false, uniqueTarget: false };
  }

  function createLocatorCandidate(type, candidate, matchInfo, metadata) {
    metadata = metadata || {};
    var reasonCode = metadata.reasonCode || 'direct';
    var baseScore = Number(metadata.baseScore === undefined ? candidate.score : metadata.baseScore) || 0;
    var score = Math.max(1, Math.min(100, Number(candidate.score || 0)));
    var rating = rateStrategy(candidate.strategy, score, reasonCode);
    return {
      type: type,
      selector: candidate.selector,
      strategy: candidate.strategy,
      score: score,
      confidence: rating.level,
      confidenceReason: rating.reason,
      unique: true,
      matchCount: Number(matchInfo && matchInfo.count || 1),
      baseSelector: metadata.baseSelector || candidate.selector,
      baseScore: baseScore,
      baseMatchCount: Number(metadata.baseMatchCount || 1),
      anchorSelector: metadata.anchorSelector || '',
      anchorStrategy: metadata.anchorStrategy || '',
      anchorMatchCount: Number(metadata.anchorMatchCount || 0),
      scopeSelector: metadata.scopeSelector || '',
      containerTag: metadata.containerTag || '',
      penalty: Math.max(0, Number(metadata.penalty || 0)),
      contextDepth: Math.max(0, Number(metadata.contextDepth || 0)),
      reasonCode: reasonCode
    };
  }

  function addLocatorCandidate(list, candidate) {
    if (!candidate || !candidate.selector || !candidate.unique || candidate.matchCount !== 1) return;
    var duplicate = list.some(function(item) {
      return item.type === candidate.type && item.selector === candidate.selector;
    });
    if (!duplicate) list.push(candidate);
  }

  function rankLocatorCandidates(candidates) {
    var reasonWeight = { direct: 3, relative: 2, contextual: 1 };
    return candidates.filter(function(candidate) {
      return candidate && candidate.unique === true && candidate.matchCount === 1 && !!candidate.selector;
    }).sort(function(left, right) {
      if (right.score !== left.score) return right.score - left.score;
      var reasonDifference = (reasonWeight[right.reasonCode] || 0) - (reasonWeight[left.reasonCode] || 0);
      if (reasonDifference) return reasonDifference;
      if (left.type !== right.type) return left.type === 'css' ? -1 : 1;
      return left.selector.length - right.selector.length;
    });
  }

  function firstCandidateOfType(candidates, type) {
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i].type === type) return candidates[i];
    }
    return emptyLocator('no-stable-' + type);
  }

  function calculateCombinedScore(baseScore, anchorScore, contextPenalty) {
    baseScore = Math.max(1, Number(baseScore || 0));
    anchorScore = Math.max(1, Number(anchorScore || 0));
    var anchorPenalty = Math.round(Math.max(0, 60 - anchorScore) / 4);
    var score = Math.max(1, baseScore - Number(contextPenalty || 0) - anchorPenalty);
    return { score: score, penalty: Math.max(0, baseScore - score) };
  }

  function isUsefulAnchorCandidate(candidate) {
    return candidate && candidate.strategy !== 'tag' && Number(candidate.score || 0) >= 32;
  }

  function isUsefulContextCandidate(candidate) {
    return isUsefulAnchorCandidate(candidate) && candidate.strategy !== 'stable-class' && candidate.strategy !== 'type';
  }

  function xpathDescendantPart(selector) {
    return String(selector || '').replace(/^\.\/\//, '').replace(/^\/\//, '');
  }

  function xpathPredicatePart(selector) {
    return './/' + xpathDescendantPart(selector);
  }

  function inferStrategyScore(strategy) {
    strategy = String(strategy || '');
    if (strategy.indexOf('relative-') === 0) return Math.max(1, inferStrategyScore(strategy.slice(9)) - 8);
    if (strategy.indexOf('contextual-') === 0) return Math.max(1, inferStrategyScore(strategy.slice(11)) - 10);
    var scores = {
      'data-testid': 100,
      'data-test': 98,
      'data-qa': 96,
      'data-cy': 94,
      'data-e2e': 94,
      id: 92,
      name: 88,
      'aria-label': 84,
      role: 78,
      placeholder: 72,
      alt: 66,
      'for': 64,
      'data-attribute': 60,
      autocomplete: 58,
      text: 52,
      'stable-class': 48,
      attributes: 47,
      title: 38,
      href: 36,
      type: 32,
      tag: 10
    };
    return scores[strategy] || 0;
  }

  function rateStrategy(strategy, score, reasonCode) {
    strategy = String(strategy || '');
    score = Number(score || inferStrategyScore(strategy));
    if (!strategy || !score) return { level: 'missing', reason: 'missing', score: 0 };

    var directStrategy = strategy.replace(/^(relative-|contextual-)/, '');
    var reason = 'stableAttribute';
    if (reasonCode === 'contextual' || strategy.indexOf('contextual-') === 0) reason = 'contextual';
    else if (reasonCode === 'relative' || strategy.indexOf('relative-') === 0) reason = 'relative';
    else if (directStrategy.indexOf('text') !== -1) reason = 'text';
    else if (directStrategy === 'attributes') reason = 'attributeCombination';
    else if (directStrategy === 'stable-class') reason = 'class';
    else if (directStrategy === 'tag') reason = 'tag';
    else if (/^(title|href|type)$/.test(directStrategy)) reason = 'fragileAttribute';

    var level = score >= 85 ? 'high' : (score >= 45 ? 'medium' : 'low');
    if (reason === 'attributeCombination') level = 'medium';
    if ((reason === 'relative' || reason === 'contextual') && score >= 35) level = 'medium';
    return {
      level: level,
      reason: reason,
      score: score
    };
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
    var depth = getFrameDepth(view);
    var chain = [];
    var currentView = view;
    var currentDoc = doc;
    var walked = 0;

    // 从目标 frame 向顶层回溯，再反转为 Selenium 实际需要的由外到内顺序。
    while (currentView && walked < depth && walked < 8) {
      var entry = {
        url: safeWindowUrl(currentView, currentDoc),
        name: safeWindowName(currentView),
        css: '',
        xpath: '',
        accessible: false
      };
      var frameElement = null;
      try { frameElement = currentView.frameElement; }
      catch (error) { frameElement = null; }

      if (!frameElement) {
        chain.unshift(entry);
        break;
      }

      var frameCss = buildCssSelector(frameElement);
      var frameXPath = buildXPath(frameElement);
      entry.css = frameCss.selector;
      entry.xpath = frameXPath.selector;
      entry.accessible = !!(entry.css || entry.xpath);
      chain.unshift(entry);
      currentDoc = frameElement.ownerDocument;
      currentView = currentDoc && currentDoc.defaultView;
      walked++;
    }

    while (chain.length < depth && chain.length < 8) {
      chain.unshift({ url: '', name: '', css: '', xpath: '', accessible: false });
    }

    var nearestFrame = chain.length ? chain[chain.length - 1] : null;
    var complete = depth === 0 || (chain.length === depth && chain.every(function(frame) {
      return !!(frame.css || frame.xpath);
    }));

    return {
      isTopFrame: depth === 0,
      url: safeDocumentUrl(doc),
      name: safeWindowName(view),
      css: nearestFrame ? nearestFrame.css : '',
      xpath: nearestFrame ? nearestFrame.xpath : '',
      depth: depth,
      complete: complete,
      chain: chain
    };
  }

  function getFrameDepth(view) {
    if (!view) return 0;
    var depth = 0;
    var current = view;
    while (current && depth < 8) {
      try {
        if (current === current.top) break;
        current = current.parent;
        depth++;
      } catch (error) {
        depth++;
        break;
      }
    }
    return depth;
  }

  function safeWindowUrl(view, fallbackDoc) {
    try { return String(view && view.location && view.location.href || ''); }
    catch (error) { return safeDocumentUrl(fallbackDoc); }
  }

  function safeWindowName(view) {
    try { return view && typeof view.name === 'string' ? view.name : ''; }
    catch (error) { return ''; }
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

  function resolveTargetElement(element) {
    if (!element || element.nodeType !== 1) return element;
    element = unwrapBrowserTranslationElement(element);
    if (isInteractiveElement(element)) return element;
    if (!/^(font|span|i|em|strong|b|small|svg|path|use|g)$/.test(getTagName(element))) return element;
    var root = getSelectorRoot(element);
    var ancestor = element.parentElement;
    var depth = 0;
    while (ancestor && depth < 5 && getSelectorRoot(ancestor) === root) {
      if (isInteractiveElement(ancestor)) return ancestor;
      ancestor = ancestor.parentElement;
      depth++;
    }
    return element;
  }

  function unwrapBrowserTranslationElement(element) {
    if (!isBrowserTranslationFont(element)) return element;
    var root = getSelectorRoot(element);
    var current = element;
    var depth = 0;

    // Chrome 翻译会嵌套两层 font，定位它们会让同一文本在 XPath 中重复命中。
    while (current && getTagName(current) === 'font' && current.parentElement && depth < 4) {
      if (getSelectorRoot(current.parentElement) !== root) break;
      var parentTag = getTagName(current.parentElement);
      if (parentTag === 'html' || parentTag === 'body') break;
      current = current.parentElement;
      depth++;
    }
    return current || element;
  }

  function isBrowserTranslationFont(element) {
    if (getTagName(element) !== 'font') return false;
    var direction = readAttribute(element, 'dir').toLowerCase();
    var style = readAttribute(element, 'style').toLowerCase();
    return direction === 'auto' && style.indexOf('vertical-align') !== -1 && style.indexOf('inherit') !== -1;
  }

  function isInteractiveElement(element) {
    var tag = getTagName(element);
    if (/^(a|button|input|select|textarea|option|label|summary)$/.test(tag)) return true;
    var role = readAttribute(element, 'role').toLowerCase();
    if (/^(button|link|checkbox|radio|tab|menuitem|switch|textbox|combobox)$/.test(role)) return true;
    if (readAttribute(element, 'onclick') || readAttribute(element, 'contenteditable') === 'true') return true;
    var tabindex = readAttribute(element, 'tabindex');
    return tabindex !== '' && tabindex !== '-1';
  }

  function getStableText(element) {
    var text = '';
    try { text = element.innerText || element.textContent || ''; } catch (error) {}
    text = normalizeSpace(text);
    return text && text.length <= 120 ? text : '';
  }

  function isTextLocatorElement(element) {
    return !/^(html|body|head|script|style|link|meta|input|textarea|select|img|video|audio|canvas|svg|path|use)$/.test(getTagName(element));
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
    return { selector: '', strategy: strategy || '', score: 0 };
  }

  global.ApiStudioLocatorEngine = {
    inspect: inspectElement,
    resolveTarget: resolveTargetElement,
    buildCssSelector: buildCssSelector,
    buildXPath: buildXPath,
    rateStrategy: rateStrategy,
    isLikelyDynamicToken: isLikelyDynamicToken,
    xpathLiteral: xpathLiteral
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
