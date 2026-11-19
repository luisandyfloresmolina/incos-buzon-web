var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// node_modules/hono/dist/http-exception.js
var HTTPException = class extends Error {
  static {
    __name(this, "HTTPException");
  }
  res;
  status;
  /**
  * Creates an instance of `HTTPException`.
  * @param status - HTTP status code for the exception. Defaults to 500.
  * @param options - Additional options for the exception.
  */
  constructor(status = 500, options) {
    super(options?.message, { cause: options?.cause });
    this.res = options?.res;
    this.status = status;
  }
  /**
  * Returns the response object associated with the exception.
  * If a response object is not provided, a new response is created with the error message and status code.
  * @returns The response object.
  */
  getResponse() {
    if (this.res) return new Response(this.res.body, {
      status: this.status,
      headers: this.res.headers
    });
    return new Response(this.message, { status: this.status });
  }
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
  return new Response(arrayBuffer, { headers: { "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase()) } }).formData();
}, "bufferToFormData");

// node_modules/hono/dist/utils/body.js
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const mediaType = (isRawRequest(request) ? request.headers : request.raw.headers).get("Content-Type")?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") return parseFormData(request, {
    all,
    dot
  });
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) return convertFormDataToBodyData(await request.bodyCache.formData, options);
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) request.bodyCache.formData = formDataPromise;
  const formData = await formDataPromise;
  if (formData) return convertFormDataToBodyData(formData, options);
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    if (!(options.all || key.endsWith("[]"))) form[key] = value;
    else handleParsingAllValues(form, key, value);
  });
  if (options.dot) Object.entries(form).forEach(([key, value]) => {
    if (key.includes(".")) {
      handleParsingNestedValues(form, key, value, nestingState);
      delete form[key];
    }
  });
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) form[key].push(value);
    else form[key] = [form[key], value];
  } else if (!key.endsWith("[]")) form[key] = value;
  else form[key] = [value];
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key)) return;
  let nestedForm = form;
  const keys = key.split(".", 34);
  if (keys.length > 33) throwNestingLimitExceeded();
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) nestedForm[key2] = value;
    else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS) throwNestingLimitExceeded();
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");
var throwNestingLimitExceeded = /* @__PURE__ */ __name(() => {
  throw new Error("Nesting limit exceeded");
}, "throwNestingLimitExceeded");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") paths.shift();
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath2) => {
  const { groups, path } = extractGroupsFromPath(routePath2);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return {
    groups,
    path
  };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) if (paths[j].includes(mark)) {
      paths[j] = paths[j].replace(mark, groups[i][1]);
      break;
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") return "*";
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [
        cacheKey,
        match2[1],
        new RegExp(`^${match2[2]}(?=/${next})`)
      ] : [
        label,
        match2[1],
        new RegExp(`^${match2[2]}$`)
      ];
      else patternCache[cacheKey] = [
        label,
        match2[1],
        true
      ];
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder2) => {
  try {
    return decoder2(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder2(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var decodeURIWithPreservedPercent = /* @__PURE__ */ __name((value) => decodeURI(value.includes("%25") ? value.replace(/%25/g, "%2525") : value), "decodeURIWithPreservedPercent");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      const decoded = tryDecode(path, decodeURIWithPreservedPercent);
      if (/%(?![0-9A-Fa-f]{2})/.test(path)) {
        const rewritten = new URL("http://localhost");
        rewritten.pathname = decoded.replace(/[\\\t\n\r]/g, encodeURIComponent);
        if (tryDecode(rewritten.pathname, decodeURIWithPreservedPercent) !== decoded) return tryDecode(path.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"), decodeURIWithPreservedPercent);
      }
      return decoded;
    } else if (charCode === 63 || charCode === 35) break;
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base2, sub, ...rest) => {
  if (rest.length) sub = mergePath(sub, ...rest);
  return `${base2?.[0] === "/" ? "" : "/"}${base2}${sub === "/" ? "" : `${base2?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) return null;
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) basePath += "/" + segment;
    else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "") results.push("/");
        else results.push(basePath);
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else basePath += "/" + segment;
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str, "tryDecodeURIComponent");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (value.indexOf("+") !== -1) value = value.replace(/\+/g, " ");
  return tryDecodeURIComponent(value);
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  const hashIndex = url.indexOf("#", 8);
  if (hashIndex !== -1) url = url.slice(0, hashIndex);
  let encoded;
  if (!multiple && key && !/[%+&=]/.test(key)) {
    const queryIndex = url.indexOf("?", 8);
    let keyIndex2 = queryIndex;
    if (keyIndex2 === -1) return;
    if (!url.startsWith(key, keyIndex2 + 1)) keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61 || trailingKeyCode === 38 || isNaN(trailingKeyCode)) {
        if (keyIndex2 > queryIndex && /(?:^|&)[^=&]*[%+]/.test(url.slice(queryIndex + 1, keyIndex2))) break;
        if (trailingKeyCode === 61) {
          const valueIndex = keyIndex2 + key.length + 2;
          const endIndex = url.indexOf("&", valueIndex);
          return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
        }
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) return;
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) valueIndex = -1;
    let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex);
    if (encoded) name = _decodeURI(name);
    keyIndex = nextKeyIndex;
    if (name === "") continue;
    let value;
    if (valueIndex === -1) value = "";
    else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) value = _decodeURI(value);
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) results[name] = [];
      results[name].push(value);
    } else results[name] ??= value;
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
  * `.raw` can get the raw Request object.
  *
  * @see {@link https://hono.dev/docs/api/request#raw}
  *
  * @example
  * ```ts
  * // For Cloudflare Workers
  * app.post('/', async (c) => {
  *   const metadata = c.req.raw.cf?.hostMetadata?
  *   ...
  * })
  * ```
  */
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  /**
  * `.path` can get the pathname of the request.
  *
  * @see {@link https://hono.dev/docs/api/request#path}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const pathname = c.req.path // `/about/me`
  * })
  * ```
  */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) decoded[key] = tryDecodeURIComponent(value);
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) return this.raw.headers.get(name) ?? void 0;
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) return cachedBody;
    for (const anyCachedKey in bodyCache) return bodyCache[anyCachedKey].then((body) => {
      if (anyCachedKey === "json") body = JSON.stringify(body);
      const contentType = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
      return new Response(body, { headers: contentType ? { "Content-Type": contentType } : void 0 })[key]();
    });
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
  * `.json()` can parse Request body of type `application/json`
  *
  * @see {@link https://hono.dev/docs/api/request#json}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.json()
  * })
  * ```
  */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
  * `.text()` can parse Request body of type `text/plain`
  *
  * @see {@link https://hono.dev/docs/api/request#text}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.text()
  * })
  * ```
  */
  text() {
    return this.#cachedBody("text");
  }
  /**
  * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
  *
  * @see {@link https://hono.dev/docs/api/request#arraybuffer}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.arrayBuffer()
  * })
  * ```
  */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
  * `.bytes()` parses the request body as a `Uint8Array`.
  *
  * @see {@link https://hono.dev/docs/api/request#bytes}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.bytes()
  * })
  * ```
  */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
  * Parses the request body as a `Blob`.
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.blob();
  * });
  * ```
  * @see https://hono.dev/docs/api/request#blob
  */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
  * Parses the request body as `FormData`.
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.formData();
  * });
  * ```
  * @see https://hono.dev/docs/api/request#formdata
  */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
  * Adds validated data to the request.
  *
  * @param target - The target of the validation.
  * @param data - The validated data to add.
  */
  addValidatedData(target, data) {
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
  * `.url` can get the request url strings.
  *
  * @see {@link https://hono.dev/docs/api/request#url}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const url = c.req.url // `http://localhost:8787/about/me`
  *   ...
  * })
  * ```
  */
  get url() {
    return this.raw.url;
  }
  /**
  * `.method` can get the method name of the request.
  *
  * @see {@link https://hono.dev/docs/api/request#method}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const method = c.req.method // `GET`
  * })
  * ```
  */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
  * `.matchedRoutes` can return a matched route in the handler
  *
  * @deprecated
  *
  * Use matchedRoutes helper defined in "hono/route" instead.
  *
  * @see {@link https://hono.dev/docs/api/request#matchedroutes}
  *
  * @example
  * ```ts
  * app.use('*', async function logger(c, next) {
  *   await next()
  *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
  *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
  *     console.log(
  *       method,
  *       ' ',
  *       path,
  *       ' '.repeat(Math.max(10 - path.length, 0)),
  *       name,
  *       i === c.req.routeIndex ? '<- respond from here' : ''
  *     )
  *   })
  * })
  * ```
  */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
  * `.routePath` can retrieve the path registered within the handler
  *
  * @deprecated
  *
  * Use routePath helper defined in "hono/route" instead.
  *
  * @see {@link https://hono.dev/docs/api/request#routepath}
  *
  * @example
  * ```ts
  * app.get('/posts/:id', (c) => {
  *   return c.json({ path: c.req.routePath })
  * })
  * ```
  */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) str = str.toString();
    if (str instanceof Promise) str = await str;
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) return Promise.resolve(str);
  if (buffer) buffer[0] += str;
  else buffer = [str];
  const resStr = Promise.all(callbacks.map((c) => c({
    phase,
    buffer,
    context: context2
  }))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))).then(() => buffer[0]));
  if (preserveCallbacks) return raw(await resStr, callbacks);
  else return resStr;
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
  * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
  *
  * @see {@link https://hono.dev/docs/api/context#env}
  *
  * @example
  * ```ts
  * // Environment object for Cloudflare Workers
  * app.get('*', async c => {
  *   const counter = c.env.COUNTER
  * })
  * ```
  */
  env = {};
  #var;
  finalized = false;
  /**
  * `.error` can get the error object from the middleware if the Handler throws an error.
  *
  * @see {@link https://hono.dev/docs/api/context#error}
  *
  * @example
  * ```ts
  * app.use('*', async (c, next) => {
  *   await next()
  *   if (c.error) {
  *     // do something...
  *   }
  * })
  * ```
  */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
  * Creates an instance of the Context class.
  *
  * @param req - The Request object.
  * @param options - Optional configuration options for the context.
  */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
  * `.req` is the instance of {@link HonoRequest}.
  */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#event}
  * The FetchEvent associated with the current request.
  *
  * @throws Will throw an error if the context does not have a FetchEvent.
  */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) return this.#executionCtx;
    else throw Error("This context has no FetchEvent");
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#executionctx}
  * The ExecutionContext associated with the current request.
  *
  * @throws Will throw an error if the context does not have an ExecutionContext.
  */
  get executionCtx() {
    if (this.#executionCtx) return this.#executionCtx;
    else throw Error("This context has no ExecutionContext");
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#res}
  * The Response object for the current request.
  */
  get res() {
    return this.#res ||= createResponseInstance(null, { headers: this.#preparedHeaders ??= new Headers() });
  }
  /**
  * Sets the Response object for the current request.
  *
  * @param _res - The Response object to set.
  */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") continue;
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) _res.headers.append("set-cookie", cookie);
        } else _res.headers.set(k, v);
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
  * `.render()` can create a response within a layout.
  *
  * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
  *
  * @example
  * ```ts
  * app.get('/', (c) => {
  *   return c.render('Hello!')
  * })
  * ```
  */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
  * Sets the layout for the response.
  *
  * @param layout - The layout to set.
  * @returns The layout function.
  */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
  * Gets the current layout for the response.
  *
  * @returns The current layout function.
  */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
  * `.setRenderer()` can set the layout in the custom middleware.
  *
  * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
  *
  * @example
  * ```tsx
  * app.use('*', async (c, next) => {
  *   c.setRenderer((content) => {
  *     return c.html(
  *       <html>
  *         <body>
  *           <p>{content}</p>
  *         </body>
  *       </html>
  *     )
  *   })
  *   await next()
  * })
  * ```
  */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
  * `.header()` can set headers.
  *
  * @see {@link https://hono.dev/docs/api/context#header}
  *
  * @example
  * ```ts
  * app.get('/welcome', (c) => {
  *   // Set headers
  *   c.header('X-Message', 'Hello!')
  *   c.header('Content-Type', 'text/plain')
  *
  *   // Append multiple headers using the append option (e.g. Vary)
  *   c.header('Vary', 'Accept-Encoding', { append: true })
  *   c.header('Vary', 'User-Agent', { append: true })
  *
  *   return c.body('Thank you for coming')
  * })
  * ```
  */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized && !this.#res.bodyUsed) this.#res = createResponseInstance(this.#res.body, this.#res);
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) headers.delete(name);
    else if (options?.append) headers.append(name, value);
    else headers.set(name, value);
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
  * `.set()` can set the value specified by the key.
  *
  * @see {@link https://hono.dev/docs/api/context#set-get}
  *
  * @example
  * ```ts
  * app.use('*', async (c, next) => {
  *   c.set('message', 'Hono is hot!!')
  *   await next()
  * })
  * ```
  */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
  * `.get()` can use the value specified by the key.
  *
  * @see {@link https://hono.dev/docs/api/context#set-get}
  *
  * @example
  * ```ts
  * app.get('/', (c) => {
  *   const message = c.get('message')
  *   return c.text(`The message is "${message}"`)
  * })
  * ```
  */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
  * `.var` can access the value of a variable.
  *
  * @see {@link https://hono.dev/docs/api/context#var}
  *
  * @example
  * ```ts
  * const result = c.var.client.oneMethod()
  * ```
  */
  get var() {
    if (!this.#var) return {};
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) if (key === "set-cookie") responseHeaders.append(key, value);
      else responseHeaders.set(key, value);
    }
    if (headers) {
      if (!responseHeaders) {
        let count3 = 0;
        for (const k in headers) if (++count3 > 1 || typeof headers[k] !== "string") {
          responseHeaders = new Headers();
          break;
        }
      }
      if (responseHeaders) for (const k in headers) {
        const v = headers[k];
        if (typeof v === "string") responseHeaders.set(k, v);
        else {
          responseHeaders.delete(k);
          for (const v2 of v) responseHeaders.append(k, v2);
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
  * `.body()` can return the HTTP response.
  * You can set headers with `.header()` and set HTTP status code with `.status`.
  * This can also be set in `.text()`, `.json()` and so on.
  *
  * @see {@link https://hono.dev/docs/api/context#body}
  *
  * @example
  * ```ts
  * app.get('/welcome', (c) => {
  *   // Set headers
  *   c.header('X-Message', 'Hello!')
  *   c.header('Content-Type', 'text/plain')
  *   // Set HTTP status code
  *   c.status(201)
  *
  *   // Return the response body
  *   return c.body('Thank you for coming')
  * })
  * ```
  */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
  * `.text()` can render text as `Content-Type:text/plain`.
  *
  * @see {@link https://hono.dev/docs/api/context#text}
  *
  * @example
  * ```ts
  * app.get('/say', (c) => {
  *   return c.text('Hello!')
  * })
  * ```
  */
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(text, arg, setDefaultContentType(TEXT_PLAIN, headers));
  }, "text");
  /**
  * `.json()` can render JSON as `Content-Type:application/json`.
  *
  * @see {@link https://hono.dev/docs/api/context#json}
  *
  * @example
  * ```ts
  * app.get('/api', (c) => {
  *   return c.json({ message: 'Hello!' })
  * })
  * ```
  */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(JSON.stringify(object), arg, setDefaultContentType("application/json", headers));
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
  * `.redirect()` can Redirect, default status code is 302.
  *
  * @see {@link https://hono.dev/docs/api/context#redirect}
  *
  * @example
  * ```ts
  * app.get('/redirect', (c) => {
  *   return c.redirect('/')
  * })
  * app.get('/redirect-permanently', (c) => {
  *   return c.redirect('/', 301)
  * })
  * ```
  */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header("Location", !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString));
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
  * `.notFound()` can return the Not Found Response.
  *
  * @see {@link https://hono.dev/docs/api/context#notfound}
  *
  * @example
  * ```ts
  * app.get('/notfound', (c) => {
  *   return c.notFound()
  * })
  * ```
  */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context2, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context2.req.routeIndex = i;
      } else handler = i === middleware.length && next || void 0;
      if (handler) try {
        res = await handler(context2, () => dispatch(i + 1));
      } catch (err) {
        if (err instanceof Error && onError) {
          context2.error = err;
          res = await onError(err, context2);
          isError = true;
        } else throw err;
      }
      else if (context2.finalized === false && onNotFound) res = await onNotFound(context2);
      if (res && (context2.finalized === false || isError)) context2.res = res;
      return context2;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/helper/route/index.js
var matchedRoutes = /* @__PURE__ */ __name((c) => c.req[GET_MATCH_RESULT][0].map(([[, route]]) => route), "matchedRoutes");
var routePath = /* @__PURE__ */ __name((c, index) => matchedRoutes(c).at(index ?? c.req.routeIndex)?.path ?? "", "routePath");

// node_modules/hono/dist/router.js
var METHODS = [
  "get",
  "post",
  "put",
  "delete",
  "options",
  "patch",
  "query"
];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/utils/mount.js
var countTrailingSlashes = /* @__PURE__ */ __name((path) => {
  let index = path.length;
  while (index > 0 && path.charCodeAt(index - 1) === 47) index--;
  return path.length - index;
}, "countTrailingSlashes");
var getPathPrefixLength = /* @__PURE__ */ __name((c, pathPrefix, routePath2) => {
  if (!/[:*]/.test(pathPrefix)) return pathPrefix.length;
  const path = c.req.path;
  const matchResult = c.req[GET_MATCH_RESULT];
  const paramNames = /* @__PURE__ */ new Set();
  let length = 0;
  for (const part of splitRoutingPath(pathPrefix)) {
    if (part[0] === ":" && part.endsWith("}?")) throw new Error(`mount(): Optional regular expression parameters are not supported in "${routePath2}".`);
    const pattern = getPattern(part);
    if (pattern && pattern !== "*") {
      const name = pattern[1];
      if (paramNames.has(name)) throw new Error(`mount(): Duplicate path parameter "${name}" in "${routePath2}".`);
      paramNames.add(name);
    }
    if (pattern && pattern !== "*" && pattern[2] !== true) {
      const value = matchResult.length === 2 ? matchResult[1][matchResult[0][c.req.routeIndex][1][pattern[1]]] : matchResult[0][c.req.routeIndex][1][pattern[1]];
      length += value.length + 1;
    } else if (pattern || part.endsWith("*")) {
      const end = path.indexOf("/", length + 1);
      length = end === -1 ? path.length : end;
    } else length += part.length + 1;
  }
  return length;
}, "getPathPrefixLength");
var createMountedRequest = /* @__PURE__ */ __name((c, pathPrefix, routePath2) => {
  if (/[^/]\*$/.test(routePath2)) throw new Error(`mount(): Wildcard must follow "/" in "${routePath2}".`);
  const prefixLength = getPathPrefixLength(c, pathPrefix, routePath2);
  const path = c.req.path.slice(prefixLength) || "/";
  if (prefixLength > c.req.path.length || path[0] !== "/" || /\/(?:\.|%2e){1,2}(?:\/|$)/i.test(path)) throw new HTTPException(400, { message: "Invalid mounted path" });
  const rawUrl = c.req.raw.url;
  if (/^[^/?#]*\/\/[^/?#\\]*[?#\\]/.test(rawUrl)) throw new HTTPException(400, { message: "Invalid mounted path" });
  const rawPathEnd = rawUrl.search(/[?#]/);
  const rawTrailingSlashes = countTrailingSlashes(rawPathEnd === -1 ? rawUrl : rawUrl.slice(0, rawPathEnd));
  if (rawTrailingSlashes > 1 && countTrailingSlashes(c.req.path) === rawTrailingSlashes - 1) throw new HTTPException(400, { message: "Invalid mounted path" });
  const url = new URL(rawUrl);
  url.pathname = path.replace(/[\\\t\n\r]/g, encodeURIComponent);
  if (path.includes("%")) {
  }
  return new Request(url, c.req.raw);
}, "createMountedRequest");

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class Hono2 {
  static {
    __name(this, "Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    [...METHODS, "all"].forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string") this.#path = args1;
        else this.#addRoute(methodName, this.#path, args1);
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers) this.#addRoute(methodName, this.#path, handler);
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") this.#path = arg1;
      else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute("ALL", this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono2({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  /**
  * `.route()` allows grouping other Hono instance in routes.
  *
  * @see {@link https://hono.dev/docs/api/routing#grouping}
  *
  * @param {string} path - base Path
  * @param {Hono} app - other Hono instance
  * @returns {Hono} routed Hono instance
  *
  * @example
  * ```ts
  * const app = new Hono()
  * const app2 = new Hono()
  *
  * app2.get("/user", (c) => c.text("user"))
  * app.route("/api", app2) // GET /api/user
  * ```
  */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) handler = r.handler;
      else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
  * `.basePath()` allows base paths to be specified.
  *
  * @see {@link https://hono.dev/docs/api/routing#base-path}
  *
  * @param {string} path - base Path
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * const api = new Hono().basePath('/api')
  * ```
  */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
  * `.onError()` handles an error and returns a customized Response.
  *
  * @see {@link https://hono.dev/docs/api/hono#error-handling}
  *
  * @param {ErrorHandler} handler - request Handler for error
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * app.onError((err, c) => {
  *   console.error(`${err}`)
  *   return c.text('Custom Error Message', 500)
  * })
  * ```
  */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
  * `.notFound()` allows you to customize a Not Found Response.
  *
  * @see {@link https://hono.dev/docs/api/hono#not-found}
  *
  * @param {NotFoundHandler} handler - request handler for not-found
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * app.notFound((c) => {
  *   return c.text('Custom 404 Message', 404)
  * })
  * ```
  */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
  * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
  *
  * @deprecated Use `mount()` from `hono/mount` instead. `.mount()` will be removed in v5.
  *
  * @see {@link https://hono.dev/docs/api/hono#mount}
  *
  * @param {string} path - base Path
  * @param {Function} applicationHandler - other Request Handler
  * @param {MountOptions} [options] - options of `.mount()`
  * @returns {Hono} mounted Hono instance
  * @throws {Error} If automatic request rewriting encounters duplicate path parameter names or an optional regular expression parameter.
  * @throws {HTTPException} With status 400 if automatic request rewriting cannot safely preserve the routed path.
  *
  * @example
  * ```ts
  * import { Router as IttyRouter } from 'itty-router'
  * import { Hono } from 'hono'
  * // Create itty-router application
  * const ittyRouter = IttyRouter()
  * // GET /itty-router/hello
  * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
  *
  * const app = new Hono()
  * app.mount('/itty-router', ittyRouter.handle)
  * ```
  *
  * @example
  * ```ts
  * const app = new Hono()
  * // Send the request to another application without modification.
  * app.mount('/app', anotherApp, {
  *   replaceRequest: (req) => req,
  * })
  * ```
  */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") optionHandler = options;
      else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        else replaceRequest = options.replaceRequest;
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    const defaultReplaceRequest = /* @__PURE__ */ __name((c) => {
      const mountedRoutePath = routePath(c);
      return createMountedRequest(c, mountedRoutePath.replace(/\/?\*$/, ""), mountedRoutePath);
    }, "defaultReplaceRequest");
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest ? replaceRequest(c.req.raw) : defaultReplaceRequest(c), ...getOptions(c));
      if (res) return res;
      await next();
    }, "handler");
    this.#addRoute("ALL", mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) return this.errorHandler(err, c);
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context2 = await composed(c);
        if (!context2.finalized) throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
        return context2.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
  * `.fetch()` will be entry point of your app.
  *
  * @see {@link https://hono.dev/docs/api/hono#fetch}
  *
  * @param {Request} request - request Object of request
  * @param {Env} env - env Object
  * @param {ExecutionContext} executionCtx - context of execution
  * @returns {Response | Promise<Response>} response of request
  *
  */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
  * `.request()` is a useful method for testing.
  * You can pass a URL or pathname to send a GET request.
  * app will return a Response object.
  * ```ts
  * test('GET /hello is ok', async () => {
  *   const res = await app.request('/hello')
  *   expect(res.status).toBe(200)
  * })
  * ```
  * @see https://hono.dev/docs/api/hono#request
  */
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    input = input.toString();
    return this.fetch(new Request(/^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`, requestInit), Env, executionCtx);
  }, "request");
  /**
  * `.fire()` automatically adds a global fetch event listener.
  * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
  * @deprecated
  * Use `fire` from `hono/service-worker` instead.
  * ```ts
  * import { Hono } from 'hono'
  * import { fire } from 'hono/service-worker'
  *
  * const app = new Hono()
  * // ...
  * fire(app)
  * ```
  * @see https://hono.dev/docs/api/hono#fire
  * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
  * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
  */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/utils.js
var createNullObject = /* @__PURE__ */ __name(() => /* @__PURE__ */ Object.create(null), "createNullObject");

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers["ALL"];
    const staticMatch = matcher[2][path2];
    if (staticMatch) return staticMatch;
    const match3 = path2.match(matcher[0]);
    if (!match3) return [[], emptyParam];
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = "[^]*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/[^]*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = /* @__PURE__ */ new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) return b.length === 1 ? a < b ? -1 : 1 : -1;
  if (b.length === 1) return 1;
  if (a === "[^]*" || a === "(?:|/[^]*)") return b === "[^]*" ? -1 : 1;
  else if (b === "[^]*" || b === "(?:|/[^]*)") return -1;
  if (a === "[^/]+") return 1;
  else if (b === "[^/]+") return -1;
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class Node2 {
  static {
    __name(this, "Node");
  }
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context2, keys) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? [
        "",
        "",
        ONLY_WILDCARD_REG_EXP_STR
      ] : [
        "",
        "",
        LABEL_REG_EXP_STR
      ] : null : token === "/*" ? [
        "",
        "",
        TAIL_WILDCARD_REG_EXP_STR
      ] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || "[^/]+";
        if (name && pattern[2]) {
          if (new RegExp(regexpStr).test("")) throw PATH_ERROR;
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) throw PATH_ERROR;
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) throw PATH_ERROR;
        }
        keys.push(regexpStr);
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== "[^]*" && regexpStr !== "(?:|/[^]*)") {
            for (const k in node.#children) if ((regexpStr.length > 1 || k.length > 1) && k !== "[^]*" && k !== "(?:|/[^]*)") throw PATH_ERROR;
          }
          nextNode = node.#children[regexpStr] = new Node2();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context2.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        keys.push(token);
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) if (k.length > 1 && k !== "[^]*" && k !== "(?:|/[^]*)") throw PATH_ERROR;
          nextNode = node.#children[token] = new Node2();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) throw PATH_ERROR;
    node.#index = index;
  }
  buildRegExpStr() {
    const strList = Object.keys(this.#children).sort(compareKey).map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) strList.unshift(`#${this.#index}`);
    if (strList.length === 0) return "";
    if (strList.length === 1) return strList[0];
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  paths = createNullObject();
  insert(path, isStatic) {
    const keys = [];
    if (isStatic) {
      this.#root.insert(path.split(""), -1, [], this.#context, keys);
      this.paths[path] = [
        -1,
        [],
        keys
      ];
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{(?:\{[\d,]+\}|[^}])+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) break;
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./gs) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) if (tokens[j].indexOf(mark) !== -1) {
        tokens[j] = tokens[j].replace(mark, groups[i][1]);
        break;
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, keys);
    this.paths[path] = [
      this.#index++,
      paramAssoc,
      keys
    ];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") return [
      /^$/,
      [],
      []
    ];
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [
      new RegExp(`^${regexp}`),
      indexReplacementMap,
      paramReplacementMap
    ];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
function endsWithWildcard(keys) {
  const tail = keys[keys.length - 1];
  return tail === "[^]*" || tail === "(?:|/[^]*)";
}
__name(endsWithWildcard, "endsWithWildcard");
function covers(wildcard, target) {
  const last = wildcard.length - 1;
  for (let i = 0; i < last; i++) if (wildcard[i] !== target[i]) return false;
  return wildcard[last] === "[^]*" || target.length === last || target[last] === "/";
}
__name(covers, "covers");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #handlers;
  #tries;
  constructor() {
    this.#handlers = { ["ALL"]: [] };
    this.#tries = { ["ALL"]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const handlers = this.#handlers;
    if (!handlers) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    const tries = this.#tries;
    if (!handlers[method]) {
      tries[method] = new Trie();
      handlers[method] = [...handlers["ALL"]];
      for (const p in tries["ALL"].paths) this.#insertPath(method, p);
    }
    if (path === "/*") path = "*";
    const methods = method === "ALL" ? Object.keys(handlers) : [method];
    const paths = checkOptionalParameter(path) || [path];
    for (const path2 of paths) for (const m of methods) {
      if (!tries[m].paths[path2]) this.#insertPath(m, path2);
      handlers[m].push([handler, path2]);
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#handlers)) matchers[method] = this.#buildMatcher(method);
    this.#handlers = this.#tries = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const handlers = this.#handlers[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    const own = createNullObject();
    const entries = handlers.map(([h, p], i) => {
      (own[p] ??= []).push(i);
      return [h, trie.paths[p][1].reduceRight((map, [key, varIndex]) => {
        map[key] = paramReplacementMap[varIndex];
        return map;
      }, createNullObject())];
    });
    const wildcards = Object.keys(own).filter((p) => endsWithWildcard(trie.paths[p][2]));
    for (const path in trie.paths) {
      const [index, , keys] = trie.paths[path];
      const indexes = [...own[path]];
      for (const p of wildcards) if (p !== path && covers(trie.paths[p][2], keys)) indexes.push(...own[p]);
      const data = indexes.sort((a, b) => a - b).map((i) => entries[i]);
      if (index === -1) {
        const last = Math.max(-1, ...data.flatMap(([, map]) => Object.values(map)));
        staticMap[path] = [data, last === -1 ? emptyParam : path.match(regexp).slice(0, last + 1)];
      } else handlerData[index] = data;
    }
    return [
      regexp,
      indexReplacementMap.map((i) => handlerData[i]),
      staticMap
    ];
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    this.#routes.push([
      method,
      path,
      handler
    ]);
  }
  match(method, path) {
    if (!this.#routes) throw new Error("Fatal error");
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) router.add(...routes[i2]);
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) continue;
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) throw new Error("Fatal error");
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) throw new Error("No active router has been determined yet.");
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = createNullObject();
var order = 0;
var Node3 = class Node4 {
  static {
    __name(this, "Node");
  }
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path, handler) {
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts) {
      const nextP = parts[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key] ||= new Node4();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam) possibleKeys.add(pattern[1]);
    }
    curNode.#methods.push({ [method]: {
      handler,
      possibleKeys: [...possibleKeys],
      score: ++order
    } });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m["ALL"];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    let curNodes = [this];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else tempNodes.push(nextNode);
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true) continue;
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              if (!Object.hasOwn(params, name)) params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) this.#pushHandlerSets(handlerSets, child.#children["*"], method, node.#params, params);
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                (curNodesQueue[componentCount] ||= []).push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            if (!Object.hasOwn(params, name)) params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) this.#pushHandlerSets(handlerSets, child.#children["*"], method, params, node.#params);
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1]) handlerSets.sort((a, b) => {
      return a.score - b.score;
    });
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node = new Node3();
  add(method, path, handler) {
    for (const result of checkOptionalParameter(path) || [path]) this.#node.insert(method, result, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono3 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
  * Creates an instance of the Hono class.
  *
  * @param options - Optional configuration options for the Hono instance.
  */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({ routers: [new RegExpRouter(), new TrieRouter()] });
  }
};

