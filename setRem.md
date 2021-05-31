
(function () {
  document.body.style.fontSize = '14px'
  const setRem = () => {
    let vw = document.documentElement.clientWidth
    document.documentElement.style.fontSize = vw / 7.5 + 'px'
  }
  setRem()
  window.onresize = setRem
}())
