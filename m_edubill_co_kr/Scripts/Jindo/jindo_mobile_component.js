/**
 * Jindo Mobile Component
 * @version 1.17.0
 * 
 * NAVER Corp; JindoJS JavaScript Framework
 * http://jindo.dev.naver.com/
 * 
 * Released under the LGPL v2 license
 * http://www.gnu.org/licenses/old-licenses/lgpl-2.0.html
 */
/**
 *	jindo.m
 *	jindo.m.Component
 *	jindo.m.UIComponent
 *	jindo.m.Effect
 *	jindo.m.Morph
 *	jindo.m.Transition
 *	jindo.m.Calendar
 *	jindo.m.Datepicker
 *	jindo.m.LayerEffect
 *	jindo.m._Effect_
 *	jindo.m.SlideEffect
 *	jindo.m.PopEffect
 *	jindo.m.FlipEffect
 *	jindo.m.Dialog
 *	jindo.m.Touch
 *	jindo.m.Scroll
 *	jindo.m.DynamicPlugin
 *	jindo.m.Keyframe
 *	jindo.m.PullPlugin
 */
/**
	@fileOverview 진도모바일 컴포넌트의 기본 네임스페이스인 동시에, static 객체이다
	@author sculove
	@version 1.17.0
	@since 2011. 11. 16
**/
/**
	진도모바일 컴포넌트의 기본 네임스페이스인 동시에, static 객체이다

	@class jindo.m
	@group Component

	@history 1.15.0 Bug 샤오미 폰 일경우 스크립트 오류 발생건 수정 (userAgent의 형식이 달라서 발생함)
	@history 1.15.0 Bug useTimingFunction android 단말기 기본값 변경 (android = false)
	@history 1.15.0 Bug 다른 네임스페이스 사용시, maxium stack overflow 발생 문제 수정
	@history 1.13.0 Support Firefox 브라우저 지원
	@history 1.12.0 Update 안드로이드 크롬 브라우저 UserAgent 변경으로 인한 버전 정보 대응
	@history 1.7.0 Update 갤럭시S4 대응
	@history 1.7.0 Bug ie10 msPointerEnabled 값 버그 수정
	@history 1.5.0 Update Component 의존성 제거
	@history 1.5.0 Update Window Phone8 지원
	@history 1.4.0 Update iOS 6 지원
	@history 1.2.0 Update Chrome for Android 지원<br /> 갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Update Android 3.0/4.0 지원<br /> jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Update Namespace, jindo의 Namespace 하위로 지정
	@history 0.9.5 Update getTouchPosition() Method 삭제<br />
						hasTouchEvent() Method 삭제
	@history 0.9.0 Release 최초 릴리즈
**/
var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame|| window.msRequestAnimationFrame;
var caf = window.cancelAnimationFrame || window.webkitCancelAnimationFrame|| window.mozCancelAnimationFrame|| window.msCancelAnimationFrame;

if(raf&&!caf){
	var keyInfo = {};
	var oldraf = raf;
	raf = function(callback){
		function wrapCallback(){
			if(keyInfo[key]){
			callback();
			}
		}
		var key = oldraf(wrapCallback);
		keyInfo[key] = true;
		return key;
	};
	caf = function(key){
		delete keyInfo[key];
	};
} else if(!(raf&&caf)){
	raf = function(callback) { return window.setTimeout(callback, 16); };
	caf = window.clearTimeout;
}
window.requestAnimationFrame = raf;
window.cancelAnimationFrame = caf;

jindo.m = (function() {
	var _isVertical = null,
		_nPreWidth = -1,
		_nRotateTimer = null,
		_htHandler = {},
		_htDeviceInfo = {},
		_htAddPatch = {},
		_htOsInfo = {},
		_htBrowserInfo = {},
		_htTouchEventName = {
			start : 'mousedown',
			move : 'mousemove',
			end : 'mouseup',
			cancel : null
		},
		_htDeviceList = {
			"galaxyTab" : ["SHW-M180"],
			"galaxyTab2" : ["SHW-M380"],
			"galaxyS" : ["SHW-M110"],
			"galaxyS2" : ["SHW-M250","GT-I9100"],
			"galaxyS2LTE" : ["SHV-E110"],
			"galaxyS3" : ["SHV-E210", "SHW-M440", "GT-I9300"],
			"galaxyNote" : ["SHV-E160"],
			"galaxyNote2" : ["SHV-E250"],
			"galaxyNexus" : ["Galaxy Nexus"],
			"optimusLte2" : ["LG-F160"],
			"optimusVu" : ["LG-F100"],
			"optimusLte" : ["LG-LU6200", "LG-SU640", "LG-F120K"]
		};

	/**
		 터치이벤트 명 정제
	 */
	function _initTouchEventName() {
		if('ontouchstart' in window){
			_htTouchEventName.start = 'touchstart';
			_htTouchEventName.move  = 'touchmove';
			_htTouchEventName.end = 'touchend';
			_htTouchEventName.cancel = 'touchcancel';
		} else if(window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) {
			_htTouchEventName.start = 'MSPointerDown';
			_htTouchEventName.move  = 'MSPointerMove';
			_htTouchEventName.end = 'MSPointerUp';
			_htTouchEventName.cancel = 'MSPointerCancel';
		}
	}

	/**
		 resize 이벤트 정제해서 리턴.
		@return {String} 이벤트명
		@date 2011. 11. 11
		@author sculove
	 */
	function _getOrientationChangeEvt(){
		var bEvtName = 'onorientationchange' in window ? 'orientationchange' : 'resize';
		/**
		 * andorid 버그
		 * 2.3에서는 orientationchange 이벤트가 존재하나, orientationchange를 적용할 경우, width와 height가 바꿔서 나옴 (setTimeout 500ms 필요)
		 *  : 삼성안드로이드 2.3에서는 방향전환을 resize 이벤트를 이용하여 확인할 경우,
		 *    만약, 사용자가 window에 resize이벤트를 bind할 경우 브라우저가 죽는 버그가 있음
		 * 2.2에서는 orientationchange 이벤트가 2번 발생함. (처음에는 width,height가 바뀌고, 두번째는 정상적으로 나옴)
		 * 그 이하는 resize로 처리
		 * in-app 버그
		 * in-app인 경우 orientationChange발생시, width,height값이 바꿔서 나옴 (setTimeout 200ms 필요)
		 */
		if( (_htOsInfo.android && _htOsInfo.version === "2.1") ) {//|| htInfo.galaxyTab2) {
			bEvtName = 'resize';
		}
		return bEvtName;
	}

	/**
		디바이스 기기의 가로,세로 여부를 판단함.
		@date 2011. 11. 11
		@author sculove
	 */
	function _getVertical() {
		var bVertical = null,
			sEventType = _getOrientationChangeEvt();
		if(sEventType === "resize") {
			var screenWidth = document.documentElement.clientWidth;
			if(_nPreWidth == -1) {	// 최초 호출시.
				bVertical = screenWidth < document.documentElement.clientHeight;
			} else {
				if (screenWidth < _nPreWidth) {
					bVertical = true;
				} else if (screenWidth == _nPreWidth) {
					// if(!jindo.$Agent().navigator().mobile || jindo.$Agent().os().ipad) {
					// 	bVertical = screenWidth < document.documentElement.clientHeight;
					// } else {
					bVertical = _isVertical;
					// }
				} else {
					bVertical = false;
				}
			}
			_nPreWidth = screenWidth;
			// console.log("getVertical : resize로 판별 -> " + bVertical);
		} else {
			var windowOrientation = window.orientation;
			if (windowOrientation === 0 || windowOrientation == 180) {
				bVertical = true;
			} else if (windowOrientation == 90 || windowOrientation == -90) {
				bVertical = false;
			}
			// console.log("getVertical : orientationChange로 판별 -> " + bVertical);
		}
		return bVertical;
	}

	/**
		indo.m. 공통 이벤트 attach
		@date 2011. 11. 11
		@author sculove
	 */
	function _attachEvent() {
	   var fnOrientation = jindo.$Fn(_onOrientationChange, this).attach(window, _getOrientationChangeEvt()).attach(window, 'load');
	   var fnPageShow = jindo.$Fn(_onPageshow, this).attach(window, 'pageshow');
	}

	/**
		브라우저 정보와 버전 정보를 갖는 this._htDeviceInfo를 초기화한다
		@date 2011. 11. 11
		@modify 2012.03.05 bInapp 추가
		@modify 2012.05.09 android 버전 정규식 수정
		@modify oyang2 2012.07.30 optimus 추가
		@modify oyang2 2012.09.17 단말기 정보 추가
		@author oyang2, sculove
	 */
	function _initDeviceInfo() {
		// 1.8.0 이전 deprecate
		// _htOsInfo = jindo.$Agent().os();
		// _htBrowserInfo = jindo.$Agent().navigator();
		_setOsInfo();
		_setBrowserInfo();

		var sName = navigator.userAgent;
		var ar = null;
		function f(s,h) {
			return ((h||"").indexOf(s) > -1);
		}
		_htDeviceInfo = {
			"iphone" : _htOsInfo.iphone,
			"ipad" : _htOsInfo.ipad,
			"android" : _htOsInfo.android,
			"win" : f('Windows Phone', sName),
			"galaxyTab" : /SHW-M180/.test(sName),
			"galaxyTab2" : /SHW-M380/.test(sName),
			"galaxyS" : /SHW-M110/.test(sName),
			"galaxyS2" : /SHW-M250|GT-I9100/.test(sName),
			"galaxyS2LTE" : /SHV-E110/.test(sName),
			"galaxyS3" : /SHV-E210|SHW-M440|GT-I9300/.test(sName),
			"galaxyNote" : /SHV-E160/.test(sName),
			"galaxyNote2" : /SHV-E250/.test(sName),
			"galaxyNexus" : /Galaxy Nexus/.test(sName),
			"optimusLte2" : /LG-F160/.test(sName),
			"optimusVu" : /LG-F100/.test(sName),
			"optimusLte" : /LG-LU6200|LG-SU640|LG-F120K'/.test(sName),
			"galaxyS4" : /SHV-E300|GT-I9500|GT-I9505|SGH-M919|SPH-L720|SGH-I337|SCH-I545/.test(sName),
			"bChrome" : _htBrowserInfo.chrome,
			"bSBrowser" : _htBrowserInfo.bSBrowser,
			"bInapp" : false,
			"version" : _htOsInfo.version,
			"browserVersion" : _htBrowserInfo.version
		};

		// device name 설정
		for(var x in _htDeviceInfo){
			if (typeof _htDeviceInfo[x] == "boolean" && _htDeviceInfo[x] && _htDeviceInfo.hasOwnProperty(x)) {
				if(x[0] !== "b") {
					_htDeviceInfo.name = x;
				}
			}
		}

		//제조사 추가
		_htDeviceInfo["samsung"] = /GT-|SCH-|SHV-|SHW-|SPH|SWT-|SGH-|EK-|Galaxy Nexus|SAMSUNG/.test(sName);
		_htDeviceInfo["lg"] = /LG-/.test(sName);
		_htDeviceInfo["pantech"] = /IM-/.test(sName);

		//inapp여부 추가.true 일경우는 확실한 inapp이며,false - 웹브라우저 혹은 알수없는 경우
		if(_htDeviceInfo.iphone || _htDeviceInfo.ipad) {
			 if(!f('Safari', sName)){
				 _htDeviceInfo.bInapp = true;
			 }
		}else if(_htDeviceInfo.android){
			sName = sName.toLowerCase();
			if( f('inapp', sName) || f('app', sName.replace('applewebkit',''))){
				_htDeviceInfo.bInapp = true;
			}
		}
	}

	/**
	 * os 정보 조회
	 *      jindo.$Agent().os() 정보를 이용하며 info 데이터 또한 동일하다.
	 *      하지만 version 정보는 jindo 2.3.0 이상부터 지원하고 있어 이를 보완하는 작업 진행
	 */
	function _setOsInfo(){
		_htOsInfo = jindo.$Agent().os();
		_isInapp();
		_htOsInfo.version = _htOsInfo.version || _getOsVersion();
		_htOsInfo.ios = typeof _htOsInfo.ios == "undefined" ? (_htOsInfo.ipad || _htOsInfo.iphone) : _htOsInfo.ios;
	}

	/**
	 *  browser 정보 조회
	 *      jindo.$Agent().navigator() 정보를 이용하며 info 데이터 또한 동일하다.
	 *      SBrowser 정보 추가로 browser 정보에 SBrowser 정보 추가하는 함수 호출.
	 */
	function _setBrowserInfo(){
		_htBrowserInfo = jindo.$Agent().navigator();
		// iOS의 크롬인 경우 UA정보가 틀림.
		if(_htOsInfo.ios && /CriOS/.test(navigator.userAgent)) {
			_htBrowserInfo.chrome = true;
		}
		// FireFox인 경우 추가 (jindo 2.8.3 이하 버전에서 지원하지 않음)
		if(typeof _htBrowserInfo.firefox == "undefined") {
			_htBrowserInfo.firefox = /Firefox/.test(navigator.userAgent);
		}
		_isSBrowser();
		_updateUnderVersion();
	}

	/**
	 * 크롬 브라우저 User Agent 변경 (Safari -> Mobile Safari) 으로 인한 Jindo.2.8.2 이하 대응 - 2013.12.05 by mania
	 */
	function _updateUnderVersion(){
		if(_htBrowserInfo.msafari && _htBrowserInfo.chrome){
			if(_htOsInfo.ios) {
				_htBrowserInfo.version = parseFloat(navigator.userAgent.match(/CriOS[ \/]([0-9.]+)/)[1]);
			} else {
				_htBrowserInfo.version = parseFloat(navigator.userAgent.match(/Chrome[ \/]([0-9.]+)/)[1]);
			}
		} else if(_htBrowserInfo.firefox){
			_htBrowserInfo.version = parseFloat(navigator.userAgent.match(/Firefox[ \/]([0-9.]+)/)[1]);
		}
	}
	/**
	 *  inapp 여부 조회
	 *      _htOsInfo에 정보를 추가한다.
	 *      _htOsInfo.bInapp = true | false
	 */
	function _isInapp(){
		var sName = navigator.userAgent;
		_htOsInfo.bInapp = false;
		if(_htOsInfo.ios) {
			if(sName.indexOf('Safari') == -1 ){
				_htOsInfo.bInapp = true;
			}
		}else if(_htOsInfo.android){
			sName = sName.toLowerCase();
			if( sName.indexOf('inapp') != -1 || sName.replace('applewebkit','').indexOf('app') != -1){
				_htOsInfo.bInapp = true;
			}
		}
	}
	/**
	 *  samsung 기기 이면서 chrome 인 경우 galaxyS4 sbrowser 여부 판단
	 *      _htBrowserInfo 에 정보를 추가한다.
	 *      _htBrowserInfo.bSBrowser = true | false
	 */
	function _isSBrowser(){
		_htBrowserInfo.bSBrowser = false;
		var sUserAgent = navigator.userAgent;
		var aMatchReturn = sUserAgent.match(/(SAMSUNG|Chrome)/gi) || "";
		if(aMatchReturn.length > 1){
			_htBrowserInfo.bSBrowser = true;
		}
	}

	/**
	 *  디바이스 버전
	 *  @return {String} 디바이스 버전 정보
	 */
	function _getOsVersion(){
		if(!_htOsInfo.version){
			var sName = navigator.userAgent,
				sVersion = "",
				ar;

			if(_htOsInfo.iphone || _htOsInfo.ipad){
				ar = sName.match(/OS\s([\d|\_]+\s)/i);
				if(ar !== null&& ar.length > 1){
					sVersion = ar[1];
				}
			} else if(_htOsInfo.android){
				ar = sName.match(/Android\s([^\;]*)/i);
				if(ar !== null&& ar.length > 1){
					sVersion = ar[1];
				}
			} else if(_htOsInfo.mwin){
				ar = sName.match(/Windows Phone\s([^\;]*)/i);
				if(ar !== null&& ar.length > 1){
					sVersion = ar[1];
				}
			}
			return sVersion.replace(/\_/g,'.').replace(/\s/g, "");
		}
	}

	/**
		가로,세로 변경 여부 확인
		@date 2011. 11. 11
		@author sculove
		@history 1.13.0 Bug iOS 에서 키패드가 나타난 상태에서 rotate 시 정상적으로 처리되지 않는 이슈 수정
		@history 1.8.0 Update 안드로이드 orientattionChange 의 delay 값을 정수가 아닌 상태 변화에 따르도록 대응.
	 */
	function _onOrientationChange(we) {
		var self = this;
		if(we.type === "load") {
			_nPreWidth = document.documentElement.clientWidth;
			/**
			 * 웹 ios에서는 사이즈가 아닌 orientationChange로 확인
			 * 왜? iphone인 경우, '개발자콘솔'이 설정된 경우 초기 처음 오동작
			 */
			if(!_htOsInfo.bInapp && ( _htOsInfo.iphone || _htOsInfo.ipad || _getOrientationChangeEvt() !== "resize")) {    // 웹ios인 경우
				_isVertical = _getVertical();
			} else {
				if(_nPreWidth > document.documentElement.clientHeight) {
					_isVertical = false;
				} else {
					_isVertical = true;
				}
			}
			// console.log("Rotate init isVertical : " + this._isVertical);
			return;
		}
		if (_getOrientationChangeEvt() === "resize") { // android 2.1 이하...
			// console.log("Rotate Event is resize");
			setTimeout(function(){
				_orientationChange(we);
			}, 0);
		} else {
			var screenWidth = jindo.$Document().clientSize().width;
			var nTime = 300;
			if(_htDeviceInfo.android) {  // android 2.2이상
				if (we.type == "orientationchange" && screenWidth == _nPreWidth) {
					setTimeout(function(){
					_onOrientationChange(we);
					}, 500);
					return false;
				}
				_nPreWidth = screenWidth;
				// nTime = 200;
			}
			clearTimeout(_nRotateTimer);
			_nRotateTimer = setTimeout(function() {
				_orientationChange(we);
			},nTime);
			//console.log("Rotate Event is orientationChange");
		}
	}

	/**
		현재 폰의 위치가 가로인지 세로인지 확인
		@date 2011. 11. 11
		@author sculove
	 */
	function _orientationChange(we) {
		var nPreVertical = _isVertical;
		_isVertical = _getVertical();
		//console.log("회전 : " + nPreVertical + " -> " + this._isVertical);
		if (jindo.$Agent().navigator().mobile || jindo.$Agent().os().ipad) {
			if (nPreVertical !== _isVertical) {
				we.sType = "rotate";
				we.isVertical = _isVertical;
				_fireEvent("mobilerotate", we);
			}
		// } else {    // PC일 경우, 무조건 호출
		//     _fireEvent("mobilerotate", {
		//         isVertical: _isVertical
		//     });
		}
	}

	/**
		 pageShow 이벤트
		 @date 2011. 11. 11
		 @author sculove
	 */
	function _onPageshow(we) {
		// pageShow될 경우, 가로/세로 여부를 다시 확인
		_isVertical = _getVertical();
		we.sType = "pageShow";
		setTimeout(function() {
			_fireEvent("mobilePageshow", we);
		},300);
	}

	/**
		WebKitCSSMatrix를 이용하여 left, top 값을 추출
		@return {HashTable} top, left
	 */
	function _getTranslateOffsetFromCSSMatrix(element) {
		var curTransform  = new WebKitCSSMatrix(window.getComputedStyle(element).webkitTransform);
		return {
			top : curTransform.m42,
			left : curTransform.m41
		};
	}

	function _fireEvent(sType, ht) {
		if(_htHandler[sType]) {
			var aData = _htHandler[sType].concat();
			for (var i=0, len=aData.length; i < len; i++){
				aData[i].call(this, ht);
			}
		}
	}

	/**
		transform에서 translate,translate3d의 left와 top 값을 추출
		@return {HashTable} top,left
	 */
	function _getTranslateOffsetFromStyle(element) {
		var nTop = 0,
			nLeft = 0,
			aTemp = [],
			aTransValue = [],
			s = element.style[jindo.m.getCssPrefix() == "" ? "transform" : jindo.m.getCssPrefix() + "Transform"];
		if(!!s && s.length >0){
		    if(/translate[XY]/.test(s)){
		        var aTx = s.match(/translateX\(([-0-9px]*)\)/);
		        var aTy = s.match(/translateY\(([-0-9px]*)\)/);
		        aTransValue.push(!!aTx && aTx.length > 1 ? aTx[1] : "0px");
		        aTransValue.push(!!aTy && aTy.length > 1 ? aTy[1] : "0px");
		        aTemp[1] = aTransValue.join(",");
		    }
            else{
    			aTemp = s.match(/translate.{0,2}\((.*)\)/);
            }
			if(!!aTemp && aTemp.length >1){
				var a = aTemp[1].split(',');
				if(!!a && a.length >1){
					nTop = parseInt(a[1],10);
					nLeft = parseInt(a[0],10);
				}
			}
		}
		return {
			top : nTop,
			left : nLeft
		};
	}

	// 내부 변수 m
	var __M__ = {
		/** MOVE 타입 */
		MOVETYPE : {
			0 : 'hScroll',
			1 : 'vScroll',
			2 : 'dScroll',
			3 : 'tap',
			4 : 'longTap',
			5 : 'doubleTap',
			6 : 'pinch',
			7 : 'rotate',
			8 : 'pinch-rotate'
		},
		KITKAT_HIGHLIGHT_CLASS : '_jmc_no_tap_highlight_',
		KITKAT_HIGHLIGHT_ID : '_jmc_no_tap_highlight_tag_',
		sVersion : "unknown",   // deprecated (jindo.m.Component.VERSION 으로 이관)

		/** @lends jindo.m.prototype */
		/**
			초기화 함수

			@constructor
			@ignore
			@static
		**/
		$init : function() {
			_initDeviceInfo();
			_initTouchEventName();
			_attachEvent();

			// make styleTag for Kitkat highlight Bug
			var elStyleTag = jindo.$(this.KITKAT_HIGHLIGHT_ID);
			if(!elStyleTag) {
				elStyleTag = document.createElement('style');
				var elHTML = document.getElementsByTagName('html')[0];
				elStyleTag.type = "text/css";
				elStyleTag.id = this.KITKAT_HIGHLIGHT_ID;
				elHTML.insertBefore(elStyleTag, elHTML.firstChild);
				var oSheet = elStyleTag.sheet || elStyleTag.styleSheet;
				oSheet.insertRule('.' + this.KITKAT_HIGHLIGHT_CLASS + ' { -webkit-tap-highlight-color: rgba(0,0,0,0); }', 0);
				oSheet.insertRule('.' + this.KITKAT_HIGHLIGHT_CLASS + ' * { -webkit-tap-highlight-color: rgba(0,0,0,0); }', 0);
			}
		},

		/**
			모바일 기기 회전시, 적용할 함수를 bind 함

			@method bindRotate
			@param {Object} fHandlerToBind
			@return {Object} oEvent jindo.$Event object
			    @return {Boolean} ."isVertical" 세로 여부
			    @return {String} ."sType" 이벤트 발생 type. "rotate"
			@history 1.10.0 Bug rotate 핸들러 안에서 자신을 dettach, attach했을 경우 버그 수정
			@history 1.8.0 Update 이벤트발생시 sType속성에 'rotate' 으로 표기되도록 수정
			@history 1.7.0 Bug PC일 경우, 초기 로딩시 rotate이벤트가 발생하는 문제 제거
			@history 0.9.5 Bug rotate 인식오류 문제 해결
			@date 2011. 11. 11
			@author sculove
			@example
				var f = jindo.$Fn(this.setSize, this).bind();

				jindo.m.bindRotate(f);  // bind함
				jindo.m.unbindRotate(f);    // unbind함
		**/

		bindRotate : function(fHandlerToBind) {
			var aHandler = _htHandler["mobilerotate"];
			if (typeof aHandler == 'undefined'){
				aHandler = _htHandler["mobilerotate"] = [];
			}
			aHandler.push(fHandlerToBind);
		},
		/**
			모바일 기기 회전시, 적용할 함수를 unbind 함

			@method unbindRotate
			@param {Object} fHandlerToUnbind
			@date 2011. 11. 11
			@author sculove
			@example
				var f = jindo.$Fn(this.setSize, this).bind();

				jindo.m.bindRotate(f);  // bind함
				jindo.m.unbindRotate(f);    // unbind함
		**/
		unbindRotate : function(fHandlerToUnbind) {
			var aHandler = _htHandler["mobilerotate"];
			if (aHandler) {
				for (var i = 0, fHandler; (fHandler = aHandler[i]); i++) {
					if (fHandler === fHandlerToUnbind) {
						aHandler.splice(i, 1);
						break;
					}
				}
			}
		},

		/**
			pageshow호출, 함수 bind

			@method bindPageshow
			@param {Object} fHandlerToBind
			@return {Object} oEvent jindo.$Event object
			    @return {String} ."sType" 이벤트 발생 type. "pageShow"
			@history 1.10.0 Bug pageshow 핸들러 안에서 자신을 dettach, attach했을 경우 버그 수정
			@history 1.9.0 Update 이벤트발생시 persisted 속성 제공
			@history 1.8.0 Update 이벤트발생시 sType속성에 'pageShow' 으로 표기되도록 수정
			@history 1.8.0 Bug pageshow 이벤트 바인드되지 않는 오류 수정
			@history 0.9.5 Update Method 추가
			@author sculove
			@date 2011. 11. 11
			@example
				var f = jindo.$Fn(this.setSize, this).bind();

				jindo.m.bindPageshow(f);    // bind함
				jindo.m.unbindPageshow(f);  // unbind함
		**/
		bindPageshow : function(fHandlerToBind) {
			var aHandler = _htHandler["mobilePageshow"];
			if (typeof aHandler == 'undefined'){
				aHandler = _htHandler["mobilePageshow"] = [];
			}
			aHandler.push(fHandlerToBind);
			// this.attach("mobilePageshow", fHandlerToBind);
		},

		/**
			pageshow호출, 함수 unbind

			@method unbindPageshow
			@param {Object} fHandlerToBind
			@history 0.9.5 Update Method 추가
			@author sculove
			@date 2011. 11. 11
			@example
				var f = jindo.$Fn(this.setSize, this).bind();

				jindo.m.bindPageshow(f);    // bind함
				jindo.m.unbindPageshow(f);  // unbind함
		**/
		unbindPageshow : function(fHandlerToUnbind) {
			var aHandler = _htHandler["mobilePageshow"];
			if (aHandler) {
				for (var i = 0, fHandler; (fHandler = aHandler[i]); i++) {
					if (fHandler === fHandlerToUnbind) {
						aHandler.splice(i, 1);
						break;
					}
				}
			}
		},

		/**
			브라우저 정보와 버전 정보를 제공한다.

			@method getDeviceInfo
			@author oyang2, sculove
			@date 2011. 11. 11
			@deprecated
			@return {Object}
			@history 1.8.0 deprecated getDeviceName() 을 통해 갤럭시, 옵티머스 등의 정보는 얻을 수 있고, iphone, android, version 정보등은 $jindo.$agent() 정보로 확인한다.
			@history 1.7.0 Bug 갤럭시S4, bSBrowser, browserVersion 속성 추가
			@history 1.7.0 Bug name 잘못 나오는 오류 수정
			@history 1.7.0 Bug 갤럭시S3 해외판(GT-I9300) 갤럭시S3로 인지못하는 버그 수정
			@history 1.6.0 Bug name에 제조사 이름이 들어가는 버그 수정
			@history 1.5.0 Upate win,galaxyNote2 속성 추가
			@history 1.5.0 Upate samsung, lg 속성 추가
			@history 1.5.0 Upate pentech 속성 추가
			@history 1.4.0 Upate 단말기 정보(samsung, lg, pentech) 추가
			@history 1.3.5 Upate 단말기 속성 추가<br /> (optimusLte, optimusLte2, optimusVu)
			@history 1.2.0 Upate bChrome 속성 추가
			@history 1.1.0 Upate bInapp 속성 추가,<br /> galaxyTab2 속성 추가
			@history 0.9.5 Upate bInapp galaxyU 속성 추가<br /> galaxyS 속성 추가
			@example
				jindo.m.getDeviceInfo().iphone      //아이폰 여부
				jindo.m.getDeviceInfo().ipad        //아이패드 여부
				jindo.m.getDeviceInfo().android  //안드로이드 여부
				jindo.m.getDeviceInfo().galaxyTab   //갤럭시탭 여부
				jindo.m.getDeviceInfo().galaxyTab2  //갤럭시탭2 여부
				jindo.m.getDeviceInfo().galaxyS  //갤럭시S 여부
				jindo.m.getDeviceInfo().galaxyS2    //갤럭시S2 여부
				jindo.m.getDeviceInfo().galaxyS2LTE    //갤럭시S2 LTE 여부
				jindo.m.getDeviceInfo().galaxyNexus    //갤럭시 넥서스 LTE 여부
				jindo.m.getDeviceInfo().optimusLte2    //옵티머스 LTE2 여부
				jindo.m.getDeviceInfo().optimusVu    //옵티머스뷰 여부
				jindo.m.getDeviceInfo().optimusLte    //옵티머스 LTE 여부
				jindo.m.getDeviceInfo().version  //안드로이드, 아이폰시 버젼정보 제공
				jindo.m.getDeviceInfo().bChrome  //크롬 브라우저 여부
				jindo.m.getDeviceInfo().bInapp      //인앱여부, true- 인앱, false - 웹브라우저 혹은 알수없는 경우
				jindo.m.getDeviceInfo().win        //MS Window 인경우
				jindo.m.getDeviceInfo().pantech    //팬텍 단말기인 경우
				jindo.m.getDeviceInfo().samsung    //삼성 단말기인 경우
				jindo.m.getDeviceInfo().lg          //엘지 단말기인 경우
				jindo.m.name                        //현재 단말기기 정보제공
		**/
		getDeviceInfo : function(){
			return _htDeviceInfo;
		},

		/**
		 * OS 정보 반환을 위한 함수
		 * @method getOsInfo
		    @return {Object} jindo.$Agent().os() object
		        @return {Boolean} ."bInapp" 인앱 여부
		 *
		 *  @history 1.10.0 New ios 속성 추가
		 *  @history 1.8.0 Update jindo.m 에서 Agent 체크 부분을 jindo.$Agent().os() 로 이관. jindo.$Agent().os() 참고
		 */
		getOsInfo : function(){
			return _htOsInfo;
		},

		/**
		 * 브라우저 정보 반환을 위한 함수
		 * @method getBrowserInfo
		 * @return {Object} jindo.$Agent().navigator() object
		 *      @return {Boolean} ."bSBrowser" 삼성 브라우저 여부
		 * @history 1.8.0 Update jindo.m 에서 Agent 체크 부분을 jindo.$Agent().navigator() 로 이관, jindo.$Agent().navigator() 참고
		 * @history 1.13.0 Bug 크롬 for iOS에서 chome여부가 비정상적으로 반환되는 문제
		 */
		getBrowserInfo : function(){
			return _htBrowserInfo;
		},

		 /**
			현재 모바일기기의 가로,세로 여부를 반환한다.

			@method isVertical
			@author sculove
			@return {Boolean} 수직 여부 반환. 세로일때 true
			@history 1.15.0 Bug PC에뮬레이터에서 정상적으로 나오지 않는 문제 수정
			@history 1.9.0 Bug pageShow되었을 경우, 가로/세로 여부의 기존 정보를 유지하는 버그
			@history 1.3.0 Bug 페이지 캐쉬될 경우, rotate 값이 갱신되지 않는 버그 수정
			@history 1.1.0 Update 초기 로드시 가로일경우 값이 제대로 나오지 않는 문제 해결
			@example
				jindo.m.isVertical; // 수직여부 반환

		**/
		isVertical : function() {
			if(_isVertical === null) {
				_isVertical = _getVertical();
				return _isVertical;
			} else {
				return _isVertical;
			}
		},

		/**
			TextNode를 제외한 상위노드를 반환한다.

			@return {HTMLElement} el
			@date 2011. 11. 11
			@method getNodeElement
			@deprecated
			@history 1.5.0 Update deprecated
			@history 0.9.5 Update Method 추가
			@author oyang2
			@example
				var elParent=jindo.m.getNodeElement(el); // TextNode를 제외한 상위노드를 반환한다.
		**/
		getNodeElement : function(el){
			while(el.nodeType != 1){
				el = el.parentNode;
			}
			return el;
		},

		/**
			현재 Element의 offet을 구한다.

			@method getTranslateOffset
			@date 2011. 11. 11
			@author sculove
			@param {jindo.$Element|HTMLElement} element  ComputedStyle 값을 이용하여 offset을 얻는 함수
			@return {Object} {top,left}
			@history 1.8.0 Update getCssOffset -> getTranslateOffset 으로 변경
			@history 1.1.0 Update 웹킷 이외의 브라우저도 처리 가능하도록 기능 개선
			@example
				var oObject=jindo.m.getTranslateOffset(el); // CSSOffset을 반환한다.
		**/
		getTranslateOffset : function(wel){
			wel = jindo.$Element(wel);

			var element = wel.$value(),
				htOffset;
			/** Andorid 3.0대에서는 WebKitCSSMatrix가 있지만, 안됨. 버그 */
			if(_htOsInfo.android && parseInt(_htOsInfo.version,10) === 3) {
			   htOffset = _getTranslateOffsetFromStyle(element);
			} else {
			   if('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()){
				  htOffset = _getTranslateOffsetFromCSSMatrix(element);
			   } else {
				  htOffset = _getTranslateOffsetFromStyle(element);
			   }
			}
			return htOffset;
		},


		/**
			Style의 left,top을 반환함
			@date 2013. 5. 10
			@author sculove
			@method getStyleOffset
			@history 1.8.0 Update Method 추가
			@param {jindo.$Element} wel
			@return {Object} {top,left}
		**/
		getStyleOffset : function(wel) {
			var nLeft = parseInt(wel.css("left"),10),
			  nTop = parseInt(wel.css("top"),10);
			nLeft = isNaN(nLeft) ? 0 : nLeft;
			nTop = isNaN(nTop) ? 0 : nTop;
			return {
			  left : nLeft,
			  top : nTop
			};
		},
		/**
			TransitionEnd 이벤트 bind

			@method attachTransitionEnd
			@author sculove, oyang2
			@date 2011. 11. 11
			@param {HTMLElement} element attach할 엘리먼트
			@param {Function} fHandlerToBind attach할 함수
			@example
				jindo.m.attachTransitionEnd(el, function() { alert("attach"); }); // el에 transitionEnd 이벤트를 attach한다.
				jindo.m.detachTransitionEnd(el, function() { alert("detach"); }); // el에 transitionEnd 이벤트를 detach한다.

		**/
		attachTransitionEnd : function(element,fHandlerToBind) {
			var nVersion = (jindo.$Jindo.VERSION || jindo.$Jindo().version || jindo.VERSION).replace(/[a-z.]/gi,"");
			// console.log(nVersion);
			/* 진도 1.5.1에서 정상 동작. 그 이하버젼은 버그 */
			if(nVersion > 230) {   // jindo
				element._jindo_fn_ = jindo.$Fn(fHandlerToBind,this).attach(element, "transitionend");
			} else {
				var sEvent = ((this.getCssPrefix() === "ms")? "MS": this.getCssPrefix()) + "TransitionEnd";
				element.addEventListener(sEvent, fHandlerToBind, false);
			}
		},

		/**
			TransitionEnd 이벤트 unbind

			@method detachTransitionEnd
			@date 2011. 11. 11
			@author sculove, oyang2
			@param {HTMLElement} element dettach할 엘리먼트
			@param {Function} fHandlerToUnbind dettach할 함수
			@example
				jindo.m.attachTransitionEnd(el, function() { alert("attach"); }); // el에 transitionEnd 이벤트를 attach한다.
				jindo.m.detachTransitionEnd(el, function() { alert("detach"); }); // el에 transitionEnd 이벤트를 detach한다.
		**/
		detachTransitionEnd : function(element, fHandlerToUnbind) {
			var nVersion = (jindo.$Jindo.VERSION || jindo.$Jindo().version || jindo.VERSION).replace(/[a-z.]/gi,"");
			// console.log(nVersion);
			/* 진도 1.5.1에서 정상 동작. 그 이하버젼은 버그 */
			if(nVersion > 230) {   // jindo
				if(element._jindo_fn_) {
					element._jindo_fn_.detach(element, "transitionend");
					delete element._jindo_fn_;
				}
			} else {
				var sEvent = ((this.getCssPrefix() === "ms")? "MS": this.getCssPrefix()) + "TransitionEnd";
				element.removeEventListener(sEvent, fHandlerToUnbind, false);
			}
		},

		/**
			 MSPointerEvent 처럼 신규 이벤트들이 2.3.0이하 진도에서 attach안되는 문제를 해결하기 위한 코드
			jindo 2.4.0 이상 버전에서는 사용가능, 하위 버전에서는 _notSupport namespace  진도 사용
			@date 2012. 12.06
			@author oyang2
			@example
			jindo.m._attachFakeJindo(el, function(){alert('MSPointerDown'), 'MSPointerDown' });a
		 */
		_attachFakeJindo : function(element, fn, sEvent){
			var nVersion = (jindo.$Jindo.VERSION || jindo.$Jindo().version || jindo.VERSION).replace(/[a-z.]/gi,"");
			var wfn = null;
			if(nVersion < 230 && (typeof _notSupport !== 'undefined')) {
				//use namespace jindo
				wfn = _notSupport.$Fn(fn).attach(element, sEvent);
			}else{
				//use jindo
				wfn = jindo.$Fn(fn).attach(element, sEvent);
			}
			return wfn;
		},

		/*
			브라우저별 대처 가능한 이벤트명을 리턴한다.
			@date 2012. 12.06
			@author oyang2
			@example
			jindo.m._getTouchEventName();
		*/
		_getTouchEventName : function(){
			return  _htTouchEventName;
		},

		/**
			브라우저 CssPrefix를 얻는 함수

			@method getCssPrefix
			@author sculove
			@date 2011. 11. 11
			@return {String} return cssPrefix를 반환. webkit, Moz, O,...
			@history 0.9.5 Update Method 추가
			@example
				jindo.m.getCssPrefix(); // 브라우저별 prefix를 반환한다.
		**/
		getCssPrefix : function() {
			var sCssPrefix = "";
			if(typeof document.body.style.webkitTransition !== "undefined") {
				sCssPrefix = "webkit";
			} else if(typeof document.body.style.transition !== "undefined") {
			} else if(typeof document.body.style.MozTransition !== "undefined") {
				sCssPrefix = "Moz";
			} else if(typeof document.body.style.OTransition !== "undefined") {
				sCssPrefix = "O";
			} else if(typeof document.body.style.msTransition !== 'undefined'){
				sCssPrefix = "ms";
			}
			jindo.m.getCssPrefix = function() {
				return sCssPrefix;
			};
			return sCssPrefix;
		},

		/**
			자신을 포함하여 부모노드중에 셀렉터에 해당하는 가장 가까운 엘리먼트를 구함

			@method getClosest
			@date 2012. 02. 20
			@author sculove
			@param {String} sSelector CSS클래스명 또는 태그명
			@param {HTMLElement} elBaseElement 기준이 되는 엘리먼트
			@return {HTMLElement} 구해진 HTMLElement
			@history 1.1.0 Update Method 추가
			@example
				jindo.m.getClosest("cssName", elParent);   // elParent하위에 cssName 클래스명이 아닌 첫번째 Element를 반환한다.
		**/
		getClosest : function(sSelector, elBaseElement) {
			//console.log("[_getClosest]", sSelector, elBaseElement)
			var elClosest;
			var welBaseElement = jindo.$Element(elBaseElement);

			var reg = /<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig;
			if (reg.test(sSelector)) {
				// 태그 일경우
				 if("<" + elBaseElement.tagName.toUpperCase() + ">" == sSelector.toUpperCase()) {
					 elClosest = elBaseElement;
				 } else {
					 elClosest = welBaseElement.parent(function(v){
						 if("<" + v.$value().tagName.toUpperCase() + ">" == sSelector.toUpperCase()) {
							//console.log("v", v)
							return v;
						}
					});
					elClosest = elClosest.length ? elClosest[0].$value() : false;
				 }
			} else {
				//클래스명일 경우
				 if(sSelector.indexOf('.') == 0) { sSelector = sSelector.substring(1,sSelector.length); }
				 if(welBaseElement.hasClass(sSelector)) {
					elClosest = elBaseElement;
				 } else {
					elClosest = welBaseElement.parent(function(v){
						if(v.hasClass(sSelector)) {
							//console.log("v", v)
							return v;
						}
					});
					elClosest = elClosest.length ? elClosest[0].$value() : false;
				}
			}
			//console.log("elClosest", elClosest)
			return elClosest;
		},

		/**
			CSS3d를 사용할수 있는 기기 값 불린 반환.
			@method useCss3d
			@return {Boolean} CSS3d를 사용할 수 있는 기기일 경우 true를 반환
			@since 2012. 6. 22
			@history 1.11.0 Update 갤럭시S2 4.0.4 에서 false나오는 문제 수정
			@history 1.8.0 Update 사용자가 패치하여 사용할 수 있도록 사용자 인터페이스 제공
			@history 1.7.0 Update Method 추가
			@history 1.7.0 Update 안드로이드 4.1이상에서는 CSS3d가속을 사용하도록 변경 (안드로이드 4.1부터는 BlackList 기반)<br/>
			네이버 메인 호환 장비 추가 등록
		**/
		useCss3d : function() {
			if(_htAddPatch.useCss3d && typeof _htAddPatch.useCss3d == "function"){
				switch (_htAddPatch.useCss3d()){
					case -1 :
						return false;
					case 1 :
						return true;
				}
			}
			var bRet = false;
			// chrome (less then 25) has a text blur bug.
			// but samsung sbrowser fix it.
			if(_htBrowserInfo.chrome && _htBrowserInfo.version < "25" && !_htBrowserInfo.bSBrowser) {
				return bRet;
			}
			if(_htOsInfo.ios) {
				bRet = true;
			} else if(_htBrowserInfo.firefox){
				bRet = true;
			} else if(_htOsInfo.android){
				// 해외 디바이스 agent 가 알고 있는 값과 다를 수 있으므로 예외 처리. - by mania
				var s = navigator.userAgent.match(/\(.*\)/);
				if(s instanceof Array && s.length > 0){
					s=s[0];
				}
				if(_htOsInfo.version >= "4.1.0") {
					// android 4.1+ blacklist
					if(/EK-GN120|SM-G386F/.test(s)) {	// EK-GN120 : Galaxy Camera, SM-G386F : Galaxy Core LTE
						bRet = false;
					} else {
						bRet = true;
					}
				} else {

					// 짧은 거리(Flicking) 에서 4.0이상 인 경우 css3d : true.
					if(_htOsInfo.version >= "4.0"){
						bRet = true;
					}

					if(_htOsInfo.version >= "4.0.3" &&
						/SHW-|SHV-|GT-|SCH-|SGH-|SPH-|LG-F160|LG-F100|LG-F180|LG-F200|EK-|IM-A|LG-F240|LG-F260/.test(s) &&
						!/SHW-M420|SHW-M200|GT-S7562/.test(s)) {    // SHW-M420 : Galaxy Nexus , SHW-M200 : NexusS , GT-S7562 : Galaxy S duos
						bRet = true;
					}
				}
			}
			return bRet;
		},

		/**
		 *  jindo.m 을 사용자가 특정 인터페이스를 통해 사용할 수 있도록 제공하기 위한 패치 버전 정의<br />
		 * 입력한 버전보다 하위 JMC 에 대해서만 적용되며 상위 JMC 에 대해서는 적용되지 않는다.
		 *  @method patch
		 *
		 *  @param {String} ver     패치를 위한 패치 버전 정보
		 *  @history 1.8.0 Update   디바이스 정보를 사용자가 추가 및 업데이트 등을 위한 패치 함수 제공
		 */
		patch : function(ver){
			_htAddPatch.ver = ver;
			return this;
		},

		/**
		 *  컴포넌트의 버전과 패치 버전을 비교하여 등록 여부 결정
		 *  @return {Boolean}   버전을 비교하여 패치가 가능하다면 true, 아니면 false
		 */
		_checkPatchVersion : function(){
			var aVer = jindo.m.Component.VERSION.split("."),
				sVer = aVer.slice(0,3).join(".");
			if(_htAddPatch.ver >= sVer){
				return true;
			}
			return false;
		},

		/**
		 *  jindo.m 패치 인터페이스
		 * @method add
		 *
		 *  @paran {HashTable}  htOption    패치하고자 하는 {함수명, 함수} 형태로 정의
		 * @history 1.8.0 Update   디바이스 정보를 사용자가 추가 및 업데이트 등을 위한 add 함수 제공
		 *  @example
				jindo.m.patch("1.7.0").add({
					"useCss3d" : function(){
						if(jindo.$Agent().os().android){
							return 1;   // true
						}
						else if(jindo.$Agent().os().ios){
							return -1;  // false
						}else{
							return 0;   // continue
						}
					},
					"useTimingFunction" : function(){
						if(jindo.$Agent().os().android){
							return 1;   // true
						}
						else if(jindo.$Agent().os().ios){
							return -1;  // false
						}else{
							return 0;   // continue
						}
					},
					"hasClickBug" : function(){
						if(jindo.$Agent().os().android){
							return 1;   // true
						}
						else if(jindo.$Agent().os().ios){
							return -1;  // false
						}else{
							return 0;   // continue
						}
					},
					"getDeviceName" : function(){
						if(navigator.userAgent.indexOf("Galaxy Nexus") > -1){
							return "galaxyNexus";
						}
					},
					"useFixed" : function(){
						if(jindo.$Agent().os().android){
							return 1;   // true
						}
						else if(jindo.$Agent().os().ios){
							return -1;  // false
						}else{
							return 0;   // continue
						}
					},
					"hasOffsetBug" : function(){
						if(jindo.$Agent().os().android){
							return 1;   // true
						}
						else if(jindo.$Agent().os().ios){
							return -1;  // false
						}else{
							return 0;   // continue
						}
					}
				})
		 */
		add : function(htOption){
			if(this._checkPatchVersion()){
				for ( var i in htOption){
					_htAddPatch[i] = htOption[i];
				}
			}
			return this;
		},

		/**
		 *  디바이스 이름(galaxyS, optimusLTE 등..) 정보 반환
		 *  @method getDeviceName
		 *
		 *  @return {String}    디바이스 이름 - _htDeviceList에 정의되어 있는 key가 name 이 되어 반환된다.
		 *                              (디바이스 이름이 존재하지 않으면 iphone, ipad, android 등의 정보 반환한다.)
		 *  @history 1.8.0 Update   디바이스 이름 정보 반환을 위한 함수 추가
		 */
		getDeviceName : function(){
			if(_htAddPatch.getDeviceName && typeof _htAddPatch.getDeviceName == "function"){
				if(_htAddPatch.getDeviceName()){
					return _htAddPatch.getDeviceName();
				}
			}
			var sUserAgent = navigator.userAgent;
			for (var i in _htDeviceList){
				if(eval("/" + _htDeviceList[i].join("|") + "/").test(sUserAgent)){
					// _htDeviceInfo[i] = true;
					return i;
					break;
				}
			}

			// 아무런 정보도 넘어오지 않았을때 iphone, ipad, android 여부 리턴.
			var htInfo = jindo.$Agent().os();
			for ( var x in htInfo){
				if(htInfo[x] === true && htInfo.hasOwnProperty(x)){
					return x;
					break;
				}
			}
		},

		/**
			fixed  속성을 지원하는지 확인하는 함수
			@method useFixed
			@since 2012. 6. 22
			@return {Boolean} isFixed
			@history 1.8.0 Update 사용자가 패치하여 사용할 수 있도록 사용자 인터페이스 제공
			@history 1.7.0 Update Method 추가
			@remark
				1. ios
				- ios5 (scrollTo가 발생된 경우 랜더링 되지 않는 버그)
				2. android
				- 3.x 부터 지원함 (그전에도 지원했지만, 하이라이트 적용문제로 처리할 수 없음)
				scroll, flicking과 함께 사용할 경우, 깜빡거림
		**/
		useFixed : function() {
			if(_htAddPatch.useFixed && typeof _htAddPatch.useFixed == "function"){
				switch (_htAddPatch.useFixed()){
					case -1 :
						return false;
					case 1 :
						return true;
				}
			}

			var isFixed = false;
			if(_htBrowserInfo.chrome ||
				_htBrowserInfo.firefox ||
			   (_htOsInfo.android && parseInt(_htOsInfo.version,10) >= 3) ||
			   (_htOsInfo.ios && parseInt(_htOsInfo.version,10) >= 5) ||
			   (_htOsInfo.mwin && parseInt(_htOsInfo.version,10) >= 8)) {
				isFixed = true;
			}
			return isFixed;
		},



		/**
			TimingFunction를 사용할수 있는 기기 값 불린 반환.
			@method useTimingFunction
			@since 2012. 6. 30
			@history 1.13.0 Bug iOS 6,7 은 false 로 처리
			@history 1.11.0 Update iOS는 true로 변경 (애니메이션을 Morph로 변경후, iOS에서는 true로 변경)
			@history 1.10.0 Update iOS6.0 이상일 경우, timingFunction=false되도록 수정
			@history 1.8.0 Update 사용자가 패치하여 사용할 수 있도록 사용자 인터페이스 제공
			@history 1.7.1 Bug iOS6.0일 경우에만, timingFunction=false되도록 수정
			@history 1.7.0 Update Method 추가
			@return {Boolean} TimingFunction를 사용할 수 있는 기기일 경우 true를 반환
		**/
		useTimingFunction : function() {
			if(_htAddPatch.useTimingFunction && typeof _htAddPatch.useTimingFunction == "function"  && _htAddPatch.useTimingFunction()){
				switch (_htAddPatch.useTimingFunction()){
					case -1 :
						return false;
					case 1 :
						return true;
				}
			}

			var bUse = this.useCss3d();
			if(_htOsInfo.android) {
				bUse = false;
				// 해외 단말기 및 단말기 이슈로 인해 변경
//				if(!isLongRange && _htOsInfo.version >= "4.3"){
//					bUse = true;
//				}
			// iOS7+ : transition not working with scroll event
			} else if(_htOsInfo.ios && parseInt(_htOsInfo.version,10) >= 6) {
				bUse = false;
			}
			return bUse;
		},

		_cacheMaxClientSize : {},
		_fullSizeCheckElement : null,
		_allEventStop : function(fp, type) {
			if(!this._htEvent){
				this._htEvent = {};
			}
			if(type == "detach"){
				this._htEvent["touchstart"].detach(document.body, "touchstart").detach(document.body, "touchmove");
				this._htEvent = {};
			}else if(!this._htEvent["touchstart"] && type == "attach"){
				this._htEvent["touchstart"] = jindo.$Fn(fp, this).attach(document.body , "touchstart").attach(document.body, "touchmove");
			}
			// jindo.$Element(document.body)[type]("touchstart",fp)[type]("touchmove", fp);
		},

		_stopDefault : function(e){
			e.stop();
		},
		_hasOrientation : window.orientation !== undefined,


		/**
		 * 모바일 기기의 높이 full size 를 구하는 함수.
		 * 해당 함수 호출 시 주소창이 사라짐.
		 * 페이지 로드시 해당 함수 호출 시 터치가 되지 않는다는 문의로 초기화시 호출 여부의 변수 추가
		 *  bInit :  true(딜레이 없이 바로 사이즈 계산) / false (딜레이 후 사이즈 계산)
		 */
		_maxClientSize : function(fpCallBack, bInit) {
			//-@@$Document.clientSizeAsync-@@//
			var _htOsInfo = this.getOsInfo();

			this._allEventStop(this._stopDefault, "attach");
			if (!this._fullSizeCheckElement) {
				this._fullSizeCheckElement = document.createElement("div");
			}
			var delay = _htOsInfo.android ? 500 : 100;
			delay = bInit ? 1 : delay;

			var type;
			if (this._hasOrientation) {
				type = Math.abs(window.orientation / 90) % 2;
				delay = this._cacheMaxClientSize[type] !== undefined ? 0 : delay;
			}
			var that = this;
			if (document.body.scrollTop <= 1) {
					document.body.appendChild(that._fullSizeCheckElement);
					that._fullSizeCheckElement.style.cssText = 'position:absolute; top: 0px; width:100%;height:' + parseInt(window.innerHeight+200, 10) + 'px;';
					window.scrollTo(0, 1);
					setTimeout(function() {
						that._checkSize(that._hasOrientation, that._cacheMaxClientSize, type, fpCallBack, that, delay);
					}, delay);
			} else {
				this._fullSizeCheckElement.style.height = window.innerHeight + 'px';
				this._checkSize(this._hasOrientation, this._cacheMaxClientSize, type, fpCallBack, that, delay);
			}

		},

		_checkSize : function(hasOrientation, cacheMaxClientSize, type, fpCallBack, that, delay) {

			var _htOsInfo = this.getOsInfo();
			var _htBrowserInfo = this.getBrowserInfo();

			this._allEventStop(this._stopDefault, "attach");
			var size;
			if (hasOrientation && cacheMaxClientSize[type]) {
				size = cacheMaxClientSize[type];
			} else {

				that._fullSizeCheckElement.style.cssText = 'position:absolute; top: 0px; width:100%;height:' + window.innerHeight+ 'px;overflow:hidden';

				size = _htBrowserInfo.mobile || _htOsInfo.ipad ? {
					"width" : window.innerWidth,
					"height" : window.innerHeight
				} : {
					"width" : document.documentElement.clientWidth,
					"height" : document.documentElement.clientHeight
				};
				// console.log(size);
				if (hasOrientation) {
					cacheMaxClientSize[type] = size;
				}
			}

			fpCallBack.call(that, size);
			var self = this;
			this._allEventStop(this._stopDefault, "detach");
			if (delay === 0) {
				this._fullSizeCheckElement.style.height = "0px";
			} else {
				setTimeout(function() {
					self._fullSizeCheckElement.style.height = "0px";
				}, delay);
			}
		},


		/**
			엘리먼트 offset 변경 이후, 하이라이트/롱탭/클릭 이 기존 offset에서 발생하는 버그를 가지고 있는 지 판단
			@date 2013.05.10
			@method hasOffsetBug
			@return {Boolean}
			@author sculove
			@history 1.10.0 Bug patch 적용이 안되는 버그 수정
			@history 1.8.0 Update Method 추가
		 */
		hasOffsetBug : function() {
			if(_htAddPatch.hasOffsetBug && typeof _htAddPatch.hasOffsetBug == "function"){
				switch (_htAddPatch.hasOffsetBug()){
					case -1 :
						return false;
					case 1 :
						return true;
				}
			}
			var bResult = false;
			if(_htOsInfo.android) {
				if(_htBrowserInfo.chrome || _htBrowserInfo.firefox) {
					bResult = false;
				} else {
					if(_htOsInfo.version < "4") {
						bResult = true;
					} else {
						bResult = false;
					}
				}
			} else {
				bResult = false;
			}
			return bResult;
		},

		/**
			터치이벤트에 따라 엘리먼트 애니메이션 진행후 클릭되는 이슈를 가진 브라우저인지 판단
			@date 2012.11.05
			@method hasClickBug
			@return {Boolean}
			@author sculove
			@history 1.9.0 Bug Window8 IE10 확인 모듈 수정
			@history 1.8.0 Update Method 추가
		 */
		hasClickBug : function(){
			if(_htAddPatch.hasClickBug && typeof _htAddPatch.hasClickBug == "function"){
				switch (_htAddPatch.hasClickBug()){
					case -1 :
						return false;
					case 1 :
						return true;
				}
			}

			// (_htOsInfo.mwin && ((_htOsInfo.version *1) >= 8)
			return ( _htOsInfo.ios || (window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) || false );
		},

		_getTranslate : function(sX, sY, bUseCss3d) {
			bUseCss3d = (typeof bUseCss3d == "undefined" ? true : bUseCss3d);
			return "translate" + (bUseCss3d ? "3d(" : "(") + sX + "," + sY + (bUseCss3d ? ",0)" : ")");
		},

		_toPrefixStr : function(str) {
			if(str.length <= 0) {
				return str;
			}
			str = this.getCssPrefix() == "" ? str.charAt(0).toLowerCase() + str.substr(1) : str.charAt(0).toUpperCase() + str.substr(1);
			return this.getCssPrefix() + str;
		},

		// jindo 2.10.0 이후에 offset 버그가 해결됨. 그 여부를 확인하는 함수
		_hasJindoOffsetBug : function() {
			return !(jindo.$Element.prototype.offset_get && jindo.$Element.prototype.offset_get.toString().indexOf("fpSafari") == -1);
		},

		// kitkat 에서 플리킹시 하이라이트 잔상이 생기는 문제
		_hasKitkatHighlightBug : function() {
			if(_htAddPatch._hasKitkatHighlightBug && typeof _htAddPatch._hasKitkatHighlightBug == "function"){
				switch (_htAddPatch._hasKitkatHighlightBug()){
					case -1 :
						return false;
					case 1 :
						return true;
				}
			}
			return (_htBrowserInfo.chrome && !_htBrowserInfo.bSBrowser  && _htBrowserInfo.version < 35);
		}
	};
	__M__._isUseFixed = __M__.useFixed;
	__M__._isUseTimingFunction = __M__.useTimingFunction;
	__M__._isUseCss3d = __M__.useCss3d;
	__M__.getCssOffset = __M__.getTranslateOffset;
	__M__.$init();
	return __M__;
})();

/*
	@jindo 2.2.0
	@since 1.10.0
 */
if(!("mixin" in jindo.$Jindo)) {
	jindo.$Jindo.mixin = function(oDestination, oSource){
		var oReturn = {};

		for(var i in oDestination){
			oReturn[i] = oDestination[i];
		}

		for (i in oSource) if (oSource.hasOwnProperty(i) && typeof oSource[i] != "undefined") {
			oReturn[i] = oSource[i];
		}
		return oReturn;
	};
}
/**
    @fileOverview 진도 컴포넌트를 구현하기 위한 코어 클래스
    @version 1.17.0
    @since 2011. 7. 13.
**/

/**
    진도 모바일 컴포넌트를 구현하기 위한 코어 클래스.
    다른 컴포넌트가 상속받는 용도로 사용된다.

    @class jindo.m.Component
    @uses jindo.m
    @keyword component, base, core
    @group Component
    @update
    @invisible
**/
jindo.m.Component = jindo.$Class({
	/** @lends jindo.m.Component.prototype */

	_htEventHandler : null,
	_htOption : null,

	/**
		jindo.m.Component를 초기화한다.
		
		@constructor
	**/
	$init : function() {
		this._htEventHandler = {};
		this._htOption = {};
		this._htOption._htSetter = {};

		this.constructor.$count = (this.constructor.$count || 0) + 1;
	},
	
	/**
		옵션 값을 가져온다. 
		
		@method option
		@param {String} sName 옵션의 이름
		@return {Variant} 옵션의 값
	**/
	/**
		옵션 값을 설정한다. 
		htCustomEventHandler 옵션을 선언해서 attach() 메서드를 사용하지 않고 커스텀 이벤트핸들러를 등록할 수 있다.
		
		@method option
		@syntax sName, vValue
		@syntax oValue
		@param {String} sName 옵션의 이름
		@param {Variant} vValue 옵션의 값
		@param {Object} oValue 하나 이상의 이름과 값을 가지는 옵션 객체
		@return {this} 옵션 값을 설정한 인스턴스 자신
		@example
			var MyComponent = jindo.$Class({
				method : function() {
					alert(this.option("foo"));
				}
			}).extend(jindo.m.Component);
			
			var oInst = new MyComponent();
			oInst.option("foo", 123); // 또는 oInst.option({ foo : 123 });
			oInst.method(); // 결과 123
		@example
			//커스텀 이벤트핸들러 등록예제
			oInst.option("htCustomEventHandler", {
				test : function(oCustomEvent) {
					
				}
			});
			
			//이미 "htCustomEventHandler" 옵션이 설정되어있는 경우에는 무시된다.
			oInst.option("htCustomEventHandler", {
				change : function(oCustomEvent) {
					
				}
			});
	**/
	option : function(sName, vValue) {
		switch (typeof sName) {
			case "undefined" :
				var oOption = {};
				for(var i in this._htOption){
					if(!(i == "htCustomEventHandler" || i == "_htSetter")){
						oOption[i] = this._htOption[i];
					}
				}
				return oOption;
			case "string" : 
				if (typeof vValue != "undefined") {
					if (sName == "htCustomEventHandler") {
						if (typeof this._htOption[sName] == "undefined") {
							this.attach(vValue);
						} else {
							return this;
						}
					}
					
					this._htOption[sName] = vValue;
					if (typeof this._htOption._htSetter[sName] == "function") {
						this._htOption._htSetter[sName](vValue);	
					}
				} else {
					return this._htOption[sName];
				}
				break;
			case "object" :
				for(var sKey in sName) {
					if (sKey == "htCustomEventHandler") {
						if (typeof this._htOption[sKey] == "undefined") {
							this.attach(sName[sKey]);
						} else {
							continue;
						}
					}
					if(sKey !== "_htSetter"){
						this._htOption[sKey] = sName[sKey];
					}
					
					if (typeof this._htOption._htSetter[sKey] == "function") {
						this._htOption._htSetter[sKey](sName[sKey]);	
					}
				}
				break;
		}
		return this;
	},
	
	/**
		옵션의 setter 함수를 가져온다. 
		옵션의 setter 함수는 지정된 옵션이 변경되면 수행되는 함수이다.
		
		@method optionSetter
		@param {String} sName setter의 이름
		@return {Function} setter 함수
	**/
	/**
		옵션의 setter 함수를 설정한다. 
		옵션의 setter 함수는 지정된 옵션이 변경되면 수행되는 함수이다.
		
		@method optionSetter
		@syntax sName, fSetter
		@syntax oValue
		@param {String} sName setter의 이름
		@param {Function} fSetter setter 함수
		@param {Object} oValue 하나 이상의 setter 이름과 setter 함수를 가지는 객체
		@return {this} 옵션의 setter 함수를 설정한 인스턴스 자신
		@example
			oInst.option("sMsg", "test");
			oInst.optionSetter("sMsg", function(){
				alert("sMsg 옵션 값이 변경되었습니다.");
			});
			oInst.option("sMsg", "change"); -> alert발생
		@example
			//HashTable 형태로 설정가능
			oInst.optionSetter({
				"sMsg" : function(){
				},
				"nNum" : function(){
				}
			});
	**/
	optionSetter : function(sName, fSetter) {
		switch (typeof sName) {
			case "undefined" :
				return this._htOption._htSetter;
			case "string" : 
				if (typeof fSetter != "undefined") {
					this._htOption._htSetter[sName] = jindo.$Fn(fSetter, this).bind();
				} else {
					return this._htOption._htSetter[sName];
				}
				break;
			case "object" :
				for(var sKey in sName) {
					this._htOption._htSetter[sKey] = jindo.$Fn(sName[sKey], this).bind();
				}
				break;
		}
		return this;
	},
	
	/**
		이벤트를 발생시킨다.
		
		@method fireEvent
		@param {String} sEvent 커스텀 이벤트명
		@param {Object} oEvent 커스텀 이벤트 핸들러에 전달되는 객체.
		@return {Boolean} 핸들러의 커스텀 이벤트객체에서 stop메서드가 수행되면 false를 리턴
		@example
			//커스텀 이벤트를 발생시키는 예제
			var MyComponent = jindo.$Class({
				method : function() {
					this.fireEvent('happened', {
						sHello : 'world',
						nAbc : 123
					});
				}
			}).extend(jindo.m.Component);
			
			var oInst = new MyComponent().attach({
				happened : function(oCustomEvent) {
					alert(oCustomEvent.sHello + '/' + oCustomEvent.nAbc); // 결과 : world/123
				}
			});
			
			<button onclick="oInst.method();">Click me</button> 
	**/
	fireEvent : function(sEvent, oEvent) {
		oEvent = oEvent || {};
		var fInlineHandler = this['on' + sEvent],
			aHandlerList = this._htEventHandler[sEvent] || [],
			bHasInlineHandler = typeof fInlineHandler == "function",
			bHasHandlerList = aHandlerList.length > 0;
			
		if (!bHasInlineHandler && !bHasHandlerList) {
			return true;
		}
		aHandlerList = aHandlerList.concat(); //fireEvent수행시 핸들러 내부에서 detach되어도 최초수행시의 핸들러리스트는 모두 수행
		
		oEvent.sType = sEvent;
		if (typeof oEvent._aExtend == 'undefined') {
			oEvent._aExtend = [];
			oEvent.stop = function(){
				if (oEvent._aExtend.length > 0) {
					oEvent._aExtend[oEvent._aExtend.length - 1].bCanceled = true;
				}
			};
		}
		oEvent._aExtend.push({
			sType: sEvent,
			bCanceled: false
		});
		
		var aArg = [oEvent], 
			i, nLen;
			
		for (i = 2, nLen = arguments.length; i < nLen; i++){
			aArg.push(arguments[i]);
		}
		
		if (bHasInlineHandler) {
			fInlineHandler.apply(this, aArg);
		}
	
		if (bHasHandlerList) {
			var fHandler;
			for (i = 0, fHandler; (fHandler = aHandlerList[i]); i++) {
				fHandler.apply(this, aArg);
			}
		}
		
		return !oEvent._aExtend.pop().bCanceled;
	},

	/**
		커스텀 이벤트 핸들러를 등록한다.
		
		@method attach
		@param {String} sEvent 커스텀 이벤트 명
		@param {Function} fHandlerToAttach 등록 할 커스텀 이벤트 핸들러
			@param {Object} fHandlerToAttach.oCustomEvent 커스텀 이벤트 객체
		@return {this} 컴포넌트 인스턴스 자신
		@example
			//이벤트 등록 방법 예제
			//아래처럼 등록하면 appear 라는 사용자 이벤트 핸들러는 총 3개가 등록되어 해당 이벤트를 발생시키면 각각의 핸들러 함수가 모두 실행됨.
			//attach 을 통해 등록할때는 이벤트명에 'on' 이 빠지는 것에 유의.
			function fpHandler1(oEvent) { .... };
			function fpHandler2(oEvent) { .... };
			
			var oInst = new MyComponent();
			oInst.onappear = fpHandler1; // 직접 등록
			oInst.attach('appear', fpHandler1); // attach 함수를 통해 등록
			oInst.attach({
				appear : fpHandler1,
				more : fpHandler2
			});
	**/
	attach : function(sEvent, fHandlerToAttach) {
		if (arguments.length == 1) {
			
			jindo.$H(arguments[0]).forEach(jindo.$Fn(function(fHandler, sEvent) {
				this.attach(sEvent, fHandler);
			}, this).bind());
		
			return this;
		}
		
		var aHandler = this._htEventHandler[sEvent];
		
		if (typeof aHandler == 'undefined'){
			aHandler = this._htEventHandler[sEvent] = [];
		}
		
		aHandler.push(fHandlerToAttach);
		
		return this;
	},
	
	/**
		커스텀 이벤트 핸들러를 해제한다.
		
		@method detach
		@param {String} sEvent 커스텀 이벤트 명
		@param {Function} fHandlerToDetach 등록 해제 할 커스텀 이벤트 핸들러
		@return {this} 컴포넌트 인스턴스 자신
		@example
			//이벤트 해제 예제
			oInst.onappear = null; // 직접 해제
			oInst.detach('appear', fpHandler1); // detach 함수를 통해 해제
			oInst.detach({
				appear : fpHandler1,
				more : fpHandler2
			});
	**/
	detach : function(sEvent, fHandlerToDetach) {
		if (arguments.length == 1) {
			jindo.$H(arguments[0]).forEach(jindo.$Fn(function(fHandler, sEvent) {
				this.detach(sEvent, fHandler);
			}, this).bind());
		
			return this;
		}

		var aHandler = this._htEventHandler[sEvent];
		if (aHandler) {
			for (var i = 0, fHandler; (fHandler = aHandler[i]); i++) {
				if (fHandler === fHandlerToDetach) {
					aHandler = aHandler.splice(i, 1);
					break;
				}
			}
		}

		return this;
	},
	
	/**
		등록된 모든 커스텀 이벤트 핸들러를 해제한다.
		
		@method detachAll
		@param {String} sEvent 이벤트명. 생략시 모든 등록된 커스텀 이벤트 핸들러를 해제한다. 
		@return {this} 컴포넌트 인스턴스 자신
		@example
			//"show" 커스텀 이벤트 핸들러 모두 해제
			oInst.detachAll("show");
			
			//모든 커스텀 이벤트 핸들러 해제
			oInst.detachAll();
	**/
	detachAll : function(sEvent) {
		var aHandler = this._htEventHandler;
		
		if (arguments.length) {
			
			if (typeof aHandler[sEvent] == 'undefined') {
				return this;
			}
	
			delete aHandler[sEvent];
	
			return this;
		}	
		
		for (var o in aHandler) {
			delete aHandler[o];
		}
		return this;				
	}
});

/**
	다수의 컴포넌트를 일괄 생성하는 Static Method
	
	@method factory
	@static
	@param {Array} aObject 기준엘리먼트의 배열
	@param {HashTable} htOption 옵션객체의 배열
	@return {Array} 생성된 컴포넌트 객체 배열
	@example
		var Instance = jindo.m.Component.factory(
			cssquery('li'),
			{
				foo : 123,
				bar : 456
			}
		);
**/
jindo.m.Component.factory = function(aObject, htOption) {
	var aReturn = [],
		oInstance;

	if (typeof htOption == "undefined") {
		htOption = {};
	}
	
	for(var i = 0, el; (el = aObject[i]); i++) {
		oInstance = new this(el, htOption);
		aReturn[aReturn.length] = oInstance;
	}

	return aReturn;
};

/**
	컴포넌트의 생성된 인스턴스를 리턴한다.
	
	@static
	@deprecated
	
	@remark 본 메서드는 deprecated 되었으며 멀지 않은 릴리즈부터 사라질 예정입니다. 
	
	@return {Array} 생성된 인스턴스의 배열
**/
jindo.m.Component.getInstance = function(){
	throw new Error('JC 1.11.0 or JMC 1.13.0 later, getInstance method of Component is not longer supported.');
};

/**
	사용하는 컴포넌트의 버전
	
	@property VERSION
	@static
	
	@type String
	@default "1.3.0"
	
	@example
		console.log(jindo.m.Component.VERSION); // "1.3.0"

	@since 1.3.0
 */
jindo.m.Component.VERSION = '1.17.0'; /**
	@fileOverview UI 컴포넌트를 구현하기 위한 코어 클래스
	@version 1.17.0
**/
/**
	UI Component에 상속되어 사용되는 Jindo Mobile Component의 Core

	@class jindo.m.UIComponent
	@extends jindo.m.Component
	@keyword uicomponent, component, 유아이컴포넌트
	@group Component
	@invisible
**/
jindo.m.UIComponent = jindo.$Class({
	/** @lends jindo.m.UIComponent.prototype */
		
	/**
		@constructor
		jindo.m.UIComponent를 초기화한다.
	**/
	$init : function() {
		this._bIsActivating = false; //컴포넌트의 활성화 여부
	},

	/**
		컴포넌트의 활성여부를 가져온다.
		
		@method isActivating
		@return {Boolean} 활성화 여부
	**/
	isActivating : function() {
		return this._bIsActivating;
	},

	/**
		컴포넌트를 활성화한다.
		_onActivate 메서드를 수행하므로 반드시 상속받는 클래스에 _onActivate 메서드가 정의되어야한다.
		
		@method activate
		@return {this}
	**/
	activate : function() {
		if (this.isActivating()) {
			return this;
		}
		this._bIsActivating = true;
		
		if (arguments.length > 0) {
			this._onActivate.apply(this, arguments);
		} else {
			this._onActivate();
		}
				
		return this;
	},
	
	/**
		컴포넌트를 비활성화한다.
		_onDeactivate 메서드를 수행하므로 반드시 상속받는 클래스에 _onDeactivate 메서드가 정의되어야한다.
		
		@method deactivate
		@return {this}
	**/
	deactivate : function() {
		if (!this.isActivating()) {
			return this;
		}
		this._bIsActivating = false;
		
		if (arguments.length > 0) {
			this._onDeactivate.apply(this, arguments);
		} else {
			this._onDeactivate();
		}
		
		return this;
	}
}).extend(jindo.m.Component);	
/**
	@version 1.17.0
**/

/*
	TERMS OF USE - EASING EQUATIONS
	Open source under the BSD License.
	Copyright (c) 2001 Robert Penner, all rights reserved.
**/

/**
	수치의 중간 값을 쉽게 얻을 수 있게 하는 static 컴포넌트
	새로운 이펙트 함수를 생성한다.
	
	@class jindo.m.Effect
	@group Component	
	@uses jindo.m  
	@static
	@param {Function} fEffect 0~1 사이의 숫자를 인자로 받아 정해진 공식에 따라 0~1 사이의 값을 리턴하는 함수
	@return {Function} 이펙트 함수. 이 함수는 시작 값과 종료 값을 입력하여 특정 시점에 해당하는 값을 구하는 타이밍 함수를 생성한다.
	
	@keyword effect, 효과, animation, 애니메이션

	@history 1.14.0 New CSS 타이밍함수로 바뀔 수 있는 Effect 함수에 toString 구현
	@history 1.10.0 New Effect 함수 내에 start, end 프로퍼티 추가
	@history 1.10.0 Update 입력값이 0일 경우, 단위에 상관없이 처리하도록 수정
	@history 1.9.0 Release 최초 릴리즈
**/
jindo.m.Effect = function(fEffect) {
	if (this instanceof arguments.callee) {
		throw new Error("You can't create a instance of this");
	}
	
	// Effect 함수에서 허용하는 시작값/종료값의 정규식들
	var rxNumber = /^(\-?[0-9\.]+)(%|\w+)?$/, // 숫자와 단위(%,px,em 등)
		rxRGB = /^rgb\(([0-9]+)\s?,\s?([0-9]+)\s?,\s?([0-9]+)\)$/i, // rgb(R,G,B)
		rxRGBA = /^rgba\(([0-9]+)\s?,\s?([0-9]+)\s?,\s?([0-9]+),\s?([0-9\.]+)\)$/i, // rgba(R,G,B,alpha)
		rxHSL = /^hsl\(([0-9\.]+)\s?,\s?([0-9\.]+)%\s?,\s?([0-9\.]+)%\)$/i, // hsl(H,S,L)
		rxHSLA = /^hsla\(([0-9\.]+)\s?,\s?([0-9\.]+)%\s?,\s?([0-9\.]+)%,\s?([0-9\.]+)\)$/i, // hsla(H,S,L,alpha)
		rxHex = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i, // #FFFFFF
		rx3to6 = /^#([0-9A-F])([0-9A-F])([0-9A-F])$/i; // #FFF
	
	// 값을 숫자와 단위로 구분한 객체로 전환
	var getUnitAndValue = function(v) {
		var nValue = v, sUnit;
		
		if (rxNumber.test(v)) { // 숫자와 단위로 구성된 경우
			nValue = parseFloat(v); 
			sUnit = RegExp.$2 || "";
		} else if (rxRGB.test(v)) { // RGB 값인 경우
			nValue = {rgb:[parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10), 1]};
			sUnit = 'color';
		} else if (rxRGBA.test(v)) { // RGBA 값인 경우
			nValue = {rgb:[parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10), parseFloat(RegExp.$4)]};
			sUnit = 'color';
		} else if (rxHSL.test(v)) { // HSL 값인 경우
			nValue = {hsl:[parseFloat(RegExp.$1), parseFloat(RegExp.$2)/100, parseFloat(RegExp.$3)/100, 1]};
			nValue.rgb = hsl2rgb.apply(this, nValue.hsl); // RGB 값으로 변환한 값도 함께 저장
			sUnit = 'color';
		} else if (rxHSLA.test(v)) { // HSLA 값인 경우
			nValue = {hsl:[parseFloat(RegExp.$1), parseFloat(RegExp.$2)/100, parseFloat(RegExp.$3)/100, parseFloat(RegExp.$4)]};
			nValue.rgb = hsl2rgb.apply(this, nValue.hsl); // RGB 값으로 변환한 값도 함께 저장
			sUnit = 'color';
		} else if (rxHex.test(v = v.replace(rx3to6, '#$1$1$2$2$3$3'))) { // #색상 값인 경우
			nValue = {rgb:[parseInt(RegExp.$1, 16), parseInt(RegExp.$2, 16), parseInt(RegExp.$3, 16), 1]};
			sUnit = 'color';
		} else {
			throw new Error('unit error (' + v + ')');
		}
				
		return { 
			nValue : nValue, 
			sUnit : sUnit 
		};
	};

	// 여러개의 값이 합쳐져 있는 형태를 빈칸으로 기준으로 배열로 분리
	// fExplode('20px 30px 40px') -> [ '20px', '30px', '40px' ]
	// fExplode('20px rgb(255, 0, 0) #fff') -> [ '20px', 'rgb(255, 0, 0)', '#fff' ]
	var fExplode = function(sStr) {
		var aRet = [];
		sStr.replace(/([^\s]+\([^\)]*\)|[^\s]+)\s?/g, function(_, a) { aRet.push(a); });
		return aRet;
	};

	// 여러개의 값이 합쳐져 있는 형태의 문자열을 숫자와 단위로 구분한 객체의 배열로 분리 변환
	var getUnitAndValueList = function(v) {

		var aList = fExplode(v?v+'':'0');
		var aRet = [];

		for (var i = 0, nLen = aList.length; i < nLen; i++) {
			aRet.push(getUnitAndValue(aList[i]));
		}

		return aRet;

	};

	// 처리과정에서 sUnit 값이 바뀔 수 있으므로 1단계 deep-copy
	var copy = function(oValue) {
		if (typeof oValue === 'object') {
			return { nValue : oValue.nValue, sUnit : oValue.sUnit };
		}
		return oValue;
	};

	// http://jsfiddle.net/EPWF6/9/
	var hsl2rgb = function(H, S, L, alpha) {
		H = (H % 360) / 60;

		var C = (1 - Math.abs((2 * L) - 1)) * S;
		var X = C * (1 - Math.abs((H % 2) - 1));
		var R1 = 0, G1 = 0, B1 = 0;

		if (H >= 5 || H < 1) {
			R1 = C;
			B1 = X;
		} else if (H >= 4) {
			R1 = X;
			B1 = C;
		} else if (H >= 3) {
			G1 = X;
			B1 = C;
		} else if (H >= 2) {
			G1 = C;
			B1 = X;
		} else if (H >= 1) {
			R1 = X;
			G1 = C;
		}

		var m = L - (C / 2);

		return [
			Math.round((R1 + m) * 255),
			Math.round((G1 + m) * 255),
			Math.round((B1 + m) * 255),
			alpha
		];

	};

	// 이펙트 함수
	return function(sStart, sEnd) {

		var aStart, aEnd;

		// 시작값 종료값 파싱
		var fParse = function() {

			var bChanged = false;

			// 시작값이 이전에 파싱했을때와 달라졌으면 다시 파싱
			if (fReturn.start !== sStart) {
				aStart = getUnitAndValueList(fReturn.start);
				sStart = fReturn.start;
				bChanged = true;
			}

			// 종료값이 이전에 파싱했을때와 달라졌으면 다시 파싱
			if (fReturn.end !== sEnd) {
				aEnd = getUnitAndValueList(fReturn.end);
				sEnd = fReturn.end;
				bChanged = true;
			}

			// 시작값이나 종료값이 이전에 파싱했을때와 달라졌으면
			if (bChanged) {

				var nLen = Math.max(aStart.length, aEnd.length);
				var oStart, oEnd;

				// 시작값의 갯수와 종료값의 갯수가 다르면 맞춰줌
				if (aStart.length !== aEnd.length && nLen > 1) {

					switch (aStart.length) {
					case 1: aStart[1] = copy(aStart[0]); // not break
					case 2: aStart[2] = copy(aStart[0]); // not break
					case 3: aStart[3] = copy(aStart[1]); break;
					}

					switch (aEnd.length) {
					case 1: aEnd[1] = copy(aEnd[0]); // not break
					case 2: aEnd[2] = copy(aEnd[0]); // not break
					case 3: aEnd[3] = copy(aEnd[1]); break;
					}

				}

				// 각각의 값을 확인
				for (var i = 0; i < nLen; i++) {

					oStart = aStart[i];
					oEnd = aEnd[i];

					// 어느 한쪽의 값이 0 이면 단위를 다른쪽의 단위와 동일하게 바꿔줌
					if (oStart.nValue === 0) { oStart.sUnit = oEnd.sUnit; }
					else if (oEnd.nValue === 0) { oEnd.sUnit = oStart.sUnit; }

					// 두개의 단위가 다르면 에러 발생
					if (oStart.sUnit != oEnd.sUnit) {
						throw new Error('unit error (' + sStart + ' ~ ' + sEnd + ')');
					}

				}

			}

		};

		// 0.0~1.0 사이의 인자(p)를 받는 함수
		var fReturn = function(p) {

			var aRet = [];

			fParse(); // 시작값, 종료값이 유효한지 확인

			var oStart, oEnd;
			var nStart, nEnd, sUnit;

			var alpha;

			// 시작값들과 종료값들에서 루프
			for (var i = 0, nLen = Math.max(aStart.length, aEnd.length); i < nLen; i++) {

				oStart = aStart[i];
				oEnd = aEnd[i];

				nStart = oStart.nValue;
				nEnd = oEnd.nValue;
				sUnit = oStart.sUnit;

				var nValue = fEffect(p),
					getResult = function(s, d, sUnit) {
						return Math.round(((d - s) * nValue + s) * 1000000) / 1000000 + (sUnit || 0);
					};
				
				// 숫자+단위로 된 값이면
				if (sUnit !== 'color') {
					// 중간값 목록에 추가
					aRet.push(getResult(nStart, nEnd, sUnit));
					continue;
				}

				// HSL 단위이면
				if (nStart.hsl && nEnd.hsl) {

					nStart = nStart.hsl;
					nEnd = nEnd.hsl;

					var h = Math.round(getResult(nStart[0], nEnd[0]));
					var s = Math.max(0, Math.min(1, getResult(nStart[1], nEnd[1]))) * 100;
					var l = Math.max(0, Math.min(1, getResult(nStart[2], nEnd[2]))) * 100;
					alpha = getResult(nStart[3], nEnd[3]);

					if (alpha === 1) {
						aRet.push('hsl(' + [ h, s+'%', l+'%' ].join(',') + ')');
					} else {
						aRet.push('hsla(' + [ h, s+'%', l+'%', alpha ].join(',') + ')');
					}

				// RGB 단위이면
				} else {

					nStart = nStart.rgb;
					nEnd = nEnd.rgb;

					var r = Math.max(0, Math.min(255, Math.round(getResult(nStart[0], nEnd[0]))));
					var g = Math.max(0, Math.min(255, Math.round(getResult(nStart[1], nEnd[1]))));
					var b = Math.max(0, Math.min(255, Math.round(getResult(nStart[2], nEnd[2]))));
					alpha = getResult(nStart[3], nEnd[3]);

					if (alpha === 1) {
						var dummy = ((r << 16) | (g << 8) | b).toString(16).toUpperCase();
						aRet.push('#' + Array(7 - dummy.length).join('0') + dummy);
					} else {
						aRet.push('rgba(' + [ r, g, b, alpha ].join(',') + ')');
					}

				}

			}

			// 중간값 목록을 반환
			return aRet.join(' ');

		};

		switch (arguments.length) {
		case 0: break;
		case 1:
			sEnd = sStart || '0';
			sStart = '0';
			
			fReturn.setStart = function(sStart) {
				this.start = sStart;
			}; // deprecated
			break;
		}

		fReturn.start = sStart;
		fReturn.end = sEnd;
		fReturn.effectConstructor = arguments.callee;

		sStart = sEnd = null;

		if (arguments.length > 1) {
			fParse(); // 시작값, 종료값이 유효한지 확인
		}

		return fReturn;

	};
	
};

/**
	linear 이펙트 함수
	
	@method linear
	@static
**/
jindo.m.Effect.linear = jindo.m.Effect(function(s) {
	return s;
});
jindo.m.Effect.linear.toString = function() { return 'linear'; };

/**
	easeInSine 이펙트 함수
	
	@method easeInSine
	@static
**/
jindo.m.Effect.easeInSine = jindo.m.Effect(function(s) {
	return (s == 1) ? 1 : -Math.cos(s * (Math.PI / 2)) + 1;
});
/**
	easeOutSine 이펙트 함수
	
	@method easeOutSine
	@static
**/
jindo.m.Effect.easeOutSine = jindo.m.Effect(function(s) {
	return Math.sin(s * (Math.PI / 2));
});
/**
	easeInOutSine 이펙트 함수
	
	@method easeInOutSine
	@static
**/
jindo.m.Effect.easeInOutSine = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInSine(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutSine(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInSine 이펙트 함수
	
	@method easeOutInSine
	@static
**/
jindo.m.Effect.easeOutInSine = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutSine(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInSine(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInQuad 이펙트 함수
	
	@method easeInQuad
	@static
**/
jindo.m.Effect.easeInQuad = jindo.m.Effect(function(s) {
	return s * s;
});
/**
	easeOutQuad 이펙트 함수
	
	@method easeOutQuad
	@static
**/
jindo.m.Effect.easeOutQuad = jindo.m.Effect(function(s) {
	return -(s * (s - 2));
});
/**
	easeInOutQuad 이펙트 함수
	
	@method easeInOutQuad
	@static
**/
jindo.m.Effect.easeInOutQuad = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInQuad(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutQuad(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInQuad 이펙트 함수
	
	@method easeOutInQuad
	@static
**/
jindo.m.Effect.easeOutInQuad = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutQuad(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInQuad(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInCubic 이펙트 함수
	
	@method easeInCubic
	@static
**/
jindo.m.Effect.easeInCubic = jindo.m.Effect(function(s) {
	return Math.pow(s, 3);
});
/**
	easeOutCubic 이펙트 함수
	
	@method easeOutCubic
	@static
**/
jindo.m.Effect.easeOutCubic = jindo.m.Effect(function(s) {
	return Math.pow((s - 1), 3) + 1;
});
/**
	easeInOutCubic 이펙트 함수
	
	@method easeInOutCubic
	@static
**/
jindo.m.Effect.easeInOutCubic = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeIn(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOut(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInCubic 이펙트 함수
	
	@method easeOutInCubic
	@static
**/
jindo.m.Effect.easeOutInCubic = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOut(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeIn(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInQuart 이펙트 함수
	
	@method easeInQuart
	@static
**/
jindo.m.Effect.easeInQuart = jindo.m.Effect(function(s) {
	return Math.pow(s, 4);
});
/**
	easeOutQuart 이펙트 함수
	
	@method easeOutQuart
	@static
**/
jindo.m.Effect.easeOutQuart = jindo.m.Effect(function(s) {
	return -(Math.pow(s - 1, 4) - 1);
});
/**
	easeInOutQuart 이펙트 함수
	
	@method easeInOutQuart
	@static
**/
jindo.m.Effect.easeInOutQuart = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInQuart(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutQuart(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInQuart 이펙트 함수
	
	@method easeOutInQuart
	@static
**/
jindo.m.Effect.easeOutInQuart = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutQuart(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInQuart(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInQuint 이펙트 함수
	
	@method easeInQuint
	@static
**/
jindo.m.Effect.easeInQuint = jindo.m.Effect(function(s) {
	return Math.pow(s, 5);
});
/**
	easeOutQuint 이펙트 함수
	
	@method easeOutQuint
	@static
**/
jindo.m.Effect.easeOutQuint = jindo.m.Effect(function(s) {
	return Math.pow(s - 1, 5) + 1;
});
/**
	easeInOutQuint 이펙트 함수
	
	@method easeInOutQuint
	@static
**/
jindo.m.Effect.easeInOutQuint = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInQuint(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutQuint(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInQuint 이펙트 함수
	
	@method easeOutInQuint
	@static
**/
jindo.m.Effect.easeOutInQuint = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutQuint(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInQuint(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInCircle 이펙트 함수
	
	@method easeInCircle
	@static
**/
jindo.m.Effect.easeInCircle = jindo.m.Effect(function(s) {
	return -(Math.sqrt(1 - (s * s)) - 1);
});
/**
	easeOutCircle 이펙트 함수
	
	@method easeOutCircle
	@static
**/
jindo.m.Effect.easeOutCircle = jindo.m.Effect(function(s) {
	return Math.sqrt(1 - (s - 1) * (s - 1));
});
/**
	easeInOutCircle 이펙트 함수
	
	@method easeInOutCircle
	@static
**/
jindo.m.Effect.easeInOutCircle = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInCircle(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutCircle(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInCircle 이펙트 함수
	
	@method easeOutInCircle
	@static
**/
jindo.m.Effect.easeOutInCircle = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutCircle(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInCircle(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInBack 이펙트 함수
	
	@method easeInBack
	@static
**/
jindo.m.Effect.easeInBack = jindo.m.Effect(function(s) {
	var n = 1.70158;
	return (s == 1) ? 1 : (s / 1) * (s / 1) * ((1 + n) * s - n);
});
/**
	easeOutBack 이펙트 함수
	
	@method easeOutBack
	@static
**/
jindo.m.Effect.easeOutBack = jindo.m.Effect(function(s) {
	var n = 1.70158;
	return (s === 0) ? 0 : (s = s / 1 - 1) * s * ((n + 1) * s + n) + 1;
});
/**
	easeInOutBack 이펙트 함수
	
	@method easeInOutBack
	@static
**/
jindo.m.Effect.easeInOutBack = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInBack(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutBack(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInElastic 이펙트 함수
	
	@method easeInElastic
	@static
**/
jindo.m.Effect.easeInElastic = jindo.m.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s/=1) == 1) {
		return 1;
	}
	if (!p) {
		p = 0.3;
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	return -(a * Math.pow(2, 10 * (s -= 1)) * Math.sin((s - 1) * (2 * Math.PI) / p));
});

/**
	easeOutElastic 이펙트 함수
	
	@method easeOutElastic
	@static
**/
jindo.m.Effect.easeOutElastic = jindo.m.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s/=1) == 1) {
		return 1;
	}
	if (!p) {
		p = 0.3;
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	return (a * Math.pow(2, -10 * s) * Math.sin((s - n) * (2 * Math.PI) / p ) + 1);
});
/**
	easeInOutElastic 이펙트 함수
	
	@method easeInOutElastic
	@static
**/
jindo.m.Effect.easeInOutElastic = jindo.m.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s=s/(1/2)) == 2) {
		return 1;
	}
	if (!p) {
		p = (0.3 * 1.5);
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	if (s < 1) {
		return -0.5 * (a * Math.pow(2, 10 * (s -= 1)) * Math.sin( (s - n) * (2 * Math.PI) / p ));
	}
	return a * Math.pow(2, -10 * (s -= 1)) * Math.sin( (s - n) * (2 * Math.PI) / p ) * 0.5 + 1;
});

/**
	easeOutBounce 이펙트 함수
	
	@method easeOutBounce
	@static
**/
jindo.m.Effect.easeOutBounce = jindo.m.Effect(function(s) {
	if (s < (1 / 2.75)) {
		return (7.5625 * s * s);
	} else if (s < (2 / 2.75)) {
		return (7.5625 * (s -= (1.5 / 2.75)) * s + 0.75);
	} else if (s < (2.5 / 2.75)) {
		return (7.5625 * (s -= (2.25 / 2.75)) * s + 0.9375);
	} else {
		return (7.5625 * (s -= (2.625 / 2.75)) * s + 0.984375);
	} 
});
/**
	easeInBounce 이펙트 함수
	
	@method easeInBounce
	@static
**/
jindo.m.Effect.easeInBounce = jindo.m.Effect(function(s) {
	return 1 - jindo.m.Effect.easeOutBounce(0, 1)(1 - s);
});
/**
	easeInOutBounce 이펙트 함수
	
	@method easeInOutBounce
	@static
**/
jindo.m.Effect.easeInOutBounce = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInBounce(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutBounce(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInExpo 이펙트 함수
	
	@method easeInExpo
	@static
**/
jindo.m.Effect.easeInExpo = jindo.m.Effect(function(s) {
	return (s === 0) ? 0 : Math.pow(2, 10 * (s - 1));
});
/**
	easeOutExpo 이펙트 함수
	
	@method easeOutExpo
	@static
**/
jindo.m.Effect.easeOutExpo = jindo.m.Effect(function(s) {
	return (s == 1) ? 1 : -Math.pow(2, -10 * s / 1) + 1;
});
/**
	easeInOutExpo 이펙트 함수
	
	@method easeInOutExpo
	@static
**/
jindo.m.Effect.easeInOutExpo = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeInExpo(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeOutExpo(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutExpo 이펙트 함수
	
	@method easeOutInExpo
	@static
**/
jindo.m.Effect.easeOutInExpo = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.easeOutExpo(0, 1)(2 * s) * 0.5 : jindo.m.Effect.easeInExpo(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	Cubic-Bezier curve
	@method _cubicBezier
	@private
	@param {Number} x1
	@param {Number} y1
	@param {Number} x2
	@param {Number} y2
	@see http://www.netzgesta.de/dev/cubic-bezier-timing-function.html 
**/
jindo.m.Effect._cubicBezier = function(x1, y1, x2, y2){
	return function(t){
		var cx = 3.0 * x1, 
	    	bx = 3.0 * (x2 - x1) - cx, 
	    	ax = 1.0 - cx - bx, 
	    	cy = 3.0 * y1, 
	    	by = 3.0 * (y2 - y1) - cy, 
	    	ay = 1.0 - cy - by;
		
	    function sampleCurveX(t) {
	    	return ((ax * t + bx) * t + cx) * t;
	    }
	    function sampleCurveY(t) {
	    	return ((ay * t + by) * t + cy) * t;
	    }
	    function sampleCurveDerivativeX(t) {
	    	return (3.0 * ax * t + 2.0 * bx) * t + cx;
	    }
	    function solveCurveX(x,epsilon) {
	    	var t0, t1, t2, x2, d2, i;
	    	for (t2 = x, i = 0; i<8; i++) {
	    		x2 = sampleCurveX(t2) - x; 
	    		if (Math.abs(x2) < epsilon) {
	    			return t2;
	    		} 
	    		d2 = sampleCurveDerivativeX(t2); 
	    		if(Math.abs(d2) < 1e-6) {
	    			break;
	    		} 
	    		t2 = t2 - x2 / d2;
	    	}
		    t0 = 0.0; 
		    t1 = 1.0; 
		    t2 = x; 
		    if (t2 < t0) {
		    	return t0;
		    } 
		    if (t2 > t1) {
		    	return t1;
		    }
		    while (t0 < t1) {
		    	x2 = sampleCurveX(t2); 
		    	if (Math.abs(x2 - x) < epsilon) {
		    		return t2;
		    	} 
		    	if (x > x2) {
		    		t0 = t2;
		    	} else {
		    		t1 = t2;
		    	} 
		    	t2 = (t1 - t0) * 0.5 + t0;
		    }
	    	return t2; // Failure.
	    }
	    return sampleCurveY(solveCurveX(t, 1 / 200));
	};
};

/**
	Cubic-Bezier 함수를 생성한다.
	
	@method cubicBezier
	@static
	@see http://en.wikipedia.org/wiki/B%C3%A9zier_curve
	@param {Number} x1 control point 1의 x좌표
	@param {Number} y1 control point 1의 y좌표
	@param {Number} x2 control point 2의 x좌표
	@param {Number} y2 control point 2의 y좌표
	@return {Function} 생성된 이펙트 함수
**/
jindo.m.Effect.cubicBezier = function(x1, y1, x2, y2){
	var f = jindo.m.Effect(jindo.m.Effect._cubicBezier(x1, y1, x2, y2));
	var cssTimingFunction = 'cubic-bezier(' + [ x1, y1, x2, y2 ].join(',') + ')';
	f.toString = function() { return cssTimingFunction; };
	return f;
};

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 ease 함수
	
	@example
		jindo.m.Effect.cubicBezier(0.25, 0.1, 0.25, 1);
	
	@method cubicEase
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.cubicEase = jindo.m.Effect.cubicBezier(0.25, 0.1, 0.25, 1);
jindo.m.Effect.cubicEase.toString = function() { return 'ease'; };

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeIn 함수

	@example
		jindo.m.Effect.cubicBezier(0.42, 0, 1, 1);
	
	@method cubicEaseIn
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.cubicEaseIn = jindo.m.Effect.cubicBezier(0.42, 0, 1, 1);
jindo.m.Effect.cubicEaseIn.toString = function() { return 'ease-in'; };

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeOut 함수
	
	@example
		jindo.m.Effect.cubicBezier(0, 0, 0.58, 1);
	
	@method cubicEaseOut
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.cubicEaseOut = jindo.m.Effect.cubicBezier(0, 0, 0.58, 1);
jindo.m.Effect.cubicEaseOut.toString = function() { return 'ease-out'; };

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeInOut 함수
	
	@example
		jindo.m.Effect.cubicBezier(0.42, 0, 0.58, 1);
	
	@method cubicEaseInOut
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.cubicEaseInOut = jindo.m.Effect.cubicBezier(0.42, 0, 0.58, 1);
jindo.m.Effect.cubicEaseInOut.toString = function() { return 'ease-in-out'; };

/**
	Cubic-Bezier 커브를 이용해 easeOutIn 함수를 구한다.
	
	@example
		jindo.m.Effect.cubicBezier(0, 0.42, 1, 0.58);
	
	@method cubicEaseOutIn
	@static
**/
jindo.m.Effect.cubicEaseOutIn = jindo.m.Effect.cubicBezier(0, 0.42, 1, 0.58);

/**
	overphase 이펙트 함수
	
	@method overphase
	@static
**/
jindo.m.Effect.overphase = jindo.m.Effect(function(s){
	s /= 0.652785;
	return (Math.sqrt((2 - s) * s) + (0.1 * s)).toFixed(5);	
});

/**
	sin 곡선의 일부를 이용한 sinusoidal 이펙트 함수
	
	@method sinusoidal
	@static
**/
jindo.m.Effect.sinusoidal = jindo.m.Effect(function(s) {
	return (-Math.cos(s * Math.PI) / 2) + 0.5;
});

/**
	mirror 이펙트 함수
	sinusoidal 이펙트 함수를 사용한다.
	
	@method mirror
	@static
**/
jindo.m.Effect.mirror = jindo.m.Effect(function(s) {
	return (s < 0.5) ? jindo.m.Effect.sinusoidal(0, 1)(s * 2) : jindo.m.Effect.sinusoidal(0, 1)(1 - (s - 0.5) * 2);
});

/**
	nPulse의 진동수를 가지는 cos 함수를 구한다.
	
	@method pulse
	@static
	@param {Number} nPulse 진동수
	@return {Function} 생성된 이펙트 함수
	@example
		var f = jindo.m.Effect.pulse(3); //진동수 3을 가지는 함수를 리턴
		//시작 수치 값과 종료 수치 값을 설정해 jindo.m.Effect 함수를 생성
		var fEffect = f(0, 100);
		fEffect(0); => 0
		fEffect(1); => 100
**/
jindo.m.Effect.pulse = function(nPulse) {
    return jindo.m.Effect(function(s){
		return (-Math.cos((s * (nPulse - 0.5) * 2) * Math.PI) / 2) + 0.5;	
	});
};

/**
	nPeriod의 주기와 nHeight의 진폭을 가지는 sin 함수를 구한다.
	
	@method wave
	@static
	@param {Number} nPeriod 주기
	@param {Number} nHeight 진폭
	@return {Function} 생성된 이펙트 함수
	@example
		var f = jindo.m.Effect.wave(3, 1); //주기 3, 높이 1을 가지는 함수를 리턴
		//시작 수치 값과 종료 수치 값을 설정해 jindo.m.Effect 함수를 생성
		var fEffect = f(0, 100);
		fEffect(0); => 0
		fEffect(1); => 0
**/
jindo.m.Effect.wave = function(nPeriod, nHeight) {
    return jindo.m.Effect(function(s){
    	return (nHeight || 1) * (Math.sin(nPeriod * (s * 360) * Math.PI / 180)).toFixed(5);
	});
};

/**
	CSS3 Transition Timing Function 의 step-start 와 동일한 함수
	
	@method stepStart
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.stepStart = jindo.m.Effect(function(s) {
	return s === 0 ? 0 : 1;
});

/**
	CSS3 Transition Timing Function 의 step-end 와 동일한 함수
	
	@method stepEnd
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.m.Effect.stepEnd = jindo.m.Effect(function(s) {
	return s === 1 ? 1 : 0;
});

/**
	easeIn 이펙트 함수
	easeInCubic 함수와 동일하다.
	
	@method easeIn
	@static
	@see easeInCubic
**/
jindo.m.Effect.easeIn = jindo.m.Effect.easeInCubic;
/**
	easeOut 이펙트 함수
	easeOutCubic 함수와 동일하다.
	
	@method easeOut
	@static
	@see easeOutCubic
**/
jindo.m.Effect.easeOut = jindo.m.Effect.easeOutCubic;
/**
	easeInOut 이펙트 함수
	easeInOutCubic 함수와 동일하다.
	
	@method easeInOut
	@static
	@see easeInOutCubic
**/
jindo.m.Effect.easeInOut = jindo.m.Effect.easeInOutCubic;
/**
	easeOutIn 이펙트 함수
	easeOutInCubic 함수와 동일하다.
	
	@method easeOutIn
	@static
	@see easeOutInCubic
**/
jindo.m.Effect.easeOutIn = jindo.m.Effect.easeOutInCubic;
/**
	bounce 이펙트 함수
	easeOutBounce 함수와 동일하다.
	
	@method bounce
	@static
	@see easeOutBounce
**/
jindo.m.Effect.bounce = jindo.m.Effect.easeOutBounce;
/**
	elastic 이펙트 함수
	easeInElastic 함수와 동일하다.
	
	@method elastic
	@static
	@see easeInElastic
**/
jindo.m.Effect.elastic = jindo.m.Effect.easeInElastic;
/*jshint eqeqeq: false, white : false, sub: true, undef: true, evil : true, browser: true, -W099 : true, -W014 : true, -W041 : true, -W083 : true, -W027 : true */

/**
    순차적으로 이루어지는 애니메이션 컴포넌트

    @author hooriza
    @version 1.17.0

    @class jindo.m.Morph
    @extends jindo.m.Component
    @uses jindo.m.Effect
    @keyword 애니메이션, animation, transition
    @group Component
    @update

    @history 1.15.0 Update transform 스타일에서 matrix, matrix3d 속성에 대해서도 애니메이션이 가능하도록 개선
    @history 1.15.0 Bug 시작값과 종료값이 동일 할 때도 애니메이션이 진행되는 문제 수정
    @history 1.14.0 Update Keyframe 객체를 재생목록에 넣을 수 있는 pushKeyframe 메서드 추가
	@history 1.14.0 Update Keyframe 객체를 재생목록에 넣을 수 있는 pushKeyframe 메서드 추가
	@history 1.13.0 Bug 애니메이션이 진행되고 있는 도중에 pause 하고 clear 호출 후, 다시 play 할 경우 오류 수정
    @history 1.10.0 Bug bUseTranstion = true일 경우, pause 메소드 버그 수정
    @history 1.10.0 Bug bUseTranstion = true일 경우, 시작점이 반영되지 않는 버그 수정
    @history 1.10.0 Bug bUseTranstion = true일 경우, display = none인 엘리먼트를 css transition으로 변환할때 다음 애니메이션이 진행되지 않는 버그 수정

    @history 1.9.0 release 최초 릴리즈
**/
jindo.m.Morph = jindo.$Class({

	/**
		컴포넌트 생성
		@constructor

		@param {Hash} [oOptions] 옵션
			@param {Function} [oOptions.fEffect=jindo.m.Effect.linear] 애니메이션에 사용되는 jindo.m.Effect 의 함수들
			@param {Boolean} [oOptions.bUseTransition=true] CSS Transition 를 사용할지 여부, 사용할꺼면 true, 아니면 false
	**/
	$init : function(oOptions) {

		this.option({
			'fEffect' : jindo.m.Effect.linear,
			'bUseTransition' : true
		}).option(oOptions);

		var oStyle = document.body.style;

		// transition CSS 지원하는 환경인지?
		this._bTransitionSupport = (
			'transition' in oStyle ||
			'webkitTransition' in oStyle ||
			'MozTransition' in oStyle ||
			'OTransition' in oStyle ||
			'msTransition' in oStyle
		);

		var oAgent = jindo.$Agent();
		var oOS = oAgent.os();
		var oNavigator = oAgent.navigator();

		this._bHasTransformRenderBug = oOS.ios && parseInt(oOS.version, 10) === 5 && oNavigator.msafari;

		this._aQueue = []; // 큐
		this._aIngItem = null; // 현재 진행되고 있는 항목

		this._oRAF = null;
		this._bPlaying = null; // 플레이 중인지
		this._nPtr = 0; // 현재 포인터
		this._nPausePassed = 0; // 일시정지시 어느 시점에서 일시정지 되었는지
		this._aRepeat = []; // 반복 구현을 위한 스택

		this._sTransitionEnd = ( // transitionEnd 이벤트 이름 설정
			('webkitTransition' in oStyle && 'webkitTransitionEnd') ||
			('transition' in oStyle && 'transitionend') ||
			('MozTransition' in oStyle && 'transitionend') ||
			('OTransition' in oStyle && 'oTransitionEnd') ||
			('msTransition' in oStyle && 'MSTransitionEnd')
		);

	},

	///////////////////////////////////////////////////////////////////////////////////////////////////
	/// PUSH 메서드군
	///////////////////////////////////////////////////////////////////////////////////////////////////

	/**
		애니메이션 동작을 재생목록에 넣음
		
		@method pushAnimate
		
		@param {Number} nDuration 변경 할일을 몇 ms 동안 진행되게 할지
		@param {Array} aLists 애니메이션을 진행 할 객체와 속성 목록
			@param {Object} aLists.0 어떤 객체에 대해서 진행 할지
			@param {Hash} aLists.1 어떤 속성들을 변경 할지
			@param {Object} [aLists.2] 어떤 객체에 대해서 진행 할지 (2)
			@param {Hash} [aLists.3] 어떤 속성들을 변경 할지 (2)
			@param {Object} [aLists.4] 어떤 객체에 대해서 진행 할지 (3)
			@param {Hash} [aLists.5] 어떤 속성들을 변경 할지 (3)
			...
		
		@return {this}
		
		@example
			oMorph.pushAnimate(3000, [
				elFoo, {
					'@left' : '300px',
					'scrollTop' : 100
				},
				elBar, {
					'scrollLeft' : 500,
					'@backgroundColor' : '#f00'
				}
			]).play();
	**/
	pushAnimate : function(nDuration, aLists) {

		if (aLists && !(aLists instanceof Array)) { throw Error('aLists should be a instance of Array'); }

		aLists = [].concat(aLists);
		aLists.duration = nDuration;

		this._aQueue.push(aLists);

		return this;

	},

	/**
		Keyframe 객체를 재생목록에 넣음

		@method pushKeyframe

		@param {Number} nDuration 변경 할일을 몇 ms 동안 진행되게 할지
		@param {jindo.m.Keyframe} oKeyframe Keyframe 객체

		@return {this}
	**/
	pushKeyframe : function(nDuration, oKeyframe) {
		this._aQueue.push({ action : 'keyframe', args : { duration : nDuration, keyframe : oKeyframe } });
		return this;
	},

	/**
		일정시간 또는 다른 jindo.m.Morph 의 애니메이션이 끝나기를 기다림
		
		@method pushWait
		@param {Number|jindo.m.Morph} vItem 기다리게 할 ms 단위의 시간 또는 다른 애니메이션 객체
		@param {Number|jindo.m.Morph} [vItem2] 기다리게 할 ms 단위의 시간 또는 다른 애니메이션 객체 (2)
		@param {Number|jindo.m.Morph} [vItem3] 기다리게 할 ms 단위의 시간 또는 다른 애니메이션 객체 (3)
		...
		
		@example
			oMorph
			.pushWait(3000) // 3초 기다리기
			.pushWait(oOtherMorph); // 다른 morph 객체가 끝날때까지 기다리기

		@return {this}
	**/
	pushWait : function(nDuration) {

		var oMorph;

		// 인자를 여러개 지정 할 수 있음
		for (var i = 0, nLen = arguments.length; i < nLen; i++) {

			var vItem = arguments[i];

			if (vItem instanceof this.constructor) { // Morph 객체가 들어왔으면
				this._aQueue.push(vItem);
			} else { // 숫자가 들어왔으면
				this.pushAnimate(vItem, []);
			}

		}

		return this;

	},

	/**
		실행 할 함수를 재생목록에 넣음
		
		@method pushCall
		@param {Function} fpCallback 순서가 되었을 때 실행 할 함수
		
		@return {this}
		
		@example
			oMorph.pushCall(function() {
				alert('애니메이션이 시작될꺼임');
			}).pushAnimate(3000,
				elFoo, {
					'@left' : '300px',
					'scrollTop' : 100
				}
			).pushCall(function() {
				alert('애니메이션이 끝났음');
			}).play();
	**/
	pushCall : function(fpCallback) {
		this._aQueue.push(fpCallback);
		return this;
	},

	/**
		반복 구역 시작 지점을 재생목록에 넣음
		
		@method pushRepeatStart
		@param {Number} [nTimes=1] 몇 번 반복할껀지 (무한반복할꺼면 Infinity 를 지정)
		@return {this}
	**/
	pushRepeatStart : function(nTimes) {

		if (typeof nTimes === 'undefined') { nTimes = 1; }

		var sLabel = 'L' + Math.round(new Date().getTime() * Math.random());
		this._aRepeat.push(sLabel);

		this._pushLabel(sLabel, nTimes);
		return this;

	},

	/**
		goto 명령으로 이동하는데 사용되는 라벨을 재생목록에 넣음
		
		@ignore
		@method _pushLabel
		@param {String} sLabel 라벨명
		@return {this}
	**/
	_pushLabel : function(sLabel, nTimes) {

		if (typeof nTimes === 'undefined') { nTimes = Infinity; }
		this._aQueue.push({ action : 'label', args : { label : sLabel, times : nTimes, loops : 0 } });

		return this;

	},

	/**
		반복 구역 종료 지점을 재생목록에 넣음
		
		@method pushRepeatEnd
		@return {this}
	**/
	pushRepeatEnd : function() {

		var self = this;
		var sLabel = this._aRepeat.pop();

		this._aQueue.push({ action : 'goto', args : { label : sLabel } });

		return this;

	},

	///////////////////////////////////////////////////////////////////////////////////////////////////
	/// flow 동작 구현
	///////////////////////////////////////////////////////////////////////////////////////////////////

	// Morph 객체가 끝나기를 기다리기
	_waitMorph : function(oMorph) {

		var self = this;

		// 이미 Morph 가 재생중이 아니면 그만둠
		if (!oMorph.isPlaying()) {
			return true;
		}

		var fHandler = function() {
			// 핸들러를 해제하고
			oMorph.detach('end', fHandler).detach('pause', fHandler);
			// 다음 큐의 항목을 처리
			self._flushQueue();
		};

		// 지정한 Morph 객체가 끝나거나 일시정지되면
		oMorph.attach('end', fHandler).attach('pause', fHandler);

		return false;

	},

	// 라벨 이름에 맞는 인덱스 얻기
	_getLabelIndex : function(sLabel) {

		var aItem = null;

		for (var i = 0, nLen = this._aQueue.length; i < nLen; i++) {
			aItem = this._aQueue[i];
			if (aItem.action === 'label' && aItem.args.label === sLabel) { return i; }
		}

		return -1;

	},

	// 반복문의 끝부분 인덱스 얻기
	_getRepeatEndIndex : function(sLabel, nFrom) {

		var aItem = null;

		for (var i = nFrom || 0, nLen = this._aQueue.length; i < nLen; i++) {
			aItem = this._aQueue[i];
			if (aItem.action === 'goto' && aItem.args.label === sLabel) { return i; }
		}

		return -1;

	},

	// 다음 큐의 항목을 처리
	_flushQueue : function() {

		var bSync, aItem;
		var self = this;

		var oKeyframe, nPausePassed, aCompiledItem;

		do {

			// 비동기적으로 처리하는 상황이라고 일단 설정
			bSync = false;

			// 현재 큐의 항목 얻음
			aItem = this._aIngItem = this._aQueue[this._nPtr];

			// 큐에 아무것도 없으면 더이상 재생할게 없으므로 그만둠
			if (!aItem) {

				this._bPlaying = false;

				/**
					애니메이션이 종료 되었을 때(더이상 진행할 내용이 없을때) 발생
					@event end
				**/
				if (!aItem) {
					this.fireEvent('end');
				}

				return;
			}

			// 포인터를 다음으로 이동
			this._nPtr++;

			if (aItem instanceof Function) { // 함수를 실행해야 하는 상황 (pushCall)
				aItem.call(this);
				bSync = true;
				continue;
			} else if (aItem instanceof this.constructor) { // Morph 을 기다려야 하는 상황 (pushWait(oMorph))
				bSync = this._waitMorph(aItem);
				continue;
			} else if (typeof aItem === 'number') { // 일정시간 멈춰야 하는 상황 (pushWait(300))
				setTimeout(function() { self._flushQueue(); }, aItem);
				continue;
			} else if (aItem.action === 'label') { // 라벨 (pushRepeatStart)

				if (++aItem.args.loops > aItem.args.times) { // times 를 넘겨 실행되었으면

					var nIndex = this._getRepeatEndIndex(aItem.args.label, this._nPtr);
					aItem.args.loops = 0;

					// 반복문이 종료되는 시점으로 이동
					if (nIndex > -1) { this._goto(nIndex + 1); }

				}

				bSync = true;
				continue;
			} else if (aItem.action === 'goto') { // 특정 라벨로 이동 (pushRepeatEnd)
				this._goto(aItem.args.label);
				bSync = true;
				continue;
			} else if (aItem.action === 'keyframe') { // Keyframe 객체 실행 (pushKeyframe)

				oKeyframe = aItem.args.keyframe;
				nPausePassed = this._nPausePassed;
				aCompiledItem = this._aCompiledItem = aItem.args;

				bSync = aCompiledItem.duration < 0;

				if (bSync) {
					this._processKeyframe(1.0, oKeyframe);
					continue;
				}

				this._playKeyframe(nPausePassed, oKeyframe);
				this._nPausePassed = 0;
				continue;
			}

			// 애니메이션 진행 (pushAnimate)

			aCompiledItem = this._aCompiledItem;
			nPausePassed = this._nPausePassed;

			if (!nPausePassed) { // 중간에 일시정지 된 상태가 아니면
				aCompiledItem = this._aCompiledItem = this._compileItem(aItem); // 컴파일
			} else { // 중간에 일시정지 된 상태면
				// 나머지는 전부 다 RAF 로 돌리도록 강제 변경
				for (var i = 0, nLen = aCompiledItem.length; i < nLen; i++) {
					aCompiledItem[i].sTimingFunc = '';
				}
				aCompiledItem.allCSS = false;
			}

			if (aCompiledItem.length === 0) { // 애니메이션 진행 할 게 없으면 그냥 setTimeout
				setTimeout(function() { self._flushQueue(); }, aCompiledItem.duration);
				continue;
			}

			// console.log('_flushQueue', aCompiledItem);

			bSync = aCompiledItem.duration < 0;

			if (bSync) {
				this._processItem(1.0, true); // 마지막 상태로 바로 셋팅
				continue;
			}

			this._playAnimate(nPausePassed);
			this._nPausePassed = 0;

		} while(bSync); // 동기적으로 처리하는 상황이면 다음 큐 항목 계속해서 처리

	},

	///////////////////////////////////////////////////////////////////////////////////////////////////
	/// 애니메이션 동작 구현
	///////////////////////////////////////////////////////////////////////////////////////////////////

	// Keyframe 객체 애니메이션 구현
	_playKeyframe : function(nPausePassed, oKeyframe) {

		var self = this;
		this._nStart = new Date().getTime() - nPausePassed;

		var aCompiledItem = this._aCompiledItem;
		var nDuration = aCompiledItem.duration;

		(function loop() {

			self._oRAF = self._requestAnimationFrame(function() {

				var nStart = self._nStart;

				if (self._oRAF === null) { return; }
				self._oRAF = null;

				var nPer = Math.min(1, Math.max(0, (new Date().getTime() - nStart) / nDuration));
				oKeyframe.frame(nPer);

				if (nPer < 1) {
					loop();
				} else {
					self.fireEvent('timerEnd');
					self._flushQueue();
				}

			});

		})();

	},

	_processKeyframe : function(nRate, oKeyframe) {
		oKeyframe.preprocess().frame(nRate);
	},

	// 애니메이션 수행
	_playAnimate : function(nPausePassed) {

		var self = this;

		this._nStart = new Date().getTime() - nPausePassed; // 시작시간
		this._nIng = 2; // CSS 와 RAF 두 종류를 사용해서 애니메이션 해야함

		// 처음부터 진행하는거면 처음 상태로 셋팅
		if (!nPausePassed) {
			this._processItem(0.0, true, 3/*ALL*/, true);
		}

		var aCompiledItem = this._aCompiledItem;
		// console.log(aCompiledItem);

		if (aCompiledItem.allCSS) { // 전부다 CSS 로 돌려야 하는 상황이면
			this._nIng--; // RAF 는 돌릴 필요 없으니까 nIng 하나 감소
		} else { // 일부는 RAF 로 돌려야 하는 상황이면
			this._animationLoop(true); // RAF 돌리기
		}

		// CSS 로 돌리기
		(function() {

			// CSS 를 적용해야 하는 것 적용

			// CSS 애니메이션을 진행
			// aTransitionCache 에는 Transition CSS 가 지정된 객체들의 배열이 반환됨
			var aTransitionCache = self._processItem(1.0, true, 1/*CSS*/).transitionCache;

			if (!aTransitionCache || aCompiledItem.duration === 0) {
				if (--self._nIng === 0) {
					self._flushQueue();
				}
				return;
			}

			var nLen = aTransitionCache.length;
			var welObj = nLen ? aTransitionCache[0] : null;

			// 현재 항목의 애니메이션이 모두 끝났을 때 호출됨 (일시정지 하면서 끝난 경우 bPause 는 true)
			var fpNext = function(bPause) {

				var oItem;
				var aShouldReset = [];

				while (oItem = aTransitionCache.pop()) {

					// 완전한 중단을 위해 0.0001ms 로 지정
					// oItem.css(self._getCSSKey('transitionProperty'), 'none');
					oItem.css(self._getCSSKey('transitionDuration'), '0.0001ms');
					aShouldReset.push(oItem);

				}

				aTransitionCache = null;

				// 0.0001ms 로 지정했던걸 곧바로 0 으로 지정
				(window.requestAnimationFrame || window.setTimeout)(function() {

					// if (self._bPlaying) {
					// 	aShouldReset = null;
					// 	return;
					// }

					while (oItem = aShouldReset.pop()) {
						oItem.css(self._getCSSKey('transitionDuration'), '0');
						oItem.css(self._getCSSKey('transitionProperty'), 'none');
					}

					aShouldReset = null;

				}, 0);

				self.fireEvent('transitionEnd');

				// CSS, RAF 둘다 처리했고 일시정지하는 상황이 아니면
				if (--self._nIng === 0 && !bPause) {
					self._requestAnimationFrame(function() {
						// 큐에 있는 다음 항목 처리
						self._flushQueue();
					});
				}

			};

			// 변화시키는 모든 엘리먼트가 안 보이는 상태일때는 transitionEnd 이벤트가 발생하지 않으므로 그냥 다음으로 넘어감
			if (!welObj) {
				fpNext();
				return;
			}

			var elObj = welObj.$value();

			var fpOnTransitionEnd = function(bPause) {
				elObj.removeEventListener(self._sTransitionEnd, self._fpOnTransitionEnd, true);
				self._fpOnTransitionEnd = null;
				fpNext(bPause === true); // 일시정지 하면서 호출 된 상황인지
			};

			self._fpOnTransitionEnd = function(evt) {
				// console.log('on fpOnTransitionEnd', evt);
				fpOnTransitionEnd(evt);
			};

			// transitionEnd 이벤트 핸들러 등록
			elObj.addEventListener(self._sTransitionEnd,  self._fpOnTransitionEnd, true);

		})();

	},

	/**
	 * RAF 돌리기
	 * @param bSetStatic 상수(애니메이션이 불가능한 값)를 사용한 값도 셋팅할꺼면 true, 변화하는 값(애니메이션이 가능한 값)만 셋팅할꺼면 false
	 */
	_animationLoop : function(bSetStatic) {

		var self = this;

		this._oRAF = this._requestAnimationFrame(function() {

			var nStart = self._nStart;
			var nDuration = self._aCompiledItem.duration;

			if (self._oRAF === null) { return; }
			self._oRAF = null;

			var nPer = Math.min(1, Math.max(0, (new Date().getTime() - nStart) / nDuration));
			self._processItem(nPer, bSetStatic, 2/*RAF*/);

			if (nPer < 1) {
				self._animationLoop();
			} else {
				self.fireEvent('timerEnd');
				if (--self._nIng === 0) {
					self._flushQueue();
				}
			}

		});

	},

	/**
	 * @param nRate 얼마나 진행 시킬지 (0~1)
	 * @param bSetStatic 상수를 사용한 값도 셋팅할꺼면 true, 변화하는 값만 셋팅할꺼면 false
	 * @param nTargetType 셋팅할 대상을 지정 (1 : CSS Transition 를 쓰는 것, 2 : RAF 를 쓰는 것)
	 * @param bPause 정지하기 위해 호출하는 거면
	 */
	_processItem : function(nRate, bSetStatic, nTargetType, bPause) {

		var oRet = {
			// 셋팅되어야 하는 일반 프로퍼티(CSS 속성이 아닌) 목록 (bPause 가 true 일때만 채워짐)
			// 나중에 pause 메서드의 뒷부분에서 사용된다.
			normalPropsToPause : [],

			// Transition 스타일에 설정된 엘리먼트들을 담는 배열
			// 나중에 transtion 스타일을 리셋 해주기 위해 사용된다.
			transitionCache : []
		};

		var aNormalPropsToPause = oRet.normalPropsToPause;
		var aTransitionCache = oRet.transitionCache;

		var self = this;

		var aCompiledItem = this._aCompiledItem;
		var nDuration = aCompiledItem.duration;

		/*
			0 으로 지정했을때는 비동기적으로 동작해야 하기 때문에
			CSS duration 으로 셋팅될때 1ms 로 지정될 수 있도록 바꿔주고,

			-1 으로 지정했을때는 동기적으로 동작해야 하기 때문에
			CSS duration 으로 셋팅될때 0ms 로 지정될 수 있도록 바꿔줌.
		*/
		if (nDuration === 0) { nDuration = 1; }
		else if (nDuration < 0) { nDuration = 0; }

		var oObj, welObj, oProps;

		var vProp, nType;

		var sStyleKey;
		var bHasTransformRenderBug = this._bHasTransformRenderBug;

		nTargetType = nTargetType || (1/*CSS*/ | 2/*RAF*/);

		/**
			애니메이션 진행을 위해 값을 설정하기 직전에 발생
			@event beforeProgress

			@stoppable

			@param {Number} nRate 진행률 (0~1 사이의 값)
			@param {Function} stop 호출 시 값을 설정하지 않음
		**/
		if (!this.fireEvent('beforeProgress', { 'nRate' : nRate })) {
			return;
		}

		var aLists = [], oListProp;

		for (var i = 0, oItem; oItem = aCompiledItem[i]; i++) {

			oObj = oItem.oObj;
			welObj = oItem.welObj;
			oProps = oItem.oProps;

			var sObjTimingFunc = oItem.sTimingFunc;
			if (sObjTimingFunc && (nTargetType & 1)) {

				// Transition CSS 를 먹여도 실행되지 않는 문제 해결
				welObj && welObj.$value().clientHeight;

				if (!('@transition' in oProps) && !bPause) {
					if (!('@transitionProperty' in oProps)) { welObj.css(this._getCSSKey('transitionProperty'), 'all'); }
					if (!('@transitionDuration' in oProps)) { welObj.css(this._getCSSKey('transitionDuration'), (nDuration / 1000).toFixed(3) + 's'); }
					if (!('@transitionTimingFunction' in oProps)) { welObj.css(this._getCSSKey('transitionTimingFunction'), sObjTimingFunc); }
				}

				aTransitionCache.push(welObj);

			}

			oListProp = {};
			aLists.push(oObj, oListProp);

			// 현재 지정된 종료 transform 을 유지한채 (nRate:1) 멈추고 싶을때 AppleWebKit/534.30 에서 발생하는 문제 회피
			if (bPause && nRate === 1 && '@transform' in oProps && /AppleWebKit\/534\.30/.test(navigator.userAgent)) {
				welObj.css(this._getCSSKey('transform'), '');
				oObj.clientHeight;
			}

			for (var sKey in oProps) if (oProps.hasOwnProperty(sKey)) {

				vProp = oProps[sKey];
				sStyleKey = /^@(.*)$/.test(sKey) && RegExp.$1;

				nType = sObjTimingFunc && sStyleKey ? 1/*CSS*/ : 2/*RAF*/;

				// 지금꺼가 바꿔야 하는게 아니면 그만둠
				if (!(nTargetType & nType)) {
					continue;
				}

				if (typeof vProp === 'function') { vProp = vProp(nRate); } // 변화하는 값이면
				else if (!bSetStatic) { continue; } // 정적인 값인데 bSetStatic 도 false 면 그만둠

				// CSS 스타일 속성인 경우
				if (sStyleKey) {
					if (/transition/.test(sKey)) { vProp = this._getCSSVal(vProp); }

					// SlideReveal 에서 발생했던 렌더링 버그?? (엉뚱한 위치에서 움직이는 문제)
					if (bHasTransformRenderBug && '@transform' === sKey && ('@left' in oProps || '@top' in oProps)) {
						oObj.clientHeight;
					}

					welObj.css(this._getCSSKey(sStyleKey), vProp);

				// 일반 속성인 경우
				} else {

					if (bPause) {
						// 중지시킬때 일반 속성은 바로 셋팅하지 않고 나중에 셋팅하기 위해 배열에 넣어둠
						aNormalPropsToPause.push([ oObj, sKey, vProp ]);
					} else {
						oObj[sKey] = vProp;
					}
				}

				oListProp[sKey] = vProp;

			}

		}

		/**
			애니메이션 진행을 위해 값을 설정한 직후에 발생
			@event progress

			@param {Array} aLists 설정 한 애니메이션 정보 (객체와 프로퍼티 목록이 번갈아가며 존재)
			@param {Number} nRate 진행률 (0~1 사이의 값)
		**/
		this.fireEvent('progress', { 'aLists' : aLists, 'nRate' : nRate });

		return oRet;

	},

	/**
		pushAnimate 로 지정된 내용들을 애니메이션을 돌리기 쉬운 형태로 바꾸는 메서드
		
		BEFORE :
			[ 'foo', { '@left' : '100px' }, 'bar' : { '@top' : jindo.m.Effect.bounce('50px') } ]

		AFTER :
			[
				{
					oObj : 'foo',
					welObj : jindo.$Element('foo'),
					sTimingFunc : 'ease-out',
					oProps : {
						'@left' : function(p) { ... }
					}
				},
				{
					oObj : 'bar',
					welObj : jindo.$Element('bar'),
					sTimingFunc : null,
					oProps : {
						'@top' : function(p) { ... }
					}
				}
			]
	*/
	_compileItem : function(aItem) {

		var bFoundShouldRAF = aItem.length == 0; // 타이머로 동작해야 하는 속성이 발견된 경우

		var aRet = [];
		aRet.duration = aItem.duration;

		var oObj, welObj, oProps;
		var vDepa, vDest;

		var oCompiledProps;

		var bIsStyleKey, sStyleKey;

		// 옵션에 지정된 기본 효과 얻기
		var fDefaultEffect = this.option('fEffect');

		for (var i = 0, nLen = aItem.length; i < nLen; i += 2) {

			var fObjEffect, // 객체에서 사용하는 이펙트 함수
				sObjTimingFunc = null; // 객체에서 사용하는 CSS 타이밍 함수

			oObj = aItem[i];
			welObj = jindo.$Element(oObj);
			oProps = aItem[i + 1];
			oCompiledProps = {};

			var bHasProps = false;

			// 각 엘리먼트에 할당되어야 하는 값을 얻음
			for (var sKey in oProps) if (oProps.hasOwnProperty(sKey)) {

				var fPropEffect, // 프로퍼티에서 사용하는 이펙트 함수
					sPropTimingFunc; // 프로퍼티에서 사용하는 CSS 타이밍함수

				vDest = oProps[sKey];
				bIsStyleKey = /^@(.*)$/.test(sKey);

				sStyleKey = RegExp.$1;

				// 목표값이 배열 형태이면 시작값도 지정된 상태
				if (vDest instanceof Array) {
					vDepa = vDest[0];
					vDest = vDest[1];
				} else if (bIsStyleKey) { // 키값이 CSS 이면 시작값을 현재 상태로부터 얻음
					vDepa = welObj.css(this._getCSSKey(sStyleKey));
				} else { // 키값이 CSS 가 아닌경우의 시작값을 현재 상태로부터 얻음
					vDepa = oObj[sKey];
				}

				vDepa = (vDepa === 0 ? vDepa : vDepa || '');

				// 이 속성을 변경할때 사용할 이펙트
				fPropEffect = typeof vDest === 'function' ? vDest.effectConstructor : fDefaultEffect;
				sPropTimingFunc = this._getEffectCSS(fPropEffect) || '';

				// transform 스타일이면
				if (/^@transform$/.test(sKey)) {

					if (typeof vDest === 'function') { vDest = vDest.end; }
					oCompiledProps[sKey] = this._getTransformFunction(vDepa, vDest, fPropEffect, oObj);
					if (jindo.m) {
						var osInfo = jindo.m.getOsInfo();
						if (/matrix/.test(vDepa) || /matrix/.test(vDest)) {
							// 2.x 버젼에서는 matrix CSS 에 transition 이 적용이 안되서 무조건 타이머 쓰도록 보정
							if (osInfo.android && parseFloat(osInfo.version) < 3) {
								sPropTimingFunc = '';
							}
						}
					}

				} else {

					// '@left' : jindo.m.Effect.bounce('250px') 형태로 사용했을떄
					if (typeof vDest === 'function') {
						if ('setStart' in vDest) { vDest.setStart(vDepa); }
						oCompiledProps[sKey] = vDest;
					// '@left' : '250px' 형태로 사용했을떄
					} else {
						try {
							oCompiledProps[sKey] = fPropEffect(vDepa, vDest);
						} catch(e) {
							// px -> % 또는 % -> px 인 경우 문제~!
							if (!/^unit error/.test(e.message)) { throw e; }
							oCompiledProps[sKey] = vDest;
						}
					}

				}

				var fProp = oCompiledProps[sKey];
				if (typeof fProp === 'function' && fProp(0) === fProp(1)) { // 시작값과 종료값이 같으면 그만둠
					delete oCompiledProps[sKey];
					continue;
				}

				if (bIsStyleKey) { // 키 값이 CSS 이면
					// 객체에 CSS 타이밍함수가 안 정해져 있으면 이 속성의 CSS 타이밍함수 쓰기
					if (sObjTimingFunc === null) {
						sObjTimingFunc = sPropTimingFunc;
					// 객체에 이미 CSS 타이밍함수가 정해져있고 이 속성에서 쓰는거랑 다르면 객체 전체에서 CSS 타이밍함수 안 쓰기
					} else if (sObjTimingFunc !== sPropTimingFunc) {
						sObjTimingFunc = '';
					}
				} else { // 키 값이 CSS 가 아니면 CSS 를 사용한 효과구현 안하게
					sPropTimingFunc = '';
				}

				bFoundShouldRAF = bFoundShouldRAF || !sPropTimingFunc;
				bHasProps = true;

			}

			// 안보이는 상태면 무조건 RAF 쓰게 함
			if (!welObj.visible()) {
				sObjTimingFunc = null, bFoundShouldRAF = true;
			}

			bHasProps && aRet.push({
				'oObj' : oObj, 'welObj' : welObj, 'oProps' : oCompiledProps,
				'sTimingFunc' : sObjTimingFunc
			});

		}

		// RAF 를 사용해야 하는 속성이 하나도 없으면 allCSS 를 true 로
		aRet.allCSS = !bFoundShouldRAF;

		return aRet;

	},

	///////////////////////////////////////////////////////////////////////////////////////////////////
	/// public 메서드 구현
	///////////////////////////////////////////////////////////////////////////////////////////////////

	/**
		현재 재생위치부터 재생목록에 들어있는 일을 수행
		
		@method play
		@return {this}
	**/
	play : function() {

		if (!this._bPlaying) {
			this._bPlaying = true;

			/**
				애니메이션이 재생이 시작 되었을 때 발생
				@event play
			**/
			this.fireEvent('play');
			this._flushQueue();

		}

		return this;

	},

	/**
		재생 위치를 맨 처음으로 변경
		@method reset
		@return {this}
	**/
	reset : function() {
		return this._goto(0);
	},

	/**
		애니메이션 수행 중단
		@method pause

		@param {Number} [nRate] 중단 위치 (0(시작상태)~1(종료상태) 사이의 값을 지정 할 수 있으며, 생략시 현 상태로 중단한다)

		@return {this}
	**/
	pause : function(nRate) {

		// $Element('ball').css({
		// 	'transform' : 'translateX(100px) scale(1.5) rotate(45deg)',
		// 	// 'transitionProperty' : 'none',
		// 	'transitionDuration' : '0.0001ms'
		// });

		// return;

		// this._requestAnimationFrame(function() {
		// 	$Element('ball').css({
		// 		'transitionDuration' : '0'
		// 	});
		// }, 0);

		// console.log(this._fpOnTransitionEnd);

		// return;

		if (!this._bPlaying) { return this; }

		this._cancelAnimationFrame(this._oRAF);
		this._oRAF = null;

		var aCompiledItem = this._aCompiledItem;
		var nDuration = aCompiledItem.duration;

		if (typeof nRate === 'undefined') {
			var nPassed = new Date().getTime() - this._nStart;
			nRate = nPassed / nDuration;
		}

		nRate = Math.max(0, Math.min(1, nRate));

		var aNormalPropsToPause = null;

		if (aCompiledItem.keyframe) {
			this._processKeyframe(nRate, aCompiledItem.keyframe);
		} else {
			aNormalPropsToPause = this._processItem(nRate, true, 3/*ALL*/, true).normalPropsToPause;
		}

		this._nPtr--;
		this._nPausePassed = Math.round(nDuration * nRate);

		if (this._fpOnTransitionEnd) {
			this._fpOnTransitionEnd(true);
		}

		// console.log('aNormalPropsToPause', aNormalPropsToPause);

		// 일반속성을 중지 시키면서 바로 셋팅하면 일부 모바일단말기에서 제대로 셋팅되지 않는 문제 회피
		if (aNormalPropsToPause) {
			for (var i = 0, nLen = aNormalPropsToPause.length; i < nLen; i++) {
				var aNormalProp = aNormalPropsToPause[i];
				aNormalProp[0][aNormalProp[1]] = aNormalProp[2];
			}
		}

		this._bPlaying = false;

		/**
			애니메이션이 재생이 정지 되었을 때 발생
			@event pause
		**/
		this.fireEvent('pause');

		return this;

	},

	/**
		지정된 라벨로 실행 포인터를 이동함
		
		@ignore
		@method _goto
		@param {String} sLabel 라벨명
		@return {this}
	**/
	/**
		지정된 목록 위치로 실행 포인터를 이동함
		
		@ignore
		@method _goto
		@param {Number} nIndex 목록 위치
		@return {this}
	**/
	_goto : function(nIndex) {

		var sLabel = nIndex;

		if (typeof nIndex === 'number') {
			nIndex = nIndex || 0;
		} else {
			nIndex = this._getLabelIndex(sLabel);
			if (nIndex === -1) throw 'Label not found';
		}

		this._nPtr = nIndex;
		this._nPausePassed = 0;

		return this;

	},

	/**
		현재 재생중인 상태인지 반환
		
		@method isPlaying
		@return {Boolean} 재생중이면 true, 재생중이 아니면 false
	**/
	isPlaying : function() {
		return this._bPlaying || false;
	},

	/**
		재생목록을 모두 삭제함
		@method clear
		@return {this}
	**/
	clear : function() {

		this._aQueue.length = 0;
		this._aRepeat.length = 0;
		this._nPtr = 0;
		this._nPausePassed = 0;

		return this;

	},

	/**
		현재 재생 위치를 얻음
		
		@ignore
		@method _getPointer
		@return {Number} 현재 재생 위치
	**/
	_getPointer : function() {
		return this._nPtr;
	},

	// Effect 함수를 CSS timing-function 스타일로 변환
	_getEffectCSS : function(fEffect) {

		var bUseTransition = this.option('bUseTransition') && this._bTransitionSupport;

		// Transition 를 쓰지않도록 셋팅되어 있으면 RAF 사용
		if (!bUseTransition) { return null; }

		// progress 나 beforeProgress 핸들러가 등록되어 있으면 RAF 사용
		if (
			(this._htEventHandler.progress && this._htEventHandler.progress.length) ||
			(this._htEventHandler.beforeProgress && this._htEventHandler.beforeProgress.length)
		) { return null; }

		// toString 함수가 구현되어 있으면 그거 사용
		if (fEffect.hasOwnProperty('toString')) {
			return fEffect.toString();
		}

		switch (fEffect) {
		case jindo.m.Effect.linear:
			return 'linear'; break;
		case jindo.m.Effect.cubicEase:
			return 'ease'; break;
		case jindo.m.Effect.cubicEaseIn:
			return 'ease-in'; break;
		case jindo.m.Effect.cubicEaseOut:
			return 'ease-out'; break;
		case jindo.m.Effect.cubicEaseInOut:
			return 'ease-in-out'; break;
		default:
			if (fEffect.cubicBezier && Math.max.apply(Math, fEffect.cubicBezier) <= 1 && Math.min.apply(Math, fEffect.cubicBezier) >= 0) {
				return 'cubic-bezier(' + fEffect.cubicBezier.join(',') + ')';
			}
			break;
		}

		// CSS 에 없는 timing-function 이면 RAF 사용
		return null;

	},

	// jindo.m 이 없을 수 도 있기 때문에 별도 구현
	_requestAnimationFrame : function(fFunc) {

		var ret;
		var self = this;
 
		var fWrap = function() {

			if (ret === self._oLastRAF) {
				self._oLastRAF = null;
				fFunc();
			}
 
		};
 
		if (window.requestAnimationFrame) {
			ret = requestAnimationFrame(fWrap);
		} else {
			ret = setTimeout(fWrap, 1000 / 60);
		}
 
		return (this._oLastRAF = ret);

	},

	// jindo.m 이 없을 수 도 있기 때문에 별도 구현
	_cancelAnimationFrame : function(nRAF) {

		var ret;

		if (window.cancelAnimationFrame) {
			ret = cancelAnimationFrame(nRAF);
		} else {
			ret = clearTimeout(nRAF);
		}
 
		this._oLastRAF = null;
 
		return ret;

	},	

	///////////////////////////////////////////////////////////////////////////////////////////////////
	/// UTIL 성격의 메서드
	///////////////////////////////////////////////////////////////////////////////////////////////////
	_oProperPrefix : {},

	// 지정된 스타일에 적당한 CSS prefix 얻기
	_getProperPrefix : function(sType) {

		var oProperPrefix = this._oProperPrefix;
		if (sType in oProperPrefix) { // 캐싱되어 있는 값이 있으면 그걸 쓰기
			return oProperPrefix[sType];
		}

		var oBodyStyle = document.body.style;
		var aPrefix = [ 'webkit', '', 'Moz', 'O', 'ms' ];
		var sPrefix, sFullType;

		var fReplacer = function(s) { return s.toUpperCase(); };

		for (var i = 0, nLen = aPrefix.length; i < nLen; i++) {
			sPrefix = aPrefix[i];
			sFullType = sPrefix + (sPrefix ? sType.replace(/^[a-z]/, fReplacer) : sType);
			if (sFullType in oBodyStyle) {
				return (oProperPrefix[sType] = sPrefix);
			}
		}

		return (oProperPrefix[sType] = '');

	},

	// Jindo 하위버젼을 사용할 것을 대비해서 CSS prefix 를 붙혀주는 코드를 별도 구현
	_getCSSKey : function(sName) {

		var self = this;
		var sPrefix = '';

		var sFullname = sName.replace(/^(\-(webkit|o|moz|ms)\-)?([a-z]+)/, function(_, __, _sPrefix, sType) {
			sPrefix = _sPrefix || self._getProperPrefix(sType); // prefix 가 명시적으로 지정되어 있지 않으면 적당한 prefix 을 얻어서 지정
			if (sPrefix) { sType = sType.replace(/^[a-z]/, function(s) { return s.toUpperCase(); }); }
			return sType;
		}).replace(/\-(\w)/g, function(_, sChar) { // -소문자 를 대문자로 변경
			return sChar.toUpperCase();
		});

		return (({ 'o' : 'O', 'moz' : 'Moz', 'webkit' : 'Webkit' })[sPrefix] || sPrefix) + sFullname;

	},

	// Jindo 하위버젼을 사용할 것을 대비해서 CSS prefix 를 붙혀주는 코드를 별도 구현
	_getCSSVal : function(sName) {

		var self = this;

		var sFullname = sName.replace(/(^|\s)(\-(webkit|moz|o|ms)\-)?([a-z]+)/g, function(_, sHead, __, sPrefix, sType) {
			sPrefix = sPrefix || self._getProperPrefix(sType); // prefix 가 명시적으로 지정되어 있지 않으면 적당한 prefix 을 얻어서 지정
			return sHead + (sPrefix && '-' + sPrefix + '-') + sType;
		});

		return sFullname;

	},

	/**
		transform-styled 문자열을 matrix 문자열로 바꾸는 함수
	**/
	_getMatrixObj : function(sTransform, elBox) {

		sTransform = sTransform.replace(/\b(translate(3d)?)\(\s*([^,]+)\s*,\s*([^,\)]+)/g, function(_1, key, _2, x, y) {

			// translate 와 tranalate3d 에서 % 단위의 값을 px 로 변환
			if (/%$/.test(x)) { x = parseFloat(x) / 100 * elBox.offsetWidth + 'px'; }
			if (/%$/.test(y)) { y = parseFloat(y) / 100 * elBox.offsetHeight + 'px'; }

			return key + '(' + x + ',' + y;

		}).replace(/\b(translate([XY]))\(\s*([^\)]+)/g, function(_, key, type, val) {

			// translateX 와 translateY 에서 % 단위의 값을 px 로 변환
			if (type === 'X' && /%$/.test(val)) { val = parseFloat(val) / 100 * elBox.offsetWidth + 'px'; }
			else if (type === 'Y' && /%$/.test(val)) { val = parseFloat(val) / 100 * elBox.offsetHeight + 'px'; }

			return key + '(' + val;

		});

		var getMatrixValue;
		var CSSMatrix = window.WebKitCSSMatrix || window.MSCSSMatrix || window.OCSSMatrix || window.MozCSSMatrix || window.CSSMatrix;

		// CSSMatrix 객체를 지원하는 브라우저면
		if (CSSMatrix) {

			// 그냥 CSSMatrix 의 toString 기능을 사용
			getMatrixValue = function(sTransform) {
				return new CSSMatrix(sTransform).toString();
			};

		// CSSMatrix 객체를 지원하지 않는 브라우저면
		} else {

	        var sID = 'M' + Math.round(new Date().getTime() * Math.random());
	        var oAgent = jindo.$Agent().navigator();

	        var sPrefix = oAgent.firefox ? 'moz' : (oAgent.ie ? 'ms' : 'o');
			var sTransformKey = '-' + sPrefix + '-transform';

	        var elStyleTag = document.createElement('style');
	        elStyleTag.type = "text/css";

	        var elHTML = document.getElementsByTagName('html')[0];
	        elHTML.insertBefore(elStyleTag, elHTML.firstChild);

	        var oSheet = elStyleTag.sheet || elStyleTag.styleSheet;

	        var elDummy = document.createElement('div');
	        elDummy.id = sID;

	        var oComputedStyle = window.getComputedStyle(elDummy, null);

	        // 임시로 DOM 을 생성하고 getComputedStyle 로부터 얻은 값을 사용
			getMatrixValue = function(sTransform) {

				var sRet = null;

				oSheet.insertRule('#' + sID + ' { ' + sTransformKey + ': ' + sTransform + ' !important; }', 0);
	        	document.body.insertBefore(elDummy, document.body.firstChild);
				sRet = oComputedStyle.getPropertyValue(sTransformKey);

		        document.body.removeChild(elDummy);
				oSheet.deleteRule(0);
				
				return sRet;

			};

		}

		// transform 문자열을 matrix 로 변환
		var sVal = getMatrixValue(sTransform);

		// hello(foo,bar,baz) 형태의 값을 얻었으면
		if (/^([^\(]+)\(([^\)]*)\)$/.test(sVal)) {
			return {
				key : RegExp.$1,
				val : RegExp.$2.replace(/\s*,\s*/g, ' ') // 쉼표를 빈칸으로 변경
			};
		}

		// 기본 matrix 값 반환
		return { key : 'matrix', val : '1 0 0 1 0 0' };

	},

	// matrix(...) 를 matrix3d(...) 로 변환
	_convertMatrix3d : function(oTransformObj) {

		if (oTransformObj.key === 'matrix3d') { return oTransformObj; }

		var aVal = oTransformObj.val.split(' ');
		oTransformObj.key = 'matrix3d';

		// matrix(a, b, c, d, tx, ty) is a shorthand for matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1).
		aVal.splice(2, 0, '0'); aVal.splice(3, 0, '0'); aVal.splice(6, 0, '0'); aVal.splice(7, 0, '0');
		aVal.splice(8, 0, '0'); aVal.splice(9, 0, '0'); aVal.splice(10, 0, '1'); aVal.splice(11, 0, '0');
		aVal.splice(14, 0, '0'); aVal.splice(15, 0, '1');

		oTransformObj.val = aVal.join(' ');

		return oTransformObj;

	},

	/**
		transform CSS 속성값을 파싱
		예)
			_parseTransformText('scale3d(2, 1.5, 1) translate(100px, 30px) rotate(10deg)');

			-> {
				'scaleX' : '2',
				'scaleY' : '1.5',
				'scaleZ' : '1',
				'translateX' : '100px',
				'translateY' : ' 30px',
				'rotate' : '10deg'
			}
	**/
	_parseTransformText : function(sText) {

		sText = sText || '';

		var oRet = {};

		sText.replace(/([\w\-]+)\(([^\)]*)\)/g, function(_, sKey, sVal) {

			var aVal = sVal.split(/\s*,\s*/);

			switch (sKey) {
			case 'translate3d':
			case 'scale3d':
			case 'skew3d':
				sKey = sKey.replace(/3d$/, '');
				oRet[sKey + 'Z'] = aVal[2];
				// cont. X, Y 도 마저 셋팅 되도록 일부러 break 안 넣었음

			case 'translate':
			case 'scale':
			case 'skew':
				oRet[sKey + 'X'] = aVal[0];

				if (typeof aVal[1] === 'undefined') {
					if (sKey === 'scale') { oRet[sKey + 'Y'] = aVal[0]; }
				} else {
					oRet[sKey + 'Y'] = aVal[1];
				}

				break;

			default:
				oRet[sKey] = aVal.join(',');
				break;
			}

		});

		return oRet;

	},

	/**
		Effect 컴퍼넌트의 기능을 사용 할 수 없는 시작값과 종료값을 가진 Effect 객체를 동작 할 수 있게 만들어 주는 함수

		var my = jindo.m.Effect.linear();
		 
		my.start = 'scale3d(2, 1.5, 1) translate(100px, 30px) rotate(10deg)';
		my.end = 'translateX(300px)';
		 
		var func = ..._getTransformFunction(my);
		func(0.5); // 'scaleX(2) scaleY(1.5) scaleZ(1) translateX(200px) translateY(30px) rotate(10deg)'
	**/
	_getTransformFunction : function(sDepa, sDest, fEffect, elBox) {

		var sKey;

		var oDepa, oDest;

		// matrix transform 이 바뀌는거면
		if (/matrix/.test(sDepa + sDest)) {

			// 둘다 matric 객체로 변환
			oDepa = this._getMatrixObj(sDepa, elBox);
			oDest = this._getMatrixObj(sDest, elBox);

			// 종류가 다르면 범용적으로 맞출 수 있는 matrix3d 로 변환
			if (oDepa.key !== oDest.key) {
				oDepa = this._convertMatrix3d(oDepa);
				oDest = this._convertMatrix3d(oDest);
			}

			fEffect = fEffect(oDepa.val, oDest.val);

			return function(nRate) {
				return nRate === 1 ? sDest : oDepa.key + '(' + fEffect(nRate).replace(/ /g, ',') + ')';
			};

		}

		// 시작값과 종료값을 각각 파싱
		oDepa = this._parseTransformText(sDepa);
		oDest = this._parseTransformText(sDest);

		var oProp = {};

		// 시작값에 있는 내용으로 속성들 셋팅
		for (sKey in oDepa) if (oDepa.hasOwnProperty(sKey)) {
			// 시작값, 종료값 셋팅 (만약 종료값이 지정되어 있지 않으면 1 또는 0 셋팅)
			oProp[sKey] = fEffect(oDepa[sKey], oDest[sKey] || (/^scale/.test(sKey) ? 1 : 0));
		}

		// 종료값에 있는 내용으로 속성들 셋팅
		for (sKey in oDest) if (oDest.hasOwnProperty(sKey) && !(sKey in oDepa)) { // 이미 셋팅되어 있지 않는 경우에만
			// 시작값, 종료값 셋팅 (만약 시작값이 지정되어 있지 않으면 1 또는 0 셋팅)
			oProp[sKey] = fEffect(oDepa[sKey] || (/^scale/.test(sKey) ? 1 : 0), oDest[sKey]);
		}

		var fpFunc = function(nRate) {
			var aRet = [];
			for (var sKey in oProp) if (oProp.hasOwnProperty(sKey)) {
				aRet.push(sKey + '(' + oProp[sKey](nRate)+ ')');
			}
			/*
			aRet = aRet.sort(function(a, b) {
				return a === b ? 0 : (a > b ? -1 : 1);
			});
			*/

			return aRet.join(' ');
		};

		return fpFunc;

	}

}).extend(jindo.m.Component);
/**
	@fileOverview 엘리먼트의 css 스타일을 조정해 부드러운 움직임(변형)을 표현한다
	@author "oyang2"
	@version 1.17.0
	@since 2011. 12. 13.
**/
/**
	jindo.m.Transition 컴포넌트는 엘리먼트의 css 스타일을 조정해 부드러운 움직임(변형)을 표현한다

	@class jindo.m.Transition
	@extends jindo.m.Component
	@uses jindo.m.Morph
	@keyword transition, 트랜지션
	@group Component
    
	@history 1.9.0 Update jindo.m.Morph 기반으로 변경
	@history 1.3.0 Update {bUseCss3d} 옵션삭제
	@history 1.3.0 Update {bUseTimingFunction} 옵션추가
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.2.0 Update {bUseCss3d} Option 추가
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Update Android의 경우 translate호출시에 [css3+자바스크립트] 형식을 혼합해서 사용하는 형식으로 수정
	@history 1.1.0 Update 스크립트로 TimingFunction을 구현
	@history 1.0.0 Release 최초 릴리즈
**/
jindo.m.Transition = jindo.$Class({
	_aTaskQueue : null,

	/* @lends jindo.m.Transition.prototype */
	/**
		초기화 함수
		@constructor

		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sTransitionTimingFunction='ease-in-out'] css Timeing function을 설정
			<ul>
			<li>ease : 속도가 급가속되다가 급감속되는 효과 (거의 끝에서 급감속됨)</li>
			<li>linear : 등속효과</li>
			<li>ease-in : 속도가 점점 빨라지는 가속 효과</li>
			<li>ease-out : 속도가 천천히 줄어드는 감속효과</li>
			<li>ease-in-out : 속도가 천천히 가속되다가 천천히 감속되는 효과 (가속과 감속이 부드럽게 전환됨)</li>
			</ul>
			@param {Function} [htOption.bUseTimingFunction=jindo.m._isUseTimingFunction()] translate 혹은 translate3d 속성을 css3의 TimingFunction을 사용할지 여부. <br /> false로 설정할 경우 자바스크립트의 setTimeout을 이용하여 애니메이션을 처리한다.
	**/
	$init : function(htOption) {
	    
		this.option({
			/**
				기본 속성 지정
				@to do
			**/
			sTransitionTimingFunction : 'ease-in-out',
			bUseTimingFunction : jindo.m._isUseTimingFunction()
		});
		
		this.option(htOption || {});
		
		var self = this;
	    this._oMorph = new jindo.m.Morph({
	        "bUseTransition" : this._htOption.bUseTimingFunction,
	        "fEffect" : this._getEffect(this.option("sTransitionTimingFunction"))
	    }).attach({
	        "end" : function(){
	            self._onTransitionEnd();
	        },
	        "pause" : function(){
	            self._onTransitionEnd();
	        }
	    });
	    
	    this._aTaskQueue = [];
	    this._bIsPlaying = false;
	    
		this._initVar();
	},

	/**
		jindo.m.Transition 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar: function() {
		this._aTaskQueue = [];
		this._bIsPlaying = false;
		this._sCssPrefix = jindo.m.getCssPrefix();

		this._aBeforeStatus = []; //transition 시작전 element의 style 상태를 저장한 배열

		if(this._sCssPrefix.length > 0){
			this._sCssPrefix = '-' + this._sCssPrefix.toLowerCase()+'-';
		}
		this._htCurrentTask = null;

		// this._bNoUseCss3d = !this.option('bUseTimingFunction');
		//안드로이드 전용 타이머.
		// this._nTimerAnimate = null;
	},
    
    _getEffect : function(sValue){
        var oEffect = jindo.m.Effect.cubicEaseInOut;
        // console.log(sValue);
        switch(sValue){
            case "linear" :
                oEffect = jindo.m.Effect.linear; break;
            case "ease" :
                oEffect = jindo.m.Effect.cubicEase; break;
            case "ease-in" :
                oEffect = jindo.m.Effect.cubicEaseIn; break;
            case "ease-out" :
                oEffect = jindo.m.Effect.cubicEaseOut; break;
            case "ease-in-out" :
                oEffect = jindo.m.Effect.cubicEaseInOut; break;
        }
        return oEffect;
    },
    
	/**
		Transition 을 시작한다.
		@method start
	**/
	start : function(){
		if(!this._oMorph.isPlaying() && !this.isPlaying() && this.isExistTask()){
			this._prepareTask();
		}
	},

	/**
		현재 트랜지션이 진행중인지 리턴한다.

		@method isPlaying
		@return {Boolean} 현재 트랜지션이 진행중인지 여부
	**/
	isPlaying : function(){
		return this._bIsPlaying;
	},


	/**
		다음 진행할 트랜지션이 있는지 리턴한다.

		@method isExistTask
		@return {Boolean} 다음 진행할 트랜지션이 있는지 여부
	**/
	isExistTask : function(){
		if(!this._aTaskQueue){
			return false;
		}
		var nLen = this._aTaskQueue.length;
		var bValue = (nLen > 0)? true : false;

		return bValue;
	},

	/**
		Transition을 큐에 담는다.
		여러 단계의 Transition을 담아두고 순차적으로 실행시킬때 사용한다.
		@remark start() 메소드가 호출되기 전까지 수행되지 않는다.

		@method queue
		@param {HTMLElement} el 트랜지션 대상 에리먼트
		@param {Number} nDuration 트랜지션 수행 시간
		@param {Object} htCommand 적용할 명령 해시 테이블
		@return {this}
		@example 여러개의 명령을 지정하는 예제
			oTransition.queue(jindo.$('div1'),
					1000, {
						htStyle : {
							"left : "200px",
							"top" : "50px",
							"width" : "200px",
							"height" : "200px",
							"background-color" : "#CCC"
						}
					}
			);

		@example 여러개의 명령을 지정하는 예제(css3 명령 지정예제)
			oTransition.queue(jindo.$('div1'),
					1000, {
						htStyle : {
							"width" : "200px",
							"height" : "200px",
							"background-color" : "#CCC"
						},
						htTransform : {
							"transform" : "translate(100px,100px)"
						}
					}
			);

		@example 콜백함수를 지정하는 예제
			oTransition.queue(jindo.$('div1'),
					1000, {
						htStyle : {
							"width" : "200px",
							"height" : "200px",
							"background-color" : "#CCC"
						},
						htTransform : {
							"transform" : "translate(100px,100px)"
						},
						fCallback : function(){
							alert("트랜지션 끝");
						}
					}
			);
		@example 콜백에 스타일을 지정하는 예제
			oTransition.queue(jindo.$('div1'),
					1000, {
						htStyle : {
							"width" : "200px",
							"height" : "200px",
							"background-color" : "#CCC"
						},
						htTransform : {
							"transform" : "translate(100px,100px)"
						},
						fCallback : {
							htStyle : {
								"background-color" : "red"
							},
							htTransform : {
								"transform" : "rotate(30deg)"
							}
						}
					}
			);
	**/
	queue : function(elTarget, nDuration, aCommand){
		var htTask = {
			sType : 'style',
			sTaskName : '',
			elTarget : elTarget,
			nDuration : nDuration
		};

		htTask.htDefault = {};
		htTask.htStyle = aCommand.htStyle || {};
		htTask.htTransform = aCommand.htTransform || {};
		htTask.sTaskName = aCommand.sTaskName || null;
		htTask.fCallback =  aCommand.fCallback;
		
		var htTmpData = {};
		htTmpData = this._getTranslateStyle(aCommand.htStyle || {}, htTmpData);
		htTmpData = this._getTranslateStyle(aCommand.htTransform || {}, htTmpData);
		
		this._pushTask(nDuration, elTarget, htTmpData, htTask);
		return this;
	},

    _getTranslateStyle : function(htStyle, htReturn){
        var htData = htReturn || {};
        for ( var i in htStyle){
            htData["@"+i] = htStyle[i];
        }
        return htData;
    },
    
	/**
		현재 트랜지션을 중지한다. bAfter가 true이면 현재 트랜지션이 완료된 상태로 중지한다.<br />
		false 값이면 현재 트랜지션 이전 상태로 중지한다.

		@method stop
		@param {Boolean} bAfter
	**/
	stop : function(bAfter){
		//console.log('stop! ' + this._bIsPlaying);
		if(!this.isPlaying()){
			return;
		}
		//console.log('STOP!2 호출');
		if(typeof bAfter === 'undefined'){
			bAfter = true;
		}

		/**
			Transition의 stop 메소드를 통해 중지하였을 때 발생

			@event stop
			@param {String} sType 커스텀 이벤트명
			@param {String} sTaskName 사용자가 설정한 sTaskName. 설정한 값이 없을 경우 null값 반환
			@param {HTMLElement} element Transition 대상 엘리먼트
			@param {Number} nDuration Transiton이 수행되는 시간
			@param {Function} stop 수행시 Transition이 중지 되지 않고 그대로 실행된다.
		**/
		if(!this._fireCustomEvent('stop', {
			element : this._htCurrentTask.elTarget,
			sTaskName : this._htCurrentTask.sTaskName,
			nDuration : this._htCurrentTask.nDuration
		})){
			return;
		}

		this._stopTransition(bAfter);
	},

	/**
		현재 queue에 쌓여있는 모든 태스크를 삭제한다. 현재 트랜지션이 실행중이면 중지하고 삭제한다.
		@remark bStopAfter가 true이면 현재 트랜지션이 완료된 상태로 중지하고 false 값이면 현재 트랜지션 이전 상태로 중지한다.

		@method clear
		@param {Boolean} bStopAfter
		@history 1.1.0 Update Method 추가
	**/
	clear : function(bStopAfter){
		this.stop(bStopAfter);
		this._aTaskQueue = [];
		//console.log('TranslateCrear!');
	},

	/**
		현재 태스크를 재시작한다.
	**/
	_resume : function(){
		if(this._htCurrentTask){
			this._doTask();
		}
	},

	/**
		현재 진행중인 태스크를 중지한다. bAfter가 true 이면 태스크 이후의 설정으로 바꾸고 false 이면 태스크 전의 설정으로 바꿔준다.
		@param {Boolean} bAfter
	**/
	_stopTransition : function(bAfter){
        var nPause = 0;
		//transition 이전 상태로 되돌려야 할 경우
		if(!bAfter){
			//console.log(this._elCurrent);
			var nIndex = this._getBeforeStatusElement(this._elCurrent);
			if(nIndex > -1){
				//console.log(this._aBeforeStatus[nIndex].style);
				jindo.$Element(this._elCurrent).attr('style', this._aBeforeStatus[nIndex].style);
			}
		}else{
		    nPause = 1;
		}

		
        this._oMorph.pause(nPause);
		this._bIsPlaying = false;
		this._htCurrentTask = null;

	},

	/**
		진행할 태스크를 준비하고 실행한다.
	**/
	_prepareTask : function(){
		var htTask = this._popTask();

		if(htTask === null || !htTask){
		    this._oMorph.clear();
			this._bIsPlaying = false;
			return;
		}
		this._htCurrentTask = htTask;

		this._resume();
	},

	/**
		htTask를 queue에 추가 한다.
		@param {Object}
	**/
	_pushTask : function(nDuration, elTarget, htTransData, htTask){
		this._aTaskQueue.push({
		    "nDuration" : nDuration, 
		    "elTarget" : elTarget, 
		    "htTask" : htTransData,
		    "sTaskName" : htTask.sTaskName,
		    "fCallback" : htTask.fCallback
	    });
	},

	/**
		현재 queue 에저장된 작업에서 진행 해야 할 작업을 리턴한다,
		@return {HashTable | null}
	**/
	_popTask : function(){
		if(!this.isExistTask()){
			return null;
		}
		var htTask = this._aTaskQueue.shift();
		if(htTask){
			return htTask;
		}else{
			return null;
		}

	},

	/**
		현재 태스크를 실행한다.
	**/
	_doTask : function(){
		//console.log('//// doTask ' +this._htCurrentTask.sTaskName);
		if(this._htCurrentTask){
			this._bIsPlaying = true;
			/**
				Transition이 시작 될때 발생

				@event start
				@param {String} sType 커스텀 이벤트명
				@param {String} sTaskName 사용자가 설정한 sTaskName. 설정한 값이 없을 경우 null값 반환
				@param {HTMLElement} element Transition 대상 엘리먼트
				@param {Number} nDuration Transiton이 수행되는 시간
				@param {Function} stop 수행시 Transition이 실행되지 않는다. 전체 Transtion 실행도 멈춘다
			**/
			if(!this._fireCustomEvent('start', {
				element : this._htCurrentTask.elTarget,
				sTaskName : this._htCurrentTask.sTaskName,
				nDuration : this._htCurrentTask.nDuration
			})){
				//this._htCurrentTask;
				return;
			}
			
			this._oMorph.pushAnimate(
			    this._htCurrentTask.nDuration == 0 ? -1 : this._htCurrentTask.nDuration, 
			    [this._htCurrentTask.elTarget, this._htCurrentTask.htTask]);
			this._oMorph.play();


			var el = this._htCurrentTask.elTarget;
			var wel = jindo.$Element(el);
			this._elCurrent = el;

			this._setBeforeStatus(wel);
		}
	},


	/**
		wel의 태스크 실행전 css로 복구한다.
		@param {Element}wel
	**/
	_setBeforeStatus : function(wel){
		var nIndex = this._getBeforeStatusElement(wel.$value());

		if(nIndex > -1){
			this._aBeforeStatus[nIndex].style = wel.attr('style');
		}else{
			this._aBeforeStatus.push({
				el : wel.$value(),
				style : wel.attr('style')
			});
		}
	},

	/**
		저장된 이전 task에서 el에 관련된 task의 index를 리턴한다.
		@param {HTMLElement} el
		@return {Number} index
	**/
	_getBeforeStatusElement : function(el){
		var nIndex = -1;

		for(var i=0,nLen = this._aBeforeStatus.length; i<nLen; i++){
			if(this._aBeforeStatus[i].el === el){
				nIndex = i;
				break;
			}
		}

		return nIndex;
	},

	/**
		커스텀 이벤트를 발생시킨다.
		@param {String} 커스텀 이벤트 이름
		@param {Object} 커스텀 이벤트 파라미터
	**/
	_fireCustomEvent : function(sName, htParam){
		return this.fireEvent(sName,htParam);
	},

	/**
		트랜지션이 모두 종료된 시점에 발생하며 콜백함수가 있으면 콜백을 실행시키고 다음 작업이 있으면 다음 작업을 시작한다.
	**/
	_onTransitionEnd : function(){

		//불필요한  transition css 속성 제거
		var self = this;
		if(this._htCurrentTask){
			var sCallbackType = typeof this._htCurrentTask.fCallback;
			if(sCallbackType == 'function'){
				// if(this._bNoUseCss3d){
						// setTimeout(function(){
							// try {
									// self._htCurrentTask.fCallback();
							// } catch(e) {}
						// },5);
				// }else{
					self._htCurrentTask.fCallback();
				// }
			}else if(sCallbackType == 'object'){
				var wel = jindo.$Element(this._htCurrentTask.elTarget), p;
				for (p in this._htCurrentTask.fCallback.htTransform){
					var sValue = this._htCurrentTask.fCallback.htTransform[p];
					if(p == 'transform'){
						var sPrefix = this._sCssPrefix+p;
						var sText = wel.$value().style[sPrefix];
						if(sText.length > 0){
							//@to-do transform 추가하거나 기존값이면 대체하는 로직 추가할것;
							//sValue = sText + sValue;
							sValue = sValue;
						}
					}
					wel.$value().style[this._sCssPrefix+p] = sValue;
				}
				for (p in this._htCurrentTask.fCallback.htStyle) {
					wel.css(p, this._htCurrentTask.fCallback.htStyle[p]);
				}
			}

			/**
				Transition이 끝날 때 발생

				@event end
				@param {String} sType 커스텀 이벤트명
				@param {String} sTaskName 사용자가 설정한 sTaskName. 설정한 값이 없을 경우 null값 반환
				@param {HTMLElement} element Transition 대상 엘리먼트
				@param {Number} nDuration Transiton이 수행되는 시간
				@param {Function} stop 수행시 영향을 받는것은 없다
			**/
			this._fireCustomEvent('end',{
				element : this._htCurrentTask.elTarget,
				sTaskName : this._htCurrentTask.sTaskName,
				nDuration : this._htCurrentTask.nDuration
			});
    		setTimeout(function(){
    			self._prepareTask();
    		},10);
		}
	},

	/**
		jindo.m.Transition 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy : function() {

		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._aTaskQueue = null;
		this._bIsPlaying = null;
		this._sCssPrefix = null;
		this._aBeforeStatus = null;
		// this._bNoUseCss3d = null;
		// this._nTimerAnimate = null;

		this._htCurrentTask = null;
	}
}).extend(jindo.m.Component);/**
	@fileOverview 정년도/월의 달력을 지정한 엘리먼트에 표시하는 컴포넌트이다. 미리 지정해놓은 엘리먼트에 삽입되기 때문에 원하는 디자인과 마크업 구조를 적용할 수 있다
	@author sculove
	@version 1.17.0
	@since 2012. 05. 14.
**/
/**
	정년도/월의 달력을 지정한 엘리먼트에 표시하는 컴포넌트이다. 미리 지정해놓은 엘리먼트에 삽입되기 때문에 원하는 디자인과 마크업 구조를 적용할 수 있다

	@class jindo.m.Calendar
	@extends jindo.m.UIComponent
	@uses jindo.m.Transition
	@keyword calendar, 달력
	@group Component
	@invisible
**/
jindo.m.Calendar = jindo.$Class({
	/* @lends jindo.m.Calendar.prototype */
	/**
		초기화 함수

		@constructor
		@param {String|HTMLElement} el
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {String} [htOption.sClassPrefix='calendar-'] Class의 prefix명
			@param {Boolean} [htOption.bUseEffect=false] 이펙트 사용 여부
			@param {Number} [htOption.nEffectDuration=200] fade-in/out Duration시간
			@param {String} [htOption.sTitleFormat='yyyy.mm'] className이 '[prefix]title' 인 엘리먼트를 찾아서 해당 형식대로 날짜를 출력한다. 다음의 형식을 사용할 수 있다.
			@param {Array} [htOption.aMonthTitle=[]] 월 이름
			@param {Object} [htOption.htToday] 오늘
	**/
	$init : function(el, htOption) {
		var oDate = new Date();
		this.option({
			bActivateOnload : true,
			sClassPrefix : "calendar-",
			bUseEffect : false,
			nEffectDuration : 200,
			sTitleFormat : "yyyy.mm", //달력의 제목부분에 표시될 형식
			aMonthTitle : ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], //월 이름
			htToday : {nYear:oDate.getFullYear() , nMonth:oDate.getMonth() + 1 , nDate: oDate.getDate()}
		});
		this.option(htOption || {});
		this._initVar();
		this._setWrapperElement(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	/**
		jindo.m.Calendar 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this._bVisible = false;
		this._oToday = this.option("htToday");
		this._oViewDate = null;
		this._nSelectDate = -1;
		this._sClassPrefix = this.option("sClassPrefix");
		this._aDayInfo = [];
		if(this.option("bUseEffect")) {
			this._oTransition = new jindo.m.Transition();
		}
	},

	/**
		jindo.m.Calendar 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement : function(el) {
		this._htWElement = {};
		this._htWElement["calendarBase"] = jindo.$Element(el);
		this._htWElement["calendarBase"].css({
			"position" : "absolute",
			"display" : "none"
		});

		// 날짜 정보 추출
		var aTh = this._htWElement["calendarBase"].queryAll("th");
		for(var i=0, nLength=aTh.length; i<nLength; i++) {
			this._aDayInfo.push(jindo.$Element(aTh[i]).text());
		}
		this._htWElement["calendarTitle"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "title"));
		this._htWElement["calendarTable"] = jindo.$Element(this._htWElement["calendarBase"].query("table"));
		this._htWElement["calendarTbody"] = jindo.$Element(this._htWElement["calendarTable"].query("tbody"));
		this._htWElement["yearPreBtn"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "btn-prev-year"));
		this._htWElement["preBtn"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "btn-prev-mon"));
		this._htWElement["yearNextBtn"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "btn-next-year"));
		this._htWElement["nextBtn"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "btn-next-mon"));
		this._htWElement["closeBtn"] = jindo.$Element(this._htWElement["calendarBase"].query("." + this._sClassPrefix + "btn-close"));
	},

	getCalendarBase : function() {
		return this._htWElement["calendarBase"];
	},

	/**
		jindo.m.Calendar 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},
	/**
		jindo.m.Calendar 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
	},
	/**
		jindo.m.Calendar 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function(){
		this._htEvent = {};
		// 이전 년도 버튼
		if(this._htWElement["yearPreBtn"]){
			this._htEvent["pre_year_click"] = {
					el  : this._htWElement["yearPreBtn"],
					ref : jindo.$Fn(this._onYearPre, this).attach(this._htWElement["yearPreBtn"], "click")
			};
		}
		// 이전 달 버튼
		if(this._htWElement["preBtn"]){
			this._htEvent["pre_click"] = {
					el  : this._htWElement["preBtn"],
					ref : jindo.$Fn(this._onPre, this).attach(this._htWElement["preBtn"], "click")
			};
		}
		// 다음 년도 버튼
		if(this._htWElement["yearNextBtn"]){
			this._htEvent["next_year_click"] = {
					el  : this._htWElement["yearNextBtn"],
					ref : jindo.$Fn(this._onYearNext, this).attach(this._htWElement["yearNextBtn"], "click")
			};
		}
		// 다음 달 버튼
		if(this._htWElement["nextBtn"]){
			this._htEvent["next_click"] = {
					el  : this._htWElement["nextBtn"],
					ref : jindo.$Fn(this._onNext, this).attach(this._htWElement["nextBtn"], "click")
			};
		}
		// 닫기 버튼.
		if(this._htWElement["closeBtn"]){
			this._htEvent["close_click"] = {
					el  : this._htWElement["closeBtn"],
					ref : jindo.$Fn(this._onClose, this).attach(this._htWElement["closeBtn"], "click")
			};
		}
		// 날짜 선택.
		this._htEvent["table_click"] = {
				el  : this._htWElement["calendarTable"],
				ref : jindo.$Fn(this._onDate, this).attach(this._htWElement["calendarTable"], "click")
		};
	},
	/**
		이전달 클릭시 처리
	**/
	_onPre : function(we){
		this._moveDate("pre");
		we.stop();
	},
	/**
		이전년도 클릭시 처리
	**/
	_onYearPre : function(we){
		this._moveDate("preYear");
		we.stop();
	},
	/**
		다음달 클릭시 처리
	**/
	_onNext : function(we){
		this._moveDate("next");
		we.stop();
	},
	/**
		다음년도 클릭시 처리
	**/
	_onYearNext : function(we){
		this._moveDate("nextYear");
		we.stop();
	},
	/**
		닫기 클릭시 처리.
	**/
	_onClose : function(we){
		this.hide();
		we.stop();
	},
	/**
		날짜 선택시 처리.
	**/
	_onDate : function(we){
		if(!this._bVisible) { return; }
		var wel = jindo.$Element(we.element),
			sCellDate = "";
		if(wel.$value().tagName != "td"){
			wel = wel.parent(function(v){
				return (v.$value().tagName.toLowerCase() == "td");
			})[0];
		}
		if(wel) {
			sCellDate = wel.attr("data-cal-date");
			if(sCellDate && sCellDate.length == 8){
				this._nSelectDate = sCellDate * 1;
				/**
                    Calendar에서 일자를 선택 하기 전 발생합니다.

                    @event beforeSelectDate
                    @param {String} sType 커스텀이벤트명
                    @param {Object} oSelectDate 선택 된 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
                    @param {Function} stop 일자를 선택하지 않는다. 
                **/
                if(!this.fireEvent("beforeSelectDate", {
                    wel : wel,
                    oSelectDate : this.getSelectDate()
                })) {
                    return false;
                }
				
				/**
					Calendar에서 일자를 선택 할 경우 발생합니다.

					@event selectDate
					@param {String} sType 커스텀이벤트명
					@param {Object} oSelectDate 선택 된 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
					@param {Function} stop 일자를 선택하지 않는다.
				**/
				if(this.fireEvent("selectDate", {
					// nSelectDate : this._nSelectDate,
					wel : wel,
					oSelectDate : this.getSelectDate()
				})) {
					wel.addClass(this._sClassPrefix + 'selected');
					this.hide();
				}
			}
		}
		we.stopDefault();
		return false;
	},

	/**
		Calendar 월 이동 계산 처리
	**/
	_moveDate : function(sMode){
		if(!this._bVisible) { return; }
		var oOldDate = {
				nYear : this._oViewDate.nYear,
				nMonth : this._oViewDate.nMonth,
				nDate : this._oViewDate.nDate
			},
			oMoveDate = {
				nDate : this._oViewDate.nDate
			};
		switch(sMode) {
			case "pre" : oMoveDate.nYear = (oOldDate.nMonth == 1) ? oOldDate.nYear - 1 : oOldDate.nYear;
				oMoveDate.nMonth = (oOldDate.nMonth == 1) ? 12 : oOldDate.nMonth - 1;
				break;
			case "preYear" : oMoveDate.nYear = oOldDate.nYear - 1;
				oMoveDate.nMonth = oOldDate.nMonth;
				break;
			case "next" : oMoveDate.nYear = (oOldDate.nMonth == 12) ? oOldDate.nYear + 1 : oOldDate.nYear;
				oMoveDate.nMonth = (oOldDate.nMonth == 12) ? 1 : oOldDate.nMonth + 1;
				break;
			case "nextYear" : oMoveDate.nYear = oOldDate.nYear + 1;
				oMoveDate.nMonth = oOldDate.nMonth;
				break;
		}
		/**
			Calendar에서 현재 날짜에서 이전 달(년도) / 다음 달(년도)로 이동하기전 호출된다.

			@event beforeMoveDate
			@param {String} sType 커스텀이벤트명
			@param {Object} oOldDate 이동 하기전 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
			@param {Object} oMoveDate 이동할 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
			@param {Function} stop 이전달(년도) / 다음달(년도) 로 이동하지 않는다.
		**/
		if(this.fireEvent("beforeMoveDate", {
				oOldDate :  oOldDate,
				oMoveDate : oMoveDate
			})) {
			this._drawCalendar(oMoveDate);
			/**
				Calendar에서 현재 날짜에서 이전 달(년도) / 다음 달(년도)로 이동할 경우 발생한다.

				@event moveDate
				@param {String} sType 커스텀이벤트명
				@param oOldDate {Objec} 이동 하기전 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
				@param oMoveDate {Object} 이동할 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
			**/
			this.fireEvent("moveDate", {
				oOldDate : oOldDate,
				oMoveDate : oMoveDate
			});
		}
	},

	/**
		jindo.m.Calendar 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function(){
		for(var p in this._htEvent) {
			var ht = this._htEvent[p];
			ht.ref.detach(ht.el, p.substring(p.lastIndexOf("_")+1));
		}
		this._htEvent = null;
	},

	/**
		Calendar 를 보여 준다.

		@method show
		@example
			oCalendar.show();
	**/
	show : function(oDrawDate, oSelectedDate){
		if(!oDrawDate){
			oDrawDate = this._oToday;
		}
		/**
			Calendar가 나타나기전 발생한다.

			@event beforeShowCalendar
			@param {String} sType 커스텀이벤트명
			@param {Object} oDrawDate 그려질 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
			@param {Function} stop 캘린더를 노출하지 않는다. 
		**/
		if(this.fireEvent("beforeShowCalendar",{
				oDrawDate  : oDrawDate
			})) {
			this._nSelectDate = this._getDateNumber(oSelectedDate);
			// Calendar 생성.
			if(this._getDateNumber(oDrawDate, "YearMonth") != (this._oViewDate) ? this._getDateNumber(this._oViewDate, "YearMonth") : 0 ){
				this._drawCalendar(oDrawDate);
			} else {
				this._drawDayColor();
			}
			var self=this;

			this._htWElement["calendarBase"].show();
			if(this.option("bUseEffect")){
				this._htWElement["calendarBase"].opacity(0);
				this._oTransition.clear();
				this._oTransition.queue(this._htWElement["calendarBase"].$value(), this.option("nEffectDuration"), {
					htStyle : {
						opacity : "0.9999"
					},
					fCallback : function(){
						self._afterShow(oDrawDate);
					}
				});
				setTimeout(function() {
					self._oTransition.start();
				},10);
			} else {
				this._afterShow(oDrawDate);
			}
		}
	},
	_afterShow : function(oSelectDate) {
		this._htWElement["calendarBase"].css("zIndex", "1000");
		this._bVisible = true;
		/**
			Calendar가 나타날 경우 발생한다.

			@event showCalendar
			@param {String} sType 커스텀이벤트명
			@param {Object} oDrawDate 그려질 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
		**/
		this.fireEvent("showCalendar",{
			oDrawDate : oSelectDate
		});
	},
	/**
		Calendar 를 숨긴다.

		@method hide
		@example
			oCalendar.hide();
	**/
	hide : function(){
		var oSelectDate = this.getSelectDate();
		/**
			Calendar가 사라지기 전 발생한다.

			@event beforeHideCalendar
			@param {String} sType 커스텀이벤트명
			@param {Object} oSelectDate 선택된 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
			@param {Function} stop calendar 가 사라지지 않는다. 
		**/
		if(this.fireEvent("beforeHideCalendar",{
				"oSelectDate"  : oSelectDate
			})) {
			this._bVisible = false;
			// 이펙트 사용.
			if(this.option("bUseEffect")){
				var self=this;
				this._oTransition.queue(this._htWElement["calendarBase"].$value(), this.option("nEffectDuration"), {
					htStyle : {
						opacity : 0
					},
					fCallback : function(){
						self._afterHide(oSelectDate);
					}
				});
				self._oTransition.start();
			} else {
				this._afterHide(oSelectDate);
			}
		}
	},
	_afterHide : function(oSelectDate) {
		this._htWElement["calendarBase"].css("zIndex", "0").hide();
		/**
			Calendar가 사라질 경우 발생한다.

			@event hideCalendar
			@param {String} sType 커스텀이벤트명
			@param {Object} oSelectDate 선택된 날짜 Date 정보 ex){nYear:2011 , nMonth:1, nDate:1}
		**/
		this.fireEvent("hideCalendar",{
			"oSelectDate"  : oSelectDate
		});
	},
	/**
		Calendar 의 노출 여부를 반환.

		@method isVisible
		@return {boolean} Calendar 노출 여부.
		@example
			var bVisible = oCalendar.isVisible();	// bVisible true : 노출 false : 비노출
	**/
	isVisible : function(){
		return this._bVisible;
	},
	/**
		Calendar 의 선택 날짜를 반환.

		@method getSelectDate
		@return {Object} Calendar 선택 날짜 객체. {nYear:년도 , nMonth: 월, nDate: 날 }
		@example
			var htDate = oCalendar.getSelectDate();
			htDate.nYear; // 선택 년도
			htDate.nMonth; // 선택 월
			htDate.nDate; // 선택 날짜
	**/
	getSelectDate : function(){
		var sSelectDate, oSelectDate;
		if(this._nSelectDate && this._nSelectDate > 0){
			sSelectDate = this._nSelectDate + "";
			oSelectDate = {
				nYear : Number(sSelectDate.substr(0,4)),
				nMonth : Number(sSelectDate.substr(4,2)),
				nDate : Number(sSelectDate.substr(6,4))
			};
		}
		return oSelectDate;
	},
	/**
		Calendar Table을 그린다.
	**/
	_drawCalendar : function(oDrawDate){
		this._oViewDate = {
			nYear : oDrawDate.nYear,
			nMonth : oDrawDate.nMonth,
			nDate : oDrawDate.nDate
		};
		// if(this.fireEvent("beforeDraw",{
		// 	nYear : oDrawDate.nYear,
		// 	nMonth : oDrawDate.nMonth
		// })) {
			this._drawCalendarHeaderHtml();
			this._drawCalendarBodyHtml();
			this._drawDayColor();
			// this.fireEvent("afterDraw", {
			// 	nYear : oDrawDate.nYear,
			// 	nMonth : oDrawDate.nMonth
			// });
		// }
	},
	/**
		Calendar 현재 날짜 선택 날짜를 표시한다.
	**/
	_drawDayColor : function(){
		var nTodayDate = this._getDateNumber(this._oToday),
			nSelectDate = this._nSelectDate, // 선택한 날
			aCells = this._htWElement["calendarTbody"].queryAll('td');
		// 그려진 날짜를 비교하여 오늘 날짜와 선택 한날짜에 CSS 클래스 적용.
		var bSelectable = true;
		for (var i = 0, nLength = aCells.length, welCell; i < nLength; i++) {
			welCell = jindo.$Element(aCells[i]);
			var nDate = welCell.attr('data-cal-date') * 1;
			if(this._htSelectableData){
				bSelectable = this.isBetween(this.getStringToObject(nDate), this._htSelectableData.htDateFrom , this._htSelectableData.htDateTo);
			}
			
			if(!bSelectable){
                welCell.addClass(this._sClassPrefix + "unselectable");
            }
			
			if( !welCell.hasClass(this._sClassPrefix + 'prev-mon') && !welCell.hasClass(this._sClassPrefix + 'next-mon') ) {
				
				
				welCell[nTodayDate === nDate ? 'addClass' : 'removeClass'](this._sClassPrefix + 'today');
				welCell[(nSelectDate > -1 && nSelectDate === nDate) ? 'addClass' : 'removeClass'](this._sClassPrefix + 'selected');
				// if(!bSelectable){
					// welCell.addClass(this._sClassPrefix + "unselectable");
				// }
				if(nTodayDate == nSelectDate) {
					welCell.removeClass(this._sClassPrefix + 'today');
				}
			}
		}
	},

	/**
		Calendar Header 부분을 구성 한다.
	**/
	_drawCalendarHeaderHtml : function() {
		var nYear = this._oViewDate.nYear,
			nMonth = this._oViewDate.nMonth;
		if (nMonth < 10) {
			nMonth = ("0" + (nMonth * 1)).toString();
		}
		if(this._htWElement["calendarTitle"]) {
			this._htWElement["calendarTitle"].text(this.option("sTitleFormat").replace(/yyyy/g, nYear).replace(/y/g, (nYear).toString().substr(2,2)).replace(/mm/g, nMonth).replace(/m/g, (nMonth * 1)).replace(/M/g, this.option("aMonthTitle")[nMonth-1]));
		}
	},

	/**
		Calendar 본체 부분을 구성 한다.
	**/
	_drawCalendarBodyHtml : function() {
		var aHTML = [],oDate, nFirstTime, nLastTime,
			bPaintLastDay = false,
			nNowTime, aClassName, nNowDate, nDay,bPrevMonth,bNextMonth;

		// 해당 월의 마지막 날
		oDate = new Date(this._oViewDate.nYear, this._oViewDate.nMonth, 0);
		nLastTime = oDate.getTime();
		// 해당 월의 첫날
		oDate = new Date(this._oViewDate.nYear, this._oViewDate.nMonth - 1, 1);
		nFirstTime = oDate.getTime();

		while (oDate.getDay() !== 0) {
			oDate.setDate(oDate.getDate() - 1);
		}

		while(!bPaintLastDay){
			aHTML.push('<tr>');
			for (var i = 0; i < 7; i++) {
				nNowTime = oDate.getTime();
				aClassName = [];
				nNowDate = '';
				nDay = oDate.getDay();
				bPrevMonth = false;
				bNextMonth = false;

				if (nNowTime < nFirstTime) {
					aClassName.push(this._sClassPrefix + 'prev-mon');
					bPrevMonth = true;
				}
				if (nLastTime < nNowTime) {
					aClassName.push(this._sClassPrefix + 'next-mon');
					bNextMonth = true;
				}
				if (nDay === 0) { aClassName.push(this._sClassPrefix + 'sun'); }
				if (nDay === 6) { aClassName.push(this._sClassPrefix + 'sat'); }
				nNowDate = oDate.getFullYear() * 10000 + (oDate.getMonth() + 1) * 100 + oDate.getDate();
				aHTML.push('<td class="' + aClassName.join(' ') + '" data-cal-date="' + nNowDate + '"><a href="javascript:void(0)" class="' + this._sClassPrefix + 'date">' + oDate.getDate() + '</a></td>');
				oDate.setDate(oDate.getDate() + 1);
				if (nLastTime === nNowTime) {
					bPaintLastDay = true;
				}
				// this.fireEvent("draw", {
				// 	bPrevMonth : bPrevMonth,
				// 	bNextMonth : bNextMonth,
				// 	// elDate :
				// 	// elDateContainer :
				// 	// sHTML :
				// 	nYear : oDate.getFullYear(),
				// 	nMonth : oDate.getMonth() + 1,
				// 	nDate : oDate.getDate()
				// });
			}
			aHTML.push('</tr>');
		}
		this._htWElement["calendarTbody"].html(aHTML.join(''));
	},

	/**
		연월일을 포함한 HashTable이 특정 두 날 사이에 존재하는지 확인한다.

		@method isBetween
		@param {Object} htDate 비교를 원하는 날
		@param {Object} htFrom 시작 날짜
		@param {Object} htTo 끝 날짜
		@return {Boolean}
		@example
			oCalendar.isBetween({nYear:2010, nMonth:5, nDate:12}, {nYear:2010, nMonth:1, nDate:1}, {nYear:2010, nMonth:12, nDate:31}); => true
	**/
	isBetween : function(htDate, htFrom, htTo) {
		if (this.getDateObject(htDate).getTime() > this.getDateObject(htTo).getTime() || this.getDateObject(htDate).getTime() < this.getDateObject(htFrom).getTime()) {
			return false;
		} else {
			return true;
		}
	},

	/**
	 * 선택 가능한 날짜를 정의한다.
	 */
	setSelectableDate : function(htDateFrom, htDateTo){
		this._htSelectableData = {
			htDateFrom : htDateFrom,
			htDateTo : htDateTo
		};
	},
	
	/**
		요일 정보를 반환한다.

		@method getDayName
		@param  {Number} nIdx 요일 인덱스 (0~6)
		@return {String}		요일명
	**/
	getDayName : function(nIdx) {
		return this._aDayInfo[nIdx];
	},

	/**
		Date 객체를 구한다.

		@method getDateObject
		@param {Object} htDate 날짜 객체
		@return {Date}
		@example
			jindo.Calendar.getDateObject({nYear:2010, nMonth:5, nDate:12});
			jindo.Calendar.getDateObject(2010, 5, 12); //연,월,일
	**/
	getDateObject : function(htDate) {
		if (arguments.length == 3) {
			return new Date(arguments[0], arguments[1] - 1, arguments[2]);
		}
		return new Date(htDate.nYear, htDate.nMonth - 1, htDate.nDate);
	},

	getStringToObject : function(sDate){
		sDate = sDate + "";
		return {
			nYear : parseInt(sDate.substring(0, 4),10),
			nMonth : parseInt(sDate.substring(4, 6),10),
			nDate : parseInt(sDate.substring(6, 8),10)
		};
	},
	/**
		Date객체를 String으로 변경한다.

		@param {Object} htDate Date객체
		@param {String} sType YearMonth 인 경우, 년과 월로 계산. 그외는 년,월,일로 계산
		@return {Number} 숫자형태의 날짜
	**/
	_getDateNumber : function(htDate, sType){
		var nDate;
		if(sType === "YearMonth") {
			nDate = (htDate) ? (htDate.nYear * 10000 + htDate.nMonth * 100) : -1;
		} else {
			nDate = (htDate) ? (htDate.nYear * 10000 + htDate.nMonth * 100 + htDate.nDate) : -1;
		}
		return nDate;
	},
	/**
		jindo.m.Calendar 에서 사용하는 모든 객체를 release 시킨다.

		@method destroy
	**/
	destroy : function() {
		this.deactivate();
		this._bVisible = false;
		this._oToday = null;
		this._oViewDate = null;
		this._nSelectDate = -1;
		this._sClassPrefix = null;
		if(this.option("bUseEffect")){
			this._oTransition.destroy();
			this._oTransition = null;
		}
		this._aDayInfo = null;
	}
}).extend(jindo.m.UIComponent);
/**
	@fileOverview Form Element의 Input Form에 날짜를 쉽게 입력할 수 있도록 Calendar를 제공하는 컴포넌트
	@author sshyun, sculove
	@version 1.17.0
	@since 2011. 9. 22.
**/
/**
	Form Element의 Input Form에 날짜를 쉽게 입력할 수 있도록 Calendar를 제공하는 컴포넌트

	@class jindo.m.Datepicker
	@extends jindo.m.UIComponent
	@uses jindo.m.Calendar
	@keyword input, date, picker, 달력, 날짜, 선택
	@group Component

  @history 1.9.0 Bug 복수 생성에서 bAutoHide = true 일때 버그 수정    
  @history 1.8.0 Update 캘린더 컴포넌트 에서 선택할 수 없는 날짜에 대한 css classname 처리 
  @history 1.8.0 Update 버튼을 통해 캘린더가 노출 될 수 있도록 처리 
  @history 1.7.0 Bug 안드로이드 4.x 갤럭시 시리즈에서 하이라이트 사라지지 않는 문제 제거
	@history 1.3.0 Update jindo.Calendar →jindo.m.Calendar로 교체<br />
						[beforeDraw] Custom 이벤트 삭제<br />
						[draw] Custom 이벤트 삭제<br />
						[afterDraw] Custom 이벤트 삭제
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Bug 다중인스턴스일시 동일월 경우 날짜표시 안되는 문제 혜결<br />
						2012년 1월 31일 선택 후, 2012년 2월 달 달력으로 이동시 31일 자리에 선택표시가 나오는 문제 해결<br />
						오늘 날짜와 선택날짜가 동일할 경우, 선택날짜가 표시되도록 수정
	@history 0.9.5 Release 최초 릴리즈
**/
jindo.m.Datepicker = jindo.$Class({
	/* @lends jindo.m.Datepicker.prototype */
	/**
		초기화 함수

		@constructor
		@param {Varient} el input 엘리먼트 또는 ID
		@param {Object} [htOption] 초기화 옵션 객체
			@param {String} [htOption.sClassPrefix="calendar-"] Class의 prefix명
			@param {String} [htOption.sFormat="yyyy-mm-dd"] 선택 날짜 값에 대한 포맷 다음의 형식을 사용할 수 있다.
				<table class="tbl_board">
				<tr>
				<th>표시형식</th>
				<th>설명</th>
				<th>결과</th>
				</tr>
				<tbody>
				<tr>
				<td>yyyy</td>
				<td>4자리 연도</td>
				<td>2010</td>
				</tr>
				<tr>
				<td>yy</td>
				<td>2자리 연도</td>
				<td>10</td>
				</tr>
				<tr>
				<td>mm</td>
				<td>월</td>
				<td>9</td>
				</tr>
				<tr>
				<td>dd</td>
				<td>일</td>
				<td>26</td>
				</tr>
				<tr>
				<td>day</td>
				<td>[prefix]sun ~ [prefix]sat 클래스가 '요일표시 해더영역' 의 값으로 표기</td>
				<td>일</td>
				</tr>
				</tbody>
				</table>
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {Boolean} [htOption.bAutoHide=false] input과 Calendar 외의 영역을 선택 했을때 Calendar를 사라지게 할지 여부
	**/
	$init : function(el, htOption) {
		this.option({
			sClassPrefix : "calendar-",
			sFormat : "yyyy-mm-dd",
			bActivateOnload : true,
			bAutoHide : false
		});
		this.option(htOption || {});
		this._initVar();
		this._initCalendar(el);
		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	$static : {
		INDEX_ATTR : "data-datepickerid"
	},

	/**
		jindo.m.Datepicker 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this._oCalendar = null;
		this._htDatePickerSet = {};
		this._htSelectedDatePickerSet = null;
	},

	/**
		jindo.m.Datepicker 에서 사용하는 Calendar를 초기화한다.
		@param {Varient} el Calendar Base 엘리먼트 또는 ID
	**/
	_initCalendar : function(el) {
		var sClassPrefix = this.option("sClassPrefix"),
			htCalendarOption = this.option();
		htCalendarOption.bActivateOnload = true;
		// console.log(htCalendarOption);
		this._oCalendar = new jindo.m.Calendar( (jindo.$Element(el) ? jindo.$Element(el) : this._insertCalendarTemplate()), htCalendarOption);
	},

	/**
		선택가능한 날짜인지 확인한다.
		@param {Object} htDatePickerSet
		@param {Object} htDate
	**/
	_isSelectable : function(htDatePickerOption, htDate) {
		return this._oCalendar.isBetween(htDate, htDatePickerOption["htSelectableDateFrom"], htDatePickerOption["htSelectableDateTo"]);
	},

	/**
		DatePicker를 적용할 셋을 추가한다.
		@param {Element} elInput 날짜가 입력될 input 엘리먼트
		@param {Object} htOption Datepicker Calendar Option 정보
		@return {this} this
		@method addDatePickerSet
		@example
			oDatePicker.addDatePickerSet(
				jindo.$("input"), //날짜가 입력될 input 엘리먼트
				{
					nYear : 1983, //기본으로 설정될 연도
					nMonth : 5, //기본으로 설정될 월
					nDate : 12, //기본으로 설정될 일
					htSelectableDateFrom : { //선택가능한 첫 날짜
						nYear : 1900,
						nMonth : 1,
						nDate : 1
					},
					htSelectableDateTo : { //선택가능한 마지막 날짜
						nYear : 2100,
						nMonth : 12,
						nDate : 31
					},
					sPosition: "bottomLeft", // Calendar 위치. input을 기준으로
						 //   bottomLeft : Calenadr 를 input 의 아래 왼쪽에 위치
						 //   bottomRight : Calenadr 를 input 의 아래 오른쪽끝에 위치
						 //   topLeft : Calenadr 를 input 의 위쪽 왼쪽에 위치
						 //   topRight : Calenadr 를 input 의 위쪽 오른쪽끝에 위치
						 //   leftTop : Calenadr 를 input 의 왼쪽에 상단에 위치
						 //   leftBottom : Calenadr 를 input 의 왼쪽에 하단에 위치
						 //   rightTop : Calenadr 를 input 의 오른쪽에 상단에 위치
						 //   rightBottom : Calenadr 를 input 의 오른쪽에 하단에 위치
					zIndex: 50,				// Calendar 가 나타날 경우 z-index 값
					elButton : {Element}	// input 외 버튼으로도 캘린더를 open 할 수 있도록 추가 
				}
			);
	**/
	addDatePickerSet : function(elInput, htOption) {
		if (typeof elInput == "undefined") {
			return this;
		}
		var sDatePikerSetId = "DATEPICKER_" + (new Date()).getTime() +"_" + Math.floor((Math.random() * 100)),
			welInput = jindo.$Element(elInput),
			htCalendarOption = this._oCalendar.option(),
			htDefaultOption = {
				nYear : htCalendarOption.htToday.nYear,
				nMonth : htCalendarOption.htToday.nMonth,
				nDate : htCalendarOption.htToday.nDate,
				htSelectableDateFrom : { //선택가능한 첫 날짜
					nYear : 1900,
					nMonth : 1,
					nDate : 1
				},
				htSelectableDateTo : { //선택가능한 마지막 날짜
					nYear : 2100,
					nMonth : 12,
					nDate : 31
				},
				sPosition: "bottomLeft",
				zIndex: 50,
				sDatePikerSetId : sDatePikerSetId,
				elButton : ""
			};

		if (typeof htOption != "undefined") {
			//빈 값은 기본값으로 셋팅해줌.
			for (var value in htOption) {
				if (typeof htDefaultOption[value] != "undefined") {
					htDefaultOption[value] = htOption[value];
				}
			}
		}
		htOption = htDefaultOption;
		welInput.wrap("<span style='position:relative;display:inline-block;'></span>");
		welInput = jindo.$Element(elInput);
		welInput.attr("readOnly",true).attr(jindo.m.Datepicker.INDEX_ATTR, sDatePikerSetId);
		htOption.elInput = welInput.$value();
		htOption.wfFocusFunc = this._attachFocusEvent(welInput);
		if(htDefaultOption["elButton"]){
			htOption.wfClickFunc = jindo.$Fn(jindo.$Fn(this._onClick,this).bind(sDatePikerSetId), this).attach(htDefaultOption["elButton"],"click");
		}
		this._htSelectedDatePickerSet = this._htDatePickerSet[sDatePikerSetId] = htOption;
		return this;
	},

	/**
		DatePicker를 적용할 셋을 제거한다.
		@param {Element} elInput Datepicker를 제거할 input 엘리먼트
		@return {this} this
		@method removeDatePickerSet
		@example
			var elInput = jindo.$("input") //Datepicker를 제거할 input 엘리먼트
			oDatePicker.removeDatePickerSet(elInput);
	**/
	removeDatePickerSet : function(elInput) {
		var welInput = jindo.$Element(elInput),
			sDatePikerSetId = welInput.attr(jindo.m.Datepicker.INDEX_ATTR),
			htDatePickerSet = this._htDatePickerSet[sDatePikerSetId];
		this._detachFocusEvent(htDatePickerSet.wfFocusFunc, welInput);

		if (htDatePickerSet === this._htSelectedDatePickerSet) {
			this._htSelectedDatePickerSet = null;
		}
		delete this._htDatePickerSet[sDatePikerSetId];
		return this;
	},

	/**
		jindo.m.Datepicker 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		this._attachEvent();
	},
	/**
		jindo.m.Datepicker 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this.hide();
		this._detachEvent();
	},
	/**
		jindo.m.Datepicker 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		if(this.option("bAutoHide")) {
			this._htEvent["document"] = jindo.$Fn(this._onDocument, this).attach(document, "touchend");
		}
		this._htEvent["selectDate"] = jindo.$Fn(this._onSelectDate, this).bind();
		this._htEvent["deliveryEvent"] = jindo.$Fn(this._onDeliveryEvent, this).bind();
		this._oCalendar.attach({
			"selectDate" : this._htEvent["selectDate"],
			"beforeMoveDate" : this._htEvent["deliveryEvent"],
			"moveDate" : this._htEvent["deliveryEvent"],
			"beforeHideCalendar" : this._htEvent["deliveryEvent"],
			"hideCalendar" : this._htEvent["deliveryEvent"],
			"beforeShowCalendar" : this._htEvent["deliveryEvent"],
			"showCalendar" : this._htEvent["deliveryEvent"]
			// "beforeDraw" : this._htEvent["deliveryEvent"],
			// "afterDraw" : this._htEvent["deliveryEvent"]
		});
	},


	/**
		Calendar 템플릿을 생성 한다.
	**/
	_insertCalendarTemplate : function(){
		var aHtml = [],
			welCalendar = jindo.$Element("jmc_calt"),
			sPrefix = this.option("sClassPrefix");
		if(!welCalendar) {
			aHtml.push('<div>');
			aHtml.push('<a href="javascript:void(0)" class="' + sPrefix + 'btn ' + sPrefix + 'btn-prev-year">&lt;&lt;</a>');
			aHtml.push('<a href="javascript:void(0)" class="' + sPrefix + 'btn ' + sPrefix + 'btn-prev-mon">&lt;</a>');
			aHtml.push('<strong class="' + sPrefix + 'title"></strong>');
			aHtml.push('<a href="javascript:void(0)" class="' + sPrefix + 'btn ' + sPrefix + 'btn-next-mon">&gt;</a>');
			aHtml.push('<a href="javascript:void(0)" class="' + sPrefix + 'btn ' + sPrefix + 'btn-next-year">&gt;&gt;</a>');
			aHtml.push('</div><table cellspacing="0" cellpadding="0" style="');
			aHtml.push('-' + jindo.m.getCssPrefix() + '-tap-highlight-color:transparent;"><thead><tr>');
			aHtml.push('<th class="' + sPrefix + 'sun">일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th class="' + sPrefix + 'sat">토</th>');
			aHtml.push('</tr></thead><tbody>');
			aHtml.push('<tr class="' + sPrefix + 'week">');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('<td><a href="javascript:void(0)" class="' + sPrefix + 'date"></a></td>');
			aHtml.push('</tr></tbody></table>');
			aHtml.push('<div class="' + sPrefix + 'bottom"><a href="javascript:void(0)" class="' + sPrefix + 'btn ' + sPrefix + 'btn-close">닫기</a></div>');
			welCalendar = jindo.$Element('<div id="jmc_calt" class="' + sPrefix + 'base" style="position:absolute;display:none"></div>');
			welCalendar.html(aHtml.join(""));
			welCalendar.appendTo(document.body);
		}
		return welCalendar;
	},

	/**
		jindo.m.Calendar 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function(){
		var htDatepickerset = null;
		if(this.option("bAutoHide")) {
			this._htEvent["document"].detach(document, "touchend");
		}

		for(var p in this._htDatePickerSet) {
			htDatepickerset = this._htDatePickerSet[p];
			this._detachFocusEvent(htDatepickerset.wfFocusFunc, htDatepickerset.elInput);
			this._detachClickEvent(htDatepickerset.wfClickFunc, htDatepickerset.elButton);
		}
		this._oCalendar.detachAll();
		this._htSelectedDatePickerSet = null;
		this._htEvent = null;
	},
	/**
		input 에 포커스 이벤트 처리. Calendar를 생성하여 디스플레이 해준다.
	**/
	_onFocus : function(we){
		if(!this.isActivating()){
			return false;
		}
		this.show(we.element);
	},

	/**
	 * input 외의 button 을 추가하여 버튼 클릭시 캘린더가 나타날 수 있도록 처리 
	 */
	_onClick : function(sSetId){
		if(!this.isActivating()){
			return false;
		}
		this.show(this._htDatePickerSet[sSetId].elInput);
	},
	/**
		Document Touch 이벤트 처리
		@update
        @history 1.9.0 Bug 복수 생성시 input 영역을 정상적으로 처리 하지 못하는 이슈 해결.
	**/
	_onDocument : function(we){
		var el = we.element,
			wel = jindo.$Element(el),
			welCalendarBase = this._oCalendar.getCalendarBase(),
		    sDatePikerSetId = wel.attr(jindo.m.Datepicker.INDEX_ATTR),
		    elInput = null;
		   
        this._htSelectedDatePickerSet = sDatePikerSetId ? this._htDatePickerSet[sDatePikerSetId] : this._htSelectedDatePickerSet;
		elInput = this._htSelectedDatePickerSet.elInput;
			
		if(welCalendarBase.$value() != el && !welCalendarBase.isParentOf(wel) && elInput != el) {
			this.hide();
			if(elInput) {
				elInput.blur();
			}
		}
		return true;
	},
	/**
		Calendar 날짜 선택 이벤트 핸들러.
		@update
		@history 1.9.0 Update 날짜 선택시 선택할 수 없는 날짜({Prefix} + "unselectable") 이 있으면 선택 할 수 없도록 수정
	**/
	_onSelectDate : function(we){
		if(!this._oCalendar.isVisible()) {
			return;
		}
		if(we.wel.hasClass(this.option("sClassPrefix") + "unselectable")){
		    we.stop();
		    return false;
		}
		if (this._isSelectable(this._htSelectedDatePickerSet, we.oSelectDate)) {
			var el = this._htSelectedDatePickerSet.elInput;
			
			/**
                날짜가 선택되기 전 발생 

                @event selectDate
                @param {String} sType 커스텀이벤트명
                @param {Object} oSelectDate 선택된 날짜 
                @param {Object} oCalendar 캘린더 instance
                @param {Function} stop 선택된 날짜를 처리하지 않는다. 
            **/
			if(!this.fireEvent("selectDate", {
				oSelectDate : we.oSelectDate,
				oCalendar : this._oCalendar
			})){
				we.stop();
			    return false;
			}
			this.setDate(el, we.oSelectDate);
			el.blur();
			return true;
		} else {
			we.stop(jindo.$Event.CANCEL_ALL);
			return false;
		}
	},

	_onDeliveryEvent : function(we) {
	    if(!this.fireEvent(we.sType, we)){
            we.stop();
	        return false;
	    }
	    // console.log(this.fireEvent(we.sType, we), we.sType);
		we.oCalendar = this._oCalendar;
		return true;
	},

	/**
		Datepicker Calendar 선택 날짜를 설정 한다.
		@param {Element} elInput 변경 Datepicker Input 엘리먼트
		@param {Object} htDate 설정, 날짜 {nYear : 2011, nMonth : 9, nDate : 30} 형식
		@method setDate
		@example
			var elInput = jindo.$("input");
			var htDate = {nYear : 2011, nMonth : 9, nDate : 30};
			oDatepicker.setDate(elInput, htDate);
	**/
	setDate : function(elInput, htDate){
		if(!this.isActivating()) {
			return false;
		}
		var sDatepickerId = (elInput) ? elInput.getAttribute(jindo.m.Datepicker.INDEX_ATTR) : null,
			htDatePickerSet = this._htDatePickerSet[sDatepickerId];

		if(!sDatepickerId || !this._isSelectable(htDatePickerSet, htDate)){
			return false;
		}
		elInput.value = this._formatDate(htDate);
		htDatePickerSet.nYear = htDate.nYear;
		htDatePickerSet.nMonth = htDate.nMonth;
		htDatePickerSet.nDate = htDate.nDate;
		this._htDatePickerSet[sDatepickerId] = htDatePickerSet;
	},

	/**
		날짜 표시 형식 변환 후 반환.
	**/
	_formatDate : function(htDate){
		var oDate = new Date(htDate.nYear, htDate.nMonth-1, htDate.nDate),
			sDay = this._oCalendar.getDayName(oDate.getDay());
		return this.option("sFormat").replace(/(yyyy|yy|mm|dd|day)/gi,
			function($1){
				switch ($1){
					case 'yyyy': return oDate.getFullYear();
					case 'yy': return oDate.getFullYear().toString().substr(2);
					case 'mm':
						var sMonth = (oDate.getMonth()+1) + "";
						sMonth = sMonth.length === 1 ? '0' + sMonth : sMonth;
						return sMonth;
					case 'dd':
						var sDate = oDate.getDate() + "";
						sDate = sDate.length === 1 ? '0' + sDate : sDate;
						return sDate;
					case 'day' : return sDay;
				}
			}
		);
	},

	/**
		Datepicker에서 선택 한 날짜를 삭제한다.
		@param {Element} elInput 변경 Datepicker Input 엘리먼트
		@method deleteDate
		@example
			var elInput = jindo.$("input");
			oDatepicker.deleteDate(elInput);
	**/
	deleteDate : function(elInput){
		if(!elInput){ return; }
		var welInput = jindo.$Element(elInput),
			htDatePickerSet = this._htDatePickerSet[welInput.attr(jindo.m.Datepicker.INDEX_ATTR)],
			oDate = new Date();
		elInput.value = "";
		htDatePickerSet.nYear = oDate.getFullYear();
		htDatePickerSet.nMonth = oDate.getMonth() + 1;
		htDatePickerSet.nDate = oDate.getDate();

		if(this._isCurrentDatePicker(welInput.$value())) {
			this.hide();
		}
		
      /**
            선택된 날짜 초기화 이후 발생  

            @event clear
            @param {String} sType 커스텀이벤트명
            @param {Object} oCalendar 캘린더 instance
        **/
		this.fireEvent("clear",{
			oCalendar : this._oCalendar
		});
	},

	/**
		현재 데이터 피커가 자신에 할당되어 있는지 여부 반
	**/
	_isCurrentDatePicker : function(elInput){
		var sDatepickerId = (elInput) ? elInput.getAttribute(jindo.m.Datepicker.INDEX_ATTR) : null,
			sSelectDatepickerId = this._htSelectedDatePickerSet.sDatePikerSetId;
		return (sDatepickerId == sSelectDatepickerId);
	},

	/**
		Datepicker 객체를 활성화 한다.
		@param {Element} elInput 변경 Datepicker Input 엘리먼트. 없을 경우 등록된 모든 Input에 대해 활성화.
		@method enable
		@example
			var elInput = jindo.$("input");
			oDatepicker.enable(elInput);
			oDatepicker.enable(); //등록된 모든 Input 에 대해 활성화
	**/
	enable : function(elInput){
		if(elInput){
			var welInput = jindo.$Element(elInput);
			welInput.$value().disabled = false;
		} else {
			var htDatePickerSet = this._htDatePickerSet;
			for ( var sKey in htDatePickerSet) {
				htDatePickerSet[sKey].elInput.disabled = false;
			}
		}
		
      /**
            DatePicker 컴포넌트 활성화 이후 발생 

            @event enable
            @param {String} sType 커스텀이벤트명
            @param {Object} oCalendar 캘린더 instance
        **/
		this.fireEvent("enable",{
			oCalendar : this._oCalendar
		});
	},

	_attachFocusEvent : function(welInput) {
		return jindo.$Fn(this._onFocus,this).attach(welInput,"focus");
	},

	_detachFocusEvent : function(wfFocusFunc, welInput) {
		wfFocusFunc.detach(welInput,"focus");
	},
	
	_detachClickEvent : function(wfClickFunc, elButton){
		wfClickFunc.detach(elButton, "click");
		
	},
	/**
		Datepicker 객체를 비활성화 한다.
		@param {Element} elInput 변경 Datepicker Input 엘리먼트. 없을 경우 등록된 모든 Input에 대해 비활성화.
		@method disable
		@example
			var elInput = jindo.$("input");
			oDatepicker.disable(elInput);
			oDatepicker.disable(); //등록된 모든 Input 에 대해 비활성화
	**/
	disable : function(elInput){
		var htDatePickerSet = this._htDatePickerSet;
		if(elInput){
			var welInput = jindo.$Element(elInput);
			welInput.$value().disabled = true;
		} else {
			for ( var sKey in htDatePickerSet) {
				htDatePickerSet[sKey].elInput.disabled = true;
			}
		}
		this.hide();
		
      /**
            DatePicker 컴포넌트가 비활성화 이후 발생  

            @event disable
            @param {String} sType 커스텀이벤트명
            @param {Object} oCalendar 캘린더 instance
        **/
		this.fireEvent("disable",{
			oCalendar : this._oCalendar
		});
	},

	/**
		Calelndar를 위치할 Position 설정.
		@param {Element} elInput 변경 Datepicker Input 엘리먼트. 없을 경우 등록된 모든 Input에 대해 비활성화.
		@param {String} sPosition 위치명 
				@param {String} sPosition.leftTop 왼쪽 위
				@param {String} sPosition.leftBottom 왼쪽 아래
				@param {String} sPosition.rightTop 오른쪽 위
				@param {String} sPosition.rightBottom 오른쪽 아래
				@param {String} sPosition.bottomLeft 아래쪽 왼쪽
				@param {String} sPosition.bottomRight 아래쪽 오른쪽
				@param {String} sPosition.topLeft 위쪽 왼쪽
				@param {String} sPosition.topRight 위쪽 오른쪽
		@method setPosition
	**/
	setPosition : function(elInput, sPosition) {
		var welInput = jindo.$Element(elInput),
			htDatePickerSet = this._htDatePickerSet[welInput.attr(jindo.m.Datepicker.INDEX_ATTR)],
			welCalendarBase = this._oCalendar.getCalendarBase(),
			htCss = {},
			elCalendarBase = welCalendarBase.$value(),
			bVisible = welCalendarBase.visible();
		if(!bVisible) {
			welCalendarBase.css("left","-999px");
			welCalendarBase.show();
		}
		var nCalendarHeight = welCalendarBase.height(),
			nCalendarWidth = welCalendarBase.width(),
			nInputHeight = welInput.height(),
			nInputWidth = welInput.width();
		sPosition = sPosition || htDatePickerSet.sPosition;
		elCalendarBase.style.left = null;
		elCalendarBase.style.right = null;
		elCalendarBase.style.top = null;
		if(!bVisible) {
			welCalendarBase.hide();
		}
		switch (sPosition) {
			case "leftTop":
				htCss.top = "0px";
				htCss.left = "-" + nCalendarWidth + "px";
				break;
			case "leftBottom":
				htCss.top = "-" + (nCalendarHeight - nInputHeight) + "px";
				htCss.left = "-" + nCalendarWidth + "px";
				break;
			case "rightTop":
				htCss.top = "0px";
				htCss.left = nInputWidth + "px";
				break;
			case "rightBottom":
				htCss.top = "-" + (nCalendarHeight - nInputHeight) + "px";
				htCss.left = nInputWidth + "px";
				break;
			case "bottomLeft":
				htCss.top = nInputHeight + "px";
				htCss.left = "0px";
				break;
			case "bottomRight":
				htCss.top = nInputHeight + "px";
				htCss.right = "0px";
				break;
			case "topLeft":
				htCss.top = "-" + nCalendarHeight + "px";
				htCss.left = "0px";
				break;
			case "topRight":
				htCss.top = "-" + nCalendarHeight + "px";
				htCss.right = "0px";
				break;
		}
		htDatePickerSet.sPosition = sPosition;
		welCalendarBase.css(htCss);
	},

	/**
		Datepicker 달력을 보여준다.
		@param {Element} elInput Calendar를 보여줄 Datepicker Input 엘리먼트.
		@method show
		@example
			var elInput = jindo.$("input");
			oDatepicker.show(elInput);
	**/
	show : function(elInput){
		var welInput = jindo.$Element(elInput),
			welCalendarBase = this._oCalendar.getCalendarBase(),
			htDatePickerSet = this._htDatePickerSet[welInput.attr(jindo.m.Datepicker.INDEX_ATTR)],
			oDrawDate  = {"nYear" : htDatePickerSet.nYear, "nMonth" : htDatePickerSet.nMonth, "nDate" : htDatePickerSet.nDate};
		this._htSelectedDatePickerSet = htDatePickerSet;
		welInput.parent().append(welCalendarBase);
		if(htDatePickerSet.zIndex != "none"){
			welCalendarBase.css("zIndex", htDatePickerSet.zIndex);
		}
		this.setPosition(elInput, htDatePickerSet.sPosition);
		if(htDatePickerSet.htSelectableDateFrom && htDatePickerSet.htSelectableDateTo){
			this._oCalendar.setSelectableDate(htDatePickerSet.htSelectableDateFrom, htDatePickerSet.htSelectableDateTo);
		}
		// this._oCalendar.setSelectableDate();
		this._oCalendar.show(oDrawDate, elInput.value ? oDrawDate : 0);
	},

	/**
		Datepicker 달력을 닫는다.
		@method hide
		@example
			oDatepicker.hide();
	**/
	hide : function(){
		if(this._oCalendar.isVisible()) {
			this._oCalendar.hide();
		}
	},

	/**
		jindo.m.Datepicker 에서 사용하는 모든 객체를 release 시킨다.

		@method destroy
		@example
			oDatepicker.destroy();
	**/
	destroy : function() {
		this.deactivate();
		this._oCalendar = null;
		this._htDatePickerSet = null;
	}
}).extend(jindo.m.UIComponent);/**
    @fileOverview 특정 Layer에 애니메이션 효과를 적용하여 보여주거나, 숨기거나, 이동시키는 컴포넌트
    @author "oyang2"
    @version 1.17.0
    @since 2011. 12. 13.
**/
/**
    특정 Layer에 애니메이션 효과를 적용하여 보여주거나, 숨기거나, 이동시키는 컴포넌트

    @class jindo.m.LayerEffect
    @extends jindo.m.UIComponent
    @uses jindo.m.Morph
    @keyword layer, effect, animation, 레이어, 효과, 애니메이션
    @group Component
    
    @history 1.15.0 Bug LayerEffect 초기화시 element 참조 오류
    @history 1.10.0 Update LayerEffect 인터페이스 통일
    @history 1.10.0 Update Morph 연동 및 구조 개선
    @history 1.5.0 Update Window Phone8 지원
    @history 1.4.0 Update  iOS 6 지원
    @history 1.2.0 Update Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.1.0 Update Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
    @history 1.1.0 Bug slide시 옵션으로 거리값을 지정해도 설정되지 않던 문제 해결
    @history 0.9.0 Release 최초 릴리즈
**/

jindo.m.LayerEffect = jindo.$Class({
    /* @lends jindo.m.LayerEffect.prototype */
    /**
        초기화 함수

        @constructor
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Number} [htOption.nDuration=250] 애니메이션 적용시간 (ms)
            @param {String} [htOption.fEffect=jindo.m.Effect.linear] 애니메이션에 사용되는 jindo.m.Effect 의 함수들
            @param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate() 수행여부
    **/
    $init : function(el, htUserOption) {
        
        this.option({
            nDuration : 250,
            fEffect : jindo.m.Effect.linear,
            bActivateOnload : true
        });
        
        this._initVar();
	if(arguments[0] && (typeof arguments[0] == "string" || arguments[0].nodeType == 1)){
            this.setLayer(el);
            this.option(htUserOption || {});
        }else{
            this.option(arguments[0] || {});
        }

        this._initTransition();

        if(this.option("bActivateOnload")) {
            this.activate();
        }
    },

    _htEffect :{
        'expand' : "jindo.m.ExpandEffect",
        'contract' : "jindo.m.ContractEffect",
        "fade" : "jindo.m.FadeEffect",
        "pop" : "jindo.m.PopEffect",
        "slide" : "jindo.m.SlideEffect",
        "flip" : "jindo.m.FlipEffect"
    },

    /**
        jindo.m.LayerEffect 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar: function() {
        this._htEffectInstance  = {};
        this._htLayerInfo = {};
        this._htWElement = {}; //jindo.m.LayerEffect에서 사용하는 엘리먼트 참조
        this._htCurrentTask = {}; 
        
        this.bAndroid = jindo.m.getDeviceInfo().android;
        this.sClassHighligting = '_effct_hide_highlighting_tmp';
    },

    /**
        Transition 컴포넌트 생성
    **/
    _initTransition : function(){
        // console.log(this.option("fEffect"));
        this._oMorph = new jindo.m.Morph({
            "fEffect" : this.option("fEffect") || (this.option("sEffect") ? this._getEffect(this.option("sEffect")) : null),
            "bUseTransition" : jindo.m.useTimingFunction()
        });
    },
    
     
    _getEffect : function(sValue){
        var oEffect = jindo.m.Effect.cubicEaseInOut;
        // console.log(sValue);
        switch(sValue){
            case "linear" :
                oEffect = jindo.m.Effect.linear; break;
            case "ease" :
                oEffect = jindo.m.Effect.cubicEase; break;
            case "ease-in" :
                oEffect = jindo.m.Effect.cubicEaseIn; break;
            case "ease-out" :
                oEffect = jindo.m.Effect.cubicEaseOut; break;
            case "ease-in-out" :
                oEffect = jindo.m.Effect.cubicEaseInOut; break;
        }
        return oEffect;
    },

    /**
        sType에 해당하는 Effect의 인스턴스 생성한다.
        @param {String} sType
    **/
    _createEffect : function(sType){
        if(this._htEffect[sType] && !this._htEffectInstance[sType]) {

            //console.log("객체 생성 : new " +this._htEffect[sType] + "()" );
            try{
                this._htEffectInstance[sType] = eval("new " + this._htEffect[sType] + "()");
            }catch(e){
                //console.log(e);
            }

            this._htEffectInstance[sType].setLayerInfo(this._htLayerInfo);
        }
    },

    /**
        높이나 넓이값을 조정하여 레이어를 확대한다.
        @remark 현재 레이어가 안보이는 상태일 경우 레이어를 보이게 하고 애니메이션을 수행한다.

        @method expand
        @param {Object} htOption
        @example
            oLayerEffect.expand(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'up', 'down', 'left', 'right' 설정 가능하며 기본값은 'down' 이다.
                {
                    nDuration : 500, //효과 애니메이션 적용시간 (ms)
                    nDistance : 100  //expand 될 수치 
            });
    **/
    // expand : function(htOption){
        // var sType = 'expand';
        // this._run(sType, htOption);
    // },

    /**
        높이나 넓이값을 조정하여 레이어를 축소한다
        @remrark 현재 레이어가 안보이는 상태일 경우 레이어를 보이게 하고 애니메이션을 수행한다.

        @method contract
        @param {Object} htOption
        @example
            oLayerEffect.contract(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'up', 'down', 'left', 'right' 설정 가능하며 기본값은 'down' 이다.
                {
                    nDuration : 500 //효과 애니메이션 적용시간 (ms)
            });
    **/
    // contract : function(htOption){
        // var sType = 'contract';
        // this._run(sType, htOption);
    // },

    /**
        레이어의 투명도를 조정하여 숨기거나 보여준다.
        @remark fadeOut 이후에는 레이어를 감춘다.

        @method fade
        @param {Object} htOption
            @param {
        @example
            oLayerEffect.fade(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'in' 또는 'out' 을 정할 수 있으며 기본값은 'in' 이다.
                {
                    nDuration : 500, //효과 애니메이션 적용시간 (ms)
                    nDistance : 1  //fade 될 opacity 수치 
            });
    **/
    // fade : function(htOption){
        // var sType = "fade";
        // //console.log('\\\\\\ Fade', htOption );
        // if(arguments[0].nodeType == 1){
            // this.setLayer(arguments[0]);
            // arguments[2].sDirection = arguments[1];
            // this._run(sType, arguments[2]);
        // }else{
            // this._run(sType, htOption);
        // }
//         
    // },

    /**
        scale 조정을 통해 pop 효과를 낸다.
        @remark
            popOut 이후에는 레이어를 감춘다.<br />
            - ios3의 경우 scale 값이 0이 아닌 0.1로 세팅합니다. <br />

        @method pop
        @param {Object} scale 조정을 통해 pop 효과를 낸다. popOut 이후에는 레이어를 감춘다.<br />
            - ios3의 경우 scale 값이 0이 아닌 0.1로 세팅합니다.<br />

        @example
            oLayerEffect.pop(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'in', 'out' 설정 가능하며 기본값은 'in' 이다.
                {
                    nDuration : 500 //효과 애니메이션 적용시간 (ms)
            });
    **/
    // pop : function(htOption){
        // var sType = "pop";
//         
        // if(arguments[0].nodeType == 1){
            // this.setLayer(arguments[0]);
            // arguments[2].sDirection = arguments[1];
            // this._run(sType, arguments[2]);
        // }else{
            // this._run(sType, htOption);
        // }
//         
    // },

    /**
        레이어를 설정된 방향으로 움직인다

        @method slide
        @param {Object} htOption
        @example
            oLayerEffect.slide(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'up', 'down', 'left', 'right' 설정 가능하며 기본값은 'left' 이다.
                {
                    nDuration : 500, //효과 애니메이션 적용시간 (ms)
                    nDistance : 100  //slide 될 수치 
            });
    **/
    // slide : function(htOption){
        // var sType = "slide";
        // if(arguments[0].nodeType == 1){
            // this.setLayer(arguments[0]);
            // arguments[2].sDirection = arguments[1];
            // this._run(sType, arguments[2]);
        // }else{
            // this._run(sType, htOption);
        // }
    // },

    /**
        레이어을 방향에 따라 뒤집는 효과를 낸다. (iOS 전용)

        @method flip
        @param{Object} htOption 레이어을 방향에 따라 뒤집는 효과를 낸다. (iOS 전용)
        @example
            oLayerEffect.flip(
                el,                         // 이펙트가 적용될 엘리먼트
                direction,              // 'up', 'down', 'left', 'right' 설정 가능하며 기본값은 'left' 이다.
                {
                    nDuration : 500, //효과 애니메이션 적용시간 (ms)
                    elBack : $("back")  // flip 이펙트 이후 뒷판 element 를 표현하고자 할때 추가한다.
            });
    **/
    // flip: function(htOption){
        // var sType = "flip";
        // this._run(sType, htOption);
    // },

    _createFunc : function(){
        var aFunc = ["slide", "pop", "flip", "fade", "expand", "contract"];
        for (var i = 0 , nFor = aFunc.length ; i < nFor ; i++ ){
            this[aFunc[i]] = (function(sFunc){
                return function(htOption){
                    var sType = sFunc;
		    if(typeof arguments[0] == "string" || arguments[0].nodeType == 1){
                        this.setLayer(arguments[0]);
                        var htSecondArg = arguments[2] || {}; 
                        htSecondArg.sDirection = arguments[1];
                        this._run(sType, htSecondArg);
                    }else{
                        this._run(sType, htOption);
                    }
                };
            })(aFunc[i]);
        }
    },

    /**
        현재 effect가 실행 여부를 리턴한다

        @method isPlaying
        @return {Boolean} 애니메이션 실행 여부
    **/
    isPlaying : function(){
        return this._oMorph.isPlaying();
    },

    /**
        커스텀 이벤트 발생
     */
    _fireCustomEvent : function(sType, htOption){
        return this.fireEvent(sType, htOption);
    },


    /**
        sType의 이펙트를 실행
        @param {String} sType
        @param {HashTabl}
     */
    _run : function(sType, htOption){
        if(!this._isAvailableEffect()){
            return;
        }

        this._createEffect(sType);

        if(typeof htOption === 'undefined'){
            htOption = {};
        }

        var oEffect = this._htEffectInstance[sType];

        var el = this.getLayer();
        var nDuration = (typeof htOption.nDuration  === 'undefined')? this.option('nDuration') : parseInt(htOption.nDuration,10);
        var htBefore = oEffect.getBeforeCommand(el, htOption);
        var htCommand = oEffect.getCommand(el, htOption);
        
        // Custom Event 발생시 적용하기 위함.
        this._htCurrentTask = htOption;
        this._htCurrentTask.elLayer = el;
        this._htCurrentTask.sTaskName = htCommand.sTaskName;
        this._htCurrentTask.nDuration = nDuration;
        
        //customEvent
        /**
            애니메이션 효과가 시작하기 직전 발생한다

            @event beforeEffect
            @param {String} sType 커스텀 이벤트명
            @param {HTMLElement} elLayer 애니메이션 효과가 적용된 레이어 엘리먼트
            @param {String} sEffect 적용할 애니메이션 효과 이름 , '-'을 구분한다. (fade-in, slide-left)
            @param {Number} nDuration 애니메이션 적용 시간(ms)
            @param {Function} stop 수행시 애니메이션 효과 시작되지 않는다.
        **/
        if(!this._fireCustomEvent("beforeEffect", {
            elLayer : el,
            sEffect :htCommand.sTaskName,
            nDuration :nDuration
        })){
            return;
        }

        //console.log('LAYER=------- , rund');

        if(htBefore){
            this._oMorph.pushAnimate(-1, [this.getLayer(), htBefore.htStyle]);
        }
        
        var self = this;
        if(htOption.sEffect){
            this._oMorph.pushCall(function(){
               this.option({
                   "fEffect" : self._getEffect(htOption.sEffect)
               });   
            });
        }

        nDuration = nDuration == 0 ? -1 : nDuration;
        
        this._oMorph.pushAnimate(nDuration, [this.getLayer(), htCommand.htStyle]);
        if(htCommand.fCallback){
            if(typeof htCommand.fCallback == 'function'){
                    this._oMorph.pushCall(function(){
                        htCommand.fCallback();   
                    });
            }else if(typeof htCommand.fCallback == 'object'){
                this._oMorph.pushAnimate(-1, [this.getLayer(), htCommand.fCallback.htStyle || {}]);
            }
        }

        this._oMorph.play();
    },

    /**
        el을 을 effect 대상 레이어로 설정한다.

        @method setLayer
        @param {HTMLElement} el 대상 레이어
    **/
    setLayer : function(el){
        this._htWElement["el"] = jindo.$(el);
        this._htWElement["wel"] = jindo.$Element(this._htWElement["el"]);
        var elFocus;
        //android 하이라이팅 문제로 인하여 엘리먼트 추가;
        if(!!this.bAndroid){
            elFocus = jindo.$$.getSingle('.'+this.sClassHighligting, this._htWElement['el']);

            if(!elFocus){
                var sTpl = '<a href="javascript:void(0)" style="position:absolute" class="'+this.sClassHighligting+'"></a>';
                elFocus = jindo.$(sTpl);
                this._htWElement['wel'].append(elFocus);
                elFocus.style.opacity = '0';
                elFocus.style.width= 0;
                elFocus.style.height= 0;
                elFocus.style.left = "-1000px";
                elFocus.style.top = "-1000px";
            }
        }

        this.setSize();
    },

    /**
        현재 이펙트를 멈춘다.
        @remark bAfter 가 true일 경우 이펙트 이후 상태로 멈추고, false 일경우 이펙트 이전 상태로 되돌린다.

        @method stop
        @param {Boolean} bAfter 이펙트 이후 상태로 멈출지 이전으로 되돌릴지 여부
    **/
    stop : function(bAfter){
        if(typeof bAfter === 'undefined'){
            bAfter = true;
        }
        if(this._oMorph){
            this._oMorph.pause(bAfter);
        }
    },

    /**
        현재 큐에 쌓여있는 모든 effect 실행을 삭제한다.
        @remark
            현재 이펙트가 실행중이면 중지하고 삭제한다.<br />
            bAfter 가 true일 경우 이펙트 이후 상태로 멈추고, false 일경우 이펙트 이전 상태로 되돌린다.

        @method clearEffect
        @param {Boolean} bAfter 이펙트 이후 상태로 멈출지 이전으로 되돌릴지 여부
        @history 1.1.0 Update Method 추가
    **/
    clearEffect : function(bAfter){
        if(this._oMorph){
            this.stop(bAfter);
            this._oMorph.clear();
        }
    },
    /**
        현재 레이어를 리턴한다.

        @method getLayer
        @return {HTMLElement} 현재 레이어
    **/
    getLayer : function(){
        return this._htWElement["el"];
    },

    /**
        레이어를 사이즈 및 CSS 정보를 설정한다.

        @method setSize
    **/
    setSize : function(){
        var elToMeasure = this._htWElement['el'].cloneNode(true);
        var welToMeasure = jindo.$Element(elToMeasure);
        welToMeasure.opacity(0);
        this._htWElement['wel'].after(welToMeasure);
        welToMeasure.show();

        this._htLayerInfo["nWidth"] = this._htWElement["wel"].width();
        this._htLayerInfo["nHeight"] = this._htWElement["wel"].height();

        welToMeasure.css({
            position : "absolute",
            top : "0px",
            left : "0px"
        });
        this._htLayerInfo['nMarginLeft'] = parseInt(welToMeasure.css('marginLeft'),10);
        this._htLayerInfo['nMarginTop'] = parseInt(welToMeasure.css('marginTop'),10);
        this._htLayerInfo['nMarginLeft']  = isNaN(this._htLayerInfo['nMarginLeft'] )? 0 : this._htLayerInfo['nMarginLeft'];
        this._htLayerInfo['nMarginTop'] = isNaN(this._htLayerInfo['nMarginTop'])? 0 : this._htLayerInfo['nMarginTop'];
        this._htLayerInfo['nOpacity'] = this._htWElement["wel"].opacity();
        this._htLayerInfo['sPosition'] = this._htWElement["wel"].css('position');
        var sDisplay = this._htWElement['wel'].css('display');

        sDisplay = ((sDisplay === 'none') || (sDisplay.length === 0))? 'block' : sDisplay;
        this._htLayerInfo['sDisplay'] = sDisplay;
        this._htLayerInfo['sClassHighligting'] = this.sClassHighligting;

        welToMeasure.leave();

        this._setEffectLayerInfo();

        //console.log('/////setSize', this._htLayerInfo);
    },

    /**
        레이어정보를 다시 설정한다.
     */
    _setEffectLayerInfo : function(){
        for(var p in this._htEffectInstance){
            this._htEffectInstance[p].setLayerInfo(this._htLayerInfo);
        }
    },
    /**
        transition end 이벤트 핸들러
     */
    _onTransitionEnd : function(oCustomEvent){
        if(this._htCurrentTask){
            /**
                애니메이션 효과가 종료된 직후 발생한다.

                @event afterEffect
                @param {String} sType 커스텀 이벤트명
                @param {HTMLElement} elLayer 애니메이션 효과가 적용된 레이어 엘리먼트
                @param {String} sEffect 적용할 애니메이션 효과 이름 , '-'을 구분한다. (fade-in, slide-left)
                @param {Number} nDuration 애니메이션 적용 시간(ms)
                @param {Function} stop stop를 호출하여 영향 받는 것은 없다.
            **/
            this._fireCustomEvent("afterEffect", {
                elLayer : this._htCurrentTask.elLayer,
                sEffect : this._htCurrentTask.sTaskName,
                nDuration : this._htCurrentTask.nDuration
            });
        }
    },

    /**
        transition stop 이벤트 핸들러
     */
    _onTransitionStop : function(oCustomEvent){
        if(oCustomEvent.sTaskName){
            /**
                애니메이션 효과가 stop 될때 발생한다.

                @event stop
                @param {String} sType 커스텀 이벤트명
                @param {HTMLElement} elLayer 애니메이션 효과가 적용된 레이어 엘리먼트
                @param {String} sEffect 적용할 애니메이션 효과 이름 , '-'을 구분한다. (fade-in, slide-left)
                @param {Number} nDuration 애니메이션 적용 시간(ms)
                @param {Function} stop 호출하여 영향 받는 것은 없다.
            **/
            this._fireCustomEvent("stop", {
                elLayer : this._htCurrentTask.elLayer,
                sEffect : this._htCurrentTask.sTaskName,
                nDuration : this._htCurrentTask.nDuration
            });
        }
    },

    /**
        현재 effect를 실행 시킬수 있는 상태인지 리턴한다
        @return {Boolean}
    **/
    _isAvailableEffect : function(){
        return this.isActivating();
    },

    /**
        jindo.m.LayerEffect 컴포넌트를 활성화한다.
        activate 실행시 호출됨
    **/
    _onActivate : function() {
        this._attachEvent();
        this._createFunc();
    },

    /**
        jindo.m.LayerEffect 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    **/
    _onDeactivate : function() {
        this._detachEvent();
    },


    /**
        jindo.m.LayerEffect 에서 사용하는 모든 이벤트를 바인드한다.
    **/
    _attachEvent : function() {
        this._htEvent = {};
        this._htEvent["end"] = jindo.$Fn(this._onTransitionEnd, this).bind();
        this._htEvent["stop"] = jindo.$Fn(this._onTransitionStop, this).bind();

        if(this._oMorph){
            this._oMorph.attach({
                "end" : this._htEvent["end"],
                "stop" : this._htEvent["stop"]
            });
        }
    },

    /**
        jindo.m.LayerEffect 에서 사용하는 모든 이벤트를 해제한다.
    **/
    _detachEvent : function() {
        this._htEvent = null;

        // if(this._oMorph){
            // this._oMorph.detachAll();
        // }
    },

    /**
        jindo.m.LayerEffect 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
    destroy: function() {
        this.deactivate();

        for(var p in this._htWElement) {
            this._htWElement[p] = null;
        }
        this._htWElement = null;

    }
}).extend(jindo.m.UIComponent);


/**
    @fileOverview effect플러그인 상위 클래스 
    @author "oyang2"
    @version 1.17.0
    @since 2011. 12. 13.
**/
/**
    effect플러그인 상위 클래스 

    @class jindo.m._Effect_
    @uses jindo.m.LayerEffect
    @invisible
    @keyword effect
    @group Component
**/

jindo.m._Effect_ = jindo.$Class({
	/* @lends jindo.m._Effect_.prototype */
    /**
        초기화 함수

        @constructor
       
    **/
	$init : function(){
		this._sCssPrefix = jindo.m.getCssPrefix();
		var htDInfo = jindo.m.getDeviceInfo();		
		this.bIos = (htDInfo.iphone || htDInfo.ipad);
		this.bIos3 = htDInfo.iphone && (htDInfo.version.length > 0) && (htDInfo.version.substring(0,1)== '3');
		this.bAndroid = htDInfo.android;
		this.bAndroid3Up  = htDInfo.android && (htDInfo.version.length > 0) && (htDInfo.version.substring(0,1)>= '3');	
		this.bAndroid2_1  = htDInfo.android && (htDInfo.version.length > 0) && (htDInfo.version === '2.1');	
		this.sTranOpen =  (this.bIos )?'translate3d(' : 'translate(';
		this.sTranEnd =  (this.bIos)?',0px)' : ')';
		this._initVar();
		
	},
	
	_initVar : function(){
		this._htLayerInfo = {};
	},
	
	setLayerInfo : function(htInfo){
		this._htLayerInfo = {};
		
		for(var p in htInfo){
			this._htLayerInfo[p] = htInfo[p];
		}
		
		//console.log('이펙트에서 설정해용', this._htLayerInfo);
	},
	
    getTranslateStyle : function(htStyle, htReturn){
        var htData = htReturn || {};
        for ( var i in htStyle){
            htData["@"+i] = htStyle[i];
        }
        return htData;
    },	
	
	getTransitionTask : function(){
		return null;
	},
	
	getBeforeCommand : function(){
		return null;
	}, 
	getCommand : function(){
		return null;
	}
});/**
    @fileOverview  slide effect 플러그인 
    @author "oyang2"
    @version 1.17.0
    @since 2011. 12. 15.
    
    @2012.01.16 수정사항
     - android3.0, android4.0 대응 추가 
**/
/**
   slide effect 플러그인 
    @class jindo.m.SlideEffect
    @invisible
    @extends jindo.m._Effect_
    @keyword slide, effect, slide-left, slide-right, slide-up, slide-out 
    @group Component
**/


jindo.m.SlideEffect = jindo.$Class({
	/** @lends jindo.m.SlideEffect.prototype */
	/**
        초기화 함수
        @invisible
    **/
	sEffectName : "slide",

	/**
	 * @description 레이어를 설정된 방향으로 움직인다
	 * @param {HTMLElement} el slide 대상 엘리먼트
	 * @param {HashTable} slide 옵션
	 * 		- sDirection : 'left', //'left, 'right, 'up', 'down' 설정가능하다
	 *		- nSize : 200, //slide 할 거리, 디폴트 값은 레이어 크기가 됨 (px)
	 *		- elBaseLayer : jindo.$('wrapper'), //기준 뷰가 되는 엘리먼트, 없을 경우 설정하지 않는다.
	 *		- htTo : {opacity : 1} , //레이어의 slide 이후의 css를 설정
	 *		- htFrom : {opacity : 0.7}  //레이어의 slide 이전의 css를 설정
	 */
	getCommand : function(el, htOption){
	    if(htOption.nDistance){
	        htOption.nSize = htOption.nDistance;
	    }
		var sDirection = htOption.sDirection? htOption.sDirection :'left';		
		
		var htCurOffset = jindo.m.getCssOffset(el);
		
		var toX = htCurOffset.left;
		var toY = htCurOffset.top;
		var nW,nH,wel;
		nW = (typeof htOption.nSize != 'undefined')? htOption.nSize : this._htLayerInfo['nWidth'];
		nH =  (typeof htOption.nSize != 'undefined')? htOption.nSize : this._htLayerInfo['nHeight'];
		
		if(sDirection == 'up' || sDirection == 'down'){
			toY  += ((sDirection == 'up')? nH*-1 : nH); 
		}
		
		if(sDirection == 'left' || sDirection == 'right'){
			toX += ((sDirection == 'left')? nW*-1 : nW);
		}
		
		if(typeof htOption.elBaseLayer != 'undefined'){
			toX = 0;
			toY = 0;
			var welBaseLayer = jindo.$Element(htOption.elBaseLayer);
			wel = jindo.$Element(el);
			nH = (typeof htOption.nSize != 'undefined')? htOption.nSize : welBaseLayer.height();
			nW = (typeof htOption.nSize != 'undefined')? htOption.nSize : welBaseLayer.width();

			if(sDirection == 'up' || sDirection == 'down'){
				toY = (sDirection == 'down')?  nH * -1 : nH;
			}
			
			if(sDirection == 'left' || sDirection == 'right'){
				toX = (sDirection == 'left')? nW: nW*-1;
			}
			toX = toX*-1;
			toY = toY*-1;
		}
		
		
		//fCallback 등록
		var sPosition = this._htLayerInfo["sPosition"];
		var bAndroid = this.bAndroid;
		var bAndroid3Up = this.bAndroid3Up;
		var sClassHighligting = this._htLayerInfo['sClassHighligting'];
		var bAndroid2_1 = this.bAndroid2_1;
		
		wel = jindo.$Element(el);

        var htStyle = htOption.htTo || {};
		htStyle["transform"] = this.sTranOpen + toX + 'px, ' + toY + 'px'+ this.sTranEnd;
        var htReturnStyle = {};
        this.getTranslateStyle(htStyle, htReturnStyle);
		
		return {
			sTaskName : this.sEffectName+"-"+ sDirection,
			htStyle : htReturnStyle,
			fCallback : function(){
				var htCurOffset = jindo.m.getCssOffset(el);	
				var top = wel.css('top').replace('px','')*1;
				var left = wel.css('left').replace('px','')*1;
				top = isNaN(top)? 0 : top;
				left = isNaN(left)? 0 : left;
				
				// console.log('before '+top+" , "+left);				
				if(sPosition == "relative"){
					wel.css("position", 'relative');
				}else{
					wel.css("position","absolute");
				}				
				
				var sPrefix = jindo.m.getCssPrefix();
				wel.css(sPrefix+'Transform','');
				
				//안드로이드 4.0버그 left, top을 설정하기 전에 offset을 호출해야 설정이 된다.
				if(bAndroid3Up){
					wel.offset();
				}				
				wel.$value().style.top = parseInt((top+htCurOffset.top),10)+"px";
				wel.$value().style.left = parseInt((htCurOffset.left+ left),10)+"px";	
				
								
				if(bAndroid && !bAndroid3Up){
				//if(bAndroid){
					var elFocus = jindo.$$.getSingle('.'+ sClassHighligting, wel.$value());
					if(elFocus){	
						if(bAndroid2_1){
							setTimeout(function(){
								elFocus.focus();							
							},5);		
						}else{
							elFocus.focus();
						}
					}
				}
			}
		};
	},
	
	/**
	 * @description 레이어를 설정된 방향으로 움직이기 전에 미리 설정해야 할 옵션들을 설정한다.
	 * @param {HTMLElement} el slide 대상 엘리먼트
	 * @param {HashTable} slide 옵션
	 * 		- sDirection : 'left', //'left, 'right, 'up', 'down' 설정가능하다
	 *		- nSize : 200, //slide 할 거리, 디폴트 값은 레이어 크기가 됨 (px)
	 *		- elBaseLayer : jindo.$('wrapper'), //기준 뷰가 되는 엘리먼트, 없을 경우 설정하지 않는다.
	 *		- htTo : {opacity : 1} , //레이어의 slide 이후의 css를 설정
	 *		- htFrom : {opacity : 0.7}  //레이어의 slide 이전의 css를 설정
	 */
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'left';
		
		var htBeforeStyle = htOption.htFrom || {};
		// var htTransform = {};
		
		var wel = jindo.$Element(el);
		
		if(typeof htOption.elBaseLayer != 'undefined'){
			var welBaseLayer = jindo.$Element(htOption.elBaseLayer);
			
			if(!welBaseLayer.isParentOf(wel)){
				welBaseLayer.append(wel);
				var sPosition = wel.css('position');
				if(!(sPosition == 'relative' || sPosition == 'absolute') ){
					wel.css('position', 'absolute');
				}
				wel.css('opacity',0);
			}
			
			var fromX = 0, fromY = 0;
			
			var nH = welBaseLayer.height();
			var nW = welBaseLayer.width();
			
			
			if(sDirection == 'up' || sDirection == 'down'){
				fromY = (sDirection == 'down')?  nH * -1 : nH;
			}
			
			if(sDirection == 'left' || sDirection == 'right'){
				fromX = (sDirection == 'left')? nW: nW*-1;
			}
			welBaseLayer.css('overflow','hidden');
			htBeforeStyle["left"] = fromX+"px";
			htBeforeStyle["top"] = fromY +"px";
			
			//console.log('beforedddd', welBaseLayer.offset());
			htBeforeStyle["opacity"] = this._htLayerInfo['nOpacity'];
			//htTransform["transform"] = this.sTranOpen + fromX + 'px, ' + fromY+ 'px'+ this.sTranEnd;	
			
		}
		     
       var htBeforeReturnStyle = {};
        this.getTranslateStyle(htBeforeStyle, htBeforeReturnStyle);
        
		return {
			htStyle : htBeforeReturnStyle
		};
	}

	
}).extend(jindo.m._Effect_);

/**
    @fileOverview  pop effect 플러그인 
    @author "oyang2"
    @version 1.17.0
    @since 2011. 12. 15.
    
    @2012.01.05
     - Android 3.0 대응 pop-in 코드 삽입 (0.1~1로 추가되도록 수정) 
**/
/**
   pop effect 플러그인 

    @class jindo.m.PopEffect
    @invisible
    @extends jindo.m._Effect_
    @keyword pop, effect, pop-in, pop-out
    @group Component
**/

jindo.m.PopEffect = jindo.$Class({
	/** @lends jindo.m.PopEffect.prototype */
	/**
        초기화 함수
        @invisibl@invisiblee
    **/
	
	sEffectName : "pop",

	getCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'in';
		
		var htStyle = htOption.htTo || {};
		if(typeof htStyle["opacity"] === 'undefined'){
			htStyle["opacity"] = (sDirection == 'in')? 1 : 0.1;
		}
		//htStyle["opacity"] = (sDirection == 'in')? 1 : 0.1;
		
		var nScale = (sDirection == 'in')? 1 : ((this.bIos3 || this.bAndroid3Up)? 0.1: 0);		
		var htCallback = {};
		if(sDirection == 'out'){
			htCallback.htStyle ={}; 
			htCallback.htStyle["@display"]  = "none";
			htCallback.htStyle["@opacity"]  = this._htLayerInfo['nOpacity'];
			htCallback.htStyle["@transform"] = "scale(1)";
		}
		
		var sTransform = 'scale('+nScale+')';
		if(this.bAndroid3Up){
//			sTransform += ' scaleZ(1.0)';
		}
		     
        htStyle["transformOrigin"] = "50% 50%";
        htStyle["transform"] = sTransform;
	   
        var htReturnStyle = {};
        this.getTranslateStyle(htStyle, htReturnStyle);

		return {
			sTaskName : this.sEffectName + "-" +sDirection,
			htStyle : htReturnStyle,
			fCallback : htCallback
		};
	},
	
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :'in';
				
		var htBeforeStyle = htOption.htFrom || {};
		if(typeof htBeforeStyle["opacity"] === 'undefined'){
			htBeforeStyle["opacity"] = (sDirection == 'in')? 0.1 : 1;
		}
		
		htBeforeStyle["display"] = this._htLayerInfo['sDisplay'];
		
		var nScale = (sDirection == 'in')? ((this.bIos3||this.bAndroid3Up)? 0.1: 0) : 1;
		
		var sTransform = 'scale('+nScale+')';
		if(this.bAndroid3Up){
//			sTransform += ' scaleZ(1.0)';
		}
				       
	   htBeforeStyle["transformOrigin"] = "50% 50%";
	   htBeforeStyle["transform"] = sTransform;

       var htBeforeReturnStyle = {};
        this.getTranslateStyle(htBeforeStyle, htBeforeReturnStyle);
        
		return {
			htStyle : htBeforeReturnStyle
		};
	}
}).extend(jindo.m._Effect_);/**
    @fileOverview  flip effect 플러그인 
    @author "oyang2"
    @version 1.17.0
    @since 2011. 12. 15.
**/
/**
   flip effect 플러그인 

    @class jindo.m.FlipEffect
    @invisible
    @extends jindo.m._Effect_
    @keyword flip, effect, 책장넘기기 
    @group Component
**/

jindo.m.FlipEffect = jindo.$Class({
	/** @lends jindo.m.FlipEffect.prototype */
	/**
        초기화 함수
    **/
	sEffectName : "flip",
		
	getCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :"left";
		
		var sCoord = 'Y';
		if(sDirection == 'up' || sDirection == 'down'){
			sCoord = 'X';
		}
		
		var htStyle = htOption.htTo || {};
		
		
		var welFrom = htOption.elFlipFrom? jindo.$Element(htOption.elFlipFrom) : jindo.$Element(el);
		var welTo =   htOption.elFlipTo? jindo.$Element(htOption.elFlipTo) : null;
		
		var htTo = this._getCssRotate(this._getCssTransform(welFrom));
		
		htTo[sCoord] = htTo[sCoord]+ ((sDirection == 'left' || sDirection == 'down')?180*-1 : 180);
		var sTransform = 'rotateX('+ htTo.X+'deg) rotateY('+htTo.Y+'deg)';
		
		if(welTo){
			welTo.$value().style[this._sCssPrefix +"Transform"] = 'rotate'+sCoord+'(0deg)';
			sTransform = 'rotate'+sCoord+'(0deg)';
		}
		htStyle["transformStyle"] = "preserve-3d";
		htStyle["transform"] = sTransform;
		
        var htReturnStyle = {};
        this.getTranslateStyle(htStyle, htReturnStyle);
        
        // flip 시 elBack 이라는 element 가 존재할때 앞/뒤 판이 있는것으로 간주 style 을 지정한다.
        if(htOption && htOption.elBack){
            htOption.elBack.style[this._sCssPrefix + "BackfaceVisibility"] = "hidden";
            htOption.elBack.style[this._sCssPrefix + "Transform"] = "rotate"+sCoord+"( 180deg )";
            welFrom.$value().style[this._sCssPrefix + "BackfaceVisibility"] = "hidden";
        }
		
		return {
			sTaskName : this.sEffectName + "-" + sDirection,
			htStyle : htReturnStyle
		};
	},
	
	getBeforeCommand : function(el, htOption){
		var sDirection = htOption.sDirection? htOption.sDirection :"left";
		
		var htBeforeStyle = htOption.htFrom || {};
		
		var sCoord = "Y", 
			nFrom = 0;
		
		if(sDirection == 'up' || sDirection == 'down'){
			sCoord = "X";
		}
		
		var welFrom = htOption.elFlipFrom? jindo.$Element(htOption.elFlipFrom) : jindo.$Element(el);
		var welTo =   htOption.elFlipTo? jindo.$Element(htOption.elFlipTo) : null;
		
		var elParent = welFrom.$value().parentNode;
		elParent.style.webkitPerspective = '1200';
		
		var htFrom = this._getCssRotate(this._getCssTransform(welFrom));
		var sTransform = 'rotateX('+ htFrom.X+'deg) rotateY('+htFrom.Y+'deg)';
		
		if(welTo){
			welTo.$value().style[this._sCssPrefix +"Transform"] = 'rotate'+sCoord+'(-180deg)';
			sTransform = 'rotate'+sCoord+'(-180deg)';
		}
				
	   htBeforeStyle["perspective"] = "1200";
	   htBeforeStyle["transformStyle"] =  "preserve-3d";
	   htBeforeStyle["transform"] = sTransform;
	   
       var htBeforeReturnStyle = {};
        this.getTranslateStyle(htBeforeStyle, htBeforeReturnStyle);
        
		return {
			htStyle : htBeforeReturnStyle
		};
	},
	
	
	
	_getCssRotate : function(str){
		var sRotate = str;
		
		var htReturn ={
			X : 0,
			Y : 0
		};
		
		if(!sRotate){
			return htReturn;
		}
		
		var aTemp = sRotate.match(/rotateX\((\-?\d*)deg/);	
		
		if(aTemp && aTemp.length >1){
			htReturn['X'] =aTemp[1]*1;
			if(htReturn['X']%360 == 0){
				htReturn['X'] = 0;
			}
		}
		
		aTemp = sRotate.match(/rotateY\((\-?\d*)deg/);
		if(aTemp && aTemp.length >1){
			htReturn['Y'] =aTemp[1]*1;
			if(htReturn['Y']%360 == 0){
				htReturn['Y'] = 0;
			}
		}
		
		return htReturn;		
	},
	
	_getCssTransform : function(wel){
		
		return wel.css(this._sCssPrefix +"Transform") || "";		
	}
	
}).extend(jindo.m._Effect_);/**
	@fileOverview 사용자 대화창을 생성하는 컴포넌트
	@author icebelle
	@version 1.17.0
	@since 2011. 8. 5
**/
/**
	사용자 대화창을 생성하는 컴포넌트

	@class jindo.m.Dialog
	@extends jindo.m.UIComponent
	@uses jindo.m.LayerEffect, jindo.m.SlideEffect, jindo.m.PopEffect, jindo.m.FlipEffect {0,}
	@keyword dialog, 다이얼로그, 대화상자
	@group Component
	
  @history 1.8.0 Scroll 컴포넌트와 z-index 충돌로 Scroll component z-index 값(2000) 보다 상향 조정(2050)
  @history 1.6.0 Bug 안드로이드 ics에서 화면전환시 사이즈 못맞추는 버그 해결
	@history 1.3.0 Update [sDialogColor] Option 추가
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
	@history 0.9.0 Release 최초 릴리즈
**/

jindo.m.Dialog = jindo.$Class({
	/* @lends jindo.m.Dialog.prototype */
	/**
		초기화 함수

		@constructor
		@param {Object} [htOption] 초기화 옵션 객체
			Dialog에 적용될 Class의 prefix명
			layer와 각 버튼에 prefix+"명칭" 으로 클래스가 구성된다
			@param {String} [htOption.bActivateOnload=true]
			@param {String} [htOption.sClassPrefix="dialog-"]
			@param {String} [htOption.sPosition="center"] Dialog 레이어가 보여질 위치
			<ul>
			<li>"top" : 화면 상단중앙</li>
			<li>"center" : 중앙</li>
			<li>"bottom" : 화면 하단중앙</li>
			<li>"all" : 화면 전체</li>
			</ul>
			@param {Boolean} [htOption.bUseEffect=true] Dialog 레이어가 보여질때 Effect(pop)효과 사용여부
			@param {Boolean} [htOption.bAutoClose=false] Dialog이외의 영역에 클릭(터치)발생시 Dialog 자동닫힘 사용여부
			@param {Boolean} [htOption.bAutoReposition=true] 리사이즈 발생시 Dialog위치 자동재설정 사용여부
			@param {String} [htOption.sFoggyColor="gray"] Foggy레이어 색상
			@param {Number} [htOption.nFoggyOpacity=0.5] Foggy레이어 투명도 (0~1)
			@param {String} [htOption.sEffectType="pop"] 이펙트 종류
			<ul>
			<li>"slide-up" : "slide-up"으로 보여지고, "slide-down"으로 사라짐</li>
			<li>"slide-down" : "slide-down"으로 보여지고, "slide-up"으로 사라짐</li>
			<li>"flip" : "flip"으로 보여지고, 사라짐(iOS전용)</li>
			</ul>
			@param {Number} [htOption.nEffectDuration=500] 이펙트 지속시간(ms단위, 최소값100)
			@param {String} [htOption.sDialogColor="white"] Dialog 레이어의 백그라운드 컬러
	**/
	$init : function(htOption) {
		//console.log("$init")
		var htDefaultOption = {
			bActivateOnload : true,
			sClassPrefix : "dialog-",
			sPosition : "center",
			bUseEffect : true,
			bAutoClose : false,
			bAutoReposition : true,
			sFoggyColor : "gray",
			nFoggyOpacity : 0.5,
			sEffectType : "pop",
			nEffectDuration : 500,
			sDialogColor : "white"
		};
		this.option(htDefaultOption);
		this.option(htOption || {});

		this._setWrapperElement();
		this._initVar();
		this._setDeviceSize();
		this._initElement();

		if(this.option("bActivateOnload")) {
			this.activate();
		}
	},

	/**
		jindo.m.Dialog 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
	**/
	_setWrapperElement : function() {
		this._htWElement = {};
		this._htWElement["dialog_container"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'container"></div>');
		this._htWElement["dialog_foggy"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'fog"></div>');
		this._htWElement["dialog_layer"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'layer"></div>');
		this._htWElement["dialog_clone"] =  jindo.$Element('<div class="' + this.option("sClassPrefix") + 'clone"></div>');
	},

	/**
		인스턴스 변수를 초기화한다.
	**/
	_initVar : function() {
		this._htDialogSize = {
			width : 0,
			height : 0
		};

		this._sTemplate = null;
		this._bIsShown = false;
		this._bProcessingShow = false;
		this._bProcessingHide = false;
		this._htDeviceInfo = jindo.m.getDeviceInfo();
		this._bIOS = (this._htDeviceInfo.iphone || this._htDeviceInfo.ipad) ? true : false;
		this._bIsRenderBug = true; //ios와 android 모두 화면 전환시에 dialog창을 토글 시킨 상태에서 화면 크기를 맞춤
		this._bAndroid = this._htDeviceInfo.android ? true : false;
	},

	/**
		디바이스의 View영역 사이즈를 구한다.
	**/
	_setDeviceSize : function() {
		if (this._bIOS || (this._bAndroid) || !jindo.$Agent().navigator().mobile) {
			this._htDeviceSize = jindo.$Document().clientSize();
		} else {
			this._htDeviceSize = {
				width : window.screen.width,
				height : window.screen.height
			};
		}
	},

	/**
		다이얼로그 컨테이너의 초기위치를 설정한다.
	**/
	_initContainerTop : function() {
		//console.log("_initContainerTop")
		var nTop = 0;
		var bUseEffect = this.option("bUseEffect");
		var sEffectType = this.option("sEffectType");

		if(bUseEffect && (sEffectType == "slide-up" || sEffectType == "slide-down")) {
			// 슬라이드 효과일경우 화면 상단/하단에 위치하도록 설정한다.
			nTop = this._htDeviceSize.height * ((sEffectType == "slide-up") ? 1 : -1);
		}
		// 페이지가 스크롤된 만큼 보정처리한다.
		nTop += window.pageYOffset;

		this._htWElement["dialog_container"].css("top", nTop + "px");
	},

	/**
		Element를 초기화한다.
	**/
	_initElement : function() {
		// 포그레이어 초기화
		this._htWElement["dialog_foggy"].css({
			position : "absolute",
			padding : "0px",
			margin : "0px",
			border : "0px",
			backgroundColor : this.option("sFoggyColor"),
			opacity : this.option("nFoggyOpacity"),
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px",
			left : "0px",
			top : "0px"
		});
		this._htWElement["dialog_foggy"].appendTo(this._getContainer());

		// 다이얼로그 창 초기화
		this._htWElement["dialog_layer"].css({
			position : "relative",
			backgroundColor : this.option('sDialogColor')
		});
		this._htWElement["dialog_layer"].appendTo(this._getContainer());

		// 다이얼로그 컨테이너 초기화
		this._htWElement["dialog_container"].css({
			position : "absolute",
			overflow : "hidden",
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px",
			left : "0px",
			zIndex : 2050 // Scroll 컴포넌트의 z-index 보다 높게 처리 
		});
		this._initContainerTop();
		this._htWElement["dialog_container"].hide();
		this._htWElement["dialog_container"].appendTo(document.body);

		if(this.option("bUseEffect")) {
			this._oLayerEffect = new jindo.m.LayerEffect(this._getContainer());
		}

		// 다이얼로그 클론창 초기화
		this._htWElement["dialog_clone"].css({
			position : "absolute",
			left : "-1000px",
			top : "-1000px"
		});
		this._htWElement["dialog_clone"].appendTo(document.body);
		this._htWElement["dialog_clone"].hide();
	},

	/**
		jindo.m.Dialog 컴포넌트를 활성화한다.
	**/
	_onActivate : function() {
		this._attachEvent();
	},

	/**
		jindo.m.Dialog 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEventAll();
	},

	/**
		jindo.m.Dialog 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		/*this._htEvent["click"] = {
			ref : jindo.$Fn(this._onClick, this).attach(this._getContainer(), "click"),
			el	: this._getContainer()
		};*/

		// click event 처리
		this._htEvent["click"] = {
			ref : jindo.$Fn(this._onClick, this).attach(this.getDialog(), "click"),
			el	: this.getDialog()
		};

		this._htEvent["touchend"] = {
			ref : jindo.$Fn(this._onClick, this).attach(this._getFoggy(), "touchend"),
			el	: this._getFoggy()
		};

		/*
		this._htEvent["touchstart"] = {
			ref : jindo.$Fn(this._onTouchStart, this).attach(this._getContainer(), "touchstart"),
			el	: this._getContainer()
		};*/

		// 스크롤 방지 처리
		this._htEvent["touchmove"] = {
			ref : jindo.$Fn(this._onTouchMove, this).attach(this._getContainer(), "touchmove"),
			el	: this._getContainer()
		};

		/*
		this._htEvent["touchmove"] = {
			ref : jindo.$Fn(this._onTouchMove, this).attach(document, "touchmove"),
			el	: document
		};*/

		// 리사이즈 처리
		if (this.option("bAutoReposition")) {
			this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
			jindo.m.bindRotate(this._htEvent["rotate"]);
		}
	},

	/**
		특정 이벤트를 해제한다.
		@param {String} sEventKey 이벤트 키
	**/
	_detachEvent : function(sEventKey) {
		if(sEventKey) {
			var htTargetEvent = this._htEvent[sEventKey];
			if (htTargetEvent.ref) {
				htTargetEvent.ref.detach(htTargetEvent.el, sEventKey);
			}
		}
	},

	/**
		jindo.m.Dialog 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEventAll : function() {
		for(var p in this._htEvent) {
			this._detachEvent(p);
		}
		jindo.m.unbindRotate(this._htEvent["rotate"]);
		this._htEvent = null;
	},

	/**
		다이얼로그 레이어 내부에서 닫기, 확인, 취소 버튼을 처리하기위한 핸들러
		@param {jindo.$Event} we 랩핑된 이벤트객체
	**/
	_onClick : function(we) {
		var sClassPrefix = this.option("sClassPrefix");
		var elClosestClose, elClosestConfirm, elClosestCancel, elClosestLayer, elClosestAnchor;

		if ((elClosestClose = jindo.m.getClosest(("." + sClassPrefix + "close"), we.element))) {

			/**
				닫기 버튼(dialog-close)이 눌렸을 경우에 발생

				@event close
				@param {String} sType 커스텀 이벤트명
				@param {HTMLElement} elLayer 다이얼로그 Element
			**/
			if(this.fireEvent("close", {
				sType : "close",
				elLayer : this.getDialog()
			})) {
				this.hide();
			}
		} else if ((elClosestConfirm = jindo.m.getClosest(("." + sClassPrefix + "confirm"), we.element))) {

			/**
				확인 버튼(dialog-confirm)이 눌렸을 경우에 발생

				@event confirm
				@param {String} sType 커스텀 이벤트명
				@param {HTMLElement} elLayer 다이얼로그 Element
			**/
			if(this.fireEvent("confirm", {
				sType : "confirm",
				elLayer : this.getDialog()
			})) {
				this.hide();
			}
		} else if ((elClosestCancel = jindo.m.getClosest(("." + sClassPrefix + "cancel"), we.element))) {

			/**
				취소 버튼(dialog-cancel)이 눌렸을 경우에 발생

				@event cancel
				@param {String} sType 커스텀 이벤트명
				@param {HTMLElement} elLayer 다이얼로그 Element
			**/
			if (this.fireEvent("cancel", {
				sType : "cancel",
				elLayer : this.getDialog()
			})) {
				this.hide();
			}
		} else if ((elClosestLayer = jindo.m.getClosest(("." + sClassPrefix + "layer"), we.element))) {
			// 다이얼로그 안쪽영역 클릭
			if ((elClosestAnchor = jindo.m.getClosest(("a"), we.element))) {
				// 링크가 클릭된 경우
				return false;
			}
		} else {
			// 다이얼로그 외 바깥영역 클릭
			if(this.option("bAutoClose")) { this.hide(); }
		}
		we.stop();
		return false;
	},

	/**
		터치스타트 이벤트를 처리하기위한 핸들러 - 롱탭/하이라이팅 막기
		@param {jindo.$Event} we 랩핑된 이벤트객체
	**/
	_onTouchStart : function(we) {
		var sClassPrefix = this.option("sClassPrefix");
		var elClosestLayer;
		if (!(elClosestLayer = jindo.m.getClosest(("." + sClassPrefix + "layer"), we.element))) {
			we.stop(jindo.$Event.CANCEL_ALL);
			return false;
		}
	},

	/**
		터치무브 이벤트를 처리하기위한 핸들러 - 스크롤 막기
		@param {jindo.$Event} we 랩핑된 이벤트객체
	**/
	_onTouchMove : function(we) {
		we.stop(jindo.$Event.CANCEL_ALL);
		return false;
	},

	/**
		리사이즈를 처리하기위한 핸들러
		@param {jindo.$Event} we 랩핑된 이벤트객체
	**/
	_onResize : function(we) {
		// Show/Hide를 처리하는 중에 리사이즈 발생시
		if(this._bProcessingShow || this._bProcessingHide) {
			if(this.option("bUseEffect")) {
				this._getLayerEffect().stop();
			} else {
				if(this._bProcessingShow) {
					this._endShowEffect();
				} else {
					this._endHideEffect();
				}
			}
		}

		if(this._oTimeout) {
			clearTimeout(this._oTimeout);
			this._oTimeout = null;
		}
		if (this.isShown() && this._bIsRenderBug) {
			this._htWElement["dialog_container"].hide();
		}
		this._oTimeout = setTimeout(jindo.$Fn(function() {
			this._resizeDocument();

			if (this.isShown() && this._bIsRenderBug) {
				this._htWElement["dialog_container"].show();
			}
			
			if(this.option("bUseEffect")) {
                this._getLayerEffect().setSize();
            }
		}, this).bind(), 300);
	},

	/**
		리사이즈를 처리한다.
	**/
	_resizeDocument : function() {
		this._setDeviceSize();
		// Container Resize
		this._htWElement["dialog_container"].css({
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px"
		});
		// FogLayer Resize
		this._htWElement["dialog_foggy"].css({
			width : this._htDeviceSize.width + "px",
			height : this._htDeviceSize.height + "px"
		});
		
		// Dialog Resize
		this._resizeDialog(true);

		// LayerEffect Resize
		if(this.option("bUseEffect")) { this._getLayerEffect().setSize(); }
	},

	/**
		setTemplate등으로 다이얼로그가 수정되었을경우 다이얼로그의 리사이즈를 처리한다.
		@param (Boolean} bForced 무조건 _repositionDialog()를 수행할지 여부
	**/
	_resizeDialog : function(bForced) {
		//console.log("_resizeDialog")
		if(this._setDialogSize() || bForced) {
			// Dialog Reposition
			this._repositionDialog();
		}
	},
	/**
		생성된 LayerEffect 컴포넌트의 인스턴스를 가져온다.
		@return {jindo.m.LayerEffect} LayerEffect 컴포넌트의 인스턴스
	**/
	_getLayerEffect : function() {
		return this._oLayerEffect;
	},

	/**
		다이얼로그 컨테이너 엘리먼트를 반환한다.
		@return {HTMLElement} elDialogContainer 다이얼로그 컨테이너 엘리먼트
	**/
	_getContainer : function() {
		return this._htWElement["dialog_container"].$value();
	},

	/**
		Foggy 엘리먼트를 반환한다.
		@return {HTMLElement} Foggy 엘리먼트
	**/
	_getFoggy : function() {
		return this._htWElement["dialog_foggy"].$value();
	},

	/**
		다이얼로그 엘리먼트를 반환한다.

		@method getDialog
		@return {HTMLElement} elDialog 다이얼로그 엘리먼트
	**/
	getDialog : function() {
		return this._htWElement["dialog_layer"].$value();
	},

	/**
		다이얼로그 레이어에 대한 템플릿을 설정한다.
		@remark 다이얼로그 레이어의 내용을 동적으로 설정하기 위해 템플릿 형태로 설정한다.

		@method setTemplate
		@remark Jindo의 jindo.$Template 참고
		@param {String} sTemplate 템플릿 문자열
		@example
			oDialog.setTemplate('<div><a href="#" class="dialog-close"><img width="15" height="14" alt="레이어닫기" src="http://static.naver.com/common/btn/btn_close2.gif"/></a></div><div style="position:absolute;top:30px;left:10px;">{=text}</div><div style="position:absolute;bottom:10px;right:10px;"><button type="button" class="dialog-confirm">확인</button><button type="button" class="dialog-cancel">취소</button></div></div>');
	**/
	setTemplate : function(sTemplate) {
		this._sTemplate = sTemplate;
		this._oTemplate = jindo.$Template(this._sTemplate);


		this._htWElement["dialog_clone"].html(sTemplate);
		this._resizeDialog();
	},

	/**
		설정된 다이얼로그 레이어의 템플릿을 가져온다.

		@method getTemplate
		@return {String} sTemplate 설정된 템플릿 문자열
	**/
	getTemplate : function() {
		return this._sTemplate;
	},

	/**
		다이얼로그 레이어의 사이즈를 저장한다.
	**/
	_setDialogSize : function() {
		//console.log("_setDialogSize")
		var nLayerWidth;
		var nLayerHeight;
		if(this.option("sPosition") == "all") {
			// 다이얼로그 레이어의 사이즈를 디바이스 사이즈로 설정한다.
			nLayerWidth = this._htDeviceSize.width;
			nLayerHeight = this._htDeviceSize.height;
		} else {
			// 실제 다이얼로그 레이어의 사이즈를 구하기위해 클론을 사용한다.
			this._htWElement["dialog_clone"].show();
			nLayerWidth = Math.min(this._htWElement["dialog_clone"].width(), this._htDeviceSize.width);
			nLayerHeight = Math.min(this._htWElement["dialog_clone"].height(), this._htDeviceSize.height);
			this._htWElement["dialog_clone"].hide();
		}

		// 기존에 설정해놨던 사이즈와 동일할 경우 return false; 처리한다.
		if(this._htDialogSize.width == nLayerWidth && this._htDialogSize.height == nLayerHeight) {
			return false;
		}

		// 새로 구한 사이즈를 저장한다.
		this._htDialogSize = {
			width : nLayerWidth,
			height : nLayerHeight
		};

		// 다이얼로그 레이어의 사이즈를 설정한다.
		this._htWElement["dialog_layer"].css({
			width : nLayerWidth + "px",
			height : nLayerHeight + "px"
		});

		return this._htDialogSize;
	},

	/**
		다이얼로그 레이어의 사이즈를 반환한다.
		@return {Object} htDialogSize 다이얼로그 레이어 사이즈정보
	**/
	_getDialogSize : function() {
		return this._htDialogSize;
	},

	/**
		다이얼로그의 위치를 재계산한다.
	**/
	_repositionDialog : function() {
		//console.log("_repositionDialog")

		var htLayerPosition = this._getDialogPosition();
		this._htWElement["dialog_layer"].css({
			top : htLayerPosition.top + "px",
			left : htLayerPosition.left + "px"
		});

		this._htWElement["dialog_container"].css({
			top : window.pageYOffset + "px",
			left : window.pageXOffset + "px"
		});
		

		if(!this.isShown()) {
			var sEffectType = this.option("sEffectType");
			if(sEffectType == "slide-up" || sEffectType == "slide-down") {
				this._initContainerTop();
			}
		}
	},

	/**
		다이얼로그 레이어의 위치를 반환한다.
		@return {Object} htLayerPosition 다이얼로그 레이어 위치정보
	**/
	_getDialogPosition : function() {
		var nWidth = this._htDeviceSize.width;
		var nHeight = this._htDeviceSize.height;
		var nLayerWidth = this._getDialogSize().width;
		var nLayerHeight = this._getDialogSize().height;

		var htLayerPosition = {};
		switch(this.option("sPosition")) {
		case "top":
			htLayerPosition.top = 0;
			htLayerPosition.left = parseInt((nWidth - nLayerWidth) / 2, 10);
			break;
		case "center":
			htLayerPosition.top = parseInt((nHeight - nLayerHeight) / 2, 10);
			htLayerPosition.left = parseInt((nWidth - nLayerWidth) / 2, 10);
			break;
		case "bottom":
			htLayerPosition.top = parseInt(nHeight - nLayerHeight,10);
			htLayerPosition.left = parseInt((nWidth - nLayerWidth) / 2, 10);
			break;
		case "all" :
			htLayerPosition.top = 0;
			htLayerPosition.left = 0;
			break;
		}

		return htLayerPosition;
	},

	/**
		다이얼로그 레이어에 위치를 설정한다.

		@method setPosition
		@param {String} sPosition ("top"|"center"|"bottom"|"all")
	**/
	setPosition : function(sPosition) {
		if(sPosition == "top" || sPosition == "center" || sPosition == "bottom" || sPosition == "all") {
			this.option("sPosition", sPosition);
		}

		this._resizeDialog();
	},

	/**
		이펙트 사용을 설정한다.

		@method useEffect
	**/
	useEffect : function() {
		if(this.option("bUseEffect")) { return false; }
		this.option("bUseEffect", true);
		this._initContainerTop();
	},

	/**
		이펙트 효과를 없앤다.

		@method unuseEffect
	**/
	unuseEffect : function() {
		if(!this.option("bUseEffect")) { return false; }
		this.option("bUseEffect", false);
		this._initContainerTop();
	},

	/**
		이펙트 타입을 설정한다.

		@method setEffectType
		@param {String} sEffectType 이펙트 타입
	**/
	setEffectType : function(sEffectType) {
		this.useEffect();

		if(sEffectType == "pop" || sEffectType == "slide-up" || sEffectType == "slide-down" || sEffectType == "flip") {
			this.option("sEffectType", sEffectType);
			this._initContainerTop();
		}
	},

	/**
		이펙트 지속시간을 설정한다.

		@method setEffectDuration
		@param {Number} nEffectDuration 이펙트 지속시간 (ms단위)
	**/
	setEffectDuration : function(nEffectDuration) {
		this.useEffect();

		if(nEffectDuration && nEffectDuration > 99) {
			this.option("nEffectDuration", nEffectDuration);
		}
	},


	/**
		이펙트 효과를 설정한다.

		@method setEffect
		@param {Object} htEffectOption 이펙트 효과 정보(이펙트 종류, 시간)
	**/
	setEffect : function(htEffectOption) {
		this.useEffect();

		if(htEffectOption.type) {
			this.setEffectType(htEffectOption.type);
		}

		if(htEffectOption.duration) {
			this.setEffectDuration(htEffectOption.duration);
		}
	},

	/**
		다이얼로그 레이어가 보여지고 있는지 가져온다.

		@method isShown
		@return {Boolean} 다이얼로그 레이어의 노출여부
	**/
	isShown : function() {
		return this._bIsShown;
	},

	/**
		다이얼로그를 보여준다.

		@method show
		@param {Object} htTemplate 다이얼로그 템플릿 Text치환 정보
		@param {Object} htEventHandler 커스텀 이벤트 정보
	**/
	show : function(htTemplate, htEventHandler) {
		//console.log("show")
		if(this.isShown()) { return false; }

		this._bProcessingShow = true;

		// 다이얼로그가 보이는 동안에 스크롤을 막기
		this._htEvent["touchstart"] = {
			ref : jindo.$Fn(this._onTouchStart, this).attach(document, "touchstart"),
			el	: document
		};

		// custom event attach
		if(htEventHandler) {
			this._showAttachedEvent = htEventHandler;
			this.attach(htEventHandler);
		}

		// Dialog가 뜬 상태에서는 스크롤 불가처리
		this._resizeDocument();

		// Template처리
		if(typeof htTemplate == "undefined") {
			htTemplate = {};
		} else {
			this._htWElement["dialog_clone"].html(this._oTemplate.process(htTemplate));
			this._resizeDialog();
		}
		this._htWElement["dialog_layer"].html(this._oTemplate.process(htTemplate));

		/**
			Dailog가 보여지기 전에 발생

			@event beforeshow
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elLayer 다이얼로그 Element
			@param {Function} stop 수행시 다이얼로그가 Show되지 않음
		**/
		if(!this.fireEvent("beforeShow", {
			sType : "beforeShow",
			elLayer : this.getDialog()
		})) { return; }

		this._showDialogLayer();
	},

	/**
		이펙트 사용여부에 따라 분기처리한다.
	**/
	_showDialogLayer : function() {
		//console.log("_showDialogLayer")

		if(this.option("bUseEffect")) {
			this._getLayerEffect().attach("afterEffect", jindo.$Fn(this._endShowEffect, this).bind());
			this._startShowEffect();
		} else {
			// Effect 효과 없음
			this._htWElement["dialog_container"].show();
			this._endShowEffect();
		}
	},

	/**
		Show시 보여줄 이펙트효과를 시작한다.
	**/
	_startShowEffect : function() {
		//console.log("_startShowEffect")

		var sEffectType = this.option("sEffectType");
		var nEffectDuration = this.option("nEffectDuration");

		switch(sEffectType) {
		case "slide-up":
			this._htWElement["dialog_container"].show();
			this._getLayerEffect().setSize();
			this._getLayerEffect().slide({
				sDirection : "up",
				nDuration : nEffectDuration
			});
			break;
		case "slide-down":
			this._htWElement["dialog_container"].show();
			this._getLayerEffect().setSize();
			this._getLayerEffect().slide({
				sDirection : "down",
				nDuration : nEffectDuration
			});
			break;
		case "pop":
			this._getLayerEffect().pop({
				sDirection : "in",
				nDuration : nEffectDuration,
				htFrom : {opacity : 1}
			});
			break;
		case "flip":
			this._htWElement["dialog_container"].show();
			this._getLayerEffect().flip({
				nDuration : nEffectDuration,
				elFlipFrom : this._getContainer(),
				elFlipTo : this._getContainer(),
				htFrom : {opacity : 0},
				htTo : {opacity : 1}
			});
			//this._htWElement["dialog_container"].show();
			break;
		}
	},

	/**
		Show시 보여줄 이펙트효과를 끝낸다.
	**/
	_endShowEffect : function() {
		//console.log("_endShowEffect")

		if(this.option("bUseEffect")) { this._getLayerEffect().detachAll("afterEffect"); }

		/**
			Dailog가 보여진 후에 발생

			@event show
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elLayer 다이얼로그 Element
		**/
		this.fireEvent("show", {
			sType : "show",
			elLayer : this.getDialog()
		});

		this._bIsShown = true;
		this._bProcessingShow = false;
	},

	/**
		다이얼로그를 숨긴다.

		@method hide
	**/
	hide : function() {
		//console.log("hide")
		if(!this.isShown()) { return false; }

		this._bProcessingHide = true;

		/**
			Dailog가 숨겨지기 전에 발생

			@event beforeHide
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elLayer 다이얼로그 Element
			@param {Function} stop 수행시 다이얼로그가 Hide되지 않음
		**/
		if(!this.fireEvent("beforeHide", {
			sType : "beforeHide",
			elLayer : this.getDialog()
		})) { return; }

		this._hideDialogLayer();
	},

	/**
		이펙트 사용여부에 따라 분기처리한다.
	**/
	_hideDialogLayer : function() {
		//console.log("_hideDialogLayer")

		if(this.option("bUseEffect")) {
			this._getLayerEffect().attach("afterEffect", jindo.$Fn(this._endHideEffect, this).bind());
			this._startHideEffect();
		} else {
			// Effect 효과 없음
			this._htWElement["dialog_container"].hide();
			this._endHideEffect();
		}
	},

	/**
		Hide시 보여줄 이펙트효과를 시작한다.
	**/
	_startHideEffect : function() {
		//console.log("_startHideEffect")

		var sEffectType = this.option("sEffectType");
		var nEffectDuration = this.option("nEffectDuration");

		switch(sEffectType) {
		case "slide-up":
			this._getLayerEffect().slide({
				sDirection : "down",
				nDuration : nEffectDuration
			});
			break;
		case "slide-down":
			this._getLayerEffect().slide({
				sDirection : "up",
				nDuration : nEffectDuration
			});
			break;
		case "pop":
			this._getLayerEffect().pop({
				sDirection : "out",
				nDuration : nEffectDuration,
				htTo : {opacity : 0}
			});
			break;
		case "flip":
			this._getLayerEffect().flip({
				nDuration : nEffectDuration,
				elFlipFrom : this._getContainer(),
				elFlipTo : this._getContainer(),
				htTo : {opacity : 0}
			});
			break;
		}
	},

	/**
		Hide시 보여줄 이펙트효과를 끝낸다.
	**/
	_endHideEffect : function() {
		//console.log("_endHideEffect")

		if(this.option("bUseEffect")) { this._getLayerEffect().detachAll("afterEffect"); }

		/**
			Dailog가 숨겨진 후에 발생

			@event hide
			@param {String} sType 커스텀 이벤트명
			@param {HTMLElement} elLayer 다이얼로그 Element
		**/
		this.fireEvent("hide", {
			sType : "hide",
			elLayer : this.getDialog()
		});

		// custom event detach
		if(this._showAttachedEvent) {
			for(var evt in this._showAttachedEvent) {
				//console.log(evt)
				this.detachAll(evt);
			}
			this._showAttachedEvent = null;
		}

		// 다이얼로그가 보이는 동안에 스크롤을 막기 해제
		this._detachEvent("touchstart");

		this._htWElement["dialog_container"].hide();
		this._htWElement["dialog_container"].css("opacity", 1);

		if(window.pageYOffset || window.pageXOffset) {
			this._htWElement["dialog_container"].css({
				top : "0px",
				left : "0px"
			});
		}

		this._bIsShown = false;
		this._bProcessingHide = false;
	},

	/**
		객체를 release 시킨다.

		@method destroy
	**/
	destroy : function() {
		this._detachEventAll();

		if(this.option("bUseEffect")) {
			this._getLayerEffect().destroy();
			this._oLayerEffect = null;
		}

		this._htWElement["dialog_container"].leave();
		this._htWElement["dialog_clone"].leave();
		this._htWElement = null;
		this._htDeviceSize = null;
		this._htDialogSize = null;
		this._sTemplate = null;
		this._oTemplate = null;
		this._bIsShown = null;
		this._bProcessingShow = null;
		this._bProcessingHide = null;
		this._oTimeout = null;
		this._htDeviceInfo = null;
		this._bIOS = null;
		this._bIsRenderBug = null;
		this._bAndroid = null;
	}
}).extend(jindo.m.UIComponent);/**
 @fileOverview 모바일 터치 컴포넌트
 @(#)jindo.m.Touch.js 2011. 8. 24.
 @author oyang2
 @version 1.17.0
 @since 2011. 8. 24.
 **/
/**
 기준 레이어에서의 사용자 터치 움직임을 분석하여 scroll,tap 등의 동작을 분석하는 컴포넌트

 @class jindo.m.Touch
 @extends jindo.m.UIComponent
 @keyword touch
 @group Component

 @history 1.17.0-master Bug 멀티터치시 대응. 멀티 터치시 touchstart, touchend 최종 한번만 나오도록 변경
 @history 1.16.0 Bug 대각선 방항성에 대한 체크 부분 기존과 같이 변경
 @history 1.15.0 Bug touchMove 이벤트가 사용자가 정의한 방향일때 발생되던것을 매번 발생될 수 있도록 변경
 @history 1.12.0 Bug moveThreshold 적용시 격자 형태로 발생되던 버그 수정
 @history 1.12.0 Update 대각선 방향 옵션 추가
 @history 1.12.0 Bug vScroll, hScroll, dScroll 이벤트 이후 touchEnd 이벤트 발생 순서 변경

 @history 1.12.0 Bug Window8 IE10 플리킹 적용시 스크롤이 안되는 이슈 처리
 @history 1.9.0 Bug Window8 IE10 플리킹 적용시 스크롤이 안되는 이슈 처리
 @history 1.5.0 Support Window Phone8 지원
 @history 1.2.0 Support Chrome for Android 지원<br />
 갤럭시 S2 4.0.3 업데이트 지원
 @history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
 @history 0.9.0 Release 최초 릴리즈
 */
jindo.m.Touch = jindo.$Class({
    /* @lends jindo.m.Touch.prototype */
    /**
     초기화 함수

     @constructor
     @extends jindo.m.UIComponent
     @param {String | HTMLElement} vEl Touch이벤트를 분석할 타켓 엘리먼트 혹은 아이디.
     @param {Object} htOption 초기화 옵션 설정을 위한 객체.
     @param {Number} [htOption.nMomentumDuration=350] 가속에 대해 판단하는 기준시간(단위 ms)
     <ul>
     <li>touchstart, touchend 간격의 시간이 nMomentumDuration 보다 작을 경우 가속값을 계산한다.</li>
     <li>일반적으로 android가 iOS보다 반응 속도가 느리므로 iOS보다 큰값을 세팅한다.</li>
     <li>android의 경우 500~1000 정도가 적당하다.</li>
     <li>iOS의 경우 200~350이 적당하다.</li>
     </ul>
     @param {Number} [htOption.nMoveThreshold=7] touchMove 커스텀 이벤트를 발생시키는 최소 단위 움직임 픽셀
     <ul>
     <li>세로모드의 스크롤 작업일 경우 0~2 정도가 적당하다</li>
     <li>가로모드의 스크롤 작업일 경우 4~7 정도가 적당하다</li>
     </ul>
     @param {Number} [htOption.nSlopeThreshold=25] scroll 움직임에 대한 방향성(수직,수평,대각선)을 판단하는 움직인 거리
     <ul>
     <li>사용자가 터치를 시작한 이후에 25픽셀 이상 움직일 경우 scroll에 대한 방향을 판단한다.</li>
     <li>25픽셀이하로 움직였을 경우 방향성에 대해서 판단하지 않는다.</li>
     </ul>
     @param {Number} [htOption.nLongTapDuration=1000] 롱탭을 판단하는 기준 시간(단위ms)
     <ul>
     <li>600~1000정도의 값이 적당하다.</li>
     </ul>
     @param {Number} [htOption.nDoubleTapDuration=400] 더블탭을 판단하는 탭간의 기준 시간(단위ms)
     <ul>
     <li>이 값을 길게 설정하면 Tap 커스텀 이벤트의 발생이 늦어지기 때문에 1500 이상의 값은 세팅하지 않는것이 적당하다.</li>
     </ul>
     @param {Number} [htOption.nTapThreshold=6] tap에 대해 판단할때 최대 움직인 거리 (단위 px)
     <ul>
     <li>사용자 터치를 시작한 이후 수직,수평방향으로 nTapThreshold 이하로 움직였을때 tap이라고 판단한다.</li>
     <li>doubleTap을 사용할 경우에는 이 값을 좀더 크게 5~8 정도 설정하는 것이 적당하다.</li>
     <li>doubleTap을 사용하지 않을 때 iOS에서는 0~2정도 설정하는 것이 적당하다.</li>
     <li>doubleTap을 사용하지 않을 때 android에서는 4~6 정도 설정하는 것이 적당하다.</li>
     </ul>
     @param {Number} [htOption.nPinchThreshold=0.1] pinch를 판단하는 최소 scale 값
     <ul>
     <li>최초의 멀티터치간의 거리를 1의 비율로 보았을때 움직이는 터치간의 간격이 이 값보다 크거나 작게 변하면 pinch로 분석한다.</li>
     </ul>
     @param {Number} [htOption.nRotateThreshold=5] rotate 판단하는 최소 angle 값
     <ul>
     <li>0일경우 강제로 touchend 이벤트를 발생시키지 않는다.</li>
     </ul>
     @param {Boolean} [htOption.bActivateOnload=true] Touch 컴포넌트가 로딩 될때 활성화 시킬지 여부를 결정한다.<br />false로 설정하는 경우에는 oTouch.activate()를 호출하여 따로 활성화 시켜야 한다.
    @param {Number} [htOption.nUseDiagonal=0] 자유이동 옵션 (0 : 자유이동 불가 , 1 : 대각선시에만 자유이동 가능, 2 : 항상 자유이동 가능)
    @param {Boolean} [htOption.bUseAutoDirection=false] 사용자의 이동에 따라 동적으로 방향이 결정된다.
     */
    $init : function(sId, htUserOption) {
        this._el = jindo.$Element(sId).$value();

        var htDefaultOption = {
            nMomentumDuration : 350,
            nMoveThreshold : 7,
            nSlopeThreshold : 25,
            nLongTapDuration : 1000,
            nDoubleTapDuration : 400,
            nTapThreshold : 6,
            nPinchThreshold : 0.1,
            nRotateThreshold : 5,
            // nEndEventThreshold : 0,
            bActivateOnload : true,

            bUseAutoDirection : false,

            nUseDiagonal : 0, // 0 : 자유이동 불가 , 1 : 대각선시에만 자유이동 가능), 2 : 항상 자유이동 가능)
            // bVertical : true,                // private
            // bHorizental : false          // private

            // bVertical : false,               // private
            // bHorizental : true       // private

            bVertical : true, // private
            bHorizental : false  // private
        };

        this.option(htDefaultOption);
        this.option(htUserOption || {});

        // 대각선 모드를 사용할때 vertical, horizental 을 강제로 셋팅한다.
        if (this.option("nUseDiagonal") > 0) {
            this.option({
                "bVertical" : true,
                "bHorizental" : true
            });
        }

        this._initVariable();
        this._initTouchEventName();
        this._initPreventSystemEvent();
        this._setSlope();

        //활성화
        if (this.option("bActivateOnload")) {
            this.activate();
            //컴포넌트를 활성화한다.
        }
    },

    $static : {
        /** MOVE 타입 */
        MOVETYPE : {
            0 : 'hScroll',
            1 : 'vScroll',
            2 : 'dScroll',
            3 : 'tap',
            4 : 'longTap',
            5 : 'doubleTap',
            6 : 'pinch',
            7 : 'rotate',
            8 : 'pinch-rotate'
        }
    },

    _initTouchEventName : function() {
        if ('ontouchstart' in window) {
            this._htEventName.start = 'touchstart';
            this._htEventName.move = 'touchmove';
            this._htEventName.end = 'touchend';
            this._htEventName.cancel = 'touchcancel';
            this._hasTouchEvent = true;
        } else if (window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) {
            this._htEventName.start = 'MSPointerDown';
            this._htEventName.move = 'MSPointerMove';
            this._htEventName.end = 'MSPointerUp';
            this._htEventName.cancel = 'MSPointerCancel';
            this._hasTouchEvent = false;
        }
    },

    _initPreventSystemEvent : function() {
        // MS 대응
        if (this._el.style && typeof this._el.style.msTouchAction != 'undefined') {
            var type = "none";
            if (this.option("bHorizental") && !this.option("bVertical")) {
                type = "pan-x";
                //세로 막음
            }
            if (this.option("bVertical") && !this.option("bHorizental")) {
                type = "pan-y";
                //가로 막음
            }
            this._el.style.msTouchAction = type;
        }
    },

    // 시스템 이벤트를 막음
    _preventSystemEvent : function(we, htParam) {
        // we.stop();
        var nMoveType = this.nMoveType;

        switch(nMoveType) {
            case 0 :
                // 수평이동시
                if (this.option("bHorizental") || this.option("bUseAutoDirection")) {

                    // 수평스크롤인 경우 시스템 스크롤 막고, 컴포넌트 기능 수행
                    // we.stop();
                }
                // we.stop(jindo.$Event.CANCEL_DEFAULT);
                break;
            case 1 :
                //수직이동시
                if (this.option("bVertical") || this.option("bUseAutoDirection")) {
                    // we.stop();
                    // return false;
                }
                break;
            case 2 :
                if (this.option("bUseAutoDirection") || this.option("bVertical") || this.option("bHorizental")) {
                    // we.stop();
                }
                break;
            default :
                // we.stop();
                break;
        }
        return true;
    },

    /**
     jindo.m.Touch 인스턴스 변수를 초기화한다.
     **/
    _initVariable : function() {
        this._htEventName = {
            start : 'mousedown',
            move : 'mousemove',
            end : 'mouseup',
            cancel : null
        };
        this._hasTouchEvent = false;
        this._radianToDegree = 180 / Math.PI;
        this._htMoveInfo = {
            nStartX : 0,
            nStartY : 0,
            nBeforeX : 0,
            nBeforeY : 0,
            nStartTime : 0,
            nBeforeTime : 0,
            nStartDistance : 0,
            nBeforeDistance : 0,
            nStartAngle : 0,
            nLastAngle : 0,
            nBeforeScale : 0,
            aPos : []
        };
        this.htEndInfo = {
            nX : 0,
            nY : 0
        };

        this.nStart = 0;
        this.bMove = false;
        this.nMoveType = -1;
        this._nStartMoveType = -1;
        this._nVSlope = 0;
        this._nHSlope = 0;
        this.bSetSlope = false;
        // this._supportMulti = !(jindo.m.getOsInfo().android && (parseInt(jindo.m.getOsInfo().version,10) < 4));
    },

    /**
     jindo.m.Touch 사용하는 이벤트 attach 한다
     **/
    _attachEvents : function() {
        this._htEvent = {};
        var bTouch = this._hasTouchEvent;

        this._htEvent[this._htEventName.start] = {
            fn : jindo.$Fn(this._onStart, this).bind(),
            el : this._el
        };

        this._htEvent[this._htEventName.move] = {
            fn : jindo.$Fn(this._onMove, this).bind(),
            el : this._el
        };

        this._htEvent[this._htEventName.end] = {
            fn : jindo.$Fn(this._onEnd, this).bind(),
            el : this._el
        };

        //resize event
        this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
        jindo.m.bindRotate(this._htEvent["rotate"]);

        if (this._htEventName.cancel) {
            this._htEvent[this._htEventName.cancel] = {
                fn : jindo.$Fn(this._onCancel, this).bind(),
                el : this._el
            };
        }

        //attach events
        for (var p in this._htEvent) {
            if (this._htEvent[p].fn) {
                this._htEvent[p].ref = this._attachFakeJindo(this._htEvent[p].el, this._htEvent[p].fn, p);
            }
        }
    },

    /**
     MSPointerEvent 처럼 신규 이벤트들이 2.3.0이하 진도에서 attach안되는 문제를 해결하기 위한 코드
     jindo 2.4.0 이상 버전에서는 사용가능, 하위 버전에서는 _notSupport namespace  진도 사용
     @date 2012. 12.06
     @author oyang2
     @example
     jindo.m._attachFakeJindo(el, function(){alert('MSPointerDown'), 'MSPointerDown' });a
     */
    _attachFakeJindo : function(element, fn, sEvent) {
        var nVersion = (jindo.$Jindo.VERSION || jindo.$Jindo().version || jindo.VERSION).replace(/[a-z.]/gi, "");
        var wfn = null;
        if (nVersion < 230 && ( typeof _notSupport !== 'undefined')) {
            //use namespace jindo
            wfn = _notSupport.$Fn(fn).attach(element, sEvent);
        } else {
            //use jindo
            wfn = jindo.$Fn(fn).attach(element, sEvent);
        }
        return wfn;
    },

    /**
     jindo.m.Touch 사용하는 이벤트 detach 한다
     **/
    _detachEvents : function() {
        for (var p in this._htEvent) {
            var htTargetEvent = this._htEvent[p];
            if (htTargetEvent.ref) {
                htTargetEvent.ref.detach(htTargetEvent.el, p);
            }
        }
        jindo.m.unbindRotate(this._htEvent["rotate"]);
        this._htEvent = null;
    },

    /**
     touchcancel 발생시에 touchEnd이벤트로 바로 호출한다.
     ios3 에서는 클립보드 활성화 되면 바로 touchcancel 발생
     android 계열에서 빠르고 짧게 스크롤 하면 touchcancel 발생함
     @param {$Event}  jindo.$Event
     **/
    _onCancel : function(oEvent) {
        this._onEnd(oEvent);
    },

    /**
     touchstart(mousedown) 이벤트 핸들러
     @param {$Event}  jindo.$Event
     **/
    _onStart : function(oEvent) {
        // console.debug("touchstart", this.nStart);
        var htInfo = this._getTouchInfo(oEvent);
        // console.log(htInfo,  oEvent.$value().touches);
        this.nStart = htInfo.length;

        //멀티 터치인 경우, skip
        if(htInfo.length > 1) {
            return;
        } else {
            if(this.bMove) {
                this._resetTouchInfo();
            }
        }

        var htParam = {
            element : htInfo[0].el,
            nX : htInfo[0].nX,
            nY : htInfo[0].nY,
            oEvent : oEvent
        };

        /**
         사용자가 터치 영역에 터치하는 순간 발생한다.<br />가장 처음 발생하는 커스텀이벤트

         @event touchStart
         @param {String} sType 커스텀 이벤트명
         @param {HTMLElement} element 현재 터치된 영역의 Element
         @param {Number} nX 터치영역의 X좌표
         @param {Number} nY 터치 영역의 Y좌표
         @param {Object} oEvent jindo.$Event object
         @param {Function} stop 이후 모든 커스텀 이벤트를 중지한다.
         **/
        if (!this._fireCustomEvent('touchStart', htParam)) {
            return;
        }

        //touchstart 플래그 세팅
        this._updateTouchInfo(htInfo, "start");
        this._startLongTapTimer(htInfo, oEvent);
    },

    /**
     touchMove(mousemove) 이벤트 핸들러
     @param {$Event}  jindo.$Event
     **/
    _onMove : function(oEvent) {
        // console.log("touchmove", this.nStart);
        if(this.nStart <= 0) {
            return;
        }
        this.bMove = true;

        var htInfo = this._getTouchInfo(oEvent);
        // addConsole(htInfo.length);

        // MoveType 결정
        //싱글터치는 3,4 일때 다시 계산한다.
        if (htInfo.length === 1) {
            if (this.nMoveType < 0 || this.nMoveType == 3 || this.nMoveType == 4) {
                var nMoveType = this._getMoveType(htInfo);
                if (!((this.nMoveType == 4) && (nMoveType == 3))) {
                    if(this.option("nUseDiagonal") == 2 && ( nMoveType == 0 || nMoveType == 1 )){
                        this._nStartMoveType = nMoveType;
                        this.nMoveType = 2;
                    }else{
                        this.nMoveType = this._nStartMoveType = nMoveType;
                    }
                }
            }
        } else {//멀티터치일경우 8번이 아니면 다시 계산한다.
            if (this.nMoveType !== 8) {
                this.nMoveType = this._nStartMoveType = this._getMoveType(htInfo);
            }
        }
        //커스텀 이벤트에 대한 파라미터 생성.
        var htParam = this._getCustomEventParam(htInfo,  false, oEvent);

        //longtap timer 삭제
        (this.nMoveType != 3) && this._deleteLongTapTimer();

        var nDis = 0;
        if (this.nMoveType == 0) {//hScroll일 경우
            nDis = Math.abs(htParam.nDistanceX);
        } else if (this.nMoveType == 1) {//vScroll일 경우
            nDis = Math.abs(htParam.nDistanceY);
        } else {//dScroll 일 경우
            nDis = Math.abs(Math.sqrt(Math.pow(htParam.nDistanceX, 2) + Math.pow(htParam.nDistanceY, 2)));
        }

        //move간격이 옵션 설정 값 보다 작을 경우에는 커스텀이벤트를 발생하지 않는다 && 방향성이 정해지면 무시한다.
        if ( (nDis < this.option('nMoveThreshold') || nDis <  this.option('nSlopeThreshold')) && (this.nMoveType < 0 || this.nMoveType > 2) ) {
            return;
        }
        // this._preventSystemEvent(oEvent, htParam);
        this._updateTouchInfo(htInfo, "move");

        /**
         nMoveThreshold 옵션값 이상 움직였을 경우 발생한다

         @event touchMove
         @param {String} sType 커스텀 이벤트명
         @param {String} sMoveType 현재 분석된 움직임
         @param {String} sMoveType.hScroll 가로스크롤 (jindo.m.Touch.MOVETYPE[0])
         @param {String} sMoveType.vScroll 세로스크롤 (jindo.m.Touch.MOVETYPE[1])
         @param {String} sMoveType.dScroll 대각선스크롤 (jindo.m.Touch.MOVETYPE[2])
         @param {String} sMoveType.tap 탭 (jindo.m.Touch.MOVETYPE[3])
         @param {String} sMoveType.longTap 롱탭 (jindo.m.Touch.MOVETYPE[4])
         @param {String} sMoveType.doubleTap 더블탭 (jindo.m.Touch.MOVETYPE[5])
         @param {String} sMoveType.pinch 핀치 (jindo.m.Touch.MOVETYPE[6])
         @param {String} sMoveType.rotate 회전 (jindo.m.Touch.MOVETYPE[7])
         @param {String} sMoveType.pinch-rotate 핀치와 회전 (jindo.m.Touch.MOVETYPE[8])
         @param {String} sMoveTypeAgree 현재 이동 방향과 설정한 방향이 맞는지 여부
         @param {HTMLElement} element 현재 터치된 영역의 Element
         @param {Number} nX 터치영역의 X좌표
         @param {Number} nY 터치 영역의 Y좌표
         @param {Array} aX 모든 터치 영역의 X좌표
         @param {Array} aY 모든 터치 영역의 Y좌표
         @param {Number} nVectorX 이전 touchMove(혹은 touchStart)의 X좌표와의 상대적인 거리.(직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
         @param {Number} nVectorY 이전 touchMove(혹은 touchStart)의 Y좌표와의 상대적인 거리.(직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
         @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
         @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
         @param {Number} nStartX touchStart의 X좌표
         @param {Number} nStartY touchStart의 Y좌표
         @param {Number} nStartTimeStamp touchStart의 timestamp 값
         @param {Number} nScale 멀티터치일경우 계산된 scale값 (싱글터치의 경우 이 프로퍼티가 없다)
         @param {Number} nRotation 멀티터치일경우 계산된 rotation값 (싱글터치의 경우 이 프로퍼티가 없다)
         @param {Object} oEvent jindo.$Event object
         @param {Array} aElement touchMove 이벤트 발생시 대상 엘리먼트
         @param {String} sStartMoveType 최초 분석된 움직임 값
         @param {Object} htMomentum 최근 이동한 정보를 통해 발생점으로 부터 이전 정보까지로 부터의 momentum 정보
            @param {Number} htMomentum.nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
            @param {Number} htMomentum.nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
            @param {Number} htMomentum.nDuration touchstart와 이동한 좌표 사이의 시간값

         @param {Function} stop stop 이후 커스텀이벤트는 발생하지 않는다.
         @history 1.14.0 Update touchMove, touchEnd Custom Event 내 htMomentum 속성 추가
         **/
        htParam.sMoveTypeAgree = false;
        var sMoveType = htParam.sMoveType; // hScroll
        var nVectorX = Math.abs(htParam.nVectorX); // 3

        var bHorizentalMove = (this.option("bHorizental") && sMoveType == jindo.m.Touch.MOVETYPE[0]);
        // && nVectorX > 0);
        var bVerticalMove = (this.option("bVertical") && sMoveType == jindo.m.Touch.MOVETYPE[1]);
        // && Math.abs(htParam.nVectorY) > 0);
        var bUseDiagonalMove = (this.option("nUseDiagonal") == 1 && sMoveType == jindo.m.Touch.MOVETYPE[2]);
        var bFreeMove = this.option("nUseDiagonal") == 2;

        if (
        // 가로모드이면서 X 이동 거리가 0이상인 경우
        (
            bHorizentalMove ||
            // 세로모드이면서 Y 이동 거리가 0이상인 경우
            bVerticalMove ||
            // 대각선 모드이면서 moveType 이 dScroll 인 경우
            bUseDiagonalMove
        ) ||
        // 자유로운 대각선 모드 인 경우
        bFreeMove) {
            // htParam.sMoveType = jindo.m.Touch.MOVETYPE[2];

            htParam.sMoveTypeAgree = true;

        }

        if (!this.fireEvent('touchMove', htParam)) {
            this.nStart = 0;
            return;
        }
    },

    /**
     touchend(mouseup) 이벤트 핸들러
     @param {$Event}  jindo.$Event
     **/
    _onEnd : function(oEvent) {
        var htInfo = this._getTouchInfo(oEvent);
        this.nStart-=htInfo.length;
        if (this.nStart > 0) {
            return;
        }
        var self = this;
        this._deleteLongTapTimer();

        //touchMove이벤트가 발생하지 않고 현재 롱탭이 아니라면 tap으로 판단한다.
        if (!this.bMove && (this.nMoveType != 4)) {
            this.nMoveType = 3;
        }

        //touchEnd 시점에 판단된  moveType이 없으면 리턴한다.
        // if (this.nMoveType < 0) {
        //     return;
        // }

        //현재 touchEnd시점의 타입이 doubleTap이라고 판단이 되면
        if (this._isDblTap(htInfo[0].nX, htInfo[0].nY, htInfo[0].nTime)) {
            clearTimeout(this._nTapTimer);
            this._nTapTimer = -1;
            this.nMoveType = 5;
            //doubleTap 으로 세팅
        }

        this._updateTouchInfo(htInfo, "end");
        // TapThreshold 와 nSlopeThreshold 옵션 값 사이의 움직임에 대해서는 MoveType 값이 정의되지 않는 이슈.

        //커스텀 이벤트에 대한 파라미터 생성.
        var htParam = this._getCustomEventParam(htInfo, true, oEvent);
        var sMoveType = htParam.sMoveType;
        /**
         nMoveThreshold 옵션값 이상 움직였을 경우 발생한다

         @event touchEnd
         @param {String} sType 커스텀 이벤트명
         @param {String} sMoveType 현재 분석된 움직임
         @param {String} sMoveType.hScroll 가로스크롤 (jindo.m.Touch.MOVETYPE[0])
         @param {String} sMoveType.vScroll 세로스크롤 (jindo.m.Touch.MOVETYPE[1])
         @param {String} sMoveType.dScroll 대각선스크롤 (jindo.m.Touch.MOVETYPE[2])
         @param {String} sMoveType.tap 탭 (jindo.m.Touch.MOVETYPE[3])
         @param {String} sMoveType.longTap 롱탭 (jindo.m.Touch.MOVETYPE[4])
         @param {String} sMoveType.doubleTap 더블탭 (jindo.m.Touch.MOVETYPE[5])
         @param {String} sMoveType.pinch 핀치 (jindo.m.Touch.MOVETYPE[6])
         @param {String} sMoveType.rotate 회전 (jindo.m.Touch.MOVETYPE[7])
         @param {String} sMoveType.pinch-rotate 핀치와 회전 (jindo.m.Touch.MOVETYPE[8])
         @param {HTMLElement} element 현재 터치된 영역의 Element
         @param {Number} nX 터치영역의 X좌표
         @param {Number} nY 터치 영역의 Y좌표
         @param {Array} aX 모든 터치 영역의 X좌표
         @param {Array} aY 모든 터치 영역의 Y좌표
         @param {Number} nVectorX 이전 touchMove(혹은 touchStart)의 X좌표와의 상대적인 거리.(직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
         @param {Number} nVectorY 이전 touchMove(혹은 touchStart)의 Y좌표와의 상대적인 거리.(직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
         @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
         @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
         @param {Number} nStartX touchStart의 X좌표
         @param {Number} nStartY touchStart의 Y좌표
         @param {Number} nStartTimeStamp touchStart의 timestamp 값
         @param {Number} nScale 멀티터치일경우 계산된 scale값 (싱글터치의 경우 이 프로퍼티가 없다)
         @param {Number} nRotation 멀티터치일경우 계산된 rotation값 (싱글터치의 경우 이 프로퍼티가 없다)
         @param {Object} oEvent jindo.$Event object
         @param {Function} stop stop 이후 커스텀이벤트는 발생하지 않는다.
         @param {Array} aElement touchMove 이벤트 발생시 대상 엘리먼트
         @param {String} sStartMoveType 최초 분석된 움직임 값
         @param {Number} nMomentumX x 좌표의 가속 값
         @param {Number} nMomentumY y 좌표의 가속 값
         @param {Number} nSpeedX x 좌표의 속도값
         @param {Number} nSpeedY y 좌표의 속도값
         @param {Number} nDuration touchstart와 touchEnd사이의 시간값
         @param {Object} htMomentum 최근 이동한 정보를 통해 발생점으로 부터 이전 정보까지로 부터의 momentum 정보
             @param {Number} htMomentum.nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
             @param {Number} htMomentum.nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
             @param {Number} htMomentum.nDuration touchstart와 이동한 좌표 사이의 시간값
             @param {Number} htMomentum.nMomentumX x 좌표의 가속 값
             @param {Number} htMomentum.nMomentumY y 좌표의 가속 값
             @param {Number} htMomentum.nSpeedX X 좌표의 속도값
             @param {Number} htMomentum.nSpeedY y 좌표의 속도값

         @history 1.14.0 Update touchMove, touchEnd Custom Event 내 htMomentum 속성 추가
         **/
        //doubletap 핸들러가  있고, 현재가  tap 인 경우
        if (( typeof this._htEventHandler[jindo.m.Touch.MOVETYPE[5]] != 'undefined' && (this._htEventHandler[jindo.m.Touch.MOVETYPE[5]].length > 0)) && (this.nMoveType == 3)) {
            this._nTapTimer = setTimeout(function() {
                self._fireCustomEvent(sMoveType, htParam);
                self.fireEvent('touchEnd', htParam);
                delete self._nTapTimer;
            }, this.option('nDoubleTapDuration'));
        } else {
            this.fireEvent('touchEnd', htParam);
            if (this.nMoveType != 4) {
                if (this.nMoveType === 8) {
                    htParam.sMoveType = jindo.m.Touch.MOVETYPE[6];
                    this._fireCustomEvent(jindo.m.Touch.MOVETYPE[6], htParam);
                    htParam.sMoveType = jindo.m.Touch.MOVETYPE[7];
                    this._fireCustomEvent(jindo.m.Touch.MOVETYPE[7], htParam);
                } else {
                    setTimeout(function() {
                        self._fireCustomEvent(sMoveType, htParam);
//                        self.fireEvent('touchEnd', htParam);
                    }, 0);
                }
            }
        }

        this._updateTouchEndInfo(htInfo);
        this._resetTouchInfo();
    },

    /**
     * sEvent 명으로 커스텀 이벤트를 발생시킨다
     * @param {String} sEvent
     * @param {HashTable} 커스텀이벤트 파라미터
     * @return {Boolean} fireEvent의 리턴값
     */
    _fireCustomEvent : function(sEvent, htOption) {
        return this.fireEvent(sEvent, htOption);
    },

    /**
     커스텀이벤트를 발생시킬 때 필요한 파라미터를 생성한다.

     @param {Object} 현재 터치 정보들을 담고 있는 해시테이블
     @param {Boolean} touchEnd 시점인지 여부, touchEnd일 경우 가속에 대한 추가 정보를 필요로 한다.
     @return {Object}
     - {HTMLElement} element 현재 이벤트 객체의 대상 엘리먼트
     - {Number} nX x좌표
     - {Number} nY y좌표
     - {Number} nVectorX 이전 x 좌표와의 차이
     - {Number} nVectorY 이전 y 좌표와의 차이
     - {Number} nDistanceX touchstart와의 x 좌표 거리
     - {Number} nDistanceY touchstart와의 y 좌표 거리
     - {String} sMoveType 현재 분석된 움직임의 이름
     - {Number} nStartX touchstart시점의 x 좌표
     - {Number} nStartY touchstart시점의 y 좌표
     - {Number} nStartTimeStamp touchstart시점의 timestamp
     - {Number} nMomentumX x 좌표의 가속 값 (touchEnd일경우에만 발생)
     - {Number} nMomentumY y 좌표의 가속 값 (touchEnd일경우에만 발생)
     - {Number} nSpeedX x 좌표의 속도값 (touchEnd일경우에만 발생)
     - {Number} nSpeedY y 좌표의 속도값 (touchEnd일경우에만 발생)
     - {Number} nDuration touchstart와 touchEnd사이의 시간값
     - {String} sStartMoveType 초기 움직임을 설정한 값
     - {Array} aX 터치지점의 x 좌표
     - {Array} aY 터치지점의 y 좌표
     - {Number} nScale 멀티터치일경우 계산된 scale값
     - {Number} nRotation 멀티터치일경우 계산된 rotate값

     @history 1.14.0 Update touchMove, touchEnd Custom Event 내 htMomentum 속성 추가

     **/
    _getCustomEventParam : function(htTouchInfo, bTouchEnd, we) {
        // console.log("------- > " , htTouchInfo[0].nTime - this._htMoveInfo.nStartTime);
        var htMoveInfoPos = this._htMoveInfo.aPos[(this._htMoveInfo.aPos.length > 0 && !bTouchEnd ? this._htMoveInfo.aPos.length - 1 : 0)];
        var sMoveType = jindo.m.Touch.MOVETYPE[this.nMoveType],
        sStartMoveType = jindo.m.Touch.MOVETYPE[this._nStartMoveType],
        nDuration = htTouchInfo[0].nTime - this._htMoveInfo.nStartTime,
        nMomentumX = 0,
        nMomentumY = 0,
        nSpeedX = 0,
        nSpeedY = 0,
        nMMomentumX = 0,
        nMMomentumY = 0,
        nMSpeedX = 0,
        nMSpeedY = 0,
        nDisX = (this.nMoveType === 1) ? 0 : htTouchInfo[0].nX - this._htMoveInfo.nStartX,
        nDisY = (this.nMoveType === 0) ? 0 : htTouchInfo[0].nY - this._htMoveInfo.nStartY,
        nMomentumDisX = (this.nMoveType === 1) ? 0 : htTouchInfo[0].nX - htMoveInfoPos.nX,
        nMomentumDisY = (this.nMoveType === 0) ? 0 : htTouchInfo[0].nY - htMoveInfoPos.nY,
        nMomentumDuration = htTouchInfo[0].nTime - htMoveInfoPos.nTime,
        htParam = {
            element : htTouchInfo[0].el,
            nX : htTouchInfo[0].nX,
            nY : htTouchInfo[0].nY,
            nVectorX : htTouchInfo[0].nX - this._htMoveInfo.nBeforeX,
            nVectorY : htTouchInfo[0].nY - this._htMoveInfo.nBeforeY,
            nDistanceX : nDisX, //vScroll,
            nDistanceY : nDisY, //hScroll,
            sMoveType : sMoveType,
            sStartMoveType : sStartMoveType,
            nStartX : this._htMoveInfo.nStartX,
            nStartY : this._htMoveInfo.nStartY,
            nStartTimeStamp : this._htMoveInfo.nStartTime,
            htMomentum : {                                  // momentum 개선을 위한 추가.
                // nStartX : htMoveInfoPos.nX,
                // nStartY : htMoveInfoPos.nY,
                nDistanceX : nMomentumDisX, //vScroll,
                nDistanceY : nMomentumDisY, //hScroll,
                nDuration : nMomentumDuration
            },
            oEvent : we || {}
        };

        // 멀티 터치시 처리
        if ((htTouchInfo.length) > 1 || (this.nMoveType >= 6)) {
            htParam.nScale = this._getScale(htTouchInfo);
            htParam.nRotation = this._getRotation(htTouchInfo);
            (htParam.nScale === null) && (htParam.nScale = this._htMoveInfo.nBeforeScale);
            (htParam.nRotation === null) && (htParam.nRotation = this._htMoveInfo.nBeforeRotation);
        }

        if (htTouchInfo.length >= 1) {
            htParam.aX = [];
            htParam.aY = [];
            htParam.aElement = [];
            for (var i = 0, nLen = htTouchInfo.length; i < nLen; i++) {
                htParam.aX.push(htTouchInfo[i].nX);
                htParam.aY.push(htTouchInfo[i].nY);
                htParam.aElement.push(htTouchInfo[i].el);
            }
        }
        //touchend 에는 가속에 대한 계산값을 추가로 더 필요로 한다.
        if (bTouchEnd) {
            // console.log("============" , this.nMoveType);
            //scroll 이벤트만 계산 한다
            if (this.nMoveType == 0 || this.nMoveType == 1 || this.nMoveType == 2) {
                // console.log(nDuration);
                if (nDuration <= this.option('nMomentumDuration')) {
                    // momentum 만들기
                // } else {
                    // if (this._htMoveInfo.aPos.length > 1) {
                        // // this._htMoveInfo.aPos[this._htMoveInfo.aPos.length-1]
                        // // nDuration = htTouchInfo[0].nTime - this._htMoveInfo.nStartTime,
                    // }

                    // this._htMoveInfo.aPos.this._htMoveInfo.aPos.length
                }
                if (nDuration <= this.option('nMomentumDuration')) {
                    nSpeedX = Math.abs(nDisX) / nDuration;
                    nMomentumX = (nSpeedX * nSpeedX) / 2;
                    nSpeedY = Math.abs(nDisY) / nDuration;
                    nMomentumY = (nSpeedY * nSpeedY) / 2;
                }
                if(nMomentumDuration <= this.option('nMomentumDuration')) {
                    nMSpeedX = Math.abs(nMomentumDisX) / nMomentumDuration;
                    nMMomentumX = (nMSpeedX * nMSpeedX) / 2;
                    nMSpeedY = Math.abs(nMomentumDisY) / nMomentumDuration;
                    nMMomentumY = (nMSpeedY * nMSpeedY) / 2;
                }
            }
            htParam.nMomentumX = nMomentumX;
            htParam.nMomentumY = nMomentumY;
            htParam.nSpeedX = nSpeedX;
            htParam.nSpeedY = nSpeedY;
            htParam.nDuration = nDuration;
            htParam.htMomentum.nMomentumX = nMMomentumX;
            htParam.htMomentum.nMomentumY = nMMomentumY;
            htParam.htMomentum.nSpeedX = nMSpeedX;
            htParam.htMomentum.nSpeedY = nMSpeedY;
        }

        return htParam;
    },

    /**
        doubleTap을 판단하기 위해서 마지막 touchend의 정보를 업데이트 한다.
        doubleTap을 분석 할 경우 가장 마지막의 touch에 대한 정보를 비교해야 하기 때문에 이 값을 업데이트 한다.

        @param {Object} touchEnd에서의 좌표 및 엘리먼트 정보 테이블
            - {HTMLElement} touchEnd시점의 엘리먼트
            - {Number} touchEnd timestamp
            - {Number} touchEnd의 x 좌표
            - {Number} touchEnd의 y 좌표
    **/
    _updateTouchEndInfo : function(htInfo){
        this.htEndInfo = {
            element: htInfo[0].el,
            time : htInfo[0].nTime,
            movetype : this.nMoveType,
            nX : htInfo[0].nX,
            nY : htInfo[0].nY
        };
    },

    /**
     longTap 타이머를 삭제한다.
     **/
    _deleteLongTapTimer : function() {
        if(typeof this._nLongTapTimer != 'undefined'){
            clearTimeout(this._nLongTapTimer);
            delete this._nLongTapTimer;
        }
    },

    /**
     longTap 커스텀 핸들러가 존재 할 경우 longTap 타이머를 시작한다.

     @param {Object} longTap에 대한 정보 객체
     @param {Object} event 객체
     **/
    _startLongTapTimer : function(htInfo, oEvent) {
        var self = this;

        //long tap handler 가 있을경우
        if (( typeof this._htEventHandler[jindo.m.Touch.MOVETYPE[4]] != 'undefined') && (this._htEventHandler[jindo.m.Touch.MOVETYPE[4]].length > 0)) {
            self._nLongTapTimer = setTimeout(function() {

                /**
                 사용자의 터치 시작 이후로 일정 기준시간 동안 계속 움직임이 tap으로 분석되면 발생 한다.

                 @event longTap
                 @param {String} sType 커스텀 이벤트명
                 @param {HTMLElement} element 현재 터치된 영역의 Element
                 @param {Number} nX 터치영역의 X좌표
                 @param {Number} nY 터치 영역의 Y좌표
                 @param {Object} oEvent jindo.$Event object
                 @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
                 **/
                self.fireEvent('longTap', {
                    element : htInfo[0].el,
                    oEvent : oEvent,
                    nX : htInfo[0].nX,
                    nY : htInfo[0].nY
                });
                //현재 moveType 세팅
                self.nMoveType = 4;
            }, self.option('nLongTapDuration'));
        }
    },

    /**
     화면 전환시에 스크롤 기준 값을 다시 구한다.
     **/
    _onResize : function() {
        this._setSlope();
    },

    /**
     이전 탭의 정보와 비교하여 현재 동작이 더블탭임을 판단한다
     @param {Number} nX pageX 좌표
     @param {Number} nY pageY 좌표
     @param {Number} nTimeStamp 이벤트 timestamp
     **/
    _isDblTap : function(nX, nY, nTime) {
        if((typeof this._nTapTimer != 'undefined') && this.nMoveType == 3){
            var nGap = this.option('nTapThreshold');
            if ((Math.abs(this.htEndInfo.nX - nX) <= nGap) && (Math.abs(this.htEndInfo.nY - nY) <= nGap)) {
                return true;
            }
        }
        return false;
    },

    /**
     vScroll, hScroll을 판단하는 기준 기울기를 계산한다
     단말기 스크린을 기준으로 계산한다

     hScroll = (세로/2)/가로
     vScroll = 세로/(가로/2)
     **/
    _setSlope : function() {
        if (!this.bSetSlope) {
            this._nHSlope = ((window.innerHeight / 2) / window.innerWidth).toFixed(2) * 1;
            this._nVSlope = (window.innerHeight / (window.innerWidth / 2)).toFixed(2) * 1;
        }
    },

    /**
     vScroll, hScroll을 판단하는 기준 기울기를 설정한다.

     @method setSlope
     @param {Number} nVSlope 수직스크롤 판단 기울기
     @param {Number} nHSlope 수평스크롤 판단 기울기
     @remark
     nVSlope 기울기 보다 클 경우 수직 스크롤로 판단한다.
     nHSlope 기울기 보다 작을 경우 수평 스크롤로 판단한다.
     nVSlope와 nHSlope 사이값인 경우 대각선 스크롤로 판단한다.
     **/
    setSlope : function(nVSlope, nHSlope) {
        this._nHSlope = nHSlope;
        this._nVSlope = nVSlope;

        this.bSetSlope = true;
    },

    /**
     vScroll, hScroll을 판단하는 기준 기울기를 리턴한다

     @method getSlope
     @return {Object} elBody 아코디언 블럭의 body 엘리먼트
     @remark
     - {Number} nVSlope 수직스크롤 판단 기울기
     - {Number} nHSlope 수평스크롤 판단 기울기
     **/
    getSlope : function() {
        return {
            nVSlope : this._nVSlope,
            nHSlope : this._nHSlope
        };
    },

    /**
     터치의 기본정보를 모두 초기화 한다.
     **/
    _resetTouchInfo : function() {
        for (var x in this._htMoveInfo) {
            if (x != "aPos") {
                this._htMoveInfo[x] = 0;
            } else {
                this._htMoveInfo.aPos.length = 0;
            }
        }
        this._deleteLongTapTimer();
        this.nStart = 0;
        this.bMove = false;
        this.nMoveType = -1;
        this._nStartMoveType = -1;
    },

    _updateTouchInfo : function(htInfo, sType) {

        if (sType == "end") {
            this.htEndInfo = {
                nX : htInfo[0].nX,
                nY : htInfo[0].nY
            };
            if (this._htMoveInfo.aPos.length > 3) {
                // this._htMoveInfo.aPos.pop();
                this._htMoveInfo.aPos.pop();
            }
        } else {
            if (sType == "start") {
                this._htMoveInfo.nStartX = htInfo[0].nX;
                this._htMoveInfo.nStartY = htInfo[0].nY;
                this._htMoveInfo.nStartTime = htInfo[0].nTime;
            } else {
                this._htMoveInfo.nBeforeTime = htInfo[0].nTime;
            }

            this._htMoveInfo.nBeforeX = htInfo[0].nX;
            this._htMoveInfo.nBeforeY = htInfo[0].nY;

            this._htMoveInfo.aPos.push({
                nX : htInfo[0].nX,
                nY : htInfo[0].nY,
                nTime : htInfo[0].nTime
            });
            // 5개만 유지하는 queue
            (this._htMoveInfo.aPos.length > 5) && this._htMoveInfo.aPos.shift();

        }
    },

    /**
     현재 x,y 좌표값으로 현재 움직임이 무엇인지 판단한다.
     @param {Number} x
     @param {Number} y
     **/
    _getMoveTypeBySingle : function(x, y) {
        // console.trace();
        var nType = this.nMoveType;

        var nX = Math.abs(this._htMoveInfo.nStartX - x);
        var nY = Math.abs(this._htMoveInfo.nStartY - y);
        // var nX = Math.abs(this._htMoveInfo.aPos[0].nX - x);
        // var nY = Math.abs(this._htMoveInfo.aPos[0].nY - y);
        // console.log(nX, nY)
        var nDis = nX + nY;
        // console.log(nDis);
        //tap정의
        var nGap = this.option('nTapThreshold');
        if ((nX <= nGap) && (nY <= nGap)) {
            nType = 3;
        } else {
            nType = -1;
        }

        if (this.option('nSlopeThreshold') <= nDis) {
//            var nSlope = nY/(nX+nY)*90;
            var nSlope = parseFloat((nY / nX).toFixed(2), 10);

            if ((this._nHSlope === -1) && (this._nVSlope === -1) && this.option("nUseDiagonal") > 0) {
                nType = 2;
            } else {
                if (nSlope <= this._nHSlope) {
//                if (nSlope <= 25) {
                    nType = 0;
                } else if (nSlope >= this._nVSlope) {
//                } else if (nSlope >= 65) {
                    nType = 1;
                } else if (this.option("nUseDiagonal") > 1) {
                    nType = 2;
                } else {
                    nType = 2;
                }
            }
        // } else {
            // 이동 거리가 조건에 만족하지 않을경우 tab 으로 처리
            // nType = 3;
        }
        return nType;
    },
    /**

     **/
    _getMoveTypeByMulti : function(aPos) {
        var nType = -1;

        //console.log('scale : '+this._htMoveInfo.nBeforeScale);
        if ((this.nMoveType === 6) || Math.abs(1 - this._htMoveInfo.nBeforeScale) >= this.option('nPinchThreshold')) {
            nType = 6;
        }

        if ((this.nMoveType === 7) || Math.abs(0 - this._htMoveInfo.nBeforeRotation) >= this.option('nRotateThreshold')) {
            if (nType === 6) {
                nType = 8;
            } else {
                nType = 7;
            }
        }

        //멀티터치이면서 rotate도 아니고 pinch도 아닐경우
        if (nType === -1) {
            return this.nMoveType;
            //nType = this._getMoveTypeBySingle(aPos[0].nX, aPos[0].nY);
        }

        return nType;
    },

    /**

     **/
    _getScale : function(aPos) {
        var nScale = -1;

        var nDistance = this._getDistance(aPos);
        if (nDistance <= 0) {
            return null;
        }

        if (this._htMoveInfo.nStartDistance === 0) {
            nScale = 1;
            this._htMoveInfo.nStartDistance = nDistance;
        } else {
            nScale = nDistance / this._htMoveInfo.nStartDistance;
            //this._htMoveInfo.nBeforeDistance = nDistance;
        }

        this._htMoveInfo.nBeforeScale = nScale;

        return nScale;
    },

    _getRotation : function(aPos) {
        var nRotation = -1;

        var nAngle = this._getAngle(aPos);

        if (nAngle === null) {
            return null;
        }

        if (this._htMoveInfo.nStartAngle === 0) {
            this._htMoveInfo.nStartAngle = nAngle;
            nRotation = 0;
        } else {
            nRotation = nAngle - this._htMoveInfo.nStartAngle;
        }

        this._htMoveInfo.nLastAngle = nAngle;
        this._htMoveInfo.nBeforeRotation = nRotation;

        //console.log('rotate - ' + nRotation);
        return nRotation;
    },

    /**
     현재 x,y 좌표값으로 현재 움직임이 무엇인지 판단한다.
     @param {Number} x
     @param {Number} y
     **/
    _getMoveType : function(aPos) {
        var nType = this.nMoveType;

        if (aPos.length === 1) {
            nType = this._getMoveTypeBySingle(aPos[0].nX, aPos[0].nY);
        } else if (aPos.length === 2) {//pinch or rotate
            nType = this._getMoveTypeByMulti(aPos);
            //nType = 6;
        }

        return nType;
    },

    _getDistance : function(aPos) {
        if (aPos.length === 1) {
            return -1;
        }
        return Math.sqrt(Math.pow(Math.abs(aPos[0].nX - aPos[1].nX), 2) + Math.pow(Math.abs(aPos[0].nY - aPos[1].nY), 2));
    },

    _getAngle : function(aPos) {
        if (aPos.length === 1) {
            return null;
        }
        var deltaX = aPos[0].nX - aPos[1].nX, deltaY = aPos[0].nY - aPos[1].nY;

        var nAngle = Math.atan2(deltaY, deltaX) * this._radianToDegree;

        if (this._htMoveInfo.nLastAngle !== null) {
            var nDiff = Math.abs(this._htMoveInfo.nLastAngle - nAngle);
            var nNext = nAngle + 360;
            var nPrev = nAngle - 360;

            if (Math.abs(nNext - this._htMoveInfo.nLastAngle) < nDiff) {
                nAngle = nNext;
            } else if (Math.abs(nPrev - this._htMoveInfo.nLastAngle) < nDiff) {
                nAngle = nPrev;
            }
        }
        //console.log('angle : '+ nAngle);
        return nAngle;
    },

    /**
     touch 이벤트에서 필요한 좌표값과 엘리먼트, timestamp를 구한다
     @param {$Event} jindo.$Event
     @return {Array}
     **/
     _getTouchInfo : function(oEvent){
        var aReturn = [];
        var nTime = oEvent.$value().timeStamp;
        var oTouch = null;

        if(this._hasTouchEvent){
//             if(oEvent.type === 'touchend' || oEvent.type === 'touchcancel'){
//                oTouch = oEvent.$value().changedTouches;
//            }else{
//                oTouch = oEvent.$value().targetTouches || oEvent.$value().changedTouches;
//            }

            /**
             * touches: a list of all fingers currently on the screen.
             * targetTouches: a list of fingers on the current DOM element.
             * changedTouches: a list of fingers involved in the current event. For example, in a touchend event, this will be the finger that was removed.
             *
             * 참조아티클 : http://www.html5rocks.com/en/mobile/touch/
             **/
            oTouch = oEvent.$value().touches;
            oTouch = oTouch.length > 1 ? oTouch : oEvent.$value().changedTouches;
            for(var i=0, nLen = oTouch.length; i<nLen; i++){
                aReturn.push({
                    el : jindo.m.getNodeElement(oTouch[i].target),
                    nX : oTouch[i].pageX,
                    nY : oTouch[i].pageY,
                    nTime : nTime
                });
            }

        }else{
            aReturn.push({
                el : oEvent.element,
                nX : oEvent.pos().pageX,
                nY : oEvent.pos().pageY,
                nTime : nTime
            });
        }

        return aReturn;
    },

    /**
     기준엘리먼트를 el을 리턴한다.

     @method getBaseElement
     @return {HTMLElement} el 기준 엘리먼트
     **/
    getBaseElement : function(el) {
        return this._el;
    },

    /**
     jindo.m.Touch 컴포넌트를 비활성화한다.
     deactivate 실행시 호출됨
     **/
    _onDeactivate : function() {
        this._detachEvents();
    },

    /**
     jindo.m.Touch 컴포넌트를 활성화한다.
     activate 실행시 호출됨
     **/
    _onActivate : function() {
        this._attachEvents();
    },

    /**
     jindo.m.Touch 에서 사용하는 모든 객체를 release 시킨다.
     @method destroy
     **/
    destroy : function() {
        var p;
        this.deactivate();

        this._el = null;

        for (p in this._htMoveInfo) {
            this._htMoveInfo[p] = null;
        }
        this._htMoveInfo = null;

        for (p in this.htEndInfo) {
            this.htEndInfo[p] = null;
        }
        this.htEndInfo = null;

        this.nStart = 0;
        this.bMove = null;
        this.nMoveType = null;
        this._nStartMoveType = null;
        this._nVSlope = null;
        this._nHSlope = null;
        this.bSetSlope = null;
    }
    /**
     사용자의 터치가 끝난 이후에 움직임이 tap으로 분석되었을 경우 발생한다.(touchEnd이후에 발생)
     @remark 만약 doubleTap의 커스텀 이벤트 핸들러가 있는 경우 doubleTap에 대한 분석을 위해 touchEnd 이후에 기준 시간 이후에 tap이 발생한다

     @event tap
     @param {String} sType 커스텀 이벤트명
     @param {String} sMoveType 현재 분석된 움직임
     @param {String} sMoveType.hScroll 가로스크롤 (jindo.m.Touch.MOVETYPE[0])
     @param {String} sMoveType.vScroll 세로스크롤 (jindo.m.Touch.MOVETYPE[1])
     @param {String} sMoveType.dScroll 대각선스크롤 (jindo.m.Touch.MOVETYPE[2])
     @param {String} sMoveType.tap 탭 (jindo.m.Touch.MOVETYPE[3])
     @param {String} sMoveType.longTap 롱탭 (jindo.m.Touch.MOVETYPE[4])
     @param {String} sMoveType.doubleTap 더블탭 (jindo.m.Touch.MOVETYPE[5])
     @param {String} sMoveType.pinch 핀치 (jindo.m.Touch.MOVETYPE[6])
     @param {String} sMoveType.rotate 회전 (jindo.m.Touch.MOVETYPE[7])
     @param {String} sMoveType.pinch-rotate 핀치와 회전 (jindo.m.Touch.MOVETYPE[8])
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리(직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리(직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
     **/

    /**
     tap과 tap사이의 발생간격이 기준 시간 이하일경우 발생한다.

     @event doubleTap
     @param {String} sType 커스텀 이벤트명
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 터치영역의 X좌표
     @param {Number} nY 터치 영역의 Y좌표
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
     **/

    /**
     사용자의 터치가 끝난 이후에 움직임이 수평 스크롤으로 분석되었을 경우 발생한다.
     @remark touchEnd이후에 발생.분석 기준의 픽셀 이하로 움직였을 경우에는 분석되지 않아서 커스텀 이벤트 발생하지 않는다.

     @event hScroll
     @param {String} sType 커스텀 이벤트명
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Array} aX 모든 터치 영역의 X좌표
     @param {Array} aY 모든 터치 영역의 Y좌표
     @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리 (직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리 (직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nSpeedX 가속 발생 구간일 경우 현재 터치움직임의 수평방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nSpeedY 가속 발생 구간일 경우 현재 터치움직임의 수직방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nStartX touchStart의 X좌표
     @param {Number} nStartY touchStart의 Y좌표
     @param {Number} nStartTimeStamp touchStart의 timestamp 값
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
     **/

    /**
     사용자의 터치가 끝난 이후에 움직임이 수직 스크롤으로 분석되었을 경우 발생한다.
     @remark touchEnd이후에 발생.분석 기준의 픽셀 이하로 움직였을 경우에는 분석되지 않아서 커스텀 이벤트 발생하지 않는다.

     @event vScroll
     @param {String} sType 커스텀 이벤트명
     @param {Number} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Array} aX 모든 터치 영역의 X좌표
     @param {Array} aY 모든 터치 영역의 Y좌표
     @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리 (직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리 (직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nSpeedX 가속 발생 구간일 경우 현재 터치움직임의 수평방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nSpeedY 가속 발생 구간일 경우 현재 터치움직임의 수직방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nStartX touchStart의 X좌표
     @param {Number} nStartY touchStart의 Y좌표
     @param {Number} nStartTimeStamp touchStart의 timestamp 값
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
     **/

    /**
     사용자의 터치가 끝난 이후에 움직임이 대각선 스크롤으로 분석되었을 경우 발생.
     @remark touchEnd이후에 발생.분석 기준의 픽셀 이하로 움직였을 경우에는 분석되지 않아서 커스텀 이벤트 발생하지 않는다

     @event dScroll
     @param {String} sType 커스텀 이벤트명
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Array} aX 모든 터치 영역의 X좌표
     @param {Array} aY 모든 터치 영역의 Y좌표
     @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리 (직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리 (직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
     @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
     @param {Number} nSpeedX 가속 발생 구간일 경우 현재 터치움직임의 수평방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nSpeedY 가속 발생 구간일 경우 현재 터치움직임의 수직방향 속도, 가속 구간이 아닐경우 0
     @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
     @param {Number} nStartX touchStart의 X좌표
     @param {Number} nStartY touchStart의 Y좌표
     @param {Number} nStartTimeStamp touchStart의 timestamp 값
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것은 없다.
     **/

    /**
     사용자의 터치가 끝난 이후에 움직임이 pinch로 분석되었을 경우 발생.
     @remark touchEnd이후에 발생.분석 기준의 scale값 이하일 경우 분석되지 않아서 커스텀 이벤트 발생하지 않는다

     @event pinch
     @param {String} sType 커스텀 이벤트명
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Array} aX 모든 터치 영역의 X좌표
     @param {Array} aY 모든 터치 영역의 Y좌표
     @param {Number} nScale 멀티터치일경우 계산된 scale값
     @param {Number} nRotation 멀티터치일경우 계산된 rotation값 (pinch이면서 rotate일 경우 이 값도 존재한다)
     @param {Number} nStartTimeStamp touchStart의 timestamp 값
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것은 없다.

     @history 1.2.0 Update aX, aY 속성 추가
     **/

    /**
     사용자의 터치가 끝난 이후에 움직임이 rotate로 분석되었을 경우 발생.
     @remark touchEnd이후에 발생.분석 기준의 rotate값 이하일 경우 분석되지 않아서 커스텀 이벤트 발생하지 않는다.

     @event rotate
     @param {String} sType 커스텀 이벤트명
     @param {HTMLElement} element 현재 터치된 영역의 Element
     @param {Number} nX 현재 터치영역의 X좌표
     @param {Number} nY 현재 터치 영역의 Y좌표
     @param {Array} aX 모든 터치 영역의 X좌표
     @param {Array} aY 모든 터치 영역의 Y좌표
     @param {Number} nRotation 멀티터치일경우 계산된 rotation값
     @param {Number} nScale 멀티터치일경우 계산된 scale값 (pinch이면서 rotate일 경우 이 값도 존재한다)
     @param {Number} nStartTimeStamp touchStart의 timestamp 값
     @param {Object} oEvent jindo.$Event object
     @param {Function} stop stop를 호출하여 영향 받는 것은 없다.

     @history 1.2.0 Update aX, aY 속성 추가

     **/

}).extend(jindo.m.UIComponent);
/**
	@fileOverview 페이지의 고정영역 내부를 터치하여 스크롤링 할 수 있는 컴포넌트
	@author sculove
	@version 1.17.0
	@since 2011. 8. 18.
*/
/**
	페이지의 고정영역 내부를 터치하여 스크롤링 할 수 있는 컴포넌트

	@class jindo.m.Scroll
	@extends jindo.m.UIComponent
	@uses jindo.m.Touch, jindo.m.Effect
	@keyword scroll, 스크롤
	@group Component
	@Update

    @history 1.16.0 Bug scrollTo 함수 호출 시 beforePosition / position 이벤트가 중복 발생 하던것을 한번만 발생하도록 수정
    @history 1.16.0 Bug scrollTo 함수 호출시 현재 위치와 동일한 위치로 정의시 beforePosition/position 이벤트가 발생하지 않도록 변경
    @history 1.16.0 Bug 갤럭시S3 에서 scrollbar 가 사라지지 않는 문제 수정
	@history 1.16.0 Bug 동일 엘리먼트에 인스턴스를 계속 생성할 경우, 계속 scrollbar가 생성되는 문제 수정
	@history 1.16.0 Support jindo 2.10.0 이후 변경된 offset 수정건에 대한 대응
	@history 1.15.0 Update 터치와 애니메이션 관련 이벤트에 nMaxScrollLeft, nMaxScrollTop 속성 추가
	@history 1.15.0 Bug beforePosition, position 이벤트 속성 미노출 문제 수정
	@history 1.15.0 Bug refresh 이후, 스크롤 바가 계속 보이는 문제 수정
	@history 1.15.0 Bug 회전시, view size보다 scroller size가 작아서 스크롤이 안되는 경우 위치오류 수정
	@history 1.15.0 Bug iOS 7.0이상시 클릭 안되는 버그 수정
	@history 1.14.0 Update fEffect 추가
	@history 1.14.0 Update bUseTranslate 옵션 제거
	@history 1.14.0 Update Kitkat 하이라이트 이슈 수정
	@history 1.14.0 Update beforePosition nNextLeft, nNextTop, nVectorX, nVectorY 속성 추가
	@history 1.14.0 Update rotate 이벤트 추가
	@history 1.13.0 Support Firefox 브라우저 지원
	@history 1.11.0 Bug view와 scroller의 크기가 같고, 스크롤바를 사용할 경우, 스크립트 오류 수정
	@history 1.11.0 Bug beforePosition 이벤트에서 stop 을 해도 updater 가 계속 동작되는 오류 수정
	@history 1.10.0 Bug 대용량 플러그인 사용시, bUseTimingFunction=true일 경우, 스크롤의 모멘텀이 되지 않는 오류 수정
	@history 1.10.0 Bug bUseTimingFunction=true일 경우, scrollTo로 이동시 스크롤바가 움직이지 않는 버그 수정
	@history 1.10.0 Bug bUseTimingFunction=true일 경우, 스크롤이 멈추었을 때 움찔거리는 문제 제거
	@history 1.10.0 Bug 스크롤이 멈추었을 때 스크롤바가 노출되는 문제 수정
	@history 1.10.0 Bug iOS에서 스크롤 이후 선택이 안되는 문제 해결
	@history 1.9.0 Bug beforeTouchMove 의 발생 시점을 실제 touchMove가 발생했을 시점으로 변경
	@history 1.9.0 Bug Window8 IE10 플리킹 적용시 스크롤이 안되는 이슈 처리
	@history 1.9.0 Update Scroll 성능 개선
	@history 1.7.0 Bug bUseHighlight=fasle일 경우, 안드로이드 4.x 갤럭시 시리즈에서 하이라이트 사라지지 않는 문제 제거
	@history 1.7.0 Update base엘리먼트에 z-index = 2000으로 설정 (Css3d사용시 충돌하는 버그 수정)
	@history 1.7.0 Update 불필요 노출 메소드 deprecated<br/>
	getPosLeft, getPostTop, getStyleOffset, makeStylePos, restorPos, setLayer, setScroller
	@history 1.6.0 스크롤 컴포넌트 플러그인 구조로 구조개선
	@history 1.5.0 Bug jindo 1.5.3 이하 버전에서 대용량 스크롤시 스크롤바가 보이지 않는 문제 수정
	@history 1.5.0 Support Window Phone8 지원
	@history 1.5.0 Update  touchStart, touchMove , touchEnd 이벤트에서 중지할 경우 뒤 이벤트 안타도록 수정
	@history 1.4.0 Support iOS 6 지원
	@history 1.4.0 Update {bUseBounce} bUseBounce : false일 경우, 스크롤을 더이상 할수 없을 때 시스템 스크롤이 발생하는 기능 추가
	@history 1.4.0 Bug 가로 스크롤일경우, 터치 위치의 y가 30보다 작을경우 스크롤이 안되는 버그 수정
	@history 1.3.5 Bug 스크롤바 이동시, bUseTranslate, bUseTimingFunction 옵션 적용되도록 수정
	@history 1.3.5 Update 스크롤바 fade in-out 효과 제거<br />스크롤바 border-radius, opacity 효과 제거
	@history 1.3.0 Support Android 젤리빈(4.1) 대응
	@history 1.3.0 Support 갤럭시 4.0.4 업데이트 지원
	@history 1.3.0 Update Wrapper의 position이 static 일 경우, relative로 변경<br/>그외는 position이 변경되지 않도록 수정
	@history 1.3.0 Update Wrapper와 scroller가 동일하고 bUseBounce가 true인 경우, 스크롤바가 안보이고, 스크롤이 가능하도록 변경
	@history 1.3.0 Bug Scroll과 Flicking 함께 사용할때 A link가 클릭안되는 문제 수정
	@history 1.2.0 Update pullDown/pullUp 상태가 아닌 경우, pullDown/pullUp 엘리먼트를 hide시키는 UI 변경
	@history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
	@history 1.1.0 Bug destroy() 호출시 Scroll객체 destroy 호출 안되는 문제 해결<br />
					중복 scroll 사용시, scroll이 정상 동작하지 않는 문제 해결<br />
					뒤로가기시 스크롤의 속성값이 초기화 되지않는 문제 해결
	@history 1.1.0 Support jindo 2.0.0 mobile 버전 지원
	@history 1.1.0 Support Android 3.0/4.0 지원
	@history 1.1.0 Update 따로 클래스명을 정의하지 않아도 wrapper내의 첫번째 엘리먼트를 무조건 Scroller 엘리먼트로 처리하도록 수정
	@history 1.1.0 Update document 선택시 wrapper이 visible이 true일 경우에만 작동하도록 수정
	@history 1.1.0 Update 스크롤 여부에 따른 마크업 지정 편의 개선 (가로스크롤은 scroller의 높이값 100% 설정, 세로스크롤 경우 scroller의 넓이값 100% 설정)
	@history 0.9.5 Bug iOS에서 클릭영역 누른 상태에서, 이동후 버튼을 놓았을시, 초기에 선택한 위치에 clickable 엘리먼트가 존재할 경우, click 되는 문제 해결
	@history 0.9.5 Update [bUseBounce] false인 경우, 이동,가속시 외부영역으로 이동되지 않도록 수정

	@history 0.9.0 Release 최초 릴리즈
**/
jindo.m.Scroll = jindo.$Class({
	/* @lends jindo.m.Scroll.prototype */
	   /**
		초기화 함수

		@constructor
		@param {String|HTMLElement} el CoreScroll할 Element (필수)
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Number} [htOption.nHeight=0] Wrapper의 height값. 값이 0일 경우 wrapper의 height로 설정됨
			@param {Number} [htOption.nWidth=0] Wrapper의 width값. 값이 0일 경우 wrapper의 width로 설정됨
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
			@param {Boolean} [htOption.bUseHScroll=false] 수평 스크롤 사용 여부. 스크롤영역의 width가 wrapper의 width보다 클 경우 적용 가능함.
			@param {Boolean} [htOption.bUseVScroll=true] 수직 스크롤 사용 여부. 스크롤영역의 height가 wrapper의 height보다 클 경우 적용 가능함.
			@param {Boolean} [htOption.bUseMomentum=true] 스크롤시 가속도 사용여부
			@param {Number} [htOption.nDeceleration=0.0006] 가속도의 감속계수. 이 값이 클수록, 가속도는 감소한다
			@param {Number} [htOption.nOffsetTop=0] Scroll 컴포넌트에 적용할 상단 여백
			@param {Number} [htOption.nOffsetBottom=0] Scroll 컴포넌트에 적용할 하단 여백
			@param {Boolean} [htOption.bUseBounce=true] 가속 이동후, 바운스 처리되는 여부
			@param {Boolean} [htOption.bUseHighlight=true] 하이라이트 사용 여부
			@param {String} [htOption.sClassPrefix='scroll_'] CoreScroll 내부 엘리먼트 구분 클래스 prefix
			@param {Boolean} [htOption.bAutoResize=false] 기기 회전시, 크기 자동 재갱신
			@param {Boolean} [htOption.bUseCss3d=jindo.m._isUseCss3d()] 하드웨어 3d 가속 여부<br />
				모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
			@param {Boolean} [htOption.bUseTimingFunction=jindo.m._isUseTimingFunction()] 스크롤 애니메이션 동작방식을 결정한다.<br />
				bUseTimingFunction가 true일 경우, CSS3로 애니메이션을 구현하고, false일 경우, 스크립트로 애니메이션을 구현한다.<br />
				모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.<br />
			@param {Boolean} [htOption.bUseTranslate=true] 컨텐츠의 좌표이동 방법을 결정한다.<br />
				bUseTranslate가 true일 경우, CSS3의 Translate으로 이동하고, false일 경우, style의 left,top으로 이동한다.
			@param {Boolean} [htOption.bUseScrollbar=true] 스크롤바 사용 여부
			@param {Boolean} [htOption.bUseFixedScrollbar=false] 고정 스크롤바 적용 여부
			@param {String} [htOption.sScrollbarBorder="1px solid white"] 스크롤바 보더 스타일을 지정
			@param {String} [htOption.sScrollbarColor="#8e8e8e"] 스크롤바의 색상을 지정
			@param {Number} [htOption.nScrollbarHideThreshold=0] 스크롤 바를 hide 시킬때 딜레이 타임
			@param {Boolean} [htOption.bUseScrollBarRadius=true] 스크롤 바의 radius 설정 여부

			@param {String} [htOption.bUsePullDown=false] pull down update 기능 사용 여부
			@param {Boolean} [htOption.bUsePullUp=false] pull up update 기능 사용 여부
			@param {Number} [htOption.fnPullDownIdle=null] bUsePullDown 가 true일 시, pullDown 미발생 시 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullDown의 jindo.$Element가 넘어져 온다.
			@param {Number} [htOption.fnPullDownBeforeUpdate=null] bUsePullDown 가 true일 시, pullDown 발생 전 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullDown의 jindo.$Element가 넘어져 온다.
			@param {Number} [htOption.fnPullDownUpdating=null] bUsePullDown 가 true일 시, pullDown 발생 시 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullDown의 jindo.$Element가 넘어져 온다.
			@param {Number} [htOption.fnPullUpIdle=null] bUsePullUp이 true일 시, pullUp 미발생 시 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullUp의 jindo.$Element가 넘어져 온다.
			@param {Number} [htOption.fnPullUpBeforeUpdate=null] bUsePullUp이 true일 시, pullUp 발생 전 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullUp의 jindo.$Element가 넘어져 온다.
			@param {Number} [htOption.fnPullUpUpdating=null] bUsePullUp이 true일 시, pullUp 발생 시 엘리먼트를 구성하는 함수.<br />
				첫번째 파라미터로 pullUp의 jindo.$Element가 넘어져 온다.

			@param {String} [htOption.sListElement=''] sListElement는 리스트의 구성요소가 되는 엘리먼트 명이다.<br />
				sListElement 옵션값을 지정한 상태에서 스크롤이 일어날 경우, 이동 경로 방향으로 고정 범위의 scroller 영역만을 동적으로 유지한다.<br />
				여기서 ‘고정범위’는 ‘화면에 보이는 View영역의 높이 X nRatio’ 옵션 값이다.<br />
				이 옵션이 적용될 경우, bUseCss3d와 bUseTimingFunction은 false값을 가진다.<br />
			@param {Number} [htOption.nRatio=1.5] sListElement가 설정되었을때, 유지하는 고정범위 비이다.
			@param {Boolean} [htOption.bUseDiagonalTouch=true] 대각선스크롤 방향의 터치도 스크롤로 사용할지 여부
			@param {Number} [htOption.nZIndex=2000] 컴포넌트 base엘리먼트 z-Index 값
		@history 1.8.0 Update [nZIndex] 옵션 추가
		@history 1.6.0 Update [bUseDiagonalTouch] Option 추가
		@history 1.5.0 Update [bUseScrollBarRadius] Option 추가
		@history 1.5.0 Update [nScrollbarHideThreshold] Option 추가
		@history 1.3.5 Update [sScrollbarBorder] Option 기본값 수정 ("1px solid rgba(255,255,255,0.9)" → "1px solid white")
		@history 1.3.5 Update [sScrollbarColor] Option 기본값 수정 ("rgba(0,0,0,0.5)" → "#8e8e8e")
		@history 1.3.0 Update [sListElement] Option 추가
		@history 1.3.0 Update [nRatio] Option 추가
		@history 1.3.0 Update [bUseTimingFunction] Option 추가
		@history 1.3.0 Update [bUseTranslate] Option 추가
		@history 1.3.0 Update [sScrollbarBorder] Option 추가
		@history 1.3.0 Update [sScrollbarColor] Option 추가
		@history 1.3.0 Update [bUseCss3d] Option 기본값 변경. 모바일 단말기에 맞게 3d 사용여부를 설정함
		@history 1.3.0 Update [bUseMomentum] Option 기본값 변경. iOS는 true, Android는 false → 모두 true
		@history 1.2.0 Update [nOffsetTop] Option 추가
		@history 1.2.0 Update [nOffsetBottom] Option 추가
		@history 1.2.0 Update [bUseTransition → bUseCss3d] Option Name 수정
		@history 1.1.0 Update [bUseTransition] Option 기본값 수정<br>iOS, 갤럭시 S2 : true, 그외 : false
		@history 1.1.0 Update [bUseHighlight] Option 추가
		@history 0.9.5 Update [bUseFixedScrollbar] Option 추가
		@history 0.9.5 Update [sClassPrefix] Option 추가
		@history 0.9.5 Update [bUseTransition] Option 추가
		@history 0.9.5 Update [sPrefix → sClassPrefix] Option명 수정
		@history 0.9.5 Update [bUseFocus] Option명 삭제
		@history 0.9.5 Update [sPullDownId] Option명 삭제
		@history 0.9.5 Update [sPullUpId] Option명 삭제

	**/
	$init : function(el,htUserOption) {
		this.option({
			bActivateOnload : true,
			bUseHScroll : false,
			bUseVScroll : true,
			bUseMomentum : true,
			nDeceleration : 0.0006,
			nOffsetTop : 0,
			nOffsetBottom : 0,
			nHeight : 0,
			nWidth : 0,
			bUseBounce : true,
			bUseHighlight : true,
			sClassPrefix : 'scroll_',
			bUseCss3d : jindo.m.useCss3d(true),
			bUseTimingFunction : jindo.m.useTimingFunction(true),
			// bUseTranslate : true,
			bAutoResize : false,
			bUseDiagonalTouch : true,
			fEffect : jindo.m.Effect.cubicBezier(0.18, 0.35, 0.56, 1),
			nZIndex : 2000,

			/* 대용량 옵션 */
			sListElement : '',
			nRatio : 1.5,

			/* 스크롤바 옵션 */
			bUseScrollbar : true,
			nScrollbarHideThreshold : 0,
			bUseFixedScrollbar : false,
			sScrollbarBorder : "1px solid white",
			sScrollbarColor : "#8e8e8e",
			bUseScrollBarRadius : true,

			/* PullDown/PullUp 옵션 */
			bUsePullDown : false,
			bUsePullUp : false,
			fnPullDownIdle : null,
			fnPullDownBeforeUpdate : null,
			fnPullDownUpdating : null,
			fnPullUpIdle : null,
			fnPullUpBeforeUpdate : null,
			fnPullUpUpdating : null
		});
		this.option(htUserOption || {});
		this._initVar();
		this._setWrapperElement(el);

		// if(this instanceof jindo.m.Scroll) {
		if(this.option("bActivateOnload")) {
			this.activate();
		}
		// }
		// console.log("bUseHighlight : " + this.option("bUseHighlight") + ", bUseCss3d:" + this._bUseCss3d + ", bUseTimingFunction : " + this.option("bUseTimingFunction") + ", bUseTranslate : " + this.option("bUseTranslate"));
	},

	$static: {
		SCROLLBAR_CLASS : "__scroll_for_scrollbar__"
	},

	/**
		jindo.m.Scroll 에서 사용하는 모든 인스턴스 변수를 초기화한다.
	**/
	_initVar: function() {
		this.isPositionBug = jindo.m.hasOffsetBug();
		this.isClickBug = jindo.m.hasClickBug();
		this.nVersion = parseFloat(jindo.m.getDeviceInfo().version.substr(0,3));
		this.sCssPrefix = jindo.m.getCssPrefix();
		this._bUseCss3d = this.option("bUseCss3d");
		this.nWrapperW = null;
		this.nWrapperH = null;
		this.nScrollW = null;
		this.nScrollH = null;
		this.nMaxScrollLeft = null;
		this.nMaxScrollTop = null;
		this.nMinScrollTop = 0;
		this.bUseHScroll = null;
		this.bUseVScroll = null;
		this.bUseHighlight = this.option("bUseHighlight");
		this._nPropHScroll = null;
		this._nPropVScroll = null;

		this._nLeft = 0;
		this._nTop = 0;
		this._aAni = [];

		this._htTimer = {
			"ani" : -1,
			"fixed" : -1,
			"touch" : -1,
			"scrollbar" : -1
		};
		this._htPlugin = {
			"dynamic" : {},
			"pull" : {}
		};

		this._oTouch = null;
		this._isAnimating = false;      // 순수 animate 처리
		this._isControling = false;     // 사용자가 움직이고 있는가?
		this._isStop = false;
		this._hasJindoOffsetBug = jindo.m._hasJindoOffsetBug();

		// DynamicScroll을 사용한다고 할경우, bUseTimingFunction는 항상 false
		if(this.option("sListElement")) {
			this.option("bUseTimingFunction", false);
		}
		// this._setTrans();

		/**
		 *  하이라이트 기능을 사용할 경우에만 적용됨.
		 *  android 경우, css,offset, translate에 의해 이동된 영역의 하이라이트 및 영역이 갱신되지 않는 문제
		 * translate의 위치를 초기화하고 css, offset에 맞게 위치를 변경해준다. 또한 대상 영역하위의 a tag에 focus를 준다.
		 */
		if(this.bUseHighlight) {
			// 크롬에서 하이라이트가 남는 문제를 위해 엘리먼트를 저장
			this._hasKitkatHighlightBug = jindo.m._hasKitkatHighlightBug();
			this._nHightlightBug = -1;

			if(this.isPositionBug) {
				this._elDummyTag = null;    //for focus
			}
		}

		this._nUpdater = -1;
		this._oMoveData = {
			nLeft : 0,
			nTop : 0
		};
	},

	/**
		현재 포지션을 반환함.

		@method getCurrentPos
		@return {Object} nTop, nLeft의 값을 반환한다.
		@history 1.1.0 Update Method 추가
	**/
	getCurrentPos : function() {
		return {
			nTop : this._nTop,
			nLeft : this._nLeft
		};
	},

	/**
		wrapper 엘리먼트와 scroller 엘리먼트를 설정한다.
		@deprecated
		@method setLayer
		@param {Varient} el 엘리먼트를 가리키는 문자열이나, HTML엘리먼트
	**/
	setLayer : function(el) {
		this._htWElement["wrapper"] = jindo.$Element(el);
		// zIndex 2000 값 추가
		this._htWElement["wrapper"].css({
			"overflow" : "hidden",
			"zIndex" : this.option("nZIndex")
		});
		if(this._htWElement["wrapper"].css("position") == "static") {
			this._htWElement["wrapper"].css("position", "relative");
		}
		if(!this.bUseHighlight) {
			this._htWElement["wrapper"].css(jindo.m._toPrefixStr("TapHighlightColor"),"rgba(0,0,0,0)");
			// firefox에서는 사용이 안됨
		}
		this.setScroller();
	},

	/**
		스크롤러관련 엘리먼트를 설정함
		@deprecated
		@method setScroller
	**/
	setScroller : function() {
		this._htWElement["scroller"] = this._htWElement["wrapper"].first();
		/**
		 * Transform : translate이 초기에 적용될 경우,
		 * ios계열에서 깜빡거리거나, 이벤트 행이 걸리는 문제가 발생함
		 * hide시킨후, 적용을 하면 이러한 현상이 완화됨.
		 *
		 * 따라서, hide -> Transfom : translate 적용 -> show
		 */
		this._htWElement["scroller"].css({
				"position" : "absolute",
				"zIndex" : 1,
				"left" : 0,
				"top" : 0
				// "pointerEvents" : "none"
		});
		// if(this.option("bUseTranslate") || this._bUseCss3d) {
		this._htWElement["scroller"].css(jindo.m._toPrefixStr("TransitionProperty"),
		 this.sCssPrefix == "" ? "transform" : "-" + this.sCssPrefix + "-transform")
			.css(this.sCssPrefix + "Transform", jindo.m._getTranslate(0,0, this._bUseCss3d));
		// }
		if(this.option("bUseTimingFunction")) {
			this._htWElement["scroller"].css(jindo.m._toPrefixStr("TransitionTimingFunction"), this.option("fEffect").toString());
			// this._htWElement["scroller"].css(jindo.m._toPrefixStr("TransitionTimingFunction"), "cubic-bezier(0.33,0.66,0.66,1)");
		}
		// 안드로이드 버그 수정 (android 2.x 이하 버젼)
		if(this.isPositionBug && this.bUseHighlight && this.nVersion < 3) {
			this._elDummyTag = this._htWElement["scroller"].query("._scroller_dummy_atag_");
			if(!this._elDummyTag) {
				this._elDummyTag = jindo.$("<a href='javascript:void(0);' style='position:absolute;height:0px;width:0px;' class='_scroller_dummy_atag_'></a>");
				this._htWElement["scroller"].append(this._elDummyTag);
			} else{
				this._elDummyTag = this._elDummyTag.$value();
			}
		}
	},

	/**
		width값을 설정하거나, 반환한다.

		@method width
		@param {Number} nValue 넓이 설정 값
	**/
	width : function(nValue) {
		if(nValue) {
			this.option("nWidth", nValue);
			this.refresh();
		} else {
			if(this.option("nWidth")) {
				return parseInt(this.option("nWidth"),10);
			} else {
				return this._htWElement["wrapper"].width();
			}
		}
	},

	/**
		height값을 설정하거나, 반환한다.

		@method height
		@param {Number} nValue 높이 설정 값
	**/
	height : function(nValue) {
		if(nValue) {
			this.option("nHeight", nValue);
			this.refresh();
		} else {
			if(this.option("nHeight")) {
				return parseInt(this.option("nHeight"),10);
			} else {
				return this._htWElement["wrapper"].height();
			}
		}
	},

	/**
		jindo.m.Scroll 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
		@param {Varient} el 엘리먼트를 가리키는 문자열이나, HTML엘리먼트
	**/
	_setWrapperElement: function(el) {
		this._htWElement = {};
		this.setLayer(el);
	},

	/**
		수평 스크롤 여부를 반환한다.
		@method hasHScroll
		@return {Boolean} 스크롤가능 여부를 반환한다.
		@history 1.2.0 Update Method 추가
	**/
	hasHScroll : function() {
		return this.bUseHScroll;
	},

	/**
		수직 스크롤 여부를 반환한다.

		@method hasVScroll
		@return {Boolean} 스크롤가능 여부를 반환한다.
		@history 1.2.0 Update Method 추가
	**/
	hasVScroll : function() {
		return this.bUseVScroll;
	},


	/**
		jindo.m.DynamicPlugin 생성 / refresh
		@param  {String} sDirection V(수직), H(수평)
	**/
	_createDynamicPlugin : function(sDirection) {
		var ht = {
			nRatio : this.option("nRatio"),
			sListElement : this.option("sListElement"),
			sDirection : sDirection
		};
		if(this._inst("dynamic")) {
			this._inst("dynamic").option(ht);
		} else {
			this._htPlugin["dynamic"].o = new jindo.m.DynamicPlugin(this._htWElement["wrapper"], ht);
		}
		this._inst("dynamic").refresh(sDirection == "V" ? this._nTop : this._nLeft);
		this.option("bUseTimingFunction", false);
		this._htPlugin["dynamic"].bUse = true;
	},

	/**
	 * 범위(nRation * 2) 보다 scroller가 작을 경우는 적용되지 않는다.
	 */
	_refreshDynamicPlugin : function() {
		this._htPlugin["dynamic"].bUse = false;
		if(this.option("sListElement") && !(this.bUseVScroll && this.bUseHScroll) ) {
			var nRange = this.option("nRatio") * 2;
			if( this.bUseVScroll && (this.nScrollH > (this.nWrapperH * nRange)) ) {
				this._createDynamicPlugin("V");
			} else if( this.bUseHScroll && (this.nScrollW > (this.nWrapperW * nRange)) ) {
				this._createDynamicPlugin("H");
			}
		}
	},

	/**
	 * Pulldown/up 기능 제
	 */
	_refreshPullPlugin : function(){
		this._htPlugin["pull"].bUse = this.option("bUsePullDown") || this.option("bUsePullUp");
		if(!this._isUse("pull")) {
			return false;
		}

		if(!this._inst("pull")) {
			this._htPlugin["pull"].o = new jindo.m.PullPlugin(this);
		}
		this._inst("pull").refresh();
		return true;
	},

	/**
		스크롤러를 위한 환경을 재갱신함

		@method refresh
		@param {Object} bNoRepos true 일 경우, 포지션을 갱신하지 않음
	**/
	refresh : function(bNoRepos) {
		if(!this.isActivating()) {
			return;
		}
		this._hasKitkatHighlightBug && this._htWElement["wrapper"].addClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
		// wrapper와 스크롤러의 크기 판별
		this.option("nWidth") && this._htWElement["wrapper"].width(parseInt(this.option("nWidth"),10));
		this.option("nHeight") && this._htWElement["wrapper"].height(parseInt(this.option("nHeight"),10));

		var nWidthLeft = parseInt(this._htWElement["wrapper"].css("border-left-width"),10),
			nWidthRight = parseInt(this._htWElement["wrapper"].css("border-right-width"),10),
			nHeightTop = parseInt(this._htWElement["wrapper"].css("border-top-width"),10),
			nHeightBottom = parseInt(this._htWElement["wrapper"].css("border-bottom-width"),10);
		nWidthLeft = isNaN(nWidthLeft) ? 0 : nWidthLeft;
		nWidthRight = isNaN(nWidthRight) ? 0 : nWidthRight;
		nHeightTop = isNaN(nHeightTop) ? 0 : nHeightTop;
		nHeightBottom = isNaN(nHeightBottom) ? 0 : nHeightBottom;

		this.nWrapperW = this._htWElement["wrapper"].width() - nWidthLeft - nWidthRight;
		this.nWrapperH = this._htWElement["wrapper"].height() - nHeightTop - nHeightBottom;

		if(!this._refreshPullPlugin()) {
			this.nScrollW = this._htWElement["scroller"].width();
			this.nScrollH = this._htWElement["scroller"].height() - this.option("nOffsetBottom");
			this.nMinScrollTop = -this.option("nOffsetTop");
			this.nMaxScrollTop = this.nWrapperH - this.nScrollH;
		}
		this.nMaxScrollLeft = this.nWrapperW - this.nScrollW;

		// 스크롤 여부 판별
		this.bUseHScroll = this.option("bUseHScroll") && (this.nWrapperW <= this.nScrollW);
		this.bUseVScroll = this.option("bUseVScroll") && (this.nWrapperH <= this.nScrollH);
//      console.log(this.bUseHScroll, this.bUseVScroll, this._htWElement["wrapper"].height(), this._htWElement["wrapper"].$value().offsetHeight);

		// 스크롤 여부에 따른 스타일 지정
		if(this.bUseHScroll && !this.bUseVScroll) { // 수평인 경우
			this._htWElement["scroller"].$value().style["height"] = "100%";
		}
		if(!this.bUseHScroll && this.bUseVScroll) { // 수직인 경우
			this._htWElement["scroller"].$value().style["width"] = "100%";
		}

		// Pulgin refresh
		this._refreshDynamicPlugin();

		// 스크롤바 refresh (없을시 자동 생성)
		if(this.option("bUseScrollbar")) {
			this._refreshScroll("V");
			this._refreshScroll("H");
		}

		// 스크롤이 발생하지 않은 경우, 안드로이드인경우 포지션을 못잡는 문제
		(!this.bUseHScroll && !this.bUseVScroll) && this._fixPositionBug();

		(!bNoRepos) && this.restorePos(0);
	},

	/**
		스크롤의 위치를 지정함
		@param {Number} nLeft
		@param {Number} nTop
	**/
	_setPos : function(nLeft,nTop) {
		var sDirection;
		nLeft = this.bUseHScroll ? parseInt(nLeft,10) : 0;
		nTop = this.bUseVScroll ? parseInt(nTop,10) : 0;
		// console.log("setPos : " + this._nLeft + ", " + this._nTop + ", (nLeft,nTop) : " + nLeft + ", " + nTop, typeof this._nTop, typeof nTop);
		this._isUse("dynamic") && (sDirection = this._checkDirection(nLeft,nTop));

		var htParam = {
			nLeft : this._nLeft,
			nTop : this._nTop,
			nNextLeft : nLeft,
			nNextTop : nTop,
			nVectorX : nLeft - this._nLeft,
			nVectorY : nTop - this._nTop,
			nMaxScrollLeft : this.nMaxScrollLeft,
			nMaxScrollTop : this.nMaxScrollTop
		};
		/**
			스크롤러 위치 변경되기 전 발생한다.<br>
			<font color="#E11B10">bUseTimingFunction</font>이 <font color="#E11B10">true</font>일 경우에는 가속시 이벤트가 발생하지 않는다.

			@event beforePosition
			@param {String} sType 커스텀 이벤트명
			@param {Number} nLeft Scroller의 left 값
			@param {Number} nTop Scroller의 top 값
			@param {Number} nNextLeft 변경될 scroller의 left값
			@param {Number} nNextTop 변경될 scroller의 top값
			@param {Number} nVectorX Left의 Vector값
			@param {Number} nVectorY Top의 Vector값
			@param {Number} nMaxScrollLeft Scroller의 최대 left 값
			@param {Number} nMaxScrollTop Scroller의 최대 top 값
			@param {Function} stop 수행시 position 이벤트가 발생하지 않음
		**/
		if (this.fireEvent("beforePosition", htParam)) {
			this._isControling = true;
			this._nLeft = nLeft = htParam.nNextLeft;
			this._nTop = nTop = htParam.nNextTop;
			this._isUse("dynamic") && this._inst("dynamic").updateListStatus(sDirection, this.bUseVScroll ? this._nTop : this._nLeft);

			// if(this.option("bUseTranslate")) {
			if (this.bUseHighlight && this.isPositionBug) {
				var htStyleOffset = this.getStyleOffset(this._htWElement["scroller"]);
				nLeft -= htStyleOffset.left;
				nTop -= htStyleOffset.top;
			}
			this._htWElement["scroller"].css(jindo.m._toPrefixStr("Transform"), jindo.m._getTranslate(nLeft + "px", nTop + "px",this._bUseCss3d));
			// } else {
			//     this._htWElement["scroller"].css({
			//         "left" : nLeft + "px",
			//         "top" : nTop + "px"
			//     });
			// }

			if(this.option("bUseScrollbar")) {
				// this._htTimer["scrollbar"] = clearTimeout(this._htTimer["scrollbar"]);
				this._setScrollBarPos("V", this._nTop);
				this._setScrollBarPos("H", this._nLeft);
			}
			this._oMoveData = {
				nLeft : this._nLeft,
				nTop : this._nTop
			};

			 /**
				스크롤러 위치 변경된 후, 발생한다.<br>
				<font color="#E11B10">bUseTimingFunction</font>이 <font color="#E11B10">true</font>일 경우에는 가속시 이벤트가 발생하지 않는다.

				@event position
				@param {String} sType 커스텀 이벤트명
				@param {Number} nLeft Scroller의 left 값
				@param {Number} nTop Scroller의 top 값
				@param {Number} nMaxScrollLeft Scroller의 최대 left 값
				@param {Number} nMaxScrollTop Scroller의 최대 top 값
				@param {Function} stop 수행시 영향을 받는것이 없음
			**/
			this.fireEvent("position", {
				nLeft : this._nLeft,
				nTop : this._nTop,
				nMaxScrollLeft : this.nMaxScrollLeft,
				nMaxScrollTop : this.nMaxScrollTop
			});
		} else{
			this._isAnimating = false;
		}
	},


	/**
	 * Plugin 사용 여부 상태 조회
	 * @param {String} sName
	 */
	_isUse : function(sName) {
		return this._htPlugin[sName].bUse;
	},

	/**
	 * Plugin 객채 조
	 * @param {String} sName
	 */
	_inst : function(sName) {
		return this._htPlugin[sName].o;
	},

	/**
	 * @to-do Dynamic으로 빼고 싶음.
	 */
	_checkDirection : function(nLeft, nTop) {
		var nBeforePos = this.bUseVScroll ? this._nTop : this._nLeft,
			nAfterPos = this.bUseVScroll ? nTop : nLeft,
			sDirection;
		if(nBeforePos > nAfterPos) {
			sDirection = "forward";
		} else {
			sDirection = "backward";
		}
		return sDirection;
	},

	/**
		스크롤영역으로 복원함
		@deprecated
		@method restorePos
		@param {Number} nDuration
	**/
	restorePos : function(nDuration) {
		// if(!this.bUseHScroll && !this.bUseVScroll) {
		// 	return;
		// }
		// 최대, 최소범위 지정

		var nNewLeft = this.getPosLeft(this._nLeft),
			nNewTop = this.getPosTop(this._nTop);
		if (nNewLeft === this._nLeft && nNewTop === this._nTop) {
			this._isControling = false;
			this._isStop = false;   // 애니메이션이 완전 종료했을 경우, isStop값을 초기화
			this._fireAfterScroll();
			this._fixPositionBug();
			return;
		} else {
			this._scrollTo(nNewLeft, nNewTop , nDuration);
		}
	},

	/**
		모멘텀을 계산하여 앞으로 이동할 거리와 시간을 속성으로 갖는 객체를 반환함
		@param {Number} nDistance
		@param {Number} nSpeed
		@param {Number} nMomentum
		@param {Number} nSize
		@param {Number} nMaxDistUpper
		@param {Number} nMaxDistLower
	**/
	_getMomentum: function (nDistance, nSpeed, nMomentum, nSize, nMaxDistUpper, nMaxDistLower) {
		var nDeceleration = this.option("nDeceleration"),
			nNewDist = nMomentum / nDeceleration,
			nNewTime = 0,
			nOutsideDist = 0;
		//console.log("momentum : " + nDistance + ", " + nSpeed + ", " + nMomentum + ",  " + nSize + ", " + nMaxDistUpper + " , " + nMaxDistLower + ", " + nNewDist);
		if (nDistance < 0 && nNewDist > nMaxDistUpper) {
			nOutsideDist = nSize / (6 / (nNewDist / nSpeed * nDeceleration));
			nMaxDistUpper = nMaxDistUpper + nOutsideDist;
			nSpeed = nSpeed * nMaxDistUpper / nNewDist;
			nNewDist = nMaxDistUpper;
		} else if (nDistance > 0 && nNewDist > nMaxDistLower) {
			nOutsideDist = nSize / (6 / (nNewDist / nSpeed * nDeceleration));
			nMaxDistLower = nMaxDistLower + nOutsideDist;
			nSpeed = nSpeed * nMaxDistLower / nNewDist;
			nNewDist = nMaxDistLower;
		}
		nNewDist = nNewDist * (nDistance > 0 ? -1 : 1);
		nNewTime = nSpeed / nDeceleration;
		//console.log("momentum nSpeed : " + nSpeed + ", nMomentum : " + nMomentum + ", nNewDist : " + nNewDist + ", nTop : " + this._nTop + ", nNewTime : " + nNewTime);
		return {
			nDist: nNewDist,
			nTime: Math.round(nNewTime)
		};
	},

	/**
		애니메이션을 초기화한다.
	**/
	_stop : function() {
		if(this.option("bUseTimingFunction")) {
			jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
			this._transitionTime(0);
		} else {
			cancelAnimationFrame(this._htTimer["ani"]);
			this._stopUpdater();
		}

		if(this._isAnimating){
            this._setPos(this._nLeft, this._nTop);
        }
		this._aAni = [];
		this._isAnimating = false;
		this._isStop = true;
	},

	_scrollTo: function (nLeft, nTop , nDuration) {
		this._stop();
		nLeft = this.bUseHScroll ? nLeft : 0;
		nTop = this.bUseVScroll ? nTop : 0;
		this._aAni.push({
			nLeft: nLeft,
			nTop: nTop,
			nDuration: nDuration || 0
		});
		this._animate();
	},


	/**
		left, top 기준으로 스크롤을 이동한다.
		스크롤을 해당 위치(nLeft, nTop)로 이동한다.<br/>
		@method scrollTo
		@param {Number} nLeft 0~양수 만 입력 가능하다. (-가 입력된 경우는 절대값으로 계산된다)
		@param {Number} nTop 0~양수 만 입력 가능하다. (-가 입력된 경우는 절대값으로 계산된다)
		@param {Number} nDuration 기본값은 0ms이다.
		@remark
			최상위의 위치는 0,0 이다. -값이 입력될 경우는 '절대값'으로 판단한다.<br/>
			스크롤의 내용을 아래로 내리거나, 오른쪽으로 이동하려면 + 값을 주어야 한다.<br/>
		@example
			oScroll.scrollTo(0,100); //목록이 아래로 100px 내려간다.
			oScroll.scrollTo(0,-100); //목록이 아래로 100px 내려간다. (절대값이 100이므로)

		@history 1.1.0 Update nLeft, nTop 값이 양수일 경우 아래쪽, 오른쪽 방향으로 가도록 변경 (음수일 경우 "절대값"으로 계산됨)

	**/

	scrollTo : function(nLeft, nTop, nDuration) {
		nDuration = nDuration || 0;
		nLeft = -Math.abs(nLeft);
		nTop = -Math.abs(nTop);
		nTop += this.getTop();

		this._scrollTo( (nLeft >= this.getLeft() ? this.getLeft() : (nLeft <= this.getRight() ? this.getRight() : nLeft) ),
			(nTop >= this.getTop() ? this.getTop() : (nTop <= this.getBottom() ? this.getBottom() : nTop) ),
			nDuration);
	},

	/**
		오른쪽 위치 반환

		@method getRight
		@return {Number} 오른쪽 위치 반환
	**/
	getRight : function() {
		return this.nMaxScrollLeft;
	},

	/**
		왼쪽 위치 반환

		@method getLeft
		@return {Number} 왼쪽 위치 반환
	**/
	getLeft : function() {
		return 0;
	},

	/**
		아래쪽 위치 반환

		@method getBottom
		@return {Number} 아래쪽 위치 반환
	**/
	getBottom : function() {
		return this.nMaxScrollTop;
	},

	/**
		위쪽 위치 반환

		@method getTop
		@return {Number} 위쪽 위치 반환
	**/
	getTop : function() {
		return this.nMinScrollTop;
	},

	/**
		동작 여부를 반환

		@method isMoving
		@return {Boolean} 동작 여부
	**/
	isMoving : function() {
		return this._isControling;
	},

	/**
		애니메이션을 호출한다.
	**/
	_animate : function() {
		var self = this,
			oStep;
		if (this._isAnimating) {
			return;
		}
		if(!this._aAni.length) {
			this.restorePos(300);
			return;
		}
		// 동일할 경우가 아닐때 까지 큐에서 Step을 뺌.
		do {
			oStep = this._aAni.shift();
			if(!oStep) {
				return;
			}
		} while( oStep.nLeft == this._nLeft && oStep.nTop == this._nTop );
		if(oStep.nDuration == 0) {
			if (this.option("bUseTimingFunction")) {
				this._transitionTime(0);
			}
			this._setPos(oStep.nLeft, oStep.nTop);
			this._animate();
		} else {
			this._isAnimating = true;
			// Transition을 이용한 animation
			if (this.option("bUseTimingFunction")) {
				this._transitionTime(oStep.nDuration);
				this._setPos(oStep.nLeft, oStep.nTop);
				this._isAnimating = false;
				jindo.m.attachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
			} else {
				// AnimationFrame을 이용한 animation
				self._startUpdater();
				var startTime = (new Date()).getTime(),
					fx = this.bUseHScroll ? this.option("fEffect")(this._nLeft, oStep.nLeft) : null,
					fy = this.bUseVScroll ? this.option("fEffect")(this._nTop, oStep.nTop) : null,
					now;
				(function animate () {
					now = (new Date()).getTime();
					if (now >= startTime + oStep.nDuration) {
						// updater를 중지시키고, 바로 셋팅
						self._stopUpdater();
						self._setPos(oStep.nLeft, oStep.nTop);
						self._isAnimating = false;
						self._animate();
						return;
					}
					now = (now - startTime) / oStep.nDuration;
					self._oMoveData = {
						nLeft : fx && fx(now),
						nTop : fy && fy(now)
					};
					if (self._isAnimating) {
						self._htTimer["ani"] = requestAnimationFrame(animate);
					} else{
						self._stopUpdater();
					}
				})();
			}
		}
	},

	/**
		디바이스 회전시, 처리
		@param {jindo.$Event} we
	**/
	_onRotate : function(we) {
		/**
		  단말기가 회전될 때 발생한다

		  @event rotate
		  @param {String} sType 커스텀 이벤트명
		  @param {Boolean} isVertical 수직여부
		  @param {Function} stop 수행시 refresh가 중지됨.
		**/
		if(this.fireEvent("rotate", {
			isVertical : we.isVertical
		})) {
			this.refresh();
		}
	},


	/**
		transition duration 지정
		@param {Nubmer} nDuration
	**/
	_transitionTime: function (nDuration) {
		nDuration += 'ms';
		this._htWElement["scroller"].css(jindo.m._toPrefixStr("TransitionDuration"), nDuration);
		if(this.option("bUseScrollbar")) {
			this._setScrollbarDuration(nDuration);
		}
	},

	_setScrollbarDuration : function(nDuration) {
		if (this.bUseHScroll && this._htWElement["HscrollbarIndicator"]) {
			this._htWElement["HscrollbarIndicator"].css(jindo.m._toPrefixStr("TransitionDuration"), nDuration);
		}
		if (this.bUseVScroll && this._htWElement["VscrollbarIndicator"]) {
			this._htWElement["VscrollbarIndicator"].css(jindo.m._toPrefixStr("TransitionDuration"), nDuration);
		}
	},

	/**
		이동중 멈추는 기능. 이때 멈춘 위치의 포지션을 지정
	**/
	_stopScroll : function() {
		var htCssOffset = jindo.m.getTranslateOffset(this._htWElement["scroller"].$value()),
			htStyleOffset ={left : 0, top : 0}, nTop, nLeft;

		if(this.isPositionBug && this.bUseHighlight) {
			htStyleOffset = this.getStyleOffset(this._htWElement["scroller"]);
		}
		nLeft = htCssOffset.left + htStyleOffset.left;
		nTop = htCssOffset.top + htStyleOffset.top;
		if(!this.option("bUseFixedScrollbar")) {
			this._hideScrollBar("V");
			this._hideScrollBar("H");
		}
		// console.log(nLeft + "," + this._nLeft + "|" + nTop + "," +this._nTop);
		// if(parseInt(nLeft,10) !== parseInt(this._nLeft,10) || parseInt(nTop,10) !== parseInt(this._nTop,10)) {
			this._stopUpdater();
			this._stop();
			this._setPos(this.getPosLeft(nLeft), this.getPosTop(nTop));
			this._isControling = false;
			this._fireAfterScroll();
			this._fixPositionBug();
		// } else {
		// }
	},

	/**
		Style의 left,top을 반환함
		@deprecated
		@method getStyleOffset
		@param {jindo.$Element} wel
	**/
	getStyleOffset : function(wel) {
		var nLeft = parseInt(wel.css("left"),10),
			nTop = parseInt(wel.css("top"),10);
		nLeft = isNaN(nLeft) ? 0 : nLeft;
		nTop = isNaN(nTop) ? 0 : nTop;
		return {
			left : nLeft,
			top : nTop
		};
	},

	/**
		Boundary를 초과하지 않는 X (left) 포지션 반환
		@deprecated
		@method getPosLeft
		@param {Number} nPos
	**/
	getPosLeft : function(nPos) {
		if(this.bUseHScroll) {
			return (nPos >= 0 ? 0 : (nPos <= this.nMaxScrollLeft ? this.nMaxScrollLeft : nPos) );
		} else {
			return 0;
		}
	},

	/**
		Boundary를 초과하지 않는 Y (top) 포지션 반환
		@deprecated
		@method getPosTop
		@param {Number} nPos
	**/
	getPosTop : function(nPos) {
		if(this.bUseVScroll) {
			return (nPos >= this.nMinScrollTop ? this.nMinScrollTop : (nPos <= this.nMaxScrollTop ? this.nMaxScrollTop : nPos) );
		} else {
			return 0;
		}
	},

	/**
		scrollbar를 숨긴다
		@param {String} sDirect H,V 수평과 수직을 나타낸다.
	**/
	_hideScrollBar : function(sDirection) {
		if(!this._htWElement) { return; }
		var wel = this._htWElement[sDirection + "scrollbar"],
			bUseScroll = (sDirection === "H" ? this.bUseHScroll : this.bUseVScroll);
		if(bUseScroll && wel) {
			wel.hide();
			/* 갤럭시 S3인 경우 hide된 후 reflow가 발생하지 않으면 스크롤바가 사라지지 않는다. */
			wel.$value().offsetHeight;
//			wel.css("left",wel.css("left") + "px");
			if(this.isPositionBug && this.bUseHighlight) {
				this.makeStylePos(this._htWElement[sDirection + "scrollbarIndicator"]);
			}
		}

	},

	_fireAfterScroll : function() {
		if (this.option("bUseScrollbar")) {
			var self = this;
			this._htTimer["scrollbar"] = setTimeout(function(){
				if(!self.option("bUseFixedScrollbar")) {
					self._hideScrollBar("V");
					self._hideScrollBar("H");
				}
			}, this.option('nScrollbarHideThreshold'));
		}
		/**
			스크롤러 위치 변경이 최종적으로 끝났을 경우

			@event afterScroll
			@param {String} sType 커스텀 이벤트명
			@param {Number} nLeft Scroller의 left 값
			@param {Number} nTop Scroller의 top 값
			@param {Number} nMaxScrollLeft Scroller의 최대 left 값
			@param {Number} nMaxScrollTop Scroller의 최대 top 값
			@param {Function} stop 수행시 영향을 받는것이 없음
		**/
		this._fireEvent("afterScroll");
	},

	/**
		범용 사용자 이벤트 호출
	**/
	_fireEvent : function(sType) {
		return this.fireEvent(sType, this._getNowPosition());
	},

	/**
		범용 touch 사용자 이벤트
	**/
	_fireTouchEvent : function(sType, we) {
		return this.fireEvent(sType, this._getNowPosition(we));
	},

	/**
	 * 공통 현재 위치 정보 return 처리
	 */
	_getNowPosition : function(we) {
		return {
			nLeft : this._nLeft,
			nTop : this._nTop,
			nMaxScrollLeft : this.nMaxScrollLeft,
			nMaxScrollTop : this.nMaxScrollTop,
			oEvent : we || {}
		};
	},

	 /**
		pullDown 사용여부를 지정할수 있습니다.

		@method setUsePullDown
		@param {Boolean} bUse pullDown 사용여부
	**/
	setUsePullDown : function(bUse) {
		if(this._isUse("pull")) {
			this.option("bUsePullDown", bUse);
			this.refresh();
		}
	},

	/**
		pullUp 사용여부를 지정할 수 있습니다.

		@method setUsePullUp
		@param {Boolean} bUse PullUp 사용여부
	**/
	setUsePullUp : function(bUse) {
		if(this._isUse("pull")) {
			this.option("bUsePullUp", bUse);
			this.refresh();
		}
	},

	_onUpdater : function(we) {
		// if(this._isActivateUpdater) {
		// console.debug("updater...");
		if(this._oMoveData.nLeft != this._nLeft || this._oMoveData.nTop != this._nTop) {
			// console.log("updating",this._oMoveData.nTop, this._nTop, this._oMoveData.nLeft ,this._nLeft );
			this._setPos(this._oMoveData.nLeft, this._oMoveData.nTop);
		}
		// }
		this._startUpdater();
	},

	_startUpdater : function() {
		this._stopUpdater();
		this._nUpdater = window.requestAnimationFrame(this._htEvent["updater"]);
		// console.debug("start-updater");
	},

	_stopUpdater : function() {
		window.cancelAnimationFrame(this._nUpdater);
		this._nUpdater = -1;
		// console.debug("stop-updater");
	},

	/**
		Touchstart시점 이벤트 핸들러
		@param {jindo.$Event} we
	**/
	_onStart : function(we) {
		// console.log  ("touchstart (" + we.nX + "," + we.nY + ") this._isAnimating " + this._isAnimating);
		this._clearPositionBug();
		/**
			touchStart 내부 스크롤로직이 실행되기 전

			@event beforeTouchStart
			@param {String} sType 커스텀 이벤트명
			@param {Number} nLeft Scroller의 left 값
			@param {Number} nTop Scroller의 top 값
			@param {Number} nMaxScrollLeft Scroller의 최대 left 값
			@param {Number} nMaxScrollTop Scroller의 최대 top 값
			@param {Object} oEvent jindo.m.Touch의 touchStart 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchStart">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
			@param {Function} stop 수행시 touchStart 이벤트가 발생하지 않음
		**/
		this._isStop = false;
		// this._htWElement["scroller"].css("pointerEvents","none");
		if(this._fireTouchEvent("beforeTouchStart",we)) {
			// this._clearAnchor();

			if (this.option("bUseTimingFunction")) {
				this._transitionTime(0);
			}
			// console.log(this._isAnimating, this._isControling);
			// 이동중 멈추었을 경우
			this._isAnimating && this._stopScroll() && (this._isAnimating = false);
			this._isControling = true;

			/**
				touchStart 내부 스크롤로직이 실행된 후

				@event touchStart
				@param {String} sType 커스텀 이벤트명
				@param {Number} nLeft Scroller의 left 값
				@param {Number} nTop Scroller의 top 값
				@param {Number} nMaxScrollLeft Scroller의 최대 left 값
				@param {Number} nMaxScrollTop Scroller의 최대 top 값
				@param {Object} oEvent jindo.m.Touch의 touchStart 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchStart">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
				@param {Function} stop 수행시 영향을 받는것이 없음
			**/
			if(!this._fireTouchEvent("touchStart",we)) {
				we.stop();
			}
		} else {
			we.stop();
		}
	},

	/**
		이동시점 이벤트 핸들러
		@param {jindo.$Event} we
	**/
	_onMove : function(we) {
		var nNewLeft=0, nNewTop =0;
		this._clearTouchEnd();
		this._clearPositionBug();
		// console.log("touchmove (" + we.nX + "," + we.nY + "), Vector (" + we.nVectorX + "," + we.nVectorY + ") sMoveType : " + we.sMoveType);

		/**
		 *  iOS를 위한 anchor 처리
		 * ios일 경우, touchstart시 선택된 영역에 anchor가 있을 경우, touchend 시점에 touchstart영역에 click이 타는 문제
		 * 모든 a link에 bind된, onclick 이벤트를 제거한다. => eventPoints으로 해결
		 */
		this.isClickBug && this._htWElement["scroller"].css("pointerEvents","none");
		/**
			touchMove 내부 스크롤로직이 실행되기 전

			@event beforeTouchMove
			@param {String} sType 커스텀 이벤트명
			@param {Number} nLeft Scroller의 left 값
			@param {Number} nTop Scroller의 top 값
			@param {Number} nMaxScrollLeft Scroller의 최대 left 값
			@param {Number} nMaxScrollTop Scroller의 최대 top 값
			@param {Object} oEvent jindo.m.Touch의 touchMove 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchMove">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
			@param {Function} stop 수행시 move 이벤트가 발생하지 않음
		**/
		if (this._fireTouchEvent("beforeTouchMove",we)) {
			if(this._isUse("pull")) {
				this._inst("pull").touchMoveForUpdate(we, this.nMaxScrollTop);
			}
			/** 시스템 스크롤 막기 */
			var weParent = we.oEvent;
			if(we.sMoveType === jindo.m.MOVETYPE[0]) {  //수평이고, 수평스크롤인 경우 시스템 스크롤 막기
				if(this.bUseHScroll) {
					if( !this.option("bUseBounce") && ( (this._nLeft >= 0 && we.nVectorX > 0) || (this._nLeft <= this.nMaxScrollLeft && we.nVectorX < 0) )  ) {
						this._forceRestore(we);
						return;
					} else {
						weParent.stop(jindo.$Event.CANCEL_ALL);
					}
				} else {
					return true;
				}
			} else if(we.sMoveType === jindo.m.MOVETYPE[1]) {   //수직이고, 수직스크롤인 경우 시스템 스크롤 막기
				if(this.bUseVScroll) {
					if( !this.option("bUseBounce") && ( (this._nTop >= this.nMinScrollTop && we.nVectorY > 0) || (this._nTop <= this.nMaxScrollTop && we.nVectorY < 0) )  ) {
						this._forceRestore(we);
						return;
					} else {
						weParent.stop(jindo.$Event.CANCEL_ALL);
					}
				} else {
					return true;
				}
			} else if(we.sMoveType === jindo.m.MOVETYPE[2]) {   //대각선일 경우, 시스템 스크롤 막기
				if(this.option('bUseDiagonalTouch')){
					weParent.stop(jindo.$Event.CANCEL_ALL);
				} else{
					return;
				}
			} else {    // 탭, 롱탭인 경우, 다 막기
				weParent.stop(jindo.$Event.CANCEL_ALL);
				return true;
			}

			if(this.option("bUseBounce")) {
				if(this.bUseHScroll) {
					nNewLeft = this._nLeft + (this._nLeft >=0 || this._nLeft <= this.nMaxScrollLeft ? we.nVectorX/2 : we.nVectorX);
				}
				if(this.bUseVScroll) {
					nNewTop = this._nTop + (this._nTop >= this.nMinScrollTop || this._nTop <= this.nMaxScrollTop ? we.nVectorY/2 : we.nVectorY);
				}
				/** 갤럭시S3에서는 상단영역을 벗어나면 touchEnd가 발생하지 않음
				 * 상단영역 30이하로 잡힐 경우 복원
				 */
				var self=this;
				this._htTimer["touch"] = setTimeout(function() {
					self._forceRestore(we);
				},500);
			} else {
				nNewLeft = this.getPosLeft(this._nLeft + we.nVectorX);
				nNewTop = this.getPosTop(this._nTop + we.nVectorY);
			}
			this._setPos(nNewLeft, nNewTop);
			/**
				touchMove 내부 스크롤로직이 실행된 후

				@event touchMove
				@param {String} sType 커스텀 이벤트명
				@param {Number} nLeft Scroller의 left 값
				@param {Number} nTop Scroller의 top 값
				@param {Number} nMaxScrollLeft Scroller의 최대 left 값
				@param {Number} nMaxScrollTop Scroller의 최대 top 값
				@param {Object} oEvent jindo.m.Touch의 touchMove 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchMove">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
				@param {Function} stop 수행시 영향을 받는것이 없음
			**/

			if(!this._fireTouchEvent("touchMove",we)) {
				we.stop();
			}

		} else {
			we.stop();
		}
	},


	/**
		Touchend 시점 이벤트 핸들러
		@param {jindo.$Event} we
	**/
	_onEnd : function(we) {
		// console.log("touchend [" + we.sMoveType + "](" + we.nX + "," + we.nY + "), Vector(" + we.nVectorX + "," + we.nVectorY + "), MomentumY : "+ we.nMomentumY + ", speedY : " + we.nSpeedY);
		// addConsole("OnEndProcess");
		/**
			touchEnd 내부 스크롤로직이 실행되기 전

			@event beforeTouchEnd
			@param {String} sType 커스텀 이벤트명
			@param {Number} nLeft Scroller의 left 값
			@param {Number} nTop Scroller의 top 값
			@param {Number} nMaxScrollLeft Scroller의 최대 left 값
			@param {Number} nMaxScrollTop Scroller의 최대 top 값
			@param {Object} oEvent jindo.m.Touch의 touchEnd 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchEnd">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
			@param {Function} stop 수행시 touchEnd 이벤트가 발생하지 않음
		**/

		if(this._isUse("pull")){
			this._inst("pull").pullUploading();
		}

		if (this._fireTouchEvent("beforeTouchEnd",we)) {
			this._clearPositionBug();
			this._clearTouchEnd();
			// addConsole("end : " + we.sMoveType);
			// 1) 스크롤인 경우
			if (we.sMoveType === jindo.m.MOVETYPE[0] || we.sMoveType === jindo.m.MOVETYPE[1] || we.sMoveType === jindo.m.MOVETYPE[2]) {
				this._endForScroll(we);
				if(this.nVersion < 4.1) {
					we.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
				}
			} else {    // 2) 스크롤이 아닌 경우
				// 클릭 이후 페이지 뒤로 돌아왔을 경우, 문제가됨. 동작중인 상태를 초기화함
				this._isControling = false;
				if (!this._isStop) {
					// if(this.bUseHighlight) {
						// this._restoreAnchor();
					// }
					this._tapHighlight();
				}
			}
			/**
				touchEnd 내부 스크롤로직이 실행된 직후

				@event touchEnd
				@param {String} sType 커스텀 이벤트명
				@param {Number} nLeft Scroller의 left 값
				@param {Number} nTop Scroller의 top 값
				@param {Number} nMaxScrollLeft Scroller의 최대 left 값
				@param {Number} nMaxScrollTop Scroller의 최대 top 값
				@param {Object} oEvent jindo.m.Touch의 touchEnd 속성과 동일
        <br/>상세내역은 <auidoc:see content="jindo.m.Touch#event_touchEnd">[jindo.m.Touch]</auidoc:see>을 참조하기 바란다.
				@param {Function} 수행시 영향 받는것 없음.
			**/
			if(!this._fireTouchEvent("touchEnd",we)) {
				we.stop();
			}
		} else {
			we.stop();
		}
		/**
		 *  iOS를 위한 anchor 처리
		 * ios일 경우, touchstart시 선택된 영역에 anchor가 있을 경우, touchend 시점에 touchstart영역에 click이 타는 문제
		 * 모든 a link에 bind된, onclick 이벤트를 제거한다. => eventPoints으로 해결
		 */
		this.isClickBug && this._htWElement["scroller"].css("pointerEvents","auto");
	},

	_tapHighlight : function(){
		if(this._hasKitkatHighlightBug) {
			this._htWElement["wrapper"].removeClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
			// 하이라이트가 안나오는 경우가 있음. 네이버 인앱...강제 reflow발생
			this._htWElement["wrapper"]._element.clientHeight;
			var self = this;
			clearTimeout(this._nHightlightBug);
			this._nHightlightBug = setTimeout(function() {
				self._htWElement["wrapper"].addClass(jindo.m.KITKAT_HIGHLIGHT_CLASS);
			},200);
		}
	},

	/**
		스크롤을 강제로 복귀한다.
		@param  {jindo.$Event} we 이벤트
	**/
	_forceRestore : function(we) {
		we.nMomentumX = we.nMomentumY = null;
		this._endForScroll(we);
		this._clearPositionBug();
		this._clearTouchEnd();
	},

	/**
		touchEnd 시점 스크롤 처리
		@param {jindo.$Event} we
	**/
	_endForScroll : function(we) {
		clearTimeout(this._nFixedDubbleEndBugTimer);

		/**
			touchEnd시 스크롤인 경우, 스크롤러의 위치가 변경되기 전
			여기에서 넘어가는 파라미터를 변경시, 변경된 값이 스크롤러의 위치 변경에 영향을 미침

			@event beforeScroll
			@param {String} sType 커스텀 이벤트명
			@param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
			@param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 양수, 아래쪽 방향이면 음수)
			@param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
			@param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
			@param {Number} nLeft Scroller의 left 값
			@param {Number} nTop Scroller의 top 값
			@param {Number} nNextLeft 가속 발생시, 변경될 scroller의 left값 (가속 미발생시, nLeft와 동일)
			@param {Number} nNextTop 가속 발생시, 변경될 scroller의 top값 (가속 미발생시, nTop와 동일)
			@param {Number} nTime 가속 발생시, 가속이 적용될 ms시간 (가속 미발생시, 0)
			@param {Number} nMaxScrollLeft Scroller의 최대 left 값
			@param {Number} nMaxScrollTop Scroller의 최대 top 값
			@param {Function} stop 수행시 scroll 이벤트가 발생하지 않음
		**/
		var htMomentumX = { nDist:0, nTime:0 },
			htMomentumY = { nDist:0, nTime:0 },
			htParam = {
				nMomentumX : we.nMomentumX,
				nMomentumY : we.nMomentumY,
				nDistanceX : we.nDistanceX,
				nDistanceY : we.nDistanceY,
				nLeft : this._nLeft,
				nTop : this._nTop,
				nMaxScrollLeft : this.nMaxScrollLeft,
				nMaxScrollTop : this.nMaxScrollTop
			};

		if (this.option("bUseMomentum") && (we.nMomentumX || we.nMomentumY) ) {
			if (this.bUseHScroll) {
				htMomentumX = this._getMomentum(-we.nDistanceX, we.nSpeedX, we.nMomentumX, this.nWrapperW, -this._nLeft, -this.nMaxScrollLeft + this._nLeft);
			}
			if (this.bUseVScroll) {
				htMomentumY = this._getMomentum(-we.nDistanceY, we.nSpeedY, we.nMomentumY, this.nWrapperH, -this._nTop, -this.nMaxScrollTop + this._nTop);
			}
			htParam.nNextLeft = this._nLeft + htMomentumX.nDist;
			htParam.nNextTop = this._nTop + htMomentumY.nDist;
			htParam.nTime = Math.max(Math.max(htMomentumX.nTime, htMomentumY.nTime),10);
			if (this.fireEvent("beforeScroll", htParam)) {
				if(this.option("bUseBounce")) {
					this._scrollTo(htParam.nNextLeft, htParam.nNextTop, htParam.nTime);
				} else {
					this._scrollTo(this.getPosLeft(htParam.nNextLeft), this.getPosTop(htParam.nNextTop), htParam.nTime);
				}
				// this.fireEvent("scroll",htParam);
			}
		} else {
			htParam.nNextLeft = this._nLeft;
			htParam.nNextTop = this._nTop;
			htParam.nTime = 0;
			if (this.fireEvent("beforeScroll", htParam)) {
				if( this._nLeft !== htParam.nNextLeft || this._nTop !== htParam.nNextTop ) {
					this._scrollTo(htParam.nNextLeft, htParam.nNextTop, htParam.nTime);
				} else {
					this.restorePos(300);
				}
				// this.fireEvent("scroll",htParam);
			}
		}
	},

	/**
		TransitionEnd 이벤트 핸들러
		@param {jindo.$Event} we
	**/
	_onTransitionEnd : function(we) {
		jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
		this._animate();
	},

	/**
		스크롤 도중 scroll 영역 바깥을 선택하였을시, 스크롤을 중지시킴
		@param {jindo.$Event} we
	**/
	_onDocumentStart : function(we) {
		if(this._htWElement["wrapper"].visible()) {
			if(this._htWElement["wrapper"].isChildOf(we.element)) {
				return true;
			} else {
				// 전체 스크롤 사용시 막음
				// console.info(this._isAnimating, this._isControling);
				if(this._isAnimating && this._isControling) {
					this._stopScroll();
				}
			}
		}
	},

	/**
		jindo.m.Scroll 컴포넌트를 활성화한다.
		activate 실행시 호출됨
	**/
	_onActivate : function() {
		if(!this._oTouch) {
			this._oTouch = new jindo.m.Touch(this._htWElement["wrapper"].$value(), {
				nMoveThreshold : 0,
				nMomentumDuration : (jindo.m.getDeviceInfo().android ? 500 : 200),
				nUseDiagonal : 0,
				nTapThreshold : 1,
				nSlopeThreshold : 5,
				nEndEventThreshold : (jindo.m.getDeviceInfo().win8 ? 100 : 0),
				bHorizental : this.option("bUseHScroll"),
				bVertical : this.option("bUseVScroll")
			});
		} else {
			this._oTouch.activate();
		}
		this._attachEvent();
		this.refresh();
	},

	/**
		jindo.m.Scroll 컴포넌트를 비활성화한다.
		deactivate 실행시 호출됨
	**/
	_onDeactivate : function() {
		this._detachEvent();
		this._oTouch.deactivate();
	},

	/**
		jindo.m.Scroll 에서 사용하는 모든 이벤트를 바인드한다.
	**/
	_attachEvent : function() {
		this._htEvent = {};
		/* Touch 이벤트용 */
		this._htEvent["touchStart"] = jindo.$Fn(this._onStart, this).bind();
		this._htEvent["touchMove"] = jindo.$Fn(this._onMove, this).bind();
		this._htEvent["touchEnd"] = jindo.$Fn(this._onEnd, this).bind();
		this._htEvent["TransitionEnd"] = jindo.$Fn(this._onTransitionEnd, this).bind();
		this._htEvent["document"] = jindo.$Fn(this._onDocumentStart, this).attach(document, "touchstart");
		this._oTouch.attach({
			touchStart : this._htEvent["touchStart"],
			touchMove : this._htEvent["touchMove"],
			touchEnd :  this._htEvent["touchEnd"]
		});
		if(this.option("bAutoResize")) {
			this._htEvent["rotate"] = jindo.$Fn(this._onRotate, this).bind();
			jindo.m.bindRotate(this._htEvent["rotate"]);
		}

		if(!this.option("bUseTimingFunction")) {
			this._htEvent["updater"] = jindo.$Fn(this._onUpdater, this).bind();
		}
	},

	/**
		안드로이드 계열 버그
		css3로 스타일 변경 후, 하이라이트안되는 문제
		[해결법] transition관련 property를 null로 처리
	 *       offset 변경
	 *       a tag focus 하면 됨
	**/
	_fixPositionBug : function() {
		if(this.isPositionBug && this.bUseHighlight) {
			var self = this;
			this._clearPositionBug();
			this._htTimer["fixed"] = setTimeout(function() {
				if(self._htWElement && self._htWElement["scroller"]) {
					self.makeStylePos(self._htWElement["scroller"]);
					if(self.nVersion <= 3) {
						self._elDummyTag.focus();
					}
				}
			}, 200);
		}
		// this.end();
	},

	/**
		translate의 포지션을 스타일로 바꾼다.
		@deprecated
		@method makeStylePos
		@param {jindo.$Element} wel
	**/
	makeStylePos : function(wel) {
		var ele = wel.$value();
		var htCssOffset = jindo.m.getTranslateOffset(ele);
		var htScrollOffset = wel.offset();
		if(this.nVersion >= 4) {
			ele.style[jindo.m._toPrefixStr("Transform")] = jindo.m._getTranslate(0,0,this._bUseCss3d);
		} else {
			ele.style[jindo.m._toPrefixStr("Transform")] = null;
		}
		ele.style[jindo.m._toPrefixStr("TransitionDuration")] = null;
		//alert(htCssOffset.top + " , " + htCssOffset.left + " --- " + htScrollOffset.top + " , " + htScrollOffset.left);

		// jindo 버전이 2.10.0 이하일때.
		if(this._hasJindoOffsetBug){
		    wel.offset(htCssOffset.top + htScrollOffset.top, htCssOffset.left + htScrollOffset.left);
		} else {
		    wel.offset(htScrollOffset.top, htScrollOffset.left);
		}
	},

	/**
		android인 경우, 버그수정 timer를 제거
	**/
	_clearPositionBug : function() {
		if(this.isPositionBug && this.bUseHighlight) {
			clearTimeout(this._htTimer["fixed"]);
			this._htTimer["fixed"] = -1;
		}
	},

	_clearTouchEnd : function() {
		clearTimeout(this._htTimer["touch"]);
		this._htTimer["touch"] = -1;
	},

	/**
		jindo.m.Scroll 에서 사용하는 모든 이벤트를 해제한다.
	**/
	_detachEvent : function() {
		jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
		this._htEvent["document"].detach(document,"touchstart");

		if(this.option("bAutoResize")) {
			jindo.m.unbindRotate(this._htEvent["rotate"]);
		}

		this._oTouch.detachAll();
		if (this._elDummyTag) {
			this._htWElement["scroller"].remove(this._elDummyTag);
		}
		if(!this.option("bUseTimingFunction")) {
			this._stopUpdater();
		}
	},


	/**
		스크롤바를 생성한다.
		@param {String} sDirection 수평, 수직 방향
	**/
	_createScroll : function(sDirection) {
		if( !(sDirection === "H" ? this.bUseHScroll : this.bUseVScroll) ) {
			return;
		}
		var welWrapper = this._htWElement["wrapper"],
			welScrollbar  = jindo.$Element(welWrapper.query("div." + jindo.m.Scroll.SCROLLBAR_CLASS)),
			welScrollbarIndicator;

		// 기존에 존재하면 삭제
		if(welScrollbar) {
			welWrapper.remove(welScrollbar);
			welScrollbar = this._htWElement[sDirection + "scrollbar"] = this._htWElement[sDirection + "scrollbarIndicator"] = null;
		}
		// scrollbar $Element 생성
		welScrollbar = this._createScrollbar(sDirection);
		welScrollbarIndicator = this._createScrollbarIndicator(sDirection);
		this._htWElement[sDirection + "scrollbar"]= welScrollbar;
		this._htWElement[sDirection + "scrollbarIndicator"] = welScrollbarIndicator;
		welScrollbar.append(welScrollbarIndicator);
		welWrapper.append(welScrollbar);
		// scrollbar 갱신
		// this._refreshScroll(sDirection);
	},

	/**
		스크롤바 Wrapper를 생성한다
		@param {String} sDirection
	**/
	_createScrollbar : function(sDirection) {
		var welScrollbar = jindo.$Element("<div class='" + jindo.m.Scroll.SCROLLBAR_CLASS + "'>");
		welScrollbar.css({
			"position" : "absolute",
			"zIndex" : 100,
			"bottom" : (sDirection === "H" ? "1px" : (this.bUseHScroll ? '7' : '2') + "px"),
			"right" : (sDirection === "H" ? (this.bUseVScroll ? '7' : '2') + "px" : "1px"),
			"pointerEvents" : "none"
			// "overflow" : "hidden"
		});
		if(this.option("bUseFixedScrollbar")) {
			welScrollbar.show();
		} else {
			welScrollbar.hide();
		}
		if (sDirection === "H") {
			welScrollbar.css({
				height: "5px",
				left: "2px"
			});
		} else {
			welScrollbar.css({
				width: "5px",
				top: "2px"
			});
		}
		return welScrollbar;
	},

	/**
		스크롤바 Indicator를 생성한다.
		@param {String} sDirection
	**/
	_createScrollbarIndicator : function(sDirection) {
		// scrollbar Indivator 생성
		var welScrollbarIndicator = jindo.$Element("<div>").css({
			"position" : "absolute",
			"zIndex" : 100,
			"border": this.option("sScrollbarBorder"),
			"pointerEvents" : "none",
			"left" : 0,
			"top" : 0,
			"backgroundColor" : this.option("sScrollbarColor")});
		if(jindo.m.getOsInfo().ios && this.option('bUseScrollBarRadius')) {
			welScrollbarIndicator.css(jindo.m._toPrefixStr("BorderRadius"), "12px");
		}
		// if(this._bUseCss3d) {
		welScrollbarIndicator.css(jindo.m._toPrefixStr("TransitionProperty"), this.sCssPrefix == "" ? "transform" : "-" + this.sCssPrefix + "-transform")
			.css(jindo.m._toPrefixStr("Transform"), jindo.m._getTranslate(0,0,this._bUseCss3d));
		// }
		if(this.option("bUseTimingFunction")) {
			welScrollbarIndicator.css(jindo.m._toPrefixStr("TransitionTimingFunction"), this.option("fEffect").toString());
		}
		if(sDirection === "H") {
			welScrollbarIndicator.height(5);
		} else {
			welScrollbarIndicator.width(5);
		}
		return  welScrollbarIndicator;
	},

	/**
		스크롤 바의 상태를 갱신한다.
		@param {String} sDirection 수평, 수직 방향
	**/
	_refreshScroll : function(sDirection) {
		// 스크롤이 사용 불가하거나, 사이즈가 동일한 경우는 스크롤바를 생성하지 않는다.
		if(sDirection === "H") {
			if(!this.bUseHScroll || this.nWrapperW == this.nScrollW) {
				return;
			}
		} else {
			if(!this.bUseVScroll || this.nWrapperH == this.nScrollH) {
				return;
			}
		}
		// 스크롤바가 존재하지 않을 경우 새로 생성함
		if(!this._htWElement[sDirection + "scrollbar"]) {
			this._createScroll(sDirection);
		}
		var welScrollbar = this._htWElement[sDirection + "scrollbar"],
			welScrollbarIndicator = this._htWElement[sDirection + "scrollbarIndicator"],
			nSize = 0;
		if(sDirection === "H" ) {
			nSize = Math.max(Math.round(Math.pow(this.nWrapperW,2) / this.nScrollW), 8);
			this._nPropHScroll = (this.nWrapperW - nSize) / this.nMaxScrollLeft;
			welScrollbar.width(this.nWrapperW);
			welScrollbarIndicator.width(isNaN(nSize) ? 0 : nSize);
		} else {
			nSize = Math.max(Math.round(Math.pow(this.nWrapperH,2) / this.nScrollH), 8);
			this._nPropVScroll = (this.nWrapperH - nSize) / this.nMaxScrollTop;
			welScrollbar.height(this.nWrapperH);
			welScrollbarIndicator.height(isNaN(nSize) ? 0 : nSize);
		}
	},

	_setScrollBarPos: function (sDirection, nPos) {
		if(!(sDirection === "H" ? this.bUseHScroll : this.bUseVScroll)) {
			return;
		}
		var welIndicator = this._htWElement[sDirection + "scrollbarIndicator"],
			welScrollbar = this._htWElement[sDirection + "scrollbar"];

		// indicator, scrollbar가 존재하지 않을 경우
		if(!welIndicator || !welScrollbar) {
			return;
		}

		nPos = this["_nProp" + sDirection + 'Scroll'] * nPos;
		if(!this.option("bUseFixedScrollbar") && welScrollbar && !welScrollbar.visible()) {
			welScrollbar.show();

			// timingfunction으로 이동시 랜더링을 재갱신하면 애니메이션이 동작한다.
			if(this.option("bUseTimingFunction")) {
				welScrollbar.$value().clientHeight;
			}
		}
		if(welIndicator) {
			if (this.isPositionBug && this.bUseHighlight)  {
				var nBufferPos = parseInt( ( sDirection === "H" ? welIndicator.css("left") : welIndicator.css("top") ), 10);
				nPos -= isNaN(nBufferPos) ? 0 : nBufferPos;
			}
			welIndicator.css(jindo.m._toPrefixStr("Transform"),
				jindo.m._getTranslate(sDirection == "H" ? nPos + "px" : 0, sDirection == "H" ? 0 : nPos + "px", this._bUseCss3d));
		}
	},

	/** Temporary **/
	/** FPS 확인 Start **/
	// start : function() {
	//     this._nCount = 0;
	//     this._nElapse = 0;
	//     this._nStart = Date.now();
	//     this._aData = [];
	// },

	// _fps : function() {
	//     if (this._nElapse > 300) {
	//         var cur = this._nCount / (this._nElapse / 1000);
	//         this._aData.push(cur);
	//         var nSum = 0;
	//         for(var i=0, nLength = this._aData.length; i< nLength; i++) {
	//              nSum += this._aData[i];
	//         }
	//         var o = {
	//             cur: cur,
	//             max: Math.max.apply(null, this._aData),
	//             min: Math.min.apply(null, this._aData),
	//             avg : nSum / this._aData.length
	//         };
	//         console.log("FPS current : " + o.cur + ", max : " + o.max + ", min : " + o.min + ", avg : " + o.avg);
	//         return o;
	//     }
	// },

	// end : function() {
	//     return this._fps();
	// },

	// tick : function() {
	//     var now = Date.now();
	//     this._nCount++;
	//     this._nElapse = Date.now() - this._nStart;
	//     return this._fps();
	// },
	/** FPS 확인 End **/

	/**
		jindo.m.Scroll 에서 사용하는 모든 객체를 release 시킨다.
		@method destroy
	**/
	destroy: function() {
		this.deactivate();
		this.detachAll();
		for(var p in this._htWElement) {
			this._htWElement[p] = null;
		}
		this._htWElement = null;
		this._oTouch.destroy();
		delete this._oTouch;
	}
}).extend(jindo.m.UIComponent);/**
    @fileOverview 대용량 스크롤 사용가능한 스크롤컴포넌트 플러그인
    @author sculove
    @version 1.17.0
    @since 2012. 7. 27.
**/
/**
    가로나 세로에 대해서만 적용됨.

    @class jindo.m.DynamicPlugin
    @extends jindo.m.Component
    @uses jindo.m.Scroll
    @keyword scroll, 스크롤
    @group Component
    @invisible
**/
jindo.m.DynamicPlugin = jindo.$Class({
    /* @lends jindo.m.DynamicPlugin.prototype */
    /**
        초기화 함수

        @ignore
        @constructor
        @param {String|HTMLElement} el Scroll할 Element (필수)
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Number} [htOption.nRatio=1.5] 고정범위 비
            @param {String} [htOption.sListElement="li"] 리스트 엘리먼트 태그
            @param {String} [htOption.sDirection="V"] 가로, 세로 여부
    **/
    $init : function(el,htUserOption) {
        this.option({
            nRatio : 1.5,
            sListElement : "li",
            sDirection : "V"
        });
        this.option(htUserOption || {});
        this._initVar(el);
        // this.refresh();
    },

    /**
        jindo.m.DynamicPlugin 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar: function(el) {
        this._wel = jindo.$Element(el);
        this._aListElement = null;
        this._nStartIdx = -1;
        this._nEndIdx = -1;
        this._nRatio = parseInt(this.option("nRatio"),10);
        this._nPos = -1;
        this._nSize = -1;
        this._sDirection = this.option("sDirection");
    },

    /**

        @param  {Number} nPos  현재 위치 정보
    **/
    refresh : function(nPos) {
        var aListElement = this._wel.queryAll(this.option("sListElement"));
        var wel;
        if(!aListElement) {
            return;
        }
        this._aListElement = [];
        for(var i=0, nLength = aListElement.length; i < nLength; i++) {
            wel = jindo.$Element(aListElement[i]);
            this._aListElement.push({
                el : wel.$value(),
                wel : wel,
                htRange : this._getElementPos(wel),
                sDisplay : wel.css("display"),
                sPosition : wel.css("position")
            });
        }
        this._nPos = nPos || 0;
        this._nSize = this._sDirection == "V" ? this._wel.height() : this._wel.width();
        this._covertPositionType();
    },

    /**
        포지션정보를 absolute로 변경하고 top,left값을 설정한다. 또한, 바깥영역의 엘리먼트를 hidden시킨다.
    **/
    _covertPositionType : function() {
        var nStartPos = this._getStartBoundary(),
            nEndPos = this._getEndBoundary();
        for(var i=0, ht, nLength = this._aListElement.length; i < nLength; i++) {
            ht = this._aListElement[i];
            if(this._sDirection == "V") {
                ht.wel.css({
                    "top" : ht.htRange.nStartPos + "px",
                    "width" : "100%"
                });
            } else {
                ht.wel.css({
                    "left" : ht.htRange.nStartPos + "px",
                    "height" : "100%"
                });
            }
            ht.wel.css("position","absolute");
            if(ht.htRange.nStartPos <= -nStartPos) {
                // ht.el.style.display = "none";
                this._nStartIdx = i;
            } else if(ht.htRange.nEndPos <= -nEndPos) {
                ht.el.style.display = ht.sDisplay;
                this._nEndIdx = i;
            } else {
                ht.el.style.display = "none";
            }
        }
    },

    /**
        위치 이동시 엘리먼트를 변경한다.
    **/
    updateListStatus : function(sDirection, nPos) {
        if(!this._aListElement) {
            return;
        }
        this._nPos = nPos;
        var nStartPos = this._getStartBoundary(),
            nEndPos = this._getEndBoundary(),
            nLength = this._aListElement.length,
            ht, i, nWelPos;

        if(sDirection == "forward") {
            for(i=this._nStartIdx+1; i<nLength;i++) {
                ht = this._aListElement[i];
                nWelPos = ht.htRange.nEndPos;
                if(nWelPos < -nStartPos) {
                    ht.el.style.display = "none";
                    this._nStartIdx = i;
                } else {
                    break;
                }
            }
            for(i=this._nEndIdx; i<nLength;i++) {
                ht = this._aListElement[i];
                nWelPos = ht.htRange.nStartPos;
                if(nWelPos < -nEndPos) {
                    ht.el.style.display = ht.sDisplay;
                    this._nEndIdx++;
                } else {
                    break;
                }
            }
        } else if(sDirection == "backward") {
            for(i=this._nEndIdx-1; i >= 0; i--) {
                ht = this._aListElement[i];
                nWelPos = ht.htRange.nStartPos;
                if(nWelPos < -nEndPos) {
                    break;
                } else {
                    ht.el.style.display = "none";
                    this._nEndIdx--;
                }
            }
            for(i=this._nStartIdx; i>=0; i--) {
                ht = this._aListElement[i];
                nWelPos = ht.htRange.nEndPos;
                if(nWelPos < -nStartPos) {
                    break;
                } else {
                    ht.el.style.display = ht.sDisplay;
                    this._nStartIdx--;
                }
            }
        }
    },

    /**
        상단 Range 위치를 반환한다.
        @return {Number} 상단 Range의 위치
    **/
    _getStartBoundary : function() {
        return this._nPos + (this._nSize * this._nRatio);
    },

    /**
        하단 Range 위치를 반환한다.
        @return {Number} 하단 Range의 위치
    **/
    _getEndBoundary : function() {
        return this._nPos - this._nSize - (this._nSize * this._nRatio);
    },

    /**
        엘리먼트의 위치를 반환한다.
        @param  {jindo.$Element} wel        대상 엘리먼트
        @return {Object}            nStartPos, nEndPos
    **/
    _getElementPos : function(wel) {
        var nStartPos,nEndPos;
        if(this._sDirection == "V") {
            nStartPos = wel.offset().top - this._wel.offset().top;
            nEndPos = nStartPos + wel.height();
        } else {
            nStartPos = wel.offset().left - this._wel.offset().left;
            nEndPos = nStartPos + wel.width();
        }
        return {
            nStartPos: nStartPos,
            nEndPos: nEndPos
        };
    }
}).extend(jindo.m.Component);/**
	지정한 방법으로 진행되는 애니메이션 동작의 특정 시점의 상황으로 만들어 주는 컴포넌트

	@author hooriza
	@version 1.17.0
	
	@class jindo.m.Keyframe
	@extends jindo.m.Component
	@uses jindo.m.Effect
	@keyword 애니메이션, animation, transition, keyframe
	
	@group Component

	@history 1.10.0 Release 최초 릴리즈
**/
jindo.m.Keyframe = jindo.$Class({

	/**
		Keyframe 컴포넌트를 생성한다.

		@constructor
		@param {Hash} [oOption] 옵션
			@param {Function} [oOption.fEffect=jindo.m.Effect.linear] 기본 애니메이션 효과
	**/
	$init : function(oOptions) {

		this._nCurFrame = null;
		this._nCurIdx = null;

		this._aKeyframeLists = [];
		this._oPreprocessed = null;
		this._bPreprocessed = false;

		this._oRAF = null;

		var oAgent = jindo.$Agent();
		var oOS = oAgent.os();
		var oNavigator = oAgent.navigator();

		this._bHasTransformRenderBug = oOS.ios && parseInt(oOS.version, 10) === 5 && oNavigator.msafari;

		this.option({ fEffect : jindo.m.Effect.linear, nAnimationDuration : 0 });
		this.option(oOptions || {});

		this._fDefaultEffect = this.option('fEffect')();

	},

	///////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////

	// 비동기 preprocess 을 위해 for-loop 대신에 사용
	_loop : function(bAsync, nLen, fBody, fDone) {

		(function loop(i) {

			fBody(i);

			if (++i < nLen) {

				if (bAsync) {
					(window.requestAnimationFrame || window.setTimeout)(
						function() { loop(i); }, 1000 / 60
					);
				} else {
					loop(i);
				}

				return;
			}

			fDone();

		})(0);

	},

	// preprocess 구현
	_preprocessKeyframes : function(bPreprocessAsync) {

		if (this._bPreprocessed) {
			this.fireEvent('preprocessEnd');
			return;
		}

		if (this._oPreprocessed) { return; }

		this._oPreprocessed = { objs : {}, frames : null };

		var aBefore = this._aKeyframeLists.sort(function(a, b) { return a.frame - b.frame; });
		var oAfter = {}, aAfter = [];

		var oIngFrame = {};
		var oFirstFrame = {}; // 맨 처음 frame 객체

		var self = this;

		// dynamic 속성 셋팅
		var step1 = function() {

			self._loop(bPreprocessAsync, aBefore.length, function(i) {

				var oFrame = aBefore[i];

				var nFrame = oFrame.frame;
				var sObjKey;
				var oVals = self._toPropObj(oFrame.propLists);

				var oPreprocessedFrame = oAfter[nFrame] = { 'frame' : nFrame, 'dynamic' : {}, 'static' : {} };
				aAfter.push(oPreprocessedFrame);

				for (sObjKey in oVals) if (oVals.hasOwnProperty(sObjKey)) {

					var nEndFrame = nFrame;
					var vEndVal = oVals[sObjKey];
					var fEffect = self._fDefaultEffect;

					// 효과가 지정된경우
					// ex) keyframe.set(2000, [ elEl, { '@left' : jindo.m.Effect.bounce('30px') } ]);
					if (typeof vEndVal === 'function') {
						fEffect = vEndVal;
						vEndVal = vEndVal.end;
					}

					var oIng = oIngFrame[sObjKey];

					if (oIng) { // 앞에서 같은 sObjKey 도 셋팅된게 있다면 종료값을 연장시켜줌

						oIng.effect = fEffect;
						oIng.frames[1] = nEndFrame;
						oIng.vals[1] = vEndVal;

						// if (fEffect.name === 'skip') {
						if (fEffect.effectConstructor === jindo.m.Effect.stepEnd) {
							oIng.vals[1] = oIng.vals[0];
						}
						/* @JINDOSUS-1745 이슈로 인해 이 코드가 없어야 잘 돌아감
						else if (fEffect.effectConstructor === jindo.m.Effect.stepStart) {
							oIng.vals[0] = oIng.vals[1];
						}*/

					}

					if (!(sObjKey in oFirstFrame)) {
						oFirstFrame[sObjKey] = vEndVal;
					}

					// 새로운 frame 객체 만듬
					oIngFrame[sObjKey] = { effect : null, frames : [ nEndFrame ] , vals : [ vEndVal ] };

				}

				for (sObjKey in oIngFrame) if (oIngFrame.hasOwnProperty(sObjKey)) {
					oAfter[nFrame]['dynamic'][sObjKey] = oIngFrame[sObjKey];
				}

			}, step2);

		};

		// static 속성 셋팅
		var step2 = function() {

			self._loop(bPreprocessAsync, aAfter.length, function(i) {

				var oFrame = aAfter[i];
				for (var sObjKey in oFirstFrame) if (oFirstFrame.hasOwnProperty(sObjKey)) {
					if (sObjKey in oFrame['dynamic']) { continue; }
					oFrame['static'][sObjKey] = oFirstFrame[sObjKey];
				}

			}, step3);

		};

		// 마무리 정리
		var step3 = function() {

			self._oPreprocessed.frames = aAfter;

			// 객체에 할당된 임시 키값 제거
			var oCache = self._oPreprocessed.objs;
			for (var sObjKey in oCache) if (oCache.hasOwnProperty(sObjKey)) {
				try {
					delete oCache[sObjKey].__KEYFRAME_UNIQ;
				} catch(e) {
					oCache[sObjKey].__KEYFRAME_UNIQ = undefined;
				}
			}

			oAfter = null;
			self._bPreprocessed = true;

			/**
				Preprocess 작업이 완료되었을때 발생하는 이벤트

				@event proprocessEnd
			**/
			self.fireEvent('preprocessEnd');

		};

		step1();

	},

	/**
		get, frame 메서드를 빠르게 사용할 수 있도록 set 으로 지정한 속성을 전처리한다.

		@remark
			set 메서드를 사용하여 규칙 속성이 변경 된 후에는 반드시 호출해야 하며,
			만약 preprocess 메서드를 호출하지 않고 get, frame 메서드를 사용하면 예외가 발생한다.

		@method preprocess
		@param {Boolean} [bPreprocessAsync=false]
			전처리 작업을 비동기적으로 진행 할 지 지정한다.
			동기로 진행하면 최대한 빠르게 처리되지만 처리되는 동안에 브라우저가 멈추는 문제가 있고,
			비동기로 진행하면 전처리 작업을 분할해서 진행하기 때문에 브라우저는 멈추지 않지만 처리 속도가 다소 느려진다.

		@chainable
		@return {jindo.m.Keyframe}

		@example
			var keyframe = new jindo.m.Keyframe();
			...
			keyframe.preprocess(false);
			keyframe.frame(0.5); // preprocess 를 동기적으로 처리했기 때문에 바로 frame 메서드 사용가능

		@example
			var keyframe = new jindo.m.Keyframe();
			...
			keyframe.attach('preprocessEnd', function() {
				// preprocess 를 비동기적으로 처리했기 때문에 preprocessEnd 이벤트가 발생한 후에 frame 메서드 사용가능
				keyframe.frame(0.5);
			});
			keyframe.preprocess(true);

	**/
	preprocess : function(bPreprocessAsync) {
		this._preprocessKeyframes(!!bPreprocessAsync);
		return this;
	},

	// 원하는 frame 의 prop 목록들 얻기
	_getPropLists : function(nFrame, bIncludeStatic) {

		// this.preprocess();

		var aPreprocessedLists = this._oPreprocessed.frames;

		// 필요한 인덱스
		var nDstIdx = aPreprocessedLists.length - 1;

		for (var i = 0, oFrame; oFrame = aPreprocessedLists[i]; i++) {
			if (oFrame.frame > nFrame) { // 원하는 frame 보다 큰 frame 으로 지정된 객체를 얻으면
				// 그 앞에껄로 인덱스 셋팅하고 중단
				nDstIdx = Math.max(0, i - 1); break;
			}
		}

		// console.warn('frame', [ nFrame ], '->', [ nDstIdx ]);

		var oDstLists = aPreprocessedLists[nDstIdx];
		var oPropLists = {};

		// console.log('nDstIdx : ', nDstIdx, oDstLists);

		// 원하는 frame 에 맞는 Dynamic Props 를 얻기
		oPropLists = this._getDynamicProps(oPropLists, nFrame, oDstLists);

		// bIncludeStatic 가 true 이거나 이전에 사용했던 인덱스값과 다른 경우
		if (bIncludeStatic || this._nCurIdx !== nDstIdx) {
			// 원하는 frame 에 맞는 Static Props 를 얻기
			oPropLists = this._getStaticProps(oPropLists, nFrame, oDstLists);
		}

		// 마지막으로 사용한 인덱스값 변경
		this._nCurIdx = nDstIdx;

		return oPropLists;

	},

	_get : function(nFrame, bIncludeStatic) {

		if (!this._bPreprocessed) {
			throw new Error('First, you need to call preprocess().');
		}

		var oPropLists = this._getPropLists(nFrame, bIncludeStatic);
		var oCache = this._oPreprocessed.objs;

		// console.log(oCache);

		var oObj, oProps;
		var aRet = [];

		for (var sObj in oPropLists) if (oPropLists.hasOwnProperty(sObj)) {

			oObj = oCache[sObj];
			oProps = oPropLists[sObj];

			aRet.push(oObj, oProps);

		}

		return aRet;

	},

	/**
		인자로 넣은 진행값인 경우 각 객체에 지정되어야 할 속성 값을 얻는다.

		@remark
			set 메서드를 사용 한 후에 get 메서드를 사용하려면 get 메서드 사용전에 preprocess 메서드를 반드시 한번 호출 해야 한다.

		@method get
		@param {Number} nFrame 진행값

		@return {Array} 객체와 속성 목록이 번갈아 들어있는 배열

		@example
			var keyframe = new jindo.m.Keyframe();

			keyframe.set(0, [ el, { '@left' : '100px' } ]);
			keyframe.set(100, [ el, { '@left' : '200px' } ]);
			keyframe.preprocess(false);

			LOG(keyframe.get(50)); // 결과 : [ el, { '@left' : '150px '} ]
	**/
	get : function(nFrame) {
		return this._get(nFrame, true);
	},

	/**
		인자로 넣은 진행값에 맞는 값으로 각 객체에 속성을 지정한다.

		@remark
			set 메서드를 사용 한 후에 frame 메서드를 사용하려면 frame 메서드 사용전에 preprocess 메서드를 반드시 한번 호출 해야 한다.

		@method frame
		@param {Number} nFrame 진행값
		@param {Boolean} bAll 모든 속성을 변경 (인접한 진행값으로 이동할 때 바꾸지 않아도 되는 속성도 함께 변경하고 싶을때 true 로 지정한다)

		@return {jindo.m.Keyframe}
		@chainable
	**/
	frame : function(nFrame, bAll) {

		var self = this;
		var nCurFrame = this._nCurFrame;

		if (!bAll && nFrame === nCurFrame) { return; }
		this._nCurFrame = nFrame;

		if (this._oRAF) {
			cancelAnimationFrame(this._oRAF);
			this._oRAF = null;
		}

		if (self._bPlaying) {
			self._frame(nCurFrame, bAll);
		}

		var nAnimationDuration = this.option('nAnimationDuration');
		if (nAnimationDuration && nCurFrame !== null) {

			var fValue = jindo.m.Effect.easeOut(
				// nCurFrame,
				// nFrame
				Math.round(nCurFrame * 1000000) / 1000000,
				Math.round(nFrame * 1000000) / 1000000
			);

			var nStart = new Date().getTime();
			var bFirst = true;

			self._bPlaying = true;

			(function loop() {
				self._oRAF = requestAnimationFrame(function() {
					var nFrame = Math.max(0, Math.min(1, (new Date() - nStart) / nAnimationDuration));
					self._frame(fValue(nFrame), bFirst);
					bFirst = false;
					self.oRAF = null;
					if (nFrame < 1) { return loop(); }
					self._bPlaying = false;
				});
			})();

			return;

		}

		return this._frame(nFrame, bAll);

	},

	_frame : function(nFrame, bAll) {

		var bHasTransformRenderBug = this._bHasTransformRenderBug;

		var aLists = this._get(nFrame, bAll);
		var oObj, oProps, welObj, vProp;

		var fp = null;
		var self = this;

		for (var i = 0, nLen = aLists.length; i < nLen; i += 2) {

			oObj = aLists[i];
			oObj = typeof oObj === 'function' ? oObj() : oObj;

			oProps = aLists[i + 1];

			fp = fp || function(oObj, oProps) {

				welObj = jindo.$Element(oObj);

				for (var sKey in oProps) if (oProps.hasOwnProperty(sKey)) {

					vProp = oProps[sKey];

					if (/^@(.*)$/.test(sKey)) {
						sKey = RegExp.$1;
						if (/transition/.test(sKey)) { vProp = self._getCSSVal(vProp); }

						if (bHasTransformRenderBug && '@transform' === sKey && ('@left' in oProps || '@top' in oProps)) {
							oObj.clientHeight;
						}

						welObj.$value().style[self._getCSSKey(sKey)] = vProp;

					} else {
						oObj[sKey] = vProp;
					}

				}

			};

			if (oObj instanceof Array) {
				for (var j = 0, nJen = oObj.length; j < nJen; j++) {
					fp(oObj[j], oProps);
				}
			} else {
				fp(oObj, oProps);
			}

		}

	},

	_getStaticProps : function(oOutProps, nFrame, oDstLists) {

		var oStaticPropLists = oDstLists['static'];

		// console.log('_applyProps', nFrame, oStaticPropLists);

		/****var oCache = this._oPreprocessed.objs;****/
		// var oIdx = {};

		for (var sObjKey in oStaticPropLists) if (/^(.+):(.+)$/.test(sObjKey)) {

			var sObj = RegExp.$1;
			var sKey = RegExp.$2;

			/****var oObj = oCache[sObj];****/
			var vProp = oStaticPropLists[sObjKey];

			oOutProps[sObj] = oOutProps[sObj] || {};
			oOutProps[sObj][sKey] = vProp; 

			/****
			if (/^@(.*)$/.test(sKey)) {
 				sKey = RegExp.$1;
				if (/transition/.test(sKey)) { vProp = this._getCSSVal(vProp); }
				jindo.$Element(oObj).css(this._getCSSKey(sKey), vProp);
			} else {
				oObj[sKey] = vProp;
			}
			****/

			//console.log('static >', [ sKey, vProp ]);

		}

		return oOutProps;

	},

	_getDynamicProps : function(oOutProps, nFrame, oDstLists) {

		var oDynamicPropLists = oDstLists['dynamic'];
		var oStaticPropLists = oDstLists['static'];

		/****var oCache = this._oPreprocessed.objs;****/
		var aDeleteObjKey = [];

		for (var sObjKey in oDynamicPropLists) if (/^(.+):(.+)$/.test(sObjKey)) {

			var sObj = RegExp.$1;
			var sKey = RegExp.$2;

			/****var oObj = oCache[sObj];****/
			var vProp = oDynamicPropLists[sObjKey];

			var fEffect = vProp.effect;
			var vStart = vProp.vals[0];
			var vEnd = vProp.vals[1];

			// 종료값이 없거나 시작값과 종료값이 같으면 static 속성으로 전환
			if (!fEffect || vStart === vEnd) {
				oStaticPropLists[sObjKey] = vStart;
				aDeleteObjKey.push(sObjKey);
				continue;
			}

			fEffect.start = vStart;
			fEffect.end = vEnd;

			if (/^@transform/.test(sKey)) {
				fEffect = this._getTransformFunction(fEffect);
			}

			var nEffectRate = Math.max(0, Math.min(1, (nFrame - vProp.frames[0]) / (vProp.frames[1] - vProp.frames[0])));

			try {
				vProp = fEffect(nEffectRate);
			} catch(e) { // Effect 로 변화시킬 수 없는 값이면 static 속성
				if (!/^unit error/.test(e.message)) { throw e; }
				oStaticPropLists[sObjKey] = vStart;
				aDeleteObjKey.push(sObjKey);
				continue;
			}

			oOutProps[sObj] = oOutProps[sObj] || {};
			oOutProps[sObj][sKey] = vProp; 

			/****
			if (/^@(.*)$/.test(sKey)) {
				sKey = RegExp.$1;
				if (/transition/.test(sKey)) { vProp = this._getCSSVal(vProp); }
				jindo.$Element(oObj).css(this._getCSSKey(sKey), vProp);
			} else {
				oObj[sKey] = vProp;
			}
			****/

			//console.log('dynamic >', [sKey, vProp]);

		}

		for (var i = 0, nLen = aDeleteObjKey.length; i < nLen; i++) {
			delete oDynamicPropLists[aDeleteObjKey[i]];
		}

		aDeleteObjKey.length = null;

		return oOutProps;

	},

	_toPropObj : function(aPropLists) {

		var oRet = {};
		var oCache = this._oPreprocessed.objs;

		function fpGetString(oObj) {

			var sRand;

			if (typeof oObj === 'object') {
				sRand = oObj.__KEYFRAME_UNIQ = oObj.__KEYFRAME_UNIQ || Math.floor(Math.random() * new Date().getTime()) + '';
			} else {
				for (var k in oCache) if (oCache.hasOwnProperty(k)) {
					if (oCache[k] === oObj) { return k; }
				}
				sRand = Math.floor(Math.random() * new Date().getTime()) + '';
			}

			oCache[sRand] = oObj;
			return sRand;

		}

		for (var i = 0, nLen = aPropLists.length; i < nLen; i += 2) {

			var oObj = aPropLists[i];
			if (!oObj) { continue; }

			var oProps = aPropLists[i + 1];

			var sObj = fpGetString(oObj);

			for (var k in oProps) if (oProps.hasOwnProperty(k)) {
				oRet[sObj + ':' + k] = oProps[k];
			}

			// oRet[sObj] = oProps;

		}

		return oRet;

	},

	/**
		특정 진행값의 상황에서의 각 객체가 가져야 할 속성 값을 지정한다.

		@method set
		@param {Number} nFrame 진행값
		@param {Array} aPropLists 객체와 속성 목록이 번갈아 들어있는 배열

		@return {jindo.m.Keyframe}
		@chainable

		@history 1.14.0 Update 객체로 배열이나 함수를 지정하여 여러개를 동시에 지정하거나 함수의 리턴값을 사용하여 지정할 수 있도록 개선

		@example
			var keyframe = new jindo.m.Keyframe();
			...
			keyframe.set(0.0, [
				elFoo, {
					'scrollTop' : 100,
					'@left' : '200px',
					'@transform' : 'translateY(30px) rotate(30deg)'
				}
			]);
			
			keyframe.set(1.0, [
				elFoo, {
					'scrollTop' : jindo.m.Effect.bounce(100), // 특정 속성에 대해서 다른 효과로 변화하도록 지정 가능
					'@left' : '200px',
					'@transform' : 'translateY(-100px) rotate(270deg)'
				}
			]);

			keyframe.set(0.5, [
				[ elFoo, elBar ], {
					'@left' : '100px'
				}
			]);

			keyframe.set(0.5, [
				function() { return elFoo; }, {
					'@left' : '100px'
				}
			]);

			keyframe.set(0.5, [
				function() { return [ elFoo, elBar ]; }, {
					'@left' : '100px'
				}
			]);
	**/
	/**
		특정 객체가 각 진행값의 상황에서의 가져야 할 속성 값을 지정한다.

		@method set
		@param {HTMLElement} elObj 객체
		@param {Object} oProps 객체가 각 상황에서 가져야 할 속성들

		@return {jindo.m.Keyframe}
		@chainable

		@example
			keyframe.set(jindo.$('cover'), { // Case #1
				'@background-color' : {
					0.0 : '#444',
					1.0 : '#aaa'
				},
				'scrollTop' : {
					0.0 : 30,
					0.5 : 50,
					1.0 : 200
				}
			});

			keyframe.set(jindo.$('cover'), { // Case #2
				0.0 : {
					'@background-color' : '#444',
					'scrollTop' : 30
				},
				0.5 : {
					'scrollTop' : 50
				},
				1.0 : {
					'@background-color' : '#aaa',
					'scrollTop' : 200
				}
			});
	**/	
	set : function(nFrame, aPropLists) {

		if (typeof nFrame === 'number') {

			this._aKeyframeLists.push({ frame : nFrame, propLists : aPropLists });
			this._oPreprocessed = null;
			this._bPreprocessed = false;
			this._nCurIdx = null;

			return this;

		}

		var elObj = nFrame;
		var oProps = aPropLists;

		var oEachRate = {};
		var caseNum = null;

		var sPropsName;

		for (var sMainKey in oProps) if (oProps.hasOwnProperty(sMainKey)) {

			caseNum = caseNum || (isNaN(sMainKey) ? 1 : 2);

			var oLists = oProps[sMainKey];
			for (var sSubKey in oLists) if (oLists.hasOwnProperty(sSubKey)) {

				nFrame = caseNum === 1 ? sSubKey : sMainKey;
				sPropsName = caseNum === 1 ? sMainKey : sSubKey;

				oEachRate[nFrame] = oEachRate[nFrame] || {};
				oEachRate[nFrame][sPropsName] = oLists[sSubKey];
			}

		}

		for (var sValue in oEachRate) if (oEachRate.hasOwnProperty(sValue)) {
			nFrame = sValue*1;
			this.set(nFrame, [ elObj, oEachRate[sValue] ]);
		}		

		return this;

	},

	///////////////////////////////////////////////////////////////////////////////////////////////////
	/// UTIL 성격의 메서드
	///////////////////////////////////////////////////////////////////////////////////////////////////
	_oProperPrefix : {},

	// 지정된 스타일에 적당한 CSS prefix 얻기
	_getProperPrefix : function(sType) {

		var oProperPrefix = this._oProperPrefix;
		if (sType in oProperPrefix) { // 캐싱되어 있는 값이 있으면 그걸 쓰기
			return oProperPrefix[sType];
		}

		var oBodyStyle = document.body.style;
		var aPrefix = [ 'webkit', '', 'Moz', 'O', 'ms' ];
		var sPrefix, sFullType;

		var fReplacer = function(s) { return s.toUpperCase(); };

		for (var i = 0, nLen = aPrefix.length; i < nLen; i++) {
			sPrefix = aPrefix[i];
			sFullType = sPrefix + (sPrefix ? sType.replace(/^[a-z]/, fReplacer) : sType);
			if (sFullType in oBodyStyle) {
				return (oProperPrefix[sType] = sPrefix);
			}
		}

		return (oProperPrefix[sType] = '');

	},

	// Jindo 하위버젼을 사용할 것을 대비해서 CSS prefix 를 붙혀주는 코드를 별도 구현
	_getCSSKey : function(sName) {

		var self = this;
		var sPrefix = '';

		var sFullname = sName.replace(/^(\-(webkit|o|moz|ms)\-)?([a-z]+)/, function(_, __, _sPrefix, sType) {
			sPrefix = _sPrefix || self._getProperPrefix(sType); // prefix 가 명시적으로 지정되어 있지 않으면 적당한 prefix 을 얻어서 지정
			if (sPrefix) { sType = sType.replace(/^[a-z]/, function(s) { return s.toUpperCase(); }); }
			return sType;
		}).replace(/\-(\w)/g, function(_, sChar) { // -소문자 를 대문자로 변경
			return sChar.toUpperCase();
		});

		return (({ 'o' : 'O', 'moz' : 'Moz', 'webkit' : 'Webkit' })[sPrefix] || sPrefix) + sFullname;

	},

	// Jindo 하위버젼을 사용할 것을 대비해서 CSS prefix 를 붙혀주는 코드를 별도 구현
	_getCSSVal : function(sName) {

		var self = this;

		var sFullname = sName.replace(/(^|\s)(\-(webkit|moz|o|ms)\-)?([a-z]+)/g, function(_, sHead, __, sPrefix, sType) {
			sPrefix = sPrefix || self._getProperPrefix(sType); // prefix 가 명시적으로 지정되어 있지 않으면 적당한 prefix 을 얻어서 지정
			return sHead + (sPrefix && '-' + sPrefix + '-') + sType;
		});

		return sFullname;

	},

	/**
		transform CSS 속성값을 파싱
		예)
			_parseTransformText('scale3d(2, 1.5, 1) translate(100px, 30px) rotate(10deg)');

			-> {
				'scaleX' : '2',
				'scaleY' : '1.5',
				'scaleZ' : '1',
				'translateX' : '100px',
				'translateY' : ' 30px',
				'rotate' : '10deg'
			}
	**/
	_parseTransformText : function(sText) {

		sText = sText || '';

		var oRet = {};

		sText.replace(/([\w\-]+)\(([^\)]*)\)/g, function(_, sKey, sVal) {

			var aVal = sVal.split(/\s*,\s*/);

			switch (sKey) {
			case 'translate3d':
			case 'scale3d':
			case 'skew3d':
				sKey = sKey.replace(/3d$/, '');
				oRet[sKey + 'Z'] = aVal[2];
				// cont. X, Y 도 마저 셋팅 되도록 일부러 break 안 넣었음

			case 'translate':
			case 'scale':
			case 'skew':
				oRet[sKey + 'X'] = aVal[0];

				if (typeof aVal[1] === 'undefined') {
					if (sKey === 'scale') { oRet[sKey + 'Y'] = aVal[0]; }
				} else {
					oRet[sKey + 'Y'] = aVal[1];
				}

				break;

			default:
				oRet[sKey] = aVal.join(',');
				break;
			}

		});

		return oRet;

	},

	/**
		Effect 컴퍼넌트의 기능을 사용 할 수 없는 시작값과 종료값을 가진 Effect 객체를 동작 할 수 있게 만들어 주는 함수

		var my = jindo.m.Effect.linear();
		 
		my.start = 'scale3d(2, 1.5, 1) translate(100px, 30px) rotate(10deg)';
		my.end = 'translateX(300px)';
		 
		var func = ..._getTransformFunction(my);
		func(0.5); // 'scaleX(2) scaleY(1.5) scaleZ(1) translateX(200px) translateY(30px) rotate(10deg)'
	**/
	_getTransformFunction : function(fEffect) {

		var sKey;

		var vDepa = fEffect.start;
		var vDest = fEffect.end;

		// 시작값과 종료값을 각각 파싱
		var oDepa = this._parseTransformText(vDepa);
		var oDest = this._parseTransformText(vDest);

		var oProp = {};

		// 시작값에 있는 내용으로 속성들 셋팅
		for (sKey in oDepa) if (oDepa.hasOwnProperty(sKey)) {
			// 시작값, 종료값 셋팅 (만약 종료값이 지정되어 있지 않으면 1 또는 0 셋팅)
			oProp[sKey] = [ oDepa[sKey], oDest[sKey] || (/^scale/.test(sKey) ? 1 : 0) ];
		}

		// 종료값에 있는 내용으로 속성들 셋팅
		for (sKey in oDest) if (oDest.hasOwnProperty(sKey) && !(sKey in oDepa)) { // 이미 셋팅되어 있지 않는 경우에만
			// 시작값, 종료값 셋팅 (만약 시작값이 지정되어 있지 않으면 1 또는 0 셋팅)
			oProp[sKey] = [ oDepa[sKey] || (/^scale/.test(sKey) ? 1 : 0), oDest[sKey] ];
		}

		// Effect 함수를 대체 할 함수 만듬
		var fpFunc = function(nValue) {

			var aRet = [];
			var aBackup = [ fEffect.start, fEffect.end ];

			// 각 속성마다 루프를 돌아 계산함
			for (var sKey in oProp) if (oProp.hasOwnProperty(sKey)) {

				fEffect.start = oProp[sKey][0];
				fEffect.end = oProp[sKey][1];

				aRet.push(sKey + '(' + fEffect(nValue) + ')');
			}

			fEffect.start = aBackup[0];
			fEffect.end = aBackup[1];

			// 계산 결과 반환
			return aRet.join(' ');

		};

		fpFunc.start = vDepa;
		fpFunc.end = vDest;

		return fpFunc;

	}

}).extend(jindo.m.Component);
/**
    @fileOverview Pull/Down기능을 사용하는 플러그인.
    @author sculove
    @version 1.17.0
    @since 2013. 1. 11.
**/
/**
    @class jindo.m.PullPlugin
    @extends jindo.m.Component
    @uses jindo.m.Scroll
    @keyword scroll, 스크롤
    @group Component
    @invisible
    
    @history 1.6.0 Release 최초 릴리즈
**/
jindo.m.PullPlugin = jindo.$Class({
    /* @lends jindo.m.PullPlugin.prototype */
    /**
        초기화 함수

        @constructor
        @param {Object} [oParent] Plugin 을 사용하기 위한 상위(Parent) object
    **/
    $init : function(oParent) {
        this.option(oParent.option());
        this._initVar(oParent);
        this._initPullDownFunc();
        this._initPullUpFunc();
    },

    /**
        jindo.m.PullPlugin 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar: function(oParent) {
        this._oParent = oParent;
        this._htWElement = oParent._htWElement;
        this._isPullDown = false;
        this._isPullUp = false;
        this._isUpdating = false;
        this._nOrgMaxScrollTop = null;

        this._htWElement["pullDown"] = jindo.$Element(this._htWElement["wrapper"].query("." + this.option("sClassPrefix") + "pullDown"));
        this._htWElement["pullUp"] = jindo.$Element(this._htWElement["wrapper"].query("." + this.option("sClassPrefix") + "pullUp"));
    },
    
    /**
        pull Down/up 관련 상태을 초기화합니다.
    **/
    refresh : function() {
        this.option(this._oParent.option());
        this._isUpdating = false;
        this._nOrgMaxScrollTop = null;

        this._isPullDown = this.option("bUsePullDown") && this.option("bUseVScroll") && !this.option("bUseHScroll") && this.option("bUseBounce") && (this._htWElement["pullDown"] !== null);
        this._isPullUp = this.option("bUsePullUp") && this.option("bUseVScroll") && !this.option("bUseHScroll") && this.option("bUseBounce") && (this._htWElement["pullUp"] !== null);
        
        if (this._isPullDown && this.option("fnPullDownIdle")) {
            this._htWElement["pullDown"]._isReady_ = false;
            this._htWElement["pullDown"].show();
            this.option("fnPullDownIdle")(this._htWElement["pullDown"]);
        }
        if (this._isPullUp && this.option("fnPullUpIdle")) {
            this._htWElement["pullUp"]._isReady_ = false;
            this._htWElement["pullUp"].show();
            this.option("fnPullUpIdle")(this._htWElement["pullUp"]);
        }
        // Pulldown/up에 대한 처리
        if(!this.option("bUseVScroll")) {
            if(this._htWElement["pullDown"] !== null) {
                this._htWElement["pullDown"].hide();
            }
            if(this._htWElement["pullUp"] !== null) {
                this._htWElement["pullUp"].hide();
            }
        }

        // pulldown 상태 정리 후 스크롤 사이즈 변경
        this._oParent.nScrollW = this._htWElement["scroller"].width();
        this._oParent.nScrollH = this._htWElement["scroller"].height() - this._getBottomMargin();
        this._oParent.nMinScrollTop = -this._getTopMargin();
        this._oParent.nMaxScrollTop = this._oParent.nWrapperH - this._oParent.nScrollH;
    },

    _getTopMargin : function() {
        return (this._isPullDown ? this._htWElement["pullDown"].height() : 0) + this.option("nOffsetTop");
    },

    _getBottomMargin : function() {
        return (this._isPullUp ? this._htWElement["pullUp"].height() : 0) + this.option("nOffsetBottom");
    },
    
    /**
        pull down 관련 함수 옵션이 설정되지 않았을 경우 초기화한다.
    **/
    _initPullDownFunc : function() {
        if(this.option("bUsePullDown") === true) {
            if(!this.option("fnPullDownIdle")) {
                this.option("fnPullDownIdle", function(wel) {
                    wel.html("업데이트하시려면 아래로 내려주세요");
                });
            }
            if(!this.option("fnPullDownBeforeUpdate")) {
                this.option("fnPullDownBeforeUpdate", function(wel) {
                    wel.html("업데이트 합니다");
                });
            }
            if(!this.option("fnPullDownUpdating")) {
                this.option("fnPullDownUpdating", function(wel) {
                    wel.html("업데이트 중입니다...");
                });
            }
        }
    },

	/**
	 * Pull up 관련 함수 옵션이 설정되지 않았을 경우 초기화 한다.
	 */
    _initPullUpFunc : function() {
        if(this.option("bUsePullUp") === true) {
            if(!this.option("fnPullUpIdle")) {
                this.option("fnPullUpIdle", function(wel) {
                    wel.html("더 보시려면 위로 올려주세요");
                });
            }
            if(!this.option("fnPullUpBeforeUpdate")) {
                this.option("fnPullUpBeforeUpdate", function(wel) {
                    wel.html("로드 합니다");
                });
            }
            if(!this.option("fnPullUpUpdating")) {
                this.option("fnPullUpUpdating", function(wel) {
                    wel.html("로드 중...");
                });
            }
        }
    },
    
    /**
        Update적용시 touchMove 기능 처리
        - notice => ready => pullDown/up 상태

        @param {Jindo.$Event} we
    **/
    touchMoveForUpdate : function(we, nMaxScrollTop) {
        if (this._isUpdating) {
            return;
        }
        var nTopMargin = this._getTopMargin(),
            nBottomMargin = this._getBottomMargin();

        // nOrgMax값이 있을 경우
        nMaxScrollTop = this._nOrgMaxScrollTop || nMaxScrollTop;

        // 위에인 경우
        if (this._isPullDown) {
            if (this._htWElement["pullDown"]._isReady_) {
                if (nTopMargin > this._oParent._nTop) {
                    this._htWElement["pullDown"]._isReady_ = false;
                    if (this.option("fnPullDownIdle")) {
                        this.option("fnPullDownIdle")(this._htWElement["pullDown"]);
                        this._oParent.nMinScrollTop=-nTopMargin;
                    }
                }
            } else {
                if (this._oParent._nTop > nTopMargin) {
                    this._htWElement["pullDown"]._isReady_ = true;
                    if (this.option("fnPullDownBeforeUpdate")) {
                        this.option("fnPullDownBeforeUpdate")(this._htWElement["pullDown"]);
                        this._oParent.nMinScrollTop=0;
                    }
                }
            }
        }

        // 아래인 경우
        if (this._isPullUp) {
            if (this._htWElement["pullUp"]._isReady_) {
                if (this._oParent._nTop >= (nMaxScrollTop - nBottomMargin)) {
                    this._htWElement["pullUp"]._isReady_ = false;
                    if (this.option("fnPullUpIdle")) {
                        this.option("fnPullUpIdle")(this._htWElement["pullUp"]);
                        this._oParent.nMaxScrollTop=nMaxScrollTop;
                    }
                }
            } else {
                if (this._oParent._nTop < (this._oParent.nMaxScrollTop - nBottomMargin)) {
                    this._htWElement["pullUp"]._isReady_ = true;
                    if (this.option("fnPullUpBeforeUpdate")) {
                        this.option("fnPullUpBeforeUpdate")(this._htWElement["pullUp"]);
                        this._nOrgMaxScrollTop = nMaxScrollTop;
                        this._oParent.nMaxScrollTop= nMaxScrollTop - nBottomMargin;
                    }
                }
            }
        }
    },
    
    /**
     * 스크롤이 끝나고 Scroll 객체에서 호출되는 함수
     */
	pullUploading : function() {
        var isUp = null,
            wel = null;
        if(this._isPullDown && this._htWElement["pullDown"]._isReady_) {
            wel = this._htWElement["pullDown"];
            isUp = isUp || false;
        }
        if(this._isPullUp && this._htWElement["pullUp"]._isReady_) {
            wel = this._htWElement["pullUp"];
            isUp = isUp || true;
        }
        if(!wel){
            return false;
        }
        var fn = isUp ? this.option("fnPullUpUpdating") : this.option("fnPullDownUpdating"),
        self = this;

        this._isUpdating = true;
        wel._isReady_ = false;

        if (fn) {
            setTimeout(function(){
                fn(wel);
                if (isUp) {
                    self._fireEventPullUp();
                } else {
                    self._fireEventPullDown();
                }
            }, 0);
        }
    },
    
    
    /**
     * Scroll객체에서 사용자 정의한 함수 호출
     * pull down이 발생했을때 호출
     */
    _fireEventPullDown : function() {
        if(!this._htWElement) {
            return;
        }

        this._oParent.fireEvent("pullDown", {
            welElement : this._htWElement["pullDown"],
            oScroll : this._oParent
        });
    },
    
    /**
        pullUp 사용자 이벤트를 호출한다.
        pull up이 발생했을때 호출
    **/
    _fireEventPullUp : function() {
        if(!this._htWElement) {
            return;
        }

        this._oParent.fireEvent("pullUp", {
            welElement : this._htWElement["pullUp"],
            oScroll : this._oParent
        });
    }
}).extend(jindo.m.Component);