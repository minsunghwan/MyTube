import Video from "../models/Video";
import User from "../models/User";

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");

  console.log(video);

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video Not Found" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;

  const { video, thumb } = req.files;
  const { title, hashtags, description } = req.body;

  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      hashtags: Video.formatHashtags(hashtags),
      owner: _id,
    });

    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();

    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
export const deleteVideo = async (req, res) => {
  const { id } = req.params;

  const {
    user: { _id },
  } = req.session;

  const video = await Video.findById(id);
  const user = await User.findById(_id);

  if (!video) {
    return res.render("404", { pageTitle: "Video Not Found" });
  }

  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndDelete(id);
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();
  return res.redirect("/");
};
export const getEdit = async (req, res) => {
  const { id } = req.params;

  const {
    user: { _id },
  } = req.session;

  const video = await Video.findById(id);

  if (!video) {
    return res.render("404", { pageTitle: "Video Not Found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Editing ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;

  const { title, description, hashtags } = req.body;

  const {
    user: { _id },
  } = req.session;

  const video = await Video.findOne({ _id: id });

  if (!video) {
    return res.render("404", { pageTitle: "Video Not Found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  return res.redirect(`/videos/${id}`);
};
export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];

  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    });
    return res.render("search", { pageTitle: "Search", videos });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
