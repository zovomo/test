/* eslint-disable */
(function(global) {
  var bind,
    isMobile,
    _self,
    CanvasClip;
  var cutRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  var clipedDownPoint = {
    x: 0,
    y: 0,
    originalRectX: 0,
    originalRectY: 0,
    originalRectWidth: 0,
    originalRectHeight: 0
  };
  bind = (function() {
    if (window.addEventListener) {
      return function(ele, type, handler) {
        ele.addEventListener(type, handler, false)
      }
    } else {
      return function(ele, type, handler) {
        ele.attatchEvent("on" + type, handler)
      }
    }
  })();
  isMobile = (function() {
    var reg = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return reg.test(navigator.userAgent)
  })();
  CanvasClip = function(setting) {
    this.previewContainer = setting.previewContainer;
    this.canvasWidth = setting.canvasWidth || 400;
    this.source = setting.source;
    this.quality = setting.quality || 0.86;
    this.cutRect = {};
    this.ret64 = "";
    this.clipLineWidth = 4;
    this.canvas = this.previewContainer.querySelector("canvas") || document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.img = new Image;
    this.canvasPosition = {};
    this._isMouseDown = false;
    this._isMouseMoved = false;
    this._isCliped = false;
    this._isRectChanged = false;
    this._extendTop = false;
    this._extendBottom = false;
    this._extendLeft = false;
    this._extendRight = false;
    _self = this;
    this.init()
  };
  CanvasClip.prototype.init = function() {
    var reader = new FileReader;
    reader.onload = function() {
      _self.img.src = this.result;
      _self.img.onload = function() {
        _self.canvas.width = _self.canvasWidth;
        _self.canvas.height = _self.img.height * _self.canvas.width / _self.img.width;
        drawMaskImage();
        drawSubline();
        makeClip();
        if (_self.previewContainer.hasChildNodes()) {
          _self.previewContainer.removeChild(_self.canvas)
        }
        _self.previewContainer.appendChild(_self.canvas)
      }
    };
    reader.readAsDataURL(_self.source)
  };
  CanvasClip.prototype.clip = function() {
    if (_self._isCliped) {
      drawImage();
      var offCanvas = document.createElement("canvas"),
        offContext = offCanvas.getContext("2d"),
        w = _self.cutRect.width,
        h = _self.cutRect.height;
      offCanvas.width = w;
      offCanvas.height = h;
      offContext.drawImage(_self.canvas, _self.cutRect.x, _self.cutRect.y, w, h, 0, 0, w, h);
      _self.ret64 = offCanvas.toDataURL("image/jpeg", _self.quality);
      drawMaskImage();
      drawSubline();
      _self._isCliped = false
    }
  };
  function drawSubline() {
    var canvasWidth = _self.canvas.width;
    var canvasHeight = _self.canvas.height;
    var widthStep = canvasWidth / 3;
    var heightStep = canvasHeight / 3;
    var context = _self.context;
    context.save();
    context.beginPath();
    context.setLineDash([10, 5]);
    context.strokeStyle = "rgba(255, 255, 255, .8)";
    context.moveTo(widthStep, 0);
    context.lineTo(widthStep, canvasHeight);
    context.moveTo(widthStep * 2, 0);
    context.lineTo(widthStep * 2, canvasHeight);
    context.moveTo(0, heightStep);
    context.lineTo(canvasWidth, heightStep);
    context.moveTo(0, heightStep * 2);
    context.lineTo(canvasWidth, heightStep * 2);
    context.stroke()
  }
  function redrawClipedCanvas() {
    drawMaskImage();
    drawClipBox();
    drawSubline()
  }
  function drawImage() {
    var context = _self.context;
    var canvasWidth = _self.canvas.width;
    var canvasHeight = _self.canvas.height;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.save();
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.restore();
    context.drawImage(_self.img, 0, 0, canvasWidth, canvasHeight)
  }
  function drawMaskImage() {
    var context = _self.context;
    var canvasWidth = _self.canvas.width;
    var canvasHeight = _self.canvas.height;
    drawImage();
    context.save();
    context.fillStyle = "rgba(0,0,0,.4)";
    context.beginPath();
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.restore();
    _self.canvasPosition = _self.canvas.getBoundingClientRect()
  }
  function drawClipBox() {
    var context = _self.context;
    context.save();
    context.strokeStyle = "#59f";
    context.setLineDash([1, 0]);
    context.lineDashOffset = 10;
    context.lineWidth = _self.clipLineWidth;
    context.beginPath();
    context.rect(cutRect.x, cutRect.y, cutRect.width, cutRect.height);
    context.clip();
    context.drawImage(_self.img, 0, 0, _self.canvas.width, _self.canvas.height);
    context.stroke();
    context.restore()
  }
  function makeClip() {
    if (isMobile) {
      bind(_self.canvas, "touchstart", touchDownHandler);
      bind(document, "touchmove", touchMoveHandler);
      bind(document, "touchend", touchUpHandler)
    } else {
      bind(_self.canvas, "mousedown", touchDownHandler);
      bind(document, "mousemove", touchMoveHandler);
      bind(document, "mouseup", touchUpHandler)
    }
    var getCordinate = (function() {
      var zoom = 1;
      if (window.screen.width <= 1440) {
        zoom = 0.75;
      } else {
        if (window.screen.width <= 1600) {
          zoom = 0.81
        } else {
          if (window.screen.width <= 1680) {
            zoom = 0.82
          }
        }
      }
      if (isMobile) {
        return function(e) {
          return {
            x: (e.changedTouches[0].clientX - _self.canvasPosition.left) / zoom,
            y: (e.changedTouches[0].clientY - _self.canvasPosition.top) / zoom
          }
        }
      } else {
        return function(e) {
          return {
            x: e.offsetX / zoom,
            y: e.offsetY / zoom
          }
        }
      }
    })();
    function isInRect(x, y) {
      var beginX = cutRect.x,
        endX = cutRect.x + cutRect.width,
        beginY = cutRect.y,
        endY = cutRect.y + cutRect.height;
      return (beginX < x) && (x < endX) && (beginY < y) && (y < endY)
    }
    function isInTopside(x, y) {
      var beginX = cutRect.x,
        endX = cutRect.x + cutRect.width,
        beginY = cutRect.y,
        endY = cutRect.y + cutRect.height;
      return (beginX < x) && (x < endX) && ((y - beginY) === 0)
    }
    function isInBottomside(x, y) {
      var beginX = cutRect.x,
        endX = cutRect.x + cutRect.width,
        beginY = cutRect.y,
        endY = cutRect.y + cutRect.height;
      return (beginX < x) && (x < endX) && ((endY - y) === 0)
    }
    function isInLeftside(x, y) {
      var beginX = cutRect.x,
        endX = cutRect.x + cutRect.width,
        beginY = cutRect.y,
        endY = cutRect.y + cutRect.height;
      return ((x - beginX) === 0) && (beginY < y) && (y < endY)
    }
    function isInRightside(x, y) {
      var beginX = cutRect.x,
        endX = cutRect.x + cutRect.width,
        beginY = cutRect.y,
        endY = cutRect.y + cutRect.height;
      return ((endX - x) === 0) && (beginY < y) && (y < endY)
    }
    function touchDownHandler(e) {
      var p = getCordinate(e),
        x = p.x,
        y = p.y;
      if (!_self._isCliped) {
        cutRect.x = x;
        cutRect.y = y;
        _self._isMouseDown = true
      } else {
        if (isInRect(x, y)) {
          clipedDownPoint.x = x;
          clipedDownPoint.y = y;
          clipedDownPoint.originalRectX = cutRect.x;
          clipedDownPoint.originalRectY = cutRect.y;
          _self._isMouseDown = true
        } else {
          cutRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
          }
          drawMaskImage();
          drawSubline();
          _self._isCliped = false
        }
        // if (isInTopside(x, y)) {
        //   clipedDownPoint.y = y;
        //   clipedDownPoint.originalRectY = cutRect.y;
        //   clipedDownPoint.originalRectHeight = cutRect.height;
        //   _self._isMouseDown = true;
        //   _self._extendTop = true
        // } else {
        //   if (isInBottomside(x, y)) {
        //     clipedDownPoint.y = y;
        //     clipedDownPoint.originalRectY = cutRect.y;
        //     clipedDownPoint.originalRectHeight = cutRect.height;
        //     _self._isMouseDown = true;
        //     _self._extendBottom = true
        //   } else {
        //     if (isInLeftside(x, y)) {
        //       clipedDownPoint.x = x;
        //       clipedDownPoint.originalRectX = cutRect.x;
        //       clipedDownPoint.originalRectWidth = cutRect.width;
        //       _self._isMouseDown = true;
        //       _self._extendLeft = true
        //     } else {
        //       if (isInRightside(x, y)) {
        //         clipedDownPoint.x = x;
        //         clipedDownPoint.originalRectX = cutRect.x;
        //         clipedDownPoint.originalRectWidth = cutRect.width;
        //         _self._isMouseDown = true;
        //         _self._extendRight = true
        //       } else {
        //         if (isInRect(x, y)) {
        //           clipedDownPoint.x = x;
        //           clipedDownPoint.y = y;
        //           clipedDownPoint.originalRectX = cutRect.x;
        //           clipedDownPoint.originalRectY = cutRect.y;
        //           _self._isMouseDown = true
        //         } else {
        //           drawMaskImage();
        //           drawSubline();
        //           _self._isCliped = false
        //         }
        //       }
        //     }
        //   }
        // }
      }
      e.preventDefault()
    }
    function touchMoveHandler(e) {
      var target = isMobile
        ? document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY)
        : e.target;
      if (target === _self.canvas) {
        if (_self._isMouseDown) {
          _self._isMouseMoved = true;
          if (!_self._isCliped) {
            _self._isRectChanged = true;
            var p = getCordinate(e);
            if (0 < (cutRect.y + (p.x - cutRect.x) / 4 * 3) && (cutRect.y + (p.x - cutRect.x) / 4 * 3) < _self.canvas.height) {
              cutRect.width = p.x - cutRect.x;
              cutRect.height = Math.abs(cutRect.width) / 4 * 3;
              redrawClipedCanvas()
            }
          } else {
            _self._isRectChanged = false;
            var p = getCordinate(e);
            cutRect.x = clipedDownPoint.originalRectX + p.x - clipedDownPoint.x;
            cutRect.y = clipedDownPoint.originalRectY + p.y - clipedDownPoint.y;
            // if (_self._extendTop) {
            //   cutRect.y = clipedDownPoint.originalRectY + p.y - clipedDownPoint.y;
            //   cutRect.height = clipedDownPoint.originalRectHeight - (p.y - clipedDownPoint.y)
            // } else {
            //   if (_self._extendBottom) {
            //     cutRect.height = clipedDownPoint.originalRectHeight + (p.y - clipedDownPoint.y)
            //   } else {
            //     if (_self._extendLeft) {
            //       cutRect.x = clipedDownPoint.originalRectX + p.x - clipedDownPoint.x;
            //       cutRect.width = clipedDownPoint.originalRectWidth - (p.x - clipedDownPoint.x)
            //     } else {
            //       if (_self._extendRight) {
            //         cutRect.width = clipedDownPoint.originalRectWidth + (p.x - clipedDownPoint.x)
            //       } else {
            //         cutRect.x = clipedDownPoint.originalRectX + p.x - clipedDownPoint.x;
            //         cutRect.y = clipedDownPoint.originalRectY + p.y - clipedDownPoint.y
            //       }
            //     }
            //   }
            // }
            (cutRect.x < 0) && (cutRect.x = 0);
            (cutRect.y < 0) && (cutRect.y = 0);
            (cutRect.x > _self.canvas.width - cutRect.width) && (cutRect.x = _self.canvas.width - cutRect.width);
            (cutRect.y > _self.canvas.height - cutRect.height) && (cutRect.y = _self.canvas.height - cutRect.height);
            redrawClipedCanvas()
          }
        }
        addCursor(e)
      }
    }
    function addCursor(e) {
      if (_self._isCliped) {
        var p = getCordinate(e),
          x = p.x,
          y = p.y;
        if (isInRect(x, y) && _self.canvas.style.cursor !== "move") {
          _self.canvas.style.cursor = "move"
        }
        if (!isInRect(x, y) && _self.canvas.style.cursor !== "default") {
          _self.canvas.style.cursor = "default"
        }
        // if (isInTopside(x, y) && _self.canvas.style.cursor !== "n-resize") {
        //   _self.canvas.style.cursor = "n-resize"
        // }
        // if (isInBottomside(x, y) && _self.canvas.style.cursor !== "s-resize") {
        //   _self.canvas.style.cursor = "s-resize"
        // }
        // if (isInLeftside(x, y) && _self.canvas.style.cursor !== "w-resize") {
        //   _self.canvas.style.cursor = "w-resize"
        // }
        // if (isInRightside(x, y) && _self.canvas.style.cursor !== "e-resize") {
        //   _self.canvas.style.cursor = "e-resize"
        // }
      } else {
        if (_self.canvas.style.cursor !== "default") {
          _self.canvas.style.cursor = "default"
        }
      }
    }
    function touchUpHandler(e) {
      _self._isMouseDown = false;
      addCursor(e);
      if (_self._isMouseMoved) {
        _self._isMouseMoved = false;
        _self._isCliped = true;
        _self._extendTop = false;
        _self._extendBottom = false;
        _self._extendLeft = false;
        _self._extendRight = false;
        cutRect = {
          x: cutRect.width < 0
            ? (cutRect.x + cutRect.width)
            : (cutRect.x),
          y: cutRect.height < 0
            ? (cutRect.y + cutRect.height)
            : (cutRect.y),
          width: Math.abs(cutRect.width),
          height: Math.abs(cutRect.height)
        };
        _self.cutRect = cutRect
      }
    }
  }
  if (typeof define === "function" && define.amd) {
    define(function() {
      return CanvasClip
    })
  } else {
    if (typeof module != "undefined" && module.exports) {
      module.exports = CanvasClip
    } else {
      global.CanvasClip = CanvasClip
    }
  }
})(window);
/* eslint-enable */
