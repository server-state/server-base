module.exports=function(t){var e={};function o(r){if(e[r])return e[r].exports;var i=e[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,o),i.l=!0,i.exports}return o.m=t,o.c=e,o.d=function(t,e,r){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(o.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)o.d(r,i,function(e){return t[e]}.bind(null,i));return r},o.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="",o(o.s=0)}([function(t,e,o){const r=o(1);t.exports=class{constructor(t){this.modules={},this.args={},this.authorizedGroups={},this.config=t||{isAuthorized:null},r._configure(t)}addModule(t,e,o,i){this.modules[t]?r.warn(`Module already used: ${t}. Skipping`):(this.modules[t]=e,this.authorizedGroups[t]=o,this.args[t]=i)}init(t){for(let e in this.modules)Object.prototype.hasOwnProperty.call(this.modules,e)&&(t.get(`/api/v1/${e}/permissions`,async(t,o)=>{if(this.config.isAuthorized&&"function"==typeof this.config.isAuthorized&&!this.config.isAuthorized(t,this.authorizedGroups[e]))return o.status(403).send();const r=await this.authorizedGroups[e];return o.json(r)}),t.get("/api/v1/"+e,async(t,o)=>{try{if(this.config.isAuthorized&&"function"==typeof this.config.isAuthorized&&!this.config.isAuthorized(t,this.authorizedGroups[e]))return o.status(403).send();const r=await this.modules[e](this.args[e]);return o.json(r)}catch(t){return r.error(e,t.message),o.status(500).send(`An error occurred while running the module ${e}. Please check your server logs or contact your administrator.`)}}));t.get("/api/v1/all",async(t,e)=>{let o={};for(let i in this.modules)if(Object.prototype.hasOwnProperty.call(this.modules,i))try{this.config.isAuthorized&&"function"==typeof this.config.isAuthorized?this.config.isAuthorized(t,this.authorizedGroups[i])&&(o[i]=await this.modules[i](this.args[i])):o[i]=await this.modules[i](this.args[i])}catch(t){r.error(i,t.message),e.status(500).send(`An error occurred while running the module ${i}. Please check your server logs or `+"contact your administrator.")}return e.json(o)})}}},function(t,e,o){const r=o(2);let i={logToConsole:!0,logToFile:!1,logFilePath:"./server-state.log"};const n=["LOG  ","WARN ","","","","ERROR"];function s(t,...e){let o;o="["+(new Date).toISOString()+"] "+n[t]+" ",o+=e.reduce((t,e)=>t+" "+e,"",e.map(t=>t.toString())),i.logToConsole&&function(t,e){switch(t){case 0:console.log(e);break;case 1:console.warn(e);break;default:console.error(e)}}(t,o),i.logToFile&&function(t,e){r.existsSync(i.logFilePath)||r.writeFileSync(i.logFilePath,"Log file initialized on "+(new Date).toISOString());r.appendFileSync(i.logFilePath,"\n"+e)}(0,o)}t.exports={log:(...t)=>s(0,...t),warn:(...t)=>s(1,...t),error:(...t)=>s(5,...t),_configure:t=>{i=Object.assign(i,t)}}},function(t,e){t.exports=require("fs")}]);