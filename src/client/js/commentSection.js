const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll(".video__comment-delete");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  const spanBtn = document.createElement("span");
  span.innerText = ` ${text}`;
  spanBtn.innerText = "❌";
  spanBtn.dataset.id = id;
  spanBtn.addEventListener("click", handleDeleteComment);

  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(spanBtn);
  videoComments.prepend(newComment);
};

const handleDeleteComment = async (event) => {
  const deleteBtn = event.currentTarget;

  const commentId = deleteBtn.dataset.id;

  const commentElement = deleteBtn.closest(".video__comment");

  const response = await fetch(`/api/comments/${commentId}/delete`, {
    method: "DELETE",
  });

  if (response.status === 204) {
    commentElement.remove();
  }
};
const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;

  if (text.trim() === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();

    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (deleteBtns) {
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", handleDeleteComment);
  });
}