// src/lib/respuesta.ts
function ok(c, datos, meta = null, status = 200) {
  return c.json({ exito: true, datos, meta, error: null }, status);
}
__name(ok, "ok");
function fallo(c, codigo, mensaje, status = 400) {
  return c.json(
    { exito: false, datos: null, meta: null, error: { codigo, mensaje } },
    status
  );
}
__name(fallo, "fallo");
var HttpError = class extends Error {
  static {
    __name(this, "HttpError");
  }
  status;
  codigo;
  constructor(status, codigo, mensaje) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
  }
};
function exigir(condicion, status, codigo, mensaje) {
  if (!condicion) throw new HttpError(status, codigo, mensaje);
}
__name(exigir, "exigir");

// node_modules/jose/dist/browser/runtime/webcrypto.js
var webcrypto_default = crypto;
var isCryptoKey = /* @__PURE__ */ __name((key) => key instanceof CryptoKey, "isCryptoKey");

// node_modules/jose/dist/browser/lib/buffer_utils.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
__name(concat, "concat");

// node_modules/jose/dist/browser/runtime/base64url.js
var decodeBase64 = /* @__PURE__ */ __name((encoded) => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}, "decodeBase64");
var decode = /* @__PURE__ */ __name((input) => {
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}, "decode");

// node_modules/jose/dist/browser/util/errors.js
var JOSEError = class extends Error {
  static {
    __name(this, "JOSEError");
  }
  constructor(message2, options) {
    super(message2, options);
    this.code = "ERR_JOSE_GENERIC";
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
JOSEError.code = "ERR_JOSE_GENERIC";
var JWTClaimValidationFailed = class extends JOSEError {
  static {
    __name(this, "JWTClaimValidationFailed");
  }
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
JWTClaimValidationFailed.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
var JWTExpired = class extends JOSEError {
  static {
    __name(this, "JWTExpired");
  }
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_EXPIRED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
JWTExpired.code = "ERR_JWT_EXPIRED";
var JOSEAlgNotAllowed = class extends JOSEError {
  static {
    __name(this, "JOSEAlgNotAllowed");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
  }
};
JOSEAlgNotAllowed.code = "ERR_JOSE_ALG_NOT_ALLOWED";
var JOSENotSupported = class extends JOSEError {
  static {
    __name(this, "JOSENotSupported");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_NOT_SUPPORTED";
  }
};
JOSENotSupported.code = "ERR_JOSE_NOT_SUPPORTED";
var JWEDecryptionFailed = class extends JOSEError {
  static {
    __name(this, "JWEDecryptionFailed");
  }
  constructor(message2 = "decryption operation failed", options) {
    super(message2, options);
    this.code = "ERR_JWE_DECRYPTION_FAILED";
  }
};
JWEDecryptionFailed.code = "ERR_JWE_DECRYPTION_FAILED";
var JWEInvalid = class extends JOSEError {
  static {
    __name(this, "JWEInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWE_INVALID";
  }
};
JWEInvalid.code = "ERR_JWE_INVALID";
var JWSInvalid = class extends JOSEError {
  static {
    __name(this, "JWSInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWS_INVALID";
  }
};
JWSInvalid.code = "ERR_JWS_INVALID";
var JWTInvalid = class extends JOSEError {
  static {
    __name(this, "JWTInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWT_INVALID";
  }
};
JWTInvalid.code = "ERR_JWT_INVALID";
var JWKInvalid = class extends JOSEError {
  static {
    __name(this, "JWKInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWK_INVALID";
  }
};
JWKInvalid.code = "ERR_JWK_INVALID";
var JWKSInvalid = class extends JOSEError {
  static {
    __name(this, "JWKSInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWKS_INVALID";
  }
};
JWKSInvalid.code = "ERR_JWKS_INVALID";
var JWKSNoMatchingKey = class extends JOSEError {
  static {
    __name(this, "JWKSNoMatchingKey");
  }
  constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_NO_MATCHING_KEY";
  }
};
JWKSNoMatchingKey.code = "ERR_JWKS_NO_MATCHING_KEY";
var JWKSMultipleMatchingKeys = class extends JOSEError {
  static {
    __name(this, "JWKSMultipleMatchingKeys");
  }
  constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  }
};
JWKSMultipleMatchingKeys.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
var JWKSTimeout = class extends JOSEError {
  static {
    __name(this, "JWKSTimeout");
  }
  constructor(message2 = "request timed out", options) {
    super(message2, options);
    this.code = "ERR_JWKS_TIMEOUT";
  }
};
JWKSTimeout.code = "ERR_JWKS_TIMEOUT";
var JWSSignatureVerificationFailed = class extends JOSEError {
  static {
    __name(this, "JWSSignatureVerificationFailed");
  }
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
    this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  }
};
JWSSignatureVerificationFailed.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";

// node_modules/jose/dist/browser/lib/crypto_key.js
function unusable(name, prop = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
__name(unusable, "unusable");
function isAlgorithm(algorithm, name) {
  return algorithm.name === name;
}
__name(isAlgorithm, "isAlgorithm");
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
__name(getHashLength, "getHashLength");
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
__name(getNamedCurve, "getNamedCurve");
function checkUsage(key, usages) {
  if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
    let msg = "CryptoKey does not support this operation, its usages must include ";
    if (usages.length > 2) {
      const last = usages.pop();
      msg += `one of ${usages.join(", ")}, or ${last}.`;
    } else if (usages.length === 2) {
      msg += `one of ${usages[0]} or ${usages[1]}.`;
    } else {
      msg += `${usages[0]}.`;
    }
    throw new TypeError(msg);
  }
}
__name(checkUsage, "checkUsage");
function checkSigCryptoKey(key, alg, ...usages) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "EdDSA": {
      if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") {
        throw unusable("Ed25519 or Ed448");
      }
      break;
    }
    case "Ed25519": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usages);
}
__name(checkSigCryptoKey, "checkSigCryptoKey");

// node_modules/jose/dist/browser/lib/invalid_key_input.js
function message(msg, actual, ...types2) {
  types2 = types2.filter(Boolean);
  if (types2.length > 2) {
    const last = types2.pop();
    msg += `one of type ${types2.join(", ")}, or ${last}.`;
  } else if (types2.length === 2) {
    msg += `one of type ${types2[0]} or ${types2[1]}.`;
  } else {
    msg += `of type ${types2[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
__name(message, "message");
var invalid_key_input_default = /* @__PURE__ */ __name((actual, ...types2) => {
  return message("Key must be ", actual, ...types2);
}, "default");
function withAlg(alg, actual, ...types2) {
  return message(`Key for the ${alg} algorithm must be `, actual, ...types2);
}
__name(withAlg, "withAlg");

// node_modules/jose/dist/browser/runtime/is_key_like.js
var is_key_like_default = /* @__PURE__ */ __name((key) => {
  if (isCryptoKey(key)) {
    return true;
  }
  return key?.[Symbol.toStringTag] === "KeyObject";
}, "default");
var types = ["CryptoKey"];

// node_modules/jose/dist/browser/lib/is_disjoint.js
var isDisjoint = /* @__PURE__ */ __name((...headers) => {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
}, "isDisjoint");
var is_disjoint_default = isDisjoint;

// node_modules/jose/dist/browser/lib/is_object.js
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
__name(isObjectLike, "isObjectLike");
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}
__name(isObject, "isObject");

// node_modules/jose/dist/browser/runtime/check_key_length.js
var check_key_length_default = /* @__PURE__ */ __name((alg, key) => {
  if (alg.startsWith("RS") || alg.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
  }
}, "default");

// node_modules/jose/dist/browser/lib/is_jwk.js
function isJWK(key) {
  return isObject(key) && typeof key.kty === "string";
}
__name(isJWK, "isJWK");
function isPrivateJWK(key) {
  return key.kty !== "oct" && typeof key.d === "string";
}
__name(isPrivateJWK, "isPrivateJWK");
function isPublicJWK(key) {
  return key.kty !== "oct" && typeof key.d === "undefined";
}
__name(isPublicJWK, "isPublicJWK");
function isSecretJWK(key) {
  return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
}
__name(isSecretJWK, "isSecretJWK");

// node_modules/jose/dist/browser/runtime/jwk_to_key.js
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
          algorithm = { name: "ECDSA", namedCurve: "P-256" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          algorithm = { name: "ECDSA", namedCurve: "P-384" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          algorithm = { name: "ECDSA", namedCurve: "P-521" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "EdDSA":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
__name(subtleMapping, "subtleMapping");
var parse = /* @__PURE__ */ __name(async (jwk) => {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const rest = [
    algorithm,
    jwk.ext ?? false,
    jwk.key_ops ?? keyUsages
  ];
  const keyData = { ...jwk };
  delete keyData.alg;
  delete keyData.use;
  return webcrypto_default.subtle.importKey("jwk", keyData, ...rest);
}, "parse");
var jwk_to_key_default = parse;

// node_modules/jose/dist/browser/runtime/normalize_key.js
var exportKeyValue = /* @__PURE__ */ __name((k) => decode(k), "exportKeyValue");
var privCache;
var pubCache;
var isKeyObject = /* @__PURE__ */ __name((key) => {
  return key?.[Symbol.toStringTag] === "KeyObject";
}, "isKeyObject");
var importAndCache = /* @__PURE__ */ __name(async (cache, key, jwk, alg, freeze = false) => {
  let cached = cache.get(key);
  if (cached?.[alg]) {
    return cached[alg];
  }
  const cryptoKey = await jwk_to_key_default({ ...jwk, alg });
  if (freeze)
    Object.freeze(key);
  if (!cached) {
    cache.set(key, { [alg]: cryptoKey });
  } else {
    cached[alg] = cryptoKey;
  }
  return cryptoKey;
}, "importAndCache");
var normalizePublicKey = /* @__PURE__ */ __name((key, alg) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    delete jwk.d;
    delete jwk.dp;
    delete jwk.dq;
    delete jwk.p;
    delete jwk.q;
    delete jwk.qi;
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(pubCache, key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(pubCache, key, key, alg, true);
    return cryptoKey;
  }
  return key;
}, "normalizePublicKey");
var normalizePrivateKey = /* @__PURE__ */ __name((key, alg) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(privCache, key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(privCache, key, key, alg, true);
    return cryptoKey;
  }
  return key;
}, "normalizePrivateKey");
var normalize_key_default = { normalizePublicKey, normalizePrivateKey };

// node_modules/jose/dist/browser/key/import.js
async function importJWK(jwk, alg) {
  if (!isObject(jwk)) {
    throw new TypeError("JWK must be an object");
  }
  alg || (alg = jwk.alg);
  switch (jwk.kty) {
    case "oct":
      if (typeof jwk.k !== "string" || !jwk.k) {
        throw new TypeError('missing "k" (Key Value) Parameter value');
      }
      return decode(jwk.k);
    case "RSA":
      if ("oth" in jwk && jwk.oth !== void 0) {
        throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
      }
    case "EC":
    case "OKP":
      return jwk_to_key_default({ ...jwk, alg });
    default:
      throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
  }
}
__name(importJWK, "importJWK");

// node_modules/jose/dist/browser/lib/check_key_type.js
var tag = /* @__PURE__ */ __name((key) => key?.[Symbol.toStringTag], "tag");
var jwkMatchesOp = /* @__PURE__ */ __name((alg, key, usage) => {
  if (key.use !== void 0 && key.use !== "sig") {
    throw new TypeError("Invalid key for this operation, when present its use must be sig");
  }
  if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) {
    throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
  }
  if (key.alg !== void 0 && key.alg !== alg) {
    throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg}`);
  }
  return true;
}, "jwkMatchesOp");
var symmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage, allowJwk) => {
  if (key instanceof Uint8Array)
    return;
  if (allowJwk && isJWK(key)) {
    if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
      return;
    throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, ...types, "Uint8Array", allowJwk ? "JSON Web Key" : null));
  }
  if (key.type !== "secret") {
    throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
  }
}, "symmetricTypeCheck");
var asymmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage, allowJwk) => {
  if (allowJwk && isJWK(key)) {
    switch (usage) {
      case "sign":
        if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a private JWK`);
      case "verify":
        if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a public JWK`);
    }
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, ...types, allowJwk ? "JSON Web Key" : null));
  }
  if (key.type === "secret") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
  }
  if (usage === "sign" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
  }
  if (usage === "decrypt" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
  }
  if (key.algorithm && usage === "verify" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
  }
  if (key.algorithm && usage === "encrypt" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
  }
}, "asymmetricTypeCheck");
function checkKeyType(allowJwk, alg, key, usage) {
  const symmetric = alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg);
  if (symmetric) {
    symmetricTypeCheck(alg, key, usage, allowJwk);
  } else {
    asymmetricTypeCheck(alg, key, usage, allowJwk);
  }
}
__name(checkKeyType, "checkKeyType");
var check_key_type_default = checkKeyType.bind(void 0, false);
var checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);

