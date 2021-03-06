/*!
 * React Native Autolink
 *
 * Copyright 2016 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/react-native-autolink/blob/master/LICENSE
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _autolinker = require('autolinker');

var _autolinker2 = _interopRequireDefault(_autolinker);

var _reactNative = require('react-native');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Autolink = function (_Component) {
  _inherits(Autolink, _Component);

  function Autolink() {
    _classCallCheck(this, Autolink);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Autolink).apply(this, arguments));
  }

  _createClass(Autolink, [{
    key: 'getURL',
    value: function getURL(match) {
      var type = match.getType();

      switch (type) {
        case 'email':
          return 'mailto://' + encodeURIComponent(match.getEmail());
        case 'hashtag':
          var tag = encodeURIComponent(match.getHashtag());

          switch (this.props.hashtag) {
            case 'facebook':
              return 'facebook://hashtag/' + tag;
            case 'instagram':
              return 'instagram://tag?name=' + tag;
            case 'twitter':
              return 'twitter://search?query=%23' + tag;
            default:
              return match.getMatchedText();
          }
        case 'phone':
          return 'tel://' + match.getNumber();
        case 'twitter':
          return 'twitter://user?screen_name=' + encodeURIComponent(match.getTwitterHandle());
        case 'url':
          return match.getAnchorHref();
        default:
          return match.getMatchedText();
      }
    }
  }, {
    key: '_onPress',
    value: function _onPress(url, match) {
      if (this.props.onPress) {
        this.props.onPress(url, match);
      } else {
        _reactNative.Linking.openURL(url);
      }
    }
  }, {
    key: 'renderLink',
    value: function renderLink(text, url, match) {
      var truncated = this.props.truncate > 0 ? _autolinker2.default.truncate.TruncateSmart(text, this.props.truncate, this.props.truncateChars) : text;

      return _react2.default.createElement(
        _reactNative.Text,
        {
          style: [styles.link, this.props.linkStyle],
          onPress: this._onPress.bind(this, url, match) },
        truncated
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var text = this.props.text || '';

      // Creates a token with a random UID that should not be guessable or
      // conflict with other parts of the string.
      var uid = Math.floor(Math.random() * 0x10000000000).toString(16);
      var tokenRegexp = new RegExp('(@__ELEMENT-' + uid + '-\\d+__@)', 'g');

      var generateToken = function () {
        var counter = 0;
        return function () {
          return '@__ELEMENT-' + uid + '-' + (counter += 1) + '__@';
        };
      }();

      var matches = {};

      try {
        text = _autolinker2.default.link(text, {
          email: this.props.email,
          hashtag: this.props.hashtag,
          phone: this.props.phone,
          twitter: this.props.twitter,
          urls: this.props.url,
          stripPrefix: this.props.stripPrefix,
          replaceFn: function replaceFn(autolinker, match) {
            var token = generateToken();

            matches[token] = match;

            return token;
          }
        });
      } catch (e) {
        console.warn(e);

        return null;
      }

      var nodes = text.split(tokenRegexp).filter(function (part) {
        return !!part;
      }).map(function (part) {
        var match = matches[part];

        if (!match) return part;

        switch (match.getType()) {
          case 'email':
          case 'hashtag':
          case 'phone':
          case 'twitter':
          case 'url':
            return _this2.props.renderLink ? _this2.props.renderLink(match.getAnchorText(), _this2.getURL(match), match) : _this2.renderLink(match.getAnchorText(), _this2.getURL(match), match);
          default:
            return part;
        }
      });

      return _react.createElement.apply(undefined, [_reactNative.Text, { ref: function ref(component) {
          _this2._root = component;
        }, style: this.props.style }].concat(_toConsumableArray(nodes)));
    }
  }]);

  return Autolink;
}(_react.Component);

exports.default = Autolink;


var styles = _reactNative.StyleSheet.create({
  link: {
    color: '#0E7AFE'
  }
});

Autolink.defaultProps = {
  email: true,
  hashtag: false,
  phone: true,
  stripPrefix: true,
  truncate: 32,
  truncateChars: '..',
  twitter: false,
  url: true
};

Autolink.propTypes = {
  email: _react.PropTypes.bool,
  hashtag: _react.PropTypes.oneOf([false, 'facebook', 'instagram', 'twitter']),
  linkStyle: _reactNative.Text.propTypes.style,
  onPress: _react.PropTypes.func,
  phone: _react.PropTypes.bool,
  renderLink: _react.PropTypes.func,
  stripPrefix: _react.PropTypes.bool,
  style: _reactNative.Text.propTypes.style,
  text: _react.PropTypes.string.isRequired,
  truncate: _react.PropTypes.number,
  truncateChars: _react.PropTypes.string,
  twitter: _react.PropTypes.bool,
  url: _react.PropTypes.bool
};
module.exports = exports['default'];