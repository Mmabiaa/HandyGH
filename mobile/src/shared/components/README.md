# Design System Components

This directory contains the core UI components for the HandyGH Mobile Application, implementing a professional design system with Ghana-inspired colors and comprehensive accessibility support.

## Components

### Text Component

Reusable text component with typography variants and Dynamic Type scaling for accessibility.

**Usage:**

```tsx
import { Text, H1, H2, Body, Label, Caption } from '@/shared/components';

// Using variant prop
<Text variant="h1">Welcome to HandyGH</Text>
<Text variant="body" color="textSecondary">Find trusted service providers</Text>

// Using convenience components
<H1>Welcome to HandyGH</H1>
<H2>Featured Providers</H2>
<Body>Browse our selection of verified professionals</Body>
<Label>Service Category</Label>
<Caption>Last updated 2 hours ago</Caption>

// With custom styling
<Text variant="h3" align="center" color="primary">
  Book Your Service Today
</Text>
```

**Props:**
- `variant`: Typography variant (h1-h6, body, bodyLarge, bodySmall, label, labelLarge, caption, button, buttonSmall, buttonLarge)
- `color`: Color from theme (text, textSecondary, primary, error, etc.)
- `align`: Text alignment (left, center, right, justify)
- `allowFontScaling`: Enable Dynamic Type scaling (default: true)
- `maxFontSizeMultiplier`: Maximum font scale (default: 2.0)

### Button Component

Reusable button with variants, sizes, loading states, and haptic feedback.

**Usage:**

```tsx
import { Button } from '@/shared/components';

// Primary button
<Button onPress={handleSubmit}>
  Submit
</Button>

// Secondary button
<Button variant="secondary" onPress={handleCancel}>
  Cancel
</Button>

// Outline button
<Button variant="outline" size="small" onPress={handleEdit}>
  Edit Profile
</Button>

// Ghost button
<Button variant="ghost" onPress={handleSkip}>
  Skip
</Button>

// With loading state
<Button loading={isLoading} onPress={handleSave}>
  Save Changes
</Button>

// With icon
<Button icon={<Icon name="plus" />} onPress={handleAdd}>
  Add Service
</Button>

// Full width
<Button fullWidth onPress={handleContinue}>
  Continue
</Button>

// Disabled
<Button disabled onPress={handleSubmit}>
  Submit
</Button>
```

**Props:**
- `variant`: Button style (primary, secondary, outline, ghost)
- `size`: Button size (small, medium, large)
- `loading`: Show loading spinner
- `disabled`: Disable button
- `icon`: Left icon component
- `iconRight`: Right icon component
- `fullWidth`: Make button full width
- `hapticFeedback`: Enable haptic feedback (default: true)

### TextInput Component

Reusable text input with validation, error states, and accessibility labels.

**Usage:**

```tsx
import { TextInput } from '@/shared/components';

// Basic input
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="Enter your email"
  keyboardType="email-address"
/>

// With error
<TextInput
  label="Phone Number"
  value={phone}
  onChangeText={setPhone}
  error="Invalid phone number format"
  required
/>

// Password input with toggle
<TextInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  showPasswordToggle
/>

// With helper text
<TextInput
  label="Business Name"
  value={businessName}
  onChangeText={setBusinessName}
  helperText="This will be displayed to customers"
/>

// With icons
<TextInput
  label="Search"
  value={search}
  onChangeText={setSearch}
  leftIcon={<Icon name="search" />}
  placeholder="Search providers..."
/>

// Disabled
<TextInput
  label="User ID"
  value={userId}
  disabled
/>
```

**Props:**
- `label`: Input label
- `error`: Error message to display
- `helperText`: Helper text below input
- `leftIcon`: Left icon component
- `rightIcon`: Right icon component
- `showPasswordToggle`: Show/hide password toggle
- `disabled`: Disable input
- `required`: Show required indicator

### Card Component

Reusable card with elevation and press interactions.

**Usage:**

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/shared/components';

// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// Pressable card
<Card onPress={handlePress}>
  <Text>Tap me</Text>
</Card>

// With elevation
<Card elevation="lg">
  <Text>Elevated card</Text>
</Card>

// With custom padding
<Card padding="lg">
  <Text>Large padding</Text>
</Card>

// Structured card
<Card>
  <CardHeader
    title="Provider Name"
    subtitle="Plumbing Services"
    rightElement={<Icon name="star" />}
  />
  <CardContent>
    <Text>Card content goes here</Text>
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="small">View Details</Button>
  </CardFooter>
</Card>

// Custom background
<Card backgroundColor="#F0F0F0">
  <Text>Custom background</Text>
</Card>
```

**Props:**
- `elevation`: Shadow elevation (none, sm, md, lg, xl)
- `padding`: Internal padding (xs, sm, md, lg, xl, xxl, xxxl)
- `onPress`: Press handler (makes card touchable)
- `onLongPress`: Long press handler
- `hapticFeedback`: Enable haptic feedback (default: true)
- `disabled`: Disable press interactions
- `radius`: Border radius (none, xs, sm, md, lg, xl, full)
- `backgroundColor`: Custom background color

## Theme

### Using Theme in Components

```tsx
import { useTheme, useThemeColors } from '@/core/theme';

function MyComponent() {
  const { theme, themeMode, setThemeMode, toggleTheme } = useTheme();
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
      <Button onPress={toggleTheme}>Toggle Theme</Button>
    </View>
  );
}
```

### Theme Colors

Available colors in the theme:
- Brand: `primary`, `primaryLight`, `primaryDark`, `secondary`, `secondaryLight`, `secondaryDark`, `accent`
- Background: `background`, `backgroundSecondary`, `backgroundTertiary`, `surface`, `surfaceElevated`
- Text: `text`, `textSecondary`, `textTertiary`, `textDisabled`, `textOnPrimary`, `textOnSecondary`, `textOnAccent`
- Border: `border`, `borderLight`, `borderDark`
- Semantic: `success`, `error`, `warning`, `info` (with Light and Dark variants)
- Component: `cardBackground`, `inputBackground`, `inputBorder`, `inputBorderFocused`, `divider`, `overlay`, `shadow`
- Status: `online`, `offline`, `busy`, `away`

### Theme Utilities

```tsx
import { withOpacity, lighten, darken, getContrastColor } from '@/core/theme';

// Add opacity to color
const transparentPrimary = withOpacity('#FFC107', 0.5);

// Lighten color
const lighterPrimary = lighten('#FFC107', 20);

// Darken color
const darkerPrimary = darken('#FFC107', 20);

// Get contrasting text color
const textColor = getContrastColor('#FFC107'); // Returns '#000000' or '#FFFFFF'
```

## Accessibility

All components are built with accessibility in mind:

- **Screen Reader Support**: All interactive elements have proper accessibility labels
- **Dynamic Type**: Text components support font scaling up to 200%
- **Touch Targets**: All interactive elements meet the 44x44pt minimum size
- **Haptic Feedback**: Buttons and cards provide tactile feedback
- **Color Contrast**: All text meets WCAG 2.1 AA standards (4.5:1 ratio)
- **Keyboard Navigation**: Components support keyboard and screen reader navigation

## Ghana-Specific Features

The design system incorporates Ghana-specific elements:

- **Colors**: Ghana flag colors (gold, green, red) as primary, secondary, and accent
- **Currency**: GHS (Ghana Cedis) formatting
- **Phone Numbers**: Ghana phone number format (+233 XX XXX XXXX)
- **Timezone**: GMT (Ghana timezone)

## Installation

The design system requires the following dependencies:

```bash
npm install react-native-haptic-feedback
```

For iOS, run:
```bash
cd ios && pod install
```

## Setup

Wrap your app with the ThemeProvider:

```tsx
import { ThemeProvider } from '@/core/theme';

function App() {
  return (
    <ThemeProvider initialMode="system">
      {/* Your app content */}
    </ThemeProvider>
  );
}
```
