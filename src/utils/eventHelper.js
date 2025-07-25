
export function throttle(func, wait, options) {
  let context
  let args
  let result
  let timeout = null
  var previous = 0
  if (!options) options = {}
  let later = function () {
    previous = options.leading === false ? 0 : (new Date()).getTime()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }

  return function () {
    var now = (new Date()).getTime()
    if (!previous && options.leading === false) previous = now
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      clearTimeout(timeout)
      timeout = null
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}