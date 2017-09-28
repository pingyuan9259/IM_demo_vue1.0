// 这里主要方便统一查询，要求key 和 value 必须一致
const GET_DEVICE_ID = 'GET_DEVICE_ID'                         // 获取 device id
const GET_CHANNELS = 'GET_CHANNELS'                           // 获取聊天列表（包含单聊和群聊）
const SET_CUR_CHANNEL = 'SWITCH_CHANNEL'                      // 切换会话
const GET_QR = 'GET_QR'                                       // 获取登录 qr
const GET_IDENTIFYING_CODE = 'GET_IDENTIFYING_CODE'           // 获取登录验证码 key
const GET_VOICE = 'GET_VOICE'                                 // 获取语音验证码
const CHECK_CLIENT_SUBMIT_LOGIN = 'CHECK_CLIENT_SUBMIT_LOGIN' // 检查客户端是否确认扫码登录
const DELETE_DEVICE_ID = 'DELETE_DEVICE_ID'                   // 清除已存储的 device id
const SAVE_USER_INFO = 'SAVE_USER_INFO'                       // 存储登录用户个人信息
const LOGIN_SUCCESS = 'LOGIN_SUCCESS'                         // 登录成功，进入系统
const GET_MESSAGES = 'GET_MESSAGES'                           // M10003：取得指定大于 seq 的 limit 条消息
const SEND_TEXT_MESSAGE = 'SEND_TEXT_MESSAGE'                 // 发送文本信息
const GET_USER_INFO = 'GET_USER_INFO'                         // 根据用户ids获取用户信息
const GET_CUR_MESSAGE = 'GET_CUR_MESSAGE'                     // 获取当前 channel 的 message
const CLEAR_MESSAGES = 'CLEAR_MESSAGES'                       // 清空数据 messages 数据
const UPDATE_LAST_CUR_MESSAGE = 'UPDATE_LAST_CUR_MESSAGE'     // 接受聊天数据
const GET_LAST_MESSAGE_OF_CHANNELS = 'GET_LAST_MESSAGE_OF_CHANNELS'  // 获取所有频道的最后一条消息
const UPDATE_CHANNELS_MESSAGE_NUM = 'UPDATE_CHANNELS_MESSAGE_NUM'    // 更新频道数据字段中的 message_number
const GET_MEMBERS_OF_CHANNEL = 'GET_MEMBERS_OF_CHANNEL'       // 获取群成员
const SEARCH_MEMBERS_OF_CHANNEL = 'SEARCH_MEMBERS_OF_CHANNEL' // 搜索群成员
const GET_USER_DETAIL = 'GET_USER_DETAIL'                     // 获取用户的详细信息
const SINGLE_CHAT = 'SINGLE_CHAT'                             // 创建单聊
const GET_CHANNEL_MEMBERS_COUNT = 'GET_CHANNEL_MEMBERS_COUNT' // 获取群组人数
const SET_SEQ_OF_CHANNEL = 'SET_SEQ_OF_CHANNEL'               // 同步本channel最后阅读消息seq
const UPDATE_CHANNELS_UNREAD = 'UPDATE_CHANNELS_UNREAD'       // 更新未读数
const SET_CHAT_FORBBIDEN = 'SET_CHAT_FORBBIDEN'               // 设置全体禁言
const GET_ROLE_INFO_OF_CHANNELS = 'GET_ROLE_INFO_OF_CHANNELS' // 取得群角色信息
const OPEN_LIVE = 'OPEN_LIVE'                                 // 开启直播
const CLOSE_LIVE = 'CLOSE_LIVE'                               // 关闭直播
const SEND_BLACK_BOARD = 'SEND_BLACK_BOARD'                   // 给小黑板发送消息
const PUT_IN_MESSAGE_ID = 'PUT_IN_MESSAGE_ID'                 // 补充ID
const CHANGE_CHANNEL_INDEX = 'CHANGE_CHANNEL_INDEX'           // 调整channel索引
const CHANNEL_INDEX_ACTIVE = 'CHANNEL_INDEX_ACTIVE'
const TOGGLE_CHANNEL_SEND = 'TOGGLE_CHANNEL_SEND'             // 标记当前是在发送消息
const GET_FRIEND_STATUS = 'GET_FRIEND_STATUS'                 // 获取单聊用户是否为好友
const DESTORY_FRIEND_STATUS = 'DESTORY_FRIEND_STATUS'         // 初始化好友关系变量状态
const ADD_NEW_CHANNEL = 'ADD_NEW_CHANNEL'                     // 增加新的channel
const UPDATE_CHANNEL_LAST_MESSAGE = 'UPDATE_CHANNEL_LAST_MESSAGE' // 更新 channels 中的 lastMessage & lastMessageCreatedAt
const GET_CHANNEL_POSTS = 'GET_CHANNEL_POSTS'                 // 获取群文章
const GET_ALL_POSTS = 'GET_ALL_POSTS'                         // 获取所有文章
const GET_PERSON_POSTS = 'GET_PERSON_POSTS'                   // 获取个人文章
const SEARCH_POSTS = 'SEARCH_POSTS'                           // 搜索所有文章
const CLEAR_POSTS_SEARCH = 'CLEAR_POSTS_SEARCH'               // 清空当前群文章
const CLEAR_POSTS_CHANNEL = 'CLEAR_POSTS_CHANNEL'             // 清空搜索的文章
const OPEN_POST_LIST_STATUS = 'OPEN_POST_LIST_STATUS'         // 获取在关闭postlist以后，再次打开时这个打开的状态
const CLEAR_POSTS_PERSON = 'CLEAR_POSTS_PERSON'
const CHANGE_RENDER_MESSAGE_SOURCE = 'CHANGE_RENDER_MESSAGE_SOURCE' // 修改渲染消息的来源
const TOGGLE_MIC = 'TOGGLE_MIC'                               // 关闭打开麦克风
const TOGGLE_BLACKBOARD = 'TOGGLE_BLACKBOARD'                 // 关闭打开小黑板
const UPDATE_CHANNEL_MIC_STATUS = 'UPDATE_CHANNEL_MIC_STATUS' // 更新 channel 麦克风状态
const END_GET_CHANNELS = 'END_GET_CHANNELS'                   // C10008 接口终止时
const CHANGE_ROLE_INFO_OF_CHANNELS = 'CHANGE_ROLE_INFO_OF_CHANNELS' // 更新群中的角色信息
const REST_CUR_CHANNEL_FROM = 'REST_CUR_CHANNEL_FROM'
const SAVE_IMAGE_TEXT_MESSAGE = 'SAVE_IMAGE_TEXT_MESSAGE'     // 存储图文消息
const PUT_IMAGE_TEXT_MESSAGE_IN_LAST_MESSAGE = 'PUT_IMAGE_TEXT_MESSAGE_IN_LAST_MESSAGE' // 将图文消息整合入最后一条消息中
const DELETE_REVOKE_MESSAGE = 'DELETE_REVOKE_MESSAGE'         // 删除撤回某条消息
const SORT_CHANNELS_INDEX = 'SORT_CHANNELS_INDEX'             // 重新排序 channels
const GET_CHANNELS_PR = 'GET_CHANNELS_PR'                     // 获取所有 channels 的群主管理员角色权限
const SET_CHAT_FORBBIDEN_NOW = 'SET_CHAT_FORBBIDEN_NOW'

