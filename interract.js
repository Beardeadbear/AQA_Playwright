class ComponentNode {
    constructor(target, options = {}) {
      // Set default options and merge with provided options
      options = {
        findParent: false,
        ...options
      };
  
      const $target = $(target);
      // Find component
      let $component = $target.closest('[data-fl-widget-instance], fl-helper[data-helper-id]:not([data-widget-name])');
      let view;
  
      if (options.findParent) {
        const $context = $target.parents('[data-view]').eq(0);
  
        view = $context.data('view');
  
        $component = view
          ? $context.closest('[data-has-views]')
          : $target.parents('[data-fl-drop-zone]').eq(0);
      }
  
      // Extract properties
      this.$el = $component;
      this.widgetId = $component.data('id');
      this.helperId = $component.is('fl-helper') ? $component.data('helper-id') : undefined;
      this.package = $component.data('widget-package');
      this.view = options.view || view;
    }
  
    parent() {
      return new ComponentNode(this.$el, { findParent: true });
    }
  
    parents(filter) {
      const result = [];
      let context = this;
  
      do {
        context = context.parent();
        result.push(context);
      } while (context.widgetId || context.helperId);
  
      result.pop();
  
      if (typeof filter !== 'undefined') {
        return _.filter(result, filter);
      }
  
      return result;
    }
  
    is(value) {
      if (!(value instanceof ComponentNode || typeof value === 'object')) {
        throw new Error('Invalid value type. Must be a ComponentNode or JavaScript object.');
      }
  
      if (value instanceof ComponentNode) {
        return this.$el.is(value.$el) && this.view === value.view;
      }
  
      return Object.entries(value).every(([key, val]) => this[key] === val);
    }
  }
  
  class ViewContainer {
    constructor(view, options = {}) {
      // Set default options and merge with provided options
      this.options = {
        placeholder: undefined,
        component: {},
        ...options
      };
  
      const $view = $(view).closest('[data-view]');
      const componentNode = new ComponentNode($view);
  
      // Extract properties
      this.$el = $view;
      this.name = $view.data('view');
      this.matchCriteria = {
        widgetId: componentNode.widgetId,
        helperId: componentNode.helperId
      };
  
      // Set up view placeholder watcher
      if (this.options.placeholder) {
        this.#checkEmptyContent();
  
        Fliplet.Hooks.on('componentEvent', this.#handleComponentEvent.bind(this));
      }
    }
  
    #callbacks = [];
  
    #checkEmptyContent() {
      this.$el.findUntil('[data-view-placeholder]', '[data-has-views]').remove();
      this.$el.removeClass('fl-view-empty');
  
      const containerIsEmpty = this.$el.html().trim() === '';
      const containerOnlyHasCutContent = this.$el.children().length === 1 && this.$el.children().is('.fl-cut-hidden');
  
      if (containerIsEmpty || containerOnlyHasCutContent) {
        this.$el.append(this.options.placeholder);
        this.$el.addClass('fl-view-empty');
      }
  
      Fliplet.Studio.emit('update-dom');
      Fliplet.Widget.updateHighlightDimensions();
    }
  
    #handleComponentEvent(eventData) {
      const { target, source } = eventData;
  
      // Check if target or source match the criteria
      const targetOrSourceMatchesCriteria = [target, source].some(item => _.isMatch(item, this.matchCriteria));
  
      if (!targetOrSourceMatchesCriteria) {
        return;
      }
  
      this.#checkEmptyContent();
      this.#callbacks.forEach(callback => callback(eventData));
    }
  
    onContentChange(callback) {
      if (typeof callback !== 'function') {
        return;
      }
  
      this.#callbacks.push(callback);
    }
  }
  
  Fliplet.Registry.set('fliplet-interact:3.0:drag-handlers', (function() {
    var debugMode = false;
    var dragoverQueue = [];
    var toHighlight = false;
    var hideDropLine = false;
    var isDragging = false;
    var isDropping = false;
    var isHovering = false;
    var draggingElement;
    var widgetIsInline = false;
    var hoveringCheck = null;
    var widgetsWithoutSettings = [
      'com.fliplet.text',
      'com.fliplet.container'
    ];
    var notDraggableWidgets = [
      'com.fliplet.inline-link'
    ];
    var fullScreenWidgets = [
      {
        name: 'com.fliplet.chat'
      },
      {
        name: 'com.fliplet.onboarding'
      }
    ];
    var DROP_AREA_SELECTOR = '[data-fl-drop-zone]';
    var WIDGET_INSTANCE_SELECTOR = '.fl-widget-instance';
    var HELPER_INSTANCE_SELECTOR = 'fl-helper[data-is-configurable]';
    var VIEW_CONTAINER_SELECTOR = '[data-view]';
    var DRAGGABLE_INSTANCE_SELECTOR = '[draggable="true"]';
    var WIDGET_INSTANCE_ID_ATTR = 'data-id';
    var HELPER_ID_ATTR = 'data-helper-id';
    var WIDGET_CID_ATTR = 'cid';
    var dragoverQueueTimer;
    var organizationId = Fliplet.Env.get('organizationId');
    var currentAppId = Fliplet.Env.get('appId');
    var currentPageId = Fliplet.Env.get('pageId');
    var $body = $('body');
  
    $.fn.removeDropMarkers = function() {
      return this.each(function() {
        $(this).find('.fl-drop-marker').remove();
      });
    };
  
    $.fn.getDropMarkers = function() {
      return this.find('.fl-drop-marker');
    };
  
    $.fn.getDropMarker = function(index) {
      var $markers = this.find('.fl-drop-marker');
  
      index = parseInt(index, 10);
  
      if (isNaN(index) || index < 0) {
        index = 0;
      }
  
      return $markers.eq(index);
    };
  
    $.fn.hasDropMarkers = function() {
      return !!this.find('.fl-drop-marker').length;
    };
  
    $.fn.isHelper = function() {
      return this.get().some(function(el) {
        return isHelper(el);
      });
    };
  
    $.fn.hasViews = function() {
      return this.get().some(function(el) {
        return isNodeWithViews(el);
      });
    };
  
    $.fn.hasManagedViews = function() {
      return this.get().some(function(el) {
        return isNodeWithManagedViews(el);
      });
    };
  
    $.fn.isView = function() {
      return this.get().some(function(el) {
        return isView(el);
      });
    };
  
    $.fn.isDraggableInstance = function() {
      var draggable = this.attr('draggable') === 'true';
      var widgetPackage = this.data('widget-package');
  
      // Text components are given draggable="false" during focus
      return (draggable || widgetPackage === 'com.fliplet.text')
        && notDraggableWidgets.indexOf(widgetPackage) < 0
        && this.is(WIDGET_INSTANCE_SELECTOR)
        || isHelper(this[0]);
    };
  
    /**
     * Gets the selector string for a any draggable element
     * @return {String} Selector string
     */
    function getDraggableInstanceSelector() {
      return DRAGGABLE_INSTANCE_SELECTOR;
    }
  
    /**
     * Determines if a target element is a draggable widget
     * @param {jQuery} $element - Target element
     * @returns {Boolean} If the target element is a draggable widget
     */
    function isDraggableWidget($element) {
      var draggable = $element.attr('draggable') === 'true';
      var widgetPackage = $element.data('widget-package');
  
      return draggable
        && notDraggableWidgets.indexOf(widgetPackage) < 0
        && $element.is('[data-fl-widget-instance]');
    }
  
    /**
     * Checks if an HTML element is a view container
     * @param {Node} element HTML element to be tested
     * @return {Boolean} HTML element is a view container
     */
    function isView(element) {
      return $(element).is(VIEW_CONTAINER_SELECTOR);
    }
  
    /**
     * Checks if a helper ID references a helper with rich content containers
     * @param {Number} helperId ID of helper instance
     * @return {Boolean} Helper ID is a helper with rich content containers
     */
    function isNestingHelper(helperId) {
      if (!Fliplet.Helper) {
        return false;
      }
  
      var instance = Fliplet.Helper.findOne({ id: helperId });
  
      if (!instance) {
        return false;
      }
  
      return !_.isEmpty(instance.containers);
    }
  
    function getComponentLayout(element) {
      var widgetPackage = element.dataset.widgetPackage;
      var widgetMatch = _.find(fullScreenWidgets, { name: widgetPackage });
  
      return widgetMatch && widgetMatch.attributeWithLayout
        ? $(element)
          .find('[' + widgetMatch.attributeWithLayout + ']')
          .attr(widgetMatch.attributeWithLayout)
        : undefined;
    }
  
    function isFullScreenComponent(event) {
      var component = _.get(event, 'selectedComponent');
      var componentId = component.widgetId || component.elementId;
      var $widget
        = $(WIDGET_INSTANCE_SELECTOR + '[' + WIDGET_INSTANCE_ID_ATTR + '="' + componentId + '"]');
      var widgetPackage = $widget.data('widget-package');
  
      return !!_.find(fullScreenWidgets, { name: widgetPackage });
    }
  
    function isComponentPlaceholderId(id) {
      if (!id) {
        return false;
      }
  
      var regexpMatches = id.match(/^([a-f0-9]{4}|[0-9]+)(-placeholder-[0-9]+)$/);
  
      return !!(regexpMatches && regexpMatches.length);
    }
  
    function setDraggingElement(element) {
      draggingElement = element;
    }
  
    function getMouseBearingPercentages(options) {
      options = options || {};
  
      var position = { x: 0, y: 0 };
      var $element = options.element;
      var elemRect = options.elemRect;
      var mousePos = options.mousePos;
  
      if (_.isEmpty($element)) {
        return position;
      }
  
      if (!elemRect) {
        elemRect = $element.get(0).getBoundingClientRect();
      }
  
      position.x = ((mousePos.x - elemRect.left) / (elemRect.right - elemRect.left)) * 100;
      position.y = ((mousePos.y - elemRect.top) / (elemRect.bottom - elemRect.top)) * 100;
  
      return position;
    }
  
    function removeDropMarker(emit) {
      if (isDropping) {
        return;
      }
  
      $('.fl-drop-marker').remove();
  
      if (emit) {
        Fliplet.Studio.emit('remove-drop-marker');
      }
    }
  
    function getDropMarker() {
      var $marker = $('.fl-drop-marker');
  
      if (!$marker.length) {
        return $('<div class="fl-drop-marker"></div>');
      }
  
      return $marker;
    }
  
    /**
     * Check if an element is to be ignored when drilling down the DOM tree
     * @param {jQuery} $element jQuery object to be tested
     * @return {Boolean} Returns true if the element can be ignored
     */
    function isVoidElement($element) {
      var element = $element.get(0);
  
      if (!element) {
        return false;
      }
  
      var voidElements = ['i', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'video', 'iframe', 'source', 'track', 'wbr'];
  
      return (element.nodeName && voidElements.indexOf(element.nodeName.toLowerCase()) > -1)
        || element.hasAttribute('data-fl-widget-instance')
        || isHelper(element);
    }
  
    function calculateDistance(elementData, mouseX, mouseY) {
      return Math.sqrt(Math.pow(elementData.x - mouseX, 2) + Math.pow(elementData.y - mouseY, 2));
    }
  
    function findValidParent($element, direction) {
      if (hideDropLine) {
        return $element;
      }
  
      if ($element.is('body')) {
        return $element.find(DROP_AREA_SELECTOR);
      }
  
      if (['top', 'right', 'bottom', 'left'].indexOf(direction) === -1) {
        throw new Error('Direction: ' + direction + ' is invalid');
      }
  
      var elementRect = $element.get(0).getBoundingClientRect();
      // Find the first parent that is draggable or a view container
      var $elementParent = $element.parents('[draggable="true"]').eq(0);
      var elementParentRect = $elementParent.length && $elementParent.get(0).getBoundingClientRect();
  
      if ($element.is('[data-view]') && $elementParent.length
        || ($elementParent.length && elementParentRect && elementParentRect[direction] === elementRect[direction])) {
        return $elementParent;
      }
  
      return $element;
    }
  
    function recursiveGetIndex($element, result) {
      if (!$element || !$element.length) {
        return result;
      }
  
      // Recursion reached root drop zone element
      if ($element.is(DROP_AREA_SELECTOR)) {
        return result;
      }
  
      // Start by looking for the first parent that contains views
      var $parent = $element.is('[data-view]') && !$element.is('[data-has-views]')
        ? $element.parents('[data-has-views]').eq(0)
        : $element.parent();
      var index = getIndex($element, $parent);
  
      if (typeof index !== 'undefined') {
        if (debugMode) {
          console.log('node [' + index + ']', $element[0]);
        }
  
        result.unshift(index);
      } else if (debugMode) {
        console.log('No index', $element[0], $parent[0]);
      }
  
      return recursiveGetIndex($parent, result);
    }
  
    /**
     * Gets the node path from the bottom up
     * @param {jQuery} $element - Starting element
     * @returns {Array} Array of indices representing the element path
     */
    function getElementPath($element) {
      if (debugMode) {
        console.group('Getting element path');
        console.log('Starting element', $element.get(0));
      }
  
      var path = recursiveGetIndex($element, []);
  
      if (debugMode) {
        console.groupEnd();
      }
  
      return path;
    }
  
    function isNodeWithViews(node) {
      return node && node.dataset && node.dataset.hasOwnProperty('hasViews');
    }
  
    function isNodeWithManagedViews(node) {
      return node && node.dataset && node.dataset.hasOwnProperty('managedViews');
    }
  
    /**
     * Gets a list of all parent elements
     * @param {Node} element - Starting element
     * @param {Node} [context] - If provided, do not traverse up the DOM tree further than this element
     * @return {Array} Collection of parent elements
     */
    function getParents(element, context) {
      var result = [];
      var parent = element && element.parentElement;
  
      while (parent && (!context || parent !== context)) {
        result.push(parent);
        parent = parent.parentElement;
      }
  
      return result;
    }
  
    function getNode(path, currentNode) {
      if (debugMode) {
        console.group('Getting element from path', path);
        console.log('Starting node', currentNode);
      }
  
      var node = document.querySelector(DROP_AREA_SELECTOR);
  
      function notInAnotherViewComponent(element) {
        // Only return view container nodes that aren't embedded in other helpers
        return !getParents(element, node).some(function(parentNode) {
          return isNodeWithViews(parentNode) && parentNode !== node;
        });
      }
  
      if (!node) {
        if (debugMode) {
          console.groupEnd();
        }
  
        return;
      }
  
      var i = 0;
      var index = path[i];
      var viewPlaceholderIndex;
  
      while (typeof node !== 'undefined' && index > -1) {
        viewPlaceholderIndex = _.findIndex(node.childNodes, function(node) {
          return node.dataset && node.dataset.hasOwnProperty('viewPlaceholder');
        });
  
        // Skip view placeholder
        if (viewPlaceholderIndex > -1 && index >= viewPlaceholderIndex) {
          index++;
        }
  
        if (currentNode && currentNode === node.childNodes[index]) {
          node = node.childNodes[index];
  
          if (debugMode) {
            console.log('node [' + index + '] matches starting node', node);
          }
  
          continue;
        }
  
        if (isNodeWithViews(node) && !isView(node)) {
          node = Array.prototype.filter.call(node.querySelectorAll('[data-view]'), notInAnotherViewComponent)[index];
  
          if (debugMode) {
            console.log('node [' + index + '] from helper with views', node);
          }
        } else if (node && node.childNodes) {
          node = node.childNodes[index];
  
          if (debugMode) {
            console.log('node [' + index + ']', node);
          }
        }
  
        i++;
        index = path[i];
      }
  
      if (debugMode) {
        console.groupEnd();
      }
  
      return node;
    }
  
    function getElementFromPath(options) {
      if (Array.isArray(options)) {
        options = {
          path: options
        };
      }
  
      options = options || {};
  
      var path = options.path;
      var fromElement = options.fromElement;
      var isOnlyChild = false;
  
      if (!path) {
        return {};
      }
  
      // This is the element using the position
      // the 'fromElement' is going to be moved to
      var element = fromElement
        ? getNode(path, fromElement)
        : getNode(path);
  
      // If 'element' is undefined
      // Means there's no element in the new parent
      if (!element) {
        // Flag it for later
        isOnlyChild = true;
  
        path.pop();
        element = getNode(path, fromElement);
      }
  
      if (!element) {
        return {};
      }
  
      // This is the new parent element after being moved
      var elementParent;
      var toEmptyContainer = isOnlyChild && fromElement;
  
      // No parent element
      if (toEmptyContainer) {
        elementParent = element;
      } else {
        elementParent = getNode(_.take(path, path.length - 1), fromElement);
  
        // If the parent element is a view node, go one more level up to the component wrapper
        if (isView(elementParent) && !isNodeWithViews(elementParent)) {
          elementParent = getNode(_.take(path, path.length - 2), fromElement);
        }
      }
  
      // If it's moving to an empty container, start from the current element instead of starting from the parent
      var parentWidget = $(element)[toEmptyContainer ? 'closest' : 'parents'](WIDGET_INSTANCE_SELECTOR).get(0);
      var $parentElements = $(element).parents();
  
      if (toEmptyContainer) {
        $parentElements = $($parentElements.addBack().get().reverse());
      }
  
      var parentView = $parentElements.filter(function() {
        if (!this.dataset || !this.dataset.view) {
          return;
        }
  
        // Make sure the parent view belongs to parentWidget
        return parentWidget && $(this).closest(WIDGET_INSTANCE_SELECTOR).get(0) === parentWidget;
      }).data('view');
  
      return {
        isOnlyChild: isOnlyChild,
        path: path,
        element: element,
        parent: elementParent,
        parentNode: element.parentElement || element.parentNode,
        parentWidget: parentWidget,
        parentView: parentView
      };
    }
  
    function createClientRect(clientRect) {
      return _.pick(clientRect, ['top', 'right', 'bottom', 'left', 'width', 'height', 'x', 'y']);
    }
  
    function toNumber(value, defaultValue) {
      value = parseInt(value, 10);
  
      if (isNaN(value)) {
        value = typeof defaultValue === 'number' ? defaultValue : 0;
      }
  
      return value;
    }
  
    function getElementLayout(element) {
      var dimensions = [
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width'
      ];
      var compStyles = element.currentStyle || window.getComputedStyle(element);
      var layout = {};
  
      _.forEach(dimensions, function(prop) {
        layout[_.camelCase(prop)] = toNumber(compStyles.getPropertyValue(prop));
      });
      layout['display'] = compStyles.getPropertyValue('display');
      layout['position'] = compStyles.getPropertyValue('position');
  
      return layout;
    }
  
    function cleanClientRect(rect) {
      var cleanObject = {};
  
      for (var key in rect) {
        if (key === 'toJSON') {
          continue;
        }
  
        cleanObject[key] = rect[key];
      }
  
      return cleanObject;
    }
  
    function isElement(element) {
      //  Testing some properties that all elements have (works on IE7)
      return typeof element === 'object'
        && element.nodeType === 1
        && typeof element.style === 'object'
        && typeof element.ownerDocument === 'object';
    }
  
    function hasParent(element) {
      return !!element && !element.classList.contains('fl-page-content-wrapper');
    }
  
    /**
     * Returns true if the element is a configurable helper instance
     * @param {Node} element HTML element to be tested
     * @return {Boolean} Returns true if the element is a configurable helper instance
     */
    function isHelper(element) {
      return element
        && element.nodeName === 'FL-HELPER'
        && element.hasAttribute('data-is-configurable');
    }
  
    /**
     * Constructs an object for Drag & Drop system based on an HTML element
     * @param {Node} element HTML element hovered on
     * @return {Object} Data object for Drag & Drop system
     */
    function constructHoveringObject(element) {
      var $element;
  
      if (element instanceof jQuery) {
        $element = element;
        element = element.get(0);
      }
  
      if (!element || !isElement(element)) {
        return {};
      }
  
      var parent = element.parentElement;
  
      if (parent && parent.getAttribute('data-type') === 'menu') {
        element = parent;
      }
  
      if ($(element).parents().is('[data-type="menu"]')) {
        element = $(element).parents('[data-type="menu"]').get(0);
      }
  
      var rect = element.getBoundingClientRect();
      var parentCompStyles = parent
        ? parent.currentStyle || window.getComputedStyle(parent)
        : undefined;
      var parentPackage = parent ? parent.getAttribute('data-widget-package') : '';
      var parentIsNestingWidget = parentPackage
        ? isNodeWithViews(parent) || isHelper(parent)
        : false;
      var parentId = parentIsNestingWidget ? parseInt(parent.getAttribute('data-id'), 10) : undefined;
      var parentRect;
      var scrollPosition = {
        top: window.pageYOffset,
        left: window.pageXOffset
      };
      var widget;
  
      rect = cleanClientRect(rect);
  
      if (parent) {
        parentRect = parent.getBoundingClientRect();
      }
  
      if (!parentRect || !rect) {
        return;
      }
  
      // Get the element layout values
      rect = _.assignIn(rect, getElementLayout(element));
  
      // Sizes
      var width = rect.width - rect.paddingLeft - rect.paddingRight;
      var height = rect.height - rect.paddingTop - rect.paddingBottom;
  
      // Display
      var parentDisplay = parentCompStyles ? parentCompStyles.getPropertyValue('display') : 'block';
      var parentIsFlex = parentDisplay === 'flex' || parentDisplay === 'inline-flex';
  
      if (rect.display === 'block' && !parentIsFlex) {
        var margin = parentRect.width - rect.width;
  
        // Aligned right
        if (rect.right - rect.marginRight === parentRect.right) {
          rect.marginLeft = margin - rect.marginRight;
        } else if (rect.left - rect.marginLeft === parentRect.left) {
          // Aligned left
          rect.marginRight = margin - rect.marginLeft;
        }
      }
  
      if (element.hasAttribute('data-fl-widget-instance') || isHelper(element)) {
        widget = element;
      } else if (parent) {
        if ((parent.hasAttribute('data-fl-widget-instance') && !parentIsNestingWidget)
          || isHelper(parent)) {
          widget = parent;
        }
      }
  
      var isWidget = !!widget && !isHelper(widget);
      var isMissingWidget = element.classList.contains('label-component-missing');
      var hideSettings = isWidget
        ? widgetsWithoutSettings.indexOf(widget.getAttribute('data-widget-package')) > -1
        : !isHelper(widget) || !widget.hasAttribute('data-has-fields');
      var hideThemeSettings = element.hasAttribute('data-hide-theme-settings');
      var isMenu = element.getAttribute('data-type') === 'menu'
        || (parent && parent.getAttribute('data-type') === 'menu')
        || $(element).parents().is('[data-type="menu"]');
      var isDraggable = $(element).isDraggableInstance();
      var isHelperView = element.hasAttribute('data-view') && element.hasAttribute('data-helper');
      var isSelectable = !isHelperView;
      var isRemovable = !isMenu && !isHelperView;
      var widgetId = parseInt(widget && widget.getAttribute('data-id'), 10) || undefined;
      var helperId = widget && widget.getAttribute('data-helper-id') || undefined;
      var widgetUUID = widget && widget.getAttribute('data-uuid') || undefined;
      var widgetPackage = widget && widget.getAttribute('data-widget-package') || undefined;
      var widgetType = widget && widget.getAttribute('data-type') || undefined;
      var widgetName = widget && widgetType !== 'menu' ? widget.getAttribute('data-name') : undefined;
      var themePrefix = widget && widget.getAttribute('data-theme-prefix') || undefined;
      var helperName = isHelper(widget) ? widget.getAttribute('name') : undefined;
      var layout = isWidget ? getComponentLayout(widget) : '';
  
      rect.width = width;
      rect.height = height;
      rect.top = rect.top + rect.paddingTop;
      rect.left = rect.left + rect.paddingLeft;
  
      return {
        rect: rect,
        scrollPosition: scrollPosition,
        isWidget: isWidget,
        isHelper: isHelper(widget),
        isHelperView: isHelperView,
        isView: isView(element),
        parentIsNestingWidget: parentIsNestingWidget,
        isMissingWidget: isMissingWidget,
        hasParent: hasParent(parent),
        parentId: parentId,
        parentIsFlex: parentIsFlex,
        helperId: helperId,
        widgetId: widgetId,
        widgetUUID: widgetUUID,
        widgetPackage: widgetPackage,
        widgetName: widgetName,
        themePrefix: themePrefix,
        helperName: helperName,
        layout: layout,
        hideSettings: hideSettings,
        hideThemeSettings: hideThemeSettings,
        isMenu: isMenu,
        isDraggable: isDraggable,
        isRemovable: isRemovable,
        isSelectable: isSelectable,
        isFixed: rect.position === 'fixed',
        domPosition: getElementPath($element || $(element)),
        isDropArea: element === document.querySelector(DROP_AREA_SELECTOR)
      };
    }
  
    function addContainerContext($element, position) {
      if ($element.is('html, body')) {
        position = 'inside';
        $element = $(DROP_AREA_SELECTOR);
      }
  
      if (toHighlight) {
        position = 'inside';
      }
  
      switch (position) {
        case 'inside':
          Fliplet.Studio.emit('hovering-element', {
            element: constructHoveringObject($element[0])
          });
          break;
        case 'sibling':
          Fliplet.Studio.emit('hovering-element', {
            element: constructHoveringObject($element.parent()[0])
          });
          break;
        default:
          break;
      }
    }
  
    /**
     * Show drop point marker as element highlight and in Screen Structure
     * @param {Object} dropMarkerData - Marker data
     * @returns {undefined}
     */
    function showDropMarker(dropMarkerData) {
      var $dropMarker = getDropMarker();
  
      if (!$dropMarker.length) {
        return;
      }
  
      var isDropException = $dropMarker.hasClass('flex');
      var dropMarkerClientRect = createClientRect($dropMarker[0].getBoundingClientRect());
  
      if (isDropException) {
        if ($dropMarker.next().length) {
          dropMarkerClientRect = createClientRect($dropMarker.next()[0].getBoundingClientRect());
        } else if ($dropMarker.prev().length) {
          dropMarkerClientRect = createClientRect($dropMarker.prev()[0].getBoundingClientRect());
          dropMarkerClientRect.left = dropMarkerClientRect.left + dropMarkerClientRect.width;
        }
      }
  
      dropMarkerData.element = {};
      dropMarkerData.element.top = dropMarkerClientRect.top;
      dropMarkerData.element.left = dropMarkerClientRect.left;
      dropMarkerData.isDragging = isDragging;
      dropMarkerData.path = getElementPath($dropMarker);
  
      // Remove $element from dropMarkerData
      delete dropMarkerData.$element;
  
      Fliplet.Studio.emit('show-drop-marker', dropMarkerData);
    }
  
    function addDropMarker(options) {
      options = options || {};
  
      var $element = options.$element;
      var position = options.position;
      var $dropMarker = options.$dropMarker;
      var dropMarkerData = options.dropMarkerData;
  
      dropMarkerData.$element = $element;
      dropMarkerData.position = position;
  
      if (!$dropMarker) {
        $dropMarker = getDropMarker();
      }
  
      // If the parent is a container and the justify content is space-between or space-around we use a flex drop marker
      var elementIsFlex = isView($element) &&
        ($element.css('justify-content') === 'space-between' || $element.css('justify-content') === 'space-around');
      var parentIsFlex = isView($element.parent()) &&
        ($element.parent().css('justify-content') === 'space-between' || $element.parent().css('justify-content') === 'space-around');
  
      $dropMarker.toggleClass(
        'flex',
        parentIsFlex || elementIsFlex
      );
  
      $('[data-view].empty').removeClass('empty');
  
      switch (position) {
        case 'before':
          if (!toHighlight && !hideDropLine) {
            if ($element.is('body') || $element.parent().is('body')) {
              $element = $(DROP_AREA_SELECTOR + ' *').first();
            }
  
            $element.before($dropMarker);
            showDropMarker(dropMarkerData);
          }
  
          addContainerContext($element, 'sibling');
          break;
        case 'after':
          if (!toHighlight && !hideDropLine) {
            if ($element.is('body') || $element.parent().is('body')) {
              $element = $(DROP_AREA_SELECTOR + ' *').last();
            }
  
            $element.after($dropMarker);
            showDropMarker(dropMarkerData);
          }
  
          addContainerContext($element, 'sibling');
          break;
        case 'inside-prepend':
          if (!toHighlight && !hideDropLine) {
            if ($element.is(':empty')) {
              $element.addClass('empty');
            }
  
            $element.prepend($dropMarker);
            showDropMarker(dropMarkerData);
          }
  
          addContainerContext($element, 'inside');
          break;
        case 'inside-append':
          if (!toHighlight && !hideDropLine) {
            if ($element.is(':empty')) {
              $element.addClass('empty');
            }
  
            $element.append($dropMarker);
            showDropMarker(dropMarkerData);
          }
  
          addContainerContext($element, 'inside');
          break;
        default:
          break;
      }
    }
  
    function placeInside($element) {
      var $dropMarker = getDropMarker();
      var dropMarkerData = {
        orientation: 'horizontal',
        property: 'width',
        size: $element.width()
      };
  
      $dropMarker.addClass('horizontal');
  
      addDropMarker({
        $element: $element,
        position: 'inside-append',
        $dropMarker: $dropMarker,
        dropMarkerData: dropMarkerData
      });
    }
  
    function placeBefore(options) {
      options = options || {};
  
      var $element = options.$element;
  
      if (!$element.length) {
        removeDropMarker();
  
        return;
      }
  
      var inlineDropMarker = options.isInlineElement;
      var dropMarkerData = {};
      var $dropMarker = getDropMarker();
  
      if ($element.is('td, th') || $element.is('[data-view]')) {
        var showHorizontalLine = false;
        var isSpaceContentException = false;
  
        // If the element is [data-view] and the first and/or last child is full width we use a horizontal line
        // Otherwise we use a vertical line
        if ($element.is('[data-view]')) {
          isSpaceContentException = $element.css('justify-content') === 'space-between'
            || $element.css('justify-content') === 'space-around';
  
          if ($element.children().first().outerWidth(true) === $element.width() && !isSpaceContentException) {
            showHorizontalLine = true;
          }
        }
  
        $dropMarker.addClass(showHorizontalLine ? 'horizontal' : 'vertical');
        dropMarkerData.orientation = showHorizontalLine ? 'horizontal' : 'vertical';
        dropMarkerData.property = showHorizontalLine ? 'width' : 'height';
  
        var firstChildHeight = $element.children().first().height();
        
        dropMarkerData.size = (!isSpaceContentException && showHorizontalLine) ? $element.width() : firstChildHeight;
  
        if (!showHorizontalLine) {
          $dropMarker.height(firstChildHeight);
        }
  
        return addDropMarker({
          $element: $element,
          position: 'inside-prepend',
          $dropMarker: $dropMarker,
          dropMarkerData: dropMarkerData
        });
      }
  
      if (inlineDropMarker) {
        var $previousSibling = $element.prev();
        var $parent = $element.parent();
  
        if ($previousSibling.length && $previousSibling.outerWidth(true) === $parent.width()) {
          dropMarkerData.orientation = 'horizontal';
          dropMarkerData.property = 'width';
          dropMarkerData.size = $previousSibling.outerWidth(true);
        } else {
          $dropMarker.addClass('vertical');
          $dropMarker.height($element.innerHeight());
  
          dropMarkerData.orientation = 'vertical';
          dropMarkerData.property = 'height';
          dropMarkerData.size = $element.innerHeight();
        }
      } else {
        $dropMarker.addClass('horizontal');
        dropMarkerData.orientation = 'horizontal';
        dropMarkerData.property = 'width';
        dropMarkerData.size = $element.parent().width();
      }
  
      addDropMarker({
        $element: $element,
        position: 'before',
        $dropMarker: $dropMarker,
        dropMarkerData: dropMarkerData
      });
    }
  
    function placeAfter(options) {
      options = options || {};
  
      var $element = options.$element;
  
      if (!$element.length) {
        removeDropMarker();
  
        return;
      }
  
      var inlineDropMarker = options.isInlineElement;
      var dropMarkerData = {};
      var $dropMarker = getDropMarker();
  
      if ($element.is('td,th') || $element.is('[data-view]')) {
        var showHorizontalLine = false;
        var isSpaceContentException = false;
  
        // If the element is [data-view] and the first and/or last child is full width we use a horizontal line
        // Otherwise we use a vertical line
        if ($element.is('[data-view]')) {
          isSpaceContentException = $element.css('justify-content') === 'space-between'
            || $element.css('justify-content') === 'space-around';
  
          if ($element.children().last().outerWidth(true) === $element.width() && !isSpaceContentException) {
            showHorizontalLine = true;
          }
        }
  
        $dropMarker.addClass(showHorizontalLine ? 'horizontal' : 'vertical');
        dropMarkerData.orientation = showHorizontalLine ? 'horizontal' : 'vertical';
        dropMarkerData.property = showHorizontalLine ? 'width' : 'height';
  
        var lastChildHeight = $element.children().last().height();
  
        dropMarkerData.size = (!isSpaceContentException && showHorizontalLine) ? $element.width() : lastChildHeight;
  
        if (!showHorizontalLine) {
          $dropMarker.height(lastChildHeight);
        }
  
        return addDropMarker({
          $element: $element,
          position: 'inside-append',
          $dropMarker: $dropMarker,
          dropMarkerData: dropMarkerData
        });
      }
  
      if (inlineDropMarker) {
        var $nextSibling = $element.next();
        var $parent = $element.parent();
  
        if ($nextSibling.length && $nextSibling.outerWidth(true) === $parent.width()) {
          dropMarkerData.orientation = 'horizontal';
          dropMarkerData.property = 'width';
          dropMarkerData.size = $nextSibling.outerWidth(true);
        } else {
          $dropMarker.addClass('vertical');
          $dropMarker.height($element.innerHeight());
  
          dropMarkerData.orientation = 'vertical';
          dropMarkerData.property = 'height';
          dropMarkerData.size = $element.innerHeight();
        }
      } else {
        $dropMarker.addClass('horizontal');
        dropMarkerData.orientation = 'horizontal';
        dropMarkerData.property = 'width';
        dropMarkerData.size = $element.parent().width();
      }
  
      addDropMarker({
        $element: $element,
        position: 'after',
        $dropMarker: $dropMarker,
        dropMarkerData: dropMarkerData
      });
    }
  
    /**
     * Finds the child element that is the nearest to the current cursor position
     * @param {jQuery} $container - Container element
     * @param {Number} clientX - Cursor position (X)
     * @param {Number} clientY - Cursor position (Y)
     * @returns {jQuery} Nearest child element
     */
    function getNearestChild($container, clientX, clientY) {
      var $children = $container.children(':not(.fl-drop-marker)');
  
      if (!$children.length) {
        return;
      }
  
      if ($children.length === 1) {
        return $children.eq(0);
      }
  
      var children = $children.map(function() {
        var $this = $(this);
  
        if (!$this.is(':visible')) {
          return;
        }
  
        var offset = this.getBoundingClientRect();
        var distanceToRightSide = null;
        var distanceToLeftSide = null;
        var elementRightSide = null;
        var elementLeftSide = null;
        var distance = 0;
  
        // Parallel to Y axis and intersecting with x axis
        if (clientY > offset.top && clientY < offset.bottom) {
          if (clientX < offset.left && clientY < offset.right) {
            elementRightSide = {
              x: offset.left,
              y: clientY
            };
          } else {
            elementRightSide = {
              x: offset.right,
              y: clientY
            };
          }
        } else if (clientX > offset.left && clientX < offset.right) {
          // Parallel to X axis and intersecting with Y axis
          if (clientY < offset.top && clientY < offset.bottom) {
            elementRightSide = {
              x: clientX,
              y: offset.top
            };
          } else {
            elementRightSide = {
              x: clientX,
              y: offset.bottom
            };
          }
        } else if (clientX < offset.left && clientX < offset.right) {
          // runs if no element found!
          // left top
          elementRightSide = {
            x: offset.left,
            y: offset.top
          };
  
          // left bottom
          elementLeftSide = {
            x: offset.left,
            y: offset.bottom
          };
        } else if (clientX > offset.left && clientX > offset.right) {
          // Right top
          elementRightSide = {
            x: offset.right,
            y: offset.top
          };
  
          // Right Bottom
          elementLeftSide = {
            x: offset.right,
            y: offset.bottom
          };
        } else if (clientY < offset.top && clientY < offset.bottom) {
          // Top Left
          elementRightSide = {
            x: offset.left,
            y: offset.top
          };
  
          // Top Right
          elementLeftSide = {
            x: offset.right,
            y: offset.top
          };
        } else if (clientY > offset.top && clientY > offset.bottom) {
          // Left bottom
          elementRightSide = {
            x: offset.left,
            y: offset.bottom
          };
  
          // Right Bottom
          elementLeftSide = {
            x: offset.right,
            y: offset.bottom
          };
        }
  
        distanceToRightSide = calculateDistance(elementRightSide, clientX, clientY);
  
        if (elementLeftSide !== null) {
          distanceToLeftSide = calculateDistance(elementLeftSide, clientX, clientY);
        }
  
        if (distanceToRightSide < distanceToLeftSide || distanceToLeftSide === null) {
          distance = distanceToRightSide;
        } else {
          distance = distanceToLeftSide;
        }
  
        return {
          element: this,
          distance: distance
        };
      }).get();
  
      var nearestChild = _.minBy(children, 'distance');
  
      if (!nearestChild) {
        return;
      }
  
      return $(nearestChild.element);
    }
  
    function addEntryToDragOverQueue(options) {
      options = options || {};
  
      var $element = options.$element;
      var elementRect = options.elemRect;
      var mousePos = options.mousePos;
      var hoveringFlag = options.isHovering;
      var isInlineWidget = options.isInlineWidget;
      var isDropMarker = options.isDropMarker;
  
      isHovering = true;
  
      var newEvent = {
        $element: $element,
        elementRect: elementRect,
        mousePos: mousePos,
        isHovering: hoveringFlag,
        isInlineWidget: isInlineWidget,
        isDropMarker: isDropMarker
      };
  
      // To check if the user is still hovering an element
      if (hoveringCheck) {
        clearTimeout(hoveringCheck);
        hoveringCheck = null;
      }
  
      dragoverQueue.push(newEvent);
  
      hoveringCheck = setTimeout(function() {
        isHovering = false;
      }, 800);
    }
  
    function orchestrateDragDrop(options) {
      options = options || {};
  
      var $element = options.element;
      var elementRect = options.elemRect;
      var mousePos = options.mousePos;
  
      toHighlight = options.toHighlight;
      hideDropLine = options.toHideLine;
      widgetIsInline = options.isInlineWidget;
  
      if (!options.isDropMarker) {
        removeDropMarker();
      }
  
      if (!$element
        || !$element.length
        || !elementRect
        || !mousePos) {
        return;
      }
  
      // Prevents highlights to be computed if:
      // - The element being overed is a child of the element being dragged
      // - There's no element being hovered
      // - Element being hovered is the same as the one being dragged
      var $allElementParents = $element.parents();
      var childOfDraggingElement = false;
  
      if (draggingElement) {
        $allElementParents.each(function(idx, el) {
          if (el === draggingElement) {
            childOfDraggingElement = true;
  
            return false;
          }
        });
  
        if ($element[0] === draggingElement || childOfDraggingElement) {
          return;
        }
      }
  
      // Make sure the last parent usable is the body
      if ($element.is('html, body')) {
        $element = $element.find(DROP_AREA_SELECTOR);
      }
  
      var mousePercents = getMouseBearingPercentages({
        element: $element,
        elemRect: elementRect,
        mousePos: mousePos
      });
      var $validElement = null;
  
      if ((mousePercents.x > 0 && mousePercents.x < 100) &&
          (mousePercents.y > 0 && mousePercents.y < 100)) {
        // Case 1: Hovering element
        var $elementClone = $element.clone();
  
        $elementClone.removeDropMarkers();
  
        if (isVoidElement($elementClone)) {
          // If it's a void element, don't try to drill down
          placeDropMarker({
            $element: $element,
            mousePercents: mousePercents || {},
            mousePos: undefined
          });
  
          return;
        }
  
        if ($elementClone.html().trim() === '' && !isVoidElement($elementClone)) {
          if (mousePercents.y < 90) {
            return placeInside($element);
          }
  
          return;
        }
  
        if ($elementClone.children().length === 0) {
          // Text element / no children detected
          placeDropMarker({
            $element: $element,
            mousePercents: mousePercents || {},
            mousePos: undefined
          });
  
          return;
        }
  
        // Allowing users to place components on root level
        if ($element.is(DROP_AREA_SELECTOR)) {
          placeDropMarker({
            $element: $element,
            mousePercents: mousePercents || {},
            mousePos: mousePos
          });
  
          return;
        }
  
        // More than 1 child element present
        var $nearestChild = getNearestChild($element, mousePos.x, mousePos.y);
  
        placeDropMarker({
          $element: $nearestChild,
          mousePercents: mousePercents || {},
          mousePos: mousePos
        });
      } else if (mousePercents.x <= 0 || mousePercents.y <= 0) {
        // Case 2: Hovering drop area (top/left)
        if (mousePercents.y <= mousePercents.x) {
          $validElement = findValidParent($element, 'top');
        } else {
          $validElement = findValidParent($element, 'left');
        }
  
        if (toHighlight) {
          $validElement = $element;
        }
  
        if ($validElement.is('html, body')) {
          $validElement = $(DROP_AREA_SELECTOR);
        }
  
        placeDropMarker({
          $element: $validElement,
          mousePercents: mousePercents || {},
          mousePos: mousePos
        });
      } else if (mousePercents.x >= 100 || mousePercents.y >= 100) {
        // Case 3: Hovering drop area (bottom/right)
        if (mousePercents.y >= mousePercents.x) {
          $validElement = findValidParent($element, 'bottom');
        } else {
          $validElement = findValidParent($element, 'right');
        }
  
        if (toHighlight) {
          $validElement = $element;
        }
  
        if ($validElement.is('html, body')) {
          $validElement = $(DROP_AREA_SELECTOR);
        }
  
        placeDropMarker({
          $element: $validElement,
          mousePercents: mousePercents || {},
          mousePos: mousePos
        });
      }
    }
  
    function isValidDragOverEvent(dragOverEvent) {
      return _.isObject(dragOverEvent) && !_.isEmpty(dragOverEvent);
    }
  
    function processDragOverQueue() {
      var dragOverEvent = dragoverQueue.pop();
  
      dragoverQueue = [];
      isDragging = false;
  
      if (!isValidDragOverEvent(dragOverEvent)) {
        return;
      }
  
      var isDropMarker = dragOverEvent.isDropMarker;
      var $el = dragOverEvent.$element;
      var elRect = dragOverEvent.elementRect;
      var mousePos = dragOverEvent.mousePos;
  
      isDragging = dragOverEvent.isHovering;
      widgetIsInline = dragOverEvent.isInlineWidget;
  
      orchestrateDragDrop({
        element: $el,
        elemRect: elRect,
        mousePos: mousePos,
        toHighlight: false,
        toHideLine: false,
        isDropMarker: isDropMarker,
        isInlineWidget: widgetIsInline
      });
    }
  
    function startQueueProcessing() {
      dragoverQueueTimer = setInterval(function() {
        processDragOverQueue();
      }, 100);
    }
  
    function stopQueueProcessing() {
      clearInterval(dragoverQueueTimer);
    }
  
    // We are using this function instead of $.fn.index()
    // because $.fn.index() does not include ELEMENT_NODE nodes when computing indices
    function getIndex($node, $parent) {
      if (!$node || !$node.length) {
        return;
      }
  
      var node = $node[0];
      var index;
  
      // Node is inside a component with views (unless it's a root view)
      if ($parent.is('[data-has-views]') && !$parent.is('[data-view]')
        && !node.classList.contains('fl-drop-marker')) {
        // Node is not a view, don't calculate index
        if (!node.dataset.hasOwnProperty('view')) {
          return;
        }
  
        $parent.find('[data-view]').each(function(i, el) {
          if (el === node) {
            index = i;
  
            return false;
          }
        });
  
        return index;
      }
  
      index = 0;
  
      node = node.previousSibling;
  
      while (node) {
        // Skip helper view placeholders
        if (!(node.dataset && node.dataset.hasOwnProperty('viewPlaceholder'))) {
          index++;
        }
  
        node = node.previousSibling;
      }
  
      return index;
    }
  
    function isElementInline($element) {
      var $parent = $element.parent();
      var isInline = widgetIsInline
        && ($element.css('display') === 'inline' || $element.css('display') === 'inline-block' || $element.css('display') === 'flex')
        && (!isView($element) && $element.outerWidth(true) !== $parent.width());
      var isSpaceContentException = $parent.css('justify-content') === 'space-between'
        || $parent.css('justify-content') === 'space-around';
  
      // If flex and any row direction force inline flag
      if ($parent.css('display') === 'flex'
        && ($parent.css('flex-direction') === 'row'
          || $parent.css('flex-direction') === 'row-reverse')) {
        isInline = !isView($element) && $element.outerWidth(true) === $parent.width() && !isSpaceContentException ? false : true;
      }
  
      if ($element.is('br')) {
        isInline = false;
      }
  
      return isInline;
    }
  
    function placeDropMarker(options) {
      options = options || {};
  
      var $element = options.$element;
      var mousePercents = options.mousePercents;
      var mousePos = options.mousePos;
      var isInlineElement = isElementInline($element);
  
      if (mousePos) {
        mousePercents = getMouseBearingPercentages({
          element: $element,
          elemRect: null,
          mousePos: mousePos
        });
      }
  
      if (isInlineElement && !($element.is('[data-view]') && !$element.is(':empty'))) {
        if (mousePercents.x < 50) {
          return placeBefore({ $element, isInlineElement });
        }
  
        return placeAfter({ $element, isInlineElement });
      }
  
      if ($element.is(DROP_AREA_SELECTOR)) {
        // Get the height of all the first level children
        var $children = $element.children();
        var totalHeight = 0;
  
        $children.each(function() {
          totalHeight += $(this).outerHeight(true);
        });
  
        // Check if mousePos.y is less than totalHeight
        if (mousePos.y < totalHeight) {
          return placeBefore({ $element });
        }
  
        return placeAfter({ $element });
      }
  
      if (mousePercents.y < 50) {
        return placeBefore({ $element });
      }
  
      return placeAfter({ $element });
    }
  
    function getHoveringStatus() {
      return isHovering;
    }
  
    function getDroppingStatus() {
      return isDropping;
    }
  
    function setDroppingStatus(value) {
      isDropping = value;
    }
  
    function isValidComponent(event) {
      var selectedComponent = event && event.selectedComponent || {};
      var selectedComponentId = selectedComponent.widgetId
        || selectedComponent.helperId
        || selectedComponent.elementId;
  
      if (!selectedComponentId) {
        Fliplet.Studio.emit('show-edit-toast', {
          type: 'danger',
          description: 'Only components can be copied or cut.'
        });
  
        return false;
      }
  
      return true;
    }
  
    function getClipboardData(options) {
      options = options || {};
  
      var widgetId = _.get(options, 'data.selectedComponent.widgetId')
        || _.get(options, 'data.selectedComponent.elementId');
      var componentType = _.get(options, 'data.selectedComponent.isHelper') ? 'helper' : 'widget';
      var widgetPackage = _.get(options, 'data.selectedComponent.widgetPackage');
      var helperName = _.get(options, 'data.selectedComponent.helperName');
      var helperId = _.get(options, 'data.selectedComponent.helperId');
      var $component = componentType === 'helper'
        ? options.$richLayout.find('[' + HELPER_ID_ATTR + '="' + helperId + '"]')
        : options.$richLayout.find('[' + WIDGET_CID_ATTR + '="' + widgetId + '"]');
  
      if (!$component.length) {
        console.warn('Component not found');
  
        return;
      }
  
      var $placeholder = componentType === 'helper'
        ? $(HELPER_INSTANCE_SELECTOR + '[' + HELPER_ID_ATTR + '="' + helperId + '"]').clone()
        : $(WIDGET_INSTANCE_SELECTOR + '[' + WIDGET_INSTANCE_ID_ATTR + '="' + widgetId + '"]').clone();
  
      $placeholder = $placeholder.clone().addClass('fl-paste-placeholder');
      // Removes JavaScript tags to prevent code from running on pasting
      $placeholder.find('script').remove();
  
      return {
        type: options.type,
        component: $component.get(0).outerHTML,
        widgetPackage: widgetPackage,
        helperName: helperName,
        placeholder: $placeholder.get(0).outerHTML,
        organizationId: organizationId,
        appId: currentAppId,
        pageId: _.get(options, 'data.duplicate.pageId', currentPageId),
        originalComponentId: widgetId || helperId,
        componentType: componentType
      };
    }
  
    function getRichLayout(options) {
      options = options || {};
      options.appId = options.appId || currentAppId;
      options.pageId = options.pageId || currentPageId;
  
      return options.pageId === currentPageId && !options.force
        ? Promise.resolve()
        : Fliplet.API.request({
          method: 'GET',
          url: 'v1/apps/' + options.appId + '/pages/' + options.pageId + '?richLayout'
        });
    }
  
    function getLayoutWrapper(options) {
      options = options || {};
  
      var page = _.get(options, 'data.page');
  
      if (!page) {
        return;
      }
  
      var pageLayout = typeof page.richLayout !== 'undefined' && options.richLayout
        ? page.richLayout
        : page.layout;
  
      return $('<div>' + (pageLayout || '') + '</div>');
    }
  
    return {
      setDraggingElement: setDraggingElement,
      orchestrateDragDrop: orchestrateDragDrop,
      removeDropMarker: removeDropMarker,
      addEntryToDragOverQueue: addEntryToDragOverQueue,
      startQueueProcessing: startQueueProcessing,
      stopQueueProcessing: stopQueueProcessing,
      constructHoveringObject: constructHoveringObject,
      isDropping: getDroppingStatus,
      setDroppingStatus: setDroppingStatus,
      isHovering: getHoveringStatus,
      isNestingHelper: isNestingHelper,
      isHelper: isHelper,
      getDraggableInstanceSelector: getDraggableInstanceSelector,
      isValidComponent: isValidComponent,
      getClipboardData: getClipboardData,
      isFullScreenComponent: isFullScreenComponent,
      getRichLayout: getRichLayout,
      getLayoutWrapper: getLayoutWrapper,
      isComponentPlaceholderId: isComponentPlaceholderId,
      isDraggableWidget: isDraggableWidget,
      getElementPath: getElementPath,
      getElementFromPath: getElementFromPath
    };
  }()));
  
  (function($) {
    if (Fliplet.Env.get('mode') !== 'interact') {
      return;
    }
  
    Fliplet.Interact = {};
  
    var currentAppId;
    var currentPageId;
    var $pageLayout;
    var $richLayoutWrapper;
    var pastingHistory = [];
    var dragOperand = 15;
    var scrollSpeed = 200;
    // Caching window jQuery object to use when scroll happens
    var $window = $(window);
  
    // Drag image
    var dragImage64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAACXBIWXMAAC4jAAAuIwF4pT92AAAF12lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMDgtMDlUMTA6NDU6MjgrMDE6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTktMDgtMDlUMTA6NDU6MjgrMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTA4LTA5VDEwOjQ1OjI4KzAxOjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmViOGU4YWQ0LTlhMzUtNDM4Yy05YTIyLTJlMzA0Njg2ZGZkNiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmNmMmU2ZjNjLWY1Y2QtZmE0Yy1hZDMzLTFlYjc0ZTUzYWNiOCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjczOTFmYmI5LTA0ODQtNDEwYi1iYjgxLTRkMTdkYjBmZDQyOSIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjczOTFmYmI5LTA0ODQtNDEwYi1iYjgxLTRkMTdkYjBmZDQyOSIgc3RFdnQ6d2hlbj0iMjAxOS0wOC0wOVQxMDo0NToyOCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmViOGU4YWQ0LTlhMzUtNDM4Yy05YTIyLTJlMzA0Njg2ZGZkNiIgc3RFdnQ6d2hlbj0iMjAxOS0wOC0wOVQxMDo0NToyOCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+PgwXxgAAALhJREFUaIHtmjsOgzAQBU3ECejCIbkLHJIuXIFUSG7wFgEyWs1UFCvL44f8k7vP/N4LgGFau6hmW8ajr6e1r8t6BKGvvsMRupJhWm9pN11CCtFJJ9THJc9STc0tTmtM6AFay8deSnsRTpeQQnQUopNOCDdtB7vw8ERgQlSOLVO6hNIJ/e2X25bxlnbTJaQQHYXoKERHIToK0VGIjkJ0FKKjEB2F6ChERyE6CtFJJ1Rf1iNeNv5KuoS+jkUVDBlLy7YAAAAASUVORK5CYII=';
  
    // Selectors
    var DROP_AREA_SELECTOR = '[data-fl-drop-zone]';
    var $dropArea = $(DROP_AREA_SELECTOR);
    var WIDGET_INSTANCE_DATA = 'data-fl-widget-instance';
    var WIDGET_INSTANCE_SELECTOR = '[' + WIDGET_INSTANCE_DATA + ']';
    var WIDGET_INSTANCE_ID_DATA = 'id';
    var WIDGET_INSTANCE_ID_ATTR = 'data-' + WIDGET_INSTANCE_ID_DATA;
    var WIDGET_INSTANCE_ID_SELECTOR = '[' + WIDGET_INSTANCE_ID_ATTR + ']';
    var WIDGET_PACKAGE_DATA = 'widget-package';
    var WIDGET_CID_ATTR = 'cid';
    var WIDGET_CID_SELECTOR = '[' + WIDGET_CID_ATTR + ']';
    var HELPER_ID_DATA = 'helper-id';
    var HELPER_ID_ATTR = 'data-' + HELPER_ID_DATA;
    var HELPER_ID_SELECTOR = '[' + HELPER_ID_ATTR + ']';
    var HELPER_WIDGET_ATTR = '[data-widget-name]';
    var HELPER_TAGNAME = 'fl-helper';
    var COMPONENT_KEYS = {
      helper: {
        selector: HELPER_TAGNAME,
        idData: HELPER_ID_DATA,
        idAttr: HELPER_ID_ATTR,
        cidAttr: HELPER_ID_ATTR,
        idSelector: HELPER_ID_SELECTOR,
        cidSelector: HELPER_ID_SELECTOR
      },
      widget: {
        selector: WIDGET_INSTANCE_SELECTOR,
        idData: WIDGET_INSTANCE_ID_DATA,
        idAttr: WIDGET_INSTANCE_ID_ATTR,
        cidAttr: WIDGET_CID_ATTR,
        idSelector: WIDGET_INSTANCE_ID_SELECTOR,
        cidSelector: WIDGET_CID_SELECTOR
      }
    };
  
    var $currentHoveringElement;
    var $currentElement;
    var currentComponentIds = [];
    var widgetSelectors = [];
    var dragIcon;
    var startedSavingStyles = 0;
    var applyingStyles = false;
    var onStylesApplied = _.debounce(function() {
      applyingStyles = false;
    }, 500);
  
    // Drag Helpers
    var DragDrop = Fliplet.Registry.get('fliplet-interact:3.0:drag-handlers');
  
    Fliplet.Interact.DragDrop = DragDrop;
  
    var widgetIsInline = false;
    var targetElementChangeFlag = false;
    var elementRectangle;
    var countdown;
    var isDragging = false;
    var removeDropPointInterval;
    var removeDropPointPromise;
    var resolveRemoveDropPoint;
    var stopScrolling = true;
    var scrollTimeout;
  
    /**
     * Clean up TinyMCE artifacts from matching elements
     * @returns {jQuery} Same node with content cleaned up from TinyMCE artifacts
     */
    $.fn.cleanUpContent = function() {
      var MIRROR_ELEMENT_CLASS = 'fl-mirror-element';
      var MIRROR_ROOT_CLASS = 'fl-mirror-root';
      var PLACEHOLDER_CLASS = 'fl-text-placeholder';
  
      return $(this).each(function() {
        var $target = $(this);
        var $html = $target.wrapAll('<div />').parent();
  
        $html.find('.' + MIRROR_ELEMENT_CLASS).removeClass(MIRROR_ELEMENT_CLASS);
        $html.find('.' + MIRROR_ROOT_CLASS).removeClass(MIRROR_ROOT_CLASS);
        $html.find('.' + PLACEHOLDER_CLASS).removeClass(PLACEHOLDER_CLASS);
        // Remove any erroneous editable attributes from TinyMCE
        $html.find('.fl-wysiwyg-text.mce-content-body').replaceWith(function() {
          return $(this).contents();
        });
  
        // Remove empty class attributes
        $html.find('[class=""]').removeAttr('class');
  
        $target.unwrap();
      });
    };
  
    /**
     * Studio event to open widget settings
     * @param {Object} options - Widget information object
     * @returns {undefined}
     */
    function openWidgetSettings(options) {
      if (_.isEmpty(options)) {
        return;
      }
  
      Fliplet.Studio.emit('open-widget-settings', options);
    }
  
    /**
     * Studio event to flag components were deleted
     * @param {Object} options IDs of helper and widget components that were deleted
     * @returns {undefined}
     */
    function componentDeleted(options) {
      options = options || {};
  
      Fliplet.Studio.emit('widget-deleted', options);
    }
  
    /**
     * Studio event to send details of the hovering element
     * @param {Object} options - Element information
     * @returns {undefined}
     */
    function hoveringElement(options) {
      if (_.isEmpty(options)) {
        return;
      }
  
      Fliplet.Studio.emit('hovering-element', options);
    }
  
  
    var debouncedHoverElement = _.debounce(function(node) {
      hoveringElement({
        element: DragDrop.constructHoveringObject(node)
      });
    }, 16, {
      leading: true,
      trailing: true
    });
  
    /**
     * Studio event to show or hide the highlights in the frame
     * @param {Object} options - Options for the function
     * @returns {undefined}
     */
    function toggleHighlight(options) {
      options = options || {
        showHighlight: false
      };
  
      Fliplet.Studio.emit('toggle-highlight', options);
    }
  
    /**
     * Studio event to show or hide the highlight on the Screen Structure side bar
     * @param {Object} options - Options for the function
     * @returns {undefined}
     */
    function highlightInStructure(options) {
      options = options || {
        removeHighlight: true
      };
  
      Fliplet.Studio.emit('highlight-in-structure', options);
    }
  
    /**
     * Studio event to flag when widget is being dragged
     * @param {Object} options - Options for the function
     * @returns {undefined}
     */
    function widgetIsDragging(options) {
      options = options || {
        isDragging: false
      };
  
      isDragging = options.isDragging;
  
      $('body').toggleClass('is-dragging', !!isDragging);
  
      Fliplet.Studio.emit('widget-drag', options);
    }
  
    /**
     * Studio event to send the selected widget information
     * @param {Object} options - Options for the function
     * @returns {undefined}
     */
    function selectedWidget(options) {
      if (_.isEmpty(options)) {
        return;
      }
  
      Fliplet.Studio.emit('selected-widget-data', options);
    }
  
    /**
     * Get information for the nesting container widget
     * @param {jQuery} $el - jQuery object for the element being nested
     * @returns {Object} Information about the nesting container widget
     */
    function getContainerInfo($el) {
      var result = {
        instance: undefined,
        instanceId: undefined,
        view: undefined
      };
  
      if (!$el) {
        return result;
      }
  
      if (!($el instanceof jQuery)) {
        $el = $($el);
      }
  
      var $nestingInstance = $el.parents().filter(function filterNestingWidgets() {
        // Find the first parent widget that is a nesting widget
        return this.dataset.id
          && this.dataset.hasOwnProperty('flWidgetInstance')
          && this.dataset.hasOwnProperty('hasViews');
      }).eq(0);
      var nestingInstanceId = $nestingInstance.data('id');
      var nestingViewName = nestingInstanceId
        ? $el.parents('[data-view]').filter(function filterWidgetViews() {
          // Find the first view where the parent widget matches the nestingWidgetId
          return $(this).closest('[data-has-views]').data('id') === nestingInstanceId;
        }).eq(0).data('view')
        : undefined;
  
      result.instance = $nestingInstance.get(0);
      result.instanceId = nestingInstanceId;
      result.view = nestingViewName;
  
      return result;
    }
  
    /**
     * Delete widget instance
     * @param {Number} id - Widget ID
     * @returns {Promise} Deletion API request
     */
    function deleteWidgetInstance(id) {
      if (!id) {
        return Promise.reject('Invalid widget instance ID: ' + id);
      }
  
      return Fliplet.API.request({
        url: 'v1/widget-instances/' + id,
        method: 'DELETE'
      });
    }
  
    /**
     * Remove component from page
     * @param {Object} options A map of options for the function
     * @param {Number} options.id Widget ID to be deleted
     * @param {Number} options.helperId Helper ID to be deleted
     * @param {Boolean} [options.remove] - If true, the widget is always removed from the page
     * @returns {undefined}
     */
    function deleteComponentFromPage(options) {
      options = options || {};
  
      if (!options.id && !options.helperId) {
        return;
      }
  
      var $component = options.id
        ? $(WIDGET_INSTANCE_SELECTOR + '[' + WIDGET_INSTANCE_ID_ATTR + '="' + options.id + '"]')
        : (Fliplet.Helper && Fliplet.Helper.findOne({ id: options.helperId }) || {}).$el;
      var componentFound = options.id ? !!$component.length : !!$component;
      var widgetPackage = options.id ? $component.data(WIDGET_PACKAGE_DATA) : undefined;
      var isInlineLink = widgetPackage === 'com.fliplet.inline-link';
      var widgetIsMissing = $component instanceof jQuery
        ? $component.hasClass('label-component-missing') || $component.data('placeholder-id')
        : false;
  
      if (!componentFound) {
        // Nothing to delete
        return;
      }
  
      var confirmDelete;
  
      // If the widget instance is an inline link or missing, there's no need for confirmation
      if (isInlineLink || widgetIsMissing || options.skipConfirm) {
        confirmDelete = Promise.resolve(true);
      } else {
        var modalTitle = 'Delete this component and its settings';
        var modalMessage = 'Deleting will remove all the component\'s settings. Do you want to delete the component?';
  
        if ($component.hasViews() || DragDrop.isNestingHelper(options.helperId)) {
          modalTitle = 'Delete this component and its content';
          modalMessage = 'Deleting will remove all the component\'s content. Do you want to delete the component?';
        }
  
        confirmDelete = new Promise(function(resolve) {
          setTimeout(function() {
            Fliplet.Modal.confirm({
              title: modalTitle,
              message: modalMessage,
              buttons: {
                confirm: {
                  label: 'Delete component',
                  className: 'btn-danger'
                },
                cancel: {
                  label: 'Keep component',
                  className: 'btn-secondary'
                }
              }
            }).then(resolve);
          }, 400); // Wait for page to finish scrolling to the element
        });
      }
  
      confirmDelete.then(function(confirmed) {
        if (!confirmed) {
          return {
            keepComponent: true
          };
        }
  
        if (options.helperId || widgetIsMissing) {
          return;
        }
  
        // Remove the widget instance
        return deleteWidgetInstance(options.id).catch(function(error) {
          if (error && error.status === 404) {
            // Widget instance not found. Remove instance from the page anyway.
            return;
          }
  
          return Promise.reject(error);
        });
      }).then(function(opts) {
        var keepComponent = _.get(opts, 'keepComponent', false);
  
        if (keepComponent) {
          return keepComponent;
        }
  
        if (options.id) {
          // Get the instance object from the page again
          $component = $(WIDGET_INSTANCE_SELECTOR + '[' + WIDGET_INSTANCE_ID_ATTR + '="' + $component.data('id') + '"]');
        }
  
        // Check if direct parent is a nesting widget
        var { instanceId: nestingWidgetId, view: nestingView } = getContainerInfo($component);
  
        var componentNode = new ComponentNode($component);
        var parentNode = componentNode.parent();
  
        // Replace inline links with the text content
        if (isInlineLink && !options.remove) {
          $component.replaceWith($component.text());
        } else {
          // Remove widget from the page
          $component.remove();
        }
  
        Fliplet.Hooks.run('componentEvent', {
          type: 'removed',
          target: parentNode,
          removed: [componentNode]
        });
  
        refreshCurrentComponentIds();
  
        // If there's a parent that is a nesting widget
        // Save its settings
        if (nestingWidgetId) {
          return saveWidgetRichContent({
            id: nestingWidgetId,
            views: [nestingView]
          });
        }
      }).then(function(keepComponent) {
        if (keepComponent) {
          return;
        }
  
        savePageContent();
        componentDeleted();
      }).catch(function(error) {
        Fliplet.Studio.emit('page-saved', {
          isError: true,
          error: error
        });
      });
    }
  
    /**
     * Save rich content into nesting widgets
     * @param {Object} options - A map of options for the function
     * @param {Number} options.id - Widget ID
     * @param {Array} [options.views] - A list of views to save the rich content into. Text components can leave this as null.
     * @param {Boolean} [options.emitSavedStatus=TRUE] - If FALSE, don't trigger page-saved once it's completed
     * @returns {Promise} Promise is resolved when the content is saved
     */
    function saveWidgetRichContent(options) {
      options = options || {};
  
      if (typeof options !== 'object') {
        options = {
          id: options
        };
      }
  
      var id = options.id;
      var views = options.views;
      var emitSavedStatus = options.emitSavedStatus;
      var textWidget = Fliplet.Widget.get('Text');
      var data = {};
  
      if (!id) {
        return Promise.reject('Invalid widget instance ID: ' + id);
      }
  
      if (!Array.isArray(views)) {
        views = [views];
      }
  
      if (textWidget && textWidget.get(id)) {
        views.push(null);
      }
  
      return Promise.all(_.map(views, function(view) {
        var $html;
  
        // Saving widget settings for a Text widget
        if (view === null) {
          // Get content from TinyMCE editors to avoid TinyMCE instance markup
          $html = $('<div>' + textWidget.get(id).getContent() + '</div>');
  
          // Text widget content is saved in the "html" setting
          view = 'html';
        } else {
          var $widgetInstance = $dropArea.find('[data-fl-widget-instance][data-id="' + id + '"]');
          var html = $widgetInstance.data('view') === view
            ? $widgetInstance.html()
            : $widgetInstance.find('[data-view="' + view + '"]').html();
  
          $html = $('<div>' + html + '</div>');
  
          if (Fliplet.Helper) {
            Fliplet.Helper.restoreStateForHtml($html);
          }
        }
  
        $html = $html.cleanUpContent();
  
        // Pass HTML content through a hook so any JavaScript that has changed the HTML
        // can use this to revert the HTML changes
        return Fliplet.Hooks.run('beforeSavePageContent', $html.html())
          .then(function(html) {
            if (!Array.isArray(html) || !html.length) {
              html = [$html.html()];
            }
  
            return html[html.length - 1];
          })
          .then(function(html) {
            $html = $('<div>' + html + '</div>');
  
            $html = replaceWidgetInstances($html);
  
            var htmlString = $html.html();
  
            // Set data for updating widget instance
            // Use null to clear rich content for a specific view
            _.set(data, view, htmlString || null);
          });
      }))
        .then(function() {
          return Fliplet.API.request({
            url: 'v1/widget-instances/' + id,
            method: 'PUT',
            data: data
          });
        })
        .then(function() {
          // Emit event to Studio to get the updated DOM
          Fliplet.Studio.emit('update-dom');
  
          if (emitSavedStatus !== false) {
            Fliplet.Studio.emit('page-saved');
          }
        })
        .catch(function(error) {
          Fliplet.Studio.emit('page-saved', {
            isError: true,
            error: error
          });
        });
    }
  
    /**
     * Moves widget rich content by updating rich content setting(s)
     * @param {Object} options - A map of options for the function
     * @param {Number} options.fromParentWidgetId - Instance ID for the parent widget that rich content is moved from
     * @param {Node} options.fromParentWidget - Parent widget where the rich content is moved from
     * @param {String} options.fromParentView - Parent widget view where the rich content is moved from
     * @param {Number} options.toParentWidget - Instance ID for the parent widget that rich content is moved to
     * @param {Node} options.toParentWidgetId - Parent widget where the rich content is moved to
     * @param {String} options.toParentView - Parent widget view where the rich content is moved to
     * @returns {Promise<undefined>} Resolved when widget instance settings are all updated
     */
    function moveWidgetRichContents(options) {
      options = options || {};
  
      var fromParentWidgetId = options.fromParentWidgetId;
      var fromParentWidget = options.fromParentWidget;
      var fromParentView = options.fromParentView;
      var toParentWidget = options.toParentWidget;
      var toParentWidgetId = options.toParentWidgetId;
      var toParentView = options.toParentView;
  
      var savingWidgetPromises = [];
  
      // Content is moved between different views in the same widget
      if (toParentWidgetId && fromParentWidget === toParentWidget) {
        savingWidgetPromises.push(saveWidgetRichContent({
          id: toParentWidgetId,
          views: [fromParentView, toParentView],
          emitSavedStatus: false
        }));
      }
  
      // Checks if content is moved to a nesting widget
      // Skip if content moved inside the same parent
      if (fromParentWidget !== toParentWidget
        && $(toParentWidget).hasViews()) {
        savingWidgetPromises.push(saveWidgetRichContent({
          id: toParentWidgetId,
          views: [toParentView],
          emitSavedStatus: false
        }));
      }
  
      // Checking if we need to save any nesting widget:
      // Checks if content is moved from a nesting widget
      if (fromParentWidget !== toParentWidget
        && $(fromParentWidget).hasViews()) {
        savingWidgetPromises.push(saveWidgetRichContent({
          id: fromParentWidgetId,
          views: [fromParentView],
          emitSavedStatus: false
        }));
      }
  
      return Promise.all(savingWidgetPromises);
    }
  
    /**
     * Loads assets
     * @param {Array} assets Collection of assets to be loaded
     * @return {Boolean} If true, new assets were found
     */
    function loadAssets(assets) {
      var $head = $('head');
      var $tags = $('link[href], script[src]');
      var hasNewAssets = false;
  
      assets.forEach(function(asset) {
        var exactMatchFound = false;
  
        $tags.each(function() {
          var href = $(this).attr(this.tagName === 'LINK' ? 'href' : 'src');
  
          if (href && href.indexOf(asset.url) !== -1) {
            exactMatchFound = true;
  
            return false; // break the loop
          }
        });
  
        if (exactMatchFound) {
          return;
        }
  
        if (asset.url.match(/\.css$|\.css\?/) || asset.type === 'css') {
          var cleanedAssetUrl = asset.url;
  
          // Don't include cache busters when comparing asset URLs
          if (asset.url.indexOf('?_=') > -1) {
            cleanedAssetUrl = asset.url.substring(0, asset.url.indexOf('?_='));
          }
  
          var $existingStylesheet = $head.find('link[href^="' + cleanedAssetUrl + '"]');
          var newStylesheet = '<link type="text/css" rel="stylesheet" href="' + asset.url + '">';
  
          if ($existingStylesheet.length) {
            $existingStylesheet.replaceWith(newStylesheet);
          } else {
            $head.append(newStylesheet);
          }
        } else if (asset.url.match(/\.js$|.js\?/) || asset.type === 'js') {
          var s = document.createElement('script');
  
          s.src = asset.url;
          s.type = 'text/javascript';
          s.async = false; // Ensures the script is loaded asynchronously
          document.getElementsByTagName('head')[0].appendChild(s);
          hasNewAssets = true;
        }
      });
  
      return hasNewAssets;
    }
  
    /**
     * Reload component assets
     * @param {Object} options - Object with the array od widget ids, the widget instance response, and if the widget was moved on the page
     * @returns {undefined}
     */
    function reloadComponentAssets(options) {
      options = options || {};
  
      var type = options.type;
      // Helper partials contains instance partial data for its child widgets
      var widgetData = type === 'helper'
        ? _.assign.apply(
          this,
          _.map(_.get(options, 'partial.widgetInstancePartials', []), 'partial.widgetData')
        )
        : options.partial.widgetData;
      var assets = type === 'helper'
        ? _.concat.apply(
          this,
          _.map(_.get(options, 'partial.widgetInstancePartials', []), 'partial.assets')
        )
        : options.partial.assets;
      var translation = type === 'helper'
        ? {}
        : options.partial.translation;
      var widgetIds = _.map(_.keys(widgetData), _.toNumber);
      var helperIds = _.compact(_.concat([_.get(options, 'helper.id')], _.get(options, 'partial.helperIds', [])));
  
      if (!options.partial) {
        return;
      }
  
      // Replace widget data, including embedded widgets
      widgetIds.forEach(function(widgetId) {
        if (window.__widgetData && widgetData[widgetId]) {
          window.__widgetData[widgetId] = widgetData[widgetId];
        }
      });
  
      // Load new translations
      Fliplet.Locale.addTranslation(translation);
  
      // Load assets and append new assets if necessary
      var hasNewAssets = loadAssets(assets);
      var helperPromises = Promise.resolve();
  
      if (Fliplet.Helper) {
        // Initialize helpers before widgets
        helperPromises = helperIds.reduce(function(p, helperId) {
          return p.then(function() {
            return Fliplet.Helper.instance(helperId);
          });
        }, Promise.resolve());
      }
  
      // Initialize the widget instances
      if (options.isExisting || !hasNewAssets) {
        helperPromises
          .then(function() {
            // Give helpers a CPU cycle to render before initializing widgets
            setTimeout(function() {
              widgetIds.forEach(function(widgetId) {
                // Don't initialize widget if it's embedded in a widget that supports async rendering that is also in the list
                if (Object.keys(widgetData).some(id => widgetData[id].instances.indexOf(widgetId) > -1 && widgetData[id].asyncRendering)) {
                  return;
                }
  
                Fliplet.Widget.instance(widgetId);
              });
            }, 0);
          });
      }
  
      refreshCurrentComponentIds({
        nestedWidgetIds: widgetIds
      });
    }
  
    /**
     * Render a component instance
     * @param {Object} options - Map of options for the function
     * @param {String} [options.type] - Type of render
     * @param {String} [options.componentType=widget] - Type of component (widget or helper)
     * @param {Number} [options.id] - Widget ID
     * @param {Object} [options.helper] - Helper component object
     * @param {Boolean} [options.isExisting] - Flag if it currently exists on the page
     * @param {Object} options.partial - The component instance partial response
     * @returns {Promise} Promise object contains information of what's rendered
     */
    function renderComponentInstance(options) {
      options = options || {};
  
      var componentType = options.componentType;
      var componentSelector = COMPONENT_KEYS[componentType].selector;
      var componentIdAttr = COMPONENT_KEYS[componentType].idAttr;
      var id = _.get(options, componentType === 'helper' ? 'helper.id' : 'id');
      var $instance = $(componentSelector + '[' + componentIdAttr + '="' + id + '"]').filter(function() {
        // Exclude instances found in readonly rows from the list repeater
        return !$(this).parents('fl-list-repeater-row.readonly').length;
      });
      var fromParentWidget;
      var fromParentWidgetId;
      var fromParentView;
      var toParentWidget;
      var toParentWidgetId;
      var toParentView;
      var $html = $('<div>' + options.partial.html + '</div>');
  
      if (options.type === 'paste') {
        var $selectedElement;
  
        $instance = options.partial.wrapper
          ? $(options.partial.wrapper).html(options.partial.html)
          : $(options.partial.html);
  
        if (options.$target) {
          $selectedElement = options.$target;
        } else if (options.cloneId) {
          $selectedElement = $(componentSelector + '[data-clone-id="' + options.cloneId + '"]');
        } else {
          throw new Error('Unable to find target element for pasted component to replace');
        }
  
        $selectedElement.replaceWith($instance);
  
        // Replace helper content with widget partials
        if (componentType === 'helper') {
          options.partial.widgetInstancePartials.forEach(function(partial) {
            partial.type = 'paste';
            partial.$target = $('[' + WIDGET_CID_ATTR + '="' + partial.id + '"]');
            renderComponentInstance(partial);
          });
        }
      }
  
      if (!$instance.length) {
        return Promise.resolve();
      }
  
      // Replace widget html for real widgets
      if (options.type !== 'paste' && componentType === 'widget') {
        $instance.html($html.html());
      }
  
      if (options.type === 'moved') {
        var widgetSelector = COMPONENT_KEYS.widget.selector + COMPONENT_KEYS.widget.idSelector;
  
        if ($instance.parents(widgetSelector).length) {
          ({
            instance: fromParentWidget,
            instanceId: fromParentWidgetId,
            view: fromParentView
          } = getContainerInfo($instance));
        }
  
        var $insertionPoint = $dropArea.getDropMarker();
  
        // Check if direct parent is a nesting widget
        if ($insertionPoint.parents(widgetSelector).length) {
          ({
            instance: toParentWidget,
            instanceId: toParentWidgetId,
            view: toParentView
          } = getContainerInfo($insertionPoint));
        }
  
        $insertionPoint.after($instance);
  
        reloadComponentAssets({
          type: componentType,
          helper: options.helper,
          partial: options.partial,
          isExisting: options.isExisting
        });
  
        Fliplet.Hooks.run('componentEvent', {
          type: 'render',
          target: new ComponentNode($instance)
        });
  
        return Promise.resolve({
          $instance: $instance,
          fromParentWidget: fromParentWidget,
          fromParentWidgetId: fromParentWidgetId,
          fromParentView: fromParentView,
          toParentWidget: toParentWidget,
          toParentWidgetId: toParentWidgetId,
          toParentView: toParentView
        });
      }
  
      reloadComponentAssets({
        type: componentType,
        helper: options.helper,
        partial: options.partial,
        isExisting: options.isExisting
      });
  
      Fliplet.Hooks.run('componentEvent', {
        type: 'render',
        target: new ComponentNode($instance)
      });
  
      return Promise.resolve(options.type === 'paste'
        ? {
          element: $instance[0],
          widgetId: componentType === 'widget' ? id : undefined,
          helper: options.helper
        }
        : undefined
      );
    }
  
    /**
     * Get all the IDs of root widgets within a jQuery collection
     * @return {Array} List of component IDs
     */
    $.fn.getRootWidgetIds = function() {
      var widgetIds = this.find(WIDGET_CID_SELECTOR).map(function() {
        return $(this).attr(WIDGET_CID_ATTR);
      }).get();
      var parentWidgetSelectors = widgetIds.map(function cidToSelector(cid) {
        return '[' + WIDGET_CID_ATTR + '="' + cid + '"]';
      }).join(',');
  
      return _.filter(widgetIds, function widgetIdISRoot(cid) {
        // Include only helper or widget IDs that don't have any parents in the new ID list
        return $richLayoutWrapper.find('[' + WIDGET_CID_ATTR + '="' + cid + '"]')
          .parents(parentWidgetSelectors).length === 0;
      });
    };
  
    /**
     * Get all the IDs of widget and helper components from the page
     * @param {Object} options A map of options for the function
     * @param {Array} [options.nestedWidgetIds] - A list of widget IDs that are nested (and possibly not visible on the page)
     * @return {Array} List of component IDs
     */
    function getCurrentComponentIds(options) {
      options = options || {};
  
      var widgetSelector = WIDGET_INSTANCE_SELECTOR + WIDGET_INSTANCE_ID_SELECTOR;
  
      var widgetIds = $(widgetSelector)
        .filter(function() {
          var id = $(this).data(WIDGET_INSTANCE_ID_DATA);
          var cleanId = parseInt(id, 10);
  
          if (typeof cleanId === 'number' || !DragDrop.isComponentPlaceholderId(id)) {
            return true;
          }
  
          return false;
        })
        .map(function() {
          return $(this).data(WIDGET_INSTANCE_ID_DATA);
        })
        .get();
      var helperIds = $(HELPER_ID_SELECTOR).not(HELPER_WIDGET_ATTR).map(function() {
        return this.dataset.helperId;
      }).get();
  
      return _.compact(_.uniq(widgetIds.concat(helperIds).concat(options.nestedWidgetIds)));
    }
  
    /**
     * Refreshes the list of tracked component IDs
     * @param {Object} options - A map of options for the function
     * @param {Array} [options.nestedWidgetIds] - A list of widget IDs that are nested (and possibly not visible on the page)
     * @returns {undefined}
     */
    function refreshCurrentComponentIds(options) {
      options = options || {};
  
      var componentIds = getCurrentComponentIds({ nestedWidgetIds: options.nestedWidgetIds });
      var removedIds = _.difference(currentComponentIds, componentIds);
  
      currentComponentIds = componentIds;
  
      if (removedIds.length) {
        // Remove references of removed IDs
        _.forEach(removedIds, function(id) {
          if (typeof id === 'number') {
            delete window.__widgetData[id];
  
            return;
          }
  
          if (Fliplet.Helper) {
            var instance = Fliplet.Helper.findOne({ id: id });
  
            if (instance) {
              instance.remove();
            }
  
            return;
          }
        });
  
        componentDeleted({
          id: removedIds
        });
      }
    }
  
    /**
     * Gets the drag data
     * @param {Object} event - The drag event
     * @return {Promise} Promise object containing drag data
     */
    function getDragData(event) {
      if (event.data) {
        return Promise.resolve(event.data);
      }
  
      var dragData;
  
      try {
        dragData = event.dataTransfer.getData('text/plain');
      } catch (error) {
        // IE doesn't support text/plain
        dragData = event.dataTransfer.getData('text');
      }
  
      if (!dragData) {
        if (event.dataTransfer.types.constructor.name === 'DOMStringList'
          && event.dataTransfer.types.contains('Files')) {
          return Promise.reject('Drag and drop files are not supported');
        } else if (Array.isArray(event.dataTransfer.types)
          && event.dataTransfer.types.indexOf('Files') > -1) {
          return Promise.reject('Drag and drop files are not supported');
        }
  
        return Promise.reject('Drop event does not contain data');
      }
  
      try {
        dragData = JSON.parse(dragData);
      } catch (error) {
        return Promise.reject(error.message);
      }
  
      return Promise.resolve(dragData);
    }
  
    /**
     * Gets the widget instance partial
     * @param {Number} id Widget instance ID
     * @param {String} params URL query parameter for the request
     * @param {Object} [options] A map of options for the function
     * @param {Boolean} [options.skipHelpers=FALSE] If TRUE, skip the mapping of helper IDs from each partial
     * @return {Promise} Resolved with the partial response object
     */
    function getWidgetInstancePartial(id, params, options) {
      if (!id) {
        return Promise.reject('Invalid widget instance ID: ' + id);
      }
  
      options = options || {};
  
      return Fliplet.API.request({
        method: 'GET',
        url: 'v1/widget-instances/' + id + '/render-partial' + params
      }).then(function(response) {
        if (!options.skipHelpers) {
          // Add descendent helper IDs in partial for helper initialization
          response.helperIds = $('<div>' + response.html + '</div>')
            .find('[data-helper-id]')
            .map(function() {
              return this.dataset.helperId;
            })
            .get();
        }
  
        return {
          componentType: 'widget',
          id: id,
          partial: response
        };
      });
    }
  
    /**
     * Gets the helper instance partial, including the widget instance partials listed in widgetInstancePartials
     * @param {Number} id Helper instance ID
     * @param {String} params URL query parameter for the request
     * @return {Promise} Resolved with the partial response object
     */
    function getHelperInstancePartial(id, params) {
      var $helper = $richLayoutWrapper.find('[' + HELPER_ID_ATTR + '="' + id + '"]');
  
      if (!$helper.length) {
        return Promise.reject('Helper instance "' + id + '" not found');
      }
  
      var name = $helper.attr('name');
      var rootWidgetIds = $helper.getRootWidgetIds();
  
      // Get the widget instance partials for all the direct child widgets for rendering
      return Promise.all(_.map(rootWidgetIds, function(id) {
        return getWidgetInstancePartial(id, params, { skipHelpers: true });
      }))
        .then(function(widgetInstancePartials) {
          return {
            componentType: 'helper',
            helper: {
              name: name,
              id: id
            },
            partial: {
              html: $helper.get(0).outerHTML,
              widgetInstancePartials: widgetInstancePartials,
              // Ensures descendent helpers are initialized
              helperIds: $helper
                .find('[data-helper-id]')
                .map(function() {
                  return this.dataset.helperId;
                })
                .get()
            }
          };
        });
    }
  
    /**
     * Reloads a component instance by ID
     * @param {Object} options A map of options for the function
     * @param {Number} options.id Widget instance ID
     * @param {String} options.helperId Helper instance ID
     * @param {Boolean} options.isExisting Flag if it exists on the page
     * @return {Promise} Promise is resolved when the component instance is rendered
     */
    function reloadComponentInstance(options) {
      options = options || {};
  
      var params = options.includeWrapper ? '?includeWrapper&interact' : '?interact';
      var getComponentPartial;
  
      if (options.id) {
        // Reloading widget
        getComponentPartial = getWidgetInstancePartial(options.id, params);
      } else if (options.helperId) {
        // Reloading helper
        getComponentPartial = getHelperInstancePartial(options.helperId, params);
      }
  
      return getComponentPartial.then(function componentPartialReady(response) {
        options = _.assignIn({}, options, response);
  
        return renderComponentInstance(options);
      });
    }
  
    function createComponentInstance(options) {
      var createInstance;
  
      if (options.data.widgetId || options.data.package) {
        createInstance = Fliplet.API.request({
          method: 'POST',
          url: 'v1/widget-instances',
          data: options.data
        });
      } else if (options.data.helperName) {
        createInstance = Fliplet.Helper.createInstancePartial(options.data.helperName, { loadAssets: false });
      } else {
        // TODO Update UX to reflect what happens when this is encountered
        createInstance = Promise.reject('Unable to create component instance.');
      }
  
      var type = options.data.helperName ? 'helper' : 'widget';
  
      // Gather data before insertion point is removed
      var { instanceId: nestingWidgetId, view: nestingView } = getContainerInfo(options.$insertionPoint);
  
      Fliplet.Hooks.run('componentEvent', {
        type: 'adding',
        target: new ComponentNode(options.$insertionPoint, { view: nestingView })
      });
  
      return createInstance.then(function(response) {
        var $component = response.wrapper
          ? $(response.wrapper).html(response.partial.html)
          : $(response.partial.html);
        var widgetId;
        var widgetPackage;
        var helper;
  
        if (type === 'widget') {
          widgetId = response.widgetInstance.id;
          widgetPackage = $component.data('widget-package');
        } else if (type === 'helper') {
          helper = response.helper;
        }
  
        // Remove insertion point before rendering dropped component
        options.$insertionPoint.after($component).remove();
  
        var data = {
          componentType: type,
          partial: response.partial
        };
  
        if (type === 'widget') {
          data.id = widgetId;
        } else if (type === 'helper') {
          data.helper = helper;
        }
  
        renderComponentInstance(data).then(function() {
          // Do not open widget settings if:
          // - Shift key is being pressed
          if (options.opt.shiftKey) {
            return;
          }
  
          openWidgetSettings({
            widgetId: widgetId,
            helperId: helper && helper.id,
            widgetPackage: widgetPackage,
            element: DragDrop.constructHoveringObject($component),
            fromDrop: true
          });
        });
  
        // If there is a parent nesting widget
        // Save its settings
        if (nestingWidgetId) {
          saveWidgetRichContent({
            id: nestingWidgetId,
            views: [nestingView]
          });
        }
  
        DragDrop.setDroppingStatus(false);
  
        return removeDropPoint()
          .then(function() {
            var componentNode = new ComponentNode($component);
  
            Fliplet.Hooks.run('componentEvent', {
              type: 'added',
              target: componentNode.parent(),
              added: [componentNode]
            });
  
            savePageContent();
          });
      }).catch(function(err) {
        console.error(err);
  
        Fliplet.Hooks.run('componentEvent', {
          type: 'addFailed',
          target: new ComponentNode(options.$insertionPoint, { view: closestViewName })
        });
  
        DragDrop.setDroppingStatus(false);
        removeDropPoint()
          .then(function() {
            savePageContent();
          });
  
        Fliplet.Studio.emit('page-saved', {
          isError: true,
          error: err
        });
      });
    }
  
    /**
     * Handle a dropped widget instance
     * @param {Object} dragData - Instance data
     * @param {Object} opt - A map of options for the function
     * @returns {undefined}
     */
    function onDropInstance(dragData, opt) {
      opt = opt || {};
  
      var widgetId = parseInt(dragData.widgetId, 10);
      var widgetPackage = dragData.package;
      var helperId = dragData.helperId;
      var helperName = dragData.helperName;
  
      if (!widgetId && !widgetPackage && !helperId && !helperName) {
        return;
      }
  
      if (widgetPackage) {
        Fliplet.Studio.emit('track-event', {
          category: 'appComponent',
          action: 'drop_component',
          label: widgetPackage
        });
      } else if (helperName) {
        Fliplet.Studio.emit('track-event', {
          category: 'appComponent',
          action: 'drop_helper',
          label: helperName
        });
      }
  
      var settings = dragData.settings || {};
      var $insertionPoint = $dropArea.getDropMarkers();
  
      if (!$insertionPoint.length) {
        $insertionPoint = $('[data-placeholder-id="' + dragData.placeholderId + '"]');
      }
  
      if (dragData.build) {
        var $widget = $(dragData.build);
  
        $insertionPoint.after($widget).remove();
  
        removeDropPoint()
          .then(function() {
            savePageContent();
          });
  
        return;
      }
  
      // Moving an existing instance in app preview
      if (widgetId && $('.fl-widget-instance[data-id="' + widgetId + '"]').length
        || helperId && $('fl-helper[data-helper-id="' + helperId + '"]').length) {
        reloadComponentInstance({
          id: widgetId,
          helperId: helperId,
          isExisting: true,
          type: 'moved'
        })
          .then(function(response) {
            DragDrop.setDroppingStatus(false);
  
            var componentNodeMoved = new ComponentNode(response.$instance);
            var sameParent = response.fromParentWidget === response.toParentWidget && response.fromParentView === response.toParentView;
  
            Fliplet.Hooks.run('componentEvent', {
              type: 'moved',
              source: new ComponentNode(response.fromParentWidget, { view: response.fromParentView }),
              target: componentNodeMoved.parent(),
              added: sameParent ? [] : [componentNodeMoved],
              removed: sameParent ? [] : [componentNodeMoved]
            });
  
            removeDropPoint()
              .then(function() {
                return moveWidgetRichContents(response);
              })
              .then(function() {
                return savePageContent();
              })
              .catch(function(error) {
                Fliplet.Studio.emit('page-saved', {
                  isError: true,
                  error: error
                });
              });
          });
  
        return;
      }
  
      var data = {
        pageId: currentPageId,
        settings: settings
      };
  
      if (widgetId) {
        data.widgetId = widgetId;
      }
  
      if (widgetPackage) {
        data.package = widgetPackage;
      }
  
      if (helperId) {
        data.helperId = helperId;
      }
  
      if (helperName) {
        data.helperName = helperName;
      }
  
      createComponentInstance({
        data: data,
        opt: opt,
        $insertionPoint: $insertionPoint
      });
    }
  
    /**
     * Handle drop event
     * @param {Object} event - Drop event
     * @param {Object} opt - A map of options for the function
     * @returns {undefined}
     */
    function onDrop(event, opt) {
      opt = opt || {};
  
      var $target = $(event.target);
  
      $target.parents().each(function() {
        var editable = this;
  
        if ((editable.hasAttribute('data-fl-widget-instance')
            || !$(editable).hasDropMarkers())
          && (event.data
            && !event.data.hasOwnProperty('package'))) {
          DragDrop.setDroppingStatus(false);
  
          return;
        }
  
        getDragData(event)
          .then(function(dragData) {
            if (!dragData.widgetId && !dragData.package && !dragData.helperId && !dragData.helperName) {
              DragDrop.setDroppingStatus(false);
  
              return;
            }
  
            onDropInstance(dragData, opt);
          })
          .catch(function(error) {
            console.error(error);
  
            Fliplet.Studio.emit('page-saved', {
              isError: true,
              error: error
            });
          });
  
        return false;
      });
    }
  
    /**
     * Removes inline styles
     * @returns {undefined}
     */
    function removeInlineStyles() {
      if (startedSavingStyles || applyingStyles) {
        return;
      }
  
      // Remove styles from widget selectors
      widgetSelectors.forEach(function(selector) {
        selector.removeAttribute('style');
      });
      // Clear the array
      widgetSelectors.splice(0, widgetSelectors.length);
    }
  
    /**
     * Scrolls window
     * @param {Node} node - Node element to scroll to
     * @returns {undefined}
     */
    function scrollWindow(node) {
      if (!node) {
        return;
      }
  
      var rect = node.getBoundingClientRect();
      var windowWidth = window.innerWidth;
      var windowHeight = window.innerHeight;
      var elWidth = rect.width;
      var elHeight = rect.height;
      var elYOffset = rect.top;
      var elXOffset = rect.left;
      var offsetY = 0;
      var offsetX = 0;
  
      // Determine vertical scroll
      if (elHeight < windowHeight) {
        offsetY = (elYOffset + window.pageYOffset) - ((windowHeight / 2) - (elHeight / 2));
      } else {
        offsetY = elYOffset + window.pageYOffset;
      }
  
      // Determine horizontal scroll
      if (elWidth + elXOffset > windowWidth) {
        offsetX = (elXOffset + window.pageXOffset) - ((windowWidth / 2) - elWidth);
      } else {
        offsetX = elXOffset + window.pageXOffset;
      }
  
      $('html, body').stop().animate({
        scrollTop: offsetY,
        scrollLeft: offsetX
      }, {
        duration: 200,
        step: function() {
          debouncedHoverElement(node);
        },
        complete: function() {
          debouncedHoverElement(node);
        }
      });
    }
  
    /**
     * Get an element from a browser event target element for other D&D interactions
     * @param {Node} target Node element
     * @param {Object} options A map of options for the function
     * @param {Boolean} options.setHover If true, set the current hover element
     * @param {Boolean} options.setCurrent If true, set the current selected element
     * @return {jQuery} jQuery object for the element used for other D&D interactions
     */
    function getElement(target, options) {
      // The function will return an element
      // Except an HTML element inside a widget
      options = options || {};
  
      var $element = $(target).eq(0);
  
      // If the element is within a widget with managed view, return the widget
      if ($element.parents('[data-managed-views]').length && (!$element.is('[data-fl-widget-instance]') || isDragging)) {
        return $element.parents('[data-managed-views]');
      }
  
      var selectors = [
        DragDrop.getDraggableInstanceSelector(),
        '[data-node-group]'
      ];
  
      // If the user is dragging an element, treat view containers as a structural node
      if (isDragging) {
        selectors.push('[data-view]');
      }
  
      // Descendent nodes of any node with data-node-group are treated as a group
      var $parentComponent = $element.parents(selectors.join(',')).eq(0);
      var hasParentComponent = !!$parentComponent.length;
      var parentIsViewContainer = !!$parentComponent.data('view');
      var parentIsHelper = $parentComponent.isHelper();
      // Skip to the helper if it's a view container or the next selectable parent is the helper component
      var skipToHelper = parentIsHelper
        && ($element.is('[data-view]') || $element.parents('[data-view], ' + HELPER_TAGNAME).eq(0).is(HELPER_TAGNAME));
  
      // Update current hover element
      if (options.setHover) {
        // Check if parent is a widget or helper widget
        // This will prevent HTML elements inside widget from being highlighted/selected
        if (hasParentComponent
          && !$element.is('[data-fl-widget-instance]')
          && !$element.isHelper()
          && !$element.is('[data-view-placeholder]')
          && (!parentIsViewContainer && !parentIsHelper || skipToHelper)) {
          $element = $parentComponent;
        }
  
        $currentHoveringElement = $element;
      }
  
      // Update current selected element
      if (options.setCurrent) {
        if ($element.length > 1) {
          // Get the nesting widget
          $element = $element.filter('[data-has-views]');
        }
  
        // Traverse up the DOM tree until it finds a suitable element for selection
        if (hasParentComponent
          && !$element.is('[data-view-placeholder]')
          && !$element.is('[data-fl-widget-instance]')
          && !$element.isHelper()
          && (!$element.isView() || !isDragging)
          && (!parentIsViewContainer && !parentIsHelper || skipToHelper)) {
          return getElement($parentComponent.get(0), options);
        }
  
        $currentElement = $element;
      }
  
      return $element;
    }
  
    /**
     * Reset element flags
     * @returns {undefined}
     */
    function resetElements() {
      $currentHoveringElement = undefined;
      $currentElement = undefined;
    }
  
    /**
     * Prepare element data to be sent to the drag and drop library
     * @param {jQuery} $hoveringElement - Element that is hovered
     * @returns {undefined}
     */
    function orchestrateDragDrop($hoveringElement) {
      if (_.isEmpty($hoveringElement)) {
        return;
      }
  
      var elementPosition = $hoveringElement[0].getBoundingClientRect();
      var mousePosition = {
        x: elementPosition.left,
        y: elementPosition.top
      };
  
      DragDrop.orchestrateDragDrop({
        element: $hoveringElement,
        elemRect: elementPosition,
        mousePos: mousePosition,
        toHighlight: true,
        toHideLine: true,
        isInlineWidget: widgetIsInline
      });
    }
  
    /**
     * Function to scroll 'window' vertically and horizontally
     * @param {Number} stepY - How much is the window scrolled vertically
     * @param {Number} stepX - How much is the window scrolled horizontally
     * @returns {undefined}
     */
    function scroll(stepY, stepX) {
      var scrollY = $window.scrollTop();
      var scrollX = $window.scrollLeft();
      var yLimit = document.body.scrollHeight - window.innerHeight;
      var XLimit = document.body.scrollWidth - window.innerWidth;
  
      if (stepY > 0 && scrollY >= yLimit
        || stepY < 0 && scrollY <= 0
        || stepX > 0 && scrollX >= XLimit
        || stepX < 0 && scrollX <= 0
        || stopScrolling) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
  
        return;
      }
  
      $window.scrollTop(scrollY + stepY);
      $window.scrollLeft(scrollX + stepX);
  
      if (!stopScrolling) {
        scrollTimeout = setTimeout(function() {
          scroll(stepY, stepX);
        }, scrollSpeed);
      }
    }
  
    function handleScroll(event) {
      stopScrolling = true;
  
      // Auto-scroll Vertically
      if (event.clientY < 100) {
        stopScrolling = false;
        scroll(-1, 0);
      }
  
      if (event.clientY > ($window.height() - 100)) {
        stopScrolling = false;
        scroll(1, 0);
      }
  
      // Auto-scroll Horizontally
      if (event.clientX < 50) {
        stopScrolling = false;
        scroll(0, -1);
      }
  
      if (event.clientX > ($window.width() - 50)) {
        stopScrolling = false;
        scroll(0, 1);
      }
    }
  
    /**
     * Removes drop point UI
     * @returns {undefined}
     */
    function removeDropPoint() {
      // Clear timeout
      if (removeDropPointInterval) {
        clearTimeout(removeDropPointInterval);
        removeDropPointInterval = null;
      }
  
      if (!removeDropPointPromise) {
        removeDropPointPromise = new Promise(function(resolve) {
          resolveRemoveDropPoint = resolve;
        });
      }
  
      // Check to make sure the user is not hovering an element
      // Timeout to prevent 'Max call stack'
      if (DragDrop.isHovering() || DragDrop.isDropping()) {
        removeDropPointInterval = setTimeout(function() {
          removeDropPoint();
        }, 100);
  
        return removeDropPointPromise;
      }
  
      toggleHighlight({
        showHighlight: false
      });
  
      DragDrop.setDroppingStatus(false);
      DragDrop.removeDropMarker(true);
  
      resolveRemoveDropPoint();
  
      var promise = removeDropPointPromise;
  
      removeDropPointPromise = undefined;
  
      return promise;
    }
  
    function onKeyPressed(event) {
      var eventData = {
        key: event.key,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        keyCode: event.keyCode
      };
  
      Fliplet.Studio.emit('interact-key-pressed', eventData);
    }
  
    function onKeyReleased(event) {
      // If there isn't a key code
      if (!event.keyCode) {
        return;
      }
  
      // If there isn't an active widget ignore the rest
      if (!$currentElement || !$currentElement.length) {
        return;
      }
  
      var widgetId = $currentElement.data(WIDGET_INSTANCE_ID_DATA);
      var helperId = $currentElement.attr(HELPER_ID_ATTR);
      var widgetPackage = $currentElement.data('widget-package');
  
      var textElements = document.querySelectorAll('[data-widget-package="com.fliplet.text"]');
      var hasFocusedChild = false;
  
      textElements.forEach(function(textElement) {
        var childElements = Array.from(textElement.children);
  
        if (childElements.some(child => child.classList.contains('focus-visible'))) {
          hasFocusedChild = true;
        }
      });
  
      // Ignore if the widget is a text component
      if (widgetPackage === 'com.fliplet.text' || (!widgetId && !helperId) || hasFocusedChild ) {
        return;
      }
  
      // If key pressed is Delete or Backspace
      if (event.keyCode === 8 || event.keyCode === 46) {
        deleteComponentFromPage(
          widgetId
            ? { id: widgetId, remove: true }
            : { helperId: helperId, remove: true }
        );
      }
    }
  
    function getDomDataMap(data) {
      var fromData = DragDrop.getElementFromPath({
        path: data.from
      });
      var toData = DragDrop.getElementFromPath({
        path: data.to,
        fromElement: fromData.element
      });
  
      return {
        from: fromData,
        to: toData
      };
    }
  
    function moveElements(elements) {
      // Stop if elements are not found
      if (_.isEmpty(elements.from) || _.isEmpty(elements.to)) {
        return;
      }
  
      if (elements.to.isOnlyChild) {
        // Move the element
        // If container has no child and element will become it's only child
        elements.to.element.appendChild(elements.from.element);
      } else if (elements.from.parent === elements.to.parent
        && elements.from.path < elements.to.path) {
        // If moving in the same container to a higher (higher index) position
        // If .nextSibling is undefined, it will add at the end
        // This is vanilla JS for ".insertAfter()"
        elements.to.parentNode.insertBefore(elements.from.element, elements.to.element.nextSibling);
      } else {
        elements.to.parentNode.insertBefore(elements.from.element, elements.to.element);
      }
    }
  
    var debouncedPageScroll = _.debounce(function() {
      Fliplet.Studio.emit('on-page-scroll');
    }, 16, {
      leading: true
    });
  
    /**
     * On scroll handler
     * @returns {undefined}
     */
    function onScroll() {
      if (!$currentHoveringElement || !$currentHoveringElement.length) {
        return;
      }
  
      debouncedHoverElement($currentHoveringElement[0]);
      debouncedPageScroll();
    }
  
    /**
     * After CSS file is loaded
     * @returns {undefined}
     */
    function onCSSLoaded() {
      // Instruct Studio frame to update iPhone X status bar color
      Fliplet.Page.updateStatusBarBgColor();
  
      // Remove inline styles added by Appearance settings
      removeInlineStyles();
  
      // Runs hook that can be used by components when appearance file is changed
      Fliplet.Hooks.run('appearanceFileChanged');
  
      // Event to calculate size of selected widget
      Fliplet.Studio.emit('get-highlight-size');
    }
  
    /**
     * replace CSS link tag with new URL
     * @param {Object} data - Data containing assets to be loaded
     * @param {Array} data.assets - List of assets to be loaded
     * @returns {Promise} Resolved when assets are loaded
     */
    function reloadCSS(data) {
      data = data || {};
  
      if (!data.assets || !data.assets.length) {
        return Promise.resolve();
      }
  
      var pathPattern = new RegExp('/apps\/[0-9]+\/themes\/');
      var $cssLinks = $('link[href]').filter(function() {
        return pathPattern.test($(this).attr('href'));
      });
  
      return Promise.all(_.map(data.assets, function(asset) {
        if (!asset.url) {
          return Promise.resolve();
        }
  
        return new Promise(function(resolve) {
          var newLink = document.createElement('link');
  
          newLink.rel  = 'stylesheet';
          newLink.href = asset.url;
  
          if (asset.mediaQuery) {
            newLink.media = asset.mediaQuery;
          }
  
          newLink.onload = resolve;
          // Adds new CSS link tag
          document.head.appendChild(newLink);
        });
      })).then(function() {
        $cssLinks.remove();
      });
    }
  
    /**
    * Save rich layout content
    * @param {Object} options - A map of options for the function
    * @returns {Promise} Save request
    */
    function saveRichLayout(options) {
      options = options || {};
      options.appId = options.appId || currentAppId;
      options.pageId = options.pageId || currentPageId;
      options.updatedRichLayout = options.updatedRichLayout || '';
  
      return Fliplet.API.request({
        method: 'PUT',
        url: 'v1/apps/' + options.appId + '/pages/' + options.pageId + '/rich-layout?async',
        data: {
          richLayout: options.updatedRichLayout
        }
      });
    }
  
    /**
    * Hide the component from the page on Cut
    * @param {Object} data - data for the component cutting
    * @param {Number} data.originalComponentId - Componet ID of original component
    * @param {String} data.componentType - Type of component
    * @returns {undefined}
    */
    function cutComponent(data) {
      data = data || {};
  
      // Check if a component ID exists
      if (!data.originalComponentId) {
        return;
      }
  
      // Close widget settings
      Fliplet.Studio.emit('widget-cancel', {
        skipReload: true
      });
  
      // Get the widget from the DOM
      var type = data.componentType;
      var $widget = $dropArea.find(COMPONENT_KEYS[type].selector + '[' + COMPONENT_KEYS[type].idAttr + '="' + data.originalComponentId + '"]');
      var componentNode = new ComponentNode($widget)
  
      // Hide it
      $widget.addClass('fl-cut-hidden');
  
      Fliplet.Hooks.run('componentEvent', {
        type: 'cut',
        target: componentNode.parent(),
        removed: [componentNode]
      });
  
      // Show Studio toast
      Fliplet.Studio.emit('show-edit-toast', {
        type: 'success',
        description: 'Component cut'
      });
    }
  
    /**
    * Gets data for pasting content
    * @param {Object} options - A map of options for the function
    * @returns {Object} Data for pasting
    */
    function getPasteData(options) {
      options = options || {};
  
      var componentType = options.componentType;
  
      if (!componentType || !COMPONENT_KEYS[componentType]) {
        return;
      }
  
      var componentSelector = COMPONENT_KEYS[componentType].selector;
      var componentIdAttr = COMPONENT_KEYS[componentType].idAttr;
      var componentCidAttr = COMPONENT_KEYS[componentType].cidAttr;
      var componentCidSelector = COMPONENT_KEYS[componentType].cidSelector;
  
      // Check if the original component is still on the page
      var componentId = options.originalComponentId;
      var originalComponentFound = !!$dropArea.find(componentSelector + '[' + componentIdAttr + '="' + componentId + '"]').length;
  
      // Get the rich layout component and DOM placeholder HTML
      var componentToPaste = options.component;
      var placeholderToPaste = options.placeholder;
      var $componentToPasteWrapper = $('<div>' + componentToPaste + '</div>');
      var $placeholderToPasteWrapper = $('<div>' + placeholderToPaste + '</div>');
  
      // Check how many widget exist on the DOM with the same ID
      var placeholderClonesCount = $dropArea.find([
        componentSelector + '[' + componentIdAttr + '="' + componentId + '"]',
        componentSelector + '[' + componentIdAttr + '^="' + componentId + '-placeholder-"]'
      ].join(',')).length;
  
      // Get the widget package of the selected component
      var selectedComponentId = options.selectedComponentId;
      var selectedComponentType = _.isString(selectedComponentId) ? 'helper' : 'widget';
      var selectedComponentSelector = COMPONENT_KEYS[selectedComponentType].selector + '[' + COMPONENT_KEYS[selectedComponentType].idAttr + '="' + selectedComponentId + '"]';
      var $selectedComponent = $dropArea.find(selectedComponentSelector);
  
      // Add placeholder IDs to component and placeholder HTML
      var placeholderId = componentId + '-placeholder-' + placeholderClonesCount;
      // Use a random alphabet-only string for the clone ID
      var cloneId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);
  
      $componentToPasteWrapper
        .find(componentCidSelector + '[' + componentCidAttr + '="' + componentId + '"]')
        .attr('data-clone-id', cloneId);
      $placeholderToPasteWrapper
        .find(componentSelector + '[' + componentIdAttr + '="' + componentId + '"]')
        .attr(componentIdAttr, placeholderId)
        .attr('data-clone-id', cloneId);
  
      return {
        type: options.type,
        selectedComponentId: selectedComponentId,
        selectedWidgetPackage: $selectedComponent.data(WIDGET_PACKAGE_DATA),
        hasSelectedComponent: !!$selectedComponent.length,
        originalComponentId: componentId,
        originalComponentFound: originalComponentFound,
        componentToPaste: $componentToPasteWrapper.html(),
        placeholderToPaste: $placeholderToPasteWrapper.html(),
        placeholderId: placeholderId,
        componentType: componentType
      };
    }
  
    function markOriginalAsOld(data) {
      data = data || {};
  
      var type = typeof data.originalComponentId === 'string' ? 'helper' : 'widget';
      var cid = data.originalComponentId + '-old';
  
      $richLayoutWrapper
        .find('[' + COMPONENT_KEYS[type].cidAttr + '="' + data.originalComponentId + '"]')
        .attr(COMPONENT_KEYS[type].cidAttr, cid);
    }
  
    /**
     * Handle the component placement
     * @param {Object} data Paste data as created by getPasteData()
     * @return {jQuery} Placeholder element
     */
    function placePastedComponent(data) {
      data = data || {};
  
      var componentType;
  
      if (data.hasSelectedComponent) {
        componentType = _.isString(data.selectedComponentId) ? 'helper' : 'widget';
      } else {
        componentType = data.componentType;
      }
  
      var componentSelector = COMPONENT_KEYS[componentType].selector;
      var componentIdAttr = COMPONENT_KEYS[componentType].idAttr;
      var componentCidAttr = COMPONENT_KEYS[componentType].cidAttr;
      var $placeholder = $(data.placeholderToPaste);
  
      // If the type is Cut
      if (data.type === 'cut') {
        markOriginalAsOld(data);
      }
  
      switch (data.position) {
        case 'inside':
          // NOTE: We're not considering how content can be "prepended" to helpers
          // because only Container components will allow components be placed inside
  
          // Insert component in rich layout content after the selected component
          $richLayoutWrapper
            .find('[' + componentCidAttr + '="' + data.selectedComponentId + '"]')
            .prepend(data.componentToPaste);
  
          // Insert copy/placeholder component in DOM after the selected component
          $dropArea
            .find(componentSelector + '[' + componentIdAttr + '="' + data.selectedComponentId + '"]').eq(0)
            .prepend($placeholder);
  
          break;
        case 'after':
          // Insert component in rich layout content after the selected component
          $richLayoutWrapper
            .find('[' + componentCidAttr + '="' + data.selectedComponentId + '"]')
            .after(data.componentToPaste);
  
          // Insert copy/placeholder component in DOM after the selected component
          $dropArea
            .find(componentSelector + '[' + componentIdAttr + '="' + data.selectedComponentId + '"]').eq(0)
            .after($placeholder);
  
          break;
        case 'after-original':
          // Insert component in rich layout content after the original component
          $richLayoutWrapper
            .find([
              '[' + componentCidAttr + '="' + data.originalComponentId + '"]',
              '[' + componentCidAttr + '="' + data.originalComponentId + '-old"]'
            ].join(','))
            .after(data.componentToPaste);
  
          // Insert copy/placeholder in DOM after the original component
          $dropArea
            .find(componentSelector + '[' + componentIdAttr + '="' + data.originalComponentId + '"]').eq(0)
            .after($placeholder);
  
          break;
        case 'bottom':
          // Insert component in rich layout content at the end of the content
          $richLayoutWrapper.append(data.componentToPaste);
  
          // Insert copy/placeholder component in DOM at the end of the content
          $dropArea.append($placeholder);
  
          break;
        default:
          break;
      }
  
      return $placeholder;
    }
  
    /**
    * Insert component from the clipboard
    * @param {Object} options - A map of options for the function
    * @returns {Object} Data of what's pasted
    */
    function pasteComponent(options) {
      options = options || {};
  
      // Get the necessary data
      var type = options.type;
      var pasteData = getPasteData(options);
  
      if (!pasteData) {
        return;
      }
  
      // Check where to paste
      if (options.position === 'inside-selected') {
        // Paste inside the selected component at the top
        pasteData.position = 'inside';
      } else if (pasteData.hasSelectedComponent || options.position === 'after-selected') {
        // If there is selected element, paste after it
        pasteData.position = 'after';
      } else if (type === 'cut' && pasteData.originalComponentFound || options.position === 'after-original') {
        // If it is a Cut-and-Paste and the cut component is still present,
        // paste after the original (giving the idea of pasting where it was before)
        pasteData.position = 'after-original';
      } else {
        // If no component is selected,
        // paste at the bottom of the page
        pasteData.position = 'bottom';
      }
  
      // Handle the component placement
      var $placeholder = placePastedComponent(pasteData);
  
      // Wait for placeholder to render
      setTimeout(function() {
        // Select/highlight the pasted component
        selectedWidget({
          element: DragDrop.constructHoveringObject($placeholder),
          fromStructure: true,
          toSelect: true,
          isPlaceholder: true,
          elementId: pasteData.placeholderId,
          scrollToElement: true
        });
      }, 50);
  
      return {
        placeholderId: pasteData.placeholderId
      };
    }
  
    /**
     * Render pasted components
     * @param {Object} options A map of options for the function
     * @return {Promise} Promise is resolved when all new component instances are rendered
     */
    function renderPastedComponents(options) {
      options = options || {};
  
      var originalComponentId = options.originalComponentId;
      var componentType = options.componentType;
      var componentSelector = COMPONENT_KEYS[componentType].selector;
      var componentIdAttr = COMPONENT_KEYS[componentType].idAttr;
      var $originalComponent = $dropArea.find(componentSelector + '[' + componentIdAttr + '="' + originalComponentId + '"]');
      var clonedInstances = options.clonedInstances;
  
      // Reload and render all the pasted widget instances
      var reloadWidgetPromises = _.values(_.mapValues(clonedInstances, function(componentId, cloneId) {
        var newComponentType = typeof componentId === 'string' ? 'helper' : 'widget';
        var reloadOptions = {
          originalComponentId: originalComponentId,
          includeWrapper: true,
          type: 'paste',
          originalIsNestingWidget: $originalComponent.hasViews(),
          componentType: newComponentType,
          cloneId: cloneId
        };
  
        if (newComponentType === 'helper') {
          reloadOptions.helperId = componentId;
        } else {
          reloadOptions.id = componentId;
        }
  
        return reloadComponentInstance(reloadOptions);
      }));
  
      return Promise.all(reloadWidgetPromises);
    }
  
    /**
    * Processing paste a component
    * @param {Object} options - A map of options for the function
    * @returns {jQuery} jQuery container with rich layout content
    */
    function removeCutComponent(options) {
      options = options || {};
  
      var $richLayout = options.$richLayout || $richLayoutWrapper;
      var type = _.isString(options.originalComponentId) ? 'helper' : 'widget';
      var cid = options.sameScreen
        ? options.originalComponentId + '-old'
        : options.originalComponentId;
  
      // To skip
      if (options.skip) {
        return $richLayout;
      }
  
      $richLayout
        .find('[' + COMPONENT_KEYS[type].cidAttr + '="' + cid + '"]')
        .eq(0)
        .remove();
  
      // If the component was pasted on the same screen that it was Cut from
      // Remove from the DOM
      if (options.sameScreen) {
        $dropArea
          .find(COMPONENT_KEYS[type].selector + '[' + COMPONENT_KEYS[type].idAttr + '="' + options.originalComponentId + '"]')
          .eq(0)
          .remove();
      }
  
      return $richLayout;
    }
  
    /**
    * Process and save the rich layout content
    * @param {Object} options - A map of options for the function
    * @returns {undefined}
    */
    function processRichLayout(options) {
      var cutData = _.find(pastingHistory, function(option) {
        return option.type === 'cut';
      });
      var clonedInstances;
  
      // The original Cut component needs to be removed from the DOM
      if (cutData) {
        $richLayoutWrapper = removeCutComponent({
          skip: cutData.pageId !== currentPageId,
          originalComponentId: cutData.originalComponentId,
          sameScreen: cutData.pageId === currentPageId
        });
      }
  
      // Open Screen Structure
      Fliplet.Studio.emit('open-screen-structure');
  
      // Saves rich layout content
      // This clones widget and helper instances with new IDs
      saveRichLayout({
        updatedRichLayout: $richLayoutWrapper.html()
      })
        .then(function(response) {
          clonedInstances = response.clonedInstances;
  
          // Update rich layout variables
          $richLayoutWrapper = DragDrop.getLayoutWrapper({
            data: response,
            richLayout: true
          });
  
          var $layoutWrapper = DragDrop.getLayoutWrapper({
            data: response
          });
  
          if ($layoutWrapper.html()) {
            $pageLayout = $layoutWrapper;
          }
  
          // If component was not cut, skip
          if (!cutData) {
            return;
          }
  
          // If there is a Cut
          // Get the rich layout content of the page where the component was originally from
          return DragDrop.getRichLayout({
            pageId: cutData.pageId
          });
        })
        .then(function handleCutData(response) {
          // If no 'response', means there was no Cut made
          // Or Paste made on same screen
          if (!response) {
            return;
          }
  
          // Remove the cut component from original page
          response = response || {};
  
          var page = response.page;
          var otherScreenRichLayout = typeof page.richLayout !== 'undefined'
            ? page.richLayout
            : page.layout;
          var $otherScreenRichLayoutWrapper = $('<div>' + otherScreenRichLayout + '</div>');
  
          // The original Cut component needs to be removed from the DOM
          $otherScreenRichLayoutWrapper = removeCutComponent({
            $richLayout: $otherScreenRichLayoutWrapper,
            skip: cutData.pageId === currentPageId,
            originalComponentId: cutData.originalComponentId,
            sameScreen: cutData.pageId === currentPageId
          });
  
          // Save the modified rich content layout
          return saveRichLayout({
            updatedRichLayout: $otherScreenRichLayoutWrapper.html(),
            pageId: cutData.pageId
          });
        })
        .then(function() {
          return renderPastedComponents({
            originalComponentId: options.originalComponentId,
            isFromCut: !!cutData,
            sameScreen: options.pageId === currentPageId,
            componentType: options.componentType,
            clonedInstances: clonedInstances,
            placeholderId: options.placeholderId
          });
        })
        .then(function(pastedElements) {
          pastedElements = pastedElements || [];
  
          if (pastedElements.length) {
            var added = _.map(pastedElements, function(pastedElement) {
              return new ComponentNode(pastedElement.element);
            });
  
            Fliplet.Hooks.run('componentEvent', {
              type: 'pasted',
              target: added[0].parent(),
              added: added
            });
          }
  
          // Order to keep the latest widget id at the end
          _.sortBy(pastedElements, ['widgetId']);
  
          var data = pastedElements[pastedElements.length - 1];
  
          // Send instruction to update the Screen Structure
          Fliplet.Studio.emit('update-dom');
  
          // setTimeout to make sure the previous command reaches Studio first
          setTimeout(function() {
            // Select the last pasted component
            selectedWidget({
              element: DragDrop.constructHoveringObject(data.element),
              fromStructure: true,
              toSelect: true,
              elementId: data.widgetId,
              scrollToElement: true
            });
          }, 10);
  
          // Clear pasting history
          pastingHistory.splice(0, pastingHistory.length);
  
          Fliplet.Studio.emit('page-saved');
        })
        .catch(function(error) {
          Fliplet.Studio.emit('show-edit-toast', {
            type: 'danger',
            title: 'Unable to paste component',
            description: error
          });
  
          Fliplet.Hooks.run('componentEvent', {
            type: 'pasteFailed'
          });
  
          Fliplet.Studio.emit('page-saved', {
            isError: true,
            error: error
          });
        });
    }
  
    /**
    * Processing paste a component
    * @param {Object} pasteData - Data for pasting
    * @returns {undefined}
    */
    function startPastingProcess(pasteData) {
      // Allow one paste at a time to avoid unpredicted content changes
      if (pastingHistory.length) {
        Fliplet.Studio.emit('show-edit-toast', {
          type: 'danger',
          description: 'Content saving in progress. Please wait and try again later.'
        });
  
        return;
      }
  
      // Get the type: copy or cut
      var type = pasteData.type;
  
      // Add pasting data to history
      // Used for several paste command at a time
      pastingHistory.push(_.clone(pasteData));
  
      // Paste the component and save the placeholder ID
      var pasteResult = pasteComponent(pasteData);
  
      if (!pasteResult) {
        return;
      }
  
      // Save placeholder and clone IDs for processing in renderPastedComponents()
      pasteData.placeholderId = pasteResult.placeholderId;
  
      var placeholderNode = new ComponentNode($(`[data-fl-widget-instance][data-id="${pasteData.placeholderId}"]`));
  
      Fliplet.Hooks.run('componentEvent', {
        type: 'pasting',
        target: placeholderNode.parent(),
        added: [placeholderNode]
      });
  
      // If the type is Cut
      if (type === 'cut') {
        // Change type to 'copy' after a successful paste of a cut
        // This is for when multiple pastes of a cut component happen in succession
        pasteData.type = 'copy';
  
        // Update the clipboard data
        Fliplet.Studio.emit('set-clipboard', pasteData);
      }
  
      Fliplet.Studio.emit('page-saving');
  
      // Save rich layout content
      processRichLayout(pasteData);
    }
  
    function getComponentElementId(el) {
      if (!el || !el.dataset) {
        return;
      }
  
      if (el.classList.contains('fl-widget-instance')) {
        return parseInt(el.getAttribute(WIDGET_INSTANCE_ID_ATTR), 10);
      }
  
      if (el.dataset.helperId) {
        return el.dataset.helperId;
      }
    }
  
    function addTemporarySpacer($elements) {
      $elements.each(function() {
        // Get the padding top and bottom of the element
        var paddingTop = parseInt($(this).css('padding-top'), 10);
        var paddingBottom = parseInt($(this).css('padding-bottom'), 10);
  
        // Add a temporary padding top and/or bottom if padding is less than 10px
        if (paddingTop < 10) {
          $(this).addClass('fl-dd-spacer-top');
        }
  
        if (paddingBottom < 10) {
          $(this).addClass('fl-dd-spacer-bottom');
        }
      });
    }
  
    function removeTemporarySpacer($elements) {
      $elements.removeClass('fl-dd-spacer-top fl-dd-spacer-bottom');
    }
  
    /**
    * Studio events handler
    * @returns {undefined}
    */
    function attachGlobalHandlers() {
      // Studio events
      Fliplet.Studio.onEvent(function(event) {
        var eventDetail = event.detail || {};
        var elementData;
        var clipboardData;
        var id;
  
        switch (eventDetail.type) {
          case 'scrollTo':
            $currentHoveringElement = $(eventDetail.node);
            scrollWindow(eventDetail.node);
            break;
          case 'window.mouseleave':
            if (isDragging) {
              return;
            }
  
            DragDrop.stopQueueProcessing();
            break;
          case 'dragstart':
            addTemporarySpacer($('[data-view]'));
            addTemporarySpacer($(DROP_AREA_SELECTOR));
  
            isDragging = true;
            widgetIsInline = !!eventDetail.isInline;
            DragDrop.startQueueProcessing();
            break;
          case 'dragleave':
            removeTemporarySpacer($('[data-view]'));
            removeTemporarySpacer($(DROP_AREA_SELECTOR));
  
            if (isDragging) {
              return;
            }
  
            removeDropPoint();
            break;
          case 'dragend':
            removeTemporarySpacer($('[data-view]'));
            removeTemporarySpacer($(DROP_AREA_SELECTOR));
  
            DragDrop.stopQueueProcessing();
            DragDrop.setDraggingElement();
            isDragging = false;
            break;
          case 'widgetPlaced':
            removeTemporarySpacer($('[data-view]'));
            removeTemporarySpacer($(DROP_AREA_SELECTOR));
  
            var ev = {
              target: eventDetail.target,
              data: eventDetail.data
            };
  
            onDrop(ev);
            break;
          case 'deleteWidgetInstance':
            if (!eventDetail.id && !eventDetail.helperId) {
              break;
            }
  
            deleteComponentFromPage(
              eventDetail.id
                ? { id: eventDetail.id }
                : { helperId: eventDetail.helperId }
            );
            break;
          case 'domUpdated':
            if (!eventDetail.data) {
              return;
            }
  
            var domData = eventDetail.data || {};
            var data = getDomDataMap(domData);
            var promise = Promise.resolve();
  
            switch (domData.action) {
              case 'delete':
                // @DEPRECATED This is for deleting non-component elements
  
                // Stop if 'data.from' couldn't be mapped
                if (_.isEmpty(data.from)) {
                  break;
                }
  
                // Removes the element
                data.from.parentNode.removeChild(data.from.element);
  
                refreshCurrentComponentIds();
  
                // Checks if it needs to save a parent container
                if (data.from.parentWidget) {
                  // view parameter may need to be provided by event source
                  promise = saveWidgetRichContent({
                    id: getComponentElementId(data.from.parentWidget),
                    views: [data.from.parentView]
                  });
                }
  
                // Save page content
                return promise
                  .then(function() {
                    Fliplet.Hooks.run('componentEvent', {
                      type: 'removed',
                      target: new ComponentNode(data.from.parentNode, { view: data.from.parentView }),
                      removed: [new ComponentNode(data.from.element)]
                    });
  
                    return savePageContent();
                  })
                  .catch(function(error) {
                    Fliplet.Studio.emit('page-saved', {
                      isError: true,
                      error: error
                    });
                  });
              case 'order':
                moveElements(data);
                break;
              default:
                break;
            }
  
            // Stop if 'data' couldn't be mapped
            if (_.isEmpty(data.from) || _.isEmpty(data.to)) {
              return;
            }
  
            var fromComponentId = getComponentElementId(data.from.element);
            var fromParentWidget = data.from.parentWidget;
            var fromParentWidgetId = getComponentElementId(fromParentWidget);
            var fromParentView = data.from.parentView;
            var toParentWidget = data.to.parentWidget;
            var toParentWidgetId = getComponentElementId(toParentWidget);
            var toParentView = data.to.parentView;
  
            var componentNodeMoved = new ComponentNode(data.from.element);
            var sameParent = data.from.parent === data.to.parent;
  
            Fliplet.Hooks.run('componentEvent', {
              type: 'moved',
              source: new ComponentNode(data.from.parentNode, { view: fromParentView }),
              target: componentNodeMoved.parent(),
              added: sameParent ? [] : [componentNodeMoved],
              removed: sameParent ? [] : [componentNodeMoved]
            });
  
            if (!fromComponentId && !fromParentWidgetId && !toParentWidgetId) {
              savePageContent();
  
              return;
            }
  
            // If the item moved is a widget
            if (fromComponentId) {
              var reloadData = {
                isExisting: true
              };
  
              reloadData[typeof fromComponentId === 'number' ? 'id' : 'helperId'] = fromComponentId;
              reloadData.type = 'moved';
              promise = reloadComponentInstance(reloadData);
            }
  
            promise
              .then(function() {
                return moveWidgetRichContents({
                  fromParentWidget: fromParentWidget,
                  fromParentWidgetId: fromParentWidgetId,
                  fromParentView: fromParentView,
                  toParentWidget: toParentWidget,
                  toParentWidgetId: toParentWidgetId,
                  toParentView: toParentView
                });
              })
              .then(function() {
                return savePageContent();
              })
              .then(function() {
                Fliplet.Studio.emit('page-saved');
              })
              .catch(function(error) {
                Fliplet.Studio.emit('page-saved', {
                  isError: true,
                  error: error
                });
              });
            break;
          case 'reloadWidgetInstance':
            reloadComponentInstance({
              id: eventDetail.id,
              isExisting: true
            });
            break;
          case 'savePage':
            savePageContent();
            break;
          case 'savingNewStyles':
            startedSavingStyles++;
            break;
          case 'reloadCssAsset':
            startedSavingStyles--;
  
            reloadCSS(eventDetail)
              .then(onCSSLoaded);
            break;
          case 'inlineCss':
            if (!eventDetail || !eventDetail.hasOwnProperty('cssProperties')) {
              break;
            }
  
            applyingStyles = true;
            eventDetail.cssProperties.forEach(function(css) {
              var $selector;
  
              if (Array.isArray(css.selector)) {
                css.selector.forEach(function(selector) {
                  $selector = $(selector);
                  $selector.each(function() {
                    var _this = this;
  
                    widgetSelectors.push(_this);
                    _.forIn(css.properties, function(value, prop) {
                      _this.style[_.camelCase(prop)] = value;
                    });
                  });
                });
  
                return;
              }
  
              $selector = $(css.selector);
              $selector.each(function() {
                var _this = this;
  
                widgetSelectors.push(_this);
                _.forIn(css.properties, function(value, prop) {
                  _this.style[_.camelCase(prop)] = value;
                });
              });
            });
  
            // Runs hook that can be used by components, when appearance settings are changed
            Fliplet.Hooks.run('appearanceChanged');
  
            Fliplet.Studio.emit('get-highlight-size');
  
            onStylesApplied();
            break;
          case 'getHighlightSize':
            elementData = DragDrop.getElementFromPath({ path: eventDetail.path });
  
            var element = elementData.element;
            var $widget;
  
            if (eventDetail.id) {
              $widget = $(WIDGET_INSTANCE_SELECTOR + '[' + WIDGET_INSTANCE_ID_ATTR + '="' + eventDetail.id + '"]');
            } else if (eventDetail.helperId && Fliplet.Helper) {
              $widget = (Fliplet.Helper.findOne({ id: eventDetail.helperId }) || {}).$el;
            } else {
              $widget = $([]);
            }
  
            if ($widget && $widget.length) {
              element = $widget[0];
            }
  
            // Delay to make sure the element is fully rendered
            setTimeout(function() {
              selectedWidget({
                element: DragDrop.constructHoveringObject(element),
                fromStructure: true,
                toSelect: typeof eventDetail.toSelect !== 'undefined' ? eventDetail.toSelect : true,
                elementId: eventDetail.elementId || eventDetail.id
              });
            }, 500);
            break;
          case 'getParentComponent':
            elementData = DragDrop.getElementFromPath({ path: eventDetail.path });
  
            var $parent = $(elementData.parent);
  
            selectedWidget({
              element: DragDrop.constructHoveringObject($parent),
              fromStructure: true,
              toSelect: true
            });
            break;
          // Clone component
          case 'copyComponent':
            // Check if it is a valid component
            if (!DragDrop.isValidComponent(eventDetail)) {
              return;
            }
  
            if (DragDrop.isFullScreenComponent(eventDetail)) {
              Fliplet.Studio.emit('component-is-full-screen');
  
              return;
            }
  
            clipboardData = DragDrop.getClipboardData({
              data: eventDetail,
              $richLayout: $richLayoutWrapper,
              type: 'copy'
            });
  
            if (!clipboardData) {
              return;
            }
  
            // Get the component data needed for pasting
            var copyData = _.assignIn(
              _.pick(eventDetail, ['autoPaste', 'duplicate']),
              clipboardData
            );
  
            // Send data to saved in Studio store
            Fliplet.Studio.emit('set-clipboard', copyData);
  
            // If from the Duplicate pop up in Studio
            if (eventDetail.autoPaste) {
              return;
            }
  
            // Show Studio toast
            Fliplet.Studio.emit('show-edit-toast', {
              type: 'success',
              description: 'Component copied'
            });
            break;
          case 'cutComponent':
            // Check if it is a valid component
            if (!DragDrop.isValidComponent(eventDetail)) {
              return;
            }
  
            if (DragDrop.isFullScreenComponent(eventDetail)) {
              Fliplet.Studio.emit('component-is-full-screen');
  
              return;
            }
  
            // Get the component data needed for pasting
            clipboardData = DragDrop.getClipboardData({
              data: eventDetail,
              $richLayout: $richLayoutWrapper,
              type: 'cut'
            });
  
            // Send data to saved in Studio store
            Fliplet.Studio.emit('set-clipboard', clipboardData);
  
            // Instruct to cut the component from the DOM
            cutComponent(clipboardData);
            break;
          case 'pasteComponent':
            // Check if data is available
            clipboardData = eventDetail.data;
  
            if (!clipboardData || _.isEmpty(clipboardData)) {
              return;
            }
  
            if (clipboardData.appId && clipboardData.appId !== currentAppId) {
              Fliplet.Studio.emit('show-edit-toast', {
                type: 'danger',
                description: 'Components can not be pasted across apps.'
              });
  
              return;
            }
  
            // Start the pasting process
            startPastingProcess(clipboardData);
            break;
          case 'widgetSelected':
            id = eventDetail.elementId;
  
            var type = eventDetail.componentType;
  
            if (!type) {
              return;
            }
  
            if (eventDetail.scrollToElement) {
              // Run async to wait for any UI update
              setTimeout(function() {
                // Scroll to pasted component
                $currentHoveringElement
                  = $(COMPONENT_KEYS[type].selector + '[' + COMPONENT_KEYS[type].idAttr + '="' + id + '"]');
  
                scrollWindow($currentHoveringElement.get(0));
              }, 250);
            }
  
            break;
          case 'editHelperWidget':
            id = eventDetail.id;
  
            if (!id || !Fliplet.Helper) {
              return;
            }
  
            var helperInstance = Fliplet.Helper.findOne({ id: id });
  
            if (helperInstance) {
              helperInstance.configure();
  
              selectedWidget({
                element: DragDrop.constructHoveringObject(helperInstance.el),
                fromStructure: true,
                toSelect: true
              });
            }
  
            break;
          default:
            break;
        }
      });
  
      // Key presses
      window.addEventListener('keydown', onKeyPressed);
      window.addEventListener('keyup', onKeyReleased);
  
      // Attaches the scroll event to every element
      // Only fires on scrollable elements
      window.addEventListener('scroll', _.debounce(onScroll, 16, {
        leading: true
      }), true);
  
      // Used jQuery to attach to document to make it easy to
      // attach the events to new elements that can be added to the page
      $(document)
        .on('dragstart', DragDrop.getDraggableInstanceSelector(), function(event) {
          event.stopPropagation();
  
          if (!$(event.target).isDraggableInstance()) {
            return;
          }
  
          addTemporarySpacer($('[data-view]'));
          addTemporarySpacer($(DROP_AREA_SELECTOR));
  
          var $element = getElement(event.target);
          var dragData = {
            widgetId: $element.data('id'),
            helperId: $element.attr('data-helper-id'),
            package: $element.data(WIDGET_PACKAGE_DATA),
            helperName: $element.attr('data-helper-id') && $element.attr('name')
          };
  
          widgetIsDragging({
            isDragging: true
          });
          DragDrop.setDraggingElement($element[0]);
  
          selectedWidget({
            element: DragDrop.constructHoveringObject($element),
            fromStructure: true,
            toSelect: true
          });
  
          event.dataTransfer = event.dataTransfer || event.originalEvent.dataTransfer;
  
          try {
            event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
          } catch (error) {
            // IE doesn't support text/plain
            event.dataTransfer.setData('text', JSON.stringify(dragData));
          }
  
          // Load generic/custom image when dragging widget
          // Check, because it doesn't work on IE11
          if (typeof event.dataTransfer.setDragImage === 'function') {
            event.dataTransfer.setDragImage(dragIcon, 0, 0);
          }
  
          DragDrop.startQueueProcessing();
        })
        .on('dragover', function(event) {
          event.preventDefault();
          event.stopPropagation();
  
          var $hoveringElement = getElement(event.target, {
            setHover: true
          });
  
          if ($hoveringElement.data('type') === 'menu') {
            removeDropPoint();
          }
        })
        .on('dragleave', function() {
          removeDropPoint();
        })
        .on('dragend', DragDrop.getDraggableInstanceSelector(), function() {
          removeTemporarySpacer($('[data-view]'));
          removeTemporarySpacer($(DROP_AREA_SELECTOR));
  
          DragDrop.stopQueueProcessing();
          DragDrop.setDraggingElement();
  
          widgetIsDragging({
            isDragging: false,
            moveEnd: true
          });
  
          if (DragDrop.isDropping()) {
            return;
          }
  
          toggleHighlight({
            showHighlight: false
          });
        })
        .on('mouseenter', '[data-type="menu"]', function(event) {
          toggleHighlight({
            showHighlight: true
          });
  
          var $hoveringElement = getElement(event.target);
  
          orchestrateDragDrop($hoveringElement);
          highlightInStructure({
            removeHighlight: true
          });
        })
        .on('mouseleave', '[data-type="menu"]', function() {
          resetElements();
          toggleHighlight({
            showHighlight: false
          });
          highlightInStructure({
            removeHighlight: true
          });
        })
        .on('click', '[data-type="menu"]', function(event) {
          event.stopPropagation();
          Fliplet.Studio.emit('navigate', {
            name: 'appEditMenus',
            query: { tab: 'menu-manager' }
          });
        })
        .on('click', function(event) {
          event.stopPropagation();
          event.preventDefault();
  
          var $element = getElement(event.target, {
            setCurrent: true,
            toSelect: true
          });
  
          if (!$element.data(WIDGET_PACKAGE_DATA)) {
            var element = DragDrop.constructHoveringObject($element);
  
            selectedWidget({
              element: element,
              fromStructure: true,
              toSelect: true
            });
  
            return;
          }
  
          openWidgetSettings({
            widgetId: $element.data('id'),
            widgetPackage: $element.data(WIDGET_PACKAGE_DATA)
          });
        })
        .on('click', WIDGET_INSTANCE_SELECTOR + '.label-component-missing', function(event) {
          event.stopPropagation();
  
          var $instance = $(this);
          var widgetId = $instance.data(WIDGET_INSTANCE_ID_DATA);
  
          Fliplet.Modal.confirm({
            title: 'Component missing',
            message: 'Component #' + widgetId + ' cannot be found. Please setup a new component.',
            buttons: {
              confirm: {
                label: 'Delete this component',
                className: 'btn-danger'
              },
              cancel: {
                label: 'OK',
                className: 'btn-secondary'
              }
            }
          })
            .then(function(confirmed) {
              if (confirmed) {
                deleteComponentFromPage({
                  id: widgetId,
                  skipConfirm: true
                });
              }
            });
        });
    }
  
    /**
     * Attach event handlers
     * @returns {undefined}
     */
    function attachDropAreaHandlers() {
      /**
       * Attache events to the droppable area
       */
      $dropArea.each(function() {
        this.addEventListener('click', function(event) {
          if (!$(event.target).is(DROP_AREA_SELECTOR)) {
            return;
          }
  
          Fliplet.Studio.emit('widget-cancel', {
            skipReload: true
          });
        });
  
        this.addEventListener('dragenter', function(event) {
          event.stopPropagation();
  
          var $element = getElement(event.target, {
            setCurrent: true
          });
  
          targetElementChangeFlag = true;
  
          if ($element.hasClass('fl-drop-marker')) {
            var $nextSibling = $element.next();
            var $previousSibling = $element.prev();
            var $parent = $element.parent();
      
            if ($nextSibling.length) {
              $element = $nextSibling;
            } else if ($previousSibling.length) {
              $element = $previousSibling;
            } else {
              $element = $parent;
            }
          }
  
          elementRectangle = $element[0].getBoundingClientRect();
          countdown = 1;
  
          toggleHighlight({
            showHighlight: true
          });
        }, true);
  
        this.addEventListener('dragover', function(event) {
          event.preventDefault();
          event.stopPropagation();
  
          var isDropMarker = false;
          var target = event.target;
  
          if (target.classList.contains('fl-drop-marker')) {
            isDropMarker = true;
  
            var $target = $(target);
            var $nextSibling = $target.next();
            var $previousSibling = $target.prev();
            var $parent = $target.parent();
      
            if ($nextSibling.length) {
              target = $nextSibling[0];
            } else if ($previousSibling.length) {
              target = $previousSibling[0];
            } else {
              target = $parent[0];
            }
          }
  
          getElement(target, {
            setHover: true
          });
  
          handleScroll(event);
  
          // Dragging
          if (countdown % dragOperand !== 0 && targetElementChangeFlag === false) {
            countdown = countdown + 1;
  
            return;
          }
  
          var clientX = event.clientX;
          var clientY = event.clientY;
  
          countdown = countdown + 1;
          targetElementChangeFlag = false;
  
          var mousePosition = {
            x: clientX,
            y: clientY
          };
  
          DragDrop.addEntryToDragOverQueue({
            $element: $currentElement,
            elemRect: elementRectangle,
            mousePos: mousePosition,
            isHovering: true,
            isInlineWidget: widgetIsInline,
            isDropMarker: isDropMarker
          });
  
          toggleHighlight({
            showHighlight: true
          });
        }, true);
  
        this.addEventListener('dragend', function() {
          removeTemporarySpacer($('[data-view]'));
          removeTemporarySpacer($(DROP_AREA_SELECTOR));
  
          DragDrop.stopQueueProcessing();
          DragDrop.setDraggingElement();
        }, true);
  
        this.addEventListener('drop', function(event) { 
          removeTemporarySpacer($('[data-view]'));
          removeTemporarySpacer($(DROP_AREA_SELECTOR));
  
          event.preventDefault();
          event.stopPropagation();
  
          if (DragDrop.isDropping()) {
            return;
          }
  
          DragDrop.setDroppingStatus(true);
          DragDrop.setDraggingElement();
          isDragging = false;
          stopScrolling = true;
  
          DragDrop.stopQueueProcessing();
  
          widgetIsDragging({
            isDragging: false
          });
          toggleHighlight({
            showHighlight: false
          });
  
          try {
            onDrop(event, {
              shiftKey: event.shiftKey
            });
          } catch (err) {
            console.error(err);
          }
        }, true);
  
        this.addEventListener('mouseover', function(event) {
          toggleHighlight({
            showHighlight: true
          });
  
          var $element = getElement(event.target, {
            setHover: true
          });
  
          orchestrateDragDrop($element);
        }, true);
      });
    }
  
    /**
     * Initialize function
     * @returns {undefined}
     */
    function initializeDom() {
      Fliplet.Hooks.on('afterHelpersRender', function() {
        refreshCurrentComponentIds();
      });
  
      attachGlobalHandlers();
      attachDropAreaHandlers();
  
      Fliplet.initializeLocale().then(function() {
        Fliplet.Navigator.ready();
      }).catch(function() {
        Fliplet.Navigator.ready();
      });
  
      // Clear the nav history
      Fliplet.Storage.remove('fl_navstack');
    }
  
    /**
     * Replace widget instances with Widget Handlebar Helper
     * @param {jQuery} $html - jQuery with the page elements
     * @param {String} layoutHTML - Saved layout string
     * @returns {jQuery} Updated page element
     */
    function replaceWidgetInstances($html, layoutHTML) {
      $html.find(WIDGET_INSTANCE_SELECTOR).replaceWith(function() {
        var $widget = $(this);
        var widgetInstanceId = $widget.data(WIDGET_INSTANCE_ID_DATA);
  
        if (!layoutHTML) {
          var templateHtml = $richLayoutWrapper.find('[cid="' + widgetInstanceId + '"]').html();
          var hasCustomHtml = templateHtml && templateHtml.trim().length && !$widget.hasViews() && !$widget.hasManagedViews();
  
          if (hasCustomHtml) {
            return '{{#widget ' + widgetInstanceId + '}}' + templateHtml + '{{/widget}}';
          }
  
          return '{{{widget ' + widgetInstanceId + '}}}';
        }
  
        var regexp = '{{{? *#widget ' + widgetInstanceId + ' *}?}}[\\s\\S]*?{{{?\\/widget}?}}';
        var previousMatch = layoutHTML.match(new RegExp(regexp, 'm'));
        var openedCustomTags = previousMatch && previousMatch[0].match(new RegExp('{{{? ?#widget [0-9]+ ?}?}}', 'gm'));
  
        if (openedCustomTags && openedCustomTags.length > 1) {
          openedCustomTags.pop();
          openedCustomTags.forEach(function() {
            regexp += '[\\s\\S]*?{{{?\\/widget}?}}';
          });
  
          previousMatch = layoutHTML.match(new RegExp(regexp, 'm'));
        }
  
        return previousMatch ? previousMatch[0] : '{{{widget ' + widgetInstanceId + '}}}';
      });
  
      return $html;
    }
  
    /**
     * Checks if two layouts are equivalent
     * @param {String} layout - Page layout
     * @param {String} anotherLayout - Another page layout
     * @returns {Boolean} Returns TRUE if the two layouts are equivalent
     */
    function layoutsAreEqual(layout, anotherLayout) {
      var widgetPattern = /({{{)\s*(widget [0-9]+)\s*(}}})/gi;
  
      return layout.replace(widgetPattern, '$1$2$3') === anotherLayout.replace(widgetPattern, '$1$2$3');
    }
  
    /**
     * Save page HTML function
     * @param {Boolean} [emitSavedStatus=TRUE] - If FALSE, don't trigger page-saved once it's completed
     * @returns {Promise} Promise is resolved when the content is saved
     */
    function savePageContent(emitSavedStatus) {
      var savedLayout = $pageLayout.html();
      var $editable = $dropArea;
  
      // Clone to make sure any reference of the "$editable.html()" are removed
      var $html = $('<div>' + $editable.html() + '</div>');
  
      // Removes empty class attributes
      $html.find('[class=""]').removeAttr('class');
  
      // Removes drop point if it is on the page
      $html.removeDropMarkers();
  
      // Remove layout data template
      $html.find('template[data-fl-layout]').remove();
  
      if (Fliplet.Helper) {
        Fliplet.Helper.restoreStateForHtml($html);
      }
  
      // Replace widget instances with their placeholders
      $html = replaceWidgetInstances($html, savedLayout);
  
      // Turn off temporary editable containers
      $html.find('[data-contenteditable]').removeAttr('contenteditable');
      $html.find('[contenteditable]').removeAttr('contenteditable');
  
      var currentLayout = $html.html().trim();
  
      // No need to save if the content is exactly the same
      if (layoutsAreEqual(currentLayout, savedLayout)) {
        Fliplet.Studio.emit('update-dom');
  
        if (emitSavedStatus !== false) {
          Fliplet.Studio.emit('page-saved');
        }
  
        return DragDrop.getRichLayout({
          force: true
        })
          .then(function(response) {
            $richLayoutWrapper = DragDrop.getLayoutWrapper({
              data: response,
              richLayout: true
            });
  
            $pageLayout = DragDrop.getLayoutWrapper({
              data: response
            });
          });
      }
  
      return Fliplet.Hooks.run('beforeSavePageContent', currentLayout).then(function(html) {
        if (!Array.isArray(html) || !html.length) {
          html = [currentLayout];
        }
  
        $pageLayout.html(html[html.length - 1].trim());
      }).then(function() {
        Fliplet.Studio.emit('page-saving');
  
        return Fliplet.API.request({
          method: 'PUT',
          url: 'v1/apps/' + currentAppId + '/pages/' + currentPageId,
          data: {
            layout: $pageLayout.html()
          }
        });
      }).then(function(response) {
        // Emit event to Studio to get the updated DOM
        Fliplet.Studio.emit('update-dom');
  
        if (response && emitSavedStatus !== false) {
          Fliplet.Studio.emit('page-saved', response.page);
        }
  
        return DragDrop.getRichLayout({
          force: true
        });
      }).then(function(response) {
        $richLayoutWrapper = DragDrop.getLayoutWrapper({
          data: response,
          richLayout: true
        });
  
        $pageLayout = DragDrop.getLayoutWrapper({
          data: response
        });
      }).catch(function(error) {
        console.error(error);
  
        Fliplet.Studio.emit('page-saved', {
          isError: true,
          error: error
        });
      });
    }
  
    Fliplet.Interact.getElement = getElement;
    Fliplet.Interact.saveContent = savePageContent;
    Fliplet.Interact.getContainerInfo = getContainerInfo;
    Fliplet.Interact.saveWidgetRichContent = saveWidgetRichContent;
    Fliplet.Interact.ViewContainer = ViewContainer;
    Fliplet.Interact.ComponentNode = ComponentNode;
  
    /**
     * On ready event handler
     */
    $(document).ready(function() {
      // Load dragging image
      var img = new Image();
  
      img.onload = function() {
        dragIcon = img;
      };
  
      img.src = dragImage64;
      currentAppId = Fliplet.Env.get('appId');
      currentPageId = Fliplet.Env.get('pageId');
      $pageLayout = $('<div>' + $('template[data-fl-layout]').html() + '</div>');
  
      initializeDom();
  
      DragDrop.getRichLayout({
        force: true
      })
        .then(function(response) {
          $richLayoutWrapper = DragDrop.getLayoutWrapper({
            data: response,
            richLayout: true
          });
  
          $pageLayout = DragDrop.getLayoutWrapper({
            data: response
          });
        });
  
      document.documentElement.classList.add('mode-interact-ready');
    });
  })(jQuery);
  