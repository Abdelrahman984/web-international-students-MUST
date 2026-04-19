export const scrollToSection = (href: string) => {
  const element = document.querySelector(href);
  if (element) {
    const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
};
