import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Swiper, useSwiper } from "..";

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
const cardData = [
  { title: "Card 1", description: "This is the first card. Swipe left or right!", color: "#3b82f6" },
  { title: "Card 2", description: "Second card with different content.", color: "#10b981" },
  { title: "Card 3", description: "Third card in the stack.", color: "#f59e0b" },
  { title: "Card 4", description: "Fourth card to swipe through.", color: "#ef4444" },
  { title: "Card 5", description: "Fifth card in our collection.", color: "#8b5cf6" },
  { title: "Card 6", description: "Sixth card with more content.", color: "#06b6d4" },
  { title: "Card 7", description: "Seventh card in the series.", color: "#84cc16" },
  { title: "Card 8", description: "Final card in this demo.", color: "#f97316" },
];

const meta: Meta<typeof Swiper> = {
  title: "Components/Swiper",
  component: Swiper,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A Tinder-style swipe component for React with smooth animations and gesture support.",
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
    history: {
      control: { type: "boolean" },
      description: "Enable undo/redo functionality",
    },
    historyDepth: {
      control: { type: "range", min: 1, max: 20, step: 1 },
      description: "Maximum number of history states to keep",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Swiper>;

export const Basic: Story = {
  render: (args) => (
    <div style={{ padding: 40 }}>
      <Swiper
        {...args}
        style={{ width: 320, height: 420 }}
        onSwipe={(swipe) => {
          console.log("Swiped:", swipe.direction, "Item:", swipe.id);
        }}
      >
        {cardData.map((card, index) => (
          <SampleCard key={index} {...card} />
        ))}
      </Swiper>
    </div>
  ),
  args: {
    offsetBoundary: 100,
    itemsPerView: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Basic swiper with default settings. Drag the top card to swipe.",
      },
    },
  },
};

export const WithHistory: Story = {
  render: (args) => {
    const swiper = useSwiper();
    const [swipeCount, setSwipeCount] = useState(0);

    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ marginBottom: 20 }}>
          <p>Swipes: {swipeCount}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 10 }}>
            <button
              onClick={() => swiper.undo()}
              disabled={swiper.disabledUndo}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: swiper.disabledUndo ? "#f5f5f5" : "#fff",
                cursor: swiper.disabledUndo ? "not-allowed" : "pointer",
              }}
            >
              Undo
            </button>
            <button
              onClick={() => swiper.redo()}
              disabled={swiper.disabledRedo}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: swiper.disabledRedo ? "#f5f5f5" : "#fff",
                cursor: swiper.disabledRedo ? "not-allowed" : "pointer",
              }}
            >
              Redo
            </button>
            <button
              onClick={() => {
                swiper.reset();
                setSwipeCount(0);
              }}
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
                swiper.swipe("left");
                setSwipeCount(prev => prev + 1);
              }}
              disabled={swiper.disabled}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: swiper.disabled ? "#f5f5f5" : "#fff",
                cursor: swiper.disabled ? "not-allowed" : "pointer",
              }}
            >
              Swipe Left
            </button>
            <button
              onClick={() => {
                swiper.swipe("right");
                setSwipeCount(prev => prev + 1);
              }}
              disabled={swiper.disabled}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: swiper.disabled ? "#f5f5f5" : "#fff",
                cursor: swiper.disabled ? "not-allowed" : "pointer",
              }}
            >
              Swipe Right
            </button>
          </div>
        </div>
        <Swiper
          {...args}
          ref={swiper.ref}
          dispatch={swiper.dispatch}
          style={{ width: 320, height: 420 }}
          onSwipe={(swipe) => {
            console.log("Swiped:", swipe.direction, "Item:", swipe.id);
            setSwipeCount(prev => prev + 1);
          }}
        >
          {cardData.map((card, index) => (
            <SampleCard key={index} {...card} />
          ))}
        </Swiper>
      </div>
    );
  },
  args: {
    history: true,
    historyDepth: 10,
    offsetBoundary: 100,
    itemsPerView: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Swiper with history enabled. You can undo, redo, and reset swipes using the buttons.",
      },
    },
  },
};

