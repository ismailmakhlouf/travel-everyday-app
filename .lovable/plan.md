

## Loyalty Points Redemption Feature

### What we're building
Adding a loyalty points redemption section to the Student Demo flow that shows how Trainline Travel Hub points can be redeemed with major airlines -- specifically **British Airways (Avios)** and **Air India (Flying Returns)** -- making the loyalty program tangibly valuable.

### Where it fits
This will be added to the **Confirmation step (Step 6)** of the Student Demo, where Priya sees her earned points. We'll expand this into a mini redemption showcase showing:

- Points earned from this trip (already shown: 425 points)
- Equivalent redemption value with British Airways and Air India
- Example rewards she could unlock (e.g., seat upgrades, lounge access, companion vouchers)
- A conversion rate display showing Trainline points to airline miles

### Implementation Details

**File: `src/pages/StudentDemo.tsx`**

In the confirmation step (Step 6), after the existing loyalty points display, add:

1. **Airline Redemption Cards** -- Two cards side by side:
   - **British Airways (Avios)**: Show Trainline points converting to Avios with the BA logo colours (navy/red). Example redemptions like "500pts = Domestic upgrade" or "2,000pts = Europe short-haul reward flight"
   - **Air India (Flying Returns)**: Show conversion to Flying Returns miles with Air India branding (orange/green). Example redemptions relevant to Priya's Mumbai route like "1,500pts = Extra baggage allowance" or "5,000pts = Mumbai seat upgrade"

2. **Progress bar** showing how close Priya is to her next redemption milestone with each airline

3. **"Earn more" prompt** tying back to the ecosystem -- e.g., "Book 2 more trips to unlock a BA lounge pass"

### Technical approach
- All changes in `src/pages/StudentDemo.tsx`, within the existing Step 6 rendering block
- Use existing design tokens (card-gradient, border colours, shadow-card)
- Add Plane icon usage and airline-specific accent colours
- Keep the data static/hardcoded consistent with the rest of the demo

