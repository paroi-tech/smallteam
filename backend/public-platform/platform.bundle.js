/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "../shared-ui/TeamCreationDialog/TeamCreationDialog.monk":
/*!***************************************************************!*\
  !*** ../shared-ui/TeamCreationDialog/TeamCreationDialog.monk ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Monkberry = __webpack_require__(/*! monkberry */ "../shared-ui/node_modules/monkberry/monkberry.js");

/**
 * @class
 */
function TeamCreationDialog() {
  Monkberry.call(this);
  var _this = this;

  // Create elements
  var dialog0 = document.createElement('dialog');
  var header1 = document.createElement('header');
  var img2 = document.createElement('img');
  var p3 = document.createElement('p');
  var div4 = document.createElement('div');
  var div5 = document.createElement('div');
  var h16 = document.createElement('h1');
  var div7 = document.createElement('div');
  var label8 = document.createElement('label');
  var span9 = document.createElement('span');
  var span10 = document.createElement('span');
  var input11 = document.createElement('input');
  var label12 = document.createElement('label');
  var span13 = document.createElement('span');
  var span14 = document.createElement('span');
  var input15 = document.createElement('input');
  var div16 = document.createElement('div');
  var h117 = document.createElement('h1');
  var label18 = document.createElement('label');
  var span19 = document.createElement('span');
  var span20 = document.createElement('span');
  var input21 = document.createElement('input');
  var div22 = document.createElement('div');
  var label23 = document.createElement('label');
  var span24 = document.createElement('span');
  var span25 = document.createElement('span');
  var input26 = document.createElement('input');
  var label27 = document.createElement('label');
  var span28 = document.createElement('span');
  var span29 = document.createElement('span');
  var input30 = document.createElement('input');
  var label31 = document.createElement('label');
  var span32 = document.createElement('span');
  var span33 = document.createElement('span');
  var input34 = document.createElement('input');
  var label35 = document.createElement('label');
  var span36 = document.createElement('span');
  var span37 = document.createElement('span');
  var input38 = document.createElement('input');
  var div39 = document.createElement('div');
  var button40 = document.createElement('button');
  var span41 = document.createElement('span');
  var button42 = document.createElement('button');

  // Construct dom
  img2.setAttribute("class", "TeamCreationDialog-warning");
  img2.setAttribute("src", "svg/feather/alert-triangle.svg");
  p3.appendChild(document.createTextNode("This service is available for testing only."));
  header1.appendChild(img2);
  header1.appendChild(p3);
  header1.setAttribute("class", "TeamCreationDialog-header");
  h16.appendChild(document.createTextNode("Your team"));
  h16.setAttribute("class", "FieldGroup-title");
  span9.appendChild(document.createTextNode("Subdomain"));
  span9.setAttribute("class", "Field-lbl");
  input11.setAttribute("class", "Field-input");
  input11.setAttribute("type", "text");
  input11.setAttribute("pattern", "^[a-z][a-z0-9]+");
  input11.setAttribute("spellcheck", "false");
  span10.appendChild(input11);
  span10.setAttribute("class", "Field-deco -leftBlue");
  label8.appendChild(span9);
  label8.appendChild(span10);
  label8.setAttribute("class", "FieldGroup-item Field");
  span13.appendChild(document.createTextNode("Team name"));
  span13.setAttribute("class", "Field-lbl");
  input15.setAttribute("class", "Field-input");
  input15.setAttribute("type", "text");
  input15.setAttribute("spellcheck", "false");
  span14.appendChild(input15);
  span14.setAttribute("class", "Field-deco -leftBlue");
  label12.appendChild(span13);
  label12.appendChild(span14);
  label12.setAttribute("class", "FieldGroup-item Field");
  div7.appendChild(label8);
  div7.appendChild(label12);
  div7.setAttribute("class", "FieldGroup-multiItem");
  div5.appendChild(h16);
  div5.appendChild(div7);
  div5.setAttribute("class", "FieldGroup");
  h117.appendChild(document.createTextNode("Your account"));
  h117.setAttribute("class", "FieldGroup-title");
  span19.appendChild(document.createTextNode("Your email address"));
  span19.setAttribute("class", "Field-lbl");
  input21.setAttribute("class", "Field-input");
  input21.setAttribute("type", "email");
  input21.setAttribute("required", "");
  input21.setAttribute("spellcheck", "false");
  span20.appendChild(input21);
  span20.setAttribute("class", "Field-deco -leftBlue");
  label18.appendChild(span19);
  label18.appendChild(span20);
  label18.setAttribute("class", "FieldGroup-item Field");
  span24.appendChild(document.createTextNode("Login"));
  span24.setAttribute("class", "Field-lbl");
  input26.setAttribute("class", "Field-input");
  input26.setAttribute("type", "text");
  input26.setAttribute("pattern", "^[a-z][a-z0-9]+");
  input26.setAttribute("spellcheck", "false");
  span25.appendChild(input26);
  span25.setAttribute("class", "Field-deco -leftBlue");
  label23.appendChild(span24);
  label23.appendChild(span25);
  label23.setAttribute("class", "FieldGroup-item Field");
  span28.appendChild(document.createTextNode("Name"));
  span28.setAttribute("class", "Field-lbl");
  input30.setAttribute("class", "Field-input");
  input30.setAttribute("type", "text");
  span29.appendChild(input30);
  span29.setAttribute("class", "Field-deco -leftBlue");
  label27.appendChild(span28);
  label27.appendChild(span29);
  label27.setAttribute("class", "FieldGroup-item Field");
  div22.appendChild(label23);
  div22.appendChild(label27);
  div22.setAttribute("class", "FieldGroup-multiItem");
  span32.appendChild(document.createTextNode("Password"));
  span32.setAttribute("class", "Field-lbl");
  input34.setAttribute("class", "Field-input");
  input34.setAttribute("type", "password");
  span33.appendChild(input34);
  span33.setAttribute("class", "Field-deco -leftBlue");
  label31.appendChild(span32);
  label31.appendChild(span33);
  label31.setAttribute("class", "FieldGroup-item Field");
  span36.appendChild(document.createTextNode("Confirm your password"));
  span36.setAttribute("class", "Field-lbl");
  input38.setAttribute("class", "Field-input");
  input38.setAttribute("type", "password");
  span37.appendChild(input38);
  span37.setAttribute("class", "Field-deco -leftBlue");
  label35.appendChild(span36);
  label35.appendChild(span37);
  label35.setAttribute("class", "FieldGroup-item Field");
  span41.setAttribute("class", "WithLoader-l");
  span41.setAttribute("hidden", "");
  button40.appendChild(document.createTextNode(" Submit "));
  button40.appendChild(span41);
  button40.setAttribute("class", "FieldGroup-action Btn WithLoader -right");
  button40.setAttribute("type", "button");
  button42.appendChild(document.createTextNode("Cancel"));
  button42.setAttribute("class", "Btn");
  button42.setAttribute("type", "button");
  div39.appendChild(button40);
  div39.appendChild(document.createTextNode(" "));
  div39.appendChild(button42);
  div16.appendChild(h117);
  div16.appendChild(label18);
  div16.appendChild(div22);
  div16.appendChild(label31);
  div16.appendChild(label35);
  div16.appendChild(div39);
  div16.setAttribute("class", "FieldGroup");
  div4.appendChild(div5);
  div4.appendChild(div16);
  div4.setAttribute("class", "TeamCreationDialog-content");
  dialog0.appendChild(header1);
  dialog0.appendChild(div4);
  dialog0.setAttribute("class", "TeamCreationDialog");

  // Directives
  var refDirective0;
  var refDirective1;
  var refDirective2;
  var refDirective3;
  var refDirective4;
  var refDirective5;
  var refDirective6;
  var refDirective7;
  var refDirective8;
  var refDirective9;

  // Extra render actions
  this.onRender = function () {
    if (refDirective0 === undefined) {
      refDirective0 = new _this.directives.ref();
    }
    refDirective0.bind(input11);
    refDirective0.update("subdomain");
    if (refDirective1 === undefined) {
      refDirective1 = new _this.directives.ref();
    }
    refDirective1.bind(input15);
    refDirective1.update("teamName");
    if (refDirective2 === undefined) {
      refDirective2 = new _this.directives.ref();
    }
    refDirective2.bind(input21);
    refDirective2.update("email");
    if (refDirective3 === undefined) {
      refDirective3 = new _this.directives.ref();
    }
    refDirective3.bind(input26);
    refDirective3.update("login");
    if (refDirective4 === undefined) {
      refDirective4 = new _this.directives.ref();
    }
    refDirective4.bind(input30);
    refDirective4.update("name");
    if (refDirective5 === undefined) {
      refDirective5 = new _this.directives.ref();
    }
    refDirective5.bind(input34);
    refDirective5.update("password");
    if (refDirective6 === undefined) {
      refDirective6 = new _this.directives.ref();
    }
    refDirective6.bind(input38);
    refDirective6.update("confirm");
    if (refDirective7 === undefined) {
      refDirective7 = new _this.directives.ref();
    }
    refDirective7.bind(span41);
    refDirective7.update("spinner");
    if (refDirective8 === undefined) {
      refDirective8 = new _this.directives.ref();
    }
    refDirective8.bind(button40);
    refDirective8.update("submitBtn");
    if (refDirective9 === undefined) {
      refDirective9 = new _this.directives.ref();
    }
    refDirective9.bind(button42);
    refDirective9.update("cancelBtn");
  };

  // On remove actions
  this.onRemove = function (__data__) {
    refDirective0.unbind(input11);
    refDirective1.unbind(input15);
    refDirective2.unbind(input21);
    refDirective3.unbind(input26);
    refDirective4.unbind(input30);
    refDirective5.unbind(input34);
    refDirective6.unbind(input38);
    refDirective7.unbind(span41);
    refDirective8.unbind(button40);
    refDirective9.unbind(button42);
  };

  // Set root nodes
  this.nodes = [dialog0];
}
TeamCreationDialog.prototype = Object.create(Monkberry.prototype);
TeamCreationDialog.prototype.constructor = TeamCreationDialog;
TeamCreationDialog.pool = [];
TeamCreationDialog.prototype.update = function (__data__) {
};

module.exports = TeamCreationDialog;


/***/ }),

/***/ "../shared-ui/TeamCreationDialog/TeamCreationDialog.ts":
/*!*************************************************************!*\
  !*** ../shared-ui/TeamCreationDialog/TeamCreationDialog.ts ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return TeamCreationDialog; });
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tomko/lt-monkberry */ "../shared-ui/node_modules/@tomko/lt-monkberry/lt-monkberry.min.js");
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _shared_libraries_helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shared/libraries/helpers */ "../shared/libraries/helpers.ts");
/* harmony import */ var _libraries_Deferred__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../libraries/Deferred */ "../shared-ui/libraries/Deferred.ts");
/* harmony import */ var _libraries_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../libraries/utils */ "../shared-ui/libraries/utils.ts");
/* harmony import */ var _modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../modalDialogs/modalDialogs */ "../shared-ui/modalDialogs/modalDialogs.ts");





const template = __webpack_require__(/*! ./TeamCreationDialog.monk */ "../shared-ui/TeamCreationDialog/TeamCreationDialog.monk");
class TeamCreationDialog {
    constructor(dash) {
        this.dash = dash;
        this.canSetTeamName = true;
        this.canSetName = true;
        this.canSetLogin = true;
        let view = Object(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__["render"])(template);
        this.el = view.rootEl();
        this.subdomainEl = view.ref("subdomain");
        this.teamNameEl = view.ref("teamName");
        this.emailEl = view.ref("email");
        this.loginEl = view.ref("login");
        this.nameEl = view.ref("name");
        this.passwordEl = view.ref("password");
        this.confirmEl = view.ref("confirm");
        this.spinnerEl = view.ref("spinner");
        view.ref("submitBtn").addEventListener("click", () => this.onSubmit());
        view.ref("cancelBtn").addEventListener("click", () => {
            if (this.curDfd) {
                this.curDfd.reject("Process canceled");
                this.curDfd = undefined;
                this.el.close();
            }
        });
        this.subdomainEl.addEventListener("input", () => {
            if (!this.canSetTeamName)
                return;
            if (!this.subdomainEl.validity.valid)
                this.teamNameEl.value = "";
            else
                this.teamNameEl.value = Object(_shared_libraries_helpers__WEBPACK_IMPORTED_MODULE_1__["toTitleCase"])(this.subdomainEl.value);
        });
        this.teamNameEl.addEventListener("oninput", () => this.canSetTeamName = false);
        this.emailEl.addEventListener("input", () => {
            if (!this.canSetLogin && !this.canSetName)
                return;
            if (!this.emailEl.validity.valid) {
                this.loginEl.value = this.canSetLogin ? "" : this.loginEl.value;
                this.nameEl.value = this.canSetName ? "" : this.nameEl.value;
                return;
            }
            let parts = this.emailEl.value.split("@");
            let str = parts[0].toLocaleLowerCase();
            let lowerStr = str.replace(/\W/g, "_");
            if (this.canSetLogin && !Object(_shared_libraries_helpers__WEBPACK_IMPORTED_MODULE_1__["whyUsernameIsInvalid"])(lowerStr))
                this.loginEl.value = lowerStr;
            if (this.canSetName)
                this.nameEl.value = Object(_shared_libraries_helpers__WEBPACK_IMPORTED_MODULE_1__["toTitleCase"])(str.replace(/\./, " "));
        });
        this.loginEl.addEventListener("input", () => {
            this.canSetLogin = false;
            if (this.canSetName && this.loginEl.validity.valid)
                this.nameEl.value = Object(_shared_libraries_helpers__WEBPACK_IMPORTED_MODULE_1__["toTitleCase"])(this.loginEl.value);
        });
        this.nameEl.addEventListener("input", () => this.canSetName = false);
        // By default, pressing the ESC key close the dialog. We have to prevent that.
        this.el.addEventListener("cancel", ev => ev.preventDefault());
    }
    async open() {
        document.body.appendChild(this.el);
        this.el.showModal();
        this.curDfd = new _libraries_Deferred__WEBPACK_IMPORTED_MODULE_2__["default"]();
        return this.curDfd.promise;
    }
    async onSubmit() {
        let checkMsg;
        let subdomain = this.subdomainEl.value.trim();
        checkMsg = Object(_shared_libraries_helpers__WEBPACK_IMPORTED_MODULE_1__["whyTeamSubdomainIsInvalid"])(subdomain);
        if (checkMsg) {
            await this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["WarningDialog"]).show(checkMsg);
            this.teamNameEl.focus();
            return;
        }
        let teamName = this.teamNameEl.value.trim();
        if (teamName.length === 0) {
            await this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["WarningDialog"]).show("Please enter a team name.");
            this.teamNameEl.focus();
            return;
        }
        let name = this.nameEl.value.trim();
        if (name.length === 0) {
            await this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["WarningDialog"]).show("Please enter a name for the user.");
            this.teamNameEl.focus();
            return;
        }
        let login = this.loginEl.value.trim();
        checkMsg = Object(_shared_libraries_helpers__WEBPACK_IMPORTED_MODULE_1__["whyUsernameIsInvalid"])(login);
        if (checkMsg) {
            await this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["WarningDialog"]).show(checkMsg);
            this.loginEl.focus();
            return;
        }
        let password = this.passwordEl.value;
        checkMsg = Object(_shared_libraries_helpers__WEBPACK_IMPORTED_MODULE_1__["whyNewPasswordIsInvalid"])(password);
        if (checkMsg) {
            await this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["WarningDialog"]).show(checkMsg);
            this.passwordEl.focus();
            return;
        }
        if (this.confirmEl.value !== password) {
            await this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["WarningDialog"]).show("Passwords do not match.");
            this.confirmEl.focus();
            return;
        }
        let email = this.emailEl.value.trim();
        if (email.length === 0 || !Object(_libraries_utils__WEBPACK_IMPORTED_MODULE_3__["validateEmail"])(email)) {
            this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["WarningDialog"]).show("Please enter a valid email address.");
            await this.emailEl.focus();
            return;
        }
        let data = await this.checkSubdomain(subdomain);
        if (!data.done) {
            this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["WarningDialog"]).show("Something went wrong. We could not contact server for the moment.");
            return;
        }
        if (!data.answer) {
            await this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["WarningDialog"]).show("The subdomain you chosed is not available. Try another one.");
            this.subdomainEl.focus();
            return;
        }
        if (await this.register(teamName, subdomain, name, login, password, email) && this.curDfd) {
            this.curDfd.resolve(true);
            this.curDfd = undefined;
            this.el.close();
        }
    }
    async checkSubdomain(subdomain) {
        let outcome = {
            done: false,
            answer: false
        };
        try {
            let response = await fetch(`${this.dash.app.baseUrl}/api/team/check-subdomain`, {
                method: "post",
                credentials: "same-origin",
                headers: new Headers({
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify({ subdomain })
            });
            if (response.ok) {
                outcome.answer = (await response.json()).answer;
                outcome.done = true;
            }
        }
        catch (error) {
            this.dash.log.error("Unable to get response from server", error);
        }
        return outcome;
    }
    async register(teamName, subdomain, name, username, password, email) {
        try {
            let response = await fetch(`${this.dash.app.baseUrl}/api/team/create`, {
                method: "post",
                credentials: "same-origin",
                headers: new Headers({
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify({ teamName, subdomain, name, username, password, email })
            });
            if (!response.ok) {
                await this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["ErrorDialog"]).show("Cannot complete this task now. Try again in a moment.");
                return false;
            }
            let answer = await response.json();
            if (answer.done) {
                this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["InfoDialog"]).show("You have been successfully registred.");
                return true;
            }
            this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["ErrorDialog"]).show("Something went wrong. We are sorry for the inconvenience. Try again later.");
        }
        catch (error) {
            this.dash.log.error(error);
            this.dash.create(_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_4__["InfoDialog"]).show("Something went wrong. We cannot reach our server.");
        }
        return false;
    }
}


/***/ }),

/***/ "../shared-ui/libraries/Deferred.ts":
/*!******************************************!*\
  !*** ../shared-ui/libraries/Deferred.ts ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Deferred; });
class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolveCb = resolve;
            this.rejectCb = reject;
        });
    }
    pipeTo(prom) {
        prom.then(result => this.resolve(result), err => this.reject(err));
        return this.promise;
    }
    resolve(result) {
        this.resolveCb(result);
    }
    reject(err) {
        this.rejectCb(err);
    }
}


/***/ }),

/***/ "../shared-ui/libraries/utils.ts":
/*!***************************************!*\
  !*** ../shared-ui/libraries/utils.ts ***!
  \***************************************/
/*! exports provided: equal, removeAllChildren, catchAndLog, addCssClass, validateEmail, makeOutsideClickHandlerFor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equal", function() { return equal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeAllChildren", function() { return removeAllChildren; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "catchAndLog", function() { return catchAndLog; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addCssClass", function() { return addCssClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateEmail", function() { return validateEmail; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeOutsideClickHandlerFor", function() { return makeOutsideClickHandlerFor; });
/**
 * Check if two arrays have the same content.
 * @see {@link http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript/19746771#19746771}
 */
function equal(a, b) {
    return (a.length === b.length && a.every((v, i) => v === b[i]));
}
/**
 * Remove all children of a HTMLElement.
 *
 * @see{@link https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript}
 * @param el
 */
function removeAllChildren(el) {
    while (el.firstChild)
        el.removeChild(el.firstChild);
}
function catchAndLog(cb) {
    return ((...args) => {
        try {
            let res = cb(...args);
            if (res && typeof res.then === "function" && typeof res.catch === "function") {
                res = res.catch(err => {
                    console.log("[catchAndLog async]", err);
                });
            }
            return res;
        }
        catch (err) {
            console.log("[catchAndLog]", err);
        }
    });
}
function addCssClass(el, cssClass) {
    if (!cssClass)
        return;
    cssClass = typeof cssClass === "string" ? [cssClass] : cssClass;
    el.classList.add(...cssClass);
}
function validateEmail(email) {
    let rgx = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return email.match(rgx) !== null;
}
// Design requirement: if the user clicks outside a modal dialog, the dialog should be closed.
// To detect click outside the dialog, we check if the coordinates of the mouse lie inside the dialog's rectangle.
// Note: when we click on the dialog backdrop, the event target property corresponds to the dialog element.
function makeOutsideClickHandlerFor(dialogEl, cb) {
    // let clickHandler = (ev: MouseEvent) => {
    //   if (dialogEl.open && ev.target === dialogEl) {
    //     let rect = dialogEl.getBoundingClientRect()
    //     if (ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom)
    //       cb()
    //   }
    // }
    // document.body.addEventListener("click", clickHandler)
    // dialogEl.addEventListener("close", () => document.body.removeEventListener("click", clickHandler))
}


/***/ }),

/***/ "../shared-ui/modalDialogs/ErrorDialog/ErrorDialog.monk":
/*!**************************************************************!*\
  !*** ../shared-ui/modalDialogs/ErrorDialog/ErrorDialog.monk ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Monkberry = __webpack_require__(/*! monkberry */ "../shared-ui/node_modules/monkberry/monkberry.js");

/**
 * @class
 */
function ErrorDialog() {
  Monkberry.call(this);
  var _this = this;

  // Create elements
  var dialog0 = document.createElement('dialog');
  var header1 = document.createElement('header');
  var div2 = document.createElement('div');
  var span3 = document.createElement('span');
  var div4 = document.createElement('div');
  var span5 = document.createElement('span');
  var div6 = document.createElement('div');
  var div7 = document.createElement('div');
  var span8 = document.createElement('span');
  var div9 = document.createElement('div');
  var p10 = document.createElement('p');
  var div11 = document.createElement('div');
  var button12 = document.createElement('button');

  // Construct dom
  div2.appendChild(span3);
  div2.setAttribute("class", "ModalDialog-headerLeft");
  span5.setAttribute("class", "fas fa-times fa-1x ModalDialogCloseItem");
  div4.appendChild(span5);
  div4.setAttribute("class", "ModalDialog-headerRight");
  header1.appendChild(div2);
  header1.appendChild(div4);
  header1.setAttribute("class", "ModalDialog-header");
  span8.setAttribute("class", "fas fa-3x fa-exclamation-circle");
  div7.appendChild(span8);
  div7.setAttribute("class", "ModalDialog-contentLeft ErrorDialog-contentLeft");
  div9.appendChild(p10);
  div9.setAttribute("class", "ModalDialog-contentRight");
  div6.appendChild(div7);
  div6.appendChild(div9);
  div6.setAttribute("class", "ModalDialog-content");
  button12.appendChild(document.createTextNode("OK"));
  button12.setAttribute("class", "ModalDialogOkButton");
  div11.appendChild(button12);
  div11.setAttribute("class", "ModalDialog-bottom");
  dialog0.appendChild(header1);
  dialog0.appendChild(div6);
  dialog0.appendChild(div11);
  dialog0.setAttribute("class", "ErrorDialog ModalDialog");

  // Directives
  var refDirective0;
  var refDirective1;
  var refDirective2;
  var refDirective3;

  // Extra render actions
  this.onRender = function () {
    if (refDirective0 === undefined) {
      refDirective0 = new _this.directives.ref();
    }
    refDirective0.bind(span3);
    refDirective0.update("title");
    if (refDirective1 === undefined) {
      refDirective1 = new _this.directives.ref();
    }
    refDirective1.bind(span5);
    refDirective1.update("close");
    if (refDirective2 === undefined) {
      refDirective2 = new _this.directives.ref();
    }
    refDirective2.bind(p10);
    refDirective2.update("message");
    if (refDirective3 === undefined) {
      refDirective3 = new _this.directives.ref();
    }
    refDirective3.bind(button12);
    refDirective3.update("button");
  };

  // On remove actions
  this.onRemove = function (__data__) {
    refDirective0.unbind(span3);
    refDirective1.unbind(span5);
    refDirective2.unbind(p10);
    refDirective3.unbind(button12);
  };

  // Set root nodes
  this.nodes = [dialog0];
}
ErrorDialog.prototype = Object.create(Monkberry.prototype);
ErrorDialog.prototype.constructor = ErrorDialog;
ErrorDialog.pool = [];
ErrorDialog.prototype.update = function (__data__) {
};

module.exports = ErrorDialog;


/***/ }),

/***/ "../shared-ui/modalDialogs/ErrorDialog/ErrorDialog.ts":
/*!************************************************************!*\
  !*** ../shared-ui/modalDialogs/ErrorDialog/ErrorDialog.ts ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ErrorDialog; });
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tomko/lt-monkberry */ "../shared-ui/node_modules/@tomko/lt-monkberry/lt-monkberry.min.js");
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _libraries_Deferred__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../libraries/Deferred */ "../shared-ui/libraries/Deferred.ts");
/* harmony import */ var _libraries_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../libraries/utils */ "../shared-ui/libraries/utils.ts");
__webpack_require__(/*! ./_ErrorDialog.scss */ "../shared-ui/modalDialogs/ErrorDialog/_ErrorDialog.scss");



const template = __webpack_require__(/*! ./ErrorDialog.monk */ "../shared-ui/modalDialogs/ErrorDialog/ErrorDialog.monk");
class ErrorDialog {
    constructor(dash) {
        this.dash = dash;
        let view = Object(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__["render"])(template);
        this.el = view.rootEl();
        this.msgEl = view.ref("message");
        this.titleEl = view.ref("title");
        let closeCb = () => this.close();
        view.ref("button").addEventListener("click", closeCb);
        view.ref("close").addEventListener("click", closeCb);
        this.el.addEventListener("cancel", ev => {
            ev.preventDefault();
            this.close();
        });
        this.el.addEventListener("keydown", ev => {
            if (ev.key === "Enter")
                this.close();
        });
    }
    show(msg, title = "Error") {
        this.currDfd = new _libraries_Deferred__WEBPACK_IMPORTED_MODULE_1__["default"]();
        this.msgEl.textContent = msg;
        this.titleEl.textContent = title;
        document.body.appendChild(this.el);
        Object(_libraries_utils__WEBPACK_IMPORTED_MODULE_2__["makeOutsideClickHandlerFor"])(this.el, () => this.close());
        this.el.showModal();
        return this.currDfd.promise;
    }
    close() {
        if (this.currDfd)
            this.currDfd.resolve(true);
        this.currDfd = undefined;
        this.el.close();
        document.body.removeChild(this.el);
    }
}


/***/ }),

/***/ "../shared-ui/modalDialogs/ErrorDialog/_ErrorDialog.scss":
/*!***************************************************************!*\
  !*** ../shared-ui/modalDialogs/ErrorDialog/_ErrorDialog.scss ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../../platform-frontend/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../../platform-frontend/node_modules/css-loader/dist/cjs.js!../../../platform-frontend/node_modules/sass-loader/dist/cjs.js!./_ErrorDialog.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/ErrorDialog/_ErrorDialog.scss");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "../shared-ui/modalDialogs/InfoDialog/InfoDialog.monk":
/*!************************************************************!*\
  !*** ../shared-ui/modalDialogs/InfoDialog/InfoDialog.monk ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Monkberry = __webpack_require__(/*! monkberry */ "../shared-ui/node_modules/monkberry/monkberry.js");

/**
 * @class
 */
function InfoDialog() {
  Monkberry.call(this);
  var _this = this;

  // Create elements
  var dialog0 = document.createElement('dialog');
  var header1 = document.createElement('header');
  var div2 = document.createElement('div');
  var span3 = document.createElement('span');
  var div4 = document.createElement('div');
  var span5 = document.createElement('span');
  var div6 = document.createElement('div');
  var div7 = document.createElement('div');
  var span8 = document.createElement('span');
  var div9 = document.createElement('div');
  var p10 = document.createElement('p');
  var div11 = document.createElement('div');
  var button12 = document.createElement('button');

  // Construct dom
  div2.appendChild(span3);
  div2.setAttribute("class", "ModalDialog-headerLeft");
  span5.setAttribute("class", "fas fa-times fa-1x ModalDialogCloseItem");
  div4.appendChild(span5);
  div4.setAttribute("class", "ModalDialog-headerRight");
  header1.appendChild(div2);
  header1.appendChild(div4);
  header1.setAttribute("class", "ModalDialog-header");
  span8.setAttribute("class", "fas fa-3x fa-info-circle");
  div7.appendChild(span8);
  div7.setAttribute("class", "ModalDialog-contentLeft InfoDialog-contentLeft");
  div9.appendChild(p10);
  div9.setAttribute("class", "ModalDialog-contentRight");
  div6.appendChild(div7);
  div6.appendChild(div9);
  div6.setAttribute("class", "ModalDialog-content");
  button12.appendChild(document.createTextNode("OK"));
  button12.setAttribute("class", "ModalDialogOkButton");
  div11.appendChild(button12);
  div11.setAttribute("class", "ModalDialog-bottom");
  dialog0.appendChild(header1);
  dialog0.appendChild(div6);
  dialog0.appendChild(div11);
  dialog0.setAttribute("class", "ModalDialog InfoDialog");

  // Directives
  var refDirective0;
  var refDirective1;
  var refDirective2;
  var refDirective3;

  // Extra render actions
  this.onRender = function () {
    if (refDirective0 === undefined) {
      refDirective0 = new _this.directives.ref();
    }
    refDirective0.bind(span3);
    refDirective0.update("title");
    if (refDirective1 === undefined) {
      refDirective1 = new _this.directives.ref();
    }
    refDirective1.bind(span5);
    refDirective1.update("close");
    if (refDirective2 === undefined) {
      refDirective2 = new _this.directives.ref();
    }
    refDirective2.bind(p10);
    refDirective2.update("message");
    if (refDirective3 === undefined) {
      refDirective3 = new _this.directives.ref();
    }
    refDirective3.bind(button12);
    refDirective3.update("button");
  };

  // On remove actions
  this.onRemove = function (__data__) {
    refDirective0.unbind(span3);
    refDirective1.unbind(span5);
    refDirective2.unbind(p10);
    refDirective3.unbind(button12);
  };

  // Set root nodes
  this.nodes = [dialog0];
}
InfoDialog.prototype = Object.create(Monkberry.prototype);
InfoDialog.prototype.constructor = InfoDialog;
InfoDialog.pool = [];
InfoDialog.prototype.update = function (__data__) {
};

module.exports = InfoDialog;


/***/ }),

/***/ "../shared-ui/modalDialogs/InfoDialog/InfoDialog.ts":
/*!**********************************************************!*\
  !*** ../shared-ui/modalDialogs/InfoDialog/InfoDialog.ts ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return InfoDialog; });
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tomko/lt-monkberry */ "../shared-ui/node_modules/@tomko/lt-monkberry/lt-monkberry.min.js");
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _libraries_Deferred__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../libraries/Deferred */ "../shared-ui/libraries/Deferred.ts");
/* harmony import */ var _libraries_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../libraries/utils */ "../shared-ui/libraries/utils.ts");
__webpack_require__(/*! ./_InfoDialog.scss */ "../shared-ui/modalDialogs/InfoDialog/_InfoDialog.scss");



const template = __webpack_require__(/*! ./InfoDialog.monk */ "../shared-ui/modalDialogs/InfoDialog/InfoDialog.monk");
class InfoDialog {
    constructor(dash) {
        this.dash = dash;
        let view = Object(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__["render"])(template);
        this.el = view.rootEl();
        this.msgEl = view.ref("message");
        this.titleEl = view.ref("title");
        let closeCb = () => this.close();
        view.ref("button").addEventListener("click", closeCb);
        view.ref("close").addEventListener("click", closeCb);
        this.el.addEventListener("cancel", ev => {
            ev.preventDefault();
            this.close();
        });
        this.el.addEventListener("keydown", ev => {
            if (ev.key === "Enter") {
                ev.stopPropagation();
                this.close();
            }
        });
    }
    show(msg, title = "Information") {
        this.currDfd = new _libraries_Deferred__WEBPACK_IMPORTED_MODULE_1__["default"]();
        this.msgEl.textContent = msg;
        this.titleEl.textContent = title;
        document.body.appendChild(this.el);
        Object(_libraries_utils__WEBPACK_IMPORTED_MODULE_2__["makeOutsideClickHandlerFor"])(this.el, () => this.close());
        this.el.showModal();
        return this.currDfd.promise;
    }
    close() {
        if (this.currDfd)
            this.currDfd.resolve(true);
        this.currDfd = undefined;
        this.el.close();
        document.body.removeChild(this.el);
    }
}


/***/ }),

/***/ "../shared-ui/modalDialogs/InfoDialog/_InfoDialog.scss":
/*!*************************************************************!*\
  !*** ../shared-ui/modalDialogs/InfoDialog/_InfoDialog.scss ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../../platform-frontend/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../../platform-frontend/node_modules/css-loader/dist/cjs.js!../../../platform-frontend/node_modules/sass-loader/dist/cjs.js!./_InfoDialog.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/InfoDialog/_InfoDialog.scss");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "../shared-ui/modalDialogs/PromptDialog/PromptDialog.monk":
/*!****************************************************************!*\
  !*** ../shared-ui/modalDialogs/PromptDialog/PromptDialog.monk ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Monkberry = __webpack_require__(/*! monkberry */ "../shared-ui/node_modules/monkberry/monkberry.js");

/**
 * @class
 */
function PromptDialog() {
  Monkberry.call(this);
  var _this = this;

  // Create elements
  var dialog0 = document.createElement('dialog');
  var header1 = document.createElement('header');
  var div2 = document.createElement('div');
  var span3 = document.createElement('span');
  var div4 = document.createElement('div');
  var span5 = document.createElement('span');
  var div6 = document.createElement('div');
  var div7 = document.createElement('div');
  var span8 = document.createElement('span');
  var div9 = document.createElement('div');
  var p10 = document.createElement('p');
  var pre11 = document.createElement('pre');
  var br12 = document.createElement('br');
  var input13 = document.createElement('input');
  var div14 = document.createElement('div');
  var button15 = document.createElement('button');
  var pre16 = document.createElement('pre');
  var button17 = document.createElement('button');

  // Construct dom
  div2.appendChild(span3);
  div2.setAttribute("class", "InfoDialog-headerLeft");
  span5.setAttribute("class", "fas fa-times fa-1x ModalDialogCloseItem");
  div4.appendChild(span5);
  div4.setAttribute("class", "InfoDialog-headerRight");
  header1.appendChild(div2);
  header1.appendChild(div4);
  header1.setAttribute("class", "InfoDialog-header");
  span8.setAttribute("class", "fas fa-3x fa-edit");
  div7.appendChild(span8);
  div7.setAttribute("class", "PromptDialog-contentLeft");
  pre11.appendChild(br12);
  input13.setAttribute("type", "text");
  input13.setAttribute("class", "PromptDialog-input");
  div9.appendChild(p10);
  div9.appendChild(pre11);
  div9.appendChild(input13);
  div9.setAttribute("class", "PromptDialog-contentRight");
  div6.appendChild(div7);
  div6.appendChild(div9);
  div6.setAttribute("class", "ModalDialog-content");
  button15.appendChild(document.createTextNode("Cancel"));
  button15.setAttribute("class", "ModalDialogCancelButton");
  pre16.appendChild(document.createTextNode(" "));
  button17.appendChild(document.createTextNode("OK"));
  button17.setAttribute("class", "ModalDialogOkButton");
  div14.appendChild(button15);
  div14.appendChild(pre16);
  div14.appendChild(button17);
  div14.setAttribute("class", "InfoDialog-bottom");
  dialog0.appendChild(header1);
  dialog0.appendChild(div6);
  dialog0.appendChild(div14);
  dialog0.setAttribute("class", "PromptDialog InfoDialog");

  // Directives
  var refDirective0;
  var refDirective1;
  var refDirective2;
  var refDirective3;
  var refDirective4;
  var refDirective5;

  // Extra render actions
  this.onRender = function () {
    if (refDirective0 === undefined) {
      refDirective0 = new _this.directives.ref();
    }
    refDirective0.bind(span3);
    refDirective0.update("title");
    if (refDirective1 === undefined) {
      refDirective1 = new _this.directives.ref();
    }
    refDirective1.bind(span5);
    refDirective1.update("close");
    if (refDirective2 === undefined) {
      refDirective2 = new _this.directives.ref();
    }
    refDirective2.bind(p10);
    refDirective2.update("message");
    if (refDirective3 === undefined) {
      refDirective3 = new _this.directives.ref();
    }
    refDirective3.bind(input13);
    refDirective3.update("input");
    if (refDirective4 === undefined) {
      refDirective4 = new _this.directives.ref();
    }
    refDirective4.bind(button15);
    refDirective4.update("cancelBtn");
    if (refDirective5 === undefined) {
      refDirective5 = new _this.directives.ref();
    }
    refDirective5.bind(button17);
    refDirective5.update("okBtn");
  };

  // On remove actions
  this.onRemove = function (__data__) {
    refDirective0.unbind(span3);
    refDirective1.unbind(span5);
    refDirective2.unbind(p10);
    refDirective3.unbind(input13);
    refDirective4.unbind(button15);
    refDirective5.unbind(button17);
  };

  // Set root nodes
  this.nodes = [dialog0];
}
PromptDialog.prototype = Object.create(Monkberry.prototype);
PromptDialog.prototype.constructor = PromptDialog;
PromptDialog.pool = [];
PromptDialog.prototype.update = function (__data__) {
};

