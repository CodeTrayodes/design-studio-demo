export const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const staggerContainer = (stagger = 0.08) => ({
  hidden:  {},
  visible: { transition: { staggerChildren: stagger } },
});

export const slideInRight = {
  hidden:  { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export const slideInLeft = {
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};