export const CustomSensitivity: Story = {
  render: (args) => (
    <div style={{ padding: 40 }}>
      <p style={{ textAlign: "center", marginBottom: 20 }}>
        High sensitivity - swipes trigger with less movement
      </p>
      <Swiper
        {...args}
        style={{ width: 320, height: 420 }}
        onSwipe={(swipe) => {
          console.log("Swiped:", swipe.direction, "Item:", swipe.id);
        }}
      >
        {cardData.slice(0, 5).map((card, index) => (
          <SampleCard key={index} {...card} />
        ))}
      </Swiper>
    </div>
  ),
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
  render: (args) => (
    <div style={{ padding: 40 }}>
      <p style={{ textAlign: "center", marginBottom: 20 }}>
        Single card view - only one card visible at a time
      </p>
      <Swiper
        {...args}
        style={{ width: 320, height: 420 }}
        onSwipe={(swipe) => {
          console.log("Swiped:", swipe.direction, "Item:", swipe.id);
        }}
      >
        {cardData.map((card, index) => (
          <SampleCard key={index} {...card} />
        ))}
      </Swiper>
    </div>
  ),
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
            console.log("Swiped:", swipe.direction, "Item:", swipe.id);
            setDragPosition({ x: 0, y: 0 });
          }}
        >
          {cardData.slice(0, 4).map((card, index) => (
            <SampleCard key={index} {...card} />
          ))}
        </Swiper>
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
    const swiper = useSwiper();
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
      setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    return (
      <div style={{ padding: 40 }}>
        <div style={{ display: "flex", gap: 40, alignItems: "start" }}>
          <div>
            <Swiper
              {...args}
              ref={swiper.ref}
              dispatch={swiper.dispatch}
              style={{ width: 320, height: 420 }}
              onSwipe={(swipe) => {
                addLog(`Swiped ${swipe.direction} on card ${swipe.id + 1}`);
              }}
              onDrag={(event, info) => {
                if (Math.abs(info.offset.x) > 50 || Math.abs(info.offset.y) > 50) {
                  addLog(`Dragging: ${Math.round(info.offset.x)}px, ${Math.round(info.offset.y)}px`);
                }
              }}
            >
              {cardData.map((card, index) => (
                <SampleCard key={index} {...card} />
              ))}
            </Swiper>
          </div>
          
          <div style={{ minWidth: 250 }}>
            <div style={{ marginBottom: 20 }}>
              <h3>Controls</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => {
                    swiper.swipe("left");
                    addLog("Programmatic swipe left");
                  }}
                  disabled={swiper.disabled}
                  style={{ padding: "8px 12px", borderRadius: 4, border: "1px solid #ccc" }}
                >
                  ← Left
                </button>
                <button
                  onClick={() => {
                    swiper.swipe("right");
                    addLog("Programmatic swipe right");
                  }}
                  disabled={swiper.disabled}
                  style={{ padding: "8px 12px", borderRadius: 4, border: "1px solid #ccc" }}
                >
                  Right →
                </button>
                <button
                  onClick={() => {
                    swiper.swipe("up");
                    addLog("Programmatic swipe up");
                  }}
                  disabled={swiper.disabled}
                  style={{ padding: "8px 12px", borderRadius: 4, border: "1px solid #ccc" }}
                >
                  ↑ Up
                </button>
                <button
                  onClick={() => {
                    swiper.swipe("down");
                    addLog("Programmatic swipe down");
                  }}
                  disabled={swiper.disabled}
                  style={{ padding: "8px 12px", borderRadius: 4, border: "1px solid #ccc" }}
                >
                  ↓ Down
                </button>
              </div>
              
              {args.history && (
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button
                    onClick={() => {
                      swiper.undo();
                      addLog("Undo action");
                    }}
                    disabled={swiper.disabledUndo}
                    style={{ 
                      padding: "8px 12px", 
                      borderRadius: 4, 
                      border: "1px solid #ccc",
                      flex: 1 
                    }}
                  >
                    Undo
                  </button>
                  <button
                    onClick={() => {
                      swiper.redo();
                      addLog("Redo action");
                    }}
                    disabled={swiper.disabledRedo}
                    style={{ 
                      padding: "8px 12px", 
                      borderRadius: 4, 
                      border: "1px solid #ccc",
                      flex: 1 
                    }}
                  >
                    Redo
                  </button>
                  <button
                    onClick={() => {
                      swiper.reset();
                      addLog("Reset to initial state");
                      setLogs([]);
                    }}
                    style={{ 
                      padding: "8px 12px", 
                      borderRadius: 4, 
                      border: "1px solid #ccc",
                      flex: 1 
                    }}
                  >
                    Reset
                  </button>
                </div>
              )}
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
    history: true,
    historyDepth: 5,
    offsetBoundary: 100,
    itemsPerView: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive playground with all swiper features. Try dragging cards, using buttons, and exploring the API.",
      },
    },
  },
};
