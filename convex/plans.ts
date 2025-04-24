// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// export const createPlan = mutation({
//   args: {
//     userId: v.string(),
//     name: v.string(),
//     workoutPlan: v.object({
//       schedule: v.array(v.string()),
//       exercise: v.array(
//         v.object({
//           day: v.string(),
//           routines: v.array(
//             v.object({
//               name: v.string(),
//               sets: v.number(),
//               reps: v.number(),
//             })
//           ),
//         })
//       ),
//     }),
//     dietPlan: v.object({
//       dailyCalories: v.number(),
//       meals: v.array(
//         v.object({
//           name: v.string(),
//           foods: v.array(v.string()),
//         })
//       ),
//     }),
//     isActive: v.boolean(),
//   },
//   handler: async (ctx, args) => {
//     const activePlans = await ctx.db
//       .query("plans")
//       .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
//       .filter((q) => q.eq(q.field("isActive"), true))
//       .collect();

//     for (const plan of activePlans) {
//       await ctx.db.patch(plan._id, { isActive: false });
//     }

//     const planId = await ctx.db.insert("plans", args);

//     return planId;
//   },
// });

// export const getUserPlans = query({
//   args: {},
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       return [];
//     }
//     const userId = identity.subject; // Adjust based on your auth provider
//     const plans = await ctx.db
//       .query("plans")
//       .withIndex("by_user_id", (q) => q.eq("userId", userId))
//       .order("desc")
//       .collect();

//     return plans;
//   },
// });
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation to create a new fitness plan
export const createPlan = mutation({
  // Define the expected arguments for creating a plan
  args: {
    userId: v.string(), // User ID (kept as is for now; could also use ctx.auth)
    name: v.string(), // Name of the plan
    workoutPlan: v.object({
      schedule: v.array(v.string()), // Array of days (e.g., ["Monday", "Wednesday"])
      exercises: v.array(
        v.object({
          day: v.string(), // Day of the week (e.g., "Monday")
          routines: v.array(
            v.object({
              name: v.string(), // Exercise name (e.g., "Push-ups")
              sets: v.number(), // Number of sets
              reps: v.number(), // Number of reps
            })
          ),
        })
      ),
    }),
    dietPlan: v.object({
      dailyCalories: v.number(), // Target daily calories
      meals: v.array(
        v.object({
          name: v.string(), // Meal name (e.g., "Breakfast")
          foods: v.array(v.string()), // List of foods (e.g., ["Oats", "Milk"])
        })
      ),
    }),
    isActive: v.boolean(), // Whether the plan is active
  },
  handler: async (ctx, args) => {
    // Find all active plans for the user
    const activePlans = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Deactivate existing active plans
    for (const plan of activePlans) {
      await ctx.db.patch(plan._id, { isActive: false });
    }

    // Insert the new plan
    const planId = await ctx.db.insert("plans", args);

    return planId; // Return the ID of the newly created plan
  },
});

// Query to get all plans for the authenticated user
export const getUserPlans = query({
  args: {}, // No arguments needed since userId is obtained from auth
  handler: async (ctx) => {
    // Get the authenticated user's identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Return empty array if user is not authenticated
    }

    // Use the Clerk user ID (identity.subject) as userId
    const userId = identity.subject;

    // Query plans for the user, sorted in descending order
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", userId)) // Safe: userId is a string
      .order("desc")
      .collect();

    return plans; // Return the user's plans
  },
});