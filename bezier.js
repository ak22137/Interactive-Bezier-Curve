// ========================================
// BÉZIER CURVE MATHEMATICS
// ========================================

/**
 * Calculate point on cubic Bézier curve at parameter t
 * B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
 * @param {number} t - Parameter from 0 to 1
 * @param {Object} p0 - Start point {x, y}
 * @param {Object} p1 - First control point {x, y}
 * @param {Object} p2 - Second control point {x, y}
 * @param {Object} p3 - End point {x, y}
 * @returns {Object} Point on curve {x, y}
 */
function bezierPoint(t, p0, p1, p2, p3) {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    
    return {
        x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
        y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
    };
}

/**
 * Calculate tangent (derivative) of cubic Bézier curve at parameter t
 * B'(t) = 3(1-t)²(P₁-P₀) + 6(1-t)t(P₂-P₁) + 3t²(P₃-P₂)
 * @param {number} t - Parameter from 0 to 1
 * @param {Object} p0 - Start point {x, y}
 * @param {Object} p1 - First control point {x, y}
 * @param {Object} p2 - Second control point {x, y}
 * @param {Object} p3 - End point {x, y}
 * @returns {Object} Tangent vector {x, y}
 */
function bezierTangent(t, p0, p1, p2, p3) {
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    
    return {
        x: 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x),
        y: 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y)
    };
}

/**
 * Normalize a vector to unit length
 * @param {Object} v - Vector {x, y}
 * @returns {Object} Normalized vector {x, y}
 */
function normalize(v) {
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    if (length === 0) return { x: 0, y: 0 };
    return {
        x: v.x / length,
        y: v.y / length
    };
}

// ========================================
// PHYSICS SYSTEM (Spring-Damping Model)
// ========================================

class ControlPoint {
    constructor(x, y) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.target = { x, y };
        
        // Physics constants
        this.springConstant = 0.15;  // Stiffness (k)
        this.damping = 0.85;          // Damping factor
    }
    
    /**
     * Update physics using spring-damping model:
     * acceleration = -k * (position - target) - damping * velocity
     */
    update(deltaTime) {
        // Calculate spring force (Hooke's Law)
        const springForceX = -this.springConstant * (this.position.x - this.target.x);
        const springForceY = -this.springConstant * (this.position.y - this.target.y);
        
        // Calculate damping force
        const dampingForceX = -this.damping * this.velocity.x * 0.1;
        const dampingForceY = -this.damping * this.velocity.y * 0.1;
        
        // Total acceleration
        const accelerationX = springForceX + dampingForceX;
        const accelerationY = springForceY + dampingForceY;
        
        // Update velocity
        this.velocity.x += accelerationX * deltaTime;
        this.velocity.y += accelerationY * deltaTime;
        
        // Apply velocity damping
        this.velocity.x *= this.damping;
        this.velocity.y *= this.damping;
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    }
    
    setTarget(x, y) {
        this.target.x = x;
        this.target.y = y;
    }
}

// ========================================
// RENDERING SYSTEM
// ========================================

class BezierCurveVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize control points (P0, P1, P2, P3)
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // P0 and P3 are fixed endpoints
        this.p0 = { x: 200, y: centerY };
        this.p3 = { x: this.canvas.width - 200, y: centerY };
        
        // P1 and P2 are dynamic control points with physics
        this.p1 = new ControlPoint(centerX - 150, centerY - 100);
        this.p2 = new ControlPoint(centerX + 150, centerY + 100);
        
        // Rendering settings
        this.curveResolution = 0.01;  // Step size for sampling curve
        this.tangentCount = 15;        // Number of tangent lines to draw
        this.tangentLength = 40;       // Length of tangent lines
        
        // Mouse tracking
        this.mouseX = centerX;
        this.mouseY = centerY;
        
        // FPS tracking
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
        this.fpsUpdateInterval = 500; // Update FPS display every 500ms
        this.lastFpsUpdate = this.lastTime;
        
        this.setupEventListeners();
        this.animate();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        // Add touch support for mobile
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouseX = touch.clientX - rect.left;
            this.mouseY = touch.clientY - rect.top;
        });
    }
    
    update(deltaTime) {
        // Update control point targets based on mouse position
        // P1 follows mouse with offset
        this.p1.setTarget(this.mouseX - 100, this.mouseY - 50);
        
        // P2 follows mouse with different offset (creates interesting curve)
        this.p2.setTarget(this.mouseX + 100, this.mouseY + 50);
        
        // Update physics
        this.p1.update(deltaTime);
        this.p2.update(deltaTime);
    }
    
    drawCurve() {
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        
        // Sample the curve at small intervals
        let isFirst = true;
        for (let t = 0; t <= 1; t += this.curveResolution) {
            const point = bezierPoint(t, this.p0, this.p1.position, this.p2.position, this.p3);
            
            if (isFirst) {
                this.ctx.moveTo(point.x, point.y);
                isFirst = false;
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        
        this.ctx.stroke();
    }
    
    drawTangents() {
        this.ctx.strokeStyle = '#f56565';
        this.ctx.lineWidth = 2;
        
        // Draw tangent lines at regular intervals
        for (let i = 0; i <= this.tangentCount; i++) {
            const t = i / this.tangentCount;
            
            // Get point on curve
            const point = bezierPoint(t, this.p0, this.p1.position, this.p2.position, this.p3);
            
            // Get tangent at this point
            const tangent = bezierTangent(t, this.p0, this.p1.position, this.p2.position, this.p3);
            
            // Normalize tangent
            const normalizedTangent = normalize(tangent);
            
            // Draw tangent line
            this.ctx.beginPath();
            this.ctx.moveTo(
                point.x - normalizedTangent.x * this.tangentLength / 2,
                point.y - normalizedTangent.y * this.tangentLength / 2
            );
            this.ctx.lineTo(
                point.x + normalizedTangent.x * this.tangentLength / 2,
                point.y + normalizedTangent.y * this.tangentLength / 2
            );
            this.ctx.stroke();
            
            // Draw small circle at the point
            this.ctx.fillStyle = '#f56565';
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawControlPoints() {
        // Draw lines connecting control points (for visualization)
        this.ctx.strokeStyle = '#cbd5e0';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.p0.x, this.p0.y);
        this.ctx.lineTo(this.p1.position.x, this.p1.position.y);
        this.ctx.lineTo(this.p2.position.x, this.p2.position.y);
        this.ctx.lineTo(this.p3.x, this.p3.y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // Draw control points as circles
        const drawPoint = (point, color, label) => {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Label
            this.ctx.fillStyle = '#2d3748';
            this.ctx.font = 'bold 12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(label, point.x, point.y - 15);
        };
        
        drawPoint(this.p0, '#48bb78', 'P₀');
        drawPoint(this.p1.position, '#4299e1', 'P₁');
        drawPoint(this.p2.position, '#9f7aea', 'P₂');
        drawPoint(this.p3, '#48bb78', 'P₃');
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw in order: curve, tangents, control points
        this.drawCurve();
        this.drawTangents();
        this.drawControlPoints();
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            
            // Update FPS display
            document.getElementById('fps').textContent = `FPS: ${this.fps}`;
        }
    }
    
    animate() {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 16.67, 2); // Normalize to 60fps, cap at 2x
        this.lastTime = currentTime;
        
        // Update physics and render
        this.update(deltaTime);
        this.render();
        this.updateFPS(currentTime);
        
        // Request next frame
        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// INITIALIZATION
// ========================================

// Start the application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    new BezierCurveVisualizer('canvas');
});
