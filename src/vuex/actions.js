import channelActions from './actions/channel'
import globalsActions from './actions/globals'
import loginActions from './actions/login'
import messageActions from './actions/message'
import userActions from './actions/user'
import postActions from './actions/post'
import liveActions from './actions/live'

// post
export const getPostsByChannelId = postActions.getPostsByChannelId
export const getAllPosts = postActions.getAllPosts
export const getSearchPosts = postActions.getSearchPosts
export const clearPostsByChannelId = postActions.clearPostsByChannelId
export const clearPostsOfSearch = postActions.clearPostsOfSearch
export const getPostsByPersonId = postActions.getPostsByPersonId
export const clearPostsOfPerson = postActions.clearPostsOfPerson
export const openPostList = postActions.openPostList

// channel
export const getChannels = channelActions.getChannels
export const switchChannel = channelActions.switchChannel
export const singleChat = channelActions.singleChat
export const getChannelMembersCount = channelActions.getChannelMembersCount
export const setSeqOfChannel = channelActions.setSeqOfChannel
export const getRoleInfoOfChannels = channelActions.getRoleInfoOfChannels
export const getFriendStatus = channelActions.getFriendStatus
export const destoryFriendStatus = channelActions.destoryFriendStatus
export const setChannelForbiddenNow = channelActions.setChannelForbiddenNow

// message
export const getMessages = messageActions.getMessages
export const sendMessage = messageActions.sendMessage
export const getCurMessage = messageActions.getCurMessage
export const clearMessages = messageActions.clearMessages
export const changeRenderMessageSource = messageActions.changeRenderMessageSource

// login
export const getQr = loginActions.getQr
export const getIdentifyingCode = loginActions.getIdentifyingCode
export const getVoice = loginActions.getVoice
export const checkClientSubmitLogin = loginActions.checkClientSubmitLogin
export const loginSuccess = loginActions.loginSuccess
export const phoneLogin = loginActions.phoneLogin

// globals
export const socketInit = globalsActions.socketInit
export const getDeviceId = globalsActions.getDeviceId
export const deleteDeviceId = globalsActions.deleteDeviceId
export const saveUserInfo = globalsActions.saveUserInfo
export const socketListener = globalsActions.socketListener

// user
export const getUserInfoByIds = userActions.getUserInfoByIds
export const getUsersOfChannel = userActions.getUsersOfChannel
export const searchUsersOfChannel = userActions.searchUsersOfChannel
export const getUserDetail = userActions.getUserDetail

// live
export const openLive = liveActions.openLive
export const closeLive = liveActions.closeLive
export const toggleLive = liveActions.toggleLive
export const toggleMic = liveActions.toggleMic
export const sendFile = liveActions.sendFile
export const toggleCanChat = liveActions.toggleCanChat
export const toggleBlackBoard = liveActions.toggleBlackBoard
export const sendMesToBlackBoard = liveActions.sendMesToBlackBoard

