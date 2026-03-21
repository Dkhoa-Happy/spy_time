# 🔐 Mật lệnh Cửu Long - Fragment Assembly Puzzle Game

## Overview
An interactive historical puzzle game set in 1930 where players must assemble torn fragments of a secret document to discover a meeting location.

**Game Title:** Mật lệnh Cửu Long (Secret Order of Nine Dragons)
**Route:** `/fragment-puzzle`

## Game Features

### 1. **Drag & Drop Puzzle Mechanics**
- 3 draggable paper fragments with historical text
- Smooth mouse interactions with grab cursor
- Snap-to-position when fragments are within 20px of alignment
- Visual feedback with rotation and shadow effects

### 2. **Visual Design**
- **Aesthetic:** Secret underground bunker from 1930s
- **Paper:** Aged, yellowed appearance with torn edges
- **Lighting:** Dim oil-lamp atmosphere with subtle gradients
- **Background:** Wooden table texture with grid pattern

### 3. **Assembly System**
- Three fragments must be correctly positioned:
  - **Fragment 1:** "Chủ trương làm tư sản dân quyền cách mạng..." (Democratic Revolution)
  - **Fragment 2:** "...và thổ địa cách mạng..." (Peasant Revolution)
  - **Fragment 3:** "...để đi tới xã hội cộng sản." (Communist Society)

- Target positions defined for each fragment
- Automatic alignment when within snap distance
- Visual confirmation with green checkmark

### 4. **Hidden Message Reveal**
When all 3 fragments are correctly assembled:
- **Red Seal Animation:** "HỢP NHẤT" (UNIFIED) stamp appears
- **Glowing Letters:** First letters of each line glow red to spell "CỬU LONG"
- **Unified Document:** Shows complete assembled document with hidden message

### 5. **Final Challenge**
After successful assembly, a password form appears:
- **Question:** "Where did Nguyễn Ái Quốc call to unite the 3 communist organizations?"
- **Valid Answers:**
  - CỬU LONG
  - CUULONG
  - HONG KONG
  - HONGKONG
  - HƯƠNG CẢNG

## File Structure
```
src/pages/fragment-puzzle/
├── ui/
│   └── FragmentPuzzlePage.jsx          # Main game component
└── styles/
    └── FragmentPuzzle.css              # Complete styling (bunker theme)
```

## Component Props & State

### Fragment Object Structure
```javascript
{
  id: number,                            // Unique identifier
  text: string,                          // Historical text content
  initialPos: { x: number, y: number }, // Starting position
  currentPos: { x: number, y: number }, // Current position during drag
  targetPos: { x: number, y: number },  // Correct alignment position
  rotation: number,                      // CSS rotation in degrees
  aligned: boolean,                      // Whether correctly positioned
  org: string                           // Organization label
}
```

### State Management
- `fragments`: Array of 3 paper pieces with positions
- `draggedId`: Currently dragged fragment ID
- `dragOffset`: Mouse offset from fragment position
- `assembled`: Boolean indicating if all pieces aligned
- `showPassword`: Show password form after assembly
- `password`: User input for final answer

## Gameplay Mechanics

### 1. Dragging
```
- User has mouse down on fragment
- System tracks dragOffset (difference between mouse and fragment position)
- Mouse move updates fragment.currentPos
- Smooth animation with active visual feedback
```

### 2. Snapping Algorithm
```javascript
distance = √((currentX - targetX)² + (currentY - targetY)²)
if (distance < SNAP_DISTANCE) {
  // Automatically align to targetPos
  fragment.currentPos = targetPos
  fragment.aligned = true
  fragment.rotation = 0
}
```

### 3. Assembly Detection
```
- Every time fragments array updates
- Check if all 3 fragments have aligned: true
- Trigger unified document reveal animation
- Show red seal stamp after 300ms
- Display password form after 1500ms
```

## Animation Effects

### Key Animations
- **popIn:** Checkmark animation (0.3s)
- **slideUp:** Unified document appears (0.6s)
- **sealStamp:** Red seal stamps down with bounce (0.4s)
- **glow:** Hidden letters pulse red (0.6s infinite)
- **fadeIn:** Password form fades in (0.5s)