// node_modules/jose/dist/browser/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
__name(validateCrit, "validateCrit");
var validate_crit_default = validateCrit;

// node_modules/jose/dist/browser/lib/validate_algorithms.js
var validateAlgorithms = /* @__PURE__ */ __name((option, algorithms) => {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
}, "validateAlgorithms");
var validate_algorithms_default = validateAlgorithms;

// node_modules/jose/dist/browser/runtime/subtle_dsa.js
function subtleDsa(alg, algorithm) {
  const hash = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: alg.slice(-3) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
      return { name: "Ed25519" };
    case "EdDSA":
      return { name: algorithm.name };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}
__name(subtleDsa, "subtleDsa");

// node_modules/jose/dist/browser/runtime/get_sign_verify_key.js
async function getCryptoKey(alg, key, usage) {
  if (usage === "sign") {
    key = await normalize_key_default.normalizePrivateKey(key, alg);
  }
  if (usage === "verify") {
    key = await normalize_key_default.normalizePublicKey(key, alg);
  }
  if (isCryptoKey(key)) {
    checkSigCryptoKey(key, alg, usage);
    return key;
  }
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalid_key_input_default(key, ...types));
    }
    return webcrypto_default.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array", "JSON Web Key"));
}
__name(getCryptoKey, "getCryptoKey");

// node_modules/jose/dist/browser/runtime/verify.js
var verify = /* @__PURE__ */ __name(async (alg, key, signature, data) => {
  const cryptoKey = await getCryptoKey(alg, key, "verify");
  check_key_length_default(alg, cryptoKey);
  const algorithm = subtleDsa(alg, cryptoKey.algorithm);
  try {
    return await webcrypto_default.subtle.verify(algorithm, cryptoKey, signature, data);
  } catch {
    return false;
  }
}, "verify");
var verify_default = verify;