module.exports = PromptDialog;


/***/ }),

/***/ "../shared-ui/modalDialogs/PromptDialog/PromptDialog.ts":
/*!**************************************************************!*\
  !*** ../shared-ui/modalDialogs/PromptDialog/PromptDialog.ts ***!
  \**************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return PromptDialog; });
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tomko/lt-monkberry */ "../shared-ui/node_modules/@tomko/lt-monkberry/lt-monkberry.min.js");
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _libraries_Deferred__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../libraries/Deferred */ "../shared-ui/libraries/Deferred.ts");
/* harmony import */ var _libraries_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../libraries/utils */ "../shared-ui/libraries/utils.ts");
__webpack_require__(/*! ./_PromptDialog.scss */ "../shared-ui/modalDialogs/PromptDialog/_PromptDialog.scss");



const template = __webpack_require__(/*! ./PromptDialog.monk */ "../shared-ui/modalDialogs/PromptDialog/PromptDialog.monk");
class PromptDialog {
    constructor(dash) {
        this.dash = dash;
        let view = Object(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__["render"])(template);
        this.el = view.rootEl();
        this.msgEl = view.ref("message");
        this.titleEl = view.ref("title");
        this.inputEl = view.ref("input");
        let closeCb = () => this.close("");
        view.ref("cancelBtn").addEventListener("click", closeCb);
        view.ref("close").addEventListener("click", closeCb);
        view.ref("okBtn").addEventListener("click", () => {
            if (this.inputEl.value !== "")
                this.close(this.inputEl.value);
        });
        this.el.addEventListener("cancel", ev => {
            ev.preventDefault();
            this.close("");
        });
        this.el.addEventListener("keydown", ev => {
            if (ev.key === "Enter" && this.inputEl.value !== "")
                this.close(this.inputEl.value);
        });
    }
    show(msg, title = "Prompt") {
        this.currDfd = new _libraries_Deferred__WEBPACK_IMPORTED_MODULE_1__["default"]();
        this.msgEl.textContent = msg;
        this.titleEl.textContent = title;
        document.body.appendChild(this.el);
        Object(_libraries_utils__WEBPACK_IMPORTED_MODULE_2__["makeOutsideClickHandlerFor"])(this.el, () => this.close(""));
        this.el.showModal();
        return this.currDfd.promise;
    }
    close(s) {
        if (this.currDfd)
            this.currDfd.resolve(s);
        this.currDfd = undefined;
        this.el.close();
        document.body.removeChild(this.el);
    }
}


/***/ }),

/***/ "../shared-ui/modalDialogs/PromptDialog/_PromptDialog.scss":
/*!*****************************************************************!*\
  !*** ../shared-ui/modalDialogs/PromptDialog/_PromptDialog.scss ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../../platform-frontend/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../../platform-frontend/node_modules/css-loader/dist/cjs.js!../../../platform-frontend/node_modules/sass-loader/dist/cjs.js!./_PromptDialog.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/PromptDialog/_PromptDialog.scss");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "../shared-ui/modalDialogs/QuestionDialog/QuestionDialog.monk":
/*!********************************************************************!*\
  !*** ../shared-ui/modalDialogs/QuestionDialog/QuestionDialog.monk ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Monkberry = __webpack_require__(/*! monkberry */ "../shared-ui/node_modules/monkberry/monkberry.js");

/**
 * @class
 */
function QuestionDialog() {
  Monkberry.call(this);
  var _this = this;

  // Create elements
  var dialog0 = document.createElement('dialog');
  var header1 = document.createElement('header');
  var div2 = document.createElement('div');
  var span3 = document.createElement('span');
  var div4 = document.createElement('div');
  var span5 = document.createElement('span');
  var div6 = document.createElement('div');
  var div7 = document.createElement('div');
  var span8 = document.createElement('span');
  var div9 = document.createElement('div');
  var p10 = document.createElement('p');
  var div11 = document.createElement('div');
  var button12 = document.createElement('button');
  var pre13 = document.createElement('pre');
  var button14 = document.createElement('button');

  // Construct dom
  div2.appendChild(span3);
  div2.setAttribute("class", "ModalDialog-headerLeft");
  span5.setAttribute("class", "fas fa-times fa-1x ModalDialogCloseItem");
  div4.appendChild(span5);
  div4.setAttribute("class", "ModalDialog-headerRight");
  header1.appendChild(div2);
  header1.appendChild(div4);
  header1.setAttribute("class", "ModalDialog-header");
  span8.setAttribute("class", "fas fa-3x fa-question-circle");
  div7.appendChild(span8);
  div7.setAttribute("class", "ModalDialog-contentLeft InfoDialog-contentLeft");
  div9.appendChild(p10);
  div9.setAttribute("class", "ModalDialog-contentRight");
  div6.appendChild(div7);
  div6.appendChild(div9);
  div6.setAttribute("class", "ModalDialog-content");
  button12.appendChild(document.createTextNode("No"));
  button12.setAttribute("class", "ModalDialogCancelButton");
  pre13.appendChild(document.createTextNode(" "));
  button14.appendChild(document.createTextNode("Yes"));
  button14.setAttribute("class", "ModalDialogOkButton");
  div11.appendChild(button12);
  div11.appendChild(pre13);
  div11.appendChild(button14);
  div11.setAttribute("class", "ModalDialog-bottom");
  dialog0.appendChild(header1);
  dialog0.appendChild(div6);
  dialog0.appendChild(div11);
  dialog0.setAttribute("class", "ModalDialog QuestionDialog");

  // Directives
  var refDirective0;
  var refDirective1;
  var refDirective2;
  var refDirective3;
  var refDirective4;

  // Extra render actions
  this.onRender = function () {
    if (refDirective0 === undefined) {
      refDirective0 = new _this.directives.ref();
    }
    refDirective0.bind(span3);
    refDirective0.update("title");
    if (refDirective1 === undefined) {
      refDirective1 = new _this.directives.ref();
    }
    refDirective1.bind(span5);
    refDirective1.update("close");
    if (refDirective2 === undefined) {
      refDirective2 = new _this.directives.ref();
    }
    refDirective2.bind(p10);
    refDirective2.update("message");
    if (refDirective3 === undefined) {
      refDirective3 = new _this.directives.ref();
    }
    refDirective3.bind(button12);
    refDirective3.update("cancelBtn");
    if (refDirective4 === undefined) {
      refDirective4 = new _this.directives.ref();
    }
    refDirective4.bind(button14);
    refDirective4.update("okBtn");
  };

  // On remove actions
  this.onRemove = function (__data__) {
    refDirective0.unbind(span3);
    refDirective1.unbind(span5);
    refDirective2.unbind(p10);
    refDirective3.unbind(button12);
    refDirective4.unbind(button14);
  };

  // Set root nodes
  this.nodes = [dialog0];
}
QuestionDialog.prototype = Object.create(Monkberry.prototype);
QuestionDialog.prototype.constructor = QuestionDialog;
QuestionDialog.pool = [];
QuestionDialog.prototype.update = function (__data__) {
};

module.exports = QuestionDialog;


/***/ }),

/***/ "../shared-ui/modalDialogs/QuestionDialog/QuestionDialog.ts":
/*!******************************************************************!*\
  !*** ../shared-ui/modalDialogs/QuestionDialog/QuestionDialog.ts ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return QuestionDialog; });
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tomko/lt-monkberry */ "../shared-ui/node_modules/@tomko/lt-monkberry/lt-monkberry.min.js");
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _libraries_Deferred__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../libraries/Deferred */ "../shared-ui/libraries/Deferred.ts");
/* harmony import */ var _libraries_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../libraries/utils */ "../shared-ui/libraries/utils.ts");
__webpack_require__(/*! ./_QuestionDialog.scss */ "../shared-ui/modalDialogs/QuestionDialog/_QuestionDialog.scss");



const template = __webpack_require__(/*! ./QuestionDialog.monk */ "../shared-ui/modalDialogs/QuestionDialog/QuestionDialog.monk");
class QuestionDialog {
    constructor(dash) {
        this.dash = dash;
        let view = Object(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__["render"])(template);
        this.el = view.rootEl();
        this.msgEl = view.ref("message");
        this.titleEl = view.ref("title");
        view.ref("okBtn").addEventListener("click", () => this.close(true));
        view.ref("cancelBtn").addEventListener("click", () => this.close(false));
        view.ref("close").addEventListener("click", () => this.close(false));
        this.el.addEventListener("cancel", ev => {
            ev.preventDefault();
            this.close(false);
        });
        this.el.addEventListener("keydown", ev => {
            if (ev.key === "Enter")
                this.close(true);
        });
    }
    show(msg, title = "Question") {
        this.currDfd = new _libraries_Deferred__WEBPACK_IMPORTED_MODULE_1__["default"]();
        this.msgEl.textContent = msg;
        this.titleEl.textContent = title;
        document.body.appendChild(this.el);
        Object(_libraries_utils__WEBPACK_IMPORTED_MODULE_2__["makeOutsideClickHandlerFor"])(this.el, () => this.close(false));
        this.el.showModal();
        return this.currDfd.promise;
    }
    close(b) {
        if (this.currDfd)
            this.currDfd.resolve(b);
        this.currDfd = undefined;
        this.el.close();
        document.body.removeChild(this.el);
    }
}


/***/ }),

/***/ "../shared-ui/modalDialogs/QuestionDialog/_QuestionDialog.scss":
/*!*********************************************************************!*\
  !*** ../shared-ui/modalDialogs/QuestionDialog/_QuestionDialog.scss ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../../platform-frontend/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../../platform-frontend/node_modules/css-loader/dist/cjs.js!../../../platform-frontend/node_modules/sass-loader/dist/cjs.js!./_QuestionDialog.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/QuestionDialog/_QuestionDialog.scss");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "../shared-ui/modalDialogs/WarningDialog/WarningDialog.monk":
/*!******************************************************************!*\
  !*** ../shared-ui/modalDialogs/WarningDialog/WarningDialog.monk ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Monkberry = __webpack_require__(/*! monkberry */ "../shared-ui/node_modules/monkberry/monkberry.js");

/**
 * @class
 */
function WarningDialog() {
  Monkberry.call(this);
  var _this = this;

  // Create elements
  var dialog0 = document.createElement('dialog');
  var header1 = document.createElement('header');
  var div2 = document.createElement('div');
  var span3 = document.createElement('span');
  var div4 = document.createElement('div');
  var span5 = document.createElement('span');
  var div6 = document.createElement('div');
  var div7 = document.createElement('div');
  var span8 = document.createElement('span');
  var div9 = document.createElement('div');
  var p10 = document.createElement('p');
  var div11 = document.createElement('div');
  var button12 = document.createElement('button');

  // Construct dom
  div2.appendChild(span3);
  div2.setAttribute("class", "ModalDialog-headerLeft");
  span5.setAttribute("class", "fas fa-times fa-lg ModalDialogCloseItem");
  div4.appendChild(span5);
  div4.setAttribute("class", "ModalDialog-headerRight");
  header1.appendChild(div2);
  header1.appendChild(div4);
  header1.setAttribute("class", "ModalDialog-header");
  span8.setAttribute("class", "fas fa-3x fa-exclamation-triangle");
  div7.appendChild(span8);
  div7.setAttribute("class", "ModalDialog-contentLeft WarningDialog-contentLeft");
  div9.appendChild(p10);
  div9.setAttribute("class", "ModalDialog-contentRight");
  div6.appendChild(div7);
  div6.appendChild(div9);
  div6.setAttribute("class", "ModalDialog-content");
  button12.appendChild(document.createTextNode("OK"));
  button12.setAttribute("class", "ModalDialogOkButton");
  div11.appendChild(button12);
  div11.setAttribute("class", "ModalDialog-bottom");
  dialog0.appendChild(header1);
  dialog0.appendChild(div6);
  dialog0.appendChild(div11);
  dialog0.setAttribute("class", "ModalDialog WarningDialog");

  // Directives
  var refDirective0;
  var refDirective1;
  var refDirective2;
  var refDirective3;

  // Extra render actions
  this.onRender = function () {
    if (refDirective0 === undefined) {
      refDirective0 = new _this.directives.ref();
    }
    refDirective0.bind(span3);
    refDirective0.update("title");
    if (refDirective1 === undefined) {
      refDirective1 = new _this.directives.ref();
    }
    refDirective1.bind(span5);
    refDirective1.update("close");
    if (refDirective2 === undefined) {
      refDirective2 = new _this.directives.ref();
    }
    refDirective2.bind(p10);
    refDirective2.update("message");
    if (refDirective3 === undefined) {
      refDirective3 = new _this.directives.ref();
    }
    refDirective3.bind(button12);
    refDirective3.update("button");
  };

  // On remove actions
  this.onRemove = function (__data__) {
    refDirective0.unbind(span3);
    refDirective1.unbind(span5);
    refDirective2.unbind(p10);
    refDirective3.unbind(button12);
  };

  // Set root nodes
  this.nodes = [dialog0];
}
WarningDialog.prototype = Object.create(Monkberry.prototype);
WarningDialog.prototype.constructor = WarningDialog;
WarningDialog.pool = [];
WarningDialog.prototype.update = function (__data__) {
};

module.exports = WarningDialog;


/***/ }),

/***/ "../shared-ui/modalDialogs/WarningDialog/WarningDialog.ts":
/*!****************************************************************!*\
  !*** ../shared-ui/modalDialogs/WarningDialog/WarningDialog.ts ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return WarningDialog; });
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tomko/lt-monkberry */ "../shared-ui/node_modules/@tomko/lt-monkberry/lt-monkberry.min.js");
/* harmony import */ var _tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _libraries_Deferred__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../libraries/Deferred */ "../shared-ui/libraries/Deferred.ts");
/* harmony import */ var _libraries_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../libraries/utils */ "../shared-ui/libraries/utils.ts");
__webpack_require__(/*! ./_WarningDialog.scss */ "../shared-ui/modalDialogs/WarningDialog/_WarningDialog.scss");



const template = __webpack_require__(/*! ./WarningDialog.monk */ "../shared-ui/modalDialogs/WarningDialog/WarningDialog.monk");
class WarningDialog {
    constructor(dash) {
        this.dash = dash;
        let view = Object(_tomko_lt_monkberry__WEBPACK_IMPORTED_MODULE_0__["render"])(template);
        this.el = view.rootEl();
        this.msgEl = view.ref("message");
        this.titleEl = view.ref("title");
        let closeCb = () => this.close();
        view.ref("button").addEventListener("click", closeCb);
        view.ref("close").addEventListener("click", closeCb);
        this.el.addEventListener("cancel", ev => {
            ev.preventDefault();
            this.close();
        });
        this.el.addEventListener("keydown", ev => {
            if (ev.key === "Enter")
                this.close();
        });
    }
    show(msg, title = "Warning") {
        this.currDfd = new _libraries_Deferred__WEBPACK_IMPORTED_MODULE_1__["default"]();
        this.msgEl.textContent = msg;
        this.titleEl.textContent = title;
        document.body.appendChild(this.el);
        Object(_libraries_utils__WEBPACK_IMPORTED_MODULE_2__["makeOutsideClickHandlerFor"])(this.el, () => this.close());
        this.el.showModal();
        return this.currDfd.promise;
    }
    close() {
        if (this.currDfd)
            this.currDfd.resolve(true);
        this.currDfd = undefined;
        this.el.close();
        document.body.removeChild(this.el);
    }
}


/***/ }),

/***/ "../shared-ui/modalDialogs/WarningDialog/_WarningDialog.scss":
/*!*******************************************************************!*\
  !*** ../shared-ui/modalDialogs/WarningDialog/_WarningDialog.scss ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../../platform-frontend/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../../platform-frontend/node_modules/css-loader/dist/cjs.js!../../../platform-frontend/node_modules/sass-loader/dist/cjs.js!./_WarningDialog.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/WarningDialog/_WarningDialog.scss");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "../shared-ui/modalDialogs/_modalDialogs.scss":
/*!****************************************************!*\
  !*** ../shared-ui/modalDialogs/_modalDialogs.scss ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../../platform-frontend/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../../platform-frontend/node_modules/css-loader/dist/cjs.js!../../platform-frontend/node_modules/sass-loader/dist/cjs.js!./_modalDialogs.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/_modalDialogs.scss");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),

/***/ "../shared-ui/modalDialogs/modalDialogs.ts":
/*!*************************************************!*\
  !*** ../shared-ui/modalDialogs/modalDialogs.ts ***!
  \*************************************************/
/*! exports provided: ErrorDialog, InfoDialog, PromptDialog, QuestionDialog, WarningDialog */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ErrorDialog_ErrorDialog__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ErrorDialog/ErrorDialog */ "../shared-ui/modalDialogs/ErrorDialog/ErrorDialog.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ErrorDialog", function() { return _ErrorDialog_ErrorDialog__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _InfoDialog_InfoDialog__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./InfoDialog/InfoDialog */ "../shared-ui/modalDialogs/InfoDialog/InfoDialog.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InfoDialog", function() { return _InfoDialog_InfoDialog__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _PromptDialog_PromptDialog__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PromptDialog/PromptDialog */ "../shared-ui/modalDialogs/PromptDialog/PromptDialog.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PromptDialog", function() { return _PromptDialog_PromptDialog__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _QuestionDialog_QuestionDialog__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./QuestionDialog/QuestionDialog */ "../shared-ui/modalDialogs/QuestionDialog/QuestionDialog.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "QuestionDialog", function() { return _QuestionDialog_QuestionDialog__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _WarningDialog_WarningDialog__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./WarningDialog/WarningDialog */ "../shared-ui/modalDialogs/WarningDialog/WarningDialog.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WarningDialog", function() { return _WarningDialog_WarningDialog__WEBPACK_IMPORTED_MODULE_4__["default"]; });

__webpack_require__(/*! ./_modalDialogs.scss */ "../shared-ui/modalDialogs/_modalDialogs.scss");







/***/ }),

/***/ "../shared-ui/node_modules/@tomko/lt-monkberry/lt-monkberry.min.js":
/*!*************************************************************************!*\
  !*** ../shared-ui/node_modules/@tomko/lt-monkberry/lt-monkberry.min.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports,"__esModule",{value:!0});var monkberry=__webpack_require__(/*! monkberry */ "../shared-ui/node_modules/monkberry/monkberry.js");function render(e,r={}){let n=makeRefDirective(),t={ref:n,placeholder:makePlaceholderDirective(r.placeholders)};r.directives=r.directives?Object.assign({},r.directives,t):t;let i=monkberry.render(e,document.createElement("div"),r);return Object.defineProperties(i,{references:{get:()=>n.references}}),i.rootEl=(()=>{if(1!==i.nodes.length)throw new Error(`The root element must be a single element (${i.nodes.length})`);return i.nodes[0]}),i.ref=(e=>{if(!n.references[e]||1!==n.references[e].length)throw new Error(`Cannot find a single node "${e}" (${n.references[e]?n.references[e].length:0})`);return n.references[e][0]}),i}function makeRefDirective(){class e{bind(e){let t=this.node;this.node=e,void 0!==this.name&&(t!==e&&n(this.name,t),r(this.name,this.node))}unbind(){void 0!==this.name&&n(this.name,this.node),this.node=void 0}update(e){if("string"!=typeof e)throw new Error(`The ':ref' type should be 'string' (current: ${typeof e})`);let t=this.name;this.name=e,this.node&&(void 0!==t&&t!==e&&n(t,this.node),r(this.name,this.node))}}return e.references={},e;function r(r,n){e.references[r]||(e.references[r]=[]),e.references[r].push(n)}function n(r,n){if(!e.references[r])return;let t=e.references[r].indexOf(n);-1!==t&&e.references[r].splice(t,1)}}function makePlaceholderDirective(e){return class{bind(e){if(this.node){if(this.node!==e)throw new Error("Cannot bind a placeholder on several nodes")}else this.node=e,void 0!==this.name&&r(this.name,this.node)}unbind(){throw new Error("Cannot unbind a placeholder")}update(e){if("string"!=typeof e)throw new Error(`The ':ref' type should be 'string' (current: ${typeof e})`);if(void 0===this.name)this.name=e,this.node&&r(this.name,this.node);else if(this.name!==e)throw new Error(`Cannot bind a placeholder on several names (${this.name}, ${e})`)}};function r(r,n){if(!e[r])throw new Error(`Unknown placeholder: ${r}`);let t=e[r](n);if(t)if(Array.isArray(t))for(let e of t)n.appendChild(e);else n.appendChild(t)}}exports.render=render;

/***/ }),

/***/ "../shared-ui/node_modules/monkberry/monkberry.js":
/*!********************************************************!*\
  !*** ../shared-ui/node_modules/monkberry/monkberry.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**                                      _    _
 *                     /\/\   ___  _ __ | | _| |__   ___ _ __ _ __ _   _
 *                    /    \ / _ \| '_ \| |/ / '_ \ / _ \ '__| '__| | | |
 *                   / /\/\ \ (_) | | | |   <| |_) |  __/ |  | |  | |_| |
 *                   \/    \/\___/|_| |_|_|\_\_.__/ \___|_|  |_|   \__, |
 *                                                                 |___/
 *
 *        +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
 *  Enter ->  |       |                                   |           |           |       |
 *        +   +   +   +---+   +---+---+   +---+---+   +   +   +---+   +   +---+   +   +   +
 *        |       |           |                   |   |       |       |   |   |       |   |
 *        +---+---+---+---+---+   +---+---+---+---+   +---+---+   +---+   +   +---+---+   +
 *        |       |               |       |           |       |       |   |           |   |
 *        +   +   +   +---+---+---+   +   +   +---+---+   +   +---+   +   +---+---+   +   +
 *        |   |       |           |   |   |       |       |               |   |           |
 *        +   +---+---+   +---+   +   +   +---+   +   +---+---+---+---+---+   +   +   +---+
 *        |   |       |       |       |       |   |   |       |       |   |       |   |   |
 *        +   +---+   +---+   +---+---+---+   +   +   +   +   +   +   +   +---+---+   +   +
 *        |           |       |       |   |       |       |   |   |   |           |   |   |
 *        +---+---+---+   +---+   +   +   +   +---+---+---+   +---+   +---+---+   +   +   +
 *        |   |       |           |       |   |       |       |       |               |   |
 *        +   +   +   +---+---+---+   +---+   +   +   +   +---+   +---+---+   +---+---+   +
 *        |   |   |           |           |   |   |   |       |   |       |   |           |
 *        +   +   +---+---+   +---+---+---+   +---+   +---+   +   +   +   +   +   +---+   +
 *        |       |                           |       |   |       |   |       |   |       |
 *        +---+---+   +   +   +---+---+---+---+   +---+   +---+   +   +---+---+   +   +---+
 *        |           |   |                               |       |               |       -> Exit
 *        +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
 */
(function (document) {
  /**
   * Monkberry
   * @class
   */
  function Monkberry() {
    this.parent = null;
    this.nested = [];
    this.nodes = [];
    this.filters = null;
    this.directives = null;
    this.context = null;
    this.unbind = null;
    this.onRender = null;
    this.onUpdate = null;
    this.onRemove = null;
    this.noCache = false;
  }

  /**
   * Render template and attach it to node.
   * @param {Monkberry} template
   * @param {Element} node
   * @param {Object=} options
   * @return {Monkberry}
   */
  Monkberry.render = function (template, node, options) {
    var view;

    if (options && options.noCache) {
      view = new template();
    } else {
      view = template.pool.pop() || new template();
    }

    if (node.nodeType == 8) {
      view.insertBefore(node);
    } else {
      view.appendTo(node);
    }

    if (options) {
      if (options.parent) {
        view.parent = options.parent;
      }

      if (options.context) {
        view.context = options.context;
      }

      if (options.filters) {
        view.filters = options.filters;
      }

      if (options.directives) {
        view.directives = options.directives;
      }

      if (options.noCache) {
        view.noCache = options.noCache;
      }
    }

    if (view.onRender) {
      view.onRender();
    }

    return view;
  };

  /**
   * Prerepder template for future usage.
   * @param {Monkberry} template - Template name.
   * @param {Number} times - Times of prerender.
   */
  Monkberry.prerender = function (template, times) {
    while (times--) {
      template.pool.push(new template());
    }
  };

  /**
   * Main loops processor.
   */
  Monkberry.loop = function (parent, node, map, template, array, options) {
    var i, j, len, keys, transform, arrayLength, childrenSize = map.length;

    // Get array length, and convert object to array if needed.
    if (Array.isArray(array)) {
      transform = transformArray;
      arrayLength = array.length;
    } else {
      transform = transformObject;
      keys = Object.keys(array);
      arrayLength = keys.length;
    }

    // If new array contains less items what before, remove surpluses.
    len = childrenSize - arrayLength;
    for (i in map.items) {
      if (len-- > 0) {
        map.items[i].remove();
      } else {
        break;
      }
    }

    // If there is already some views, update there loop state.
    j = 0;
    for (i in map.items) {
      map.items[i].__state__ = transform(array, keys, j, options);
      j++;
    }

    // If new array contains more items when previous, render new views and append them.
    for (j = childrenSize, len = arrayLength; j < len; j++) {
      // Render new view.
      var view = Monkberry.render(template, node, {parent: parent, context: parent.context, filters: parent.filters, directives: parent.directives, noCache: parent.noCache});

      // Set view hierarchy.
      parent.nested.push(view);

      // Remember to remove from children map on view remove.
      i = map.push(view);
      view.unbind = (function (i) {
        return function () {
          map.remove(i);
        };
      })(i);

      // Set view state for later update in onUpdate.
      view.__state__ = transform(array, keys, j, options);
    }
  };

  /**
   * Main if processor.
   */
  Monkberry.cond = function (parent, node, child/*.ref*/, template, test) {
    if (child.ref) { // If view was already inserted, update or remove it.
      if (!test) {
        child.ref.remove();
      }
    } else if (test) {
      // Render new view.
      var view = Monkberry.render(template, node, {parent: parent, context: parent.context, filters: parent.filters, directives: parent.directives, noCache: parent.noCache});

      // Set view hierarchy.
      parent.nested.push(view);

      // Remember to remove child ref on remove of view.
      child.ref = view;
      view.unbind = function () {
        child.ref = null;
      };
    }

    return test;
  };

  /**
   * Main custom tags processor.
   */
  Monkberry.insert = function (parent, node, child/*.ref*/, template, data) {
    if (child.ref) { // If view was already inserted, update or remove it.
      child.ref.update(data);
    } else {
      // Render new view.
      var view = Monkberry.render(template, node, {parent: parent, context: parent.context, filters: parent.filters, directives: parent.directives, noCache: parent.noCache});

      // Set view hierarchy.
      parent.nested.push(view);

      // Remember to remove child ref on remove of view.
      child.ref = view;
      view.unbind = function () {
        child.ref = null;
      };

      // Set view data (note what it must be after adding nodes to DOM).
      view.update(data);
    }
  };

  /**
   * Remove view from DOM.
   */
  Monkberry.prototype.remove = function () {
    // Remove appended nodes.
    var i = this.nodes.length;
    while (i--) {
      this.nodes[i].parentNode.removeChild(this.nodes[i]);
    }

    // Remove self from parent's children map or child ref.
    if (this.unbind) {
      this.unbind();
    }

    // Remove all nested views.
    i = this.nested.length;
    while (i--) {
      this.nested[i].remove();
    }

    // Remove this view from parent's nested views.
    if (this.parent) {
      i = this.parent.nested.indexOf(this);
      this.parent.nested.splice(i, 1);
      this.parent = null;
    }

    // Call on remove callback.
    if (this.onRemove) {
      this.onRemove();
    }

    // Store view in pool for reuse in future.
    if (!this.noCache) {
      this.constructor.pool.push(this);
    }
  };

  /**
   * @param {Element} toNode
   */
  Monkberry.prototype.appendTo = function (toNode) {
    for (var i = 0, len = this.nodes.length; i < len; i++) {
      toNode.appendChild(this.nodes[i]);
    }
  };

  /**
   * @param {Element} toNode
   */
  Monkberry.prototype.insertBefore = function (toNode) {
    if (toNode.parentNode) {
      for (var i = 0, len = this.nodes.length; i < len; i++) {
        toNode.parentNode.insertBefore(this.nodes[i], toNode);
      }
    } else {
      throw new Error(
        "Can not insert child view into parent node. " +
        "You need append your view first and then update."
      );
    }
  };

  /**
   * Return rendered node, or DocumentFragment of rendered nodes if more then one root node in template.
   * @returns {Element|DocumentFragment}
   */
  Monkberry.prototype.createDocument = function () {
    if (this.nodes.length == 1) {
      return this.nodes[0];
    } else {
      var fragment = document.createDocumentFragment();
      for (var i = 0, len = this.nodes.length; i < len; i++) {
        fragment.appendChild(this.nodes[i]);
      }
      return fragment;
    }
  };

  /**
   * @param {string} query
   * @returns {Element}
   */
  Monkberry.prototype.querySelector = function (query) {
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].matches && this.nodes[i].matches(query)) {
        return this.nodes[i];
      }

      if (this.nodes[i].nodeType === 8) {
        throw new Error('Can not use querySelector with non-element nodes on first level.');
      }

      if (this.nodes[i].querySelector) {
        var element = this.nodes[i].querySelector(query);
        if (element) {
          return element;
        }
      }
    }
    return null;
  };


  /**
   * Simple Map implementation with length property.
   */
  function Map() {
    this.items = Object.create(null);
    this.length = 0;
    this.next = 0;
  }

  Map.prototype.push = function (element) {
    this.items[this.next] = element;
    this.length += 1;
    this.next += 1;
    return this.next - 1;
  };

  Map.prototype.remove = function (i) {
    if (i in this.items) {
      delete this.items[i];
      this.length -= 1;
    } else {
      throw new Error('You are trying to delete not existing element "' + i + '" form map.');
    }
  };

  Map.prototype.forEach = function (callback) {
    for (var i in this.items) {
      callback(this.items[i]);
    }
  };

  Monkberry.Map = Map;

  //
  // Helper function for working with foreach loops data.
  // Will transform data for "key, value of array" constructions.
  //

  function transformArray(array, keys, i, options) {
    if (options) {
      var t = {__index__: i};
      t[options.value] = array[i];

      if (options.key) {
        t[options.key] = i;
      }

      return t;
    } else {
      return array[i];
    }
  }

  function transformObject(array, keys, i, options) {
    if (options) {
      var t = {__index__: i};
      t[options.value] = array[keys[i]];

      if (options.key) {
        t[options.key] = keys[i];
      }

      return t;
    } else {
      return array[keys[i]];
    }
  }

  if (true) {
    module.exports = Monkberry;
  } else {}
})(window.document);


/***/ }),

/***/ "../shared/libraries/helpers.ts":
/*!**************************************!*\
  !*** ../shared/libraries/helpers.ts ***!
  \**************************************/
