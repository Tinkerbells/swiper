import type { Meta, StoryObj } from "@storybook/react";
import { useState, useCallback, useRef } from "react";
import { Swiper, type SwiperRef, type SwipeDirection } from "..";

// Sample card component for demonstration
const SampleCard = ({ 
  title, 
  description, 
  color = "#3b82f6",
  active 
}: { 
  title: string; 
  description: string; 
  color?: string;
  active?: boolean;
}) => (
  <div
    style={{
      width: 300,
      height: 400,
      backgroundColor: color,
      borderRadius: 16,
      padding: 24,
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      boxShadow: active ? "0 20px 40px rgba(0,0,0,0.2)" : "0 10px 20px rgba(0,0,0,0.1)",
      cursor: active ? "grab" : "default",
      userSelect: "none",
    }}
  >
    <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>{title}</h2>
    <p style={{ fontSize: 16, opacity: 0.9 }}>{description}</p>
    {active && (
      <div style={{ 
        position: "absolute", 
        top: 16, 
        right: 16, 
        backgroundColor: "rgba(255,255,255,0.2)", 
        padding: "4px 8px", 
        borderRadius: 4, 
        fontSize: 12 
      }}>
        Drag me!
      </div>
    )}
  </div>
);

// Sample data
const initialCardData = [
  { id: 1, title: "Card 1", description: "This is the first card. Swipe left or right!", color: "#3b82f6" },
  { id: 2, title: "Card 2", description: "Second card with different content.", color: "#10b981" },
  { id: 3, title: "Card 3", description: "Third card in the stack.", color: "#f59e0b" },
  { id: 4, title: "Card 4", description: "Fourth card to swipe through.", color: "#ef4444" },
  { id: 5, title: "Card 5", description: "Fifth card in our collection.", color: "#8b5cf6" },
  { id: 6, title: "Card 6", description: "Sixth card with more content.", color: "#06b6d4" },
  { id: 7, title: "Card 7", description: "Seventh card in the series.", color: "#84cc16" },
  { id: 8, title: "Card 8", description: "Final card in this demo.", color: "#f97316" },
];

// Custom hook for managing swiper state externally
const useSwiperState = (initialData: typeof initialCardData, historyEnabled = false) => {
  const [currentItems, setCurrentItems] = useState(initialData);
  const [history, setHistory] = useState<typeof initialCardData[]>([initialData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);

  const addToHistory = useCallback((newState: typeof initialCardData) => {
    if (!historyEnabled) return;
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex, historyEnabled]);

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    if (currentItems.length === 0) return;

    const newItems = currentItems.slice(1);
    setCurrentItems(newItems);
    setSwipeCount(prev => prev + 1);
    addToHistory(newItems);
  }, [currentItems, addToHistory]);

  const programmaticSwipe = useCallback((direction: SwipeDirection) => {
    handleSwipe(direction);
  }, [handleSwipe]);

  const undo = useCallback(() => {
    if (!historyEnabled || historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setCurrentItems(history[newIndex]);
    setSwipeCount(prev => Math.max(0, prev - 1));
  }, [history, historyIndex, historyEnabled]);

  const redo = useCallback(() => {
    if (!historyEnabled || historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setCurrentItems(history[newIndex]);
    setSwipeCount(prev => prev + 1);
  }, [history, historyIndex, historyEnabled]);

  const reset = useCallback(() => {
    setCurrentItems(initialData);
    setSwipeCount(0);
    if (historyEnabled) {
      setHistory([initialData]);
      setHistoryIndex(0);
    }
  }, [initialData, historyEnabled]);

  return {
    currentItems,
    swipeCount,
    handleSwipe,
    programmaticSwipe,
    undo,
    redo,
    reset,
    canUndo: historyEnabled && historyIndex > 0,
    canRedo: historyEnabled && historyIndex < history.length - 1,
    isDisabled: currentItems.length === 0,
  };
};

const meta: Meta<typeof Swiper> = {
  title: "Components/Swiper",
  component: Swiper,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A Tinder-style swipe component for React with external state management, smooth animations and gesture support.",
      },
    },
  },
  argTypes: {
    offsetBoundary: {
      control: { type: "range", min: 50, max: 300, step: 10 },
      description: "The minimum distance to trigger a swipe",
    },
    itemsPerView: {
      control: { type: "range", min: 1, max: 5, step: 1 },
      description: "Number of items visible in the stack",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disable all swipe interactions",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Swiper>;

export const Basic: Story = {
  render: (args) => {
    const { currentItems, handleSwipe } = useSwiperState(initialCardData);

    return (
      <div style={{ padding: 40 }}>
        <Swiper
          {...args}
          style={{ width: 320, height: 420 }}
          onSwipe={(swipe) => {
            console.log("Swiped:", swipe.direction, "Item:", swipe.children);
            handleSwipe(swipe.direction);
          }}
        >
          {currentItems.map((card) => (
            <SampleCard key={card.id} {...card} active={currentItems[0]?.id === card.id} />
          ))}
        </Swiper>
        {currentItems.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            No more cards! Try the reset button in other stories.
          </div>
        )}
      </div>
    );
  },
  args: {
    offsetBoundary: 100,
    itemsPerView: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Basic swiper with external state management. Drag the top card to swipe.",
      },
    },
  },
};

