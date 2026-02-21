import { arrayMove } from '@dnd-kit/sortable';

/* =========================
   Prepare ordered posts
========================= */
export const prepareOrderedPosts = (data, currentId, postTitle) => {
  const numericCurrentId = Number(currentId);

  let posts = (data || []).map((p) => ({
    ...p,
    isCurrent: Number(p.id) === numericCurrentId,
  }));

  const alreadyExists = posts.some(
    (p) => Number(p.id) === numericCurrentId
  );

  if (!alreadyExists) {
    posts.push({
      id: numericCurrentId,
      title: { rendered: postTitle || 'Current Post' },
      isCurrent: true,
    });
  }

  return posts;
};

/* =========================
   Reorder posts
========================= */
export const reorderPosts = (posts, activeId, overId) => {
  if (!overId || activeId === overId) return posts;

  const oldIndex = posts.findIndex((p) => p.id === activeId);
  const newIndex = posts.findIndex((p) => p.id === overId);

  if (oldIndex === -1 || newIndex === -1) return posts;

  return arrayMove(posts, oldIndex, newIndex);
};

/* =========================
   Delete post
========================= */
export const removePostFromList = (posts, postId) => {
  return posts.filter((p) => p.id !== postId);
};