/*! exports provided: wait, toDebugStr, toDebugObj, toTitleCase, whyNewPasswordIsInvalid, whyTeamSubdomainIsInvalid, whyUsernameIsInvalid */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wait", function() { return wait; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toDebugStr", function() { return toDebugStr; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toDebugObj", function() { return toDebugObj; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toTitleCase", function() { return toTitleCase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "whyNewPasswordIsInvalid", function() { return whyNewPasswordIsInvalid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "whyTeamSubdomainIsInvalid", function() { return whyTeamSubdomainIsInvalid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "whyUsernameIsInvalid", function() { return whyUsernameIsInvalid; });
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function toDebugStr(entry) {
    return JSON.stringify(toDebugObj(entry), null, 2);
}
function toDebugObj(entry) {
    if (!entry)
        return entry;
    if (entry[Symbol.toStringTag] === "Map") {
        let list = ["MAP"];
        for (let [key, val] of entry) {
            if (val && (val[Symbol.toStringTag] === "Map" || val[Symbol.toStringTag] === "Set"))
                val = toDebugObj(val);
            list.push([key, val]);
        }
        return list;
    }
    else {
        // console.log("+++", entry[Symbol.toStringTag], entry.values())
        let list = ["SET"];
        for (let val of entry.values()) {
            if (val && (val[Symbol.toStringTag] === "Map" || val[Symbol.toStringTag] === "Set"))
                val = toDebugObj(val);
            list.push(val);
        }
        return list;
    }
}
function toTitleCase(str) {
    // See https://love2dev.com/blog/javascript-touppercase-tolowercase/
    return str.replace(/\w+/g, w => w.charAt(0).toLocaleUpperCase() + w.substr(1));
}
function whyNewPasswordIsInvalid(password) {
    if (password.length < 8)
        return "A password must have at least 8 characters";
}
function whyTeamSubdomainIsInvalid(subdomain) {
    if (subdomain.length < 2 || subdomain.length > 16)
        return "A team subdomain must have at least 2 characters and 16 characters at most";
    let arr = subdomain.match(/[a-z0-9]{2,}/g);
    if (!arr || arr.length === 0 || arr[0] !== subdomain)
        return "A team subdomain should contain only lowercase alphanumeric characters and underscore.";
}
function whyUsernameIsInvalid(username) {
    if (username.length < 1)
        return "A username should have at least one character.";
    if (/\W/.test(username))
        return "A username can contain only letters, digits and underscore.";
}


/***/ }),

/***/ "./node_modules/bkb/bkb.min.js":
/*!*************************************!*\
  !*** ./node_modules/bkb/bkb.min.js ***!
  \*************************************/
/*! exports provided: createApplication, registerApplication */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createApplication", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerApplication", function() { return l; });
function t(t){return"string"==typeof t?[t]:t}function e(t){return 1===t.length&&Array.isArray(t[0])?t[0]:t}class s{constructor(t,e){this.app=t,this.componentId=e,this.map=new Map}invokeOrder(e,s){for(let i of t(e))this.exec(i,s);let i=this.app.getChildrenOf(this.componentId);for(let t of i)t.getDOrders().invokeOrder(e,s)}listenToDescendingOrder(e,s,i=null){for(let n of t(e)){let t=this.map.get(n);t||this.map.set(n,t=[]),t.push({cb:s,thisArg:i})}}stopListeningDescendingOrder(e,s,i=null){for(let n of t(e)){let t=this.map.get(n);t&&this.map.set(n,t.filter(t=>t.cb!==s||t.thisArg!==i))}}exec(t,e){let s=this.map.get(t);s&&s.forEach(t=>(function(t,e){t.thisArg?t.cb.call(t.thisArg,e):t.cb(e)})(t,e))}}function i(t,e){t.thisArg?t.cb.call(t.thisArg,e.data,e):t.cb(e.data,e)}class n{constructor(t,e){this.log=t,this.eventNames=new Set,this.strictEvents=!1,this.destroyed=!1,e&&this.exposeEvent(e,!1)}exposeEvent(t,e){if(this.destroyed)throw new Error("Cannot call exposeEvent in a destroyed transmitter");for(let e of t)this.eventNames.add(e);e&&(this.strictEvents=!0)}emit(t){if(this.destroyed||!this.listeners)return;if(this.strictEvents&&!this.eventNames.has(t.eventName))throw new Error(`Unexposed event: ${t.eventName}`);let e=this.listeners.get(t.eventName);if(e)for(let s of e)try{i(s,t)}catch(t){this.log.error(t)}}on(t,e,s){if(!this.destroyed){this.listeners||(this.listeners=new Map);for(let i of t){let t=this.listeners.get(i);t||this.listeners.set(i,t=[]),t.push({cb:e,thisArg:s})}}}off(t,e,s){if(!this.destroyed&&this.listeners)for(let[i,n]of this.listeners)if(!t||t.has(i))for(let t=0;t<n.length;++t){let i=n[t];i.cb===e&&i.thisArg===s&&(n.splice(t,1),--t)}}destroy(){this.listeners=void 0,this.destroyed=!0}}class r{listenTo(t,e,s,i=null){t.on(e,s,i),this.map||(this.map=new Map);let n=this.map.get(s);n||this.map.set(s,n=new Map);let r=n.get(i);r||n.set(i,r=new Map);let o=r.get(t);o||r.set(t,o=new Set);for(let t of e)o.add(t)}stopListeningEverywhere(t,e=null){if(!this.map)return;let s=this.map.get(t);if(!s)return;let i=s.get(e);if(i){for(let[s,n]of i)s.off(n,t,e);s.delete(e),0===s.size&&this.map.delete(t)}}stopListening(t,e,s,i=null){if(!this.map)return;let n=this.map.get(s);if(!n)return;let r=n.get(i);if(!r)return;let o=r.get(t);if(!o)return;let h=new Set;for(let t of e)o.delete(t)&&h.add(t);t.off(h,s,i),0===o.size&&(r.delete(t),0===r.size&&(n.delete(i),0===n.size&&this.map.delete(s)))}destroy(){if(this.map){for(let[t,e]of this.map)for(let[s,i]of e)for(let[e,n]of i)e.off(n,t,s);this.map=void 0}}}const o=Symbol("canPropagate");class h{constructor(s,i){var o;this.app=s,this.componentId=i,this.subscriber=new r,this.emitter=new n(s.log,["destroy"]),this.pub=(o=this,Object.freeze({unmanagedListeners:Object.freeze({on:(e,s,i)=>{o.emitter.on(t(e),s,i)},off:(e,s,i)=>{o.emitter.off(new Set(t(e)),s,i)}}),getComponent:()=>o.getInstance(),children:(t={})=>o.getChildren(t),hasChildren:(t={})=>o.hasChildren(t),isChild:t=>o.isChild(t),destroy:()=>o.destroy(),invokeDescendingOrder(t,e){return o.getDOrders().invokeOrder(t,e),this},isComponent:t=>o.app.isComponent(t),getPublicDashOf:t=>o.app.getBkbByInst(t).pub,getParentOf(t){let e=o.app.getBkbByInst(t).getParent();return e?e.getInstance():void 0},log:o.app.log,get app(){return o.app.root.getInstance()}})),this.dash=function(s,i){let n={setInstance:t=>(s.setInstance(t),r),exposeEvent:(...t)=>(s.emitter.exposeEvent(e(t),!0),r),create:(t,e)=>s.createChild({asObj:!1,Class:t,opt:e}).getInstance(),registerComponent:t=>s.createChild({asObj:!0,obj:t}).dash,addToGroup:(t,...i)=>(s.addToGroup(t,e(i)),r),inGroup:(t,...i)=>s.inGroup(t,e(i)),emit(t,e,i){let n=Array.isArray(t)?t:[t];for(let t of n)s.emit(t,e,i);return r},broadcast:(t,e)=>(s.broadcast(t,e),r),listenTo:(...e)=>{let i,n,o,h;if(2===e.length||"string"==typeof e[0]||Array.isArray(e[0]))[n,o,h]=e,i=s;else{let t;[t,n,o,h]=e,i=s.app.getBkbByInst(t)}return s.subscriber.listenTo(i.emitter,t(n),o,h),r},stopListening:(...e)=>{let i,n,o,h,a=e.length;if("string"==typeof e[0]||Array.isArray(e[0]))[n,o,h]=e,i=s;else{if(1===a||2===a)return[o,h]=e,void s.subscriber.stopListeningEverywhere(o,h);{let t;[t,n,o,h]=e,i=s.app.getBkbByInst(t)}}return s.subscriber.stopListening(i.emitter,t(n),o,h),r},listenToDescendingOrder:(t,e,i)=>(s.getDOrders().listenToDescendingOrder(t,e,i),r),stopListeningDescendingOrder:(t,e,i)=>(s.getDOrders().stopListeningDescendingOrder(t,e,i),r),destroyChildren:(t={})=>(s.destroyChildren(t),r),publicDash:i},r=Object.assign(Object.create(i),n);Object.assign(r,...s.app.augmentList.map(t=>t(r))),s.app.root&&s.app.root!==s||(r.addDashAugmentation=(t=>{s.app.augmentList.push(t)}));return Object.freeze(r),r}(this,this.pub)}makeInstance(t,e){if(this.inst)return;let s;try{s=new t(this.dash,e)}catch(t){throw this.destroy(),t}this.setInstance(s)}setInstance(t){if(!this.pub)throw new Error("Destroyed component");if(this.inst){if(t!==this.inst)throw new Error("Conflict between component instances")}else this.inst=t,this.app.setInstanceOf(this.componentId,this.inst)}getInstance(){if(!this.inst){if(this.pub)throw new Error("The component instance is still not initialized");throw new Error("Destroyed component")}return this.inst}destroy(){this.emit("destroy",void 0,{sync:!0,cancelPropagation:!0}),this.app.removeComponent(this,this.inst),this.childGroups&&this.childGroups.clear(),this.emitter.destroy(),this.subscriber.destroy(),this.pub=void 0,this.dash=void 0,this.inst=void 0}forgetChild(t){if(this.childGroups)for(let e of this.childGroups.values())e.delete(t)}createChild(t){return this.app.createComponent(t,this)}addToGroup(t,e){let s=this.app.getBkbByInst(t).componentId;if(this!==this.app.getParentOf(s))throw new Error(`The component ${s} is not a child of ${this.componentId}`);this.childGroups||(this.childGroups=new Map);for(let t of e){let e=this.childGroups.get(t);e||this.childGroups.set(t,e=new Set),e.add(s)}}inGroup(t,e){if(!this.childGroups)return!1;let s=this.app.getBkbByInst(t).componentId;for(let t of e){let e=this.childGroups.get(t);if(e&&e.has(s))return!0}return!1}broadcast(t,e={}){e.sync?this.emitter.emit(t):this.app.asyncCall(()=>this.emitter.emit(t))}emit(t,e,s={}){s.sync?this.emitSync(this.createEvent(t,e,s.cancelPropagation)):this.app.asyncCall(()=>this.emitSync(this.createEvent(t,e,s.cancelPropagation)))}getParent(){return this.app.getParentOf(this.componentId)}getParents(){let t=this,e=[];for(;t=this.app.getParentOf(t.componentId);)e.push(t);return e}getChildren(t){let e=this.getChildBkbs(t.group),s=[];for(let i of e)!i.inst||t.filter&&!t.filter(i)||s.push(i.inst);return s}hasChildren(t){return this.getChildren(t).length>0}isChild(t){let e=this.app.getBkbByInst(t).componentId;return this===this.app.getParentOf(e)}destroyChildren(t){let e=this.getChildBkbs(t.group);for(let s of e)t.filter&&!t.filter(s)||s.destroy()}getDOrders(){return this.dOrders||(this.dOrders=new s(this.app,this.componentId)),this.dOrders}createEvent(t,e,s){let i=this,n=!s;return Object.freeze({eventName:t,get source(){return i.getInstance()},data:e,stopPropagation:()=>{n=!1},[o]:()=>n})}emitSync(t){if(this.emitter.emit(t),t[o]&&t[o]()){let e=this.app.getParentOf(this.componentId);e&&e.emitSync(t)}}getChildBkbs(t){if(!t)return this.app.getChildrenOf(this.componentId);if(!this.childGroups)return[];let e="string"==typeof t?[t]:t,s=new Set;for(let t of e){let e=this.childGroups.get(t);if(e)for(let t of e.values())s.add(t)}let i=[];for(let t of s.values())i.push(this.app.getBkb(t));return i}}class a{constructor(t,e,s){this.augmentList=[],this.compCount=0,this.nodesByInst=new WeakMap,this.nodes=new Map,this.insideRmComp=!1;let i=this.newId();this.log=this.createLog(["error","warn","info","debug","trace"]),this.root=new h(this,i);let n={bkb:this.root};this.nodes.set(i,n),this.root.emitter.exposeEvent(["log","addComponent","removeComponent","changeComponent"],!1),e?this.root.setInstance(t):this.root.makeInstance(t,s),n.created=!0}setInstanceOf(t,e){let s=this.nodes.get(t);if(!s)throw new Error("Destroyed component");this.nodesByInst.set(e,s)}getParentOf(t){let e=this.findNode(t);return e.parent?e.parent.bkb:void 0}getChildrenOf(t){let e=[],s=this.findNode(t).children;if(s)for(let t of s.values())e.push(t.bkb);return e}getBkb(t){return this.findNode(t).bkb}getBkbByInst(t){return this.findNodeByInst(t).bkb}isComponent(t){return!!this.nodesByInst.get(t)}createComponent(t,e){if(!this.root.dash)throw new Error("Destroyed root component");let s=this.newId(),i=new h(this,s),n=this.findNode(e.componentId),r={bkb:i,parent:n};return this.nodes.set(s,r),n.children||(n.children=new Map),n.children.set(s,r),t.asObj?i.setInstance(t.obj):i.makeInstance(t.Class,t.opt),this.root.dash.emit(["addComponent","changeComponent"],{component:i.getInstance(),type:"add"}),r.created=!0,i}removeComponent(t,e){if(!this.root.dash)throw new Error("Destroyed root component");let s=!this.insideRmComp;try{let i=t.componentId,n=this.findNode(i);if(s&&(this.insideRmComp=!0,e&&n.created)){let t={component:e,type:"remove"};this.root.dash.emit(["removeComponent","changeComponent"],t,{sync:!0})}if(n.children){for(let t of n.children.values())t.parent=void 0,t.bkb.destroy();n.children.clear()}n.parent&&(n.parent.bkb.forgetChild(i),n.parent.children.delete(i)),this.nodes.delete(i),e&&this.nodesByInst.delete(e)}finally{s&&(this.insideRmComp=!1)}}asyncCall(t){this.tickList?this.tickList.push(t):(this.tickList=[t],setTimeout(()=>{if(this.tickList){for(let t of this.tickList)try{t()}catch(t){this.log.error(t)}this.tickList=void 0}},0))}findNode(t){let e=this.nodes.get(t);if(!e)throw new Error(`Missing node of component "${t}"`);return e}findNodeByInst(t){let e=this.nodesByInst.get(t);if(!e)throw new Error(`Cannot find a component for the instance: ${t}`);return e}newId(){return this.compCount++}createLog(t){let e={},s=0;for(let i of t)e[i]=((...t)=>{if(!this.root.dash)throw new Error("Destroyed root component");this.root.dash.emit("log",{level:i,messages:t,levelNumber:++s},{sync:!0})});return Object.freeze(e)}}function d(t,e){return new a(t,!1,e).root.getInstance()}function l(t){return new a(t,!0).root.dash}

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/ErrorDialog/_ErrorDialog.scss":
/*!********************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/ErrorDialog/_ErrorDialog.scss ***!
  \********************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../platform-frontend/node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.i, ".ErrorDialog-contentLeft {\n  color: #ff0000;\n}", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/InfoDialog/_InfoDialog.scss":
/*!******************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/InfoDialog/_InfoDialog.scss ***!
  \******************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../platform-frontend/node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.i, ".InfoDialog-contentLeft {\n  color: #4169e1;\n}", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/PromptDialog/_PromptDialog.scss":
/*!**********************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/PromptDialog/_PromptDialog.scss ***!
  \**********************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../platform-frontend/node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.i, ".PromptDialog-contentLeft {\n  color: #708090;\n}\n.PromptDialog-contentRight {\n  display: flex;\n  flex-direction: column;\n  justify-content: space-evenly;\n  padding-right: 5px;\n}\n.PromptDialog-input {\n  display: block;\n  border: 1px solid #2f4f4f;\n  padding: 3px;\n  width: 100%;\n}", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/QuestionDialog/_QuestionDialog.scss":
/*!**************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/QuestionDialog/_QuestionDialog.scss ***!
  \**************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../platform-frontend/node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.i, ".QuestionDialog-contentLeft {\n  color: #0000ff;\n}", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/WarningDialog/_WarningDialog.scss":
/*!************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/WarningDialog/_WarningDialog.scss ***!
  \************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../platform-frontend/node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.i, ".WarningDialog-contentLeft {\n  color: #ffa500;\n}", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/_modalDialogs.scss":
/*!*********************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!../shared-ui/modalDialogs/_modalDialogs.scss ***!
  \*********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../platform-frontend/node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.i, ".ModalDialog {\n  background-color: #fff;\n  border: 1px solid rgba(0, 0, 0, 0.3);\n  border-radius: 4px;\n  margin: auto;\n  width: 300px;\n}\n.ModalDialog::backdrop {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  top: 0;\n  background-color: rgba(0, 0, 0, 0.6);\n}\n.ModalDialog-header {\n  align-items: baseline;\n  display: flex;\n  border-bottom: 1px solid rgba(34, 36, 38, 0.15);\n  flex-direction: row;\n  font-weight: bold;\n  justify-content: space-between;\n  padding: 8px 6px;\n}\n.ModalDialog-content {\n  align-items: center;\n  display: grid;\n  grid-template-columns: 15% 5% 80%;\n  grid-template-rows: 100%;\n  padding: 8px 4px;\n}\n.ModalDialog-contentLeft {\n  grid-column-start: 1;\n  grid-column-end: 2;\n  justify-self: center;\n}\n.ModalDialog-contentRight {\n  grid-column-start: 3;\n  grid-column-end: 4;\n}\n.ModalDialog-bottom {\n  align-items: center;\n  border-top: 1px solid rgba(34, 36, 38, 0.15);\n  display: flex;\n  flex-direction: row;\n  justify-content: flex-end;\n  padding: 8px 6px;\n}\n\n.ModalDialogCancelButton, .ModalDialogOkButton {\n  border-radius: 4px;\n  border-right: 2px outset gray;\n  border-bottom: 2px outset gray;\n  color: #fff;\n  outline: none;\n}\n.ModalDialogCancelButton:active, .ModalDialogOkButton:active {\n  border-right: 2px outset transparent;\n  border-bottom: 2px outset transparent;\n}\n\n.ModalDialogCancelButton {\n  background-color: #fa8072;\n  padding: 6px 16px 4px;\n}\n.ModalDialogCancelButton:hover {\n  background-color: #cd5c5c;\n}\n\n.ModalDialogOkButton {\n  background-color: #1e90ff;\n  padding: 6px 16px 4px;\n}\n.ModalDialogOkButton:hover {\n  background-color: #4169e1;\n}\n\n.ModalDialogCloseItem {\n  color: #000;\n}\n.ModalDialogCloseItem:hover {\n  color: darkgray;\n}", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : undefined;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && btoa) {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./src/App/App.ts":
/*!************************!*\
  !*** ./src/App/App.ts ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return App; });
/* harmony import */ var _shared_ui_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../shared-ui/modalDialogs/modalDialogs */ "../shared-ui/modalDialogs/modalDialogs.ts");
/* harmony import */ var _shared_ui_TeamCreationDialog_TeamCreationDialog__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared-ui/TeamCreationDialog/TeamCreationDialog */ "../shared-ui/TeamCreationDialog/TeamCreationDialog.ts");


class App {
    constructor(dash, options = {}) {
        this.dash = dash;
        this.options = options;
        this.log = dash.log;
        this.baseUrl = document.documentElement.dataset.baseUrl || "";
        this.teamDialog = this.dash.create(_shared_ui_TeamCreationDialog_TeamCreationDialog__WEBPACK_IMPORTED_MODULE_1__["default"]);
        this.dash.listenTo("log", data => {
            // tslint:disable-next-line:no-console
            console.log(`[${data.level}]`, ...data.messages);
        });
    }
    start() {
        if ((!this.options.action && !this.options.token) || (this.options.action === "register")) {
            this.showTeamCreationDialog();
            return;
        }
        if (this.options.action === "activate") {
            this.activateTeam();
            return;
        }
        throw new Error("Unknown action parameter");
    }
    async activateTeam() {
        if (!this.options.token)
            throw new Error("Token not found");
        try {
            let response = await fetch(`${this.baseUrl}/api/team/activate`, {
                method: "post",
                credentials: "same-origin",
                headers: new Headers({
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify({ token: this.options.token })
            });
            if (!response.ok) {
                await this.dash.create(_shared_ui_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_0__["ErrorDialog"]).show("Cannot complete this task now. Try again in a moment.");
                return;
            }
            let data = await response.json();
            if (!data.done) {
                this.dash.create(_shared_ui_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_0__["ErrorDialog"]).show("Team activation failed.");
                return;
            }
            // FIXME: redirect to home if there is no base URL.
            document.location.href = `${data.teamUrl}`;
        }
        catch (error) {
            this.dash.create(_shared_ui_modalDialogs_modalDialogs__WEBPACK_IMPORTED_MODULE_0__["InfoDialog"]).show("Something went wrong. We cannot reach our server.");
        }
    }
    async showTeamCreationDialog() {
        await this.teamDialog.open();
    }
}


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var bkb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bkb */ "./node_modules/bkb/bkb.min.js");
/* harmony import */ var _App_App__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./App/App */ "./src/App/App.ts");


