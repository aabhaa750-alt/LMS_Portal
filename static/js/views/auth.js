// Authentication Views (Disabled - Open Direct LMS Access)
const AuthView = {
  render() {
    window.location.hash = '#dashboard';
    return '';
  },
  renderLogin() {
    window.location.hash = '#dashboard';
    return '';
  },
  renderRegister() {
    window.location.hash = '#dashboard';
    return '';
  },
  bindLoginEvents() {},
  bindRegisterEvents() {},
};
