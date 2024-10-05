import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");

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
      fileUrl: video[0].location,
      thumbUrl: thumb[0].location,
      hashtags: Video.formatHashtags(hashtags),
      owner: _id,
    });

    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    await user.save();

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
  await user.save();
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

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);
  const userinfo = await User.findById(user._id);

  if (!video || !userinfo) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });

  video.comments.push(comment._id);
  await video.save();

  userinfo.comments.push(comment._id);
  await userinfo.save();

  return res.status(201).json({ newCommentId: comment._id });
};

export const DeleteComment = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    params: { commentId },
  } = req;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).send("Comment not found");
  }

  if (String(comment.owner) !== String(_id)) {
    return res.render("watch", {
      errorMessage: "You are not the owner of this comment.",
    });
  }

  try {
    // 비디오에서 댓글 ID를 제거
    await Video.findByIdAndUpdate(comment.video, {
      $pull: { comments: commentId },
    });

    // 유저에서 댓글 ID를 제거
    await User.findByIdAndUpdate(comment.owner, {
      $pull: { comments: commentId },
    });

    // 댓글 삭제
    await Comment.findByIdAndDelete(commentId);

    return res.status(204).send();
  } catch {
    return res.render("watch", { errorMessage: "Cannot delete comment" });
  }
};
