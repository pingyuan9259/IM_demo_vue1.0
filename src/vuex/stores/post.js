import * as T from '../mutation-types'
import array from 'lodash/array'

// initial state
const state = {
  channelPosts: [],
  channelPagination: {},

  allPosts: [],
  allPagination: {},

  searchPosts: [],
  searchPagination: {},

  personPosts: [],
  personPagination: {},

  openPostStatus: 0
}

// mutations
const mutations = {

  [T.GET_CHANNEL_POSTS] (state, data) {
    state.channelPosts = array.concat(state.channelPosts, data.data)
    state.channelPagination = data.pagination
  },

  [T.GET_ALL_POSTS] (state, data) {
    state.allPosts = array.concat(state.allPosts, data.data)
    state.allPagination = data.pagination
  },

  [T.GET_PERSON_POSTS] (state, data) {
    state.personPosts = array.concat(state.personPosts, data.data)
    state.personPagination = data.pagination
  },

  [T.SEARCH_POSTS] (state, data) {
    state.searchPosts = array.concat(state.searchPosts, data.data)
    state.searchPagination = data.pagination
  },

  [T.CLEAR_POSTS_SEARCH] (state) {
    state.searchPosts = []
    state.searchPagination = {}
  },

  [T.CLEAR_POSTS_CHANNEL] (state) {
    state.channelPosts = []
    state.channelPagination = {}
  },

  [T.CLEAR_POSTS_PERSON] (state) {
    state.personPosts = []
    state.personPagination = {}
  },

  [T.OPEN_POST_LIST_STATUS] (state) {
    state.openPostStatus++
  }
}

export default {
  state,
  mutations
}