document.addEventListener("DOMContentLoaded", () => {
    let url = new URL(window.location.href);
    let action = url.searchParams.get("action") || undefined;
    let token = url.searchParams.get("token") || undefined;
    Object(bkb__WEBPACK_IMPORTED_MODULE_0__["createApplication"])(_App_App__WEBPACK_IMPORTED_MODULE_1__["default"], { action, token }).start();
});


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /home/hop/th/201x/2017/Paroi/smallteam/repositories/smallteam/platform-frontend/src/main.ts */"./src/main.ts");


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9UZWFtQ3JlYXRpb25EaWFsb2cvVGVhbUNyZWF0aW9uRGlhbG9nLm1vbmsiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9UZWFtQ3JlYXRpb25EaWFsb2cvVGVhbUNyZWF0aW9uRGlhbG9nLnRzIiwid2VicGFjazovLy8uLi9zaGFyZWQtdWkvbGlicmFyaWVzL0RlZmVycmVkLnRzIiwid2VicGFjazovLy8uLi9zaGFyZWQtdWkvbGlicmFyaWVzL3V0aWxzLnRzIiwid2VicGFjazovLy8uLi9zaGFyZWQtdWkvbW9kYWxEaWFsb2dzL0Vycm9yRGlhbG9nL0Vycm9yRGlhbG9nLm1vbmsiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9tb2RhbERpYWxvZ3MvRXJyb3JEaWFsb2cvRXJyb3JEaWFsb2cudHMiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9tb2RhbERpYWxvZ3MvRXJyb3JEaWFsb2cvX0Vycm9yRGlhbG9nLnNjc3M/MzkxMiIsIndlYnBhY2s6Ly8vLi4vc2hhcmVkLXVpL21vZGFsRGlhbG9ncy9JbmZvRGlhbG9nL0luZm9EaWFsb2cubW9uayIsIndlYnBhY2s6Ly8vLi4vc2hhcmVkLXVpL21vZGFsRGlhbG9ncy9JbmZvRGlhbG9nL0luZm9EaWFsb2cudHMiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9tb2RhbERpYWxvZ3MvSW5mb0RpYWxvZy9fSW5mb0RpYWxvZy5zY3NzPzQwMjEiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9tb2RhbERpYWxvZ3MvUHJvbXB0RGlhbG9nL1Byb21wdERpYWxvZy5tb25rIiwid2VicGFjazovLy8uLi9zaGFyZWQtdWkvbW9kYWxEaWFsb2dzL1Byb21wdERpYWxvZy9Qcm9tcHREaWFsb2cudHMiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9tb2RhbERpYWxvZ3MvUHJvbXB0RGlhbG9nL19Qcm9tcHREaWFsb2cuc2Nzcz85NGE0Iiwid2VicGFjazovLy8uLi9zaGFyZWQtdWkvbW9kYWxEaWFsb2dzL1F1ZXN0aW9uRGlhbG9nL1F1ZXN0aW9uRGlhbG9nLm1vbmsiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9tb2RhbERpYWxvZ3MvUXVlc3Rpb25EaWFsb2cvUXVlc3Rpb25EaWFsb2cudHMiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9tb2RhbERpYWxvZ3MvUXVlc3Rpb25EaWFsb2cvX1F1ZXN0aW9uRGlhbG9nLnNjc3M/YWFjNyIsIndlYnBhY2s6Ly8vLi4vc2hhcmVkLXVpL21vZGFsRGlhbG9ncy9XYXJuaW5nRGlhbG9nL1dhcm5pbmdEaWFsb2cubW9uayIsIndlYnBhY2s6Ly8vLi4vc2hhcmVkLXVpL21vZGFsRGlhbG9ncy9XYXJuaW5nRGlhbG9nL1dhcm5pbmdEaWFsb2cudHMiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9tb2RhbERpYWxvZ3MvV2FybmluZ0RpYWxvZy9fV2FybmluZ0RpYWxvZy5zY3NzP2RjNGIiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9tb2RhbERpYWxvZ3MvX21vZGFsRGlhbG9ncy5zY3NzP2Q2MTkiLCJ3ZWJwYWNrOi8vLy4uL3NoYXJlZC11aS9tb2RhbERpYWxvZ3MvbW9kYWxEaWFsb2dzLnRzIiwid2VicGFjazovLy8uLi9zaGFyZWQtdWkvbm9kZV9tb2R1bGVzL0B0b21rby9sdC1tb25rYmVycnkvbHQtbW9ua2JlcnJ5Lm1pbi5qcyIsIndlYnBhY2s6Ly8vLi4vc2hhcmVkLXVpL25vZGVfbW9kdWxlcy9tb25rYmVycnkvbW9ua2JlcnJ5LmpzIiwid2VicGFjazovLy8uLi9zaGFyZWQvbGlicmFyaWVzL2hlbHBlcnMudHMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2JrYi9ia2IubWluLmpzIiwid2VicGFjazovLy8uLi9zaGFyZWQtdWkvbW9kYWxEaWFsb2dzL0Vycm9yRGlhbG9nL19FcnJvckRpYWxvZy5zY3NzIiwid2VicGFjazovLy8uLi9zaGFyZWQtdWkvbW9kYWxEaWFsb2dzL0luZm9EaWFsb2cvX0luZm9EaWFsb2cuc2NzcyIsIndlYnBhY2s6Ly8vLi4vc2hhcmVkLXVpL21vZGFsRGlhbG9ncy9Qcm9tcHREaWFsb2cvX1Byb21wdERpYWxvZy5zY3NzIiwid2VicGFjazovLy8uLi9zaGFyZWQtdWkvbW9kYWxEaWFsb2dzL1F1ZXN0aW9uRGlhbG9nL19RdWVzdGlvbkRpYWxvZy5zY3NzIiwid2VicGFjazovLy8uLi9zaGFyZWQtdWkvbW9kYWxEaWFsb2dzL1dhcm5pbmdEaWFsb2cvX1dhcm5pbmdEaWFsb2cuc2NzcyIsIndlYnBhY2s6Ly8vLi4vc2hhcmVkLXVpL21vZGFsRGlhbG9ncy9fbW9kYWxEaWFsb2dzLnNjc3MiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL0FwcC9BcHAudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBOzs7Ozs7Ozs7O0VBQUEsK0M7RUFDRSwrQztFQUNFLHlDO0VBQ0EscUM7RUFHRix5QztFQUNFLHlDO0VBQ0UsdUM7RUFFQSx5QztFQUNFLDZDO0VBQ0UsMkM7RUFDQSw0QztFQUNFLDhDO0VBSUosOEM7RUFDSSw0QztFQUNBLDRDO0VBQ0UsOEM7RUFNViwwQztFQUNFLHdDO0VBRUEsOEM7RUFDRSw0QztFQUNBLDRDO0VBQ0UsOEM7RUFJSiwwQztFQUNFLDhDO0VBQ0UsNEM7RUFDQSw0QztFQUNFLDhDO0VBSUosOEM7RUFDRSw0QztFQUNBLDRDO0VBQ0UsOEM7RUFLTiw4QztFQUNFLDRDO0VBQ0EsNEM7RUFDRSw4QztFQUlKLDhDO0VBQ0UsNEM7RUFDQSw0QztFQUNFLDhDO0VBSUosMEM7RUFDRSxnRDtFQUVFLDRDO0VBR0YsZ0Q7OztFQXZFQywyQkFBTyw0QkFBUCxFO0VBQW1DLHlCQUFLLGdDQUFMLEU7Ozs7RUFEbEMsOEJBQU8sMkJBQVAsRTs7RUFPQSwwQkFBTyxrQkFBUCxFOztFQUlNLDRCQUFPLFdBQVAsRTtFQUVHLDhCQUFPLGFBQVAsRTtFQUFvQiw2QkFBTSxNQUFOLEU7RUFBWSxnQ0FBUyxpQkFBVCxFO0VBQTBCLG1DQUFZLE9BQVosRTs7RUFEN0QsNkJBQU8sc0JBQVAsRTs7O0VBRkQsNkJBQU8sdUJBQVAsRTs7RUFRRyw2QkFBTyxXQUFQLEU7RUFFRyw4QkFBTyxhQUFQLEU7RUFBb0IsNkJBQU0sTUFBTixFO0VBQVksbUNBQVksT0FBWixFOztFQURuQyw2QkFBTyxzQkFBUCxFOzs7RUFGSCw4QkFBTyx1QkFBUCxFOzs7RUFSSiwyQkFBTyxzQkFBUCxFOzs7RUFIRiwyQkFBTyxZQUFQLEU7O0VBcUJDLDJCQUFPLGtCQUFQLEU7O0VBR0ksNkJBQU8sV0FBUCxFO0VBRUcsOEJBQU8sYUFBUCxFO0VBQW9CLDZCQUFNLE9BQU4sRTtFQUFhLHFDO0VBQVMsbUNBQVksT0FBWixFOztFQUQ3Qyw2QkFBTyxzQkFBUCxFOzs7RUFGRCw4QkFBTyx1QkFBUCxFOztFQVNHLDZCQUFPLFdBQVAsRTtFQUVHLDhCQUFPLGFBQVAsRTtFQUFvQiw2QkFBTSxNQUFOLEU7RUFBWSxnQ0FBUyxpQkFBVCxFO0VBQTBCLG1DQUFZLE9BQVosRTs7RUFEN0QsNkJBQU8sc0JBQVAsRTs7O0VBRkQsOEJBQU8sdUJBQVAsRTs7RUFRQyw2QkFBTyxXQUFQLEU7RUFFRyw4QkFBTyxhQUFQLEU7RUFBb0IsNkJBQU0sTUFBTixFOztFQUR2Qiw2QkFBTyxzQkFBUCxFOzs7RUFGRCw4QkFBTyx1QkFBUCxFOzs7RUFSSiw0QkFBTyxzQkFBUCxFOztFQWlCRyw2QkFBTyxXQUFQLEU7RUFFRyw4QkFBTyxhQUFQLEU7RUFBb0IsNkJBQU0sVUFBTixFOztFQUR2Qiw2QkFBTyxzQkFBUCxFOzs7RUFGRCw4QkFBTyx1QkFBUCxFOztFQVFDLDZCQUFPLFdBQVAsRTtFQUVHLDhCQUFPLGFBQVAsRTtFQUFvQiw2QkFBTSxVQUFOLEU7O0VBRHZCLDZCQUFPLHNCQUFQLEU7OztFQUZELDhCQUFPLHVCQUFQLEU7RUFVRyw2QkFBTyxjQUFQLEU7RUFBcUIsa0M7OztFQUZyQiwrQkFBTyx5Q0FBUCxFO0VBQWlFLDhCQUFNLFFBQU4sRTs7RUFLakUsK0JBQU8sS0FBUCxFO0VBQVksOEJBQU0sUUFBTixFOzs7Ozs7Ozs7O0VBOUNuQiw0QkFBTyxZQUFQLEU7OztFQXJCRiwyQkFBTyw0QkFBUCxFOzs7RUFOQyw4QkFBTyxvQkFBUCxFOzs7RUFjd0Ysa0I7RUFPeEIsa0I7RUFZTSxrQjtFQVFrQixrQjtFQU83QyxrQjtFQVFFLGtCO0VBT0Esa0I7RUFPVCxrQjtFQUZvQixrQjtFQUt0QixrQjs7OztBQTNEc0Q7QUFBQTtBQUFBO0FBQUEsZ0M7QUFBQSx5QkFBTSxXQUFOLEU7QUFPeEI7QUFBQTtBQUFBO0FBQUEsZ0M7QUFBQSx5QkFBTSxVQUFOLEU7QUFZTTtBQUFBO0FBQUE7QUFBQSxnQztBQUFBLHlCQUFNLE9BQU4sRTtBQVFrQjtBQUFBO0FBQUE7QUFBQSxnQztBQUFBLHlCQUFNLE9BQU4sRTtBQU83QztBQUFBO0FBQUE7QUFBQSxnQztBQUFBLHlCQUFNLE1BQU4sRTtBQVFFO0FBQUE7QUFBQTtBQUFBLGdDO0FBQUEseUJBQU0sVUFBTixFO0FBT0E7QUFBQTtBQUFBO0FBQUEsZ0M7QUFBQSx5QkFBTSxTQUFOLEU7QUFPVDtBQUFBO0FBQUE7QUFBQSwrQjtBQUFBLHlCQUFNLFNBQU4sRTtBQUZvQjtBQUFBO0FBQUE7QUFBQSxpQztBQUFBLHlCQUFNLFdBQU4sRTtBQUt0QjtBQUFBO0FBQUE7QUFBQSxpQztBQUFBLHlCQUFNLFdBQU4sRTs7Ozs7QUEzRHNELGtDO0FBT3hCLGtDO0FBWU0sa0M7QUFRa0Isa0M7QUFPN0Msa0M7QUFRRSxrQztBQU9BLGtDO0FBT1QsaUM7QUFGb0IsbUM7QUFLdEIsbUM7Ozs7Ozs7Ozs7O0FBekUxQztBQUFBOzs7Ozs7Ozs7Ozs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUE0QztBQUUwRjtBQUMxRjtBQUNNO0FBQ21DO0FBRXJGLE1BQU0sUUFBUSxHQUFHLG1CQUFPLENBQUMsMEZBQTJCLENBQUM7QUFFdEMsTUFBTSxrQkFBa0I7SUFpQnJDLFlBQW9CLElBQStCO1FBQS9CLFNBQUksR0FBSixJQUFJLENBQTJCO1FBTjNDLG1CQUFjLEdBQUcsSUFBSTtRQUNyQixlQUFVLEdBQUcsSUFBSTtRQUNqQixnQkFBVyxHQUFHLElBQUk7UUFLeEIsSUFBSSxJQUFJLEdBQUcsa0VBQU0sQ0FBQyxRQUFRLENBQUM7UUFFM0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7UUFDeEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUM5QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUVwQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQ25ELElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDZixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTO2dCQUN2QixJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRTthQUNoQjtRQUNILENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWM7Z0JBQ3RCLE9BQU07WUFDUixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSztnQkFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsRUFBRTs7Z0JBRTFCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLDZFQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7UUFDL0QsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFFOUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVU7Z0JBQ3ZDLE9BQU07WUFFUixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztnQkFDL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7Z0JBQzVELE9BQU07YUFDUDtZQUVELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFDekMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixFQUFFO1lBQ3RDLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUV0QyxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxzRkFBb0IsQ0FBQyxRQUFRLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLFFBQVE7WUFDL0IsSUFBSSxJQUFJLENBQUMsVUFBVTtnQkFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsNkVBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzRCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDMUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLO1lBQ3hCLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLO2dCQUNoRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyw2RUFBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ3ZELENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBRXBFLDhFQUE4RTtRQUM5RSxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDUixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSwyREFBUSxFQUFFO1FBRTVCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPO0lBQzVCLENBQUM7SUFFTyxLQUFLLENBQUMsUUFBUTtRQUNwQixJQUFJLFFBQTRCO1FBRWhDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUU3QyxRQUFRLEdBQUcsMkZBQXlCLENBQUMsU0FBUyxDQUFDO1FBQy9DLElBQUksUUFBUSxFQUFFO1lBQ1osTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3RUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNwRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRTtZQUN2QixPQUFNO1NBQ1A7UUFFRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFFM0MsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN6QixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdFQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUM7WUFDdkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUU7WUFDdkIsT0FBTTtTQUNQO1FBRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1FBRW5DLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckIsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3RUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFO1lBQ3ZCLE9BQU07U0FDUDtRQUVELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUVyQyxRQUFRLEdBQUcsc0ZBQW9CLENBQUMsS0FBSyxDQUFDO1FBQ3RDLElBQUksUUFBUSxFQUFFO1lBQ1osTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3RUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNwRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtZQUNwQixPQUFNO1NBQ1A7UUFFRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUs7UUFFcEMsUUFBUSxHQUFHLHlGQUF1QixDQUFDLFFBQVEsQ0FBQztRQUM1QyxJQUFJLFFBQVEsRUFBRTtZQUNaLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsd0VBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDcEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUU7WUFDdkIsT0FBTTtTQUNQO1FBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDckMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3RUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDO1lBQ3JFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFO1lBQ3RCLE9BQU07U0FDUDtRQUVELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUVyQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsc0VBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3RUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDO1lBQzNFLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7WUFDMUIsT0FBTTtTQUNQO1FBRUQsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQztRQUUvQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdFQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsbUVBQW1FLENBQUM7WUFDekcsT0FBTTtTQUNQO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3RUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxDQUFDO1lBQ3pHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFO1lBQ3hCLE9BQU07U0FDUDtRQUVELElBQUksTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUN6RixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTO1lBQ3ZCLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFO1NBQ2hCO0lBQ0gsQ0FBQztJQUVPLEtBQUssQ0FBQyxjQUFjLENBQUMsU0FBaUI7UUFDNUMsSUFBSSxPQUFPLEdBQUc7WUFDWixJQUFJLEVBQUUsS0FBSztZQUNYLE1BQU0sRUFBRSxLQUFLO1NBQ2Q7UUFFRCxJQUFJO1lBQ0YsSUFBSSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLDJCQUEyQixFQUFFO2dCQUM5RSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxXQUFXLEVBQUUsYUFBYTtnQkFDMUIsT0FBTyxFQUFFLElBQUksT0FBTyxDQUFDO29CQUNuQixRQUFRLEVBQUUsa0JBQWtCO29CQUM1QixjQUFjLEVBQUUsa0JBQWtCO2lCQUNuQyxDQUFDO2dCQUNGLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUM7YUFDcEMsQ0FBQztZQUVGLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRTtnQkFDZixPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNO2dCQUMvQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUk7YUFDcEI7U0FDRjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxFQUFFLEtBQUssQ0FBQztTQUNqRTtRQUVELE9BQU8sT0FBTztJQUNoQixDQUFDO0lBRU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFnQixFQUFFLFNBQWlCLEVBQUUsSUFBWSxFQUFFLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxLQUFhO1FBQ3pILElBQUk7WUFDRixJQUFJLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sa0JBQWtCLEVBQUU7Z0JBQ3JFLE1BQU0sRUFBRSxNQUFNO2dCQUNkLFdBQVcsRUFBRSxhQUFhO2dCQUMxQixPQUFPLEVBQUUsSUFBSSxPQUFPLENBQUM7b0JBQ25CLFFBQVEsRUFBRSxrQkFBa0I7b0JBQzVCLGNBQWMsRUFBRSxrQkFBa0I7aUJBQ25DLENBQUM7Z0JBQ0YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQy9FLENBQUM7WUFFRixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRTtnQkFDaEIsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzRUFBVyxDQUFDLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxDQUFDO2dCQUNqRyxPQUFPLEtBQUs7YUFDYjtZQUVELElBQUksTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRTtZQUVsQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMscUVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQztnQkFDMUUsT0FBTyxJQUFJO2FBQ1o7WUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzRUFBVyxDQUFDLENBQUMsSUFBSSxDQUFDLDRFQUE0RSxDQUFDO1NBQ2pIO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHFFQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsbURBQW1ELENBQUM7U0FDdkY7UUFFRCxPQUFPLEtBQUs7SUFDZCxDQUFDO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7QUM5T0Q7QUFBQTtBQUFlLE1BQU0sUUFBUTtJQU0zQjtRQUNFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPO1lBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTTtRQUN4QixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxDQUFDLElBQWdCO1FBQ3JCLElBQUksQ0FBQyxJQUFJLENBQ1AsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUM5QixHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQ3hCO1FBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTztJQUNyQixDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQVM7UUFDZixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUN4QixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQVE7UUFDYixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUNwQixDQUFDO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7QUM1QkQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0dBR0c7QUFDSSxTQUFTLEtBQUssQ0FBSSxDQUFNLEVBQUUsQ0FBTTtJQUNyQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0ksU0FBUyxpQkFBaUIsQ0FBQyxFQUFXO0lBQzNDLE9BQU8sRUFBRSxDQUFDLFVBQVU7UUFDbEIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDO0FBQ2pDLENBQUM7QUFFTSxTQUFTLFdBQVcsQ0FBb0MsRUFBSztJQUNsRSxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO1FBQ3pCLElBQUk7WUFDRixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDckIsSUFBSSxHQUFHLElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFVBQVUsSUFBSSxPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFO2dCQUM1RSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUM7Z0JBQ3pDLENBQUMsQ0FBQzthQUNIO1lBQ0QsT0FBTyxHQUFHO1NBQ1g7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQztTQUNsQztJQUNILENBQUMsQ0FBUTtBQUNYLENBQUM7QUFFTSxTQUFTLFdBQVcsQ0FBQyxFQUFlLEVBQUUsUUFBNEI7SUFDdkUsSUFBSSxDQUFDLFFBQVE7UUFDWCxPQUFNO0lBQ1IsUUFBUSxHQUFHLE9BQU8sUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUTtJQUMvRCxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUMvQixDQUFDO0FBRU0sU0FBUyxhQUFhLENBQUMsS0FBYTtJQUN6QyxJQUFJLEdBQUcsR0FBRyx1SUFBdUk7SUFFakosT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUk7QUFDbEMsQ0FBQztBQUVELDhGQUE4RjtBQUM5RixrSEFBa0g7QUFDbEgsMkdBQTJHO0FBQ3BHLFNBQVMsMEJBQTBCLENBQUMsUUFBMkIsRUFBRSxFQUFjO0lBQ3BGLDJDQUEyQztJQUMzQyxtREFBbUQ7SUFDbkQsa0RBQWtEO0lBQ2xELGtIQUFrSDtJQUNsSCxhQUFhO0lBQ2IsTUFBTTtJQUNOLElBQUk7SUFFSix3REFBd0Q7SUFDeEQscUdBQXFHO0FBQ3ZHLENBQUM7Ozs7Ozs7Ozs7OztBQzlERDs7Ozs7Ozs7OztFQUFBLCtDO0VBQ0UsK0M7RUFDRSx5QztFQUNFLDJDO0VBRUYseUM7RUFDRSwyQztFQUlKLHlDO0VBQ0UseUM7RUFDRSwyQztFQUVGLHlDO0VBQ0Usc0M7RUFJSiwwQztFQUNFLGdEOzs7O0VBbEJLLDJCQUFPLHdCQUFQLEU7RUFJRyw0QkFBTyx5Q0FBUCxFOztFQURILDJCQUFPLHlCQUFQLEU7OztFQUpDLDhCQUFPLG9CQUFQLEU7RUFXRSw0QkFBTyxpQ0FBUCxFOztFQURILDJCQUFPLGlEQUFQLEU7O0VBR0EsMkJBQU8sMEJBQVAsRTs7O0VBSkYsMkJBQU8scUJBQVAsRTs7RUFVSywrQkFBTyxxQkFBUCxFOztFQURMLDRCQUFPLG9CQUFQLEU7Ozs7RUFuQkMsOEJBQU8seUJBQVAsRTs7O0VBR0ksa0I7RUFHZ0Qsa0I7RUFTbkQsa0I7RUFLK0Isa0I7Ozs7QUFqQjVCO0FBQUE7QUFBQTtBQUFBLDhCO0FBQUEseUJBQU0sT0FBTixFO0FBR2dEO0FBQUE7QUFBQTtBQUFBLDhCO0FBQUEseUJBQU0sT0FBTixFO0FBU25EO0FBQUE7QUFBQTtBQUFBLDRCO0FBQUEseUJBQU0sU0FBTixFO0FBSytCO0FBQUE7QUFBQTtBQUFBLGlDO0FBQUEseUJBQU0sUUFBTixFOzs7OztBQWpCNUIsZ0M7QUFHZ0QsZ0M7QUFTbkQsOEI7QUFLK0IsbUM7Ozs7Ozs7Ozs7O0FBcEJ4QztBQUFBOzs7Ozs7Ozs7Ozs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBQU8sQ0FBQyxvRkFBcUIsQ0FBQztBQUNjO0FBRUc7QUFDbUI7QUFFbEUsTUFBTSxRQUFRLEdBQUcsbUJBQU8sQ0FBQyxrRkFBb0IsQ0FBQztBQUUvQixNQUFNLFdBQVc7SUFPOUIsWUFBb0IsSUFBVTtRQUFWLFNBQUksR0FBSixJQUFJLENBQU07UUFDNUIsSUFBSSxJQUFJLEdBQUcsa0VBQU0sQ0FBQyxRQUFRLENBQUM7UUFFM0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztRQUVoQyxJQUFJLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1FBRWhDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztRQUNyRCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7UUFDcEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDdEMsRUFBRSxDQUFDLGNBQWMsRUFBRTtZQUNuQixJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ2QsQ0FBQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDdkMsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLLE9BQU87Z0JBQ3BCLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDaEIsQ0FBQyxDQUFDO0lBRUosQ0FBQztJQUVELElBQUksQ0FBQyxHQUFXLEVBQUUsS0FBSyxHQUFHLE9BQU87UUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLDJEQUFRLEVBQUU7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsR0FBRztRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLO1FBRWhDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbEMsbUZBQTBCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUU7UUFFbkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU87SUFDN0IsQ0FBQztJQUVPLEtBQUs7UUFDWCxJQUFJLElBQUksQ0FBQyxPQUFPO1lBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUztRQUN4QixJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRTtRQUNmLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDcEMsQ0FBQztDQUNGOzs7Ozs7Ozs7Ozs7QUN4REQsVUFBVSxtQkFBTyxDQUFDLDJLQUFnRztBQUNsSCwwQkFBMEIsbUJBQU8sQ0FBQyxpU0FBc0o7O0FBRXhMOztBQUVBO0FBQ0EsMEJBQTBCLFFBQVM7QUFDbkM7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7OztBQUlBLHNDOzs7Ozs7Ozs7OztBQ2xCQTs7Ozs7Ozs7OztFQUFBLCtDO0VBQ0UsK0M7RUFDRSx5QztFQUNFLDJDO0VBRUYseUM7RUFDRSwyQztFQUlKLHlDO0VBQ0UseUM7RUFDRSwyQztFQUVGLHlDO0VBQ0Usc0M7RUFJSiwwQztFQUNFLGdEOzs7O0VBbEJLLDJCQUFPLHdCQUFQLEU7RUFJRyw0QkFBTyx5Q0FBUCxFOztFQURILDJCQUFPLHlCQUFQLEU7OztFQUpDLDhCQUFPLG9CQUFQLEU7RUFXRSw0QkFBTywwQkFBUCxFOztFQURILDJCQUFPLGdEQUFQLEU7O0VBR0EsMkJBQU8sMEJBQVAsRTs7O0VBSkYsMkJBQU8scUJBQVAsRTs7RUFVSywrQkFBTyxxQkFBUCxFOztFQURMLDRCQUFPLG9CQUFQLEU7Ozs7RUFuQkMsOEJBQU8sd0JBQVAsRTs7O0VBR0ksa0I7RUFHZ0Qsa0I7RUFTbkQsa0I7RUFLK0Isa0I7Ozs7QUFqQjVCO0FBQUE7QUFBQTtBQUFBLDhCO0FBQUEseUJBQU0sT0FBTixFO0FBR2dEO0FBQUE7QUFBQTtBQUFBLDhCO0FBQUEseUJBQU0sT0FBTixFO0FBU25EO0FBQUE7QUFBQTtBQUFBLDRCO0FBQUEseUJBQU0sU0FBTixFO0FBSytCO0FBQUE7QUFBQTtBQUFBLGlDO0FBQUEseUJBQU0sUUFBTixFOzs7OztBQWpCNUIsZ0M7QUFHZ0QsZ0M7QUFTbkQsOEI7QUFLK0IsbUM7Ozs7Ozs7Ozs7O0FBcEJ4QztBQUFBOzs7Ozs7Ozs7Ozs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBQU8sQ0FBQyxpRkFBb0IsQ0FBQztBQUNlO0FBRUc7QUFDbUI7QUFFbEUsTUFBTSxRQUFRLEdBQUcsbUJBQU8sQ0FBQywrRUFBbUIsQ0FBQztBQUU5QixNQUFNLFVBQVU7SUFPN0IsWUFBb0IsSUFBVTtRQUFWLFNBQUksR0FBSixJQUFJLENBQU07UUFDNUIsSUFBSSxJQUFJLEdBQUcsa0VBQU0sQ0FBQyxRQUFRLENBQUM7UUFDM0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztRQUVoQyxJQUFJLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1FBRWhDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztRQUNyRCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7UUFDcEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDdEMsRUFBRSxDQUFDLGNBQWMsRUFBRTtZQUNuQixJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ2QsQ0FBQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDdkMsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLLE9BQU8sRUFBRTtnQkFDdEIsRUFBRSxDQUFDLGVBQWUsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLEtBQUssRUFBRTthQUNiO1FBQ0gsQ0FBQyxDQUFDO0lBRUosQ0FBQztJQUVELElBQUksQ0FBQyxHQUFXLEVBQUUsS0FBSyxHQUFHLGFBQWE7UUFDckMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLDJEQUFRLEVBQUU7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsR0FBRztRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLO1FBRWhDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbEMsbUZBQTBCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUU7UUFFbkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU87SUFDN0IsQ0FBQztJQUVPLEtBQUs7UUFDWCxJQUFJLElBQUksQ0FBQyxPQUFPO1lBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUztRQUN4QixJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRTtRQUNmLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDcEMsQ0FBQztDQUNGOzs7Ozs7Ozs7Ozs7QUN6REQsVUFBVSxtQkFBTyxDQUFDLDJLQUFnRztBQUNsSCwwQkFBMEIsbUJBQU8sQ0FBQyw4UkFBcUo7O0FBRXZMOztBQUVBO0FBQ0EsMEJBQTBCLFFBQVM7QUFDbkM7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7OztBQUlBLHNDOzs7Ozs7Ozs7OztBQ2xCQTs7Ozs7Ozs7OztFQUFBLCtDO0VBQ0UsK0M7RUFDRSx5QztFQUNFLDJDO0VBRUYseUM7RUFDRSwyQztFQUlKLHlDO0VBQ0UseUM7RUFDRSwyQztFQUVGLHlDO0VBQ0Usc0M7RUFDQSwwQztFQUFLLHdDO0VBQ0wsOEM7RUFJSiwwQztFQUNFLGdEO0VBQ0EsMEM7RUFDQSxnRDs7OztFQXRCSywyQkFBTyx1QkFBUCxFO0VBSUcsNEJBQU8seUNBQVAsRTs7RUFESCwyQkFBTyx3QkFBUCxFOzs7RUFKQyw4QkFBTyxtQkFBUCxFO0VBV0UsNEJBQU8sbUJBQVAsRTs7RUFESCwyQkFBTywwQkFBUCxFOztFQU1JLDZCQUFNLE1BQU4sRTtFQUFZLDhCQUFPLG9CQUFQLEU7Ozs7RUFIaEIsMkJBQU8sMkJBQVAsRTs7O0VBSkYsMkJBQU8scUJBQVAsRTs7RUFZSywrQkFBTyx5QkFBUCxFOzs7RUFFQSwrQkFBTyxxQkFBUCxFOzs7O0VBSEwsNEJBQU8sbUJBQVAsRTs7OztFQXJCQyw4QkFBTyx5QkFBUCxFOzs7RUFHSSxrQjtFQUdnRCxrQjtFQVNuRCxrQjtFQUUyQyxrQjtFQUtSLGtCO0VBRUosa0I7Ozs7QUFyQjVCO0FBQUE7QUFBQTtBQUFBLDhCO0FBQUEseUJBQU0sT0FBTixFO0FBR2dEO0FBQUE7QUFBQTtBQUFBLDhCO0FBQUEseUJBQU0sT0FBTixFO0FBU25EO0FBQUE7QUFBQTtBQUFBLDRCO0FBQUEseUJBQU0sU0FBTixFO0FBRTJDO0FBQUE7QUFBQTtBQUFBLGdDO0FBQUEseUJBQU0sT0FBTixFO0FBS1I7QUFBQTtBQUFBO0FBQUEsaUM7QUFBQSx5QkFBTSxXQUFOLEU7QUFFSjtBQUFBO0FBQUE7QUFBQSxpQztBQUFBLHlCQUFNLE9BQU4sRTs7Ozs7QUFyQjVCLGdDO0FBR2dELGdDO0FBU25ELDhCO0FBRTJDLGtDO0FBS1IsbUM7QUFFSixtQzs7Ozs7Ozs7Ozs7QUF4QnhDO0FBQUE7Ozs7Ozs7Ozs7Ozs7QUNBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFBTyxDQUFDLHVGQUFzQixDQUFDO0FBQ2E7QUFFRztBQUNtQjtBQUVsRSxNQUFNLFFBQVEsR0FBRyxtQkFBTyxDQUFDLHFGQUFxQixDQUFDO0FBRWhDLE1BQU0sWUFBWTtJQVEvQixZQUFvQixJQUFVO1FBQVYsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUM1QixJQUFJLElBQUksR0FBRyxrRUFBTSxDQUFDLFFBQVEsQ0FBQztRQUUzQixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFFaEMsSUFBSSxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFFbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO1FBQ3hELElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztRQUNwRCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDL0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxFQUFFO2dCQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ2xDLENBQUMsQ0FBQztRQUNGLElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQ3RDLEVBQUUsQ0FBQyxjQUFjLEVBQUU7WUFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDaEIsQ0FBQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDdkMsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxFQUFFO2dCQUNqRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ2xDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFJLENBQUMsR0FBVyxFQUFFLEtBQUssR0FBRyxRQUFRO1FBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSwyREFBUSxFQUFFO1FBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLEdBQUc7UUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsS0FBSztRQUVoQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2xDLG1GQUEwQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRTtRQUVuQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTztJQUM3QixDQUFDO0lBRU8sS0FBSyxDQUFDLENBQVM7UUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTztZQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVM7UUFDeEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUU7UUFDZixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ3BDLENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7O0FDN0RELFVBQVUsbUJBQU8sQ0FBQywyS0FBZ0c7QUFDbEgsMEJBQTBCLG1CQUFPLENBQUMsb1NBQXVKOztBQUV6TDs7QUFFQTtBQUNBLDBCQUEwQixRQUFTO0FBQ25DOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7QUFJQSxzQzs7Ozs7Ozs7Ozs7QUNsQkE7Ozs7Ozs7Ozs7RUFBQSwrQztFQUNFLCtDO0VBQ0UseUM7RUFDRSwyQztFQUVGLHlDO0VBQ0ksMkM7RUFJTix5QztFQUNFLHlDO0VBQ0UsMkM7RUFFRix5QztFQUNFLHNDO0VBSUosMEM7RUFDRSxnRDtFQUNBLDBDO0VBQ0EsZ0Q7Ozs7RUFwQkssMkJBQU8sd0JBQVAsRTtFQUlLLDRCQUFPLHlDQUFQLEU7O0VBREwsMkJBQU8seUJBQVAsRTs7O0VBSkMsOEJBQU8sb0JBQVAsRTtFQVdFLDRCQUFPLDhCQUFQLEU7O0VBREgsMkJBQU8sZ0RBQVAsRTs7RUFHQSwyQkFBTywwQkFBUCxFOzs7RUFKRiwyQkFBTyxxQkFBUCxFOztFQVVLLCtCQUFPLHlCQUFQLEU7OztFQUVBLCtCQUFPLHFCQUFQLEU7Ozs7RUFITCw0QkFBTyxvQkFBUCxFOzs7O0VBbkJDLDhCQUFPLDRCQUFQLEU7OztFQUdJLGtCO0VBR2tELGtCO0VBU3JELGtCO0VBS21DLGtCO0VBRUosa0I7Ozs7QUFuQjVCO0FBQUE7QUFBQTtBQUFBLDhCO0FBQUEseUJBQU0sT0FBTixFO0FBR2tEO0FBQUE7QUFBQTtBQUFBLDhCO0FBQUEseUJBQU0sT0FBTixFO0FBU3JEO0FBQUE7QUFBQTtBQUFBLDRCO0FBQUEseUJBQU0sU0FBTixFO0FBS21DO0FBQUE7QUFBQTtBQUFBLGlDO0FBQUEseUJBQU0sV0FBTixFO0FBRUo7QUFBQTtBQUFBO0FBQUEsaUM7QUFBQSx5QkFBTSxPQUFOLEU7Ozs7O0FBbkI1QixnQztBQUdrRCxnQztBQVNyRCw4QjtBQUttQyxtQztBQUVKLG1DOzs7Ozs7Ozs7OztBQXRCeEM7QUFBQTs7Ozs7Ozs7Ozs7OztBQ0FBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUFPLENBQUMsNkZBQXdCLENBQUM7QUFDVztBQUVHO0FBQ21CO0FBRWxFLE1BQU0sUUFBUSxHQUFHLG1CQUFPLENBQUMsMkZBQXVCLENBQUM7QUFFbEMsTUFBTSxjQUFjO0lBT2pDLFlBQW9CLElBQVU7UUFBVixTQUFJLEdBQUosSUFBSSxDQUFNO1FBQzVCLElBQUksSUFBSSxHQUFHLGtFQUFNLENBQUMsUUFBUSxDQUFDO1FBRTNCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFFaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFcEUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDdEMsRUFBRSxDQUFDLGNBQWMsRUFBRTtZQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDLENBQUM7UUFDRixJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRTtZQUN2QyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEtBQUssT0FBTztnQkFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDcEIsQ0FBQyxDQUFDO0lBRUosQ0FBQztJQUVELElBQUksQ0FBQyxHQUFXLEVBQUUsS0FBSyxHQUFHLFVBQVU7UUFDbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLDJEQUFRLEVBQUU7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsR0FBRztRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLO1FBRWhDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbEMsbUZBQTBCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFO1FBRW5CLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPO0lBQzdCLENBQUM7SUFFTyxLQUFLLENBQUMsQ0FBVTtRQUN0QixJQUFJLElBQUksQ0FBQyxPQUFPO1lBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUztRQUN4QixJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRTtRQUNmLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDcEMsQ0FBQztDQUNGOzs7Ozs7Ozs7Ozs7QUN4REQsVUFBVSxtQkFBTyxDQUFDLDJLQUFnRztBQUNsSCwwQkFBMEIsbUJBQU8sQ0FBQywwU0FBeUo7O0FBRTNMOztBQUVBO0FBQ0EsMEJBQTBCLFFBQVM7QUFDbkM7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7OztBQUlBLHNDOzs7Ozs7Ozs7OztBQ2xCQTs7Ozs7Ozs7OztFQUFBLCtDO0VBQ0UsK0M7RUFDRSx5QztFQUNFLDJDO0VBRUYseUM7RUFDRSwyQztFQUlKLHlDO0VBQ0UseUM7RUFDRSwyQztFQUVGLHlDO0VBQ0Usc0M7RUFJSiwwQztFQUNFLGdEOzs7O0VBbEJLLDJCQUFPLHdCQUFQLEU7RUFJRyw0QkFBTyx5Q0FBUCxFOztFQURILDJCQUFPLHlCQUFQLEU7OztFQUpDLDhCQUFPLG9CQUFQLEU7RUFXRSw0QkFBTyxtQ0FBUCxFOztFQURILDJCQUFPLG1EQUFQLEU7O0VBR0EsMkJBQU8sMEJBQVAsRTs7O0VBSkYsMkJBQU8scUJBQVAsRTs7RUFVSywrQkFBTyxxQkFBUCxFOztFQURMLDRCQUFPLG9CQUFQLEU7Ozs7RUFuQkMsOEJBQU8sMkJBQVAsRTs7O0VBR0ksa0I7RUFHZ0Qsa0I7RUFTbkQsa0I7RUFLK0Isa0I7Ozs7QUFqQjVCO0FBQUE7QUFBQTtBQUFBLDhCO0FBQUEseUJBQU0sT0FBTixFO0FBR2dEO0FBQUE7QUFBQTtBQUFBLDhCO0FBQUEseUJBQU0sT0FBTixFO0FBU25EO0FBQUE7QUFBQTtBQUFBLDRCO0FBQUEseUJBQU0sU0FBTixFO0FBSytCO0FBQUE7QUFBQTtBQUFBLGlDO0FBQUEseUJBQU0sUUFBTixFOzs7OztBQWpCNUIsZ0M7QUFHZ0QsZ0M7QUFTbkQsOEI7QUFLK0IsbUM7Ozs7Ozs7Ozs7O0FBcEJ4QztBQUFBOzs7Ozs7Ozs7Ozs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBQU8sQ0FBQywwRkFBdUIsQ0FBQztBQUNZO0FBRUc7QUFDbUI7QUFFbEUsTUFBTSxRQUFRLEdBQUcsbUJBQU8sQ0FBQyx3RkFBc0IsQ0FBQztBQUVqQyxNQUFNLGFBQWE7SUFPaEMsWUFBb0IsSUFBVTtRQUFWLFNBQUksR0FBSixJQUFJLENBQU07UUFDNUIsSUFBSSxJQUFJLEdBQUcsa0VBQU0sQ0FBQyxRQUFRLENBQUM7UUFDM0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztRQUVoQyxJQUFJLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1FBRWhDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztRQUNyRCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7UUFDcEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDdEMsRUFBRSxDQUFDLGNBQWMsRUFBRTtZQUNuQixJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ2QsQ0FBQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDdkMsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLLE9BQU87Z0JBQ3BCLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDaEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQyxHQUFXLEVBQUUsS0FBSyxHQUFHLFNBQVM7UUFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLDJEQUFRLEVBQUU7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsR0FBRztRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLO1FBRWhDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbEMsbUZBQTBCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUU7UUFFbkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU87SUFDN0IsQ0FBQztJQUVPLEtBQUs7UUFDWCxJQUFJLElBQUksQ0FBQyxPQUFPO1lBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUztRQUN4QixJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRTtRQUNmLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDcEMsQ0FBQztDQUNGOzs7Ozs7Ozs7Ozs7QUN0REQsVUFBVSxtQkFBTyxDQUFDLDJLQUFnRztBQUNsSCwwQkFBMEIsbUJBQU8sQ0FBQyx1U0FBd0o7O0FBRTFMOztBQUVBO0FBQ0EsMEJBQTBCLFFBQVM7QUFDbkM7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7OztBQUlBLHNDOzs7Ozs7Ozs7OztBQ2xCQSxVQUFVLG1CQUFPLENBQUMsd0tBQTZGO0FBQy9HLDBCQUEwQixtQkFBTyxDQUFDLGlSQUFpSjs7QUFFbkw7O0FBRUE7QUFDQSwwQkFBMEIsUUFBUztBQUNuQzs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOzs7O0FBSUEsc0M7Ozs7Ozs7Ozs7OztBQ2xCQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUFPLENBQUMsMEVBQXNCLENBQUM7QUFFbUM7QUFDSDtBQUNNO0FBQ007QUFDSDs7Ozs7Ozs7Ozs7OztBQ04zRCw0Q0FBNEMsU0FBUyxFQUFFLGNBQWMsbUJBQU8sQ0FBQyxtRUFBVyxFQUFFLHNCQUFzQixFQUFFLDRCQUE0Qiw0REFBNEQsMENBQTBDLG1CQUFtQiwwREFBMEQsa0NBQWtDLFlBQVksc0JBQXNCLGlCQUFpQixvRkFBb0YsZUFBZSxJQUFJLGtCQUFrQixhQUFhLDhGQUE4RixFQUFFLEtBQUsseUNBQXlDLElBQUksMEJBQTBCLElBQUksNEJBQTRCLFFBQVEsUUFBUSxnQkFBZ0IsK0VBQStFLFNBQVMsNERBQTRELFVBQVUsc0ZBQXNGLFNBQVMsSUFBSSxnQkFBZ0IsbUZBQW1GLHNCQUFzQixHQUFHLGdCQUFnQiw4REFBOEQsZ0JBQWdCLDJCQUEyQixpQ0FBaUMscUNBQXFDLHFDQUFxQyxhQUFhLFFBQVEsY0FBYywrRUFBK0UsNERBQTRELFNBQVMsK0NBQStDLFVBQVUsc0ZBQXNGLFNBQVMsSUFBSSxvRUFBb0UscUZBQXFGLFVBQVUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLGlEQUFpRCxFQUFFLEdBQUcsY0FBYyx5REFBeUQsdUJBQXVCLHNCOzs7Ozs7Ozs7OztBQ0E1aEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYSxVQUFVO0FBQ3ZCLGFBQWEsUUFBUTtBQUNyQixhQUFhLFFBQVE7QUFDckIsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLFVBQVU7QUFDdkIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDZDQUE2QyxTQUFTO0FBQ3REO0FBQ0EsbURBQW1ELHlIQUF5SDs7QUFFNUs7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLG1EQUFtRCx5SEFBeUg7O0FBRTVLO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEI7QUFDQSxLQUFLO0FBQ0w7QUFDQSxtREFBbUQseUhBQXlIOztBQUU1SztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBLDRDQUE0QyxTQUFTO0FBQ3JEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsU0FBUztBQUN2RDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOENBQThDLFNBQVM7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWEsT0FBTztBQUNwQixlQUFlO0FBQ2Y7QUFDQTtBQUNBLG1CQUFtQix1QkFBdUI7QUFDMUM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZTtBQUNmOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUEsTUFBTSxJQUE2QjtBQUNuQztBQUNBLEdBQUcsTUFBTSxFQUVOO0FBQ0gsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ3ZZRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQU8sU0FBUyxJQUFJLENBQUMsRUFBVTtJQUM3QixPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRU0sU0FBUyxVQUFVLENBQUMsS0FBZ0M7SUFDekQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELENBQUM7QUFFTSxTQUFTLFVBQVUsQ0FBQyxLQUFnQztJQUN6RCxJQUFJLENBQUMsS0FBSztRQUNSLE9BQU8sS0FBSztJQUNkLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxLQUFLLEVBQUU7UUFDdkMsSUFBSSxJQUFJLEdBQVUsQ0FBQyxLQUFLLENBQUM7UUFDekIsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEtBQUssRUFBRTtZQUM1QixJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssS0FBSyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssS0FBSyxDQUFDO2dCQUNqRixHQUFHLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3RCO1FBQ0QsT0FBTyxJQUFJO0tBQ1o7U0FBTTtRQUNMLGdFQUFnRTtRQUNoRSxJQUFJLElBQUksR0FBVSxDQUFDLEtBQUssQ0FBQztRQUN6QixLQUFLLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUM5QixJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssS0FBSyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssS0FBSyxDQUFDO2dCQUNqRixHQUFHLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztTQUNmO1FBQ0QsT0FBTyxJQUFJO0tBQ1o7QUFDSCxDQUFDO0FBRU0sU0FBUyxXQUFXLENBQUMsR0FBVztJQUNyQyxvRUFBb0U7SUFDcEUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hGLENBQUM7QUFFTSxTQUFTLHVCQUF1QixDQUFDLFFBQWdCO0lBQ3RELElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ3JCLE9BQU8sNENBQTRDO0FBQ3ZELENBQUM7QUFFTSxTQUFTLHlCQUF5QixDQUFDLFNBQWlCO0lBQ3pELElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxFQUFFO1FBQy9DLE9BQU8sNEVBQTRFO0lBRXJGLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO0lBRTFDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVM7UUFDbEQsT0FBTyx3RkFBd0Y7QUFDbkcsQ0FBQztBQUVNLFNBQVMsb0JBQW9CLENBQUMsUUFBZ0I7SUFDbkQsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUM7UUFDckIsT0FBTyxnREFBZ0Q7SUFFekQsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNyQixPQUFPLDZEQUE2RDtBQUN4RSxDQUFDOzs7Ozs7Ozs7Ozs7O0FDekREO0FBQUE7QUFBQTtBQUFBLGNBQWMsK0JBQStCLGNBQWMsZ0RBQWdELFFBQVEsaUJBQWlCLCtDQUErQyxpQkFBaUIsaUNBQWlDLCtDQUErQywrQ0FBK0Msb0NBQW9DLG1CQUFtQixzQkFBc0IsZ0NBQWdDLGVBQWUsR0FBRyx5Q0FBeUMsbUJBQW1CLHNCQUFzQix5REFBeUQsVUFBVSxzQkFBc0IsK0JBQStCLHlDQUF5QyxTQUFTLGdCQUFnQix1REFBdUQsUUFBUSxpQkFBaUIsb0dBQW9HLGlCQUFpQix3RkFBd0Ysc0NBQXNDLDBCQUEwQixRQUFRLDBDQUEwQyw0RkFBNEYsWUFBWSxHQUFHLHNDQUFzQyx3QkFBd0IsT0FBTyxTQUFTLG1CQUFtQixVQUFVLG9CQUFvQix5Q0FBeUMsZ0JBQWdCLDRCQUE0QixzQ0FBc0MsZUFBZSxJQUFJLFdBQVcsNkZBQTZGLFdBQVcsS0FBSyxXQUFXLDhDQUE4QyxVQUFVLHlDQUF5QyxRQUFRLHVCQUF1Qix5Q0FBeUMsc0JBQXNCLDZCQUE2QixlQUFlLHNCQUFzQixlQUFlLHNCQUFzQix3QkFBd0Isa0NBQWtDLG9CQUFvQixzQkFBc0IsYUFBYSxlQUFlLE1BQU0sOEJBQThCLDRDQUE0Qyw0QkFBNEIsb0JBQW9CLHNCQUFzQixhQUFhLGVBQWUsYUFBYSxlQUFlLGFBQWEsY0FBYyxxQ0FBcUMsZ0dBQWdHLFVBQVUsYUFBYSx1RUFBdUUsa0JBQWtCLCtCQUErQixRQUFRLGlCQUFpQixNQUFNLDBIQUEwSCxrQ0FBa0MsYUFBYSx1QkFBdUIsZUFBZSxrQ0FBa0MsaURBQWlELHFDQUFxQywrRkFBK0YsNENBQTRDLGlHQUFpRyx3Q0FBd0MsZ0NBQWdDLHlCQUF5QixpQ0FBaUMsMkJBQTJCLE9BQU8sd0hBQXdILHVCQUF1QixvREFBb0QsZUFBZSxxR0FBcUcsNkJBQTZCLDZCQUE2QixTQUFTLHlEQUF5RCxZQUFZLDBFQUEwRSxLQUFLLE1BQU0sb0NBQW9DLG1EQUFtRCx3QkFBd0IsdUJBQXVCLDREQUE0RCxLQUFLLDhFQUE4RSxNQUFNLHFDQUFxQyx3REFBd0Qsc01BQXNNLHlDQUF5QyxxQ0FBcUMsMkdBQTJHLDBCQUEwQixHQUFHLDBCQUEwQixnQkFBZ0Isa0JBQWtCLG9CQUFvQixNQUFNLElBQUkscUJBQXFCLFNBQVMsdUJBQXVCLG9CQUFvQixlQUFlLG9EQUFvRCxjQUFjLHlFQUF5RSxvRUFBb0UsY0FBYyxlQUFlLCtFQUErRSx1Q0FBdUMsaUJBQWlCLFVBQVUsNEJBQTRCLDZCQUE2Qix5TEFBeUwsZUFBZSx1RUFBdUUsZUFBZSx3Q0FBd0MsZ0JBQWdCLDJDQUEyQyxtRUFBbUUsRUFBRSxxQkFBcUIsaUJBQWlCLEdBQUcsNkNBQTZDLGdCQUFnQiw4QkFBOEIsK0NBQStDLGFBQWEsOEJBQThCLDJDQUEyQyxnQkFBZ0IsOEJBQThCLHdCQUF3QixTQUFTLGdCQUFnQixFQUFFLHlFQUF5RSxhQUFhLEVBQUUsaUpBQWlKLFlBQVksOENBQThDLGFBQWEsZ0JBQWdCLEtBQUssc0NBQXNDLFdBQVcsU0FBUyxlQUFlLHNDQUFzQywrREFBK0QsU0FBUyxlQUFlLG9DQUFvQyxXQUFXLDJDQUEyQyxzQ0FBc0MsbUJBQW1CLGlDQUFpQyxtREFBbUQsYUFBYSxrRkFBa0YsbUJBQW1CLGdCQUFnQixzQkFBc0IseUJBQXlCLHVCQUF1Qiw2QkFBNkIsS0FBSyxXQUFXLEVBQUUsWUFBWSxzQ0FBc0MsNkNBQTZDLGtCQUFrQixnQkFBZ0Isc0RBQXNELDhCQUE4Qix5Q0FBeUMsZ0JBQWdCLDhCQUE4QixzQ0FBc0MsU0FBUyxtREFBbUQsVUFBVSxRQUFRLG1CQUFtQiwwR0FBMEcsbUJBQW1CLHlGQUF5RixPQUFPLGVBQWUscUxBQXFMLG1CQUFtQix3QkFBd0IsNkNBQTZDLDBCQUEwQixlQUFlLHVCQUF1QixvQ0FBb0MsaUJBQWlCLHFDQUFxQywyQ0FBMkMsU0FBUyxVQUFVLDRCQUE0QixnQkFBZ0Isa0NBQWtDLGVBQWUsZ0NBQWdDLHFCQUFxQiwrREFBK0QscUVBQXFFLGdCQUFnQixtTUFBbU0scUNBQXFDLGlCQUFpQixxQkFBcUIsK0RBQStELHlCQUF5QixJQUFJLHVDQUF1QywyQ0FBMkMsT0FBTywyQkFBMkIsNkRBQTZELFFBQVEsRUFBRSxlQUFlLGlFQUFpRSxtQkFBbUIsdUhBQXVILFFBQVEsMkJBQTJCLGFBQWEsdUVBQXVFLGtCQUFrQiwrQkFBK0IsSUFBSSxTQUFTLGtCQUFrQixzQkFBc0IsS0FBSyxZQUFZLHdCQUF3QixvREFBb0QsRUFBRSxJQUFJLFNBQVMsa0JBQWtCLDhCQUE4QixtRUFBbUUsRUFBRSxHQUFHLFNBQVMsUUFBUSx3QkFBd0IsYUFBYSxRQUFRLEtBQUssOEJBQThCLCtEQUErRCwyQkFBMkIsbUNBQW1DLEVBQUUsUUFBUSxFQUFFLEVBQUUseUJBQXlCLGdCQUFnQix3Q0FBd0MsY0FBYyw2Qjs7Ozs7Ozs7Ozs7QUNBLzBUO0FBQ0Esa0NBQWtDLG1CQUFPLENBQUMsNkhBQXdFO0FBQ2xIO0FBQ0E7QUFDQSxjQUFjLFFBQVMsNkJBQTZCLG1CQUFtQixHQUFHO0FBQzFFO0FBQ0E7Ozs7Ozs7Ozs7OztBQ05BO0FBQ0Esa0NBQWtDLG1CQUFPLENBQUMsNkhBQXdFO0FBQ2xIO0FBQ0E7QUFDQSxjQUFjLFFBQVMsNEJBQTRCLG1CQUFtQixHQUFHO0FBQ3pFO0FBQ0E7Ozs7Ozs7Ozs7OztBQ05BO0FBQ0Esa0NBQWtDLG1CQUFPLENBQUMsNkhBQXdFO0FBQ2xIO0FBQ0E7QUFDQSxjQUFjLFFBQVMsOEJBQThCLG1CQUFtQixHQUFHLDhCQUE4QixrQkFBa0IsMkJBQTJCLGtDQUFrQyx1QkFBdUIsR0FBRyx1QkFBdUIsbUJBQW1CLDhCQUE4QixpQkFBaUIsZ0JBQWdCLEdBQUc7QUFDOVQ7QUFDQTs7Ozs7Ozs7Ozs7O0FDTkE7QUFDQSxrQ0FBa0MsbUJBQU8sQ0FBQyw2SEFBd0U7QUFDbEg7QUFDQTtBQUNBLGNBQWMsUUFBUyxnQ0FBZ0MsbUJBQW1CLEdBQUc7QUFDN0U7QUFDQTs7Ozs7Ozs7Ozs7O0FDTkE7QUFDQSxrQ0FBa0MsbUJBQU8sQ0FBQyw2SEFBd0U7QUFDbEg7QUFDQTtBQUNBLGNBQWMsUUFBUywrQkFBK0IsbUJBQW1CLEdBQUc7QUFDNUU7QUFDQTs7Ozs7Ozs7Ozs7O0FDTkE7QUFDQSxrQ0FBa0MsbUJBQU8sQ0FBQywwSEFBcUU7QUFDL0c7QUFDQTtBQUNBLGNBQWMsUUFBUyxpQkFBaUIsMkJBQTJCLHlDQUF5Qyx1QkFBdUIsaUJBQWlCLGlCQUFpQixHQUFHLDBCQUEwQixvQkFBb0IsY0FBYyxZQUFZLGFBQWEsV0FBVyx5Q0FBeUMsR0FBRyx1QkFBdUIsMEJBQTBCLGtCQUFrQixvREFBb0Qsd0JBQXdCLHNCQUFzQixtQ0FBbUMscUJBQXFCLEdBQUcsd0JBQXdCLHdCQUF3QixrQkFBa0Isc0NBQXNDLDZCQUE2QixxQkFBcUIsR0FBRyw0QkFBNEIseUJBQXlCLHVCQUF1Qix5QkFBeUIsR0FBRyw2QkFBNkIseUJBQXlCLHVCQUF1QixHQUFHLHVCQUF1Qix3QkFBd0IsaURBQWlELGtCQUFrQix3QkFBd0IsOEJBQThCLHFCQUFxQixHQUFHLG9EQUFvRCx1QkFBdUIsa0NBQWtDLG1DQUFtQyxnQkFBZ0Isa0JBQWtCLEdBQUcsZ0VBQWdFLHlDQUF5QywwQ0FBMEMsR0FBRyw4QkFBOEIsOEJBQThCLDBCQUEwQixHQUFHLGtDQUFrQyw4QkFBOEIsR0FBRywwQkFBMEIsOEJBQThCLDBCQUEwQixHQUFHLDhCQUE4Qiw4QkFBOEIsR0FBRywyQkFBMkIsZ0JBQWdCLEdBQUcsK0JBQStCLG9CQUFvQixHQUFHO0FBQ3h3RDtBQUNBOzs7Ozs7Ozs7Ozs7O0FDTmE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7O0FBRWhCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDRDQUE0QyxxQkFBcUI7QUFDakU7O0FBRUE7QUFDQSxLQUFLO0FBQ0wsSUFBSTtBQUNKOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EscUJBQXFCLGlCQUFpQjtBQUN0QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsb0JBQW9CLHFCQUFxQjtBQUN6Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsOEJBQThCOztBQUU5Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBLENBQUM7OztBQUdEO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRCxjQUFjO0FBQ25FO0FBQ0EsQzs7Ozs7Ozs7Ozs7O0FDN0ZhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQ7O0FBRXZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDs7QUFFQTtBQUNBOztBQUVBLGlCQUFpQix3QkFBd0I7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIsaUJBQWlCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxnQkFBZ0IsS0FBd0MsR0FBRyxzQkFBaUIsR0FBRyxTQUFJOztBQUVuRjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQSxxRUFBcUUscUJBQXFCLGFBQWE7O0FBRXZHOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQSx5REFBeUQ7QUFDekQsR0FBRzs7QUFFSDs7O0FBR0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBCQUEwQjtBQUMxQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLG1CQUFtQiw0QkFBNEI7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsb0JBQW9CLDZCQUE2QjtBQUNqRDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsRTs7Ozs7Ozs7Ozs7O0FDM1FBO0FBQUE7QUFBQTtBQUFBO0FBQXNGO0FBQ0c7QUFPMUUsTUFBTSxHQUFHO0lBS3RCLFlBQW9CLElBQWtCLEVBQVUsVUFBc0IsRUFBRTtRQUFwRCxTQUFJLEdBQUosSUFBSSxDQUFjO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFDdEUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxlQUFnQixDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksRUFBRTtRQUM5RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdGQUFrQixDQUFDO1FBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFXLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtZQUN6QyxzQ0FBc0M7WUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDbEQsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUMsRUFBRTtZQUN6RixJQUFJLENBQUMsc0JBQXNCLEVBQUU7WUFDN0IsT0FBTTtTQUNQO1FBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQUU7WUFDdEMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixPQUFNO1NBQ1A7UUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDO0lBQzdDLENBQUM7SUFFTyxLQUFLLENBQUMsWUFBWTtRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUM7UUFFcEMsSUFBSTtZQUNGLElBQUksUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sb0JBQW9CLEVBQUU7Z0JBQzlELE1BQU0sRUFBRSxNQUFNO2dCQUNkLFdBQVcsRUFBRSxhQUFhO2dCQUMxQixPQUFPLEVBQUUsSUFBSSxPQUFPLENBQUM7b0JBQ25CLFFBQVEsRUFBRSxrQkFBa0I7b0JBQzVCLGNBQWMsRUFBRSxrQkFBa0I7aUJBQ25DLENBQUM7Z0JBQ0YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNwRCxDQUFDO1lBRUYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0ZBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyx1REFBdUQsQ0FBQztnQkFDakcsT0FBTTthQUNQO1lBRUQsSUFBSSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFO1lBRWhDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGdGQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUM7Z0JBQzdELE9BQU07YUFDUDtZQUNELG1EQUFtRDtZQUNuRCxRQUFRLENBQUMsUUFBUyxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUU7U0FDNUM7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLCtFQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsbURBQW1ELENBQUM7U0FDdkY7SUFDSCxDQUFDO0lBRU8sS0FBSyxDQUFDLHNCQUFzQjtRQUNsQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFO0lBQzlCLENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7OztBQzFFRDtBQUFBO0FBQUE7QUFBdUM7QUFDWjtBQUUzQixRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQ2pELElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBQ3ZDLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFNBQVM7SUFDeEQsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksU0FBUztJQUV0RCw2REFBaUIsQ0FBQyxnREFBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFO0FBQ25ELENBQUMsQ0FBQyIsImZpbGUiOiJwbGF0Zm9ybS5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG4iLG51bGwsImltcG9ydCB7IHJlbmRlciB9IGZyb20gXCJAdG9ta28vbHQtbW9ua2JlcnJ5XCJcbmltcG9ydCB7IERhc2ggfSBmcm9tIFwiYmtiXCJcbmltcG9ydCB7IHRvVGl0bGVDYXNlLCB3aHlOZXdQYXNzd29yZElzSW52YWxpZCwgd2h5VGVhbVN1YmRvbWFpbklzSW52YWxpZCwgd2h5VXNlcm5hbWVJc0ludmFsaWQgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL2xpYnJhcmllcy9oZWxwZXJzXCJcbmltcG9ydCBEZWZlcnJlZCBmcm9tIFwiLi4vbGlicmFyaWVzL0RlZmVycmVkXCJcbmltcG9ydCB7IHZhbGlkYXRlRW1haWwgfSBmcm9tIFwiLi4vbGlicmFyaWVzL3V0aWxzXCJcbmltcG9ydCB7IEVycm9yRGlhbG9nLCBJbmZvRGlhbG9nLCBXYXJuaW5nRGlhbG9nIH0gZnJvbSBcIi4uL21vZGFsRGlhbG9ncy9tb2RhbERpYWxvZ3NcIlxuXG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoXCIuL1RlYW1DcmVhdGlvbkRpYWxvZy5tb25rXCIpXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlYW1DcmVhdGlvbkRpYWxvZyB7XG4gIHByaXZhdGUgcmVhZG9ubHkgZWw6IEhUTUxEaWFsb2dFbGVtZW50XG4gIHByaXZhdGUgc3ViZG9tYWluRWw6IEhUTUxJbnB1dEVsZW1lbnRcbiAgcHJpdmF0ZSB0ZWFtTmFtZUVsOiBIVE1MSW5wdXRFbGVtZW50XG4gIHByaXZhdGUgZW1haWxFbDogSFRNTElucHV0RWxlbWVudFxuICBwcml2YXRlIGxvZ2luRWw6IEhUTUxJbnB1dEVsZW1lbnRcbiAgcHJpdmF0ZSBuYW1lRWw6IEhUTUxJbnB1dEVsZW1lbnRcbiAgcHJpdmF0ZSBwYXNzd29yZEVsOiBIVE1MSW5wdXRFbGVtZW50XG4gIHByaXZhdGUgY29uZmlybUVsOiBIVE1MSW5wdXRFbGVtZW50XG4gIHByaXZhdGUgc3Bpbm5lckVsOiBIVE1MRWxlbWVudFxuXG4gIHByaXZhdGUgY2FuU2V0VGVhbU5hbWUgPSB0cnVlXG4gIHByaXZhdGUgY2FuU2V0TmFtZSA9IHRydWVcbiAgcHJpdmF0ZSBjYW5TZXRMb2dpbiA9IHRydWVcblxuICBwcml2YXRlIGN1ckRmZDogRGVmZXJyZWQ8Ym9vbGVhbj4gfCB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRhc2g6IERhc2g8eyBiYXNlVXJsOiBzdHJpbmcgfT4pIHtcbiAgICBsZXQgdmlldyA9IHJlbmRlcih0ZW1wbGF0ZSlcblxuICAgIHRoaXMuZWwgPSB2aWV3LnJvb3RFbCgpXG4gICAgdGhpcy5zdWJkb21haW5FbCA9IHZpZXcucmVmKFwic3ViZG9tYWluXCIpXG4gICAgdGhpcy50ZWFtTmFtZUVsID0gdmlldy5yZWYoXCJ0ZWFtTmFtZVwiKVxuICAgIHRoaXMuZW1haWxFbCA9IHZpZXcucmVmKFwiZW1haWxcIilcbiAgICB0aGlzLmxvZ2luRWwgPSB2aWV3LnJlZihcImxvZ2luXCIpXG4gICAgdGhpcy5uYW1lRWwgPSB2aWV3LnJlZihcIm5hbWVcIilcbiAgICB0aGlzLnBhc3N3b3JkRWwgPSB2aWV3LnJlZihcInBhc3N3b3JkXCIpXG4gICAgdGhpcy5jb25maXJtRWwgPSB2aWV3LnJlZihcImNvbmZpcm1cIilcbiAgICB0aGlzLnNwaW5uZXJFbCA9IHZpZXcucmVmKFwic3Bpbm5lclwiKVxuXG4gICAgdmlldy5yZWYoXCJzdWJtaXRCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMub25TdWJtaXQoKSlcbiAgICB2aWV3LnJlZihcImNhbmNlbEJ0blwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuY3VyRGZkKSB7XG4gICAgICAgIHRoaXMuY3VyRGZkLnJlamVjdChcIlByb2Nlc3MgY2FuY2VsZWRcIilcbiAgICAgICAgdGhpcy5jdXJEZmQgPSB1bmRlZmluZWRcbiAgICAgICAgdGhpcy5lbC5jbG9zZSgpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuc3ViZG9tYWluRWwuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5jYW5TZXRUZWFtTmFtZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICBpZiAoIXRoaXMuc3ViZG9tYWluRWwudmFsaWRpdHkudmFsaWQpXG4gICAgICAgIHRoaXMudGVhbU5hbWVFbC52YWx1ZSA9IFwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgdGhpcy50ZWFtTmFtZUVsLnZhbHVlID0gdG9UaXRsZUNhc2UodGhpcy5zdWJkb21haW5FbC52YWx1ZSlcbiAgICB9KVxuXG4gICAgdGhpcy50ZWFtTmFtZUVsLmFkZEV2ZW50TGlzdGVuZXIoXCJvbmlucHV0XCIsICgpID0+IHRoaXMuY2FuU2V0VGVhbU5hbWUgPSBmYWxzZSlcblxuICAgIHRoaXMuZW1haWxFbC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmNhblNldExvZ2luICYmICF0aGlzLmNhblNldE5hbWUpXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiAoIXRoaXMuZW1haWxFbC52YWxpZGl0eS52YWxpZCkge1xuICAgICAgICB0aGlzLmxvZ2luRWwudmFsdWUgPSB0aGlzLmNhblNldExvZ2luID8gXCJcIiA6IHRoaXMubG9naW5FbC52YWx1ZVxuICAgICAgICB0aGlzLm5hbWVFbC52YWx1ZSA9IHRoaXMuY2FuU2V0TmFtZSA/IFwiXCIgOiB0aGlzLm5hbWVFbC52YWx1ZVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgbGV0IHBhcnRzID0gdGhpcy5lbWFpbEVsLnZhbHVlLnNwbGl0KFwiQFwiKVxuICAgICAgbGV0IHN0ciA9IHBhcnRzWzBdLnRvTG9jYWxlTG93ZXJDYXNlKClcbiAgICAgIGxldCBsb3dlclN0ciA9IHN0ci5yZXBsYWNlKC9cXFcvZywgXCJfXCIpXG5cbiAgICAgIGlmICh0aGlzLmNhblNldExvZ2luICYmICF3aHlVc2VybmFtZUlzSW52YWxpZChsb3dlclN0cikpXG4gICAgICAgIHRoaXMubG9naW5FbC52YWx1ZSA9IGxvd2VyU3RyXG4gICAgICBpZiAodGhpcy5jYW5TZXROYW1lKVxuICAgICAgICB0aGlzLm5hbWVFbC52YWx1ZSA9IHRvVGl0bGVDYXNlKHN0ci5yZXBsYWNlKC9cXC4vLCBcIiBcIikpXG4gICAgfSlcblxuICAgIHRoaXMubG9naW5FbC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5jYW5TZXRMb2dpbiA9IGZhbHNlXG4gICAgICBpZiAodGhpcy5jYW5TZXROYW1lICYmIHRoaXMubG9naW5FbC52YWxpZGl0eS52YWxpZClcbiAgICAgICAgdGhpcy5uYW1lRWwudmFsdWUgPSB0b1RpdGxlQ2FzZSh0aGlzLmxvZ2luRWwudmFsdWUpXG4gICAgfSlcblxuICAgIHRoaXMubmFtZUVsLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB0aGlzLmNhblNldE5hbWUgPSBmYWxzZSlcblxuICAgIC8vIEJ5IGRlZmF1bHQsIHByZXNzaW5nIHRoZSBFU0Mga2V5IGNsb3NlIHRoZSBkaWFsb2cuIFdlIGhhdmUgdG8gcHJldmVudCB0aGF0LlxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNhbmNlbFwiLCBldiA9PiBldi5wcmV2ZW50RGVmYXVsdCgpKVxuICB9XG5cbiAgYXN5bmMgb3BlbigpIHtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZWwpXG4gICAgdGhpcy5lbC5zaG93TW9kYWwoKVxuICAgIHRoaXMuY3VyRGZkID0gbmV3IERlZmVycmVkKClcblxuICAgIHJldHVybiB0aGlzLmN1ckRmZC5wcm9taXNlXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG9uU3VibWl0KCkge1xuICAgIGxldCBjaGVja01zZzogc3RyaW5nIHwgdW5kZWZpbmVkXG5cbiAgICBsZXQgc3ViZG9tYWluID0gdGhpcy5zdWJkb21haW5FbC52YWx1ZS50cmltKClcblxuICAgIGNoZWNrTXNnID0gd2h5VGVhbVN1YmRvbWFpbklzSW52YWxpZChzdWJkb21haW4pXG4gICAgaWYgKGNoZWNrTXNnKSB7XG4gICAgICBhd2FpdCB0aGlzLmRhc2guY3JlYXRlKFdhcm5pbmdEaWFsb2cpLnNob3coY2hlY2tNc2cpXG4gICAgICB0aGlzLnRlYW1OYW1lRWwuZm9jdXMoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgbGV0IHRlYW1OYW1lID0gdGhpcy50ZWFtTmFtZUVsLnZhbHVlLnRyaW0oKVxuXG4gICAgaWYgKHRlYW1OYW1lLmxlbmd0aCA9PT0gMCkge1xuICAgICAgYXdhaXQgdGhpcy5kYXNoLmNyZWF0ZShXYXJuaW5nRGlhbG9nKS5zaG93KFwiUGxlYXNlIGVudGVyIGEgdGVhbSBuYW1lLlwiKVxuICAgICAgdGhpcy50ZWFtTmFtZUVsLmZvY3VzKClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGxldCBuYW1lID0gdGhpcy5uYW1lRWwudmFsdWUudHJpbSgpXG5cbiAgICBpZiAobmFtZS5sZW5ndGggPT09IDApIHtcbiAgICAgIGF3YWl0IHRoaXMuZGFzaC5jcmVhdGUoV2FybmluZ0RpYWxvZykuc2hvdyhcIlBsZWFzZSBlbnRlciBhIG5hbWUgZm9yIHRoZSB1c2VyLlwiKVxuICAgICAgdGhpcy50ZWFtTmFtZUVsLmZvY3VzKClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGxldCBsb2dpbiA9IHRoaXMubG9naW5FbC52YWx1ZS50cmltKClcblxuICAgIGNoZWNrTXNnID0gd2h5VXNlcm5hbWVJc0ludmFsaWQobG9naW4pXG4gICAgaWYgKGNoZWNrTXNnKSB7XG4gICAgICBhd2FpdCB0aGlzLmRhc2guY3JlYXRlKFdhcm5pbmdEaWFsb2cpLnNob3coY2hlY2tNc2cpXG4gICAgICB0aGlzLmxvZ2luRWwuZm9jdXMoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgbGV0IHBhc3N3b3JkID0gdGhpcy5wYXNzd29yZEVsLnZhbHVlXG5cbiAgICBjaGVja01zZyA9IHdoeU5ld1Bhc3N3b3JkSXNJbnZhbGlkKHBhc3N3b3JkKVxuICAgIGlmIChjaGVja01zZykge1xuICAgICAgYXdhaXQgdGhpcy5kYXNoLmNyZWF0ZShXYXJuaW5nRGlhbG9nKS5zaG93KGNoZWNrTXNnKVxuICAgICAgdGhpcy5wYXNzd29yZEVsLmZvY3VzKClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0aGlzLmNvbmZpcm1FbC52YWx1ZSAhPT0gcGFzc3dvcmQpIHtcbiAgICAgIGF3YWl0IHRoaXMuZGFzaC5jcmVhdGUoV2FybmluZ0RpYWxvZykuc2hvdyhcIlBhc3N3b3JkcyBkbyBub3QgbWF0Y2guXCIpXG4gICAgICB0aGlzLmNvbmZpcm1FbC5mb2N1cygpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgZW1haWwgPSB0aGlzLmVtYWlsRWwudmFsdWUudHJpbSgpXG5cbiAgICBpZiAoZW1haWwubGVuZ3RoID09PSAwIHx8ICF2YWxpZGF0ZUVtYWlsKGVtYWlsKSkge1xuICAgICAgdGhpcy5kYXNoLmNyZWF0ZShXYXJuaW5nRGlhbG9nKS5zaG93KFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwgYWRkcmVzcy5cIilcbiAgICAgIGF3YWl0IHRoaXMuZW1haWxFbC5mb2N1cygpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgZGF0YSA9IGF3YWl0IHRoaXMuY2hlY2tTdWJkb21haW4oc3ViZG9tYWluKVxuXG4gICAgaWYgKCFkYXRhLmRvbmUpIHtcbiAgICAgIHRoaXMuZGFzaC5jcmVhdGUoV2FybmluZ0RpYWxvZykuc2hvdyhcIlNvbWV0aGluZyB3ZW50IHdyb25nLiBXZSBjb3VsZCBub3QgY29udGFjdCBzZXJ2ZXIgZm9yIHRoZSBtb21lbnQuXCIpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoIWRhdGEuYW5zd2VyKSB7XG4gICAgICBhd2FpdCB0aGlzLmRhc2guY3JlYXRlKFdhcm5pbmdEaWFsb2cpLnNob3coXCJUaGUgc3ViZG9tYWluIHlvdSBjaG9zZWQgaXMgbm90IGF2YWlsYWJsZS4gVHJ5IGFub3RoZXIgb25lLlwiKVxuICAgICAgdGhpcy5zdWJkb21haW5FbC5mb2N1cygpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoYXdhaXQgdGhpcy5yZWdpc3Rlcih0ZWFtTmFtZSwgc3ViZG9tYWluLCBuYW1lLCBsb2dpbiwgcGFzc3dvcmQsIGVtYWlsKSAmJiB0aGlzLmN1ckRmZCkge1xuICAgICAgdGhpcy5jdXJEZmQucmVzb2x2ZSh0cnVlKVxuICAgICAgdGhpcy5jdXJEZmQgPSB1bmRlZmluZWRcbiAgICAgIHRoaXMuZWwuY2xvc2UoKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2hlY2tTdWJkb21haW4oc3ViZG9tYWluOiBzdHJpbmcpIHtcbiAgICBsZXQgb3V0Y29tZSA9IHtcbiAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgYW5zd2VyOiBmYWxzZVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHt0aGlzLmRhc2guYXBwLmJhc2VVcmx9L2FwaS90ZWFtL2NoZWNrLXN1YmRvbWFpbmAsIHtcbiAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgICAgY3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIixcbiAgICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnMoe1xuICAgICAgICAgIFwiQWNjZXB0XCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgIH0pLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN1YmRvbWFpbiB9KVxuICAgICAgfSlcblxuICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgIG91dGNvbWUuYW5zd2VyID0gKGF3YWl0IHJlc3BvbnNlLmpzb24oKSkuYW5zd2VyXG4gICAgICAgIG91dGNvbWUuZG9uZSA9IHRydWVcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5kYXNoLmxvZy5lcnJvcihcIlVuYWJsZSB0byBnZXQgcmVzcG9uc2UgZnJvbSBzZXJ2ZXJcIiwgZXJyb3IpXG4gICAgfVxuXG4gICAgcmV0dXJuIG91dGNvbWVcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVnaXN0ZXIodGVhbU5hbWU6IHN0cmluZywgc3ViZG9tYWluOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgdXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgZW1haWw6IHN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHt0aGlzLmRhc2guYXBwLmJhc2VVcmx9L2FwaS90ZWFtL2NyZWF0ZWAsIHtcbiAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgICAgY3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIixcbiAgICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnMoe1xuICAgICAgICAgIFwiQWNjZXB0XCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgIH0pLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHRlYW1OYW1lLCBzdWJkb21haW4sIG5hbWUsIHVzZXJuYW1lLCBwYXNzd29yZCwgZW1haWwgfSlcbiAgICAgIH0pXG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgYXdhaXQgdGhpcy5kYXNoLmNyZWF0ZShFcnJvckRpYWxvZykuc2hvdyhcIkNhbm5vdCBjb21wbGV0ZSB0aGlzIHRhc2sgbm93LiBUcnkgYWdhaW4gaW4gYSBtb21lbnQuXCIpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBsZXQgYW5zd2VyID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG5cbiAgICAgIGlmIChhbnN3ZXIuZG9uZSkge1xuICAgICAgICB0aGlzLmRhc2guY3JlYXRlKEluZm9EaWFsb2cpLnNob3coXCJZb3UgaGF2ZSBiZWVuIHN1Y2Nlc3NmdWxseSByZWdpc3RyZWQuXCIpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICB0aGlzLmRhc2guY3JlYXRlKEVycm9yRGlhbG9nKS5zaG93KFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuIFdlIGFyZSBzb3JyeSBmb3IgdGhlIGluY29udmVuaWVuY2UuIFRyeSBhZ2FpbiBsYXRlci5cIilcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5kYXNoLmxvZy5lcnJvcihlcnJvcilcbiAgICAgIHRoaXMuZGFzaC5jcmVhdGUoSW5mb0RpYWxvZykuc2hvdyhcIlNvbWV0aGluZyB3ZW50IHdyb25nLiBXZSBjYW5ub3QgcmVhY2ggb3VyIHNlcnZlci5cIilcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVmZXJyZWQ8VD4ge1xuICByZWFkb25seSBwcm9taXNlOiBQcm9taXNlPFQ+XG5cbiAgcHJpdmF0ZSByZXNvbHZlQ2IhOiAocmVzdWx0OiBUKSA9PiB2b2lkXG4gIHByaXZhdGUgcmVqZWN0Q2IhOiAoZXJyOiBhbnkpID0+IHZvaWRcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnJlc29sdmVDYiA9IHJlc29sdmVcbiAgICAgIHRoaXMucmVqZWN0Q2IgPSByZWplY3RcbiAgICB9KVxuICB9XG5cbiAgcGlwZVRvKHByb206IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICBwcm9tLnRoZW4oXG4gICAgICByZXN1bHQgPT4gdGhpcy5yZXNvbHZlKHJlc3VsdCksXG4gICAgICBlcnIgPT4gdGhpcy5yZWplY3QoZXJyKVxuICAgIClcbiAgICByZXR1cm4gdGhpcy5wcm9taXNlXG4gIH1cblxuICByZXNvbHZlKHJlc3VsdDogVCk6IHZvaWQge1xuICAgIHRoaXMucmVzb2x2ZUNiKHJlc3VsdClcbiAgfVxuXG4gIHJlamVjdChlcnI6IGFueSk6IHZvaWQge1xuICAgIHRoaXMucmVqZWN0Q2IoZXJyKVxuICB9XG59XG4iLCIvKipcbiAqIENoZWNrIGlmIHR3byBhcnJheXMgaGF2ZSB0aGUgc2FtZSBjb250ZW50LlxuICogQHNlZSB7QGxpbmsgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83ODM3NDU2L2hvdy10by1jb21wYXJlLWFycmF5cy1pbi1qYXZhc2NyaXB0LzE5NzQ2NzcxIzE5NzQ2NzcxfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWw8VD4oYTogVFtdLCBiOiBUW10pOiBib29sZWFuIHtcbiAgcmV0dXJuIChhLmxlbmd0aCA9PT0gYi5sZW5ndGggJiYgYS5ldmVyeSgodiwgaSkgPT4gdiA9PT0gYltpXSkpXG59XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBjaGlsZHJlbiBvZiBhIEhUTUxFbGVtZW50LlxuICpcbiAqIEBzZWV7QGxpbmsgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzk1NTIyOS9yZW1vdmUtYWxsLWNoaWxkLWVsZW1lbnRzLW9mLWEtZG9tLW5vZGUtaW4tamF2YXNjcmlwdH1cbiAqIEBwYXJhbSBlbFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQWxsQ2hpbGRyZW4oZWw6IEVsZW1lbnQpIHtcbiAgd2hpbGUgKGVsLmZpcnN0Q2hpbGQpXG4gICAgZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhdGNoQW5kTG9nPEMgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IGFueT4oY2I6IEMpOiBDIHtcbiAgcmV0dXJuICgoLi4uYXJnczogYW55W10pID0+IHtcbiAgICB0cnkge1xuICAgICAgbGV0IHJlcyA9IGNiKC4uLmFyZ3MpXG4gICAgICBpZiAocmVzICYmIHR5cGVvZiByZXMudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiByZXMuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXMgPSByZXMuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIltjYXRjaEFuZExvZyBhc3luY11cIiwgZXJyKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coXCJbY2F0Y2hBbmRMb2ddXCIsIGVycilcbiAgICB9XG4gIH0pIGFzIGFueVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkQ3NzQ2xhc3MoZWw6IEhUTUxFbGVtZW50LCBjc3NDbGFzcz86IHN0cmluZyB8IHN0cmluZ1tdKSB7XG4gIGlmICghY3NzQ2xhc3MpXG4gICAgcmV0dXJuXG4gIGNzc0NsYXNzID0gdHlwZW9mIGNzc0NsYXNzID09PSBcInN0cmluZ1wiID8gW2Nzc0NsYXNzXSA6IGNzc0NsYXNzXG4gIGVsLmNsYXNzTGlzdC5hZGQoLi4uY3NzQ2xhc3MpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUVtYWlsKGVtYWlsOiBzdHJpbmcpIHtcbiAgbGV0IHJneCA9IC9eW2EtekEtWjAtOS4hIyQlJicqK1xcLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKiQvXG5cbiAgcmV0dXJuIGVtYWlsLm1hdGNoKHJneCkgIT09IG51bGxcbn1cblxuLy8gRGVzaWduIHJlcXVpcmVtZW50OiBpZiB0aGUgdXNlciBjbGlja3Mgb3V0c2lkZSBhIG1vZGFsIGRpYWxvZywgdGhlIGRpYWxvZyBzaG91bGQgYmUgY2xvc2VkLlxuLy8gVG8gZGV0ZWN0IGNsaWNrIG91dHNpZGUgdGhlIGRpYWxvZywgd2UgY2hlY2sgaWYgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBtb3VzZSBsaWUgaW5zaWRlIHRoZSBkaWFsb2cncyByZWN0YW5nbGUuXG4vLyBOb3RlOiB3aGVuIHdlIGNsaWNrIG9uIHRoZSBkaWFsb2cgYmFja2Ryb3AsIHRoZSBldmVudCB0YXJnZXQgcHJvcGVydHkgY29ycmVzcG9uZHMgdG8gdGhlIGRpYWxvZyBlbGVtZW50LlxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VPdXRzaWRlQ2xpY2tIYW5kbGVyRm9yKGRpYWxvZ0VsOiBIVE1MRGlhbG9nRWxlbWVudCwgY2I6ICgpID0+IHZvaWQpIHtcbiAgLy8gbGV0IGNsaWNrSGFuZGxlciA9IChldjogTW91c2VFdmVudCkgPT4ge1xuICAvLyAgIGlmIChkaWFsb2dFbC5vcGVuICYmIGV2LnRhcmdldCA9PT0gZGlhbG9nRWwpIHtcbiAgLy8gICAgIGxldCByZWN0ID0gZGlhbG9nRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgLy8gICAgIGlmIChldi5jbGllbnRYIDwgcmVjdC5sZWZ0IHx8IGV2LmNsaWVudFggPiByZWN0LnJpZ2h0IHx8IGV2LmNsaWVudFkgPCByZWN0LnRvcCB8fCBldi5jbGllbnRZID4gcmVjdC5ib3R0b20pXG4gIC8vICAgICAgIGNiKClcbiAgLy8gICB9XG4gIC8vIH1cblxuICAvLyBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0hhbmRsZXIpXG4gIC8vIGRpYWxvZ0VsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbG9zZVwiLCAoKSA9PiBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGlja0hhbmRsZXIpKVxufSIsbnVsbCwicmVxdWlyZShcIi4vX0Vycm9yRGlhbG9nLnNjc3NcIilcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gXCJAdG9ta28vbHQtbW9ua2JlcnJ5XCJcbmltcG9ydCB7IERhc2ggfSBmcm9tIFwiYmtiXCJcbmltcG9ydCBEZWZlcnJlZCBmcm9tIFwiLi4vLi4vbGlicmFyaWVzL0RlZmVycmVkXCJcbmltcG9ydCB7IG1ha2VPdXRzaWRlQ2xpY2tIYW5kbGVyRm9yIH0gZnJvbSBcIi4uLy4uL2xpYnJhcmllcy91dGlsc1wiXG5cbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZShcIi4vRXJyb3JEaWFsb2cubW9ua1wiKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvckRpYWxvZyB7XG4gIHByaXZhdGUgcmVhZG9ubHkgZWw6IEhUTUxEaWFsb2dFbGVtZW50XG4gIHByaXZhdGUgbXNnRWw6IEhUTUxFbGVtZW50XG4gIHByaXZhdGUgdGl0bGVFbDogSFRNTEVsZW1lbnRcblxuICBwcml2YXRlIGN1cnJEZmQ6IERlZmVycmVkPGJvb2xlYW4+IHwgdW5kZWZpbmVkXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkYXNoOiBEYXNoKSB7XG4gICAgbGV0IHZpZXcgPSByZW5kZXIodGVtcGxhdGUpXG5cbiAgICB0aGlzLmVsID0gdmlldy5yb290RWwoKVxuICAgIHRoaXMubXNnRWwgPSB2aWV3LnJlZihcIm1lc3NhZ2VcIilcbiAgICB0aGlzLnRpdGxlRWwgPSB2aWV3LnJlZihcInRpdGxlXCIpXG5cbiAgICBsZXQgY2xvc2VDYiA9ICgpID0+IHRoaXMuY2xvc2UoKVxuXG4gICAgdmlldy5yZWYoXCJidXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlQ2IpXG4gICAgdmlldy5yZWYoXCJjbG9zZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VDYilcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjYW5jZWxcIiwgZXYgPT4ge1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5jbG9zZSgpXG4gICAgfSlcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGV2ID0+IHtcbiAgICAgIGlmIChldi5rZXkgPT09IFwiRW50ZXJcIilcbiAgICAgICAgdGhpcy5jbG9zZSgpXG4gICAgfSlcblxuICB9XG5cbiAgc2hvdyhtc2c6IHN0cmluZywgdGl0bGUgPSBcIkVycm9yXCIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aGlzLmN1cnJEZmQgPSBuZXcgRGVmZXJyZWQoKVxuICAgIHRoaXMubXNnRWwudGV4dENvbnRlbnQgPSBtc2dcbiAgICB0aGlzLnRpdGxlRWwudGV4dENvbnRlbnQgPSB0aXRsZVxuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmVsKVxuICAgIG1ha2VPdXRzaWRlQ2xpY2tIYW5kbGVyRm9yKHRoaXMuZWwsICgpID0+IHRoaXMuY2xvc2UoKSlcbiAgICB0aGlzLmVsLnNob3dNb2RhbCgpXG5cbiAgICByZXR1cm4gdGhpcy5jdXJyRGZkLnByb21pc2VcbiAgfVxuXG4gIHByaXZhdGUgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMuY3VyckRmZClcbiAgICAgIHRoaXMuY3VyckRmZC5yZXNvbHZlKHRydWUpXG4gICAgdGhpcy5jdXJyRGZkID0gdW5kZWZpbmVkXG4gICAgdGhpcy5lbC5jbG9zZSgpXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLmVsKVxuICB9XG59XG4iLCJ2YXIgYXBpID0gcmVxdWlyZShcIiEuLi8uLi8uLi9wbGF0Zm9ybS1mcm9udGVuZC9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIik7XG4gICAgICAgICAgICB2YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL3BsYXRmb3JtLWZyb250ZW5kL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uLy4uLy4uL3BsYXRmb3JtLWZyb250ZW5kL25vZGVfbW9kdWxlcy9zYXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL19FcnJvckRpYWxvZy5zY3NzXCIpO1xuXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5fX2VzTW9kdWxlID8gY29udGVudC5kZWZhdWx0IDogY29udGVudDtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4gICAgICAgICAgICB9XG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuaW5zZXJ0ID0gXCJoZWFkXCI7XG5vcHRpb25zLnNpbmdsZXRvbiA9IGZhbHNlO1xuXG52YXIgdXBkYXRlID0gYXBpKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2FscyB8fCB7fTsiLG51bGwsInJlcXVpcmUoXCIuL19JbmZvRGlhbG9nLnNjc3NcIilcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gXCJAdG9ta28vbHQtbW9ua2JlcnJ5XCJcbmltcG9ydCB7IERhc2ggfSBmcm9tIFwiYmtiXCJcbmltcG9ydCBEZWZlcnJlZCBmcm9tIFwiLi4vLi4vbGlicmFyaWVzL0RlZmVycmVkXCJcbmltcG9ydCB7IG1ha2VPdXRzaWRlQ2xpY2tIYW5kbGVyRm9yIH0gZnJvbSBcIi4uLy4uL2xpYnJhcmllcy91dGlsc1wiXG5cbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZShcIi4vSW5mb0RpYWxvZy5tb25rXCIpXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluZm9EaWFsb2cge1xuICBwcml2YXRlIHJlYWRvbmx5IGVsOiBIVE1MRGlhbG9nRWxlbWVudFxuICBwcml2YXRlIG1zZ0VsOiBIVE1MRWxlbWVudFxuICBwcml2YXRlIHRpdGxlRWw6IEhUTUxFbGVtZW50XG5cbiAgcHJpdmF0ZSBjdXJyRGZkOiBEZWZlcnJlZDxib29sZWFuPiB8IHVuZGVmaW5lZFxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZGFzaDogRGFzaCkge1xuICAgIGxldCB2aWV3ID0gcmVuZGVyKHRlbXBsYXRlKVxuICAgIHRoaXMuZWwgPSB2aWV3LnJvb3RFbCgpXG4gICAgdGhpcy5tc2dFbCA9IHZpZXcucmVmKFwibWVzc2FnZVwiKVxuICAgIHRoaXMudGl0bGVFbCA9IHZpZXcucmVmKFwidGl0bGVcIilcblxuICAgIGxldCBjbG9zZUNiID0gKCkgPT4gdGhpcy5jbG9zZSgpXG5cbiAgICB2aWV3LnJlZihcImJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VDYilcbiAgICB2aWV3LnJlZihcImNsb3NlXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZUNiKVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNhbmNlbFwiLCBldiA9PiB7XG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLmNsb3NlKClcbiAgICB9KVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgZXYgPT4ge1xuICAgICAgaWYgKGV2LmtleSA9PT0gXCJFbnRlclwiKSB7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIHRoaXMuY2xvc2UoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgfVxuXG4gIHNob3cobXNnOiBzdHJpbmcsIHRpdGxlID0gXCJJbmZvcm1hdGlvblwiKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdGhpcy5jdXJyRGZkID0gbmV3IERlZmVycmVkKClcbiAgICB0aGlzLm1zZ0VsLnRleHRDb250ZW50ID0gbXNnXG4gICAgdGhpcy50aXRsZUVsLnRleHRDb250ZW50ID0gdGl0bGVcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5lbClcbiAgICBtYWtlT3V0c2lkZUNsaWNrSGFuZGxlckZvcih0aGlzLmVsLCAoKSA9PiB0aGlzLmNsb3NlKCkpXG4gICAgdGhpcy5lbC5zaG93TW9kYWwoKVxuXG4gICAgcmV0dXJuIHRoaXMuY3VyckRmZC5wcm9taXNlXG4gIH1cblxuICBwcml2YXRlIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLmN1cnJEZmQpXG4gICAgICB0aGlzLmN1cnJEZmQucmVzb2x2ZSh0cnVlKVxuICAgIHRoaXMuY3VyckRmZCA9IHVuZGVmaW5lZFxuICAgIHRoaXMuZWwuY2xvc2UoKVxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5lbClcbiAgfVxufVxuIiwidmFyIGFwaSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vcGxhdGZvcm0tZnJvbnRlbmQvbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCIpO1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9wbGF0Zm9ybS1mcm9udGVuZC9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi8uLi9wbGF0Zm9ybS1mcm9udGVuZC9ub2RlX21vZHVsZXMvc2Fzcy1sb2FkZXIvZGlzdC9janMuanMhLi9fSW5mb0RpYWxvZy5zY3NzXCIpO1xuXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5fX2VzTW9kdWxlID8gY29udGVudC5kZWZhdWx0IDogY29udGVudDtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4gICAgICAgICAgICB9XG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuaW5zZXJ0ID0gXCJoZWFkXCI7XG5vcHRpb25zLnNpbmdsZXRvbiA9IGZhbHNlO1xuXG52YXIgdXBkYXRlID0gYXBpKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2FscyB8fCB7fTsiLG51bGwsInJlcXVpcmUoXCIuL19Qcm9tcHREaWFsb2cuc2Nzc1wiKVxuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSBcIkB0b21rby9sdC1tb25rYmVycnlcIlxuaW1wb3J0IHsgRGFzaCB9IGZyb20gXCJia2JcIlxuaW1wb3J0IERlZmVycmVkIGZyb20gXCIuLi8uLi9saWJyYXJpZXMvRGVmZXJyZWRcIlxuaW1wb3J0IHsgbWFrZU91dHNpZGVDbGlja0hhbmRsZXJGb3IgfSBmcm9tIFwiLi4vLi4vbGlicmFyaWVzL3V0aWxzXCJcblxuY29uc3QgdGVtcGxhdGUgPSByZXF1aXJlKFwiLi9Qcm9tcHREaWFsb2cubW9ua1wiKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9tcHREaWFsb2cge1xuICBwcml2YXRlIHJlYWRvbmx5IGVsOiBIVE1MRGlhbG9nRWxlbWVudFxuICBwcml2YXRlIG1zZ0VsOiBIVE1MRWxlbWVudFxuICBwcml2YXRlIHRpdGxlRWw6IEhUTUxFbGVtZW50XG4gIHByaXZhdGUgaW5wdXRFbDogSFRNTElucHV0RWxlbWVudFxuXG4gIHByaXZhdGUgY3VyckRmZDogRGVmZXJyZWQ8c3RyaW5nPiB8IHVuZGVmaW5lZFxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZGFzaDogRGFzaCkge1xuICAgIGxldCB2aWV3ID0gcmVuZGVyKHRlbXBsYXRlKVxuXG4gICAgdGhpcy5lbCA9IHZpZXcucm9vdEVsKClcbiAgICB0aGlzLm1zZ0VsID0gdmlldy5yZWYoXCJtZXNzYWdlXCIpXG4gICAgdGhpcy50aXRsZUVsID0gdmlldy5yZWYoXCJ0aXRsZVwiKVxuICAgIHRoaXMuaW5wdXRFbCA9IHZpZXcucmVmKFwiaW5wdXRcIilcblxuICAgIGxldCBjbG9zZUNiID0gKCkgPT4gdGhpcy5jbG9zZShcIlwiKVxuXG4gICAgdmlldy5yZWYoXCJjYW5jZWxCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlQ2IpXG4gICAgdmlldy5yZWYoXCJjbG9zZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VDYilcbiAgICB2aWV3LnJlZihcIm9rQnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pbnB1dEVsLnZhbHVlICE9PSBcIlwiKVxuICAgICAgICB0aGlzLmNsb3NlKHRoaXMuaW5wdXRFbC52YWx1ZSlcbiAgICB9KVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNhbmNlbFwiLCBldiA9PiB7XG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLmNsb3NlKFwiXCIpXG4gICAgfSlcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGV2ID0+IHtcbiAgICAgIGlmIChldi5rZXkgPT09IFwiRW50ZXJcIiAmJiB0aGlzLmlucHV0RWwudmFsdWUgIT09IFwiXCIpXG4gICAgICAgIHRoaXMuY2xvc2UodGhpcy5pbnB1dEVsLnZhbHVlKVxuICAgIH0pXG4gIH1cblxuICBzaG93KG1zZzogc3RyaW5nLCB0aXRsZSA9IFwiUHJvbXB0XCIpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRoaXMuY3VyckRmZCA9IG5ldyBEZWZlcnJlZCgpXG4gICAgdGhpcy5tc2dFbC50ZXh0Q29udGVudCA9IG1zZ1xuICAgIHRoaXMudGl0bGVFbC50ZXh0Q29udGVudCA9IHRpdGxlXG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZWwpXG4gICAgbWFrZU91dHNpZGVDbGlja0hhbmRsZXJGb3IodGhpcy5lbCwgKCkgPT4gdGhpcy5jbG9zZShcIlwiKSlcbiAgICB0aGlzLmVsLnNob3dNb2RhbCgpXG5cbiAgICByZXR1cm4gdGhpcy5jdXJyRGZkLnByb21pc2VcbiAgfVxuXG4gIHByaXZhdGUgY2xvc2Uoczogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuY3VyckRmZClcbiAgICAgIHRoaXMuY3VyckRmZC5yZXNvbHZlKHMpXG4gICAgdGhpcy5jdXJyRGZkID0gdW5kZWZpbmVkXG4gICAgdGhpcy5lbC5jbG9zZSgpXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLmVsKVxuICB9XG59XG4iLCJ2YXIgYXBpID0gcmVxdWlyZShcIiEuLi8uLi8uLi9wbGF0Zm9ybS1mcm9udGVuZC9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIik7XG4gICAgICAgICAgICB2YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL3BsYXRmb3JtLWZyb250ZW5kL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uLy4uLy4uL3BsYXRmb3JtLWZyb250ZW5kL25vZGVfbW9kdWxlcy9zYXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL19Qcm9tcHREaWFsb2cuc2Nzc1wiKTtcblxuICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQuX19lc01vZHVsZSA/IGNvbnRlbnQuZGVmYXVsdCA6IGNvbnRlbnQ7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuICAgICAgICAgICAgfVxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLmluc2VydCA9IFwiaGVhZFwiO1xub3B0aW9ucy5zaW5nbGV0b24gPSBmYWxzZTtcblxudmFyIHVwZGF0ZSA9IGFwaShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHMgfHwge307IixudWxsLCJyZXF1aXJlKFwiLi9fUXVlc3Rpb25EaWFsb2cuc2Nzc1wiKVxuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSBcIkB0b21rby9sdC1tb25rYmVycnlcIlxuaW1wb3J0IHsgRGFzaCB9IGZyb20gXCJia2JcIlxuaW1wb3J0IERlZmVycmVkIGZyb20gXCIuLi8uLi9saWJyYXJpZXMvRGVmZXJyZWRcIlxuaW1wb3J0IHsgbWFrZU91dHNpZGVDbGlja0hhbmRsZXJGb3IgfSBmcm9tIFwiLi4vLi4vbGlicmFyaWVzL3V0aWxzXCJcblxuY29uc3QgdGVtcGxhdGUgPSByZXF1aXJlKFwiLi9RdWVzdGlvbkRpYWxvZy5tb25rXCIpXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1ZXN0aW9uRGlhbG9nIHtcbiAgcHJpdmF0ZSByZWFkb25seSBlbDogSFRNTERpYWxvZ0VsZW1lbnRcbiAgcHJpdmF0ZSBtc2dFbDogSFRNTEVsZW1lbnRcbiAgcHJpdmF0ZSB0aXRsZUVsOiBIVE1MRWxlbWVudFxuXG4gIHByaXZhdGUgY3VyckRmZDogRGVmZXJyZWQ8Ym9vbGVhbj4gfCB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRhc2g6IERhc2gpIHtcbiAgICBsZXQgdmlldyA9IHJlbmRlcih0ZW1wbGF0ZSlcblxuICAgIHRoaXMuZWwgPSB2aWV3LnJvb3RFbCgpXG4gICAgdGhpcy5tc2dFbCA9IHZpZXcucmVmKFwibWVzc2FnZVwiKVxuICAgIHRoaXMudGl0bGVFbCA9IHZpZXcucmVmKFwidGl0bGVcIilcblxuICAgIHZpZXcucmVmKFwib2tCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UodHJ1ZSkpXG4gICAgdmlldy5yZWYoXCJjYW5jZWxCdG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoZmFsc2UpKVxuICAgIHZpZXcucmVmKFwiY2xvc2VcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoZmFsc2UpKVxuXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2FuY2VsXCIsIGV2ID0+IHtcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuY2xvc2UoZmFsc2UpXG4gICAgfSlcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGV2ID0+IHtcbiAgICAgIGlmIChldi5rZXkgPT09IFwiRW50ZXJcIilcbiAgICAgICAgdGhpcy5jbG9zZSh0cnVlKVxuICAgIH0pXG5cbiAgfVxuXG4gIHNob3cobXNnOiBzdHJpbmcsIHRpdGxlID0gXCJRdWVzdGlvblwiKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdGhpcy5jdXJyRGZkID0gbmV3IERlZmVycmVkKClcbiAgICB0aGlzLm1zZ0VsLnRleHRDb250ZW50ID0gbXNnXG4gICAgdGhpcy50aXRsZUVsLnRleHRDb250ZW50ID0gdGl0bGVcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5lbClcbiAgICBtYWtlT3V0c2lkZUNsaWNrSGFuZGxlckZvcih0aGlzLmVsLCAoKSA9PiB0aGlzLmNsb3NlKGZhbHNlKSlcbiAgICB0aGlzLmVsLnNob3dNb2RhbCgpXG5cbiAgICByZXR1cm4gdGhpcy5jdXJyRGZkLnByb21pc2VcbiAgfVxuXG4gIHByaXZhdGUgY2xvc2UoYjogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLmN1cnJEZmQpXG4gICAgICB0aGlzLmN1cnJEZmQucmVzb2x2ZShiKVxuICAgIHRoaXMuY3VyckRmZCA9IHVuZGVmaW5lZFxuICAgIHRoaXMuZWwuY2xvc2UoKVxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5lbClcbiAgfVxufVxuIiwidmFyIGFwaSA9IHJlcXVpcmUoXCIhLi4vLi4vLi4vcGxhdGZvcm0tZnJvbnRlbmQvbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCIpO1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi9wbGF0Zm9ybS1mcm9udGVuZC9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi8uLi9wbGF0Zm9ybS1mcm9udGVuZC9ub2RlX21vZHVsZXMvc2Fzcy1sb2FkZXIvZGlzdC9janMuanMhLi9fUXVlc3Rpb25EaWFsb2cuc2Nzc1wiKTtcblxuICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQuX19lc01vZHVsZSA/IGNvbnRlbnQuZGVmYXVsdCA6IGNvbnRlbnQ7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuICAgICAgICAgICAgfVxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLmluc2VydCA9IFwiaGVhZFwiO1xub3B0aW9ucy5zaW5nbGV0b24gPSBmYWxzZTtcblxudmFyIHVwZGF0ZSA9IGFwaShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHMgfHwge307IixudWxsLCJyZXF1aXJlKFwiLi9fV2FybmluZ0RpYWxvZy5zY3NzXCIpXG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tIFwiQHRvbWtvL2x0LW1vbmtiZXJyeVwiXG5pbXBvcnQgeyBEYXNoIH0gZnJvbSBcImJrYlwiXG5pbXBvcnQgRGVmZXJyZWQgZnJvbSBcIi4uLy4uL2xpYnJhcmllcy9EZWZlcnJlZFwiXG5pbXBvcnQgeyBtYWtlT3V0c2lkZUNsaWNrSGFuZGxlckZvciB9IGZyb20gXCIuLi8uLi9saWJyYXJpZXMvdXRpbHNcIlxuXG5jb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUoXCIuL1dhcm5pbmdEaWFsb2cubW9ua1wiKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXYXJuaW5nRGlhbG9nIHtcbiAgcHJpdmF0ZSByZWFkb25seSBlbDogSFRNTERpYWxvZ0VsZW1lbnRcbiAgcHJpdmF0ZSBtc2dFbDogSFRNTEVsZW1lbnRcbiAgcHJpdmF0ZSB0aXRsZUVsOiBIVE1MRWxlbWVudFxuXG4gIHByaXZhdGUgY3VyckRmZDogRGVmZXJyZWQ8Ym9vbGVhbj4gfCB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRhc2g6IERhc2gpIHtcbiAgICBsZXQgdmlldyA9IHJlbmRlcih0ZW1wbGF0ZSlcbiAgICB0aGlzLmVsID0gdmlldy5yb290RWwoKVxuICAgIHRoaXMubXNnRWwgPSB2aWV3LnJlZihcIm1lc3NhZ2VcIilcbiAgICB0aGlzLnRpdGxlRWwgPSB2aWV3LnJlZihcInRpdGxlXCIpXG5cbiAgICBsZXQgY2xvc2VDYiA9ICgpID0+IHRoaXMuY2xvc2UoKVxuXG4gICAgdmlldy5yZWYoXCJidXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlQ2IpXG4gICAgdmlldy5yZWYoXCJjbG9zZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VDYilcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjYW5jZWxcIiwgZXYgPT4ge1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy5jbG9zZSgpXG4gICAgfSlcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGV2ID0+IHtcbiAgICAgIGlmIChldi5rZXkgPT09IFwiRW50ZXJcIilcbiAgICAgICAgdGhpcy5jbG9zZSgpXG4gICAgfSlcbiAgfVxuXG4gIHNob3cobXNnOiBzdHJpbmcsIHRpdGxlID0gXCJXYXJuaW5nXCIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aGlzLmN1cnJEZmQgPSBuZXcgRGVmZXJyZWQoKVxuICAgIHRoaXMubXNnRWwudGV4dENvbnRlbnQgPSBtc2dcbiAgICB0aGlzLnRpdGxlRWwudGV4dENvbnRlbnQgPSB0aXRsZVxuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmVsKVxuICAgIG1ha2VPdXRzaWRlQ2xpY2tIYW5kbGVyRm9yKHRoaXMuZWwsICgpID0+IHRoaXMuY2xvc2UoKSlcbiAgICB0aGlzLmVsLnNob3dNb2RhbCgpXG5cbiAgICByZXR1cm4gdGhpcy5jdXJyRGZkLnByb21pc2VcbiAgfVxuXG4gIHByaXZhdGUgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMuY3VyckRmZClcbiAgICAgIHRoaXMuY3VyckRmZC5yZXNvbHZlKHRydWUpXG4gICAgdGhpcy5jdXJyRGZkID0gdW5kZWZpbmVkXG4gICAgdGhpcy5lbC5jbG9zZSgpXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLmVsKVxuICB9XG59XG4iLCJ2YXIgYXBpID0gcmVxdWlyZShcIiEuLi8uLi8uLi9wbGF0Zm9ybS1mcm9udGVuZC9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIik7XG4gICAgICAgICAgICB2YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uL3BsYXRmb3JtLWZyb250ZW5kL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uLy4uLy4uL3BsYXRmb3JtLWZyb250ZW5kL25vZGVfbW9kdWxlcy9zYXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL19XYXJuaW5nRGlhbG9nLnNjc3NcIik7XG5cbiAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50Ll9fZXNNb2R1bGUgPyBjb250ZW50LmRlZmF1bHQgOiBjb250ZW50O1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbiAgICAgICAgICAgIH1cblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5pbnNlcnQgPSBcImhlYWRcIjtcbm9wdGlvbnMuc2luZ2xldG9uID0gZmFsc2U7XG5cbnZhciB1cGRhdGUgPSBhcGkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzIHx8IHt9OyIsInZhciBhcGkgPSByZXF1aXJlKFwiIS4uLy4uL3BsYXRmb3JtLWZyb250ZW5kL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiKTtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vcGxhdGZvcm0tZnJvbnRlbmQvbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vLi4vcGxhdGZvcm0tZnJvbnRlbmQvbm9kZV9tb2R1bGVzL3Nhc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vX21vZGFsRGlhbG9ncy5zY3NzXCIpO1xuXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5fX2VzTW9kdWxlID8gY29udGVudC5kZWZhdWx0IDogY29udGVudDtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4gICAgICAgICAgICB9XG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuaW5zZXJ0ID0gXCJoZWFkXCI7XG5vcHRpb25zLnNpbmdsZXRvbiA9IGZhbHNlO1xuXG52YXIgdXBkYXRlID0gYXBpKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2FscyB8fCB7fTsiLCJyZXF1aXJlKFwiLi9fbW9kYWxEaWFsb2dzLnNjc3NcIilcblxuZXhwb3J0IHsgZGVmYXVsdCBhcyBFcnJvckRpYWxvZyB9IGZyb20gXCIuL0Vycm9yRGlhbG9nL0Vycm9yRGlhbG9nXCJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgSW5mb0RpYWxvZyB9IGZyb20gXCIuL0luZm9EaWFsb2cvSW5mb0RpYWxvZ1wiXG5leHBvcnQgeyBkZWZhdWx0IGFzIFByb21wdERpYWxvZyB9IGZyb20gXCIuL1Byb21wdERpYWxvZy9Qcm9tcHREaWFsb2dcIlxuZXhwb3J0IHsgZGVmYXVsdCBhcyBRdWVzdGlvbkRpYWxvZyB9IGZyb20gXCIuL1F1ZXN0aW9uRGlhbG9nL1F1ZXN0aW9uRGlhbG9nXCJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgV2FybmluZ0RpYWxvZyB9IGZyb20gXCIuL1dhcm5pbmdEaWFsb2cvV2FybmluZ0RpYWxvZ1wiXG5cbiIsIlwidXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBtb25rYmVycnk9cmVxdWlyZShcIm1vbmtiZXJyeVwiKTtmdW5jdGlvbiByZW5kZXIoZSxyPXt9KXtsZXQgbj1tYWtlUmVmRGlyZWN0aXZlKCksdD17cmVmOm4scGxhY2Vob2xkZXI6bWFrZVBsYWNlaG9sZGVyRGlyZWN0aXZlKHIucGxhY2Vob2xkZXJzKX07ci5kaXJlY3RpdmVzPXIuZGlyZWN0aXZlcz9PYmplY3QuYXNzaWduKHt9LHIuZGlyZWN0aXZlcyx0KTp0O2xldCBpPW1vbmtiZXJyeS5yZW5kZXIoZSxkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHIpO3JldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhpLHtyZWZlcmVuY2VzOntnZXQ6KCk9Pm4ucmVmZXJlbmNlc319KSxpLnJvb3RFbD0oKCk9PntpZigxIT09aS5ub2Rlcy5sZW5ndGgpdGhyb3cgbmV3IEVycm9yKGBUaGUgcm9vdCBlbGVtZW50IG11c3QgYmUgYSBzaW5nbGUgZWxlbWVudCAoJHtpLm5vZGVzLmxlbmd0aH0pYCk7cmV0dXJuIGkubm9kZXNbMF19KSxpLnJlZj0oZT0+e2lmKCFuLnJlZmVyZW5jZXNbZV18fDEhPT1uLnJlZmVyZW5jZXNbZV0ubGVuZ3RoKXRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgYSBzaW5nbGUgbm9kZSBcIiR7ZX1cIiAoJHtuLnJlZmVyZW5jZXNbZV0/bi5yZWZlcmVuY2VzW2VdLmxlbmd0aDowfSlgKTtyZXR1cm4gbi5yZWZlcmVuY2VzW2VdWzBdfSksaX1mdW5jdGlvbiBtYWtlUmVmRGlyZWN0aXZlKCl7Y2xhc3MgZXtiaW5kKGUpe2xldCB0PXRoaXMubm9kZTt0aGlzLm5vZGU9ZSx2b2lkIDAhPT10aGlzLm5hbWUmJih0IT09ZSYmbih0aGlzLm5hbWUsdCkscih0aGlzLm5hbWUsdGhpcy5ub2RlKSl9dW5iaW5kKCl7dm9pZCAwIT09dGhpcy5uYW1lJiZuKHRoaXMubmFtZSx0aGlzLm5vZGUpLHRoaXMubm9kZT12b2lkIDB9dXBkYXRlKGUpe2lmKFwic3RyaW5nXCIhPXR5cGVvZiBlKXRocm93IG5ldyBFcnJvcihgVGhlICc6cmVmJyB0eXBlIHNob3VsZCBiZSAnc3RyaW5nJyAoY3VycmVudDogJHt0eXBlb2YgZX0pYCk7bGV0IHQ9dGhpcy5uYW1lO3RoaXMubmFtZT1lLHRoaXMubm9kZSYmKHZvaWQgMCE9PXQmJnQhPT1lJiZuKHQsdGhpcy5ub2RlKSxyKHRoaXMubmFtZSx0aGlzLm5vZGUpKX19cmV0dXJuIGUucmVmZXJlbmNlcz17fSxlO2Z1bmN0aW9uIHIocixuKXtlLnJlZmVyZW5jZXNbcl18fChlLnJlZmVyZW5jZXNbcl09W10pLGUucmVmZXJlbmNlc1tyXS5wdXNoKG4pfWZ1bmN0aW9uIG4ocixuKXtpZighZS5yZWZlcmVuY2VzW3JdKXJldHVybjtsZXQgdD1lLnJlZmVyZW5jZXNbcl0uaW5kZXhPZihuKTstMSE9PXQmJmUucmVmZXJlbmNlc1tyXS5zcGxpY2UodCwxKX19ZnVuY3Rpb24gbWFrZVBsYWNlaG9sZGVyRGlyZWN0aXZlKGUpe3JldHVybiBjbGFzc3tiaW5kKGUpe2lmKHRoaXMubm9kZSl7aWYodGhpcy5ub2RlIT09ZSl0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgYmluZCBhIHBsYWNlaG9sZGVyIG9uIHNldmVyYWwgbm9kZXNcIil9ZWxzZSB0aGlzLm5vZGU9ZSx2b2lkIDAhPT10aGlzLm5hbWUmJnIodGhpcy5uYW1lLHRoaXMubm9kZSl9dW5iaW5kKCl7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHVuYmluZCBhIHBsYWNlaG9sZGVyXCIpfXVwZGF0ZShlKXtpZihcInN0cmluZ1wiIT10eXBlb2YgZSl0aHJvdyBuZXcgRXJyb3IoYFRoZSAnOnJlZicgdHlwZSBzaG91bGQgYmUgJ3N0cmluZycgKGN1cnJlbnQ6ICR7dHlwZW9mIGV9KWApO2lmKHZvaWQgMD09PXRoaXMubmFtZSl0aGlzLm5hbWU9ZSx0aGlzLm5vZGUmJnIodGhpcy5uYW1lLHRoaXMubm9kZSk7ZWxzZSBpZih0aGlzLm5hbWUhPT1lKXRocm93IG5ldyBFcnJvcihgQ2Fubm90IGJpbmQgYSBwbGFjZWhvbGRlciBvbiBzZXZlcmFsIG5hbWVzICgke3RoaXMubmFtZX0sICR7ZX0pYCl9fTtmdW5jdGlvbiByKHIsbil7aWYoIWVbcl0pdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHBsYWNlaG9sZGVyOiAke3J9YCk7bGV0IHQ9ZVtyXShuKTtpZih0KWlmKEFycmF5LmlzQXJyYXkodCkpZm9yKGxldCBlIG9mIHQpbi5hcHBlbmRDaGlsZChlKTtlbHNlIG4uYXBwZW5kQ2hpbGQodCl9fWV4cG9ydHMucmVuZGVyPXJlbmRlcjsiLCIvKiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8gICAgX1xuICogICAgICAgICAgICAgICAgICAgICAvXFwvXFwgICBfX18gIF8gX18gfCB8IF98IHxfXyAgIF9fXyBfIF9fIF8gX18gXyAgIF9cbiAqICAgICAgICAgICAgICAgICAgICAvICAgIFxcIC8gXyBcXHwgJ18gXFx8IHwvIC8gJ18gXFwgLyBfIFxcICdfX3wgJ19ffCB8IHwgfFxuICogICAgICAgICAgICAgICAgICAgLyAvXFwvXFwgXFwgKF8pIHwgfCB8IHwgICA8fCB8XykgfCAgX18vIHwgIHwgfCAgfCB8X3wgfFxuICogICAgICAgICAgICAgICAgICAgXFwvICAgIFxcL1xcX19fL3xffCB8X3xffFxcX1xcXy5fXy8gXFxfX198X3wgIHxffCAgIFxcX18sIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8X19fL1xuICpcbiAqICAgICAgICArLS0tKy0tLSstLS0rLS0tKy0tLSstLS0rLS0tKy0tLSstLS0rLS0tKy0tLSstLS0rLS0tKy0tLSstLS0rLS0tKy0tLSstLS0rLS0tKy0tLStcbiAqICBFbnRlciAtPiAgfCAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICB8ICAgICAgICAgICB8ICAgICAgIHxcbiAqICAgICAgICArICAgKyAgICsgICArLS0tKyAgICstLS0rLS0tKyAgICstLS0rLS0tKyAgICsgICArICAgKy0tLSsgICArICAgKy0tLSsgICArICAgKyAgICtcbiAqICAgICAgICB8ICAgICAgIHwgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgfCAgIHwgICAgICAgfCAgICAgICB8ICAgfCAgIHwgICAgICAgfCAgIHxcbiAqICAgICAgICArLS0tKy0tLSstLS0rLS0tKy0tLSsgICArLS0tKy0tLSstLS0rLS0tKyAgICstLS0rLS0tKyAgICstLS0rICAgKyAgICstLS0rLS0tKyAgICtcbiAqICAgICAgICB8ICAgICAgIHwgICAgICAgICAgICAgICB8ICAgICAgIHwgICAgICAgICAgIHwgICAgICAgfCAgICAgICB8ICAgfCAgICAgICAgICAgfCAgIHxcbiAqICAgICAgICArICAgKyAgICsgICArLS0tKy0tLSstLS0rICAgKyAgICsgICArLS0tKy0tLSsgICArICAgKy0tLSsgICArICAgKy0tLSstLS0rICAgKyAgICtcbiAqICAgICAgICB8ICAgfCAgICAgICB8ICAgICAgICAgICB8ICAgfCAgIHwgICAgICAgfCAgICAgICB8ICAgICAgICAgICAgICAgfCAgIHwgICAgICAgICAgIHxcbiAqICAgICAgICArICAgKy0tLSstLS0rICAgKy0tLSsgICArICAgKyAgICstLS0rICAgKyAgICstLS0rLS0tKy0tLSstLS0rLS0tKyAgICsgICArICAgKy0tLStcbiAqICAgICAgICB8ICAgfCAgICAgICB8ICAgICAgIHwgICAgICAgfCAgICAgICB8ICAgfCAgIHwgICAgICAgfCAgICAgICB8ICAgfCAgICAgICB8ICAgfCAgIHxcbiAqICAgICAgICArICAgKy0tLSsgICArLS0tKyAgICstLS0rLS0tKy0tLSsgICArICAgKyAgICsgICArICAgKyAgICsgICArICAgKy0tLSstLS0rICAgKyAgICtcbiAqICAgICAgICB8ICAgICAgICAgICB8ICAgICAgIHwgICAgICAgfCAgIHwgICAgICAgfCAgICAgICB8ICAgfCAgIHwgICB8ICAgICAgICAgICB8ICAgfCAgIHxcbiAqICAgICAgICArLS0tKy0tLSstLS0rICAgKy0tLSsgICArICAgKyAgICsgICArLS0tKy0tLSstLS0rICAgKy0tLSsgICArLS0tKy0tLSsgICArICAgKyAgICtcbiAqICAgICAgICB8ICAgfCAgICAgICB8ICAgICAgICAgICB8ICAgICAgIHwgICB8ICAgICAgIHwgICAgICAgfCAgICAgICB8ICAgICAgICAgICAgICAgfCAgIHxcbiAqICAgICAgICArICAgKyAgICsgICArLS0tKy0tLSstLS0rICAgKy0tLSsgICArICAgKyAgICsgICArLS0tKyAgICstLS0rLS0tKyAgICstLS0rLS0tKyAgICtcbiAqICAgICAgICB8ICAgfCAgIHwgICAgICAgICAgIHwgICAgICAgICAgIHwgICB8ICAgfCAgIHwgICAgICAgfCAgIHwgICAgICAgfCAgIHwgICAgICAgICAgIHxcbiAqICAgICAgICArICAgKyAgICstLS0rLS0tKyAgICstLS0rLS0tKy0tLSsgICArLS0tKyAgICstLS0rICAgKyAgICsgICArICAgKyAgICsgICArLS0tKyAgICtcbiAqICAgICAgICB8ICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHwgICB8ICAgICAgIHwgICB8ICAgICAgIHwgICB8ICAgICAgIHxcbiAqICAgICAgICArLS0tKy0tLSsgICArICAgKyAgICstLS0rLS0tKy0tLSstLS0rICAgKy0tLSsgICArLS0tKyAgICsgICArLS0tKy0tLSsgICArICAgKy0tLStcbiAqICAgICAgICB8ICAgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHwgICAgICAgICAgICAgICB8ICAgICAgIC0+IEV4aXRcbiAqICAgICAgICArLS0tKy0tLSstLS0rLS0tKy0tLSstLS0rLS0tKy0tLSstLS0rLS0tKy0tLSstLS0rLS0tKy0tLSstLS0rLS0tKy0tLSstLS0rLS0tKy0tLStcbiAqL1xuKGZ1bmN0aW9uIChkb2N1bWVudCkge1xuICAvKipcbiAgICogTW9ua2JlcnJ5XG4gICAqIEBjbGFzc1xuICAgKi9cbiAgZnVuY3Rpb24gTW9ua2JlcnJ5KCkge1xuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICB0aGlzLm5lc3RlZCA9IFtdO1xuICAgIHRoaXMubm9kZXMgPSBbXTtcbiAgICB0aGlzLmZpbHRlcnMgPSBudWxsO1xuICAgIHRoaXMuZGlyZWN0aXZlcyA9IG51bGw7XG4gICAgdGhpcy5jb250ZXh0ID0gbnVsbDtcbiAgICB0aGlzLnVuYmluZCA9IG51bGw7XG4gICAgdGhpcy5vblJlbmRlciA9IG51bGw7XG4gICAgdGhpcy5vblVwZGF0ZSA9IG51bGw7XG4gICAgdGhpcy5vblJlbW92ZSA9IG51bGw7XG4gICAgdGhpcy5ub0NhY2hlID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRlbXBsYXRlIGFuZCBhdHRhY2ggaXQgdG8gbm9kZS5cbiAgICogQHBhcmFtIHtNb25rYmVycnl9IHRlbXBsYXRlXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gbm9kZVxuICAgKiBAcGFyYW0ge09iamVjdD19IG9wdGlvbnNcbiAgICogQHJldHVybiB7TW9ua2JlcnJ5fVxuICAgKi9cbiAgTW9ua2JlcnJ5LnJlbmRlciA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgbm9kZSwgb3B0aW9ucykge1xuICAgIHZhciB2aWV3O1xuXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5ub0NhY2hlKSB7XG4gICAgICB2aWV3ID0gbmV3IHRlbXBsYXRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZpZXcgPSB0ZW1wbGF0ZS5wb29sLnBvcCgpIHx8IG5ldyB0ZW1wbGF0ZSgpO1xuICAgIH1cblxuICAgIGlmIChub2RlLm5vZGVUeXBlID09IDgpIHtcbiAgICAgIHZpZXcuaW5zZXJ0QmVmb3JlKG5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2aWV3LmFwcGVuZFRvKG5vZGUpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9ucy5wYXJlbnQpIHtcbiAgICAgICAgdmlldy5wYXJlbnQgPSBvcHRpb25zLnBhcmVudDtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuY29udGV4dCkge1xuICAgICAgICB2aWV3LmNvbnRleHQgPSBvcHRpb25zLmNvbnRleHQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmZpbHRlcnMpIHtcbiAgICAgICAgdmlldy5maWx0ZXJzID0gb3B0aW9ucy5maWx0ZXJzO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5kaXJlY3RpdmVzKSB7XG4gICAgICAgIHZpZXcuZGlyZWN0aXZlcyA9IG9wdGlvbnMuZGlyZWN0aXZlcztcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMubm9DYWNoZSkge1xuICAgICAgICB2aWV3Lm5vQ2FjaGUgPSBvcHRpb25zLm5vQ2FjaGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHZpZXcub25SZW5kZXIpIHtcbiAgICAgIHZpZXcub25SZW5kZXIoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmlldztcbiAgfTtcblxuICAvKipcbiAgICogUHJlcmVwZGVyIHRlbXBsYXRlIGZvciBmdXR1cmUgdXNhZ2UuXG4gICAqIEBwYXJhbSB7TW9ua2JlcnJ5fSB0ZW1wbGF0ZSAtIFRlbXBsYXRlIG5hbWUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lcyAtIFRpbWVzIG9mIHByZXJlbmRlci5cbiAgICovXG4gIE1vbmtiZXJyeS5wcmVyZW5kZXIgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHRpbWVzKSB7XG4gICAgd2hpbGUgKHRpbWVzLS0pIHtcbiAgICAgIHRlbXBsYXRlLnBvb2wucHVzaChuZXcgdGVtcGxhdGUoKSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBNYWluIGxvb3BzIHByb2Nlc3Nvci5cbiAgICovXG4gIE1vbmtiZXJyeS5sb29wID0gZnVuY3Rpb24gKHBhcmVudCwgbm9kZSwgbWFwLCB0ZW1wbGF0ZSwgYXJyYXksIG9wdGlvbnMpIHtcbiAgICB2YXIgaSwgaiwgbGVuLCBrZXlzLCB0cmFuc2Zvcm0sIGFycmF5TGVuZ3RoLCBjaGlsZHJlblNpemUgPSBtYXAubGVuZ3RoO1xuXG4gICAgLy8gR2V0IGFycmF5IGxlbmd0aCwgYW5kIGNvbnZlcnQgb2JqZWN0IHRvIGFycmF5IGlmIG5lZWRlZC5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcnJheSkpIHtcbiAgICAgIHRyYW5zZm9ybSA9IHRyYW5zZm9ybUFycmF5O1xuICAgICAgYXJyYXlMZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyYW5zZm9ybSA9IHRyYW5zZm9ybU9iamVjdDtcbiAgICAgIGtleXMgPSBPYmplY3Qua2V5cyhhcnJheSk7XG4gICAgICBhcnJheUxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIElmIG5ldyBhcnJheSBjb250YWlucyBsZXNzIGl0ZW1zIHdoYXQgYmVmb3JlLCByZW1vdmUgc3VycGx1c2VzLlxuICAgIGxlbiA9IGNoaWxkcmVuU2l6ZSAtIGFycmF5TGVuZ3RoO1xuICAgIGZvciAoaSBpbiBtYXAuaXRlbXMpIHtcbiAgICAgIGlmIChsZW4tLSA+IDApIHtcbiAgICAgICAgbWFwLml0ZW1zW2ldLnJlbW92ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBzb21lIHZpZXdzLCB1cGRhdGUgdGhlcmUgbG9vcCBzdGF0ZS5cbiAgICBqID0gMDtcbiAgICBmb3IgKGkgaW4gbWFwLml0ZW1zKSB7XG4gICAgICBtYXAuaXRlbXNbaV0uX19zdGF0ZV9fID0gdHJhbnNmb3JtKGFycmF5LCBrZXlzLCBqLCBvcHRpb25zKTtcbiAgICAgIGorKztcbiAgICB9XG5cbiAgICAvLyBJZiBuZXcgYXJyYXkgY29udGFpbnMgbW9yZSBpdGVtcyB3aGVuIHByZXZpb3VzLCByZW5kZXIgbmV3IHZpZXdzIGFuZCBhcHBlbmQgdGhlbS5cbiAgICBmb3IgKGogPSBjaGlsZHJlblNpemUsIGxlbiA9IGFycmF5TGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIC8vIFJlbmRlciBuZXcgdmlldy5cbiAgICAgIHZhciB2aWV3ID0gTW9ua2JlcnJ5LnJlbmRlcih0ZW1wbGF0ZSwgbm9kZSwge3BhcmVudDogcGFyZW50LCBjb250ZXh0OiBwYXJlbnQuY29udGV4dCwgZmlsdGVyczogcGFyZW50LmZpbHRlcnMsIGRpcmVjdGl2ZXM6IHBhcmVudC5kaXJlY3RpdmVzLCBub0NhY2hlOiBwYXJlbnQubm9DYWNoZX0pO1xuXG4gICAgICAvLyBTZXQgdmlldyBoaWVyYXJjaHkuXG4gICAgICBwYXJlbnQubmVzdGVkLnB1c2godmlldyk7XG5cbiAgICAgIC8vIFJlbWVtYmVyIHRvIHJlbW92ZSBmcm9tIGNoaWxkcmVuIG1hcCBvbiB2aWV3IHJlbW92ZS5cbiAgICAgIGkgPSBtYXAucHVzaCh2aWV3KTtcbiAgICAgIHZpZXcudW5iaW5kID0gKGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgbWFwLnJlbW92ZShpKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKGkpO1xuXG4gICAgICAvLyBTZXQgdmlldyBzdGF0ZSBmb3IgbGF0ZXIgdXBkYXRlIGluIG9uVXBkYXRlLlxuICAgICAgdmlldy5fX3N0YXRlX18gPSB0cmFuc2Zvcm0oYXJyYXksIGtleXMsIGosIG9wdGlvbnMpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogTWFpbiBpZiBwcm9jZXNzb3IuXG4gICAqL1xuICBNb25rYmVycnkuY29uZCA9IGZ1bmN0aW9uIChwYXJlbnQsIG5vZGUsIGNoaWxkLyoucmVmKi8sIHRlbXBsYXRlLCB0ZXN0KSB7XG4gICAgaWYgKGNoaWxkLnJlZikgeyAvLyBJZiB2aWV3IHdhcyBhbHJlYWR5IGluc2VydGVkLCB1cGRhdGUgb3IgcmVtb3ZlIGl0LlxuICAgICAgaWYgKCF0ZXN0KSB7XG4gICAgICAgIGNoaWxkLnJlZi5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRlc3QpIHtcbiAgICAgIC8vIFJlbmRlciBuZXcgdmlldy5cbiAgICAgIHZhciB2aWV3ID0gTW9ua2JlcnJ5LnJlbmRlcih0ZW1wbGF0ZSwgbm9kZSwge3BhcmVudDogcGFyZW50LCBjb250ZXh0OiBwYXJlbnQuY29udGV4dCwgZmlsdGVyczogcGFyZW50LmZpbHRlcnMsIGRpcmVjdGl2ZXM6IHBhcmVudC5kaXJlY3RpdmVzLCBub0NhY2hlOiBwYXJlbnQubm9DYWNoZX0pO1xuXG4gICAgICAvLyBTZXQgdmlldyBoaWVyYXJjaHkuXG4gICAgICBwYXJlbnQubmVzdGVkLnB1c2godmlldyk7XG5cbiAgICAgIC8vIFJlbWVtYmVyIHRvIHJlbW92ZSBjaGlsZCByZWYgb24gcmVtb3ZlIG9mIHZpZXcuXG4gICAgICBjaGlsZC5yZWYgPSB2aWV3O1xuICAgICAgdmlldy51bmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoaWxkLnJlZiA9IG51bGw7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB0ZXN0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBNYWluIGN1c3RvbSB0YWdzIHByb2Nlc3Nvci5cbiAgICovXG4gIE1vbmtiZXJyeS5pbnNlcnQgPSBmdW5jdGlvbiAocGFyZW50LCBub2RlLCBjaGlsZC8qLnJlZiovLCB0ZW1wbGF0ZSwgZGF0YSkge1xuICAgIGlmIChjaGlsZC5yZWYpIHsgLy8gSWYgdmlldyB3YXMgYWxyZWFkeSBpbnNlcnRlZCwgdXBkYXRlIG9yIHJlbW92ZSBpdC5cbiAgICAgIGNoaWxkLnJlZi51cGRhdGUoZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlbmRlciBuZXcgdmlldy5cbiAgICAgIHZhciB2aWV3ID0gTW9ua2JlcnJ5LnJlbmRlcih0ZW1wbGF0ZSwgbm9kZSwge3BhcmVudDogcGFyZW50LCBjb250ZXh0OiBwYXJlbnQuY29udGV4dCwgZmlsdGVyczogcGFyZW50LmZpbHRlcnMsIGRpcmVjdGl2ZXM6IHBhcmVudC5kaXJlY3RpdmVzLCBub0NhY2hlOiBwYXJlbnQubm9DYWNoZX0pO1xuXG4gICAgICAvLyBTZXQgdmlldyBoaWVyYXJjaHkuXG4gICAgICBwYXJlbnQubmVzdGVkLnB1c2godmlldyk7XG5cbiAgICAgIC8vIFJlbWVtYmVyIHRvIHJlbW92ZSBjaGlsZCByZWYgb24gcmVtb3ZlIG9mIHZpZXcuXG4gICAgICBjaGlsZC5yZWYgPSB2aWV3O1xuICAgICAgdmlldy51bmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoaWxkLnJlZiA9IG51bGw7XG4gICAgICB9O1xuXG4gICAgICAvLyBTZXQgdmlldyBkYXRhIChub3RlIHdoYXQgaXQgbXVzdCBiZSBhZnRlciBhZGRpbmcgbm9kZXMgdG8gRE9NKS5cbiAgICAgIHZpZXcudXBkYXRlKGRhdGEpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlIHZpZXcgZnJvbSBET00uXG4gICAqL1xuICBNb25rYmVycnkucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBSZW1vdmUgYXBwZW5kZWQgbm9kZXMuXG4gICAgdmFyIGkgPSB0aGlzLm5vZGVzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB0aGlzLm5vZGVzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5ub2Rlc1tpXSk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHNlbGYgZnJvbSBwYXJlbnQncyBjaGlsZHJlbiBtYXAgb3IgY2hpbGQgcmVmLlxuICAgIGlmICh0aGlzLnVuYmluZCkge1xuICAgICAgdGhpcy51bmJpbmQoKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgYWxsIG5lc3RlZCB2aWV3cy5cbiAgICBpID0gdGhpcy5uZXN0ZWQubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHRoaXMubmVzdGVkW2ldLnJlbW92ZSgpO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSB0aGlzIHZpZXcgZnJvbSBwYXJlbnQncyBuZXN0ZWQgdmlld3MuXG4gICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICBpID0gdGhpcy5wYXJlbnQubmVzdGVkLmluZGV4T2YodGhpcyk7XG4gICAgICB0aGlzLnBhcmVudC5uZXN0ZWQuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIENhbGwgb24gcmVtb3ZlIGNhbGxiYWNrLlxuICAgIGlmICh0aGlzLm9uUmVtb3ZlKSB7XG4gICAgICB0aGlzLm9uUmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgLy8gU3RvcmUgdmlldyBpbiBwb29sIGZvciByZXVzZSBpbiBmdXR1cmUuXG4gICAgaWYgKCF0aGlzLm5vQ2FjaGUpIHtcbiAgICAgIHRoaXMuY29uc3RydWN0b3IucG9vbC5wdXNoKHRoaXMpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSB0b05vZGVcbiAgICovXG4gIE1vbmtiZXJyeS5wcm90b3R5cGUuYXBwZW5kVG8gPSBmdW5jdGlvbiAodG9Ob2RlKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubm9kZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRvTm9kZS5hcHBlbmRDaGlsZCh0aGlzLm5vZGVzW2ldKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gdG9Ob2RlXG4gICAqL1xuICBNb25rYmVycnkucHJvdG90eXBlLmluc2VydEJlZm9yZSA9IGZ1bmN0aW9uICh0b05vZGUpIHtcbiAgICBpZiAodG9Ob2RlLnBhcmVudE5vZGUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLm5vZGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHRvTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLm5vZGVzW2ldLCB0b05vZGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiQ2FuIG5vdCBpbnNlcnQgY2hpbGQgdmlldyBpbnRvIHBhcmVudCBub2RlLiBcIiArXG4gICAgICAgIFwiWW91IG5lZWQgYXBwZW5kIHlvdXIgdmlldyBmaXJzdCBhbmQgdGhlbiB1cGRhdGUuXCJcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm4gcmVuZGVyZWQgbm9kZSwgb3IgRG9jdW1lbnRGcmFnbWVudCBvZiByZW5kZXJlZCBub2RlcyBpZiBtb3JlIHRoZW4gb25lIHJvb3Qgbm9kZSBpbiB0ZW1wbGF0ZS5cbiAgICogQHJldHVybnMge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH1cbiAgICovXG4gIE1vbmtiZXJyeS5wcm90b3R5cGUuY3JlYXRlRG9jdW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMubm9kZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIHJldHVybiB0aGlzLm5vZGVzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5ub2Rlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCh0aGlzLm5vZGVzW2ldKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeVxuICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICovXG4gIE1vbmtiZXJyeS5wcm90b3R5cGUucXVlcnlTZWxlY3RvciA9IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMubm9kZXNbaV0ubWF0Y2hlcyAmJiB0aGlzLm5vZGVzW2ldLm1hdGNoZXMocXVlcnkpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVzW2ldO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5ub2Rlc1tpXS5ub2RlVHlwZSA9PT0gOCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgdXNlIHF1ZXJ5U2VsZWN0b3Igd2l0aCBub24tZWxlbWVudCBub2RlcyBvbiBmaXJzdCBsZXZlbC4nKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMubm9kZXNbaV0ucXVlcnlTZWxlY3Rvcikge1xuICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXMubm9kZXNbaV0ucXVlcnlTZWxlY3RvcihxdWVyeSk7XG4gICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cblxuICAvKipcbiAgICogU2ltcGxlIE1hcCBpbXBsZW1lbnRhdGlvbiB3aXRoIGxlbmd0aCBwcm9wZXJ0eS5cbiAgICovXG4gIGZ1bmN0aW9uIE1hcCgpIHtcbiAgICB0aGlzLml0ZW1zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5uZXh0ID0gMDtcbiAgfVxuXG4gIE1hcC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgdGhpcy5pdGVtc1t0aGlzLm5leHRdID0gZWxlbWVudDtcbiAgICB0aGlzLmxlbmd0aCArPSAxO1xuICAgIHRoaXMubmV4dCArPSAxO1xuICAgIHJldHVybiB0aGlzLm5leHQgLSAxO1xuICB9O1xuXG4gIE1hcC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGkpIHtcbiAgICBpZiAoaSBpbiB0aGlzLml0ZW1zKSB7XG4gICAgICBkZWxldGUgdGhpcy5pdGVtc1tpXTtcbiAgICAgIHRoaXMubGVuZ3RoIC09IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGFyZSB0cnlpbmcgdG8gZGVsZXRlIG5vdCBleGlzdGluZyBlbGVtZW50IFwiJyArIGkgKyAnXCIgZm9ybSBtYXAuJyk7XG4gICAgfVxuICB9O1xuXG4gIE1hcC5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5pdGVtcykge1xuICAgICAgY2FsbGJhY2sodGhpcy5pdGVtc1tpXSk7XG4gICAgfVxuICB9O1xuXG4gIE1vbmtiZXJyeS5NYXAgPSBNYXA7XG5cbiAgLy9cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIGZvciB3b3JraW5nIHdpdGggZm9yZWFjaCBsb29wcyBkYXRhLlxuICAvLyBXaWxsIHRyYW5zZm9ybSBkYXRhIGZvciBcImtleSwgdmFsdWUgb2YgYXJyYXlcIiBjb25zdHJ1Y3Rpb25zLlxuICAvL1xuXG4gIGZ1bmN0aW9uIHRyYW5zZm9ybUFycmF5KGFycmF5LCBrZXlzLCBpLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHZhciB0ID0ge19faW5kZXhfXzogaX07XG4gICAgICB0W29wdGlvbnMudmFsdWVdID0gYXJyYXlbaV07XG5cbiAgICAgIGlmIChvcHRpb25zLmtleSkge1xuICAgICAgICB0W29wdGlvbnMua2V5XSA9IGk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYXJyYXlbaV07XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNmb3JtT2JqZWN0KGFycmF5LCBrZXlzLCBpLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHZhciB0ID0ge19faW5kZXhfXzogaX07XG4gICAgICB0W29wdGlvbnMudmFsdWVdID0gYXJyYXlba2V5c1tpXV07XG5cbiAgICAgIGlmIChvcHRpb25zLmtleSkge1xuICAgICAgICB0W29wdGlvbnMua2V5XSA9IGtleXNbaV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYXJyYXlba2V5c1tpXV07XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBNb25rYmVycnk7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93Lk1vbmtiZXJyeSA9IE1vbmtiZXJyeTtcbiAgfVxufSkod2luZG93LmRvY3VtZW50KTtcbiIsImV4cG9ydCBmdW5jdGlvbiB3YWl0KG1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0RlYnVnU3RyKGVudHJ5PzogTWFwPGFueSwgYW55PiB8IFNldDxhbnk+KSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh0b0RlYnVnT2JqKGVudHJ5KSwgbnVsbCwgMilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvRGVidWdPYmooZW50cnk/OiBNYXA8YW55LCBhbnk+IHwgU2V0PGFueT4pIHtcbiAgaWYgKCFlbnRyeSlcbiAgICByZXR1cm4gZW50cnlcbiAgaWYgKGVudHJ5W1N5bWJvbC50b1N0cmluZ1RhZ10gPT09IFwiTWFwXCIpIHtcbiAgICBsZXQgbGlzdDogYW55W10gPSBbXCJNQVBcIl1cbiAgICBmb3IgKGxldCBba2V5LCB2YWxdIG9mIGVudHJ5KSB7XG4gICAgICBpZiAodmFsICYmICh2YWxbU3ltYm9sLnRvU3RyaW5nVGFnXSA9PT0gXCJNYXBcIiB8fCB2YWxbU3ltYm9sLnRvU3RyaW5nVGFnXSA9PT0gXCJTZXRcIikpXG4gICAgICAgIHZhbCA9IHRvRGVidWdPYmoodmFsKVxuICAgICAgbGlzdC5wdXNoKFtrZXksIHZhbF0pXG4gICAgfVxuICAgIHJldHVybiBsaXN0XG4gIH0gZWxzZSB7XG4gICAgLy8gY29uc29sZS5sb2coXCIrKytcIiwgZW50cnlbU3ltYm9sLnRvU3RyaW5nVGFnXSwgZW50cnkudmFsdWVzKCkpXG4gICAgbGV0IGxpc3Q6IGFueVtdID0gW1wiU0VUXCJdXG4gICAgZm9yIChsZXQgdmFsIG9mIGVudHJ5LnZhbHVlcygpKSB7XG4gICAgICBpZiAodmFsICYmICh2YWxbU3ltYm9sLnRvU3RyaW5nVGFnXSA9PT0gXCJNYXBcIiB8fCB2YWxbU3ltYm9sLnRvU3RyaW5nVGFnXSA9PT0gXCJTZXRcIikpXG4gICAgICAgIHZhbCA9IHRvRGVidWdPYmoodmFsKVxuICAgICAgbGlzdC5wdXNoKHZhbClcbiAgICB9XG4gICAgcmV0dXJuIGxpc3RcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9UaXRsZUNhc2Uoc3RyOiBzdHJpbmcpIHtcbiAgLy8gU2VlIGh0dHBzOi8vbG92ZTJkZXYuY29tL2Jsb2cvamF2YXNjcmlwdC10b3VwcGVyY2FzZS10b2xvd2VyY2FzZS9cbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXHcrL2csIHcgPT4gdy5jaGFyQXQoMCkudG9Mb2NhbGVVcHBlckNhc2UoKSArIHcuc3Vic3RyKDEpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2h5TmV3UGFzc3dvcmRJc0ludmFsaWQocGFzc3dvcmQ6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChwYXNzd29yZC5sZW5ndGggPCA4KVxuICAgIHJldHVybiBcIkEgcGFzc3dvcmQgbXVzdCBoYXZlIGF0IGxlYXN0IDggY2hhcmFjdGVyc1wiXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aHlUZWFtU3ViZG9tYWluSXNJbnZhbGlkKHN1YmRvbWFpbjogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHN1YmRvbWFpbi5sZW5ndGggPCAyIHx8IHN1YmRvbWFpbi5sZW5ndGggPiAxNilcbiAgICByZXR1cm4gXCJBIHRlYW0gc3ViZG9tYWluIG11c3QgaGF2ZSBhdCBsZWFzdCAyIGNoYXJhY3RlcnMgYW5kIDE2IGNoYXJhY3RlcnMgYXQgbW9zdFwiXG5cbiAgbGV0IGFyciA9IHN1YmRvbWFpbi5tYXRjaCgvW2EtejAtOV17Mix9L2cpXG5cbiAgaWYgKCFhcnIgfHwgYXJyLmxlbmd0aCA9PT0gMCB8fCBhcnJbMF0gIT09IHN1YmRvbWFpbilcbiAgICByZXR1cm4gXCJBIHRlYW0gc3ViZG9tYWluIHNob3VsZCBjb250YWluIG9ubHkgbG93ZXJjYXNlIGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzIGFuZCB1bmRlcnNjb3JlLlwiXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aHlVc2VybmFtZUlzSW52YWxpZCh1c2VybmFtZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHVzZXJuYW1lLmxlbmd0aCA8IDEpXG4gICAgcmV0dXJuIFwiQSB1c2VybmFtZSBzaG91bGQgaGF2ZSBhdCBsZWFzdCBvbmUgY2hhcmFjdGVyLlwiXG5cbiAgaWYgKC9cXFcvLnRlc3QodXNlcm5hbWUpKVxuICAgIHJldHVybiBcIkEgdXNlcm5hbWUgY2FuIGNvbnRhaW4gb25seSBsZXR0ZXJzLCBkaWdpdHMgYW5kIHVuZGVyc2NvcmUuXCJcbn1cbiIsImZ1bmN0aW9uIHQodCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQ/W3RdOnR9ZnVuY3Rpb24gZSh0KXtyZXR1cm4gMT09PXQubGVuZ3RoJiZBcnJheS5pc0FycmF5KHRbMF0pP3RbMF06dH1jbGFzcyBze2NvbnN0cnVjdG9yKHQsZSl7dGhpcy5hcHA9dCx0aGlzLmNvbXBvbmVudElkPWUsdGhpcy5tYXA9bmV3IE1hcH1pbnZva2VPcmRlcihlLHMpe2ZvcihsZXQgaSBvZiB0KGUpKXRoaXMuZXhlYyhpLHMpO2xldCBpPXRoaXMuYXBwLmdldENoaWxkcmVuT2YodGhpcy5jb21wb25lbnRJZCk7Zm9yKGxldCB0IG9mIGkpdC5nZXRET3JkZXJzKCkuaW52b2tlT3JkZXIoZSxzKX1saXN0ZW5Ub0Rlc2NlbmRpbmdPcmRlcihlLHMsaT1udWxsKXtmb3IobGV0IG4gb2YgdChlKSl7bGV0IHQ9dGhpcy5tYXAuZ2V0KG4pO3R8fHRoaXMubWFwLnNldChuLHQ9W10pLHQucHVzaCh7Y2I6cyx0aGlzQXJnOml9KX19c3RvcExpc3RlbmluZ0Rlc2NlbmRpbmdPcmRlcihlLHMsaT1udWxsKXtmb3IobGV0IG4gb2YgdChlKSl7bGV0IHQ9dGhpcy5tYXAuZ2V0KG4pO3QmJnRoaXMubWFwLnNldChuLHQuZmlsdGVyKHQ9PnQuY2IhPT1zfHx0LnRoaXNBcmchPT1pKSl9fWV4ZWModCxlKXtsZXQgcz10aGlzLm1hcC5nZXQodCk7cyYmcy5mb3JFYWNoKHQ9PihmdW5jdGlvbih0LGUpe3QudGhpc0FyZz90LmNiLmNhbGwodC50aGlzQXJnLGUpOnQuY2IoZSl9KSh0LGUpKX19ZnVuY3Rpb24gaSh0LGUpe3QudGhpc0FyZz90LmNiLmNhbGwodC50aGlzQXJnLGUuZGF0YSxlKTp0LmNiKGUuZGF0YSxlKX1jbGFzcyBue2NvbnN0cnVjdG9yKHQsZSl7dGhpcy5sb2c9dCx0aGlzLmV2ZW50TmFtZXM9bmV3IFNldCx0aGlzLnN0cmljdEV2ZW50cz0hMSx0aGlzLmRlc3Ryb3llZD0hMSxlJiZ0aGlzLmV4cG9zZUV2ZW50KGUsITEpfWV4cG9zZUV2ZW50KHQsZSl7aWYodGhpcy5kZXN0cm95ZWQpdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNhbGwgZXhwb3NlRXZlbnQgaW4gYSBkZXN0cm95ZWQgdHJhbnNtaXR0ZXJcIik7Zm9yKGxldCBlIG9mIHQpdGhpcy5ldmVudE5hbWVzLmFkZChlKTtlJiYodGhpcy5zdHJpY3RFdmVudHM9ITApfWVtaXQodCl7aWYodGhpcy5kZXN0cm95ZWR8fCF0aGlzLmxpc3RlbmVycylyZXR1cm47aWYodGhpcy5zdHJpY3RFdmVudHMmJiF0aGlzLmV2ZW50TmFtZXMuaGFzKHQuZXZlbnROYW1lKSl0aHJvdyBuZXcgRXJyb3IoYFVuZXhwb3NlZCBldmVudDogJHt0LmV2ZW50TmFtZX1gKTtsZXQgZT10aGlzLmxpc3RlbmVycy5nZXQodC5ldmVudE5hbWUpO2lmKGUpZm9yKGxldCBzIG9mIGUpdHJ5e2kocyx0KX1jYXRjaCh0KXt0aGlzLmxvZy5lcnJvcih0KX19b24odCxlLHMpe2lmKCF0aGlzLmRlc3Ryb3llZCl7dGhpcy5saXN0ZW5lcnN8fCh0aGlzLmxpc3RlbmVycz1uZXcgTWFwKTtmb3IobGV0IGkgb2YgdCl7bGV0IHQ9dGhpcy5saXN0ZW5lcnMuZ2V0KGkpO3R8fHRoaXMubGlzdGVuZXJzLnNldChpLHQ9W10pLHQucHVzaCh7Y2I6ZSx0aGlzQXJnOnN9KX19fW9mZih0LGUscyl7aWYoIXRoaXMuZGVzdHJveWVkJiZ0aGlzLmxpc3RlbmVycylmb3IobGV0W2ksbl1vZiB0aGlzLmxpc3RlbmVycylpZighdHx8dC5oYXMoaSkpZm9yKGxldCB0PTA7dDxuLmxlbmd0aDsrK3Qpe2xldCBpPW5bdF07aS5jYj09PWUmJmkudGhpc0FyZz09PXMmJihuLnNwbGljZSh0LDEpLC0tdCl9fWRlc3Ryb3koKXt0aGlzLmxpc3RlbmVycz12b2lkIDAsdGhpcy5kZXN0cm95ZWQ9ITB9fWNsYXNzIHJ7bGlzdGVuVG8odCxlLHMsaT1udWxsKXt0Lm9uKGUscyxpKSx0aGlzLm1hcHx8KHRoaXMubWFwPW5ldyBNYXApO2xldCBuPXRoaXMubWFwLmdldChzKTtufHx0aGlzLm1hcC5zZXQocyxuPW5ldyBNYXApO2xldCByPW4uZ2V0KGkpO3J8fG4uc2V0KGkscj1uZXcgTWFwKTtsZXQgbz1yLmdldCh0KTtvfHxyLnNldCh0LG89bmV3IFNldCk7Zm9yKGxldCB0IG9mIGUpby5hZGQodCl9c3RvcExpc3RlbmluZ0V2ZXJ5d2hlcmUodCxlPW51bGwpe2lmKCF0aGlzLm1hcClyZXR1cm47bGV0IHM9dGhpcy5tYXAuZ2V0KHQpO2lmKCFzKXJldHVybjtsZXQgaT1zLmdldChlKTtpZihpKXtmb3IobGV0W3Msbl1vZiBpKXMub2ZmKG4sdCxlKTtzLmRlbGV0ZShlKSwwPT09cy5zaXplJiZ0aGlzLm1hcC5kZWxldGUodCl9fXN0b3BMaXN0ZW5pbmcodCxlLHMsaT1udWxsKXtpZighdGhpcy5tYXApcmV0dXJuO2xldCBuPXRoaXMubWFwLmdldChzKTtpZighbilyZXR1cm47bGV0IHI9bi5nZXQoaSk7aWYoIXIpcmV0dXJuO2xldCBvPXIuZ2V0KHQpO2lmKCFvKXJldHVybjtsZXQgaD1uZXcgU2V0O2ZvcihsZXQgdCBvZiBlKW8uZGVsZXRlKHQpJiZoLmFkZCh0KTt0Lm9mZihoLHMsaSksMD09PW8uc2l6ZSYmKHIuZGVsZXRlKHQpLDA9PT1yLnNpemUmJihuLmRlbGV0ZShpKSwwPT09bi5zaXplJiZ0aGlzLm1hcC5kZWxldGUocykpKX1kZXN0cm95KCl7aWYodGhpcy5tYXApe2ZvcihsZXRbdCxlXW9mIHRoaXMubWFwKWZvcihsZXRbcyxpXW9mIGUpZm9yKGxldFtlLG5db2YgaSllLm9mZihuLHQscyk7dGhpcy5tYXA9dm9pZCAwfX19Y29uc3Qgbz1TeW1ib2woXCJjYW5Qcm9wYWdhdGVcIik7Y2xhc3MgaHtjb25zdHJ1Y3RvcihzLGkpe3ZhciBvO3RoaXMuYXBwPXMsdGhpcy5jb21wb25lbnRJZD1pLHRoaXMuc3Vic2NyaWJlcj1uZXcgcix0aGlzLmVtaXR0ZXI9bmV3IG4ocy5sb2csW1wiZGVzdHJveVwiXSksdGhpcy5wdWI9KG89dGhpcyxPYmplY3QuZnJlZXplKHt1bm1hbmFnZWRMaXN0ZW5lcnM6T2JqZWN0LmZyZWV6ZSh7b246KGUscyxpKT0+e28uZW1pdHRlci5vbih0KGUpLHMsaSl9LG9mZjooZSxzLGkpPT57by5lbWl0dGVyLm9mZihuZXcgU2V0KHQoZSkpLHMsaSl9fSksZ2V0Q29tcG9uZW50OigpPT5vLmdldEluc3RhbmNlKCksY2hpbGRyZW46KHQ9e30pPT5vLmdldENoaWxkcmVuKHQpLGhhc0NoaWxkcmVuOih0PXt9KT0+by5oYXNDaGlsZHJlbih0KSxpc0NoaWxkOnQ9Pm8uaXNDaGlsZCh0KSxkZXN0cm95OigpPT5vLmRlc3Ryb3koKSxpbnZva2VEZXNjZW5kaW5nT3JkZXIodCxlKXtyZXR1cm4gby5nZXRET3JkZXJzKCkuaW52b2tlT3JkZXIodCxlKSx0aGlzfSxpc0NvbXBvbmVudDp0PT5vLmFwcC5pc0NvbXBvbmVudCh0KSxnZXRQdWJsaWNEYXNoT2Y6dD0+by5hcHAuZ2V0QmtiQnlJbnN0KHQpLnB1YixnZXRQYXJlbnRPZih0KXtsZXQgZT1vLmFwcC5nZXRCa2JCeUluc3QodCkuZ2V0UGFyZW50KCk7cmV0dXJuIGU/ZS5nZXRJbnN0YW5jZSgpOnZvaWQgMH0sbG9nOm8uYXBwLmxvZyxnZXQgYXBwKCl7cmV0dXJuIG8uYXBwLnJvb3QuZ2V0SW5zdGFuY2UoKX19KSksdGhpcy5kYXNoPWZ1bmN0aW9uKHMsaSl7bGV0IG49e3NldEluc3RhbmNlOnQ9PihzLnNldEluc3RhbmNlKHQpLHIpLGV4cG9zZUV2ZW50OiguLi50KT0+KHMuZW1pdHRlci5leHBvc2VFdmVudChlKHQpLCEwKSxyKSxjcmVhdGU6KHQsZSk9PnMuY3JlYXRlQ2hpbGQoe2FzT2JqOiExLENsYXNzOnQsb3B0OmV9KS5nZXRJbnN0YW5jZSgpLHJlZ2lzdGVyQ29tcG9uZW50OnQ9PnMuY3JlYXRlQ2hpbGQoe2FzT2JqOiEwLG9iajp0fSkuZGFzaCxhZGRUb0dyb3VwOih0LC4uLmkpPT4ocy5hZGRUb0dyb3VwKHQsZShpKSksciksaW5Hcm91cDoodCwuLi5pKT0+cy5pbkdyb3VwKHQsZShpKSksZW1pdCh0LGUsaSl7bGV0IG49QXJyYXkuaXNBcnJheSh0KT90Olt0XTtmb3IobGV0IHQgb2YgbilzLmVtaXQodCxlLGkpO3JldHVybiByfSxicm9hZGNhc3Q6KHQsZSk9PihzLmJyb2FkY2FzdCh0LGUpLHIpLGxpc3RlblRvOiguLi5lKT0+e2xldCBpLG4sbyxoO2lmKDI9PT1lLmxlbmd0aHx8XCJzdHJpbmdcIj09dHlwZW9mIGVbMF18fEFycmF5LmlzQXJyYXkoZVswXSkpW24sbyxoXT1lLGk9cztlbHNle2xldCB0O1t0LG4sbyxoXT1lLGk9cy5hcHAuZ2V0QmtiQnlJbnN0KHQpfXJldHVybiBzLnN1YnNjcmliZXIubGlzdGVuVG8oaS5lbWl0dGVyLHQobiksbyxoKSxyfSxzdG9wTGlzdGVuaW5nOiguLi5lKT0+e2xldCBpLG4sbyxoLGE9ZS5sZW5ndGg7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGVbMF18fEFycmF5LmlzQXJyYXkoZVswXSkpW24sbyxoXT1lLGk9cztlbHNle2lmKDE9PT1hfHwyPT09YSlyZXR1cm5bbyxoXT1lLHZvaWQgcy5zdWJzY3JpYmVyLnN0b3BMaXN0ZW5pbmdFdmVyeXdoZXJlKG8saCk7e2xldCB0O1t0LG4sbyxoXT1lLGk9cy5hcHAuZ2V0QmtiQnlJbnN0KHQpfX1yZXR1cm4gcy5zdWJzY3JpYmVyLnN0b3BMaXN0ZW5pbmcoaS5lbWl0dGVyLHQobiksbyxoKSxyfSxsaXN0ZW5Ub0Rlc2NlbmRpbmdPcmRlcjoodCxlLGkpPT4ocy5nZXRET3JkZXJzKCkubGlzdGVuVG9EZXNjZW5kaW5nT3JkZXIodCxlLGkpLHIpLHN0b3BMaXN0ZW5pbmdEZXNjZW5kaW5nT3JkZXI6KHQsZSxpKT0+KHMuZ2V0RE9yZGVycygpLnN0b3BMaXN0ZW5pbmdEZXNjZW5kaW5nT3JkZXIodCxlLGkpLHIpLGRlc3Ryb3lDaGlsZHJlbjoodD17fSk9PihzLmRlc3Ryb3lDaGlsZHJlbih0KSxyKSxwdWJsaWNEYXNoOml9LHI9T2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKGkpLG4pO09iamVjdC5hc3NpZ24ociwuLi5zLmFwcC5hdWdtZW50TGlzdC5tYXAodD0+dChyKSkpLHMuYXBwLnJvb3QmJnMuYXBwLnJvb3QhPT1zfHwoci5hZGREYXNoQXVnbWVudGF0aW9uPSh0PT57cy5hcHAuYXVnbWVudExpc3QucHVzaCh0KX0pKTtyZXR1cm4gT2JqZWN0LmZyZWV6ZShyKSxyfSh0aGlzLHRoaXMucHViKX1tYWtlSW5zdGFuY2UodCxlKXtpZih0aGlzLmluc3QpcmV0dXJuO2xldCBzO3RyeXtzPW5ldyB0KHRoaXMuZGFzaCxlKX1jYXRjaCh0KXt0aHJvdyB0aGlzLmRlc3Ryb3koKSx0fXRoaXMuc2V0SW5zdGFuY2Uocyl9c2V0SW5zdGFuY2UodCl7aWYoIXRoaXMucHViKXRocm93IG5ldyBFcnJvcihcIkRlc3Ryb3llZCBjb21wb25lbnRcIik7aWYodGhpcy5pbnN0KXtpZih0IT09dGhpcy5pbnN0KXRocm93IG5ldyBFcnJvcihcIkNvbmZsaWN0IGJldHdlZW4gY29tcG9uZW50IGluc3RhbmNlc1wiKX1lbHNlIHRoaXMuaW5zdD10LHRoaXMuYXBwLnNldEluc3RhbmNlT2YodGhpcy5jb21wb25lbnRJZCx0aGlzLmluc3QpfWdldEluc3RhbmNlKCl7aWYoIXRoaXMuaW5zdCl7aWYodGhpcy5wdWIpdGhyb3cgbmV3IEVycm9yKFwiVGhlIGNvbXBvbmVudCBpbnN0YW5jZSBpcyBzdGlsbCBub3QgaW5pdGlhbGl6ZWRcIik7dGhyb3cgbmV3IEVycm9yKFwiRGVzdHJveWVkIGNvbXBvbmVudFwiKX1yZXR1cm4gdGhpcy5pbnN0fWRlc3Ryb3koKXt0aGlzLmVtaXQoXCJkZXN0cm95XCIsdm9pZCAwLHtzeW5jOiEwLGNhbmNlbFByb3BhZ2F0aW9uOiEwfSksdGhpcy5hcHAucmVtb3ZlQ29tcG9uZW50KHRoaXMsdGhpcy5pbnN0KSx0aGlzLmNoaWxkR3JvdXBzJiZ0aGlzLmNoaWxkR3JvdXBzLmNsZWFyKCksdGhpcy5lbWl0dGVyLmRlc3Ryb3koKSx0aGlzLnN1YnNjcmliZXIuZGVzdHJveSgpLHRoaXMucHViPXZvaWQgMCx0aGlzLmRhc2g9dm9pZCAwLHRoaXMuaW5zdD12b2lkIDB9Zm9yZ2V0Q2hpbGQodCl7aWYodGhpcy5jaGlsZEdyb3Vwcylmb3IobGV0IGUgb2YgdGhpcy5jaGlsZEdyb3Vwcy52YWx1ZXMoKSllLmRlbGV0ZSh0KX1jcmVhdGVDaGlsZCh0KXtyZXR1cm4gdGhpcy5hcHAuY3JlYXRlQ29tcG9uZW50KHQsdGhpcyl9YWRkVG9Hcm91cCh0LGUpe2xldCBzPXRoaXMuYXBwLmdldEJrYkJ5SW5zdCh0KS5jb21wb25lbnRJZDtpZih0aGlzIT09dGhpcy5hcHAuZ2V0UGFyZW50T2YocykpdGhyb3cgbmV3IEVycm9yKGBUaGUgY29tcG9uZW50ICR7c30gaXMgbm90IGEgY2hpbGQgb2YgJHt0aGlzLmNvbXBvbmVudElkfWApO3RoaXMuY2hpbGRHcm91cHN8fCh0aGlzLmNoaWxkR3JvdXBzPW5ldyBNYXApO2ZvcihsZXQgdCBvZiBlKXtsZXQgZT10aGlzLmNoaWxkR3JvdXBzLmdldCh0KTtlfHx0aGlzLmNoaWxkR3JvdXBzLnNldCh0LGU9bmV3IFNldCksZS5hZGQocyl9fWluR3JvdXAodCxlKXtpZighdGhpcy5jaGlsZEdyb3VwcylyZXR1cm4hMTtsZXQgcz10aGlzLmFwcC5nZXRCa2JCeUluc3QodCkuY29tcG9uZW50SWQ7Zm9yKGxldCB0IG9mIGUpe2xldCBlPXRoaXMuY2hpbGRHcm91cHMuZ2V0KHQpO2lmKGUmJmUuaGFzKHMpKXJldHVybiEwfXJldHVybiExfWJyb2FkY2FzdCh0LGU9e30pe2Uuc3luYz90aGlzLmVtaXR0ZXIuZW1pdCh0KTp0aGlzLmFwcC5hc3luY0NhbGwoKCk9PnRoaXMuZW1pdHRlci5lbWl0KHQpKX1lbWl0KHQsZSxzPXt9KXtzLnN5bmM/dGhpcy5lbWl0U3luYyh0aGlzLmNyZWF0ZUV2ZW50KHQsZSxzLmNhbmNlbFByb3BhZ2F0aW9uKSk6dGhpcy5hcHAuYXN5bmNDYWxsKCgpPT50aGlzLmVtaXRTeW5jKHRoaXMuY3JlYXRlRXZlbnQodCxlLHMuY2FuY2VsUHJvcGFnYXRpb24pKSl9Z2V0UGFyZW50KCl7cmV0dXJuIHRoaXMuYXBwLmdldFBhcmVudE9mKHRoaXMuY29tcG9uZW50SWQpfWdldFBhcmVudHMoKXtsZXQgdD10aGlzLGU9W107Zm9yKDt0PXRoaXMuYXBwLmdldFBhcmVudE9mKHQuY29tcG9uZW50SWQpOyllLnB1c2godCk7cmV0dXJuIGV9Z2V0Q2hpbGRyZW4odCl7bGV0IGU9dGhpcy5nZXRDaGlsZEJrYnModC5ncm91cCkscz1bXTtmb3IobGV0IGkgb2YgZSkhaS5pbnN0fHx0LmZpbHRlciYmIXQuZmlsdGVyKGkpfHxzLnB1c2goaS5pbnN0KTtyZXR1cm4gc31oYXNDaGlsZHJlbih0KXtyZXR1cm4gdGhpcy5nZXRDaGlsZHJlbih0KS5sZW5ndGg+MH1pc0NoaWxkKHQpe2xldCBlPXRoaXMuYXBwLmdldEJrYkJ5SW5zdCh0KS5jb21wb25lbnRJZDtyZXR1cm4gdGhpcz09PXRoaXMuYXBwLmdldFBhcmVudE9mKGUpfWRlc3Ryb3lDaGlsZHJlbih0KXtsZXQgZT10aGlzLmdldENoaWxkQmticyh0Lmdyb3VwKTtmb3IobGV0IHMgb2YgZSl0LmZpbHRlciYmIXQuZmlsdGVyKHMpfHxzLmRlc3Ryb3koKX1nZXRET3JkZXJzKCl7cmV0dXJuIHRoaXMuZE9yZGVyc3x8KHRoaXMuZE9yZGVycz1uZXcgcyh0aGlzLmFwcCx0aGlzLmNvbXBvbmVudElkKSksdGhpcy5kT3JkZXJzfWNyZWF0ZUV2ZW50KHQsZSxzKXtsZXQgaT10aGlzLG49IXM7cmV0dXJuIE9iamVjdC5mcmVlemUoe2V2ZW50TmFtZTp0LGdldCBzb3VyY2UoKXtyZXR1cm4gaS5nZXRJbnN0YW5jZSgpfSxkYXRhOmUsc3RvcFByb3BhZ2F0aW9uOigpPT57bj0hMX0sW29dOigpPT5ufSl9ZW1pdFN5bmModCl7aWYodGhpcy5lbWl0dGVyLmVtaXQodCksdFtvXSYmdFtvXSgpKXtsZXQgZT10aGlzLmFwcC5nZXRQYXJlbnRPZih0aGlzLmNvbXBvbmVudElkKTtlJiZlLmVtaXRTeW5jKHQpfX1nZXRDaGlsZEJrYnModCl7aWYoIXQpcmV0dXJuIHRoaXMuYXBwLmdldENoaWxkcmVuT2YodGhpcy5jb21wb25lbnRJZCk7aWYoIXRoaXMuY2hpbGRHcm91cHMpcmV0dXJuW107bGV0IGU9XCJzdHJpbmdcIj09dHlwZW9mIHQ/W3RdOnQscz1uZXcgU2V0O2ZvcihsZXQgdCBvZiBlKXtsZXQgZT10aGlzLmNoaWxkR3JvdXBzLmdldCh0KTtpZihlKWZvcihsZXQgdCBvZiBlLnZhbHVlcygpKXMuYWRkKHQpfWxldCBpPVtdO2ZvcihsZXQgdCBvZiBzLnZhbHVlcygpKWkucHVzaCh0aGlzLmFwcC5nZXRCa2IodCkpO3JldHVybiBpfX1jbGFzcyBhe2NvbnN0cnVjdG9yKHQsZSxzKXt0aGlzLmF1Z21lbnRMaXN0PVtdLHRoaXMuY29tcENvdW50PTAsdGhpcy5ub2Rlc0J5SW5zdD1uZXcgV2Vha01hcCx0aGlzLm5vZGVzPW5ldyBNYXAsdGhpcy5pbnNpZGVSbUNvbXA9ITE7bGV0IGk9dGhpcy5uZXdJZCgpO3RoaXMubG9nPXRoaXMuY3JlYXRlTG9nKFtcImVycm9yXCIsXCJ3YXJuXCIsXCJpbmZvXCIsXCJkZWJ1Z1wiLFwidHJhY2VcIl0pLHRoaXMucm9vdD1uZXcgaCh0aGlzLGkpO2xldCBuPXtia2I6dGhpcy5yb290fTt0aGlzLm5vZGVzLnNldChpLG4pLHRoaXMucm9vdC5lbWl0dGVyLmV4cG9zZUV2ZW50KFtcImxvZ1wiLFwiYWRkQ29tcG9uZW50XCIsXCJyZW1vdmVDb21wb25lbnRcIixcImNoYW5nZUNvbXBvbmVudFwiXSwhMSksZT90aGlzLnJvb3Quc2V0SW5zdGFuY2UodCk6dGhpcy5yb290Lm1ha2VJbnN0YW5jZSh0LHMpLG4uY3JlYXRlZD0hMH1zZXRJbnN0YW5jZU9mKHQsZSl7bGV0IHM9dGhpcy5ub2Rlcy5nZXQodCk7aWYoIXMpdGhyb3cgbmV3IEVycm9yKFwiRGVzdHJveWVkIGNvbXBvbmVudFwiKTt0aGlzLm5vZGVzQnlJbnN0LnNldChlLHMpfWdldFBhcmVudE9mKHQpe2xldCBlPXRoaXMuZmluZE5vZGUodCk7cmV0dXJuIGUucGFyZW50P2UucGFyZW50LmJrYjp2b2lkIDB9Z2V0Q2hpbGRyZW5PZih0KXtsZXQgZT1bXSxzPXRoaXMuZmluZE5vZGUodCkuY2hpbGRyZW47aWYocylmb3IobGV0IHQgb2Ygcy52YWx1ZXMoKSllLnB1c2godC5ia2IpO3JldHVybiBlfWdldEJrYih0KXtyZXR1cm4gdGhpcy5maW5kTm9kZSh0KS5ia2J9Z2V0QmtiQnlJbnN0KHQpe3JldHVybiB0aGlzLmZpbmROb2RlQnlJbnN0KHQpLmJrYn1pc0NvbXBvbmVudCh0KXtyZXR1cm4hIXRoaXMubm9kZXNCeUluc3QuZ2V0KHQpfWNyZWF0ZUNvbXBvbmVudCh0LGUpe2lmKCF0aGlzLnJvb3QuZGFzaCl0aHJvdyBuZXcgRXJyb3IoXCJEZXN0cm95ZWQgcm9vdCBjb21wb25lbnRcIik7bGV0IHM9dGhpcy5uZXdJZCgpLGk9bmV3IGgodGhpcyxzKSxuPXRoaXMuZmluZE5vZGUoZS5jb21wb25lbnRJZCkscj17YmtiOmkscGFyZW50Om59O3JldHVybiB0aGlzLm5vZGVzLnNldChzLHIpLG4uY2hpbGRyZW58fChuLmNoaWxkcmVuPW5ldyBNYXApLG4uY2hpbGRyZW4uc2V0KHMsciksdC5hc09iaj9pLnNldEluc3RhbmNlKHQub2JqKTppLm1ha2VJbnN0YW5jZSh0LkNsYXNzLHQub3B0KSx0aGlzLnJvb3QuZGFzaC5lbWl0KFtcImFkZENvbXBvbmVudFwiLFwiY2hhbmdlQ29tcG9uZW50XCJdLHtjb21wb25lbnQ6aS5nZXRJbnN0YW5jZSgpLHR5cGU6XCJhZGRcIn0pLHIuY3JlYXRlZD0hMCxpfXJlbW92ZUNvbXBvbmVudCh0LGUpe2lmKCF0aGlzLnJvb3QuZGFzaCl0aHJvdyBuZXcgRXJyb3IoXCJEZXN0cm95ZWQgcm9vdCBjb21wb25lbnRcIik7bGV0IHM9IXRoaXMuaW5zaWRlUm1Db21wO3RyeXtsZXQgaT10LmNvbXBvbmVudElkLG49dGhpcy5maW5kTm9kZShpKTtpZihzJiYodGhpcy5pbnNpZGVSbUNvbXA9ITAsZSYmbi5jcmVhdGVkKSl7bGV0IHQ9e2NvbXBvbmVudDplLHR5cGU6XCJyZW1vdmVcIn07dGhpcy5yb290LmRhc2guZW1pdChbXCJyZW1vdmVDb21wb25lbnRcIixcImNoYW5nZUNvbXBvbmVudFwiXSx0LHtzeW5jOiEwfSl9aWYobi5jaGlsZHJlbil7Zm9yKGxldCB0IG9mIG4uY2hpbGRyZW4udmFsdWVzKCkpdC5wYXJlbnQ9dm9pZCAwLHQuYmtiLmRlc3Ryb3koKTtuLmNoaWxkcmVuLmNsZWFyKCl9bi5wYXJlbnQmJihuLnBhcmVudC5ia2IuZm9yZ2V0Q2hpbGQoaSksbi5wYXJlbnQuY2hpbGRyZW4uZGVsZXRlKGkpKSx0aGlzLm5vZGVzLmRlbGV0ZShpKSxlJiZ0aGlzLm5vZGVzQnlJbnN0LmRlbGV0ZShlKX1maW5hbGx5e3MmJih0aGlzLmluc2lkZVJtQ29tcD0hMSl9fWFzeW5jQ2FsbCh0KXt0aGlzLnRpY2tMaXN0P3RoaXMudGlja0xpc3QucHVzaCh0KToodGhpcy50aWNrTGlzdD1bdF0sc2V0VGltZW91dCgoKT0+e2lmKHRoaXMudGlja0xpc3Qpe2ZvcihsZXQgdCBvZiB0aGlzLnRpY2tMaXN0KXRyeXt0KCl9Y2F0Y2godCl7dGhpcy5sb2cuZXJyb3IodCl9dGhpcy50aWNrTGlzdD12b2lkIDB9fSwwKSl9ZmluZE5vZGUodCl7bGV0IGU9dGhpcy5ub2Rlcy5nZXQodCk7aWYoIWUpdGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIG5vZGUgb2YgY29tcG9uZW50IFwiJHt0fVwiYCk7cmV0dXJuIGV9ZmluZE5vZGVCeUluc3QodCl7bGV0IGU9dGhpcy5ub2Rlc0J5SW5zdC5nZXQodCk7aWYoIWUpdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgZmluZCBhIGNvbXBvbmVudCBmb3IgdGhlIGluc3RhbmNlOiAke3R9YCk7cmV0dXJuIGV9bmV3SWQoKXtyZXR1cm4gdGhpcy5jb21wQ291bnQrK31jcmVhdGVMb2codCl7bGV0IGU9e30scz0wO2ZvcihsZXQgaSBvZiB0KWVbaV09KCguLi50KT0+e2lmKCF0aGlzLnJvb3QuZGFzaCl0aHJvdyBuZXcgRXJyb3IoXCJEZXN0cm95ZWQgcm9vdCBjb21wb25lbnRcIik7dGhpcy5yb290LmRhc2guZW1pdChcImxvZ1wiLHtsZXZlbDppLG1lc3NhZ2VzOnQsbGV2ZWxOdW1iZXI6KytzfSx7c3luYzohMH0pfSk7cmV0dXJuIE9iamVjdC5mcmVlemUoZSl9fWZ1bmN0aW9uIGQodCxlKXtyZXR1cm4gbmV3IGEodCwhMSxlKS5yb290LmdldEluc3RhbmNlKCl9ZnVuY3Rpb24gbCh0KXtyZXR1cm4gbmV3IGEodCwhMCkucm9vdC5kYXNofWV4cG9ydHtkIGFzIGNyZWF0ZUFwcGxpY2F0aW9uLGwgYXMgcmVnaXN0ZXJBcHBsaWNhdGlvbn07IiwiLy8gSW1wb3J0c1xudmFyIF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyA9IHJlcXVpcmUoXCIuLi8uLi8uLi9wbGF0Zm9ybS1mcm9udGVuZC9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCIpO1xuZXhwb3J0cyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhmYWxzZSk7XG4vLyBNb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIi5FcnJvckRpYWxvZy1jb250ZW50TGVmdCB7XFxuICBjb2xvcjogI2ZmMDAwMDtcXG59XCIsIFwiXCJdKTtcbi8vIEV4cG9ydHNcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cztcbiIsIi8vIEltcG9ydHNcbnZhciBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gPSByZXF1aXJlKFwiLi4vLi4vLi4vcGxhdGZvcm0tZnJvbnRlbmQvbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiKTtcbmV4cG9ydHMgPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oZmFsc2UpO1xuLy8gTW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIuSW5mb0RpYWxvZy1jb250ZW50TGVmdCB7XFxuICBjb2xvcjogIzQxNjllMTtcXG59XCIsIFwiXCJdKTtcbi8vIEV4cG9ydHNcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cztcbiIsIi8vIEltcG9ydHNcbnZhciBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gPSByZXF1aXJlKFwiLi4vLi4vLi4vcGxhdGZvcm0tZnJvbnRlbmQvbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiKTtcbmV4cG9ydHMgPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oZmFsc2UpO1xuLy8gTW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIuUHJvbXB0RGlhbG9nLWNvbnRlbnRMZWZ0IHtcXG4gIGNvbG9yOiAjNzA4MDkwO1xcbn1cXG4uUHJvbXB0RGlhbG9nLWNvbnRlbnRSaWdodCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtZXZlbmx5O1xcbiAgcGFkZGluZy1yaWdodDogNXB4O1xcbn1cXG4uUHJvbXB0RGlhbG9nLWlucHV0IHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgYm9yZGVyOiAxcHggc29saWQgIzJmNGY0ZjtcXG4gIHBhZGRpbmc6IDNweDtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cIiwgXCJcIl0pO1xuLy8gRXhwb3J0c1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzO1xuIiwiLy8gSW1wb3J0c1xudmFyIF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyA9IHJlcXVpcmUoXCIuLi8uLi8uLi9wbGF0Zm9ybS1mcm9udGVuZC9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCIpO1xuZXhwb3J0cyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhmYWxzZSk7XG4vLyBNb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIi5RdWVzdGlvbkRpYWxvZy1jb250ZW50TGVmdCB7XFxuICBjb2xvcjogIzAwMDBmZjtcXG59XCIsIFwiXCJdKTtcbi8vIEV4cG9ydHNcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cztcbiIsIi8vIEltcG9ydHNcbnZhciBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gPSByZXF1aXJlKFwiLi4vLi4vLi4vcGxhdGZvcm0tZnJvbnRlbmQvbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiKTtcbmV4cG9ydHMgPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oZmFsc2UpO1xuLy8gTW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIuV2FybmluZ0RpYWxvZy1jb250ZW50TGVmdCB7XFxuICBjb2xvcjogI2ZmYTUwMDtcXG59XCIsIFwiXCJdKTtcbi8vIEV4cG9ydHNcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cztcbiIsIi8vIEltcG9ydHNcbnZhciBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gPSByZXF1aXJlKFwiLi4vLi4vcGxhdGZvcm0tZnJvbnRlbmQvbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiKTtcbmV4cG9ydHMgPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oZmFsc2UpO1xuLy8gTW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIuTW9kYWxEaWFsb2cge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4zKTtcXG4gIGJvcmRlci1yYWRpdXM6IDRweDtcXG4gIG1hcmdpbjogYXV0bztcXG4gIHdpZHRoOiAzMDBweDtcXG59XFxuLk1vZGFsRGlhbG9nOjpiYWNrZHJvcCB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBib3R0b206IDA7XFxuICBsZWZ0OiAwO1xcbiAgcmlnaHQ6IDA7XFxuICB0b3A6IDA7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNik7XFxufVxcbi5Nb2RhbERpYWxvZy1oZWFkZXIge1xcbiAgYWxpZ24taXRlbXM6IGJhc2VsaW5lO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDM0LCAzNiwgMzgsIDAuMTUpO1xcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgcGFkZGluZzogOHB4IDZweDtcXG59XFxuLk1vZGFsRGlhbG9nLWNvbnRlbnQge1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDE1JSA1JSA4MCU7XFxuICBncmlkLXRlbXBsYXRlLXJvd3M6IDEwMCU7XFxuICBwYWRkaW5nOiA4cHggNHB4O1xcbn1cXG4uTW9kYWxEaWFsb2ctY29udGVudExlZnQge1xcbiAgZ3JpZC1jb2x1bW4tc3RhcnQ6IDE7XFxuICBncmlkLWNvbHVtbi1lbmQ6IDI7XFxuICBqdXN0aWZ5LXNlbGY6IGNlbnRlcjtcXG59XFxuLk1vZGFsRGlhbG9nLWNvbnRlbnRSaWdodCB7XFxuICBncmlkLWNvbHVtbi1zdGFydDogMztcXG4gIGdyaWQtY29sdW1uLWVuZDogNDtcXG59XFxuLk1vZGFsRGlhbG9nLWJvdHRvbSB7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHJnYmEoMzQsIDM2LCAzOCwgMC4xNSk7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XFxuICBwYWRkaW5nOiA4cHggNnB4O1xcbn1cXG5cXG4uTW9kYWxEaWFsb2dDYW5jZWxCdXR0b24sIC5Nb2RhbERpYWxvZ09rQnV0dG9uIHtcXG4gIGJvcmRlci1yYWRpdXM6IDRweDtcXG4gIGJvcmRlci1yaWdodDogMnB4IG91dHNldCBncmF5O1xcbiAgYm9yZGVyLWJvdHRvbTogMnB4IG91dHNldCBncmF5O1xcbiAgY29sb3I6ICNmZmY7XFxuICBvdXRsaW5lOiBub25lO1xcbn1cXG4uTW9kYWxEaWFsb2dDYW5jZWxCdXR0b246YWN0aXZlLCAuTW9kYWxEaWFsb2dPa0J1dHRvbjphY3RpdmUge1xcbiAgYm9yZGVyLXJpZ2h0OiAycHggb3V0c2V0IHRyYW5zcGFyZW50O1xcbiAgYm9yZGVyLWJvdHRvbTogMnB4IG91dHNldCB0cmFuc3BhcmVudDtcXG59XFxuXFxuLk1vZGFsRGlhbG9nQ2FuY2VsQnV0dG9uIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmYTgwNzI7XFxuICBwYWRkaW5nOiA2cHggMTZweCA0cHg7XFxufVxcbi5Nb2RhbERpYWxvZ0NhbmNlbEJ1dHRvbjpob3ZlciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjY2Q1YzVjO1xcbn1cXG5cXG4uTW9kYWxEaWFsb2dPa0J1dHRvbiB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMWU5MGZmO1xcbiAgcGFkZGluZzogNnB4IDE2cHggNHB4O1xcbn1cXG4uTW9kYWxEaWFsb2dPa0J1dHRvbjpob3ZlciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE2OWUxO1xcbn1cXG5cXG4uTW9kYWxEaWFsb2dDbG9zZUl0ZW0ge1xcbiAgY29sb3I6ICMwMDA7XFxufVxcbi5Nb2RhbERpYWxvZ0Nsb3NlSXRlbTpob3ZlciB7XFxuICBjb2xvcjogZGFya2dyYXk7XFxufVwiLCBcIlwiXSk7XG4vLyBFeHBvcnRzXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodXNlU291cmNlTWFwKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKTtcblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgcmV0dXJuIFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChjb250ZW50LCBcIn1cIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oJycpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gKG1vZHVsZXMsIG1lZGlhUXVlcnksIGRlZHVwZSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgJyddXTtcbiAgICB9XG5cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItZGVzdHJ1Y3R1cmluZ1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2ldWzBdO1xuXG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IG1vZHVsZXMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19pXSk7XG5cbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udGludWVcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYVF1ZXJ5KSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMl0gPSBcIlwiLmNvbmNhdChtZWRpYVF1ZXJ5LCBcIiBhbmQgXCIpLmNvbmNhdChpdGVtWzJdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBsaXN0O1xufTtcblxuZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdIHx8ICcnOyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLWRlc3RydWN0dXJpbmdcblxuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cblxuICBpZiAodXNlU291cmNlTWFwICYmIHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSB0b0NvbW1lbnQoY3NzTWFwcGluZyk7XG4gICAgdmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBcIi8qIyBzb3VyY2VVUkw9XCIuY29uY2F0KGNzc01hcHBpbmcuc291cmNlUm9vdCB8fCAnJykuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG4gIH1cblxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufSAvLyBBZGFwdGVkIGZyb20gY29udmVydC1zb3VyY2UtbWFwIChNSVQpXG5cblxuZnVuY3Rpb24gdG9Db21tZW50KHNvdXJjZU1hcCkge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSk7XG4gIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgcmV0dXJuIFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGlzT2xkSUUgPSBmdW5jdGlvbiBpc09sZElFKCkge1xuICB2YXIgbWVtbztcbiAgcmV0dXJuIGZ1bmN0aW9uIG1lbW9yaXplKCkge1xuICAgIGlmICh0eXBlb2YgbWVtbyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG4gICAgICAvLyBUZXN0cyBmb3IgZXhpc3RlbmNlIG9mIHN0YW5kYXJkIGdsb2JhbHMgaXMgdG8gYWxsb3cgc3R5bGUtbG9hZGVyXG4gICAgICAvLyB0byBvcGVyYXRlIGNvcnJlY3RseSBpbnRvIG5vbi1zdGFuZGFyZCBlbnZpcm9ubWVudHNcbiAgICAgIC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuICAgICAgbWVtbyA9IEJvb2xlYW4od2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2IpO1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vO1xuICB9O1xufSgpO1xuXG52YXIgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gZ2V0VGFyZ2V0KCkge1xuICB2YXIgbWVtbyA9IHt9O1xuICByZXR1cm4gZnVuY3Rpb24gbWVtb3JpemUodGFyZ2V0KSB7XG4gICAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vW3RhcmdldF07XG4gIH07XG59KCk7XG5cbnZhciBzdHlsZXNJbkRvbSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRG9tLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRG9tW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM11cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlc0luRG9tLnB1c2goe1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiBhZGRTdHlsZShvYmosIG9wdGlvbnMpLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICB2YXIgYXR0cmlidXRlcyA9IG9wdGlvbnMuYXR0cmlidXRlcyB8fCB7fTtcblxuICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMubm9uY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSAndW5kZWZpbmVkJyA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcblxuICAgIGlmIChub25jZSkge1xuICAgICAgYXR0cmlidXRlcy5ub25jZSA9IG5vbmNlO1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHN0eWxlLnNldEF0dHJpYnV0ZShrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gIH0pO1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zLmluc2VydChzdHlsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHRhcmdldCA9IGdldFRhcmdldChvcHRpb25zLmluc2VydCB8fCAnaGVhZCcpO1xuXG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gICAgfVxuXG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgfVxuXG4gIHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGUucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGUpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxudmFyIHJlcGxhY2VUZXh0ID0gZnVuY3Rpb24gcmVwbGFjZVRleHQoKSB7XG4gIHZhciB0ZXh0U3RvcmUgPSBbXTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHJlcGxhY2UoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG4gICAgdGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuICAgIHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuICB9O1xufSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnKHN0eWxlLCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcbiAgdmFyIGNzcyA9IHJlbW92ZSA/ICcnIDogb2JqLm1lZGlhID8gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKS5jb25jYXQob2JqLmNzcywgXCJ9XCIpIDogb2JqLmNzczsgLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcbiAgICB2YXIgY2hpbGROb2RlcyA9IHN0eWxlLmNoaWxkTm9kZXM7XG5cbiAgICBpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHtcbiAgICAgIHN0eWxlLnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgIHN0eWxlLmluc2VydEJlZm9yZShjc3NOb2RlLCBjaGlsZE5vZGVzW2luZGV4XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGNzc05vZGUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnKHN0eWxlLCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IG9iai5jc3M7XG4gIHZhciBtZWRpYSA9IG9iai5tZWRpYTtcbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKG1lZGlhKSB7XG4gICAgc3R5bGUuc2V0QXR0cmlidXRlKCdtZWRpYScsIG1lZGlhKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZS5yZW1vdmVBdHRyaWJ1dGUoJ21lZGlhJyk7XG4gIH1cblxuICBpZiAoc291cmNlTWFwICYmIGJ0b2EpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfSAvLyBGb3Igb2xkIElFXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuXG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlLmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlLnJlbW92ZUNoaWxkKHN0eWxlLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbnZhciBzaW5nbGV0b24gPSBudWxsO1xudmFyIHNpbmdsZXRvbkNvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBhZGRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlO1xuICB2YXIgdXBkYXRlO1xuICB2YXIgcmVtb3ZlO1xuXG4gIGlmIChvcHRpb25zLnNpbmdsZXRvbikge1xuICAgIHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xuICAgIHN0eWxlID0gc2luZ2xldG9uIHx8IChzaW5nbGV0b24gPSBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykpO1xuICAgIHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgZmFsc2UpO1xuICAgIHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUgPSBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gICAgdXBkYXRlID0gYXBwbHlUb1RhZy5iaW5kKG51bGwsIHN0eWxlLCBvcHRpb25zKTtcblxuICAgIHJlbW92ZSA9IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSk7XG4gICAgfTtcbiAgfVxuXG4gIHVwZGF0ZShvYmopO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmUoKTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307IC8vIEZvcmNlIHNpbmdsZS10YWcgc29sdXRpb24gb24gSUU2LTksIHdoaWNoIGhhcyBhIGhhcmQgbGltaXQgb24gdGhlICMgb2YgPHN0eWxlPlxuICAvLyB0YWdzIGl0IHdpbGwgYWxsb3cgb24gYSBwYWdlXG5cbiAgaWYgKCFvcHRpb25zLnNpbmdsZXRvbiAmJiB0eXBlb2Ygb3B0aW9ucy5zaW5nbGV0b24gIT09ICdib29sZWFuJykge1xuICAgIG9wdGlvbnMuc2luZ2xldG9uID0gaXNPbGRJRSgpO1xuICB9XG5cbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChuZXdMaXN0KSAhPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRvbVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5Eb21bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5Eb20uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJpbXBvcnQgeyBBcHBEYXNoLCBMb2csIExvZ0V2ZW50IH0gZnJvbSBcImJrYlwiXG5pbXBvcnQgeyBFcnJvckRpYWxvZywgSW5mb0RpYWxvZyB9IGZyb20gXCIuLi8uLi8uLi9zaGFyZWQtdWkvbW9kYWxEaWFsb2dzL21vZGFsRGlhbG9nc1wiXG5pbXBvcnQgVGVhbUNyZWF0aW9uRGlhbG9nIGZyb20gXCIuLi8uLi8uLi9zaGFyZWQtdWkvVGVhbUNyZWF0aW9uRGlhbG9nL1RlYW1DcmVhdGlvbkRpYWxvZ1wiXG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwT3B0aW9ucyB7XG4gIGFjdGlvbj86IHN0cmluZ1xuICB0b2tlbj86IHN0cmluZ1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcHAge1xuICByZWFkb25seSBsb2c6IExvZ1xuICByZWFkb25seSBiYXNlVXJsOiBzdHJpbmdcbiAgcHJpdmF0ZSB0ZWFtRGlhbG9nOiBUZWFtQ3JlYXRpb25EaWFsb2dcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRhc2g6IEFwcERhc2g8QXBwPiwgcHJpdmF0ZSBvcHRpb25zOiBBcHBPcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxvZyA9IGRhc2gubG9nXG4gICAgdGhpcy5iYXNlVXJsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IS5kYXRhc2V0LmJhc2VVcmwgfHwgXCJcIlxuICAgIHRoaXMudGVhbURpYWxvZyA9IHRoaXMuZGFzaC5jcmVhdGUoVGVhbUNyZWF0aW9uRGlhbG9nKVxuICAgIHRoaXMuZGFzaC5saXN0ZW5UbzxMb2dFdmVudD4oXCJsb2dcIiwgZGF0YSA9PiB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgY29uc29sZS5sb2coYFske2RhdGEubGV2ZWx9XWAsIC4uLmRhdGEubWVzc2FnZXMpXG4gICAgfSlcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIGlmICgoIXRoaXMub3B0aW9ucy5hY3Rpb24gJiYgIXRoaXMub3B0aW9ucy50b2tlbikgfHwgKHRoaXMub3B0aW9ucy5hY3Rpb24gPT09IFwicmVnaXN0ZXJcIikpIHtcbiAgICAgIHRoaXMuc2hvd1RlYW1DcmVhdGlvbkRpYWxvZygpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFjdGlvbiA9PT0gXCJhY3RpdmF0ZVwiKSB7XG4gICAgICB0aGlzLmFjdGl2YXRlVGVhbSgpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIGFjdGlvbiBwYXJhbWV0ZXJcIilcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgYWN0aXZhdGVUZWFtKCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLnRva2VuKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVG9rZW4gbm90IGZvdW5kXCIpXG5cbiAgICB0cnkge1xuICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7dGhpcy5iYXNlVXJsfS9hcGkvdGVhbS9hY3RpdmF0ZWAsIHtcbiAgICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgICAgY3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIixcbiAgICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnMoe1xuICAgICAgICAgIFwiQWNjZXB0XCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgIH0pLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHRva2VuOiB0aGlzLm9wdGlvbnMudG9rZW4gfSlcbiAgICAgIH0pXG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgYXdhaXQgdGhpcy5kYXNoLmNyZWF0ZShFcnJvckRpYWxvZykuc2hvdyhcIkNhbm5vdCBjb21wbGV0ZSB0aGlzIHRhc2sgbm93LiBUcnkgYWdhaW4gaW4gYSBtb21lbnQuXCIpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBsZXQgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuXG4gICAgICBpZiAoIWRhdGEuZG9uZSkge1xuICAgICAgICB0aGlzLmRhc2guY3JlYXRlKEVycm9yRGlhbG9nKS5zaG93KFwiVGVhbSBhY3RpdmF0aW9uIGZhaWxlZC5cIilcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBGSVhNRTogcmVkaXJlY3QgdG8gaG9tZSBpZiB0aGVyZSBpcyBubyBiYXNlIFVSTC5cbiAgICAgIGRvY3VtZW50LmxvY2F0aW9uIS5ocmVmID0gYCR7ZGF0YS50ZWFtVXJsfWBcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5kYXNoLmNyZWF0ZShJbmZvRGlhbG9nKS5zaG93KFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuIFdlIGNhbm5vdCByZWFjaCBvdXIgc2VydmVyLlwiKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc2hvd1RlYW1DcmVhdGlvbkRpYWxvZygpIHtcbiAgICBhd2FpdCB0aGlzLnRlYW1EaWFsb2cub3BlbigpXG4gIH1cbn1cbiIsImltcG9ydCB7IGNyZWF0ZUFwcGxpY2F0aW9uIH0gZnJvbSBcImJrYlwiXG5pbXBvcnQgQXBwIGZyb20gXCIuL0FwcC9BcHBcIlxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gIGxldCB1cmwgPSBuZXcgVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKVxuICBsZXQgYWN0aW9uID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoXCJhY3Rpb25cIikgfHwgdW5kZWZpbmVkXG4gIGxldCB0b2tlbiA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KFwidG9rZW5cIikgfHwgdW5kZWZpbmVkXG5cbiAgY3JlYXRlQXBwbGljYXRpb24oQXBwLCB7IGFjdGlvbiwgdG9rZW4gfSkuc3RhcnQoKVxufSlcbiJdLCJzb3VyY2VSb290IjoiIn0=