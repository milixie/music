function toast(params) {
  const that = getCurrentPages()[getCurrentPages().length - 1];
  setTimeout(() => {
    that.setData({
      toast: {
        show: false,
      }
    });
  }, params.duration || 2000);
  that.setData({
    toast: {
      show: params.show,
      content: params.content
    }
  })
}

module.exports = {
  toast
};