// node_modules/jose/dist/browser/jws/flattened/verify.js
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!is_disjoint_default(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validate_algorithms_default("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
    checkKeyTypeWithJwk(alg, key, "verify");
    if (isJWK(key)) {
      key = await importJWK(key, alg);
    }
  } else {
    checkKeyTypeWithJwk(alg, key, "verify");
  }
  const data = concat(encoder.encode(jws.protected ?? ""), encoder.encode("."), typeof jws.payload === "string" ? encoder.encode(jws.payload) : jws.payload);
  let signature;
  try {
    signature = decode(jws.signature);
  } catch {
    throw new JWSInvalid("Failed to base64url decode the signature");
  }
  const verified = await verify_default(alg, key, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    try {
      payload = decode(jws.payload);
    } catch {
      throw new JWSInvalid("Failed to base64url decode the payload");
    }
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key };
  }
  return result;
}
__name(flattenedVerify, "flattenedVerify");

// node_modules/jose/dist/browser/jws/compact/verify.js
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(compactVerify, "compactVerify");

// node_modules/jose/dist/browser/lib/epoch.js
var epoch_default = /* @__PURE__ */ __name((date) => Math.floor(date.getTime() / 1e3), "default");

// node_modules/jose/dist/browser/lib/secs.js
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs_default = /* @__PURE__ */ __name((str) => {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
}, "default");

