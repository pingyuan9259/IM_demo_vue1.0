import { set } from 'vue'
import * as T from '../mutation-types'
import array from 'lodash/array'

// initial state
const state = {
  userDetail: {},
  usersInfoStorage: [],
  membersOfSearch: {},
  membersOfChannel: {}
}

// mutations
const mutations = {

  [T.GET_USER_INFO] (state, data) {
    state.usersInfoStorage = array.concat(state.usersInfoStorage, data)
  },

  [T.GET_MEMBERS_OF_CHANNEL] (state, channelId, users) {
    if (!users) {
      return
    }
    set(state.membersOfChannel, channelId, users)
  },

  [T.SEARCH_MEMBERS_OF_CHANNEL] (state, channelId, users) {
    if (!users) {
      return
    }
    set(state.membersOfSearch, channelId, users)
  },

  [T.GET_USER_DETAIL] (state, userDetail) {
    set(state.userDetail, userDetail.id, userDetail)
  }
}

export default {
  state,
  mutations
}
