/**
 * Hero line + Google review cards (named reviewers).
 */

export type Testimonial = {
  quote: string;
  attribution: string;
};

/**
 * Large serif quote band. Replace `attribution` with initials · location once
 * reviewer names are confirmed (no screenshots in-repo to source these from).
 */
export const FEATURED_ROTATING_ANONYMOUS: Testimonial[] = [
  {
    quote:
      "I booked an hour. I walked away with a week of sleep. Jordan brought calm into my house, and it stayed after he left.",
    attribution: "Guest feedback",
  },
  {
    quote: "My back feels so much better! Thanks.",
    attribution: "Guest feedback",
  },
  {
    quote:
      "For the first time in two years, I rode my bike along the coast without shoulder pain. Absolutely incredible. I'm so grateful.",
    attribution: "Guest feedback",
  },
  {
    quote:
      "Feeling phenomenal! The sharp neck pain eased and my shoulders feel much less stiff.",
    attribution: "Guest feedback",
  },
  {
    quote:
      "I haven't felt pain relief like this in a while. You listened, took your time, and cleared the knots. One of the best sessions I've ever had.",
    attribution: "Guest feedback",
  },
  {
    quote:
      "I had this feeling of calm that was really wonderful. It should be my weekly ritual.",
    attribution: "Guest feedback",
  },
];

/** Three cards (Google reviews) */
export const GOOGLE_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I discovered Jordan through Visit Jamaica. I'm so glad I followed my intuition. This was not just a massage. It was an experience: calm, focused, deeply reassuring. Every movement felt intentional and therapeutic. Truly exceptional.",
    attribution: "Jennifer H. · Google review",
  },
  {
    quote:
      "It genuinely feels as though you reset my digestive system. I'm impressed that a single session could improve something so much when pills or supplements never made a real difference. I'm making this a regular part of my self-care.",
    attribution: "Carla R. · Google review",
  },
  {
    quote:
      "I received a massage from Jordan at the Vital Frequency retreat. The experience was life changing. All the pain I was carrying melted away; his presence, technique, and ability to attune to what I needed make him top-tier.",
    attribution: "Tia-Lynn G. · Google review",
  },
];