export const WithExternalControls: Story = {
  render: (args) => {
    const swiperRef = useRef<SwiperRef>(null);
    const {
      currentItems,
      swipeCount,
      handleSwipe,
      programmaticSwipe,
      undo,
      redo,
      reset,
      canUndo,
      canRedo,
      isDisabled,
    } = useSwiperState(initialCardData, true);

    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ marginBottom: 20 }}>
          <p>Swipes: {swipeCount} | Cards remaining: {currentItems.length}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 10 }}>
            <button
              onClick={undo}
              disabled={!canUndo}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: !canUndo ? "#f5f5f5" : "#fff",
                cursor: !canUndo ? "not-allowed" : "pointer",
              }}
            >
              Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: !canRedo ? "#f5f5f5" : "#fff",
                cursor: !canRedo ? "not-allowed" : "pointer",
              }}
            >
              Redo
            </button>
            <button
              onClick={reset}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 10 }}>
            <button
              onClick={() => {
                swiperRef.current?.swipe("left");
                programmaticSwipe("left");
              }}
              disabled={isDisabled}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: isDisabled ? "#f5f5f5" : "#fff",
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              Swipe Left
            </button>
            <button
              onClick={() => {
                swiperRef.current?.swipe("right");
                programmaticSwipe("right");
              }}
              disabled={isDisabled}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: isDisabled ? "#f5f5f5" : "#fff",
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              Swipe Right
            </button>
          </div>
        </div>
        <Swiper
          {...args}
          ref={swiperRef}
          style={{ width: 320, height: 420 }}
          onSwipe={(swipe) => {
            console.log("Swiped:", swipe.direction, "Item:", swipe.children);
            handleSwipe(swipe.direction);
          }}
        >
          {currentItems.map((card) => (
            <SampleCard key={card.id} {...card} active={currentItems[0]?.id === card.id} />
          ))}
        </Swiper>
        {currentItems.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            All cards swiped! Use the Reset button to restore them.
          </div>
        )}
      </div>
    );
  },
  args: {
    offsetBoundary: 100,
    itemsPerView: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Swiper with external state management and history. You can undo, redo, and reset swipes using the buttons.",
      },
    },
  },
};

