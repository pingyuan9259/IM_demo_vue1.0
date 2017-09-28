import moment from 'moment'

export default (value, format) => {
  if (!value) {
    throw new Error('filter dateFormat is lack of Value!')
  }
  if (!format) {
    return value
  }
  return moment(value).format(format)
}