## Styling Highlights

### Color Scheme
```css
--primary-dark:    #1a1a1a   (Deep black)
--secondary-dark:  #2d2d2d   (Charcoal)
--accent-red:      #c41e3a   (Historical red)
--text-light:      #e8d4b8   (Aged paper)
--paper-color:     #f5e6d3   (Document color)
```

### Visual Effects
- Box shadows for depth and realism
- CSS gradients for aged appearance
- Grid background pattern for wooden table
- Inset shadows for document authenticity
- Drop shadows for floating effect

## Customization Guide

### Change Fragment Content
Edit in `FragmentPuzzlePage.jsx` - fragments array:
```javascript
{
  id: 1,
  text: 'Your custom text here',
  initialPos: { x: 50, y: 80 },
  targetPos: { x: 200, y: 150 },
  // ... other properties
}
```

### Adjust Snap Distance
```javascript
const SNAP_DISTANCE = 20; // pixels - increase for more lenient snapping
```

### Modify Target Positions
Positions are in pixels from top-left of game canvas:
```javascript
targetPos: { x: 200, y: 150 }  // X and Y coordinates
```

### Change Password Answers
In `handlePasswordSubmit`:
```javascript
const validAnswers = ['CỬU LONG', 'CUULONG', 'HONG KONG', 'HONGKONG', 'HƯƠNG CẢNG'];
```

### Customize Hidden Message
In the `.hidden-message` markup around line 150 of component:
```jsx
<p>Custom text <span className="highlight">C</span></p>
```

## Technical Details

### Event Handling
- **onMouseDown:** Initiate drag with offset calculation
- **onMouseMove:** Update fragment position in real-time
- **onMouseUp/onMouseLeave:** Release dragged fragment and check snap distance
- **onSubmit:** Validate password answer

### Performance Considerations
- Uses React state for simple component re-renders
- No heavy animations run simultaneously
- Snap checking is O(n) where n=3 (minimal)
- CSS hardware acceleration via transform property

### Browser Compatibility
- Modern browsers with CSS Grid and Flexbox
- CSS animations (transform, opacity)
- HTML5 event listeners
- ES6 JavaScript features

## Testing Scenarios

### Success Path
1. Drag Fragment 1 to position (200, 150)
2. Drag Fragment 2 to position (200, 305)
3. Drag Fragment 3 to position (200, 460)
4. Wait for red seal animation
5. Enter "CỬU LONG" in password field
6. See success message

### Edge Cases
- Partial snapping (dragged near but not exact)
- Rapid re-dragging after alignment
- Form submission with various case combinations
- Mobile/touch device compatibility

## Accessibility Features

- Clear mission briefing for context
- Tutorial panel with instructions
- Progress bar showing alignment status
- High contrast red for important elements
- Keyboard-friendly password input

## Future Enhancements

1. **Mobile Touch Support:** Better touch handling for tablets
2. **Sound Effects:** Paper rustling, seal stamp sound
3. **Animations:** Particle effects on successful assembly
4. **Difficulty Levels:** Adjust snap distance and starting positions
5. **Multiplayer:** Turn-based puzzle challenges
6. **Story Progression:** Link to subsequent historical puzzles
7. **Hints System:** Gradual reveal of target positions
8. **Time Challenge:** Speed-run mode with timer

## Historical Context

**Mật lệnh Cửu Long Reference:**
- Set in 1930, during the height of Indochinese Communist Party formation
- Nguyễn Ái Quốc (later Hồ Chí Minh) led communist unification efforts
- Three communist factions unified in 1930
- Cương lĩnh chính trị (Political Platform) outlined revolutionary goals
- Hương Cảng (Hong Kong) was a key meeting location

This game educates players about a pivotal moment in Vietnamese revolutionary history through interactive gameplay.

---

**Routes Available:**
- `http://localhost:5173/` - Home page
- `http://localhost:5173/fragment-puzzle` - Mật lệnh Cửu Long game

**Developed:** 2026
**Theme:** Historical Puzzle Game
**Language:** Vietnamese