export const CustomSensitivity: Story = {
  render: (args) => {
    const { currentItems, handleSwipe } = useSwiperState(initialCardData.slice(0, 5));

    return (
      <div style={{ padding: 40 }}>
        <p style={{ textAlign: "center", marginBottom: 20 }}>
          High sensitivity - swipes trigger with less movement
        </p>
        <Swiper
          {...args}
          style={{ width: 320, height: 420 }}
          onSwipe={(swipe) => {
            console.log("Swiped:", swipe.direction, "Item:", swipe.children);
            handleSwipe(swipe.direction);
          }}
        >
          {currentItems.map((card) => (
            <SampleCard key={card.id} {...card} active={currentItems[0]?.id === card.id} />
          ))}
        </Swiper>
        {currentItems.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            No more cards!
          </div>
        )}
      </div>
    );
  },
  args: {
    offsetBoundary: 50,
    itemsPerView: 2,
  },
  parameters: {
    docs: {
      description: {
        story: "Swiper with high sensitivity (low offset boundary). Cards swipe with minimal movement.",
      },
    },
  },
};

export const SingleCard: Story = {
  render: (args) => {
    const { currentItems, handleSwipe } = useSwiperState(initialCardData);

    return (
      <div style={{ padding: 40 }}>
        <p style={{ textAlign: "center", marginBottom: 20 }}>
          Single card view - only one card visible at a time
        </p>
        <Swiper
          {...args}
          style={{ width: 320, height: 420 }}
          onSwipe={(swipe) => {
            console.log("Swiped:", swipe.direction, "Item:", swipe.children);
            handleSwipe(swipe.direction);
          }}
        >
          {currentItems.map((card) => (
            <SampleCard key={card.id} {...card} active={currentItems[0]?.id === card.id} />
          ))}
        </Swiper>
        {currentItems.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            No more cards!
          </div>
        )}
      </div>
    );
  },
  args: {
    itemsPerView: 1,
    offsetBoundary: 120,
  },
  parameters: {
    docs: {
      description: {
        story: "Swiper showing only one card at a time. Perfect for focus on individual items.",
      },
    },
  },
};

export const WithCustomDragHandler: Story = {
  render: (args) => {
    const { currentItems, handleSwipe } = useSwiperState(initialCardData.slice(0, 4));
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

    return (
      <div style={{ padding: 40 }}>
        <p style={{ textAlign: "center", marginBottom: 20 }}>
          Drag position: X: {Math.round(dragPosition.x)}, Y: {Math.round(dragPosition.y)}
        </p>
        <Swiper
          {...args}
          style={{ width: 320, height: 420 }}
          onDrag={(event, info) => {
            setDragPosition({ x: info.offset.x, y: info.offset.y });
          }}
          onSwipe={(swipe) => {
            console.log("Swiped:", swipe.direction, "Item:", swipe.children);
            handleSwipe(swipe.direction);
            setDragPosition({ x: 0, y: 0 });
          }}
        >
          {currentItems.map((card) => (
            <SampleCard key={card.id} {...card} active={currentItems[0]?.id === card.id} />
          ))}
        </Swiper>
        {currentItems.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            No more cards!
          </div>
        )}
      </div>
    );
  },
  args: {
    offsetBoundary: 100,
    itemsPerView: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Swiper with custom drag handler that shows real-time drag position.",
      },
    },
  },
};

