import User from "../models/User";
import bcrypt from "bcrypt";

export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const pageTitle = "Login";
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });

  //login-username 존재 확인
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }

  //login username의 pssword 확인
  const exists = await bcrypt.compare(password, user.password);
  if (!exists) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password.",
    });
  }

  //login session에 정보 유지
  req.session.loggedIn = true;
  req.session.user = user;

  console.log(req.session.user);

  res.redirect("/");
};

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};
export const postJoin = async (req, res) => {
  const pageTitle = "Join";
  const { name, username, email, password, confirmPassword, location } =
    req.body;

  //join - 비밀번호 확인
  if (password !== confirmPassword) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }

  //join - 동시 중복 확인
  const exists = await User.exists({ $or: [{ username }, { email }] });

  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email already taken.",
    });
  }

  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  const existingUser = await User.findOne({
    _id: { $ne: _id },
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    let errorMessage = "";
    if (existingUser.email === email) {
      errorMessage = "This email is already taken,";
    } else if (existingUser.username === username) {
      errorMessage = "This username is already taken,";
    }
    return res.render("edit-profile", {
      pageTitle: "Edit profile",
      errorMessage,
    });
  }

  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name: name,
      email: email,
      username: username,
      location: location,
    },
    { new: true }
  );

  req.session.user = updateUser;

  return res.redirect("/users/edit");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };

  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  try {
    const tokenRequest = await (
      await fetch(finalUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      })
    ).json();

    if ("access_token" in tokenRequest) {
      const { access_token } = tokenRequest;
      const apiUrl = "https://api.github.com";
      const userData = await (
        await fetch(`${apiUrl}/user`, {
          headers: {
            Authorization: `token ${access_token}`,
          },
        })
      ).json();

      const emailData = await (
        await fetch(`${apiUrl}/user/emails`, {
          headers: {
            Authorization: `token ${access_token}`,
          },
        })
      ).json();

      const emailObj = emailData.find(
        (email) => email.primary === true && email.verified === true
      );

      if (!emailObj) {
        return res.redirect("/login");
      }

      let user = await User.findOne({ email: emailObj.email });

      if (!user) {
        user = await User.create({
          avatarUrl: userData.avatar_url,
          username: userData.login,
          name: userData.name ? userData.name : userData.login,
          email: emailObj.email,
          password: "",
          location: userData.location ? userData.location : "Base Location",
          socialOnly: true,
        });
      }

      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/");
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    console.error("Error fetching token:", error);
  }
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    res.redirect("/");
  }
  return res.render("change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }

  const user = await User.findById(_id);

  const confirm = await bcrypt.compare(oldPassword, user.password);

  if (!confirm) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }

  user.password = newPassword;
  await user.save();

  return res.redirect("/logout");
};
