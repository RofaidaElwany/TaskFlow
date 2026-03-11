import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} 
from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} 
from '@dnd-kit/sortable';
import { useState } from '@wordpress/element';
import { SortableItem  }from './SortableItem';
import { DragOverlayItem } from './DragOverlayItem';
import '../index.css';


const SeriesPostsList = ({
  posts,
  onReorder,
  onDelete,
}) => {
  const [activePost, setActivePost] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragStart = (event) => {
    const post = posts.find(p => p.id === event.active.id);
    setActivePost(post);
  };
  const handleDragEnd = (event) => {
    const { active, over }= event;
    setActivePost(null);

    if (!over) return;

    onReorder(active.id, over.id);
  };

  const handleDragCancel = () => {
    setActivePost(null);
  };

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={posts.map(p => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col list-none p-0 mt-4 gap-2">
          {posts.map(post => (
            <SortableItem
              key={post.id}
              id={post.id}
              post={post}
              onDelete={() => onDelete(post)}
            />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay adjustScale={false}>
        {activePost && (
          <DragOverlayItem
            post={activePost}
            className="font-mono text-sm px-3 py-2 rounded-md border bg-blue-200 border-blue-300 shadow-lg cursor-grabbing"
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};

export { SeriesPostsList };