export const Playground: Story = {
  render: (args) => {
    const swiperRef = useRef<SwiperRef>(null);
    const {
      currentItems,
      swipeCount,
      handleSwipe,
      programmaticSwipe,
      undo,
      redo,
      reset,
      canUndo,
      canRedo,
      isDisabled,
    } = useSwiperState(initialCardData, true);
    
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = useCallback((message: string) => {
      setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
    }, []);

    return (
      <div style={{ padding: 40 }}>
        <div style={{ display: "flex", gap: 40, alignItems: "start" }}>
          <div>
            <Swiper
              {...args}
              ref={swiperRef}
              style={{ width: 320, height: 420 }}
              onSwipe={(swipe) => {
                const cardTitle = currentItems[0]?.title || "Unknown";
                addLog(`Swiped ${swipe.direction} on ${cardTitle}`);
                handleSwipe(swipe.direction);
              }}
              onDrag={(event, info) => {
                if (Math.abs(info.offset.x) > 50 || Math.abs(info.offset.y) > 50) {
                  addLog(`Dragging: ${Math.round(info.offset.x)}px, ${Math.round(info.offset.y)}px`);
                }
              }}
            >
              {currentItems.map((card) => (
                <SampleCard key={card.id} {...card} active={currentItems[0]?.id === card.id} />
              ))}
            </Swiper>
            {currentItems.length === 0 && (
              <div style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
                All cards swiped! Use the Reset button to restore them.
              </div>
            )}
          </div>
          
          <div style={{ minWidth: 250 }}>
            <div style={{ marginBottom: 20 }}>
              <h3>Controls</h3>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
                Swipes: {swipeCount} | Cards: {currentItems.length}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => {
                    swiperRef.current?.swipe("left");
                    programmaticSwipe("left");
                    addLog("Programmatic swipe left");
                  }}
                  disabled={isDisabled}
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: 4, 
                    border: "1px solid #ccc",
                    backgroundColor: isDisabled ? "#f5f5f5" : "#fff",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  ← Left
                </button>
                <button
                  onClick={() => {
                    swiperRef.current?.swipe("right");
                    programmaticSwipe("right");
                    addLog("Programmatic swipe right");
                  }}
                  disabled={isDisabled}
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: 4, 
                    border: "1px solid #ccc",
                    backgroundColor: isDisabled ? "#f5f5f5" : "#fff",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  Right →
                </button>
                <button
                  onClick={() => {
                    swiperRef.current?.swipe("up");
                    programmaticSwipe("up");
                    addLog("Programmatic swipe up");
                  }}
                  disabled={isDisabled}
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: 4, 
                    border: "1px solid #ccc",
                    backgroundColor: isDisabled ? "#f5f5f5" : "#fff",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  ↑ Up
                </button>
                <button
                  onClick={() => {
                    swiperRef.current?.swipe("down");
                    programmaticSwipe("down");
                    addLog("Programmatic swipe down");
                  }}
                  disabled={isDisabled}
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: 4, 
                    border: "1px solid #ccc",
                    backgroundColor: isDisabled ? "#f5f5f5" : "#fff",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  ↓ Down
                </button>
              </div>
              
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => {
                    undo();
                    addLog("Undo action");
                  }}
                  disabled={!canUndo}
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: 4, 
                    border: "1px solid #ccc",
                    backgroundColor: !canUndo ? "#f5f5f5" : "#fff",
                    cursor: !canUndo ? "not-allowed" : "pointer",
                    flex: 1 
                  }}
                >
                  Undo
                </button>
                <button
                  onClick={() => {
                    redo();
                    addLog("Redo action");
                  }}
                  disabled={!canRedo}
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: 4, 
                    border: "1px solid #ccc",
                    backgroundColor: !canRedo ? "#f5f5f5" : "#fff",
                    cursor: !canRedo ? "not-allowed" : "pointer",
                    flex: 1 
                  }}
                >
                  Redo
                </button>
                <button
                  onClick={() => {
                    reset();
                    addLog("Reset to initial state");
                    setLogs([]);
                  }}
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: 4, 
                    border: "1px solid #ccc",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    flex: 1 
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div>
              <h3>Activity Log</h3>
              <div style={{ 
                height: 120, 
                overflow: "auto", 
                border: "1px solid #ddd", 
                borderRadius: 4, 
                padding: 8,
                fontSize: 12,
                fontFamily: "monospace",
                backgroundColor: "#f8f9fa"
              }}>
                {logs.length === 0 ? (
                  <div style={{ color: "#666" }}>No activity yet...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} style={{ marginBottom: 2 }}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  args: {
    offsetBoundary: 100,
    itemsPerView: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive playground with external state management for all swiper features. Try dragging cards, using buttons, and exploring the API.",
      },
    },
  },
};
