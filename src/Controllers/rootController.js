export const home = (req, res) => {
  return res.render("home", { pageTitle: "Home" });
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
