import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  Platform,
} from 'react-native';

interface DraggableReorderListProps<T extends { id: string }> {
  data: T[];
  renderItem: (params: {
    item: T;
    index: number;
    isDragging: boolean;
    dragHandleProps: any;
  }) => React.ReactNode;
  onReorder: (newData: T[]) => void;
  ListEmptyComponent?: React.ReactNode;
  contentContainerStyle?: any;
}

export function DraggableReorderList<T extends { id: string }>({
  data,
  renderItem,
  onReorder,
  ListEmptyComponent,
  contentContainerStyle,
}: DraggableReorderListProps<T>) {
  const [items, setItems] = useState<T[]>(data);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const itemsRef = useRef<T[]>(data);
  const draggingIdRef = useRef<string | null>(null);
  const itemLayoutsRef = useRef<{ [index: number]: { y: number; height: number } }>({});

  useEffect(() => {
    setItems(data);
    itemsRef.current = data;
  }, [data]);

  draggingIdRef.current = draggingId;

  // --- Web Pointer Events Drag System (100% Reliable & Real-time) ---
  const startWebPointerDrag = (id: string, e: any) => {
    if (Platform.OS !== 'web') return;

    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();

    setDraggingId(id);
    draggingIdRef.current = id;

    const onPointerMove = (moveEvent: PointerEvent | MouseEvent) => {
      const currentId = draggingIdRef.current;
      if (!currentId) return;

      // Find the element currently under the pointer
      const targetElement = document.elementFromPoint(
        moveEvent.clientX,
        moveEvent.clientY
      );
      if (!targetElement) return;

      const itemCard = targetElement.closest('[data-reorder-id]');
      if (!itemCard) return;

      const hoveredId = itemCard.getAttribute('data-reorder-id');
      if (!hoveredId || hoveredId === currentId) return;

      const currentList = itemsRef.current;
      const fromIndex = currentList.findIndex((it) => it.id === currentId);
      const toIndex = currentList.findIndex((it) => it.id === hoveredId);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        const updated = [...currentList];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);

        itemsRef.current = updated;
        setItems(updated);
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);

      if (draggingIdRef.current) {
        onReorder(itemsRef.current);
      }
      setDraggingId(null);
      draggingIdRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('mousemove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp, { passive: false });
  };

  const initialIndexRef = useRef<number>(-1);
  const initialListRef = useRef<T[]>([]);

  // --- Native PanResponder Implementation (iOS / Android) ---
  const createNativePanResponder = (index: number, item: T) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,

      onPanResponderGrant: () => {
        setDraggingId(item.id);
        draggingIdRef.current = item.id;
        const currentList = [...itemsRef.current];
        initialListRef.current = currentList;
        const initialIdx = currentList.findIndex((it) => it.id === item.id);
        initialIndexRef.current = initialIdx !== -1 ? initialIdx : index;
      },

      onPanResponderMove: (_, gestureState) => {
        const initialIdx = initialIndexRef.current;
        const baseList = initialListRef.current;
        if (initialIdx === -1 || baseList.length === 0) return;

        const currentLayout = itemLayoutsRef.current[initialIdx];
        const approxHeight = currentLayout?.height || 75;
        const offsetSlots = Math.round(gestureState.dy / approxHeight);
        const targetIndex = Math.max(
          0,
          Math.min(baseList.length - 1, initialIdx + offsetSlots)
        );

        const currentIdxInItems = itemsRef.current.findIndex((it) => it.id === item.id);
        if (currentIdxInItems !== targetIndex && targetIndex >= 0 && targetIndex < baseList.length) {
          const updated = [...baseList];
          const [moved] = updated.splice(initialIdx, 1);
          updated.splice(targetIndex, 0, moved);

          setItems(updated);
          itemsRef.current = updated;
        }
      },

      onPanResponderRelease: () => {
        if (draggingIdRef.current) {
          onReorder(itemsRef.current);
        }
        setDraggingId(null);
        draggingIdRef.current = null;
        initialIndexRef.current = -1;
      },
      onPanResponderTerminate: () => {
        if (draggingIdRef.current) {
          onReorder(itemsRef.current);
        }
        setDraggingId(null);
        draggingIdRef.current = null;
        initialIndexRef.current = -1;
      },
    });
  };

  if (items.length === 0 && ListEmptyComponent) {
    return <View style={[{ gap: 14 }, contentContainerStyle]}>{ListEmptyComponent}</View>;
  }

  return (
    <View style={[{ gap: 14 }, contentContainerStyle]}>
      {items.map((item, index) => {
        const isDragging = draggingId === item.id;
        const panResponder =
          Platform.OS !== 'web' ? createNativePanResponder(index, item) : null;

        const webHandleProps =
          Platform.OS === 'web'
            ? {
                onPointerDown: (e: any) => startWebPointerDrag(item.id, e),
                onMouseDown: (e: any) => startWebPointerDrag(item.id, e),
                style: {
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  userSelect: 'none',
                },
              }
            : {};

        const dragHandleProps =
          Platform.OS === 'web'
            ? webHandleProps
            : panResponder
            ? panResponder.panHandlers
            : {};

        return (
          <View
            key={item.id}
            {...({ 'data-reorder-id': item.id, dataSet: { reorderId: item.id } } as any)}
            onLayout={(e) => {
              itemLayoutsRef.current[index] = {
                y: e.nativeEvent.layout.y,
                height: e.nativeEvent.layout.height,
              };
            }}
            style={[
              styles.itemContainer,
              isDragging && styles.draggingContainer,
            ]}
          >
            {renderItem({
              item,
              index,
              isDragging,
              dragHandleProps,
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    position: 'relative',
    transitionDuration: '160ms',
    transitionProperty: 'transform, opacity, box-shadow',
  } as any,
  draggingContainer: {
    zIndex: 9999,
    opacity: 0.7,
    transform: [{ scale: 1.02 }],
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    pointerEvents: 'none',
  },
});
