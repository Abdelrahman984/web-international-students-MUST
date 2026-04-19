export type PlaygroundVideoItem = {
  /** File name only, inside `public/videos/` */
  fileName: string;
  title: string;
  /** Short summary shown under the title on the video card */
  description: string;
};

function videoSrc(fileName: string) {
  return `/videos/${encodeURIComponent(fileName)}`;
}

export const playgroundVideoItems: PlaygroundVideoItem[] = [
  {
    fileName: 'How to withdraw from a course.mp4',
    title: 'How to withdraw from a course',
    description:
      'Walkthrough of withdrawing from a course in the student system: where to find the option, deadlines to respect, and how withdrawal affects your transcript and fees.',
  },
  {
    fileName: 'Banner Registration Errors & Problems.mp4',
    title: 'Banner registration — errors and problems',
    description:
      'Typical Banner registration errors (holds, prerequisites, time conflicts, closed sections) and what each message means so you can fix the issue or know who to contact.',
  },
  {
    fileName: 'Banner Registration Using CRN.mp4',
    title: 'Banner registration using CRN',
    description:
      'How to add courses by Course Reference Number (CRN): entering CRNs in Banner, confirming sections, and checking that your schedule saved correctly before you log out.',
  },
];

export { videoSrc };
