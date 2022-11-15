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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/result.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/result.js":
/*!***********************!*\
  !*** ./src/result.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("let id = (id) => document.getElementById(id);\nlet classes = (classes) => document.getElementsByClassName(classes);\n\nclasses(\"home\")[0].addEventListener(\"click\", () => {\n  window.location = \"index.html\";\n});\n\nwindow.addEventListener(\"load\", () => {\n  let userScore;\n  if (sessionStorage.getItem(\"userScore\") !== null) {\n    userScore = sessionStorage.getItem(\"userScore\");\n  } else {\n    userScore = 0;\n  }\n  sessionStorage.removeItem(\"userScore\");\n\n  id(\"result\").innerHTML = `${userScore}%`;\n  if (userScore <= 50) {\n    id(\"feedback\").innerHTML = \"Try harder next time\";\n  } else if (finalResult > 50 && finalResult <= 75) {\n    id(\"feedback\").innerHTML = \"You are almost there try again\";\n  } else {\n    id(\"feedback\").innerHTML = \"Congratulations You made it\";\n  }\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcmVzdWx0LmpzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL3Jlc3VsdC5qcz9hM2M1Il0sInNvdXJjZXNDb250ZW50IjpbImxldCBpZCA9IChpZCkgPT4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xubGV0IGNsYXNzZXMgPSAoY2xhc3NlcykgPT4gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbGFzc2VzKTtcblxuY2xhc3NlcyhcImhvbWVcIilbMF0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgd2luZG93LmxvY2F0aW9uID0gXCJpbmRleC5odG1sXCI7XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IHtcbiAgbGV0IHVzZXJTY29yZTtcbiAgaWYgKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJ1c2VyU2NvcmVcIikgIT09IG51bGwpIHtcbiAgICB1c2VyU2NvcmUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwidXNlclNjb3JlXCIpO1xuICB9IGVsc2Uge1xuICAgIHVzZXJTY29yZSA9IDA7XG4gIH1cbiAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShcInVzZXJTY29yZVwiKTtcblxuICBpZChcInJlc3VsdFwiKS5pbm5lckhUTUwgPSBgJHt1c2VyU2NvcmV9JWA7XG4gIGlmICh1c2VyU2NvcmUgPD0gNTApIHtcbiAgICBpZChcImZlZWRiYWNrXCIpLmlubmVySFRNTCA9IFwiVHJ5IGhhcmRlciBuZXh0IHRpbWVcIjtcbiAgfSBlbHNlIGlmIChmaW5hbFJlc3VsdCA+IDUwICYmIGZpbmFsUmVzdWx0IDw9IDc1KSB7XG4gICAgaWQoXCJmZWVkYmFja1wiKS5pbm5lckhUTUwgPSBcIllvdSBhcmUgYWxtb3N0IHRoZXJlIHRyeSBhZ2FpblwiO1xuICB9IGVsc2Uge1xuICAgIGlkKFwiZmVlZGJhY2tcIikuaW5uZXJIVE1MID0gXCJDb25ncmF0dWxhdGlvbnMgWW91IG1hZGUgaXRcIjtcbiAgfVxufSk7XG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/result.js\n");

/***/ })

/******/ });