export {
  GET_QR,
  LOGIN_SUCCESS,
  GET_DEVICE_ID,
  GET_IDENTIFYING_CODE,
  GET_VOICE,
  DELETE_DEVICE_ID,
  GET_CHANNELS,
  SET_CUR_CHANNEL,
  SAVE_USER_INFO,
  CHECK_CLIENT_SUBMIT_LOGIN,
  GET_MESSAGES,
  SEND_TEXT_MESSAGE,
  GET_USER_INFO,
  GET_CUR_MESSAGE,
  CLEAR_MESSAGES,
  UPDATE_LAST_CUR_MESSAGE,
  GET_LAST_MESSAGE_OF_CHANNELS,
  UPDATE_CHANNELS_MESSAGE_NUM,
  GET_MEMBERS_OF_CHANNEL,
  SEARCH_MEMBERS_OF_CHANNEL,
  GET_USER_DETAIL,
  SINGLE_CHAT,
  GET_CHANNEL_MEMBERS_COUNT,
  SET_SEQ_OF_CHANNEL,
  UPDATE_CHANNELS_UNREAD,
  SET_CHAT_FORBBIDEN,
  GET_ROLE_INFO_OF_CHANNELS,
  OPEN_LIVE,
  CLOSE_LIVE,
  SEND_BLACK_BOARD,
  PUT_IN_MESSAGE_ID,
  CHANGE_CHANNEL_INDEX,
  CHANNEL_INDEX_ACTIVE,
  TOGGLE_CHANNEL_SEND,
  GET_FRIEND_STATUS,
  DESTORY_FRIEND_STATUS,
  ADD_NEW_CHANNEL,
  UPDATE_CHANNEL_LAST_MESSAGE,
  GET_CHANNEL_POSTS,
  GET_ALL_POSTS,
  SEARCH_POSTS,
  CLEAR_POSTS_SEARCH,
  CLEAR_POSTS_CHANNEL,
  GET_PERSON_POSTS,
  OPEN_POST_LIST_STATUS,
  CLEAR_POSTS_PERSON,
  CHANGE_RENDER_MESSAGE_SOURCE,
  TOGGLE_MIC,
  TOGGLE_BLACKBOARD,
  UPDATE_CHANNEL_MIC_STATUS,
  END_GET_CHANNELS,
  CHANGE_ROLE_INFO_OF_CHANNELS,
  REST_CUR_CHANNEL_FROM,
  SAVE_IMAGE_TEXT_MESSAGE,
  PUT_IMAGE_TEXT_MESSAGE_IN_LAST_MESSAGE,
  DELETE_REVOKE_MESSAGE,
  SORT_CHANNELS_INDEX,
  GET_CHANNELS_PR,
  SET_CHAT_FORBBIDEN_NOW
}
