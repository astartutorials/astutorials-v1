# Backend Integration Guide - Group Tutorials Page

## What You're Working With

Built a tutorials page at `/tutorials` route. It shows list of tutorial sessions in cards with booking status.

---

## Data Structure You Need to Send

### Tutorial Object Format

```typescript
{
  code: string,           // e.g "COS 201", "PHY 101" 
  title: string,          // e.g "Data Structures"
  teacher: string,        // instructor name
  description: string,    // course description text
  day: string,           // e.g "Thursdays", "Mondays"
  time: string,          // e.g "8:00 PM", "10:00 AM"
  seatsTotal: number,    // total available seats (e.g 40)
  seatsRemaining: number, // how many seats left (e.g 13)
  price: string,         // e.g "1k", "1.5k" (display format)
  colorScheme: string    // one of: "blue", "orange", "green", "purple", "pink", "yellow"
}
```

### Example API Response

```json
{
  "tutorials": [
    {
      "code": "COS 201",
      "title": "Data Structures",
      "teacher": "John Adeyemi",
      "description": "Master arrays, linked lists, trees, and graphs with practical examples designed to crack interview questions.",
      "day": "Thursdays",
      "time": "8:00 PM",
      "seatsTotal": 40,
      "seatsRemaining": 13,
      "price": "1k",
      "colorScheme": "blue"
    },
    {
      "code": "PHY 101",
      "title": "General Physics",
      "teacher": "David Eze",
      "description": "Understand mechanics, waves, and thermodynamics with hands-on problem solving sessions.",
      "day": "Wednesdays",
      "time": "7:00 PM",
      "seatsTotal": 40,
      "seatsRemaining": 5,
      "price": "1k",
      "colorScheme": "orange"
    }
  ]
}
```

---

## What Frontend Does With Your Data

### 1. Seat Status Display

Frontend calculates seat percentage automatically:
- `seatsTaken = seatsTotal - seatsRemaining`
- `percentageTaken = (seatsTaken / seatsTotal) * 100`

Based on percentage, shows different status:
- **Normal** (< 75%): "SEATS REMAINING" (gray text)
- **Urgent** (75-89%): "HURRY! FILLING!" (orange text)
- **Critical** (≥ 90%): "ALMOST FULL" (red text)

### 2. Color Pills

The `colorScheme` field controls the course code pill color:
- **blue** → light blue background
- **orange** → light orange background  
- **green** → light green background
- **purple** → light purple background
- **pink** → light pink background
- **yellow** → light yellow background

If you don't send colorScheme or send invalid value, defaults to blue.

---

## API Endpoints You Probably Need

### GET /api/tutorials
**Returns:** List of all group tutorials

Frontend expects array of tutorial objects (see format above).

### POST /api/tutorials/:id/reserve
**Body:** `{ userId, tutorialId }`  
**What it does:** Book a seat for user

After booking succeeds:
- Decrease `seatsRemaining` by 1
- Return updated tutorial object

### GET /api/tutorials/:id
**Returns:** Single tutorial details

Same format as above but single object.

---

## Important Notes

### Seat Math
Frontend doesn't validate seats, just displays what you send.
**YOU** need to:
- Make sure `seatsRemaining` never goes negative
- Handle race conditions for booking (multiple users booking at same time)
- Update seat counts in real-time

### Price Format
Send price as string for display ("1k" not 1000).
If you want to store as number in DB, convert before sending to frontend.

### Day/Time Format
Just send human-readable strings:
- Day: "Mondays", "Tuesdays", etc
- Time: "8:00 PM", "10:00 AM", etc

No need for complex date objects for now.

### ColorScheme Assignment
You decide how to assign colors:
- **Option 1:** Random on creation
- **Option 2:** Based on course category (e.g all math = blue, physics = orange)
- **Option 3:** Let admin choose when creating tutorial
- **Option 4:** Just rotate through colors in order

Frontend doesn't care, it just shows what you send.

---

## Page Route & Component Files

### Main Page
`app/tutorials/page.tsx` - this fetches data and renders everything

When you're ready to integrate:
1. Replace the hardcoded `tutorials` array (lines 9-82)
2. Add your API fetch call
3. Pass data to `<TutorialCard>` components (already set up, lines 114-128)

### Components Used
- `components/Navbar.tsx` - top navigation
- `components/TutorialCard.tsx` - individual card (gets tutorial props)
- `components/Footer.tsx` - bottom footer

---

## Example Integration Code

```typescript
// In app/tutorials/page.tsx, replace hardcoded array with:

export default async function TutorialsPage() {
  // Fetch from your API
  const response = await fetch('http://yourapi.com/api/tutorials');
  const data = await response.json();
  const tutorials = data.tutorials; // or however you structure it

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* ... header stuff ... */}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {tutorials.map((tutorial, index) => (
            <TutorialCard
              key={tutorial.id || index}  // use tutorial.id if you have it
              code={tutorial.code}
              title={tutorial.title}
              teacher={tutorial.teacher}
              description={tutorial.description}
              day={tutorial.day}
              time={tutorial.time}
              seatsTotal={tutorial.seatsTotal}
              seatsTaken={tutorial.seatsTotal - tutorial.seatsRemaining}
              price={tutorial.price}
              colorScheme={tutorial.colorScheme}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

## Reserve Button

Currently the "Reserve Spot" button doesn't do anything, just displays.

When you're ready to handle booking:
1. Make `TutorialCard` accept `onReserve` callback prop
2. Add onClick handler to button
3. Call your booking API

Or simpler: just make button a Link to `/tutorials/:id/book` page you'll create.

---

## Questions to Clarify

Before you start, decide:
1. Will tutorials have unique IDs? (should use as `key` prop)
2. Do you want real-time seat updates? (websockets?)
3. Should logged-in users see different UI? (e.g "Already Booked")
4. What timezone for times? (or let users see in their timezone?)
5. Do you want filtering/search? (not built yet, but easy to add)

---

## Testing Your Integration

1. Start your backend
2. Update the fetch URL in `app/tutorials/page.tsx`
3. Run frontend: `npm run dev`
4. Go to `localhost:3000/tutorials`
5. Check browser console for errors
6. Use React DevTools to inspect props being passed to cards

---

## Current Status

Right now page uses **hardcoded dummy data** (lines 9-82 in `app/tutorials/page.tsx`).

Everything else is ready:
- ✅ Components accept props
- ✅ Styling is done
- ✅ Mobile responsive
- ✅ Type definitions in place

Just need to swap dummy data with your API calls.

---

## Need Help?

If something doesn't match what you're sending:
- Check `components/TutorialCard.tsx` lines 5-16 for exact TypeScript interface
- All fields are required except `colorScheme` (has default)
- Frontend doesn't validate, just renders what you send

If you need to add fields (e.g tutorial ID, category, etc):
- Add to interface in TutorialCard.tsx
- Update tutorial objects in your API response  
- Can use for booking logic, filtering, etc
