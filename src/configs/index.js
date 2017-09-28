import cookie from '../utils/cookie'

// env
let loc = window.location
let host = loc.host
let ENV = ''

const APP_XSDX = '56c6c309243cb728205a3dff'
const APP_FK = '56971892243cb728205a20df'
let APP_ID = ''

if (loc.href.indexOf('sudoboot') !== -1) {
  APP_ID = APP_FK
} else if (loc.href.indexOf('xinshengdaxue') !== -1 || loc.href.indexOf('tinfinite') !== -1) {
  APP_ID = APP_XSDX
}

let hasDev = host.indexOf('dev') !== -1
let hasPre = host.indexOf('pre') !== -1
let hasPort = !!host.port

let environment = 'pro'
if (hasDev) {
  environment = 'dev'
} else if (hasPre) {
  environment = 'pre'
}
if (hasPort) { // 有端口，肯定本地
  ENV = environment + '-local'
} else {       // 无端口，线上
  ENV = environment
}

// top level hostname
let topHostMatch = loc.hostname.match(/\.([^\.]+\.com)$/)
let TOP_LEVEL_HOST = topHostMatch && topHostMatch[1]

let isDev = ENV.indexOf('dev') !== -1
let isPre = ENV.indexOf('pre') !== -1
let isPro = ENV.indexOf('pro') !== -1
let domain = ''
if (isDev) {
  domain = 'dev'
} else if (isPre) {
  domain = 'pre'
}
// uri prefix
let URI_PREFIX = isPro ? '//api-saas.tinfinite.com' : '//api-saas' + '-' + domain + '.tinfinite.com'

// uri socket
let SOCKET_URI = isPro ? '//im-saas.tinfinite.com' : '//im-saas' + '-' + domain + '.tinfinite.com'

// storage for userInfo (include app_id, avatar, device_id, fullname, token, user_id)
const USER_INFO_KEY = isPro ? 'user_info' : 'user_info' + '_' + domain

// storage & cookie for deviceId
const DEVICE_ID_KEY = isPro ? '_device_id' : '_device_id' + '_' + domain

// cookie for token key
const APP_TOKEN_KEY = isPro ? '_app_token' : '_app_token' + '_' + domain

// cookie for urserId key
const APP_USERID_KEY = isPro ? '_app_userid' : '_app_userid' + '_' + domain

// cookie for token
let TOKEN = cookie.getCookie(APP_TOKEN_KEY) || ''

// 消息每次加载数
const MESSAGES_LIMIT = 70

// 群成员每次加载数
const USERS_LIMIT = 70

// default group's avatar
const DEFAULT_PERSON_AVATAR = '//o3pvuu23u.qnssl.com/image/default_group.png'

// default personal avatar
const DEFAULT_GROUP_AVATAR = '//o3pvuu23u.qnssl.com/img/default_avatar.png'

export {
  URI_PREFIX,
  TOKEN,
  ENV,
  DEVICE_ID_KEY,
  USER_INFO_KEY,
  APP_TOKEN_KEY,
  APP_USERID_KEY,
  MESSAGES_LIMIT,
  SOCKET_URI,
  USERS_LIMIT,
  DEFAULT_PERSON_AVATAR,
  DEFAULT_GROUP_AVATAR,
  TOP_LEVEL_HOST,
  APP_ID
}
