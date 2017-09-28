'use strict'

import io from 'socket.io-client'
import log from './logger.js'

let voidCrash = (fn) => { // void error: Maximum call stack size exceeded
  fn && setTimeout(fn, 0)
}

class Socket {

  constructor () {
    this._io = null
    this._inited = false
    this._timer = 10

    this._startEmitTime = ''
  }

  _logEmit (event, params, callback) {
    let noPing = event !== 'ping'
    let self = this
    let timeIndex = 0
    let t = 0

    if (noPing) {
      log.groupStart('Socket Emit', false).print('event:', event).print('params:', params)
      this._startEmitTime = window.performance && window.performance.now()

      t = setInterval(() => {
        var time = ((window.performance.now() - self._startEmitTime) / 1e3)
        if (time > 1) {
          log.print('pendding:', `${++timeIndex}s`)
        }
        if (time > self._timer) {
          log.print('pendding:', 'emit超时，请检查uri是否正确, 或者直接联系后端~').groupEnd()
          clearInterval(t)
        }
      }, 1000)
    }

    return (data) => {
      if (noPing) {
        clearInterval(t)
        log.print('result:', data)
        window.performance && log.print('time(s):', (window.performance.now() - self._startEmitTime) / 1e3).groupEnd()
      }
      callback && callback(data)
    }
  }

  _onReconncet (num) {
    log.error('Socket Reconnect:', num)
  }

  _onConnected (callback) {
    callback && callback()
    log.success('Socket Connect Success!', '')
  }

  _onError (err) {
    log.error('Socket Connect Error:', err)
  }

  init (options, callback) {
    if (this._inited) {
      return
      // throw new Error('socket has been initialized')
    }

    let version = 'v=2'
    let userId = `user_id=${options.userId}`
    let deviceId = `device_id=${options.deviceId}`
    let token = `token=${encodeURIComponent(options.token)}`
    let params = {query: `${version}&${userId}&${deviceId}&${token}`}

    this._io = io(options.uri, {transports: ['websocket'], path: '/v3/socket.io/', query: params.query}).connect()

    log.group('Socket Connect Init', options, [], false)

    this._io.on('connect', () => this._onConnected(callback))
    this._io.on('error', this._onError)
    this._io.on('reconnect', this._onReconncet)
    this._inited = true

    this._io.on('ping', (data) => { // 心跳包
      voidCrash(() => this.emit('ping', data, () => {}))
    })
  }

  on (event, callback) {
    this._io.on(event, callback)
  }

  emit (event, params = null, callback) {
    if (!event) {
      return log.error('Socket Emit Event is missing!')
    }

    let cb = this._logEmit(event, params, callback)
    this._io.emit(event, params, cb)
  }

  disconnect () {
    this._io && this._io.on('disconnect')
    log.print('Socket Disconnect.')
  }
}

let socket = new Socket()
export default socket
