export function logoutUser() {
  localStorage.removeItem("bgs_token");
  localStorage.removeItem("bgs_user");

  sessionStorage.removeItem("bgs_token");
  sessionStorage.removeItem("bgs_user");
}