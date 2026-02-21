import '../index.css';
const DragOverlayItem = ({ post }) => {
  if (!post) return null;

  return (
    <li className="font-mono 
                    text-sm 
                    px-3 py-2 
                    rounded-md 
                    border
                    bg-blue-200 
                    border-blue-300 
                    shadow-lg
                    cursor-grabbing">
      {post.title?.rendered || 'Current Post'}
    </li>
  );
};

export default DragOverlayItem;