// node_modules/jose/dist/browser/lib/jwt_claims_set.js
var normalizeTyp = /* @__PURE__ */ __name((value) => value.toLowerCase().replace(/^application\//, ""), "normalizeTyp");
var checkAudiencePresence = /* @__PURE__ */ __name((audPayload, audOption) => {
  if (typeof audPayload === "string") {
    return audOption.includes(audPayload);
  }
  if (Array.isArray(audPayload)) {
    return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
  }
  return false;
}, "checkAudiencePresence");
var jwt_claims_set_default = /* @__PURE__ */ __name((protectedHeader, encodedPayload, options = {}) => {
  let payload;
  try {
    payload = JSON.parse(decoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs_default(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now = epoch_default(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs_default(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
}, "default");

// node_modules/jose/dist/browser/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = jwt_claims_set_default(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(jwtVerify, "jwtVerify");

// node_modules/jose/dist/browser/util/base64url.js
var decode2 = decode;

// node_modules/jose/dist/browser/util/decode_protected_header.js
function decodeProtectedHeader(token) {
  let protectedB64u;
  if (typeof token === "string") {
    const parts = token.split(".");
    if (parts.length === 3 || parts.length === 5) {
      ;
      [protectedB64u] = parts;
    }
  } else if (typeof token === "object" && token) {
    if ("protected" in token) {
      protectedB64u = token.protected;
    } else {
      throw new TypeError("Token does not contain a Protected Header");
    }
  }
  try {
    if (typeof protectedB64u !== "string" || !protectedB64u) {
      throw new Error();
    }
    const result = JSON.parse(decoder.decode(decode2(protectedB64u)));
    if (!isObject(result)) {
      throw new Error();
    }
    return result;
  } catch {
    throw new TypeError("Invalid Token or Protected Header formatting");
  }
}
__name(decodeProtectedHeader, "decodeProtectedHeader");

// src/lib/fecha.ts
var OFFSET_MS = 4 * 60 * 60 * 1e3;
function ahoraLaPaz() {
  return new Date(Date.now() - OFFSET_MS).toISOString().replace("Z", "-04:00");
}
__name(ahoraLaPaz, "ahoraLaPaz");
function hoyLaPaz() {
  return new Date(Date.now() - OFFSET_MS).toISOString().slice(0, 10);
}
__name(hoyLaPaz, "hoyLaPaz");
function sumarDias(fecha, dias) {
  const d = /* @__PURE__ */ new Date(fecha + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
__name(sumarDias, "sumarDias");

// src/lib/cripto.ts
var codificador = new TextEncoder();
var ITER_DEFECTO = 15e3;
function bytesAB64url(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(bytesAB64url, "bytesAB64url");
function b64urlABytes(texto) {
  let b = texto.replace(/-/g, "+").replace(/_/g, "/");
  while (b.length % 4) b += "=";
  const bin = atob(b);
  const salida = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) salida[i] = bin.charCodeAt(i);
  return salida;
}
__name(b64urlABytes, "b64urlABytes");
function bytesAHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(bytesAHex, "bytesAHex");
async function sha256Hex(texto) {
  const datos = typeof texto === "string" ? codificador.encode(texto) : texto;
  const hash = await crypto.subtle.digest("SHA-256", datos);
  return bytesAHex(new Uint8Array(hash));
}
__name(sha256Hex, "sha256Hex");
function compararSeguro(a, b) {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a[i] ^ b[i];
  return diferencia === 0;
}
__name(compararSeguro, "compararSeguro");
function compararTextoSeguro(a, b) {
  return compararSeguro(codificador.encode(a), codificador.encode(b));
}
__name(compararTextoSeguro, "compararTextoSeguro");
var ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function generarCodigo() {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let crudo = "";
  for (let i = 0; i < 20; i++) crudo += ALFABETO[bytes[i] % 32];
  return crudo.match(/.{4}/g).join("-");
}
__name(generarCodigo, "generarCodigo");
function normalizarCodigo(entrada) {
  return (entrada || "").toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
}
__name(normalizarCodigo, "normalizarCodigo");
async function hashCodigo(entrada) {
  return sha256Hex("codigo:" + normalizarCodigo(entrada));
}
__name(hashCodigo, "hashCodigo");
async function pbkdf2(clave, sal, iteraciones) {
  const material = await crypto.subtle.importKey(
    "raw",
    codificador.encode(clave),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: sal, iterations: iteraciones },
    material,
    256
  );
  return new Uint8Array(bits);
}
__name(pbkdf2, "pbkdf2");
function iteracionesPbkdf2(env2) {
  const n = Number(env2);
  return Number.isFinite(n) && n >= 1e3 && n <= 2e6 ? Math.floor(n) : ITER_DEFECTO;
}
__name(iteracionesPbkdf2, "iteracionesPbkdf2");
async function hashClave(clave, iteraciones = ITER_DEFECTO) {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const bits = await pbkdf2(clave, sal, iteraciones);
  return `pbkdf2$${iteraciones}$${bytesAB64url(sal)}$${bytesAB64url(bits)}`;
}
__name(hashClave, "hashClave");
async function verificarClave(clave, almacenado) {
  try {
    const [algoritmo, iter, sal, hash] = (almacenado || "").split("$");
    if (algoritmo !== "pbkdf2" || !sal || !hash) return false;
    const bits = await pbkdf2(clave, b64urlABytes(sal), Number(iter));
    return compararSeguro(bits, b64urlABytes(hash));
  } catch {
    return false;
  }
}
__name(verificarClave, "verificarClave");
async function claveHmac(secreto) {
  return crypto.subtle.importKey(
    "raw",
    codificador.encode(secreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}
__name(claveHmac, "claveHmac");
async function firmarTexto(payload, secreto) {
  const firma = await crypto.subtle.sign("HMAC", await claveHmac(secreto), codificador.encode(payload));
  return bytesAB64url(new Uint8Array(firma));
}
__name(firmarTexto, "firmarTexto");
async function verificarFirma(payload, firma, secreto) {
  const esperada = await firmarTexto(payload, secreto);
  return compararTextoSeguro(esperada, firma);
}
__name(verificarFirma, "verificarFirma");
async function firmarJSON(objeto, secreto) {
  const payload = bytesAB64url(codificador.encode(JSON.stringify(objeto)));
  return `${payload}.${await firmarTexto(payload, secreto)}`;
}
__name(firmarJSON, "firmarJSON");
async function abrirFirmado(token, secreto) {
  const partes = (token || "").split(".");
  if (partes.length !== 2) return null;
  if (!await verificarFirma(partes[0], partes[1], secreto)) return null;
  try {
    const json = new TextDecoder().decode(b64urlABytes(partes[0]));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
__name(abrirFirmado, "abrirFirmado");
async function claveAnonima(valor, sal, fecha) {
  return sha256Hex(`${sal}|${fecha}|${valor}`);
}
__name(claveAnonima, "claveAnonima");

// src/lib/sia.ts
var base = /* @__PURE__ */ __name((env2) => (env2.SIA_URL || "").replace(/\/+$/, ""), "base");
async function apiSIA(env2, ruta, opciones = {}) {
  const headers = { "content-type": "application/json" };
  if (opciones.token) headers.authorization = `Bearer ${opciones.token}`;
  const respuesta = await fetch(base(env2) + ruta, {
    method: opciones.metodo ?? "GET",
    headers,
    body: opciones.cuerpo === void 0 ? void 0 : JSON.stringify(opciones.cuerpo),
    signal: AbortSignal.timeout(8e3)
  });
  if (!respuesta.ok) throw new Error(`SIA ${respuesta.status} en ${ruta}`);
  return await respuesta.json();
}
__name(apiSIA, "apiSIA");
var cacheJwks = null;
async function obtenerJwks(env2) {
  const ahora = Date.now();
  if (cacheJwks && cacheJwks.expira > ahora) return cacheJwks.claves;
  const respuesta = await fetch(base(env2) + "/.well-known/jwks.json", {
    signal: AbortSignal.timeout(8e3)
  });
  if (!respuesta.ok) throw new Error(`JWKS ${respuesta.status}`);
  const cuerpo = await respuesta.json();
  const claves = cuerpo.keys ?? [];
  if (claves.length === 0) throw new Error("JWKS vac\xEDo");
  cacheJwks = { claves, expira: ahora + 60 * 60 * 1e3 };
  return claves;
}
__name(obtenerJwks, "obtenerJwks");
async function importarClave(jwk) {
  const der = b64urlABytes(String(jwk?.n ?? ""));
  if (der.length > 4 && der[0] === 48 && der[1] === 130) {
    return crypto.subtle.importKey(
      "spki",
      der,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
  }
  return await importJWK(jwk, "RS256");
}
__name(importarClave, "importarClave");
async function verificarTokenSIA(env2, token) {
  try {
    const cabecera = decodeProtectedHeader(token);
    const claves = await obtenerJwks(env2);
    const jwk = claves.find((k) => k.kid === cabecera.kid) ?? claves[0];
    if (!jwk) return null;
    const clave = await importarClave(jwk);
    const { payload } = await jwtVerify(token, clave, {
      issuer: "sia-incos",
      algorithms: ["RS256"]
    });
    const roles = payload.roles ?? {};
    if (!roles.BUZON) return null;
    return {
      sub: Number(payload.sub),
      ci: payload.ci,
      nombre: payload.nombre,
      roles,
      cargos: payload.cargos ?? [],
      exp: Number(payload.exp ?? 0)
    };
  } catch (error3) {
    console.error("FALLO_VERIFICACION_JWT", error3 instanceof Error ? error3.message : error3);
    return null;
  }
}
__name(verificarTokenSIA, "verificarTokenSIA");
async function loginSIA(env2, identificador, clave) {
  const respuesta = await apiSIA(env2, "/api/v1/auth/ingresar", {
    metodo: "POST",
    cuerpo: { identificador, clave }
  });
  if (!respuesta?.datos?.token) {
    throw new Error(respuesta?.error?.mensaje ?? "Credenciales inv\xE1lidas");
  }
  return respuesta.datos;
}
__name(loginSIA, "loginSIA");
var cacheServicio = null;
async function tokenServicio(env2) {
  if (cacheServicio && cacheServicio.expira > Date.now()) return cacheServicio.token;
  let respuesta;
  try {
    respuesta = await apiSIA(
      env2,
      "/api/v1/auth/ingresar",
      {
        metodo: "POST",
        cuerpo: { identificador: env2.SIA_USUARIO, clave: env2.SIA_CLAVE }
      }
    );
  } catch (error3) {
    console.error(
      "FALLO_TOKEN_SERVICIO_SIA",
      env2.SIA_USUARIO,
      error3 instanceof Error ? `${error3.name}: ${error3.message}` : String(error3)
    );
    throw error3;
  }
  const token = respuesta?.datos?.token;
  if (!token) throw new Error("El SIA no devolvi\xF3 token de servicio");
  const expira = respuesta.datos.expiraEn ? new Date(respuesta.datos.expiraEn).getTime() - 6e4 : Date.now() + 6 * 60 * 60 * 1e3;
  cacheServicio = { token, expira };
  return token;
}
__name(tokenServicio, "tokenServicio");
var cacheAutoridades = null;
function normalizar(datos) {
  return (datos ?? []).map((c) => ({
    cargoId: Number(c.id),
    cargoNombre: String(c.nombre ?? ""),
    personaId: c?.persona?.id ? Number(c.persona.id) : null,
    nombreCompleto: c?.persona ? `${c.persona.nombres ?? ""} ${c.persona.apellidos ?? ""}`.trim() : ""
  }));
}
__name(normalizar, "normalizar");
async function guardarCache(env2, datos) {
  if (datos.length === 0) return;
  const momento = ahoraLaPaz();
  await env2.DB.batch([
    env2.DB.prepare("DELETE FROM buz_cache_autoridades"),
    ...datos.map(
      (a) => env2.DB.prepare(
        `INSERT INTO buz_cache_autoridades (cargo_id, persona_id, cargo_nombre, nombre_completo, actualizado_en)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(a.cargoId, a.personaId, a.cargoNombre, a.nombreCompleto, momento)
    )
  ]);
}
__name(guardarCache, "guardarCache");
async function leerCache(env2) {
  const fila = await env2.DB.prepare(
    `SELECT cargo_id, persona_id, cargo_nombre, nombre_completo
       FROM buz_cache_autoridades ORDER BY cargo_nombre`
  ).all();
  return (fila.results ?? []).map((r) => ({
    cargoId: Number(r.cargo_id),
    cargoNombre: String(r.cargo_nombre),
    personaId: r.persona_id === null ? null : Number(r.persona_id),
    nombreCompleto: String(r.nombre_completo ?? "")
  }));
}
__name(leerCache, "leerCache");
async function autoridades(env2, forzar = false) {
  if (!forzar && cacheAutoridades && cacheAutoridades.expira > Date.now()) {
    return cacheAutoridades.datos;
  }
  try {
    const token = await tokenServicio(env2);
    const respuesta = await apiSIA(env2, "/api/v1/cargos?autoridad=true", { token });
    const datos = normalizar(respuesta?.datos ?? []).filter((a) => a.personaId);
    await guardarCache(env2, datos);
    cacheAutoridades = { datos, expira: Date.now() + 10 * 60 * 1e3 };
    return datos;
  } catch (error3) {
    console.error(
      "FALLO_AUTORIDADES_SIA",
      error3 instanceof Error ? `${error3.name}: ${error3.message}` : String(error3)
    );
    const datos = await leerCache(env2);
    cacheAutoridades = { datos, expira: Date.now() + 60 * 1e3 };
    return datos;
  }
}
__name(autoridades, "autoridades");
async function cargosAutoridad(env2) {
  const lista = await autoridades(env2);
  return lista.map((a) => ({ id: a.cargoId, nombre: a.cargoNombre }));
}
__name(cargosAutoridad, "cargosAutoridad");

// src/lib/parametros.ts
async function parametros(env2) {
  const fila = await env2.DB.prepare(
    `SELECT plazo_atencion_dias, max_adjuntos, max_tamano_adjunto_mb
       FROM buz_parametros WHERE id = 1`
  ).first();
  return {
    plazoDias: Number(fila?.plazo_atencion_dias ?? 5),
    maxAdjuntos: Number(fila?.max_adjuntos ?? 3),
    maxMB: Number(fila?.max_tamano_adjunto_mb ?? 2)
  };
}
__name(parametros, "parametros");

// src/lib/derivacion.ts
async function reglasDe(env2, categoriaId) {
  const fila = await env2.DB.prepare(
    `SELECT id, categoria_id, orden, cargo_id, instancia_externa_texto
       FROM buz_reglas_derivacion WHERE categoria_id = ? ORDER BY orden`
  ).bind(categoriaId).all();
  return fila.results ?? [];
}
__name(reglasDe, "reglasDe");
async function insertarDerivacion(env2, datos) {
  await env2.DB.prepare(
    `INSERT INTO buz_derivaciones
       (queja_id, cargo_id, persona_id, motivo, fecha_hora, activa, instancia_externa_texto)
     VALUES (?, ?, ?, ?, ?, 1, ?)`
  ).bind(
    datos.quejaId,
    datos.cargoId,
    datos.personaId,
    datos.motivo,
    ahoraLaPaz(),
    datos.externa ?? null
  ).run();
}
__name(insertarDerivacion, "insertarDerivacion");
async function derivarQueja(env2, quejaId, categoriaId, cargoInvolucradoId) {
  const reglas = await reglasDe(env2, categoriaId);
  if (reglas.length === 0) return { tipo: "NINGUNA" };
  const vigentes = await autoridades(env2);
  const denunciado = cargoInvolucradoId != null ? vigentes.find((a) => a.cargoId === Number(cargoInvolucradoId))?.personaId ?? null : null;
  let excluido = false;
  for (const regla of reglas) {
    if (regla.cargo_id != null) {
      const autoridad2 = vigentes.find((a) => a.cargoId === Number(regla.cargo_id));
      if (!autoridad2 || !autoridad2.personaId) continue;
      if (denunciado && autoridad2.personaId === denunciado) {
        excluido = true;
        continue;
      }
      await insertarDerivacion(env2, {
        quejaId,
        cargoId: regla.cargo_id,
        personaId: autoridad2.personaId,
        motivo: excluido ? "EXCLUSION" : "REGLA"
      });
      return {
        tipo: "INTERNA",
        cargoId: regla.cargo_id,
        cargoNombre: autoridad2.cargoNombre,
        personaId: autoridad2.personaId
      };
    }
    if (regla.instancia_externa_texto) {
      await insertarDerivacion(env2, {
        quejaId,
        cargoId: null,
        personaId: null,
        motivo: excluido ? "EXCLUSION" : "REGLA",
        externa: regla.instancia_externa_texto
      });
      return { tipo: "EXTERNA", cargoNombre: regla.instancia_externa_texto };
    }
  }
  return { tipo: "NINGUNA" };
}
__name(derivarQueja, "derivarQueja");
async function escalarVencidas(env2) {
  const hoy = hoyLaPaz();
  const { plazoDias } = await parametros(env2);
  const vencidas = await env2.DB.prepare(
    `SELECT q.id, q.categoria_id, q.cargo_involucrado_id,
            d.cargo_id, d.persona_id
       FROM buz_quejas q
       JOIN buz_derivaciones d ON d.queja_id = q.id AND d.activa = 1
      WHERE q.estado <> 'CERRADA'
        AND q.fecha_limite_atencion IS NOT NULL
        AND q.fecha_limite_atencion < ?`
  ).bind(hoy).all();
  if (!vencidas.results?.length) return 0;
  const vigentes = await autoridades(env2);
  let escaladas = 0;
  for (const fila of vencidas.results) {
    if (fila.cargo_id == null) continue;
    const reglas = await reglasDe(env2, Number(fila.categoria_id));
    const indiceActual = reglas.findIndex((r) => Number(r.cargo_id) === Number(fila.cargo_id));
    if (indiceActual < 0) continue;
    const denunciado = fila.cargo_involucrado_id != null ? vigentes.find((a) => a.cargoId === Number(fila.cargo_involucrado_id))?.personaId ?? null : null;
    for (let i = indiceActual + 1; i < reglas.length; i++) {
      const regla = reglas[i];
      if (regla.cargo_id != null) {
        const autoridad2 = vigentes.find((a) => a.cargoId === Number(regla.cargo_id));
        if (!autoridad2 || !autoridad2.personaId) continue;
        if (denunciado && autoridad2.personaId === denunciado) continue;
        await env2.DB.batch([
          env2.DB.prepare(`UPDATE buz_derivaciones SET activa = 0 WHERE queja_id = ? AND activa = 1`).bind(
            fila.id
          ),
          env2.DB.prepare(
            `INSERT INTO buz_derivaciones
               (queja_id, cargo_id, persona_id, motivo, fecha_hora, activa)
             VALUES (?, ?, ?, 'ESCALAMIENTO', ?, 1)`
          ).bind(fila.id, regla.cargo_id, autoridad2.personaId, ahoraLaPaz()),
          env2.DB.prepare(`UPDATE buz_quejas SET fecha_limite_atencion = ? WHERE id = ?`).bind(
            sumarDias(hoy, plazoDias),
            fila.id
          )
        ]);
        escaladas++;
        break;
      }
      if (regla.instancia_externa_texto) {
        await env2.DB.batch([
          env2.DB.prepare(`UPDATE buz_derivaciones SET activa = 0 WHERE queja_id = ? AND activa = 1`).bind(
            fila.id
          ),
          env2.DB.prepare(
            `INSERT INTO buz_derivaciones
               (queja_id, cargo_id, persona_id, motivo, fecha_hora, activa, instancia_externa_texto)
             VALUES (?, NULL, NULL, 'ESCALAMIENTO', ?, 1, ?)`
          ).bind(fila.id, ahoraLaPaz(), regla.instancia_externa_texto),
          env2.DB.prepare(`UPDATE buz_quejas SET fecha_limite_atencion = NULL WHERE id = ?`).bind(
            fila.id
          )
        ]);
        escaladas++;
        break;
      }
    }
  }
  return escaladas;
}
__name(escalarVencidas, "escalarVencidas");

// src/lib/limites.ts
async function limitar(c, etiqueta, max, ventanaSegundos) {
  try {
    const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("x-forwarded-for") ?? "sin-ip";
    const sal = c.env.ANON_SALT ?? "sal";
    const clave = await claveAnonima(`${etiqueta}:${ip}`, sal, hoyLaPaz());
    const cache = caches.default;
    const solicitud = new Request(`https://limite.interno/${clave}`, { method: "GET" });
    const previo = await cache.match(solicitud);
    const conteo = previo ? Number(await previo.text()) || 0 : 0;
    if (conteo >= max) return false;
    await cache.put(
      solicitud,
      new Response(String(conteo + 1), {
        headers: { "cache-control": `max-age=${ventanaSegundos}` }
      })
    );
    return true;
  } catch {
    return true;
  }
}
__name(limitar, "limitar");
async function verificarCaptcha(c, token) {
  const secreto = c.env.TURNSTILE_SECRET;
  if (!secreto) return true;
  if (!token) return false;
  try {
    const cuerpo = new FormData();
    cuerpo.append("secret", secreto);
    cuerpo.append("response", token);
    const respuesta = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: cuerpo, signal: AbortSignal.timeout(8e3) }
    );
    const resultado = await respuesta.json();
    return resultado.success === true;
  } catch {
    return false;
  }
}
__name(verificarCaptcha, "verificarCaptcha");

// node_modules/hono/dist/helper/factory/index.js
var createMiddleware = /* @__PURE__ */ __name((middleware) => middleware, "createMiddleware");

// node_modules/hono/dist/utils/cookie.js
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var relaxedCookieNameRegEx = /^[!#-:<>-[\]-~]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var trimCookieWhitespace = /* @__PURE__ */ __name((value) => {
  let start = 0;
  let end = value.length;
  while (start < end) {
    const charCode = value.charCodeAt(start);
    if (charCode !== 32 && charCode !== 9) break;
    start++;
  }
  while (end > start) {
    const charCode = value.charCodeAt(end - 1);
    if (charCode !== 32 && charCode !== 9) break;
    end--;
  }
  return start === 0 && end === value.length ? value : value.slice(start, end);
}, "trimCookieWhitespace");
var parse2 = /* @__PURE__ */ __name((cookie, name) => {
  if (name && cookie.indexOf(name) === -1) return {};
  const pairs = cookie.split(";");
  const parsedCookie = /* @__PURE__ */ Object.create(null);
  for (const pairStr of pairs) {
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) continue;
    const cookieName = trimCookieWhitespace(pairStr.substring(0, valueStartPos));
    if (name && name !== cookieName || !relaxedCookieNameRegEx.test(cookieName) || cookieName in parsedCookie) continue;
    let cookieValue = trimCookieWhitespace(pairStr.substring(valueStartPos + 1));
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) cookieValue = cookieValue.slice(1, -1);
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = tryDecodeURIComponent(cookieValue);
      if (name) break;
    }
  }
  return parsedCookie;
}, "parse");
var _serialize = /* @__PURE__ */ __name((name, value, opt = {}) => {
  if (!validCookieNameRegEx.test(name)) throw new Error("Invalid cookie name");
  let cookie = `${name}=${value}`;
  if (/^__secure-/i.test(name) && !opt.secure) throw new Error("__Secure- Cookie must have Secure attributes");
  if (/^__host-/i.test(name)) {
    if (!opt.secure) throw new Error("__Host- Cookie must have Secure attributes");
    if (opt.path !== "/") throw new Error('__Host- Cookie must have Path attributes with "/"');
    if (opt.domain) throw new Error("__Host- Cookie must not have Domain attributes");
  }
  for (const key of [
    "domain",
    "path",
    "sameSite",
    "priority"
  ]) if (opt[key] && /[;\r\n]/.test(opt[key])) throw new Error(`${key} must not contain ";", "\\r", or "\\n"`);
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    if (opt.maxAge > 3456e4) throw new Error("Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration.");
    cookie += `; Max-Age=${opt.maxAge | 0}`;
  }
  if (opt.domain && opt.prefix !== "host") cookie += `; Domain=${opt.domain}`;
  if (opt.path) cookie += `; Path=${opt.path}`;
  if (opt.expires) {
    if (opt.expires.getTime() - Date.now() > 3456e7) throw new Error("Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future.");
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) cookie += "; HttpOnly";
  if (opt.secure) cookie += "; Secure";
  if (opt.sameSite) cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
  if (opt.priority) cookie += `; Priority=${opt.priority.charAt(0).toUpperCase() + opt.priority.slice(1)}`;
  if (opt.partitioned) {
    if (!opt.secure) throw new Error("Partitioned Cookie must have Secure attributes");
    cookie += "; Partitioned";
  }
  return cookie;
}, "_serialize");
var serialize = /* @__PURE__ */ __name((name, value, opt) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
}, "serialize");

// node_modules/hono/dist/helper/cookie/index.js
var getCookie = /* @__PURE__ */ __name((c, key, prefix) => {
  const cookie = c.req.raw.headers.get("Cookie");
  if (typeof key === "string") {
    if (!cookie) return;
    let finalKey = key;
    if (prefix === "secure") finalKey = "__Secure-" + key;
    else if (prefix === "host") finalKey = "__Host-" + key;
    return parse2(cookie, finalKey)[finalKey];
  }
  if (!cookie) return {};
  return parse2(cookie);
}, "getCookie");
var generateCookie = /* @__PURE__ */ __name((name, value, opt) => {
  let cookie;
  if (opt?.prefix === "secure") cookie = serialize("__Secure-" + name, value, {
    path: "/",
    ...opt,
    secure: true
  });
  else if (opt?.prefix === "host") cookie = serialize("__Host-" + name, value, {
    ...opt,
    path: "/",
    secure: true,
    domain: void 0
  });
  else cookie = serialize(name, value, {
    path: "/",
    ...opt
  });
  return cookie;
}, "generateCookie");
var setCookie = /* @__PURE__ */ __name((c, name, value, opt) => {
  const cookie = generateCookie(name, value, opt);
  c.header("Set-Cookie", cookie, { append: true });
}, "setCookie");
var deleteCookie = /* @__PURE__ */ __name((c, name, opt) => {
  const deletedCookie = getCookie(c, name, opt?.prefix);
  setCookie(c, name, "", {
    ...opt,
    maxAge: 0
  });
  return deletedCookie;
}, "deleteCookie");

// src/lib/sesion.ts
var COOKIE_SIA = "buz_sia";
var COOKIE_LOCAL = "buz_local";
var DURACION = 8 * 60 * 60;
var opcionesCookie = {
  httpOnly: true,
  secure: true,
  sameSite: "Strict",
  path: "/",
  maxAge: DURACION
};
function guardarTokenSIA(c, token) {
  setCookie(c, COOKIE_SIA, token, opcionesCookie);
}
__name(guardarTokenSIA, "guardarTokenSIA");
function borrarSesion(c) {
  deleteCookie(c, COOKIE_SIA, { path: "/" });
  deleteCookie(c, COOKIE_LOCAL, { path: "/" });
}
__name(borrarSesion, "borrarSesion");
var soloAutoridad = createMiddleware(async (c, next) => {
  const token = getCookie(c, COOKIE_SIA);
  exigir(token, 401, "NO_AUTENTICADO", "Debe iniciar sesi\xF3n con el SIA.");
  const claims = await verificarTokenSIA(c.env, token);
  exigir(claims, 401, "TOKEN_INVALIDO", "Sesi\xF3n vencida o inv\xE1lida. Vuelva a ingresar.");
  const vigentes = await autoridades(c.env);
  const nombres = new Set(vigentes.map((a) => a.cargoNombre.toLowerCase()));
  const esAutoridad = (claims.cargos ?? []).some(
    (cargo) => nombres.has(String(cargo).toLowerCase())
  );
  exigir(
    esAutoridad,
    403,
    "SIN_PERMISO",
    "Su cuenta no ocupa un cargo marcado como autoridad."
  );
  c.set("claims", claims);
  await next();
});
async function iniciarSesionLocal(c, sesion) {
  setCookie(c, COOKIE_LOCAL, await firmarJSON(sesion, c.env.SESSION_SECRET), opcionesCookie);
}
__name(iniciarSesionLocal, "iniciarSesionLocal");
async function leerSesionLocal(c) {
  const token = getCookie(c, COOKIE_LOCAL);
  if (!token) return null;
  const sesion = await abrirFirmado(token, c.env.SESSION_SECRET);
  if (!sesion) return null;
  if (!sesion.exp || sesion.exp < Math.floor(Date.now() / 1e3)) return null;
  return sesion;
}
__name(leerSesionLocal, "leerSesionLocal");
function soloLocal(roles) {
  return createMiddleware(async (c, next) => {
    const sesion = await leerSesionLocal(c);
    exigir(sesion, 401, "NO_AUTENTICADO", "Debe iniciar sesi\xF3n.");
    exigir(
      roles.includes(sesion.rol),
      403,
      "SIN_PERMISO",
      "No tiene permiso para esta operaci\xF3n."
    );
    c.set("local", sesion);
    await next();
  });
}
__name(soloLocal, "soloLocal");
async function auditar(env2, datos) {
  try {
    await env2.DB.prepare(
      `INSERT INTO buz_auditoria (usuario_id, persona_id, accion, entidad, entidad_id, fecha_hora)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      datos.usuarioId ?? null,
      datos.personaId ?? null,
      datos.accion,
      datos.entidad ?? null,
      datos.entidadId ?? null,
      ahoraLaPaz()
    ).run();
  } catch {
  }
}
__name(auditar, "auditar");

// src/rutas/auth.ts
var auth = new Hono3();
auth.post("/sia", async (c) => {
  const intentos = Number(c.env.LIMITE_LOGIN_INTENTOS ?? 10) || 10;
  if (!await limitar(c, "login-sia", intentos, 900)) {
    return fallo(c, "DEMASIADOS_INTENTOS", "Demasiados intentos. Espere 15 minutos.", 429);
  }
  const cuerpo = await c.req.json().catch(() => ({}));
  const identificador = String(cuerpo?.identificador ?? "").trim();
  const clave = String(cuerpo?.clave ?? "");
  exigir(identificador && clave, 400, "DATOS_INVALIDOS", "Ingrese su CI o correo y su clave.");
  let datos;
  try {
    datos = await loginSIA(c.env, identificador, clave);
  } catch {
    await auditar(c.env, {
      accion: "LOGIN_FALLIDO",
      entidad: "autoridad"
    });
    return fallo(
      c,
      "CREDENCIALES",
      "Identificador o clave incorrectos, o el SIA no est\xE1 disponible.",
      401
    );
  }
  if (!datos.roles?.BUZON) {
    return fallo(c, "SIN_PERMISO", "Su cuenta no tiene acceso al Buz\xF3n.", 403);
  }
  const vigentes = await autoridades(c.env);
  const nombres = new Set(vigentes.map((a) => a.cargoNombre.toLowerCase()));
  const esAutoridad = (datos.cargos ?? []).some((cargo) => nombres.has(String(cargo).toLowerCase()));
  if (!esAutoridad) {
    return fallo(c, "SIN_PERMISO", "Su cuenta no ocupa un cargo marcado como autoridad.", 403);
  }
  guardarTokenSIA(c, datos.token);
  await auditar(c.env, {
    personaId: datos.persona?.id ?? null,
    accion: "LOGIN_OK",
    entidad: "autoridad"
  });
  return ok(c, {
    persona: datos.persona,
    cargos: datos.cargos,
    expiraEn: datos.expiraEn
  });
});
auth.post("/local", async (c) => {
  const intentos = Number(c.env.LIMITE_LOGIN_INTENTOS ?? 10) || 10;
  if (!await limitar(c, "login-local", intentos, 900)) {
    return fallo(c, "DEMASIADOS_INTENTOS", "Demasiados intentos. Espere 15 minutos.", 429);
  }
  const cuerpo = await c.req.json().catch(() => ({}));
  const correo = String(cuerpo?.correo ?? "").trim().toLowerCase();
  const clave = String(cuerpo?.clave ?? "");
  exigir(correo && clave, 400, "DATOS_INVALIDOS", "Ingrese su correo y su clave.");
  const usuario = await c.env.DB.prepare(
    `SELECT id, nombres, apellidos, clave_hash, rol, activo
       FROM buz_usuarios WHERE correo_electronico = ?`
  ).bind(correo).first();
  const valido = usuario?.activo && await verificarClave(clave, usuario.clave_hash);
  if (!valido) {
    await auditar(c.env, { accion: "LOGIN_FALLIDO", entidad: "cuenta_local" });
    return fallo(c, "CREDENCIALES", "Correo o clave incorrectos.", 401);
  }
  const sesion = {
    uid: Number(usuario.id),
    rol: usuario.rol,
    nombre: `${usuario.nombres} ${usuario.apellidos}`.trim(),
    exp: Math.floor(Date.now() / 1e3) + 8 * 60 * 60
  };
  await iniciarSesionLocal(c, sesion);
  await auditar(c.env, {
    usuarioId: sesion.uid,
    accion: "LOGIN_OK",
    entidad: "cuenta_local"
  });
  return ok(c, sesion);
});
auth.post("/salir", async (c) => {
  borrarSesion(c);
  return ok(c, { cerrado: true });
});
var auth_default = auth;

// src/lib/almacen.ts
function hayAlmacen(env2) {
  return Boolean(env2.ADJUNTOS || env2.ADJUNTOS_KV);
}
__name(hayAlmacen, "hayAlmacen");
async function guardarAdjunto(env2, ruta, bytes, mime) {
  if (env2.ADJUNTOS) {
    await env2.ADJUNTOS.put(ruta, bytes, { httpMetadata: { contentType: mime } });
    return;
  }
  if (!env2.ADJUNTOS_KV) {
    throw new Error("No hay almacenamiento de adjuntos configurado.");
  }
  await env2.ADJUNTOS_KV.put(ruta, bytes, { metadata: { mime } });
}
__name(guardarAdjunto, "guardarAdjunto");
async function leerAdjunto(env2, ruta) {
  if (env2.ADJUNTOS) {
    const objeto = await env2.ADJUNTOS.get(ruta);
    if (!objeto) return null;
    return { cuerpo: objeto.body };
  }
  if (!env2.ADJUNTOS_KV) return null;
  const datos = await env2.ADJUNTOS_KV.get(ruta, "arrayBuffer");
  if (!datos) return null;
  return { cuerpo: datos };
}
__name(leerAdjunto, "leerAdjunto");
async function borrarAdjunto(env2, ruta) {
  if (env2.ADJUNTOS) {
    await env2.ADJUNTOS.delete(ruta).catch(() => {
    });
    return;
  }
  if (env2.ADJUNTOS_KV) {
    await env2.ADJUNTOS_KV.delete(ruta).catch(() => {
    });
  }
}
__name(borrarAdjunto, "borrarAdjunto");

// src/rutas/autoridad.ts
var autoridad = new Hono3();
autoridad.use("*", soloAutoridad);
var ESTADOS = ["PENDIENTE", "EN_REVISION", "EN_PROCESO", "CERRADA"];
async function accesoAutoridad(c, quejaId) {
  const personaId = c.get("claims").sub;
  const fila = await c.env.DB.prepare(
    `SELECT id FROM buz_derivaciones
      WHERE queja_id = ? AND persona_id = ? AND activa = 1 LIMIT 1`
  ).bind(quejaId, personaId).first();
  exigir(fila, 403, "SIN_PERMISO", "Esta queja no est\xE1 derivada a su cargo.");
  return personaId;
}
__name(accesoAutoridad, "accesoAutoridad");
autoridad.get("/perfil", (c) => {
  const claims = c.get("claims");
  return ok(c, { personaId: claims.sub, nombre: claims.nombre, cargos: claims.cargos });
});
autoridad.get("/bandeja", async (c) => {
  const personaId = c.get("claims").sub;
  const fila = await c.env.DB.prepare(
    `SELECT q.id, q.estado, q.fecha_envio, q.fecha_limite_atencion,
            substr(q.descripcion, 1, 200) AS resumen,
            cat.nombre AS categoria,
            d.activa, d.fecha_hora AS derivada_en,
            (SELECT COUNT(*) FROM buz_mensajes m
              WHERE m.queja_id = q.id AND m.autor = 'DENUNCIANTE' AND m.leido = 0) AS sin_leer,
            (SELECT COUNT(*) FROM buz_adjuntos a WHERE a.queja_id = q.id) AS adjuntos
       FROM buz_derivaciones d
       JOIN buz_quejas q ON q.id = d.queja_id
       JOIN buz_categorias cat ON cat.id = q.categoria_id
      WHERE d.persona_id = ? AND d.activa = 1
      ORDER BY q.id DESC
      LIMIT 300`
  ).bind(personaId).all();
  const vistas = /* @__PURE__ */ new Set();
  const quejas = (fila.results ?? []).filter((q) => {
    if (vistas.has(q.id)) return false;
    vistas.add(q.id);
    return true;
  });
  return ok(c, quejas);
});
autoridad.get("/queja/:id", async (c) => {
  const quejaId = Number(c.req.param("id"));
  exigir(Number.isFinite(quejaId), 400, "DATOS_INVALIDOS", "Identificador no v\xE1lido.");
  const personaId = await accesoAutoridad(c, quejaId);
  const queja = await c.env.DB.prepare(
    `SELECT q.id, q.estado, q.descripcion, q.fecha_envio, q.fecha_limite_atencion,
            q.cargo_involucrado_id,
            cat.nombre AS categoria,
            ci.cargo_nombre AS cargo_involucrado
       FROM buz_quejas q
       JOIN buz_categorias cat ON cat.id = q.categoria_id
       LEFT JOIN buz_cache_autoridades ci ON ci.cargo_id = q.cargo_involucrado_id
      WHERE q.id = ?`
  ).bind(quejaId).first();
  exigir(queja, 404, "NO_ENCONTRADO", "La queja no existe.");
  const [derivacion, historial, mensajes, adjuntos] = await Promise.all([
    c.env.DB.prepare(
      `SELECT d.motivo, d.fecha_hora, d.instancia_externa_texto, ca.cargo_nombre
         FROM buz_derivaciones d
         LEFT JOIN buz_cache_autoridades ca ON ca.cargo_id = d.cargo_id
        WHERE d.queja_id = ? AND d.activa = 1 ORDER BY d.id DESC LIMIT 1`
    ).bind(quejaId).first(),
    c.env.DB.prepare(
      `SELECT estado_anterior, estado_nuevo, fecha_hora
         FROM buz_historial_estados WHERE queja_id = ? ORDER BY id`
    ).bind(quejaId).all(),
    c.env.DB.prepare(
      `SELECT id, autor, texto, fecha_hora, leido
         FROM buz_mensajes WHERE queja_id = ? ORDER BY id`
    ).bind(quejaId).all(),
    c.env.DB.prepare(
      `SELECT id, nombre_generico, tamano_bytes, tipo_mime, hash_sha256
         FROM buz_adjuntos WHERE queja_id = ? ORDER BY id`
    ).bind(quejaId).all()
  ]);
  await c.env.DB.prepare(
    `UPDATE buz_mensajes SET leido = 1
      WHERE queja_id = ? AND autor = 'DENUNCIANTE' AND leido = 0`
  ).bind(quejaId).run();
  return ok(c, {
    ...queja,
    derivacion_actual: derivacion ? derivacion.cargo_nombre ?? derivacion.instancia_externa_texto ?? "Instancia interna" : "Sin asignar",
    motivo_derivacion: derivacion?.motivo ?? null,
    historial: historial.results ?? [],
    mensajes: mensajes.results ?? [],
    adjuntos: adjuntos.results ?? [],
    mi_persona_id: personaId
  });
});
autoridad.patch("/queja/:id/estado", async (c) => {
  const quejaId = Number(c.req.param("id"));
  exigir(Number.isFinite(quejaId), 400, "DATOS_INVALIDOS", "Identificador no v\xE1lido.");
  const personaId = await accesoAutoridad(c, quejaId);
  const cuerpo = await c.req.json().catch(() => ({}));
  const nuevo = String(cuerpo?.estado ?? "");
  exigir(
    ESTADOS.includes(nuevo),
    400,
    "DATOS_INVALIDOS",
    "Estado no v\xE1lido."
  );
  const actual = await c.env.DB.prepare("SELECT estado FROM buz_quejas WHERE id = ?").bind(quejaId).first();
  exigir(actual, 404, "NO_ENCONTRADO", "La queja no existe.");
  exigir(actual.estado !== "CERRADA", 409, "QUEJA_CERRADA", "Una queja cerrada no se puede modificar.");
  if (actual.estado !== nuevo) {
    await c.env.DB.batch([
      c.env.DB.prepare("UPDATE buz_quejas SET estado = ? WHERE id = ?").bind(nuevo, quejaId),
      c.env.DB.prepare(
        `INSERT INTO buz_historial_estados
           (queja_id, estado_anterior, estado_nuevo, persona_id, fecha_hora)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(quejaId, actual.estado, nuevo, personaId, ahoraLaPaz())
    ]);
    await auditar(c.env, {
      personaId,
      accion: "CAMBIO_ESTADO",
      entidad: "queja",
      entidadId: quejaId
    });
  }
  return ok(c, { estado: nuevo });
});
autoridad.post("/queja/:id/mensaje", async (c) => {
  const quejaId = Number(c.req.param("id"));
  exigir(Number.isFinite(quejaId), 400, "DATOS_INVALIDOS", "Identificador no v\xE1lido.");
  const personaId = await accesoAutoridad(c, quejaId);
  const cuerpo = await c.req.json().catch(() => ({}));
  const texto = String(cuerpo?.texto ?? "").trim();
  exigir(texto.length >= 1 && texto.length <= 4e3, 400, "DATOS_INVALIDOS", "Escriba un mensaje v\xE1lido.");
  const queja = await c.env.DB.prepare("SELECT estado FROM buz_quejas WHERE id = ?").bind(quejaId).first();
  exigir(queja, 404, "NO_ENCONTRADO", "La queja no existe.");
  exigir(queja.estado !== "CERRADA", 409, "QUEJA_CERRADA", "La queja est\xE1 cerrada.");
  await c.env.DB.prepare(
    `INSERT INTO buz_mensajes (queja_id, autor, persona_id, texto, fecha_hora, leido)
     VALUES (?, 'AUTORIDAD', ?, ?, ?, 0)`
  ).bind(quejaId, personaId, texto, ahoraLaPaz()).run();
  if (queja.estado === "PENDIENTE") {
    await c.env.DB.batch([
      c.env.DB.prepare("UPDATE buz_quejas SET estado = 'EN_REVISION' WHERE id = ?").bind(quejaId),
      c.env.DB.prepare(
        `INSERT INTO buz_historial_estados
           (queja_id, estado_anterior, estado_nuevo, persona_id, fecha_hora)
         VALUES (?, 'PENDIENTE', 'EN_REVISION', ?, ?)`
      ).bind(quejaId, personaId, ahoraLaPaz())
    ]);
  }
  await auditar(c.env, {
    personaId,
    accion: "RESPUESTA",
    entidad: "queja",
    entidadId: quejaId
  });
  return ok(c, { registrado: true }, null, 201);
});
autoridad.get("/adjunto/:id", async (c) => {
  const adjuntoId = Number(c.req.param("id"));
  exigir(Number.isFinite(adjuntoId), 400, "DATOS_INVALIDOS", "Identificador no v\xE1lido.");
  const personaId = c.get("claims").sub;
  const adjunto = await c.env.DB.prepare(
    `SELECT a.ruta_almacenamiento, a.nombre_generico, a.tipo_mime
       FROM buz_adjuntos a
       JOIN buz_derivaciones d ON d.queja_id = a.queja_id AND d.activa = 1
      WHERE a.id = ? AND d.persona_id = ? LIMIT 1`
  ).bind(adjuntoId, personaId).first();
  exigir(adjunto, 403, "SIN_PERMISO", "No tiene acceso a este adjunto.");
  const objeto = await leerAdjunto(c.env, adjunto.ruta_almacenamiento);
  exigir(objeto, 404, "NO_ENCONTRADO", "El archivo no est\xE1 disponible.");
  await auditar(c.env, {
    personaId,
    accion: "DESCARGA_ADJUNTO",
    entidad: "adjunto",
    entidadId: adjuntoId
  });
  return new Response(objeto.cuerpo, {
    headers: {
      "content-type": adjunto.tipo_mime,
      "content-disposition": `attachment; filename="${adjunto.nombre_generico}"`,
      "cache-control": "no-store"
    }
  });
});
var autoridad_default = autoridad;

// src/rutas/admin.ts
var admin = new Hono3();
var soloAdmin = soloLocal(["ADMIN_TECNICO"]);
var adminYComite = soloLocal(["ADMIN_TECNICO", "COMITE"]);
admin.get("/perfil", adminYComite, (c) => ok(c, c.get("local")));
admin.get("/categorias", soloAdmin, async (c) => {
  const fila = await c.env.DB.prepare(
    `SELECT c.id, c.nombre, c.descripcion, c.activa,
            (SELECT COUNT(*) FROM buz_quejas q WHERE q.categoria_id = c.id) AS quejas
       FROM buz_categorias c ORDER BY c.nombre`
  ).all();
  return ok(c, fila.results ?? []);
});
admin.post("/categorias", soloAdmin, async (c) => {
  const cuerpo = await c.req.json().catch(() => ({}));
  const nombre = String(cuerpo?.nombre ?? "").trim();
  const descripcion = String(cuerpo?.descripcion ?? "").trim();
  exigir(nombre.length >= 2 && nombre.length <= 80, 400, "DATOS_INVALIDOS", "Nombre de categor\xEDa no v\xE1lido.");
  try {
    const creada = await c.env.DB.prepare(
      "INSERT INTO buz_categorias (nombre, descripcion) VALUES (?, ?) RETURNING id"
    ).bind(nombre, descripcion).first();
    await auditar(c.env, {
      usuarioId: c.get("local").uid,
      accion: "CATEGORIA_CREADA",
      entidad: "categoria",
      entidadId: Number(creada.id)
    });
    return ok(c, { id: Number(creada.id) }, null, 201);
  } catch {
    return fallo(c, "REGISTRO_DUPLICADO", "Ya existe una categor\xEDa con ese nombre.", 409);
  }
});
admin.patch("/categorias/:id", soloAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  const cuerpo = await c.req.json().catch(() => ({}));
  const actual = await c.env.DB.prepare("SELECT * FROM buz_categorias WHERE id = ?").bind(id).first();
  exigir(actual, 404, "NO_ENCONTRADO", "La categor\xEDa no existe.");
  const nombre = cuerpo?.nombre === void 0 ? actual.nombre : String(cuerpo.nombre).trim();
  const descripcion = cuerpo?.descripcion === void 0 ? actual.descripcion : String(cuerpo.descripcion).trim();
  const activa = cuerpo?.activa === void 0 ? actual.activa : cuerpo.activa ? 1 : 0;
  await c.env.DB.prepare(
    "UPDATE buz_categorias SET nombre = ?, descripcion = ?, activa = ? WHERE id = ?"
  ).bind(nombre, descripcion, activa, id).run();
  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "CATEGORIA_EDITADA",
    entidad: "categoria",
    entidadId: id
  });
  return ok(c, { actualizada: true });
});
admin.delete("/categorias/:id", soloAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  const uso = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM buz_quejas WHERE categoria_id = ?").bind(id).first();
  exigir(Number(uso?.n ?? 0) === 0, 409, "CONFLICTO", "La categor\xEDa tiene quejas: desact\xEDvela en lugar de borrarla.");
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM buz_reglas_derivacion WHERE categoria_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM buz_categorias WHERE id = ?").bind(id)
  ]);
  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "CATEGORIA_ELIMINADA",
    entidad: "categoria",
    entidadId: id
  });
  return ok(c, { eliminada: true });
});
admin.get("/reglas/:categoriaId", soloAdmin, async (c) => {
  const categoriaId = Number(c.req.param("categoriaId"));
  const fila = await c.env.DB.prepare(
    `SELECT r.id, r.categoria_id, r.orden, r.cargo_id, r.instancia_externa_texto,
            ca.cargo_nombre, ca.nombre_completo
       FROM buz_reglas_derivacion r
       LEFT JOIN buz_cache_autoridades ca ON ca.cargo_id = r.cargo_id
      WHERE r.categoria_id = ? ORDER BY r.orden`
  ).bind(categoriaId).all();
  return ok(c, fila.results ?? []);
});
admin.put("/reglas/:categoriaId", soloAdmin, async (c) => {
  const categoriaId = Number(c.req.param("categoriaId"));
  const cuerpo = await c.req.json().catch(() => ({}));
  const reglas = Array.isArray(cuerpo?.reglas) ? cuerpo.reglas : null;
  exigir(reglas && reglas.length >= 1 && reglas.length <= 10, 400, "DATOS_INVALIDOS", "La cadena debe tener entre 1 y 10 eslabones.");
  const categoria = await c.env.DB.prepare("SELECT id FROM buz_categorias WHERE id = ?").bind(categoriaId).first();
  exigir(categoria, 404, "NO_ENCONTRADO", "La categor\xEDa no existe.");
  const sentencias = [
    c.env.DB.prepare("DELETE FROM buz_reglas_derivacion WHERE categoria_id = ?").bind(categoriaId)
  ];
  reglas.forEach((regla, indice) => {
    const cargoId = regla?.cargo_id === void 0 || regla?.cargo_id === null || regla?.cargo_id === "" ? null : Number(regla.cargo_id);
    const externo = regla?.instancia_externa_texto ? String(regla.instancia_externa_texto).trim() : null;
    exigir(cargoId !== null || externo, 400, "DATOS_INVALIDOS", "Cada eslab\xF3n debe tener un cargo o una instancia externa.");
    sentencias.push(
      c.env.DB.prepare(
        `INSERT INTO buz_reglas_derivacion (categoria_id, orden, cargo_id, instancia_externa_texto)
         VALUES (?, ?, ?, ?)`
      ).bind(categoriaId, indice + 1, cargoId, externo)
    );
  });
  await c.env.DB.batch(sentencias);
  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "REGLAS_ACTUALIZADAS",
    entidad: "categoria",
    entidadId: categoriaId
  });
  return ok(c, { actualizadas: reglas.length });
});
admin.get("/usuarios", soloAdmin, async (c) => {
  const fila = await c.env.DB.prepare(
    `SELECT id, nombres, apellidos, correo_electronico, rol, activo
       FROM buz_usuarios ORDER BY rol, apellidos`
  ).all();
  return ok(c, fila.results ?? []);
});
admin.post("/usuarios", soloAdmin, async (c) => {
  const cuerpo = await c.req.json().catch(() => ({}));
  const nombres = String(cuerpo?.nombres ?? "").trim();
  const apellidos = String(cuerpo?.apellidos ?? "").trim();
  const correo = String(cuerpo?.correo ?? "").trim().toLowerCase();
  const clave = String(cuerpo?.clave ?? "");
  const rol = String(cuerpo?.rol ?? "");
  exigir(nombres && apellidos, 400, "DATOS_INVALIDOS", "Nombres y apellidos son obligatorios.");
  exigir(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo), 400, "DATOS_INVALIDOS", "Correo no v\xE1lido.");
  exigir(clave.length >= 10, 400, "DATOS_INVALIDOS", "La clave debe tener al menos 10 caracteres.");
  exigir(["ADMIN_TECNICO", "COMITE"].includes(rol), 400, "DATOS_INVALIDOS", "Rol no v\xE1lido.");
  try {
    const creado = await c.env.DB.prepare(
      `INSERT INTO buz_usuarios (nombres, apellidos, correo_electronico, clave_hash, rol, activo)
       VALUES (?, ?, ?, ?, ?, 1) RETURNING id`
    ).bind(
      nombres,
      apellidos,
      correo,
      await hashClave(clave, iteracionesPbkdf2(c.env.PBKDF2_ITERACIONES)),
      rol
    ).first();
    await auditar(c.env, {
      usuarioId: c.get("local").uid,
      accion: "USUARIO_CREADO",
      entidad: "usuario",
      entidadId: Number(creado.id)
    });
    return ok(c, { id: Number(creado.id) }, null, 201);
  } catch {
    return fallo(c, "REGISTRO_DUPLICADO", "Ya existe una cuenta con ese correo.", 409);
  }
});
admin.patch("/usuarios/:id", soloAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  const cuerpo = await c.req.json().catch(() => ({}));
  const actual = await c.env.DB.prepare("SELECT * FROM buz_usuarios WHERE id = ?").bind(id).first();
  exigir(actual, 404, "NO_ENCONTRADO", "La cuenta no existe.");
  const nombres = cuerpo?.nombres === void 0 ? actual.nombres : String(cuerpo.nombres).trim();
  const apellidos = cuerpo?.apellidos === void 0 ? actual.apellidos : String(cuerpo.apellidos).trim();
  const rol = cuerpo?.rol === void 0 ? actual.rol : String(cuerpo.rol);
  const activo = cuerpo?.activo === void 0 ? actual.activo : cuerpo.activo ? 1 : 0;
  const clave = cuerpo?.clave ? String(cuerpo.clave) : null;
  exigir(["ADMIN_TECNICO", "COMITE"].includes(rol), 400, "DATOS_INVALIDOS", "Rol no v\xE1lido.");
  if (clave) exigir(clave.length >= 10, 400, "DATOS_INVALIDOS", "La clave debe tener al menos 10 caracteres.");
  const claveHash = clave ? await hashClave(clave, iteracionesPbkdf2(c.env.PBKDF2_ITERACIONES)) : actual.clave_hash;
  await c.env.DB.prepare(
    `UPDATE buz_usuarios
        SET nombres = ?, apellidos = ?, rol = ?, activo = ?, clave_hash = ?
      WHERE id = ?`
  ).bind(nombres, apellidos, rol, activo, claveHash, id).run();
  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "USUARIO_EDITADO",
    entidad: "usuario",
    entidadId: id
  });
  return ok(c, { actualizado: true });
});
admin.get("/parametros", soloAdmin, async (c) => {
  const fila = await c.env.DB.prepare("SELECT * FROM buz_parametros WHERE id = 1").first();
  return ok(c, fila);
});
admin.patch("/parametros", soloAdmin, async (c) => {
  const cuerpo = await c.req.json().catch(() => ({}));
  const actual = await c.env.DB.prepare("SELECT * FROM buz_parametros WHERE id = 1").first();
  const plazo = Number(cuerpo?.plazo_atencion_dias ?? actual?.plazo_atencion_dias ?? 5);
  const maxAdjuntos = Number(cuerpo?.max_adjuntos ?? actual?.max_adjuntos ?? 3);
  const maxMB = Number(cuerpo?.max_tamano_adjunto_mb ?? actual?.max_tamano_adjunto_mb ?? 2);
  exigir(plazo >= 1 && plazo <= 60, 400, "DATOS_INVALIDOS", "El plazo debe estar entre 1 y 60 d\xEDas.");
  exigir(maxAdjuntos >= 0 && maxAdjuntos <= 3, 400, "DATOS_INVALIDOS", "Los adjuntos deben ser entre 0 y 3.");
  exigir(maxMB >= 1 && maxMB <= 10, 400, "DATOS_INVALIDOS", "El tama\xF1o debe estar entre 1 y 10 MB.");
  await c.env.DB.prepare(
    `UPDATE buz_parametros
        SET plazo_atencion_dias = ?, max_adjuntos = ?, max_tamano_adjunto_mb = ?
      WHERE id = 1`
  ).bind(plazo, maxAdjuntos, maxMB).run();
  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "PARAMETROS_ACTUALIZADOS",
    entidad: "parametros",
    entidadId: 1
  });
  return ok(c, { actualizados: true });
});
admin.get("/auditoria", adminYComite, async (c) => {
  const pagina = Math.max(1, Number(c.req.query("pagina") ?? 1));
  const limite = Math.min(100, Math.max(1, Number(c.req.query("limite") ?? 50)));
  const [fila, total] = await Promise.all([
    c.env.DB.prepare(
      `SELECT a.id, a.accion, a.entidad, a.entidad_id, a.fecha_hora,
              a.usuario_id, a.persona_id,
              CASE WHEN a.usuario_id IS NOT NULL
                   THEN u.nombres || ' ' || u.apellidos
                   ELSE NULL END AS usuario
         FROM buz_auditoria a
         LEFT JOIN buz_usuarios u ON u.id = a.usuario_id
        ORDER BY a.id DESC LIMIT ? OFFSET ?`
    ).bind(limite, (pagina - 1) * limite).all(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM buz_auditoria").first()
  ]);
  return ok(c, {
    registros: fila.results ?? [],
    pagina,
    limite,
    total: Number(total?.n ?? 0)
  });
});
admin.get("/estadisticas", adminYComite, async (c) => {
  const [total, porEstado, porCategoria, porMes] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM buz_quejas").first(),
    c.env.DB.prepare("SELECT estado, COUNT(*) AS n FROM buz_quejas GROUP BY estado").all(),
    c.env.DB.prepare(
      `SELECT cat.nombre AS categoria, COUNT(*) AS n
         FROM buz_quejas q JOIN buz_categorias cat ON cat.id = q.categoria_id
        GROUP BY cat.id ORDER BY n DESC`
    ).all(),
    c.env.DB.prepare(
      `SELECT substr(fecha_envio, 1, 7) AS mes, COUNT(*) AS n
         FROM buz_quejas GROUP BY mes ORDER BY mes DESC LIMIT 12`
    ).all()
  ]);
  return ok(c, {
    total: Number(total?.n ?? 0),
    porEstado: porEstado.results ?? [],
    porCategoria: porCategoria.results ?? [],
    porMes: porMes.results ?? []
  });
});
admin.get("/evidencias", adminYComite, async (c) => {
  const pagina = Math.max(1, Number(c.req.query("pagina") ?? 1));
  const limite = Math.min(24, Math.max(1, Number(c.req.query("limite") ?? 12)));
  const [filas, total] = await Promise.all([
    c.env.DB.prepare(
      `SELECT a.id, a.queja_id, a.nombre_generico, a.tamano_bytes, a.tipo_mime,
              q.fecha_envio, q.estado, cat.nombre AS categoria
         FROM buz_adjuntos a
         JOIN buz_quejas q ON q.id = a.queja_id
         JOIN buz_categorias cat ON cat.id = q.categoria_id
        ORDER BY a.id DESC LIMIT ? OFFSET ?`
    ).bind(limite, (pagina - 1) * limite).all(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM buz_adjuntos").first()
  ]);
  return ok(c, {
    evidencias: filas.results ?? [],
    pagina,
    limite,
    total: Number(total?.n ?? 0)
  });
});
admin.get("/evidencia/:id", adminYComite, async (c) => {
  const id = Number(c.req.param("id"));
  exigir(Number.isFinite(id), 400, "DATOS_INVALIDOS", "Identificador no v\xE1lido.");
  const adjunto = await c.env.DB.prepare(
    "SELECT ruta_almacenamiento, nombre_generico, tipo_mime FROM buz_adjuntos WHERE id = ?"
  ).bind(id).first();
  exigir(adjunto, 404, "NO_ENCONTRADO", "La evidencia no existe.");
  const objeto = await leerAdjunto(c.env, adjunto.ruta_almacenamiento);
  exigir(objeto, 404, "NO_ENCONTRADO", "El archivo no est\xE1 disponible.");
  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "VER_EVIDENCIA",
    entidad: "adjunto",
    entidadId: id
  });
  return new Response(objeto.cuerpo, {
    headers: {
      "content-type": adjunto.tipo_mime,
      "content-disposition": `inline; filename="${adjunto.nombre_generico}"`,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
});
admin.get("/queja/:id", adminYComite, (c) => {
  return fallo(
    c,
    "SIN_PERMISO",
    "El administrador t\xE9cnico no puede ver el contenido de las quejas.",
    403
  );
});
var admin_default = admin;

// src/lib/imagen.ts
var TIPOS_PERMITIDOS = {
  "image/jpeg": "jpg",
  "image/png": "png"
};
function extensionPermitida(mime) {
  return TIPOS_PERMITIDOS[mime] ?? null;
}
__name(extensionPermitida, "extensionPermitida");
function firmaValida(bytes, mime) {
  if (bytes.length < 2) return false;
  if (mime === "image/jpeg") {
    return bytes[0] === 255 && bytes[1] === 216;
  }
  if (mime === "image/png") {
    if (bytes.length < 8) return false;
    return bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10;
  }
  return false;
}
__name(firmaValida, "firmaValida");
function concatenar(partes) {
  let total = 0;
  for (const parte of partes) total += parte.length;
  const salida = new Uint8Array(total);
  let offset = 0;
  for (const parte of partes) {
    salida.set(parte, offset);
    offset += parte.length;
  }
  return salida;
}
__name(concatenar, "concatenar");
var MARCAS_JPEG_CONSERVADAS = /* @__PURE__ */ new Set([224, 226, 238]);
function limpiarJpeg(origen) {
  const partes = [origen.subarray(0, 2)];
  let i = 2;
  while (i < origen.length) {
    if (origen[i] !== 255) {
      partes.push(origen.subarray(i));
      break;
    }
    const marca = origen[i + 1];
    if (marca === 1 || marca >= 208 && marca <= 216) {
      partes.push(origen.subarray(i, i + 2));
      i += 2;
      continue;
    }
    if (marca === 218) {
      partes.push(origen.subarray(i));
      break;
    }
    if (i + 4 > origen.length) {
      partes.push(origen.subarray(i));
      break;
    }
    const longitud = origen[i + 2] << 8 | origen[i + 3];
    if (longitud < 2 || i + 2 + longitud > origen.length) {
      partes.push(origen.subarray(i));
      break;
    }
    const esApp = marca >= 224 && marca <= 239;
    const descartar = marca === 254 || esApp && !MARCAS_JPEG_CONSERVADAS.has(marca);
    if (!descartar) partes.push(origen.subarray(i, i + 2 + longitud));
    i += 2 + longitud;
  }
  return concatenar(partes);
}
__name(limpiarJpeg, "limpiarJpeg");
var CHUNKS_PNG_DESCARTADOS = /* @__PURE__ */ new Set(["eXIf", "tEXt", "zTXt", "iTXt", "tIME", "iCCP"]);
function limpiarPng(origen) {
  const partes = [origen.subarray(0, 8)];
  const vista = new DataView(origen.buffer, origen.byteOffset, origen.byteLength);
  let i = 8;
  while (i + 12 <= origen.length) {
    const longitud = vista.getUint32(i);
    const fin = i + 12 + longitud;
    if (longitud > origen.length || fin > origen.length) break;
    const tipo = String.fromCharCode(
      origen[i + 4],
      origen[i + 5],
      origen[i + 6],
      origen[i + 7]
    );
    if (!CHUNKS_PNG_DESCARTADOS.has(tipo)) partes.push(origen.subarray(i, fin));
    i = fin;
    if (tipo === "IEND") break;
  }
  if (partes.length === 1) return origen;
  return concatenar(partes);
}
__name(limpiarPng, "limpiarPng");
function limpiarMetadatos(origen, mime) {
  if (!firmaValida(origen, mime)) {
    throw new Error("El archivo no corresponde al tipo declarado.");
  }
  const limpio = mime === "image/png" ? limpiarPng(origen) : limpiarJpeg(origen);
  if (!firmaValida(limpio, mime)) {
    throw new Error("No se pudo procesar la imagen.");
  }
  return limpio;
}
__name(limpiarMetadatos, "limpiarMetadatos");

// src/rutas/publico.ts
var publico = new Hono3();
publico.get("/estado", async (c) => {
  let db = false;
  try {
    await c.env.DB.prepare("SELECT 1").first();
    db = true;
  } catch {
    db = false;
  }
  return ok(c, { sistema: "buzon-incos", version: "1.0.0", baseDeDatos: db });
});
publico.get("/config", async (c) => {
  const [cats, cargos, p] = await Promise.all([
    c.env.DB.prepare(
      "SELECT id, nombre, descripcion FROM buz_categorias WHERE activa = 1 ORDER BY nombre"
    ).all(),
    cargosAutoridad(c.env).catch(() => []),
    parametros(c.env)
  ]);
  return ok(c, {
    entorno: c.env.ENTORNO ?? "produccion",
    turnstileSiteKey: c.env.TURNSTILE_SITE_KEY ?? "",
    maxAdjuntos: hayAlmacen(c.env) ? p.maxAdjuntos : 0,
    maxTamanoMB: p.maxMB,
    plazoAtencionDias: p.plazoDias,
    categorias: cats.results ?? [],
    cargos
  });
});
publico.post("/quejas", async (c) => {
  const largo = Number(c.req.header("content-length") ?? 0);
  exigir(largo < 16 * 1024 * 1024, 413, "ARCHIVO_GRANDE", "El env\xEDo supera el tama\xF1o permitido.");
  const limiteQuejas = Number(c.env.LIMITE_QUEJAS_HORA ?? 10) || 10;
  if (!await limitar(c, "queja", limiteQuejas, 3600)) {
    return fallo(c, "DEMASIADOS_ENVIOS", "Ha enviado varias quejas seguidas. Intente m\xE1s tarde.", 429);
  }
  let formulario;
  try {
    formulario = await c.req.formData();
  } catch {
    throw new HttpError(400, "SOLICITUD_INVALIDA", "Formato de env\xEDo no v\xE1lido.");
  }
  const categoriaId = Number(formulario.get("categoria_id") ?? 0);
  const descripcion = String(formulario.get("descripcion") ?? "").trim();
  const cargoInvolucradoRaw = String(formulario.get("cargo_involucrado_id") ?? "").trim();
  const captcha = String(formulario.get("turnstile_token") ?? "");
  if (!await verificarCaptcha(c, captcha)) {
    return fallo(c, "CAPTCHA_INVALIDO", "No se pudo verificar que sea una persona. Intente de nuevo.", 400);
  }
  exigir(categoriaId > 0, 400, "DATOS_INVALIDOS", "Seleccione una categor\xEDa.");
  exigir(
    descripcion.length >= 30,
    400,
    "DATOS_INVALIDOS",
    "La descripci\xF3n debe tener al menos 30 caracteres."
  );
  exigir(
    descripcion.length <= 6e3,
    400,
    "DATOS_INVALIDOS",
    "La descripci\xF3n es demasiado larga (m\xE1ximo 6000 caracteres)."
  );
  const categoria = await c.env.DB.prepare(
    "SELECT id FROM buz_categorias WHERE id = ? AND activa = 1"
  ).bind(categoriaId).first();
  exigir(categoria, 400, "DATOS_INVALIDOS", "La categor\xEDa seleccionada no est\xE1 disponible.");
  let cargoInvolucradoId = null;
  if (cargoInvolucradoRaw) {
    cargoInvolucradoId = Number(cargoInvolucradoRaw);
    const vigentes = await cargosAutoridad(c.env).catch(() => []);
    exigir(
      vigentes.some((a) => a.id === cargoInvolucradoId),
      400,
      "DATOS_INVALIDOS",
      "El cargo indicado no es v\xE1lido."
    );
  }
  const p = await parametros(c.env);
  const archivos = formulario.getAll("adjuntos").filter((v) => typeof v !== "string");
  exigir(
    archivos.length === 0 || hayAlmacen(c.env),
    503,
    "ADJUNTOS_NO_DISPONIBLES",
    "La evidencia no est\xE1 disponible en este momento. Puede enviar la queja sin archivos."
  );
  exigir(
    archivos.length <= p.maxAdjuntos,
    400,
    "DATOS_INVALIDOS",
    `Puede adjuntar como m\xE1ximo ${p.maxAdjuntos} archivos.`
  );
  const limpias = [];
  for (const archivo of archivos) {
    if (archivo.size === 0) continue;
    exigir(
      archivo.size <= p.maxMB * 1024 * 1024,
      400,
      "ARCHIVO_GRANDE",
      `Cada archivo debe pesar como m\xE1ximo ${p.maxMB} MB.`
    );
    const ext = extensionPermitida(archivo.type);
    exigir(ext, 400, "TIPO_NO_PERMITIDO", "Solo se aceptan im\xE1genes JPG o PNG.");
    const bytes = new Uint8Array(await archivo.arrayBuffer());
    let limpio;
    try {
      limpio = limpiarMetadatos(bytes, archivo.type);
    } catch {
      throw new HttpError(400, "ARCHIVO_INVALIDO", "Una de las im\xE1genes no se pudo procesar.");
    }
    limpias.push({ bytes: limpio, mime: archivo.type, ext, hash: await sha256Hex(limpio) });
  }
  const codigo = generarCodigo();
  const codigoHash = await hashCodigo(codigo);
  const fecha = hoyLaPaz();
  const limite = sumarDias(fecha, p.plazoDias);
  const creada = await c.env.DB.prepare(
    `INSERT INTO buz_quejas
       (codigo_hash, categoria_id, descripcion, cargo_involucrado_id, estado, fecha_envio, fecha_limite_atencion)
     VALUES (?, ?, ?, ?, 'PENDIENTE', ?, ?)
     RETURNING id`
  ).bind(codigoHash, categoriaId, descripcion, cargoInvolucradoId, fecha, limite).first();
  const quejaId = Number(creada.id);
  const guardadas = [];
  try {
    for (const archivo of limpias) {
      const ruta = `quejas/${quejaId}/${crypto.randomUUID()}.${archivo.ext}`;
      await guardarAdjunto(c.env, ruta, archivo.bytes, archivo.mime);
      guardadas.push(ruta);
      await c.env.DB.prepare(
        `INSERT INTO buz_adjuntos
           (queja_id, nombre_generico, ruta_almacenamiento, tamano_bytes, hash_sha256, tipo_mime)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(quejaId, `evidencia.${archivo.ext}`, ruta, archivo.bytes.length, archivo.hash, archivo.mime).run();
    }
    await derivarQueja(c.env, quejaId, categoriaId, cargoInvolucradoId);
  } catch {
    await c.env.DB.prepare("DELETE FROM buz_quejas WHERE id = ?").bind(quejaId).run();
    for (const ruta of guardadas) await borrarAdjunto(c.env, ruta);
    throw new HttpError(500, "ERROR_INTERNO", "No se pudo registrar la queja. Intente de nuevo.");
  }
  return ok(c, { codigo, fecha_envio: fecha }, null, 201);
});
publico.post("/consulta", async (c) => {
  if (!await limitar(c, "consulta", 30, 600)) {
    return fallo(c, "DEMASIADAS_SOLICITUDES", "Demasiados intentos. Espere unos minutos.", 429);
  }
  const cuerpo = await c.req.json().catch(() => ({}));
  const codigo = String(cuerpo?.codigo ?? "").trim();
  exigir(codigo.length >= 8, 400, "DATOS_INVALIDOS", "Ingrese su c\xF3digo de seguimiento.");
  const queja = await c.env.DB.prepare(
    `SELECT q.id, q.estado, q.descripcion, q.fecha_envio, q.fecha_limite_atencion,
            cat.nombre AS categoria
       FROM buz_quejas q
       JOIN buz_categorias cat ON cat.id = q.categoria_id
      WHERE q.codigo_hash = ?`
  ).bind(await hashCodigo(codigo)).first();
  exigir(queja, 404, "NO_ENCONTRADO", "No existe una queja con ese c\xF3digo.");
  const [derivacion, historial, mensajes] = await Promise.all([
    c.env.DB.prepare(
      `SELECT d.cargo_id, d.persona_id, d.motivo, d.fecha_hora, d.instancia_externa_texto,
              ca.cargo_nombre
         FROM buz_derivaciones d
         LEFT JOIN buz_cache_autoridades ca ON ca.cargo_id = d.cargo_id
        WHERE d.queja_id = ? AND d.activa = 1
        ORDER BY d.id DESC LIMIT 1`
    ).bind(queja.id).first(),
    c.env.DB.prepare(
      `SELECT estado_anterior, estado_nuevo, fecha_hora
         FROM buz_historial_estados WHERE queja_id = ? ORDER BY id`
    ).bind(queja.id).all(),
    c.env.DB.prepare(
      `SELECT id, autor, texto, fecha_hora
         FROM buz_mensajes WHERE queja_id = ? ORDER BY id`
    ).bind(queja.id).all()
  ]);
  await c.env.DB.prepare(
    "UPDATE buz_mensajes SET leido = 1 WHERE queja_id = ? AND autor = 'AUTORIDAD' AND leido = 0"
  ).bind(queja.id).run();
  return ok(c, {
    estado: queja.estado,
    categoria: queja.categoria,
    descripcion: queja.descripcion,
    fecha_envio: queja.fecha_envio,
    fecha_limite_atencion: queja.fecha_limite_atencion,
    derivada_a: derivacion ? derivacion.cargo_nombre ?? derivacion.instancia_externa_texto ?? "Instancia interna" : "Sin asignar",
    historial: historial.results ?? [],
    mensajes: mensajes.results ?? []
  });
});
publico.post("/consulta/mensaje", async (c) => {
  if (!await limitar(c, "mensaje", 20, 3600)) {
    return fallo(c, "DEMASIADOS_ENVIOS", "Demasiados mensajes. Intente m\xE1s tarde.", 429);
  }
  const cuerpo = await c.req.json().catch(() => ({}));
  const codigo = String(cuerpo?.codigo ?? "").trim();
  const texto = String(cuerpo?.texto ?? "").trim();
  exigir(codigo.length >= 8, 400, "DATOS_INVALIDOS", "Ingrese su c\xF3digo de seguimiento.");
  exigir(texto.length >= 1 && texto.length <= 4e3, 400, "DATOS_INVALIDOS", "Escriba un mensaje v\xE1lido.");
  const queja = await c.env.DB.prepare(
    "SELECT id, estado FROM buz_quejas WHERE codigo_hash = ?"
  ).bind(await hashCodigo(codigo)).first();
  exigir(queja, 404, "NO_ENCONTRADO", "No existe una queja con ese c\xF3digo.");
  exigir(queja.estado !== "CERRADA", 409, "QUEJA_CERRADA", "Esta queja ya fue cerrada.");
  await c.env.DB.prepare(
    `INSERT INTO buz_mensajes (queja_id, autor, texto, fecha_hora, leido)
     VALUES (?, 'DENUNCIANTE', ?, ?, 0)`
  ).bind(queja.id, texto, (/* @__PURE__ */ new Date()).toISOString()).run();
  return ok(c, { registrado: true }, null, 201);
});
var publico_default = publico;

// src/index.ts
var app = new Hono3();
app.use("/api/*", async (c, next) => {
  await next();
  c.header("cache-control", "no-store");
  c.header("x-content-type-options", "nosniff");
  c.header("referrer-policy", "no-referrer");
  c.header("x-frame-options", "DENY");
});
app.route("/api", publico_default);
app.route("/api/auth", auth_default);
app.route("/api/autoridad", autoridad_default);
app.route("/api/admin", admin_default);
app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json(
      {
        exito: false,
        datos: null,
        meta: null,
        error: { codigo: "RUTA_NO_ENCONTRADA", mensaje: "Recurso no encontrado." }
      },
      404
    );
  }
  return c.text("No encontrado", 404);
});
app.onError((error3, c) => {
  if (error3 instanceof HttpError) {
    return c.json(
      {
        exito: false,
        datos: null,
        meta: null,
        error: { codigo: error3.codigo, mensaje: error3.message }
      },
      error3.status
    );
  }
  console.error("ERROR_INTERNO", error3 instanceof Error ? error3.name : "desconocido");
  return c.json(
    {
      exito: false,
      datos: null,
      meta: null,
      error: { codigo: "ERROR_INTERNO", mensaje: "Ocurri\xF3 un error inesperado." }
    },
    500
  );
});
var src_default = {
  fetch: app.fetch,
  /** Cron diario: escala las quejas cuyo plazo de atención venció. */
  async scheduled(_evento, env2, ctx) {
    ctx.waitUntil(escalarVencidas(env2));
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    const body = JSON.stringify(error3);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-0iGnfO/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-0iGnfO/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
