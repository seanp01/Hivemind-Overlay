/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/llm/index.js":
/*!**************************!*\
  !*** ./src/llm/index.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class LLMService {
  constructor(apiUrl = 'http://localhost:5000/predict') {
    this.apiUrl = apiUrl;
  }
  async summarizeChat(chatBlocks) {
    // Step 1: Get a summary for each chat block
    const summaries = await Promise.all(chatBlocks.map(block => this.callPredict(block)));

    // Step 2: Optionally, combine summaries and get a final summary
    const combinedSummary = summaries.join('\n');
    const finalSummary = await this.callPredict(`Summarize the following chat summaries:\n${combinedSummary}`);
    return finalSummary;
  }
  createPrompt(chatBlocks) {
    return `Summarize the following chat messages:\n${chatBlocks.join('\n')}`;
  }

  // Send a prompt to the local LLM server's /predict endpoint
  async callPredict(prompt) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt
      })
    });
    if (!response.ok) {
      throw new Error('Failed to fetch summary from LLM API');
    }
    const data = await response.json();
    // Adjust this if your Flask server returns a different field
    return data.result || data.summary || '';
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LLMService);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************************!*\
  !*** ./extension/background.js ***!
  \*********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _src_llm_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../src/llm/index.js */ "./src/llm/index.js");


// background.js
const llm = new _src_llm_index_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
chrome.runtime.onInstalled.addListener(() => {
  console.log("HivemindOverlay extension installed.");
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "predict") {
    llm.call(request.prompt).then(summary => sendResponse({
      result: summary
    })).catch(err => sendResponse({
      result: "Error: " + err.message
    }));
    return true; // Keep the message channel open for async response
  }
  if (request.action === "summarizeChat") {
    llm.summarizeChat(request.chatBlocks).then(summary => sendResponse({
      result: summary
    })).catch(err => sendResponse({
      result: "Error: " + err.message
    }));
    return true; // Keep the message channel open for async response
  }
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && (tab.url && tab.url.match(/^https:\/\/www\.twitch\.tv\/.*\/chat/) || tab.url && tab.url.match(/^https:\/\/www\.youtube\.com\/live_chat/))) {
    chrome.scripting.executeScript({
      target: {
        tabId
      },
      files: ['content.bundle.js']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log('content.bundle.js injected');
        // Send the URL to the content script
        chrome.tabs.sendMessage(tabId, {
          type: "tabUrl",
          url: tab.url
        });
      }
    });
  }
});
})();

/******/ })()
;
//# sourceMappingURL=background.bundle.js.map