import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const s3Client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const s3AvatarStorage = multerS3({
  s3: s3Client,
  bucket: "mytube-wetube-fly-2024-update",
  acl: "public-read",
  key: function (req, file, cb) {
    cb(null, `avatars/${req.session.user._id}/${Date.now().toString()}`);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
});
const s3VideoStorage = multerS3({
  s3: s3Client,
  bucket: "mytube-wetube-fly-2024-update",
  acl: "public-read",
  key: function (req, file, cb) {
    cb(null, `videos/${req.session.user._id}/${Date.now().toString()}`);
  },
  contentType: function (req, file, cb) {
    cb(null, file.mimetype); // 동영상 파일의 MIME 타입을 설정
  },
});
export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user || {};
  res.locals.siteName = "MyTube";
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  limits: {
    fileSize: 3000000,
  },
  storage: s3AvatarStorage,
});

export const videoUpload = multer({
  limits: {
    fileSize: 10000000,
  },
  storage: s3VideoStorage,
});
