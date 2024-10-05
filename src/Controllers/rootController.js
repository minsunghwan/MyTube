import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");

  console.log(videos);
  return res.render("home", { pageTitle: "Home", videos });
};
