# Interactive Bézier Curve with Physics & Sensor Control

A real-time interactive visualization of a cubic Bézier curve with spring-damped physics, responding to mouse movement (web) with tangent vector visualization.

## 🎯 Features

- **Pure Mathematics Implementation**: All Bézier calculations implemented from scratch
- **Real-time Physics**: Spring-damping model for smooth, natural motion
- **Tangent Visualization**: Real-time display of tangent vectors along the curve
- **60 FPS Performance**: Optimized rendering with FPS counter
- **Interactive Control**: Mouse-driven control points with physics-based response

## 📐 Mathematical Foundation

### Cubic Bézier Curve

The curve is defined by four control points (P₀, P₁, P₂, P₃) using the formula:

```
B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
```

Where `t ∈ [0, 1]` is the parameter along the curve.

**Implementation Details:**
- The curve is sampled at `t` increments of 0.01 (100 samples)
- P₀ and P₃ are fixed endpoints positioned at the left and right sides
- P₁ and P₂ are dynamic control points that respond to mouse input

### Tangent Calculation

The tangent vector (derivative) at any point is calculated using:

```
B'(t) = 3(1-t)²(P₁-P₀) + 6(1-t)t(P₂-P₁) + 3t²(P₃-P₂)
```

**Visualization:**
- 15 tangent vectors are drawn at evenly spaced intervals along the curve
- Each tangent is normalized to unit length and scaled to 40 pixels for visibility
- Red lines represent the tangent direction at each sampled point

## ⚙️ Physics Model

### Spring-Damping System

The control points use a physics-based motion model:

```
acceleration = -k × (position - target) - damping × velocity
```

**Parameters:**
- **Spring Constant (k)**: 0.15 - Controls the "stiffness" of the spring
- **Damping Factor**: 0.85 - Reduces oscillation and creates smooth motion

**How It Works:**
1. **Spring Force**: Pulls the control point toward its target position (mouse)
2. **Damping Force**: Opposes velocity to prevent infinite oscillation
3. **Velocity Integration**: Position updates based on accumulated velocity
4. The result is a smooth, rope-like motion that feels natural and responsive

### Design Choices

**Why Spring-Damping?**
- Provides organic, natural movement
- Prevents instant snapping to mouse position
- Creates a "rope" or "elastic" feel as required
- Self-stabilizing without manual tuning

**Parameter Tuning:**
- Lower spring constant (0.15) = softer, more fluid motion
- High damping (0.85) = less bouncy, more controlled
- These values were chosen to balance responsiveness with smoothness

## 🏗️ Code Structure

### `bezier.js` Organization

1. **Bézier Mathematics Section**
   - `bezierPoint(t, p0, p1, p2, p3)` - Calculates curve position
   - `bezierTangent(t, p0, p1, p2, p3)` - Calculates tangent vector
   - `normalize(v)` - Vector normalization utility

2. **Physics System Section**
   - `ControlPoint` class - Manages physics simulation for P₁ and P₂
   - `update(deltaTime)` - Updates position using spring-damping model
   - `setTarget(x, y)` - Sets the target position (mouse position)

3. **Rendering System Section**
   - `BezierCurveVisualizer` class - Main application controller
   - `drawCurve()` - Renders the Bézier curve path
   - `drawTangents()` - Renders tangent vectors
   - `drawControlPoints()` - Renders control points and guide lines
   - `animate()` - Main animation loop using `requestAnimationFrame`

### Key Implementation Details

- **Delta Time Normalization**: Physics updates are frame-rate independent
- **Mouse Offset Mapping**: P₁ and P₂ have different offsets from mouse position to create interesting curve deformation
- **FPS Monitoring**: Real-time performance tracking displayed in top-right corner
- **Touch Support**: Mobile-friendly with touchmove event handling

## 🚀 How to Run

1. Open `index.html` in any modern web browser
2. Move your mouse across the canvas to control the curve
3. Watch the curve dynamically respond with physics-based motion
4. Observe the red tangent vectors showing curve direction

**No build tools or dependencies required** - pure HTML, CSS, and JavaScript.

## 📊 Performance

- Maintains **60 FPS** on modern hardware
- Efficient rendering using Canvas API
- Physics calculations optimized for real-time performance
- No external libraries - minimal overhead

## 🎨 Visual Elements

- **White Canvas**: Clean background for clear visualization
- **Gray Curve**: The main Bézier path (3px stroke)
- **Red Tangents**: Direction vectors along the curve
- **Colored Control Points**:
  - Green (P₀, P₃): Fixed endpoints
  - Blue (P₁): First dynamic control point
  - Purple (P₂): Second dynamic control point
- **Dashed Lines**: Guide lines showing control point structure

## 🧮 Technical Specifications

- **Curve Resolution**: 0.01 step (100 samples)
- **Tangent Count**: 15 vectors
- **Tangent Length**: 40 pixels
- **Canvas Size**: 1000×600 pixels
- **Physics Update Rate**: ~60 Hz (frame-rate independent)

## 📝 Implementation Notes

All mathematical operations are implemented manually without using:
- ❌ `UIBezierPath` or similar curve APIs
- ❌ Animation libraries (GSAP, Anime.js, etc.)
- ❌ Physics engines
- ❌ Curve/vector math libraries (D3.js, Three.js, etc.)

The implementation uses only:
- ✅ Pure JavaScript (ES6+)
- ✅ HTML5 Canvas API for rendering
- ✅ Native browser `requestAnimationFrame` for timing
- ✅ Basic DOM event listeners for input

---

**Created as part of the FlamApp (SuperSet) Assignment**  
Demonstrates understanding of computational geometry, physics simulation, and real-time graphics programming.
