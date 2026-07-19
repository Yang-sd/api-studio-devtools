(function(global) {
  'use strict';

  function generate(locator, language) {
    locator = locator && typeof locator === 'object' ? locator : {};
    language = normalizeLanguage(language);
    var warnings = [];
    var lines = languageHeader(language, locator);
    var frame = locator.frame && typeof locator.frame === 'object' ? locator.frame : {};
    var shadow = locator.shadow && typeof locator.shadow === 'object' ? locator.shadow : {};

    if (frame.isTopFrame === false) {
      var frameChain = getFrameChain(frame);
      for (var frameIndex = 0; frameIndex < frameChain.length; frameIndex++) {
        var frameLocator = chooseFrameLocator(frameChain[frameIndex]);
        if (frameLocator.selector) appendFrameSwitch(lines, language, frameLocator, frameIndex, frameChain.length);
        else {
          pushWarning(warnings, 'FRAME_LOCATOR_MISSING');
          lines.push(comment(language, 'TODO: switch to iframe level ' + (frameIndex + 1) + '; no stable frame locator was captured.'));
        }
      }
      lines.push('');
    }

    var hosts = Array.isArray(shadow.hosts) ? shadow.hosts : [];
    if (hosts.length) {
      if (!appendShadowTraversal(lines, language, hosts, shadow.localCss || locator.css, warnings)) {
        return { code: trimCode(lines), language: language, warnings: warnings };
      }
      return { code: trimCode(lines), language: language, warnings: warnings };
    }

    var target = chooseTargetLocator(locator);
    if (!target.selector) {
      warnings.push('LOCATOR_MISSING');
      lines.push(comment(language, 'TODO: no stable locator is available for this element.'));
      return { code: trimCode(lines), language: language, warnings: warnings };
    }
    appendTarget(lines, language, target, 'driver');
    return { code: trimCode(lines), language: language, warnings: warnings };
  }

  function languageHeader(language, locator) {
    var hasShadow = !!(locator.shadow && Array.isArray(locator.shadow.hosts) && locator.shadow.hosts.length);
    if (language === 'java') {
      var javaImports = ['import org.openqa.selenium.By;', 'import org.openqa.selenium.WebElement;'];
      if (hasShadow) javaImports.push('import org.openqa.selenium.SearchContext;');
      javaImports.push('');
      return javaImports;
    }
    if (language === 'javascript') return ["const { By } = require('selenium-webdriver');", ''];
    return ['from selenium.webdriver.common.by import By', ''];
  }

  function chooseFrameLocator(frame) {
    if (frame.css) return { type: 'css', selector: String(frame.css) };
    if (frame.xpath) return { type: 'xpath', selector: String(frame.xpath) };
    return { type: '', selector: '' };
  }

  function getFrameChain(frame) {
    if (Array.isArray(frame.chain) && frame.chain.length) return frame.chain.slice(0, 8);
    var depth = Math.max(1, Math.min(8, Number(frame.depth || 1)));
    var chain = [];
    while (chain.length < depth - 1) chain.push({});
    chain.push(frame);
    return chain;
  }

  function chooseTargetLocator(locator) {
    if (locator.recommended && locator.recommendedType === 'xpath') {
      return { type: 'xpath', selector: String(locator.recommended) };
    }
    if (locator.recommended) return { type: 'css', selector: String(locator.recommended) };
    if (locator.css) return { type: 'css', selector: String(locator.css) };
    if (locator.xpath) return { type: 'xpath', selector: String(locator.xpath) };
    return { type: '', selector: '' };
  }

  function appendFrameSwitch(lines, language, locator, index, total) {
    var variableName = frameVariableName(language, index, total);
    if (language === 'java') {
      lines.push('WebElement ' + variableName + ' = driver.findElement(' + byExpression(language, locator) + ');');
      lines.push('driver.switchTo().frame(' + variableName + ');');
      return;
    }
    if (language === 'javascript') {
      lines.push('const ' + variableName + ' = await driver.findElement(' + byExpression(language, locator) + ');');
      lines.push('await driver.switchTo().frame(' + variableName + ');');
      return;
    }
    lines.push(variableName + ' = driver.find_element(' + byExpression(language, locator) + ')');
    lines.push('driver.switch_to.frame(' + variableName + ')');
  }

  function frameVariableName(language, index, total) {
    if (total === 1) return 'frame';
    return language === 'python' ? 'frame_' + (index + 1) : 'frame' + (index + 1);
  }

  function appendShadowTraversal(lines, language, hosts, localCss, warnings) {
    for (var i = 0; i < hosts.length; i++) {
      var selector = String(hosts[i] && hosts[i].css || '');
      if (!selector) {
        warnings.push('SHADOW_HOST_LOCATOR_MISSING');
        lines.push(comment(language, 'TODO: Shadow host ' + (i + 1) + ' has no stable CSS locator.'));
        return false;
      }
      var locator = { type: 'css', selector: selector };
      if (language === 'java') {
        if (i === 0) lines.push('SearchContext shadowRoot = driver.findElement(' + byExpression(language, locator) + ').getShadowRoot();');
        else lines.push('shadowRoot = shadowRoot.findElement(' + byExpression(language, locator) + ').getShadowRoot();');
      } else if (language === 'javascript') {
        var hostName = 'shadowHost' + (i + 1);
        var source = i === 0 ? 'driver' : 'shadowRoot';
        lines.push('const ' + hostName + ' = await ' + source + '.findElement(' + byExpression(language, locator) + ');');
        lines.push((i === 0 ? 'let ' : '') + 'shadowRoot = await ' + hostName + '.getShadowRoot();');
      } else {
        var pythonSource = i === 0 ? 'driver' : 'shadow_root';
        lines.push('shadow_root = ' + pythonSource + '.find_element(' + byExpression(language, locator) + ').shadow_root');
      }
    }

    if (!localCss) {
      warnings.push('LOCATOR_MISSING');
      lines.push(comment(language, 'TODO: no stable CSS locator is available inside the Shadow Root.'));
      return false;
    }
    appendTarget(lines, language, { type: 'css', selector: String(localCss) }, language === 'java' || language === 'javascript' ? 'shadowRoot' : 'shadow_root');
    return true;
  }

  function appendTarget(lines, language, locator, source) {
    if (language === 'java') {
      lines.push('WebElement element = ' + source + '.findElement(' + byExpression(language, locator) + ');');
    } else if (language === 'javascript') {
      lines.push('const element = await ' + source + '.findElement(' + byExpression(language, locator) + ');');
    } else {
      lines.push('element = ' + source + '.find_element(' + byExpression(language, locator) + ')');
    }
  }

  function byExpression(language, locator) {
    var value = quoteString(locator.selector, language);
    if (language === 'java') return locator.type === 'xpath' ? 'By.xpath(' + value + ')' : 'By.cssSelector(' + value + ')';
    if (language === 'javascript') return locator.type === 'xpath' ? 'By.xpath(' + value + ')' : 'By.css(' + value + ')';
    return (locator.type === 'xpath' ? 'By.XPATH, ' : 'By.CSS_SELECTOR, ') + value;
  }

  function quoteString(value, language) {
    value = String(value === undefined || value === null ? '' : value);
    if (language === 'python') {
      return "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + "'";
    }
    return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + '"';
  }

  function comment(language, text) {
    return language === 'python' ? '# ' + text : '// ' + text;
  }

  function normalizeLanguage(language) {
    language = String(language || '').toLowerCase();
    return language === 'java' || language === 'javascript' ? language : 'python';
  }

  function pushWarning(warnings, warning) {
    if (warnings.indexOf(warning) === -1) warnings.push(warning);
  }

  function trimCode(lines) {
    while (lines.length && !lines[lines.length - 1]) lines.pop();
    return lines.join('\n');
  }

  global.ApiStudioSeleniumCodegen = {
    generate: generate,
    quoteString: quoteString
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
